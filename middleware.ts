import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;
  
  console.log('[Middleware] pathname:', pathname, 'hasToken:', !!token);

  // Allow public routes
  const publicPaths = ['/login', '/register', '/api', '/_next', '/favicon.ico', '/'];
  const isPublicPath = publicPaths.some(path => {
    if (path === '/') {
      // Only match exactly '/' for the root path
      return pathname === path;
    } else {
      // For other paths, match exact or starts with path/
      return pathname === path || pathname === path + '/' || pathname.startsWith(path + '/');
    }
  });

  if (isPublicPath) {
    console.log('[Middleware] Allowing public path');
    return NextResponse.next();
  }

  // Check authentication
  if (!token) {
    console.log('[Middleware] No token, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      name: string;
    };
    
    console.log('[Middleware] Token valid, user:', payload.email);

    // Add user info to headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId.toString());
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-name', payload.name);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log('[Middleware] Token invalid, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
