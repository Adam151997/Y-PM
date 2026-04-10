'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Folder, FileText, Users, Calendar } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  dropdownItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Mock data for demonstration
const mockProjects = [
  { id: 1, name: 'Website Redesign', href: '/projects/1' },
  { id: 2, name: 'Mobile App', href: '/projects/2' },
  { id: 3, name: 'Marketing Campaign', href: '/projects/3' },
  { id: 4, name: 'Q4 Planning', href: '/projects/4' },
  { id: 5, name: 'Customer Portal', href: '/projects/5' },
];

const mockTasks = [
  { id: 101, name: 'Design Homepage', href: '/tasks/101' },
  { id: 102, name: 'Implement Auth', href: '/tasks/102' },
  { id: 103, name: 'Write Documentation', href: '/tasks/103' },
  { id: 104, name: 'Fix Mobile Bugs', href: '/tasks/104' },
];

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  return (
    <Breadcrumb className={cn('fade-in', className)}>
      <BreadcrumbList>
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {item.dropdownItems ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1.5 px-2 py-1 h-auto text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        {item.icon && <span className="h-3.5 w-3.5">{item.icon}</span>}
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight className="h-3 w-3 rotate-90" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {item.dropdownItems.map((dropdownItem) => (
                        <DropdownMenuItem key={dropdownItem.href} asChild>
                          <Link
                            href={dropdownItem.href}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {dropdownItem.icon && (
                              <span className="h-3.5 w-3.5 text-muted-foreground">
                                {dropdownItem.icon}
                              </span>
                            )}
                            <span>{dropdownItem.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-foreground group relative">
                    {item.icon && <span className="h-3.5 w-3.5">{item.icon}</span>}
                    <span>{item.label}</span>
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-100 transition-transform duration-200" />
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group relative"
                    >
                      {item.icon && <span className="h-3.5 w-3.5">{item.icon}</span>}
                      <span>{item.label}</span>
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/30 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Map segment to label and icon
    const { label, icon, dropdownItems } = getSegmentInfo(segment, currentPath, isLast);

    items.push({
      label,
      href: currentPath,
      icon,
      ...(dropdownItems && { dropdownItems }),
    });
  });

  return items;
}

function getSegmentInfo(
  segment: string,
  path: string,
  isLast: boolean
): {
  label: string;
  icon?: React.ReactNode;
  dropdownItems?: Array<{ label: string; href: string; icon?: React.ReactNode }>;
} {
  // Handle numeric segments (IDs)
  if (/^\d+$/.test(segment)) {
    const parentPath = path.split('/').slice(0, -1).join('/') || '/';
    const parentSegment = parentPath.split('/').filter(Boolean).pop();

    switch (parentSegment) {
      case 'projects':
        return {
          label: 'Website Redesign', // In real app, fetch from API
          icon: <Folder className="h-3.5 w-3.5" />,
          dropdownItems: isLast
            ? undefined
            : mockProjects.map((p) => ({
                label: p.name,
                href: p.href,
                icon: <Folder className="h-3.5 w-3.5" />,
              })),
        };
      case 'tasks':
        return {
          label: 'Design Homepage', // In real app, fetch from API
          icon: <FileText className="h-3.5 w-3.5" />,
          dropdownItems: isLast
            ? undefined
            : mockTasks.map((t) => ({
                label: t.name,
                href: t.href,
                icon: <FileText className="h-3.5 w-3.5" />,
              })),
        };
      default:
        return { label: `Item ${segment}` };
    }
  }

  // Handle known routes
  switch (segment) {
    case 'dashboard':
      return { label: 'Dashboard', icon: <Home className="h-3.5 w-3.5" /> };
    case 'projects':
      return {
        label: 'Projects',
        icon: <Folder className="h-3.5 w-3.5" />,
        dropdownItems: isLast
          ? undefined
          : mockProjects.map((p) => ({
              label: p.name,
              href: p.href,
              icon: <Folder className="h-3.5 w-3.5" />,
            })),
      };
    case 'tasks':
      return {
        label: 'Tasks',
        icon: <FileText className="h-3.5 w-3.5" />,
        dropdownItems: isLast
          ? undefined
          : mockTasks.map((t) => ({
              label: t.name,
              href: t.href,
              icon: <FileText className="h-3.5 w-3.5" />,
            })),
      };
    case 'team':
      return { label: 'Team', icon: <Users className="h-3.5 w-3.5" /> };
    case 'calendar':
      return { label: 'Calendar', icon: <Calendar className="h-3.5 w-3.5" /> };
    case 'new':
      return { label: 'New', icon: <FileText className="h-3.5 w-3.5" /> };
    case 'settings':
      return { label: 'Settings', icon: <FileText className="h-3.5 w-3.5" /> };
    default:
      // Capitalize and format the segment
      const formattedLabel = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label: formattedLabel };
  }
}