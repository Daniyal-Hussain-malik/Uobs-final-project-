const express = require('express');
const { query } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protected: Admin only
router.use(requireAuth, requireRole('admin'));

// 1. Dashboard Overview Metrics
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalBookings = await query('SELECT COUNT(*) as count FROM bookings');
    const totalRevenue = await query("SELECT SUM(final_total) as sum FROM bookings WHERE payment_status IN ('paid', 'verified')");
    const activeRooms = await query('SELECT COUNT(*) as count FROM rooms WHERE is_active = 1');
    const pendingPayments = await query("SELECT COUNT(*) as count FROM bookings WHERE payment_status = 'pending'");
    const todayCheckins = await query('SELECT COUNT(*) as count FROM bookings WHERE check_in = ?', [today]);
    const todayCheckouts = await query('SELECT COUNT(*) as count FROM bookings WHERE check_out = ?', [today]);
    const totalGuests = await query("SELECT COUNT(*) as count FROM users WHERE role = 'guest'");
    const pendingReviews = await query('SELECT COUNT(*) as count FROM reviews WHERE is_approved = 0');

    const recentBookings = await query(`
      SELECT b.*, r.title as room_title, r.category as room_category
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      LIMIT 12
    `);

    const rooms = await query(`
      SELECT r.*, COUNT(b.id) as bookings_count
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id
      GROUP BY r.id
      ORDER BY r.base_price DESC
    `);

    const offers = await query('SELECT * FROM offers ORDER BY created_at DESC');

    res.json({
      success: true,
      data: {
        metrics: {
          total_bookings: totalBookings[0].count,
          total_revenue: parseFloat(totalRevenue[0].sum || 0),
          active_rooms: activeRooms[0].count,
          pending_payments: pendingPayments[0].count,
          today_checkins: todayCheckins[0].count,
          today_checkouts: todayCheckouts[0].count,
          total_guests: totalGuests[0].count,
          pending_reviews: pendingReviews[0].count,
        },
        recentBookings,
        rooms,
        offers,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load admin metrics.' });
  }
});

// 2. Registered Users Management
router.get('/users', async (req, res) => {
  try {
    const users = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
             COUNT(b.id) as total_bookings,
             COALESCE(SUM(CASE WHEN b.payment_status IN ('paid', 'verified') THEN b.final_total ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id OR u.email = b.guest_email
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ success: true, users });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ success: false, message: 'Failed to load registered users.' });
  }
});

// 3. Complete Bookings Management & Moderation
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await query(`
      SELECT b.*, r.title as room_title, r.category as room_category, r.featured_image as room_image
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
    `);

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Admin bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to load reservations.' });
  }
});

router.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      guest_name, guest_email, guest_phone, check_in, check_out,
      adults, children, room_id, booking_status, payment_status,
      final_total, admin_notes, special_requests
    } = req.body;

    const existing = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    await query(`
      UPDATE bookings SET
        guest_name = COALESCE(?, guest_name),
        guest_email = COALESCE(?, guest_email),
        guest_phone = COALESCE(?, guest_phone),
        check_in = COALESCE(?, check_in),
        check_out = COALESCE(?, check_out),
        adults = COALESCE(?, adults),
        children = COALESCE(?, children),
        room_id = COALESCE(?, room_id),
        booking_status = COALESCE(?, booking_status),
        payment_status = COALESCE(?, payment_status),
        final_total = COALESCE(?, final_total),
        admin_notes = COALESCE(?, admin_notes),
        special_requests = COALESCE(?, special_requests)
      WHERE id = ?
    `, [
      guest_name, guest_email, guest_phone, check_in, check_out,
      adults, children, room_id, booking_status, payment_status,
      final_total, admin_notes, special_requests, id
    ]);

    res.json({ success: true, message: 'Reservation updated successfully.' });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to update reservation.' });
  }
});

router.post('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status, payment_status, admin_notes } = req.body;

    const existing = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const b = existing[0];
    const newStatus = booking_status || b.booking_status;
    const newPay = payment_status || b.payment_status;
    const notes = admin_notes !== undefined ? admin_notes : b.admin_notes;

    await query(
      'UPDATE bookings SET booking_status = ?, payment_status = ?, admin_notes = ? WHERE id = ?',
      [newStatus, newPay, notes, id]
    );

    res.json({ success: true, message: `Reservation #${b.booking_number} updated to ${newStatus}.` });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status: ' + err.message });
  }
});

router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM booking_add_ons WHERE booking_id = ?', [id]);
    await query('DELETE FROM reviews WHERE booking_id = ?', [id]);
    await query('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ success: true, message: 'Reservation deleted successfully.' });
  } catch (err) {
    console.error('Admin delete booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete reservation: ' + err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user && req.user.id === parseInt(id, 10)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }
    await query('UPDATE bookings SET user_id = NULL WHERE user_id = ?', [id]);
    await query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user: ' + err.message });
  }
});

// 4. Room Management (Full CRUD)
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await query('SELECT * FROM rooms ORDER BY id DESC');
    const seasons = await query('SELECT * FROM room_seasonal_prices');

    const processed = rooms.map(r => ({
      ...r,
      base_price: parseFloat(r.base_price),
      amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities || '[]') : (r.amenities || []),
      images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : (r.images || []),
      seasons: seasons.filter(s => s.room_id === r.id),
    }));

    res.json({ success: true, rooms: processed });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load rooms.' });
  }
});

