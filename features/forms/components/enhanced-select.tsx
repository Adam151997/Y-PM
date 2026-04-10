'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/features/micro-interactions';
import { ANIMATION_TIMING, EASING } from '@/features/micro-interactions/utils/animation-utils';

export type SelectVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  group?: string;
}

export interface EnhancedSelectProps extends Omit<React.ComponentProps<typeof Select>, 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  loading?: boolean;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  multiSelect?: boolean;
  creatable?: boolean;
  onCreateOption?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  onChange?: (value: string | string[]) => void;
  value?: string | string[];
  defaultValue?: string | string[];
}

const EnhancedSelect = forwardRef<HTMLButtonElement, EnhancedSelectProps>(
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
      options,
      placeholder = 'Select an option',
      searchable = false,
      clearable = false,
      multiSelect = false,
      creatable = false,
      onCreateOption,
      onSearch,
      onClear,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState<string | string[]>(value || defaultValue || (multiSelect ? [] : ''));
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const reducedMotion = useReducedMotion();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Determine actual variant based on props
    const actualVariant = error ? 'error' : 
                         success ? 'success' : 
                         warning ? 'warning' : 
                         info ? 'info' : 
                         variant;

    // Filter options based on search query
    useEffect(() => {
      if (!searchQuery.trim()) {
        setFilteredOptions(options);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query) ||
        (option.description && option.description.toLowerCase().includes(query))
      );

      setFilteredOptions(filtered);
      onSearch?.(searchQuery);
    }, [searchQuery, options, onSearch]);

    // Handle value changes
    const handleValueChange = (newValue: string | string[]) => {
      setLocalValue(newValue);
      onChange?.(newValue);
    };

    // Handle single select change
    const handleSingleChange = (value: string) => {
      handleValueChange(value);
    };

    // Handle multi-select change
    const handleMultiChange = (values: string[]) => {
      handleValueChange(values);
    };

    // Clear selection
    const handleClear = () => {
      handleValueChange(multiSelect ? [] : '');
      onClear?.();
    };

    // Create new option
    const handleCreateOption = () => {
      if (!searchQuery.trim() || !onCreateOption) return;
      
      onCreateOption(searchQuery);
      setSearchQuery('');
      
      if (searchInputRef.current) {
        searchInputRef.current.focus();
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
      const base = 'border focus:ring-2 focus:ring-offset-2';
      
      switch (actualVariant) {
        case 'success':
          return cn(
            base,
            'border-green-300 focus:ring-green-500/20',
            'dark:border-green-700 dark:focus:ring-green-500/30'
          );
        case 'error':
          return cn(
            base,
            'border-red-300 focus:ring-red-500/20',
            'dark:border-red-700 dark:focus:ring-red-500/30'
          );
        case 'warning':
          return cn(
            base,
            'border-yellow-300 focus:ring-yellow-500/20',
            'dark:border-yellow-700 dark:focus:ring-yellow-500/30'
          );
        case 'info':
          return cn(
            base,
            'border-blue-300 focus:ring-blue-500/20',
            'dark:border-blue-700 dark:focus:ring-blue-500/30'
          );
        case 'default':
        default:
          return cn(
            base,
            'border-input focus:ring-ring'
          );
      }
    };

    // Get status icon
    const getStatusIcon = () => {
      if (loading) {
        return <Loader2 className="h-4 w-4 animate-spin" />;
      }
      
      if (error) {
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      }
      
      if (success) {
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      }
      
      if (warning) {
        return <HelpCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
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

    // Get selected labels
    const getSelectedLabels = () => {
      if (multiSelect && Array.isArray(localValue)) {
        return localValue
          .map(value => options.find(opt => opt.value === value)?.label)
          .filter(Boolean)
          .join(', ');
      }
      
      if (!multiSelect && typeof localValue === 'string') {
        return options.find(opt => opt.value === localValue)?.label || '';
      }
      
      return '';
    };

    // Group options by group
    const groupedOptions = filteredOptions.reduce((groups, option) => {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {} as Record<string, SelectOption[]>);

    return (
      <div className="space-y-1.5">
        {/* Label */}
        {label && (
          <Label 
            htmlFor={props.name} 
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

        {/* Select container */}
        <div className="relative">
          <Select
            value={multiSelect ? undefined : (localValue as string)}
            onValueChange={multiSelect ? undefined : handleSingleChange}
            onOpenChange={setIsOpen}
            {...props}
          >
            <SelectTrigger
              ref={ref}
              className={cn(
                getSizeClasses(),
                getVariantClasses(),
                'transition-all duration-200',
                reducedMotion && 'transition-none',
                isFocused && !reducedMotion && 'scale-[1.01]',
                isHovered && !reducedMotion && 'border-primary/50',
                className
              )}
              style={{
                transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex items-center justify-between w-full">
                <SelectValue placeholder={placeholder}>
                  {getSelectedLabels() || placeholder}
                </SelectValue>
                
                {/* Status icon */}
                {getStatusIcon() && (
                  <div className="ml-2">
                    {getStatusIcon()}
                  </div>
                )}
              </div>
            </SelectTrigger>

            <SelectContent 
              className={cn(
                reducedMotion ? 'animate-none' : 'animate-in fade-in-0 zoom-in-95',
                'max-h-[var(--radix-select-content-available-height)]'
              )}
            >
              {/* Search input */}
              {searchable && (
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <SelectGroup key={groupName}>
                  {groupName !== 'default' && (
                    <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {groupName}
                    </SelectLabel>
                  )}
                  
                  {groupOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={cn(
                        'transition-colors duration-150',
                        reducedMotion && 'transition-none'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {option.icon && (
                          <div className="flex-shrink-0">
                            {option.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  
                  {groupName !== 'default' && <SelectSeparator />}
                </SelectGroup>
              ))}

              {/* No results */}
              {filteredOptions.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No options found</p>
                  {creatable && searchQuery.trim() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={handleCreateOption}
                    >
                      Create "{searchQuery}"
                    </Button>
                  )}
                </div>
              )}

              {/* Create option */}
              {creatable && searchQuery.trim() && filteredOptions.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleCreateOption}
                  >
                    Create "{searchQuery}"
                  </Button>
                </div>
              )}
            </SelectContent>
          </Select>

          {/* Clear button */}
          {clearable && localValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          )}

          {/* Multi-select badge */}
          {multiSelect && Array.isArray(localValue) && localValue.length > 0 && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {localValue.length}
              </span>
            </div>
          )}
        </div>

        {/* Status message */}
        {getStatusMessage() && (
          <p className={cn('text-xs font-medium', getStatusColor())}>
            {getStatusMessage()}
          </p>
        )}

        {/* Selected count for multi-select */}
        {multiSelect && Array.isArray(localValue) && localValue.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {localValue.length} item{localValue.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>
    );
  }
);

EnhancedSelect.displayName = 'EnhancedSelect';

export { EnhancedSelect };
