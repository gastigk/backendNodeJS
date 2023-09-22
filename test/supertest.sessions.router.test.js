import chai from 'chai';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing app', () => {
  const fakerName = faker.internet.userName();
  const fakerLastName = faker.internet.userName();
  const fakerEmail = faker.internet.email();
  const randomNumber = Math.floor(Math.random() * Math.pow(10, 10));

  describe('Test sessions', () => {
    it('You must register a user', async function () {
      this.timeout(5000);
      const user = {
        first_name: fakerName,
        last_name: fakerLastName,
        email: fakerEmail,
        phone: randomNumber,
        age: 30,
        role: 'user',
        password: 'secret',
        active: false,
        cart: null,
      };

      try {
        const response = await requester.post('/auth/register').send(user);
        expect(response.status).to.equal(302);
      } catch (error) {
        throw error;
      }
    });

    it('You must log in a user and RETURN COOKIE', async () => {
      const result = await requester.post('/auth/login').send({
        email: fakerEmail,
        password: 'secret',
      });
      const cookieResult = result.headers['set-cookie'][0];
      expect(cookieResult).to.be.ok;
      expect(cookieResult.split('=')[0]).to.be.eql('CookieToken');
      expect(cookieResult.split('=')[1]).to.be.ok;
    });
  });
});
