'use client';

import { 
  useState, 
  useRef, 
  useEffect, 
  ReactNode, 
  CSSProperties,
  createContext,
  useContext 
} from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '../utils/reduced-motion';
import { 
  ANIMATION_TIMING, 
  EASING,
  withReducedMotion 
} from '../utils/animation-utils';

// Tooltip types
export type TooltipPosition = 
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

export interface TooltipOptions {
  content: ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number;
  duration?: number;
  offset?: number;
  arrow?: boolean;
  arrowSize?: number;
  maxWidth?: string | number;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  interactive?: boolean;
  followCursor?: boolean;
  hideOnClick?: boolean;
}

// Tooltip context
interface TooltipContextType {
  isOpen: boolean;
  position: TooltipPosition;
  content: ReactNode;
  options: TooltipOptions;
  open: (content: ReactNode, options?: Partial<TooltipOptions>) => void;
  close: () => void;
  updatePosition: (position: TooltipPosition) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

// Tooltip provider
interface TooltipProviderProps {
  children: ReactNode;
  defaultOptions?: Partial<TooltipOptions>;
}

export function TooltipProvider({ 
  children, 
  defaultOptions = {} 
}: TooltipProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>('top');
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<TooltipOptions>({
    content: null,
    position: 'top',
    trigger: 'hover',
    delay: 100,
    duration: 3000,
    offset: 8,
    arrow: true,
    arrowSize: 6,
    maxWidth: '250px',
    interactive: false,
    followCursor: false,
    hideOnClick: true,
    ...defaultOptions,
  });

  const open = (newContent: ReactNode, newOptions?: Partial<TooltipOptions>) => {
    setContent(newContent);
    setOptions(prev => ({
      ...prev,
      ...newOptions,
      content: newContent,
    }));
    if (newOptions?.position) {
      setPosition(newOptions.position);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const updatePosition = (newPosition: TooltipPosition) => {
    setPosition(newPosition);
  };

  const value: TooltipContextType = {
    isOpen,
    position,
    content,
    options,
    open,
    close,
    updatePosition,
  };

  return (
    <TooltipContext.Provider value={value}>
      {children}
      <TooltipPortal />
    </TooltipContext.Provider>
  );
}

// Tooltip portal
function TooltipPortal() {
  const { isOpen, position, content, options } = useTooltip();
  const reducedMotion = useReducedMotion();

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <TooltipContent
        position={position}
        content={content}
        options={options}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

// Tooltip content
interface TooltipContentProps {
  position: TooltipPosition;
  content: ReactNode;
  options: TooltipOptions;
  reducedMotion: boolean;
}

function TooltipContent({ 
  position, 
  content, 
  options, 
  reducedMotion 
}: TooltipContentProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [arrowCoords, setArrowCoords] = useState({ x: 0, y: 0 });
  const [arrowRotation, setArrowRotation] = useState(0);

  // Calculate position based on cursor or target
  useEffect(() => {
    if (!tooltipRef.current) return;

    const updatePosition = () => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      // For now, position in center of screen
      // In a real implementation, this would calculate based on target element
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      let x = viewportWidth / 2 - tooltipWidth / 2;
      let y = viewportHeight / 2 - tooltipHeight / 2;

      // Adjust based on position
      const offset = options.offset || 8;
      
      switch (position) {
        case 'top':
          x = viewportWidth / 2 - tooltipWidth / 2;
          y = viewportHeight * 0.25 - tooltipHeight;
          break;
        case 'bottom':
          x = viewportWidth / 2 - tooltipWidth / 2;
          y = viewportHeight * 0.75;
          break;
        case 'left':
          x = viewportWidth * 0.25 - tooltipWidth;
          y = viewportHeight / 2 - tooltipHeight / 2;
          break;
        case 'right':
          x = viewportWidth * 0.75;
          y = viewportHeight / 2 - tooltipHeight / 2;
          break;
        // Add more positions as needed
      }

      setCoords({ x, y });

      // Calculate arrow position
      const arrowSize = options.arrowSize || 6;
      let arrowX = 0;
      let arrowY = 0;
      let rotation = 0;

      switch (position) {
        case 'top':
          arrowX = tooltipWidth / 2;
          arrowY = tooltipHeight;
          rotation = 180;
          break;
        case 'bottom':
          arrowX = tooltipWidth / 2;
          arrowY = 0;
          rotation = 0;
          break;
        case 'left':
          arrowX = tooltipWidth;
          arrowY = tooltipHeight / 2;
          rotation = 90;
          break;
        case 'right':
          arrowX = 0;
          arrowY = tooltipHeight / 2;
          rotation = -90;
          break;
      }

      setArrowCoords({ x: arrowX, y: arrowY });
      setArrowRotation(rotation);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [position, options.offset, options.arrowSize]);

  const getPositionStyles = (): CSSProperties => {
    return {
      position: 'absolute',
      left: `${coords.x}px`,
      top: `${coords.y}px`,
      maxWidth: options.maxWidth,
      pointerEvents: options.interactive ? 'auto' : 'none',
      transition: reducedMotion ? 'none' : `opacity ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
    };
  };

  const getArrowStyles = (): CSSProperties => {
    if (!options.arrow) return {};
    
    return {
      position: 'absolute',
      left: `${arrowCoords.x}px`,
      top: `${arrowCoords.y}px`,
      width: `${options.arrowSize}px`,
      height: `${options.arrowSize}px`,
      transform: `translate(-50%, -50%) rotate(${arrowRotation}deg)`,
      backgroundColor: 'inherit',
      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    };
  };

  return (
    <div
      ref={tooltipRef}
      className={cn(
        'rounded-lg bg-gray-900 text-gray-50 px-3 py-2 text-sm shadow-lg',
        'dark:bg-gray-50 dark:text-gray-900',
        options.className,
        reducedMotion ? 'animate-none' : 'animate-in fade-in'
      )}
      style={getPositionStyles()}
      role="tooltip"
    >
      {options.arrow && (
        <div 
          className="absolute"
          style={getArrowStyles()}
        />
      )}
      <div className={cn('relative z-10', options.contentClassName)}>
        {content}
      </div>
    </div>
  );
}

// Hook to use tooltip
export function useTooltip() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

// Tooltip component
interface TooltipProps extends Omit<TooltipOptions, 'content'> {
  children: ReactNode;
  content: ReactNode;
}

export function Tooltip({ 
  children, 
  content, 
  position = 'top',
  trigger = 'hover',
  delay = 100,
  duration = 3000,
  offset = 8,
  arrow = true,
  arrowSize = 6,
  maxWidth = '250px',
  className,
  contentClassName,
  disabled = false,
  interactive = false,
  followCursor = false,
  hideOnClick = true,
}: TooltipProps) {
  const { open, close } = useTooltip();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const durationRef = useRef<NodeJS.Timeout>();

  const handleOpen = () => {
    if (disabled) return;
    
    clearTimeout(timeoutRef.current);
    clearTimeout(durationRef.current);

    timeoutRef.current = setTimeout(() => {
      open(content, {
        position,
        trigger,
        delay,
        duration,
        offset,
        arrow,
        arrowSize,
        maxWidth,
        className,
        contentClassName,
        interactive,
        followCursor,
        hideOnClick,
      });

      if (duration > 0) {
        durationRef.current = setTimeout(() => {
          close();
        }, duration);
      }
    }, delay);
  };

  const handleClose = () => {
    clearTimeout(timeoutRef.current);
    clearTimeout(durationRef.current);
    close();
  };

  // Event handlers based on trigger
  const eventHandlers = {
    onMouseEnter: () => {
      if (trigger === 'hover' || trigger === 'hover') {
        setIsHovered(true);
        handleOpen();
      }
    },
    onMouseLeave: () => {
      if (trigger === 'hover' || trigger === 'hover') {
        setIsHovered(false);
        handleClose();
      }
    },
    onFocus: () => {
      if (trigger === 'focus' || trigger === 'hover') {
        setIsFocused(true);
        handleOpen();
      }
    },
    onBlur: () => {
      if (trigger === 'focus' || trigger === 'hover') {
        setIsFocused(false);
        handleClose();
      }
    },
    onClick: () => {
      if (trigger === 'click') {
        if (isClicked && hideOnClick) {
          setIsClicked(false);
          handleClose();
        } else {
          setIsClicked(true);
          handleOpen();
        }
      }
    },
  };

  // Clone children with event handlers
  const child = Array.isArray(children) ? children[0] : children;
  
  if (React.isValidElement(child)) {
    return React.cloneElement(child, {
      ...eventHandlers,
      'aria-describedby': 'tooltip',
    });
  }

  return (
    <span
      {...eventHandlers}
      aria-describedby="tooltip"
      className="inline-block"
    >
      {children}
    </span>
  );
}

// Simple tooltip component (no provider needed)
export function SimpleTooltip({
  children,
  content,
  position = 'top',
  className,
  ...props
}: Omit<TooltipProps, 'trigger'>) {
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-block"
        aria-describedby="tooltip"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 rounded-lg bg-gray-900 text-gray-50 px-3 py-2 text-sm shadow-lg',
            'dark:bg-gray-50 dark:text-gray-900',
            getSimplePositionClasses(position),
            reducedMotion ? 'animate-none' : 'animate-in fade-in',
            className
          )}
          role="tooltip"
          style={{ maxWidth: '250px' }}
        >
          {content}
          <div className={cn(
            'absolute w-2 h-2 bg-gray-900 dark:bg-gray-50',
            getSimpleArrowClasses(position)
          )} />
        </div>
      )}
    </div>
  );
}

function getSimplePositionClasses(position: TooltipPosition): string {
  const base = 'transform -translate-x-1/2 left-1/2';
  
  switch (position) {
    case 'top':
      return `${base} bottom-full mb-2`;
    case 'bottom':
      return `${base} top-full mt-2`;
    case 'left':
      return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
    case 'right':
      return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
    default:
      return `${base} bottom-full mb-2`;
  }
}

function getSimpleArrowClasses(position: TooltipPosition): string {
  const base = 'absolute transform -translate-x-1/2 left-1/2';
  
  switch (position) {
    case 'top':
      return `${base} top-full -translate-y-1/2 rotate-45`;
    case 'bottom':
      return `${base} bottom-full translate-y-1/2 rotate-45`;
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45';
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-45';
    default:
      return `${base} top-full -translate-y-1/2 rotate-45`;
  }
}

// Export everything
export const TooltipSystem = {
  Provider: TooltipProvider,
  Tooltip,
  SimpleTooltip,
  useTooltip,
};
