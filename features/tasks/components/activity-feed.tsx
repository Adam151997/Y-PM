'use client';

import { useState } from 'react';
import { 
  MessageSquare, Edit2, User, Tag, Flag, 
  Calendar, Paperclip, Link2, CheckCircle, 
  XCircle, Clock, Plus, Trash2, Eye,
  GitBranch, GitPullRequest, AlertCircle,
  Sparkles, Zap, Heart, ThumbsUp
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ActivityItem {
  id: number;
  type: 'comment' | 'update' | 'attachment' | 'status_change' | 'creation' | 'dependency';
  user: {
    id: number;
    name: string;
    avatar?: string;
    color?: string;
  };
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: number[];
  }>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  currentUserId: number;
  onReact?: (activityId: number, emoji: string) => void;
  onReply?: (activityId: number) => void;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

const activityIcons = {
  comment: MessageSquare,
  update: Edit2,
  attachment: Paperclip,
  status_change: CheckCircle,
  creation: Plus,
  dependency: Link2,
};

const activityColors = {
  comment: 'text-blue-500 bg-blue-500/10',
  update: 'text-amber-500 bg-amber-500/10',
  attachment: 'text-emerald-500 bg-emerald-500/10',
  status_change: 'text-purple-500 bg-purple-500/10',
  creation: 'text-green-500 bg-green-500/10',
  dependency: 'text-indigo-500 bg-indigo-500/10',
};

const reactionEmojis = ['👍', '❤️', '🎉', '🚀', '👀', '💯'];

export function ActivityFeed({
  activities,
  currentUserId,
  onReact,
  onReply,
  className,
  showHeader = true,
  compact = false,
}: ActivityFeedProps) {
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  const formatContent = (activity: ActivityItem) => {
    if (activity.type === 'status_change') {
      const { from, to } = activity.metadata || {};
      return `changed status from "${from}" to "${to}"`;
    }
    if (activity.type === 'update') {
      const { field, from, to } = activity.metadata || {};
      return `updated ${field} from "${from}" to "${to}"`;
    }
    if (activity.type === 'attachment') {
      const { fileName, fileType } = activity.metadata || {};
      return `uploaded ${fileName}`;
    }
    if (activity.type === 'dependency') {
      const { action, taskTitle } = activity.metadata || {};
      return `${action} dependency: "${taskTitle}"`;
    }
    return activity.content;
  };

  const getActivityIcon = (activity: ActivityItem) => {
    const Icon = activityIcons[activity.type];
    return <Icon className="h-4 w-4" />;
  };

  const handleReact = (activityId: number, emoji: string) => {
    onReact?.(activityId, emoji);
  };

  const handleReply = (activityId: number) => {
    onReply?.(activityId);
  };

  const toggleExpand = (activityId: number) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Activity</h3>
            <Badge variant="outline" className="ml-2">
              {activities.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Highlights
            </Button>
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/50" />

        {/* Activities */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const isExpanded = expandedActivity === activity.id;
            const hasReactions = activity.reactions && activity.reactions.length > 0;

            return (
              <div key={activity.id} className="relative">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-6 transform -translate-x-1/2 z-10",
                  "flex items-center justify-center",
                  "h-6 w-6 rounded-full border-2 border-background",
                  activityColors[activity.type]
                )}>
                  {getActivityIcon(activity)}
                </div>

                {/* Activity card */}
                <Card className={cn(
                  "ml-12 overflow-hidden transition-all duration-200",
                  compact ? "p-3" : "p-4",
                  isExpanded && "ring-2 ring-primary/20"
                )}>
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className={cn(
                      "border-2",
                      compact ? "h-8 w-8" : "h-10 w-10"
                    )}>
                      <AvatarFallback 
                        className="text-xs font-semibold"
                        style={activity.user.color ? { backgroundColor: activity.user.color } : {}}
                      >
                        {activity.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "font-semibold",
                            compact ? "text-sm" : "text-base"
                          )}>
                            {activity.user.name}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "capitalize",
                              compact ? "text-xs h-5" : "text-sm"
                            )}
                          >
                            {activity.type.replace('_', ' ')}
                          </Badge>
                          <span className={cn(
                            "text-muted-foreground",
                            compact ? "text-xs" : "text-sm"
                          )}>
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </span>
                        </div>

                        {/* Actions */}
                        {!compact && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleExpand(activity.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <p className={cn(
                        "mt-2",
                        compact ? "text-sm" : "text-base",
                        activity.type === 'comment' ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {formatContent(activity)}
                      </p>

                      {/* Metadata */}
                      {activity.metadata && !compact && (
                        <div className="mt-3 space-y-2">
                          {activity.metadata.fileName && (
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{activity.metadata.fileName}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {activity.metadata.fileType}
                              </Badge>
                            </div>
                          )}

                          {activity.metadata.from && activity.metadata.to && (
                            <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                              <div className="flex-1 text-center">
                                <div className="text-xs text-muted-foreground">From</div>
                                <div className="font-medium">{activity.metadata.from}</div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 text-center">
                                <div className="text-xs text-muted-foreground">To</div>
                                <div className="font-medium">{activity.metadata.to}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reactions */}
                      {hasReactions && (
                        <div className="mt-3 flex items-center gap-2">
                          {activity.reactions!.map((reaction) => (
                            <Button
                              key={reaction.emoji}
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-7 gap-1",
                                reaction.users.includes(currentUserId) && "border-primary bg-primary/10"
                              )}
                              onClick={() => handleReact(activity.id, reaction.emoji)}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-xs">{reaction.count}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {!compact && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {reactionEmojis.map((emoji) => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleReact(activity.id, emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>

                          <Separator orientation="vertical" className="h-4" />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(activity.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded view */}
                  {isExpanded && activity.type === 'comment' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <textarea
                            placeholder="Write a reply..."
                            className="w-full min-h-[80px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <div className="mt-2 flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                            <Button size="sm">
                              Post Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {activities.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No activity yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              When someone comments, updates, or attaches files to this task, it will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Load more */}
      {activities.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            Load more activity
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper component for arrow
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
