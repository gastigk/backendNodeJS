import mongoose from 'mongoose';
import shortid from 'shortid';

import Cart from '../models/cart.model.js';
import { ProductService, CartService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import config from '../config/config.js';
import loggers from '../config/logger.config.js';
import customError from '../services/error.log.js';

const cokieName = config.jwt.cookieName;
let user = null;
let userEmail = null;

// defining functions
export async function getOrCreateCart(userEmail = null) {
  if (userEmail) {
    const cart = await CartService.getOne({ 'user.email': userEmail });
    if (cart) {
      return cart;
    } else {
      const newCart = new Cart({
        user: { email: userEmail },
        items: [],
        purchase_datetime: new Date(),
        code: shortid.generate(),
      });
      return newCart.save();
    }
  } else {
    const cart = await CartService.getOne({ 'user.email': null }).exec();
    if (cart) {
      return cart;
    } else {
      const newCart = new Cart({
        items: [],
        purchase_datetime: new Date(),
        code: shortid.generate(),
      });
      return newCart.save();
    }
  }
}

// defining controllers
export const createCartController = async (req, res) => {
  user = getUserFromToken(req);
  try {
    const { sortOption } = req.query;
    const userToken = req.cookies[cokieName];

    if (userToken) {
      userEmail = user.email || user.user.email;
    } else {
      return res.redirect('/login', { style: 'login' });
    }

    let cart;
    if (userEmail) {
      cart = await getOrCreateCart(userEmail);
    } else {
      cart = await getOrCreateCart();
    }

    if (!cart || cart.items.length === 0 || (!userEmail && cart.user.email)) {
      return res.render('error/notCart', { user });
    }
    const cartId = cart._id.toString();

    let sortedItems = [...cart.items];

    if (sortOption === 'asc') {
      sortedItems.sort((a, b) => a.producto.price - b.producto.price);
    } else if (sortOption === 'desc') {
      sortedItems.sort((a, b) => b.producto.price - a.producto.price);
    }

    const totalPriceAggregate = await CartService.setCart([
      { $match: { _id: cart._id } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.producto',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$_id',
          totalPrice: {
            $sum: { $multiply: ['$product.price', '$items.cantidad'] },
          },
        },
      },
    ]);

    const totalPrice =
      totalPriceAggregate.length > 0 ? totalPriceAggregate[0].totalPrice : 0;

    res.render('carts', {
      style: 'carts',
      cart: { ...cart, items: sortedItems },
      totalPrice,
      cartId,
      user,
    });
  } catch (error) {
    customError(error);
    loggers.error('The cart was not found');
    res.status(500).render('error/notCart', { user });
  }
};

export const clearCartByid = async (req, res) => {
  const userToken = req.cookies[cokieName];

  if (userToken) {
    user = getUserFromToken(req);
    userEmail = user.email || user.user.email;
  }
  try {
    const cartId = req.params.cartId;
    const cart = await CartService.update(
      { _id: cartId, 'user.email': userEmail },
      { items: [] }
    );

    if (!cart) {
      return res.redirect('/');
    }

    cart.items = [];
    await cart.save();
    res.redirect('/');
  } catch (error) {
    customError(error);
    loggers.error('Error when emptying the cart');
    res.status(500).render('error/notCart', { user });
  }
};

export const deleteCartById = async (req, res) => {
  const userToken = req.cookies[cokieName];

  if (userToken) {
    user = getUserFromToken(req);
    userEmail = user.email || user.user.email;
  }

  try {
    const cartId = req.params.cartId;
    const result = await CartService.delete({
      _id: cartId,
      'user.email': userEmail,
    });

    if (result.deletedCount === 0) {
      return res.redirect('/');
    }

    res.redirect('/');
  } catch (error) {
    customError(error);
    loggers.error('Error deleting cart');
    res.status(500).render('error/notCart', { user });
  }
};

export const updateProductsToCartById = async (req, res) => {
  const userToken = req.cookies[cokieName];

  if (userToken) {
    user = getUserFromToken(req);
    userEmail = user.email || user.user.email;
  }

  try {
    const cartId = req.params.cartId;
    const itemId = req.params.itemId;
    const { cantidad } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.redirect('/');
    }

    const cart = await CartService.update(
      { _id: cartId, 'user.email': userEmail, 'items._id': itemId },
      { $set: { 'items.$.cantidad': cantidad } },
      { new: true }
    );

    if (!cart) {
      return res.redirect('/');
    }

    res.redirect('/carts');
  } catch (error) {
    customError(error);
    loggers.error('Error updating product quantity');
    res.status(500).render('error/notCart', { user });
  }
};

export const addProductToCartController = async (req, res) => {
  try {
    const userToken = req.cookies[cokieName];

    if (userToken) {
      user = getUserFromToken(req);
      userEmail = user.email || user.user.email;
    }
    const { cantidad } = req.body;
    const productId = req.params.pid;
    const producto = await ProductService.getOne({ _id: productId });

    if (!userEmail) {
      loggers.error('You are not logged in, please log in');
      return res.status(500).redirect('/login', { style: 'login' });
    }

    let cart = await getOrCreateCart(userEmail);

    cart.items.push({ producto: producto, cantidad: cantidad });
    cart.user.email = userEmail;
    cart.code = shortid.generate();
    cart.purchase_datetime = new Date();

    await cart.save();
    res.redirect('/');
  } catch (error) {
    customError(error);
    loggers.error('You are not logged in, please log in');
    res.status(500).redirect('/login', { style: 'login' });
  }
};

export const deleteCartByIdController = async (req, res) => {
  const user = getUserFromToken(req);
  const { cartId, itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cartId)) {
    return res.status(400).json({ error: 'invalid cart id' });
  }

  try {
    const cart = await CartService.getById(cartId);
    if (!cart) {
      return res.status(404).render('error/error404', { user });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.equals(itemId));
    if (itemIndex === -1) {
      return res
        .status(404)
        .render('error/notCartProducts', { cartId, itemId, user });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    return res.render('cartsDeleteById', {
      cartId,
      itemId,
      user,
      style: 'cartsDeleteById',
    });
  } catch (error) {
    customError(error);
    loggers.error('Error when removing a product from the cart');
    return res.status(500).render('error/notCart', { user });
  }
};
