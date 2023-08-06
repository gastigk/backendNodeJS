import winston from 'winston';
import bcrypt from 'bcrypt';

import config from './config.js';

export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const generateRandomString = (num) => {
  return [...Array(num)]
    .map(() => {
      const randomNum = ~~(Math.random() * 36);
      return randomNum.toString(36);
    })
    .join('')
    .toUpperCase();
};

const swaggerUrls = [
  '/docs',
  '/docs/',
  '/docs/swagger-ui.css',
  '/docs/swagger-ui-init.js',
  '/docs/swagger-ui-bundle.js',
  '/docs/swagger-ui-standalone-preset.js',
  '/docs/favicon-32x32.png',
  '/docs/favicon-16x16.png',
  '/docs/index.html',
  '/docs/*',
];

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'http',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: './errors.log',
      level: 'warn',
      format: winston.format.json(),
    }),
  ],
});

export const loggermid = (req, res, next) => {
  req.logger = logger;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('es-AR');
  const dominio = config.urls.urlLocal;
  const port = config.ports.prodPort;
  const message = `Method ${req.method} at URL: ${dominio}:${port}${req.url} - ${formattedDate} - ${formattedTime}`;

  const requestedPath = req.path;
  if (!swaggerUrls.includes(requestedPath)) {
    logger.error(`Custom message: ${message}`);
  }

  next();
};
