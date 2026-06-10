/**
 * VERCEL EDGE MIDDLEWARE — Auth Gate
 *
 * Runs on every request EXCEPT /api/auth/* (excluded via matcher).
 * Edge Runtime: only edge-safe imports allowed (jose via lib/session-edge.ts).
 * NEVER import openid-client or lib/oauth-node.ts here.
 *
 * Gate logic:
 *  1. If AUTH_ENABLED !== 'true' → pass through (preview bypass).
 *  2. Verify __session cookie (HS256 JWT via jose).
 *     - Valid session → next().
 *     - Missing / expired / invalid → 302 to /api/auth/login with __return_to cookie.
 *
 * Runtime: Web-standard Fetch API (no next/server dependency).
 * Compatible with Vercel Edge Runtime (non-Next.js projects).
 */

import { verifySession } from "./lib/session-edge.js";

/**
 * Parses the Cookie header and returns the value for the given cookie name.
 * Uses a simple regex to avoid pulling in any cookie-parsing dependency.
 */
function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const pair of cookieHeader.split(";")) {
    const [k, ...rest] = pair.trim().split("=");
    if (k.trim() === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}

export default async function middleware(request: Request): Promise<Response> {
  // Preview / staging bypass: gate is only active when AUTH_ENABLED === 'true'
  if (process.env.AUTH_ENABLED !== "true") {
    return new Response(null, { status: 200, headers: { "x-middleware-next": "1" } });
  }

  const cookieHeader = request.headers.get("cookie");
  const sessionCookie = getCookieValue(cookieHeader, "__session");

  if (sessionCookie) {
    try {
      await verifySession(sessionCookie);
      // Valid session — allow through
      return new Response(null, { status: 200, headers: { "x-middleware-next": "1" } });
    } catch {
      // Expired, tampered, or malformed — fall through to redirect below
    }
  }

  // No valid session: redirect to login and store the originally requested URL
  // in a short-lived httpOnly __return_to cookie so callback.ts can restore it.
  const requestUrl = new URL(request.url);
  const loginUrl = new URL("/api/auth/login", requestUrl.origin);

  const returnToValue = encodeURIComponent(requestUrl.pathname + requestUrl.search);
  const returnToCookie = `__return_to=${returnToValue}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: loginUrl.toString(),
      "Set-Cookie": returnToCookie,
    },
  });
}

/**
 * Matcher: gate every route EXCEPT the auth endpoints themselves.
 * Without this exclusion, the gate would loop: /api/auth/login → middleware
 * checks session → no session → redirects to /api/auth/login → ∞.
 *
 * Pattern explanation: matches all paths that do NOT start with "api/auth".
 * Also covers static assets (JS, CSS, images under /assets/).
 */
export const config = {
  matcher: ["/((?!api/auth).*)"],
};
