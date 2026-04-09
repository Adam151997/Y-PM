'use client';

import { useState, useCallback } from 'react';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STATUS_ORDER, STATUS_LABELS } from '@/lib/utils';
import type { Task, Label } from '@/features/tasks/types';
import { TaskCard } from './task-card';
import { TaskColumn } from './task-column';
import { CreateTaskDialog } from './create-task-dialog';

interface ProjectBoardProps {
  projectId: number;
  initialTasks: Task[];
  labels: Label[];
  userId: number;
  onTaskClick?: (taskId: number) => void;
}

export function ProjectBoard({ projectId, initialTasks, labels, userId, onTaskClick }: ProjectBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<string>('todo');
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = findTask(activeId);
    const overTask = findTask(overId);

    if (!activeTask) return;

    // If over is a column (status)
    if (STATUS_ORDER.includes(overId)) {
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
    if (overTask && activeTask.status !== overTask.status) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id.toString() === activeId
            ? { ...task, status: overTask.status }
            : task
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

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
    setIsCreateDialogOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {STATUS_ORDER.filter((status) => status !== 'cancelled').map((status) => (
            <SortableContext
              key={status}
              items={getTasksByStatus(status).map((t) => t.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <TaskColumn
                status={status}
                title={STATUS_LABELS[status]}
                tasks={getTasksByStatus(status)}
                labels={labels}
                onAddTask={() => handleAddTask(status)}
                onTaskClick={onTaskClick}
              />
            </SortableContext>
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              labels={labels}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        projectId={projectId}
        defaultStatus={createTaskStatus}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleTaskCreated}
      />
    </>
  );
}