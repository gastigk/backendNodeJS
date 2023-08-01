import { ProductService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import loggers from '../config/logger.config.js';
import customError from '../services/error.log.js';

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
    res.render('productstable', { products, user });
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

    if (product) {
      res.render('productsdeletebyid', { product, user });
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
      res.status(200).render('productseditbyid', { producto, user });
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
  const products = await ProductService.getAll();
  try {
    const user = getUserFromToken(req);
    if (user.role !== 'admin') {
      return res.status(403).render('error/notAuthorized');
    }
    res.status(200).render('admin-panel', { products, user });
  } catch (error) {
    customError(error);
    loggers.error(`Error getting the requested data from the database`);
    res.status(500).render('error/error500', { user });
  }
};
