import Product from '../models/product.model.js';
import { ProductService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import loggers from '../config/logger.config.js';

// no DAO applied
export const getProductsInRealTimeController = async (req, res) => {
  const user = getUserFromToken(req);
  res.render('realtimeproducts', { user });
};

export const sendProductsInRealTimeController = async (req, res) => {
  const { title, category, code, description, price, stock } = req.body;
  if (!title) {
    return res.status(400).render('The "title" field is required');
  }

  const newProduct = new Product({
    title,
    category,
    status: true,
    code,
    description,
    price: parseInt(price),
    stock,
    ...(req.file ? { thumbnail: `/img/${req.file.filename}` } : {}),
  });

  try {
    await newProduct.save();
    const product = await ProductService.getAll();
    res.render('realtimeproducts', { product: product, user: req.user });
  } catch (err) {
    loggers.error(err);
    res.status(500).render('error/notProduct', { user });
  }
};
