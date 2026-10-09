const { query, pool } = require('../config/db');

async function migrateV4() {
  console.log('--- STARTING V4 DATABASE MIGRATION ---');

  try {
    // 1. Add total_rooms to room_categories if not exists
    const catCols = await query("SHOW COLUMNS FROM room_categories LIKE 'total_rooms'");
    if (catCols.length === 0) {
      await query("ALTER TABLE room_categories ADD COLUMN total_rooms INT NOT NULL DEFAULT 4 AFTER description");
      console.log('✓ Added total_rooms column to room_categories');
    }

    // Set specific realistic inventories for default categories
    await query("UPDATE room_categories SET total_rooms = 4 WHERE slug = 'deluxe-room'");
    await query("UPDATE room_categories SET total_rooms = 3 WHERE slug = 'suite'");
    await query("UPDATE room_categories SET total_rooms = 2 WHERE slug = 'villa'");
    await query("UPDATE room_categories SET total_rooms = 4 WHERE slug = 'cottage'");
    await query("UPDATE room_categories SET total_rooms = 4 WHERE slug = 'glamping-tent'");
    await query("UPDATE room_categories SET total_rooms = 2 WHERE slug = 'executive-suite'");
    await query("UPDATE room_categories SET total_rooms = 3 WHERE slug = 'heritage-cottage'");
    await query("UPDATE room_categories SET total_rooms = 2 WHERE slug = 'luxury-villa'");
    console.log('✓ Updated room_categories inventory counts (Deluxe: 4 rooms, etc.)');

    // 2. Create dining_items table
    await query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Created dining_items table');

    // Seed dining_items if empty
    const diningCount = await query('SELECT COUNT(*) as count FROM dining_items');
    if (diningCount[0].count === 0) {
      const defaultDining = [
        [
          'Private Candlelight Dunes Dinner',
          'Deal & Package',
          'Romantic Dining',
          'Intimate five-course candlelight dinner set amidst Katpana cold desert dunes with Indus river views and private bonfire.',
          6500.00,
          'per_couple',
          '5-Course Curated Balti Menu, Wild Mint Mocktails, Apricot Wood Private Bonfire, Rose Petal Table Setup, Dedicated Host',
          'Sunset Sitting (18:30 - 20:30), Night Starlight (20:45 - 23:00)',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
          1,
          1
        ],
        [
          'Balti Dum Pukht & River Trout Feast',
          'Signature Special',
          'Traditional Balti',
          'Traditional slow-simmered lamb in clay vessels cooked with mountain herbs, paired with freshly caught grilled Indus river trout.',
          8500.00,
          'per_couple',
          'Clay Vessel Dum Pukht Lamb, Charcoal Grilled Indus Trout, Dry Fruit Pulao, Balti Flatbreads, Saffron Kahwa',
          'Lunch (12:30 - 15:00), Dinner (19:30 - 22:30)',
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
          1,
          2
        ],
        [
          'Katpana Sunset Bonfire & Live BBQ Night',
          'Deal & Package',
          'Live BBQ & Bonfire',
          'Under the Karakoram night sky, indulge in skewered lamb tikka, saffron chicken boti, and baked potatoes around a roaring fire.',
          4500.00,
          'per_person',
          'Lamb & Beef Chops, Skewer Chicken Tikka, Smoked River Fish, Hot Naan, Balti Mint Chutney, Marshmallows for Bonfire',
          'Dusk Sitting (18:00 - 20:30), Late Bonfire (21:00 - 23:30)',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
          1,
          3
        ],
        [
          'Himalayan Organic Breakfast Buffet',
          'Restaurant Menu',
          'Breakfast Buffet',
          'Rich alpine breakfast spread with Skardu valley farm eggs, raw wildflower honey, apricot jam, yak cheese, and freshly baked sourdough.',
          2800.00,
          'per_person',
          'Farm Fresh Eggs cooked to order, Organic Honeycomb, Yak Cheese platter, Apricot Pastries, Mountain Herbal Teas & Fresh Coffee',
          'Morning (07:00 - 10:30)',
          'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80',
          1,
          4
        ],
        [
          'Desert Tea & Salted Butter Kahwa Tasting',
          'Restaurant Menu',
          'Tea & Refreshments',
          'Traditional Balti high-tea featuring herbal Kashmiri tea, salted yak butter tea, roasted walnuts, dried mulberries, and local cookies.',
          1500.00,
          'per_person',
          'Kashmiri Pink Chai, Tibetan Salted Butter Tea, Roasted Balti Walnuts & Dried Apricots, Traditional Khurba Bread',
          'Afternoon (15:00 - 18:00)',
          'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80',
          1,
          5
        ]
      ];

      for (const item of defaultDining) {
        await query(
          `INSERT INTO dining_items (title, deal_type, category, description, price, pricing_unit, menu_inclusions, time_slots, image_url, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item
        );
      }
      console.log('✓ Seeded default dining deals and restaurant menus');
    }

    // 3. Create experiences table
    await query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Desert Safari',
        duration VARCHAR(100) NOT NULL DEFAULT '2 Hours',
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        pricing_unit VARCHAR(50) NOT NULL DEFAULT 'per_vehicle',
        inclusions TEXT,
        time_slots VARCHAR(255) NOT NULL DEFAULT 'Sunrise Thrill (06:00 - 08:00), Sunset Dunes (17:00 - 18:30)',
        image_url VARCHAR(500),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Created experiences table');

    // Seed experiences if empty
    const expCount = await query('SELECT COUNT(*) as count FROM experiences');
    if (expCount[0].count === 0) {
      const defaultExp = [
        [
          'Katpana Dunes 4x4 Jeep Safari',
          'Desert Safari',
          '1.5 Hours',
          'Thrilling off-road dune bashing in high-altitude cold desert dunes with seasoned rally drivers and sunset photo stops.',
          12000.00,
          'per_vehicle',
          '4x4 Land Cruiser with fuel & professional driver, Sandboarding gear, Bottled mineral water & hot kahwa, GoPro action photos',
          'Sunrise Rush (06:30 - 08:00), Sunset Thrill (17:00 - 18:30)',
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
          1,
          1
        ],
        [
          'Karakoram Zero-Pollution Stargazing & Astrophotography',
          'Stargazing & Astronomy',
          '2 Hours',
          'Witness the Milky Way arc directly over snow-capped Himalayan peaks through professional 12-inch Dobsonian telescopes.',
          5000.00,
          'per_person',
          'High-powered optical telescope session, Resident astronomer guided tour, Fleece blankets & heated campfire, Saffron cardamom tea',
          'Night Sky Session 1 (21:00 - 23:00), Deep Midnight Session (23:30 - 01:30)',
          'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80',
          1,
          2
        ],
        [
          'Deosai Plains & Sheosar Lake High-Plateau Expedition',
          'Adventure Expedition',
          'Full Day (8 Hours)',
          'Journey to the Roof of the World at 4,000 meters altitude. Spot Himalayan brown bears and picnic by turquoise glacial waters.',
          28000.00,
          'per_vehicle',
          'Private 4x4 Prado with expert mountain driver, National park entry permits, Gourmet packed lunch & hot beverages, First aid & oxygen kit',
          'Full Day Departure (07:30 - 16:30)',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
          1,
          3
        ],
        [
          'Cold Desert Camel Caravan Sunset Walk',
          'Desert Experience',
          '1 Hour',
          'Gentle camel trek along the Katpana white sand dunes accompanied by native Silk Road caravaneers as the sun dips behind mountains.',
          3500.00,
          'per_person',
          'Trained desert riding camel, Native caravaneer guide, Traditional Balti woolen shawl, Sunset dune photography assistance',
          'Morning Breeze (08:00 - 09:00), Golden Hour (17:30 - 18:30)',
          'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1000&q=80',
          1,
          4
        ],
        [
          'Baltistan Heritage & Organic Orchard Cultural Walk',
          'Cultural & Heritage',
          '2.5 Hours',
          'Stroll through ancient apricot orchards, meet local stone artisans, and learn traditional Balti wood carving at heritage village houses.',
          4000.00,
          'per_person',
          'Native English & Urdu speaking cultural guide, Village entry & artisan workshop access, Fresh apricot & walnut tasting, Artisanal craft souvenir',
          'Morning Tour (09:30 - 12:00), Afternoon Tour (15:00 - 17:30)',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
          1,
          5
        ]
      ];

      for (const item of defaultExp) {
        await query(
          `INSERT INTO experiences (title, category, duration, description, price, pricing_unit, inclusions, time_slots, image_url, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item
        );
      }
      console.log('✓ Seeded default resort experiences');
    }

    console.log('--- V4 MIGRATION COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrateV4();
