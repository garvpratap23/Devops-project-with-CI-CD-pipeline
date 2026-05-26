import { describe, it, expect } from '@jest/globals';
import { registerSchema, loginSchema } from '../../validators/authValidator';
import { createTaskSchema, updateTaskSchema } from '../../validators/taskValidator';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Password@123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'Password@123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without special char', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('Task Validators', () => {
  describe('createTaskSchema', () => {
    it('should accept valid task', () => {
      const result = createTaskSchema.safeParse({ title: 'My Task' });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = createTaskSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should accept partial updates', () => {
      const result = updateTaskSchema.safeParse({ completed: true });
      expect(result.success).toBe(true);
    });
  });
});
