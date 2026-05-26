import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator';

export class TaskController {
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await taskService.getTasks(req.userId!);
      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await taskService.getTaskStats(req.userId!);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createTaskSchema.parse(req.body);
      const task = await taskService.createTask(req.userId!, input);
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_ID', message: 'Invalid task ID' },
        });
        return;
      }

      const input = updateTaskSchema.parse(req.body);
      const task = await taskService.updateTask(req.userId!, taskId, input);
      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_ID', message: 'Invalid task ID' },
        });
        return;
      }

      await taskService.deleteTask(req.userId!, taskId);
      res.json({
        success: true,
        message: 'Task deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
