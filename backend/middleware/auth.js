const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'oasis_resort_skardu_super_secret_jwt_key_2026';

// Middleware to verify JWT token
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const users = await query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = users[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
}

// Optional Auth (for endpoints that can work for both logged in users and guests)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const users = await query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
      if (users.length > 0) {
        req.user = users[0];
      }
    }
  } catch (err) {
    // Ignore errors for optional auth
  }
  next();
}

// Middleware to restrict by roles (e.g., ['admin'], ['admin', 'reception'])
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access forbidden. Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  generateToken,
};
