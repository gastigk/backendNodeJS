import { Router } from "express"
import { publicRoutes } from '../middlewares/auth.middleware.js'
import { 
    viewProductsController,
    viewRealTimeProductsController,
    viewProductsFromCartController
} from '../controllers/view.controller.js'
import { handlePolicies } from "../middlewares/auth.middleware.js"

const router = Router()

router.get('/', publicRoutes, handlePolicies(['USER', 'ADMIN']), viewProductsController)
router.get('/realTimeProducts', handlePolicies(['USER', 'ADMIN']), viewRealTimeProductsController)
router.get('/:cid', handlePolicies(['USER', 'ADMIN']), viewProductsFromCartController)

export default router