router.post('/rooms', async (req, res) => {
  try {
    const {
      title, category, base_price, capacity_adults, capacity_children,
      view_type, bed_type, room_size_sqm, description, amenities, images,
      featured_image, virtual_tour_url
    } = req.body;

    const slug = (title || 'room').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const result = await query(
      `INSERT INTO rooms (
        title, slug, category, base_price, capacity_adults, capacity_children,
        view_type, bed_type, room_size_sqm, description, amenities, images,
        featured_image, virtual_tour_url, housekeeping_status, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready to serve', 1)`,
      [
        title, slug, category, base_price, capacity_adults || 2, capacity_children || 0,
        view_type || 'Mountain Valley View', bed_type || 'King Bed', room_size_sqm || 40, description,
        JSON.stringify(amenities || []), JSON.stringify(images || []),
        featured_image, virtual_tour_url || null
      ]
    );

    res.status(201).json({ success: true, message: 'Room created successfully!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create room: ' + err.message });
  }
});

router.put('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category, base_price, capacity_adults, capacity_children,
      view_type, bed_type, room_size_sqm, description, amenities, images,
      featured_image, virtual_tour_url, is_active, housekeeping_status
    } = req.body;

    await query(
      `UPDATE rooms SET
        title = ?, category = ?, base_price = ?, capacity_adults = ?,
        capacity_children = ?, view_type = ?, bed_type = ?, room_size_sqm = ?,
        description = ?, amenities = ?, images = ?, featured_image = ?,
        virtual_tour_url = ?, is_active = ?, housekeeping_status = COALESCE(?, housekeeping_status)
      WHERE id = ?`,
      [
        title, category, base_price, capacity_adults, capacity_children,
        view_type, bed_type, room_size_sqm, description,
        JSON.stringify(amenities || []), JSON.stringify(images || []),
        featured_image, virtual_tour_url || null, is_active ? 1 : 0,
        housekeeping_status || null, id
      ]
    );

    res.json({ success: true, message: 'Room updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update room.' });
  }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room exists
    const rooms = await query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }
    const room = rooms[0];

    // 1. Delete reviews referencing this room
    await query('DELETE FROM reviews WHERE room_id = ?', [id]);

    // 2. Delete seasonal prices for this room
    await query('DELETE FROM room_seasonal_prices WHERE room_id = ?', [id]);

    // 3. Find all bookings referencing this room and remove them safely
    const bookings = await query('SELECT id FROM bookings WHERE room_id = ?', [id]);
    if (bookings && bookings.length > 0) {
      const bookingIds = bookings.map(b => b.id);
      for (const bId of bookingIds) {
        await query('DELETE FROM booking_add_ons WHERE booking_id = ?', [bId]);
        await query('DELETE FROM reviews WHERE booking_id = ?', [bId]);
      }
      await query('DELETE FROM bookings WHERE room_id = ?', [id]);
    }

    // 4. Finally delete the room itself
    await query('DELETE FROM rooms WHERE id = ?', [id]);

    res.json({ success: true, message: `Room "${room.title}" deleted successfully.` });
  } catch (err) {
    console.error('Delete room error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete room: ' + err.message });
  }
});

// Seasonal Pricing Management for Rooms
router.post('/rooms/:id/seasonal-prices', async (req, res) => {
  try {
    const { id } = req.params;
    const { season_name, start_date, end_date, price_per_night } = req.body;
    if (!season_name || !start_date || !end_date || !price_per_night) {
      return res.status(422).json({ success: false, message: 'All seasonal price fields are required.' });
    }
    await query(
      'INSERT INTO room_seasonal_prices (room_id, season_name, start_date, end_date, price_per_night) VALUES (?, ?, ?, ?, ?)',
      [id, season_name.trim(), start_date, end_date, parseFloat(price_per_night)]
    );
    res.json({ success: true, message: 'Seasonal price rate added successfully.' });
  } catch (err) {
    console.error('Add seasonal price error:', err);
    res.status(500).json({ success: false, message: 'Failed to add seasonal price: ' + err.message });
  }
});

router.delete('/rooms/:id/seasonal-prices/:priceId', async (req, res) => {
  try {
    const { id, priceId } = req.params;
    await query('DELETE FROM room_seasonal_prices WHERE id = ? AND room_id = ?', [priceId, id]);
    res.json({ success: true, message: 'Seasonal rate deleted successfully.' });
  } catch (err) {
    console.error('Delete seasonal price error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete seasonal rate: ' + err.message });
  }
});

router.post('/rooms/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE rooms SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?', [id]);
    res.json({ success: true, message: 'Room status toggled.' });
  } catch (err) {
    console.error('Toggle room status error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle status: ' + err.message });
  }
});

