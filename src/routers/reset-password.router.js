import { Router } from 'express';

import {
  getResetPassword,
  setResetPassword,
} from '../controllers/session.resetpass.controller.js';

const router = Router();

router.get('/:token', getResetPassword);
router.post('/:token', setResetPassword);

export default router;
