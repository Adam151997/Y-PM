/**
 * Form validation utilities for enhanced form components
 */

import { useState, useRef } from 'react';
import { ANIMATION_TIMING } from '@/features/micro-interactions/utils/animation-utils';

// Validation rule types
export type ValidationRule = 
  | { type: 'required'; message?: string }
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }
  | { type: 'pattern'; value: RegExp; message?: string }
  | { type: 'email'; message?: string }
  | { type: 'url'; message?: string }
  | { type: 'numeric'; message?: string }
  | { type: 'min'; value: number; message?: string }
  | { type: 'max'; value: number; message?: string }
  | { type: 'custom'; validator: (value: any) => boolean | Promise<boolean>; message?: string };

// Validation result
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  errors: string[];
}

// Validation configuration
export interface ValidationConfig {
  rules: ValidationRule[];
  debounceMs?: number;
  showErrorsImmediately?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

// Default validation messages
export const DEFAULT_MESSAGES = {
  required: 'This field is required',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
  pattern: 'Invalid format',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  numeric: 'Please enter a number',
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be at most ${max}`,
  custom: 'Invalid value',
};

// Validation functions
export const validators = {
  // Required field
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  // Minimum length
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  // Maximum length
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  // Pattern matching
  pattern: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
  },

  // Email validation
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // URL validation
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // Numeric validation
  numeric: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // Minimum value
  min: (value: number, min: number): boolean => {
    return value >= min;
  },

  // Maximum value
  max: (value: number, max: number): boolean => {
    return value <= max;
  },
};

// Validate a single value against rules
export async function validateValue(
  value: any,
  rules: ValidationRule[]
): Promise<ValidationResult> {
  const errors: string[] = [];

  for (const rule of rules) {
    let isValid = true;
    let message = rule.message;

    switch (rule.type) {
      case 'required':
        isValid = validators.required(value);
        message = message || DEFAULT_MESSAGES.required;
        break;

      case 'minLength':
        isValid = validators.minLength(String(value), rule.value);
        message = message || DEFAULT_MESSAGES.minLength(rule.value);
        break;

      case 'maxLength':
        isValid = validators.maxLength(String(value), rule.value);
        message = message || DEFAULT_MESSAGES.maxLength(rule.value);
        break;

      case 'pattern':
        isValid = validators.pattern(String(value), rule.value);
        message = message || DEFAULT_MESSAGES.pattern;
        break;

      case 'email':
        isValid = validators.email(String(value));
        message = message || DEFAULT_MESSAGES.email;
        break;

      case 'url':
        isValid = validators.url(String(value));
        message = message || DEFAULT_MESSAGES.url;
        break;

      case 'numeric':
        isValid = validators.numeric(value);
        message = message || DEFAULT_MESSAGES.numeric;
        break;

      case 'min':
        isValid = validators.min(Number(value), rule.value);
        message = message || DEFAULT_MESSAGES.min(rule.value);
        break;

      case 'max':
        isValid = validators.max(Number(value), rule.value);
        message = message || DEFAULT_MESSAGES.max(rule.value);
        break;

      case 'custom':
        try {
          isValid = await rule.validator(value);
          message = message || DEFAULT_MESSAGES.custom;
        } catch {
          isValid = false;
          message = message || DEFAULT_MESSAGES.custom;
        }
        break;
    }

    if (!isValid && message) {
      errors.push(message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors[0],
  };
}

// Create validation configuration
export function createValidation(config: ValidationConfig) {
  return {
    ...config,
    debounceMs: config.debounceMs || ANIMATION_TIMING.STANDARD,
    showErrorsImmediately: config.showErrorsImmediately ?? true,
    validateOnBlur: config.validateOnBlur ?? true,
    validateOnChange: config.validateOnChange ?? true,
  };
}

// Common validation presets
export const VALIDATION_PRESETS = {
  email: createValidation({
    rules: [
      { type: 'required' },
      { type: 'email' },
    ],
  }),

  password: createValidation({
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 8 },
    ],
  }),

  url: createValidation({
    rules: [
      { type: 'required' },
      { type: 'url' },
    ],
  }),

  phone: createValidation({
    rules: [
      { type: 'required' },
      { type: 'pattern', value: /^[\d\s\-\+\(\)]{10,}$/ },
    ],
  }),

  username: createValidation({
    rules: [
      { type: 'required' },
      { type: 'minLength', value: 3 },
      { type: 'maxLength', value: 20 },
      { type: 'pattern', value: /^[a-zA-Z0-9_]+$/ },
    ],
  }),

  required: createValidation({
    rules: [
      { type: 'required' },
    ],
  }),

  numeric: createValidation({
    rules: [
      { type: 'required' },
      { type: 'numeric' },
    ],
  }),
};

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationConfig: Record<keyof T, ValidationConfig>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string[]>>({} as any);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any);
  const [isValidating, setIsValidating] = useState<Record<keyof T, boolean>>({} as any);
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Validate a single field
  const validateField = async (field: keyof T) => {
    const config = validationConfig[field];
    if (!config) return;

    setIsValidating(prev => ({ ...prev, [field]: true }));

    try {
      const result = await validateValue(values[field], config.rules);
      
      setErrors(prev => ({
        ...prev,
        [field]: result.errors,
      }));
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }
  };

  // Validate all fields
  const validateAll = async (): Promise<boolean> => {
    const fieldKeys = Object.keys(validationConfig) as (keyof T)[];
    const results = await Promise.all(
      fieldKeys.map(async (field) => {
        const result = await validateValue(values[field], validationConfig[field].rules);
        return { field, result };
      })
    );

    const newErrors = {} as Record<keyof T, string[]>;
    let allValid = true;

    results.forEach(({ field, result }) => {
      newErrors[field] = result.errors;
      if (result.errors.length > 0) {
        allValid = false;
      }
    });

    setErrors(newErrors);
    return allValid;
  };

  // Handle field change
  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    const config = validationConfig[field];
    if (!config || !config.validateOnChange) return;

    // Clear previous timeout
    if (timeoutRefs.current[field as string]) {
      clearTimeout(timeoutRefs.current[field as string]);
    }

    // Debounce validation
    timeoutRefs.current[field as string] = setTimeout(() => {
      validateField(field);
    }, config.debounceMs || ANIMATION_TIMING.STANDARD);
  };

  // Handle field blur
  const handleBlur = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const config = validationConfig[field];
    if (!config || !config.validateOnBlur) return;

    validateField(field);
  };

  // Reset form
  const reset = (newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({} as any);
    setTouched({} as any);
    setIsValidating({} as any);
    
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
  };

  // Get field error
  const getFieldError = (field: keyof T): string | undefined => {
    const fieldErrors = errors[field];
    const isTouched = touched[field];
    const config = validationConfig[field];
    
    if (!fieldErrors || fieldErrors.length === 0) return undefined;
    if (config?.showErrorsImmediately || isTouched) {
      return fieldErrors[0];
    }
    return undefined;
  };

  // Check if field has error
  const hasError = (field: keyof T): boolean => {
    return !!getFieldError(field);
  };

  // Check if form is valid
  const isValid = (): boolean => {
    return Object.values(errors).every(errorList => errorList.length === 0);
  };

  // Check if form is dirty
  const isDirty = (): boolean => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  };

  return {
    values,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    reset,
    getFieldError,
    hasError,
    isValid,
    isDirty,
    setValues,
  };
}

// Export everything
export const validation = {
  validators,
  validateValue,
  createValidation,
  VALIDATION_PRESETS,
  useFormValidation,
};
