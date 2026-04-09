'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, LayoutDashboard, FolderKanban, Activity, Plus, Settings } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg hover:bg-secondary/50 transition-colors text-sm text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">⌘K</span>
        </button>
      </div>

      {/* Command Dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl overflow-hidden z-[9999]"
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center border-b border-border/30 px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Command.Input
            placeholder="Search commands..."
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-xs text-muted-foreground px-2 py-1.5">
            <Command.Item
              onSelect={() => runCommand(() => router.push('/dashboard'))}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-secondary/50 text-sm transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/projects'))}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-secondary/50 text-sm transition-colors"
            >
              <FolderKanban className="h-4 w-4" />
              <span>Go to Projects</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/activities'))}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-secondary/50 text-sm transition-colors"
            >
              <Activity className="h-4 w-4" />
              <span>Go to Activities</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Actions" className="text-xs text-muted-foreground px-2 py-1.5 mt-2">
            <Command.Item
              onSelect={() => runCommand(() => router.push('/projects/new'))}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-secondary/50 text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Project</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/settings'))}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-secondary/50 text-sm transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="border-t border-border/30 px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>Press ↵ to select</span>
          <span>Esc to close</span>
        </div>
      </Command.Dialog>

      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}