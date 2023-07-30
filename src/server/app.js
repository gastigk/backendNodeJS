import express from 'express';
import { Server } from 'socket.io';
import config from '../config/config.js';
import compression from 'express-compression';
import errorHandler from '../middlewares/error.middleware.js'
import loggers from '../config/logger.config.js'

const app = express();

// path configuration
import path from 'path';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// third party configuration: static file compression with Brotli
app.use(compression({
    brotli:{enabled: true, zlib:{}}
}))

// third party configuration: commander
import { Command } from 'commander';
const program = new Command();
program
    .option('--mode <mode>', 'Puerto', 'prod')
    .option('--database <database>', 'Base de Datos', 'atlas')
program.parse();

// database connection
import MongoClient from '../dao/mongo/mongo.client.dao.js'
let client = new MongoClient()
client.connect()

// passport local & Github strategy configuration
import initializePassport from '../config/passport.config.js';
initializePassport();

import initializePassportGH from '../config/github.config.js';
initializePassportGH();

// middleware third-party: express-session with MongoStore
import configureSession from '../config/express-sessions.config.js';
configureSession(app);

// initializes passport and uses
import passport from 'passport';
app.use(passport.initialize());
app.use(passport.session());

// method-override configuration
import methodOverride from 'method-override';
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

//  template engine configuration: handlebars
import configureHandlebars from '../config/handlebars.config.js';
import { registerHandlebarsHelpers } from '../helpers/handlebars.helper.js';
registerHandlebarsHelpers(app)
configureHandlebars(app);

// middleware third-party: cookie-parser
import cookieParser from 'cookie-parser';
app.use(cookieParser());

// JSON configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// middleware third-party: body-parser
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set-up views
import views from '../config/views.config.js';
app.use(express.static(path.resolve('..', 'public')));
app.set('views', '../views/');
app.use(errorHandler)

function setupRoutes(app, routes) {
    routes.forEach((route) => {
        const { path, router } = route;
        app.use(path, router);
    });
}
setupRoutes(app, views);

// error handling 404
import { getUserFromToken } from '../middlewares/user.middleware.js';

app.use('/docs', (req, res, next) => next()); // exception for the route /apidocs/

const swaggerUrl = ['/docs', '/docs/', '/docs/swagger-ui.css', '/docs/swagger-ui-init.js', '/docs/swagger-ui-bundle.js', '/docs/swagger-ui-standalone-preset.js', '/docs/favicon-32x32.png', '/docs/favicon-16x16.png'];

import { loggermid } from '../config/utils.js'
app.use(loggermid)

function validateSwaggerRoutes(req, res, next) {
    const requestedPath = req.path;
    if (swaggerUrl.includes(requestedPath)) {
        next();
    } else {
        loggers.error(`Intentaron ingresar a una Pagina No Existente.!! 
            Error 404 | Método: ${req.method} en la URL: ${dominio}:${port}${req.url}`);
        const user = getUserFromToken(req);
        (!user) ? res.status(404).render('error/error404') :
            res.status(404).render('error/error404', { user });
    }
}
app.use(validateSwaggerRoutes);

// cors configuration
import cors from 'cors';
app.use(cors())

// swagger configuration
import swaggerUiExpress from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '../config/swagger.config.js';
const specs = swaggerJsdoc(swaggerOptions);
console.log('\n '); // Este console.log es par hacer un salto de Linea en la consola para que se vea mejor
loggers.http('Swagger corriendo en: ' + swaggerOptions.definition.servers[0].url + '/docs');
app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// listen server
let dominio = program.opts().mode === 'local' ? config.urls.urlProd : config.urls.urlLocal;
const port = program.opts().mode === 'prod' ? config.ports.prodPort : config.ports.devPort;
const httpServer = app.listen(port, () => loggers.http(`Server Up! => ${dominio}:${port}`))
const socketServer = new Server(httpServer)

// chat configuration with socket
import chatApp from '../config/chat.config.js';
chatApp(socketServer);