import { redirect } from 'next/navigation';
import { getCurrentUserHybrid } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[AuthLayout] Checking if user is authenticated...');
  const user = await getCurrentUserHybrid();
  
  console.log('[AuthLayout] User:', user ? `Found (${user.email})` : 'Not found');

  if (user) {
    console.log('[AuthLayout] User is authenticated, redirecting to /dashboard');
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-violet-500/30 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        </div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-in">
        {children}
      </div>
    </div>
  );
}