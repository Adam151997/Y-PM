import { NextResponse } from 'next/server';
import { moveTask } from '@/features/tasks/server-actions';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    projectId: string;
    taskId: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await request.json();
    const { status, order } = body;

    const task = await moveTask(parseInt(taskId), status, order);

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 });
  }
}