import { Router } from 'express';
const router = Router();

import {
        sendForgotPasswordController,
        getForgotPasswordController,
} from '../controllers/password-reset.controller.js';

router.get('/', getForgotPasswordController);
router.post('/', sendForgotPasswordController);

export default router;

