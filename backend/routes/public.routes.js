const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

// 1. Home Page Aggregated Content
router.get('/home', async (req, res) => {
  try {
    const rooms = await query('SELECT * FROM rooms WHERE is_active = 1 ORDER BY base_price DESC LIMIT 6');
    const testimonials = await query(`
      SELECT guest_name, 'Verified Guest' as guest_location, rating, comment, NULL as avatar_url, created_at
      FROM reviews
      WHERE is_approved = 1
      UNION ALL
      SELECT guest_name, guest_location, rating, comment, avatar_url, created_at
      FROM testimonials
      WHERE is_approved = 1
      ORDER BY created_at DESC
      LIMIT 6
    `);
    const offers = await query('SELECT * FROM offers WHERE is_active = 1 AND valid_until >= CURDATE() LIMIT 4');
    const gallery = await query('SELECT * FROM media_gallery WHERE is_featured = 1 ORDER BY sort_order ASC LIMIT 6');
    const posts = await query('SELECT * FROM posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT 3');
    const experiences = await query('SELECT * FROM add_on_services WHERE is_available = 1 LIMIT 4');

    const processedRooms = rooms.map(r => ({
      ...r,
      base_price: parseFloat(r.base_price),
      amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities || '[]') : (r.amenities || []),
      images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : (r.images || []),
    }));

    const rawSettings = await query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    (rawSettings || []).forEach(s => {
      settings[s.setting_key] = s.setting_value;
    });

    const hero = {
      media_type: settings.hero_media_type || 'video',
      image_url: settings.hero_image_url || '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG',
      video_url: settings.hero_video_url || '/uploads/rooms/fbac89b9f17e4ef5939dde3f37a7110d.mp4',
      badge: settings.hero_badge || 'Katpana Cold Desert, Skardu • 2,228M',
      title: settings.hero_title || 'Experience Nature in Luxury',
      subtitle: settings.hero_subtitle || 'A tranquil sanctuary where high-altitude luxury meets the breathtaking serenity of Baltistan’s Karakoram mountain range.',
      cta_text: settings.hero_cta_text || 'Explore Luxury Stays',
      cta_link: settings.hero_cta_link || '/rooms',
      video_button_text: settings.hero_video_button_text || 'Watch Resort Tour',
    };

    res.json({
      success: true,
      data: {
        hero,
        settings,
        rooms: processedRooms,
        testimonials,
        offers,
        gallery,
        posts,
        experiences,
      },
    });
  } catch (err) {
    console.error('Home content error:', err);
    res.status(500).json({ success: false, message: 'Failed to load home page content.' });
  }
});

// Settings Endpoint
router.get('/settings', async (req, res) => {
  try {
    const rawSettings = await query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    (rawSettings || []).forEach(s => {
      settings[s.setting_key] = s.setting_value;
    });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load site settings.' });
  }
});

// 2. About Us & Team
router.get('/about', async (req, res) => {
  try {
    const team = await query('SELECT * FROM team_members ORDER BY sort_order ASC');
    const testimonials = await query('SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY sort_order ASC');
    res.json({ success: true, team, testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load about us data.' });
  }
});

router.get('/team', async (req, res) => {
  try {
    const team = await query('SELECT * FROM team_members ORDER BY sort_order ASC');
    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load team data.' });
  }
});

// 3. Dining & Cuisine
router.get('/dining', async (req, res) => {
  try {
    let diningServices = await query('SELECT * FROM dining_items WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
    if (!diningServices || diningServices.length === 0) {
      diningServices = await query("SELECT * FROM add_on_services WHERE category LIKE '%Dining%' AND is_available = 1");
    }
    res.json({ success: true, diningServices });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load dining information.' });
  }
});

// 4. Activities & Experiences
router.get('/experiences', async (req, res) => {
  try {
    let experiences = await query('SELECT * FROM experiences WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
    if (!experiences || experiences.length === 0) {
      experiences = await query('SELECT * FROM add_on_services WHERE is_available = 1 ORDER BY price ASC');
    }
    res.json({ success: true, experiences });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load experiences.' });
  }
});

// 5. Gallery
router.get('/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM media_gallery';
    const params = [];

    if (category && category !== 'all') {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const items = await query(sql, params);

    // Fetch categories from gallery_categories table
    let catList = [];
    try {
      const dbCategories = await query('SELECT name FROM gallery_categories ORDER BY sort_order ASC, name ASC');
      if (dbCategories.length > 0) {
        catList = dbCategories.map(c => c.name);
      }
    } catch (e) {
      // fallback
    }

    if (catList.length === 0) {
      const allCategories = await query('SELECT DISTINCT category FROM media_gallery WHERE category IS NOT NULL');
      catList = allCategories.map(c => c.category);
    }

    res.json({
      success: true,
      items,
      categories: catList,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load gallery items.' });
  }
});

router.get('/gallery-categories', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM gallery_categories ORDER BY sort_order ASC, name ASC');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load gallery categories.' });
  }
});


// 6. Offers
router.get('/offers', async (req, res) => {
  try {
    const offers = await query('SELECT * FROM offers WHERE is_active = 1 AND valid_until >= CURDATE() ORDER BY discount_value DESC');
    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load offers.' });
  }
});

// 7. Blog Posts
router.get('/blog', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM posts WHERE is_published = 1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY published_at DESC';

    const posts = await query(sql, params);
    const categories = await query('SELECT DISTINCT category FROM posts WHERE is_published = 1');

    res.json({
      success: true,
      posts,
      categories: categories.map(c => c.category),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load articles.' });
  }
});

// 8. Single Blog Article
router.get('/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const posts = await query('SELECT * FROM posts WHERE slug = ? AND is_published = 1', [slug]);

    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const post = posts[0];
    const related = await query('SELECT * FROM posts WHERE is_published = 1 AND id != ? LIMIT 2', [post.id]);

    res.json({ success: true, post, related });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load article.' });
  }
});

