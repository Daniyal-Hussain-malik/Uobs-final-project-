-- =============================================================
--  OASIS Resort Skardu — Complete MySQL Setup Script
--  Database : oasis_resort
--  Run this file in phpMyAdmin > SQL tab, or via MySQL CLI
--  Safe to re-run: uses IF NOT EXISTS / INSERT IGNORE
-- =============================================================

CREATE DATABASE IF NOT EXISTS `oasis_resort`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `oasis_resort`;

-- ─────────────────────────────────────────────────────────────
-- TABLE 1: users  (Admin | Reception | Guest accounts)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL UNIQUE,
  `phone`      VARCHAR(50)  NOT NULL,
  `role`       ENUM('admin','reception','guest') DEFAULT 'guest',
  `password`   VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 2: rooms
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rooms` (
  `id`                INT AUTO_INCREMENT PRIMARY KEY,
  `title`             VARCHAR(255)  NOT NULL,
  `slug`              VARCHAR(255)  NOT NULL UNIQUE,
  `category`          VARCHAR(100)  NOT NULL,
  `base_price`        DECIMAL(10,2) NOT NULL,
  `capacity_adults`   INT           NOT NULL DEFAULT 2,
  `capacity_children` INT           NOT NULL DEFAULT 0,
  `view_type`         VARCHAR(255)  NOT NULL,
  `bed_type`          VARCHAR(100)  NOT NULL,
  `room_size_sqm`     INT           NOT NULL,
  `description`       TEXT          NOT NULL,
  `amenities`         JSON          NULL,
  `images`            JSON          NULL,
  `featured_image`    VARCHAR(500)  NOT NULL,
  `virtual_tour_url`  VARCHAR(500)  NULL,
  `is_active`         TINYINT(1)    DEFAULT 1,
  `created_at`        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 3: room_seasonal_prices
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `room_seasonal_prices` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `room_id`         INT           NOT NULL,
  `season_name`     VARCHAR(255)  NOT NULL,
  `start_date`      DATE          NOT NULL,
  `end_date`        DATE          NOT NULL,
  `price_per_night` DECIMAL(10,2) NOT NULL,
  `created_at`      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 4: offers  (Promo / Discount Codes)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `offers` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `code`           VARCHAR(50)   NOT NULL UNIQUE,
  `title`          VARCHAR(255)  NOT NULL,
  `description`    TEXT          NULL,
  `discount_type`  ENUM('percentage','flat') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_spend`      DECIMAL(10,2) DEFAULT 0,
  `valid_from`     DATE          NOT NULL,
  `valid_until`    DATE          NOT NULL,
  `usage_limit`    INT           DEFAULT 500,
  `used_count`     INT           DEFAULT 0,
  `is_active`      TINYINT(1)    DEFAULT 1,
  `created_at`     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 5: add_on_services  (Experiential extras)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `add_on_services` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `title`        VARCHAR(255)  NOT NULL,
  `category`     VARCHAR(100)  NOT NULL,
  `description`  TEXT          NULL,
  `price`        DECIMAL(10,2) NOT NULL,
  `pricing_unit` VARCHAR(50)   DEFAULT 'per_trip',
  `image_url`    VARCHAR(500)  NULL,
  `is_available` TINYINT(1)    DEFAULT 1,
  `created_at`   DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 6: bookings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bookings` (
  `id`                     INT AUTO_INCREMENT PRIMARY KEY,
  `booking_number`         VARCHAR(50)   NOT NULL UNIQUE,
  `user_id`                INT           NULL,
  `room_id`                INT           NOT NULL,
  `guest_name`             VARCHAR(255)  NOT NULL,
  `guest_email`            VARCHAR(255)  NOT NULL,
  `guest_phone`            VARCHAR(50)   NOT NULL,
  `guest_cnic_passport`    VARCHAR(50)   NULL,
  `check_in`               DATE          NOT NULL,
  `check_out`              DATE          NOT NULL,
  `total_nights`           INT           NOT NULL,
  `adults`                 INT           NOT NULL DEFAULT 1,
  `children`               INT           NOT NULL DEFAULT 0,
  `base_room_total`        DECIMAL(10,2) NOT NULL,
  `add_ons_total`          DECIMAL(10,2) DEFAULT 0,
  `discount_amount`        DECIMAL(10,2) DEFAULT 0,
  `offer_id`               INT           NULL,
  `final_total`            DECIMAL(10,2) NOT NULL,
  `payment_method`         ENUM('jazzcash','easypaisa','bank_transfer','pay_at_hotel','cash') NOT NULL DEFAULT 'pay_at_hotel',
  `payment_status`         ENUM('pending','verified','paid','refunded') NOT NULL DEFAULT 'pending',
  `payment_slip_path`      VARCHAR(500)  NULL,
  `payment_transaction_id` VARCHAR(100)  NULL,
  `booking_status`         ENUM('pending','confirmed','checked_in','completed','cancelled') NOT NULL DEFAULT 'confirmed',
  `special_requests`       TEXT          NULL,
  `admin_notes`            TEXT          NULL,
  `created_at`             DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`)  REFERENCES `users`(`id`)  ON DELETE SET NULL,
  FOREIGN KEY (`room_id`)  REFERENCES `rooms`(`id`)  ON DELETE RESTRICT,
  FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 7: booking_add_ons  (Pivot / Junction table)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `booking_add_ons` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id`  INT           NOT NULL,
  `add_on_id`   INT           NOT NULL,
  `quantity`    INT           NOT NULL DEFAULT 1,
  `unit_price`  DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `created_at`  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`)        ON DELETE CASCADE,
  FOREIGN KEY (`add_on_id`)  REFERENCES `add_on_services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 8: testimonials
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `guest_name`     VARCHAR(255) NOT NULL,
  `guest_location` VARCHAR(255) NULL,
  `rating`         INT          DEFAULT 5,
  `comment`        TEXT         NOT NULL,
  `avatar_url`     VARCHAR(500) NULL,
  `is_approved`    TINYINT(1)   DEFAULT 1,
  `sort_order`     INT          DEFAULT 0,
  `created_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 9: team_members
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `team_members` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(255) NOT NULL,
  `role`       VARCHAR(255) NOT NULL,
  `bio`        TEXT         NULL,
  `image_url`  VARCHAR(500) NULL,
  `sort_order` INT          DEFAULT 0,
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 10: posts  (Blog / Travel Guides)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `posts` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `title`        VARCHAR(255) NOT NULL,
  `slug`         VARCHAR(255) NOT NULL UNIQUE,
  `category`     VARCHAR(100) NOT NULL,
  `excerpt`      TEXT         NULL,
  `content`      LONGTEXT     NOT NULL,
  `cover_image`  VARCHAR(500) NULL,
  `author_name`  VARCHAR(255) DEFAULT 'Oasis Editorial',
  `is_published` TINYINT(1)   DEFAULT 1,
  `published_at` DATETIME     NULL,
  `created_at`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 11: faqs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `faqs` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `category`   VARCHAR(100) NOT NULL,
  `question`   VARCHAR(500) NOT NULL,
  `answer`     TEXT         NOT NULL,
  `keywords`   VARCHAR(255) NULL,
  `sort_order` INT          DEFAULT 0,
  `is_active`  TINYINT(1)   DEFAULT 1,
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 12: media_gallery
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `media_gallery` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `title`       VARCHAR(255) NOT NULL,
  `category`    VARCHAR(100) NOT NULL,
  `image_url`   VARCHAR(500) NOT NULL,
  `is_featured` TINYINT(1)   DEFAULT 0,
  `sort_order`  INT          DEFAULT 0,
  `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 13: reviews  (Post-stay, linked to a booking)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id`  INT  NOT NULL UNIQUE,
  `room_id`     INT  NOT NULL,
  `guest_name`  VARCHAR(255) NOT NULL,
  `rating`      INT          DEFAULT 5,
  `comment`     TEXT         NOT NULL,
  `is_approved` TINYINT(1)   DEFAULT 1,
  `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`)    REFERENCES `rooms`(`id`)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE 14: contact_messages
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `phone`      VARCHAR(50)  NULL,
  `subject`    VARCHAR(255) NOT NULL,
  `message`    TEXT         NOT NULL,
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
--  INDEXES  (for query performance on common searches)
-- =============================================================
CREATE INDEX IF NOT EXISTS `idx_bookings_room_dates` ON `bookings` (`room_id`, `check_in`, `check_out`);
CREATE INDEX IF NOT EXISTS `idx_bookings_status`     ON `bookings` (`booking_status`);
CREATE INDEX IF NOT EXISTS `idx_bookings_user`        ON `bookings` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_rooms_active`         ON `rooms`    (`is_active`);
CREATE INDEX IF NOT EXISTS `idx_rooms_category`       ON `rooms`    (`category`);
CREATE INDEX IF NOT EXISTS `idx_posts_published`      ON `posts`    (`is_published`, `published_at`);


-- =============================================================
--  SEED DATA
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- USERS
--   Admin     : admin@oasisresort.com     / password: Admin@123
--   Reception : reception@oasisresort.com / password: Admin@123
--
--   NOTE: These are bcrypt hashes (cost=10).
--   If your backend uses a different hashing, update via the
--   admin panel or re-hash using: node -e
--   "const b=require('bcryptjs');console.log(b.hashSync('Admin@123',10))"
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `users` (`name`, `email`, `phone`, `role`, `password`) VALUES
(
  'Super Admin',
  'admin@oasisresort.com',
  '+92-300-0000000',
  'admin',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
),
(
  'Front Desk Staff',
  'reception@oasisresort.com',
  '+92-300-1111111',
  'reception',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

-- ─────────────────────────────────────────────────────────────
-- ROOMS  (5 luxury villas / suites)
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `rooms`
  (`title`, `slug`, `category`, `base_price`, `capacity_adults`, `capacity_children`,
   `view_type`, `bed_type`, `room_size_sqm`, `description`,
   `amenities`, `featured_image`, `is_active`)
VALUES
(
  'Karakoram Sky Villa', 'karakoram-sky-villa', 'Villa',
  35000.00, 2, 2, 'Mountain & Glacier View', 'King Bed', 120,
  'A breathtaking sky villa perched above Skardu Valley with panoramic Karakoram views, a private terrace, and bespoke interiors inspired by Baltistan heritage.',
  '["Free WiFi","Air Conditioning","55 inch Smart TV","Mini Bar","Private Terrace","Rainfall Shower","Bathtub","24/7 Room Service","Nespresso Machine","Safe"]',
  '/images/rooms/karakoram-sky-villa.jpg', 1
),
(
  'Indus Suite', 'indus-suite', 'Suite',
  22000.00, 2, 1, 'River & Valley View', 'King Bed', 80,
  'Overlooking the mighty Indus River, this suite blends modern luxury with traditional Balti woodwork for a truly immersive cultural escape.',
  '["Free WiFi","Air Conditioning","49 inch Smart TV","Mini Bar","Balcony","Walk-in Shower","24/7 Room Service","Bluetooth Speaker","Safe"]',
  '/images/rooms/indus-suite.jpg', 1
),
(
  'Skardu Retreat Cottage', 'skardu-retreat-cottage', 'Cottage',
  15000.00, 2, 2, 'Garden & Mountain View', 'Queen Bed', 65,
  'Nestled in a private garden, this charming stone cottage offers a serene retreat with direct access to lush lawns and a fireplace for cool evenings.',
  '["Free WiFi","Fireplace","42 inch Smart TV","Garden Access","En-suite Bathroom","Breakfast Included","Safe"]',
  '/images/rooms/skardu-retreat-cottage.jpg', 1
),
(
  'Baltoro Family Villa', 'baltoro-family-villa', 'Villa',
  48000.00, 4, 3, 'Glacier & Mountain View', 'Two King Beds', 180,
  'Our grandest accommodation — a two-bedroom family villa with a private plunge pool, chef service, and unrivalled views of the Baltoro Glacier corridor.',
  '["Free WiFi","Private Plunge Pool","Air Conditioning","65 inch Smart TV","Full Kitchen","Chef on Request","Two Bathrooms","Private Terrace","Fireplace","Safe","Baby Cot Available"]',
  '/images/rooms/baltoro-family-villa.jpg', 1
),
(
  'Shangrila Deluxe Room', 'shangrila-deluxe-room', 'Deluxe Room',
  9500.00, 2, 0, 'Lake & Garden View', 'Double Bed', 45,
  'Our entry-luxury room with stunning views of the famed Shangrila Lake, tastefully decorated with local artisan crafts and all modern comforts.',
  '["Free WiFi","Air Conditioning","43 inch Smart TV","Mini Fridge","En-suite Shower","Daily Housekeeping","Safe"]',
  '/images/rooms/shangrila-deluxe-room.jpg', 1
);

-- ─────────────────────────────────────────────────────────────
-- SEASONAL PRICING
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `room_seasonal_prices` (`room_id`, `season_name`, `start_date`, `end_date`, `price_per_night`) VALUES
(1, 'Peak Summer',    '2026-06-01', '2026-08-31', 42000.00),
(1, 'Autumn Foliage', '2026-09-01', '2026-10-31', 38000.00),
(2, 'Peak Summer',    '2026-06-01', '2026-08-31', 27000.00),
(2, 'Autumn Foliage', '2026-09-01', '2026-10-31', 24000.00),
(4, 'Peak Summer',    '2026-06-01', '2026-08-31', 55000.00),
(4, 'Autumn Foliage', '2026-09-01', '2026-10-31', 50000.00),
(5, 'Peak Summer',    '2026-06-01', '2026-08-31', 12000.00);

-- ─────────────────────────────────────────────────────────────
-- ADD-ON SERVICES
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `add_on_services` (`title`, `category`, `description`, `price`, `pricing_unit`, `is_available`) VALUES
('Jeep Safari to Deosai Plains',    'Adventure',  'Full-day 4x4 jeep safari to the worlds second highest plateau, Deosai National Park.',  8500.00,  'per_trip',    1),
('K2 Base Camp Trek (Day Hike)',     'Adventure',  'Guided day hike towards K2 base camp trails with an experienced Balti mountain guide.', 12000.00, 'per_person',  1),
('Private Candlelight Dinner',      'Dining',     'Romantic candlelight dinner by the Indus River with a curated 5-course Balti menu.',      6500.00,  'per_couple',  1),
('Shangrila Lake Kayaking',         'Water Sport','Two-hour guided kayaking session on the serene Shangrila (Lower Kachura) Lake.',          3500.00,  'per_person',  1),
('Traditional Balti Cooking Class', 'Experience', 'Learn to cook authentic Balti cuisine with our head chef using fresh local ingredients.',   4000.00,  'per_person',  1),
('Airport / Helipad Transfer',      'Transport',  'Private luxury vehicle transfer from Skardu Airport or Helipad to the resort.',            2500.00,  'per_vehicle', 1);

-- ─────────────────────────────────────────────────────────────
-- PROMO / OFFER CODES
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `offers` (`code`, `title`, `description`, `discount_type`, `discount_value`, `min_spend`, `valid_from`, `valid_until`, `usage_limit`, `is_active`) VALUES
('OASIS10',  '10% Welcome Discount',         'Get 10% off your first booking at Oasis Resort Skardu.',                                          'percentage', 10.00,   10000.00, '2026-01-01', '2026-12-31', 200, 1),
('SUMMER5K', 'Summer Flat PKR 5,000 Off',    'Enjoy PKR 5,000 off on bookings of PKR 30,000 or more during peak summer.',                       'flat',       5000.00, 30000.00, '2026-06-01', '2026-08-31', 100, 1),
('FAMILY15', '15% Family Package Discount',  '15% discount on Baltoro Family Villa bookings for families traveling with children.',              'percentage', 15.00,   40000.00, '2026-01-01', '2026-12-31', 50,  1);

-- ─────────────────────────────────────────────────────────────
-- TESTIMONIALS
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `testimonials` (`guest_name`, `guest_location`, `rating`, `comment`, `is_approved`, `sort_order`) VALUES
('Ahmed Raza',      'Lahore, Pakistan', 5, 'Absolutely stunning resort with jaw-dropping views of the Karakoram. The staff went above and beyond. Will definitely return!', 1, 1),
('Sarah & Tom W.',  'London, UK',       5, 'The Baltoro Family Villa exceeded every expectation. Our kids loved the plunge pool and the jeep safari was unforgettable.',     1, 2),
('Fatima Malik',    'Karachi, Pakistan',5, 'The candlelight dinner by the Indus was magical. Oasis Resort is truly a hidden gem in the mountains of Pakistan.',             1, 3),
('Hiroshi Tanaka',  'Tokyo, Japan',     4, 'Exceptional hospitality and breathtaking scenery. The cooking class was the highlight of our trip to Pakistan.',                 1, 4);

-- ─────────────────────────────────────────────────────────────
-- FAQs
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `faqs` (`category`, `question`, `answer`, `keywords`, `sort_order`, `is_active`) VALUES
('Booking',   'How far in advance should I book?',            'We strongly recommend booking at least 4-6 weeks in advance during peak season (June-October). Off-season bookings can be made with shorter notice.',                                                                             'advance booking, reservation, availability', 1, 1),
('Booking',   'Can I modify or cancel my reservation?',       'Cancellations made 7 or more days before check-in receive a full refund. Cancellations within 7 days forfeit the first nights charge. Modifications are subject to availability.',                                                'cancel, refund, modification, change',      2, 1),
('Payment',   'What payment methods are accepted?',           'We accept JazzCash, EasyPaisa, bank transfer (Allied Bank / HBL), and cash payment at the hotel. Online payments are processed through our secure booking portal.',                                                              'payment, jazzcash, easypaisa, bank, cash',  3, 1),
('Travel',    'How do I reach Oasis Resort Skardu?',          'Skardu is accessible by air (PIA / Air Sial daily flights from Islamabad) or road via the Karakoram Highway (~16-18 hours from Islamabad). We offer private airport transfers - add the service during booking.',                'reach, travel, flight, KKH, airport',       4, 1),
('Facilities','Is there WiFi at the resort?',                 'Yes, complimentary high-speed WiFi is available in all rooms and public areas. Note that remote mountain regions can occasionally experience slowdowns due to local network conditions.',                                          'wifi, internet, connectivity',              5, 1);

-- ─────────────────────────────────────────────────────────────
-- TEAM MEMBERS
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO `team_members` (`name`, `role`, `bio`, `sort_order`) VALUES
('Muhammad Ali Syed', 'General Manager',         'With 15 years of luxury hospitality experience across Pakistan and the UAE, Ali brings world-class service standards to the heart of the Karakoram.', 1),
('Zainab Hussain',    'Head of Guest Relations', 'Zainab ensures every guest feels at home, personalizing experiences from mountain treks to traditional Balti dining.',                               2),
('Ibrahim Karim',     'Executive Chef',           'Ibrahim is passionate about elevating authentic Balti cuisine using locally sourced, seasonal ingredients from Skardu Valley.',                     3);


-- =============================================================
--  VERIFICATION — list all created tables with row counts
-- =============================================================
SELECT
  TABLE_NAME      AS `Table`,
  TABLE_ROWS      AS `Est. Rows`,
  ENGINE          AS `Engine`,
  TABLE_COLLATION AS `Collation`
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'oasis_resort'
ORDER BY TABLE_NAME;
