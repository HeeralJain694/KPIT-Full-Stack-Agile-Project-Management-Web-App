import { Router } from 'express';
import { createTask, updateTaskStatus } from '../controllers/task.controller';
import { validateRequest } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { taskSchema, updateTaskStatusSchema } from '../utils/zodSchemas';

const router = Router();

router.post('/stories/:storyId/tasks', authenticate, validateRequest(taskSchema), createTask);
router.put('/tasks/:id/status', authenticate, validateRequest(updateTaskStatusSchema), updateTaskStatus);

export default router;
