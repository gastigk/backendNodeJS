import { Router } from 'express';

import isAdmin from '../middlewares/admin.middleware.js';
import configurationMulter from '../helpers/multer.helper.js';
import {
  getProductsRTController,
  sendProductsRTController,
} from '../controllers/product.realtime.controller.js';

const router = Router();
const upload = await configurationMulter ();

router.get('/', isAdmin, getProductsRTController);
router.post('/', upload.single('thumbnail'), sendProductsRTController);

export default router;