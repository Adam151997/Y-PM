/**
 * Accessibility utilities for WCAG compliance and screen reader support
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Accessibility levels
export enum AccessibilityLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA',
}

// Color contrast ratios
export const CONTRAST_RATIOS = {
  [AccessibilityLevel.A]: {
    normal: 4.5,
    large: 3.0,
  },
  [AccessibilityLevel.AA]: {
    normal: 4.5,
    large: 3.0,
  },
  [AccessibilityLevel.AAA]: {
    normal: 7.0,
    large: 4.5,
  },
};

// ARIA roles
export const ARIA_ROLES = {
  // Landmark roles
  banner: 'banner',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  form: 'form',
  search: 'search',
  
  // Widget roles
  button: 'button',
  checkbox: 'checkbox',
  dialog: 'dialog',
  link: 'link',
  menuitem: 'menuitem',
  option: 'option',
  progressbar: 'progressbar',
  radio: 'radio',
  slider: 'slider',
  switch: 'switch',
  tab: 'tab',
  tabpanel: 'tabpanel',
  textbox: 'textbox',
  
  // Live region roles
  alert: 'alert',
  log: 'log',
  marquee: 'marquee',
  status: 'status',
  timer: 'timer',
} as const;

// ARIA properties
export interface AriaProps {
  role?: keyof typeof ARIA_ROLES | string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-busy'?: boolean | 'true' | 'false';
  'aria-disabled'?: boolean | 'true' | 'false';
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
  'aria-selected'?: boolean | 'true' | 'false';
  'aria-checked'?: boolean | 'true' | 'false' | 'mixed';
  'aria-current'?: boolean | 'true' | 'false' | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-activedescendant'?: string;
  'aria-atomic'?: boolean | 'true' | 'false';
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all' | 'additions text';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
}

// Focus management
export interface FocusManager {
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
  trapFocus: (element: HTMLElement) => void;
  releaseFocus: () => void;
  restoreFocus: () => void;
}

// Screen reader announcement
export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timeout?: number;
}

// Hook for focus management
export function useFocusManager(containerRef: React.RefObject<HTMLElement>) {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');
  
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[];
  }, [containerRef, focusableSelector]);
  
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);
  
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);
  
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex >= 0 && currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus();
    } else if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);
  
  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex > 0) {
      elements[currentIndex - 1].focus();
    } else if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);
  
  const trapFocus = useCallback((element: HTMLElement) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [getFocusableElements]);
  
  const releaseFocus = useCallback(() => {
    // Implementation would release focus trap
  }, []);
  
  const restoreFocus = useCallback(() => {
    // Implementation would restore previous focus
  }, []);
  
  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapFocus,
    releaseFocus,
    restoreFocus,
    getFocusableElements,
  };
}

// Hook for screen reader announcements
export function useScreenReaderAnnouncement() {
  const [announcements, setAnnouncements] = useState<ScreenReaderAnnouncement[]>([]);
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite', timeout?: number) => {
    const announcement: ScreenReaderAnnouncement = { message, priority, timeout };
    setAnnouncements(prev => [...prev, announcement]);
    
    if (timeout) {
      setTimeout(() => {
        setAnnouncements(prev => prev.filter(a => a !== announcement));
      }, timeout);
    }
  }, []);
  
  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);
  
  return {
    announcements,
    announce,
    clearAnnouncements,
  };
}

// Hook for skip links
export function useSkipLinks(links: Array<{ id: string; label: string }>) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !isVisible) {
        setIsVisible(true);
      }
    };
    
    const handleClick = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, [isVisible]);
  
  return {
    isVisible,
    links,
  };
}

// Hook for reduced motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    setPrefersReducedMotion(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return prefersReducedMotion;
}

// Hook for color scheme preferences
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'no-preference'>('no-preference');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light');
    };
    
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return colorScheme;
}

// Hook for high contrast mode
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };
    
    setIsHighContrast(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return isHighContrast;
}

// Utility for keyboard navigation
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  options: {
    onEnter?: () => void;
    onEscape?: () => void;
    onSpace?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    onTab?: () => void;
    onShiftTab?: () => void;
  }
) {
  const { key, shiftKey } = event;
  
  switch (key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (key === 'Enter' && options.onEnter) {
        options.onEnter();
      } else if (key === ' ' && options.onSpace) {
        options.onSpace();
      }
      break;
      
    case 'Escape':
      if (options.onEscape) {
        options.onEscape();
      }
      break;
      
    case 'ArrowUp':
      if (options.onArrowUp) {
        options.onArrowUp();
      }
      break;
      
    case 'ArrowDown':
      if (options.onArrowDown) {
        options.onArrowDown();
      }
      break;
      
    case 'ArrowLeft':
      if (options.onArrowLeft) {
        options.onArrowLeft();
      }
      break;
      
    case 'ArrowRight':
      if (options.onArrowRight) {
        options.onArrowRight();
      }
      break;
      
    case 'Home':
      if (options.onHome) {
        options.onHome();
      }
      break;
      
    case 'End':
      if (options.onEnd) {
        options.onEnd();
      }
      break;
      
    case 'Tab':
      if (shiftKey && options.onShiftTab) {
        options.onShiftTab();
      } else if (!shiftKey && options.onTab) {
        options.onTab();
      }
      break;
  }
}

// Utility for focus visible polyfill
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  
  useEffect(() => {
    const handlePointerDown = () => {
      setIsFocusVisible(false);
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };
    
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return isFocusVisible;
}

// Utility for accessible modal
export function useAccessibleModal(
  isOpen: boolean,
  onClose?: () => void
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);
      
      // Trap focus
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && onClose) {
          onClose();
        }
        
        if (event.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) {
            event.preventDefault();
            return;
          }
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restore previous focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);
  
  return {
    modalRef,
    role: 'dialog' as const,
    'aria-modal': true as const,
    tabIndex: -1,
  };
}

// Export everything
export const accessibility = {
  AccessibilityLevel,
  CONTRAST_RATIOS,
  ARIA_ROLES,
  useFocusManager,
  useScreenReaderAnnouncement,
  useSkipLinks,
  useReducedMotion,
  useColorScheme,
  useHighContrastMode,
  handleKeyboardNavigation,
  useFocusVisible,
  useAccessibleModal,
};
