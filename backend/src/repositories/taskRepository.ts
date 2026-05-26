import { Task } from '../models';

export class TaskRepository {
  async findAllByUser(userId: number): Promise<Task[]> {
    return Task.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  async findById(id: number): Promise<Task | null> {
    return Task.findByPk(id);
  }

  async findByIdAndUser(id: number, userId: number): Promise<Task | null> {
    return Task.findOne({
      where: { id, user_id: userId },
    });
  }

  async create(data: { title: string; user_id: number; due_date?: Date | null }): Promise<Task> {
    return Task.create(data);
  }

  async update(id: number, data: Partial<{ title: string; completed: boolean; due_date: Date | null }>): Promise<Task | null> {
    const task = await Task.findByPk(id);
    if (!task) return null;
    return task.update(data);
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await Task.destroy({ where: { id } });
    return deleted > 0;
  }

  async countByUser(userId: number): Promise<{ total: number; completed: number; pending: number }> {
    const total = await Task.count({ where: { user_id: userId } });
    const completed = await Task.count({ where: { user_id: userId, completed: true } });
    return {
      total,
      completed,
      pending: total - completed,
    };
  }
}

export const taskRepository = new TaskRepository();
