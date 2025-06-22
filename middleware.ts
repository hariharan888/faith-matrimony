import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

interface ExtendedToken {
  uid?: string
  hasProfile?: boolean
  isProfileComplete?: boolean
}

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const token = await getToken({ req }) as ExtendedToken | null

    // Allow access to root and login pages for everyone
    if (pathname === "/" || pathname === "/login") {
      return NextResponse.next()
    }

    // If user is authenticated, check profile completion for protected routes
    if (token) {
      // Get profile completion status from token
      const hasProfile = token.hasProfile
      const isProfileComplete = token.isProfileComplete

      // Allow access to my-profile page always for authenticated users
      if (pathname === "/my-profile") {
        return NextResponse.next()
      }

      // For all other protected routes, check if profile is complete
      if (!hasProfile || !isProfileComplete) {
        // Redirect incomplete profiles to my-profile page
        return NextResponse.redirect(new URL("/my-profile", req.url))
      }

      // Profile is complete, allow access to all pages
      return NextResponse.next()
    }

    // This shouldn't happen due to the authorized callback, but just in case
    return NextResponse.redirect(new URL("/login", req.url))
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to root and login pages without authentication
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login") {
          return true
        }
        
        // Require authentication for all other pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
} 