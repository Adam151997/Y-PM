'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragCancelEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STATUS_ORDER, STATUS_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Task, Label } from '@/features/tasks/types';
import { TaskCard } from './task-card';
import { EnhancedTaskColumn } from './enhanced-task-column';
import { CreateTaskDialog } from './create-task-dialog';

interface EnhancedKanbanBoardProps {
  projectId: number;
  initialTasks: Task[];
  labels: Label[];
  userId: number;
  onTaskClick?: (taskId: number) => void;
  onCreateClick?: () => void;
}

export function EnhancedKanbanBoard({ projectId, initialTasks, labels, userId, onTaskClick, onCreateClick }: EnhancedKanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<string>('todo');
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{ status: string; position: 'top' | 'bottom' | 'middle' } | null>(null);
  const [dragSuccess, setDragSuccess] = useState(false);
  const [dragCanceled, setDragCanceled] = useState(false);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced for more responsive dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const measuringConfig = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, newStatus, newOrder }: { taskId: number; newStatus: string; newOrder: number }) => {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, order: newOrder }),
      });
      if (!res.ok) throw new Error('Failed to move task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setDragSuccess(true);
      // Reset success state after animation
      setTimeout(() => setDragSuccess(false), 1500);
    },
  });

  const getTasksByStatus = useCallback(
    (status: string) => {
      return tasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order);
    },
    [tasks]
  );

  const findTask = useCallback((id: string) => {
    return tasks.find((task) => task.id.toString() === id);
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTask(active.id as string);
    if (task) {
      setActiveTask(task);
      setIsDragging(true);
      setDropIndicator(null);
      setDragCanceled(false);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setDropIndicator(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = findTask(activeId);
    if (!activeTask) return;

    // If over is a column (status)
    if (STATUS_ORDER.includes(overId)) {
      setDropIndicator({ status: overId, position: 'middle' });
      
      if (activeTask.status !== overId) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id.toString() === activeId
              ? { ...task, status: overId as Task['status'] }
              : task
          )
        );
      }
      return;
    }

    // If over is another task
    const overTask = findTask(overId);
    if (overTask) {
      // Determine drop position (above or below)
      const rect = over.rect;
      const clientY = event.clientY;
      const relativeY = clientY - rect.top;
      const position = relativeY < rect.height / 2 ? 'top' : 'bottom';
      
      setDropIndicator({ status: overTask.status, position });
      
      if (activeTask.status !== overTask.status) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id.toString() === activeId
              ? { ...task, status: overTask.status }
              : task
          )
        );
      }
    }
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    setIsDragging(false);
    setActiveTask(null);
    setDropIndicator(null);
    setDragCanceled(true);
    setTimeout(() => setDragCanceled(false), 1000);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveTask(null);
    setDropIndicator(null);

    if (!over) {
      setDragCanceled(true);
      setTimeout(() => setDragCanceled(false), 1000);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = findTask(activeId);
    if (!activeTask) return;

    // If dropped on a column
    if (STATUS_ORDER.includes(overId)) {
      const statusTasks = getTasksByStatus(overId);
      moveTaskMutation.mutate({
        taskId: activeTask.id,
        newStatus: overId,
        newOrder: statusTasks.length,
      });
      return;
    }

    // If dropped on another task
    const overTask = findTask(overId);
    if (overTask) {
      const statusTasks = getTasksByStatus(activeTask.status);
      const oldIndex = statusTasks.findIndex((t) => t.id === activeTask.id);
      const newIndex = statusTasks.findIndex((t) => t.id === overTask.id);

      if (oldIndex !== newIndex) {
        const newTasks = arrayMove(statusTasks, oldIndex, newIndex).map((t, i) => ({
          ...t,
          order: i,
        }));
        
        setTasks((prev) => [
          ...prev.filter((t) => t.status !== activeTask.status),
          ...newTasks,
        ]);

        moveTaskMutation.mutate({
          taskId: activeTask.id,
          newStatus: activeTask.status,
          newOrder: newIndex,
        });
      }
    }
  };

  const handleAddTask = (status: string) => {
    setCreateTaskStatus(status);
    if (onCreateClick) {
      onCreateClick();
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  };

  // Add keyboard shortcut for cancelling drag
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        // Cancel drag
        setIsDragging(false);
        setActiveTask(null);
        setDropIndicator(null);
        setDragCanceled(true);
        setTimeout(() => setDragCanceled(false), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDragging]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        measuring={measuringConfig}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="relative">
          {/* Success animation */}
          {dragSuccess && (
            <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
              <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Task moved successfully</span>
                <Sparkles className="h-3 w-3 animate-pulse" />
              </div>
            </div>
          )}

          {/* Cancel animation */}
          {dragCanceled && (
            <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
              <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Drag cancelled</span>
              </div>
            </div>
          )}

          {/* Drag instructions */}
          {isDragging && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                <ArrowRight className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">Drag to move task</span>
                <kbd className="ml-2 text-xs px-2 py-1 bg-primary-foreground/20 rounded">ESC</kbd>
                <span className="text-xs opacity-75">to cancel</span>
              </div>
            </div>
          )}

          <div className={cn(
            "flex gap-4 overflow-x-auto pb-4 min-h-[500px] transition-all duration-300",
            isDragging && "bg-gradient-to-b from-primary/5 to-transparent"
          )}>
            {STATUS_ORDER.filter((status) => status !== 'cancelled').map((status) => (
              <SortableContext
                key={status}
                items={getTasksByStatus(status).map((t) => t.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <EnhancedTaskColumn
                  status={status}
                  title={STATUS_LABELS[status]}
                  tasks={getTasksByStatus(status)}
                  labels={labels}
                  onAddTask={() => handleAddTask(status)}
                  onTaskClick={onTaskClick}
                  dropIndicator={dropIndicator?.status === status ? dropIndicator.position : null}
                  isDragging={isDragging}
                />
              </SortableContext>
            ))}
          </div>
          
          <DragOverlay dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeTask && (
              <div className="transform rotate-1 scale-105 transition-transform">
                <TaskCard
                  task={activeTask}
                  labels={labels}
                  isDragging
                />
              </div>
            )}
          </DragOverlay>
        </div>
      </DndContext>
    </>
  );
}
