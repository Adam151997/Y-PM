'use client';

import { 
  useState, 
  useRef, 
  useEffect, 
  ReactNode, 
  CSSProperties,
  createContext,
  useContext,
  useCallback
} from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '../utils/reduced-motion';
import { 
  ANIMATION_TIMING, 
  EASING,
  SCALE,
  OPACITY,
  SHADOW
} from '../utils/animation-utils';
import { Move, GripVertical, GripHorizontal, Check, X, Plus } from 'lucide-react';

// Drag types
export type DragDirection = 'vertical' | 'horizontal' | 'both';
export type DropEffect = 'move' | 'copy' | 'link' | 'none';

// Drag context
interface DragContextType {
  isDragging: boolean;
  dragItem: any;
  dropZone: string | null;
  dropEffect: DropEffect;
  startDrag: (item: any, event: React.DragEvent) => void;
  endDrag: () => void;
  setDropZone: (zone: string | null) => void;
  setDropEffect: (effect: DropEffect) => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

// Drag provider
interface DragProviderProps {
  children: ReactNode;
  onDrop?: (item: any, zone: string) => void;
}

export function DragProvider({ 
  children, 
  onDrop
}: DragProviderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<any>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [dropEffect, setDropEffect] = useState<DropEffect>('move');

  const startDrag = useCallback((item: any, event: React.DragEvent) => {
    setIsDragging(true);
    setDragItem(item);
    setDropZone(null);
    setDropEffect('move');
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify(item));
    }
  }, []);

  const endDrag = useCallback(() => {
    if (dragItem && dropZone) {
      onDrop?.(dragItem, dropZone);
    }
    
    setIsDragging(false);
    setDragItem(null);
    setDropZone(null);
    setDropEffect('move');
  }, [dragItem, dropZone, onDrop]);

  const value: DragContextType = {
    isDragging,
    dragItem,
    dropZone,
    dropEffect,
    startDrag,
    endDrag,
    setDropZone,
    setDropEffect,
  };

  return (
    <DragContext.Provider value={value}>
      {children}
      <DragOverlay />
    </DragContext.Provider>
  );
}

// Drag overlay
function DragOverlay() {
  const { isDragging, dragItem, dropEffect } = useDrag();
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, [isDragging]);

  if (!isDragging || !dragItem) return null;

  const getDropEffectIcon = () => {
    switch (dropEffect) {
      case 'copy':
        return <Plus className="h-4 w-4" />;
      case 'link':
        return <Move className="h-4 w-4" />;
      case 'none':
        return <X className="h-4 w-4" />;
      case 'move':
      default:
        return <Move className="h-4 w-4" />;
    }
  };

  const overlayStyles: CSSProperties = {
    position: 'fixed',
    left: `${position.x + 10}px`,
    top: `${position.y + 10}px`,
    zIndex: 9999,
    pointerEvents: 'none',
    transform: reducedMotion ? 'none' : `scale(${SCALE.HOVER})`,
    opacity: reducedMotion ? 0.8 : OPACITY.GHOST,
    transition: reducedMotion ? 'none' : `transform ${ANIMATION_TIMING.FAST} ${EASING.EASE_OUT}`,
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-3 py-2 shadow-xl',
        'border border-gray-200 dark:border-gray-700'
      )}
      style={overlayStyles}
    >
      <div className="text-gray-600 dark:text-gray-300">
        {getDropEffectIcon()}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Dragging item
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {dropEffect === 'move' ? 'Move' : 
         dropEffect === 'copy' ? 'Copy' : 
         dropEffect === 'link' ? 'Link' : 'Cannot drop'}
      </div>
    </div>
  );
}

// Hook to use drag
export function useDrag() {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useDrag must be used within a DragProvider');
  }
  return context;
}

// Drag handle component
interface DragHandleProps {
  children?: ReactNode;
  direction?: DragDirection;
  className?: string;
}

export function DragHandle({ 
  children, 
  direction = 'both',
  className 
}: DragHandleProps) {
  const reducedMotion = useReducedMotion();
  
  const getIcon = () => {
    switch (direction) {
      case 'vertical':
        return <GripVertical className="h-4 w-4" />;
      case 'horizontal':
        return <GripHorizontal className="h-4 w-4" />;
      case 'both':
      default:
        return <Move className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center cursor-grab active:cursor-grabbing',
        'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
        'transition-colors duration-150',
        reducedMotion && 'transition-none',
        className
      )}
      draggable="true"
      onDragStart={(e) => e.stopPropagation()}
    >
      {children || getIcon()}
    </div>
  );
}

