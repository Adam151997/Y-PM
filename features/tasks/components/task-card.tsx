'use client';

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, CheckSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getInitials, getPriorityColor } from '@/lib/utils';
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

  // Calculate subtasks completion
  const subtaskCount = 0; // Placeholder - would come from task.subtasks?.length
  const completedSubtasks = 0; // Placeholder

  // Check if overdue
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50',
        'hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200',
        'cursor-grab active:cursor-grabbing',
        isCurrentDragging && 'opacity-50 shadow-xl'
      )}
      onClick={onClick}
    >
      {/* Priority indicator */}
      <div className={cn(
        'absolute left-0 top-4 bottom-4 w-1 rounded-full',
        task.priority === 'high' && 'bg-red-500',
        task.priority === 'medium' && 'bg-amber-500',
        task.priority === 'low' && 'bg-emerald-500',
        !task.priority && 'bg-muted-foreground/30'
      )} />

      {/* Labels */}
      {taskLabels.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {taskLabels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
          {taskLabels.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              +{taskLabels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-sm text-foreground mb-2 pr-6 group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <div className="flex items-center gap-3">
          {/* Due date */}
          {task.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs',
                isOverdue && 'text-red-400',
                isDueToday && !isOverdue && 'text-amber-400',
                !isOverdue && !isDueToday && 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">
                {isOverdue ? 'Overdue' : isDueToday ? 'Today' : format(new Date(task.dueDate), 'MMM d')}
              </span>
            </div>
          )}

          {/* Subtasks count */}
          {subtaskCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>
                {completedSubtasks}/{subtaskCount}
              </span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee ? (
          <Avatar className="h-6 w-6 ring-2 ring-card">
            <AvatarImage src={task.assignee.avatar ?? undefined} />
            <AvatarFallback className="text-[10px] bg-indigo-500/20 text-indigo-400">
              {getInitials(task.assignee.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center">
            <GripVertical className="h-3 w-3 text-muted-foreground/50" />
          </div>
        )}
      </div>
    </motion.div>
  );
}