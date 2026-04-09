'use client';

import { useState, useEffect } from 'react';
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

  console.log('[ProjectDetailClient] isCreateDialogOpen:', isCreateDialogOpen);

  useEffect(() => {
    const handleOpenCreate = () => {
      setIsCreateDialogOpen(true);
    };
    window.addEventListener('openCreateTask', handleOpenCreate);
    return () => window.removeEventListener('openCreateTask', handleOpenCreate);
  }, []);

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDetailDialogOpen(true);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
          <button
            onClick={() => setView('board')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'board'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-secondary text-muted-foreground'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'list'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-secondary text-muted-foreground'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'timeline'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-secondary text-muted-foreground'
            }`}
          >
            Timeline
          </button>
        </div>
        <button
          onClick={() => {
            console.log('[Add Task Button] Clicked, setting isCreateDialogOpen to true');
            setIsCreateDialogOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700 transition-all hover:scale-[1.02]"
        >
          + Add Task
        </button>
      </div>

      {view === 'board' && (
        <ProjectBoard
          projectId={projectId}
          initialTasks={initialTasks}
          labels={labels}
          userId={userId}
          onTaskClick={handleTaskClick}
        />
      )}

      {view === 'list' && (
        <TaskListView
          projectId={projectId}
          initialTasks={initialTasks}
          labels={labels}
          onTaskClick={handleTaskClick}
        />
      )}

      {view === 'timeline' && (
        <TaskTimelineView
          projectId={projectId}
          initialTasks={initialTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {selectedTaskId && (
        <TaskDetailDialog
          projectId={projectId}
          taskId={selectedTaskId}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}

      {isCreateDialogOpen && (
        <CreateTaskDialog
          projectId={projectId}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={() => {}}
        />
      )}
    </>
  );
}