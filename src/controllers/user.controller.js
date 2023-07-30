import { UserService } from '../repositories/index.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import loggers from '../config/logger.config.js';
import CustomError from '../services/error/custom.error.js';
import EErros from '../services/error/enums.error.js';
import { generateUserErrorInfo } from '../services/error/info.error.js';
import UsersDTO from '../dto/user.dto.js';

export const getAllUsersController = async (req, res) => {
  try {
    const users = await UserService.getAll();
    let resultsDTO = users.map((user) => new UsersDTO(user));
    const userObjects = users.map((user) => user.toObject());
    res.render('users', { users: userObjects, user: resultsDTO[0] });
  } catch (err) {
    loggers.error('Error del servidor', err);
    res.status(500).send('Error del servidor');
  }
};

// no DAO applied
export const getProfileUsersController = async (req, res) => {
  const user = getUserFromToken(req);
  res.render('profileUser', { user });
};

// no DAO applied
export const getNewUserTest = async (req, res) => {
  const user = getUserFromToken(req);
  res.render('newUser', { user });
};

// no DAO applied
export const createNewUserTest = async (req, res) => {
  const users = [];
  loggers.info('req.body:', req.body);
  const user = req.body;

  if (!user.first_name || !user.last_name || !user.email) {
    try {
      throw new CustomError(
        'Error de Creacion de Usuario',
        generateUserErrorInfo(user),
        'Error típico al crear un usuario nuevo cuando no se completan los campos obligatorios',
        EErros.INVALID_TYPES_ERROR
      );
    } catch (error) {
      loggers.error(`Error de Creacion de Usuario: ${error.message}`);
      loggers.error(`Información adicional del error: ${error.cause}`);

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

    res.render('editUser', { user });
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error del servidor');
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
    loggers.error(err);
    res.status(500).send('Error del servidor');
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

    res.render('userDelete', { user });
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error del servidor');
  }
};
