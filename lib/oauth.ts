/**
 * EDGE-COMPATIBLE OAUTH LIBRARY (Microsoft Entra ID, single-tenant)
 *
 * Implements the OAuth 2.0 Authorization Code flow with PKCE using ONLY
 * Web-standard APIs: fetch, Web Crypto (crypto.getRandomValues /
 * crypto.subtle.digest), and jose (dual ESM/CJS, edge-safe).
 *
 * No openid-client, no Node built-ins — safe to run on the Vercel Edge
 * Runtime alongside middleware.ts and lib/session-edge.ts.
 */

import { jwtVerify, createRemoteJWKSet } from "jose";
import type { SessionPayload } from "./session-edge.js";

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Base64url + random helpers (Web Crypto only)
// ---------------------------------------------------------------------------

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomUrlSafeString(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically random OAuth state value (URL-safe).
 */
export function generateState(): string {
  return randomUrlSafeString(32);
}

/**
 * Generates a PKCE code verifier: 32 random bytes → 43 base64url chars
 * (RFC 7636 requires 43–128 URL-safe characters).
 */
export function generateCodeVerifier(): string {
  return randomUrlSafeString(32);
}

/**
 * Derives the S256 PKCE code challenge from a verifier:
 * base64url(SHA-256(verifier)).
 */
export async function deriveCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

// ---------------------------------------------------------------------------
// Authorization URL
// ---------------------------------------------------------------------------

/**
 * Builds the Microsoft authorization URL for the OAuth flow.
 * Includes state, code_challenge, and code_challenge_method=S256.
 */
export function buildAuthorizationUrl(
  state: string,
  codeChallenge: string,
  redirectUri: string
): URL {
  const tenantId = requireEnv("ENTRA_TENANT_ID");
  const clientId = requireEnv("ENTRA_CLIENT_ID");

  const url = new URL(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
  );
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url;
}

// ---------------------------------------------------------------------------
// Token exchange and id_token validation
// ---------------------------------------------------------------------------

export interface ValidatedClaims {
  tid: string;
  email: string;
  name: string;
  sub: string;
}

// Cached JWKS fetcher — jose caches keys internally and refetches on
// unknown-kid, so a single module-level instance is correct and avoids
// re-downloading the key set on every callback.
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks(tenantId: string): ReturnType<typeof createRemoteJWKSet> {
  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(
      new URL(
        `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
      )
    );
  }
  return cachedJwks;
}

/**
 * Exchanges an authorization code for tokens (PKCE), then validates the
 * id_token with jose:
 *  - JWT signature via the tenant JWKS endpoint
 *  - issuer  (https://login.microsoftonline.com/{tenantId}/v2.0)
 *  - audience (client_id)
 *  - expiry (exp) — enforced by jwtVerify by default
 *  - tid claim — single-tenant defense-in-depth
 *
 * The token-endpoint redirect_uri is derived from currentUrl
 * (origin + pathname, query stripped), so the caller MUST build currentUrl
 * from the same forwarded-host/proto origin used at authorize time —
 * otherwise the exchange fails (AADSTS50011).
 *
 * Throws on any validation failure.
 */
export async function exchangeCodeAndValidate(
  currentUrl: URL,
  expectedState: string,
  codeVerifier: string
): Promise<ValidatedClaims> {
  const tenantId = requireEnv("ENTRA_TENANT_ID");
  const clientId = requireEnv("ENTRA_CLIENT_ID");
  const clientSecret = requireEnv("ENTRA_CLIENT_SECRET");

  // (a) Read code + state from the callback URL and validate state (CSRF).
  const authError = currentUrl.searchParams.get("error");
  if (authError) {
    const description =
      currentUrl.searchParams.get("error_description") ?? "(no description)";
    throw new Error(`Authorization error from Entra: ${authError} — ${description}`);
  }

  const code = currentUrl.searchParams.get("code");
  if (!code) {
    throw new Error("Missing authorization code in callback URL.");
  }

  const incomingState = currentUrl.searchParams.get("state");
  if (!incomingState || incomingState !== expectedState) {
    throw new Error("State mismatch — possible CSRF attempt.");
  }

  // (b) Exchange the code at the token endpoint (redirect_uri = callback URL
  // with query params stripped, matching the authorize-step redirect_uri).
  const redirectUri = currentUrl.origin + currentUrl.pathname;
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier: codeVerifier,
      }),
    }
  );

  const tokenBody = (await tokenResponse.json()) as {
    id_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok) {
    const error = tokenBody.error ?? `HTTP ${tokenResponse.status}`;
    const description = tokenBody.error_description ?? "(no description)";
    throw new Error(`Token exchange failed: ${error} — ${description}`);
  }

  // (c) The id_token carries the identity claims.
  const idToken = tokenBody.id_token;
  if (!idToken) {
    throw new Error("No id_token in token response.");
  }

  // (d) Validate signature / issuer / audience / expiry with jose.
  const { payload } = await jwtVerify(idToken, getJwks(tenantId), {
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    audience: clientId,
  });

  // (e) Single-tenant enforcement: tid must match the configured Flock tenant.
  // Defense-in-depth — single-tenant registration in Entra already blocks
  // foreign tenants, but we verify explicitly at claim level.
  const tid = payload["tid"] as string | undefined;
  if (!tid) {
    throw new Error("id_token missing tid claim.");
  }
  if (tid !== tenantId) {
    throw new Error(
      `Tenant mismatch: expected ${tenantId}, got ${tid}. Non-Flock accounts are not allowed.`
    );
  }

  // (f) Return the validated claims.
  return {
    tid,
    sub: payload.sub ?? "",
    email:
      (payload["email"] as string | undefined) ??
      (payload["preferred_username"] as string | undefined) ??
      "",
    name: (payload["name"] as string | undefined) ?? "",
  };
}

// ---------------------------------------------------------------------------
// Session payload builder
// ---------------------------------------------------------------------------

/**
 * Builds a SessionPayload from validated id_token claims.
 * Used by the callback handler before calling signSession().
 */
export function buildSessionPayload(claims: ValidatedClaims): SessionPayload {
  return {
    sub: claims.sub,
    tid: claims.tid,
    email: claims.email,
    name: claims.name,
  };
}
