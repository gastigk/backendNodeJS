import { ProductManager } from '../../manager/productManager.js';

const productManager = new ProductManager('./data/products.json');

export default class ProductFileDAO {
  create = async (data) => await productManager.addProduct(data);
  delete = async (id) => await productManager.deleteProduct(+id);
  getAll = async () => await productManager.getProducts();
  getById = async (id) => await productManager.getProductById(+id);
  getAllPaginate = async (req, PORT) => {
    const result = await productManager.getProducts();
    const limit = req.query.limit;
    if (typeof result == 'string') {
      const error = result.split(' ');
      return {
        statusCode: parseInt(error[0].slice(1, 4)),
        response: { error: result.slice(6) },
      };
    }
    return {
      statusCode: 200,
      response: { payload: result.slice(0, limit) },
    };
  };
  update = async (id, data) => await productManager.updateProduct(+id, data);
}
