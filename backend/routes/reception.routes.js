const express = require('express');
const { query } = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Protected: Reception and Admin only
router.use(requireAuth, requireRole('reception', 'admin'));

// 1. Reception Dashboard View
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const filterDate = req.query.date || today;
    const search = (req.query.q || '').trim();

    let queryBase = `
      SELECT b.*, r.title as room_title, r.category as room_category, r.view_type as room_view, r.housekeeping_status
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
    `;
    const searchParams = [];

    if (search) {
      queryBase += ` WHERE (b.booking_number LIKE ? OR b.guest_name LIKE ? OR b.guest_phone LIKE ? OR b.guest_email LIKE ? OR b.guest_cnic_passport LIKE ?)`;
      const term = `%${search}%`;
      searchParams.push(term, term, term, term, term);
    }

    // Arrivals for selected date
    const arrivalsSql = queryBase + (search ? ' AND' : ' WHERE') + ` b.check_in = ? AND b.booking_status != 'cancelled' ORDER BY b.guest_name ASC`;
    const arrivals = await query(arrivalsSql, [...searchParams, filterDate]);

    // Departures for selected date
    const departuresSql = queryBase + (search ? ' AND' : ' WHERE') + ` b.check_out = ? AND b.booking_status = 'checked_in' ORDER BY b.guest_name ASC`;
    const departures = await query(departuresSql, [...searchParams, filterDate]);

    // Currently In-House Guests
    const inHouse = await query(
      `SELECT b.*, r.title as room_title, r.category as room_category, r.housekeeping_status
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.booking_status = 'checked_in'
       ORDER BY b.check_out ASC`
    );

    // All Upcoming Stays (from today onwards)
    const upcoming = await query(
      `SELECT b.*, r.title as room_title, r.category as room_category, r.housekeeping_status
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.check_in >= ? AND b.booking_status NOT IN ('cancelled', 'completed')
       ORDER BY b.check_in ASC`,
      [today]
    );

    // Pending Bank Transfer Slips
    const pendingSlips = await query(
      `SELECT b.*, r.title as room_title, r.category as room_category
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.payment_method = 'bank_transfer' AND b.payment_status = 'pending'
       ORDER BY b.created_at DESC`
    );

    // Occupancy Metrics
    const totalRooms = await query('SELECT COUNT(*) as count FROM rooms WHERE is_active = 1');
    const occupiedRoomIds = [...new Set(inHouse.map(b => b.room_id))];
    const occupiedCount = occupiedRoomIds.length;
    const totalCount = totalRooms[0].count;
    const availableCount = Math.max(0, totalCount - occupiedCount);

    const allRooms = await query(`
      SELECT id, title, category, base_price, is_active,
             COALESCE(housekeeping_status, 'ready to serve') as housekeeping_status
      FROM rooms
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      data: {
        filterDate,
        today,
        arrivals,
        departures,
        inHouse,
        upcoming,
        pendingSlips,
        metrics: {
          totalRooms: totalCount,
          occupiedCount,
          availableCount,
        },
        allRooms,
      },
    });
  } catch (err) {
    console.error('Reception dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load reception dashboard.' });
  }
});

// 2. Rooms Matrix with Housekeeping and Active Booking Dates
router.get('/rooms-matrix', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const rooms = await query(`
      SELECT id, title, category, base_price, capacity_adults, capacity_children,
             is_active, COALESCE(housekeeping_status, 'ready to serve') as housekeeping_status,
             featured_image
      FROM rooms
      ORDER BY id ASC
    `);

    // Fetch active bookings spanning today and future
    const activeBookings = await query(`
      SELECT id, booking_number, room_id, guest_name, guest_phone, check_in, check_out, booking_status
      FROM bookings
      WHERE check_out >= ? AND booking_status NOT IN ('cancelled')
      ORDER BY check_in ASC
    `, [today]);

    const roomsWithBookings = rooms.map(room => {
      const roomBookings = activeBookings.filter(b => b.room_id === room.id);
      const isCurrentlyOccupied = roomBookings.some(b => b.check_in <= today && b.check_out > today && b.booking_status === 'checked_in');
      return {
        ...room,
        is_currently_occupied: isCurrentlyOccupied,
        active_bookings: roomBookings,
      };
    });

    res.json({ success: true, rooms: roomsWithBookings });
  } catch (err) {
    console.error('Rooms matrix error:', err);
    res.status(500).json({ success: false, message: 'Failed to load room matrix.' });
  }
});

// 3. Update Housekeeping Status ('ready to serve', 'cleaning', 'dirty', 'maintenance')
router.post('/rooms/:id/housekeeping', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ready to serve', 'cleaning', 'dirty', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(422).json({
        success: false,
        message: `Invalid housekeeping status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    await query('UPDATE rooms SET housekeeping_status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: `Room #${id} housekeeping status updated to "${status.toUpperCase()}".`,
      status
    });
  } catch (err) {
    console.error('Update housekeeping error:', err);
    res.status(500).json({ success: false, message: 'Failed to update housekeeping status.' });
  }
});