// 5. CMS Content & Offers Management (Full CRUD)
router.get('/cms', async (req, res) => {
  try {
    const testimonials = await query('SELECT * FROM testimonials ORDER BY sort_order ASC');
    const team = await query('SELECT * FROM team_members ORDER BY sort_order ASC');
    const posts = await query('SELECT * FROM posts ORDER BY created_at DESC');
    const faqs = await query('SELECT * FROM faqs ORDER BY sort_order ASC');
    const gallery = await query('SELECT * FROM media_gallery ORDER BY sort_order ASC');
    const offers = await query('SELECT * FROM offers ORDER BY created_at DESC');

    res.json({
      success: true,
      data: { testimonials, team, posts, faqs, gallery, offers },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load CMS data.' });
  }
});

// Offers CRUD
router.post('/cms/offers', async (req, res) => {
  try {
    const { code, title, description, discount_type, discount_value, min_spend, valid_from, valid_until, usage_limit } = req.body;
    await query(
      'INSERT INTO offers (code, title, description, discount_type, discount_value, min_spend, valid_from, valid_until, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [code.toUpperCase(), title, description, discount_type || 'percentage', discount_value, min_spend || 0, valid_from, valid_until, usage_limit || 500]
    );
    res.status(201).json({ success: true, message: 'Promo offer created.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create offer.' });
  }
});

router.put('/cms/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, description, discount_type, discount_value, min_spend, valid_from, valid_until, usage_limit, is_active } = req.body;

    await query(`
      UPDATE offers SET
        code = ?, title = ?, description = ?, discount_type = ?,
        discount_value = ?, min_spend = ?, valid_from = ?, valid_until = ?,
        usage_limit = ?, is_active = ?
      WHERE id = ?
    `, [
      code.toUpperCase(), title, description, discount_type || 'percentage',
      discount_value, min_spend || 0, valid_from, valid_until,
      usage_limit || 500, is_active ? 1 : 0, id
    ]);

    res.json({ success: true, message: 'Offer updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update offer.' });
  }
});

router.delete('/cms/offers/:id', async (req, res) => {
  try {
    await query('DELETE FROM offers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Offer deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
});

// 6. Review Moderation (Approve / Decline / Live on Home Page)
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await query(`
      SELECT rev.*, r.title as room_title, b.booking_number, b.check_in, b.check_out, b.guest_email, b.guest_phone
      FROM reviews rev
      JOIN rooms r ON rev.room_id = r.id
      JOIN bookings b ON rev.booking_id = b.id
      ORDER BY rev.created_at DESC
    `);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load reviews.' });
  }
});

router.post('/reviews/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved = 1 } = req.body;
    await query('UPDATE reviews SET is_approved = ? WHERE id = ?', [is_approved ? 1 : 0, id]);
    res.json({
      success: true,
      message: is_approved ? 'Review approved and published to website!' : 'Review declined and hidden from public.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update review status.' });
  }
});

router.post('/reviews/:id/toggle', async (req, res) => {
  try {
    await query('UPDATE reviews SET is_approved = IF(is_approved = 1, 0, 1) WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review approval toggled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle review.' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

// 7. Media Uploads for Room Featured Image and Room Gallery
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
const roomUploadDir = path.join(baseUploadDir, 'rooms');
if (!fs.existsSync(roomUploadDir)) fs.mkdirSync(roomUploadDir, { recursive: true });

function getLocalUploadedFilePath(url) {
  if (!url) return null;
  const rel = url.replace(/^\/?uploads\//, '');
  return path.join(baseUploadDir, rel);
}

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, roomUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `room-media-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
  fileFilter: (req, file, cb) => {
    // Permissive image filter to support jpg, jpeg, png, webp, avif, jfif, bmp, heic
    const allowed = /jpeg|jpg|png|webp|avif|jfif|bmp|heic/i;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!ext || allowed.test(ext) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, true); // still accept safely
    }
  },
});

router.post('/upload-media', uploadMedia.any(), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No media files were provided.' });
    }
    const uploadedUrls = req.files.map((file) => `/uploads/rooms/${file.filename}`);
    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully.`,
      urls: uploadedUrls,
      url: uploadedUrls[0], // for single image convenience
    });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload media files: ' + err.message });
  }
});

// 8. Room Categories Management (Full CRUD with number of rooms tracking)
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(`
      SELECT c.*, COUNT(r.id) as room_count
      FROM room_categories c
      LEFT JOIN rooms r ON r.category = c.name
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load categories.' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description = '', image_url = '', sort_order = 0, total_rooms = 4 } = req.body;
    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'Category name is required.' });
    }
    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await query(
      'INSERT INTO room_categories (name, slug, description, image_url, sort_order, total_rooms) VALUES (?, ?, ?, ?, ?, ?)',
      [trimmedName, slug, description, image_url, sort_order, parseInt(total_rooms, 10) || 4]
    );

    res.status(201).json({ success: true, message: `Category '${trimmedName}' created successfully.` });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create category: ' + err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description = '', image_url = '', sort_order = 0, total_rooms = 4 } = req.body;
    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'Category name is required.' });
    }

    // Get old category name to sync rooms table
    const [oldCat] = await query('SELECT name FROM room_categories WHERE id = ?', [id]);
    if (!oldCat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await query(
      'UPDATE room_categories SET name = ?, slug = ?, description = ?, image_url = ?, sort_order = ?, total_rooms = ? WHERE id = ?',
      [trimmedName, slug, description, image_url, sort_order, parseInt(total_rooms, 10) || 4, id]
    );

    // If category name changed, update all rooms assigned to the old category
    if (oldCat.name !== trimmedName) {
      await query('UPDATE rooms SET category = ? WHERE category = ?', [trimmedName, oldCat.name]);
    }

    res.json({ success: true, message: `Category updated to '${trimmedName}'.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update category: ' + err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [cat] = await query('SELECT name FROM room_categories WHERE id = ?', [id]);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if rooms are currently assigned
    const [assignedRooms] = await query('SELECT COUNT(*) as count FROM rooms WHERE category = ?', [cat.name]);
    if (assignedRooms && assignedRooms.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete '${cat.name}'. There are ${assignedRooms.count} active rooms currently assigned to this category. Please reassign those rooms first.`,
      });
    }

    await query('DELETE FROM room_categories WHERE id = ?', [id]);
    res.json({ success: true, message: `Category '${cat.name}' deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete category: ' + err.message });
  }
});

