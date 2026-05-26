import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '../sockets/socketClient';
import { useAuthStore } from '../store/authStore';
import { Task, SocketTaskEvent } from '../types';

export const useSocket = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket();

    socket.on('task_created', (data: SocketTaskEvent) => {
      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return [data.payload as Task];
        const exists = old.some((t) => t.id === (data.payload as Task).id);
        if (exists) return old;
        return [data.payload as Task, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    });

    socket.on('task_updated', (data: SocketTaskEvent) => {
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old
          ? old.map((t) => (t.id === (data.payload as Task).id ? (data.payload as Task) : t))
          : []
      );
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    });

    socket.on('task_deleted', (data: SocketTaskEvent) => {
      const payload = data.payload as { id: number };
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old ? old.filter((t) => t.id !== payload.id) : []
      );
      queryClient.invalidateQueries({ queryKey: ['taskStats'] });
    });

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, queryClient]);
};
