import express from 'express';
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from '../controllers/collectionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All collection routes require authentication
router.use(protect);

router.route('/')
  .post(createCollection)
  .get(getCollections);

router.route('/:id')
  .get(getCollectionById)
  .patch(updateCollection)
  .delete(deleteCollection);

export default router;
