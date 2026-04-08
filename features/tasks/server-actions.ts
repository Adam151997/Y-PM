'use server';

import { db } from '@/lib/db';
import { tasks, activities } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from './types';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';

export async function getTasks(projectId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return db.query.tasks.findMany({
    where: and(
      eq(tasks.projectId, projectId),
      eq(tasks.isArchived, false)
    ),
    with: {
      assignee: true,
      taskLabels: {
        with: {
          label: true,
        },
      },
      subtasks: true,
    },
    orderBy: (tasks, { asc }) => [asc(tasks.order)],
  });
}

export async function getTask(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
    with: {
      assignee: true,
      taskLabels: {
        with: {
          label: true,
        },
      },
      subtasks: true,
      dependencies: {
        with: {
          dependsOnTask: true,
        },
      },
      dependentTasks: {
        with: {
          task: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
}

export async function createTask(input: CreateTaskInput) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const validation = createTaskSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const data = validation.data;
  
  // Get the max order for this status
  const existingTasks = await db.query.tasks.findMany({
    where: and(
      eq(tasks.projectId, data.projectId),
      eq(tasks.status, data.status)
    ),
  });
  
  const maxOrder = existingTasks.length > 0 
    ? Math.max(...existingTasks.map(t => t.order ?? 0)) 
    : 0;

  const [task] = await db.insert(tasks).values({
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    projectId: data.projectId,
    assigneeId: data.assigneeId,
    createdById: user.id,
    parentTaskId: data.parentTaskId || null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    order: maxOrder + 1,
  }).returning();

  // Log activity
  await db.insert(activities).values({
    projectId: data.projectId,
    taskId: task.id,
    userId: user.id,
    type: 'task_created',
    description: `Task "${task.title}" was created`,
  });

  revalidatePath(`/projects/${data.projectId}`);
  return task;
}

export async function updateTask(input: UpdateTaskInput) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const validation = updateTaskSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const { id, ...data } = validation.data;
  
  const existingTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });

  if (!existingTask) {
    throw new Error('Task not found');
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };
  
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  }

  const [task] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, id))
    .returning();

  // Log activity if status changed
  if (data.status && data.status !== existingTask.status) {
    await db.insert(activities).values({
      projectId: existingTask.projectId,
      taskId: id,
      userId: user.id,
      type: 'task_moved',
      description: `Task moved from ${existingTask.status} to ${data.status}`,
    });
  }

  // Log activity if assignee changed
  if (data.assigneeId !== undefined && data.assigneeId !== existingTask.assigneeId) {
    await db.insert(activities).values({
      projectId: existingTask.projectId,
      taskId: id,
      userId: user.id,
      type: 'task_assigned',
      description: data.assigneeId 
        ? `Task was assigned` 
        : `Task was unassigned`,
    });
  }

  revalidatePath(`/projects/${existingTask.projectId}`);
  return task;
}

export async function deleteTask(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });

  if (!task) {
    throw new Error('Task not found');
  }

  await db.delete(tasks).where(eq(tasks.id, id));
  
  await db.insert(activities).values({
    projectId: task.projectId,
    taskId: id,
    userId: user.id,
    type: 'task_deleted',
    description: `Task "${task.title}" was deleted`,
  });

  revalidatePath(`/projects/${task.projectId}`);
}

export async function moveTask(taskId: number, newStatus: string, newOrder: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Update the task status and order
  await db.update(tasks)
    .set({
      status: newStatus as any,
      order: newOrder,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));

  // Log activity
  await db.insert(activities).values({
    projectId: task.projectId,
    taskId: taskId,
    userId: user.id,
    type: 'task_moved',
    description: `Task moved to ${newStatus}`,
  });

  revalidatePath(`/projects/${task.projectId}`);
}