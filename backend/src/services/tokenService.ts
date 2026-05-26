import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

let privateKey: Secret;
let publicKey: string | Buffer;

const loadKeys = (): void => {
  try {
    // First try env vars (production), then files (development)
    if (env.JWT_PRIVATE_KEY) {
      privateKey = env.JWT_PRIVATE_KEY;
      publicKey = env.JWT_PUBLIC_KEY || '';
      logger.info('JWT keys loaded from environment variables');
    } else {
      const privatePath = path.resolve(env.JWT_PRIVATE_KEY_PATH);
      const publicPath = path.resolve(env.JWT_PUBLIC_KEY_PATH);
      privateKey = fs.readFileSync(privatePath, 'utf8');
      publicKey = fs.readFileSync(publicPath, 'utf8');
      logger.info('JWT keys loaded from files');
    }
  } catch (error) {
    logger.error('Failed to load JWT keys. Run "npm run generate-keys" first.', error);
    throw new Error('JWT keys not found. Run "npm run generate-keys" to generate them.');
  }
};

// Initialize keys on module load
loadKeys();

export interface TokenPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
}

export const generateAccessToken = (userId: number, email: string): string => {
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: env.JWT_EXPIRY as unknown as number,
    issuer: 'task-manager-api',
  };

  return jwt.sign(
    { sub: userId, email, type: 'access' },
    privateKey,
    options
  );
};

export const generateRefreshToken = (userId: number, email: string): string => {
  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: env.REFRESH_TOKEN_TTL as unknown as number,
    issuer: 'task-manager-api',
  };

  return jwt.sign(
    { sub: userId, email, type: 'refresh' },
    privateKey,
    options
  );
};

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: 'task-manager-api',
  });

  return decoded as unknown as TokenPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const ttl = env.REFRESH_TOKEN_TTL;
  const match = ttl.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7d
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  const ms: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };

  return new Date(Date.now() + value * (ms[unit] || ms.d));
};
