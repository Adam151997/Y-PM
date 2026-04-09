'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Task, Label } from '@/features/tasks/types';
import { TaskCard } from './task-card';

interface TaskColumnProps {
  status: string;
  title: string;
  tasks: Task[];
  labels: Label[];
  onAddTask: () => void;
  onTaskClick?: (taskId: number) => void;
}

export function TaskColumn({ status, title, tasks, labels, onAddTask, onTaskClick }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Get status color
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'todo': return 'bg-slate-500';
      case 'in_progress': return 'bg-amber-500';
      case 'in_review': return 'bg-indigo-500';
      case 'done': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-card/40 backdrop-blur-sm rounded-xl border border-border/30 p-3 transition-all ${
        isOver ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`} />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-2 min-h-[100px]">
        <SortableContext items={tasks.map((t) => t.id.toString())} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} labels={labels} onClick={onTaskClick ? () => onTaskClick(task.id) : undefined} />
          ))}
        </SortableContext>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
        onClick={onAddTask}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add task
      </Button>
    </div>
  );
}