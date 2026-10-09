const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// File upload setup for slips
const uploadDir = path.join(__dirname, '../uploads/slips');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `guest-slip-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All routes require guest or admin auth
router.use(requireAuth);

// 1. Guest Dashboard - My Stays
router.get('/dashboard', async (req, res) => {
  try {
    const user = req.user;

    const bookings = await query(
      `SELECT b.*, r.title as room_title, r.category as room_category, r.featured_image as room_image,
              rev.id as review_id, rev.rating as review_rating, rev.comment as review_comment
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       LEFT JOIN reviews rev ON b.id = rev.booking_id
       WHERE b.user_id = ? OR b.guest_email = ?
       ORDER BY b.created_at DESC`,
      [user.id, user.email]
    );

    const totalStays = bookings.filter(b => b.booking_status === 'completed').length;
    const upcomingStays = bookings.filter(b => ['pending', 'confirmed'].includes(b.booking_status)).length;

    res.json({
      success: true,
      user,
      bookings,
      metrics: {
        totalStays,
        upcomingStays,
      },
    });
  } catch (err) {
    console.error('Guest dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load guest portal data.' });
  }
});

// 2. Upload Bank Transfer Slip
router.post('/bookings/:id/slip', upload.single('payment_slip'), async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_transaction_id } = req.body;
    const user = req.user;

    const bookings = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const booking = bookings[0];
    if (booking.user_id !== user.id && booking.guest_email !== user.email && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking.' });
    }

    if (!req.file) {
      return res.status(422).json({ success: false, message: 'Please attach a payment receipt file.' });
    }

    const slipPath = `uploads/slips/${req.file.filename}`;

    await query(
      `UPDATE bookings
       SET payment_slip_path = ?, payment_transaction_id = COALESCE(?, payment_transaction_id), payment_status = 'verified'
       WHERE id = ?`,
      [slipPath, payment_transaction_id || null, id]
    );

    res.json({
      success: true,
      message: 'Payment receipt uploaded successfully! Front Desk will verify your slip shortly.',
      payment_slip_path: slipPath,
    });
  } catch (err) {
    console.error('Upload slip error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload receipt slip.' });
  }
});

// 3. Cancel Booking
router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Change of travel plans' } = req.body;
    const user = req.user;

    const bookings = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const booking = bookings[0];
    if (booking.user_id !== user.id && booking.guest_email !== user.email && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking.' });
    }

    if (['checked_in', 'completed', 'cancelled'].includes(booking.booking_status)) {
      return res.status(422).json({ success: false, message: `Reservation cannot be cancelled in its current status (${booking.booking_status}).` });
    }

    const notesAppend = `${booking.admin_notes || ''}\n[${new Date().toISOString()}] Cancelled by guest. Reason: ${reason}`;

    await query(
      'UPDATE bookings SET booking_status = "cancelled", admin_notes = ? WHERE id = ?',
      [notesAppend.trim(), id]
    );

    res.json({
      success: true,
      message: `Reservation #${booking.booking_number} has been cancelled per policy.`,
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel reservation.' });
  }
});

// 4. Submit Verified Review (Strictly for Completed Bookings)
router.post('/bookings/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    const bookings = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const booking = bookings[0];
    if (booking.user_id !== user.id && booking.guest_email !== user.email && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized booking review access.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const canReview = booking.booking_status === 'completed' || (booking.check_out <= today && booking.booking_status !== 'cancelled');

    if (!canReview) {
      return res.status(422).json({
        success: false,
        message: 'Feedback can be submitted on your check-out date or once your stay is marked completed.',
      });
    }

    const existing = await query('SELECT id FROM reviews WHERE booking_id = ?', [id]);
    if (existing.length > 0) {
      return res.status(422).json({ success: false, message: 'You have already submitted feedback for this stay. Thank you!' });
    }

    if (!rating || !comment || comment.length < 5) {
      return res.status(422).json({ success: false, message: 'Please provide a star rating (1-5) and your comments.' });
    }

    await query(
      'INSERT INTO reviews (booking_id, room_id, guest_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, 0)',
      [booking.id, booking.room_id, booking.guest_name, parseInt(rating, 10), comment.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted to management and will be published once approved.',
    });
  } catch (err) {
    console.error('Review submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

module.exports = router;
