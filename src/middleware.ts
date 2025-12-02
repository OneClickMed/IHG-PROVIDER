// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Only log once per unique page request (not for assets)
    if (!pathname.startsWith('/_next') && !pathname.includes('.')) {
      // console.log('🛡️ [Middleware] Path:', pathname, 'Authenticated:', !!token);
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    const isAuthPage = pathname === '/login' || 
                       pathname === '/forgot-password' || 
                       pathname === '/reset-password';
    
    if (token && isAuthPage) {
      // console.log('🛡️ [Middleware] Redirecting authenticated user from auth page to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check provider status for dashboard routes
    if (token && pathname.startsWith('/dashboard')) {
      const user = token.user as any;
      const isProvider = user?.isProvider === true || user?.isCustomer === false;
      
      if (!isProvider) {
        // console.log('❌ [Middleware] Access denied: User is not a provider');
        return NextResponse.redirect(new URL('/login?error=not_provider', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages
        const isAuthPage = pathname === '/login' || 
                          pathname === '/forgot-password' || 
                          pathname === '/reset-password';
        
        if (isAuthPage) {
          return true;
        }
        
        // Require authentication for all other matched routes
        return !!token;
      },
    },
  }
);

// Only match actual page routes, not assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
  ],
};