const { query } = require('../config/db');

async function migrate() {
  try {
    const cols = await query("SHOW COLUMNS FROM bookings LIKE 'rooms_count'");
    if (cols.length === 0) {
      await query("ALTER TABLE bookings ADD COLUMN rooms_count INT DEFAULT 1 AFTER children");
      console.log('Successfully added rooms_count column to bookings table.');
    } else {
      console.log('rooms_count column already exists in bookings table.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
