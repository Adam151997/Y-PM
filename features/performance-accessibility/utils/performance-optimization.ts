/**
 * Performance optimization utilities for optimal web performance
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Performance metrics
export interface PerformanceMetrics {
  timeToFirstByte?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  totalBlockingTime?: number;
  timeToInteractive?: number;
}

// Performance observer types
export type PerformanceEntryType = 
  | 'navigation'
  | 'resource'
  | 'paint'
  | 'largest-contentful-paint'
  | 'first-input'
  | 'layout-shift'
  | 'longtask';

// Lazy loading configuration
export interface LazyLoadConfig {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

// Image optimization configuration
export interface ImageOptimizationConfig {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func(...args);
    }
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoize utility with cache expiration
export function memoizeWithExpiry<T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 60000 // 1 minute default
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>();
  
  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }
    
    const result = func(...args);
    cache.set(key, {
      value: result,
      expiry: Date.now() + ttl,
    });
    
    // Clean up expired entries
    setTimeout(() => {
      for (const [cacheKey, entry] of cache.entries()) {
        if (Date.now() >= entry.expiry) {
          cache.delete(cacheKey);
        }
      }
    }, ttl);
    
    return result;
  };
}

// Hook for performance monitoring
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      setIsSupported(true);
      
      // Observe paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            setMetrics(prev => ({ ...prev, firstPaint: entry.startTime }));
          } else if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }));
          }
        }
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
      
      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, largestContentfulPaint: lastEntry.startTime }));
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        setMetrics(prev => ({ ...prev, cumulativeLayoutShift: cls }));
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => ({ 
            ...prev, 
            firstInputDelay: (entry as any).processingStart - entry.startTime 
          }));
        }
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      return () => {
        paintObserver.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);
  
  return { metrics, isSupported };
}

// Hook for lazy loading with Intersection Observer
export function useLazyLoad<T extends HTMLElement = HTMLElement>(
  config: LazyLoadConfig = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);
  
  const { 
    root = null, 
    rootMargin = '0px', 
    threshold = 0, 
    enabled = true 
  } = config;
  
  useEffect(() => {
    if (!enabled || !elementRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { root, rootMargin, threshold }
    );
    
    observer.observe(elementRef.current);
    
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, enabled]);
  
  return { elementRef, isVisible };
}

// Hook for image optimization
export function useImageOptimization(
  src: string,
  config: Partial<ImageOptimizationConfig> = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const {
    width,
    height,
    quality = 75,
    format = 'webp',
    loading = 'lazy',
    decoding = 'async',
    fetchPriority = 'auto',
  } = config;
  
  // Generate optimized image URL
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    // In a real implementation, this would use an image CDN or optimization service
    // For now, we'll return the original src
    return src;
    
    // Example with imaginary image optimization service:
    // return `https://images.example.com/${encodeURIComponent(src)}?w=${width}&h=${height}&q=${quality}&format=${format}`;
  }, [src, width, height, quality, format]);
  
  // Generate srcSet for responsive images
  const srcSet = useMemo(() => {
    if (!width || !src) return '';
    
    const sizes = [width, width * 2, width * 3];
    return sizes
      .map(size => `${optimizedSrc}?w=${size} ${size}w`)
      .join(', ');
  }, [optimizedSrc, width]);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);
  
  const handleError = useCallback((error: Error) => {
    setIsLoaded(false);
    setError(error);
  }, []);
  
  return {
    src: optimizedSrc,
    srcSet,
    isLoaded,
    error,
    loading,
    decoding,
    fetchPriority,
    onLoad: handleLoad,
    onError: handleError,
  };
}

// Hook for virtualized lists (windowing)
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerRef: React.RefObject<HTMLElement>,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };
    
    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };
    
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial measurements
    handleResize();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);
  
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
  };
}

// Hook for request animation frame optimization
export function useRequestAnimationFrame(
  callback: (time: number) => void,
  dependencies: any[] = []
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      callback(time - previousTimeRef.current);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, ...dependencies]);
}

// Hook for memory optimization (cleanup on unmount)
export function useCleanupOnUnmount(cleanupFunction: () => void) {
  useEffect(() => {
    return cleanupFunction;
  }, [cleanupFunction]);
}

// Hook for batch state updates
export function useBatchState<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const batchUpdate = useCallback((updater: (prev: T) => T) => {
    batchRef.current.push(updater);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        let result = prev;
        for (const update of batchRef.current) {
          result = update(result);
        }
        batchRef.current = [];
        return result;
      });
    }, 0);
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, batchUpdate] as const;
}

// Utility for code splitting
export function lazyImport<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return React.lazy(() => 
    importFunc().catch(error => {
      // Handle chunk loading errors gracefully
      console.error('Chunk loading failed:', error);
      return { default: () => <div>Failed to load component</div> } as any;
    })
  );
}

// Utility for prefetching
export function prefetchResource(url: string, as: 'script' | 'style' | 'font' | 'image' = 'script') {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

// Utility for preloading
export function preloadResource(url: string, as: 'script' | 'style' | 'font' | 'image' = 'script') {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

// Performance budget monitoring
export interface PerformanceBudget {
  maxBundleSize?: number; // in KB
  maxImageSize?: number; // in KB
  maxRequests?: number;
  maxLcp?: number; // in ms
  maxFid?: number; // in ms
  maxCls?: number; // score
}

export function checkPerformanceBudget(metrics: PerformanceMetrics, budget: PerformanceBudget): string[] {
  const violations: string[] = [];
  
  if (budget.maxLcp && metrics.largestContentfulPaint && metrics.largestContentfulPaint > budget.maxLcp) {
    violations.push(`LCP ${metrics.largestContentfulPaint}ms exceeds budget ${budget.maxLcp}ms`);
  }
  
  if (budget.maxFid && metrics.firstInputDelay && metrics.firstInputDelay > budget.maxFid) {
    violations.push(`FID ${metrics.firstInputDelay}ms exceeds budget ${budget.maxFid}ms`);
  }
  
  if (budget.maxCls && metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > budget.maxCls) {
    violations.push(`CLS ${metrics.cumulativeLayoutShift} exceeds budget ${budget.maxCls}`);
  }
  
  return violations;
}

// Export everything
export const performance = {
  debounce,
  throttle,
  memoizeWithExpiry,
  usePerformanceMetrics,
  useLazyLoad,
  useImageOptimization,
  useVirtualization,
  useRequestAnimationFrame,
  useCleanupOnUnmount,
  useBatchState,
  lazyImport,
  prefetchResource,
  preloadResource,
  checkPerformanceBudget,
};
