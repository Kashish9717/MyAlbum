import crypto from 'crypto';
import { Invite } from '../models/Invite.js';
import { Collection } from '../models/Collection.js';
import { User } from '../models/User.js';
import { getUserRole } from '../middleware/checkRole.js';

// @desc    Create invite for a collection (by email or link)
// @route   POST /api/collections/:id/invite
// @access  Private (Owner/Admin)
export const createInvite = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;
    const { email, role } = req.body;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const userRole = getUserRole(collection, req.user._id);
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the album owner or admins can invite collaborators.',
      });
    }

    const assignedRole = ['admin', 'contributor', 'viewer'].includes(role)
      ? role
      : 'contributor';

    // Generate secure token
    const token = crypto.randomBytes(24).toString('hex');

    const invite = await Invite.create({
      collectionId,
      email: email ? email.toLowerCase().trim() : '',
      role: assignedRole,
      token,
      invitedBy: req.user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/invite/${token}`;

    console.log(`[Scrapbook Invite] Generated invite for ${email || 'Link Share'} (${assignedRole}): ${inviteLink}`);

    return res.status(201).json({
      success: true,
      message: `Invite generated successfully for ${email || 'share link'}.`,
      data: {
        inviteId: invite._id,
        token: invite.token,
        inviteLink,
        role: invite.role,
        email: invite.email,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current collaborators and pending invites for an album
// @route   GET /api/collections/:id/collaborators
// @access  Private (Owner/Admin)
export const getCollaborators = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;

    const collection = await Collection.findById(collectionId)
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl');

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const userRole = getUserRole(collection, req.user._id);
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the album owner or admins can view collaborator management.',
      });
    }

    const pendingInvites = await Invite.find({
      collectionId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        owner: collection.ownerId,
        collaborators: collection.collaborators,
        pendingInvites,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a collaborator's role
// @route   PATCH /api/collections/:id/collaborators/:userId
// @access  Private (Owner/Admin)
export const updateCollaboratorRole = async (req, res, next) => {
  try {
    const { id: collectionId, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'contributor', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const userRole = getUserRole(collection, req.user._id);
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the album owner or admins can change collaborator roles.',
      });
    }

    // Cannot change owner role
    if (collection.ownerId.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Cannot modify owner role' });
    }

    const collaboratorIndex = collection.collaborators.findIndex(
      (c) => c.userId.toString() === userId
    );

    if (collaboratorIndex === -1) {
      return res.status(404).json({ success: false, message: 'Collaborator not found in this album' });
    }

    collection.collaborators[collaboratorIndex].role = role;
    await collection.save();

    return res.status(200).json({
      success: true,
      message: 'Collaborator role updated successfully.',
      collaborators: collection.collaborators,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a collaborator from an album
// @route   DELETE /api/collections/:id/collaborators/:userId
// @access  Private (Owner/Admin)
export const removeCollaborator = async (req, res, next) => {
  try {
    const { id: collectionId, userId } = req.params;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const userRole = getUserRole(collection, req.user._id);
    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the album owner or admins can remove collaborators.',
      });
    }

    collection.collaborators = collection.collaborators.filter(
      (c) => c.userId.toString() !== userId
    );

    await collection.save();

    return res.status(200).json({
      success: true,
      message: 'Collaborator removed from album.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate an invite token and retrieve collection preview
// @route   GET /api/invites/:token
// @access  Public
export const validateInvite = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .populate('collectionId', 'title description theme coverStyle ownerId')
      .populate('invitedBy', 'name avatarUrl');

    if (!invite || !invite.collectionId) {
      return res.status(404).json({
        success: false,
        message: 'This invitation link is invalid or has expired.',
      });
    }

    const owner = await User.findById(invite.collectionId.ownerId).select('name avatarUrl');

    return res.status(200).json({
      success: true,
      data: {
        role: invite.role,
        email: invite.email,
        expiresAt: invite.expiresAt,
        collection: {
          _id: invite.collectionId._id,
          title: invite.collectionId.title,
          description: invite.collectionId.description,
          theme: invite.collectionId.theme,
          coverStyle: invite.collectionId.coverStyle,
          owner,
        },
        invitedBy: invite.invitedBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an invite token and join album
// @route   POST /api/invites/:token/accept
// @access  Private
export const acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'This invitation link is invalid or has expired.',
      });
    }

    const collection = await Collection.findById(invite.collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Target collection not found' });
    }

    // Check if user is already owner or collaborator
    const isOwner = collection.ownerId.toString() === req.user._id.toString();
    const existingIndex = collection.collaborators.findIndex(
      (c) => c.userId.toString() === req.user._id.toString()
    );

    if (!isOwner) {
      if (existingIndex !== -1) {
        // Upgrade role if new role is higher
        collection.collaborators[existingIndex].role = invite.role;
      } else {
        collection.collaborators.push({
          userId: req.user._id,
          role: invite.role,
          invitedAt: new Date(),
        });
      }
      await collection.save();
    }

    // Mark invite accepted
    invite.status = 'accepted';
    await invite.save();

    return res.status(200).json({
      success: true,
      message: `You have joined "${collection.title}" as ${invite.role}!`,
      collectionId: collection._id,
    });
  } catch (error) {
    next(error);
  }
};