// Draggable item component
interface DraggableProps {
  children: ReactNode;
  item: any;
  className?: string;
  disabled?: boolean;
}

export function Draggable({ 
  children, 
  item,
  className,
  disabled = false
}: DraggableProps) {
  const { startDrag, isDragging } = useDrag();
  const reducedMotion = useReducedMotion();
  const [isLocalDragging, setIsLocalDragging] = useState(false);

  const handleDragStart = (event: React.DragEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    startDrag(item, event);
    setIsLocalDragging(true);
  };

  const handleDragEnd = () => {
    setIsLocalDragging(false);
  };

  return (
    <div
      className={cn(
        'relative transition-all duration-200',
        isLocalDragging && !reducedMotion && 'scale-95',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        cursor: disabled ? 'not-allowed' : 'grab',
        transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
      }}
    >
      {children}
      
      {/* Drag preview overlay */}
      {isLocalDragging && !reducedMotion && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50/20 dark:bg-blue-900/20" />
      )}
    </div>
  );
}

// Drop zone component
interface DropZoneProps {
  children: ReactNode;
  zoneId: string;
  accepts?: string[];
  className?: string;
  activeClassName?: string;
}

export function DropZone({ 
  children, 
  zoneId,
  accepts,
  className,
  activeClassName
}: DropZoneProps) {
  const { 
    isDragging, 
    dragItem, 
    dropZone, 
    setDropZone, 
    setDropEffect
  } = useDrag();
  const reducedMotion = useReducedMotion();
  const [isOver, setIsOver] = useState(false);

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    
    if (!dragItem || !isDragging) return;
    
    // Check if zone accepts this item
    const canAccept = !accepts || accepts.includes(dragItem.type || 'default');
    const newDropEffect = canAccept ? 'move' : 'none';
    
    setIsOver(true);
    setDropZone(zoneId);
    setDropEffect(newDropEffect);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    
    if (!dragItem || !isDragging) return;
    
    const canAccept = !accepts || accepts.includes(dragItem.type || 'default');
    event.dataTransfer.dropEffect = canAccept ? 'move' : 'none';
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    
    setIsOver(false);
    
    if (dropZone === zoneId) {
      setDropZone(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    setIsOver(false);
    
    // Try to parse drag data
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      console.log('Dropped in zone', zoneId, ':', data);
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  };

  const isActive = dropZone === zoneId;

  const getZoneStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
    };

    if (isActive) {
      return {
        ...baseStyles,
        transform: reducedMotion ? 'none' : 'scale(1.02)',
        boxShadow: SHADOW.LG,
      };
    }

    if (isOver) {
      return {
        ...baseStyles,
        borderStyle: 'dashed',
      };
    }

    return baseStyles;
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-transparent p-4',
        isActive && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        isOver && 'border-gray-300 dark:border-gray-600',
        isActive && activeClassName,
        className
      )}
      style={getZoneStyles()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drop zone indicator */}
      {isActive && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center pointer-events-none',
          reducedMotion ? 'opacity-100' : 'animate-in fade-in'
        )}>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Check className="h-6 w-6" />
            <span className="font-medium">Drop here</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple sortable item
interface SortableItemProps {
  children: ReactNode;
  index: number;
  onMove?: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export function SortableItem({
  children,
  index,
  onMove,
  className
}: SortableItemProps) {
  const reducedMotion = useReducedMotion();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onMove?.(fromIndex, index);
    }
  };

  return (
    <div
      className={cn(
        'transition-all duration-200',
        isDragOver && !reducedMotion && 'translate-y-2',
        reducedMotion && 'transition-none',
        className
      )}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        cursor: 'grab',
      }}
    >
      {children}
    </div>
  );
}

// Export everything
export const DragSystem = {
  Provider: DragProvider,
  Handle: DragHandle,
  Draggable,
  DropZone,
  SortableItem,
  useDrag,
};