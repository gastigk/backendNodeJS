import config from '../config/config.js';
import __dirname from '../server/utils.js';

const url = config.urls.urlLocal;
const ports = config.ports.prodPort;
const email = config.gmail.user;

export const swaggerOptions = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'E-commerce app',
      version: '1.0.0',
      description: '<img src="https://jobs.coderhouse.com/assets/logos_coderhouse.png" alt="CoderHouse" height="80" /> <br><br><br> Descripción: <br><br>Test API for Coderhouse Backend Course 2023<br><br>Autenticación: This API does not require authentication for read-only (GET) operations. <br>However, write operations (POST, PUT, DELETE) require admin user authentication.<br><br> Date Format: Dates must be provided in ISO 8601 format (for example, "2021-10-03 | 17:01:33").<br><br> Errors: The API returns detailed errors in JSON format if any problems occur during operations.',
      termsOfService: 'https://www.coderhouse.com/legales',
      contact: {
        name: 'Gastón Guevara',
        email: email,
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `${url}:${ports}`,
      },
    ],
    externalDocs: {
      description: 'Back to website',
      target: '_self',
      url: '/',
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
