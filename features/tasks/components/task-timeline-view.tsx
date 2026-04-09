'use client';

import { useMemo, useState } from 'react';
import { parseISO, startOfDay, addDays, format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns';
import type { Task } from '@/features/tasks/types';
import { cn } from '@/lib/utils';

interface TaskTimelineViewProps {
  projectId: number;
  initialTasks: Task[];
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

type ViewMode = 'week' | 'month';

export function TaskTimelineView({ projectId, initialTasks, onTaskClick }: TaskTimelineViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const tasksWithDates = useMemo(() => {
    return initialTasks.filter((task) => task.startDate || task.dueDate);
  }, [initialTasks]);

  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfDay(currentDate);
      const end = addDays(start, 27);
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  const getTaskPosition = (task: Task) => {
    const start = task.startDate ? parseISO(task.startDate.toString()) : new Date();
    const end = task.dueDate ? parseISO(task.dueDate.toString()) : addDays(start, 1);

    const taskStart = startOfDay(start);
    const timelineStart = dateRange[0];

    const startOffset = Math.max(0, differenceInDays(taskStart, timelineStart));
    const duration = Math.max(1, differenceInDays(end, taskStart) + 1);
    const availableDays = dateRange.length;

    const leftPercent = (startOffset / availableDays) * 100;
    const widthPercent = (duration / availableDays) * 100;

    return { left: leftPercent, width: Math.min(widthPercent, 100 - leftPercent) };
  };

  const goToPrev = () => {
    setCurrentDate((d) => addDays(d, viewMode === 'week' ? -7 : -28));
  };

  const goToNext = () => {
    setCurrentDate((d) => addDays(d, viewMode === 'week' ? 7 : 28));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (tasksWithDates.length === 0) {
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
            onClick={() => setViewMode('week')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              viewMode === 'week' ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              viewMode === 'month' ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            )}
          >
            Month
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToPrev} className="p-1.5 rounded hover:bg-muted">
            ←
          </button>
          <button onClick={goToToday} className="px-3 py-1 text-sm rounded hover:bg-muted">
            Today
          </button>
          <button onClick={goToNext} className="p-1.5 rounded hover:bg-muted">
            →
          </button>
          <span className="text-sm font-medium ml-2">
            {format(dateRange[0], 'MMM d')} - {format(dateRange[dateRange.length - 1], 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="flex border-b bg-muted/30">
          <div className="w-48 flex-shrink-0 p-2 text-sm font-medium border-r">Task</div>
          <div className="flex flex-1">
            {dateRange.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 text-center py-2 text-xs border-r last:border-r-0",
                  isWeekend(day) && "bg-muted/50"
                )}
              >
                <div className="font-medium">{format(day, 'EEE')}</div>
                <div className={isSameDay(day, new Date()) ? "text-primary font-bold" : ""}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {tasksWithDates.map((task) => {
            const pos = getTaskPosition(task);
            const color = statusColors[task.status] || '#3b82f6';

            return (
              <div key={task.id} className="flex border-b last:border-b-0 hover:bg-muted/30">
                <div
                  className="w-48 flex-shrink-0 p-2 text-sm border-r cursor-pointer truncate"
                  onClick={() => onTaskClick?.(task.id)}
                >
                  {task.title}
                </div>
                <div className="flex-1 relative h-10">
                  <div
                    className="absolute h-7 top-1.5 rounded-md cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2 text-xs text-white truncate"
                    style={{
                      left: `${pos.left}%`,
                      width: `${pos.width}%`,
                      backgroundColor: color,
                    }}
                    onClick={() => onTaskClick?.(task.id)}
                    title={task.title}
                  >
                    {pos.width > 10 && task.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 text-xs">
        {Object.entries(statusColors).map(([key, color]) => (
          <span key={key} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            {key === 'in_progress' ? 'In Progress' : key === 'in_review' ? 'In Review' : key.charAt(0).toUpperCase() + key.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}