-- OASIS Resort Skardu - Complete MySQL Schema
-- Database: oasis_resort

CREATE DATABASE IF NOT EXISTS `oasis_resort` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `oasis_resort`;

-- 1. Users Table (Admin, Reception, Guest)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) NOT NULL,
  `role` ENUM('admin', 'reception', 'guest') DEFAULT 'guest',
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL,
  `base_price` DECIMAL(10,2) NOT NULL,
  `capacity_adults` INT NOT NULL DEFAULT 2,
  `capacity_children` INT NOT NULL DEFAULT 0,
  `view_type` VARCHAR(255) NOT NULL,
  `bed_type` VARCHAR(100) NOT NULL,
  `room_size_sqm` INT NOT NULL,
  `description` TEXT NOT NULL,
  `amenities` JSON NULL,
  `images` JSON NULL,
  `featured_image` VARCHAR(500) NOT NULL,
  `virtual_tour_url` VARCHAR(500) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Room Seasonal Pricing Overrides
CREATE TABLE IF NOT EXISTS `room_seasonal_prices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `room_id` INT NOT NULL,
  `season_name` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `price_per_night` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Offers & Promo Codes
CREATE TABLE IF NOT EXISTS `offers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `discount_type` ENUM('percentage', 'flat') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_spend` DECIMAL(10,2) DEFAULT 0,
  `valid_from` DATE NOT NULL,
  `valid_until` DATE NOT NULL,
  `usage_limit` INT DEFAULT 500,
  `used_count` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Experiential Add-On Services
CREATE TABLE IF NOT EXISTS `add_on_services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `pricing_unit` VARCHAR(50) DEFAULT 'per_trip',
  `image_url` VARCHAR(500) NULL,
  `is_available` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `room_id` INT NOT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `guest_email` VARCHAR(255) NOT NULL,
  `guest_phone` VARCHAR(50) NOT NULL,
  `guest_cnic_passport` VARCHAR(50) NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `total_nights` INT NOT NULL,
  `adults` INT NOT NULL DEFAULT 1,
  `children` INT NOT NULL DEFAULT 0,
  `base_room_total` DECIMAL(10,2) NOT NULL,
  `add_ons_total` DECIMAL(10,2) DEFAULT 0,
  `discount_amount` DECIMAL(10,2) DEFAULT 0,
  `offer_id` INT NULL,
  `final_total` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('jazzcash', 'easypaisa', 'bank_transfer', 'pay_at_hotel', 'cash') NOT NULL DEFAULT 'pay_at_hotel',
  `payment_status` ENUM('pending', 'verified', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_slip_path` VARCHAR(500) NULL,
  `payment_transaction_id` VARCHAR(100) NULL,
  `booking_status` ENUM('pending', 'confirmed', 'checked_in', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  `special_requests` TEXT NULL,
  `admin_notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Booking Add-Ons Pivot Table
CREATE TABLE IF NOT EXISTS `booking_add_ons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `add_on_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`add_on_id`) REFERENCES `add_on_services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Testimonials Table
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `guest_name` VARCHAR(255) NOT NULL,
  `guest_location` VARCHAR(255) NULL,
  `rating` INT DEFAULT 5,
  `comment` TEXT NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `is_approved` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Team Members Table
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(255) NOT NULL,
  `bio` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Posts & Travel Guides Table
CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `cover_image` VARCHAR(500) NULL,
  `author_name` VARCHAR(255) DEFAULT 'Oasis Editorial',
  `is_published` TINYINT(1) DEFAULT 1,
  `published_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. FAQs Table
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(100) NOT NULL,
  `question` VARCHAR(500) NOT NULL,
  `answer` TEXT NOT NULL,
  `keywords` VARCHAR(255) NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Media Gallery Table
CREATE TABLE IF NOT EXISTS `media_gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL UNIQUE,
  `room_id` INT NOT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `rating` INT DEFAULT 5,
  `comment` TEXT NOT NULL,
  `is_approved` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
