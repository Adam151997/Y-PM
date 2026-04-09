'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, getPriorityColor, STATUS_LABELS } from '@/lib/utils';
import type { Task, Label } from '@/features/tasks/types';

interface TaskCardProps {
  task: Task;
  labels: Label[];
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, labels, isDragging, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskLabels = task.taskLabels?.map((tl) => tl.label) || [];
  const isCurrentDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card rounded-lg p-3 shadow-sm border border-border hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing ${
        isCurrentDragging ? 'opacity-50' : ''
      }`}
    >
      {taskLabels.length > 0 && (
        <div className="flex gap-1 mb-2 flex-wrap">
          {taskLabels.map((label) => (
            <span
              key={label.id}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: label.color + '20', color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <h4 className="font-medium text-sm mb-2">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
          )}
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {getInitials(task.assignee.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}