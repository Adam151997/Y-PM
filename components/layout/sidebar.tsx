'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';

interface SidebarProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { name: 'Projects', href: '/projects', icon: FolderKanban, shortcut: 'G P' },
  { name: 'Activity', href: '/activities', icon: Activity, shortcut: 'G A' },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-screen bg-card border-r flex flex-col relative z-20"
      >
        {/* Logo */}
        <div className="p-4 h-16 flex items-center border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-bold text-lg text-foreground whitespace-nowrap"
                >
                  FlowCraft
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* New Project Button */}
        <div className="p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                className={cn(
                  'w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary border-0 shadow-lg shadow-primary/20',
                  isCollapsed && 'px-0'
                )}
              >
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="ml-2 whitespace-nowrap"
                      >
                        New Project
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>New Project</span>
                <kbd className="px-1.5 py-0.5 rounded bg-secondary text-text-tertiary font-mono text-[10px]">
                  ⌘N
                </kbd>
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Search - Command Palette Trigger */}
        <div className="px-3 pb-3">
          <button
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-muted-foreground text-sm border border-border/50 hover:bg-secondary/80 transition-colors',
              isCollapsed && 'px-2 justify-center'
            )}
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-left whitespace-nowrap"
                >
                  Search...
                </motion.span>
              )}
            </AnimatePresence>
            {!isCollapsed && (
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:bg-accent hover:text-text-primary',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0',
                          isActive && 'text-primary'
                        )}
                      />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {!isCollapsed && item.shortcut && (
                      <kbd className="hidden group-hover:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary text-text-tertiary font-mono text-[10px] flex-shrink-0 opacity-70">
                        {item.shortcut}
                      </kbd>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-secondary text-text-tertiary font-mono text-[10px]">
                        {item.shortcut}
                      </kbd>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-border/50">
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <Moon className="h-5 w-5 flex-shrink-0" />
                )}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </TooltipContent>
            )}
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200 mt-1',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}