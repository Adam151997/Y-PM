'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  colSpan: number;
  rowSpan: number;
  config: Record<string, any>;
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'quick-stats',
    type: 'quick-stats',
    title: 'Quick Stats',
    colSpan: 2,
    rowSpan: 1,
    config: { showTrends: true }
  },
  {
    id: 'project-health',
    type: 'project-health',
    title: 'Project Health',
    colSpan: 2,
    rowSpan: 1,
    config: { showScore: true }
  },
  {
    id: 'task-distribution',
    type: 'task-distribution',
    title: 'Task Distribution',
    colSpan: 2,
    rowSpan: 2,
    config: { chartType: 'donut' }
  },
  {
    id: 'recent-activity',
    type: 'recent-activity',
    title: 'Recent Activity',
    colSpan: 2,
    rowSpan: 2,
    config: { limit: 10 }
  },
  {
    id: 'completion-trend',
    type: 'completion-trend',
    title: 'Completion Trend',
    colSpan: 4,
    rowSpan: 2,
    config: { period: 'week' }
  }
];

export function useDashboard() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('dashboard-layout');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [gridColumns, setGridColumns] = useState(4);

  const saveLayout = useCallback(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    toast.success('Dashboard layout saved');
  }, [widgets]);

  const resetLayout = useCallback(() => {
    setWidgets(defaultWidgets);
    toast.success('Layout reset to default');
  }, []);

  const addWidget = useCallback((widgetType: string) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: 'New Widget',
      colSpan: 2,
      rowSpan: 1,
      config: {}
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    
    toast.success('Widget added', {
      icon: '➕',
    });
  }, [widgets]);

  const removeWidget = useCallback((widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    
    toast.success('Widget removed', {
      icon: '🗑️',
    });
  }, [widgets]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, ...updates }
        : widget
    );

    setWidgets(updatedWidgets);
    
    if (updates.title) {
      toast.success(`Widget renamed to "${updates.title}"`);
    } else if (updates.config) {
      toast.success('Widget configuration updated');
    }
  }, [widgets]);

  const resizeWidget = useCallback((widgetId: string, colSpan: number, rowSpan: number) => {
    updateWidget(widgetId, { colSpan, rowSpan });
    toast.success('Widget resized');
  }, [updateWidget]);

  const updateWidgetConfig = useCallback((widgetId: string, config: Record<string, any>) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    updateWidget(widgetId, {
      config: { ...widget.config, ...config }
    });
  }, [widgets, updateWidget]);

  return {
    // State
    widgets,
    isEditing,
    viewMode,
    autoRefresh,
    gridColumns,
    
    // Setters
    setWidgets,
    setIsEditing,
    setViewMode,
    setAutoRefresh,
    setGridColumns,
    
    // Actions
    saveLayout,
    resetLayout,
    addWidget,
    removeWidget,
    updateWidget,
    resizeWidget,
    updateWidgetConfig,
    
    // Computed
    widgetCount: widgets.length,
    hasWidgets: widgets.length > 0,
  };
}

// Mock data for dashboard widgets
export const mockDashboardData = {
  stats: {
    totalTasks: 156,
    completedTasks: 89,
    overdueTasks: 12,
    activeProjects: 8,
    teamMembers: 24,
    completionRate: 78,
    avgCompletionTime: 3.2,
    productivityScore: 85,
  },
  
  projectHealth: {
    score: 82,
    status: 'healthy' as const,
    risks: [
      { id: '1', title: 'Resource constraints', severity: 'medium' as const, description: 'Team is at 95% capacity' },
      { id: '2', title: 'Scope creep', severity: 'low' as const, description: 'Additional features requested' },
      { id: '3', title: 'Technical debt', severity: 'high' as const, description: 'Legacy code needs refactoring' },
    ],
    milestones: [
      { id: '1', title: 'Phase 1 Launch', dueDate: '2024-06-15', progress: 100, status: 'on-track' as const },
      { id: '2', title: 'User Testing', dueDate: '2024-07-01', progress: 75, status: 'on-track' as const },
      { id: '3', title: 'Beta Release', dueDate: '2024-08-15', progress: 45, status: 'at-risk' as const },
    ],
  },
  
  taskDistribution: {
    byStatus: [
      { status: 'Todo', count: 42, percentage: 27, color: '#3b82f6' },
      { status: 'In Progress', count: 67, percentage: 43, color: '#f59e0b' },
      { status: 'Review', count: 23, percentage: 15, color: '#8b5cf6' },
      { status: 'Done', count: 24, percentage: 15, color: '#10b981' },
    ],
    byPriority: [
      { priority: 'Critical', count: 8, percentage: 5, color: '#ef4444' },
      { priority: 'High', count: 34, percentage: 22, color: '#f97316' },
      { priority: 'Medium', count: 78, percentage: 50, color: '#eab308' },
      { priority: 'Low', count: 36, percentage: 23, color: '#84cc16' },
    ],
  },
  
  recentActivity: [
    {
      id: '1',
      type: 'task_created' as const,
      user: { id: '1', name: 'Alex Johnson', avatar: 'AJ' },
      description: 'created task "Implement user authentication"',
      timestamp: '2024-04-10T10:30:00Z',
    },
    {
      id: '2',
      type: 'status_changed' as const,
      user: { id: '2', name: 'Sam Wilson', avatar: 'SW' },
      description: 'changed status of "Design system update" to In Progress',
      timestamp: '2024-04-10T09:15:00Z',
    },
    {
      id: '3',
      type: 'comment_added' as const,
      user: { id: '3', name: 'Taylor Smith', avatar: 'TS' },
      description: 'commented on "API integration testing"',
      timestamp: '2024-04-10T08:45:00Z',
    },
  ],
  
  completionTrend: {
    period: 'week' as const,
    data: [
      { date: '2024-04-01', completed: 12, created: 15, overdue: 2 },
      { date: '2024-04-02', completed: 8, created: 10, overdue: 3 },
      { date: '2024-04-03', completed: 15, created: 12, overdue: 1 },
      { date: '2024-04-04', completed: 10, created: 8, overdue: 4 },
      { date: '2024-04-05', completed: 18, created: 14, overdue: 2 },
      { date: '2024-04-06', completed: 7, created: 6, overdue: 1 },
      { date: '2024-04-07', completed: 14, created: 11, overdue: 3 },
    ],
  },
};
