'use client';

import { useState } from 'react';
import { ProjectBoard } from '@/features/tasks/components/project-board';
import { TaskListView } from '@/features/tasks/components/task-list-view';
import { TaskTimelineView } from '@/features/tasks/components/task-timeline-view';
import { TaskDetailDialog } from '@/features/tasks/components/task-detail-dialog';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import type { Task, Label } from '@/features/tasks/types';

interface ProjectDetailClientProps {
  projectId: number;
  initialTasks: Task[];
  labels: Label[];
  userId: number;
}

export function ProjectDetailClient({ projectId, initialTasks, labels, userId }: ProjectDetailClientProps) {
  const [view, setView] = useState<'board' | 'list' | 'timeline'>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDetailDialogOpen(true);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView('board')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'board' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'list' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'timeline' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {view === 'board' && (
        <ProjectBoard
          projectId={projectId}
          initialTasks={initialTasks}
          labels={labels}
          userId={userId}
          onTaskClick={handleTaskClick}
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />
      )}

      {view === 'list' && (
        <TaskListView
          projectId={projectId}
          initialTasks={initialTasks}
          labels={labels}
          onTaskClick={handleTaskClick}
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />
      )}

      {view === 'timeline' && (
        <TaskTimelineView
          projectId={projectId}
          initialTasks={initialTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      <TaskDetailDialog
        taskId={selectedTaskId}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        projectId={projectId}
      />

      <CreateTaskDialog
        projectId={projectId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {}}
      />
    </>
  );
}