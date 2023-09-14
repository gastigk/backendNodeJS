import { Router } from 'express';

import {
  sendForgotPasswordController,
  getForgotPasswordController,
} from '../controllers/reset-password.controller.js';

const router = Router();

router.get('/', getForgotPasswordController);
router.post('/', sendForgotPasswordController);

export default router;