/**
 * Swipe gesture components for mobile interactions
 */

'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSwipeGesture, useLongPress, useTouchFeedback } from '../utils/touch-optimization';
import { useIsMobile, useIsTablet } from '../utils/device-detection';
import { Trash2, Archive, Check, X, MoreVertical, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Swipeable item props
export interface SwipeableItemProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  topActions?: SwipeAction[];
  bottomActions?: SwipeAction[];
  swipeThreshold?: number;
  swipeEnabled?: boolean;
  className?: string;
  contentClassName?: string;
  actionClassName?: string;
  onLongPress?: () => void;
  longPressDuration?: number;
}

// Swipe action definition
export interface SwipeAction {
  icon: ReactNode;
  label?: string;
  color: string;
  backgroundColor: string;
  onClick: () => void;
  confirm?: boolean;
  confirmMessage?: string;
}

// Swipeable item component
export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  leftActions = [],
  rightActions = [],
  topActions = [],
  bottomActions = [],
  swipeThreshold = 50,
  swipeEnabled = true,
  className,
  contentClassName,
  actionClassName,
  onLongPress,
  longPressDuration = 500,
}: SwipeableItemProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeActions, setActiveActions] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
  
  const { touchHandlers } = useTouchFeedback('active');
  
  // Long press hook
  const { isLongPressing, handlers: longPressHandlers } = useLongPress(
    () => onLongPress?.(),
    longPressDuration
  );
  
  // Calculate max offset based on actions
  const maxLeftOffset = leftActions.length > 0 ? 80 : 0;
  const maxRightOffset = rightActions.length > 0 ? 80 : 0;
  const maxTopOffset = topActions.length > 0 ? 60 : 0;
  const maxBottomOffset = bottomActions.length > 0 ? 60 : 0;
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeEnabled || (!isMobile && !isTablet)) return;
    
    setIsDragging(true);
    setActiveActions(null);
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !swipeEnabled || (!isMobile && !isTablet)) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    // Determine primary direction
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      let newOffsetX = deltaX;
      
      // Limit offset based on available actions
      if (deltaX > 0 && maxLeftOffset > 0) {
        // Swiping right (revealing left actions)
        newOffsetX = Math.min(deltaX, maxLeftOffset);
        setActiveActions('left');
      } else if (deltaX < 0 && maxRightOffset > 0) {
        // Swiping left (revealing right actions)
        newOffsetX = Math.max(deltaX, -maxRightOffset);
        setActiveActions('right');
      }
      
      setOffsetX(newOffsetX);
      setOffsetY(0);
    } else {
      // Vertical swipe
      let newOffsetY = deltaY;
      
      // Limit offset based on available actions
      if (deltaY > 0 && maxTopOffset > 0) {
        // Swiping down (revealing top actions)
        newOffsetY = Math.min(deltaY, maxTopOffset);
        setActiveActions('top');
      } else if (deltaY < 0 && maxBottomOffset > 0) {
        // Swiping up (revealing bottom actions)
        newOffsetY = Math.max(deltaY, -maxBottomOffset);
        setActiveActions('bottom');
      }
      
      setOffsetY(newOffsetY);
      setOffsetX(0);
    }
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Check if swipe threshold was reached
    const absOffsetX = Math.abs(offsetX);
    const absOffsetY = Math.abs(offsetY);
    
    if (absOffsetX > swipeThreshold) {
      // Horizontal swipe completed
      if (offsetX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offsetX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
      
      // Reset position
      setOffsetX(0);
      setOffsetY(0);
      setActiveActions(null);
    } else if (absOffsetY > swipeThreshold) {
      // Vertical swipe completed
      if (offsetY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offsetY < 0 && onSwipeUp) {
        onSwipeUp();
      }
      
      // Reset position
      setOffsetX(0);
      setOffsetY(0);
      setActiveActions(null);
    } else {
      // Return to original position
      setOffsetX(0);
      setOffsetY(0);
      setActiveActions(null);
    }
  };
  
  // Track start position
  let startX = 0;
  let startY = 0;
  
  const updateStartPosition = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  };
  
  // Render actions
  const renderActions = (actions: SwipeAction[], position: 'left' | 'right' | 'top' | 'bottom') => {
    if (actions.length === 0) return null;
    
    const positionClasses = {
      left: 'left-0',
      right: 'right-0',
      top: 'top-0',
      bottom: 'bottom-0',
    };
    
    const flexClasses = {
      left: 'flex-row',
      right: 'flex-row-reverse',
      top: 'flex-col',
      bottom: 'flex-col-reverse',
    };
    
    return (
      <div
        className={cn(
          'absolute h-full w-full',
          positionClasses[position],
          'flex items-center',
          flexClasses[position],
          actionClassName
        )}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            className={cn(
              'flex items-center justify-center',
              'h-full min-w-20',
              'transition-all duration-200',
              'active:opacity-80'
            )}
            style={{ backgroundColor: action.backgroundColor }}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              // Reset position after action
              setOffsetX(0);
              setOffsetY(0);
              setActiveActions(null);
            }}
            aria-label={action.label}
            {...touchHandlers}
          >
            <div className="flex flex-col items-center justify-center">
              <div className={cn('mb-1', `text-${action.color}`)}>
                {action.icon}
              </div>
              {action.label && (
                <span className={cn('text-xs font-medium', `text-${action.color}`)}>
                  {action.label}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={(e) => {
        handleTouchStart(e);
        updateStartPosition(e);
        longPressHandlers.onTouchStart(e as any);
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => {
        handleTouchEnd();
        longPressHandlers.onTouchEnd();
      }}
      onTouchCancel={() => {
        handleTouchEnd();
        longPressHandlers.onTouchCancel();
      }}
    >
      {/* Background actions */}
      {renderActions(leftActions, 'left')}
      {renderActions(rightActions, 'right')}
      {renderActions(topActions, 'top')}
      {renderActions(bottomActions, 'bottom')}
      
      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          'relative transition-transform duration-200',
          contentClassName,
          isLongPressing && 'scale-95 opacity-80'
        )}
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Common swipe actions
export const SWIPE_ACTIONS = {
  DELETE: {
    icon: <Trash2 className="h-5 w-5" />,
    label: 'Delete',
    color: 'white',
    backgroundColor: 'rgb(239, 68, 68)', // red-500
  },
  ARCHIVE: {
    icon: <Archive className="h-5 w-5" />,
    label: 'Archive',
    color: 'white',
    backgroundColor: 'rgb(59, 130, 246)', // blue-500
  },
  COMPLETE: {
    icon: <Check className="h-5 w-5" />,
    label: 'Complete',
    color: 'white',
    backgroundColor: 'rgb(34, 197, 94)', // green-500
  },
  EDIT: {
    icon: <Edit className="h-5 w-5" />,
    label: 'Edit',
    color: 'white',
    backgroundColor: 'rgb(168, 85, 247)', // purple-500
  },
  COPY: {
    icon: <Copy className="h-5 w-5" />,
    label: 'Copy',
    color: 'white',
    backgroundColor: 'rgb(245, 158, 11)', // amber-500
  },
  MORE: {
    icon: <MoreVertical className="h-5 w-5" />,
    label: 'More',
    color: 'white',
    backgroundColor: 'rgb(107, 114, 128)', // gray-500
  },
};

// Swipe to delete component
export interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  confirmDelete?: boolean;
  confirmMessage?: string;
  className?: string;
}

