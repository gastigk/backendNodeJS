import { Router } from 'express';
import { getMockingProductsController } from '../controllers/product.controller.js';
const router = Router();

router.get('/', getMockingProductsController);

export default router;
