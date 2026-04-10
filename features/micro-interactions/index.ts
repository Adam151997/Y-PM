// Export all micro-interaction components and utilities
export * from './components/animation-provider';
export * from './components/skeleton-loader';
export * from './components/toast-notifications';
export * from './components/tooltip-system';
export * from './components/drag-feedback';

// Export utilities
export * from './utils/animation-utils';
export * from './utils/hover-effects';
export * from './utils/focus-management';
export * from './utils/reduced-motion';

// Export hooks
export { useAnimation } from './components/animation-provider';
export { useToast, useToastHelpers } from './components/toast-notifications';
export { useTooltip } from './components/tooltip-system';
export { useDrag } from './components/drag-feedback';
export { useReducedMotion } from './utils/reduced-motion';

// Convenience exports
export const MicroInteractions = {
  // Components
  AnimationProvider: require('./components/animation-provider').AnimationProvider,
  Skeleton: require('./components/skeleton-loader').Skeleton,
  Skeletons: require('./components/skeleton-loader').Skeletons,
  ToastProvider: require('./components/toast-notifications').ToastProvider,
  ToastSystem: require('./components/toast-notifications').ToastSystem,
  TooltipProvider: require('./components/tooltip-system').TooltipProvider,
  Tooltip: require('./components/tooltip-system').Tooltip,
  SimpleTooltip: require('./components/tooltip-system').SimpleTooltip,
  TooltipSystem: require('./components/tooltip-system').TooltipSystem,
  DragProvider: require('./components/drag-feedback').DragProvider,
  DragHandle: require('./components/drag-feedback').DragHandle,
  Draggable: require('./components/drag-feedback').Draggable,
  DropZone: require('./components/drag-feedback').DropZone,
  SortableItem: require('./components/drag-feedback').SortableItem,
  DragSystem: require('./components/drag-feedback').DragSystem,
  
  // Hooks
  useAnimation: require('./components/animation-provider').useAnimation,
  useToast: require('./components/toast-notifications').useToast,
  useToastHelpers: require('./components/toast-notifications').useToastHelpers,
  useTooltip: require('./components/tooltip-system').useTooltip,
  useDrag: require('./components/drag-feedback').useDrag,
  useReducedMotion: require('./utils/reduced-motion').useReducedMotion,
  
  // Utilities
  animationUtils: require('./utils/animation-utils'),
  hoverEffects: require('./utils/hover-effects'),
  focusManagement: require('./utils/focus-management'),
  reducedMotion: require('./utils/reduced-motion').reducedMotion,
};
