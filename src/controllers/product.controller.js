import Product from '../models/product.model.js';
import { ProductService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import config from '../config/config.js';
import loggers from '../config/logger.config.js';
import Cart from '../models/cart.model.js';
import { errorMessagesProductosMocking } from '../services/error/info.error.js';
import CustomError from '../services/error/custom.error.js';
import EErrors from '../services/error/enums.error.js';
import { sendPurchaseConfirmationEmail } from '../helpers/nodemailer.helper.js';
import { sendSMS } from '../helpers/twilio.helper.js';

import { generateMockProducts } from '../services/mocking.service.js';
const cookieName = config.jwt.cookieName;

export const getIndexProductsController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const products = await ProductService.getAll();
    const userToken = req.cookies[cookieName];

    if (!userToken) {
      res.status(200).render('index', {
        products: products.slice(0, 4),
        productLength: products.length,
        user: null,
      });
      return;
    }
    const user = getUserFromToken(req);

    if (!user) {
      res.status(200).render('index', {
        products: products.slice(0, 4),
        productLength: products.length,
        user: null,
      });
      return;
    }

    if (isNaN(limit)) {
      res.status(200).render('index', {
        products: products.slice(0, 4),
        productLength: products.length,
        user,
      });
    } else {
      res.status(200).render('index', {
        products: products.slice(0, limit),
        productLength: products.length,
        user,
      });
    }
  } catch (err) {
    loggers.error(err);
    res.status(500).send({ message: 'Internal server error' });
  }
};

let user = null;

