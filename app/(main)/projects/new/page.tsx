import { NewProjectForm } from '@/features/projects/components/new-project-form';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Project</h1>
        <p className="text-muted-foreground mt-1">Create a new project to organize your work</p>
      </div>
      <NewProjectForm />
    </div>
  );
}