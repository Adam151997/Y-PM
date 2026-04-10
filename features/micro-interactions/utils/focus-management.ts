/**
 * Focus management utilities for accessibility and keyboard navigation
 */

import { useEffect, useRef, useState } from 'react';
import { SHADOW, getFocusStyles } from './animation-utils';

// Focus trap configuration
export interface FocusTrapOptions {
  initialFocus?: boolean;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  returnFocusOnDeactivate?: boolean;
  fallbackFocus?: string;
}

// Focusable elements selector
export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll(FOCUSABLE_ELEMENTS)
  ) as HTMLElement[];
}

// Check if element is focusable
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  
  // Check if element is visible
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  // Check if element is disabled
  if (element.hasAttribute('disabled')) {
    return false;
  }
  
  return element.matches(FOCUSABLE_ELEMENTS);
}

// Focus trap hook
export function useFocusTrap(
  active: boolean = true,
  options: FocusTrapOptions = {}
) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const {
    initialFocus = true,
    escapeDeactivates = true,
    clickOutsideDeactivates = false,
    returnFocusOnDeactivate = true,
    fallbackFocus = '',
  } = options;

  // Focus first focusable element
  const focusFirstElement = () => {
    if (!containerRef.current) return;
    
    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else if (fallbackFocus && containerRef.current.querySelector(fallbackFocus)) {
      const fallback = containerRef.current.querySelector(fallbackFocus) as HTMLElement;
      fallback.focus();
    }
  };

  // Focus last focusable element
  const focusLastElement = () => {
    if (!containerRef.current) return;
    
    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  };

  // Handle tab key navigation within trap
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!active || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

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
    } else if (escapeDeactivates && event.key === 'Escape') {
      event.preventDefault();
      // Dispatch custom event for escape
      containerRef.current.dispatchEvent(
        new CustomEvent('focus-trap-escape', { bubbles: true })
      );
    }
  };

  // Handle click outside
  const handleClickOutside = (event: MouseEvent) => {
    if (!active || !containerRef.current || !clickOutsideDeactivates) return;
    
    if (!containerRef.current.contains(event.target as Node)) {
      containerRef.current.dispatchEvent(
        new CustomEvent('focus-trap-click-outside', { bubbles: true })
      );
    }
  };

  // Set up focus trap
  useEffect(() => {
    if (!active) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus initial element
    if (initialFocus) {
      setTimeout(() => {
        focusFirstElement();
      }, 0);
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    if (clickOutsideDeactivates) {
      document.addEventListener('click', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      
      // Return focus to previous element
      if (returnFocusOnDeactivate && previousFocusRef.current) {
        setTimeout(() => {
          if (document.body.contains(previousFocusRef.current)) {
            previousFocusRef.current.focus();
          }
        }, 0);
      }
    };
  }, [active]);

  return containerRef;
}

// Focus management hook for sequential navigation
export function useSequentialFocus(elements: HTMLElement[] = []) {
  const [currentIndex, setCurrentIndex] = useState(-1);

  const focusNext = () => {
    if (elements.length === 0) return;
    
    const nextIndex = currentIndex >= elements.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
    elements[nextIndex]?.focus();
  };

  const focusPrevious = () => {
    if (elements.length === 0) return;
    
    const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    elements[prevIndex]?.focus();
  };

  const focusFirst = () => {
    if (elements.length === 0) return;
    
    setCurrentIndex(0);
    elements[0]?.focus();
  };

  const focusLast = () => {
    if (elements.length === 0) return;
    
    setCurrentIndex(elements.length - 1);
    elements[elements.length - 1]?.focus();
  };

  const focusIndex = (index: number) => {
    if (index >= 0 && index < elements.length) {
      setCurrentIndex(index);
      elements[index]?.focus();
    }
  };

  return {
    currentIndex,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusIndex,
  };
}

// Keyboard navigation detection
export function useKeyboardNavigation() {
  const [usingKeyboard, setUsingKeyboard] = useState(false);

  useEffect(() => {
    const handleKeyDown = () => {
      setUsingKeyboard(true);
      document.body.classList.add('using-keyboard');
    };

    const handleMouseDown = () => {
      setUsingKeyboard(false);
      document.body.classList.remove('using-keyboard');
    };

    const handleTouchStart = () => {
      setUsingKeyboard(false);
      document.body.classList.remove('using-keyboard');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.body.classList.remove('using-keyboard');
    };
  }, []);

  return usingKeyboard;
}

// Focus styles utilities
export const FOCUS_STYLES = {
  RING: `
    &:focus-visible {
      outline: 2px solid rgba(59, 130, 246, 0.5);
      outline-offset: 2px;
      box-shadow: ${SHADOW.FOCUS};
    }
    
    &:focus:not(:focus-visible) {
      outline: none;
    }
  `,
  
  GLOW: `
    &:focus-visible {
      box-shadow: ${SHADOW.FOCUS};
      outline: none;
    }
  `,
  
  UNDERLINE: `
    &:focus-visible {
      text-decoration: underline;
      text-decoration-color: rgba(59, 130, 246, 0.5);
      text-decoration-thickness: 2px;
      text-underline-offset: 4px;
      outline: none;
    }
  `,
  
  BACKGROUND: `
    &:focus-visible {
      background-color: rgba(59, 130, 246, 0.1);
      outline: none;
    }
  `,
  
  BORDER: `
    &:focus-visible {
      border-color: rgba(59, 130, 246, 0.5);
      border-width: 2px;
      outline: none;
    }
  `,
};

// Programmatic focus utilities
export function focusElement(selector: string | HTMLElement): boolean {
  let element: HTMLElement | null;
  
  if (typeof selector === 'string') {
    element = document.querySelector(selector);
  } else {
    element = selector;
  }
  
  if (element && isFocusable(element)) {
    element.focus();
    return true;
  }
  
  return false;
}

export function focusNextElement(currentElement: HTMLElement): boolean {
  const allFocusable = Array.from(
    document.querySelectorAll(FOCUSABLE_ELEMENTS)
  ) as HTMLElement[];
  
  const currentIndex = allFocusable.indexOf(currentElement);
  if (currentIndex === -1) return false;
  
  const nextIndex = (currentIndex + 1) % allFocusable.length;
  allFocusable[nextIndex]?.focus();
  return true;
}

export function focusPreviousElement(currentElement: HTMLElement): boolean {
  const allFocusable = Array.from(
    document.querySelectorAll(FOCUSABLE_ELEMENTS)
  ) as HTMLElement[];
  
  const currentIndex = allFocusable.indexOf(currentElement);
  if (currentIndex === -1) return false;
  
  const prevIndex = currentIndex === 0 ? allFocusable.length - 1 : currentIndex - 1;
  allFocusable[prevIndex]?.focus();
  return true;
}

// Scroll into view with focus
export function scrollIntoViewWithFocus(
  element: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
): void {
  element.scrollIntoView(options);
  setTimeout(() => {
    element.focus();
  }, options.behavior === 'smooth' ? 300 : 0);
}

// Focus within viewport check
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Auto-focus on mount hook
export function useAutoFocus<T extends HTMLElement = HTMLElement>(
  shouldFocus: boolean = true,
  options: FocusOptions = { preventScroll: false }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && ref.current && isFocusable(ref.current)) {
      ref.current.focus(options);
    }
  }, [shouldFocus, options]);

  return ref;
}

