'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/features/micro-interactions';
import { ANIMATION_TIMING, EASING } from '@/features/micro-interactions/utils/animation-utils';

export type InputVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type InputSize = 'sm' | 'md' | 'lg';

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  variant?: InputVariant;
  size?: InputSize;
  loading?: boolean;
  showPasswordToggle?: boolean;
  autoFocus?: boolean;
  autoSelect?: boolean;
  clearable?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
  onClear?: () => void;
  onValidate?: (value: string) => boolean | Promise<boolean>;
  debounceMs?: number;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
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
      showPasswordToggle = false,
      autoFocus = false,
      autoSelect = false,
      clearable = false,
      prefix,
      suffix,
      icon,
      onClear,
      onValidate,
      debounceMs = 300,
      type: initialType = 'text',
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [type, setType] = useState(initialType);
    const [localValue, setLocalValue] = useState(value || defaultValue || '');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<boolean | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const reducedMotion = useReducedMotion();
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Determine actual variant based on props
    const actualVariant = error ? 'error' : 
                         success ? 'success' : 
                         warning ? 'warning' : 
                         info ? 'info' : 
                         variant;

    // Auto-focus and auto-select
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
          if (autoSelect) {
            inputRef.current?.select();
          }
        }, 100);
      }
    }, [autoFocus, autoSelect]);

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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange?.(e);
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setType(type === 'password' ? 'text' : 'password');
    };

    // Clear input
    const handleClear = () => {
      setLocalValue('');
      onClear?.();
      
      // Trigger change event
      if (inputRef.current) {
        const event = new Event('input', { bubbles: true });
        inputRef.current.value = '';
        inputRef.current.dispatchEvent(event);
      }
    };

    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-8 text-sm';
        case 'lg':
          return 'h-12 text-base';
        case 'md':
        default:
          return 'h-10 text-sm';
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

    return (
      <div className="space-y-1.5">
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

        {/* Input container */}
        <div className="relative">
          {/* Prefix */}
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {prefix}
            </div>
          )}

          {/* Icon */}
          {icon && !prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {icon}
            </div>
          )}

          {/* Input */}
          <Input
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              inputRef.current = node;
            }}
            type={type}
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
            className={cn(
              getSizeClasses(),
              getVariantClasses(),
              'transition-all duration-200',
              reducedMotion && 'transition-none',
              (prefix || icon) && 'pl-10',
              (suffix || showPasswordToggle || clearable || getStatusIcon()) && 'pr-24',
              isFocused && !reducedMotion && 'scale-[1.01]',
              isHovered && !reducedMotion && 'border-primary/50',
              className
            )}
            style={{
              transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
            }}
            {...props}
          />

          {/* Suffix area */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Status icon */}
            {getStatusIcon() && (
              <div className="flex items-center">
                {getStatusIcon()}
              </div>
            )}

            {/* Clear button */}
            {clearable && localValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClear}
                aria-label="Clear input"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            )}

            {/* Password toggle */}
            {showPasswordToggle && initialType === 'password' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={togglePasswordVisibility}
                aria-label={type === 'password' ? 'Show password' : 'Hide password'}
              >
                {type === 'password' ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
            )}

            {/* Custom suffix */}
            {suffix && (
              <div className="flex items-center">
                {suffix}
              </div>
            )}
          </div>
        </div>

        {/* Status message */}
        {getStatusMessage() && (
          <p className={cn('text-xs font-medium', getStatusColor())}>
            {getStatusMessage()}
          </p>
        )}

        {/* Character count (if maxLength is set) */}
        {props.maxLength && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{localValue.toString().length} characters</span>
            <span>Max: {props.maxLength}</span>
          </div>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput };
