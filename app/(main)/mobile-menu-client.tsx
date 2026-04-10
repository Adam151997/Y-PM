'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

export function MobileMenuClient({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: any;
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar - Hidden on mobile when menu is closed */}
        <div className={cn(
          'hidden md:block',
          showMobileMenu && 'block absolute inset-0 z-40 md:relative md:z-auto'
        )}>
          <Sidebar user={user} />
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
            user={user} 
            showMobileMenu={showMobileMenu}
            onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}