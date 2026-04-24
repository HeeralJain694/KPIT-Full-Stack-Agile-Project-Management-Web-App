import { Router } from 'express';
import { createProject, getProjects, getProject } from '../controllers/project.controller';
import { validateRequest } from '../middleware/validate';
import { authenticate, requireAdmin, requireProjectMember } from '../middleware/auth';
import { projectSchema } from '../utils/zodSchemas';

const router = Router();

router.post('/', authenticate, requireAdmin, validateRequest(projectSchema), createProject);
router.get('/', authenticate, getProjects);
router.get('/:id', authenticate, requireProjectMember, getProject);

export default router;
