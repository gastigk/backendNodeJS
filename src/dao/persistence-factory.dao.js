import config from '../config/config.js';

export let Product;
export let Cart;
export let User;

switch (config.app.persistence) {
  case 'MONGO':
    const { default: ProductMongoDAO } = await import(
      './mongo/product.mongo.dao.js'
    );
    Product = ProductMongoDAO;

    const { default: CartMongoDAO } = await import('./mongo/cart.mongo.dao.js');
    Cart = CartMongoDAO;

    const { default: UserMongoDAO } = await import('./mongo/user.mongo.dao.js');
    User = UserMongoDAO;
    break;

  case 'FILE':
    const { default: ProductFileDAO } = await import(
      './mongo/product.file.dao.js'
    );
    Product = ProductMongoDAO;

    // const { default: CartFileDAO } = await import('./mongo/cart.file.dao.js');
    // Cart = CartFileDAO;

    // const { default: UserFileDAO } = await import('./mongo/user.file.dao.js');
    // User = UserFileDAO;
    break;
  default:
    break;
}
