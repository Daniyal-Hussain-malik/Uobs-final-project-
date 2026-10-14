const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth.routes');
const roomsRoutes = require('./routes/rooms.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const publicRoutes = require('./routes/public.routes');
const guestRoutes = require('./routes/guest.routes');
const receptionRoutes = require('./routes/reception.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares - Dynamic CORS based on FRONTEND_URL environment variable
const allowedOrigins = process.env.FRONTEND_URL
  ? (process.env.FRONTEND_URL === '*' ? '*' : process.env.FRONTEND_URL.split(',').map((u) => u.trim()))
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(morgan('dev'));

const fs = require('fs');

// Candidate static uploads directories (supports Hostinger root, backend, and public folders)
const candidateUploadDirs = [
  process.env.UPLOAD_DIR,
  path.join(__dirname, 'uploads'),
  path.join(__dirname, '../uploads'),
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'backend/uploads'),
  path.join(__dirname, 'public/uploads'),
  path.join(process.cwd(), 'backend/public/uploads'),
  path.join(__dirname, '../frontend/dist/uploads'),
  path.join(__dirname, '../frontend/public/uploads'),
].filter(Boolean);

// Ensure base upload subdirectories exist across active roots
const baseUploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
['rooms', 'gallery', 'assets', 'team', 'slips', 'videos'].forEach((sub) => {
  const p1 = path.join(baseUploadDir, sub);
  if (!fs.existsSync(p1)) fs.mkdirSync(p1, { recursive: true });
  const p2 = path.join(__dirname, '../uploads', sub);
  if (!fs.existsSync(p2)) {
    try { fs.mkdirSync(p2, { recursive: true }); } catch (e) {}
  }
});

// Mount all existing candidate directories under /uploads
candidateUploadDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    app.use('/uploads', express.static(dir, {
      maxAge: '7d',
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    }));
  }
});

// Smart fallback handler for /uploads to locate files across subfolders or provide resort fallbacks
app.get('/uploads/*', (req, res, next) => {
  const reqSubPath = req.params[0] || '';
  const cleanSubPath = reqSubPath.replace(/^\/+/, '');
  const requestedFilename = path.basename(cleanSubPath);
  const ext = path.extname(requestedFilename).toLowerCase();

  const subFolders = ['', 'rooms', 'gallery', 'assets', 'team', 'slips', 'videos'];
  for (const baseDir of candidateUploadDirs) {
    if (!fs.existsSync(baseDir)) continue;
    const exactPath = path.join(baseDir, cleanSubPath);
    if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
      return res.sendFile(exactPath);
    }
    for (const sub of subFolders) {
      const searchPath = path.join(baseDir, sub, requestedFilename);
      if (fs.existsSync(searchPath) && fs.statSync(searchPath).isFile()) {
        return res.sendFile(searchPath);
      }
    }
  }

  // Graceful fallback for missing video reels
  if (['.mp4', '.mov', '.webm', '.m4v'].includes(ext)) {
    for (const baseDir of candidateUploadDirs) {
      const fallbackVid = path.join(baseDir, 'rooms/fbac89b9f17e4ef5939dde3f37a7110d.mp4');
      if (fs.existsSync(fallbackVid)) {
        return res.sendFile(fallbackVid);
      }
    }
  }

  // Graceful fallback for missing photos
  if (['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) {
    for (const baseDir of candidateUploadDirs) {
      const fallbackImg = path.join(baseDir, 'rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG');
      if (fs.existsSync(fallbackImg)) {
        return res.sendFile(fallbackImg);
      }
      const fallbackImg2 = path.join(baseDir, 'rooms/IMG_1402.jpg');
      if (fs.existsSync(fallbackImg2)) {
        return res.sendFile(fallbackImg2);
      }
    }
  }

  next();
});

// Serve Frontend Production Build if present (Hostinger Fullstack / Monorepo deployment)
const candidateStaticDirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '../frontend/dist'),
  path.join(process.cwd(), 'backend/public'),
  path.join(process.cwd(), 'public'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../public_html'),
];
const staticDir = candidateStaticDirs.find((dir) => fs.existsSync(dir));

if (staticDir) {
  app.use(express.static(staticDir));
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'OASIS Resort Skardu REST API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/admin', adminRoutes);

// Frontend SPA Fallback (React Router client-side routing support for Hostinger)
if (staticDir) {
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File size exceeds maximum allowed upload limit (300MB).',
    });
  }
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Auto-Initialize Database
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🏔️  OASIS RESORT SKARDU - BACKEND API SERVER RUNNING`);
  console.log(`📍  URL: http://localhost:${PORT}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);

  // Initialize DB tables and seed data if MySQL is active
  await initDatabase();
});
