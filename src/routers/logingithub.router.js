import passport from 'passport';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customMessageSessions from '../services/sessions.log.js';
import customError from '../services/errors/log.error.js';

const router = Router();
  
router.get('/', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/githubcallback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  async (req, res) => {
    try {
      const token = jwt.sign({ user: req.user }, config.jwt.privateKey);
      const user = req.user;
      user.active = true;
      user.save();

      res.cookie(config.jwt.cookieName, token, {
        // cookie configuration with JWT token
        httpOnly: true,
        secure: true,
      });

      customMessageSessions(
        `User ${req.user.first_name} with ID #${req.user._id} has been successfully logged in`
      );
      res.redirect('/');
    } catch (err) {
      customError(err);
      loggers.error('Failed to authenticate user');
      res.redirect('/auth/login');
    }
  }
);

export default router;