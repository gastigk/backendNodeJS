import { UserService } from '../repositories/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../config/passport.config.js';
import config from '../config/config.js';
import loggers from '../config/logger.config.js';
import passport from 'passport';
import { getUserFromToken } from '../middlewares/user.middleware.js';

const cookieName = config.jwt.cookieName;
const secret = config.jwt.privateKey;

export const getUserFromCookiesController = async (req, res) => {
  const userToken = req.cookies[cookieName];

  if (!userToken) {
    return res.status(401).render('error/notLoggedIn');
  }

  try {
    const decodedToken = jwt.verify(userToken, cookieName);
    const userId = decodedToken.userId;
    UserService.getById(userId, (err, user) => {
      if (err || !user) {
        return res.status(404).render('error/error404');
      }

      return res.status(200).redirect('/');
    });
  } catch (err) {
    loggers.error(err);
    return res.status(500).send('Internal server error');
  }
};

// no DAO applied
export const getLogginController = async (req, res) => {
  res.render('login');
};

export const sendLogginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserService.getOne({ email: email });

    if (!user) {
      return res.status(401).render('error/notLoggedIn');
    }

    bcrypt.compare(password, user.password).then((result) => {
      if (result) {
        const token = generateToken(user);
        const userToken = token;

        const decodedToken = jwt.verify(userToken, secret);
        const userId = decodedToken.userId;

        res.cookie(cookieName, userToken).redirect('/');
      } else {
        return res.status(401).render('error/notLoggedIn');
      }
    });
  } catch (err) {
    loggers.error(err);
    return res.status(500).send('Internal server error');
  }
};

// no DAO applied
export const getLogoutController = async (req, res) => {
  res.clearCookie(cookieName);
  res.redirect('/');
};

// no DAO applied
export const getSignupController = async (req, res) => {
  res.render('signup');
};

// no DAO applied
export const setSignupController = async (req, res, next) => {
  passport.authenticate('signup', (err, user, info) => {
    if (err) {
      loggers.error(err);
      return res.status(500).send('Server error');
    }

    if (!user) {
      if (info.message === 'Email already exists.') {
        return res.render('error/notSignupByEmail');
      } else if (info.message === 'Phone already exists.') {
        return res.render('error/notSignupByPhone');
      }
    }

    req.login(user, (err) => {
      if (err) {
        loggers.error(err);
        return res.status(500).send('Server error');
      }

      res.redirect('/login');
    });
  })(req, res, next);
};

// no DAO applied
export const getSignupAdminController = (req, res) => {
  const user = getUserFromToken(req);
  res.render('signupadmin', { user });
};

// no DAO applied
export const setSignupAdminController = (req, res, next) => {
  passport.authenticate('signup', (err, user, info) => {
    if (err) {
      loggers.error(err);
      return res.status(500).send('Server error');
    }

    if (!user) {
      if (info.message === 'Email already exists.') {
        return res.render('error/notSignupByEmail');
      } else if (info.message === 'Phone already exists.') {
        return res.render('error/notSignupByPhone');
      }
    }

    req.login(user, (err) => {
      if (err) {
        loggers.error(err);
        return res.status(500).send('Server error');
      }

      res.redirect('/users');
    });
  })(req, res, next);
};
