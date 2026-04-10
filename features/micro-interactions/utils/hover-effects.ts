/**
 * Hover state utilities for enhanced interactions
 */

import { 
  ANIMATION_TIMING, 
  EASING, 
  SCALE, 
  OPACITY, 
  SHADOW,
  TRANSITION_PRESETS,
  createTransition,
  withReducedMotion 
} from './animation-utils';

// Hover effect types
export type HoverEffect = 
  | 'scale' 
  | 'lift' 
  | 'glow' 
  | 'slide' 
  | 'rotate' 
  | 'color' 
  | 'shadow' 
  | 'border' 
  | 'combined';

// Hover effect configurations
export const HOVER_EFFECTS: Record<HoverEffect, {
  transform?: string;
  boxShadow?: string;
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
  opacity?: number;
  transition: string;
}> = {
  scale: {
    transform: `scale(${SCALE.HOVER})`,
    transition: createTransition('TRANSFORM'),
  },
  lift: {
    transform: `translateY(-2px) scale(${SCALE.HOVER})`,
    boxShadow: SHADOW.LG,
    transition: createTransition('HOVER'),
  },
  glow: {
    boxShadow: SHADOW.HOVER,
    transition: createTransition('FOCUS'),
  },
  slide: {
    transform: 'translateX(4px)',
    transition: createTransition('TRANSFORM'),
  },
  rotate: {
    transform: 'rotate(5deg)',
    transition: createTransition('TRANSFORM'),
  },
  color: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    transition: createTransition('COLOR'),
  },
  shadow: {
    boxShadow: SHADOW.XL,
    transition: createTransition('HOVER'),
  },
  border: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    borderWidth: '2px',
    transition: createTransition('COLOR'),
  },
  combined: {
    transform: `translateY(-2px) scale(${SCALE.HOVER})`,
    boxShadow: SHADOW.HOVER,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    transition: createTransition('HOVER'),
  },
};

// Active state configurations
export const ACTIVE_EFFECTS = {
  scale: {
    transform: `scale(${SCALE.ACTIVE})`,
    transition: createTransition('ACTIVE'),
  },
  press: {
    transform: `translateY(1px) scale(${SCALE.PRESS})`,
    boxShadow: SHADOW.SM,
    transition: createTransition('ACTIVE'),
  },
  color: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    transition: createTransition('COLOR'),
  },
};

// Focus state configurations
export const FOCUS_EFFECTS = {
  ring: {
    outline: '2px solid rgba(59, 130, 246, 0.5)',
    outlineOffset: '2px',
    boxShadow: SHADOW.FOCUS,
    transition: createTransition('FOCUS'),
  },
  glow: {
    boxShadow: SHADOW.FOCUS,
    transition: createTransition('FOCUS'),
  },
  scale: {
    transform: `scale(${SCALE.FOCUS})`,
    transition: createTransition('FOCUS'),
  },
};

// Utility functions
export function createHoverStyles(
  effect: HoverEffect | HoverEffect[] = 'combined',
  options?: {
    duration?: string;
    timing?: string;
    disabled?: boolean;
  }
): string {
  const effects = Array.isArray(effect) ? effect : [effect];
  const { duration, timing, disabled = false } = options || {};
  
  if (disabled) {
    return `
      opacity: ${OPACITY.DISABLED};
      cursor: not-allowed;
      pointer-events: none;
    `;
  }

  const baseStyles = effects.map(e => {
    const config = HOVER_EFFECTS[e];
    const transition = duration || timing 
      ? `${config.transition.split(' ')[0]} ${duration || ANIMATION_TIMING.STANDARD} ${timing || EASING.EASE_IN_OUT}`
      : config.transition;
    
    return `
      transition: ${transition};
      
      &:hover {
        ${config.transform ? `transform: ${config.transform};` : ''}
        ${config.boxShadow ? `box-shadow: ${config.boxShadow};` : ''}
        ${config.backgroundColor ? `background-color: ${config.backgroundColor};` : ''}
        ${config.borderColor ? `border-color: ${config.borderColor};` : ''}
        ${config.color ? `color: ${config.color};` : ''}
        ${config.opacity ? `opacity: ${config.opacity};` : ''}
      }
      
      &:active {
        transform: scale(${SCALE.ACTIVE});
        transition-duration: ${ANIMATION_TIMING.FAST};
      }
      
      &:focus-visible {
        outline: 2px solid rgba(59, 130, 246, 0.5);
        outline-offset: 2px;
        box-shadow: ${SHADOW.FOCUS};
      }
    `;
  }).join('\n');

  return withReducedMotion(baseStyles, `
    transition: none;
    
    &:hover, &:active, &:focus {
      transform: none;
      box-shadow: none;
    }
  `);
}

