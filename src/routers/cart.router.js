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
router.post('/:pid', addProductToCartController);
router.post('/:cid/clear', clearCartController);
router.post('/:cid/delete', deleteCartController);
router.put('/:cid/:itemId', updateCartProductsController);
router.get('/:cid/:itemId', removeProductFromCartController);

export default router;