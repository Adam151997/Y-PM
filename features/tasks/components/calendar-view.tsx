'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar, Plus, Filter, 
  Grid, List, Clock, Users, Flag, MoreHorizontal 
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  addMonths, subMonths, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, parseISO, differenceInDays 
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task } from '@/features/tasks/types';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (taskId: number) => void;
  onTaskCreate?: (date?: Date) => void;
  onDateClick?: (date: Date) => void;
}

const statusColors: Record<string, string> = {
  backlog: 'bg-gray-500',
  todo: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  in_review: 'bg-purple-500',
  done: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-500',
};

export function CalendarView({ tasks, onTaskClick, onTaskCreate, onDateClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get month start and end dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate calendar days
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  // Navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  // Day names
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="px-3"
            >
              <Grid className="h-4 w-4 mr-2" />
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="px-3"
            >
              <List className="h-4 w-4 mr-2" />
              Week
            </Button>
          </div>

          <Button onClick={() => onTaskCreate?.()}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg overflow-hidden bg-card">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, dayIdx) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const hasTasks = dayTasks.length > 0;

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[120px] border-r border-b p-2 transition-colors relative",
                  !isCurrentMonth && "bg-muted/20",
                  isCurrentDay && "bg-primary/5",
                  dayIdx % 7 === 6 && "border-r-0",
                  calendarDays.length - dayIdx <= 7 && "border-b-0"
                )}
                onClick={() => onDateClick?.(day)}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrentDay && "bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center",
                    !isCurrentMonth && "text-muted-foreground/50"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {hasTasks && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {dayTasks.length}
                    </Badge>
                  )}
                </div>

                {/* Tasks for the day */}
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-1.5 rounded text-xs cursor-pointer transition-all hover:scale-[1.02]",
                        "border-l-4",
                        statusColors[task.status] || 'bg-gray-500'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick?.(task.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{task.title}</span>
                        {task.priority === 'urgent' && (
                          <Flag className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center gap-1 mt-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px]">
                              {task.assignee.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>

                {/* Add task button (hover only) */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskCreate?.(day);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${color}`} />
                <span className="capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{tasks.filter(t => t.dueDate).length} tasks with dates</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {new Set(tasks.filter(t => t.assignee).map(t => t.assignee!.id)).size} assignees
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
