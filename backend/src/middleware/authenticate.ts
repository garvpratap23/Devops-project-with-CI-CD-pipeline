import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/tokenService';
import { ApiError } from '../utils/ApiError';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userEmail?: string;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Get token from cookie first, then Authorization header as fallback
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    const payload = verifyToken(token);

    if (payload.type !== 'access') {
      throw ApiError.unauthorized('Invalid token type');
    }

    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired token'));
    }
  }
};
