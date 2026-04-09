'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/features/auth/schemas';
import { register as registerAction } from '@/features/auth/server-actions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export type RegisterFormInput = RegisterInput;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setIsLoading(true);
    try {
      await registerAction({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (err) {
      // Next.js redirect throws an error
    } finally {
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  // Password requirements
  const passwordRequirements = [
    { met: false, text: 'At least 8 characters' },
  ];

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
          <span className="text-white font-bold text-xl">FC</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground mt-2">Get started with FlowCraft</p>
      </div>

      {/* Form Card */}
      <div className="relative">
        {/* Glassmorphic card */}
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                {...formRegister('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                {...formRegister('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                {...formRegister('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                {...formRegister('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
