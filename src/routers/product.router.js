import { Router } from 'express';

import {
  getAllProductsController,
  getProductByCategoryController,
  createProductController,
  getProductByIdController,
} from '../controllers/product.controller.js';
import configurationMulter from '../helpers/multer.helper.js';

const router = Router();
const upload = configurationMulter('images/products');

router.get('/', getAllProductsController);
router.post('/', upload.single('thumbnail'), createProductController);
router.get('/filter/:category', getProductByCategoryController);
router.get('/:pid', getProductByIdController);

export default router;