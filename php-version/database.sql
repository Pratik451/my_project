-- Ekata Saving & Credit Cooperative Ltd. (एकता बचत तथा ऋण सहकारी संस्था लि.)
-- MySQL / MariaDB Database Schema & Complete Seed Data (database.sql)
-- Fully Compatible with XAMPP (Apache + MySQL), phpMyAdmin, cPanel, and LAMP stacks

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:45";
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `ekata_cooperative` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ekata_cooperative`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `loan_applications`;
DROP TABLE IF EXISTS `member_applications`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `ekym_submissions`;
DROP TABLE IF EXISTS `popup_notices`;
DROP TABLE IF EXISTS `media_files`;
DROP TABLE IF EXISTS `interest_rates`;
DROP TABLE IF EXISTS `notices`;
DROP TABLE IF EXISTS `frontend_slides`;
DROP TABLE IF EXISTS `gallery_items`;
DROP TABLE IF EXISTS `services_cms`;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `gallery`;
DROP TABLE IF EXISTS `downloads`;
DROP TABLE IF EXISTS `bod_members`;
DROP TABLE IF EXISTS `remittance_requests`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(30) DEFAULT 'staff',
  `email` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_code` VARCHAR(30) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `pin_hash` VARCHAR(255) NOT NULL,
  `share_amount` DECIMAL(12,2) DEFAULT 0.00,
  `regular_saving_balance` DECIMAL(12,2) DEFAULT 0.00,
  `loan_balance` DECIMAL(12,2) DEFAULT 0.00,
  `kyc_status` VARCHAR(20) DEFAULT 'verified',
  `branch` VARCHAR(50) DEFAULT 'Main Branch - Butwal',
  `joined_date` VARCHAR(30) DEFAULT '2065-04-15',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_code` VARCHAR(30) NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `balance_after` DECIMAL(12,2) NOT NULL,
  `particulars` VARCHAR(255) NOT NULL,
  `trans_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `loan_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_no` VARCHAR(40),
  `tracking_code` VARCHAR(40) UNIQUE,
  `member_no` VARCHAR(40),
  `applicant_name` VARCHAR(120) NOT NULL,
  `applicant_name_np` VARCHAR(120),
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `address` VARCHAR(255),
  `loan_type` VARCHAR(80),
  `loan_scheme` VARCHAR(80) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `duration_months` INT DEFAULT 24,
  `tenure_months` INT NOT NULL DEFAULT 24,
  `interest_rate` VARCHAR(20) DEFAULT '12.5%',
  `purpose` TEXT,
  `collateral_type` VARCHAR(120),
  `collateral_value` VARCHAR(60),
  `monthly_income` VARCHAR(60) NOT NULL DEFAULT '0',
  `guarantor_name` VARCHAR(120),
  `guarantor_phone` VARCHAR(30),
  `guarantor_member_no` VARCHAR(40),
  `status` VARCHAR(30) DEFAULT 'Pending',
  `remarks` TEXT,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `member_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_no` VARCHAR(40) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `citizenship_no` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` VARCHAR(200) NOT NULL,
  `saving_scheme` VARCHAR(80) NOT NULL,
  `initial_deposit` DECIMAL(12,2) DEFAULT 1000.00,
  `status` VARCHAR(30) DEFAULT 'Pending Verification',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `subject` VARCHAR(150),
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Unread',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `interest_rates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(20) NOT NULL,
  `scheme_en` VARCHAR(100) NOT NULL,
  `scheme_np` VARCHAR(100) NOT NULL,
  `rate_percent` DECIMAL(5,2) NOT NULL,
  `basis_en` VARCHAR(120) NOT NULL,
  `basis_np` VARCHAR(120) NOT NULL,
  `min_balance` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(255) NOT NULL,
  `title_np` VARCHAR(255) NOT NULL,
  `category` VARCHAR(80) DEFAULT 'General',
  `category_en` VARCHAR(80) DEFAULT 'General',
  `category_np` VARCHAR(80) DEFAULT 'सामान्य सूचना',
  `publish_date` VARCHAR(50),
  `date_en` VARCHAR(50) NOT NULL,
  `date_np` VARCHAR(50) NOT NULL,
  `summary_en` TEXT,
  `summary_np` TEXT,
  `content_en` TEXT,
  `content_np` TEXT,
  `is_urgent` INT DEFAULT 0,
  `is_active` INT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ekym_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_no` VARCHAR(40) NOT NULL UNIQUE,
  `member_no` VARCHAR(40),
  `submission_type` VARCHAR(20) DEFAULT 'update',
  `saving_scheme` VARCHAR(80) DEFAULT 'regular',
  `initial_deposit` VARCHAR(40) DEFAULT '1000',
  `full_name_en` VARCHAR(120) NOT NULL,
  `full_name_np` VARCHAR(120) NOT NULL,
  `father_name` VARCHAR(120) NOT NULL,
  `grandfather_name` VARCHAR(120) NOT NULL,
  `mother_name` VARCHAR(120),
  `spouse_name` VARCHAR(120),
  `dob` VARCHAR(30) NOT NULL,
  `dob_ad` VARCHAR(30),
  `gender` VARCHAR(20) NOT NULL,
  `marital_status` VARCHAR(30),
  `nationality` VARCHAR(40) DEFAULT 'Nepali',
  `citizenship_no` VARCHAR(50) NOT NULL,
  `citizenship_district` VARCHAR(50) NOT NULL,
  `citizenship_issue_date` VARCHAR(30),
  `pan_no` VARCHAR(40),
  `phone` VARCHAR(20) NOT NULL,
  `alt_phone` VARCHAR(20),
  `email` VARCHAR(100),
  `perm_province` VARCHAR(80),
  `perm_district` VARCHAR(80),
  `perm_municipality` VARCHAR(120),
  `perm_ward` VARCHAR(20),
  `perm_tole` VARCHAR(120),
  `temp_municipality` VARCHAR(120),
  `temp_ward` VARCHAR(20),
  `temp_tole` VARCHAR(120),
  `temp_district` VARCHAR(80),
  `permanent_address` VARCHAR(200) NOT NULL,
  `current_address` VARCHAR(200) NOT NULL,
  `occupation` VARCHAR(100) NOT NULL,
  `organization_name` VARCHAR(150),
  `annual_income` VARCHAR(50) NOT NULL,
  `income_source` VARCHAR(100),
  `bank_name` VARCHAR(100) NOT NULL,
  `bank_account_no` VARCHAR(50) NOT NULL,
  `nominee_name` VARCHAR(120) NOT NULL,
  `nominee_relation` VARCHAR(50) NOT NULL,
  `nominee_citizenship` VARCHAR(50),
  `nominee_phone` VARCHAR(30),
  `doc_photo` VARCHAR(255),
  `doc_citizenship` VARCHAR(255),
  `doc_signature` VARCHAR(255),
  `doc_photo_data` LONGTEXT,
  `doc_citizenship_data` LONGTEXT,
  `doc_signature_data` LONGTEXT,
  `status` VARCHAR(30) DEFAULT 'Pending',
  `remarks` TEXT,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `frontend_slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(200) NOT NULL,
  `title_np` VARCHAR(200) NOT NULL,
  `subtitle_en` TEXT,
  `subtitle_np` TEXT,
  `image_url` TEXT NOT NULL,
  `cta_text_en` VARCHAR(100),
  `cta_text_np` VARCHAR(100),
  `cta_link` VARCHAR(200),
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(200) NOT NULL,
  `title_np` VARCHAR(200) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `image_url` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `services_cms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(60) NOT NULL UNIQUE,
  `title_en` VARCHAR(150) NOT NULL,
  `title_np` VARCHAR(150) NOT NULL,
  `description_en` TEXT NOT NULL,
  `description_np` TEXT NOT NULL,
  `icon` VARCHAR(30) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `badge` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `popup_notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `notice_key` VARCHAR(80) UNIQUE,
  `active` INT DEFAULT 1,
  `title_en` VARCHAR(255) NOT NULL,
  `title_np` VARCHAR(255) NOT NULL,
  `category_en` VARCHAR(100) NOT NULL,
  `category_np` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(255),
  `content_en` TEXT NOT NULL,
  `content_np` TEXT NOT NULL,
  `bullet_points_en` TEXT,
  `bullet_points_np` TEXT,
  `date_en` VARCHAR(60),
  `date_np` VARCHAR(60),
  `notice_ref` VARCHAR(100),
  `action_text_en` VARCHAR(120),
  `action_text_np` VARCHAR(120),
  `action_link` VARCHAR(120),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `media_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `media_key` VARCHAR(100) UNIQUE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(60) DEFAULT 'general',
  `mime_type` VARCHAR(80) DEFAULT 'image/svg+xml',
  `file_path` VARCHAR(255) NOT NULL,
  `filename` VARCHAR(255),
  `file_data` LONGTEXT,
  `file_size` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(255) NOT NULL,
  `title_np` VARCHAR(255) NOT NULL,
  `category` VARCHAR(80) DEFAULT 'Events',
  `category_en` VARCHAR(80) DEFAULT 'Events',
  `category_np` VARCHAR(80) DEFAULT 'कार्यक्रम',
  `image_url` LONGTEXT NOT NULL,
  `date_en` VARCHAR(50),
  `date_np` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `downloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(255) NOT NULL,
  `title_np` VARCHAR(255) NOT NULL,
  `category` VARCHAR(80) DEFAULT 'Forms',
  `category_en` VARCHAR(80) DEFAULT 'Forms',
  `category_np` VARCHAR(80) DEFAULT 'फारमहरू',
  `file_size` VARCHAR(40) DEFAULT '245 KB',
  `file_type` VARCHAR(20) DEFAULT 'PDF',
  `file_url` LONGTEXT,
  `date_en` VARCHAR(50),
  `date_np` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bod_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name_en` VARCHAR(120) NOT NULL,
  `name_np` VARCHAR(120) NOT NULL,
  `role_en` VARCHAR(120) NOT NULL,
  `role_np` VARCHAR(120) NOT NULL,
  `committee` VARCHAR(60) DEFAULT 'board',
  `phone` VARCHAR(30),
  `email` VARCHAR(100),
  `image_url` LONGTEXT,
  `experience_en` VARCHAR(200),
  `experience_np` VARCHAR(200),
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `remittance_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_no` VARCHAR(40) UNIQUE NOT NULL,
  `sender_name` VARCHAR(120) NOT NULL,
  `sender_country` VARCHAR(80) NOT NULL,
  `receiver_name` VARCHAR(120) NOT NULL,
  `receiver_phone` VARCHAR(30) NOT NULL,
  `partner_agency` VARCHAR(80) NOT NULL,
  `control_pin` VARCHAR(60) NOT NULL,
  `expected_amount` VARCHAR(60) NOT NULL,
  `payout_mode` VARCHAR(40) DEFAULT 'Account Deposit',
  `member_account_no` VARCHAR(60),
  `status` VARCHAR(30) DEFAULT 'Pending',
  `remarks` TEXT,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
