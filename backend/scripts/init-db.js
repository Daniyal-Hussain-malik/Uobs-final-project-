const { initDatabase } = require('../config/db');

async function main() {
  console.log('🚀 Running OASIS Resort Skardu MySQL Database Initializer...');
  const success = await initDatabase();
  if (success) {
    console.log('🎉 Database and tables are ready!');
    process.exit(0);
  } else {
    console.error('❌ Database initialization failed. Check your MySQL server status and .env settings.');
    process.exit(1);
  }
}

main();
