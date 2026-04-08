'use server';

import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { createToken, setAuthCookie, clearAuthCookie } from '@/lib/auth';
import { registerSchema, loginSchema, type RegisterInput, type LoginInput, internalRegisterSchema, type InternalRegisterInput } from './schemas';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function register(input: InternalRegisterInput) {
  const validation = internalRegisterSchema.safeParse(input);
  
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { name, email, password } = validation.data;

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: 'An account with this email already exists' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const [newUser] = await db.insert(users).values({
    name,
    email,
    hashedPassword,
  }).returning({
    id: users.id,
    email: users.email,
    name: users.name,
  });

  // Create token and set cookie
  const token = createToken({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  setAuthCookie(token);

  return { success: true };
}

export async function login(input: LoginInput) {
  const validation = loginSchema.safeParse(input);

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { email, password } = validation.data;

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.hashedPassword);

  if (!isValid) {
    return { error: 'Invalid email or password' };
  }

  // Create token and set cookie
  const token = createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  setAuthCookie(token);

  return { success: true };
}

export async function logout() {
  clearAuthCookie();
  redirect('/login');
}

export async function getCurrentUser() {
  const { getCurrentUser } = await import('@/lib/auth');
  return getCurrentUser();
}