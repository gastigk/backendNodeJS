// path configuration
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// third-party middleware configuration for file upload
import multer from 'multer';

const helperMulter = async () => {
  try {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'img'));
      },
      filename: function (req, file, cb) {
        const extention = path.extname(file.originalname);
        const filename = file.fieldname;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + filename + '.' + extention);
      },
    });

    const upload = multer({ storage: storage  });

    return upload;
  } catch (error) {
    console.error('Multer configuration error:', error);
    throw error;
  }
};
