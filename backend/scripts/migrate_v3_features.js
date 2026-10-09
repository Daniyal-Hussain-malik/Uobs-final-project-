const { query } = require('../config/db');

async function runMigration() {
  try {
    console.log('Running V3 Features Migration...');

    // 1. Room Categories Table
    await query(`
      CREATE TABLE IF NOT EXISTS room_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        image_url VARCHAR(500) NULL,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed existing categories from rooms table
    const existingRoomCats = await query('SELECT DISTINCT category FROM rooms WHERE category IS NOT NULL AND category != ""');
    for (const row of existingRoomCats) {
      const catName = row.category.trim();
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await query('SELECT id FROM room_categories WHERE name = ?', [catName]);
      if (existing.length === 0) {
        await query(
          'INSERT INTO room_categories (name, slug, description) VALUES (?, ?, ?)',
          [catName, catSlug, `Signature ${catName} sanctuaries in Katpana cold desert.`]
        );
      }
    }
    console.log('room_categories verified and seeded.');

    // 2. Payment Accounts Table
    await query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default payment accounts if empty
    const existingAccounts = await query('SELECT id FROM payment_accounts');
    if (existingAccounts.length === 0) {
      await query(`
        INSERT INTO payment_accounts (method, bank_name, account_title, account_number, iban, instructions, is_active)
        VALUES 
        (
          'bank_transfer',
          'Habib Bank Limited (HBL) Skardu',
          'Oasis Resort Katpana Pvt Ltd',
          '0001-23456789-01',
          'PK36 HABB 0001 2345 6789 0101',
          'Official Resort Corporate Account. Transfer online via 1Link or visit any HBL branch.',
          1
        ),
        (
          'jazzcash',
          'Mobilink Microfinance Bank / JazzCash',
          'Oasis Resort Katpana',
          '0308-1472888',
          'JC-TILL-9922881',
          'Transfer to JazzCash Till / Mobile Account 0308-1472888. Enter transaction reference ID & upload receipt.',
          1
        ),
        (
          'easypaisa',
          'Telenor Microfinance Bank / Easypaisa',
          'Oasis Resort Katpana',
          '0344-5537788',
          'EP-TILL-7722119',
          'Transfer to Easypaisa Mobile Account 0344-5537788. Enter transaction reference ID & upload receipt.',
          1
        )
      `);
      console.log('payment_accounts seeded with default Bank, JazzCash, Easypaisa details.');
    }

    // 3. Service Bookings Table (for standalone Dining & Experiences)
    await query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('service_bookings table verified.');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
