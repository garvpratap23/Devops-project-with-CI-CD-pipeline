import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../services/tokenService';
import { logger } from '../utils/logger';
import { env } from '../config/environment';
import cookie from 'cookie';

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware for socket connections
  io.use((socket: Socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error('Authentication required'));
      }

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.accessToken;

      if (!token) {
        return next(new Error('No access token'));
      }

      const payload = verifyToken(token);
      if (payload.type !== 'access') {
        return next(new Error('Invalid token type'));
      }

      // Attach user info to socket
      (socket as Socket & { userId?: number; userEmail?: string }).userId = payload.sub;
      (socket as Socket & { userId?: number; userEmail?: string }).userEmail = payload.email;

      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as Socket & { userId?: number }).userId;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Join user-specific room
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  logger.info('✅ WebSocket server initialized');
  return io;
};

export const emitToUser = (userId: number, event: string, payload: Record<string, unknown>): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, {
      event,
      payload,
      timestamp: new Date().toISOString(),
    });
  }
};

export const emitTaskEvent = (event: string, userId: number, payload: Record<string, unknown>): void => {
  emitToUser(userId, event, payload);
};

export const getIO = (): Server => io;
