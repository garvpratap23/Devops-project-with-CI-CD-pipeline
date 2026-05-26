import http from 'http';
import app from './app';
import { env } from './config/environment';
import { testConnection } from './config/database';
import { migrator } from './config/migrator';
import { initializeSocket, emitTaskEvent } from './sockets/socketHandler';
import { setTaskEventEmitter } from './services/taskService';
import { initModels } from './models';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await testConnection();

    // Initialize models and associations
    initModels();

    // Run migrations
    logger.info('Running database migrations...');
    await migrator.up();
    logger.info('✅ Migrations completed');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket
    initializeSocket(server);

    // Connect task service to socket emitter
    setTaskEventEmitter(emitTaskEvent);

    // Start listening
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📡 WebSocket server ready`);
      logger.info(`🔗 API: http://localhost:${env.PORT}/api`);
      logger.info(`❤️  Health: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled errors
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
