/**
 * @fileoverview Middleware for handling authentication and routing redirects.
 * This module ensures that users are redirected to the login page when 
 * attempting to access protected dashboard routes without a valid session.
 */

import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware function to intercept and process incoming requests.
 * 
 * @param {NextRequest} request The incoming Next.js request object.
 * @returns {Promise<NextResponse>} The next response or a redirect.
 */
export default async function middleware(request: NextRequest) {
  // We can't use auth.api.getSession directly in middleware easily due to 
  // how better-auth handles requests in Edge runtime, but we can check 
  // for the session cookie as a first pass.
  
  const sessionCookie = request.cookies.get("better-auth.session_token") || 
                        request.cookies.get("__better-auth-session-token");

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard") || 
                          request.nextUrl.pathname.startsWith("/assets") ||
                          request.nextUrl.pathname.startsWith("/alerts") ||
                          request.nextUrl.pathname.startsWith("/work-orders");

  if (isDashboardPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/assets/:path*",
    "/alerts/:path*",
    "/work-orders/:path*",
    "/inventory/:path*",
    "/reports/:path*",
    "/analytics/:path*",
    "/edge/:path*",
    "/executive/:path*",
    "/ehs/:path*",
    "/admin/:path*",
    "/settings/:path*",
  ],
};
