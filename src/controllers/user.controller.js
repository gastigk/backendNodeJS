import loggers from '../config/logger.config.js';
import CustomError from '../services/error/custom.error.js';
import EErros from '../services/error/enums.error.js';
import { generateUserErrorInfo } from '../services/error/info.error.js';
import customError from '../services/error.log.js';
import { UserService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import UsersDTO from '../dto/user.dto.js';
import {
  sendCloseAccountEmail,
  sendResetPasswordEmail,
} from '../helpers/nodemailer.helper.js';

// defining functions
export const sendResetPasswordEmailMethod = async (usermail, token) => {
  try {
    await sendResetPasswordEmail(usermail, token);
  } catch (err) {
    customError(err);
    loggers.error('Error al enviar el correo electrónico');
  }
};

export const resetPassword = async (userId, newPassword) => {
  try {
    const user = await UserService.getById(userId);
    if (!user) {
      throw new Error('Token inválido o expirado.');
    }
    user.password = newPassword;
    await user.save();
    const email = user.email;
    await sendPasswordChangedEmail(email);
  } catch (err) {
    customError(err);
    loggers.error('Error al restablecer la contraseña');
    throw err;
  }
};

// defining controllers
export const getAllUsersController = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const users = await UserService.getAll();
    let resultsDTO = users.map((user) => new UsersDTO(user));
    const userObjects = users.map((user) => user.toObject());
    res.render('users', {
      style: 'users',
      users: userObjects,
      user,
      resultsDTO,
    });
  } catch (err) {
    customError(err);
    loggers.error('Error server');
    res.status(500).send('Error server', { user });
  }
};

// no DAO applied
export const getProfileUsersController = async (req, res) => {
  const user = new UsersDTO(getUserFromToken(req));
  res.render('profileUser', { style: 'profileUser', user });
};

// no DAO applied
export const getNewUserTest = async (req, res) => {
  const user = getUserFromToken(req);
  res.render('newUser', { style: 'newUser', user });
};

// no DAO applied
export const createNewUserTest = async (req, res) => {
  const users = [];
  loggers.info('req.body:', req.body);
  const user = req.body;

  if (!user.first_name || !user.last_name || !user.email) {
    try {
      throw new CustomError(
        'User creation error',
        generateUserErrorInfo(user),
        'Typical error when creating a new user when the required fields are not completed',
        EErros.INVALID_TYPES_ERROR
      );
    } catch (error) {
      loggers.error(`User creation error: ${error.message}`);
      loggers.error(`Additional error information: ${error.cause}`);

      return res.redirect('/users/newUser');
    }
  }
  users.push(user);
  res.redirect('/users');
};

export const getUserForEditByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await UserService.getById(userId);

    if (!user) {
      user = getUserFromToken(req);
      return res.status(404).render('error/error404', { user });
    }
    res.render('editUser', { style:'editUser', user });
  } catch (err) {
    customError(err);
    loggers.error('Error server');
    res.status(500).render('error/error500', { user });
  }
};

export const editUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const { first_name, last_name, email, phone, age, role } = req.body;
    let user = getUserFromToken(req);
    const updatedUser = await UserService.update(userId, {
      first_name,
      last_name,
      email,
      phone,
      age,
      role,
    });

    if (!updatedUser) {
      return res.status(404).render('error/error404', { user });
    }

    res.redirect('/users');
  } catch (err) {
    customError(err);
    loggers.error('Error server');
    res.status(500).render('error/error500', { user });
  }
};

export const deleteUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserService.getById(userId);

    if (!user) {
      return res.status(404).render('error/error404', { user });
    }

    await UserService.delete(userId); // delete the user from the database

    try {
      await sendCloseAccountEmail(user.email);
    } catch (err) {
      customError(err);
      loggers.error('Error sending close account email');
    }
    res.render('userDelete', { style: 'userDelete', user });
  } catch (err) {
    customError(err);
    loggers.error('Error server');
    res.status(500).render('error/error500', { user });
  }
};

export const getForgotPassword = async (req, res) => {
  res.render('resetPasswordSent', { style: 'resetPasswordSent'});
};

export const sendForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const resetToken = generateToken();
    await sendResetPasswordEmailMethod(email, resetToken);
    res.render('resetPasswordSent', { style: 'resetPasswordSent', email });
  } catch (err) {
    customError(err);
    loggers.error('Error sending password reset email.');
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
  const { token } = req.params;
  const { password } = req.body;
  try {
    await resetPassword(token, password);
    res.render('passwordResetSuccess', { style:'resetPasswordForm', user: req.user });
  } catch (err) {
    customError(err);
    loggers.error('Failed to reset password');
    return res.status(500).render('error/error500');
  }
};
