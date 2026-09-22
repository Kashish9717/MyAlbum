import mongoose from 'mongoose';

const collaboratorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'contributor', 'viewer'],
      default: 'viewer',
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const coverStyleSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      default: '#F5EFEB',
    },
    texture: {
      type: String,
      default: 'paper', // 'paper' | 'kraft' | 'linen' | 'leather' | 'dots'
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Collection title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coverStyle: {
      type: coverStyleSchema,
      default: () => ({}),
    },
    theme: {
      type: String,
      enum: ['default', 'travel', 'milestones', 'friends', 'custom'],
      default: 'default',
    },
    collaborators: {
      type: [collaboratorSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index to quickly find user collections
collectionSchema.index({ ownerId: 1, createdAt: -1 });
collectionSchema.index({ 'collaborators.userId': 1 });

export const Collection = mongoose.model('Collection', collectionSchema);
