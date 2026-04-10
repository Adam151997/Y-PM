'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { shouldReduceMotion, withReducedMotion } from '../utils/animation-utils';

interface AnimationContextType {
  reducedMotion: boolean;
  animationEnabled: boolean;
  prefersReducedMotion: boolean;
  toggleAnimations: () => void;
  setAnimationPreference: (enabled: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

interface AnimationProviderProps {
  children: ReactNode;
  defaultEnabled?: boolean;
  respectSystemPreference?: boolean;
}

export function AnimationProvider({
  children,
  defaultEnabled = true,
  respectSystemPreference = true,
}: AnimationProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(defaultEnabled);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Initialize reduced motion preference
  useEffect(() => {
    const systemPrefersReducedMotion = shouldReduceMotion();
    setPrefersReducedMotion(systemPrefersReducedMotion);
    
    if (respectSystemPreference) {
      setReducedMotion(systemPrefersReducedMotion);
      setAnimationEnabled(!systemPrefersReducedMotion && defaultEnabled);
    } else {
      setReducedMotion(false);
      setAnimationEnabled(defaultEnabled);
    }

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
      if (respectSystemPreference) {
        setReducedMotion(event.matches);
        setAnimationEnabled(!event.matches && defaultEnabled);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [defaultEnabled, respectSystemPreference]);

  const toggleAnimations = () => {
    setAnimationEnabled(prev => !prev);
    setReducedMotion(prev => !prev);
  };

  const setAnimationPreference = (enabled: boolean) => {
    setAnimationEnabled(enabled);
    setReducedMotion(!enabled);
  };

  const value: AnimationContextType = {
    reducedMotion,
    animationEnabled,
    prefersReducedMotion,
    toggleAnimations,
    setAnimationPreference,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}

export function useReducedMotionValue<T>(normalValue: T, reducedValue: T): T {
  const { reducedMotion } = useAnimation();
  return reducedMotion ? reducedValue : normalValue;
}

export function useAnimationEnabled(): boolean {
  const { animationEnabled } = useAnimation();
  return animationEnabled;
}

export function usePrefersReducedMotion(): boolean {
  const { prefersReducedMotion } = useAnimation();
  return prefersReducedMotion;
}

// Higher-order component for conditional rendering based on animation preferences
export function withAnimation<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: React.ComponentType<T>;
    animationProps?: (props: T) => Record<string, any>;
  }
) {
  const { fallback, animationProps } = options || {};

  return function AnimatedComponent(props: T) {
    const { animationEnabled } = useAnimation();
    
    if (!animationEnabled && fallback) {
      return <fallback {...props} />;
    }

    const additionalProps = animationProps ? animationProps(props) : {};
    
    return (
      <Component
        {...props}
        {...additionalProps}
        data-animation-enabled={animationEnabled}
      />
    );
  };
}

// Utility hook for conditional animation styles
export function useAnimationStyles(
  normalStyles: React.CSSProperties,
  reducedStyles: React.CSSProperties = {}
): React.CSSProperties {
  const { reducedMotion } = useAnimation();
  return reducedMotion ? reducedStyles : normalStyles;
}

// Hook for conditional CSS classes
export function useAnimationClasses(
  normalClasses: string,
  reducedClasses: string = ''
): string {
  const { reducedMotion } = useAnimation();
  return reducedMotion ? reducedClasses : normalClasses;
}

// Hook for conditional rendering of animated elements
export function useShouldAnimate(): boolean {
  const { animationEnabled } = useAnimation();
  return animationEnabled;
}

// Hook for animation timing based on preferences
export function useAnimationTiming(
  normalDuration: string,
  reducedDuration: string = '0ms'
): string {
  const { reducedMotion } = useAnimation();
  return reducedMotion ? reducedDuration : normalDuration;
}

// Hook for conditional transition properties
export function useTransition(
  properties: string[],
  normalDuration: string = '200ms',
  reducedDuration: string = '0ms',
  timingFunction: string = 'ease-in-out'
): string {
  const { reducedMotion } = useAnimation();
  const duration = reducedMotion ? reducedDuration : normalDuration;
  return `${properties.join(', ')} ${duration} ${timingFunction}`;
}

// Component that conditionally renders based on animation preferences
export function Animated({
  children,
  fallback,
  condition = true,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  condition?: boolean;
}) {
  const { animationEnabled } = useAnimation();
  
  if (!condition) {
    return <>{fallback || children}</>;
  }
  
  return <>{animationEnabled ? children : fallback || children}</>;
}

// Component wrapper for reduced motion support
export function ReducedMotion({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { reducedMotion } = useAnimation();
  return <>{reducedMotion ? (fallback || children) : children}</>;
}

// Component that only renders when animations are enabled
export function OnlyWhenAnimated({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { animationEnabled } = useAnimation();
  return <>{animationEnabled ? children : fallback}</>;
}

// Component that only renders when reduced motion is preferred
export function OnlyWhenReducedMotion({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { reducedMotion } = useAnimation();
  return <>{reducedMotion ? children : fallback}</>;
}
