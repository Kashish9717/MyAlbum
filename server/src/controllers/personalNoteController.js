import { PersonalNote } from '../models/PersonalNote.js';

// @desc    Get all personal notes for current user
// @route   GET /api/personal-notes
// @access  Private
export const getPersonalNotes = async (req, res, next) => {
  try {
    const notes = await PersonalNote.find({ userId: req.user._id })
      .sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new personal note
// @route   POST /api/personal-notes
// @access  Private
export const createPersonalNote = async (req, res, next) => {
  try {
    const { title, content, moodEmoji, tags, color, isPinned, isFavorite } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot be empty',
      });
    }

    const note = await PersonalNote.create({
      userId: req.user._id,
      title: title ? title.trim() : '',
      content: content.trim(),
      moodEmoji: moodEmoji || '✨',
      tags: Array.isArray(tags) ? tags : [],
      color: color || 'lemon',
      isPinned: Boolean(isPinned),
      isFavorite: Boolean(isFavorite),
    });

    return res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a personal note
// @route   PATCH /api/personal-notes/:id
// @access  Private
export const updatePersonalNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await PersonalNote.findOne({ _id: id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const { title, content, moodEmoji, tags, color, isPinned, isFavorite } = req.body;

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Content cannot be empty',
        });
      }
      note.content = content.trim();
    }
    if (moodEmoji !== undefined) note.moodEmoji = moodEmoji;
    if (tags !== undefined) note.tags = Array.isArray(tags) ? tags : note.tags;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
    if (isFavorite !== undefined) note.isFavorite = Boolean(isFavorite);

    await note.save();

    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a personal note
// @route   DELETE /api/personal-notes/:id
// @access  Private
export const deletePersonalNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await PersonalNote.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
