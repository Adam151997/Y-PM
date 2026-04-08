import { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Register - FlowCraft',
  description: 'Create your FlowCraft account',
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">FlowCraft</h1>
        <p className="text-muted-foreground mt-2">Project Management Made Simple</p>
      </div>
      <RegisterForm />
    </div>
  );
}