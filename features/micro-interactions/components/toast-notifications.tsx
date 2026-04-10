'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '../utils/reduced-motion';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Toast position
export type ToastPosition = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// Toast action
export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
}

// Toast configuration
export interface ToastConfig {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
  action?: ToastAction;
  onClose?: () => void;
  dismissible?: boolean;
  createdAt: number;
}

// Toast context
interface ToastContextType {
  toasts: ToastConfig[];
  addToast: (toast: Omit<ToastConfig, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<ToastConfig>) => void;
  clearToasts: () => void;
  clearToastsByPosition: (position: ToastPosition) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider
interface ToastProviderProps {
  children: ReactNode;
  defaultDuration?: number;
  defaultPosition?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  defaultDuration = 5000,
  defaultPosition = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const addToast = useCallback((toast: Omit<ToastConfig, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastConfig = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
      position: toast.position ?? defaultPosition,
      dismissible: toast.dismissible ?? true,
      createdAt: Date.now(),
    };

    setToasts(prev => {
      const filtered = prev.filter(t => t.position === newToast.position);
      if (filtered.length >= maxToasts) {
        // Remove oldest toast from same position
        const oldest = filtered.reduce((oldest, current) => 
          current.createdAt < oldest.createdAt ? current : oldest
        );
        return prev.filter(t => t.id !== oldest.id).concat(newToast);
      }
      return [...prev, newToast];
    });

    // Auto-dismiss if duration is set
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        newToast.onClose?.();
      }, newToast.duration);
    }

    return id;
  }, [defaultDuration, defaultPosition, maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      toast?.onClose?.();
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<ToastConfig>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const clearToastsByPosition = useCallback((position: ToastPosition) => {
    setToasts(prev => prev.filter(toast => toast.position !== position));
  }, []);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearToasts,
    clearToastsByPosition,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Toast container
function ToastContainer() {
  const { toasts } = useToast();
  const reducedMotion = useReducedMotion();

  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastConfig[]>);

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={cn(
            'fixed z-50 flex flex-col gap-2',
            getPositionClasses(position as ToastPosition),
            reducedMotion ? 'transition-none' : 'transition-all duration-300'
          )}
        >
          {positionToasts.map(toast => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div>
      ))}
    </>
  );
}

// Individual toast component
function Toast({ toast }: { toast: ToastConfig }) {
  const { removeToast } = useToast();
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(100);

  // Progress bar animation
  const duration = toast.duration || 5000;
  
  const handleClose = () => {
    removeToast(toast.id);
  };

  const handleAction = () => {
    toast.action?.onClick();
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'relative overflow-hidden rounded-lg border p-4 shadow-lg';
    
    switch (toast.type) {
      case 'success':
        return cn(
          baseStyles,
          'bg-green-50 border-green-200 text-green-900',
          'dark:bg-green-900/20 dark:border-green-800 dark:text-green-100'
        );
      case 'error':
        return cn(
          baseStyles,
          'bg-red-50 border-red-200 text-red-900',
          'dark:bg-red-900/20 dark:border-red-800 dark:text-red-100'
        );
      case 'warning':
        return cn(
          baseStyles,
          'bg-yellow-50 border-yellow-200 text-yellow-900',
          'dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100'
        );
      case 'loading':
        return cn(
          baseStyles,
          'bg-blue-50 border-blue-200 text-blue-900',
          'dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100'
        );
      case 'info':
      default:
        return cn(
          baseStyles,
          'bg-blue-50 border-blue-200 text-blue-900',
          'dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100'
        );
    }
  };

  return (
    <div
      className={cn(
        getStyles(),
        reducedMotion ? 'animate-none' : 'animate-in slide-in-from-right-full',
        'max-w-sm'
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-current/20">
          <div
            className="h-full bg-current/40 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        
        <div className="flex-1 space-y-1">
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
          
          {toast.action && (
            <div className="pt-2">
              <Button
                variant={toast.action.variant || 'outline'}
                size="sm"
                onClick={handleAction}
                className="h-7 text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        {toast.dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 -mr-1 -mt-1"
            onClick={handleClose}
            aria-label="Close notification"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Position utility
function getPositionClasses(position: ToastPosition): string {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 -translate-x-1/2';
    case 'top-right':
      return 'top-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'bottom-center':
      return 'bottom-4 left-1/2 -translate-x-1/2';
    case 'bottom-right':
      return 'bottom-4 right-4';
  }
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Convenience hooks for different toast types
export function useToastHelpers() {
  const { addToast, removeToast, updateToast } = useToast();

  const success = useCallback((config: Omit<ToastConfig, 'id' | 'type' | 'createdAt'>) => {
    return addToast({ ...config, type: 'success' });
  }, [addToast]);

  const error = useCallback((config: Omit<ToastConfig, 'id' | 'type' | 'createdAt'>) => {
    return addToast({ ...config, type: 'error' });
  }, [addToast]);

  const warning = useCallback((config: Omit<ToastConfig, 'id' | 'type' | 'createdAt'>) => {
    return addToast({ ...config, type: 'warning' });
  }, [addToast]);

  const info = useCallback((config: Omit<ToastConfig, 'id' | 'type' | 'createdAt'>) => {
    return addToast({ ...config, type: 'info' });
  }, [addToast]);

  const loading = useCallback((config: Omit<ToastConfig, 'id' | 'type' | 'createdAt'>) => {
    return addToast({ ...config, type: 'loading' });
  }, [addToast]);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  const update = useCallback((id: string, updates: Partial<ToastConfig>) => {
    updateToast(id, updates);
  }, [updateToast]);

  const promise = useCallback(
    async <T,>(
      promise: Promise<T>,
      config: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
        position?: ToastPosition;
      }
    ): Promise<T> => {
      const loadingId = loading({
        title: config.loading,
        duration: 0,
        position: config.position,
        dismissible: false,
      });

      try {
        const data = await promise;
        const successMessage = typeof config.success === 'function' 
          ? config.success(data) 
          : config.success;
        
        update(loadingId, {
          type: 'success',
          title: successMessage,
          duration: 3000,
          dismissible: true,
        });

        return data;
      } catch (error) {
        const errorMessage = typeof config.error === 'function'
          ? config.error(error)
          : config.error;
        
        update(loadingId, {
          type: 'error',
          title: errorMessage,
          duration: 5000,
          dismissible: true,
        });
        
        throw error;
      }
    },
    [loading, update]
  );

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    update,
    promise,
  };
}

// Toast trigger component
interface ToastTriggerProps {
  children: ReactNode;
  toast: Omit<ToastConfig, 'id' | 'createdAt'>;
  asChild?: boolean;
}

export function ToastTrigger({ children, toast, asChild = false }: ToastTriggerProps) {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast(toast);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClick();
      },
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

// Export everything
export const ToastSystem = {
  Provider: ToastProvider,
  Container: ToastContainer,
  Toast,
  Trigger: ToastTrigger,
  useToast,
  useToastHelpers,
};
