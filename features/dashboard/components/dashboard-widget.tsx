'use client';

import { ReactNode } from 'react';
import { 
  Maximize2, Minimize2, Settings, Filter, 
  RefreshCw, Download, MoreVertical, X,
  ChevronUp, ChevronDown, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  isLoading?: boolean;
  isEditing?: boolean;
  showHeader?: boolean;
  showActions?: boolean;
  config?: Record<string, any>;
  onConfigChange?: (config: Record<string, any>) => void;
  onRemove?: () => void;
  onRefresh?: () => void;
  onResize?: (colSpan: number, rowSpan: number) => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  isMaximized?: boolean;
  error?: string | null;
  emptyState?: ReactNode;
}

export function DashboardWidget({
  id,
  title,
  children,
  className,
  colSpan = 2,
  rowSpan = 1,
  isLoading = false,
  isEditing = false,
  showHeader = true,
  showActions = true,
  config = {},
  onConfigChange,
  onRemove,
  onRefresh,
  onResize,
  onMaximize,
  onMinimize,
  isMaximized = false,
  error = null,
  emptyState,
}: DashboardWidgetProps) {
  const handleConfigChange = (key: string, value: any) => {
    onConfigChange?.({ ...config, [key]: value });
  };

  const handleResize = (newColSpan: number, newRowSpan: number) => {
    onResize?.(newColSpan, newRowSpan);
  };

  const sizeOptions = [
    { cols: 1, rows: 1, label: 'Small' },
    { cols: 2, rows: 1, label: 'Medium' },
    { cols: 2, rows: 2, label: 'Large' },
    { cols: 3, rows: 2, label: 'Extra Large' },
    { cols: 4, rows: 2, label: 'Full Width' },
  ];

  return (
    <Card 
      className={cn(
        'h-full overflow-hidden border-2 transition-all duration-200',
        isEditing && 'border-primary/30',
        isMaximized && 'border-primary',
        className
      )}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      {/* Widget Header */}
      {showHeader && (
        <div className={cn(
          'flex items-center justify-between p-4 border-b',
          isEditing && 'bg-muted/50 cursor-move'
        )}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {isEditing && (
              <Badge variant="outline" className="text-xs">
                {colSpan}×{rowSpan}
              </Badge>
            )}
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            )}
            {error && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
          </div>

          {/* Widget Actions */}
          {showActions && (
            <div className="flex items-center gap-1">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                </Button>
              )}

              {isEditing && onResize && (
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
                        {sizeOptions.map((size) => (
                          <Button
                            key={`${size.cols}-${size.rows}`}
                            variant={colSpan === size.cols && rowSpan === size.rows ? "default" : "outline"}
                            size="sm"
                            className="h-8"
                            onClick={() => handleResize(size.cols, size.rows)}
                          >
                            {size.cols}×{size.rows}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {onMaximize && !isMaximized && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onMaximize}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
              )}

              {onMinimize && isMaximized && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onMinimize}
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              )}

              {onConfigChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="p-2">
                      <div className="text-xs font-medium mb-2">Widget Settings</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Show Trends</span>
                          <Button
                            variant={config.showTrends ? "default" : "outline"}
                            size="sm"
                            className="h-6 w-12"
                            onClick={() => handleConfigChange('showTrends', !config.showTrends)}
                          >
                            {config.showTrends ? 'On' : 'Off'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Compact View</span>
                          <Button
                            variant={config.compact ? "default" : "outline"}
                            size="sm"
                            className="h-6 w-12"
                            onClick={() => handleConfigChange('compact', !config.compact)}
                          >
                            {config.compact ? 'On' : 'Off'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Filter className="h-3 w-3" />
              </Button>

              {isEditing && onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={onRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem className="text-destructive">
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Widget
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}

      {/* Widget Content */}
      <div className="h-full overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
                <X className="h-4 w-4 text-destructive" />
              </div>
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onRefresh}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : emptyState ? (
          <div className="flex items-center justify-center h-32">
            {emptyState}
          </div>
        ) : (
          <div className={cn(
            'p-4',
            config.compact && 'p-2'
          )}>
            {children}
          </div>
        )}
      </div>

      {/* Widget Footer */}
      {config.showTrends && (
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last updated: Just now</span>
            <div className="flex items-center gap-1">
              <ChevronUp className="h-3 w-3 text-green-500" />
              <span className="font-medium">+12%</span>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Widget skeleton for loading state
export function WidgetSkeleton() {
  return (
    <Card className="h-full overflow-hidden border animate-pulse">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded" />
            <div className="h-6 w-6 bg-muted rounded" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-32 bg-muted/30 rounded-lg" />
      </div>
    </Card>
  );
}

// Empty state component
export function WidgetEmptyState({
  title = "No data available",
  description = "There's no data to display for this widget.",
  icon = <EyeOff className="h-8 w-8 text-muted-foreground" />,
  actionLabel = "Refresh",
  onAction,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