export function createInteractiveElement(
  effect: HoverEffect = 'combined',
  options?: {
    baseStyles?: string;
    hoverStyles?: string;
    activeStyles?: string;
    focusStyles?: string;
    disabledStyles?: string;
  }
): string {
  const {
    baseStyles = '',
    hoverStyles = '',
    activeStyles = '',
    focusStyles = '',
    disabledStyles = '',
  } = options || {};

  const hoverConfig = HOVER_EFFECTS[effect];
  
  return `
    ${baseStyles}
    
    transition: ${hoverConfig.transition};
    cursor: pointer;
    
    &:hover {
      ${hoverConfig.transform ? `transform: ${hoverConfig.transform};` : ''}
      ${hoverConfig.boxShadow ? `box-shadow: ${hoverConfig.boxShadow};` : ''}
      ${hoverConfig.backgroundColor ? `background-color: ${hoverConfig.backgroundColor};` : ''}
      ${hoverConfig.borderColor ? `border-color: ${hoverConfig.borderColor};` : ''}
      ${hoverStyles}
    }
    
    &:active {
      transform: scale(${SCALE.ACTIVE});
      transition-duration: ${ANIMATION_TIMING.FAST};
      ${activeStyles}
    }
    
    &:focus-visible {
      outline: 2px solid rgba(59, 130, 246, 0.5);
      outline-offset: 2px;
      box-shadow: ${SHADOW.FOCUS};
      ${focusStyles}
    }
    
    &:disabled {
      opacity: ${OPACITY.DISABLED};
      cursor: not-allowed;
      pointer-events: none;
      ${disabledStyles}
    }
    
    ${withReducedMotion(`
      @media (prefers-reduced-motion: reduce) {
        transition: none;
        
        &:hover, &:active, &:focus {
          transform: none;
          box-shadow: none;
        }
      }
    `, '')}
  `;
}

// Predefined hover classes
export const HOVER_CLASSES = {
  card: createInteractiveElement('lift', {
    baseStyles: `
      border-radius: 8px;
      background: white;
      border: 1px solid #e5e7eb;
    `,
  }),
  
  button: createInteractiveElement('combined', {
    baseStyles: `
      border-radius: 6px;
      background: #3b82f6;
      color: white;
      padding: 8px 16px;
      border: none;
      font-weight: 500;
    `,
    hoverStyles: `
      background: #2563eb;
    `,
    activeStyles: `
      background: #1d4ed8;
    `,
  }),
  
  icon: createInteractiveElement('scale', {
    baseStyles: `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      color: #6b7280;
    `,
    hoverStyles: `
      background: #e5e7eb;
      color: #374151;
    `,
  }),
  
  link: createInteractiveElement('color', {
    baseStyles: `
      color: #3b82f6;
      text-decoration: none;
      border-bottom: 1px solid transparent;
    `,
    hoverStyles: `
      color: #2563eb;
      border-bottom-color: #2563eb;
    `,
  }),
  
  input: createInteractiveElement('border', {
    baseStyles: `
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 12px;
      background: white;
      
      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    `,
  }),
  
  listItem: createInteractiveElement('color', {
    baseStyles: `
      padding: 12px 16px;
      border-radius: 6px;
      margin: 2px 0;
    `,
    hoverStyles: `
      background: #f9fafb;
    `,
  }),
};

