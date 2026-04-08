import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Login - FlowCraft',
  description: 'Sign in to your FlowCraft account',
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">FlowCraft</h1>
        <p className="text-muted-foreground mt-2">Project Management Made Simple</p>
      </div>
      <LoginForm />
    </div>
  );
}