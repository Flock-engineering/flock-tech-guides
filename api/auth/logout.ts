/**
 * GET /api/auth/logout
 * Vercel EDGE Function (Web-standard Request/Response — no Node built-ins)
 *
 * Clears the __session cookie and redirects the user to Microsoft's
 * end-session endpoint to terminate the Entra session.
 * After logout, the next request to any gated route will re-trigger the gate.
 */

export const config = { runtime: "edge" };

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

/**
 * Builds the Microsoft Entra end-session URL.
 * Falls back to / if env vars are not set (safe for preview).
 */
function buildLogoutUrl(request: Request): string {
  try {
    const tenantId = requireEnv("ENTRA_TENANT_ID");
    const rawHost =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      new URL(request.url).host;
    const host = rawHost.split(",")[0].trim();
    const proto =
      (request.headers.get("x-forwarded-proto") ?? "https").split(",")[0].trim();
    const postLogoutUri = `${proto}://${host}/api/auth/login`;

    const logoutUrl = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`
    );
    logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutUri);
    return logoutUrl.toString();
  } catch {
    // Preview / no-credential environment: just send back to the site root
    return "/";
  }
}

export default function handler(request: Request): Response {
  const logoutUrl = buildLogoutUrl(request);

  return new Response(null, {
    status: 302,
    headers: {
      Location: logoutUrl,
      // Clear the session cookie (Max-Age=0 immediately expires it)
      "Set-Cookie": "__session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    },
  });
}
