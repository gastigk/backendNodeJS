import { Router } from 'express';

import {
  getPurchaseController,
  sendPurchaseController,
} from '../controllers/product.controller.js';
import { checkPremiumUser } from '../middlewares/premium-user.middleware.js';

const router = Router();

router.get('/', checkPremiumUser, getPurchaseController);
router.post('/', checkPremiumUser, sendPurchaseController);

export default router;