'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/features/auth/schemas';
import { login as loginAction } from '@/features/auth/server-actions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await loginAction(data);
    } catch (err) {
      // Next.js redirect throws an error - we can ignore it
    } finally {
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
          <span className="text-white font-bold text-xl">FC</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-2">Sign in to your FlowCraft account</p>
      </div>

      {/* Form Card */}
      <div className="relative">
        {/* Glassmorphic card */}
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 p-6 space-y-5">
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
                placeholder="Enter your password"
                className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                {...formRegister('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
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
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
