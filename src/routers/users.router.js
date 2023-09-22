import { Router } from 'express';

import isAdmin from '../middlewares/admin.middleware.js';
import isLoggedIn from '../middlewares/login.middleware.js';
import {
  getUsersController,
  getProfileController,
  getNewUserTestController,
  createNewUserTestController,
  getUserForEditController,
  editUserController,
  deleteUserController,
  setProfileUsersController,
  setPhotoProfileUsersController,
  setUsersDocumentsController,
  getUsersDocumentsController,
  setUsersPremiumController,
} from '../controllers/user.controller.js';
import configurationMulter from '../helpers/multer.helper.js';
const router = Router();

const uploadProfilePhoto = configurationMulter('images/users');
const uploadDocuments = configurationMulter('documents');

router.get('/', isAdmin, getUsersController);
router.get('/profile', isLoggedIn, getProfileController);
router.get('/profile/set-photo/:id', isLoggedIn, setProfileUsersController);
router.get('/user-new', isAdmin, getNewUserTestController);
router.get('/edit/:id', isAdmin, getUserForEditController);
router.get('/delete/:id', isAdmin, deleteUserController);
router.get('/documents', isLoggedIn, getUsersDocumentsController);
router.get('/premium/:id', setUsersPremiumController);
router.get('/eliminated/:id', deleteUserController);
router.post('/profile/documents/:id', isLoggedIn, uploadDocuments.single('document'), setUsersDocumentsController);
router.post('/user-new', isAdmin, createNewUserTestController);
router.post('/profile/set-photo/:id', isLoggedIn, uploadProfilePhoto.single('photo'), setPhotoProfileUsersController);
router.post('/edit/:id', isAdmin, editUserController);

export default router;