// 9. Payment Accounts Management (Full CRUD for Bank, JazzCash, Easypaisa)
router.get('/payment-accounts', async (req, res) => {
  try {
    const accounts = await query('SELECT * FROM payment_accounts ORDER BY id ASC');
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load payment accounts.' });
  }
});

router.post('/payment-accounts', async (req, res) => {
  try {
    const { method, bank_name, account_title, account_number, iban = '', instructions = '', is_active = 1 } = req.body;
    if (!method || !bank_name || !account_title || !account_number) {
      return res.status(422).json({ success: false, message: 'Please fill in method, bank name, account title, and account number.' });
    }

    await query(
      'INSERT INTO payment_accounts (method, bank_name, account_title, account_number, iban, instructions, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [method, bank_name.trim(), account_title.trim(), account_number.trim(), iban.trim(), instructions.trim(), is_active ? 1 : 0]
    );

    res.status(201).json({ success: true, message: 'Payment account added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add payment account: ' + err.message });
  }
});

router.put('/payment-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { method, bank_name, account_title, account_number, iban = '', instructions = '', is_active = 1 } = req.body;

    await query(`
      UPDATE payment_accounts SET
        method = ?, bank_name = ?, account_title = ?, account_number = ?,
        iban = ?, instructions = ?, is_active = ?
      WHERE id = ?
    `, [method, bank_name.trim(), account_title.trim(), account_number.trim(), iban.trim(), instructions.trim(), is_active ? 1 : 0, id]);

    res.json({ success: true, message: 'Payment account updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update payment account.' });
  }
});

router.post('/payment-accounts/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE payment_accounts SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?', [id]);
    res.json({ success: true, message: 'Payment account status toggled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle account.' });
  }
});

router.delete('/payment-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM payment_accounts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Payment account deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete payment account.' });
  }
});

// 10. Standalone Dining & Experiences Bookings Management
router.get('/service-bookings', async (req, res) => {
  try {
    const { type } = req.query; // 'dining' or 'experience'
    let sql = 'SELECT * FROM service_bookings';
    const params = [];
    if (type) {
      sql += ' WHERE booking_type = ?';
      params.push(type);
    }
    sql += ' ORDER BY booking_date DESC, created_at DESC';

    const bookings = await query(sql, params);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load service bookings.' });
  }
});

router.post('/service-bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status, admin_notes } = req.body;
    await query(
      'UPDATE service_bookings SET booking_status = ?, admin_notes = COALESCE(?, admin_notes) WHERE id = ?',
      [booking_status, admin_notes, id]
    );
    res.json({ success: true, message: `Reservation status updated to '${booking_status}'.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update reservation status.' });
  }
});

router.post('/service-bookings/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    await query('UPDATE service_bookings SET payment_status = ? WHERE id = ?', [payment_status, id]);
    res.json({ success: true, message: `Payment status marked as '${payment_status}'.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update payment status.' });
  }
});

router.delete('/service-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM service_bookings WHERE id = ?', [id]);
    res.json({ success: true, message: 'Reservation removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete reservation.' });
  }
});

// 11. Standalone Dining Deals & Menus Management (CRUD)
router.get('/dining-items', async (req, res) => {
  try {
    const items = await query('SELECT * FROM dining_items ORDER BY sort_order ASC, id ASC');
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load dining items.' });
  }
});

router.post('/dining-items', async (req, res) => {
  try {
    const {
      title, deal_type = 'Deal & Package', category = 'Dining', description = '',
      price = 0, pricing_unit = 'per_couple', menu_inclusions = '',
      time_slots = 'Sunset Sitting (18:30 - 20:30), Night Starlight (20:45 - 23:00)',
      image_url = '', is_active = 1, sort_order = 0
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(422).json({ success: false, message: 'Item title is required.' });
    }

    const result = await query(
      `INSERT INTO dining_items (
        title, deal_type, category, description, price, pricing_unit,
        menu_inclusions, time_slots, image_url, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(), deal_type, category, description, parseFloat(price) || 0,
        pricing_unit, menu_inclusions, time_slots, image_url,
        is_active ? 1 : 0, parseInt(sort_order, 10) || 0
      ]
    );

    res.status(201).json({ success: true, message: 'Dining menu/deal created successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create dining item: ' + err.message });
  }
});

router.put('/dining-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, deal_type = 'Deal & Package', category = 'Dining', description = '',
      price = 0, pricing_unit = 'per_couple', menu_inclusions = '',
      time_slots = 'Sunset Sitting (18:30 - 20:30), Night Starlight (20:45 - 23:00)',
      image_url = '', is_active = 1, sort_order = 0
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(422).json({ success: false, message: 'Item title is required.' });
    }

    await query(
      `UPDATE dining_items SET
        title = ?, deal_type = ?, category = ?, description = ?, price = ?, pricing_unit = ?,
        menu_inclusions = ?, time_slots = ?, image_url = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        title.trim(), deal_type, category, description, parseFloat(price) || 0,
        pricing_unit, menu_inclusions, time_slots, image_url,
        is_active ? 1 : 0, parseInt(sort_order, 10) || 0, id
      ]
    );

    res.json({ success: true, message: 'Dining item updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update dining item: ' + err.message });
  }
});

