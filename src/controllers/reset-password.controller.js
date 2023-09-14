import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';
import { sendResetPasswordEmail } from '../helpers/nodemailer.helper.js';
import { generateToken } from '../helpers/jwt.helper.js';
import { UserService } from '../repositories/index.js';

// defining functions
export const sendResetPasswordEmailMethod = async (usermail, token) => {
  try {
    await sendResetPasswordEmail(usermail, token);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email');
  }
};

export const getForgotPasswordController = async (req, res) => {
  res.render('password-reset', {
    title: 'Forgot your password',
  });
};

export const sendForgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserService.getOne({ email });
    if (!user) {
      return res
        .status(404)
        .render('error/userNotFound', { email });
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

export const getResetPasswordController = async (req, res) => {
  const { token } = req.params;
  try {
    res.render('password-new', { token });
  } catch (err) {
    customError(err);
    loggers.error('Invalid or expired token');
    return res.status(500).render('error/error500');
  }
};

export const setResetPasswordController = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  const userToken = token;
  const credentials = jwt.verify(userToken, config.jwt.privateKey);
  const userId = credentials.userId;
  const pass = await bcrypt.hash(password, 10);

  try {
    await sendResetPasswordEmail(userId, pass);

    res.render('password-successful', {
      user: req.user,
    });
  } catch (err) {
    customError(err);
    loggers.error('Failed to reset password');
    return res.status(500).render('error/error500');
  }
};
