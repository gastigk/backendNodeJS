import { Router } from 'express';

import isAdmin from '../middlewares/admin.middleware.js';
import { getTableProductsController } from '../controllers/product.admin.controller.js';

const router = Router();

router.get('/', isAdmin, getTableProductsController);

export default router;