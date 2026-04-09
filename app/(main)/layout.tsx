import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPaletteWrapper } from '@/components/command-palette-wrapper';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Ensure avatar is never undefined
  const safeUser = {
    ...user,
    avatar: user.avatar ?? null,
  };

  return (
    <div className="min-h-screen bg-background">
      <CommandPaletteWrapper />
      <div className="flex h-screen">
        <Sidebar user={safeUser} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={safeUser} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
