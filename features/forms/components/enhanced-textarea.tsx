'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/features/micro-interactions';
import { ANIMATION_TIMING, EASING } from '@/features/micro-interactions/utils/animation-utils';

export type TextareaVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type TextareaSize = 'sm' | 'md' | 'lg';

export interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  variant?: TextareaVariant;
  size?: TextareaSize;
  loading?: boolean;
  autoFocus?: boolean;
  autoResize?: boolean;
  expandable?: boolean;
  maxRows?: number;
  minRows?: number;
  characterCount?: boolean;
  onValidate?: (value: string) => boolean | Promise<boolean>;
  debounceMs?: number;
}

const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  (
    {
      className,
      label,
      description,
      error,
      success,
      warning,
      info,
      variant = 'default',
      size = 'md',
      loading = false,
      autoFocus = false,
      autoResize = true,
      expandable = false,
      maxRows = 10,
      minRows = 3,
      characterCount = true,
      onValidate,
      debounceMs = 300,
      value,
      defaultValue,
      onChange,
      rows = minRows,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value || defaultValue || '');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<boolean | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentRows, setCurrentRows] = useState(rows);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const reducedMotion = useReducedMotion();
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Determine actual variant based on props
    const actualVariant = error ? 'error' : 
                         success ? 'success' : 
                         warning ? 'warning' : 
                         info ? 'info' : 
                         variant;

    // Auto-focus
    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }, [autoFocus]);

    // Auto-resize
    useEffect(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      
      const resizeTextarea = () => {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Calculate new height based on content
        const newHeight = Math.max(
          textarea.scrollHeight,
          parseInt(getComputedStyle(textarea).lineHeight) * minRows
        );
        
        // Limit height if maxRows is set
        const maxHeight = parseInt(getComputedStyle(textarea).lineHeight) * maxRows;
        textarea.style.height = `${Math.min(newHeight, maxHeight)}px`;
        
        // Update rows for accessibility
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const calculatedRows = Math.floor(newHeight / lineHeight);
        setCurrentRows(Math.min(Math.max(calculatedRows, minRows), maxRows));
      };

      resizeTextarea();
      
      // Add resize observer for content changes
      const observer = new MutationObserver(resizeTextarea);
      observer.observe(textarea, { childList: true, characterData: true, subtree: true });
      
      return () => observer.disconnect();
    }, [localValue, autoResize, minRows, maxRows]);

    // Handle validation
    useEffect(() => {
      if (!onValidate || localValue === '') {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce validation
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await onValidate(String(localValue));
          setValidationResult(result);
        } catch (error) {
          setValidationResult(false);
        } finally {
          setIsValidating(false);
        }
      }, debounceMs);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [localValue, onValidate, debounceMs]);

    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange?.(e);
    };

    // Toggle expand
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    };

    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'text-sm min-h-[60px]';
        case 'lg':
          return 'text-base min-h-[120px]';
        case 'md':
        default:
          return 'text-sm min-h-[80px]';
      }
    };

    // Get variant classes
    const getVariantClasses = () => {
      const base = 'border focus-visible:ring-2 focus-visible:ring-offset-2';
      
      switch (actualVariant) {
        case 'success':
          return cn(
            base,
            'border-green-300 focus-visible:ring-green-500/20',
            'dark:border-green-700 dark:focus-visible:ring-green-500/30'
          );
        case 'error':
          return cn(
            base,
            'border-red-300 focus-visible:ring-red-500/20',
            'dark:border-red-700 dark:focus-visible:ring-red-500/30'
          );
        case 'warning':
          return cn(
            base,
            'border-yellow-300 focus-visible:ring-yellow-500/20',
            'dark:border-yellow-700 dark:focus-visible:ring-yellow-500/30'
          );
        case 'info':
          return cn(
            base,
            'border-blue-300 focus-visible:ring-blue-500/20',
            'dark:border-blue-700 dark:focus-visible:ring-blue-500/30'
          );
        case 'default':
        default:
          return cn(
            base,
            'border-input focus-visible:ring-ring'
          );
      }
    };

    // Get status icon
    const getStatusIcon = () => {
      if (loading || isValidating) {
        return <Loader2 className="h-4 w-4 animate-spin" />;
      }
      
      if (validationResult === true) {
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      }
      
      if (validationResult === false) {
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      }
      
      if (info) {
        return <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      }
      
      return null;
    };

    // Get status message
    const getStatusMessage = () => {
      return error || success || warning || info || null;
    };

    // Get status color
    const getStatusColor = () => {
      switch (actualVariant) {
        case 'success':
          return 'text-green-600 dark:text-green-400';
        case 'error':
          return 'text-red-600 dark:text-red-400';
        case 'warning':
          return 'text-yellow-600 dark:text-yellow-400';
        case 'info':
          return 'text-blue-600 dark:text-blue-400';
        default:
          return 'text-muted-foreground';
      }
    };

    // Get textarea styles for expanded mode
    const getTextareaStyles = () => {
      if (isExpanded) {
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '800px',
          height: '80vh',
          maxHeight: '600px',
          zIndex: 100,
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        };
      }
      return {};
    };

    // Get container classes for expanded mode
    const getContainerClasses = () => {
      return cn(
        'relative',
        isExpanded && 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center'
      );
    };

    return (
      <div className={getContainerClasses()}>
        <div className={isExpanded ? 'w-full max-w-4xl' : 'space-y-1.5'}>
          {/* Label */}
          {label && (
            <Label 
              htmlFor={props.id} 
              className={cn(
                'text-sm font-medium',
                actualVariant === 'error' && 'text-red-600 dark:text-red-400'
              )}
            >
              {label}
            </Label>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {/* Textarea container */}
          <div className="relative">
            {/* Textarea */}
            <Textarea
              ref={(node) => {
                // Handle both refs
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                textareaRef.current = node;
              }}
              value={value !== undefined ? value : localValue}
              onChange={handleChange}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              rows={isExpanded ? maxRows : currentRows}
              className={cn(
                getSizeClasses(),
                getVariantClasses(),
                'transition-all duration-200 resize-y',
                reducedMotion && 'transition-none',
                isExpanded && 'text-base',
                isFocused && !reducedMotion && 'scale-[1.01]',
                isHovered && !reducedMotion && 'border-primary/50',
                className
              )}
              style={{
                transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
                ...getTextareaStyles(),
              }}
              {...props}
            />

            {/* Controls */}
            <div className="absolute right-2 top-2 flex items-center gap-1">
              {/* Status icon */}
              {getStatusIcon() && (
                <div className="flex items-center">
                  {getStatusIcon()}
                </div>
              )}

              {/* Expand button */}
              {expandable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={toggleExpand}
                  aria-label={isExpanded ? 'Collapse textarea' : 'Expand textarea'}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-3 w-3" />
                  ) : (
                    <Maximize2 className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Status message and character count */}
          <div className="flex justify-between items-center">
            {/* Status message */}
            {getStatusMessage() && (
              <p className={cn('text-xs font-medium', getStatusColor())}>
                {getStatusMessage()}
              </p>
            )}

            {/* Character count */}
            {characterCount && (
              <div className="text-xs text-muted-foreground">
                <span>{localValue.toString().length} characters</span>
                {props.maxLength && (
                  <span> / {props.maxLength}</span>
                )}
              </div>
            )}
          </div>

          {/* Line count (for expanded mode) */}
          {isExpanded && autoResize && (
            <div className="text-xs text-muted-foreground mt-1">
              {currentRows} line{currentRows !== 1 ? 's' : ''}
              {maxRows && ` (max: ${maxRows})`}
            </div>
          )}
        </div>

        {/* Overlay for expanded mode */}
        {isExpanded && (
          <div 
            className="fixed inset-0 z-40"
            onClick={toggleExpand}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';

export { EnhancedTextarea };
