'use server';

import { db } from '@/lib/db';
import { projects, projectMembers } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createProjectSchema, updateProjectSchema, type CreateProjectInput, type UpdateProjectInput } from './types';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function getProjects() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return db.select().from(projects).where(eq(projects.ownerId, user.id)).orderBy(projects.createdAt);
}

export async function getProject(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}

export async function createProject(input: CreateProjectInput) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const validation = createProjectSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const [project] = await db.insert(projects).values({
    name: validation.data.name,
    description: validation.data.description,
    color: validation.data.color,
    ownerId: user.id,
  }).returning();

  // Add owner as project member
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId: user.id,
    role: 'owner',
  });

  revalidatePath('/projects');
  return project;
}

export async function updateProject(input: UpdateProjectInput) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const validation = updateProjectSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const { id, ...data } = validation.data;

  const [project] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  revalidatePath('/projects');
  revalidatePath(`/projects/${id}`);
  return project;
}

export async function deleteProject(id: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath('/projects');
}