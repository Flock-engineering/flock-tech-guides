/**
 * GET /api/auth/callback
 * Node Runtime (Vercel Serverless Function)
 *
 * Handles the OAuth callback from Microsoft Entra:
 * 1. Validates state (CSRF guard).
 * 2. Exchanges the authorization code for tokens via PKCE.
 * 3. Validates the id_token (signature, issuer, audience, tid, expiry).
 * 4. Enforces single-tenant: rejects non-Flock tid with 403.
 * 5. Signs and sets the __session cookie (HS256 JWT, 8h).
 * 6. Clears transient PKCE cookies.
 * 7. Redirects to the original URL or /.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { parse as parseCookies } from "node:querystring";
import {
  exchangeCode,
  validateIdToken,
  buildSessionPayload,
} from "../../lib/oauth-node.js";
import {
  signSession,
  SESSION_DURATION_SECONDS,
} from "../../lib/session-edge.js";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function getRedirectUri(req: IncomingMessage): string {
  const host = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "";
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  return `${proto}://${host}/api/auth/callback`;
}

/** Parses cookie header into a key→value map. */
function parseCookieHeader(
  cookieHeader: string | undefined
): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((pair) => {
      const [k, ...rest] = pair.trim().split("=");
      return [k.trim(), decodeURIComponent(rest.join("="))];
    })
  );
}

/** Returns Set-Cookie value that clears the named cookie. */
function clearCookie(name: string, path: string): string {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=${path}; Max-Age=0`;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const reqUrl = new URL(
      req.url ?? "/",
      `https://${req.headers["host"] ?? "localhost"}`
    );

    const cookies = parseCookieHeader(req.headers["cookie"]);
    const storedState = cookies["__oauth_state"];
    const codeVerifier = cookies["__pkce_verifier"];

    // Validate required transient cookies
    if (!storedState || !codeVerifier) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing PKCE session cookies. Please restart the login flow.");
      return;
    }

    // State validation (CSRF guard)
    const incomingState = reqUrl.searchParams.get("state");
    if (!incomingState || incomingState !== storedState) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("State mismatch — possible CSRF attempt.");
      return;
    }

    const redirectUri = getRedirectUri(req);

    // Exchange code for tokens
    const tokens = await exchangeCode(
      reqUrl,
      storedState,
      codeVerifier,
      redirectUri
    );

    // Validate id_token and enforce single-tenant (tid check)
    let claims;
    try {
      claims = await validateIdToken(tokens.id_token);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const isTenantError =
        message.includes("Tenant mismatch") ||
        message.includes("tid") ||
        message.includes("audience");
      res.writeHead(isTenantError ? 403 : 400, {
        "Content-Type": "text/plain",
      });
      res.end(`Authentication rejected: ${message}`);
      return;
    }

    // Mint the session JWT
    const sessionPayload = buildSessionPayload(claims);
    const sessionToken = await signSession(sessionPayload);

    // Determine where to redirect post-login (stored in a returnTo cookie or default /)
    const returnTo = cookies["__return_to"] ?? "/";

    // Clear transient cookies and set the session cookie
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
