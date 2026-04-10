/**
 * Touch optimization utilities for mobile devices
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ANIMATION_TIMING } from '@/features/micro-interactions/utils/animation-utils';

// Import device capabilities from our own module
import { getDeviceCapabilities } from './device-detection';

// Touch target sizes (WCAG minimum: 44px)
export const TOUCH_TARGET_SIZES = {
  MINIMUM: 44, // WCAG minimum touch target
  COMFORTABLE: 48, // More comfortable touch target
  LARGE: 56, // Large touch target for important actions
  EXTRA_LARGE: 64, // Extra large for critical actions
} as const;

// Swipe gesture configuration
export interface SwipeConfig {
  threshold?: number; // Minimum distance to trigger (px)
  velocityThreshold?: number; // Minimum velocity (px/ms)
  direction?: 'horizontal' | 'vertical' | 'both';
  onSwipe?: (direction: SwipeDirection, distance: number, velocity: number) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

// Swipe gesture result
export interface SwipeResult {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Touch feedback states
export type TouchFeedback = 'none' | 'active' | 'hover' | 'focus';

// Ensure element has minimum touch target size
export function ensureTouchTarget(
  element: HTMLElement,
  size: number = TOUCH_TARGET_SIZES.MINIMUM
): void {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  if (width < size || height < size) {
    const padding = Math.max(0, (size - Math.min(width, height)) / 2);
    element.style.padding = `${padding}px`;
    element.style.minWidth = `${size}px`;
    element.style.minHeight = `${size}px`;
  }
}

// Add touch feedback to element
export function addTouchFeedback(
  element: HTMLElement,
  feedbackType: TouchFeedback = 'active'
): void {
  const classes = {
    none: '',
    active: 'active:scale-95 active:opacity-80',
    hover: 'hover:scale-105 hover:opacity-90',
    focus: 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
  };
  
  element.classList.add(...classes[feedbackType].split(' '));
}

// Hook for swipe gestures
export function useSwipeGesture(config: SwipeConfig = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    direction = 'horizontal',
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = config;

  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeResult, setSwipeResult] = useState<SwipeResult | null>(null);
  
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
    setIsSwiping(true);
    
    // Prevent default to avoid scrolling while swiping
    if (direction === 'horizontal') {
      e.preventDefault();
    }
  }, [direction]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping) return;
    
    const touch = e.touches[0];
    currentX.current = touch.clientX;
    currentY.current = touch.clientY;
    
    // Prevent default to avoid scrolling while swiping
    if (direction === 'horizontal') {
      e.preventDefault();
    }
  }, [isSwiping, direction]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    const endTime = Date.now();
    const duration = endTime - startTime.current;
    
    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;
    
    const distanceX = Math.abs(deltaX);
    const distanceY = Math.abs(deltaY);
    
    const velocityX = distanceX / duration;
    const velocityY = distanceY / duration;
    
    let swipeDirection: SwipeDirection | null = null;
    let distance = 0;
    let velocity = 0;
    
    // Determine swipe direction based on configuration
    if (direction === 'horizontal' || direction === 'both') {
      if (distanceX > threshold && distanceX > distanceY) {
        swipeDirection = deltaX > 0 ? 'right' : 'left';
        distance = distanceX;
        velocity = velocityX;
      }
    }
    
    if (direction === 'vertical' || direction === 'both') {
      if (distanceY > threshold && distanceY > distanceX) {
        swipeDirection = deltaY > 0 ? 'down' : 'up';
        distance = distanceY;
        velocity = velocityY;
      }
    }
    
    if (swipeDirection && velocity > velocityThreshold) {
      const result: SwipeResult = {
        direction: swipeDirection,
        distance,
        velocity,
        startX: startX.current,
        startY: startY.current,
        endX: currentX.current,
        endY: currentY.current,
      };
      
      setSwipeResult(result);
      onSwipe?.(swipeDirection, distance, velocity);
      
      // Trigger direction-specific callbacks
      switch (swipeDirection) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    }
    
    setIsSwiping(false);
  }, [isSwiping, threshold, velocityThreshold, direction, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Attach swipe listeners to element
  const attachSwipeListeners = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: direction !== 'horizontal' });
    element.addEventListener('touchmove', handleTouchMove, { passive: direction !== 'horizontal' });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, direction]);

  return {
    isSwiping,
    swipeResult,
    attachSwipeListeners,
  };
}

// Hook for long press gesture
export function useLongPress(
  callback: () => void,
  duration: number = 500
) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const startLongPress = useCallback(() => {
    setIsLongPressing(true);
    timeoutRef.current = setTimeout(() => {
      callback();
      setIsLongPressing(false);
    }, duration);
  }, [callback, duration]);
  
  const cancelLongPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    setIsLongPressing(false);
  }, []);
  
  const handlers = {
    onTouchStart: startLongPress,
    onTouchEnd: cancelLongPress,
    onTouchCancel: cancelLongPress,
    onMouseDown: startLongPress,
    onMouseUp: cancelLongPress,
    onMouseLeave: cancelLongPress,
  };
  
  return {
    isLongPressing,
    handlers,
  };
}

// Hook for touch feedback
export function useTouchFeedback(
  feedbackType: TouchFeedback = 'active'
) {
  const [isTouching, setIsTouching] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const touchHandlers = {
    onTouchStart: () => setIsTouching(true),
    onTouchEnd: () => setIsTouching(false),
    onTouchCancel: () => setIsTouching(false),
    onMouseEnter: () => setIsHovering(true),
    onMouseLeave: () => setIsHovering(false),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };
  
  const getFeedbackClass = () => {
    const classes = [];
    
    if (feedbackType === 'active' && isTouching) {
      classes.push('scale-95', 'opacity-80');
    }
    
    if (feedbackType === 'hover' && isHovering) {
      classes.push('scale-105', 'opacity-90');
    }
    
    if (feedbackType === 'focus' && isFocused) {
      classes.push('ring-2', 'ring-primary', 'ring-offset-2');
    }
    
    return classes.join(' ');
  };
  
  return {
    isTouching,
    isHovering,
    isFocused,
    touchHandlers,
    getFeedbackClass,
  };
}

// Hook for touch target optimization
export function useTouchTarget(
  elementRef: React.RefObject<HTMLElement>,
  size: number = TOUCH_TARGET_SIZES.MINIMUM
) {
  useEffect(() => {
    if (elementRef.current) {
      ensureTouchTarget(elementRef.current, size);
    }
  }, [elementRef, size]);
  
  return {
    style: {
      minWidth: `${size}px`,
      minHeight: `${size}px`,
      padding: `max(0px, (${size}px - min(width, height)) / 2)`,
    },
  };
}

// Hook for mobile-optimized interactions
export function useMobileInteractions() {
  const { hasTouch } = getDeviceCapabilities();
  
  // Disable hover effects on touch devices
  const disableHover = useCallback((element: HTMLElement) => {
    if (hasTouch) {
      element.style.pointerEvents = 'none';
    }
  }, [hasTouch]);
  
  // Enable hover effects on non-touch devices
  const enableHover = useCallback((element: HTMLElement) => {
    if (!hasTouch) {
      element.style.pointerEvents = 'auto';
    }
  }, [hasTouch]);
  
  // Get appropriate interaction handlers
  const getInteractionHandlers = useCallback(() => {
    if (hasTouch) {
      return {
        onClick: undefined,
        onTouchStart: undefined,
        onTouchEnd: undefined,
      };
    } else {
      return {
        onClick: undefined,
        onMouseEnter: undefined,
        onMouseLeave: undefined,
      };
    }
  }, [hasTouch]);
  
  return {
    hasTouch,
    disableHover,
    enableHover,
    getInteractionHandlers,
  };
}

// Utility for mobile-optimized animations
export function getMobileAnimation(
  desktopAnimation: string,
  mobileAnimation?: string
): string {
  const { hasTouch, hasReducedMotion } = getDeviceCapabilities();
  
  if (hasReducedMotion) {
    return 'none';
  }
  
  if (hasTouch && mobileAnimation) {
    return mobileAnimation;
  }
  
  return desktopAnimation;
}

// Export everything
export const touch = {
  TOUCH_TARGET_SIZES,
  ensureTouchTarget,
  addTouchFeedback,
  useSwipeGesture,
  useLongPress,
  useTouchFeedback,
  useTouchTarget,
  useMobileInteractions,
  getMobileAnimation,
};
