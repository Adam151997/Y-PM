'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ArrowDown, ArrowUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task, Label } from '@/features/tasks/types';
import { TaskCard } from './task-card';

interface EnhancedTaskColumnProps {
  status: string;
  title: string;
  tasks: Task[];
  labels: Label[];
  onAddTask: () => void;
  onTaskClick?: (taskId: number) => void;
  dropIndicator?: 'top' | 'bottom' | 'middle' | null;
  isDragging?: boolean;
}

export function EnhancedTaskColumn({ 
  status, 
  title, 
  tasks, 
  labels, 
  onAddTask, 
  onTaskClick,
  dropIndicator,
  isDragging = false
}: EnhancedTaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Get status color
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'backlog': return 'bg-slate-500';
      case 'todo': return 'bg-blue-500';
      case 'in_progress': return 'bg-amber-500';
      case 'in_review': return 'bg-indigo-500';
      case 'done': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  // Get status gradient
  const getStatusGradient = (s: string) => {
    switch (s) {
      case 'backlog': return 'from-slate-500/20 to-slate-500/5';
      case 'todo': return 'from-blue-500/20 to-blue-500/5';
      case 'in_progress': return 'from-amber-500/20 to-amber-500/5';
      case 'in_review': return 'from-indigo-500/20 to-indigo-500/5';
      case 'done': return 'from-emerald-500/20 to-emerald-500/5';
      default: return 'from-slate-500/20 to-slate-500/5';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-72 rounded-xl border-2 p-3 transition-all duration-300 relative",
        `bg-gradient-to-b ${getStatusGradient(status)}`,
        isOver ? "border-primary/50 shadow-xl shadow-primary/10" : "border-border/30",
        isDragging && "scale-[1.02]",
        dropIndicator === 'middle' && "border-primary border-dashed animate-pulse"
      )}
    >
      {/* Drop indicator for top position */}
      {dropIndicator === 'top' && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-lg">
                <ArrowDown className="h-3 w-3" />
                <span className="text-xs font-medium">Drop here</span>
              </div>
            </div>
            <div className="h-1 bg-primary rounded-full mx-2" />
          </div>
        </div>
      )}

      {/* Drop indicator for bottom position */}
      {dropIndicator === 'bottom' && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="relative">
            <div className="h-1 bg-primary rounded-full mx-2" />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-lg">
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs font-medium">Drop here</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-300",
            getStatusColor(status),
            isOver && "scale-125"
          )} />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full transition-all duration-300",
            isOver ? "bg-primary/20 text-primary" : "bg-secondary/50 text-muted-foreground"
          )}>
            {tasks.length}
          </span>
          {isOver && (
            <Check className="h-3 w-3 text-primary animate-pulse" />
          )}
        </div>
      </div>
      
      {/* Tasks list */}
      <div className="space-y-2 min-h-[100px] relative">
        <SortableContext items={tasks.map((t) => t.id.toString())} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <div key={task.id} className="relative">
              {/* Task drop indicator above */}
              {dropIndicator === 'top' && index === 0 && (
                <div className="absolute -top-1 left-0 right-0 z-10">
                  <div className="h-1 bg-primary rounded-full mx-4" />
                </div>
              )}
              
              <TaskCard 
                task={task} 
                labels={labels} 
                onClick={onTaskClick ? () => onTaskClick(task.id) : undefined}
              />
              
              {/* Task drop indicator below */}
              {dropIndicator === 'bottom' && index === tasks.length - 1 && (
                <div className="absolute -bottom-1 left-0 right-0 z-10">
                  <div className="h-1 bg-primary rounded-full mx-4" />
                </div>
              )}
            </div>
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className={cn(
            "flex flex-col items-center justify-center py-8 rounded-lg border-2 border-dashed transition-all duration-300",
            isOver ? "border-primary/30 bg-primary/5" : "border-border/20"
          )}>
            <div className="text-center">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300",
                isOver ? "bg-primary/10" : "bg-secondary/30"
              )}>
                <Plus className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isOver ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <p className={cn(
                "text-sm font-medium mb-1 transition-all duration-300",
                isOver ? "text-primary" : "text-muted-foreground"
              )}>
                {isOver ? "Drop task here" : "No tasks"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOver ? "Release to add to this column" : "Add your first task"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add task button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full mt-2 rounded-lg transition-all duration-300",
          "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          isOver && "bg-primary/10 text-primary hover:bg-primary/20"
        )}
        onClick={onAddTask}
      >
        <Plus className={cn(
          "h-4 w-4 mr-1 transition-all duration-300",
          isOver && "scale-110"
        )} />
        Add task
      </Button>
    </div>
  );
}
