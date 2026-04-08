import { db } from '@/lib/db';
import { projects, tasks } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import Link from 'next/link';
import { FolderKanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Get user's projects
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, user.id))
    .limit(5);

  // Get tasks due soon
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.assigneeId, user.id),
        eq(tasks.status, 'todo'),
        gte(tasks.dueDate, now),
        lte(tasks.dueDate, nextWeek)
      )
    )
    .limit(5);

  // Get task stats
  const totalTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.assigneeId, user.id));

  const completedTasks = totalTasks.filter(t => t.status === 'done');
  const inProgressTasks = totalTasks.filter(t => t.status === 'in_progress');

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks.length,
      icon: CheckCircle2,
      description: 'Assigned to you',
    },
    {
      title: 'In Progress',
      value: inProgressTasks.length,
      icon: Clock,
      description: 'Currently working on',
    },
    {
      title: 'Completed',
      value: completedTasks.length,
      icon: CheckCircle2,
      description: 'Done this month',
    },
    {
      title: 'Projects',
      value: userProjects.length,
      icon: FolderKanban,
      description: 'Your projects',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your projects.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {userProjects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No projects yet. Create your first project!</p>
            ) : (
              <div className="space-y-3">
                {userProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <span className="font-medium">{project.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks due in the next week.</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.projectId}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(task.dueDate), 'MMM d')}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}