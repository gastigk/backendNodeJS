import config from '../config/config.js'

export let Product
export let Cart

switch (config.persistence) {
    case 'MONGO':
        const { default: ProductMongoDAO } = await import('./product.mongo.dao.js')
        Product = ProductMongoDAO
        const { default: CartMongoDAO } = await import('./cart.mongo.dao.js')
        Cart = CartMongoDAO
        break;
    case 'FILE':
        const { default: ProductFileDAO } = await import('./product.file.dao.js')
        Product = ProductFileDAO
        break;

    default:
        break;
}