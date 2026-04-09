'use client';

import { motion } from 'framer-motion';
import { Settings, ArrowLeft, MoreHorizontal, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface ProjectHeaderProps {
  projectId: number;
  projectName: string;
  projectColor: string;
  description?: string;
  memberCount?: number;
}

export function ProjectHeader({
  projectId,
  projectName,
  projectColor,
  description,
  memberCount = 1,
}: ProjectHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="rounded-xl hover:bg-secondary/50"
        >
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <div
            className="w-5 h-5 rounded-lg flex-shrink-0"
            style={{ backgroundColor: projectColor || '#6366f1' }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{projectName}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Members */}
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            <Avatar className="h-8 w-8 ring-2 ring-card">
              <AvatarFallback className="text-xs bg-indigo-500/20 text-indigo-400">
                JD
              </AvatarFallback>
            </Avatar>
            {memberCount > 1 && (
              <Avatar className="h-8 w-8 ring-2 ring-card">
                <AvatarFallback className="text-xs bg-secondary text-muted-foreground">
                  +{memberCount - 1}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-secondary/50"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="rounded-lg">
              <Settings className="h-4 w-4 mr-2" />
              Project settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}