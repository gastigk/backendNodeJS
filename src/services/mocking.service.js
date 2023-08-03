import { ProductService } from '../repositories/index.js';
import loggers from '../config/logger.config.js';
import customError from './error.log.js';

export const generateMockProducts = async () => {
  try {
    const mockProducts = [];

    for (let i = 0; i < 33; i++) {
      const newProduct = {
        title: `Mocking Product #${i}`,
        category: 'Test',
        code: `T${i}`,
        description:
          'Test Description - This is a randomly generated test description for the product',
        price: 12.999,
        stock: 13,
        thumbnail: `https://res.cloudinary.com/drl62fylt/image/upload/c_thumb,w_200,h_200,g_auto/v1676035925/rituales_kiqmd2.jpg`,
        status: true,
      };

      mockProducts.push(newProduct);
    }

    await ProductService.insertMany(mockProducts);
  } catch (error) {
    customError(error);
    loggers.error('Error al generar productos de prueba');
    throw error;
  }
};
