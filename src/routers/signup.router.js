import { Router } from 'express';

import {
  getSignupController,
  setSignupController,
} from '../controllers/session.controller.js';

const router = Router();

router.get('/', getSignupController);
router.post('/', setSignupController);

export default router;