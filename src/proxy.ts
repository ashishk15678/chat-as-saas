import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight edge gate — only checks for the better-auth session cookie.
 * Real authorisation lives in tRPC procedures and the (app) layout.
 */
export function proxy(req: NextRequest) {
  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");

  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
