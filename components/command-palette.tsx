'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Activity,
  Plus,
  Settings,
  FileText,
  CheckSquare,
  Clock,
  Hash,
  Zap,
  Moon,
  Sun,
  LogOut,
  User,
  Keyboard,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
  badge?: string;
}

interface RecentItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  timestamp: number;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Global shortcuts (only when command palette is closed)
      if (!open) {
        if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          router.push('/projects/new');
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, router]);

  // Fetch projects and tasks when opened
  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      setSearch('');
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects').then(r => r.ok ? r.json() : []),
        fetch('/api/tasks').then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      setProjects(projectsRes || []);
      setTasks(tasksRes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCommand = useCallback((command: () => void, item?: { label: string; icon: React.ElementType }) => {
    setOpen(false);
    command();
    
    // Add to recent items
    if (item) {
      const newItem: RecentItem = {
        id: Date.now().toString(),
        label: item.label,
        icon: item.icon,
        action: command,
        timestamp: Date.now(),
      };
      setRecentItems(prev => [newItem, ...prev.filter(i => i.label !== item.label)].slice(0, 5));
    }
  }, []);

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'View your dashboard',
      icon: LayoutDashboard,
      action: () => router.push('/dashboard'),
      keywords: ['home', 'overview'],
      shortcut: 'G then D',
    },
    {
      id: 'projects',
      label: 'Go to Projects',
      description: 'View all projects',
      icon: FolderKanban,
      action: () => router.push('/projects'),
      keywords: ['work', 'folder'],
      shortcut: 'G then P',
    },
    {
      id: 'activities',
      label: 'Go to Activities',
      description: 'View activity feed',
      icon: Activity,
      action: () => router.push('/activities'),
      keywords: ['log', 'history', 'feed'],
      shortcut: 'G then A',
    },
  ];

  // Action commands
  const actionCommands: CommandItem[] = [
    {
      id: 'new-project',
      label: 'Create New Project',
      description: 'Start a new project',
      icon: Plus,
      action: () => router.push('/projects/new'),
      keywords: ['add', 'create', 'new'],
      shortcut: '⌘N',
    },
    {
      id: 'settings',
      label: 'Open Settings',
      description: 'Manage your preferences',
      icon: Settings,
      action: () => router.push('/settings'),
      keywords: ['preferences', 'config'],
    },
    {
      id: 'profile',
      label: 'View Profile',
      description: 'Your account settings',
      icon: User,
      action: () => router.push('/profile'),
      keywords: ['account', 'user'],
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: 'Toggle theme',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      keywords: ['dark', 'light', 'theme', 'appearance'],
      shortcut: '⌘\\',
    },
  ];

  // Project commands
  const projectCommands: CommandItem[] = projects.map(project => ({
    id: `project-${project.id}`,
    label: project.name,
    description: project.description || 'No description',
    icon: FolderKanban,
    action: () => router.push(`/projects/${project.id}`),
    keywords: ['project'],
    badge: project.color,
  }));

  // Task commands
  const taskCommands: CommandItem[] = tasks.slice(0, 10).map(task => ({
    id: `task-${task.id}`,
    label: task.title,
    description: `${task.status} • ${task.priority || 'no priority'}`,
    icon: CheckSquare,
    action: () => router.push(`/projects/${task.projectId}`),
    keywords: ['task', 'todo'],
  }));

  const renderCommandItem = (item: CommandItem) => (
    <Command.Item
      key={item.id}
      value={`${item.label} ${item.description || ''} ${item.keywords?.join(' ') || ''}`}
      onSelect={() => runCommand(item.action, { label: item.label, icon: item.icon })}
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground text-sm transition-all duration-fast group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <item.icon className="h-4 w-4 text-text-tertiary group-aria-selected:text-primary" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate">{item.label}</span>
          {item.description && (
            <span className="text-xs text-text-tertiary truncate">{item.description}</span>
          )}
        </div>
        {item.badge && (
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.badge }}
          />
        )}
        {item.shortcut && (
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary text-text-tertiary font-mono text-xs flex-shrink-0">
            {item.shortcut}
          </kbd>
        )}
      </div>
    </Command.Item>
  );

  return (
    <>
      {/* Command Dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-surface-overlay/95 backdrop-blur-xl border border-border shadow-xl rounded-xl overflow-hidden z-[9999] scale-in"
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-text-tertiary mr-3 flex-shrink-0" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search for projects, tasks, or commands..."
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-text-placeholder"
            autoFocus
          />
          {loading && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <Command.List className="max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Search className="h-6 w-6 text-text-tertiary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">No results found</p>
                <p className="text-xs text-text-tertiary">Try searching for something else</p>
              </div>
            </div>
          </Command.Empty>

          {/* Recent Items */}
          {!search && recentItems.length > 0 && (
            <Command.Group
              heading="Recent"
              className="text-xs font-medium text-text-tertiary px-3 py-2 mb-1"
            >
              {recentItems.map(item => (
                <Command.Item
                  key={item.id}
                  onSelect={() => runCommand(item.action)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground text-sm transition-all duration-fast group"
                >
                  <Clock className="h-4 w-4 text-text-tertiary group-aria-selected:text-primary flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Navigation */}
          <Command.Group
            heading="Navigation"
            className="text-xs font-medium text-text-tertiary px-3 py-2 mb-1"
          >
            {navigationCommands.map(renderCommandItem)}
          </Command.Group>

          {/* Quick Actions */}
          <Command.Group
            heading="Quick Actions"
            className="text-xs font-medium text-text-tertiary px-3 py-2 mb-1 mt-3"
          >
            {actionCommands.map(renderCommandItem)}
          </Command.Group>

          {/* Projects */}
          {projectCommands.length > 0 && (
            <Command.Group
              heading="Projects"
              className="text-xs font-medium text-text-tertiary px-3 py-2 mb-1 mt-3"
            >
              {projectCommands.map(renderCommandItem)}
            </Command.Group>
          )}

          {/* Tasks */}
          {taskCommands.length > 0 && search && (
            <Command.Group
              heading="Tasks"
              className="text-xs font-medium text-text-tertiary px-3 py-2 mb-1 mt-3"
            >
              {taskCommands.map(renderCommandItem)}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 bg-surface-raised/50 flex items-center justify-between text-xs text-text-tertiary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">Esc</kbd>
              Close
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 hover:text-text-secondary transition-colors"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>
      </Command.Dialog>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] fade-in"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}