import { MediaItem } from '../models/MediaItem.js';
import { Collection } from '../models/Collection.js';
import { generatePresignedUploadUrl, isS3Configured } from '../config/s3.js';
import { getUserRole } from '../middleware/checkRole.js';
import path from 'path';

// Seeded rotation calculator from string ID (-4 to 4 degrees)
export const calculateRotation = (seedString) => {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const norm = ((Math.abs(hash) % 800) / 100) - 4.0;
  return Math.round(norm * 10) / 10;
};

// Seeded tape styles
const TAPE_CORNERS = ['top-left', 'top-right', 'top-center', 'top-left', 'top-right'];
const TAPE_COLORS = ['pink', 'yellow', 'blue', 'green', 'lavender'];

export const calculateTapeStyle = (seedString) => {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const corner = TAPE_CORNERS[Math.abs(hash) % TAPE_CORNERS.length];
  const color = TAPE_COLORS[Math.abs(hash >> 3) % TAPE_COLORS.length];
  return { corner, color };
};

// @desc    Generate Presigned URL for AWS S3 upload
// @route   POST /api/media/presigned-url
// @access  Private
export const getPresignedUrl = async (req, res, next) => {
  try {
    const { filename, contentType, collectionId } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Filename and contentType are required.',
      });
    }

    if (!isS3Configured) {
      return res.status(200).json({
        success: true,
        useLocalFallback: true,
        message: 'S3 not configured. Use local direct upload endpoint /api/media/upload.',
      });
    }

    const ext = path.extname(filename);
    const key = `collections/${collectionId || 'general'}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    const { uploadUrl, publicUrl } = await generatePresignedUploadUrl({
      key,
      contentType,
    });

    return res.status(200).json({
      success: true,
      useLocalFallback: false,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload direct file fallback (when S3 is not configured)
// @route   POST /api/media/upload
// @access  Private
export const uploadLocalFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      publicUrl: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new media or note item in a collection
// @route   POST /api/collections/:id/items
// @access  Private (Owner, Admin, Contributor)
export const createItem = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;
    const { type, url, text, caption, position, rotation, noteStyle } = req.body;

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
        message: 'You have read-only access. Contributors and Admins can add items.',
      });
    }

    if (!['image', 'video', 'note'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type. Must be image, video, or note.',
      });
    }

    if (type === 'note' && (!text || !text.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Note text cannot be empty.',
      });
    }

    if ((type === 'image' || type === 'video') && !url) {
      return res.status(400).json({
        success: false,
        message: 'Media URL is required for images and videos.',
      });
    }

    const calculatedRotation =
      rotation !== undefined
        ? rotation
        : calculateRotation(`${Date.now()}-${Math.random()}`);

    const tapeStyle = calculateTapeStyle(`${Date.now()}-${Math.random()}`);

    const item = await MediaItem.create({
      collectionId,
      type,
      url: url || '',
      text: text?.trim() || '',
      caption: caption?.trim() || '',
      position: position || { x: 0, y: 0 },
      rotation: calculatedRotation,
      tapeStyle,
      noteStyle: noteStyle || { paperColor: '#FAF6ED', fontStyle: 'handwriting' },
      addedBy: req.user._id,
    });

    const populated = await MediaItem.findById(item._id).populate(
      'addedBy',
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

// @desc    Get all items for a collection
// @route   GET /api/collections/:id/items
// @access  Private (Owner, Admin, Contributor, Viewer)
export const getItemsByCollection = async (req, res, next) => {
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
        message: 'You do not have permission to view items in this collection.',
      });
    }

    const items = await MediaItem.find({ collectionId })
      .populate('addedBy', 'name avatarUrl')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an item (caption, position, rotation, text)
// @route   PATCH /api/items/:id
// @access  Private
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { caption, position, rotation, text, noteStyle } = req.body;

    const item = await MediaItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const collection = await Collection.findById(item.collectionId);
    const userRole = getUserRole(collection, req.user._id);
    const isItemCreator = item.addedBy.toString() === req.user._id.toString();

    // Owner, admin, or the item creator can modify
    if (userRole !== 'owner' && userRole !== 'admin' && !isItemCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this item.',
      });
    }

    if (caption !== undefined) item.caption = caption.trim();
    if (text !== undefined) item.text = text.trim();
    if (position !== undefined) item.position = position;
    if (rotation !== undefined) item.rotation = rotation;
    if (noteStyle !== undefined) item.noteStyle = { ...item.noteStyle, ...noteStyle };

    await item.save();

    const updated = await MediaItem.findById(id).populate('addedBy', 'name avatarUrl');

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await MediaItem.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const collection = await Collection.findById(item.collectionId);
    const userRole = getUserRole(collection, req.user._id);
    const isItemCreator = item.addedBy.toString() === req.user._id.toString();

    // Owner, admin, or the item creator can delete
    if (userRole !== 'owner' && userRole !== 'admin' && !isItemCreator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this item.',
      });
    }

    await MediaItem.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Item deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
