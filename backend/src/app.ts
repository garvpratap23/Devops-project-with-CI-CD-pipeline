import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/environment';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeMiddleware } from './middleware/sanitize';
import { requestIdMiddleware } from './middleware/requestId';
import { logger } from './utils/logger';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import metricsRoutes from './routes/metricsRoutes';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", env.CORS_ORIGIN],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

// Request processing
app.use(requestIdMiddleware);
app.use(rateLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(sanitizeMiddleware);

// HTTP logging
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};

app.use(morgan('combined', {
  stream: morganStream,
  skip: (_req, res) => env.NODE_ENV === 'test' || res.statusCode < 400,
}));

// Prometheus metrics
app.use(metricsMiddleware);
app.use('/metrics', metricsRoutes);

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
