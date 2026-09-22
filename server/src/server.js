import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import personalNoteRoutes from './routes/personalNoteRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Essential Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images/videos
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, postman, curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.some((allowed) => allowed.trim().replace(/\/+$/, '') === origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive origin with credentials support
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Static folder for media uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Base Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Digital Scrapbook Gallery API',
    timestamp: new Date(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api', mediaRoutes);
app.use('/api', noteRoutes);
app.use('/api', inviteRoutes);
app.use('/api', socialRoutes);
app.use('/api/personal-notes', personalNoteRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`[Scrapbook Server] running on http://localhost:${PORT}`);
});
