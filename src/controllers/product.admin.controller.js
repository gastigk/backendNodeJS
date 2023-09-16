import { ProductService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';

// defining functions
export async function findCartWithProduct(productId) {
  try {
    const carts = await CartService.getAll({});
    for (const cart of carts) {
      for (const item of cart.items) {
        if (item.producto.toString() === productId) {
          return cart;
        }
      }
    }
    return null;
  } catch (error) {
    loggers.error('Error when searching for the product in the carts');
    return [];
  }
}

export async function findCartsWithProduct(productId) {
  try {
    const carts = await CartService.getAll({});
    return carts.filter((cart) =>
      cart.items.some((item) => item.producto.toString() === productId)
    );
  } catch (error) {
    loggers.error('Error when searching for the product in the carts');
    return [];
  }
}

export async function removeProductFromCart(cart, productId) {
  try {
    const productIndex = cart.items.findIndex(
      (item) => item.producto.toString() === productId
    );

    if (productIndex !== -1) {
      cart.items.splice(productIndex, 1);
      await CartService.update(cart._id, cart);
    }
  } catch (error) {
    customError(error);
    loggers.error('Error removing product from cart');
  }
}

export async function removeProductFromCarts(carts, productId) {
  try {
    for (const cart of carts) {
      await removeProductFromCart(cart, productId);
    }
  } catch (error) {
    loggers.error('Error removing product from cart');
  }
}

// defining controllers
export const getTableProductsController = async (req, res) => {
  const user = getUserFromToken(req);
  const sortOption = req.query.sortOption;
  const sortQuery = {};

  if (sortOption === 'desc') {
    sortQuery.price = -1;
  } else if (sortOption === 'unorder') {
    sortQuery.price = null;
  } else {
    sortQuery.price = 1;
  }

  try {
    const products = await ProductService.getAllQuery(sortQuery);
    res.render('products-table', { products, user });
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const deleteProductController = async (req, res) => {
  const user = getUserFromToken(req);
  try {
    const productId = req.params.id;
    const product = await ProductService.delete(productId);

    const carts = await findCartsWithProduct(productId);

    if (carts && carts.length > 0) {
      await removeProductFromCarts(carts, productId);
    }

    if (product) {
      res.render('notifications/deleted-product', {
        product,
        user,
      });
    } else {
      res.status(404).render('error/error404', { user });
    }
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const editProductController = async (req, res) => {
  const user = getUserFromToken(req);
  try {
    const productId = req.params.pid;
    const producto = await ProductService.getById(productId);
    if (producto) {
      res.status(200).render('notifications/edited-product', {
        producto,
        user,
      });
    } else {
      res.status(404).render('error/error404', { user });
    }
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const editAndChargeProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, category, code, description, price, stock } = req.body;
    const updatedProduct = await ProductService.update(productId, {
      title: title,
      category: category,
      code: code,
      description: description,
      price: price,
      stock: stock,
      ...(req.file
        ? { thumbnail: `/assets/images/users/${req.file.filename}` }
        : {}),
    });

    res.redirect(`/notifications/edited-product/${productId}`);
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const adminPanelController = async (req, res) => {
  const user = getUserFromToken(req);
  try {
    if (user.role !== 'admin') {
      return res.status(403).render('error/error403');
    }
    const products = await ProductService.getAll();
    res.status(200).render('admin-panel', { products, user });
  } catch (error) {
    customError(error);
    loggers.error(`Error getting the requested data from the database`);
    res.status(500).render('error/error500', { user });
  }
};