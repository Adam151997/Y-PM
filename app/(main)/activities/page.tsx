import { db } from '@/lib/db';
import { activities, projects } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';

interface ActivityWithRelations {
  id: number;
  type: string;
  description: string | null;
  projectId: number;
  taskId: number | null;
  userId: number;
  createdAt: Date;
  user?: {
    name: string;
  };
  task?: {
    id: number;
    title: string;
  };
  project?: {
    id: number;
    name: string;
  };
}

export default async function ActivitiesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  // Get user's projects
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.ownerId, user.id),
  });

  const projectIds = userProjects.map(p => p.id);

  // Get all activities across all projects
  const allActivities: ActivityWithRelations[] = [];
  for (const projectId of projectIds) {
    const projectActivities = await db.query.activities.findMany({
      where: eq(activities.projectId, projectId),
      with: {
        user: true,
        task: true,
        project: true,
      },
      orderBy: (activities, { desc }) => [desc(activities.createdAt)],
      limit: 50,
    }) as unknown as ActivityWithRelations[];
    allActivities.push(...projectActivities);
  }

  // Sort by created date and limit
  allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const displayActivities = allActivities.slice(0, 50);

  const getActivityDescription = (activity: ActivityWithRelations) => {
    switch (activity.type) {
      case 'task_created':
        return 'created a new task';
      case 'task_updated':
        return 'updated a task';
      case 'task_deleted':
        return 'deleted a task';
      case 'task_moved':
        return activity.description || 'moved a task';
      case 'task_assigned':
        return activity.description || 'assigned a task';
      case 'comment_added':
        return 'added a comment';
      case 'subtask_created':
        return 'created a subtask';
      case 'subtask_completed':
        return 'completed a subtask';
      default:
        return activity.description || 'made changes';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground mt-1">Recent activity across all your projects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {displayActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {displayActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(activity.user?.name || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name || 'Unknown'}</span>{' '}
                      <span className="text-muted-foreground">{getActivityDescription(activity)}</span>
                    </p>
                    {activity.task && (
                      <Link
                        href={`/projects/${activity.projectId}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {activity.task.title}
                      </Link>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                      {activity.project && ` in ${activity.project.name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}