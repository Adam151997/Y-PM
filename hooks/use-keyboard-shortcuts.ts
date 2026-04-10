import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseKeyboardShortcutsOptions {
  enableGlobalShortcuts?: boolean;
}

/**
 * Global keyboard shortcuts hook
 * Provides consistent keyboard navigation throughout the app
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enableGlobalShortcuts = true } = options;
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if typing in an input or textarea
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      document.activeElement?.getAttribute('contenteditable') === 'true'
    ) {
      return;
    }

    // Global navigation shortcuts (G + key)
    if (e.key === 'g' || e.key === 'G') {
      const handleSecondKey = (secondE: KeyboardEvent) => {
        switch (secondE.key.toLowerCase()) {
          case 'd':
            secondE.preventDefault();
            router.push('/dashboard');
            break;
          case 'p':
            secondE.preventDefault();
            router.push('/projects');
            break;
          case 'a':
            secondE.preventDefault();
            router.push('/activities');
            break;
        }
        document.removeEventListener('keydown', handleSecondKey);
      };

      document.addEventListener('keydown', handleSecondKey);
      
      // Remove listener after 2 seconds if no second key is pressed
      setTimeout(() => {
        document.removeEventListener('keydown', handleSecondKey);
      }, 2000);
    }

    // Quick actions
    if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      router.push('/projects/new');
    }
  }, [router]);

  useEffect(() => {
    if (!enableGlobalShortcuts) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableGlobalShortcuts, handleKeyDown]);

  return {
    // Expose utility functions if needed
    navigateTo: (path: string) => router.push(path),
  };
}

/**
 * Check if a keyboard event matches a shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: {
    key: string;
    meta?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  }
): boolean {
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const metaMatches = shortcut.meta === undefined || event.metaKey === shortcut.meta;
  const ctrlMatches = shortcut.ctrl === undefined || event.ctrlKey === shortcut.ctrl;
  const shiftMatches = shortcut.shift === undefined || event.shiftKey === shortcut.shift;
  const altMatches = shortcut.alt === undefined || event.altKey === shortcut.alt;

  return keyMatches && metaMatches && ctrlMatches && shiftMatches && altMatches;
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string[]): string {
  return keys
    .map(key => {
      switch (key) {
        case 'meta':
        case 'cmd':
          return '⌘';
        case 'ctrl':
          return 'Ctrl';
        case 'shift':
          return '⇧';
        case 'alt':
        case 'option':
          return '⌥';
        default:
          return key;
      }
    })
    .join('+');
}
