'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface TaskSummary {
  status: string;
  priority: string;
}

interface DashboardChartsProps {
  tasks: TaskSummary[];
  projectTaskCounts: { projectName: string; taskCount: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export function DashboardCharts({ tasks, projectTaskCounts }: DashboardChartsProps) {
  const statusData = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const priorityData = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ name, value }));
  const priorityChartData = Object.entries(priorityData).map(([name, value]) => ({ name, value }));

  const statusLabels: Record<string, string> = {
    backlog: 'Backlog',
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
    cancelled: 'Cancelled',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Tasks by Status - Pie Chart */}
      <div className="bg-card rounded-lg p-4 border">
        <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
        {statusChartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No tasks yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${statusLabels[name] || name}: ${value}`}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${statusLabels[name] || name}: ${value}`, 
                  'Tasks'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tasks by Priority - Bar Chart */}
      <div className="bg-card rounded-lg p-4 border">
        <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
        {priorityChartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No tasks yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityChartData}>
              <XAxis 
                dataKey="name" 
                tickFormatter={(name) => priorityLabels[name] || name}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${priorityLabels[name] || name}: ${value}`, 
                  'Tasks'
                ]}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tasks per Project - Bar Chart */}
      <div className="bg-card rounded-lg p-4 border md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Tasks per Project</h3>
        {projectTaskCounts.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No projects yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectTaskCounts}>
              <XAxis dataKey="projectName" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="taskCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}