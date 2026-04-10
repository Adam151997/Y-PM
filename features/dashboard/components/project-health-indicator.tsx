'use client';

import { AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ProjectHealthIndicatorProps {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  risks?: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  milestones?: Array<{
    id: string;
    title: string;
    dueDate: string;
    progress: number;
    status: 'on-track' | 'at-risk' | 'delayed';
  }>;
  className?: string;
}

export function ProjectHealthIndicator({
  score,
  status,
  risks = [],
  milestones = [],
  className,
}: ProjectHealthIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'critical':
        return 'text-red-500 bg-red-500/10';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return 'All systems operational';
      case 'warning':
        return 'Needs attention';
      case 'critical':
        return 'Immediate action required';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const getRiskColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'text-blue-500 bg-blue-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'high':
        return 'text-red-500 bg-red-500/10';
    }
  };

  const getMilestoneColor = (milestoneStatus: 'on-track' | 'at-risk' | 'delayed') => {
    switch (milestoneStatus) {
      case 'on-track':
        return 'text-green-500';
      case 'at-risk':
        return 'text-yellow-500';
      case 'delayed':
        return 'text-red-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Health Score Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold">Project Health Score</h3>
          </div>
          <Badge className={cn('px-2 py-1', getStatusColor())}>
            {status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Score Display */}
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              <span className={getScoreColor(score)}>{score}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {getScoreLabel(score)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={score} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-sm text-muted-foreground">
            {getStatusText()}
          </div>
        </div>
      </Card>

      {/* Risks Section */}
      {risks.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Active Risks</h3>
            <Badge variant="outline">{risks.length} risks</Badge>
          </div>

          <div className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn('px-2 py-0.5 text-xs', getRiskColor(risk.severity))}
                    >
                      {risk.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">{risk.title}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
                <Separator />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Milestones Section */}
      {milestones.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Milestones</h3>
            <Badge variant="outline">
              {milestones.filter(m => m.status === 'on-track').length}/{milestones.length} on track
            </Badge>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => {
              const daysRemaining = calculateDaysRemaining(milestone.dueDate);
              const isOverdue = daysRemaining < 0;
              
              return (
                <div key={milestone.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', getMilestoneColor(milestone.status))}>
                        {milestone.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('px-2 py-0.5 text-xs', getMilestoneColor(milestone.status))}
                      >
                        {milestone.status.replace('-', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(milestone.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {isOverdue ? (
                        <span className="text-red-500">
                          Overdue by {Math.abs(daysRemaining)} days
                        </span>
                      ) : (
                        <span>
                          {daysRemaining} days remaining
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      {milestone.progress > 70 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : milestone.progress > 40 ? (
                        <Minus className="h-3 w-3 text-yellow-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span>
                        {milestone.progress > 70 ? 'Ahead' : 
                         milestone.progress > 40 ? 'On pace' : 'Behind'}
                      </span>
                    </div>
                  </div>

                  {milestone.id !== milestones[milestones.length - 1].id && (
                    <Separator />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Recommendations</h3>
        <ul className="space-y-2 text-sm">
          {score < 70 && (
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>Review project scope and resource allocation</span>
            </li>
          )}
          {risks.some(r => r.severity === 'high') && (
            <li className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Address high-priority risks immediately</span>
            </li>
          )}
          {milestones.some(m => m.status === 'delayed') && (
            <li className="flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Reassess delayed milestones and adjust timelines</span>
            </li>
          )}
          {score >= 80 && (
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Continue current practices and monitor progress</span>
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
