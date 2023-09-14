import { Router } from 'express';

import isLoggedIn from '../middlewares/login.middleware.js';

const router = Router();

import { getUsersPremiumController } from '../controllers/user.controller.js';

router.get('/', isLoggedIn, getUsersPremiumController);

export default router;