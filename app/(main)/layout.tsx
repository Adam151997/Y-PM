import { getCurrentUserServer } from '@/lib/auth-fixed';
import { redirect } from 'next/navigation';
import { MobileContainer } from '@/components/layout/mobile-bottom-nav';
import { CommandPaletteWrapper } from '@/components/command-palette-wrapper';

// Import client component for mobile state
import { MobileMenuClient } from './mobile-menu-client';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect('/login');
  }

  // Ensure avatar is never undefined
  const safeUser = {
    ...user,
    avatar: user.avatar ?? null,
  };

  return (
    <MobileMenuClient user={safeUser}>
      <MobileContainer>
        <div className="min-h-screen bg-background">
          <CommandPaletteWrapper />
          {children}
        </div>
      </MobileContainer>
    </MobileMenuClient>
  );
}
