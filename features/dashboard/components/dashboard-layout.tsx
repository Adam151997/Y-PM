'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutGrid, Settings, RefreshCw, Plus, 
  Grid, Eye, EyeOff, Save, Share2, Download,
  Filter, Maximize2, Minimize2, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  colSpan: number;
  rowSpan: number;
  config: Record<string, any>;
}

interface DashboardLayoutProps {
  widgets?: DashboardWidget[];
  onWidgetsChange?: (widgets: DashboardWidget[]) => void;
  className?: string;
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

export function DashboardLayout({
  widgets = defaultWidgets,
  onWidgetsChange,
  className,
}: DashboardLayoutProps) {
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(widgets);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [gridColumns, setGridColumns] = useState(4);

  // Sync with props
  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      toast.info('Dashboard refreshed', {
        icon: <RefreshCw className="h-4 w-4" />,
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleAddWidget = (widgetType: string) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: 'New Widget',
      colSpan: 2,
      rowSpan: 1,
      config: {}
    };

    const updatedWidgets = [...localWidgets, newWidget];
    setLocalWidgets(updatedWidgets);
    onWidgetsChange?.(updatedWidgets);
    
    toast.success('Widget added', {
      icon: <Plus className="h-4 w-4" />,
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = localWidgets.filter(w => w.id !== widgetId);
    setLocalWidgets(updatedWidgets);
    onWidgetsChange?.(updatedWidgets);
    
    toast.success('Widget removed', {
      icon: <Trash2 className="h-4 w-4" />,
    });
  };

  const handleResize = (widgetId: string, colSpan: number, rowSpan: number) => {
    const updatedWidgets = localWidgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, colSpan, rowSpan }
        : widget
    );

    setLocalWidgets(updatedWidgets);
    onWidgetsChange?.(updatedWidgets);
    
    toast.success('Widget resized', {
      icon: <Maximize2 className="h-4 w-4" />,
    });
  };

  const handleSaveLayout = () => {
    localStorage.setItem('dashboard-layout', JSON.stringify(localWidgets));
    toast.success('Layout saved', {
      icon: <Save className="h-4 w-4" />,
    });
  };

  const handleResetLayout = () => {
    setLocalWidgets(defaultWidgets);
    onWidgetsChange?.(defaultWidgets);
    toast.success('Layout reset to default', {
      icon: <RefreshCw className="h-4 w-4" />,
    });
  };

  const gridTemplateColumns = `repeat(${gridColumns}, minmax(0, 1fr))`;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Badge variant="outline" className="ml-2">
              {localWidgets.length} widgets
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="View mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center gap-2">
                    <Grid className="h-4 w-4" />
                    Grid View
                  </div>
                </SelectItem>
                <SelectItem value="compact">
                  <div className="flex items-center gap-2">
                    <Minimize2 className="h-4 w-4" />
                    Compact View
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="icon"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={handleSaveLayout}>
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetLayout}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          )}

          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Edit Layout
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAddWidget('quick-stats')}>
                Quick Stats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('project-health')}>
                Project Health
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('task-distribution')}>
                Task Distribution
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('recent-activity')}>
                Recent Activity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('completion-trend')}>
                Completion Trend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-auto">
        <div 
          className={cn(
            'grid gap-4 transition-all duration-300',
            viewMode === 'compact' && 'gap-2'
          )}
          style={{
            gridTemplateColumns,
          }}
        >
          {localWidgets.map((widget) => (
            <div
              key={widget.id}
              className={cn(
                'relative transition-all duration-200 hover:shadow-lg'
              )}
              style={{
                gridColumn: `span ${widget.colSpan}`,
                gridRow: `span ${widget.rowSpan}`,
              }}
            >
              {/* Widget Container */}
              <Card className="h-full overflow-hidden border-2 hover:border-primary/30 transition-colors">
                {/* Widget Header */}
                <div className={cn(
                  'flex items-center justify-between p-4 border-b',
                  isEditing && 'bg-muted/50 cursor-move'
                )}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{widget.title}</h3>
                    {isEditing && (
                      <Badge variant="outline" className="text-xs">
                        {widget.colSpan}×{widget.rowSpan}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isEditing && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <div className="p-2">
                            <div className="text-xs font-medium mb-2">Resize Widget</div>
                            <div className="grid grid-cols-2 gap-2">
                              {[1, 2, 3, 4].map(cols => (
                                [1, 2].map(rows => (
                                  <Button
                                    key={`${cols}-${rows}`}
                                    variant={widget.colSpan === cols && widget.rowSpan === rows ? "default" : "outline"}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => handleResize(widget.id, cols, rows)}
                                  >
                                    {cols}×{rows}
                                  </Button>
                                ))
                              ))}
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveWidget(widget.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}

                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Widget Content */}
                <div className="p-4">
                  <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">
                        {widget.type.replace('-', ' ')}
                      </div>
                      <div className="text-2xl font-bold">
                        {widget.type === 'quick-stats' && '📊'}
                        {widget.type === 'project-health' && '❤️'}
                        {widget.type === 'task-distribution' && '📈'}
                        {widget.type === 'recent-activity' && '🔄'}
                        {widget.type === 'completion-trend' && '📉'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {widget.colSpan}×{widget.rowSpan} widget
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {localWidgets.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl mb-2">No widgets yet</h3>
            <p className="text-muted-foreground mb-6">
              Add widgets to start building your personalized dashboard. Track projects, monitor progress, and stay updated with your team's activity.
            </p>
            <Button onClick={() => handleAddWidget('quick-stats')}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first widget
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
