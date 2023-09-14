import { Router } from 'express';

import { getLogoutController } from '../controllers/session.controller.js';

const router = Router();

router.get('/', getLogoutController);

export default router;