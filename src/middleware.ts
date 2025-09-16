import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Role } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Public routes that don't require authentication
    if (pathname.startsWith('/auth/') || pathname === '/') {
      return NextResponse.next()
    }

    // Require authentication for all other routes
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    const userRole = token.role as Role

    // Admin-only routes
    if (pathname.startsWith('/admin') && userRole !== Role.ADMIN) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Manager and Admin routes
    if (
      pathname.startsWith('/reports') &&
      !([Role.ADMIN, Role.MANAGER] as Role[]).includes(userRole)
    ) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to auth pages without token
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
