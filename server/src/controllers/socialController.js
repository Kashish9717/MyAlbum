import { Reaction } from '../models/Reaction.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Comment } from '../models/Comment.js';
import { MediaItem } from '../models/MediaItem.js';
import { Collection } from '../models/Collection.js';
import { getUserRole } from '../middleware/checkRole.js';

// @desc    Toggle a reaction on a media/note item
// @route   POST /api/items/:id/reactions
// @access  Private
export const toggleReaction = async (req, res, next) => {
  try {
    const { id: itemId } = req.params;
    const { emoji } = req.body;

    if (!['heart', 'star', 'aww', 'laugh', 'fire'].includes(emoji)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction emoji' });
    }

    const item = await MediaItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const collection = await Collection.findById(item.collectionId);
    const userRole = getUserRole(collection, req.user._id);
    if (!userRole) {
      return res.status(403).json({ success: false, message: 'Not authorized to react' });
    }

    const existing = await Reaction.findOne({
      itemId,
      userId: req.user._id,
      emoji,
    });

    let actionTaken = 'added';

    if (existing) {
      await Reaction.findByIdAndDelete(existing._id);
      actionTaken = 'removed';
    } else {
      await Reaction.create({
        itemId,
        collectionId: item.collectionId,
        userId: req.user._id,
        emoji,
      });

      // Log activity on new reaction
      await ActivityLog.create({
        collectionId: item.collectionId,
        userId: req.user._id,
        action: 'reacted',
        targetId: item._id,
        metadata: {
          emoji,
          caption: item.caption || (item.type === 'note' ? 'a note' : 'a photo'),
          userName: req.user.name,
        },
      });
    }

    // Return updated reaction summary for this item
    const allItemReactions = await Reaction.find({ itemId });
    const counts = {};
    const userReactions = [];

    allItemReactions.forEach((r) => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      if (r.userId.toString() === req.user._id.toString()) {
        userReactions.push(r.emoji);
      }
    });

    return res.status(200).json({
      success: true,
      action: actionTaken,
      itemId,
      counts,
      userReactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reactions for a collection grouped by item
// @route   GET /api/collections/:id/reactions
// @access  Private
export const getReactionsByCollection = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;

    const reactions = await Reaction.find({ collectionId });

    // Group by itemId -> { counts: { heart: 2, star: 1 }, userReactions: ['heart'] }
    const grouped = {};

    reactions.forEach((r) => {
      const itId = r.itemId.toString();
      if (!grouped[itId]) {
        grouped[itId] = { counts: {}, userReactions: [] };
      }
      grouped[itId].counts[r.emoji] = (grouped[itId].counts[r.emoji] || 0) + 1;
      if (r.userId.toString() === req.user._id.toString()) {
        grouped[itId].userReactions.push(r.emoji);
      }
    });

    return res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated activity feed for a collection
// @route   GET /api/collections/:id/activity
// @access  Private
export const getActivityFeed = async (req, res, next) => {
  try {
    const { id: collectionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const [activities, total] = await Promise.all([
      ActivityLog.find({ collectionId })
        .populate('userId', 'name avatarUrl email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments({ collectionId }),
    ]);

    return res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to an item
// @route   POST /api/items/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { id: itemId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const item = await MediaItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const comment = await Comment.create({
      itemId,
      collectionId: item.collectionId,
      userId: req.user._id,
      text: text.trim(),
    });

    // Log comment activity
    await ActivityLog.create({
      collectionId: item.collectionId,
      userId: req.user._id,
      action: 'commented',
      targetId: item._id,
      metadata: {
        caption: item.caption || (item.type === 'note' ? 'a note' : 'a photo'),
        userName: req.user.name,
      },
    });

    const populated = await Comment.findById(comment._id).populate(
      'userId',
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

// @desc    Get all comments for an item
// @route   GET /api/items/:id/comments
// @access  Private
export const getCommentsByItem = async (req, res, next) => {
  try {
    const { id: itemId } = req.params;

    const comments = await Comment.find({ itemId })
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};
