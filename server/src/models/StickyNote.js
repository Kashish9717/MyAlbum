import mongoose from 'mongoose';

const stickyNoteSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MediaItem',
      default: null,
      index: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
      index: true,
    },
    color: {
      type: String,
      enum: ['yellow', 'pink', 'blue', 'green', 'orange'],
      default: 'yellow',
    },
    text: {
      type: String,
      required: [true, 'Sticky note text is required'],
      trim: true,
      maxlength: [300, 'Sticky note cannot exceed 300 characters'],
    },
    position: {
      x: { type: Number, default: 20 },
      y: { type: Number, default: 20 },
    },
    rotation: {
      type: Number,
      default: 0, // deg
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stickyNoteSchema.index({ collectionId: 1, itemId: 1 });

export const StickyNote = mongoose.model('StickyNote', stickyNoteSchema);
