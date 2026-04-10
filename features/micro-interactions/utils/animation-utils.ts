/**
 * Animation utilities for consistent micro-interactions
 */

// Animation timing constants
export const ANIMATION_TIMING = {
  FAST: '100ms',
  STANDARD: '200ms',
  SLOW: '300ms',
  VERY_SLOW: '500ms',
} as const;

// Easing functions
export const EASING = {
  LINEAR: 'linear',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Scale factors for hover/active states
export const SCALE = {
  HOVER: 1.05,
  ACTIVE: 0.95,
  FOCUS: 1.02,
  PRESS: 0.98,
} as const;

// Opacity levels
export const OPACITY = {
  DISABLED: 0.5,
  HOVER: 0.9,
  ACTIVE: 0.8,
  FOCUS: 0.95,
  GHOST: 0.7,
} as const;

// Shadow elevations
export const SHADOW = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  HOVER: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 2px rgba(59, 130, 246, 0.5)',
  FOCUS: '0 0 0 3px rgba(59, 130, 246, 0.3)',
} as const;

// Transition presets
export const TRANSITION_PRESETS = {
  HOVER: {
    property: 'all',
    duration: ANIMATION_TIMING.STANDARD,
    timing: EASING.EASE_IN_OUT,
  },
  FOCUS: {
    property: 'box-shadow, transform',
    duration: ANIMATION_TIMING.FAST,
    timing: EASING.EASE_OUT,
  },
  ACTIVE: {
    property: 'transform',
    duration: ANIMATION_TIMING.FAST,
    timing: EASING.EASE_IN,
  },
  COLOR: {
    property: 'background-color, border-color, color, fill, stroke',
    duration: ANIMATION_TIMING.STANDARD,
    timing: EASING.EASE_IN_OUT,
  },
  OPACITY: {
    property: 'opacity',
    duration: ANIMATION_TIMING.STANDARD,
    timing: EASING.EASE_IN_OUT,
  },
  TRANSFORM: {
    property: 'transform',
    duration: ANIMATION_TIMING.STANDARD,
    timing: EASING.EASE_IN_OUT,
  },
  HEIGHT: {
    property: 'height, max-height, min-height',
    duration: ANIMATION_TIMING.SLOW,
    timing: EASING.EASE_IN_OUT,
  },
  WIDTH: {
    property: 'width, max-width, min-width',
    duration: ANIMATION_TIMING.SLOW,
    timing: EASING.EASE_IN_OUT,
  },
} as const;

