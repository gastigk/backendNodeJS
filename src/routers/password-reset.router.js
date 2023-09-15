import { Router } from 'express';
const router = Router();

import {
        getResetPasswordController,
        setResetPasswordController,
} from '../controllers/password-reset.controller.js';


router.get('/:token', getResetPasswordController);
router.post('/:token', setResetPasswordController);

export default router;

