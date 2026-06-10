/**
 * GET /api/auth/callback
 * Node Runtime (Vercel Serverless Function)
 *
 * Handles the OAuth callback from Microsoft Entra:
 * 1. Validates state (CSRF guard).
 * 2. Exchanges the authorization code for tokens via PKCE.
 * 3. Validates the id_token (signature via JWKS, issuer, audience, tid, expiry).
 * 4. Enforces single-tenant: rejects non-Flock tid with 403.
 * 5. Signs and sets the __session cookie (HS256 JWT, 8h).
 * 6. Clears transient PKCE cookies.
 * 7. Redirects to the original URL or /.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  exchangeCodeAndValidate,
  buildSessionPayload,
} from "../../lib/oauth-node.js";
import {
  signSession,
  SESSION_DURATION_SECONDS,
} from "../../lib/session-edge.js";

/**
 * Builds the public origin (proto://host) of this request using the same
 * forwarded-host/proto logic as the login step (api/auth/login.ts).
 *
 * openid-client v6 derives the token-exchange redirect_uri from the callback
 * URL it is given, so this MUST match the origin used when the authorize-step
 * redirect_uri was built — otherwise the token exchange fails (AADSTS50011).
 */
function getRequestOrigin(req: IncomingMessage): string {
  const host = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "";
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  return `${proto}://${host}`;
}

/**
 * Validates a post-login return target. Only same-site relative paths are
 * allowed, to prevent an open redirect: the value must be an absolute path
 * ("/..."), must NOT be protocol-relative ("//evil.com"), and must NOT contain
 * a scheme separator (":"). Anything else falls back to "/".
 *
 * The __return_to cookie is HttpOnly, but a non-HttpOnly sibling cookie of the
 * same name (planted via XSS or a sibling subdomain) is indistinguishable
 * server-side, so the value must always be validated before use.
 */
function safeReturnTo(value: string | undefined): string {
  if (!value) return "/";
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes(":")
  ) {
    return value;
  }
  return "/";
}

/**
 * Parses cookie header into a key→value map.
 *
 * Percent-decoding is wrapped so a malformed value (e.g. a crafted "%zz")
 * never throws an uncaught URIError; on failure the raw value is kept.
 */
function parseCookieHeader(
  cookieHeader: string | undefined
): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((pair) => {
      const [k, ...rest] = pair.trim().split("=");
      const raw = rest.join("=");
      let value = raw;
      try {
        value = decodeURIComponent(raw);
      } catch {
        // Malformed percent-encoding — keep the raw value.
      }
      return [k.trim(), value];
    })
  );
}

/** Returns a Set-Cookie value that clears the named cookie. */
function clearCookie(name: string, path: string): string {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=${path}; Max-Age=0`;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    // Build the callback URL from the SAME forwarded-host/proto origin the
    // login step used. openid-client derives the token-exchange redirect_uri
    // from this URL, so it must match the authorize-step redirect_uri.
    const reqUrl = new URL(req.url ?? "/", getRequestOrigin(req));

    const cookies = parseCookieHeader(req.headers["cookie"]);
    const storedState = cookies["__oauth_state"];
    const codeVerifier = cookies["__pkce_verifier"];

    // Validate required transient cookies
    if (!storedState || !codeVerifier) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing PKCE session cookies. Please restart the login flow.");
      return;
    }

    // State validation (CSRF guard) — checked again inside authorizationCodeGrant,
    // but we gate here to fail fast with a clear error before making any network calls.
    const incomingState = reqUrl.searchParams.get("state");
    if (!incomingState || incomingState !== storedState) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("State mismatch — possible CSRF attempt.");
      return;
    }

    // Exchange code + validate id_token (includes tid enforcement).
    // openid-client derives redirect_uri from reqUrl, so no explicit arg.
    let claims;
    try {
      claims = await exchangeCodeAndValidate(
        reqUrl,
        storedState,
        codeVerifier
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const isTenantOrAudienceError =
        message.includes("Tenant mismatch") ||
        message.includes("tid") ||
        message.includes("audience");
      res.writeHead(isTenantOrAudienceError ? 403 : 400, {
        "Content-Type": "text/plain",
      });
      res.end(`Authentication rejected: ${message}`);
      return;
    }

    // Mint the session JWT
    const sessionPayload = buildSessionPayload(claims);
    const sessionToken = await signSession(sessionPayload);

    // Determine where to redirect post-login. The stored value is validated as
    // a same-site relative path to prevent an open redirect (NW-3).
    const returnTo = safeReturnTo(cookies["__return_to"]);

    // Set session cookie and clear transient OAuth cookies
    res.setHeader("Set-Cookie", [
      `__session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`,
      clearCookie("__oauth_state", "/api/auth"),
      clearCookie("__pkce_verifier", "/api/auth"),
      clearCookie("__return_to", "/"),
    ]);

    res.writeHead(302, { Location: returnTo });
    res.end();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Auth callback error: ${message}`);
  }
}
