import Cart from '../models/cart.model.js';
import { ProductService, CartService } from '../repositories/index.js';
import mongoose from 'mongoose';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import shortid from 'shortid';
import config from '../config/config.js';
import loggers from '../config/logger.config.js';

const cokieName = config.jwt.cookieName;
let user = null;
let userEmail = null;

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

// view cart
export const createCartController = async (req, res) => {
  user = getUserFromToken(req);
  try {
    const { sortOption } = req.query;
    const userToken = req.cookies[cokieName];

    if (userToken) {
      userEmail = user.email || user.user.email;
    } else {
      return res.redirect('/login');
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
      cart: { ...cart, items: sortedItems },
      totalPrice,
      cartId,
      user,
    });
  } catch (err) {
    loggers.error(err);
    res.status(500).render('error/notCart');
  }
};

// empty cart by ID
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
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error when emptying the cart');
  }
};

// delete the cart from the database
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
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error when emptying the cart');
  }
};

// update the quantity of a product in the cart
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
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error updating product quantity');
  }
};

// add products to cart
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
      return res.status(500).redirect('/login');
    }

    let cart = await getOrCreateCart(userEmail);
    cart.items.push({ producto: producto, cantidad: cantidad });
    cart.user.email = userEmail;
    cart.code = shortid.generate();
    cart.purchase_datetime = new Date();
    await cart.save();
    res.redirect('/');
  } catch (err) {
    loggers.error(err);
    res.status(500).redirect('/login');
  }
};

// remove a product from the cart
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
    return res.render('cartsDeleteById', { cartId, itemId, user });
  } catch (error) {
    loggers.error(error);
    return res.status(500).render('error/notCart');
  }
};
