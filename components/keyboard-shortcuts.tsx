'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard, Search, Plus, LayoutDashboard, FolderKanban, Activity } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Global
  { keys: ['⌘', 'K'], description: 'Open command palette', category: 'Global' },
  { keys: ['⌘', 'N'], description: 'Create new project', category: 'Global' },
  { keys: ['⌘', '\\'], description: 'Toggle theme', category: 'Global' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Global' },
  { keys: ['Esc'], description: 'Close dialog/modal', category: 'Global' },

  // Navigation
  { keys: ['G', 'then', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['G', 'then', 'P'], description: 'Go to Projects', category: 'Navigation' },
  { keys: ['G', 'then', 'A'], description: 'Go to Activities', category: 'Navigation' },
  
  // Command Palette
  { keys: ['↑↓'], description: 'Navigate items', category: 'Command Palette' },
  { keys: ['↵'], description: 'Select item', category: 'Command Palette' },
  { keys: ['Esc'], description: 'Close palette', category: 'Command Palette' },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        // Don't trigger if typing in an input
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scale-in">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Navigate faster with these keyboard shortcuts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                {category === 'Global' && <Search className="h-4 w-4" />}
                {category === 'Navigation' && <LayoutDashboard className="h-4 w-4" />}
                {category === 'Command Palette' && <FolderKanban className="h-4 w-4" />}
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <span className="text-sm text-text-primary group-hover:text-text-primary">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i} className="inline-flex items-center gap-1">
                            <kbd className="px-2 py-1 rounded bg-secondary text-text-tertiary font-mono text-xs border border-border">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-text-tertiary text-xs mx-0.5">
                                {shortcut.keys[i + 1] === 'then' ? '' : '+'}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
          <p>Press <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">?</kbd> anytime to view shortcuts</p>
          <p>Press <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">Esc</kbd> to close</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
