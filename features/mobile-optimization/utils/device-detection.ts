/**
 * Device detection and capability utilities for mobile optimization
 */

import { useState, useEffect } from 'react';

// Device types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type InputType = 'touch' | 'mouse' | 'keyboard';
export type ScreenOrientation = 'portrait' | 'landscape';

// Device capabilities
export interface DeviceCapabilities {
  type: DeviceType;
  input: InputType;
  orientation: ScreenOrientation;
  hasTouch: boolean;
  hasHover: boolean;
  hasReducedMotion: boolean;
  screenWidth: number;
  screenHeight: number;
  isStandalone: boolean; // PWA installed
  isDarkMode: boolean;
}

// Breakpoints (Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Default device capabilities
const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  type: 'desktop',
  input: 'mouse',
  orientation: 'landscape',
  hasTouch: false,
  hasHover: true,
  hasReducedMotion: false,
  screenWidth: 1024,
  screenHeight: 768,
  isStandalone: false,
  isDarkMode: false,
};

// Detect device type based on screen width
export function detectDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
}

// Detect input type
export function detectInputType(): InputType {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return 'touch';
  }
  return 'mouse';
}

// Detect screen orientation
export function detectOrientation(): ScreenOrientation {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

// Detect if app is installed as PWA
export function detectIsStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Detect dark mode preference
export function detectDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Detect reduced motion preference
export function detectReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get current device capabilities
export function getDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return DEFAULT_CAPABILITIES;
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  return {
    type: detectDeviceType(screenWidth),
    input: detectInputType(),
    orientation: detectOrientation(),
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasHover: !('ontouchstart' in window || navigator.maxTouchPoints > 0),
    hasReducedMotion: detectReducedMotion(),
    screenWidth,
    screenHeight,
    isStandalone: detectIsStandalone(),
    isDarkMode: detectDarkMode(),
  };
}

// Hook for device capabilities
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(
    () => getDeviceCapabilities()
  );

  useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities(getDeviceCapabilities());
    };

    // Update on resize
    window.addEventListener('resize', updateCapabilities);
    
    // Update on orientation change
    window.addEventListener('orientationchange', updateCapabilities);
    
    // Update on input change (touch/mouse)
    window.addEventListener('touchstart', updateCapabilities, { once: true });
    window.addEventListener('mousemove', updateCapabilities, { once: true });

    return () => {
      window.removeEventListener('resize', updateCapabilities);
      window.removeEventListener('orientationchange', updateCapabilities);
      window.removeEventListener('touchstart', updateCapabilities);
      window.removeEventListener('mousemove', updateCapabilities);
    };
  }, []);

  return capabilities;
}

// Hook for specific device type
export function useDeviceType(): DeviceType {
  const capabilities = useDeviceCapabilities();
  return capabilities.type;
}

// Hook for input type
export function useInputType(): InputType {
  const capabilities = useDeviceCapabilities();
  return capabilities.input;
}

// Hook for screen orientation
export function useScreenOrientation(): ScreenOrientation {
  const capabilities = useDeviceCapabilities();
  return capabilities.orientation;
}

// Hook for touch detection
export function useHasTouch(): boolean {
  const capabilities = useDeviceCapabilities();
  return capabilities.hasTouch;
}

// Hook for hover capability
export function useHasHover(): boolean {
  const capabilities = useDeviceCapabilities();
  return capabilities.hasHover;
}

// Hook for screen size
export function useScreenSize(): { width: number; height: number } {
  const capabilities = useDeviceCapabilities();
  return { width: capabilities.screenWidth, height: capabilities.screenHeight };
}

// Hook for breakpoint detection
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  const { screenWidth } = useDeviceCapabilities();
  return screenWidth >= BREAKPOINTS[breakpoint];
}

// Hook for mobile detection
export function useIsMobile(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}

// Hook for tablet detection
export function useIsTablet(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'tablet';
}

// Hook for desktop detection
export function useIsDesktop(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop';
}

// Hook for safe area insets (notch, home indicator)
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      // Use CSS env variables if available
      const style = getComputedStyle(document.documentElement);
      
      setInsets({
        top: parseFloat(style.getPropertyValue('--sat')) || 
             parseFloat(style.getPropertyValue('--safe-area-inset-top')) || 0,
        right: parseFloat(style.getPropertyValue('--sar')) || 
               parseFloat(style.getPropertyValue('--safe-area-inset-right')) || 0,
        bottom: parseFloat(style.getPropertyValue('--sab')) || 
                parseFloat(style.getPropertyValue('--safe-area-inset-bottom')) || 0,
        left: parseFloat(style.getPropertyValue('--sal')) || 
              parseFloat(style.getPropertyValue('--safe-area-inset-left')) || 0,
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
}

// Utility to conditionally apply styles based on device
export function responsive<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T {
  const deviceType = detectDeviceType(window.innerWidth);
  
  switch (deviceType) {
    case 'mobile':
      return mobile;
    case 'tablet':
      return tablet || mobile;
    case 'desktop':
      return desktop || tablet || mobile;
  }
}

// Utility to conditionally render based on device
export function Responsive({
  mobile,
  tablet,
  desktop,
  children,
}: {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const deviceType = useDeviceType();
  
  let content = children;
  
  switch (deviceType) {
    case 'mobile':
      content = mobile || children;
      break;
    case 'tablet':
      content = tablet || children;
      break;
    case 'desktop':
      content = desktop || children;
      break;
  }
  
  return <>{content}</>;
}

// Export everything
export const device = {
  BREAKPOINTS,
  detectDeviceType,
  detectInputType,
  detectOrientation,
  detectIsStandalone,
  detectDarkMode,
  detectReducedMotion,
  getDeviceCapabilities,
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
  responsive,
  Responsive,
};
