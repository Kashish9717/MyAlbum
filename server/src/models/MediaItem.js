import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'note'],
      required: true,
    },
    url: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
    },
    caption: {
      type: String,
      default: '',
      maxlength: [300, 'Caption cannot exceed 300 characters'],
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    rotation: {
      type: Number,
      default: 0, // In degrees (e.g. -4 to 4)
    },
    tapeStyle: {
      corner: { type: String, enum: ['top-left', 'top-right', 'top-center', 'none'], default: 'top-center' },
      color: { type: String, default: 'pink' }, // 'pink', 'yellow', 'blue', 'green', 'lavender'
    },
    noteStyle: {
      paperColor: { type: String, default: '#FAF6ED' }, // For text notes
      fontStyle: { type: String, default: 'handwriting' }, // 'handwriting' | 'sans'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mediaItemSchema.index({ collectionId: 1, createdAt: 1 });

export const MediaItem = mongoose.model('MediaItem', mediaItemSchema);
