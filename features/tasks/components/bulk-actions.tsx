'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Move, Trash2, Archive, Tag, User, Flag, 
  Copy, Check, X, MoreHorizontal, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task, Label } from '@/features/tasks/types';

interface BulkActionsProps {
  selectedTasks: Set<number>;
  tasks: Task[];
  labels: Label[];
  onBulkMove: (taskIds: number[], status: string) => Promise<void>;
  onBulkDelete: (taskIds: number[]) => Promise<void>;
  onBulkArchive: (taskIds: number[]) => Promise<void>;
  onBulkAssign: (taskIds: number[], assigneeId: number | null) => Promise<void>;
  onBulkLabel: (taskIds: number[], labelId: number) => Promise<void>;
  onBulkPriority: (taskIds: number[], priority: string) => Promise<void>;
  onClearSelection: () => void;
}

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { value: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'in_review', label: 'In Review', color: 'bg-purple-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

export function BulkActions({
  selectedTasks,
  tasks,
  labels,
  onBulkMove,
  onBulkDelete,
  onBulkArchive,
  onBulkAssign,
  onBulkLabel,
  onBulkPriority,
  onClearSelection,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  // Get unique assignees from selected tasks
  const assignees = Array.from(
    new Set(
      tasks
        .filter(task => selectedTasks.has(task.id) && task.assignee)
        .map(task => task.assignee!)
    )
  );

  // Get selected task details for context
  const selectedTaskDetails = tasks.filter(task => selectedTasks.has(task.id));
  const hasMixedStatus = new Set(selectedTaskDetails.map(t => t.status)).size > 1;
  const hasMixedPriority = new Set(selectedTaskDetails.map(t => t.priority)).size > 1;
  const hasMixedAssignee = new Set(selectedTaskDetails.map(t => t.assignee?.id)).size > 1;

  // Show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle bulk move
  const handleBulkMove = useCallback(async (status: string) => {
    if (selectedTasks.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkMove(Array.from(selectedTasks), status);
      showSuccessMessage(`Moved ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''} to ${STATUS_OPTIONS.find(s => s.value === status)?.label}`);
      setSelectedStatus('');
    } catch (error) {
      console.error('Failed to move tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTasks, onBulkMove]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedTasks.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}? This action cannot be undone.`)) {
      setIsProcessing(true);
      try {
        await onBulkDelete(Array.from(selectedTasks));
        showSuccessMessage(`Deleted ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}`);
      } catch (error) {
        console.error('Failed to delete tasks:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [selectedTasks, onBulkDelete]);

  // Handle bulk archive
  const handleBulkArchive = useCallback(async () => {
    if (selectedTasks.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkArchive(Array.from(selectedTasks));
      showSuccessMessage(`Archived ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to archive tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTasks, onBulkArchive]);

  // Handle bulk assign
  const handleBulkAssign = useCallback(async (assigneeId: number | null) => {
    if (selectedTasks.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkAssign(Array.from(selectedTasks), assigneeId);
      const message = assigneeId 
        ? `Assigned ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}`
        : `Unassigned ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}`;
      showSuccessMessage(message);
      setSelectedAssignee('');
    } catch (error) {
      console.error('Failed to assign tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTasks, onBulkAssign]);

  // Handle bulk label
  const handleBulkLabel = useCallback(async (labelId: number) => {
    if (selectedTasks.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkLabel(Array.from(selectedTasks), labelId);
      const label = labels.find(l => l.id === labelId);
      showSuccessMessage(`Added label "${label?.name}" to ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}`);
      setSelectedLabel('');
    } catch (error) {
      console.error('Failed to label tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTasks, labels, onBulkLabel]);

  // Handle bulk priority
  const handleBulkPriority = useCallback(async (priority: string) => {
    if (selectedTasks.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkPriority(Array.from(selectedTasks), priority);
      showSuccessMessage(`Set priority to ${priority} for ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''}`);
      setSelectedPriority('');
    } catch (error) {
      console.error('Failed to set priority:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTasks, onBulkPriority]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + D to duplicate (placeholder)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedTasks.size > 0) {
        e.preventDefault();
        // Duplicate functionality would go here
      }
      
      // Delete key to delete
      if (e.key === 'Delete' && selectedTasks.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      
      // Escape to clear selection
      if (e.key === 'Escape' && selectedTasks.size > 0) {
        e.preventDefault();
        onClearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTasks, handleBulkDelete, onClearSelection]);

  if (selectedTasks.size === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Success message */}
      {showSuccess && (
        <div className="absolute -top-12 left-0 right-0 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">{successMessage}</span>
              <Sparkles className="h-3 w-3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "flex items-center gap-3 p-3 border rounded-lg bg-primary/5 transition-all duration-300",
        isProcessing && "opacity-50"
      )}>
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <Badge variant="default" className="px-3 py-1">
            {selectedTasks.size} selected
          </Badge>
          <span className="text-sm text-muted-foreground">
            {hasMixedStatus && '(Mixed status)'}
            {hasMixedPriority && '(Mixed priority)'}
            {hasMixedAssignee && '(Mixed assignee)'}
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          {/* Move */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Move to">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  <span>Move</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Set priority">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  <span>Priority</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                    {priority.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Assignee */}
          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Assign to">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Assign</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee.id} value={assignee.id.toString()}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Labels */}
          {labels.length > 0 && (
            <Select value={selectedLabel} onValueChange={setSelectedLabel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Add label">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Label</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {labels.map((label) => (
                  <SelectItem key={label.id} value={label.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBulkArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleBulkDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
                <span className="ml-auto text-xs text-muted-foreground">Del</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Apply buttons */}
          <div className="flex items-center gap-2 ml-2">
            {selectedStatus && (
              <Button 
                size="sm" 
                onClick={() => handleBulkMove(selectedStatus)}
                disabled={isProcessing}
              >
                Apply Move
              </Button>
            )}
            {selectedPriority && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleBulkPriority(selectedPriority)}
                disabled={isProcessing}
              >
                Apply Priority
              </Button>
            )}
            {selectedAssignee && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleBulkAssign(
                  selectedAssignee === 'unassigned' ? null : parseInt(selectedAssignee)
                )}
                disabled={isProcessing}
              >
                Apply Assign
              </Button>
            )}
            {selectedLabel && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleBulkLabel(parseInt(selectedLabel))}
                disabled={isProcessing}
              >
                Apply Label
              </Button>
            )}
          </div>

          {/* Clear selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
            <span className="ml-2 text-xs text-muted-foreground">ESC</span>
          </Button>
        </div>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
