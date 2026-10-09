const { query } = require('../config/db');

async function migrateGallery() {
  console.log('--- Migrating Gallery & Gallery Categories ---');

  // 1. Create gallery_categories table
  await query(`
    CREATE TABLE IF NOT EXISTS gallery_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ gallery_categories table ensured.');

  // 2. Seed initial categories if empty
  const existingCats = await query('SELECT COUNT(*) as count FROM gallery_categories');
  if (existingCats[0].count === 0) {
    const initialCategories = [
      { name: 'Landscape & Dunes', slug: 'landscape-dunes', description: 'Breathtaking white sand dunes of Katpana and Karakoram mountain views.', sort_order: 1 },
      { name: 'Luxury Rooms', slug: 'luxury-rooms', description: 'Architectural suites, private villas, and starlit bedrooms.', sort_order: 2 },
      { name: 'Balti Dining', slug: 'balti-dining', description: 'Riverside dinners, bonfire BBQs, and authentic mountain delicacies.', sort_order: 3 },
      { name: 'Adventure & Stargazing', slug: 'adventure-stargazing', description: '4x4 desert safaris, alpine hikes, and zero-light Milky Way nights.', sort_order: 4 },
      { name: 'Resort Architecture', slug: 'resort-architecture', description: 'Handcrafted local stone masonry, walnut woodwork, and serene gardens.', sort_order: 5 }
    ];

    for (const cat of initialCategories) {
      await query(
        'INSERT INTO gallery_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)',
        [cat.name, cat.slug, cat.description, cat.sort_order]
      );
    }
    console.log('✓ Initial gallery categories seeded.');
  }

  // 3. Make sure any distinct category already present in media_gallery also exists in gallery_categories
  const mediaCats = await query('SELECT DISTINCT category FROM media_gallery WHERE category IS NOT NULL AND category != ""');
  for (const row of mediaCats) {
    const slug = row.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await query(
      'INSERT IGNORE INTO gallery_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
      [row.category, slug, `${row.category} collection at OASIS Resort.`, 10]
    );
  }

  // Check counts
  const catCount = await query('SELECT COUNT(*) as count FROM gallery_categories');
  const imgCount = await query('SELECT COUNT(*) as count FROM media_gallery');
  console.log(`✓ Migration complete! Categories: ${catCount[0].count}, Images: ${imgCount[0].count}`);
  process.exit(0);
}

migrateGallery().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
