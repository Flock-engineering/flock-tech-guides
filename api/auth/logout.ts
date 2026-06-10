/**
 * GET /api/auth/logout
 * Node Runtime (Vercel Serverless Function)
 *
 * Clears the __session cookie and redirects the user to Microsoft's
 * end-session endpoint to terminate the Entra session.
 * After logout, the next request to any gated route will re-trigger the gate.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

/**
 * Builds the Microsoft Entra end-session URL.
 * Falls back to /api/auth/login if env vars are not set (safe for preview).
 */
function buildLogoutUrl(req: IncomingMessage): string {
  try {
    const tenantId = requireEnv("ENTRA_TENANT_ID");
    const host =
      req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "";
    const proto = req.headers["x-forwarded-proto"] ?? "https";
    const postLogoutUri = `${proto}://${host}/api/auth/login`;

    const logoutUrl = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`
    );
    logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutUri);
    return logoutUrl.toString();
  } catch {
    // Preview / no-credential environment: just send back to login route
    return "/api/auth/login";
  }
}

export default function handler(
  req: IncomingMessage,
  res: ServerResponse
): void {
  const logoutUrl = buildLogoutUrl(req);

  // Clear the session cookie (Max-Age=0 immediately expires it)
  res.setHeader(
    "Set-Cookie",
    "__session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );

  res.writeHead(302, { Location: logoutUrl });
  res.end();
}
