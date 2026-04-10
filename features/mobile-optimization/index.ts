// Device Detection & Capabilities
export { device } from './utils/device-detection';
export type { DeviceType, InputType, ScreenOrientation, DeviceCapabilities } from './utils/device-detection';
export { BREAKPOINTS } from './utils/device-detection';

// Touch Optimization
export { touch } from './utils/touch-optimization';
export type { SwipeConfig, SwipeDirection, SwipeResult, TouchFeedback } from './utils/touch-optimization';
export { TOUCH_TARGET_SIZES } from './utils/touch-optimization';

// Responsive Layout
export { layout } from './utils/responsive-layout';
export type { 
  ResponsiveContainerProps, 
  ResponsiveGridProps, 
  ResponsiveFlexProps, 
  ResponsiveTextProps,
  ResponsiveVisibilityProps 
} from './utils/responsive-layout';
export { CONTAINER_SIZES, SPACING, GRID_CONFIGS, TYPOGRAPHY } from './utils/responsive-layout';

// Mobile-Optimized Modals
export { modal } from './components/mobile-modal';
export type { 
  MobileModalProps, 
  ModalPosition, 
  ModalSize,
  BottomSheetProps,
  QuickActionSheetProps 
} from './components/mobile-modal';

// Swipe Gestures
export { swipe } from './components/swipe-gestures';
export type { 
  SwipeableItemProps, 
  SwipeAction,
  SwipeToDeleteProps,
  SwipeToCompleteProps,
  SwipeToArchiveProps,
  MultiActionSwipeProps 
} from './components/swipe-gestures';
export { SWIPE_ACTIONS } from './components/swipe-gestures';

// Hooks
export { 
  useDeviceCapabilities,
  useDeviceType,
  useInputType,
  useScreenOrientation,
  useHasTouch,
  useHasHover,
  useScreenSize,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useSafeAreaInsets,
} from './utils/device-detection';

export {
  useSwipeGesture,
  useLongPress,
  useTouchFeedback,
  useTouchTarget,
  useMobileInteractions,
} from './utils/touch-optimization';

export {
  useResponsiveSpacing,
  useResponsiveValue,
} from './utils/responsive-layout';

export {
  useMobileModal,
} from './components/mobile-modal';

export {
  useSwipeableItem,
} from './components/swipe-gestures';

// Complete Mobile Optimization System
export const Mobile = {
  // Utilities
  device,
  touch,
  layout,
  
  // Components
  modal,
  swipe,
  
  // Hooks
  useDeviceCapabilities,
  useDeviceType,
  useInputType,
  useScreenOrientation,
  useHasTouch,
  useHasHover,
  useScreenSize,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useSafeAreaInsets,
  useSwipeGesture,
  useLongPress,
  useTouchFeedback,
  useTouchTarget,
  useMobileInteractions,
  useResponsiveSpacing,
  useResponsiveValue,
  useMobileModal,
  useSwipeableItem,
  
  // Constants
  BREAKPOINTS,
  TOUCH_TARGET_SIZES,
  CONTAINER_SIZES,
  SPACING,
  GRID_CONFIGS,
  TYPOGRAPHY,
  SWIPE_ACTIONS,
};
