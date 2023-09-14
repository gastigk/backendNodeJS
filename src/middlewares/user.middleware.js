import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';

export function getUserFromToken(req) {
  try {
    if (!req.cookies || !req.cookies[config.jwt.cookieName]) {
      const user = null;
      return user;
    }

    const userToken = req.cookies[config.jwt.cookieName];
    const credentials = jwt.verify(userToken, config.jwt.privateKey);
    return credentials;
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