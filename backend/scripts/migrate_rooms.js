const { query } = require('../config/db');

async function migrate() {
  try {
    const cols = await query("SHOW COLUMNS FROM rooms LIKE 'housekeeping_status'");
    if (cols.length === 0) {
      await query("ALTER TABLE rooms ADD COLUMN housekeeping_status VARCHAR(50) DEFAULT 'ready to serve'");
      console.log('Successfully added housekeeping_status column to rooms');
    } else {
      console.log('housekeeping_status column already exists');
    }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
