import { PORT } from '../app.js'
import { ProductService } from '../repositories/index.js'
// import { getProducts } from "./product.controller.js"
import { getProductsFromCart } from "./cart.controller.js"

export const viewProductsController = async (req, res) => {
    // const result = await getProducts(req, res)
    const result = await ProductService.getAllPaginate(req, PORT)
    if (result.statusCode === 200) {
        const totalPages = []
        let link
        for (let index = 1; index <= result.response.totalPages; index++) {
            if (!req.query.page) {
                link = `http://${req.hostname}:${PORT}${req.originalUrl}&page=${index}`
            } else {
                const modifiedUrl = req.originalUrl.replace(`page=${req.query.page}`, `page=${index}`)
                link = `http://${req.hostname}:${PORT}${modifiedUrl}`
            }
            totalPages.push({ page: index, link })
        }
        const user = req.session.user
        res.render('home', { user, products: result.response.payload, paginateInfo: {
                hasPrevPage: result.response.hasPrevPage,
                hasNextPage: result.response.hasNextPage,
                prevLink: result.response.prevLink,
                nextLink: result.response.nextLink,
                totalPages
            }
        })
    } else {
        res.status(result.statusCode).json({ status: 'error', error: result.response.error })
    }
}

export const viewRealTimeProductsController = async (req, res) => {
    // const result = await getProducts(req, res)
    const result = await ProductService.getAllPaginate(req, PORT)
    if (result.statusCode === 200) {
        res.render('realTimeProducts', { products: result.response.payload })
    } else {
        res.status(result.statusCode).json({ status: 'error', error: result.response.error })
    }
}

export const viewProductsFromCartController = async(req, res) => {
    const result = await getProductsFromCart(req, res)
    if (result.statusCode === 200) {
        res.render('productsFromCart', { cart: result.response.payload })
    } else {
        res.status(result.statusCode).json({ status: 'error', error: result.response.error })
    }
}