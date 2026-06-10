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
 * Generates a cryptographically random OAuth state value.
 */
export function generateState(): string {
  return client.randomState();
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
// Token exchange and claim extraction
// ---------------------------------------------------------------------------

export interface ValidatedClaims {
  tid: string;
  email: string;
  name: string;
  sub: string;
}

/**
 * Exchanges an authorization code for tokens using the PKCE verifier,
 * then extracts and validates the id_token claims.
 *
 * openid-client v6 authorizationCodeGrant already validates:
 *  - JWT signature via JWKS
 *  - issuer (iss)
 *  - audience (aud)
 *  - expiry (exp)
 *
 * We additionally enforce the tid claim (single-tenant defense-in-depth).
 *
 * Throws on any validation failure.
 */
export async function exchangeCodeAndValidate(
  currentUrl: URL,
  expectedState: string,
  codeVerifier: string
): Promise<ValidatedClaims> {
  const config = await getOAuthConfig();
  const tenantId = requireEnv("ENTRA_TENANT_ID");

  // openid-client v6 derives the token-endpoint redirect_uri from currentUrl
  // (stripParams of the callback URL). The caller is responsible for building
  // currentUrl from the same forwarded-host/proto origin used at authorize
  // time, so the derived redirect_uri matches the one registered in Entra.
  // Passing an explicit redirect_uri here is a no-op (oauth4webapi overrides
  // it from currentUrl), so it is intentionally omitted.
  const tokens = await client.authorizationCodeGrant(
    config,
    currentUrl,
    { pkceCodeVerifier: codeVerifier, expectedState, idTokenExpected: true }
  );

  // Extract the already-validated id_token claims from the token response.
  // openid-client v6: claims() is an instance method on TokenEndpointResponse.
  // authorizationCodeGrant validates sig/iss/aud/exp before returning;
  // claims() returns the parsed payload only when an id_token is present.
  const claims = tokens.claims();
  if (!claims) {
    throw new Error("No id_token claims in token response.");
  }

  // Single-tenant enforcement: tid must match configured Flock tenant.
  // This is defense-in-depth — single-tenant registration in Entra already
  // blocks foreign tenants, but we verify explicitly at claim level.
  const tid = claims["tid"] as string | undefined;
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
    sub: claims.sub ?? "",
    email:
      (claims["email"] as string | undefined) ??
      (claims["preferred_username"] as string | undefined) ??
      "",
    name: (claims["name"] as string | undefined) ?? "",
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
