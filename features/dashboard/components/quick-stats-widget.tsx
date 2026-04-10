'use client';

import { TrendingUp, TrendingDown, Minus, CheckCircle, Clock, AlertCircle, Users, Folder, Target, BarChart3, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickStatsWidgetProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    activeProjects: number;
    teamMembers: number;
    completionRate: number;
    avgCompletionTime: number;
    productivityScore: number;
  };
  showTrends?: boolean;
  compact?: boolean;
  className?: string;
}

export function QuickStatsWidget({
  stats,
  showTrends = true,
  compact = false,
  className,
}: QuickStatsWidgetProps) {
  const statCards = [
    {
      id: 'total-tasks',
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-blue-500 bg-blue-500/10',
      trend: 12,
      description: 'Active tasks across all projects',
    },
    {
      id: 'completed-tasks',
      title: 'Completed',
      value: stats.completedTasks,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-500 bg-green-500/10',
      trend: 8,
      description: 'Tasks marked as done',
    },
    {
      id: 'overdue-tasks',
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-red-500 bg-red-500/10',
      trend: -3,
      description: 'Tasks past due date',
    },
    {
      id: 'active-projects',
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: <Folder className="h-4 w-4" />,
      color: 'text-purple-500 bg-purple-500/10',
      trend: 2,
      description: 'Projects in progress',
    },
    {
      id: 'team-members',
      title: 'Team Members',
      value: stats.teamMembers,
      icon: <Users className="h-4 w-4" />,
      color: 'text-orange-500 bg-orange-500/10',
      trend: 0,
      description: 'Active team members',
    },
    {
      id: 'completion-rate',
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: <Target className="h-4 w-4" />,
      color: 'text-cyan-500 bg-cyan-500/10',
      trend: 5,
      description: 'Task completion percentage',
    },
    {
      id: 'avg-completion-time',
      title: 'Avg. Time',
      value: `${stats.avgCompletionTime}d`,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-yellow-500 bg-yellow-500/10',
      trend: -1.2,
      description: 'Average days to complete',
    },
    {
      id: 'productivity-score',
      title: 'Productivity',
      value: `${stats.productivityScore}/100`,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-emerald-500 bg-emerald-500/10',
      trend: 7,
      description: 'Team productivity score',
    },
  ];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatTrend = (trend: number) => {
    if (trend > 0) return `+${trend}`;
    return trend.toString();
  };

  if (compact) {
    return (
      <div className={cn('grid grid-cols-2 gap-3', className)}>
        {statCards.slice(0, 4).map((stat) => (
          <Card key={stat.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                {stat.icon}
              </div>
              {showTrends && (
                <div className={cn('flex items-center gap-1 text-xs', getTrendColor(stat.trend))}>
                  {getTrendIcon(stat.trend)}
                  <span>{formatTrend(stat.trend)}%</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground truncate">{stat.title}</div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.slice(0, 4).map((stat) => (
          <Card key={stat.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                {stat.icon}
              </div>
              {showTrends && (
                <div className={cn('flex items-center gap-1 text-sm', getTrendColor(stat.trend))}>
                  {getTrendIcon(stat.trend)}
                  <span className="font-medium">{formatTrend(stat.trend)}%</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium">{stat.title}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Performance Metrics</h3>
          <Badge variant="outline">Last 30 days</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.slice(4).map((stat) => (
            <div key={stat.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('p-1.5 rounded', stat.color)}>
                    {stat.icon}
                  </div>
                  <span className="text-sm font-medium">{stat.title}</span>
                </div>
                {showTrends && (
                  <div className={cn('flex items-center gap-1 text-xs', getTrendColor(stat.trend))}>
                    {getTrendIcon(stat.trend)}
                    <span>{formatTrend(stat.trend)}%</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Overall Progress</div>
            <div className="text-sm text-muted-foreground">
              {stats.completedTasks}/{stats.totalTasks} tasks
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className={cn('p-1.5 rounded mt-0.5', statCards[1].color)}>
              <CheckCircle className="h-3 w-3" />
            </div>
            <div>
              <div className="text-sm font-medium">High completion rate</div>
              <div className="text-xs text-muted-foreground">
                {stats.completionRate}% of tasks completed on time
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className={cn('p-1.5 rounded mt-0.5', statCards[2].color)}>
              <AlertCircle className="h-3 w-3" />
            </div>
            <div>
              <div className="text-sm font-medium">Overdue tasks</div>
              <div className="text-xs text-muted-foreground">
                {stats.overdueTasks} tasks need immediate attention
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className={cn('p-1.5 rounded mt-0.5', statCards[7].color)}>
              <Zap className="h-3 w-3" />
            </div>
            <div>
              <div className="text-sm font-medium">Productivity score</div>
              <div className="text-xs text-muted-foreground">
                Team productivity is {stats.productivityScore >= 80 ? 'excellent' : 'good'}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
