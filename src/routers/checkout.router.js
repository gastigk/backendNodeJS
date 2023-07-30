import { Router } from 'express';
import {
  getPurchaseController,
  sendPurchaseController,
} from '../controllers/product.controller.js';

const router = Router();

// Endpoint para mostrar el carrito de compras
router.get('/', getPurchaseController);

router.post('/', sendPurchaseController);

export default router;
