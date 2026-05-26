import { User } from '../models';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
  }

  async findByIdWithPassword(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async create(email: string, passwordHash: string): Promise<User> {
    return User.create({ email, password_hash: passwordHash });
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await User.update({ password_hash: passwordHash }, { where: { id } });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await User.count({ where: { email } });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
