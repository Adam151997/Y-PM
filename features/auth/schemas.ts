import { z } from 'zod';

const baseRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string(),
});

export const registerSchema = baseRegisterSchema.refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Internal registration type (used by server action)
export const internalRegisterSchema = baseRegisterSchema.omit({ confirmPassword: true });
export type InternalRegisterInput = z.infer<typeof internalRegisterSchema>;

// Form registration type (includes confirmPassword)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;