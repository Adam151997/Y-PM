/**
 * Reduced motion utilities for accessibility support
 */

import { useEffect, useState } from 'react';
import { shouldReduceMotion, withReducedMotion, getReducedMotionMediaQuery } from './animation-utils';

// Reduced motion preference hook
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const updateReducedMotion = () => {
      setReducedMotion(shouldReduceMotion());
    };

    // Initial check
    updateReducedMotion();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

// Conditional value based on reduced motion preference
export function useConditionalValue<T>(
  normalValue: T,
  reducedValue: T
): T {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? reducedValue : normalValue;
}

// Conditional styles based on reduced motion
export function useConditionalStyles(
  normalStyles: React.CSSProperties,
  reducedStyles: React.CSSProperties = {}
): React.CSSProperties {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? reducedStyles : normalStyles;
}

// Conditional CSS classes
export function useConditionalClasses(
  normalClasses: string,
  reducedClasses: string = ''
): string {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? reducedClasses : normalClasses;
}

// Conditional animation duration
export function useConditionalDuration(
  normalDuration: string,
  reducedDuration: string = '0ms'
): string {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? reducedDuration : normalDuration;
}

// Conditional transition
export function useConditionalTransition(
  properties: string[],
  normalDuration: string = '200ms',
  reducedDuration: string = '0ms',
  timingFunction: string = 'ease-in-out'
): string {
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? reducedDuration : normalDuration;
  return `${properties.join(', ')} ${duration} ${timingFunction}`;
}

// Component that conditionally renders based on reduced motion
export function ReducedMotion({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return <>{reducedMotion ? (fallback || children) : children}</>;
}

// Component that only renders when reduced motion is NOT preferred
export function WithoutReducedMotion({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return <>{!reducedMotion ? children : fallback}</>;
}

// Higher-order component for reduced motion support
export function withReducedMotionSupport<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: React.ComponentType<T>;
    motionProps?: (props: T) => Record<string, any>;
  }
) {
  const { fallback, motionProps } = options || {};

  return function MotionAwareComponent(props: T) {
    const reducedMotion = useReducedMotion();
    
    if (reducedMotion && fallback) {
      return <fallback {...props} />;
    }

    const additionalProps = motionProps ? motionProps(props) : {};
    
    return (
      <Component
        {...props}
        {...additionalProps}
        data-reduced-motion={reducedMotion}
      />
    );
  };
}

// CSS utility for reduced motion media query
export const REDUCED_MOTION_CSS = {
  mediaQuery: getReducedMotionMediaQuery(),
  
  styles: `
    ${getReducedMotionMediaQuery()} {
      /* Disable all animations */
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Disable parallax and scroll effects */
      [data-parallax], [data-scroll-effect] {
        transform: none !important;
      }
      
      /* Simplify transitions */
      .transition-all,
      .transition,
      .transition-transform,
      .transition-opacity,
      .transition-colors {
        transition: none !important;
      }
      
      /* Disable hover effects */
      .hover\\:scale-105:hover,
      .hover\\:scale-110:hover,
      .hover\\:translate-y-\\[-2px\\]:hover,
      .hover\\:shadow-lg:hover,
      .hover\\:shadow-xl:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      
      /* Simplify focus states */
      .focus\\:ring-2:focus,
      .focus\\:ring-4:focus,
      .focus\\:ring-offset-2:focus {
        box-shadow: none !important;
        outline: 2px solid rgba(59, 130, 246, 0.5) !important;
        outline-offset: 2px !important;
      }
    }
  `,
  
  // Utility classes for reduced motion
  utilityClasses: {
    'motion-reduce:animate-none': `${getReducedMotionMediaQuery()} { animation: none !important; }`,
    'motion-reduce:transition-none': `${getReducedMotionMediaQuery()} { transition: none !important; }`,
    'motion-reduce:transform-none': `${getReducedMotionMediaQuery()} { transform: none !important; }`,
    'motion-reduce:opacity-100': `${getReducedMotionMediaQuery()} { opacity: 1 !important; }`,
    'motion-reduce:shadow-none': `${getReducedMotionMediaQuery()} { box-shadow: none !important; }`,
    'motion-reduce:scale-100': `${getReducedMotionMediaQuery()} { transform: scale(1) !important; }`,
    'motion-reduce:translate-x-0': `${getReducedMotionMediaQuery()} { transform: translateX(0) !important; }`,
    'motion-reduce:translate-y-0': `${getReducedMotionMediaQuery()} { transform: translateY(0) !important; }`,
    'motion-reduce:rotate-0': `${getReducedMotionMediaQuery()} { transform: rotate(0) !important; }`,
  },
};

