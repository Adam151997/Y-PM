import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-500 bg-red-50 dark:bg-red-950';
    case 'high':
      return 'text-orange-500 bg-orange-50 dark:bg-orange-950';
    case 'medium':
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    case 'low':
      return 'text-green-500 bg-green-50 dark:bg-green-950';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'backlog':
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950';
    case 'todo':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-950';
    case 'in_progress':
      return 'text-amber-500 bg-amber-50 dark:bg-amber-950';
    case 'in_review':
      return 'text-purple-500 bg-purple-50 dark:bg-purple-950';
    case 'done':
      return 'text-green-500 bg-green-50 dark:bg-green-950';
    case 'cancelled':
      return 'text-red-500 bg-red-50 dark:bg-red-950';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950';
  }
}

export const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_ORDER = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];