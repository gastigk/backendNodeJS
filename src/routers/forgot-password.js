import { Router } from 'express';

import {
  sendForgotPassword,
  getForgotPassword,
} from '../controllers/session.resetpass.controller.js';

const router = Router();

router.get('/', getForgotPassword);
router.post('/', sendForgotPassword);

export default router;
