import { Router } from 'express'
import { 
    createCartController, 
    getProductsFromCartController, 
    addProductToCartController, 
    deleteProductFromCartController, 
    updateCartController,
    updateProductQtyFromCartController,
    clearCartController,
    purchaseController
} from '../controllers/cart.controller.js'

const router = Router()

router.post('/', createCartController)
router.get('/:cid', getProductsFromCartController)
router.post('/:cid/product/:pid', addProductToCartController)
router.delete('/:cid/product/:pid', deleteProductFromCartController)
router.put('/:cid', updateCartController)
router.put('/:cid/product/:pid', updateProductQtyFromCartController)
router.delete('/:cid', clearCartController)
router.get('/:cid/purchase', purchaseController)

export default router