import { Router } from 'express';

import {
  getUserFromCookiesController,
  getLogginController,
  sendLogginController,
} from '../controllers/session.controller.js';

const router = Router();

router.get('/', getLogginController);
router.get('/user', getUserFromCookiesController);
router.post('/', sendLogginController);

export default router;