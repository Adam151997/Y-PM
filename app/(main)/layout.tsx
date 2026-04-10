'use client';

import { useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileContainer } from '@/components/layout/mobile-bottom-nav';
import { CommandPaletteWrapper } from '@/components/command-palette-wrapper';
import { cn } from '@/lib/utils';

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

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <MobileContainer>
      <div className="min-h-screen bg-background">
        <CommandPaletteWrapper />
        <div className="flex h-screen">
          {/* Sidebar - Hidden on mobile when menu is closed */}
          <div className={cn(
            'hidden md:block',
            showMobileMenu && 'block absolute inset-0 z-40 md:relative md:z-auto'
          )}>
            <Sidebar user={safeUser} />
            {/* Mobile overlay */}
            {showMobileMenu && (
              <div 
                className="md:hidden fixed inset-0 bg-black/50 z-30"
                onClick={() => setShowMobileMenu(false)}
              />
            )}
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              user={safeUser} 
              showMobileMenu={showMobileMenu}
              onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
            />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
