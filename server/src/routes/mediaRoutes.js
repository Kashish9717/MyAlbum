import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getPresignedUrl,
  uploadLocalFile,
  createItem,
  getItemsByCollection,
  updateItem,
  deleteItem,
} from '../controllers/mediaController.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for local upload fallback
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = express.Router();

router.use(protect);

// Presigned URL & Local Upload endpoints
router.post('/media/presigned-url', getPresignedUrl);
router.post('/media/upload', upload.single('file'), uploadLocalFile);

// Collection Items endpoints
router.route('/collections/:id/items')
  .post(createItem)
  .get(getItemsByCollection);

// Standalone item CRUD
router.route('/items/:id')
  .patch(updateItem)
  .delete(deleteItem);

export default router;
