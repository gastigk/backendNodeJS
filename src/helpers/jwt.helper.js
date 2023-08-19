import jwt from 'jsonwebtoken';

import userModel from '../models/user.model.js';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';

const secret = config.jwt.privateKey;

export const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    age: user.age,
    phone: user.phone,
    active: user.active,
    updatedAt: user.updatedAt,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: '24h',
  });

  return token;
};

export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  jwt.verify(token, secret, (error, credentials) => {
    if (error) {
      loggers.error(error);
      return res.status(403).render('error/error403', { style: 'error403' });
    }

    userModel.findById(credentials.userId)
      .exec()
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .render('error/error404', { style: 'error404' });
        }

        req.user = user;
        next();
      })
      .catch((error) => {
        customError(error);
        loggers.error('Error to verify user token');
        return res.status(500).render('error/error500', { style: 'error500' });
      });
  });
};
