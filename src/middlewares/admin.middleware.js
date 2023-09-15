import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';

const isAdmin = (req, res, next) => {
  const userToken = req.cookies[config.jwt.cookieName];

  if (!userToken) {
    res.render('error/error403');
    return;
  }

  try {
    const credentials = jwt.verify(userToken, config.jwt.privateKey);
    const user = credentials;

    if (user.role === 'admin') {
      req.user = user;
      next();
    } else {
      res.render('error/error403');
    }
  } catch (error) {
    customError(error);
    loggers.error('Token verification failed');
    res.render('error/error403');
  }
};

export default isAdmin;