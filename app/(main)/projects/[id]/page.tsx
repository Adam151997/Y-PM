import { db } from '@/lib/db';
import { projects, tasks, labels, activities } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { ProjectDetailClient } from './project-detail-client';
import { ProjectHeader } from './project-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, LayoutGrid, List } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const projectId = parseInt(id);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    redirect('/projects');
  }

  // Get tasks for this project
  const projectTasks = await db.query.tasks.findMany({
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

  // Get labels for this project
  const projectLabels = await db.query.labels.findMany({
    where: eq(labels.projectId, projectId),
  });

  // Get recent activities for this project
  const recentActivities = await db.query.activities.findMany({
    where: eq(activities.projectId, projectId),
    with: {
      user: true,
      task: true,
    },
    orderBy: (activities, { desc }) => [desc(activities.createdAt)],
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <ProjectHeader 
        projectId={projectId} 
        projectName={project.name} 
        projectColor={project.color || '#6366f1'}
      />

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList className="bg-secondary/50 p-1 h-auto gap-1">
          <TabsTrigger 
            value="board" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger 
            value="list" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white transition-all"
          >
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <ProjectDetailClient
            projectId={projectId}
            initialTasks={projectTasks as any}
            labels={projectLabels as any}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="list">
          <ProjectDetailClient
            projectId={projectId}
            initialTasks={projectTasks as any}
            labels={projectLabels as any}
            userId={user.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
