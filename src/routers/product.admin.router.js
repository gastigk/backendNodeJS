import { Router } from 'express';

import {
  deleteProductByIdController,
  editProductByIdController,
  editAndChargeProductByIdController,
  adminPanelController,
} from '../controllers/product.admin.controller.js';
import isAdmin from '../middlewares/admin.middleware.js';
import configureMulter from '../helpers/multer.helper.js';

const router = Router();
const upload = await configureMulter();

router.get('/', isAdmin, adminPanelController);
router.get('/delete/:id', isAdmin, deleteProductByIdController);
router.get('/:pid', isAdmin, editProductByIdController);
router.post(
  '/:id',
  isAdmin,
  upload.single('thumbnail'),
  editAndChargeProductByIdController
);

export default router;
