import { StickyNote } from '../models/StickyNote.js';
import { Collection } from '../models/Collection.js';
import { MediaItem } from '../models/MediaItem.js';
import { getUserRole } from '../middleware/checkRole.js';

const getRandomRotation = () => {
  return Math.round((Math.random() * 12 - 6) * 10) / 10;
};

// @desc    Create a sticky note
// @route   POST /api/collections/:id/notes
// @access  Private (Owner, Admin, Contributor)
export const createStickyNote = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;
    const { itemId, color, text, position, rotation } = req.body;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found.',
      });
    }

    const userRole = getUserRole(collection, req.user._id);
    if (!userRole || userRole === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You have read-only access. Contributors and Admins can add sticky notes.',
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Sticky note text cannot be empty.',
      });
    }

    if (itemId) {
      const item = await MediaItem.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Target media item not found.',
        });
      }
    }

    const note = await StickyNote.create({
      collectionId,
      itemId: itemId || null,
      color: color || 'yellow',
      text: text.trim(),
      position: position || { x: 20, y: 20 },
      rotation: rotation !== undefined ? rotation : getRandomRotation(),
      authorId: req.user._id,
    });

    const populated = await StickyNote.findById(note._id).populate(
      'authorId',
      'name avatarUrl'
    );

    return res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sticky notes for a collection
// @route   GET /api/collections/:id/notes
// @access  Private
export const getStickyNotesByCollection = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;

    const collection = await Collection.findById(collectionId);
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

    const notes = await StickyNote.find({ collectionId })
      .populate('authorId', 'name avatarUrl')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sticky note (text, position, rotation, color)
// @route   PATCH /api/notes/:id
// @access  Private
export const updateStickyNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, position, rotation, color } = req.body;

    const note = await StickyNote.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found.',
      });
    }

    const collection = await Collection.findById(note.collectionId);
    const userRole = getUserRole(collection, req.user._id);
    const isAuthor = note.authorId.toString() === req.user._id.toString();

    // Owner, admin, or author can update
    if (userRole !== 'owner' && userRole !== 'admin' && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this sticky note.',
      });
    }

    if (text !== undefined) {
      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Text cannot be empty.',
        });
      }
      note.text = text.trim();
    }

    if (position !== undefined) note.position = position;
    if (rotation !== undefined) note.rotation = rotation;
    if (color !== undefined) note.color = color;

    await note.save();

    const updated = await StickyNote.findById(id).populate(
      'authorId',
      'name avatarUrl'
    );

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sticky note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteStickyNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await StickyNote.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Sticky note not found.',
      });
    }

    const collection = await Collection.findById(note.collectionId);
    const userRole = getUserRole(collection, req.user._id);
    const isAuthor = note.authorId.toString() === req.user._id.toString();

    // Owner, admin, or author can delete
    if (userRole !== 'owner' && userRole !== 'admin' && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this sticky note.',
      });
    }

    await StickyNote.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Sticky note deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
