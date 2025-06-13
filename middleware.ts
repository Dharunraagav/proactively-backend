import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Skip middleware for static files, API routes, and special Next.js routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname === "/_not-found" ||
    request.nextUrl.pathname === "/not-found" ||
    request.nextUrl.pathname === "/error" ||
    request.nextUrl.pathname === "/global-error"
  ) {
    return NextResponse.next()
  }

  // For all other routes, let Next.js handle it
  return NextResponse.next()
}

// Configure the matcher to only run the middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
