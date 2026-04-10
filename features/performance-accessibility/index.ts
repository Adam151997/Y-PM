// Performance Optimization
export { performance } from './utils/performance-optimization';
export type {
  PerformanceMetrics,
  PerformanceEntryType,
  LazyLoadConfig,
  ImageOptimizationConfig,
  PerformanceBudget,
} from './utils/performance-optimization';

// Accessibility Utilities
export { accessibility } from './utils/accessibility-utilities';
export type {
  AccessibilityLevel,
  AriaProps,
  FocusManager,
  ScreenReaderAnnouncement,
} from './utils/accessibility-utilities';

// Next.js Configuration Enhancement
export { default as nextConfigEnhancement } from './utils/next-config-enhancement';

// Hooks
export {
  usePerformanceMetrics,
  useLazyLoad,
  useImageOptimization,
  useVirtualization,
  useRequestAnimationFrame,
  useCleanupOnUnmount,
  useBatchState,
} from './utils/performance-optimization';

export {
  useFocusManager,
  useScreenReaderAnnouncement,
  useSkipLinks,
  useReducedMotion,
  useColorScheme,
  useHighContrastMode,
  useFocusVisible,
  useAccessibleModal,
} from './utils/accessibility-utilities';

// Utilities
export {
  debounce,
  throttle,
  memoizeWithExpiry,
  lazyImport,
  prefetchResource,
  preloadResource,
  checkPerformanceBudget,
} from './utils/performance-optimization';

export {
  handleKeyboardNavigation,
} from './utils/accessibility-utilities';

// Constants
export {
  CONTRAST_RATIOS,
  ARIA_ROLES,
} from './utils/accessibility-utilities';

// Complete Performance & Accessibility System
export const PerformanceAccessibility = {
  // Performance
  performance,
  
  // Accessibility
  accessibility,
  
  // Next.js Configuration
  nextConfigEnhancement,
  
  // Hooks
  usePerformanceMetrics,
  useLazyLoad,
  useImageOptimization,
  useVirtualization,
  useRequestAnimationFrame,
  useCleanupOnUnmount,
  useBatchState,
  useFocusManager,
  useScreenReaderAnnouncement,
  useSkipLinks,
  useReducedMotion,
  useColorScheme,
  useHighContrastMode,
  useFocusVisible,
  useAccessibleModal,
  
  // Utilities
  debounce,
  throttle,
  memoizeWithExpiry,
  lazyImport,
  prefetchResource,
  preloadResource,
  checkPerformanceBudget,
  handleKeyboardNavigation,
  
  // Constants
  CONTRAST_RATIOS,
  ARIA_ROLES,
};

// Short alias
export const PA = PerformanceAccessibility;
