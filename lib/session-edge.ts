/**
 * EDGE-SAFE SESSION LIBRARY
 * Uses jose (pure JS, no Node built-ins) for HS256 JWT sign/verify.
 * Safe to import from middleware.ts (Vercel Edge Runtime).
 * Must NEVER import from openid-client, Node crypto, or any Node built-in.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE_NAME = "__session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

export interface SessionPayload extends JWTPayload {
  /** Microsoft Entra tenant ID claim — used for single-tenant validation */
  tid: string;
  /** User principal name / email from the id_token */
  email: string;
  /** Display name from the id_token */
  name: string;
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Signs a session payload as a HS256 JWT.
 * Returns the compact JWT string to be stored in the __session cookie.
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_DURATION_SECONDS)
    .sign(secret);
}

/**
 * Verifies a compact JWT from the __session cookie.
 * Returns the decoded payload on success.
 * Throws on invalid signature, expiry, or malformed token.
 */
export async function verifySession(token: string): Promise<SessionPayload> {
  const secret = getSessionSecret();

  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  return payload as SessionPayload;
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS };
