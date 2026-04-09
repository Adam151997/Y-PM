import { db } from '@/lib/db';
import { projects, tasks, labels, activities } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { ProjectBoard } from '@/features/tasks/components/project-board';
import { TaskListView } from '@/features/tasks/components/task-list-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Settings, ArrowLeft, LayoutGrid, List } from 'lucide-react';

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
      subtasks: true,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color || '#6366f1' }}
              />
              <h1 className="text-3xl font-bold">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href={`/projects/${projectId}/tasks/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <ProjectBoard
            projectId={projectId}
            initialTasks={projectTasks as any}
            labels={projectLabels as any}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="list">
          <TaskListView
            projectId={projectId}
            userId={user.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
