'use client';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '../utils/reduced-motion';
import { MOTION_PRESETS } from '../utils/reduced-motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  speed = 'normal',
  className,
  style,
  ...props
}: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getAnimationStyles = () => {
    if (reducedMotion || animation === 'none') {
      return 'bg-muted';
    }

    const speedMap = {
      slow: '2s',
      normal: '1.5s',
      fast: '1s',
    };

    switch (animation) {
      case 'wave':
        return `
          bg-gradient-to-r from-muted via-muted/50 to-muted
          bg-[length:200%_100%]
          animate-shimmer
          [animation-duration:${speedMap[speed]}]
        `;
      case 'shimmer':
        return `
          bg-gradient-to-r from-muted via-muted/70 to-muted
          bg-[length:200%_100%]
          animate-shimmer
          [animation-duration:${speedMap[speed]}]
        `;
      case 'pulse':
      default:
        return `
          bg-muted
          animate-pulse
          [animation-duration:${speedMap[speed]}]
        `;
    }
  };

  const skeletonStyles = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...style,
  };

  return (
    <div
      className={cn(
        'block',
        getVariantStyles(),
        getAnimationStyles(),
        className
      )}
      style={skeletonStyles}
      aria-label="Loading..."
      aria-busy="true"
      {...props}
    />
  );
}

// Text skeleton variants
export function TextSkeleton({
  lines = 1,
  variant = 'text',
  ...props
}: SkeletonProps & { lines?: number }) {
  if (lines === 1) {
    return <Skeleton variant={variant} height="1em" {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          height="1em"
          width={index === lines - 1 ? '80%' : '100%'}
          {...props}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function AvatarSkeleton({
  size = 'md',
  ...props
}: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeMap[size], props.className)}
      {...props}
    />
  );
}

