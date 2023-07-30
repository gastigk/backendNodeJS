import Product from '../models/product.model.js';

export const generateMockProducts = async () => {
  try {
    const mockProducts = [];

    for (let i = 0; i < 100; i++) {
      const newProduct = {
        title: `Mocking Product #${i}`,
        category: 'Tennis',
        code: `T${i}`,
        description:
          'Test Description - This is a randomly generated test description for the product',
        price: 15249,
        stock: 10,
        thumbnail: `https://res.cloudinary.com/drl62fylt/image/upload/v1676036080/piedra_hwjvu6.jpg`,
        status: true,
      };

      mockProducts.push(newProduct);
    }

    await Product.insertMany(mockProducts);
  } catch (error) {
    console.error('Error generating test products:', error);
  }
};
