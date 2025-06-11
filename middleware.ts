import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/profile', '/dashboard'];
  const authRoutes = ['/login'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Get session token from request
  const sessionToken = SessionManager.getSessionFromRequest(request);

  if (isProtectedRoute) {
    if (!sessionToken) {
      // Redirect to login if no session token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify session token
    const sessionData = await SessionManager.verifySession(sessionToken);
    if (!sessionData) {
      // Clear invalid session and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      SessionManager.clearSessionCookie(response);
      return response;
    }

    // Session is valid, continue
    return NextResponse.next();
  }

  if (isAuthRoute && sessionToken) {
    // Verify session token
    const sessionData = await SessionManager.verifySession(sessionToken);
    if (sessionData) {
      // User is already authenticated, redirect to profile
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // For all other routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};