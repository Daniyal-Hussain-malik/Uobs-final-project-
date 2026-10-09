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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const fs = require('fs');

// Static uploads directory (supports custom UPLOAD_DIR via env)
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

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
