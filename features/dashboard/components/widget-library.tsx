'use client';

import { 
  LayoutGrid, BarChart3, PieChart, LineChart, 
  Users, Folder, Target, Zap, Clock, AlertCircle,
  CheckCircle, MessageSquare, FileText, TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface WidgetLibraryProps {
  onWidgetSelect: (widgetType: string) => void;
  className?: string;
}

const widgetTemplates = [
  {
    id: 'quick-stats',
    name: 'Quick Stats',
    description: 'Key metrics and performance indicators',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'metrics',
    size: 'medium',
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: 'project-health',
    name: 'Project Health',
    description: 'Project status, risks, and milestones',
    icon: <Target className="h-5 w-5" />,
    category: 'project',
    size: 'medium',
    color: 'text-green-500 bg-green-500/10',
  },
  {
    id: 'task-distribution',
    name: 'Task Distribution',
    description: 'Tasks by status, priority, and assignee',
    icon: <PieChart className="h-5 w-5" />,
    category: 'tasks',
    size: 'large',
    color: 'text-purple-500 bg-purple-500/10',
  },
  {
    id: 'recent-activity',
    name: 'Recent Activity',
    description: 'Team activity feed and updates',
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'team',
    size: 'large',
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    id: 'completion-trend',
    name: 'Completion Trend',
    description: 'Task completion trends over time',
    icon: <LineChart className="h-5 w-5" />,
    category: 'analytics',
    size: 'extra-large',
    color: 'text-cyan-500 bg-cyan-500/10',
  },
  {
    id: 'team-overview',
    name: 'Team Overview',
    description: 'Team members and their workload',
    icon: <Users className="h-5 w-5" />,
    category: 'team',
    size: 'medium',
    color: 'text-pink-500 bg-pink-500/10',
  },
  {
    id: 'project-overview',
    name: 'Project Overview',
    description: 'Active projects and their status',
    icon: <Folder className="h-5 w-5" />,
    category: 'project',
    size: 'medium',
    color: 'text-indigo-500 bg-indigo-500/10',
  },
  {
    id: 'productivity-metrics',
    name: 'Productivity Metrics',
    description: 'Team and individual productivity',
    icon: <Zap className="h-5 w-5" />,
    category: 'metrics',
    size: 'medium',
    color: 'text-yellow-500 bg-yellow-500/10',
  },
  {
    id: 'overdue-tasks',
    name: 'Overdue Tasks',
    description: 'Tasks that need immediate attention',
    icon: <AlertCircle className="h-5 w-5" />,
    category: 'tasks',
    size: 'small',
    color: 'text-red-500 bg-red-500/10',
  },
  {
    id: 'completion-rate',
    name: 'Completion Rate',
    description: 'Task completion percentage and trends',
    icon: <CheckCircle className="h-5 w-5" />,
    category: 'metrics',
    size: 'small',
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    id: 'file-activity',
    name: 'File Activity',
    description: 'Recent file uploads and downloads',
    icon: <FileText className="h-5 w-5" />,
    category: 'team',
    size: 'small',
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    id: 'performance-trends',
    name: 'Performance Trends',
    description: 'Performance metrics over time',
    icon: <TrendingUp className="h-5 w-5" />,
    category: 'analytics',
    size: 'large',
    color: 'text-rose-500 bg-rose-500/10',
  },
];

const categories = [
  { id: 'all', name: 'All Widgets', count: widgetTemplates.length },
  { id: 'metrics', name: 'Metrics', count: widgetTemplates.filter(w => w.category === 'metrics').length },
  { id: 'project', name: 'Project', count: widgetTemplates.filter(w => w.category === 'project').length },
  { id: 'tasks', name: 'Tasks', count: widgetTemplates.filter(w => w.category === 'tasks').length },
  { id: 'team', name: 'Team', count: widgetTemplates.filter(w => w.category === 'team').length },
  { id: 'analytics', name: 'Analytics', count: widgetTemplates.filter(w => w.category === 'analytics').length },
];

const sizeLabels = {
  small: '1×1',
  medium: '2×1',
  large: '2×2',
  'extra-large': '4×2',
};

export function WidgetLibrary({
  onWidgetSelect,
  className,
}: WidgetLibraryProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          <h2 className="text-xl font-bold">Widget Library</h2>
          <Badge variant="outline">{widgetTemplates.length} widgets</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Drag and drop widgets onto your dashboard
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <Input
          placeholder="Search widgets..."
          className="max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              className="relative"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgetTemplates.map((widget) => (
          <Card
            key={widget.id}
            className="p-4 hover:border-primary cursor-pointer transition-colors group"
            onClick={() => onWidgetSelect(widget.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('p-2 rounded-lg', widget.color)}>
                {widget.icon}
              </div>
              <Badge variant="outline" className="text-xs">
                {sizeLabels[widget.size]}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {widget.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {widget.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {widget.category}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Add to Dashboard
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {widgetTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-xl mb-2">No widgets found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Tip:</span> Drag widgets to rearrange them on your dashboard
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span>Metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span>Project</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-purple-500" />
              <span>Tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
