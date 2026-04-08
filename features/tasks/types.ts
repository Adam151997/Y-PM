import { z } from 'zod';

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  projectId: z.number(),
  assigneeId: z.number().nullable(),
  createdById: z.number(),
  parentTaskId: z.number().nullable(),
  dueDate: z.date().nullable(),
  startDate: z.date().nullable(),
  order: z.number(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignee: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
  }).nullable(),
  taskLabels: z.array(z.object({
    label: z.object({
      id: z.number(),
      name: z.string(),
      color: z.string(),
    }),
  })).nullable(),
  subtasks: z.array(z.any()).nullable(),
});

export const labelSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  color: z.string(),
  createdAt: z.date(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  projectId: z.number(),
  assigneeId: z.number().nullable().optional(),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  parentTaskId: z.number().optional(),
});

export const updateTaskSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.number().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  order: z.number().optional(),
});

export type Task = z.infer<typeof taskSchema>;
export type Label = z.infer<typeof labelSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;