import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import { Task } from '../types';

export const useTasksQuery = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getTasks,
    staleTime: 30000,
  });
};

export const useTaskStatsQuery = () => {
  return useQuery({
    queryKey: ['taskStats'],
    queryFn: tasksApi.getStats,
    staleTime: 30000,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, dueDate }: { title: string; dueDate?: string | null }) =>
      tasksApi.createTask(title, dueDate),
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old ? [newTask, ...old] : [newTask]
      );
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<{ title: string; completed: boolean; dueDate: string | null }>;
    }) => tasksApi.updateTask(id, updates),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old ? old.map((t) => (t.id === updatedTask.id ? updatedTask : t)) : []
      );
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old ? old.filter((t) => t.id !== deletedId) : []
      );
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    },
  });
};
