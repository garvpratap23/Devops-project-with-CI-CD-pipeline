import { RefreshToken } from '../models';
import crypto from 'crypto';

export class RefreshTokenRepository {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async create(token: string, userId: number, familyId: string, expiresAt: Date): Promise<RefreshToken> {
    const tokenHash = this.hashToken(token);
    return RefreshToken.create({
      token_hash: tokenHash,
      user_id: userId,
      family_id: familyId,
      expires_at: expiresAt,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(token);
    return RefreshToken.findOne({
      where: { token_hash: tokenHash },
    });
  }

  async deleteByToken(token: string): Promise<number> {
    const tokenHash = this.hashToken(token);
    return RefreshToken.destroy({
      where: { token_hash: tokenHash },
    });
  }

  async deleteAllForUser(userId: number): Promise<number> {
    return RefreshToken.destroy({
      where: { user_id: userId },
    });
  }

  async deleteByFamily(familyId: string): Promise<number> {
    return RefreshToken.destroy({
      where: { family_id: familyId },
    });
  }

  async deleteExpired(): Promise<number> {
    const { Op } = await import('sequelize');
    return RefreshToken.destroy({
      where: {
        expires_at: { [Op.lt]: new Date() },
      },
    });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
