import multer from 'multer';
import path from 'path';

import loggers from '../config/logger.config.js';
import __dirname from '../server/utils.js';
import customError from '../services/error.log.js';

// middleware third-party configuration: file upload to server with multer
const configureMulter = async () => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'assets', 'image'));
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + Date.now() + ext;
        cb(null, filename);
      },
    });

    const upload = multer({ storage });

    return upload;
  } catch (error) {
    customError(error);
    loggers.error('Multer configuration error');
    throw error;
  }
};

export default configureMulter;
