/**
 * GET /api/auth/login
 * Node Runtime (Vercel Serverless Function)
 *
 * Initiates the OAuth 2.0 Authorization Code flow with PKCE.
 * Generates a random state + PKCE verifier, stores them in transient
 * httpOnly cookies, and redirects the browser to the Microsoft Entra
 * authorization URL.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  generateState,
  generateCodeVerifier,
  deriveCodeChallenge,
  buildAuthorizationUrl,
} from "../../lib/oauth-node.js";

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

// Transient cookie settings for PKCE/state (short-lived, auth path only)
const TRANSIENT_COOKIE_OPTIONS =
  "HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await deriveCodeChallenge(codeVerifier);
    const redirectUri = getRedirectUri(req);

    const authorizationUrl = await buildAuthorizationUrl(
      state,
      codeChallenge,
      redirectUri
    );

    res.setHeader("Set-Cookie", [
      `__oauth_state=${state}; ${TRANSIENT_COOKIE_OPTIONS}`,
      `__pkce_verifier=${codeVerifier}; ${TRANSIENT_COOKIE_OPTIONS}`,
    ]);

    res.writeHead(302, { Location: authorizationUrl.toString() });
    res.end();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Auth login error: ${message}`);
  }
}
