import express from 'express';
import {
  createInvite,
  getCollaborators,
  updateCollaboratorRole,
  removeCollaborator,
  validateInvite,
  acceptInvite,
} from '../controllers/inviteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public validation of invite token
router.get('/invites/:token', validateInvite);

// Protected invite routes
router.post('/invites/:token/accept', protect, acceptInvite);

// Collection collaborators management
router.post('/collections/:id/invite', protect, createInvite);
router.get('/collections/:id/collaborators', protect, getCollaborators);
router.patch('/collections/:id/collaborators/:userId', protect, updateCollaboratorRole);
router.delete('/collections/:id/collaborators/:userId', protect, removeCollaborator);

export default router;
