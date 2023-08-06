import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/error.log.js';

const secret = config.jwt.privateKey;
const cookieName = config.jwt.cookieName;

export function getUserFromToken(req) {
  try {
    if (!req.cookies || !req.cookies[cookieName]) {
      const user = null;
      return user;
    }

    const userToken = req.cookies[cookieName];
    const decodedToken = jwt.verify(userToken, secret);
    return decodedToken;
  } catch (error) {
    customError(error);
    loggers.error('Failed to verify token');
    return null;
  }
}

export function getUserId(req) {
  try {
    const user = getUserFromToken(req);
    if (!user || !user.userId) {
      loggers.error('Could not get token user id');
    }
    return user.userId;
  } catch (error) {
    customError(error);
    loggers.error('Failed to get user id');
    return null;
  }
}
