import { Router } from 'express';
import {
  createCartController,
  addProductToCartController,
  clearCartByid,
  deleteCartById,
  updateProductsToCartById,
  deleteCartByIdController,
} from '../controllers/cart.controller.js';

const router = Router();

router.get('/', createCartController);
router.post('/:pid', addProductToCartController);
router.post('/:cartId/clear', clearCartByid);
router.post('/:cartId/delete', deleteCartById);
router.put('/:cartId/:itemId', updateProductsToCartById);
router.get('/:cartId/:itemId', deleteCartByIdController);

export default router;
