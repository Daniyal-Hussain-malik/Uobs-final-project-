const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oasis_resort',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  dateStrings: true,
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Helper query function that unwraps results
async function query(sql, params = []) {
  const p = getPool();
  const [results] = await p.query(sql, params);
  return results;
}

// Auto-initialize MySQL database, tables, and demo seed data if needed
async function initDatabase() {
  try {
    // 1. Try to check/create database if permitted (e.g. localhost), or proceed directly
    try {
      const tempConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
      });
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await tempConnection.end();
    } catch (dbErr) {
      // On shared hosting like Hostinger, database is already created in hPanel
      console.log(`Database '${dbConfig.database}' check: proceeding with allocated database.`);
    }

    // 2. Ensure connection pool is created
    const p = getPool();

    // 3. Create tables if not exist
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL,
        role ENUM('admin', 'reception', 'guest') DEFAULT 'guest',
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        capacity_adults INT NOT NULL DEFAULT 2,
        capacity_children INT NOT NULL DEFAULT 0,
        view_type VARCHAR(255) NOT NULL,
        bed_type VARCHAR(100) NOT NULL,
        room_size_sqm INT NOT NULL,
        description TEXT NOT NULL,
        amenities JSON NULL,
        images JSON NULL,
        featured_image VARCHAR(500) NOT NULL,
        virtual_tour_url VARCHAR(500) NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS room_seasonal_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        season_name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        discount_type ENUM('percentage', 'flat') NOT NULL DEFAULT 'percentage',
        discount_value DECIMAL(10,2) NOT NULL,
        min_spend DECIMAL(10,2) DEFAULT 0,
        valid_from DATE NOT NULL,
        valid_until DATE NOT NULL,
        usage_limit INT DEFAULT 500,
        used_count INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS add_on_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        pricing_unit VARCHAR(50) DEFAULT 'per_trip',
        image_url VARCHAR(500) NULL,
        is_available TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NULL,
        room_id INT NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        guest_cnic_passport VARCHAR(50) NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        total_nights INT NOT NULL,
        adults INT NOT NULL DEFAULT 1,
        children INT NOT NULL DEFAULT 0,
        base_room_total DECIMAL(10,2) NOT NULL,
        add_ons_total DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        offer_id INT NULL,
        final_total DECIMAL(10,2) NOT NULL,
        payment_method ENUM('jazzcash', 'easypaisa', 'bank_transfer', 'pay_at_hotel', 'cash') NOT NULL DEFAULT 'pay_at_hotel',
        payment_status ENUM('pending', 'verified', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
        payment_slip_path VARCHAR(500) NULL,
        payment_transaction_id VARCHAR(100) NULL,
        booking_status ENUM('pending', 'confirmed', 'checked_in', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
        special_requests TEXT NULL,
        admin_notes TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS booking_add_ons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        add_on_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (add_on_id) REFERENCES add_on_services(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        guest_location VARCHAR(255) NULL,
        rating INT DEFAULT 5,
        comment TEXT NOT NULL,
        avatar_url VARCHAR(500) NULL,
        is_approved TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        bio TEXT NULL,
        image_url VARCHAR(500) NULL,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        excerpt TEXT NULL,
        content LONGTEXT NOT NULL,
        cover_image VARCHAR(500) NULL,
        author_name VARCHAR(255) DEFAULT 'Oasis Editorial',
        is_published TINYINT(1) DEFAULT 1,
        published_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        question VARCHAR(500) NOT NULL,
        answer TEXT NOT NULL,
        keywords VARCHAR(255) NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS media_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        is_featured TINYINT(1) DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL UNIQUE,
        room_id INT NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        comment TEXT NOT NULL,
        is_approved TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS room_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        total_rooms INT NOT NULL DEFAULT 4,
        image_url VARCHAR(500) NULL,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS payment_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        method ENUM('bank_transfer', 'jazzcash', 'easypaisa', 'other') NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_title VARCHAR(255) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        iban VARCHAR(100) NULL,
        instructions TEXT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS service_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_number VARCHAR(50) NOT NULL UNIQUE,
        booking_type ENUM('dining', 'experience') NOT NULL,
        service_id INT NOT NULL,
        service_title VARCHAR(255) NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        booking_date DATE NOT NULL,
        booking_time VARCHAR(50) NOT NULL,
        guests_count INT NOT NULL DEFAULT 2,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        special_requests TEXT NULL,
        payment_method ENUM('pay_at_hotel', 'bank_transfer', 'jazzcash', 'easypaisa') NOT NULL DEFAULT 'pay_at_hotel',
        payment_status ENUM('pending', 'verified', 'paid', 'refunded') DEFAULT 'pending',
        payment_transaction_id VARCHAR(100) NULL,
        payment_slip_path VARCHAR(500) NULL,
        booking_status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        admin_notes TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (booking_type),
        INDEX idx_date (booking_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS dining_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        deal_type VARCHAR(100) NOT NULL DEFAULT 'Deal & Package',
        category VARCHAR(100) NOT NULL DEFAULT 'Dining',
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        pricing_unit VARCHAR(50) NOT NULL DEFAULT 'per_couple',
        menu_inclusions TEXT,
        time_slots VARCHAR(255) NOT NULL DEFAULT 'Sunset Sitting (18:30 - 20:30), Night Starlight (20:45 - 23:00)',
        image_url VARCHAR(500),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Desert Safari',
        duration VARCHAR(100) NOT NULL DEFAULT '2 Hours',
        difficulty VARCHAR(50) NOT NULL DEFAULT 'Moderate',
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        pricing_unit VARCHAR(50) NOT NULL DEFAULT 'per_vehicle',
        inclusions TEXT,
        departure_times VARCHAR(255) NULL,
        time_slots VARCHAR(255) NOT NULL DEFAULT 'Sunrise Thrill (06:00 - 08:00), Sunset Dunes (17:00 - 18:30)',
        image_url VARCHAR(500),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Ensure default hero settings exist
    const defaultSettings = [
      ['hero_media_type', 'image'],
      ['hero_image_url', '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG'],
      ['hero_video_url', '/uploads/rooms/fbac89b9f17e4ef5939dde3f37a7110d.mp4'],
      ['hero_badge', 'Katpana Cold Desert, Skardu • 2,228M'],
      ['hero_title', 'Experience Nature in Luxury'],
      ['hero_subtitle', 'Katpana Cold Desert, Skardu — Where the serene Karakoram peaks meet unparalleled Balti warmth and modern five-star comfort.'],
      ['hero_cta_text', 'Explore Luxury Stays'],
      ['hero_cta_link', '/rooms'],
      ['hero_video_button_text', 'Watch Resort Tour'],
    ];

    for (const [sKey, sVal] of defaultSettings) {
      await p.query(
        'INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
        [sKey, sVal]
      );
    }

    // Automatically migrate any legacy .MOV files to browser-compatible .mp4
    try {
      await p.query("UPDATE site_settings SET setting_value = REPLACE(setting_value, '.MOV', '.mp4') WHERE setting_key = 'hero_video_url' AND setting_value LIKE '%.MOV%'");
      await p.query("UPDATE media_gallery SET image_url = REPLACE(image_url, '.MOV', '.mp4') WHERE image_url LIKE '%.MOV%'");
    } catch (migrErr) {
      // Ignore if table not created yet
    }

    // 4. Check if demo seeding is needed
    const users = await query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('🌱 Database is empty. Seeding initial Oasis Resort data...');
      await seedDatabase();
      console.log('✅ Database seeded successfully!');
    } else {
      console.log('✓ Database tables verified.');
    }

    return true;
  } catch (err) {
    console.error('⚠️ MySQL Connection / Initialization notice:');
    console.error(err.message);
    console.warn('👉 Please ensure MySQL server is running (e.g., in XAMPP or MySQL Service on port 3306) and credentials in .env are correct.');
    return false;
  }
}

async function seedDatabase() {
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'password123';
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@oasisresort.pk';
  const defaultAdminPhone = process.env.DEFAULT_ADMIN_PHONE || '+92 300 1234567';
  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

  // 1. Seed Users
  await query(
    `INSERT INTO users (name, email, phone, role, password) VALUES
    ('Resort Admin', ?, ?, 'admin', ?),
    ('Reception Front Desk', 'reception@oasisresort.pk', '+92 311 9876543', 'reception', ?),
    ('Malik Tariq', 'guest@oasisresort.pk', '+92 321 5558899', 'guest', ?)`,
    [defaultAdminEmail, defaultAdminPhone, hashedPassword, hashedPassword, hashedPassword]
  );

  // 2. Seed Rooms
  const room1Amenities = JSON.stringify([
    'Radiant Underfloor Heating',
    'Private Desert Viewing Deck',
    'Jacuzzi Tub with Mountain View',
    'High-Speed Satellite Wi-Fi',
    'Espresso & Balti Herbal Tea Bar',
    '24/7 Dedicated Butler Service',
    'Smart 4K TV with Streaming',
    'Complimentary Airport Chauffeur'
  ]);
  const room1Images = JSON.stringify([
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
  ]);

  const room2Amenities = JSON.stringify([
    'Retractable Celestial Glass Roof',
    'Astronomical Telescope Provided',
    'Climate Controlled Fireplace',
    'Luxury Bathrobes & Herbal Amenities',
    'Gourmet Breakfast in Bed',
    'Superfast Satellite Wi-Fi'
  ]);
  const room2Images = JSON.stringify([
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
  ]);

  const room3Amenities = JSON.stringify([
    'Authentic Wood-Burning Stove (Bukhari)',
    'Handcrafted Balti Wool Rugs',
    'Organic Mountain Herb Toiletries',
    'Orchard-Facing Balcony',
    'Satellite Wi-Fi',
    'Complimentary Afternoon Kahwa Tea'
  ]);
  const room3Images = JSON.stringify([
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
  ]);

  const room4Amenities = JSON.stringify([
    'Heated Electric Blanket & Heater',
    'Private En-suite Warm Bathroom',
    'Private Outdoor Firepit & Seating',
    'Panoramic Dune-Facing Windows',
    'Evening Bonfire Access'
  ]);
  const room4Images = JSON.stringify([
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80'
  ]);

  await query(`
    INSERT INTO rooms (id, title, slug, category, base_price, capacity_adults, capacity_children, view_type, bed_type, room_size_sqm, description, amenities, images, featured_image, virtual_tour_url, is_active) VALUES
    (1, 'Royal Karakoram Presidential Villa', 'royal-karakoram-presidential-villa', 'Luxury Villa', 65000, 4, 2, 'Katpana Cold Desert Dunes & K2 Range Vistas', '2 King Master Beds', 95, 'A breathtaking master villa crafted with authentic Balti stone masonry and cedarwood finishes. Features private panoramic sun-decks overlooking the world-famous Katpana cold desert sand dunes, radiant floor heating, a private bonfire patio, and 24/7 dedicated butler service.', ?, ?, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'https://my.matterport.com/show/?m=example-skardu-villa', 1),
    (2, 'Katpana Stargazer Glass Suite', 'katpana-stargazer-glass-suite', 'Executive Suite', 42000, 2, 1, 'Skylight Unobstructed Milky Way Galaxy & Cold Desert', '1 Ultra-Plush King Bed', 60, 'Architecturally designed with thermal double-glazed glass ceilings above the bed, offering an unparalleled view of the zero-light-pollution Skardu night sky and shooting stars from the comfort of a heated room.', ?, ?, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', 'https://my.matterport.com/show/?m=example-skardu-suite', 1),
    (3, 'Balti Heritage Stone Cottage', 'balti-heritage-stone-cottage', 'Heritage Cottage', 32000, 2, 1, 'Organic Apricot Orchard & Indus Valley', '1 Hand-Carved Queen Bed', 48, 'A traditional artisan cottage built with river stones and hand-carved Tibetan-Balti walnut woodwork. Surrounded by lush apricot and cherry trees with peaceful mountain air.', ?, ?, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80', NULL, 1),
    (4, 'Cold Desert Deluxe Glamping Pod', 'cold-desert-deluxe-glamping-pod', 'Glamping Tent', 26000, 2, 0, 'White Sand Dunes & Sunset Vista', '1 Queen Sized Memory Foam Bed', 38, 'Experience the magic of sleeping right on the white dunes of Katpana Desert with four-star comfort. Includes thermal insulated canvas, private en-suite bathroom with hot running water, and an outdoor firepit.', ?, ?, 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80', NULL, 1)
  `, [room1Amenities, room1Images, room2Amenities, room2Images, room3Amenities, room3Images, room4Amenities, room4Images]);

  // 3. Seasonal Pricing (empty by default so room rates match configured room base prices)

  // 4. Seed Offers
  await query(`
    INSERT INTO offers (id, code, title, description, discount_type, discount_value, min_spend, valid_from, valid_until, usage_limit, used_count, is_active) VALUES
    (1, 'OASISWELCOME', 'Exclusive Direct Booking Welcome Discount', 'Enjoy 10% off on your entire stay when booking directly through our website.', 'percentage', 10.00, 20000.00, '2025-01-01', '2027-12-31', 500, 12, 1),
    (2, 'HONEYMOON2026', 'Romantic Honeymooners Special', 'Flat PKR 8,000 instant saving on Luxury Villas and Stargazer Suites for newlyweds.', 'flat', 8000.00, 50000.00, '2025-01-01', '2027-12-31', 200, 6, 1)
  `);

  // 5. Seed Add-on Services
  await query(`
    INSERT INTO add_on_services (id, title, category, description, price, pricing_unit, image_url, is_available) VALUES
    (1, 'Katpana Cold Desert 4x4 Dune Bashing Safari', 'Adventure & Excursions', 'Adrenaline-packed sunset desert safari across the Katpana sand dunes in a specially rigged 4x4 Land Cruiser with a licensed alpine driver.', 9500, 'per_trip', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80', 1),
    (2, 'Candlelit Riverside Private Balti Dining Experience', 'Dining & Cuisine', 'A five-course authentic traditional culinary experience served by a crackling fire next to the Indus River, featuring Balti Dum Pukht, fresh river trout, and herbal desserts.', 12000, 'per_couple', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', 1),
    (3, 'Lower Kachura & Shangrila Jet Ski & Boating Pass', 'Water Sports', 'Exhilarating boating and jet-ski experience on the crystal turquoise alpine waters of Kachura Lake with all safety equipment provided.', 6500, 'per_person', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', 1),
    (4, 'Himalayan Herbal Oil Deep Tissue Massage', 'Spa & Wellness', '60 minutes of restorative rejuvenation utilizing wild-harvested juniper, sea buckthorn, and apricot seed essential oils.', 8000, 'per_session', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 1),
    (5, 'Skardu International Airport VIP Transfer', 'Airport Transfers', 'Private luxury 4WD Prado pickup or drop-off right outside Skardu terminal with luggage assistance and warm welcome Kahwa.', 4500, 'per_trip', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80', 1)
  `);

  // 6. Seed Testimonials
  await query(`
    INSERT INTO testimonials (guest_name, guest_location, rating, comment, avatar_url, is_approved, sort_order) VALUES
    ('Dr. Ayesha Siddiqui', 'Lahore, Pakistan', 5, 'Staying at Oasis Resort Katpana was pure magic. Sleeping under the stars in the Glass Suite while looking out over the white desert dunes was a memory my family will cherish forever. The staff hospitality represents the true spirit of Baltistan.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 1, 1),
    ('Marc & Elena Fischer', 'Zurich, Switzerland', 5, 'Having traveled all across the European Alps and Himalayas, Oasis Resort Skardu stands out for its serene desert-meets-snowcapped peaks backdrop. Direct booking was seamless and the 4x4 dune safari was world-class.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 1, 2)
  `);

  // 7. Seed Team Members
  await query(`
    INSERT INTO team_members (name, role, bio, image_url, sort_order) VALUES
    ('Ghulam Muhammad Balti', 'General Manager & Host', 'With over 18 years in high-altitude luxury hospitality and mountaineering expeditions across Karakoram.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 1),
    ('Chef Fatima Zahra', 'Executive Chef - Balti Heritage Cuisine', 'Celebrated specialist in organic alpine slow-cooking, foraging wild herbs, and modern Tibetan-Balti gastronomy.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 2),
    ('Khadim Hussain', 'Chief Expedition & Safari Guide', 'Certified alpine rescue specialist and veteran of 30+ Deosai and Katpana desert expeditions.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 3)
  `);

  // 8. Seed Blog Posts
  await query(`
    INSERT INTO posts (title, slug, category, excerpt, content, cover_image, author_name, is_published, published_at) VALUES
    ('Ultimate 5-Day Skardu Itinerary: From Cold Desert to Shangrila', 'ultimate-5-day-skardu-itinerary', 'Travel Guide', 'How to spend 5 unforgettable days exploring Katpana Cold Desert, Deosai Plains, Shigar Fort, and turquoise alpine lakes.', 'Skardu is an ethereal mountain gateway situated at 2,228 meters in Gilgit-Baltistan. Your adventure begins right outside Oasis Resort Katpana, where you can watch the sunrise cast golden shadows over pristine white sand dunes with snow-covered mountain peaks in the background...', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', 'Oasis Expeditions Desk', 1, NOW()),
    ('What to Pack for Skardu: High Altitude & Desert Climate Guide', 'what-to-pack-for-skardu', 'Packing & Weather', 'Essential clothing layers, UV protection, and hydration tips for Skardu’s high-altitude sun and cool desert nights.', 'The Katpana Cold Desert features an extreme diurnal temperature swing. Even in peak summer (July-August), while days reach 28°C, night temperatures can drop to 12°C. In autumn and spring, evenings easily dip below freezing...', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80', 'Oasis Guest Relations', 1, NOW())
  `);

  // 9. Seed FAQs
  await query(`
    INSERT INTO faqs (category, question, answer, keywords, sort_order, is_active) VALUES
    ('Booking & Payments', 'What payment methods do you accept?', 'We accept direct online payments via JazzCash, Easypaisa, secure Direct Bank Transfer (with slip upload verification), and Pay at Hotel upon arrival.', 'payment pay jazzcash easypaisa bank transfer card cash methods', 1, 1),
    ('Arrival & Airport', 'How far is Oasis Resort from Skardu Airport?', 'Oasis Resort Katpana is situated approximately 15 minutes (11 km) from Skardu International Airport. We provide complimentary airport chauffeured transfers for all Villa bookings and on-demand pickup for Suites.', 'airport distance transport flight landing pickup taxi drive km minutes', 2, 1),
    ('Weather & Altitude', 'Does the resort have heating during cold desert nights?', 'Yes! All our Luxury Villas, Suites, and Heritage Cottages feature imported radiant heating, warm down-feather duvets, and optional traditional wooden Bukharis (stoves) to keep you perfectly warm year-round.', 'heating warm cold winter heater ac blanket weather temperature bukhari', 3, 1),
    ('Cancellation Policy', 'What is your cancellation and refund policy?', 'Free cancellation is allowed up to 7 days prior to check-in with a 100% refund. Cancellations made between 3 to 7 days before check-in receive a 50% refund or full stay credit valid for 12 months. Weather-related flight cancellations are handled with full rescheduling flexibility.', 'cancellation cancel refund policy flights delayed money back reschedule', 4, 1)
  `);

  // 10. Seed Media Gallery
  await query(`
    INSERT INTO media_gallery (title, category, image_url, is_featured, sort_order) VALUES
    ('Katpana Desert Sunset with K2 Backdrop', 'Landscape & Dunes', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80', 1, 1),
    ('Royal Villa Stargazer Balcony', 'Luxury Rooms', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80', 1, 2),
    ('Candlelit Riverside Dining Setup', 'Balti Dining', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80', 1, 3),
    ('4x4 Dune Bashing on White Sands', 'Adventure & Stargazing', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80', 1, 4)
  `);

  // 11. Seed Realistic Initial Bookings
  const today = new Date();
  const pastCheckIn = new Date(today);
  pastCheckIn.setDate(today.getDate() - 6);
  const pastCheckOut = new Date(today);
  pastCheckOut.setDate(today.getDate() - 3);

  const futureCheckIn = new Date(today);
  const futureCheckOut = new Date(today);
  futureCheckOut.setDate(today.getDate() + 2);

  const inHouseCheckIn = new Date(today);
  inHouseCheckIn.setDate(today.getDate() - 1);
  const inHouseCheckOut = new Date(today);
  inHouseCheckOut.setDate(today.getDate() + 3);

  const fmt = (d) => d.toISOString().split('T')[0];

  await query(`
    INSERT INTO bookings (id, booking_number, user_id, room_id, guest_name, guest_email, guest_phone, guest_cnic_passport, check_in, check_out, total_nights, adults, children, base_room_total, add_ons_total, discount_amount, offer_id, final_total, payment_method, payment_status, payment_transaction_id, booking_status, special_requests, admin_notes) VALUES
    (1, 'OAS-2026-1001', 3, 1, 'Malik Tariq', 'guest@oasisresort.pk', '+92 321 5558899', '37405-1234567-1', '${fmt(pastCheckIn)}', '${fmt(pastCheckOut)}', 3, 2, 1, 195000, 21500, 19500, 1, 197000, 'jazzcash', 'paid', 'JC-99882211', 'completed', 'Quiet villa facing east for sunrise photography.', 'VIP guest. Stay completed with full satisfaction.'),
    (2, 'OAS-2026-1002', NULL, 2, 'Zara Khan', 'zara.khan@gmail.com', '+92 300 7771234', '61101-9876543-2', '${fmt(futureCheckIn)}', '${fmt(futureCheckOut)}', 2, 2, 0, 84000, 4500, 0, NULL, 88500, 'bank_transfer', 'verified', 'HBL-TRX-554109', 'confirmed', 'Arriving on PK-451 flight. Need airport pickup.', 'Bank receipt verified with HBL Katpana branch.'),
    (3, 'OAS-2026-1003', NULL, 3, 'Hamza Ali', 'hamza.ali@yahoo.com', '+92 333 4441122', '42201-1122334-5', '${fmt(inHouseCheckIn)}', '${fmt(inHouseCheckOut)}', 4, 2, 1, 128000, 0, 0, NULL, 128000, 'pay_at_hotel', 'pending', NULL, 'checked_in', 'Extra Bukhari wood required for cold nights.', 'Checked in yesterday. Room 103.')
  `);

  await query(`
    INSERT INTO booking_add_ons (booking_id, add_on_id, quantity, unit_price, total_price) VALUES
    (1, 1, 1, 9500, 9500),
    (1, 2, 1, 12000, 12000),
    (2, 5, 1, 4500, 4500)
  `);

  // 12. Seed Review for Completed Booking
  await query(`
    INSERT INTO reviews (booking_id, room_id, guest_name, rating, comment, is_approved) VALUES
    (1, 1, 'Malik Tariq', 5, 'Spectacular views of Katpana desert and the Karakoram peaks! The heated floors were a blessing in the evening and the staff arranged our sunrise dune safari flawlessly. Will return next cherry blossom season.', 1)
  `);
}

module.exports = {
  getPool,
  query,
  initDatabase,
};
