import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
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
    action: {
      type: String,
      enum: [
        'added_item',
        'added_note',
        'added_sticky',
        'reacted',
        'joined_collection',
        'commented',
      ],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      emoji: { type: String, default: '' },
      caption: { type: String, default: '' },
      itemType: { type: String, default: '' },
      userName: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ collectionId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
