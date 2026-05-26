import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', (req, res, next) => taskController.getTasks(req, res, next));
router.get('/stats', (req, res, next) => taskController.getStats(req, res, next));
router.post('/', (req, res, next) => taskController.createTask(req, res, next));
router.put('/:id', (req, res, next) => taskController.updateTask(req, res, next));
router.delete('/:id', (req, res, next) => taskController.deleteTask(req, res, next));

export default router;
