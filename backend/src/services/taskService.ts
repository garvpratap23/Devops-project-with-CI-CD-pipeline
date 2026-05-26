import { taskRepository } from '../repositories/taskRepository';
import { auditLogRepository } from '../repositories/auditLogRepository';
import { ApiError } from '../utils/ApiError';
import { CreateTaskInput, UpdateTaskInput } from '../validators/taskValidator';
import { logger } from '../utils/logger';

interface TaskDTO {
  id: number;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Socket emitter will be injected later
let emitTaskEvent: ((event: string, userId: number, payload: Record<string, unknown>) => void) | null = null;

export const setTaskEventEmitter = (
  emitter: (event: string, userId: number, payload: Record<string, unknown>) => void
): void => {
  emitTaskEvent = emitter;
};

export class TaskService {
  async getTasks(userId: number): Promise<TaskDTO[]> {
    const tasks = await taskRepository.findAllByUser(userId);
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      dueDate: t.due_date,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  }

  async getTaskStats(userId: number) {
    return taskRepository.countByUser(userId);
  }

  async createTask(userId: number, input: CreateTaskInput): Promise<TaskDTO> {
    const task = await taskRepository.create({
      title: input.title,
      user_id: userId,
      due_date: input.dueDate,
    });

    await auditLogRepository.create({
      user_id: userId,
      action: 'TASK_CREATED',
      entity_type: 'task',
      entity_id: task.id,
    });

    const payload = {
      id: task.id,
      title: task.title,
      completed: task.completed,
      dueDate: task.due_date,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    };

    // Emit WebSocket event
    if (emitTaskEvent) {
      emitTaskEvent('task_created', userId, payload);
    }

    logger.info(`Task created: ${task.id} by user ${userId}`);
    return payload;
  }

  async updateTask(userId: number, taskId: number, input: UpdateTaskInput): Promise<TaskDTO> {
    const task = await taskRepository.findByIdAndUser(taskId, userId);
    if (!task) {
      throw ApiError.notFound('TASK_NOT_FOUND', 'Task does not exist');
    }

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.completed !== undefined) updateData.completed = input.completed;
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate;

    const updated = await taskRepository.update(taskId, updateData as { title?: string; completed?: boolean; due_date?: Date | null });
    if (!updated) {
      throw ApiError.internal('Failed to update task');
    }

    await auditLogRepository.create({
      user_id: userId,
      action: 'TASK_UPDATED',
      entity_type: 'task',
      entity_id: taskId,
    });

    const payload = {
      id: updated.id,
      title: updated.title,
      completed: updated.completed,
      dueDate: updated.due_date,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    if (emitTaskEvent) {
      emitTaskEvent('task_updated', userId, payload);
    }

    logger.info(`Task updated: ${taskId} by user ${userId}`);
    return payload;
  }

  async deleteTask(userId: number, taskId: number) {
    const task = await taskRepository.findByIdAndUser(taskId, userId);
    if (!task) {
      throw ApiError.notFound('TASK_NOT_FOUND', 'Task does not exist');
    }

    await taskRepository.delete(taskId);

    await auditLogRepository.create({
      user_id: userId,
      action: 'TASK_DELETED',
      entity_type: 'task',
      entity_id: taskId,
    });

    if (emitTaskEvent) {
      emitTaskEvent('task_deleted', userId, { id: taskId });
    }

    logger.info(`Task deleted: ${taskId} by user ${userId}`);
  }
}

export const taskService = new TaskService();
