import express from 'express';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';

const app = express();

// argument handling with commander
import { Command } from 'commander';
const program = new Command();
program
  .option('--mode <mode>', 'Working mode', 'production')
  .option('--database <database>', 'DB', 'atlas');
program.parse();

// JSON configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // configure the server to receive complex data from the url

// middleware third-party configuration: body-parser
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// method-override configuration
import methodOverride from 'method-override';
app.use(methodOverride('_method'));

// middleware third-party allows you to manage cookies within requests
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// static file compression with brotli
import compression from 'express-compression';
app.use(
  compression({
    brotli: { enabled: true, zlib: {} },
  })
);

// middleware express-session configuration: configure sessions with mongostore
import configureSession from '../config/session.config.js';
configureSession(app);

// passport local & Github strategy configuration
import initializePassport from '../config/passport.config.js';
import initializePassportGH from '../config/github.config.js';
initializePassport();
initializePassportGH();

// initializes passport and uses
import passport from 'passport';
app.use(passport.initialize());
app.use(passport.session());

// cors configuration
import cors from 'cors';
app.use(cors());

// render settings
import path from 'path';
app.use(express.static(path.resolve('..', 'public'))); // use a folder's resources statically

import configureHandlebars from '../config/handlebars.config.js';
import { registerHandlebarsHelpers } from '../helpers/handlebars.helper.js';
registerHandlebarsHelpers(app);
configureHandlebars(app);

import MongoClient from '../dao/mongo/mongo.client.dao.js';
import { Server } from 'socket.io';
import chatApp from '../config/chat.config.js';
import views from '../config/views.config.js';
import swaggerUiExpress from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { configurationSwagger } from '../config/swagger.config.js';

try {
  // database connection
  let client = new MongoClient();
  client.connect();

  // listen server
  let dominio =
    program.opts().mode === 'local'
      ? config.apiserver.urlProd
      : config.apiserver.urlLocal;
  const port =
    program.opts().mode === 'production'
      ? config.apiserver.prodPort
      : config.apiserver.devPort;
  const httpServer = app.listen(port, () =>
    loggers.http(`Server Up! => ${dominio}:${port}`)
  );

  // chat configuration with socket.io
  const socketServer = new Server(httpServer);
  chatApp(socketServer);

  app.set('views', '../views/');

  function setupRoutes(app, routes) {
    routes.forEach((route) => {
      const { path, router } = route;
      app.use(path, router);
    });
  }
  setupRoutes(app, views);

  // swagger configuration
  const specs = swaggerJsdoc(configurationSwagger);
  console.log('\n '); // line break in console
  loggers.http(
    'Swagger running on: ' + configurationSwagger.definition.servers[0].url + '/docs'
  );
  app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
} catch (err) {
  loggers.error('Cannot connect to DB');
  process.exit(-1);
}
