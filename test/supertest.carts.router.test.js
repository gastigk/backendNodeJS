import chai from 'chai';
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing app', () => {
  describe('Test cart', () => {
    it('You must add a product to the cart', async () => {
      const result = await requester
        .post('/cart/64cfd42c291927e2e1a435ac')
        .send({
          productId: 'd7cb63b5aac308ca97b5df9c',
          cantidad: 1,
        });
      expect(result.status).to.equal(302);
    });

    it('You must update the quantity of a product in the cart', async () => {
      const result = await requester
        .put('/cart/64cfd42c291927e2e1a435ac/d7cb63b5aac308ca97b5df9c')
        .send({
          cantidad: 10,
        });
      expect(result.status).to.equal(302);
    });

    it('You must empty the cart', async () => {
      const result = await requester
        .post('/cart/64cfd42c291927e2e1a435ac/clear')
        .send({
          cartId: 'd7cb63b5aac308ca97b5df9c',
        });
      expect(result.status).to.equal(302);
    });

    it('You must delete the cart', async () => {
      const result = await requester
        .post('/cart/64cfd42c291927e2e1a435ac/delete')
        .send({
          cartId: 'd7cb63b5aac308ca97b5df9c',
        });
      expect(result.status).to.equal(302);
    });
  });
});
