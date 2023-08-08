import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/error.log.js';

const secret = config.jwt.privateKey;
const cookieName = config.jwt.cookieName;

const isLoggedIn = (req, res, next) => {
  const userToken = req.cookies[cookieName];

  if (!userToken) {
    return res.redirect('/login', { style: 'login' });
  }

  try {
    const credentials = jwt.verify(userToken, secret);
    const user = credentials;

    if (user) {
      req.user = user;
      next();
    } else {
      return res.redirect('/login', { style: 'login' });
    }
  } catch (error) {
    customError(error);
    loggers.error('Error to verify user token');
    return res.status(404).render('error/error404', { style:'error404' });
  }
};

export default isLoggedIn;
