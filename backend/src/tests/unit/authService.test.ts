import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/refreshTokenRepository');
jest.mock('../../repositories/auditLogRepository');
jest.mock('../../services/tokenService');

import { AuthService } from '../../services/authService';
import { userRepository } from '../../repositories/userRepository';
import { refreshTokenRepository } from '../../repositories/refreshTokenRepository';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password_hash: 'hashed' };

      (userRepository.findByEmail as any).mockResolvedValue(null);
      (userRepository.create as any).mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password@123',
      });

      expect(result).toEqual({ id: 1, email: 'test@example.com' });
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw if email already exists', async () => {
      (userRepository.findByEmail as any).mockResolvedValue({ id: 1 });

      await expect(
        authService.register({ email: 'test@example.com', password: 'Password@123' })
      ).rejects.toThrow('An account with this email already exists');
    });
  });

  describe('login', () => {
    it('should throw for non-existent user', async () => {
      (userRepository.findByEmail as any).mockResolvedValue(null);

      await expect(
        authService.login({ email: 'notfound@example.com', password: 'Password@123' })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('should delete refresh token family on logout', async () => {
      const mockToken = { family_id: 'family-123' };
      (refreshTokenRepository.findByToken as any).mockResolvedValue(mockToken);
      (refreshTokenRepository.deleteByFamily as any).mockResolvedValue(1);

      await authService.logout('some-refresh-token');

      expect(refreshTokenRepository.deleteByFamily).toHaveBeenCalledWith('family-123');
    });
  });
});