export function SwipeToDelete({
  children,
  onDelete,
  confirmDelete = true,
  confirmMessage = 'Delete this item?',
  className,
}: SwipeToDeleteProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleDelete = () => {
    if (confirmDelete) {
      setShowConfirm(true);
    } else {
      onDelete();
    }
  };
  
  const confirmActions: SwipeAction[] = [
    {
      icon: <Check className="h-5 w-5" />,
      label: 'Confirm',
      color: 'white',
      backgroundColor: 'rgb(34, 197, 94)', // green-500
      onClick: () => {
        onDelete();
        setShowConfirm(false);
      },
    },
    {
      icon: <X className="h-5 w-5" />,
      label: 'Cancel',
      color: 'white',
      backgroundColor: 'rgb(239, 68, 68)', // red-500
      onClick: () => setShowConfirm(false),
    },
  ];
  
  const deleteActions: SwipeAction[] = [
    {
      ...SWIPE_ACTIONS.DELETE,
      onClick: handleDelete,
    },
  ];
  
  return (
    <SwipeableItem
      rightActions={showConfirm ? confirmActions : deleteActions}
      className={className}
    >
      {children}
      
      {showConfirm && (
        <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {confirmMessage}
          </p>
        </div>
      )}
    </SwipeableItem>
  );
}

