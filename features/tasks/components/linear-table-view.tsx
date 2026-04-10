'use client';

import { useState } from 'react';
import { 
  Eye, Filter, Search, Plus, Trash2, Move 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SkeletonTable } from '@/components/ui/skeleton-card';
import type { Task, Label } from '@/features/tasks/types';

interface LinearTableViewProps {
  tasks: Task[];
  labels: Label[];
  onTaskClick?: (taskId: number) => void;
  onTaskCreate?: () => void;
  isLoading?: boolean;
}

export function LinearTableView({
  tasks,
  labels,
  onTaskClick,
  onTaskCreate,
  isLoading = false,
}: LinearTableViewProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks
  const filteredTasks = tasks.filter(task => 
    searchQuery === '' || 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle multi-select
  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectAllTasks = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  if (isLoading) {
    return <SkeletonTable />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Selection checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedTasks.size > 0 && selectedTasks.size === filteredTasks.length}
              indeterminate={selectedTasks.size > 0 && selectedTasks.size < filteredTasks.length}
              onChange={selectAllTasks}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            {selectedTasks.size > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {selectedTasks.size} selected
              </span>
            )}
          </div>

          {/* Bulk actions */}
          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm">
                <Move className="h-4 w-4 mr-2" />
                Move
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTasks(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* Create task */}
          <Button onClick={onTaskCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
            <kbd className="ml-2 hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>↵
            </kbd>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 w-8">
                  {/* Checkbox column header handled in toolbar */}
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-[300px]">
                  Title
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                  Status
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                  Priority
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                  Assignee
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                  Due Date
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                  Labels
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Eye className="h-8 w-8" />
                      <p>No tasks found</p>
                      {searchQuery ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={onTaskCreate}>
                          Create your first task
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isSelected = selectedTasks.has(task.id);

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        'border-b hover:bg-muted/30 transition-colors group',
                        isSelected && 'bg-primary/5'
                      )}
                    >
                      {/* Selection checkbox */}
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>

                      {/* Title */}
                      <td 
                        className="p-3 cursor-pointer"
                        onClick={() => onTaskClick?.(task.id)}
                      >
                        <div className="font-medium">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </td>

                      {/* Priority */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === 'urgent' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <span className="capitalize text-sm">{task.priority}</span>
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="p-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {task.assignee.name[0]}
                              </span>
                            </div>
                            <span className="text-sm">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="p-3">
                        {task.dueDate ? (
                          <span className="text-sm">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Labels */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {task.taskLabels?.slice(0, 2).map((tl) => (
                            <Badge 
                              key={tl.label.id} 
                              variant="outline"
                              className="text-xs"
                              style={{ 
                                borderColor: tl.label.color,
                                color: tl.label.color
                              }}
                            >
                              {tl.label.name}
                            </Badge>
                          ))}
                          {task.taskLabels && task.taskLabels.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{task.taskLabels.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
