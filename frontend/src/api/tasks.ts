import client from './client';
import { ApiResponse, Task, TaskStats } from '../types';

export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    const { data } = await client.get<ApiResponse<Task[]>>('/tasks');
    return data.data || [];
  },

  getStats: async (): Promise<TaskStats> => {
    const { data } = await client.get<ApiResponse<TaskStats>>('/tasks/stats');
    return data.data || { total: 0, completed: 0, pending: 0 };
  },

  createTask: async (title: string, dueDate?: string | null): Promise<Task> => {
    const { data } = await client.post<ApiResponse<Task>>('/tasks', { title, dueDate });
    return data.data!;
  },

  updateTask: async (
    id: number,
    updates: Partial<{ title: string; completed: boolean; dueDate: string | null }>
  ): Promise<Task> => {
    const { data } = await client.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
    return data.data!;
  },

  deleteTask: async (id: number): Promise<void> => {
    await client.delete(`/tasks/${id}`);
  },
};