// Card skeleton
export function CardSkeleton({
  variant = 'rounded',
  hasImage = false,
  hasActions = false,
  ...props
}: SkeletonProps & { hasImage?: boolean; hasActions?: boolean }) {
  return (
    <div className="space-y-3">
      {hasImage && (
        <Skeleton
          variant={variant}
          height="200px"
          className="w-full"
          {...props}
        />
      )}
      <div className="space-y-2">
        <Skeleton variant="text" height="1.5em" width="70%" />
        <Skeleton variant="text" height="1em" width="90%" />
        <Skeleton variant="text" height="1em" width="80%" />
      </div>
      {hasActions && (
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" height="2em" width="4em" />
          <Skeleton variant="rounded" height="2em" width="4em" />
        </div>
      )}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4,
  ...props
}: Omit<SkeletonProps, 'variant'> & { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={`header-${colIndex}`}
            variant="text"
            height="2em"
            width={colIndex === 0 ? '20%' : '15%'}
            {...props}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              height="1.5em"
              width={colIndex === 0 ? '20%' : '15%'}
              {...props}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// List skeleton
export function ListSkeleton({
  items = 5,
  hasAvatar = false,
  hasSecondary = false,
  ...props
}: Omit<SkeletonProps, 'variant'> & { items?: number; hasAvatar?: boolean; hasSecondary?: boolean }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          {hasAvatar && <AvatarSkeleton size="md" />}
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" height="1.2em" width="60%" {...props} />
            {hasSecondary && (
              <Skeleton variant="text" height="1em" width="40%" {...props} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard widget skeleton
export function DashboardWidgetSkeleton({
  variant = 'rounded',
  ...props
}: SkeletonProps) {
  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton variant="text" height="1.2em" width="120px" {...props} />
          <Skeleton variant="text" height="1em" width="80px" {...props} />
        </div>
        <Skeleton variant="circular" width="32px" height="32px" {...props} />
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <Skeleton variant="text" height="2em" width="100%" {...props} />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" height="1em" width="60px" {...props} />
          <Skeleton variant="text" height="1em" width="40px" {...props} />
        </div>
      </div>
      
      {/* Chart area */}
      <Skeleton variant={variant} height="150px" className="w-full" {...props} />
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" height="1em" width="80px" {...props} />
        <Skeleton variant="rounded" height="1.5em" width="60px" {...props} />
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({
  fields = 3,
  ...props
}: Omit<SkeletonProps, 'variant'> & { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-1">
          <Skeleton variant="text" height="1em" width="80px" {...props} />
          <Skeleton variant="rounded" height="2.5em" className="w-full" {...props} />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rounded" height="2.5em" width="80px" {...props} />
        <Skeleton variant="rounded" height="2.5em" width="80px" {...props} />
      </div>
    </div>
  );
}

// Progress bar skeleton
export function ProgressSkeleton({
  variant = 'rounded',
  ...props
}: SkeletonProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Skeleton variant="text" height="1em" width="60px" {...props} />
        <Skeleton variant="text" height="1em" width="40px" {...props} />
      </div>
      <Skeleton variant={variant} height="0.5em" className="w-full" {...props} />
    </div>
  );
}

// Image gallery skeleton
export function ImageGallerySkeleton({
  columns = 3,
  rows = 2,
  ...props
}: Omit<SkeletonProps, 'variant'> & { columns?: number; rows?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: columns * rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="rounded" height="150px" className="w-full" {...props} />
          <Skeleton variant="text" height="1em" width="80%" {...props} />
          <Skeleton variant="text" height="1em" width="60%" {...props} />
        </div>
      ))}
    </div>
  );
}

// Chat message skeleton
export function ChatMessageSkeleton({
  isOwn = false,
  ...props
}: Omit<SkeletonProps, 'variant'> & { isOwn?: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isOwn && <AvatarSkeleton size="sm" />}
      <div className={`space-y-1 ${isOwn ? 'text-right' : ''}`}>
        <Skeleton variant="rounded" height="2.5em" width="200px" {...props} />
        <Skeleton variant="text" height="1em" width="80px" {...props} />
      </div>
      {isOwn && <AvatarSkeleton size="sm" />}
    </div>
  );
}

// Calendar skeleton
export function CalendarSkeleton({
  ...props
}: Omit<SkeletonProps, 'variant'>) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" height="1.5em" width="120px" {...props} />
        <div className="flex gap-2">
          <Skeleton variant="circular" width="32px" height="32px" {...props} />
          <Skeleton variant="circular" width="32px" height="32px" {...props} />
        </div>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <Skeleton
            key={day}
            variant="text"
            height="2em"
            className="text-center"
            {...props}
          />
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            height="60px"
            className="w-full"
            {...props}
          />
        ))}
      </div>
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton({
  variant = 'rounded',
  ...props
}: SkeletonProps) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" height="1.2em" width="100px" {...props} />
        <Skeleton variant="circular" width="32px" height="32px" {...props} />
      </div>
      <Skeleton variant="text" height="2em" width="80px" {...props} />
      <div className="flex items-center gap-1">
        <Skeleton variant="text" height="1em" width="60px" {...props} />
        <Skeleton variant="text" height="1em" width="40px" {...props} />
      </div>
      <Skeleton variant={variant} height="4px" className="w-full" {...props} />
    </div>
  );
}

// Skeleton container with shimmer effect
export function SkeletonContainer({
  children,
  isLoading = true,
  shimmer = false,
  speed = 'normal',
  className,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  shimmer?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  
  if (!isLoading) {
    return <>{children}</>;
  }

  const speedMap = {
    slow: '2s',
    normal: '1.5s',
    fast: '1s',
  };

  const shimmerStyles = shimmer && !reducedMotion ? {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: `shimmer ${speedMap[speed]} infinite linear`,
  } : {};

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={shimmerStyles}
      aria-busy="true"
      aria-label="Loading content..."
    >
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  );
}

// Export all skeleton components
export const Skeletons = {
  Skeleton,
  Text: TextSkeleton,
  Avatar: AvatarSkeleton,
  Card: CardSkeleton,
  Table: TableSkeleton,
  List: ListSkeleton,
  DashboardWidget: DashboardWidgetSkeleton,
  Form: FormSkeleton,
  Progress: ProgressSkeleton,
  ImageGallery: ImageGallerySkeleton,
  ChatMessage: ChatMessageSkeleton,
  Calendar: CalendarSkeleton,
  StatsCard: StatsCardSkeleton,
  Container: SkeletonContainer,
};
