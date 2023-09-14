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
router.post('/:cartId/clear', clearCartController);
router.post('/:cartId/delete', deleteCartController);
router.put('/:cartId/:itemId', updateCartProductsController);
router.get('/:cartId/:itemId', removeProductFromCartController);

export default router;