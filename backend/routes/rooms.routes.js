const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

// Helper function to calculate stay pricing factoring in seasonal overrides
function calculateStayPricing(basePrice, seasons, checkInStr, checkOutStr) {
  const start = new Date(checkInStr);
  const end = new Date(checkOutStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return {
      total_nights: 1,
      total_room_price: basePrice,
      average_nightly_rate: basePrice,
      daily_breakdown: [{ date: checkInStr, price: basePrice, season: null }],
    };
  }

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

    daily_breakdown.push({
      date: formatted,
      price: appliedPrice,
      season: appliedSeason,
    });
    total += appliedPrice;

    current.setDate(current.getDate() + 1);
  }

  const nights = daily_breakdown.length;
  return {
    total_nights: nights,
    total_room_price: total,
    average_nightly_rate: nights > 0 ? Math.round(total / nights) : basePrice,
    daily_breakdown,
  };
}

// 1. Get All Active Rooms with filters
router.get('/', async (req, res) => {
  try {
    const { category, guests } = req.query;
    let sql = 'SELECT * FROM rooms WHERE is_active = 1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (guests) {
      sql += ' AND capacity_adults >= ?';
      params.push(parseInt(guests, 10));
    }

    sql += ' ORDER BY base_price DESC';
    const rooms = await query(sql, params);

    // Fetch seasonal prices and category inventory counts
    const allSeasons = await query('SELECT * FROM room_seasonal_prices');
    const categoriesData = await query('SELECT name, total_rooms FROM room_categories');
    const catInventoryMap = {};
    categoriesData.forEach(c => { catInventoryMap[c.name] = c.total_rooms || 4; });
    const categories = [...new Set(rooms.map(r => r.category))];

    const processedRooms = rooms.map(room => {
      const roomSeasons = allSeasons.filter(s => s.room_id === room.id);
      return {
        ...room,
        total_rooms: catInventoryMap[room.category] || 4,
        base_price: parseFloat(room.base_price),
        amenities: typeof room.amenities === 'string' ? JSON.parse(room.amenities || '[]') : (room.amenities || []),
        images: typeof room.images === 'string' ? JSON.parse(room.images || '[]') : (room.images || []),
        seasonal_prices: roomSeasons,
      };
    });

    res.json({
      success: true,
      rooms: processedRooms,
      categories,
    });
  } catch (err) {
    console.error('Fetch rooms error:', err);
    res.status(500).json({ success: false, message: 'Failed to load rooms.' });
  }
});

// 2. Calculate Pricing for Specific Dates
router.get('/:id/pricing', async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out } = req.query;

    const rooms = await query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const seasons = await query('SELECT * FROM room_seasonal_prices WHERE room_id = ?', [id]);
    const pricing = calculateStayPricing(rooms[0].base_price, seasons, check_in, check_out);

    // Check availability
    const conflicts = await query(
      `SELECT COUNT(*) as count FROM bookings
       WHERE room_id = ? AND booking_status != 'cancelled'
       AND (check_in < ? AND check_out > ?)`,
      [id, check_out, check_in]
    );

    res.json({
      success: true,
      pricing,
      is_available: conflicts[0].count === 0,
    });
  } catch (err) {
    console.error('Pricing calculation error:', err);
    res.status(500).json({ success: false, message: 'Pricing calculation error.' });
  }
});

// 3. Get Single Room by Slug with Details, Availability & Recommendations
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { check_in, check_out } = req.query;

    const rooms = await query('SELECT * FROM rooms WHERE slug = ? AND is_active = 1', [slug]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Accommodations not found.' });
    }

    const room = rooms[0];
    room.base_price = parseFloat(room.base_price);
    room.amenities = typeof room.amenities === 'string' ? JSON.parse(room.amenities || '[]') : (room.amenities || []);
    room.images = typeof room.images === 'string' ? JSON.parse(room.images || '[]') : (room.images || []);

    const [catRow] = await query('SELECT total_rooms FROM room_categories WHERE name = ?', [room.category]);
    room.total_rooms = catRow ? catRow.total_rooms : 4;

    const seasons = await query('SELECT * FROM room_seasonal_prices WHERE room_id = ?', [room.id]);
    room.seasonal_prices = seasons;

    // Approved reviews
    const reviews = await query(
      'SELECT id, guest_name, rating, comment, created_at FROM reviews WHERE room_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [room.id]
    );

    // Dynamic pricing if dates supplied (default stay 1 night: tomorrow to day after tomorrow)
    const defaultCheckIn = check_in || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const defaultCheckOut = check_out || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const pricingBreakdown = calculateStayPricing(room.base_price, seasons, defaultCheckIn, defaultCheckOut);

    // Check availability
    const conflicts = await query(
      `SELECT COUNT(*) as count FROM bookings
       WHERE room_id = ? AND booking_status != 'cancelled'
       AND (check_in < ? AND check_out > ?)`,
      [room.id, defaultCheckOut, defaultCheckIn]
    );
    const isAvailable = conflicts[0].count === 0;

    // Up to 3 related rooms
    const relatedRooms = await query(
      'SELECT id, title, slug, category, base_price, featured_image, view_type FROM rooms WHERE is_active = 1 AND id != ? ORDER BY (category = ?) DESC, base_price ASC LIMIT 3',
      [room.id, room.category]
    );

    res.json({
      success: true,
      room,
      reviews,
      pricingBreakdown,
      isAvailable,
      relatedRooms,
    });
  } catch (err) {
    console.error('Room details error:', err);
    res.status(500).json({ success: false, message: 'Failed to load room details.' });
  }
});

module.exports = router;
