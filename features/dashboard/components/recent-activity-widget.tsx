'use client';

import { useState } from 'react';
import { 
  CheckCircle, MessageSquare, FileText, UserPlus, 
  AlertCircle, GitBranch, Clock, MoreVertical,
  ThumbsUp, Share2, Download, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface RecentActivityWidgetProps {
  activities: Array<{
    id: string;
    type: 'task_created' | 'task_updated' | 'comment_added' | 'file_uploaded' | 'status_changed' | 'user_joined' | 'milestone_reached';
    user: {
      id: string;
      name: string;
      avatar?: string;
      role?: string;
    };
    description: string;
    timestamp: string;
    metadata?: {
      taskId?: string;
      projectId?: string;
      fileName?: string;
      oldStatus?: string;
      newStatus?: string;
    };
  }>;
  limit?: number;
  showAvatars?: boolean;
  className?: string;
}

export function RecentActivityWidget({
  activities,
  limit = 10,
  showAvatars = true,
  className,
}: RecentActivityWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredActivities = filter
    ? activities.filter(activity => activity.type === filter)
    : activities;

  const displayedActivities = expanded
    ? filteredActivities
    : filteredActivities.slice(0, limit);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'task_updated':
        return <GitBranch className="h-4 w-4 text-purple-500" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'file_uploaded':
        return <Download className="h-4 w-4 text-orange-500" />;
      case 'status_changed':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-cyan-500" />;
      case 'milestone_reached':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_created':
        return 'bg-blue-500/10 text-blue-500';
      case 'task_updated':
        return 'bg-purple-500/10 text-purple-500';
      case 'comment_added':
        return 'bg-green-500/10 text-green-500';
      case 'file_uploaded':
        return 'bg-orange-500/10 text-orange-500';
      case 'status_changed':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'user_joined':
        return 'bg-cyan-500/10 text-cyan-500';
      case 'milestone_reached':
        return 'bg-emerald-500/10 text-emerald-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return activityTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const activityTypes = [
    { id: 'all', label: 'All', count: activities.length },
    { id: 'task_created', label: 'Tasks', count: activities.filter(a => a.type === 'task_created').length },
    { id: 'comment_added', label: 'Comments', count: activities.filter(a => a.type === 'comment_added').length },
    { id: 'status_changed', label: 'Updates', count: activities.filter(a => a.type === 'status_changed').length },
    { id: 'file_uploaded', label: 'Files', count: activities.filter(a => a.type === 'file_uploaded').length },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Recent Activity</h3>
          <Badge variant="outline">{activities.length} activities</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show All'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {activityTypes.map((type) => (
          <Button
            key={type.id}
            variant={filter === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type.id === 'all' ? null : type.id)}
            className="relative"
          >
            {type.label}
            {type.count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 min-w-5 px-1 text-xs"
              >
                {type.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {displayedActivities.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-1">No activities found</h4>
            <p className="text-sm text-muted-foreground">
              {filter ? `No ${filter.replace('_', ' ')} activities` : 'No recent activities'}
            </p>
          </Card>
        ) : (
          displayedActivities.map((activity, index) => (
            <Card key={activity.id} className="p-4">
              <div className="flex gap-3">
                {/* Avatar */}
                {showAvatars && (
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.user.name}</span>
                        {activity.user.role && (
                          <Badge variant="outline" className="text-xs">
                            {activity.user.role}
                          </Badge>
                        )}
                        <div className={cn('p-1 rounded', getActivityColor(activity.type))}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getActivityTypeLabel(activity.type)}
                        </span>
                      </div>
                      <p className="text-sm">{activity.description}</p>
                      
                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activity.metadata.taskId && (
                            <Badge variant="secondary" className="text-xs">
                              Task: {activity.metadata.taskId}
                            </Badge>
                          )}
                          {activity.metadata.projectId && (
                            <Badge variant="secondary" className="text-xs">
                              Project: {activity.metadata.projectId}
                            </Badge>
                          )}
                          {activity.metadata.fileName && (
                            <Badge variant="secondary" className="text-xs">
                              File: {activity.metadata.fileName}
                            </Badge>
                          )}
                          {activity.metadata.oldStatus && activity.metadata.newStatus && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.metadata.oldStatus} → {activity.metadata.newStatus}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm" className="h-7">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>

              {/* Separator (except for last item) */}
              {index < displayedActivities.length - 1 && (
                <Separator className="mt-4" />
              )}
            </Card>
          ))
        )}
      </div>

      {/* Show More/Less */}
      {activities.length > limit && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className="w-full"
          >
            {expanded ? 'Show Less' : `Show ${activities.length - limit} More Activities`}
          </Button>
        </div>
      )}

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {activities.filter(a => a.type === 'task_created').length}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {activities.filter(a => a.type === 'comment_added').length}
            </div>
            <div className="text-sm text-muted-foreground">Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {activities.filter(a => a.type === 'file_uploaded').length}
            </div>
            <div className="text-sm text-muted-foreground">Files Uploaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {new Set(activities.map(a => a.user.id)).size}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
