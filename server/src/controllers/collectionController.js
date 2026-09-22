import { Collection } from '../models/Collection.js';
import { getUserRole } from '../middleware/checkRole.js';

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
export const createCollection = async (req, res, next) => {
  try {
    const { title, description, coverStyle, theme } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a collection title.',
      });
    }

    const collection = await Collection.create({
      title: title.trim(),
      description: description?.trim() || '',
      ownerId: req.user._id,
      coverStyle: coverStyle || {},
      theme: theme || 'default',
      collaborators: [],
    });

    const populatedCollection = await Collection.findById(collection._id).populate(
      'ownerId',
      'name email avatarUrl'
    );

    return res.status(201).json({
      success: true,
      data: populatedCollection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all collections for current user (owned + shared)
// @route   GET /api/collections
// @access  Private
export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({
      $or: [{ ownerId: req.user._id }, { 'collaborators.userId': req.user._id }],
    })
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl')
      .sort({ updatedAt: -1 });

    const formatted = collections.map((col) => {
      const userRole = getUserRole(col, req.user._id);
      return {
        ...col.toObject(),
        userRole,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single collection details
// @route   GET /api/collections/:id
// @access  Private
export const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id)
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl');

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.',
      });
    }

    const userRole = getUserRole(collection, req.user._id);

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this collection.',
      });
    }

    return res.status(200).json({
      success: true,
      data: collection,
      userRole,
      isOwner: userRole === 'owner',
      canAdmin: userRole === 'owner' || userRole === 'admin',
      canContribute: ['owner', 'admin', 'contributor'].includes(userRole),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update collection (title, description, coverStyle, theme)
// @route   PATCH /api/collections/:id
// @access  Private (Owner or Admin)
export const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, coverStyle, theme } = req.body;

    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.',
      });
    }

    const userRole = getUserRole(collection, req.user._id);

    if (userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the owner or album admins can modify collection settings.',
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty.',
        });
      }
      collection.title = title.trim();
    }

    if (description !== undefined) {
      collection.description = description.trim();
    }

    if (coverStyle !== undefined) {
      collection.coverStyle = {
        ...collection.coverStyle,
        ...coverStyle,
      };
    }

    if (theme !== undefined) {
      collection.theme = theme;
    }

    await collection.save();

    const updated = await Collection.findById(id)
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.userId', 'name email avatarUrl');

    return res.status(200).json({
      success: true,
      data: updated,
      userRole,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private (Owner only)
export const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.',
      });
    }

    // Owner only authorization check
    if (collection.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this collection.',
      });
    }

    await Collection.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Collection deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
