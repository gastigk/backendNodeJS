import { Router } from 'express';
import {
  getSignupAdminController,
  setSignupAdminController,
} from '../controllers/session.controller.js';

const router = Router();

router.get('/', getSignupAdminController);

router.post('/', setSignupAdminController);

export default router;
