import { ProductService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import loggers from '../config/logger.config.js';
import customError from '../services/error.log.js';

// defining functions
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
    loggers.error('Error al eliminar el producto del carrito');
  }
}

export async function findCartsWithProduct(productId) {
  try {
    const carts = await CartService.getAll({});
    return carts.filter((cart) =>
      cart.items.some((item) => item.producto.toString() === productId)
    );
  } catch (error) {
    loggers.error('Error al buscar el producto en los carritos');
    return [];
  }
}

export async function removeProductFromCarts(carts, productId) {
  try {
    for (const cart of carts) {
      await removeProductFromCart(cart, productId);
    }
  } catch (error) {
    loggers.error('Error al eliminar el producto del carrito');
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
    res.render('productstable', { style:'productstable', products, user });
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('error/notProduct', { user });
  }
};

export const deleteProductByIdController = async (req, res) => {
  const user = getUserFromToken(req);
  try {
    const productId = req.params.id;
    const product = await ProductService.delete(productId);

    const carts = await findCartsWithProduct(productId);

    if (carts && carts.length > 0) {
      const usermailarray = carts.map((cart) => cart.user.email);
      await removeProductFromCarts(carts, productId);
      usermailarray.forEach(async (usermail, cart) => {
        await sendDeleteProductsEmail(usermail, carts[cart]);
      });
    }

    if (product) {
      res.render('productsdeletebyid', { style:'productsdeletebyid', product, user });
    } else {
      res.status(404).render('error/error404', { user });
    }
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('error/notProduct', { user });
  }
};

export const editProductByIdController = async (req, res) => {
  const user = getUserFromToken(req);
  try {
    const productId = req.params.pid;
    const producto = await ProductService.getById(productId);
    if (producto) {
      res.status(200).render('productseditbyid', { style:'productseditbyid', producto, user });
    } else {
      res.status(404).render('error/error404', { user });
    }
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('error/notProduct', { user });
  }
};

export const editAndChargeProductByIdController = async (req, res) => {
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
      ...(req.file ? { thumbnail: `/img/${req.file.filename}` } : {}),
    });

    res.redirect(`/productseditbyid/${productId}`);
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('error/notProduct', { user });
  }
};

export const adminPanelController = async (req, res) => {
  const user = getUserFromToken(req);
  try {
    if (user.role !== 'admin') {
      return res.status(403).render('error/notAuthorized');
    }
    const products = await ProductService.getAll();
    res
      .status(200)
      .render('admin-panel', { products, user, style: 'admin-panel' });
  } catch (error) {
    customError(error);
    loggers.error(`Error getting the requested data from the database`);
    res.status(500).render('error/error500', { user });
  }
};
