/**
 * Mobile-optimized modal components
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { useDeviceType, useIsMobile, useIsTablet } from '../utils/device-detection';
import { useTouchFeedback } from '../utils/touch-optimization';
import { useReducedMotion } from '@/features/micro-interactions';
import { ANIMATION_TIMING, EASING } from '@/features/micro-interactions/utils/animation-utils';

// Modal position options
export type ModalPosition = 'center' | 'bottom' | 'top' | 'left' | 'right';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Mobile modal props
export interface MobileModalProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactNode;
  position?: ModalPosition;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  footerContent?: ReactNode;
  fullScreenOnMobile?: boolean;
  swipeToClose?: boolean;
  swipeThreshold?: number;
}

// Main mobile-optimized modal component
export function MobileModal({
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  trigger,
  position = 'center',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  showHeader = true,
  showFooter = false,
  footerContent,
  fullScreenOnMobile = true,
  swipeToClose = true,
  swipeThreshold = 100,
}: MobileModalProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const reducedMotion = useReducedMotion();
  const { touchHandlers } = useTouchFeedback('active');

  // Use sheet for mobile, dialog for desktop
  const useSheet = isMobile || (isTablet && position !== 'center');

  // Handle close
  const handleClose = () => {
    onClose?.();
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Handle overlay click
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      handleClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (preventScroll && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  // Get size classes
  const getSizeClasses = () => {
    if (fullScreenOnMobile && isMobile) {
      return 'h-full max-h-full w-full max-w-full rounded-none';
    }

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full',
    };

    return sizeClasses[size];
  };

  // Get position classes for sheet
  const getSheetPosition = (): 'top' | 'right' | 'bottom' | 'left' => {
    if (position === 'bottom') return 'bottom';
    if (position === 'top') return 'top';
    if (position === 'left') return 'left';
    if (position === 'right') return 'right';
    
    // Default to bottom on mobile, right on tablet
    return isMobile ? 'bottom' : 'right';
  };

  // Get sheet size
  const getSheetSize = (): 'sm' | 'md' | 'lg' | 'xl' | 'full' => {
    if (fullScreenOnMobile && isMobile) return 'full';
    return size;
  };

  // Render close button
  const renderCloseButton = () => {
    if (!showCloseButton) return null;

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute right-4 top-4 z-10"
        aria-label="Close"
        {...touchHandlers}
      >
        <X className="h-4 w-4" />
      </Button>
    );
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader && !title && !description) return null;

    return (
      <div className={cn('px-6 pt-6 pb-4', headerClassName)}>
        {title && (
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter && !footerContent) return null;

    return (
      <div className={cn('px-6 py-4 border-t', footerClassName)}>
        {footerContent}
      </div>
    );
  };

  // Render sheet (mobile/tablet)
  if (useSheet) {
    const sheetPosition = getSheetPosition();
    const sheetSize = getSheetSize();

    return (
      <>
        {trigger && (
          <SheetTrigger asChild>
            {trigger}
          </SheetTrigger>
        )}
        
        <Sheet
          open={isOpen}
          onOpenChange={onOpenChange}
          modal={true}
        >
          <SheetContent
            side={sheetPosition}
            size={sheetSize}
            className={cn(
              'transition-all duration-300',
              reducedMotion && 'transition-none',
              contentClassName
            )}
            style={{
              transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
            }}
            onInteractOutside={handleOverlayClick}
            onEscapeKeyDown={handleClose}
          >
            {renderCloseButton()}
            {renderHeader()}
            
            <div className={cn(
              'flex-1 overflow-auto',
              !showHeader && 'pt-6',
              !showFooter && 'pb-6'
            )}>
              <div className="px-6">
                {children}
              </div>
            </div>
            
            {renderFooter()}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Render dialog (desktop)
  return (
    <>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <Dialog
        open={isOpen}
        onOpenChange={onOpenChange}
        modal={true}
      >
        <DialogContent
          className={cn(
            getSizeClasses(),
            'transition-all duration-300',
            reducedMotion && 'transition-none',
            contentClassName
          )}
          style={{
            transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
          }}
          onInteractOutside={handleOverlayClick}
          onEscapeKeyDown={closeOnEscape ? handleClose : undefined}
        >
          {renderCloseButton()}
          {renderHeader()}
          
          <div className={cn(
            'flex-1 overflow-auto',
            !showHeader && 'pt-6',
            !showFooter && 'pb-6'
          )}>
            <div className="px-6">
              {children}
            </div>
          </div>
          
          {renderFooter()}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Bottom sheet component (mobile-specific)
export interface BottomSheetProps extends Omit<MobileModalProps, 'position'> {
  showHandle?: boolean;
  snapPoints?: number[]; // Percentage heights [0-100]
  defaultSnapPoint?: number;
}

export function BottomSheet({
  showHandle = true,
  snapPoints = [25, 50, 75, 90],
  defaultSnapPoint = 50,
  ...props
}: BottomSheetProps) {
  return (
    <MobileModal
      position="bottom"
      fullScreenOnMobile={false}
      {...props}
      contentClassName={cn(
        'rounded-t-xl',
        showHandle && 'pt-4',
        props.contentClassName
      )}
    >
      {showHandle && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />
      )}
      {props.children}
    </MobileModal>
  );
}

// Full screen modal component
export function FullScreenModal(props: Omit<MobileModalProps, 'size' | 'fullScreenOnMobile'>) {
  return (
    <MobileModal
      size="full"
      fullScreenOnMobile={true}
      showCloseButton={true}
      {...props}
      contentClassName={cn(
        'h-screen max-h-screen w-screen max-w-screen rounded-none',
        props.contentClassName
      )}
    />
  );
}

// Slide over panel (tablet/desktop)
export function SlideOverPanel(props: Omit<MobileModalProps, 'position'>) {
  const isMobile = useIsMobile();
  
  return (
    <MobileModal
      position={isMobile ? 'bottom' : 'right'}
      size={isMobile ? 'full' : 'lg'}
      fullScreenOnMobile={isMobile}
      {...props}
    />
  );
}

// Quick action sheet
export interface QuickActionSheetProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  actions: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    disabled?: boolean;
  }>;
  title?: string;
  cancelLabel?: string;
}

export function QuickActionSheet({
  isOpen,
  onOpenChange,
  actions,
  title = 'Actions',
  cancelLabel = 'Cancel',
}: QuickActionSheetProps) {
  const { touchHandlers } = useTouchFeedback('active');

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      showHeader={true}
      showFooter={false}
      showCloseButton={false}
    >
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              action.onClick();
              onOpenChange?.(false);
            }}
            disabled={action.disabled}
            {...touchHandlers}
          >
            {action.icon && <span className="mr-3">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
        
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => onOpenChange?.(false)}
          {...touchHandlers}
        >
          {cancelLabel}
        </Button>
      </div>
    </BottomSheet>
  );
}

// Hook for managing mobile modal state
export function useMobileModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

// Export everything
export const modal = {
  MobileModal,
  BottomSheet,
  FullScreenModal,
  SlideOverPanel,
  QuickActionSheet,
  useMobileModal,
};
