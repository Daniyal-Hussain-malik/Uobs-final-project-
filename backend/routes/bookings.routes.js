const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool, query } = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Multer storage for bank transfer receipts
const uploadDir = path.join(__dirname, '../uploads/slips');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and PDF receipts are allowed.'));
    }
  },
});

// Helper for pricing
function calculateStayPricing(basePrice, seasons, checkInStr, checkOutStr) {
  const start = new Date(checkInStr);
  const end = new Date(checkOutStr);

  const daily_breakdown = [];
  let current = new Date(start);
  let total = 0;

  while (current < end) {
    const formatted = current.toISOString().split('T')[0];
    let appliedPrice = parseFloat(basePrice);
    let appliedSeason = null;

    if (seasons && seasons.length > 0) {
      for (const s of seasons) {
        if (formatted >= s.start_date && formatted <= s.end_date) {
          appliedPrice = parseFloat(s.price_per_night);
          appliedSeason = s.season_name;
          break;
        }
      }
    }

    daily_breakdown.push({ date: formatted, price: appliedPrice, season: appliedSeason });
    total += appliedPrice;
    current.setDate(current.getDate() + 1);
  }

  const nights = daily_breakdown.length;
  return {
    total_nights: Math.max(1, nights),
    total_room_price: total,
    daily_breakdown,
  };
}

