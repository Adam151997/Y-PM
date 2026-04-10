import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showAvatar?: boolean;
  showActions?: boolean;
  lines?: number;
}

export function SkeletonCard({ 
  className, 
  variant = 'default',
  showAvatar = true,
  showActions = true,
  lines = 3
}: SkeletonCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-4 md:p-6',
      'animate-pulse-subtle',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-3',
              i === 0 ? 'w-full' : i === 1 ? 'w-5/6' : 'w-4/6'
            )} 
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          {variant === 'detailed' && (
            <Skeleton className="h-8 w-24 rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  className?: string;
  showHeader?: boolean;
}

export function SkeletonList({ 
  count = 5, 
  className,
  showHeader = true 
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      )}
      
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center justify-between p-4 rounded-xl border border-border bg-card animate-pulse-subtle"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  className,
  showHeader = true 
}: SkeletonTableProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      {showHeader && (
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4" />
          ))}
        </div>
        
        {/* Table Rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={rowIndex} 
              className="grid grid-cols-4 gap-4 p-3 rounded-lg bg-surface-base/50 animate-pulse-subtle"
              style={{ animationDelay: `${rowIndex * 30}ms` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className={cn(
                    'h-4',
                    colIndex === 0 ? 'w-32' : 
                    colIndex === 1 ? 'w-24' : 
                    colIndex === 2 ? 'w-40' : 'w-20'
                  )} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkeletonDashboardProps {
  className?: string;
}

export function SkeletonDashboard({ className }: SkeletonDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse-subtle">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts/Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 animate-pulse-subtle">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 animate-pulse-subtle">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="h-48 flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-6 animate-pulse-subtle">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface-base/50">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}