// 4. Available Rooms for Walk-in Stays (Excludes Booked Dates & Maintenance)
router.get('/available-rooms', async (req, res) => {
  try {
    const { check_in, check_out } = req.query;
    if (!check_in || !check_out) {
      return res.status(422).json({ success: false, message: 'Please provide check_in and check_out dates.' });
    }

    // Find rooms that have conflicts during this range
    const bookedRoomIdsResult = await query(`
      SELECT DISTINCT room_id
      FROM bookings
      WHERE booking_status NOT IN ('cancelled')
        AND check_in < ? AND check_out > ?
    `, [check_out, check_in]);

    const bookedIds = bookedRoomIdsResult.map(r => r.room_id);

    let sql = 'SELECT * FROM rooms WHERE is_active = 1 AND housekeeping_status != "maintenance"';
    const params = [];

    if (bookedIds.length > 0) {
      sql += ` AND id NOT IN (${bookedIds.map(() => '?').join(',')})`;
      params.push(...bookedIds);
    }

    sql += ' ORDER BY base_price ASC';

    const availableRooms = await query(sql, params);

    res.json({
      success: true,
      check_in,
      check_out,
      available_rooms: availableRooms
    });
  } catch (err) {
    console.error('Available rooms error:', err);
    res.status(500).json({ success: false, message: 'Failed to search available rooms.' });
  }
});

// 5. Walk-in Front Desk Quick Reservation
router.post('/walkin', async (req, res) => {
  try {
    const {
      room_id,
      guest_name,
      guest_phone,
      guest_email = '',
      guest_cnic_passport = '',
      check_in,
      check_out,
      adults = 1,
      children = 0,
      payment_method = 'pay_at_hotel',
      payment_status = 'pending',
      special_requests = '',
      admin_notes = '',
    } = req.body;

    if (!room_id || !guest_name || !guest_phone || !check_in || !check_out) {
      return res.status(422).json({ success: false, message: 'Please provide required walk-in details.' });
    }

    // Double check room conflict
    const conflicts = await query(`
      SELECT id FROM bookings
      WHERE room_id = ? AND booking_status NOT IN ('cancelled')
        AND check_in < ? AND check_out > ?
    `, [room_id, check_out, check_in]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This room is already reserved for the selected dates.'
      });
    }

    const rooms = await query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected room not found.' });
    }
    const room = rooms[0];

    // Calculate nights
    const start = new Date(check_in);
    const end = new Date(check_out);
    const totalNights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const totalAmount = parseFloat(room.base_price) * totalNights;
    const bookingNumber = `OAS-WALK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO bookings (
        booking_number, room_id, guest_name, guest_email, guest_phone, guest_cnic_passport,
        check_in, check_out, total_nights, adults, children, base_room_total, add_ons_total,
        discount_amount, final_total, payment_method, payment_status, booking_status,
        special_requests, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, 'checked_in', ?, ?)`,
      [
        bookingNumber, room_id, guest_name, guest_email || `${guest_phone.replace(/\D/g, '')}@walkin.pk`,
        guest_phone, guest_cnic_passport, check_in, check_out, totalNights, adults, children,
        totalAmount, totalAmount, payment_method, payment_status, special_requests,
        `Walk-in registered by front desk. ${admin_notes}`
      ]
    );

    // Update room housekeeping to occupied
    await query("UPDATE rooms SET housekeeping_status = 'cleaning' WHERE id = ?", [room_id]);

    res.status(201).json({
      success: true,
      message: `Walk-in guest ${guest_name} registered and checked in successfully!`,
      booking_number: bookingNumber,
      booking_id: result.insertId,
    });
  } catch (err) {
    console.error('Walk-in error:', err);
    res.status(500).json({ success: false, message: 'Failed to create walk-in booking.' });
  }
});

// 6. Update Status (Checked-In, Completed, Cancelled, Payment Status)
router.post('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_status, payment_status, admin_notes } = req.body;

    const bookings = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];
    const newBookingStatus = booking_status || booking.booking_status;
    const newPaymentStatus = payment_status || booking.payment_status;
    const updatedNotes = admin_notes !== undefined ? admin_notes : booking.admin_notes;

    await query(
      'UPDATE bookings SET booking_status = ?, payment_status = ?, admin_notes = ? WHERE id = ?',
      [newBookingStatus, newPaymentStatus, updatedNotes, id]
    );

    // If marked completed (checked out), mark room as dirty so housekeeping can clean
    if (newBookingStatus === 'completed') {
      await query("UPDATE rooms SET housekeeping_status = 'dirty' WHERE id = ?", [booking.room_id]);
    }

    res.json({
      success: true,
      message: `Reservation #${booking.booking_number} updated to ${newBookingStatus.toUpperCase()}.`,
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update reservation status.' });
  }
});

module.exports = router;
