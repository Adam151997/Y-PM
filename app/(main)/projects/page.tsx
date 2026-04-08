import { ProjectList } from '@/features/projects/components/project-list';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your projects</p>
        </div>
      </div>
      <ProjectList />
    </div>
  );
}