'use client';

import { useMemo, useState } from 'react';
import { Gantt, ViewMode, type Task } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { parseISO, startOfDay, endOfDay, addDays } from 'date-fns';
import type { Task as AppTask } from '@/features/tasks/types';

interface TaskTimelineViewProps {
  projectId: number;
  initialTasks: AppTask[];
  onTaskClick?: (taskId: number) => void;
}

const statusColors: Record<string, string> = {
  backlog: '#6b7280',
  todo: '#3b82f6',
  in_progress: '#f59e0b',
  in_review: '#8b5cf6',
  done: '#10b981',
  cancelled: '#ef4444',
};

export function TaskTimelineView({ projectId, initialTasks, onTaskClick }: TaskTimelineViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

  const tasks: Task[] = useMemo(() => {
    return initialTasks
      .filter((task) => task.startDate || task.dueDate)
      .map((task) => {
        const start = task.startDate ? parseISO(task.startDate.toString()) : new Date();
        const end = task.dueDate ? parseISO(task.dueDate.toString()) : addDays(start, 1);

        return {
          id: `task-${task.id}`,
          name: task.title,
          start: startOfDay(start),
          end: endOfDay(end),
          type: 'task',
          progress: task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0,
          isDisabled: false,
          styles: {
            backgroundColor: statusColors[task.status] || '#3b82f6',
            progressColor: statusColors[task.status] || '#3b82f6',
            progressSelectedColor: '#2563eb',
          },
          dependencies: [],
          project: task.title,
        };
      });
  }, [initialTasks]);

  const handleTaskClick = (task: Task) => {
    const taskId = parseInt(task.id.replace('task-', ''));
    onTaskClick?.(taskId);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-2">No tasks with dates</div>
        <p className="text-sm text-muted-foreground">
          Add start dates or due dates to tasks to see them in the timeline view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(ViewMode.Day)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === ViewMode.Day
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Week)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === ViewMode.Week
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode(ViewMode.Month)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === ViewMode.Month
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          onDateChange={() => {}}
          onProgressChange={() => {}}
          onClick={handleTaskClick}
          listCellWidth=""
          columnWidth={viewMode === ViewMode.Day ? 50 : viewMode === ViewMode.Week ? 100 : 200}
          barFill={60}
          ganttHeight={400}
        />
      </div>
    </div>
  );
}
