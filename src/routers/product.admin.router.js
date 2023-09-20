import { Router } from 'express';

import {
  deleteProductController,
  editProductController,
  editAndChargeProductController,
  adminPanelController,
} from '../controllers/product.admin.controller.js';
import isAdmin from '../middlewares/admin.middleware.js';
import configurationMulter from '../helpers/multer.helper.js';

const router = Router();

const uploadProductThumbnail = configurationMulter('images/products');

router.get('/', isAdmin, adminPanelController);
router.get('/:id', isAdmin, deleteProductController);
router.get('/:pid', isAdmin, editProductController);
router.post(
  '/:id',
  isAdmin,
  uploadProductThumbnail.single('thumbnail'),
  editAndChargeProductController
);

export default router;