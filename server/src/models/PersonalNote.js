import mongoose from 'mongoose';

const personalNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
    moodEmoji: {
      type: String,
      default: '✨',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    color: {
      type: String,
      enum: ['lemon', 'peach', 'mint', 'lavender', 'sky', 'rose', 'kraft'],
      default: 'lemon',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const PersonalNote = mongoose.model('PersonalNote', personalNoteSchema);
