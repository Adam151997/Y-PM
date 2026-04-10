'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskInput } from '@/features/tasks/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, X, Command, ArrowRight, Sparkles, 
  Calendar, User, Tag, Flag, Hash 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/utils';

interface QuickTaskCreateProps {
  projectId: number;
  defaultStatus?: string;
  onSuccess?: (task: any) => void;
  trigger?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  autoFocus?: boolean;
}

export function QuickTaskCreate({
  projectId,
  defaultStatus = 'todo',
  onSuccess,
  trigger,
  position = 'bottom',
  autoFocus = true,
}: QuickTaskCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId,
      status: defaultStatus as any,
      priority: 'medium',
      title: '',
    },
  });

  const title = watch('title');

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      onSuccess?.(task);
      toast.success('Task created successfully', {
        description: `"${task.title}" has been created.`,
        icon: <Sparkles className="h-4 w-4" />,
      });
      reset();
      setIsOpen(false);
      setShowAdvanced(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    },
  });

  // Handle form submission
  const onSubmit = async (data: CreateTaskInput) => {
    setIsLoading(true);
    createTaskMutation.mutate(data, {
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  // Handle quick submission (just title)
  const handleQuickSubmit = () => {
    if (!title.trim()) return;
    
    const data: CreateTaskInput = {
      projectId,
      title: title.trim(),
      status: defaultStatus as any,
      priority: 'medium',
    };
    
    onSubmit(data);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to create task
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isOpen && title.trim()) {
          handleQuickSubmit();
        } else if (!isOpen) {
          setIsOpen(true);
        }
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        reset();
      }
      
      // Tab to toggle advanced
      if (e.key === 'Tab' && isOpen && title.trim()) {
        e.preventDefault();
        setShowAdvanced(!showAdvanced);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, handleQuickSubmit]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, autoFocus]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowAdvanced(false);
    }
  }, [isOpen, reset]);

  return (
    <div className="relative">
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="relative group"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Quick Add
          <kbd className="ml-2 hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />
            <span>↵</span>
          </kbd>
        </Button>
      )}

      {/* Popover */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-2 w-96 bg-card border rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2",
          position === 'top' && "bottom-full mb-2",
          position === 'bottom' && "top-full mt-2",
          position === 'left' && "right-full mr-2",
          position === 'right' && "left-full ml-2"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Task</h3>
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-1 py-0.5 rounded border text-xs">⌘↵</kbd> to create
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {/* Title input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder="What needs to be done?"
                  {...register('title')}
                  className="pr-20"
                  autoComplete="off"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    <Command className="h-3 w-3 mr-1" />
                    ↵
                  </Badge>
                </div>
              </div>
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Advanced options toggle */}
            {title.trim() && (
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs"
                >
                  {showAdvanced ? 'Hide options' : 'Add details'}
                  <ArrowRight className={cn(
                    "h-3 w-3 ml-1 transition-transform",
                    showAdvanced && "rotate-90"
                  )} />
                </Button>
                
                {/* Quick actions */}
                <div className="flex items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        onSelect={(date) => setValue('dueDate', date?.toISOString().split('T')[0])}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Select onValueChange={(value) => setValue('priority', value as any)}>
                    <SelectTrigger className="h-7 w-20">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Flag className="h-3 w-3" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Advanced options */}
            {showAdvanced && (
              <div className="space-y-4 pt-4 border-t animate-in fade-in">
                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Description
                  </label>
                  <Textarea
                    placeholder="Add more details..."
                    rows={3}
                    {...register('description')}
                    className="resize-none"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Status
                    </label>
                    <Select
                      defaultValue={defaultStatus}
                      onValueChange={(value) => setValue('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Priority
                    </label>
                    <Select
                      defaultValue="medium"
                      onValueChange={(value) => setValue('priority', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    {...register('dueDate')}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Shortcuts:</span>
                  <kbd className="px-1.5 py-0.5 rounded border text-xs">⌘↵</kbd>
                  <span>create</span>
                  <kbd className="px-1.5 py-0.5 rounded border text-xs">Tab</kbd>
                  <span>details</span>
                  <kbd className="px-1.5 py-0.5 rounded border text-xs">Esc</kbd>
                  <span>close</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !title.trim()}
                  className="min-w-24"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Task
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
