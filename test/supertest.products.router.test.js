import chai from 'chai';
import supertest from 'supertest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import ProductService from '../src/dao/mongo/product.mongo.dao.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Test products - Method GET', () => {
  it('Should return Status 200 if there are Products to display', async () => {
    const productsData = [
      {
        title: String,
      },
    ];

    ProductService.getAll = async () => productsData;

    const response = await requester.get('/products');
    expect(response.status).to.equal(200);
    const responseBody = response.text;
    expect(typeof responseBody).to.equal('string');
  });
});

describe('Test products - Method POST', () => {
  describe('Test products', () => {
    it('At the POST endpoint / you must register a product', async () => {
      const filename = 'macbook-pro.png';

      const mockRequest = {
        file: { filename },
      };

      const imgDirectory = join(__dirname, 'images');
      const absolutePath = join(imgDirectory, filename);

      try {
        await fs.access(absolutePath);
      } catch (error) {
        throw new Error(`File not found: ${absolutePath}`);
      }

      const response = await requester
        .post('/products')
        .field('title', 'Product')
        .field('category', 'Category')
        .field('code', 'Coode')
        .field('description', 'Description')
        .field('price', 356)
        .field('stock', 33)
        .attach('thumbnail', absolutePath);

      expect(response.status).to.equal(200);
    });
  });
});
