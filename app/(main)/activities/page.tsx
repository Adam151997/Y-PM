import { db } from '@/lib/db';
import { activities, projects } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { Activity as ActivityIcon } from 'lucide-react';

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
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground mt-1">Recent activity across all your projects</p>
        </div>
      </div>

      <div className="relative">
        {/* Glassmorphic card */}
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl" />
        
        <div className="relative z-10">
          <div className="p-6 border-b border-border/30">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          
          <div className="p-6">
            {displayActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <ActivityIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {displayActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start gap-4 py-4 ${
                      index !== displayActivities.length - 1 ? 'border-b border-border/30' : ''
                    } hover:bg-secondary/20 -mx-4 px-4 rounded-lg transition-colors`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-violet-600">
                        <AvatarFallback className="text-white font-medium">
                          {getInitials(activity.user?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      {/* Timeline dot */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                        activity.type === 'task_created' ? 'bg-emerald-500' :
                        activity.type === 'task_moved' ? 'bg-amber-500' :
                        activity.type === 'comment_added' ? 'bg-indigo-500' :
                        'bg-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user?.name || 'Unknown'}</span>{' '}
                        <span className="text-muted-foreground">{getActivityDescription(activity)}</span>
                      </p>
                      {activity.task && (
                        <Link
                          href={`/projects/${activity.projectId}`}
                          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
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
          </div>
        </div>
      </div>
    </div>
  );
}