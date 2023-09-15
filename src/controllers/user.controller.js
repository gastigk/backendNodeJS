import loggers from '../config/loggers.config.js';
import EErros from '../services/errors/enums.error.js';
import { generateUserErrorInfo } from '../services/errors/info.error.js';
import CustomError from '../services/errors/custom.error.js';
import customError from '../services/errors/log.error.js';
import { UserService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import UsersDTO from '../dto/user.dto.js';
import {
  sendCloseAccountEmail,
  sendCloseInactivitiAccountEmail,
} from '../helpers/nodemailer.helper.js';

// defining controllers
export const getUsersController = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const users = await UserService.getAll();
    let resultsDTO = users.map((user) => new UsersDTO(user));
    const userObjects = users.map((user) => user.toObject());
    res.render('user', {
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
export const getProfileController = async (req, res) => {
  const user = getUserFromToken(req);

  res.render('user-profile', { user });
};

export const setProfileUsersController = async (req, res) => {
  const user = new UsersDTO(getUserFromToken(req));
  const userId = req.params.id;

  res.render('user-profile-photo', { user, userId });
};

export const setPhotoProfileUsersController = async (req, res) => {
  let user = getUserFromToken(req);
  try {
    const userId = req.params.id;
    const { file } = req;
    if (file) {
      user.photo = file.filename;
    } else {
      return res.status(404).render('error/error404', { user });
    }
    const newUserPhoto = await UserService.update(userId, {
      photo: `/assets/images/users/${file.filename}`,
    });

    if (!newUserPhoto) {
      return res.status(404).render('error/error404', { user });
    }

    await newUserPhoto.save();
    let photo = `/assets/images/users/${file.filename}`;
    res.render('user-profile-edit', { user, photo, userId });
  } catch (err) {
    customError(err);
    loggers.error('Error server', err);
    res.status(500).render('error/error500', { user });
  }
};

// no DAO applied
export const getNewUserTestController = async (req, res) => {
  const user = getUserFromToken(req);
  res.render('newUser', { user });
};

// no DAO applied
export const createNewUserTestController = async (req, res) => {
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

      return res.redirect('/user/newUser');
    }
  }
  users.push(user);
  res.redirect('/user');
};

export const getUserForEditController = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await UserService.getById(userId);

    if (!user) {
      user = getUserFromToken(req);
      return res.status(404).render('error/error404', { user });
    }
    res.render('user-profile-edit', { user });
  } catch (err) {
    customError(err);
    loggers.error('Error server');
    res.status(500).render('error/error500', { user });
  }
};

export const editUserController = async (req, res) => {
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
      premium,
      photo,
    });

    if (!updatedUser) {
      return res.status(404).render('error/error404', { user });
    }

    res.redirect('/user');
  } catch (err) {
    customError(err);
    loggers.error('Error server');
    res.status(500).render('error/error500', { user });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserService.getById(userId);

    if (!user) {
      return res.status(404).render('error/error404', { user });
    }

    await UserService.delete(userId);

    try {
      await sendCloseAccountEmail(user.email);
    } catch (err) {
      customError(err);
      loggers.error('Error sending close account email');
    }
    res.render('user-eliminated', { user });
  } catch (err) {
    customError(err);
    loggers.error('Error server');
    res.status(500).render('error/error500', { user });
  }
};

export const deleteInactiveUsersController = async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const inactiveUsers = await UserService.getAll();

    inactiveUsers.forEach(async (user) => {
      if (user.updatedAt < oneYearAgo) {
        try {
          await sendCloseInactivitiAccountEmail(user.email);
          await UserService.delete(user.id);
          loggers.warn(
            `Inactive user removed: ${user.first_name} ${user.last_name}`
          );
        } catch (err) {
          customError(err);
          loggers.error(
            `Error deleting inactive user: ${user.first_name} ${user.last_name}`
          );
        }
      }
    });
  } catch (err) {
    customError(err);
    loggers.error('Error server', err);
    res.status(500).loggers('Server error when deleting inactive users');
  }
};

export const getUsersPremiumController = async (req, res) => {
  const user = getUserFromToken(req);
  res.render('user-premium', { user });
};

export const getUsersDocumentsController = async (req, res) => {
  const user = getUserFromToken(req);
  try {
    if (user.document.length === 0) {
      return res.render('error/notDocuments', { user });
    } else {
      res.status(200).render('documents', { user, document: user.document });
    }
  } catch (error) {
    customError(error);
    loggers.error('An error occurred while processing the request');
    return res.status(500).render('error/error500');
  }
};

export const setUsersDocumentsController = async (req, res) => {
  try {
    let user = getUserFromToken(req);
    const userId = req.params.id;
    if (!req.file) {
      return res.status(404).render('error/error404', { user });
    }
    const documentPath = `/documents/${req.file.filename}`;
    const newDocument = await UserService.update(userId, {
      $push: { document: documentPath },
    });

    await newDocument.save();
    res.status(200).render('documents', { user, documentPath, userId });
  } catch (error) {
    customError(error);
    loggers.error('An error occurred while processing the file');
    return res.status(500).render('error/error500');
  }
};

export const setUsersPremiumController = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await UserService.getById(userId);
    if (!user) {
      return res.status(404).render('error/userNotFound', { userId });
    }
    if (user.document.length > 0 && user.photo.length > 0) {
      await UserService.update(userId, { premium: true });
      const usermail = user.email;
      sendPremiumUpgradeUser(usermail);
      res.status(200).render('user-premium-validate', { user });
    } else {
      res.status(200).render('error/notPremium', { user });
    }
  } catch (error) {
    customError(error);
    loggers.error('An error occurred while processing the request');
    return res.status(500).render('error/error500');
  }
};