// 9. FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await query('SELECT * FROM faqs WHERE is_active = 1 ORDER BY sort_order ASC');
    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      acc[faq.category] = acc[faq.category] || [];
      acc[faq.category].push(faq);
      return acc;
    }, {});

    res.json({ success: true, faqs, grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load FAQs.' });
  }
});

// 10. Contact Message Form Submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(422).json({ success: false, message: 'Please provide all required fields.' });
    }

    await query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), phone || '', subject.trim(), message.trim()]
    );

    res.json({
      success: true,
      message: `Thank you, ${name}! Your inquiry has been dispatched to Katpana Front Desk.`,
    });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Failed to send inquiry.' });
  }
});

// 11. Public Payment Accounts (for Book, Dining, and Experience booking flows)
router.get('/payment-accounts', async (req, res) => {
  try {
    const accounts = await query('SELECT * FROM payment_accounts WHERE is_active = 1 ORDER BY id ASC');
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load payment accounts.' });
  }
});

// 12. Public Room Categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(`
      SELECT c.*, COUNT(r.id) as room_count
      FROM room_categories c
      LEFT JOIN rooms r ON r.category = c.name AND r.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load categories.' });
  }
});

// 13. Public Standalone Service Bookings (Dining & Experiences without room stay)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const baseUploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
const slipDir = path.join(baseUploadDir, 'slips');
if (!fs.existsSync(slipDir)) fs.mkdirSync(slipDir, { recursive: true });

const slipStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, slipDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `service-slip-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadServiceSlip = multer({
  storage: slipStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only JPG, PNG and PDF receipts are allowed.'));
  },
});

router.post('/service-bookings', uploadServiceSlip.single('payment_slip'), async (req, res) => {
  try {
    const {
      booking_type, // 'dining' or 'experience'
      service_id,
      service_title,
      guest_name,
      guest_email,
      guest_phone,
      booking_date,
      booking_time,
      guests_count = 2,
      unit_price = 0,
      total_price = 0,
      special_requests = '',
      payment_method = 'pay_at_hotel',
      payment_transaction_id = '',
    } = req.body;

    if (!booking_type || !service_id || !guest_name || !guest_email || !guest_phone || !booking_date || !booking_time) {
      return res.status(422).json({
        success: false,
        message: 'Please fill in all required booking information (Service, Guest details, Date, and Time).',
      });
    }

    const prefix = booking_type === 'dining' ? 'DIN' : 'EXP';
    const bookingNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentSlipPath = req.file ? `uploads/slips/${req.file.filename}` : null;
    let paymentStatus = 'pending';
    if ((payment_method === 'jazzcash' || payment_method === 'easypaisa') && payment_transaction_id) {
      paymentStatus = 'paid';
    } else if (payment_method === 'bank_transfer' && paymentSlipPath) {
      paymentStatus = 'verified';
    }

    const result = await query(
      `INSERT INTO service_bookings (
        booking_number, booking_type, service_id, service_title, guest_name, guest_email,
        guest_phone, booking_date, booking_time, guests_count, unit_price, total_price,
        special_requests, payment_method, payment_status, payment_transaction_id,
        payment_slip_path, booking_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        bookingNumber, booking_type, service_id, service_title, guest_name, guest_email,
        guest_phone, booking_date, booking_time, guests_count, unit_price, total_price,
        special_requests, payment_method, paymentStatus, payment_transaction_id,
        paymentSlipPath,
      ]
    );

    res.status(201).json({
      success: true,
      message: `Your ${booking_type === 'dining' ? 'Dining' : 'Experience'} reservation has been confirmed!`,
      booking_number: bookingNumber,
      booking_id: result.insertId,
    });
  } catch (err) {
    console.error('Service booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to process booking: ' + err.message });
  }
});

module.exports = router;
