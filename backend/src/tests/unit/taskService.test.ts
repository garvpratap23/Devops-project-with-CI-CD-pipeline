import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../repositories/taskRepository');
jest.mock('../../repositories/auditLogRepository');

import { TaskService } from '../../services/taskService';
import { taskRepository } from '../../repositories/taskRepository';

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return formatted tasks for a user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false, due_date: null, created_at: new Date(), updated_at: new Date() },
      ];
      (taskRepository.findAllByUser as any).mockResolvedValue(mockTasks);

      const result = await taskService.getTasks(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'Task 1');
      expect(taskRepository.findAllByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('createTask', () => {
    it('should create a task and return it', async () => {
      const mockTask = {
        id: 1, title: 'New Task', completed: false, due_date: null,
        created_at: new Date(), updated_at: new Date(),
      };
      (taskRepository.create as any).mockResolvedValue(mockTask);

      const result = await taskService.createTask(1, { title: 'New Task', dueDate: null });

      expect(result.title).toBe('New Task');
      expect(result.completed).toBe(false);
    });
  });

  describe('deleteTask', () => {
    it('should throw if task not found', async () => {
      (taskRepository.findByIdAndUser as any).mockResolvedValue(null);

      await expect(taskService.deleteTask(1, 999)).rejects.toThrow('Task does not exist');
    });

    it('should delete task if owned by user', async () => {
      (taskRepository.findByIdAndUser as any).mockResolvedValue({ id: 1 });
      (taskRepository.delete as any).mockResolvedValue(true);

      await expect(taskService.deleteTask(1, 1)).resolves.not.toThrow();
    });
  });
});
