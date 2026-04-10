/**
 * Fixed authentication utilities that work with both Server and Client components
 * Uses middleware headers for Server Components and cookies for Client Components
 */

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { db } from './db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const COOKIE_NAME = 'auth-token';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
}

export function signToken(userId: number, email: string, name: string): string {
  return jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Server Component version - uses headers from middleware
export async function getCurrentUserServer(): Promise<{ id: number; email: string; name: string; avatar?: string | null } | null> {
  try {
    // Get headers added by middleware
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userEmail = headersList.get('x-user-email');
    const userName = headersList.get('x-user-name');
    
    if (!userId || !userEmail || !userName) {
      return null;
    }
    
    // Get full user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('Error in getCurrentUserServer:', error);
    return null;
  }
}

// Client Component version - uses cookies API (only works in Server Components)
export async function getCurrentUser(): Promise<{ id: number; email: string; name: string; avatar?: string | null } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Get full user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// Hybrid version - tries Server Component approach first, falls back to Client
export async function getCurrentUserHybrid(): Promise<{ id: number; email: string; name: string; avatar?: string | null } | null> {
  try {
    // Try Server Component approach first
    const user = await getCurrentUserServer();
    if (user) {
      console.log('[Auth] getCurrentUserHybrid: Found user via headers');
      return user;
    }
    
    // Fall back to Client Component approach
    const cookieUser = await getCurrentUser();
    if (cookieUser) {
      console.log('[Auth] getCurrentUserHybrid: Found user via cookies');
    } else {
      console.log('[Auth] getCurrentUserHybrid: No user found');
    }
    return cookieUser;
  } catch (error) {
    console.error('Error in getCurrentUserHybrid:', error);
    return null;
  }
}

export async function setAuthCookie(token: string) {
  console.log('[Auth] setAuthCookie: Setting auth cookie');
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  console.log('[Auth] setAuthCookie: Cookie set successfully');
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth() {
  const user = await getCurrentUserHybrid();
  if (!user) {
    return null;
  }
  return user;
}

// Utility to get user from token string (for API routes)
export function getUserFromToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// API Route version - uses request object
export async function getCurrentUserFromRequest(request: Request): Promise<{ id: number; email: string; name: string; avatar?: string | null } | null> {
  try {
    // Get token from cookies in request
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies[COOKIE_NAME];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Get full user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('Error in getCurrentUserFromRequest:', error);
    return null;
  }
}
