/**
 * Responsive layout utilities for mobile and tablet optimization
 */

import { cn } from '@/lib/utils';
import { BREAKPOINTS, useDeviceType, useIsMobile, useIsTablet, useIsDesktop } from './device-detection';

// Responsive container sizes
export const CONTAINER_SIZES = {
  MOBILE: 'max-w-full px-4',
  TABLET: 'max-w-3xl px-6',
  DESKTOP: 'max-w-6xl px-8',
  FULL: 'max-w-full px-0',
} as const;

// Responsive spacing
export const SPACING = {
  MOBILE: {
    SMALL: 'gap-2 p-2',
    MEDIUM: 'gap-4 p-4',
    LARGE: 'gap-6 p-6',
  },
  TABLET: {
    SMALL: 'gap-3 p-3',
    MEDIUM: 'gap-5 p-5',
    LARGE: 'gap-7 p-7',
  },
  DESKTOP: {
    SMALL: 'gap-4 p-4',
    MEDIUM: 'gap-6 p-6',
    LARGE: 'gap-8 p-8',
  },
} as const;

// Responsive grid configurations
export const GRID_CONFIGS = {
  MOBILE: {
    COLUMNS: 1,
    GAP: 'gap-4',
    PADDING: 'p-4',
  },
  TABLET: {
    COLUMNS: 2,
    GAP: 'gap-6',
    PADDING: 'p-6',
  },
  DESKTOP: {
    COLUMNS: 3,
    GAP: 'gap-8',
    PADDING: 'p-8',
  },
} as const;

// Responsive typography
export const TYPOGRAPHY = {
  MOBILE: {
    H1: 'text-2xl font-bold',
    H2: 'text-xl font-semibold',
    H3: 'text-lg font-semibold',
    BODY: 'text-base',
    SMALL: 'text-sm',
  },
  TABLET: {
    H1: 'text-3xl font-bold',
    H2: 'text-2xl font-semibold',
    H3: 'text-xl font-semibold',
    BODY: 'text-base',
    SMALL: 'text-sm',
  },
  DESKTOP: {
    H1: 'text-4xl font-bold',
    H2: 'text-3xl font-semibold',
    H3: 'text-2xl font-semibold',
    BODY: 'text-base',
    SMALL: 'text-sm',
  },
} as const;

// Responsive container component
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: keyof typeof CONTAINER_SIZES | 'auto';
  centered?: boolean;
  fullWidthOnMobile?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  size = 'auto',
  centered = true,
  fullWidthOnMobile = true,
}: ResponsiveContainerProps) {
  const deviceType = useDeviceType();
  
  let containerSize = CONTAINER_SIZES.DESKTOP;
  
  if (size === 'auto') {
    switch (deviceType) {
      case 'mobile':
        containerSize = fullWidthOnMobile ? CONTAINER_SIZES.MOBILE : CONTAINER_SIZES.TABLET;
        break;
      case 'tablet':
        containerSize = CONTAINER_SIZES.TABLET;
        break;
      case 'desktop':
        containerSize = CONTAINER_SIZES.DESKTOP;
        break;
    }
  } else if (size !== 'full') {
    containerSize = CONTAINER_SIZES[size];
  }
  
  return (
    <div className={cn(
      containerSize,
      centered && 'mx-auto',
      className
    )}>
      {children}
    </div>
  );
}

// Responsive grid component
export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: number | { mobile?: number; tablet?: number; desktop?: number };
  gap?: string | { mobile?: string; tablet?: string; desktop?: string };
  minChildWidth?: string;
}

export function ResponsiveGrid({
  children,
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 'gap-4', tablet: 'gap-6', desktop: 'gap-8' },
  minChildWidth = 'min-w-0',
}: ResponsiveGridProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  // Determine column count
  let columnCount = 3; // Default desktop
  if (typeof columns === 'number') {
    columnCount = columns;
  } else {
    if (isMobile && columns.mobile !== undefined) columnCount = columns.mobile;
    else if (isTablet && columns.tablet !== undefined) columnCount = columns.tablet;
    else if (isDesktop && columns.desktop !== undefined) columnCount = columns.desktop;
  }
  
  // Determine gap
  let gapClass = 'gap-8'; // Default desktop
  if (typeof gap === 'string') {
    gapClass = gap;
  } else {
    if (isMobile && gap.mobile) gapClass = gap.mobile;
    else if (isTablet && gap.tablet) gapClass = gap.tablet;
    else if (isDesktop && gap.desktop) gapClass = gap.desktop;
  }
  
  const gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;
  
  return (
    <div
      className={cn('grid', gapClass, className)}
      style={{ gridTemplateColumns }}
    >
      {children}
    </div>
  );
}

// Responsive flex component
export interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column' | { mobile?: 'row' | 'column'; tablet?: 'row' | 'column'; desktop?: 'row' | 'column' };
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean | { mobile?: boolean; tablet?: boolean; desktop?: boolean };
  gap?: string | { mobile?: string; tablet?: string; desktop?: string };
}

