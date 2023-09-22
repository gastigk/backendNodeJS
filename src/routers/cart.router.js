import { Router } from 'express';

import {
  createCartController,
  addProductToCartController,
  clearCartController,
  deleteCartController,
  updateCartProductsController,
  removeProductFromCartController,
} from '../controllers/cart.controller.js';
import { checkPremiumUser } from '../middlewares/premium-user.middleware.js';

const router = Router();

router.get('/', checkPremiumUser, createCartController);
router.get('/:cid/:itemId', removeProductFromCartController);
router.post('/:pid', addProductToCartController);
router.post('/:cid/clear', clearCartController);
router.post('/:cid/delete', deleteCartController);
router.put('/:cid/:itemId', updateCartProductsController);

export default router;