import express from 'express';
import {
  getPersonalNotes,
  createPersonalNote,
  updatePersonalNote,
  deletePersonalNote,
} from '../controllers/personalNoteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPersonalNotes)
  .post(createPersonalNote);

router.route('/:id')
  .patch(updatePersonalNote)
  .delete(deletePersonalNote);

export default router;
