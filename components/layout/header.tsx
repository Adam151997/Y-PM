'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Search,
  Plus,
  Command,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getInitials } from '@/lib/utils';
import { logout } from '@/features/auth/server-actions';

interface HeaderProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
}

// Mock projects for the switcher - in a real app this would come from props or context
const mockProjects = [
  { id: 1, name: 'Website Redesign', color: '#6366f1' },
  { id: 2, name: 'Mobile App', color: '#10b981' },
  { id: 3, name: 'Marketing Campaign', color: '#f59e0b' },
];

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProject] = useState(mockProjects[0]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
        {/* Project Switcher */}
        <div className="flex items-center gap-2">
          <DropdownMenu open={isProjectSwitcherOpen} onOpenChange={setIsProjectSwitcherOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <span className="font-medium text-sm">{selectedProject.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 p-2"
              sideOffset={8}
            >
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground">Projects</p>
              </div>
              {mockProjects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm">{project.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem className="px-2 py-2 rounded-lg cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm">Create new project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-8">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground text-sm hover:bg-secondary/80 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search projects, tasks...</span>
            <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-secondary/50"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <Avatar className="h-8 w-8 ring-2 ring-border">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2" sideOffset={8}>
              <div className="px-2 py-2">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg px-2 py-2 cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-2 py-2 cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg px-2 py-2 cursor-pointer text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-sm">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <DialogTitle className="text-lg font-normal">
                Search projects and tasks
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-4">
            <Input
              placeholder="Type to search..."
              className="w-full bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1 py-0.5 rounded bg-secondary text-xs">Esc</kbd> to close
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Settings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}