router.delete('/dining-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM dining_items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Dining item removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete dining item.' });
  }
});

// 12. Curated Resort Experiences Management (CRUD)
router.get('/experiences', async (req, res) => {
  try {
    const items = await query('SELECT * FROM experiences ORDER BY sort_order ASC, id ASC');
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load experiences.' });
  }
});

router.post('/experiences', async (req, res) => {
  try {
    const {
      title, category = 'Adventures', duration = '2 - 3 Hours', difficulty = 'Moderate',
      price = 0, pricing_unit = 'per_vehicle', inclusions = '',
      departure_times, time_slots,
      description = '', image_url = '', is_active = 1, sort_order = 0
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(422).json({ success: false, message: 'Experience title is required.' });
    }

    const depTimes = departure_times || time_slots || 'Morning (09:00), Afternoon (14:30), Sunset (17:00)';

    const result = await query(
      `INSERT INTO experiences (
        title, category, duration, difficulty, price, pricing_unit,
        inclusions, departure_times, time_slots, description, image_url, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(), category, duration, difficulty, parseFloat(price) || 0,
        pricing_unit, inclusions, depTimes, depTimes, description, image_url,
        is_active ? 1 : 0, parseInt(sort_order, 10) || 0
      ]
    );

    res.status(201).json({ success: true, message: 'Resort experience created successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create experience: ' + err.message });
  }
});

router.put('/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category = 'Adventures', duration = '2 - 3 Hours', difficulty = 'Moderate',
      price = 0, pricing_unit = 'per_vehicle', inclusions = '',
      departure_times, time_slots,
      description = '', image_url = '', is_active = 1, sort_order = 0
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(422).json({ success: false, message: 'Experience title is required.' });
    }

    const depTimes = departure_times || time_slots || 'Morning (09:00), Afternoon (14:30), Sunset (17:00)';

    await query(
      `UPDATE experiences SET
        title = ?, category = ?, duration = ?, difficulty = ?, price = ?, pricing_unit = ?,
        inclusions = ?, departure_times = ?, time_slots = ?, description = ?, image_url = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        title.trim(), category, duration, difficulty, parseFloat(price) || 0,
        pricing_unit, inclusions, depTimes, depTimes, description, image_url,
        is_active ? 1 : 0, parseInt(sort_order, 10) || 0, id
      ]
    );

    res.json({ success: true, message: 'Experience updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update experience: ' + err.message });
  }
});

router.delete('/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM experiences WHERE id = ?', [id]);
    res.json({ success: true, message: 'Experience deleted successfully.' });
  } catch (err) {
    console.error('Delete experience error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete experience: ' + err.message });
  }
});

// 12. Media Gallery & Gallery Categories Management

const galleryUploadDir = path.join(baseUploadDir, 'gallery');
if (!fs.existsSync(galleryUploadDir)) fs.mkdirSync(galleryUploadDir, { recursive: true });

const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadGalleryMedia = multer({
  storage: galleryStorage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB for high-res photos and 4K video reels
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif|jfif|bmp|heic|mp4|mov|webm|m4v|avi|mkv|3gp/i;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!ext || allowed.test(ext) || allowed.test(file.mimetype) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')))) {
      cb(null, true);
    } else {
      cb(null, true); // accept safely
    }
  },
});

