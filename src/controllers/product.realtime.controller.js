import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';
import productModel from '../models/product.model.js';
import { ProductService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';

// no DAO applied
export const getProductsRTController = async (req, res) => {
  const user = getUserFromToken(req);
  res.render('products-realtime', { user });
};

export const sendProductsRTController = async (req, res) => {
  const { title, category, code, description, price, stock } = req.body;
  if (!title) {
    return res.status(400).render('The "title" field is required');
  }

  const newProduct = new productModel({
    title,
    category,
    status: true,
    code,
    description,
    price: parseInt(price),
    stock,
    ...(req.file
      ? { thumbnail: `/assets/images/products/${req.file.filename}` }
      : {}),
  });

  try {
    await newProduct.save();
    const product = await ProductService.getAll();
    res.render('product-realtime', {
      product: product,
      user: req.user,
    });
  } catch (error) {
    customError(error);
    loggers.error('Product no found');
    res.status(500).render('error/notProduct', { user });
  }
};
