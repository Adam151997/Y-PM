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
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2, Trash2, Save } from 'lucide-react';
import { useReducedMotion } from '@/features/micro-interactions';
import { ANIMATION_TIMING, EASING } from '@/features/micro-interactions/utils/animation-utils';
import { useFocusManagement } from '@/features/micro-interactions/utils/focus-management';

export type DialogVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
  disabled?: boolean;
  trigger?: ReactNode;
  children?: ReactNode;
  showIcon?: boolean;
  showCancelButton?: boolean;
  closeOnConfirm?: boolean;
  closeOnCancel?: boolean;
  className?: string;
  contentClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  disabled = false,
  trigger,
  children,
  showIcon = true,
  showCancelButton = true,
  closeOnConfirm = true,
  closeOnCancel = true,
  className,
  contentClassName,
  confirmButtonClassName,
  cancelButtonClassName,
}: ConfirmationDialogProps) {
  const reducedMotion = useReducedMotion();
  const { trapFocus, releaseFocus } = useFocusManagement();

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

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to confirm
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (!isLoading && !disabled) {
          handleConfirm();
        }
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, disabled]);

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          confirmButtonVariant: 'destructive' as const,
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          confirmButtonVariant: 'default' as const,
          iconBg: 'bg-green-100 dark:bg-green-900/20',
          iconColor: 'text-green-600 dark:text-green-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          confirmButtonVariant: 'default' as const,
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          confirmButtonVariant: 'default' as const,
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
        };
      default:
        return {
          icon: <Info className="h-6 w-6 text-primary" />,
          confirmButtonVariant: 'default' as const,
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Handle confirm
  const handleConfirm = async () => {
    try {
      await onConfirm();
      if (closeOnConfirm && onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Confirmation failed:', error);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel?.();
    if (closeOnCancel && onOpenChange) {
      onOpenChange(false);
    }
  };

  // Get confirm button text based on variant
  const getConfirmButtonText = () => {
    if (variant === 'destructive') {
      return confirmText || 'Delete';
    }
    return confirmText;
  };

  // Get confirm button icon
  const getConfirmButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    }
    
    if (variant === 'destructive') {
      return <Trash2 className="mr-2 h-4 w-4" />;
    }
    
    if (variant === 'success') {
      return <CheckCircle className="mr-2 h-4 w-4" />;
    }
    
    return <Save className="mr-2 h-4 w-4" />;
  };

  const dialogContent = (
    <DialogContent
      className={cn(
        'transition-all duration-300',
        reducedMotion && 'transition-none',
        contentClassName
      )}
      style={{
        transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
      }}
      onEscapeKeyDown={handleCancel}
      onInteractOutside={handleCancel}
    >
      <DialogHeader>
        <div className="flex items-start gap-4">
          {showIcon && (
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', variantStyles.iconBg)}>
              {variantStyles.icon}
            </div>
          )}
          
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-2">{description}</DialogDescription>
            )}
          </div>
        </div>
      </DialogHeader>

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

      <DialogFooter className="mt-6 gap-2">
        {showCancelButton && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className={cn('min-w-24', cancelButtonClassName)}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          type="button"
          variant={variantStyles.confirmButtonVariant}
          onClick={handleConfirm}
          disabled={isLoading || disabled}
          className={cn('min-w-24', confirmButtonClassName)}
        >
          {getConfirmButtonIcon()}
          {getConfirmButtonText()}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}

// Preset confirmation dialogs
export function DeleteConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant'>) {
  return (
    <ConfirmationDialog
      variant="destructive"
      confirmText={props.confirmText || 'Delete'}
      {...props}
    />
  );
}

export function SuccessConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant'>) {
  return (
    <ConfirmationDialog
      variant="success"
      confirmText={props.confirmText || 'Confirm'}
      {...props}
    />
  );
}

export function WarningConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant'>) {
  return (
    <ConfirmationDialog
      variant="warning"
      confirmText={props.confirmText || 'Proceed'}
      {...props}
    />
  );
}

export function InfoConfirmationDialog(props: Omit<ConfirmationDialogProps, 'variant'>) {
  return (
    <ConfirmationDialog
      variant="info"
      confirmText={props.confirmText || 'OK'}
      {...props}
    />
  );
}

// Hook for managing confirmation dialog state
export function useConfirmationDialog(initialOpen = false) {
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

// Quick confirmation utility
export function confirmAction(options: {
  title: string;
  description?: string;
  variant?: DialogVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}): ReactNode {
  const { isOpen, open, close } = useConfirmationDialog(false);

  const handleConfirm = async () => {
    try {
      await options.onConfirm();
      close();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleCancel = () => {
    options.onCancel?.();
    close();
  };

  return (
    <>
      <Button onClick={open} variant="outline">
        Trigger Action
      </Button>
      
      <ConfirmationDialog
        isOpen={isOpen}
        onOpenChange={close}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={options.title}
        description={options.description}
        variant={options.variant}
      />
    </>
  );
}
