/**
 * GET /api/auth/login
 * Vercel EDGE Function (Web-standard Request/Response — no Node built-ins)
 *
 * Initiates the OAuth 2.0 Authorization Code flow with PKCE.
 * Generates a random state + PKCE verifier, stores them in transient
 * httpOnly cookies, and redirects the browser to the Microsoft Entra
 * authorization URL.
 */

import {
  generateState,
  generateCodeVerifier,
  deriveCodeChallenge,
  buildAuthorizationUrl,
} from "../../lib/oauth.js";

export const config = { runtime: "edge" };

/**
 * Builds the public origin (proto://host) of this request from forwarded
 * headers. Must match the origin used by callback.ts so the authorize-step
 * and token-step redirect_uri agree. If x-forwarded-host carries multiple
 * comma-joined values, only the first is used.
 */
function getRedirectUri(request: Request): string {
  const rawHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const host = rawHost.split(",")[0].trim();
  const proto =
    (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0].trim();
  return `${proto}://${host}/api/auth/callback`;
}

// Transient cookie settings for PKCE/state (short-lived, auth path only)
const TRANSIENT_COOKIE_OPTIONS =
  "HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600";

export default async function handler(request: Request): Promise<Response> {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await deriveCodeChallenge(codeVerifier);
    const redirectUri = getRedirectUri(request);

    const authorizationUrl = buildAuthorizationUrl(
      state,
      codeChallenge,
      redirectUri
    );

    const headers = new Headers({ Location: authorizationUrl.toString() });
    headers.append(
      "Set-Cookie",
      `__oauth_state=${state}; ${TRANSIENT_COOKIE_OPTIONS}`
    );
    headers.append(
      "Set-Cookie",
      `__pkce_verifier=${codeVerifier}; ${TRANSIENT_COOKIE_OPTIONS}`
    );

    return new Response(null, { status: 302, headers });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return new Response(`Auth login error: ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
