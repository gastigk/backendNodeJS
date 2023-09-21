import mongoose from 'mongoose';
import shortid from 'shortid';

import cartModel from '../models/cart.model.js';
import { ProductService, CartService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';

let user = null;
let userEmail = null;

// defining function
export async function getOrCreateCart(userEmail = null) {
  if (userEmail) {
    const cart = await CartService.getOne({ 'user.email': userEmail });
    if (cart) {
      return cart;
    } else {
      const newCart = new cartModel({
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
      const newCart = new cartModel({
        items: [],
        purchase_datetime: new Date(),
        code: shortid.generate(),
      });
      return newCart.save();
    }
  }
}

// defining controllers
export const addProductToCartController = async (req, res) => {
  try {
    const userToken = req.cookies[config.jwt.cookieName];

    if (userToken) {
      user = getUserFromToken(req);
      userEmail = user.email || user.user.email;
    }
    const { cantidad } = req.body;
    const productId = req.params.pid;
    const producto = await ProductService.getOne({ _id: productId });

    if (!userEmail) {
      loggers.error('You are not logged in, please log in');
      return res.status(500).redirect('/auth/login');
    }

    let cart = await getOrCreateCart(userEmail);

    const existingCartItem = cart.items.find(
      (item) => item.producto._id.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.cantidad += parseInt(cantidad);
    } else {
      cart.items.push({ producto: producto, cantidad: parseInt(cantidad) });
    }

    cart.user.email = userEmail;
    cart.code = shortid.generate();
    cart.purchase_datetime = new Date();
    await cart.save();
    res.redirect('/cart');
  } catch (error) {
    customError(error);
    loggers.error('You are not logged in, please log in');
    res.status(500).redirect('/auth/login');
  }
};

export const clearCartController = async (req, res) => {
  // clear cart by ID
  const userToken = req.cookies[config.jwt.cookieName];

  if (userToken) {
    user = getUserFromToken(req);
    userEmail = user.email || user.user.email;
  }
  try {
    const cid = req.params.cid;
    const cart = await CartService.update(
      { _id: cid, 'user.email': userEmail },
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
    res.status(500).render('notifications/not-cart', { user });
  }
};

export const createCartController = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.redirect('/auth/login');
    }

    const { sortOption } = req.query;
    const userToken = req.cookies[config.jwt.cookieName];

    // if user is premium
    const isPremium = user.premium || (user.user && user.user.premium) || false;
    const discountMultiplier = isPremium ? 0.8 : 1;

    let userEmail = user.email || (user.user && user.user.email) || '';
    if (!userToken) {
      return res.redirect('/auth/login');
    }

    let cart;
    if (userEmail) {
      cart = await getOrCreateCart(userEmail);
    } else {
      cart = await getOrCreateCart();
    }
    if (!cart || cart.items.length === 0 || (!userEmail && cart.user.email)) {
      return res.render('notifications/not-cart', { user });
    }
    const cid = cart._id.toString();

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

    const subTotal =
      totalPriceAggregate.length > 0 ? totalPriceAggregate[0].totalPrice : 0;
    const totalPrice = (subTotal * discountMultiplier).toFixed(2);

    res.render('cart', {
      cart: { ...cart, items: sortedItems },
      totalPrice,
      cid,
      user,
    });
  } catch (error) {
    customError(error);
    loggers.error('Cart not found');
    res.status(500).render('notifications/not-cart', { user });
  }
};

export const deleteCartController = async (req, res) => {
  // eliminate cart by ID
  const userToken = req.cookies[config.jwt.cookieName];

  if (userToken) {
    user = getUserFromToken(req);
    userEmail = user.email || user.user.email;
  }

  try {
    const cid = req.params.cid;
    const result = await CartService.delete({
      _id: cid,
      'user.email': userEmail,
    });

    if (result.deletedCount === 0) {
      return res.redirect('/');
    }

    res.redirect('/');
  } catch (error) {
    customError(error);
    loggers.error('Error deleting cart');
    res.status(500).render('notifications/not-cart', { user });
  }
};

export const removeProductFromCartController = async (req, res) => {
  const user = getUserFromToken(req);
  const { cid, itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cid)) {
    return res.status(400).json({ error: 'invalid cart id' });
  }

  try {
    const cart = await CartService.getById(cid);
    if (!cart) {
      return res.status(404).render('error/error404', { user });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.equals(itemId));
    if (itemIndex === -1) {
      return res.status(404).render('notifications/not-cart-product', {
        cid,
        itemId,
        user,
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    return res.render('notifications/deleted-cart', {
      cid,
      itemId,
      user,
    });
  } catch (error) {
    customError(error);
    loggers.error('Error when removing a product from the cart');
    return res.status(500).render('notifications/not-cart', { user });
  }
};

export const updateCartProductsController = async (req, res) => {
  const userToken = req.cookies[config.jwt.cookieName];
  const user = getUserFromToken(req);
  const userEmail = user.email || user.user.email;

  if (!userToken) {
    return res.redirect('/auth/login');
  }

  try {
    const { cid, itemId } = req.params;
    const { cantidad } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.redirect('/');
    }

    const cart = await CartService.getOnePopulate({
      _id: cid,
      'user.email': userEmail,
    });

    if (!cart) {
      return res.redirect('/');
    }

    const updatedItemsArray = cart.items.map((item) => {
      if (item._id.toString() === itemId) {
        return {
          ...item,
          cantidad: cantidad,
        };
      }
      return item;
    });

    cart.items = updatedItemsArray;

    await cart.save();

    res.redirect('/cart');
  } catch (error) {
    customError(error);
    loggers.error('Error updating product quantity');
    res.status(500).render('notifications/not-cart', { user });
  }
};
