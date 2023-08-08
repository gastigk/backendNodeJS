import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/error.log.js';

const secret = config.jwt.privateKey;
const cookieName = config.jwt.cookieName;

const isAdmin = (req, res, next) => {
  const userToken = req.cookies[cookieName];

  if (!userToken) {
    res.render('error/notAuthorized', { style:'notAuthorized' })
    return;
  }

  try {
    const credentials = jwt.verify(userToken, secret);
    const user = credentials;

    if (user.role === 'admin') {
      req.user = user;
      next();
    } else {
      res.render('error/notAuthorized', { style:'notAuthorized' })
    }
  } catch (error) {
    customError(error);
    loggers.error('Token verification failed');
    res.render('error/notAuthorized', { style:'notAuthorized' })
  }
};

export default isAdmin;
