/**
 * Smart form defaults and suggestions utilities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ANIMATION_TIMING } from '@/features/micro-interactions/utils/animation-utils';

// Suggestion types
export interface Suggestion<T = any> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  relevance?: number; // 0-1
  category?: string;
}

export interface SuggestionConfig<T = any> {
  source: (query: string) => Promise<Suggestion<T>[]> | Suggestion<T>[];
  minQueryLength?: number;
  maxSuggestions?: number;
  debounceMs?: number;
  showOnFocus?: boolean;
  filter?: (suggestion: Suggestion<T>, query: string) => boolean;
  sort?: (a: Suggestion<T>, b: Suggestion<T>) => number;
}

// Auto-complete configuration
export interface AutoCompleteConfig<T = any> extends SuggestionConfig<T> {
  onSelect?: (suggestion: Suggestion<T>) => void;
  renderSuggestion?: (suggestion: Suggestion<T>) => React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
}

// Smart default configuration
export interface SmartDefaultConfig<T = any> {
  getDefault: () => Promise<T> | T;
  dependencies?: any[];
  enabled?: boolean;
}

// Hook for smart suggestions
export function useSmartSuggestions<T = any>(
  query: string,
  config: SuggestionConfig<T>
) {
  const [suggestions, setSuggestions] = useState<Suggestion<T>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const {
    source,
    minQueryLength = 1,
    maxSuggestions = 10,
    debounceMs = ANIMATION_TIMING.STANDARD,
    showOnFocus = false,
    filter,
    sort,
  } = config;

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength && !showOnFocus) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let results = await source(searchQuery);

      // Apply filter if provided
      if (filter) {
        results = results.filter(suggestion => filter(suggestion, searchQuery));
      }

      // Apply sort if provided
      if (sort) {
        results.sort(sort);
      } else {
        // Default sort by relevance if available
        results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      }

      // Limit results
      results = results.slice(0, maxSuggestions);

      setSuggestions(results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch suggestions'));
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [source, minQueryLength, maxSuggestions, showOnFocus, filter, sort]);

  // Debounced suggestion fetching
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length >= minQueryLength || (showOnFocus && query === '')) {
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, debounceMs);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, fetchSuggestions, debounceMs, minQueryLength, showOnFocus]);

  // Clear suggestions when query is empty and showOnFocus is false
  useEffect(() => {
    if (query === '' && !showOnFocus) {
      setSuggestions([]);
    }
  }, [query, showOnFocus]);

  return {
    suggestions,
    isLoading,
    error,
    isEmpty: suggestions.length === 0 && !isLoading,
  };
}

// Hook for smart defaults
export function useSmartDefault<T = any>(
  config: SmartDefaultConfig<T>
): [T | undefined, boolean, Error | null] {
  const [value, setValue] = useState<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { getDefault, dependencies = [], enabled = true } = config;

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const fetchDefault = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const defaultValue = await getDefault();
        if (isMounted) {
          setValue(defaultValue);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch default value'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDefault();

    return () => {
      isMounted = false;
    };
  }, [getDefault, enabled, ...dependencies]);

  return [value, isLoading, error];
}

// Common suggestion sources
export const suggestionSources = {
  // Email domain suggestions
  emailDomains: (query: string): Suggestion[] => {
    const commonDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'icloud.com',
      'protonmail.com',
      'aol.com',
      'zoho.com',
      'yandex.com',
      'mail.com',
    ];

    const [localPart, domainPart = ''] = query.split('@');
    
    return commonDomains
      .filter(domain => domain.includes(domainPart))
      .map(domain => ({
        value: `${localPart}@${domain}`,
        label: `${localPart}@${domain}`,
        description: `Use ${domain}`,
        relevance: domainPart ? (domain.includes(domainPart) ? 0.9 : 0.5) : 0.7,
      }));
  },

  // Date suggestions
  dates: (query: string): Suggestion[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const dateOptions = [
      { label: 'Today', date: today, relevance: 1.0 },
      { label: 'Tomorrow', date: tomorrow, relevance: 0.9 },
      { label: 'Next week', date: nextWeek, relevance: 0.8 },
      { label: 'Next month', date: nextMonth, relevance: 0.7 },
    ];

    return dateOptions
      .filter(option => 
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        option.date.toISOString().includes(query)
      )
      .map(option => ({
        value: option.date,
        label: option.label,
        description: option.date.toLocaleDateString(),
        relevance: option.relevance,
      }));
  },

  // Priority suggestions
  priorities: (query: string): Suggestion[] => {
    const priorityOptions = [
      { value: 'urgent', label: 'Urgent', color: 'red', relevance: 1.0 },
      { value: 'high', label: 'High', color: 'orange', relevance: 0.9 },
      { value: 'medium', label: 'Medium', color: 'yellow', relevance: 0.8 },
      { value: 'low', label: 'Low', color: 'green', relevance: 0.7 },
      { value: 'none', label: 'None', color: 'gray', relevance: 0.6 },
    ];

    return priorityOptions
      .filter(option => 
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        option.value.includes(query.toLowerCase())
      )
      .map(option => ({
        value: option.value,
        label: option.label,
        description: `${option.label} priority`,
        relevance: option.relevance,
      }));
  },

  // Status suggestions
  statuses: (query: string): Suggestion[] => {
    const statusOptions = [
      { value: 'todo', label: 'To Do', relevance: 1.0 },
      { value: 'in-progress', label: 'In Progress', relevance: 0.9 },
      { value: 'review', label: 'Review', relevance: 0.8 },
      { value: 'done', label: 'Done', relevance: 0.7 },
      { value: 'blocked', label: 'Blocked', relevance: 0.6 },
    ];

    return statusOptions
      .filter(option => 
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        option.value.includes(query.toLowerCase())
      )
      .map(option => ({
        value: option.value,
        label: option.label,
        description: `Set status to ${option.label}`,
        relevance: option.relevance,
      }));
  },
};

// Common smart defaults
export const smartDefaults = {
  // Current date
  currentDate: (): Date => new Date(),

  // Tomorrow's date
  tomorrowDate: (): Date => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  },

  // Next week date
  nextWeekDate: (): Date => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  },

  // Next month date
  nextMonthDate: (): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  },

  // Default priority
  defaultPriority: (): string => 'medium',

  // Default status
  defaultStatus: (): string => 'todo',

  // Current user (placeholder)
  currentUser: (): { id: string; name: string } => ({
    id: 'current-user',
    name: 'Current User',
  }),
};

// Utility to create suggestion configs
export function createSuggestionConfig<T = any>(
  config: Partial<SuggestionConfig<T>> & { source: SuggestionConfig<T>['source'] }
): SuggestionConfig<T> {
  return {
    minQueryLength: 1,
    maxSuggestions: 10,
    debounceMs: ANIMATION_TIMING.STANDARD,
    showOnFocus: false,
    ...config,
  };
}

// Utility to create auto-complete configs
export function createAutoCompleteConfig<T = any>(
  config: Partial<AutoCompleteConfig<T>> & { source: AutoCompleteConfig<T>['source'] }
): AutoCompleteConfig<T> {
  return {
    minQueryLength: 1,
    maxSuggestions: 10,
    debounceMs: ANIMATION_TIMING.STANDARD,
    showOnFocus: false,
    emptyMessage: 'No suggestions found',
    loadingMessage: 'Loading suggestions...',
    ...config,
  };
}

// Export everything
export const smart = {
  useSmartSuggestions,
  useSmartDefault,
  suggestionSources,
  smartDefaults,
  createSuggestionConfig,
  createAutoCompleteConfig,
};
