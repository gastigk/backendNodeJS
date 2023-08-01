import passport from 'passport';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import loggers from '../config/logger.config.js';
import customMessageSessions from '../services/sessions.log.js';

const router = Router();
const cookieName = config.jwt.cookieName;
const secret = config.jwt.privateKey;

router.get('/', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/githubcallback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = jwt.sign({ user: req.user }, secret);

      res.cookie(cookieName, token, {
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
      res.redirect('/login');
    }
  }
);

export default router;
