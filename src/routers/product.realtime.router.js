import { Router } from 'express';

import isAdmin from '../middlewares/admin.middleware.js';
import configureMulter from '../helpers/multer.helper.js';
import {
  getProductsRTController,
  sendProductsRTController,
} from '../controllers/product.realtime.controller.js';

const router = Router();
const upload = await configureMulter();

router.get('/', isAdmin, getProductsRTController);
router.post('/', upload.single('thumbnail'), sendProductsRTController);

export default router;