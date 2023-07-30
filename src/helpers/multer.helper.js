import multer from 'multer';
import path from 'path';
import loggers from '../config/logger.config.js';
import __dirname from '../server/utils.js';

const configureMulter = async () => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'img'));
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
    loggers.error('Multer configuration error:', error);
    throw error;
  }
};

export default configureMulter;
