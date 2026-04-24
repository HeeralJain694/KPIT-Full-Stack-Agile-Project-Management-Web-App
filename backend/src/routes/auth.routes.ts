import { Router } from 'express';
import { register, login, getMe, getUsers } from '../controllers/auth.controller';

import { authenticate } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/zodSchemas';
import { validateRequest } from "../middleware/validate";
const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, getUsers);
router.post('/register', validateRequest(registerSchema), register);
export default router;