export function ResponsiveFlex({
  children,
  className,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 'gap-4',
}: ResponsiveFlexProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  // Determine direction
  let directionClass = 'flex-row';
  if (typeof direction === 'string') {
    directionClass = direction === 'column' ? 'flex-col' : 'flex-row';
  } else {
    if (isMobile && direction.mobile) {
      directionClass = direction.mobile === 'column' ? 'flex-col' : 'flex-row';
    } else if (isTablet && direction.tablet) {
      directionClass = direction.tablet === 'column' ? 'flex-col' : 'flex-row';
    } else if (isDesktop && direction.desktop) {
      directionClass = direction.desktop === 'column' ? 'flex-col' : 'flex-row';
    }
  }
  
  // Determine justify
  const justifyClass = `justify-${justify}`;
  
  // Determine align
  const alignClass = `items-${align}`;
  
  // Determine wrap
  let wrapClass = '';
  if (typeof wrap === 'boolean') {
    wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';
  } else {
    if (isMobile && wrap.mobile !== undefined) {
      wrapClass = wrap.mobile ? 'flex-wrap' : 'flex-nowrap';
    } else if (isTablet && wrap.tablet !== undefined) {
      wrapClass = wrap.tablet ? 'flex-wrap' : 'flex-nowrap';
    } else if (isDesktop && wrap.desktop !== undefined) {
      wrapClass = wrap.desktop ? 'flex-wrap' : 'flex-nowrap';
    }
  }
  
  // Determine gap
  let gapClass = 'gap-4';
  if (typeof gap === 'string') {
    gapClass = gap;
  } else {
    if (isMobile && gap.mobile) gapClass = gap.mobile;
    else if (isTablet && gap.tablet) gapClass = gap.tablet;
    else if (isDesktop && gap.desktop) gapClass = gap.desktop;
  }
  
  return (
    <div className={cn(
      'flex',
      directionClass,
      justifyClass,
      alignClass,
      wrapClass,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
}

// Responsive typography component
export interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
  as?: keyof JSX.IntrinsicElements;
  mobileVariant?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
  tabletVariant?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
  desktopVariant?: 'h1' | 'h2' | 'h3' | 'body' | 'small';
}

export function ResponsiveText({
  children,
  className,
  variant = 'body',
  as: Component = 'p',
  mobileVariant,
  tabletVariant,
  desktopVariant,
}: ResponsiveTextProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  // Determine variant
  let actualVariant = variant;
  if (isMobile && mobileVariant) actualVariant = mobileVariant;
  else if (isTablet && tabletVariant) actualVariant = tabletVariant;
  else if (isDesktop && desktopVariant) actualVariant = desktopVariant;
  
  // Get typography class
  let typographyClass = '';
  if (isMobile) {
    typographyClass = TYPOGRAPHY.MOBILE[actualVariant.toUpperCase() as keyof typeof TYPOGRAPHY.MOBILE];
  } else if (isTablet) {
    typographyClass = TYPOGRAPHY.TABLET[actualVariant.toUpperCase() as keyof typeof TYPOGRAPHY.TABLET];
  } else {
    typographyClass = TYPOGRAPHY.DESKTOP[actualVariant.toUpperCase() as keyof typeof TYPOGRAPHY.DESKTOP];
  }
  
  return (
    <Component className={cn(typographyClass, className)}>
      {children}
    </Component>
  );
}

// Responsive visibility component
export interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  showOn?: ('mobile' | 'tablet' | 'desktop')[];
  hideOn?: ('mobile' | 'tablet' | 'desktop')[];
}

export function ResponsiveVisibility({
  children,
  showOn,
  hideOn,
}: ResponsiveVisibilityProps) {
  const deviceType = useDeviceType();
  
  let shouldShow = true;
  
  if (showOn) {
    shouldShow = showOn.includes(deviceType);
  }
  
  if (hideOn) {
    shouldShow = !hideOn.includes(deviceType);
  }
  
  if (!shouldShow) {
    return null;
  }
  
  return <>{children}</>;
}

// Responsive spacing hook
export function useResponsiveSpacing(
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const deviceType = useDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return SPACING.MOBILE[size.toUpperCase() as keyof typeof SPACING.MOBILE];
    case 'tablet':
      return SPACING.TABLET[size.toUpperCase() as keyof typeof SPACING.TABLET];
    case 'desktop':
      return SPACING.DESKTOP[size.toUpperCase() as keyof typeof SPACING.DESKTOP];
  }
}

// Responsive breakpoint hook
export function useResponsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T {
  const deviceType = useDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return mobile;
    case 'tablet':
      return tablet || mobile;
    case 'desktop':
      return desktop || tablet || mobile;
  }
}

// Export everything
export const layout = {
  CONTAINER_SIZES,
  SPACING,
  GRID_CONFIGS,
  TYPOGRAPHY,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveText,
  ResponsiveVisibility,
  useResponsiveSpacing,
  useResponsiveValue,
};
