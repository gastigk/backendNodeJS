import { Router } from 'express';

import {
  getPurchaseController,
  sendPurchaseController,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getPurchaseController);
router.post('/', sendPurchaseController);

export default router;
