import { Router } from 'express';
import { createStory, updateStory } from '../controllers/story.controller';
import { validateRequest } from '../middleware/validate';
import { authenticate, requireProjectMember } from '../middleware/auth';
import { storySchema } from '../utils/zodSchemas';

const router = Router();

router.post('/:projectId/stories', authenticate, requireProjectMember, validateRequest(storySchema), createStory);
router.put('/stories/:id', authenticate, updateStory);

export default router;