// 1. Get Add-On Services
router.get('/addons', async (req, res) => {
  try {
    const addons = await query('SELECT * FROM add_on_services WHERE is_available = 1 ORDER BY price ASC');
    res.json({ success: true, addons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load addon services.' });
  }
});

// 2. Validate Promo Code
router.post('/validate-promo', async (req, res) => {
  try {
    const code = (req.body.code || '').trim().toUpperCase();
    const subtotal = parseFloat(req.body.subtotal || 0);

    if (!code) {
      return res.status(422).json({ valid: false, message: 'Please enter a promo code.' });
    }

    const offers = await query('SELECT * FROM offers WHERE code = ?', [code]);
    if (offers.length === 0) {
      return res.status(404).json({ valid: false, message: 'Invalid promo code.' });
    }

    const offer = offers[0];
    const today = new Date().toISOString().split('T')[0];

    if (!offer.is_active) {
      return res.status(422).json({ valid: false, message: 'This promo code is currently inactive.' });
    }
    if (today > offer.valid_until) {
      return res.status(422).json({ valid: false, message: 'This promo code has expired.' });
    }
    if (subtotal < parseFloat(offer.min_spend)) {
      return res.status(422).json({
        valid: false,
        message: `Minimum spend of PKR ${parseInt(offer.min_spend).toLocaleString()} required.`,
      });
    }
    if (offer.usage_limit && offer.used_count >= offer.usage_limit) {
      return res.status(422).json({ valid: false, message: 'Promo code usage limit has been reached.' });
    }

    let discount = 0;
    if (offer.discount_type === 'percentage') {
      discount = Math.round((subtotal * parseFloat(offer.discount_value)) / 100);
    } else {
      discount = Math.min(subtotal, parseFloat(offer.discount_value));
    }

    res.json({
      valid: true,
      offer_id: offer.id,
      code: offer.code,
      title: offer.title,
      discount_amount: discount,
      formatted_discount: `PKR ${discount.toLocaleString()}`,
    });
  } catch (err) {
    console.error('Promo validation error:', err);
    res.status(500).json({ valid: false, message: 'Server error validating promo code.' });
  }
});

// 3. Create Reservation (with concurrency availability check)
router.post('/', optionalAuth, upload.single('payment_slip'), async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const {
      room_id,
      check_in,
      check_out,
      adults = 1,
      children = 0,
      rooms_count = 1,
      guest_name,
      guest_email,
      guest_phone,
      guest_cnic_passport = '',
      special_requests = '',
      promo_code = '',
      payment_method = 'pay_at_hotel',
      payment_transaction_id = '',
    } = req.body;

    // Addons parsing
    let addons = [];
    if (req.body.addons) {
      try {
        addons = typeof req.body.addons === 'string' ? JSON.parse(req.body.addons) : req.body.addons;
      } catch (e) {
        addons = [];
      }
    }

    if (!room_id || !check_in || !check_out || !guest_name || !guest_email || !guest_phone) {
      return res.status(422).json({ success: false, message: 'Please fill in all required booking information.' });
    }

    await conn.beginTransaction();

    // Lock and check room availability
    const [rooms] = await conn.query('SELECT * FROM rooms WHERE id = ? FOR UPDATE', [room_id]);
    if (rooms.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Selected room not found.' });
    }
    const room = rooms[0];

    const [conflicts] = await conn.query(
      `SELECT id FROM bookings
       WHERE room_id = ? AND booking_status != 'cancelled'
       AND (check_in < ? AND check_out > ?)`,
      [room_id, check_out, check_in]
    );

    if (conflicts.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'This room was just booked for the selected dates. Please select alternative dates or a different villa.',
      });
    }

    // Check category inventory limit
    const numberOfRooms = Math.max(1, parseInt(rooms_count || req.body.rooms || 1, 10));
    const [catRows] = await conn.query('SELECT total_rooms FROM room_categories WHERE name = ?', [room.category]);
    const maxAvailableRooms = (catRows && catRows[0] && catRows[0].total_rooms) ? catRows[0].total_rooms : 4;

    if (numberOfRooms > maxAvailableRooms) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Only ${maxAvailableRooms} rooms are available in the '${room.category}' category. You requested ${numberOfRooms} rooms. Please select an additional room from another category to book extra rooms.`,
      });
    }

    // Calculate stay price (multiplied by number of rooms)
    const [seasons] = await conn.query('SELECT * FROM room_seasonal_prices WHERE room_id = ?', [room_id]);
    const pricing = calculateStayPricing(room.base_price, seasons, check_in, check_out);
    const baseRoomTotal = pricing.total_room_price * numberOfRooms;
    const totalNights = pricing.total_nights;

    // Calculate addons
    let addOnsTotal = 0;
    const validAddonsToInsert = [];
    if (addons.length > 0) {
      for (const item of addons) {
        const [serviceRows] = await conn.query('SELECT * FROM add_on_services WHERE id = ? AND is_available = 1', [item.id]);
        if (serviceRows.length > 0) {
          const service = serviceRows[0];
          const qty = parseInt(item.quantity, 10) || 1;
          const lineTotal = parseFloat(service.price) * qty;
          addOnsTotal += lineTotal;
          validAddonsToInsert.push({
            add_on_id: service.id,
            quantity: qty,
            unit_price: service.price,
            total_price: lineTotal,
          });
        }
      }
    }

    // Calculate Promo Discount
    let discountAmount = 0;
    let offerId = null;
    if (promo_code) {
      const [offerRows] = await conn.query(
        'SELECT * FROM offers WHERE code = ? AND is_active = 1',
        [promo_code.trim().toUpperCase()]
      );
      if (offerRows.length > 0) {
        const offer = offerRows[0];
        const subtotal = baseRoomTotal + addOnsTotal;
        if (subtotal >= parseFloat(offer.min_spend)) {
          offerId = offer.id;
          if (offer.discount_type === 'percentage') {
            discountAmount = Math.round((subtotal * parseFloat(offer.discount_value)) / 100);
          } else {
            discountAmount = Math.min(subtotal, parseFloat(offer.discount_value));
          }
          await conn.query('UPDATE offers SET used_count = used_count + 1 WHERE id = ?', [offer.id]);
        }
      }
    }

    const finalTotal = Math.max(0, baseRoomTotal + addOnsTotal - discountAmount);
    const bookingNumber = `OAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentSlipPath = req.file ? `uploads/slips/${req.file.filename}` : null;
    let paymentStatus = 'pending';
    if (payment_method === 'jazzcash' || payment_method === 'easypaisa') {
      paymentStatus = payment_transaction_id ? 'paid' : 'pending';
    } else if (payment_method === 'bank_transfer' && paymentSlipPath) {
      paymentStatus = 'verified';
    }

    const userId = req.user ? req.user.id : null;

    const [bookingResult] = await conn.query(
      `INSERT INTO bookings (
        booking_number, user_id, room_id, guest_name, guest_email, guest_phone,
        guest_cnic_passport, check_in, check_out, total_nights, adults, children, rooms_count,
        base_room_total, add_ons_total, discount_amount, offer_id, final_total,
        payment_method, payment_status, payment_slip_path, payment_transaction_id,
        booking_status, special_requests, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`,
      [
        bookingNumber, userId, room_id, guest_name, guest_email, guest_phone,
        guest_cnic_passport, check_in, check_out, totalNights, adults, children, numberOfRooms,
        baseRoomTotal, addOnsTotal, discountAmount, offerId, finalTotal,
        payment_method, paymentStatus, paymentSlipPath, payment_transaction_id,
        special_requests, 'Online web reservation'
      ]
    );

    const bookingId = bookingResult.insertId;

    // Insert addons
    for (const addonItem of validAddonsToInsert) {
      await conn.query(
        'INSERT INTO booking_add_ons (booking_id, add_on_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [bookingId, addonItem.add_on_id, addonItem.quantity, addonItem.unit_price, addonItem.total_price]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed! An email voucher confirmation has been prepared.',
      booking_number: bookingNumber,
      booking_id: bookingId,
    });
  } catch (err) {
    await conn.rollback();
    console.error('Booking creation error:', err);
    res.status(500).json({ success: false, message: 'Failed to process booking. ' + err.message });
  } finally {
    conn.release();
  }
});

// 4. View Booking Confirmation by Booking Number
router.get('/:bookingNumber', async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const bookings = await query(
      `SELECT b.*, r.title as room_title, r.category as room_category, r.featured_image as room_image,
              r.view_type as room_view
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.booking_number = ?`,
      [bookingNumber]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation voucher not found.' });
    }

    const booking = bookings[0];
    const addons = await query(
      `SELECT ba.*, a.title, a.category, a.pricing_unit
       FROM booking_add_ons ba
       JOIN add_on_services a ON ba.add_on_id = a.id
       WHERE ba.booking_id = ?`,
      [booking.id]
    );

    res.json({
      success: true,
      booking,
      addons,
    });
  } catch (err) {
    console.error('Fetch confirmation error:', err);
    res.status(500).json({ success: false, message: 'Failed to load booking details.' });
  }
});

module.exports = router;
