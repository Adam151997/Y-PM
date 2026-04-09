'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskInput } from '@/features/tasks/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/utils';

interface CreateTaskDialogProps {
  projectId: number;
  defaultStatus?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (task: any) => void;
}

export function CreateTaskDialog({
  projectId,
  defaultStatus = 'todo',
  open,
  onOpenChange,
  onSuccess,
}: CreateTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId,
      status: defaultStatus as any,
      priority: 'medium',
    },
  });

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
      onSuccess(task);
      toast.success('Task created successfully');
      reset();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    },
  });

  const onSubmit = async (data: CreateTaskInput) => {
    setIsLoading(true);
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        setIsLoading(false);
        onOpenChange(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/80" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-[100000] bg-card border border-border p-6 rounded-lg max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
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
              <Label>Priority</Label>
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

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="hover:bg-secondary/50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
