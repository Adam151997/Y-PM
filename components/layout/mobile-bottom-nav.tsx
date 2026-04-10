'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Activity, 
  Plus,
  Search,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    shortcut: 'G D'
  },
  { 
    name: 'Projects', 
    href: '/projects', 
    icon: FolderKanban,
    shortcut: 'G P'
  },
  { 
    name: 'Create', 
    href: '/projects/new', 
    icon: Plus,
    isPrimary: true
  },
  { 
    name: 'Activity', 
    href: '/activities', 
    icon: Activity,
    shortcut: 'G A'
  },
  { 
    name: 'Search', 
    href: '#', 
    icon: Search,
    onClick: () => {
      // This would trigger the command palette
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        ctrlKey: true
      });
      window.dispatchEvent(event);
    }
  },
];

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn(
      'md:hidden fixed bottom-0 left-0 right-0 z-40',
      'bg-card/95 backdrop-blur-xl border-t border-border',
      'safe-area-inset-bottom pb-[env(safe-area-inset-bottom)]',
      className
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          if (item.isPrimary) {
            return (
              <div key={item.name} className="relative -top-4">
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-center',
                    'w-14 h-14 rounded-2xl',
                    'bg-gradient-to-br from-primary to-primary-hover',
                    'shadow-lg shadow-primary/30',
                    'hover:shadow-xl hover:shadow-primary/40',
                    'active:scale-95',
                    'transition-all duration-200'
                  )}
                  aria-label={item.name}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center',
                'flex-1 h-full px-2',
                'transition-all duration-200',
                'relative group'
              )}
              aria-label={item.name}
            >
              <div className={cn(
                'flex items-center justify-center',
                'w-10 h-10 rounded-xl',
                'transition-all duration-200',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}>
                <item.icon className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )} />
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
              )}
              
              {/* Tooltip-like label */}
              <span className={cn(
                'absolute -top-8 left-1/2 -translate-x-1/2',
                'px-2 py-1 rounded-lg',
                'bg-surface-overlay text-xs text-foreground',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200',
                'pointer-events-none',
                'shadow-lg'
              )}>
                {item.name}
                {item.shortcut && (
                  <span className="ml-1 text-muted-foreground">({item.shortcut})</span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Mobile-optimized container that adds padding for bottom nav
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

export function MobileContainer({ 
  children, 
  className,
  showBottomNav = true 
}: MobileContainerProps) {
  return (
    <>
      <div className={cn(
        'min-h-screen',
        showBottomNav && 'pb-16 md:pb-0',
        className
      )}>
        {children}
      </div>
      {showBottomNav && <MobileBottomNav />}
    </>
  );
}