// Animation presets with reduced motion support
export const MOTION_PRESETS = {
  fadeIn: {
    normal: {
      animation: 'fadeIn 0.3s ease-in-out',
      '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
    },
    reduced: {
      animation: 'none',
      opacity: 1,
    },
  },
  
  slideUp: {
    normal: {
      animation: 'slideUp 0.3s ease-out',
      '@keyframes slideUp': {
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
    },
    reduced: {
      animation: 'none',
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
  
  scaleIn: {
    normal: {
      animation: 'scaleIn 0.2s ease-out',
      '@keyframes scaleIn': {
        from: { transform: 'scale(0.95)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
    },
    reduced: {
      animation: 'none',
      transform: 'scale(1)',
      opacity: 1,
    },
  },
  
  bounce: {
    normal: {
      animation: 'bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      '@keyframes bounce': {
        '0%': { transform: 'scale(0.3)', opacity: 0 },
        '50%': { transform: 'scale(1.05)' },
        '70%': { transform: 'scale(0.9)' },
        '100%': { transform: 'scale(1)', opacity: 1 },
      },
    },
    reduced: {
      animation: 'none',
      transform: 'scale(1)',
      opacity: 1,
    },
  },
  
  pulse: {
    normal: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
    },
    reduced: {
      animation: 'none',
      opacity: 1,
    },
  },
  
  shimmer: {
    normal: {
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite',
      '@keyframes shimmer': {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
    },
    reduced: {
      background: '#f0f0f0',
      animation: 'none',
    },
  },
};

// Hook to get motion preset based on preference
export function useMotionPreset(preset: keyof typeof MOTION_PRESETS) {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? MOTION_PRESETS[preset].reduced : MOTION_PRESETS[preset].normal;
}

// Utility to apply reduced motion styles to a component
export function applyReducedMotionStyles(
  styles: React.CSSProperties,
  reducedMotion: boolean
): React.CSSProperties {
  if (!reducedMotion) return styles;
  
  // Remove animation and transition properties
  const { animation, transition, transform, ...rest } = styles;
  
  // Simplify transform if present
  let simplifiedTransform = transform;
  if (transform && typeof transform === 'string') {
    // Remove scale, translate, rotate values, keep essential transforms
    simplifiedTransform = transform
      .replace(/scale\([^)]+\)/g, '')
      .replace(/translate[XY]?\([^)]+\)/g, '')
      .replace(/rotate\([^)]+\)/g, '')
      .trim();
    
    if (!simplifiedTransform) {
      delete (rest as any).transform;
    }
  }
  
  return {
    ...rest,
    ...(simplifiedTransform ? { transform: simplifiedTransform } : {}),
  };
}

// Utility to create reduced motion compatible animations
export function createAccessibleAnimation(
  keyframes: Record<string, any>,
  duration: string = '0.3s',
  timingFunction: string = 'ease-in-out'
) {
  return {
    '@media (prefers-reduced-motion: no-preference)': {
      animation: `${Object.keys(keyframes)[0]} ${duration} ${timingFunction}`,
      ...keyframes,
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  };
}

// Component for testing reduced motion support
export function ReducedMotionTest() {
  const reducedMotion = useReducedMotion();
  
  return (
    <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Reduced Motion Test</h3>
      <p style={{ margin: '0 0 0.5rem 0' }}>
        Current preference: <strong>{reducedMotion ? 'Reduced motion' : 'Normal motion'}</strong>
      </p>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            background: '#3b82f6',
            borderRadius: '8px',
            animation: reducedMotion ? 'none' : 'pulse 2s infinite',
          }}
        />
        <div
          style={{
            width: '50px',
            height: '50px',
            background: '#10b981',
            borderRadius: '50%',
            transition: reducedMotion ? 'none' : 'transform 0.3s ease',
            transform: reducedMotion ? 'none' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!reducedMotion) {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!reducedMotion) {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }
          }}
        />
      </div>
    </div>
  );
}

// Export utilities for easy consumption
export const reducedMotion = {
  useReducedMotion,
  useConditionalValue,
  useConditionalStyles,
  useConditionalClasses,
  useConditionalDuration,
  useConditionalTransition,
  ReducedMotion,
  WithoutReducedMotion,
  withReducedMotionSupport,
  MOTION_PRESETS,
  useMotionPreset,
  applyReducedMotionStyles,
  createAccessibleAnimation,
  REDUCED_MOTION_CSS,
  ReducedMotionTest,
};