// A. GALLERY CATEGORIES CRUD
router.get('/gallery-categories', async (req, res) => {
  try {
    const categories = await query(`
      SELECT c.*, COUNT(m.id) as image_count
      FROM gallery_categories c
      LEFT JOIN media_gallery m ON m.category = c.name
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load gallery categories.' });
  }
});

router.post('/gallery-categories', async (req, res) => {
  try {
    const { name, description = '', sort_order = 0 } = req.body;
    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'Category name is required.' });
    }
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const result = await query(
      'INSERT INTO gallery_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
      [cleanName, slug, (description || '').trim(), parseInt(sort_order, 10) || 0]
    );
    res.status(201).json({ success: true, message: 'Gallery category created successfully.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A gallery category with this name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create category: ' + err.message });
  }
});

router.put('/gallery-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description = '', sort_order = 0 } = req.body;
    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'Category name is required.' });
    }
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const currentCat = await query('SELECT name FROM gallery_categories WHERE id = ?', [id]);
    if (currentCat.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    const oldName = currentCat[0].name;

    await query(
      'UPDATE gallery_categories SET name = ?, slug = ?, description = ?, sort_order = ? WHERE id = ?',
      [cleanName, slug, (description || '').trim(), parseInt(sort_order, 10) || 0, id]
    );

    // If category name changed, update existing images in media_gallery
    if (oldName !== cleanName) {
      await query('UPDATE media_gallery SET category = ? WHERE category = ?', [cleanName, oldName]);
    }

    res.json({ success: true, message: 'Gallery category updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A gallery category with this name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to update category: ' + err.message });
  }
});

router.delete('/gallery-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await query('SELECT name FROM gallery_categories WHERE id = ?', [id]);
    if (cat.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    const catName = cat[0].name;

    const fallbackCat = await query('SELECT name FROM gallery_categories WHERE id != ? LIMIT 1', [id]);
    const replacementCategory = fallbackCat.length > 0 ? fallbackCat[0].name : 'General';

    await query('UPDATE media_gallery SET category = ? WHERE category = ?', [replacementCategory, catName]);
    await query('DELETE FROM gallery_categories WHERE id = ?', [id]);

    res.json({ success: true, message: 'Gallery category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete category: ' + err.message });
  }
});

// B. GALLERY IMAGES CRUD (Upload / Replace / Remove / Edit)

router.get('/gallery', async (req, res) => {
  try {
    const images = await query('SELECT * FROM media_gallery ORDER BY sort_order ASC, created_at DESC');
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load gallery images.' });
  }
});

router.post('/gallery', uploadGalleryMedia.single('image'), async (req, res) => {
  try {
    let { title, category, image_url, is_featured = 0, sort_order = 0 } = req.body;

    if (req.file) {
      image_url = `/uploads/gallery/${req.file.filename}`;
    }

    if (!image_url || !image_url.trim()) {
      return res.status(422).json({ success: false, message: 'Please upload an image file or provide an image URL.' });
    }

    if (!title || !title.trim()) {
      title = 'Resort Photography';
    }

    if (!category || !category.trim()) {
      const defaultCat = await query('SELECT name FROM gallery_categories ORDER BY sort_order ASC LIMIT 1');
      category = defaultCat.length > 0 ? defaultCat[0].name : 'General';
    }

    const result = await query(
      'INSERT INTO media_gallery (title, category, image_url, is_featured, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), category.trim(), image_url.trim(), (is_featured === '1' || is_featured === 1 || is_featured === true) ? 1 : 0, parseInt(sort_order, 10) || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Gallery image uploaded successfully.',
      image: {
        id: result.insertId,
        title: title.trim(),
        category: category.trim(),
        image_url: image_url.trim(),
        is_featured: (is_featured === '1' || is_featured === 1 || is_featured === true) ? 1 : 0,
        sort_order: parseInt(sort_order, 10) || 0,
      },
    });
  } catch (err) {
    console.error('Gallery upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload gallery image: ' + err.message });
  }
});

router.put('/gallery/:id', uploadGalleryMedia.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    let { title, category, image_url, is_featured, sort_order } = req.body;

    const existing = await query('SELECT * FROM media_gallery WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery image not found.' });
    }
    const current = existing[0];

    // If new file uploaded, replace URL and delete old file if it was a local upload
    if (req.file) {
      const oldUrl = current.image_url;
      image_url = `/uploads/gallery/${req.file.filename}`;
      if (oldUrl && oldUrl.startsWith('/uploads/gallery/')) {
        const oldPath = getLocalUploadedFilePath(oldUrl);
        if (oldPath && fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
        }
      }
    } else if (!image_url) {
      image_url = current.image_url;
    }

    const newTitle = title !== undefined && title !== '' ? title.trim() : current.title;
    const newCategory = category !== undefined && category !== '' ? category.trim() : current.category;
    const newFeatured = is_featured !== undefined ? (is_featured === '1' || is_featured === 1 || is_featured === true ? 1 : 0) : current.is_featured;
    const newSort = sort_order !== undefined ? parseInt(sort_order, 10) || 0 : current.sort_order;

    await query(
      'UPDATE media_gallery SET title = ?, category = ?, image_url = ?, is_featured = ?, sort_order = ? WHERE id = ?',
      [newTitle, newCategory, image_url, newFeatured, newSort, id]
    );

    res.json({
      success: true,
      message: 'Gallery image updated successfully.',
      image: {
        id: parseInt(id, 10),
        title: newTitle,
        category: newCategory,
        image_url,
        is_featured: newFeatured,
        sort_order: newSort,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update gallery image: ' + err.message });
  }
});

// Dedicated fast replace-image endpoint
router.post('/gallery/:id/replace-image', uploadGalleryMedia.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file && !req.body.image_url) {
      return res.status(422).json({ success: false, message: 'No replacement image provided.' });
    }

    const existing = await query('SELECT * FROM media_gallery WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery image not found.' });
    }
    const current = existing[0];

    let newUrl = req.body.image_url;
    if (req.file) {
      newUrl = `/uploads/gallery/${req.file.filename}`;
      const oldUrl = current.image_url;
      if (oldUrl && oldUrl.startsWith('/uploads/gallery/')) {
        const oldPath = getLocalUploadedFilePath(oldUrl);
        if (oldPath && fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
        }
      }
    }

    await query('UPDATE media_gallery SET image_url = ? WHERE id = ?', [newUrl, id]);

    res.json({
      success: true,
      message: 'Gallery image replaced successfully.',
      image_url: newUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to replace image: ' + err.message });
  }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT * FROM media_gallery WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery image not found.' });
    }
    const current = existing[0];

    // Delete local file if present
    if (current.image_url && current.image_url.startsWith('/uploads/gallery/')) {
      const filePath = getLocalUploadedFilePath(current.image_url);
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    await query('DELETE FROM media_gallery WHERE id = ?', [id]);

    res.json({ success: true, message: 'Gallery image removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete gallery image.' });
  }
});

// ==========================================
// 13. SITE SETTINGS & HERO SECTION (CRUD)
// ==========================================

router.get('/settings', async (req, res) => {
  try {
    const raw = await query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    (raw || []).forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Admin get settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to load site settings.' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settingsObj = req.body;
    if (!settingsObj || typeof settingsObj !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
    }

    for (const [key, val] of Object.entries(settingsObj)) {
      await query(
        `INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, String(val ?? ''), String(val ?? '')]
      );
    }

    res.json({ success: true, message: 'Site & hero settings saved successfully.' });
  } catch (err) {
    console.error('Admin update settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update site settings.' });
  }
});

