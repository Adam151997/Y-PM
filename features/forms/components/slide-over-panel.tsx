'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useReducedMotion } from '@/features/micro-interactions';
import { ANIMATION_TIMING, EASING } from '@/features/micro-interactions/utils/animation-utils';
import { useFocusManagement } from '@/features/micro-interactions/utils/focus-management';

export interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showOverlay?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  footer?: ReactNode;
}

export function SlideOverPanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showOverlay = true,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  footer,
}: SlideOverPanelProps) {
  const reducedMotion = useReducedMotion();
  const { trapFocus, releaseFocus } = useFocusManagement();

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus trap
  useEffect(() => {
    if (isOpen) {
      trapFocus();
    } else {
      releaseFocus();
    }

    return () => {
      releaseFocus();
    };
  }, [isOpen, trapFocus, releaseFocus]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full';
      case 'md':
      default:
        return 'max-w-lg';
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0';
      case 'right':
      default:
        return 'right-0';
    }
  };

  // Get transform classes based on position and open state
  const getTransformClasses = () => {
    if (position === 'left') {
      return isOpen ? 'translate-x-0' : '-translate-x-full';
    } else {
      return isOpen ? 'translate-x-0' : 'translate-x-full';
    }
  };

  // Handle overlay click
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      {showOverlay && (
        <div
          className={cn(
            'fixed inset-0 bg-black/50 transition-opacity duration-300',
            reducedMotion && 'transition-none',
            overlayClassName
          )}
          style={{
            transition: reducedMotion ? 'none' : `opacity ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
          }}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex',
          getPositionClasses(),
          getSizeClasses(),
          className
        )}
      >
        <div
          className={cn(
            'relative flex h-full w-full flex-col bg-background shadow-xl transition-transform duration-300',
            reducedMotion && 'transition-none',
            getTransformClasses()
          )}
          style={{
            transition: reducedMotion ? 'none' : `transform ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'slide-over-title' : undefined}
          aria-describedby={description ? 'slide-over-description' : undefined}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className={cn('border-b px-6 py-4', headerClassName)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {title && (
                    <h2
                      id="slide-over-title"
                      className="text-lg font-semibold leading-6 text-foreground"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="slide-over-description"
                      className="mt-1 text-sm text-muted-foreground"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-4 h-8 w-8"
                    onClick={onClose}
                    aria-label="Close panel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className={cn(
              'flex-1 overflow-y-auto p-6',
              contentClassName
            )}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for managing slide-over panel state
export function useSlideOverPanel(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

// Quick edit panel component
export interface QuickEditPanelProps extends Omit<SlideOverPanelProps, 'children'> {
  form: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function QuickEditPanel({
  form,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isLoading = false,
  ...props
}: QuickEditPanelProps) {
  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={props.onClose}
        disabled={isLoading}
      >
        {cancelLabel}
      </Button>
      {onSubmit && (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      )}
    </div>
  );

  return (
    <SlideOverPanel
      {...props}
      footer={footer}
    >
      {form}
    </SlideOverPanel>
  );
}