export const getAllProductsController = async (req, res, next) => {
  try {
    const userToken = req.cookies[cookieName];
    if (userToken) {
      user = getUserFromToken(req);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const category = req.query.category;
    const filter = category ? { category } : {};

    const result = await ProductService.setCategory([
      { $match: filter },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const productos = result;
    const prevLink = page > 1 ? `/products?page=${page - 1}` : '';
    const nextLink =
      productos.length === limit ? `/products?page=${page + 1}` : '';

    const allCategories = await ProductService.getByCategory('category');

    res.render('products', {
      productos,
      prevLink,
      nextLink,
      allCategories,
      user,
    });
  } catch (err) {
    loggers.error(err);
    next(err);
  }
};

export const createProductController = async (req, res) => {
  const { title, category, code, description, price, stock } = req.body;
  if (!title) {
    return res.status(400).send('El campo "title" es obligatorio');
  }

  const newProduct = new Product({
    title,
    category,
    status: true,
    code,
    description,
    price: parseInt(price),
    stock,
    thumbnail: `/img/${req.file.filename}`,
  });

  try {
    await newProduct.save();

    const page = 1;
    const limit = 16;

    const result = await ProductService.paginate(
      {},
      { page, limit, lean: true }
    );

    const productos = result.docs;
    const prevLink = result.hasPrevPage
      ? `/products?page=${result.prevPage}`
      : '';
    const nextLink = result.hasNextPage
      ? `/products?page=${result.nextPage}`
      : '';

    res.render('products', { productos, prevLink, nextLink });
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error al guardar el producto en la base de datos');
  }
};

export const getProductByCategoryController = async (req, res, next) => {
  try {
    const userToken = req.cookies[cookieName];
    if (userToken) {
      user = getUserFromToken(req);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const category = req.params.category;
    const filter = category ? { category } : {};

    const count = await ProductService.filter(filter);
    const totalPages = Math.ceil(count / limit);
    const currentPage = Math.min(page, totalPages);

    const result = await ProductService.setCategory([
      { $match: filter },
      { $skip: (currentPage - 1) * limit },
      { $limit: limit },
    ]);

    const productos = result;
    const prevLink = `/products/filter/${category}?page=${currentPage - 1}`;
    const nextLink = `/products/filter/${category}?page=${currentPage + 1}`;

    const allProducts = await ProductService.getByCategoryAll('category');
    res.render('products', {
      productos,
      prevLink,
      nextLink,
      allProducts,
      Page,
      totalPages,
      user,
    });
  } catch (err) {
    loggers.error(err);
    next(err);
  }
};

export const getProductByIdController = async (req, res) => {
  const productId = req.params.pid;
  const product = await ProductService.getById(productId);
  const user = getUserFromToken(req);
  const adminRole = user ? user.role === 'admin' : false;
  if (product) {
    res.render('productsid', { product, user, adminRole });
  } else {
    res.status(404).render('error/error404', { user });
  }
};

// no DAO applied
export const getPurchaseController = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const cart = await Cart.findOne({
      user: { email: user.email || user.user.email },
    }).populate('items.producto');

    if (!cart) {
      res.status(404).render('error/error404', { user });
      return;
    }

    const totalPrice = cart.items.reduce(
      (total, item) => total + item.producto.price * item.cantidad,
      0
    );

    res.render('checkout', {
      cart,
      code: cart.code,
      purchaseDatetime: cart.purchase_datetime,
      totalPrice,
      user,
    });
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error al procesar la compra');
  }
};

export const sendPurchaseController = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const cart = await Cart.findOne({
      user: { email: user.email || user.user.email },
    }).populate('items.producto');

    if (!cart) {
      res.status(404).render('error/error404', { user });
      return;
    }

    const productsWithSufficientStock = []; // create a new array with the products that have enough stock

    // check the stock of each product in the cart
    for (const item of cart.items) {
      try {
        const product = await Product.findById(item.producto._id);
        if (!product) {
          loggers.warning(
            `Producto no encontrado con el id: ${item.producto._id}`
          );
          continue;
        }

        const newStock = product.stock - item.cantidad;
        if (newStock >= 0) {
          // if there is enough stock, add the product to the new array and update the stock
          productsWithSufficientStock.push(item);
          product.stock = newStock;
          await product.save();
        } else {
          // if there is not enough stock, show an error message and update the stock
          loggers.warn(
            `El producto: ${item.producto.title} esta fuera de stock.!`
          );
          product.stock += item.cantidad - product.stock;
          await product.save();
        }
      } catch (err) {
        loggers.error('Error al actualizar el stock', err);
      }
    }

    cart.items = productsWithSufficientStock; // update the cart with the products that have enough stock

    // check if there are any products left in the cart
    if (cart.items.length === 0) {
      res.render('error/notStock', {
        // Error: there is not enough stock for any of the products in the cart
        user,
        products: cart.items.map((item) => item.producto),
      });
      return;
    }

    // send purchase confirmation email
    await sendPurchaseConfirmationEmail(
      user.email || user.user.email,
      cart,
      user
    );
    //await sendSMS(user.phone); // uncomment to send an SMS

    const totalPrice = cart.items.reduce(
      (total, item) => total + item.producto.price * item.cantidad,
      0
    );
    res.render('checkout', {
      cart,
      code: cart.code,
      purchaseDatetime: cart.purchase_datetime,
      totalPrice,
      user,
    });
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error processing the purchase');
  }
};

export const getMockingProductsController = async (req, res, next) => {
  try {
    await generateMockProducts();

    const products = await ProductService.getAllLimit(100);

    res.json({ products });
  } catch (err) {
    loggers.error('Error generating mocking products:', err);

    const customError = new CustomError(
      errorMessagesProductosMocking.internalServerError,
      EErrors.InternalServerError
    );

    next(customError);
  }
};

export const getProductForEditByIdController = async (req, res) => {
  const productId = req.params.pid;
  const user = getUserFromToken(req);
  try {
    const producto = await ProductService.getById(productId);
    if (producto) {
      res.render('productsedit', { producto, user });
    } else {
      res.status(404).render('error/error404', { user });
    }
  } catch (error) {
    loggers.error(error);
    res.status(500).render('error/notProduct', { user });
  }
};
