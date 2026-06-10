/**
 * GET /api/auth/callback
 * Vercel EDGE Function (Web-standard Request/Response — no Node built-ins)
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

import {
  exchangeCodeAndValidate,
  buildSessionPayload,
} from "../../lib/oauth.js";
import {
  signSession,
  SESSION_DURATION_SECONDS,
} from "../../lib/session-edge.js";

export const config = { runtime: "edge" };

/**
 * Builds the public origin (proto://host) of this request using the same
 * forwarded-host/proto logic as the login step (api/auth/login.ts).
 *
 * The token-exchange redirect_uri is derived from the callback URL, so this
 * MUST match the origin used when the authorize-step redirect_uri was built —
 * otherwise the token exchange fails (AADSTS50011). If x-forwarded-host
 * carries multiple comma-joined values, only the first is used.
 */
function getRequestOrigin(request: Request): string {
  const rawHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const host = rawHost.split(",")[0].trim();
  const proto =
    (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0].trim();
  return `${proto}://${host}`;
}

/**
 * Validates a post-login return target to prevent an open redirect. Resolves
 * the value against a fixed sentinel origin: a genuine same-site relative path
 * resolves back to the sentinel, while anything that escapes to another origin
 * ("//evil.com", "/\evil.com" — browsers normalize "\" to "/" — "http://evil.com")
 * changes the resolved origin and is rejected. String-prefix checks are NOT
 * enough here: they are bypassable via backslashes, control chars, and encoding.
 * The normalized path (not the raw input) is returned.
 *
 * The __return_to cookie is HttpOnly, but a non-HttpOnly sibling cookie of the
 * same name (planted via XSS or a sibling subdomain) is indistinguishable
 * server-side, so the value must always be validated before use.
 *
 * Exported for smoke testing only — not part of the route contract.
 */
export function safeReturnTo(value: string | undefined): string {
  if (!value) return "/";
  // Reject control characters outright (defense in depth against \t, \n, etc.).
  if (/[\x00-\x1f\x7f]/.test(value)) return "/";
  try {
    const sentinel = "https://h.invalid";
    const url = new URL(value, sentinel);
    if (url.origin !== sentinel) return "/";
    const path = url.pathname + url.search + url.hash;
    // path always starts with "/". A SECOND leading "/" or "\" makes the emitted
    // relative Location protocol-relative when the browser re-resolves it against
    // the real origin → cross-origin (e.g. ".//evil.com" normalizes to "//evil.com").
    // 47 = "/", 92 = "\".
    const second = path.charCodeAt(1);
    if (second === 47 || second === 92) return "/";
    return path;
  } catch {
    return "/";
  }
}

/**
 * Parses cookie header into a key→value map.
 *
 * Percent-decoding is wrapped so a malformed value (e.g. a crafted "%zz")
 * never throws an uncaught URIError; on failure the raw value is kept.
 */
function parseCookieHeader(
  cookieHeader: string | null
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

function textResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  try {
    // Build the callback URL from the SAME forwarded-host/proto origin the
    // login step used. The token-exchange redirect_uri is derived from this
    // URL, so it must match the authorize-step redirect_uri.
    const incomingUrl = new URL(request.url);
    const reqUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      getRequestOrigin(request)
    );

    const cookies = parseCookieHeader(request.headers.get("cookie"));
    const storedState = cookies["__oauth_state"];
    const codeVerifier = cookies["__pkce_verifier"];

    // Validate required transient cookies
    if (!storedState || !codeVerifier) {
      return textResponse(
        400,
        "Missing PKCE session cookies. Please restart the login flow."
      );
    }

    // State validation (CSRF guard) — checked again inside
    // exchangeCodeAndValidate, but we gate here to fail fast with a clear
    // error before making any network calls.
    const incomingState = reqUrl.searchParams.get("state");
    if (!incomingState || incomingState !== storedState) {
      return textResponse(403, "State mismatch — possible CSRF attempt.");
    }

    // Exchange code + validate id_token (includes tid enforcement).
    // The redirect_uri is derived from reqUrl, so no explicit arg.
    let claims;
    try {
      claims = await exchangeCodeAndValidate(reqUrl, storedState, codeVerifier);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const isTenantOrAudienceError =
        message.includes("Tenant mismatch") ||
        message.includes("tid") ||
        message.includes("audience");
      return textResponse(
        isTenantOrAudienceError ? 403 : 400,
        `Authentication rejected: ${message}`
      );
    }

    // Mint the session JWT
    const sessionPayload = buildSessionPayload(claims);
    const sessionToken = await signSession(sessionPayload);

    // Determine where to redirect post-login. The stored value is validated as
    // a same-site relative path to prevent an open redirect (NW-3).
    const returnTo = safeReturnTo(cookies["__return_to"]);

    // Set session cookie and clear transient OAuth cookies
    const headers = new Headers({ Location: returnTo });
    headers.append(
      "Set-Cookie",
      `__session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`
    );
    headers.append("Set-Cookie", clearCookie("__oauth_state", "/api/auth"));
    headers.append("Set-Cookie", clearCookie("__pkce_verifier", "/api/auth"));
    headers.append("Set-Cookie", clearCookie("__return_to", "/"));

    return new Response(null, { status: 302, headers });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return textResponse(500, `Auth callback error: ${message}`);
  }
}