// Focus restoration on unmount
export function useFocusRestoration(restoreOnUnmount: boolean = true) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    return () => {
      if (restoreOnUnmount && previousFocusRef.current) {
        setTimeout(() => {
          if (document.body.contains(previousFocusRef.current)) {
            previousFocusRef.current.focus();
          }
        }, 0);
      }
    };
  }, [restoreOnUnmount]);

  return previousFocusRef;
}

// Focus group management
export function useFocusGroup() {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const elementsRef = useRef<HTMLElement[]>([]);

  const registerElement = (element: HTMLElement | null) => {
    if (!element) return;
    
    if (!elementsRef.current.includes(element)) {
      elementsRef.current.push(element);
    }
  };

  const unregisterElement = (element: HTMLElement) => {
    const index = elementsRef.current.indexOf(element);
    if (index > -1) {
      elementsRef.current.splice(index, 1);
      if (focusedIndex >= index) {
        setFocusedIndex(Math.max(0, focusedIndex - 1));
      }
    }
  };

  const focusNext = () => {
    if (elementsRef.current.length === 0) return;
    
    const nextIndex = (focusedIndex + 1) % elementsRef.current.length;
    setFocusedIndex(nextIndex);
    elementsRef.current[nextIndex]?.focus();
  };

  const focusPrevious = () => {
    if (elementsRef.current.length === 0) return;
    
    const prevIndex = focusedIndex <= 0 
      ? elementsRef.current.length - 1 
      : focusedIndex - 1;
    setFocusedIndex(prevIndex);
    elementsRef.current[prevIndex]?.focus();
  };

  const focusIndex = (index: number) => {
    if (index >= 0 && index < elementsRef.current.length) {
      setFocusedIndex(index);
      elementsRef.current[index]?.focus();
    }
  };

  return {
    focusedIndex,
    registerElement,
    unregisterElement,
    focusNext,
    focusPrevious,
    focusIndex,
    elements: elementsRef.current,
  };
}

// Export focus utilities for CSS-in-JS
export const focusUtilities = {
  ring: FOCUS_STYLES.RING,
  glow: FOCUS_STYLES.GLOW,
  underline: FOCUS_STYLES.UNDERLINE,
  background: FOCUS_STYLES.BACKGROUND,
  border: FOCUS_STYLES.BORDER,
  default: getFocusStyles(),
};
