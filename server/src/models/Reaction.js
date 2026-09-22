import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MediaItem',
      required: true,
      index: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emoji: {
      type: String,
      enum: ['heart', 'star', 'aww', 'laugh', 'fire'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint so a user can only have one reaction of a specific emoji per item
reactionSchema.index({ itemId: 1, userId: 1, emoji: 1 }, { unique: true });

export const Reaction = mongoose.model('Reaction', reactionSchema);