// Touch device optimizations
export function getTouchOptimizedStyles(): string {
  return `
    @media (hover: none) and (pointer: coarse) {
      /* Larger touch targets */
      min-height: 44px;
      min-width: 44px;
      
      /* Remove hover effects on touch devices */
      &:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      
      /* Enhanced active states for touch */
      &:active {
        opacity: ${OPACITY.ACTIVE};
        transform: scale(${SCALE.ACTIVE}) !important;
        transition-duration: ${ANIMATION_TIMING.FAST} !important;
      }
    }
  `;
}

// Performance optimized hover (uses will-change)
export function createPerformanceOptimizedHover(
  effect: HoverEffect = 'combined',
  properties: string[] = ['transform', 'box-shadow']
): string {
  const hoverConfig = HOVER_EFFECTS[effect];
  
  return `
    will-change: ${properties.join(', ')};
    transition: ${hoverConfig.transition};
    
    &:hover {
      ${hoverConfig.transform ? `transform: ${hoverConfig.transform};` : ''}
      ${hoverConfig.boxShadow ? `box-shadow: ${hoverConfig.boxShadow};` : ''}
      ${hoverConfig.backgroundColor ? `background-color: ${hoverConfig.backgroundColor};` : ''}
    }
    
    /* Remove will-change after animation */
    &:hover, &:active, &:focus {
      will-change: auto;
    }
  `;
}

// Accessibility: Skip hover on keyboard navigation
export function getKeyboardNavigationStyles(): string {
  return `
    /* Hide hover effects when using keyboard navigation */
    .using-keyboard & {
      &:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      
      &:focus-visible {
        transform: scale(${SCALE.FOCUS});
        box-shadow: ${SHADOW.FOCUS};
      }
    }
  `;
}

// Export utility for Tailwind-like usage
export function hover(classPrefix: string = 'hover'): Record<string, string> {
  return {
    [`${classPrefix}-scale`]: `&:hover { transform: scale(${SCALE.HOVER}); }`,
    [`${classPrefix}-lift`]: `&:hover { transform: translateY(-2px) scale(${SCALE.HOVER}); box-shadow: ${SHADOW.LG}; }`,
    [`${classPrefix}-glow`]: `&:hover { box-shadow: ${SHADOW.HOVER}; }`,
    [`${classPrefix}-slide`]: `&:hover { transform: translateX(4px); }`,
    [`${classPrefix}-rotate`]: `&:hover { transform: rotate(5deg); }`,
    [`${classPrefix}-shadow`]: `&:hover { box-shadow: ${SHADOW.XL}; }`,
    [`${classPrefix}-border`]: `&:hover { border-color: rgba(59, 130, 246, 0.5); }`,
    [`${classPrefix}-color`]: `&:hover { background-color: rgba(59, 130, 246, 0.1); }`,
    
    [`${classPrefix}-transition`]: `transition: ${createTransition('HOVER')};`,
    [`${classPrefix}-transition-fast`]: `transition: ${createTransition('HOVER', ANIMATION_TIMING.FAST)};`,
    [`${classPrefix}-transition-slow`]: `transition: ${createTransition('HOVER', ANIMATION_TIMING.SLOW)};`,
    
    'active-scale': `&:active { transform: scale(${SCALE.ACTIVE}); }`,
    'active-press': `&:active { transform: translateY(1px) scale(${SCALE.PRESS}); }`,
    
    'focus-ring': `&:focus-visible { outline: 2px solid rgba(59, 130, 246, 0.5); outline-offset: 2px; }`,
    'focus-glow': `&:focus-visible { box-shadow: ${SHADOW.FOCUS}; }`,
    
    'disabled-opacity': `&:disabled { opacity: ${OPACITY.DISABLED}; cursor: not-allowed; }`,
  };
}
