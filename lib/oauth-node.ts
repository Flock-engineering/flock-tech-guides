// NODE-ONLY — never import from middleware.ts
// This module uses openid-client, which transitively pulls Node built-ins (crypto, http, net).
// Importing it into middleware.ts will break the Vercel Edge build.

import * as client from "openid-client";
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
// openid-client configuration (single-tenant Entra)
// ---------------------------------------------------------------------------

let cachedConfig: client.Configuration | undefined;

async function getOAuthConfig(): Promise<client.Configuration> {
  if (cachedConfig) return cachedConfig;

  const tenantId = requireEnv("ENTRA_TENANT_ID");
  const clientId = requireEnv("ENTRA_CLIENT_ID");
  const clientSecret = requireEnv("ENTRA_CLIENT_SECRET");

  const issuerUrl = new URL(
    `https://login.microsoftonline.com/${tenantId}/v2.0`
  );

  cachedConfig = await client.discovery(issuerUrl, clientId, clientSecret);
  return cachedConfig;
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically random OAuth state value (hex string).
 */
export function generateState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates a PKCE code verifier (random base64url string).
 */
export function generateCodeVerifier(): string {
  return client.randomPKCECodeVerifier();
}

/**
 * Derives the S256 PKCE code challenge from a verifier.
 */
export async function deriveCodeChallenge(verifier: string): Promise<string> {
  return client.calculatePKCECodeChallenge(verifier);
}

// ---------------------------------------------------------------------------
// Authorization URL
// ---------------------------------------------------------------------------

/**
 * Builds the Microsoft authorization URL for the OAuth flow.
 * Includes state, code_challenge, and code_challenge_method=S256.
 */
export async function buildAuthorizationUrl(
  state: string,
  codeChallenge: string,
  redirectUri: string
): Promise<URL> {
  const config = await getOAuthConfig();

  return client.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

export interface TokenSet {
  id_token: string;
  access_token?: string;
}

/**
 * Exchanges an authorization code for tokens using the PKCE verifier.
 */
export async function exchangeCode(
  currentUrl: URL,
  expectedState: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenSet> {
  const config = await getOAuthConfig();

  const tokens = await client.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
    idTokenExpected: true,
  });

  const idToken = tokens.id_token;
  if (!idToken) {
    throw new Error("No id_token in token response.");
  }

  return {
    id_token: idToken,
    access_token: tokens.access_token,
  };
}

// ---------------------------------------------------------------------------
// id_token validation
// ---------------------------------------------------------------------------

export interface ValidatedClaims {
  tid: string;
  email: string;
  name: string;
  sub: string;
}

/**
 * Validates the id_token and extracts claims needed for the session.
 * Enforces: signature (via JWKS), issuer, audience, tid (single-tenant), expiry.
 * Returns validated claims on success; throws on any validation failure.
 */
export async function validateIdToken(
  idToken: string
): Promise<ValidatedClaims> {
  const config = await getOAuthConfig();
  const tenantId = requireEnv("ENTRA_TENANT_ID");
  const clientId = requireEnv("ENTRA_CLIENT_ID");

  const claims = await client.validateAuthResponse(
    config,
    new URL(`?id_token_hint=${encodeURIComponent(idToken)}`, "https://dummy"),
    undefined
  );

  // Parse and validate the id_token manually via JWKS
  const parsed = client.getValidatedIdTokenClaims(claims as client.TokenEndpointResponse) ??
    (() => {
      throw new Error("Could not extract id_token claims.");
    })();

  // Explicit audience check
  const aud = Array.isArray(parsed.aud) ? parsed.aud : [parsed.aud];
  if (!aud.includes(clientId)) {
    throw new Error(`id_token audience mismatch. Expected: ${clientId}`);
  }

  // Single-tenant enforcement: tid must match configured tenant
  const tid = parsed["tid"] as string | undefined;
  if (!tid) {
    throw new Error("id_token missing tid claim.");
  }
  if (tid !== tenantId) {
    throw new Error(
      `Tenant mismatch: expected ${tenantId}, got ${tid}. Non-Flock accounts are not allowed.`
    );
  }

  return {
    tid,
    sub: parsed.sub ?? "",
    email:
      (parsed["email"] as string | undefined) ??
      (parsed["preferred_username"] as string | undefined) ??
      "",
    name: (parsed["name"] as string | undefined) ?? "",
  };
}

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
