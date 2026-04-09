'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronRight, AlertCircle, Calendar, Link2, X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getTaskDetails, addComment, getTaskComments, updateTask, addDependency, removeDependency, getTasks } from '../server-actions';

interface TaskDetailDialogProps {
  taskId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

const statusLabels: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export function TaskDetailDialog({ taskId, open, onOpenChange, projectId }: TaskDetailDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [commentText, setCommentText] = useState('');
  const [isAddingDependency, setIsAddingDependency] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskId ? getTaskDetails(taskId) : null,
    enabled: !!taskId && open,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => taskId ? getTaskComments(taskId) : [],
    enabled: !!taskId && open,
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasks(projectId),
    enabled: isAddingDependency,
  });

  const handleUpdateField = async (field: string, value: any) => {
    if (!taskId) return;
    try {
      await updateTask(taskId, { [field]: value });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleAddComment = async () => {
    if (!taskId || !commentText.trim()) return;
    try {
      await addComment(taskId, commentText);
      setCommentText('');
      refetchComments();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleAddDependency = async (dependsOnTaskId: number) => {
    if (!taskId) return;
    try {
      await addDependency(taskId, dependsOnTaskId);
      setIsAddingDependency(false);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Dependency added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add dependency');
    }
  };

  const handleRemoveDependency = async (dependencyId: number) => {
    if (!taskId) return;
    try {
      await removeDependency(dependencyId);
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast.success('Dependency removed');
    } catch (error) {
      toast.error('Failed to remove dependency');
    }
  };

  if (!taskId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold pr-8">
              {task?.title || 'Loading...'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-auto mt-4">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      value={task?.description || ''}
                      onChange={(e) => handleUpdateField('description', e.target.value)}
                      placeholder="Add a description..."
                      className="min-h-[150px]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" /> Status
                    </Label>
                    <Select 
                      value={task?.status || 'todo'} 
                      onValueChange={(v) => handleUpdateField('status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Priority</Label>
                    <Select 
                      value={task?.priority || 'medium'} 
                      onValueChange={(v) => handleUpdateField('priority', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Assignee</Label>
                    <Select
                      value={task?.assigneeId?.toString() || ''}
                      onValueChange={(v) => handleUpdateField('assigneeId', v ? parseInt(v) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Start Date
                    </Label>
                    <Input
                      type="date"
                      value={task?.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleUpdateField('startDate', e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Due Date
                    </Label>
                    <Input
                      type="date"
                      value={task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleUpdateField('dueDate', e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-[80px]"
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      size="sm"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.user?.name || 'User'}</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a') : ''}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No comments yet</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dependencies" className="flex-1 overflow-auto mt-4">
              <div className="space-y-6">
                {/* Add new dependency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Dependency
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsAddingDependency(!isAddingDependency)}
                    >
                      {isAddingDependency ? 'Cancel' : '+ Add'}
                    </Button>
                  </div>
                  
                  {isAddingDependency && (
                    <div className="p-3 bg-muted rounded-lg space-y-2">
                      <Select onValueChange={(v) => handleAddDependency(Number(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task to depend on" />
                        </SelectTrigger>
                        <SelectContent>
                          {allTasks
                            .filter((t: any) => t.id !== taskId)
                            .filter((t: any) => !((task as any)?.dependencies || []).some((d: any) => d.dependsOnTaskId === t.id))
                            .map((t: any) => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                {t.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Dependencies (tasks this task blocks) */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Blocks
                  </h4>
                  {(task as any)?.dependencies?.map((dep: any) => (
                    <div key={dep.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <span>{dep.dependsOnTask?.title || `Task #${dep.dependsOnTaskId}`}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {dep.dependsOnTask?.status}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveDependency(dep.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {(!task || !(task as any)?.dependencies?.length) && (
                    <p className="text-muted-foreground text-sm">No blocking tasks</p>
                  )}
                </div>

                {/* Blocked by (tasks that block this task) */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Blocked By
                  </h4>
                  {(task as any)?.dependentTasks?.map((dep: any) => (
                    <div key={dep.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <span>{dep.task?.title || `Task #${dep.taskId}`}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {dep.task?.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!task || !(task as any)?.dependentTasks?.length) && (
                    <p className="text-muted-foreground text-sm">Not blocked by any tasks</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}