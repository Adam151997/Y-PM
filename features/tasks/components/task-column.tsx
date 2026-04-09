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

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-muted/30 rounded-lg p-3 transition-colors ${
        isOver ? 'bg-primary/10' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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
        className="w-full mt-2 text-muted-foreground hover:text-foreground"
        onClick={onAddTask}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add task
      </Button>
    </div>
  );
}