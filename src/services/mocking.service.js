import { faker } from '@faker-js/faker'

import { ProductService } from '../repositories/index.js';
import loggers from '../config/logger.config.js';
import customError from './error.log.js';

export const generateMockProducts = async () => {
  try {
    const mockProducts = [];

    for (let i = 0; i < 33; i++) {
      const newProduct = {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        code: faker.string.alphanumeric(5),
        status: faker.datatype.boolean(),
        stock: faker.number.int(100),
        category: faker.commerce.department(),
        thumbnail: faker.image.urlLoremFlickr({ width: 640, height: 480, category: 'abstract' })
      };

      mockProducts.push(newProduct);
    }

    await ProductService.insertMany(mockProducts);
  } catch (error) {
    customError(error);
    loggers.error('Error to create mocking products de prueba');
    throw error;
  }
};
