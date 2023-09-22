import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { generateToken } from '../helpers/jwt.helper.js';
import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import customError from '../services/errors/log.error.js';
import customMessageSessions from '../services/sessions.log.js';
import { UserService } from '../repositories/index.js';
import { sendWelcomeUser } from '../helpers/nodemailer.helper.js';

export const getLogginController = async (req, res) => {
  res.render('auth/login');
};

// no DAO applied
export const getLogoutController = async (req, res) => {
  const user = getUserFromToken(req);

  const firstName = user?.first_name || user?.user?.first_name;
  const lastName = user?.last_name || user?.user?.last_name;
  const userId = user?.userId || user?.user?._id;

  const message = `User ${firstName} ${lastName} with ID #${userId} has been logged out successfully`;
  customMessageSessions(message);

  try {
    await UserService.update(userId, { active: false });
    res.clearCookie(config.jwt.cookieName);
    res.redirect('/auth/login');
  } catch (err) {
    customError(err);
    loggers.error('Error to update user status to inactive');
    return res.status(500).render('error/error500');
  }
};

// no DAO applied
export const getSignupController = async (req, res) => {
  res.render('auth/register');
};

// no DAO applied
export const getSignupAdminController = (req, res) => {
  const user = getUserFromToken(req);
  res.render('auth/register-admin', { user });
};

export const getUserFromCookiesController = async (req, res) => {
  const userToken = req.cookies[config.jwt.cookieName];

  if (!userToken) {
    return res.status(401).render('notifications/not-loggedin');
  }

  try {
    const credentials = jwt.verify(userToken, config.jwt.cookieName);
    const userId = credentials.userId;
    UserService.getById(userId, (err, user) => {
      if (err || !user) {
        return res.status(404).render('error/error404');
      }

      return res.status(200).redirect('/');
    });
  } catch (error) {
    customError(error);
    loggers.error('Error to get user from cookies');
    return res.status(500).render('error/error500');
  }
};

export const sendLogginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserService.getOne({ email: email });

    if (!user) {
      return res.status(401).render('notifications/not-loggedin');
    }

    bcrypt.compare(password, user.password).then((result) => {
      if (result) {
        user.active = true;
        user.save();
        const token = generateToken(user);
        const userToken = token;
        const credentials = jwt.verify(userToken, config.jwt.privateKey);
        const userId = credentials.userId;
        const message = `User ${credentials.first_name} ${credentials.last_name} with ID  #${userId} has been successfully logged in`;
        customMessageSessions(message);

        res.cookie(config.jwt.cookieName, userToken).redirect('/');
      } else {
        loggers.error('Error to login user');
        return res.status(401).render('notifications/not-loggedin');
      }
    });
  } catch (err) {
    customError(err);
    loggers.error('Error to login user');
    return res.status(500).render('error/error500');
  }
};

// no DAO applied
export const setSignupController = async (req, res, next) => {
  passport.authenticate('register', (err, user, info) => {
    if (err) {
      customError(err);
      loggers.error(err);
      return res.status(403).render('error/error403');
    }

    if (!user) {
      if (info.message === 'Email already exists.') {
        return res.render('notifications/unregistered-email');
      } else if (info.message === 'Phone already exists.') {
        return res.render('notifications/unregistered-phone');
      }
    }

    req.login(user, async (err) => {
      if (err) {
        customError(err);
        loggers.error(err);
        return res.status(403).render('error/error403');
      }
      try {
        await sendWelcomeUser(user.email);
      } catch (err) {
        customError(err);
        loggers.error('Error sending welcome email');
      }
      res.redirect('/auth/login');
    });
  })(req, res, next);
};

// no DAO applied
export const setSignupAdminController = (req, res, next) => {
  passport.authenticate('register', (err, user, info) => {
    if (err) {
      customError(err);
      loggers.error('Error creating user');
      return res.status(403).render('error/error403');
    }

    if (!user) {
      if (info.message === 'Email already exists.') {
        return res.render('notifications/unregistered-email');
      } else if (info.message === 'Phone already exists.') {
        return res.render('notifications/unregistered-phone');
      }
    }

    req.login(user, async (err) => {
      if (err) {
        customError(err);
        loggers.error('Error creating user');
        return res.status(403).render('error/error403');
      }
      try {
        await sendWelcomeUser(user.email);
      } catch (err) {
        customError(err);
        loggers.error('Error sending welcome email', err);
      }
      res.redirect('/user');
    });
  })(req, res, next);
};
