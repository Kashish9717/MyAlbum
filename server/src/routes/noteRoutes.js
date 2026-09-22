import express from 'express';
import {
  createStickyNote,
  getStickyNotesByCollection,
  updateStickyNote,
  deleteStickyNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Nested collection sticky notes
router.route('/collections/:id/notes')
  .post(createStickyNote)
  .get(getStickyNotesByCollection);

// Standalone sticky note endpoints
router.route('/notes/:id')
  .patch(updateStickyNote)
  .delete(deleteStickyNote);

export default router;