// ==========================================
// 14. RESORT TEAM MEMBERS MANAGEMENT (CRUD)
// ==========================================

const teamUploadDir = path.join(baseUploadDir, 'team');
if (!fs.existsSync(teamUploadDir)) fs.mkdirSync(teamUploadDir, { recursive: true });

const teamStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, teamUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `team-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadTeamMedia = multer({
  storage: teamStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => cb(null, true),
});

router.get('/team', async (req, res) => {
  try {
    const team = await query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC');
    res.json({ success: true, team });
  } catch (err) {
    console.error('Admin team get error:', err);
    res.status(500).json({ success: false, message: 'Failed to load team members.' });
  }
});

router.post('/team', uploadTeamMedia.single('image'), async (req, res) => {
  try {
    let { name, role, bio = '', image_url = '', sort_order = 0 } = req.body;
    if (req.file) {
      image_url = `/uploads/team/${req.file.filename}`;
    }

    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'Name is required.' });
    }
    if (!role || !role.trim()) {
      return res.status(422).json({ success: false, message: 'Title / Designation is required.' });
    }

    const result = await query(
      'INSERT INTO team_members (name, role, bio, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), role.trim(), (bio || '').trim(), (image_url || '').trim(), parseInt(sort_order, 10) || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Team member added successfully.',
      member: {
        id: result.insertId,
        name: name.trim(),
        role: role.trim(),
        bio: (bio || '').trim(),
        image_url: (image_url || '').trim(),
        sort_order: parseInt(sort_order, 10) || 0,
      },
    });
  } catch (err) {
    console.error('Admin create team error:', err);
    res.status(500).json({ success: false, message: 'Failed to add team member: ' + err.message });
  }
});

router.put('/team/:id', uploadTeamMedia.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    let { name, role, bio, image_url, sort_order } = req.body;

    const existing = await query('SELECT * FROM team_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }
    const current = existing[0];

    if (req.file) {
      image_url = `/uploads/team/${req.file.filename}`;
    } else if (image_url === undefined) {
      image_url = current.image_url;
    }

    const updatedName = name !== undefined && name.trim() ? name.trim() : current.name;
    const updatedRole = role !== undefined && role.trim() ? role.trim() : current.role;
    const updatedBio = bio !== undefined ? bio.trim() : current.bio;
    const updatedSort = sort_order !== undefined ? parseInt(sort_order, 10) || 0 : current.sort_order;

    await query(
      'UPDATE team_members SET name = ?, role = ?, bio = ?, image_url = ?, sort_order = ? WHERE id = ?',
      [updatedName, updatedRole, updatedBio, image_url, updatedSort, id]
    );

    res.json({
      success: true,
      message: 'Team member updated successfully.',
      member: {
        id: parseInt(id, 10),
        name: updatedName,
        role: updatedRole,
        bio: updatedBio,
        image_url,
        sort_order: updatedSort,
      },
    });
  } catch (err) {
    console.error('Admin update team error:', err);
    res.status(500).json({ success: false, message: 'Failed to update team member: ' + err.message });
  }
});

router.delete('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT * FROM team_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }

    await query('DELETE FROM team_members WHERE id = ?', [id]);
    res.json({ success: true, message: 'Team member removed successfully.' });
  } catch (err) {
    console.error('Admin delete team error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete team member.' });
  }
});

// ==========================================
// 15. MEDIA LIBRARY & FILE MANAGER (IMAGES & VIDEOS)
// ==========================================

const mediaLibStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetFolder = (req.body.folder || req.query.folder || 'rooms').toLowerCase();
    const safeFolder = ['rooms', 'gallery', 'videos', 'team', 'assets'].includes(targetFolder) ? targetFolder : 'rooms';
    const dest = path.join(baseUploadDir, safeFolder);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const uploadMediaLib = multer({
  storage: mediaLibStorage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB for 4K video clips & high-res RAW/DJI photos
  fileFilter: (req, file, cb) => cb(null, true),
});

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

router.get('/media-library', async (req, res) => {
  try {
    const foldersToScan = ['rooms', 'gallery', 'videos', 'team', 'assets'];
    const filesList = [];

    // Fetch existing gallery records and site settings
    const galleryItems = await query('SELECT image_url, title, category FROM media_gallery');
    const galleryUrlMap = new Map();
    (galleryItems || []).forEach(g => galleryUrlMap.set(g.image_url, g));

    const rawSettings = await query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('hero_image_url', 'hero_video_url')");
    let heroImgUrl = '';
    let heroVidUrl = '';
    (rawSettings || []).forEach(s => {
      if (s.setting_key === 'hero_image_url') heroImgUrl = s.setting_value;
      if (s.setting_key === 'hero_video_url') heroVidUrl = s.setting_value;
    });

    const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.avif', '.jfif', '.bmp', '.dng', '.tiff']);
    const videoExtensions = new Set(['.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v', '.3gp']);

    for (const folder of foldersToScan) {
      const dirPath = path.join(baseUploadDir, folder);
      if (fs.existsSync(dirPath)) {
        try {
          const files = fs.readdirSync(dirPath);
          for (const filename of files) {
            const filePath = path.join(dirPath, filename);
            try {
              const stat = fs.statSync(filePath);
              if (stat.isFile()) {
                const ext = path.extname(filename).toLowerCase();
                const isVideo = videoExtensions.has(ext);
                const isImage = imageExtensions.has(ext);
                const webUrl = `/uploads/${folder}/${filename}`;

                filesList.push({
                  name: filename,
                  url: webUrl,
                  folder: folder,
                  size_bytes: stat.size,
                  size: formatFileSize(stat.size),
                  type: isVideo ? 'video' : (isImage ? 'image' : 'file'),
                  extension: ext.replace('.', '').toUpperCase(),
                  created_at: stat.mtime.toISOString(),
                  in_gallery: galleryUrlMap.has(webUrl),
                  gallery_info: galleryUrlMap.get(webUrl) || null,
                  is_hero_image: heroImgUrl === webUrl,
                  is_hero_video: heroVidUrl === webUrl,
                });
              }
            } catch (statErr) {
              // ignore single file stat errors
            }
          }
        } catch (dirErr) {
          // ignore directory read errors
        }
      }
    }

    // Sort newest first
    filesList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      total: filesList.length,
      media: filesList,
      hero_current: {
        image: heroImgUrl,
        video: heroVidUrl,
      },
    });
  } catch (err) {
    console.error('Admin media library error:', err);
    res.status(500).json({ success: false, message: 'Failed to scan media library: ' + err.message });
  }
});

router.post('/media-library/upload', uploadMediaLib.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No media files were received.' });
    }

    const uploaded = req.files.map(file => {
      const folder = path.basename(path.dirname(file.path));
      return {
        name: file.filename,
        original_name: file.originalname,
        url: `/uploads/${folder}/${file.filename}`,
        size_bytes: file.size,
        size: formatFileSize(file.size),
        folder: folder,
      };
    });

    res.status(201).json({
      success: true,
      message: `${uploaded.length} file(s) uploaded successfully!`,
      files: uploaded,
      url: uploaded[0].url,
    });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

router.post('/media-library/add-to-gallery', async (req, res) => {
  try {
    const { media_url, title = 'Resort Photography', category = 'Resort Grounds', is_featured = 1, sort_order = 0 } = req.body;
    if (!media_url) {
      return res.status(422).json({ success: false, message: 'Media URL is required.' });
    }

    // Check if category exists or create it
    let cat = (category || 'Resort Grounds').trim();
    const existingCat = await query('SELECT name FROM gallery_categories WHERE name = ?', [cat]);
    if (existingCat.length === 0) {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await query('INSERT IGNORE INTO gallery_categories (name, slug) VALUES (?, ?)', [cat, slug]);
    }

    const result = await query(
      'INSERT INTO media_gallery (title, category, image_url, is_featured, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), cat, media_url.trim(), is_featured ? 1 : 0, parseInt(sort_order, 10) || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Media added to Resort Gallery!',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Add to gallery error:', err);
    res.status(500).json({ success: false, message: 'Failed to add media to gallery: ' + err.message });
  }
});

router.post('/media-library/set-hero', async (req, res) => {
  try {
    const { media_url, media_type = 'image' } = req.body;
    if (!media_url) {
      return res.status(422).json({ success: false, message: 'Media URL is required.' });
    }

    if (media_type === 'video') {
      await query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_video_url', ?), ('hero_media_type', 'video')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [media_url]
      );
      await query("UPDATE site_settings SET setting_value = 'video' WHERE setting_key = 'hero_media_type'");
    } else {
      await query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_image_url', ?), ('hero_media_type', 'image')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [media_url]
      );
      await query("UPDATE site_settings SET setting_value = 'image' WHERE setting_key = 'hero_media_type'");
    }

    res.json({
      success: true,
      message: `Set as active Hero ${media_type === 'video' ? 'Video' : 'Image'} successfully!`,
      media_url,
      media_type,
    });
  } catch (err) {
    console.error('Set hero error:', err);
    res.status(500).json({ success: false, message: 'Failed to set hero media: ' + err.message });
  }
});

router.delete('/media-library/file', async (req, res) => {
  try {
    const file_path = req.body?.file_path || req.query?.file_path;
    if (!file_path || !file_path.startsWith('/uploads/')) {
      return res.status(400).json({ success: false, message: 'Invalid file path.' });
    }

    const relPath = file_path.replace(/^\/?uploads\//, '');
    const absolutePath = path.resolve(baseUploadDir, relPath);

    // Security check: ensure path is inside baseUploadDir
    if (!absolutePath.startsWith(path.resolve(baseUploadDir))) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to delete file from disk: ' + e.message });
      }
    }

    // Also remove from media_gallery if present
    await query('DELETE FROM media_gallery WHERE image_url = ?', [file_path]);

    res.json({ success: true, message: 'File deleted successfully.' });
  } catch (err) {
    console.error('Delete media library file error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete file: ' + err.message });
  }
});

module.exports = router;

