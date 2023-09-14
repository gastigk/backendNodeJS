import { Router } from 'express';

import {
  getResetPasswordController,
  setResetPasswordController,
} from '../controllers/reset-password.controller.js';

const router = Router();

router.get('/:token', getResetPasswordController);
router.post('/:token', setResetPasswordController);

export default router;