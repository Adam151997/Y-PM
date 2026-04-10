import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible JWT verification using Web Crypto API
async function verifyJWT(token: string, secret: string): Promise<{ userId: number; email: string; name: string } | null> {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[JWT] Invalid token format');
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Helper to decode base64url
    function base64UrlDecode(str: string): string {
      // Convert from base64url to base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding
      while (base64.length % 4) {
        base64 += '=';
      }
      return atob(base64);
    }
    
    // Decode header to check algorithm
    const headerJson = base64UrlDecode(headerB64);
    const header = JSON.parse(headerJson);
    console.log('[JWT] Header:', header);
    
    // Decode payload
    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson);
    
    console.log('[JWT] Payload:', payload);
    
    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(headerB64 + '.' + payloadB64);
    console.log('[JWT] Data to verify:', headerB64 + '.' + payloadB64);
    
    // Try to decode secret as base64 first, fall back to raw string
    let secretBytes: Uint8Array;
    try {
      // Try base64 decode
      secretBytes = Uint8Array.from(base64UrlDecode(secret), c => c.charCodeAt(0));
      console.log('[JWT] Using base64-decoded secret');
    } catch {
      // Fall back to raw string
      secretBytes = encoder.encode(secret);
      console.log('[JWT] Using raw string secret');
    }
    
    const secretKey = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = Uint8Array.from(base64UrlDecode(signatureB64), c => c.charCodeAt(0));
    console.log('[JWT] Signature length:', signature.length);
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      secretKey,
      signature,
      data
    );
    
    console.log('[JWT] Signature valid:', isValid);
    
    if (!isValid) {
      console.log('[JWT] Invalid signature');
      return null;
    }
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.log('[JWT] Token expired');
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.log('[JWT] Verification error:', error);
    return null;
  }
}

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
  
  console.log('[Middleware] Verifying token with secret:', JWT_SECRET.substring(0, 10) + '...');
  console.log('[Middleware] Token length:', token.length);
  console.log('[Middleware] Token first 50 chars:', token.substring(0, 50));
  
  const payload = await verifyJWT(token, JWT_SECRET);
  
  if (payload) {
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
  } else {
    console.log('[Middleware] Token invalid, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    
    // Clear the invalid cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
