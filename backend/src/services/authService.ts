import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/userRepository';
import { refreshTokenRepository } from '../repositories/refreshTokenRepository';
import { auditLogRepository } from '../repositories/auditLogRepository';
import { generateAccessToken, generateRefreshToken, verifyToken, getRefreshTokenExpiry } from './tokenService';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/environment';
import { logger } from '../utils/logger';
import { RegisterInput, LoginInput, ChangePasswordInput } from '../validators/authValidator';

export class AuthService {
  async register(input: RegisterInput): Promise<{ id: number; email: string }> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict('EMAIL_EXISTS', 'An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await userRepository.create(input.email, passwordHash);

    // Audit log
    await auditLogRepository.create({
      user_id: user.id,
      action: 'USER_REGISTERED',
      entity_type: 'user',
      entity_id: user.id,
    });

    logger.info(`User registered: ${user.email}`);

    return { id: user.id, email: user.email };
  }

  async login(input: LoginInput): Promise<{
    user: { id: number; email: string };
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Store refresh token with family ID
    const familyId = uuidv4();
    await refreshTokenRepository.create(
      refreshToken,
      user.id,
      familyId,
      getRefreshTokenExpiry()
    );

    // Audit log
    await auditLogRepository.create({
      user_id: user.id,
      action: 'USER_LOGIN',
      entity_type: 'user',
      entity_id: user.id,
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async refresh(oldRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify the token signature
    let payload;
    try {
      payload = verifyToken(oldRefreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw ApiError.unauthorized('Invalid token type');
    }

    // Look up the token in the database
    const storedToken = await refreshTokenRepository.findByToken(oldRefreshToken);
    if (!storedToken) {
      // Token reuse detected — invalidate entire family
      logger.warn(`Refresh token reuse detected for user ${payload.sub}. Invalidating all tokens.`);
      await refreshTokenRepository.deleteAllForUser(payload.sub);
      throw ApiError.unauthorized('Token reuse detected. All sessions invalidated.');
    }

    // Check expiry
    if (new Date() > storedToken.expires_at) {
      await refreshTokenRepository.deleteByToken(oldRefreshToken);
      throw ApiError.unauthorized('Refresh token expired');
    }

    // Delete old token
    await refreshTokenRepository.deleteByToken(oldRefreshToken);

    // Generate new tokens
    const accessToken = generateAccessToken(payload.sub, payload.email);
    const newRefreshToken = generateRefreshToken(payload.sub, payload.email);

    // Store new refresh token with same family
    await refreshTokenRepository.create(
      newRefreshToken,
      payload.sub,
      storedToken.family_id,
      getRefreshTokenExpiry()
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      const storedToken = await refreshTokenRepository.findByToken(refreshToken);
      if (storedToken) {
        // Delete entire family
        await refreshTokenRepository.deleteByFamily(storedToken.family_id);
      }
    }
  }

  async changePassword(userId: number, input: ChangePasswordInput): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw ApiError.notFound('USER_NOT_FOUND', 'User not found');
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.password_hash);
    if (!isMatch) {
      throw ApiError.badRequest('INVALID_PASSWORD', 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);
    await userRepository.updatePassword(userId, passwordHash);

    // Invalidate all refresh tokens
    await refreshTokenRepository.deleteAllForUser(userId);

    // Audit log
    await auditLogRepository.create({
      user_id: userId,
      action: 'PASSWORD_CHANGED',
      entity_type: 'user',
      entity_id: userId,
    });

    logger.info(`Password changed for user ${userId}`);
  }

  async getMe(userId: number): Promise<{ id: number; email: string } | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return { id: user.id, email: user.email };
  }
}

export const authService = new AuthService();
