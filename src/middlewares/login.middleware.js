import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';

const isLoggedIn = (req, res, next) => {
  const userToken = req.cookies[config.jwt.cookieName];

  if (!userToken) {
    return res.redirect('/auth/login');
  }

  try {
    const credentials = jwt.verify(userToken, config.jwt.privateKey);
    const user = credentials;

    if (user) {
      req.user = user;
      next();
    } else {
      return res.redirect('/auth/login');
    }
  } catch (error) {
    customError(error);
    loggers.error('Error to verify user token');
    return res.status(404).render('error/error404');
  }
};

export default isLoggedIn;