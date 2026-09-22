import { Collection } from '../models/Collection.js';

// Helper to determine user's role on a collection
export const getUserRole = (collection, userId) => {
  if (!userId || !collection) return null;
  const uId = userId.toString();

  if (collection.ownerId._id ? collection.ownerId._id.toString() === uId : collection.ownerId.toString() === uId) {
    return 'owner';
  }

  const collaborator = collection.collaborators.find(
    (c) => c.userId._id ? c.userId._id.toString() === uId : c.userId.toString() === uId
  );

  return collaborator ? collaborator.role : null;
};

// Middleware to verify user can view collection
export const requireViewPermission = async (req, res, next) => {
  try {
    const collectionId = req.params.id || req.body.collectionId;
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const role = getUserRole(collection, req.user._id);
    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this collection.',
      });
    }

    req.collection = collection;
    req.userRole = role;
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to verify user can contribute (owner, admin, or contributor)
export const requireContributePermission = async (req, res, next) => {
  try {
    const collectionId = req.params.id || req.body.collectionId;
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const role = getUserRole(collection, req.user._id);
    if (!role || role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You have read-only access. Contributors and Admins can add items.',
      });
    }

    req.collection = collection;
    req.userRole = role;
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to verify user is owner or admin
export const requireAdminPermission = async (req, res, next) => {
  try {
    const collectionId = req.params.id || req.body.collectionId;
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const role = getUserRole(collection, req.user._id);
    if (role !== 'owner' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the owner or album admins can perform this action.',
      });
    }

    req.collection = collection;
    req.userRole = role;
    next();
  } catch (err) {
    next(err);
  }
};
