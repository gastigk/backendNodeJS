import { Router } from 'express';
import isAdmin from '../middlewares/admin.middleware.js';
import { getProductForEditByIdController } from '../controllers/product.controller.js';
const router = Router();

router.get('/:pid', isAdmin, getProductForEditByIdController);

export default router;
