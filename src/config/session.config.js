import session from 'express-session';
import MongoStore from 'connect-mongo';

import config from './config.js';

const configureSession = (app) => {
  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: config.mongo.uri,
        dbName: config.mongo.dbname,
        collectionName: 'sessions',
      }),
      secret: config.mongo.secret,
      resave: true,
      saveUninitialized: true,
    })
  );

  app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.user ? true : false;
    res.locals.userRole = req.session.user ? req.session.user.role : null;
    next();
  });
};

export default configureSession;