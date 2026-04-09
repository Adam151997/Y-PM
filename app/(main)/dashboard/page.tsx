import { db } from '@/lib/db';
import { projects, tasks, activities } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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

  // Get project task counts
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, user.id));

  const projectTaskCounts = allProjects
    .map((project) => {
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      return {
        projectName: project.name,
        taskCount: projectTasks.length,
      };
    })
    .filter((p) => p.taskCount > 0);

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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium text-sm hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <FolderKanban className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-300 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Your Projects</CardTitle>
                <Link
                  href="/projects"
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {userProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                      <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No projects yet. Create your first project!
                    </p>
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-sm font-medium"
                    >
                      <FolderKanban className="h-4 w-4 mr-2" />
                      Create Project
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {userProjects.map((project) => {
                      const taskCount = allTasks.filter(
                        (t) => t.projectId === project.id
                      ).length;
                      const completedCount = allTasks.filter(
                        (t) => t.projectId === project.id && t.status === 'done'
                      ).length;
                      const progress =
                        taskCount > 0
                          ? Math.round((completedCount / taskCount) * 100)
                          : 0;

                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="group p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-border transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: project.color || '#6366f1' }}
                              />
                              <div>
                                <h3 className="font-medium text-sm group-hover:text-indigo-400 transition-colors">
                                  {project.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {taskCount} tasks
                                </p>
                              </div>
                            </div>
                          </div>
                          {taskCount > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Due Soon</CardTitle>
                <Link
                  href="/projects"
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-muted-foreground">
                      No tasks due in the next week. Great job!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingTasks.map((task) => {
                      const isOverdue =
                        task.dueDate && new Date(task.dueDate) < now;
                      const isDueToday =
                        task.dueDate &&
                        format(new Date(task.dueDate), 'yyyy-MM-dd') ===
                          format(now, 'yyyy-MM-dd');

                      return (
                        <Link
                          key={task.id}
                          href={`/projects/${task.projectId}`}
                          className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isOverdue
                                ? 'bg-red-500'
                                : isDueToday
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate group-hover:text-indigo-400 transition-colors">
                              {task.title}
                            </p>
                            {task.dueDate && (
                              <p
                                className={`text-xs mt-0.5 ${
                                  isOverdue
                                    ? 'text-red-400'
                                    : isDueToday
                                    ? 'text-amber-400'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {isOverdue
                                  ? 'Overdue'
                                  : isDueToday
                                  ? 'Due today'
                                  : `Due ${format(
                                      new Date(task.dueDate),
                                      'MMM d'
                                    )}`}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              task.priority === 'high'
                                ? 'border-red-500/50 text-red-400'
                                : task.priority === 'medium'
                                ? 'border-amber-500/50 text-amber-400'
                                : 'border-muted-foreground/30 text-muted-foreground'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivities.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {activity.type === 'task_created' ? (
                          <Target className="h-4 w-4 text-indigo-400" />
                        ) : activity.type === 'task_moved' ? (
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                        ) : activity.type === 'comment_added' ? (
                          <AlertCircle className="h-4 w-4 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCharts
              tasks={allTasks.map((t) => ({ status: t.status, priority: t.priority }))}
              projectTaskCounts={projectTaskCounts}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}