// Animation keyframes
export const KEYFRAMES = {
  FADE_IN: `
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  FADE_OUT: `
    from { opacity: 1; }
    to { opacity: 0; }
  `,
  SLIDE_IN_UP: `
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `,
  SLIDE_IN_DOWN: `
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  `,
  SLIDE_IN_LEFT: `
    from { transform: translateX(10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `,
  SLIDE_IN_RIGHT: `
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `,
  SCALE_IN: `
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  `,
  SCALE_OUT: `
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(0.95); opacity: 0; }
  `,
  BOUNCE_IN: `
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  `,
  SHAKE: `
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  `,
  PULSE: `
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  `,
  SPIN: `
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `,
  PING: `
    75%, 100% { transform: scale(2); opacity: 0; }
  `,
  SHIMMER: `
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  `,
} as const;

// Utility functions
export function createTransition(preset: keyof typeof TRANSITION_PRESETS, customDuration?: string): string {
  const { property, duration, timing } = TRANSITION_PRESETS[preset];
  return `${property} ${customDuration || duration} ${timing}`;
}

export function createAnimation(
  keyframe: keyof typeof KEYFRAMES,
  duration: string = ANIMATION_TIMING.STANDARD,
  timing: string = EASING.EASE_IN_OUT,
  iterationCount: string = '1'
): string {
  return `${keyframe.toLowerCase().replace(/_/g, '-')} ${duration} ${timing} ${iterationCount}`;
}

export function getReducedMotionMediaQuery(): string {
  return '@media (prefers-reduced-motion: reduce)';
}

export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function withReducedMotion<T>(normalValue: T, reducedValue: T): T {
  return shouldReduceMotion() ? reducedValue : normalValue;
}

// CSS utility classes generation
export function generateAnimationClasses(): Record<string, string> {
  return {
    'animate-fade-in': `animation: ${createAnimation('FADE_IN')};`,
    'animate-fade-out': `animation: ${createAnimation('FADE_OUT')};`,
    'animate-slide-in-up': `animation: ${createAnimation('SLIDE_IN_UP')};`,
    'animate-slide-in-down': `animation: ${createAnimation('SLIDE_IN_DOWN')};`,
    'animate-slide-in-left': `animation: ${createAnimation('SLIDE_IN_LEFT')};`,
    'animate-slide-in-right': `animation: ${createAnimation('SLIDE_IN_RIGHT')};`,
    'animate-scale-in': `animation: ${createAnimation('SCALE_IN')};`,
    'animate-scale-out': `animation: ${createAnimation('SCALE_OUT')};`,
    'animate-bounce-in': `animation: ${createAnimation('BOUNCE_IN', ANIMATION_TIMING.SLOW, EASING.BOUNCE)};`,
    'animate-shake': `animation: ${createAnimation('SHAKE', ANIMATION_TIMING.SLOW)};`,
    'animate-pulse': `animation: ${createAnimation('PULSE', '2s', EASING.EASE_IN_OUT, 'infinite')};`,
    'animate-spin': `animation: ${createAnimation('SPIN', '1s', 'linear', 'infinite')};`,
    'animate-ping': `animation: ${createAnimation('PING', '1s', EASING.EASE_OUT, 'infinite')};`,
    'animate-shimmer': `animation: ${createAnimation('SHIMMER', '2s', 'linear', 'infinite')};`,
    
    'transition-hover': `transition: ${createTransition('HOVER')};`,
    'transition-focus': `transition: ${createTransition('FOCUS')};`,
    'transition-active': `transition: ${createTransition('ACTIVE')};`,
    'transition-color': `transition: ${createTransition('COLOR')};`,
    'transition-opacity': `transition: ${createTransition('OPACITY')};`,
    'transition-transform': `transition: ${createTransition('TRANSFORM')};`,
    'transition-height': `transition: ${createTransition('HEIGHT')};`,
    'transition-width': `transition: ${createTransition('WIDTH')};`,
    
    'hover-scale': `&:hover { transform: scale(${SCALE.HOVER}); }`,
    'active-scale': `&:active { transform: scale(${SCALE.ACTIVE}); }`,
    'focus-scale': `&:focus { transform: scale(${SCALE.FOCUS}); }`,
    
    'hover-shadow': `&:hover { box-shadow: ${SHADOW.HOVER}; }`,
    'focus-shadow': `&:focus { box-shadow: ${SHADOW.FOCUS}; }`,
    
    'hover-opacity': `&:hover { opacity: ${OPACITY.HOVER}; }`,
    'active-opacity': `&:active { opacity: ${OPACITY.ACTIVE}; }`,
    'disabled-opacity': `&:disabled { opacity: ${OPACITY.DISABLED}; }`,
  };
}

// Performance optimization
export function willChange(properties: string[]): { willChange: string } {
  return {
    willChange: properties.join(', '),
  };
}

export function useHardwareAcceleration(): { transform: string } {
  return {
    transform: 'translateZ(0)',
  };
}

// Accessibility utilities
export function getFocusStyles(): string {
  return `
    &:focus-visible {
      outline: 2px solid rgba(59, 130, 246, 0.5);
      outline-offset: 2px;
      box-shadow: ${SHADOW.FOCUS};
    }
    
    &:focus:not(:focus-visible) {
      outline: none;
    }
  `;
}

export function getReducedMotionStyles(): string {
  return `
    ${getReducedMotionMediaQuery()} {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
}
