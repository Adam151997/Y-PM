import { z } from 'zod';

export const projectSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().default('#6366f1'),
  ownerId: z.number(),
  isArchived: z.boolean().default(false),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  color: z.string().optional().default('#6366f1'),
});

export const updateProjectSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;