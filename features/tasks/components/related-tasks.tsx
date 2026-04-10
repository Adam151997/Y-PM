'use client';

import { useState } from 'react';
import {
  Link2, GitBranch, GitPullRequest, AlertCircle,
  Plus, X, ChevronRight, CheckCircle, Clock,
  Circle, ArrowRight, Lock, Unlock, Filter,
  MoreVertical, ExternalLink, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface RelatedTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee?: {
    id: number;
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  relationType: 'blocks' | 'blocked_by' | 'related' | 'duplicate' | 'subtask' | 'parent';
}

interface RelatedTasksProps {
  tasks: RelatedTask[];
  allTasks: Array<{
    id: number;
    title: string;
    status: string;
  }>;
  onAddRelation: (taskId: number, relationType: RelatedTask['relationType']) => Promise<void>;
  onRemoveRelation: (relationId: number) => Promise<void>;
  className?: string;
}

const relationTypes = [
  { value: 'blocks', label: 'Blocks', icon: Lock, color: 'text-red-500 bg-red-500/10' },
  { value: 'blocked_by', label: 'Blocked By', icon: AlertCircle, color: 'text-amber-500 bg-amber-500/10' },
  { value: 'related', label: 'Related', icon: Link2, color: 'text-blue-500 bg-blue-500/10' },
  { value: 'duplicate', label: 'Duplicate', icon: GitBranch, color: 'text-purple-500 bg-purple-500/10' },
  { value: 'subtask', label: 'Subtask', icon: GitPullRequest, color: 'text-green-500 bg-green-500/10' },
  { value: 'parent', label: 'Parent', icon: GitPullRequest, color: 'text-indigo-500 bg-indigo-500/10' },
];

const statusColors: Record<string, string> = {
  'backlog': 'bg-gray-500',
  'todo': 'bg-blue-500',
  'in_progress': 'bg-amber-500',
  'in_review': 'bg-purple-500',
  'done': 'bg-emerald-500',
  'cancelled': 'bg-red-500',
};

const priorityColors: Record<string, string> = {
  'low': 'bg-gray-500',
  'medium': 'bg-blue-500',
  'high': 'bg-orange-500',
  'urgent': 'bg-red-500',
};

export function RelatedTasks({
  tasks,
  allTasks,
  onAddRelation,
  onRemoveRelation,
  className,
}: RelatedTasksProps) {
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedRelationType, setSelectedRelationType] = useState<string>('related');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddRelation = async () => {
    if (!selectedTaskId) {
      toast.error('Please select a task');
      return;
    }

    try {
      await onAddRelation(parseInt(selectedTaskId), selectedRelationType as RelatedTask['relationType']);
      setIsAddingRelation(false);
      setSelectedTaskId('');
      setSelectedRelationType('related');
      toast.success('Relation added');
    } catch (error) {
      toast.error('Failed to add relation');
    }
  };

  const handleRemoveRelation = async (relationId: number) => {
    if (confirm('Are you sure you want to remove this relation?')) {
      try {
        await onRemoveRelation(relationId);
        toast.success('Relation removed');
      } catch (error) {
        toast.error('Failed to remove relation');
      }
    }
  };

  const getRelationIcon = (relationType: RelatedTask['relationType']) => {
    const relation = relationTypes.find(r => r.value === relationType);
    const Icon = relation?.icon || Link2;
    return <Icon className="h-4 w-4" />;
  };

  const getRelationColor = (relationType: RelatedTask['relationType']) => {
    const relation = relationTypes.find(r => r.value === relationType);
    return relation?.color || 'text-gray-500 bg-gray-500/10';
  };

  const getRelationLabel = (relationType: RelatedTask['relationType']) => {
    const relation = relationTypes.find(r => r.value === relationType);
    return relation?.label || 'Related';
  };

  const filteredTasks = allTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.id.toString().includes(searchQuery)
  );

  // Group tasks by relation type
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.relationType]) {
      acc[task.relationType] = [];
    }
    acc[task.relationType].push(task);
    return acc;
  }, {} as Record<string, RelatedTask[]>);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Relations</h3>
          <Badge variant="outline" className="ml-2">
            {tasks.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingRelation(!isAddingRelation)}
          >
            {isAddingRelation ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Relation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Add relation form */}
      {isAddingRelation && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Relation Type</label>
                <Select
                  value={selectedRelationType}
                  onValueChange={setSelectedRelationType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationTypes.map((relation) => {
                      const Icon = relation.icon;
                      return (
                        <SelectItem key={relation.value} value={relation.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {relation.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search Tasks</label>
                <Input
                  placeholder="Search by title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {searchQuery && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                        selectedTaskId === task.id.toString() && "bg-primary/10"
                      )}
                      onClick={() => setSelectedTaskId(task.id.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${statusColors[task.status] || 'bg-gray-500'}`} />
                          <span className="font-medium">#{task.id}</span>
                          <span className="truncate">{task.title}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingRelation(false);
                  setSelectedTaskId('');
                  setSearchQuery('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddRelation}
                disabled={!selectedTaskId}
              >
                Add Relation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Relation groups */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([relationType, relationTasks]) => {
          const relation = relationTypes.find(r => r.value === relationType);
          const Icon = relation?.icon || Link2;
          const color = relation?.color || 'text-gray-500 bg-gray-500/10';

          return (
            <div key={relationType} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="font-semibold">{relation?.label || 'Related'}</h4>
                <Badge variant="outline">{relationTasks.length}</Badge>
              </div>

              <div className="space-y-2">
                {relationTasks.map((task) => (
                  <Card key={task.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-2 w-2 rounded-full ${statusColors[task.status] || 'bg-gray-500'}`} />
                          <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority] || 'bg-gray-500'}`} />
                          <span className="font-mono text-sm text-muted-foreground">#{task.id}</span>
                        </div>

                        <h4 className="font-medium mb-2">{task.title}</h4>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="capitalize">
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {task.priority}
                          </Badge>
                          {task.assignee && (
                            <Badge variant="outline">
                              {task.assignee.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Task
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveRelation(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Relation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && !isAddingRelation && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Link2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No relations yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Link this task to other tasks to show dependencies, duplicates, or relationships.
          </p>
          <Button onClick={() => setIsAddingRelation(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first relation
          </Button>
        </div>
      )}

      {/* Relation type legend */}
      {tasks.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Relation Types</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relationTypes.map((relation) => {
              const Icon = relation.icon;
              return (
                <div key={relation.value} className="flex items-center gap-2">
                  <div className={cn('h-6 w-6 rounded flex items-center justify-center', relation.color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-sm">{relation.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
