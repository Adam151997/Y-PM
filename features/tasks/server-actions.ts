'use server';

import { db } from '@/lib/db';
import { tasks, activities, comments, taskDependencies } from '@/db/schema';
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

export async function updateTaskTask(input: UpdateTaskInput) {
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

// Update task - for the detail dialog
export async function updateTask(taskId: number, updates: Record<string, any>) {
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

  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date(),
  };

  // Handle date fields
  if (updates.dueDate !== undefined) {
    updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  }
  if (updates.startDate !== undefined) {
    updateData.startDate = updates.startDate ? new Date(updates.startDate) : null;
  }

  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId))
    .returning();

  // Log activity for status changes
  if (updates.status && updates.status !== task.status) {
    await db.insert(activities).values({
      projectId: task.projectId,
      taskId,
      userId: user.id,
      type: 'task_updated',
      description: `Status changed to ${updates.status}`,
    });
  }

  revalidatePath(`/projects/${task.projectId}`);
  return updated;
}

// Get detailed task with all relations
export async function getTaskDetails(taskId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      assignee: true,
      createdBy: true,
      taskLabels: {
        with: {
          label: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
}

// Get comments for a task
export async function getTaskComments(taskId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return db.query.comments.findMany({
    where: and(
      eq(comments.taskId, taskId),
      eq(comments.status, 'active')
    ),
    with: {
      user: true,
    },
    orderBy: (comments, { asc }) => [asc(comments.createdAt)],
  });
}

// Add a comment to a task
export async function addComment(taskId: number, content: string) {
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

  const [comment] = await db
    .insert(comments)
    .values({
      taskId,
      userId: user.id,
      content,
    })
    .returning();

  // Log activity
  await db.insert(activities).values({
    projectId: task.projectId,
    taskId,
    userId: user.id,
    type: 'comment_added',
    description: 'Comment added to task',
  });

  revalidatePath(`/projects/${task.projectId}`);
  return comment;
}

// Add a dependency to a task
export async function addDependency(taskId: number, dependsOnTaskId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify both tasks exist
  const [task, dependsOnTask] = await Promise.all([
    db.query.tasks.findFirst({ where: eq(tasks.id, taskId) }),
    db.query.tasks.findFirst({ where: eq(tasks.id, dependsOnTaskId) }),
  ]);

  if (!task) {
    throw new Error('Task not found');
  }

  if (!dependsOnTask) {
    throw new Error('Dependency task not found');
  }

  if (taskId === dependsOnTaskId) {
    throw new Error('A task cannot depend on itself');
  }

  // Check if dependency already exists
  const existing = await db.query.taskDependencies.findFirst({
    where: and(
      eq(taskDependencies.taskId, taskId),
      eq(taskDependencies.dependsOnTaskId, dependsOnTaskId)
    ),
  });

  if (existing) {
    throw new Error('Dependency already exists');
  }

  const [dependency] = await db
    .insert(taskDependencies)
    .values({
      taskId,
      dependsOnTaskId,
    })
    .returning();

  // Log activity
  await db.insert(activities).values({
    projectId: task.projectId,
    taskId,
    userId: user.id,
    type: 'dependency_added',
    description: `Added dependency on "${dependsOnTask.title}"`,
  });

  revalidatePath(`/projects/${task.projectId}`);
  return dependency;
}

// Remove a dependency from a task
export async function removeDependency(dependencyId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const dependency = await db.query.taskDependencies.findFirst({
    where: eq(taskDependencies.id, dependencyId),
    with: {
      task: true,
    },
  });

  if (!dependency) {
    throw new Error('Dependency not found');
  }

  const taskTitle = (dependency as any).task?.title || `Task #${dependency.taskId}`;

  await db.delete(taskDependencies).where(eq(taskDependencies.id, dependencyId));

  // Log activity
  await db.insert(activities).values({
    projectId: (dependency as any).task?.projectId,
    taskId: dependency.taskId,
    userId: user.id,
    type: 'dependency_removed',
    description: `Removed dependency on "${taskTitle}"`,
  });

  revalidatePath(`/projects/${(dependency as any).task?.projectId}`);
  return { success: true };
}