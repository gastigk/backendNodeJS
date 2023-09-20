import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import productModel from '../models/product.model.js';
import customError from '../services/errors/custom.error.js';
import { ProductService, CartService } from '../repositories/index.js';
import { generateMockProducts } from '../services/mocking.service.js';
import { sendPurchaseConfirmationEmail } from '../helpers/nodemailer.helper.js';
import { sendSMS } from '../helpers/twilio.helper.js';

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

// defining controllers
export const getProductsController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const products = await ProductService.getAll();
    const userToken = req.cookies[config.jwt.cookieName];
    const user = getUserFromToken(req);
    if (!userToken || !user) {
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
  } catch (error) {
    customError(error);
    loggers.error('Products not found');
    res.status(500).render('notifications/not-product', { user });
  }
};

let user = null;

export const getAllProductsController = async (req, res, next) => {
  try {
    user = getUserFromToken(req);
    const userToken = req.cookies[config.jwt.cookieName];
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
    if (!userToken || !user) {
      res.render('products', {
        productos,
        prevLink,
        nextLink,
        allCategories,
        user: null,
      });
    } else {
      res.render('products', {
        productos,
        prevLink,
        nextLink,
        allCategories,
        user,
      });
    }
  } catch (error) {
    customError(error);
    loggers.error('Products not found');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const createProductController = async (req, res) => {
  const { title, category, code, description, price, stock } = req.body;
  user = getUserFromToken(req);
  if (!title) {
    return res.status(400).send('The "title" field is require');
  }
  const newProduct = new productModel({
    title,
    category,
    status: true,
    code,
    description,
    price: parseInt(price),
    stock,
    thumbnail: `/images/products/${req.file.filename}`, // commented to pass the test
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

    res.render('products', { productos, prevLink, nextLink, user });
  } catch (error) {
    customError(error);
    loggers.error('Error saving the product in the database');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const getProductByCategoryController = async (req, res, next) => {
  try {
    const userToken = req.cookies[config.jwt.cookieName];
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
      currentPage,
      totalPages,
      user,
    });
  } catch (error) {
    customError(error);
    loggers.error('Products not found');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const getProductByIdController = async (req, res) => {
  const productId = req.params.pid;
  const user = getUserFromToken(req);
  const adminRole = user ? user.role === 'admin' : false;

  try {
    const product = await ProductService.getById(productId);

    if (!product) {
      res.status(404).render('error/error404', { user });
      return;
    }
    res.render('product', { product, user, adminRole });
  } catch (error) {
    customError(error);
    loggers.error('Error getting product by ID');
    res.status(500).render('notifications/not-product', { user });
  }
};

export const getPurchaseController = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const isPremium = user.premium || user.user.premium || false;
    const discountMultiplier = isPremium ? 0.8 : 1;
    const cart = await CartService.getOnePopulate({
      user: { email: user.email || user.user.email },
    });

    if (!cart) {
      res.status(404).render('error/error404', { user });
      return;
    }

    const productsOutOfStock = cart.items.filter(
      (item) => item.producto.stock <= 0
    );

    if (productsOutOfStock.length > 0) {
      for (const item of productsOutOfStock) {
        await removeProductFromCart(cart, item.producto._id);
      }
      const updatedCart = await CartService.getOnePopulate({ _id: cart._id });
      const subTotal = updatedCart.items.reduce(
        (total, item) => total + item.producto.price * item.cantidad,
        0
      );
      const totalPrice = (subTotal * discountMultiplier).toFixed(2);

      res.render('checkout', {
        cart: updatedCart,
        code: updatedCart.code,
        purchaseDatetime: updatedCart.purchase_datetime,
        totalPrice,
        user,
      });
    } else {
      const subTotal = cart.items.reduce(
        (total, item) => total + item.producto.price * item.cantidad,
        0
      );
      const totalPrice = (subTotal * discountMultiplier).toFixed(2);

      res.render('checkout', {
        cart,
        code: cart.code,
        purchaseDatetime: cart.purchase_datetime,
        totalPrice,
        user,
      });
    }
  } catch (error) {
    customError(error);
    loggers.error('Error processing the purchase');
    res.status(500).render('error/error500', { user });
  }
};

export const sendPurchaseController = async (req, res) => {
  const user = getUserFromToken(req);
  //const { cardNumber, cardName, cardExpiration, cardCvv } = req.body;

  // Aca deberia verificar los datos de la tarjeta de credito
  try {
    const isPremium = user.premium || (user.user && user.user.premium) || false;
    const discountMultiplier = isPremium ? 0.8 : 1;
    const cart = await CartService.getOne({
      user: { email: user.email || user.user.email },
    });

    if (!cart) {
      res.status(404).render('error/error404', { user });
      return;
    }
    const productsWithSufficientStock = [];

    for (const item of cart.items) {
      try {
        const product = await ProductService.getById(item.producto._id);
        if (!product) {
          loggers.warning(`Product not found with id: ${item.producto._id}`);
          continue;
        }

        const newStock = product.stock - item.cantidad;
        if (newStock >= 0) {
          productsWithSufficientStock.push(item);
          product.stock = newStock;
          await product.save();
        } else {
          loggers.warn(`Product: ${item.producto.title} it is out of stock`);
          product.stock += item.cantidad - product.stock;
          await product.save();
        }
      } catch (error) {
        customError(error);
        loggers.error('Error when checking the products in the cart');
        res.status(500).render('error/error500', { user });
      }
    }

    cart.items = productsWithSufficientStock;

    if (cart.items.length === 0) {
      res.render('notifications/not-stock', {
        user,
        products: cart.items.map((item) => item.producto),
      });
      return;
    }
    const subTotal = cart.items.reduce(
      (total, item) => total + item.producto.price * item.cantidad,
      0
    );
    const totalPrice = (subTotal * discountMultiplier).toFixed(2);
    const useremail = user.email || user.user.email || false;
    await sendPurchaseConfirmationEmail(useremail, cart, user);
    // await sendSMS(user.phone); // Descomentar para enviar un SMS

    res.render('checkout', {
      cart,
      code: cart.code,
      purchaseDatetime: cart.purchase_datetime,
      totalPrice,
      user,
    });
  } catch (error) {
    customError(error);
    loggers.error('Error processing the purchase');
    res.status(500).render('error/error500', { user });
  }
};

export const getMockingProductsController = async (req, res, next) => {
  let user = getUserFromToken(req);
  try {
    await generateMockProducts();
    const limit = 10;
    const products = await ProductService.getAllLimit(limit);

    res.status(200).render('index', { products, user });
  } catch (error) {
    customError(error);
    loggers.error('Error generating mocking products');
    res.status(500).render('error/error500', { user });
  }
};

export const getProductForEditByIdController = async (req, res) => {
  const productId = req.params.pid;
  const user = getUserFromToken(req);
  try {
    const producto = await ProductService.getById(productId);
    if (producto) {
      res.render('product-edit', { producto, user });
    } else {
      res.status(404).render('error/error404', { user });
    }
  } catch (error) {
    customError(error);
    loggers.error('Product not found');
    res.status(500).render('notifications/not-product', { user });
  }
};