import express from 'express';
import config from '../config/config.js';
import loggers from '../config/logger.config.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import customError from '../services/error.log.js';

const app = express();

// third party configuration: static file compression with Brotli
import compression from 'express-compression';
app.use(
  compression({
    brotli: { enabled: true, zlib: {} },
  })
);

// third party configuration: commander
import { Command } from 'commander';
const program = new Command();
program
  .option('--mode <mode>', 'Port', 'prod')
  .option('--database <database>', 'DB', 'atlas');
program.parse();

// database connection
import MongoClient from '../dao/mongo/mongo.client.dao.js';
let client = new MongoClient();
client.connect();

// passport local & Github strategy configuration
import initializePassport from '../config/passport.config.js';
import initializePassportGH from '../config/github.config.js';
initializePassport();
initializePassportGH();

// middleware third-party configuration: express-session with MongoStore
import configureSession from '../config/express-sessions.config.js';
configureSession(app);

// initializes passport and uses
import passport from 'passport';
app.use(passport.initialize());
app.use(passport.session());

// method-override configuration
import methodOverride from 'method-override';
app.use(methodOverride('_method'));

//  template engine configuration with handlebars
import configureHandlebars from '../config/handlebars.config.js';
import { registerHandlebarsHelpers } from '../helpers/handlebars.helper.js';
registerHandlebarsHelpers(app);
configureHandlebars(app);

// middleware third-party configuration: cookie analysis with cookie-parser
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// JSON configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // configure the server to receive complex data from the url

// middleware third-party: body-parser
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set-up views
import views from '../config/views.config.js';
import path from 'path';
app.use(express.static(path.resolve('..', 'public'))); // use a folder's resources statically
app.set('views', '../views/');

import errorHandler from '../middlewares/error.middleware.js';
app.use(errorHandler);

function setupRoutes(app, routes) {
  routes.forEach((route) => {
    const { path, router } = route;
    app.use(path, router);
  });
}
setupRoutes(app, views);

// error handling 404
import { loggermid } from '../config/utils.js';
app.use(loggermid);

app.use('/docs', (req, res, next) => next()); // exception for the route /apidocs/

const swaggerUrl = [
  '/docs',
  '/docs/',
  '/docs/swagger-ui.css',
  '/docs/swagger-ui-init.js',
  '/docs/swagger-ui-bundle.js',
  '/docs/swagger-ui-standalone-preset.js',
  '/docs/favicon-32x32.png',
  '/docs/favicon-16x16.png',
];

function validateSwaggerRoutes(req, res, next) {
  const requestedPath = req.path;
  if (swaggerUrl.includes(requestedPath)) {
    next();
  } else {
    loggers.error(`An attempt was made to access a non-existent page 
            Error 404 | Method: ${req.method} in the URL: ${dominio}:${port}${req.url}`);
    customError(new Error(message));
    const user = getUserFromToken(req);
    !user
      ? res.status(404).render('error/error404')
      : res.status(404).render('error/error404', { user });
  }
}
app.use(validateSwaggerRoutes);

// cors configuration
import cors from 'cors';
app.use(cors());

// listen server
let dominio =
  program.opts().mode === 'local' ? config.urls.urlProd : config.urls.urlLocal;
const port =
  program.opts().mode === 'prod' ? config.ports.prodPort : config.ports.devPort;
const httpServer = app.listen(port, () =>
  loggers.http(`Server Up! => ${dominio}:${port}`)
);
import { Server } from 'socket.io';
const socketServer = new Server(httpServer);

// swagger configuration
import swaggerUiExpress from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '../config/swagger.config.js';
const specs = swaggerJsdoc(swaggerOptions);
console.log('\n '); // line break in console
loggers.http(
  'Swagger running on: ' + swaggerOptions.definition.servers[0].url + '/docs'
);
app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// chat configuration with socket.io
import chatApp from '../config/chat.config.js';
chatApp(socketServer);
