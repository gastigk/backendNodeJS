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
import configureMulter from '../helpers/multer.helper.js';
const router = Router();

const uploadProfilePhoto = configureMulter('/assets/images/users/');
const uploadDocuments = configureMulter('documents');

router.get('/', isAdmin, getUsersController);
router.get('/profile', isLoggedIn, getProfileController);
router.post('/profile/documents/:id', isLoggedIn, uploadDocuments.single('document'), setUsersDocumentsController);
router.get('/profile/set-photo/:id', isLoggedIn, setProfileUsersController);
router.post('/profile/set-photo/:id', isLoggedIn, uploadProfilePhoto.single('photo'), setPhotoProfileUsersController);
router.get('/user-new', isAdmin, getNewUserTestController);
router.post('/user-new', isAdmin, createNewUserTestController);
router.get('/edit/:id', isAdmin, getUserForEditController);
router.post('/edit/:id', isAdmin, editUserController);
router.get('/delete/:id', isAdmin, deleteUserController);
router.get('/documents', isLoggedIn, getUsersDocumentsController);
router.get('/premium/:id', setUsersPremiumController);
router.get('/eliminated/:id', deleteUserController);

export default router;