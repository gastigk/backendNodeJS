import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import loggers from '../config/logger.js';
import customError from '../services/error.log.js';
import {
  sendResetPasswordEmailMethod,
  resetPassword,
} from '../helpers/functions.helpers.js';
import { generateToken } from '../middlewares/passport.middleware.js';
import { UserService } from '../repositories/index.js';

const secret = config.jwt.privateKey;

export const getForgotPassword = async (req, res) => {
  res.render('resetPasswordSent', {
    style: 'resetPasswordSent',
    title: 'Forgot your password',
  });
};

export const sendForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserService.getOne({ email });
    if (!user) {
      return res.status(404).render('error/userNotFound', { email });
    }
    const resetToken = generateToken(user._id);
    await sendResetPasswordEmailMethod(email, resetToken);
    res.redirect('/');
  } catch (err) {
    customError(err);
    loggers.error('Error sending password reset email', err);
    return res.status(500).render('error/error500');
  }
};

export const getResetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    res.render('resetPasswordForm', { style:'resetPasswordForm', token });
  } catch (err) {
    customError(err);
    loggers.error('Invalid or expired token');
    return res.status(500).render('error/error500');
  }
};

export const setResetPassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  const userToken = token;
  const decodedToken = jwt.verify(userToken, secret);
  const userId = decodedToken.userId;
  const pass = await bcrypt.hash(password, 10);

  try {
    await resetPassword(userId, pass);

    res.render('passwordResetSuccess', { style:'passwordResetSuccess', user: req.user });
  } catch (err) {
    customError(err);
    loggers.error('Failed to reset password');
    return res.status(500).render('error/error500');
  }
};
