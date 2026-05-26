import { Router } from 'express';
import { metricsEndpoint } from '../middleware/metricsMiddleware';

const router = Router();

router.get('/', metricsEndpoint);

export default router;
