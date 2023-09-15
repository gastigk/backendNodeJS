import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';
import {
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
} from '../helpers/nodemailer.helper.js';
import { generateToken } from '../helpers/jwt.helper.js';
import { UserService } from '../repositories/index.js';

// defining functions
const sendResetPasswordEmailMethod = async (usermail, token) => {
  try {
    await sendResetPasswordEmail(usermail, token);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email');
  }
};

const resetPassword = async (userId, newPassword) => {
  try {
    const user = await UserService.getById(userId);
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    user.password = newPassword;
    await user.save();
    const email = user.email;
    await sendPasswordChangedEmail(email);
  } catch (err) {
    customError(err);
    loggers.error('Password reset error');
    throw err;
  }
};

// defining controllers
export const getForgotPasswordController = async (req, res) => {
  res.render('auth/password-forgot');
};

export const sendForgotPasswordController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserService.getOne({ email });
    if (!user) {
      return res.status(404).render('error/userNotFound', { email });
    }
    const resetToken = generateToken(user._id);
    await sendResetPasswordEmailMethod(email, resetToken);
    res.redirect('/'); // aquí agregar page aclarando que llegó un mail
  } catch (err) {
    customError(err);
    loggers.error('Error sending password reset email', err);
    return res.status(500).render('error/error500');
  }
};

export const getResetPasswordController = async (req, res) => {
  const { token } = req.params;
  try {
    res.render('auth/password-reset', { token });
  } catch (err) {
    customError(err);
    loggers.error('Invalid or expired token');
    return res.status(500).render('error/error500');
  }
};

export const setResetPasswordController = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const userToken = token;
  const credentials = jwt.verify(userToken, config.jwt.privateKey);
  const userId = credentials.userId;
  const newPassword = await bcrypt.hash(password, 10);

  try {
    await resetPassword(userId, newPassword);

    res.render('auth/new-password', { user });
  } catch (err) {
    customError(err);
    loggers.error('Failed to reset password');
    return res.status(500).render('error/error500');
  }
};