// Swipe to complete component
export interface SwipeToCompleteProps {
  children: ReactNode;
  onComplete: () => void;
  className?: string;
}

export function SwipeToComplete({
  children,
  onComplete,
  className,
}: SwipeToCompleteProps) {
  const completeActions: SwipeAction[] = [
    {
      ...SWIPE_ACTIONS.COMPLETE,
      onClick: onComplete,
    },
  ];
  
  return (
    <SwipeableItem
      leftActions={completeActions}
      className={className}
    >
      {children}
    </SwipeableItem>
  );
}

// Swipe to archive component
export interface SwipeToArchiveProps {
  children: ReactNode;
  onArchive: () => void;
  className?: string;
}

export function SwipeToArchive({
  children,
  onArchive,
  className,
}: SwipeToArchiveProps) {
  const archiveActions: SwipeAction[] = [
    {
      ...SWIPE_ACTIONS.ARCHIVE,
      onClick: onArchive,
    },
  ];
  
  return (
    <SwipeableItem
      rightActions={archiveActions}
      className={className}
    >
      {children}
    </SwipeableItem>
  );
}

// Multi-action swipe component
export interface MultiActionSwipeProps {
  children: ReactNode;
  actions: Array<{
    type: 'delete' | 'archive' | 'complete' | 'edit' | 'copy' | 'more';
    onClick: () => void;
    label?: string;
  }>;
  position?: 'left' | 'right';
  className?: string;
}

export function MultiActionSwipe({
  children,
  actions,
  position = 'right',
  className,
}: MultiActionSwipeProps) {
  const swipeActions: SwipeAction[] = actions.map(action => {
    const baseAction = SWIPE_ACTIONS[action.type.toUpperCase() as keyof typeof SWIPE_ACTIONS];
    
    return {
      ...baseAction,
      label: action.label || baseAction.label,
      onClick: action.onClick,
    };
  });
  
  const actionProps = position === 'left' 
    ? { leftActions: swipeActions }
    : { rightActions: swipeActions };
  
  return (
    <SwipeableItem
      {...actionProps}
      className={className}
    >
      {children}
    </SwipeableItem>
  );
}

// Hook for swipe gestures
export function useSwipeableItem(config: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 } = config;
  
  const swipeHandlers = useSwipeGesture({
    threshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  });
  
  return {
    ...swipeHandlers,
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        // You can add custom touch start logic here
      },
      onTouchMove: (e: React.TouchEvent) => {
        // You can add custom touch move logic here
      },
      onTouchEnd: (e: React.TouchEvent) => {
        // You can add custom touch end logic here
      },
    },
  };
}

// Export everything
export const swipe = {
  SwipeableItem,
  SwipeToDelete,
  SwipeToComplete,
  SwipeToArchive,
  MultiActionSwipe,
  SWIPE_ACTIONS,
  useSwipeableItem,
};
