'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (pathname !== prevPathname) {
      setIsTransitioning(true);
      
      // Start fade out
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setPrevPathname(pathname);
        
        // Start fade in after a brief delay
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 150); // Match the fade-out duration

      return () => clearTimeout(timer);
    }
  }, [pathname, children, prevPathname]);

  return (
    <div className={cn('relative', className)}>
      {/* Current content with fade transition */}
      <div
        className={cn(
          'transition-opacity duration-150 ease-in-out',
          isTransitioning ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          transitionProperty: 'opacity',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {displayChildren}
      </div>

      {/* Skeleton loader during transition */}
      {isTransitioning && (
        <div className="absolute inset-0 z-10">
          <div className="h-full w-full bg-background animate-pulse-subtle" />
        </div>
      )}
    </div>
  );
}

// Simple fade transition wrapper
export function FadeTransition({ children, className }: PageTransitionProps) {
  return (
    <div
      className={cn(
        'fade-in',
        className
      )}
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );
}

// Slide transition for modal-like components
export function SlideTransition({ children, className }: PageTransitionProps) {
  return (
    <div
      className={cn(
        'slide-in-from-bottom',
        className
      )}
      style={{
        animation: 'slideInFromBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}