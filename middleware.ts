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
 *     - Missing / expired / invalid → 302 to /api/auth/login.
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "./lib/session-edge.js";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // Preview / staging bypass: gate is only active when AUTH_ENABLED === 'true'
  if (process.env.AUTH_ENABLED !== "true") {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("__session")?.value;

  if (sessionCookie) {
    try {
      await verifySession(sessionCookie);
      // Valid session — allow through
      return NextResponse.next();
    } catch {
      // Expired, tampered, or malformed — fall through to redirect below
    }
  }

  // No valid session: redirect to login
  const loginUrl = new URL("/api/auth/login", req.url);
  return NextResponse.redirect(loginUrl, { status: 302 });
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
