import express from 'express';
import {
  toggleReaction,
  getReactionsByCollection,
  getActivityFeed,
  addComment,
  getCommentsByItem,
} from '../controllers/socialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Reactions
router.post('/items/:id/reactions', toggleReaction);
router.get('/collections/:id/reactions', getReactionsByCollection);

// Activity Feed
router.get('/collections/:id/activity', getActivityFeed);

// Comments
router.post('/items/:id/comments', addComment);
router.get('/items/:id/comments', getCommentsByItem);

export default router;
