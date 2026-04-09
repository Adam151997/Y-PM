import { db } from '@/lib/db';
import { projects, tasks, activities } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { DashboardContent } from './dashboard-content';
import { FolderKanban, CheckCircle2, Target, Zap } from 'lucide-react';

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
    .orderBy(desc(projects.updatedAt))
    .limit(6);

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
  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.assigneeId, user.id));

  const completedTasks = allTasks.filter((t) => t.status === 'done');
  const inProgressTasks = allTasks.filter((t) => t.status === 'in_progress');

  // Get recent activity
  const recentActivities = await db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(8);

  const stats = [
    {
      title: 'Total Tasks',
      value: allTasks.length,
      icon: Target,
      description: 'Assigned to you',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'In Progress',
      value: inProgressTasks.length,
      icon: Zap,
      description: 'Currently working on',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Completed',
      value: completedTasks.length,
      icon: CheckCircle2,
      description: 'Done this month',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Projects',
      value: userProjects.length,
      icon: FolderKanban,
      description: 'Your projects',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
  ];

  return (
    <DashboardContent
      stats={stats}
      userProjects={userProjects as any}
      upcomingTasks={upcomingTasks as any}
      recentActivities={recentActivities as any}
      allTasks={allTasks as any}
    />
  );
}