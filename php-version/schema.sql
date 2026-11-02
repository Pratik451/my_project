-- Ekata Saving & Credit Cooperative Ltd. (एकता बचत तथा ऋण सहकारी संस्था लि.)
-- MySQL / MariaDB Database Schema & Complete Seed Data
-- Fully Compatible with XAMPP (Apache + MySQL), phpMyAdmin, cPanel, and LAMP stacks
-- Tested on MySQL 5.7, 8.0, and MariaDB 10.3+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:45";
SET NAMES utf8mb4;

-- Note: If you already selected/created a database in phpMyAdmin, you can keep or comment out the next two lines:
CREATE DATABASE IF NOT EXISTS `ekata_cooperative` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ekata_cooperative`;

-- Disable foreign key checks during import to allow clean drops and re-creation
SET FOREIGN_KEY_CHECKS = 0;

-- Safely drop existing tables if re-importing into phpMyAdmin to prevent #1062 Duplicate entry errors
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

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. Users / Staff Table
-- ============================================================================
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

-- ============================================================================
-- 2. Members Registry Table
-- ============================================================================
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

-- ============================================================================
-- 3. Transactions Ledger (Passbook History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_code` VARCHAR(30) NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `balance_after` DECIMAL(12,2) NOT NULL,
  `particulars` VARCHAR(255) NOT NULL,
  `trans_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_member` (`member_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. Loan Underwriting Applications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS `loan_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tracking_code` VARCHAR(40) NOT NULL UNIQUE,
  `applicant_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `member_code` VARCHAR(50),
  `citizenship_no` VARCHAR(60),
  `address` VARCHAR(255),
  `province` VARCHAR(80),
  `district` VARCHAR(80),
  `branch` VARCHAR(100) DEFAULT 'Butwal Main Branch',
  `occupation` VARCHAR(100),
  `collateral_type` VARCHAR(100),
  `loan_scheme` VARCHAR(100) NOT NULL,
  `interest_rate` DECIMAL(5,2) DEFAULT 12.50,
  `amount` DECIMAL(12,2) NOT NULL,
  `tenure_months` INT NOT NULL,
  `monthly_income` DECIMAL(12,2) DEFAULT 0.00,
  `purpose` TEXT,
  `status` VARCHAR(30) DEFAULT 'Under Review',
  `remarks` TEXT,
  `details_json` LONGTEXT,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. Online Member Account Applications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS `member_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_no` VARCHAR(40) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `citizenship_no` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` VARCHAR(200) NOT NULL,
  `saving_scheme` VARCHAR(100) DEFAULT 'Regular Savings Account',
  `initial_deposit` DECIMAL(12,2) DEFAULT 1000.00,
  `status` VARCHAR(30) DEFAULT 'Pending Verification',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. Contact & Public Grievance Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `subject` VARCHAR(150),
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Unread',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. Interest Rates Table
-- ============================================================================
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

-- ============================================================================
-- 8. Official Notices & Circulars Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(200) NOT NULL,
  `title_np` VARCHAR(200) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'General',
  `category_en` VARCHAR(50) DEFAULT 'General',
  `publish_date` VARCHAR(30) NOT NULL,
  `date_en` VARCHAR(50),
  `content_en` TEXT,
  `content_np` TEXT,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. Website Entry Popup Notices Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS `popup_notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `notice_key` VARCHAR(60) UNIQUE NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `title_en` VARCHAR(255) NOT NULL,
  `title_np` VARCHAR(255) NOT NULL,
  `category_en` VARCHAR(100) NOT NULL,
  `category_np` VARCHAR(100) NOT NULL,
  `image_url` TEXT,
  `content_en` TEXT NOT NULL,
  `content_np` TEXT NOT NULL,
  `bullet_points_en` TEXT,
  `bullet_points_np` TEXT,
  `date_en` VARCHAR(50) NOT NULL,
  `date_np` VARCHAR(50) NOT NULL,
  `notice_ref` VARCHAR(100),
  `action_text_en` VARCHAR(100),
  `action_text_np` VARCHAR(100),
  `action_link` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. Media Files Library Table (Logos, Banners, Gallery Assets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `media_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `media_key` VARCHAR(100) UNIQUE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_size` INT NOT NULL DEFAULT 0,
  `category` VARCHAR(50) DEFAULT 'general',
  `alt_text` VARCHAR(255) DEFAULT '',
  `is_system_default` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. Electronic Know Your Member (eKYM) Submissions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS `ekym_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_no` VARCHAR(40) UNIQUE NOT NULL,
  `full_name_en` VARCHAR(120) NOT NULL,
  `full_name_np` VARCHAR(120) NOT NULL,
  `father_name` VARCHAR(120) NOT NULL,
  `grandfather_name` VARCHAR(120) NOT NULL,
  `mother_name` VARCHAR(120),
  `spouse_name` VARCHAR(120),
  `dob` VARCHAR(30) NOT NULL,
  `gender` VARCHAR(20) NOT NULL,
  `citizenship_no` VARCHAR(50) NOT NULL,
  `citizenship_district` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `permanent_address` VARCHAR(200) NOT NULL,
  `current_address` VARCHAR(200) NOT NULL,
  `perm_province` VARCHAR(80),
  `perm_district` VARCHAR(80),
  `temp_province` VARCHAR(80),
  `temp_district` VARCHAR(80),
  `occupation` VARCHAR(100) NOT NULL,
  `annual_income` VARCHAR(50) NOT NULL,
  `bank_name` VARCHAR(100) NOT NULL,
  `bank_account_no` VARCHAR(50) NOT NULL,
  `nominee_name` VARCHAR(120) NOT NULL,
  `nominee_relation` VARCHAR(50) NOT NULL,
  `nominee_citizenship` VARCHAR(50),
  `status` VARCHAR(30) DEFAULT 'Pending',
  `remarks` TEXT,
  `member_photo` LONGTEXT,
  `citizenship_front` LONGTEXT,
  `citizenship_back` LONGTEXT,
  `details_json` LONGTEXT,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. Site Settings (Frontend System CMS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT AUTO_INCREMENT UNIQUE,
  `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. Frontend Hero Slider Table
-- ============================================================================
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

-- ============================================================================
-- 14. Frontend Gallery Items Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(200) NOT NULL,
  `title_np` VARCHAR(200) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `image_url` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. Frontend Services Catalog Table
-- ============================================================================
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

-- ============================================================================
-- SEED DATA (Uses INSERT IGNORE to prevent duplicate key crashes on re-import)
-- ============================================================================

-- Users: Admin (admin / Admin@123) and Staff (staff / staff@2057)
INSERT IGNORE INTO `users` (`id`, `username`, `password_hash`, `full_name`, `role`, `email`) VALUES
(1, 'admin', '$2y$10$tJjV7N6fPZ3y1r1X8Z4uPe6/v47Hn0e2Vj5e8k8R7w2Qp0L0y3sK2', 'Chief Executive Officer', 'admin', 'ceo@ekatacoop.com.np'),
(2, 'staff', '$2y$10$Q1Fw3c5u3y/T1uG4K8G7vOe.8eN5hQ3vL9e0k8R7w2Qp0L0y3sK2', 'Branch Operations Officer', 'staff', 'ops@ekatacoop.com.np');

-- Demo Member (Code: EK-10482, PIN: 1234)
INSERT IGNORE INTO `members` (`id`, `member_code`, `full_name`, `phone`, `pin_hash`, `share_amount`, `regular_saving_balance`, `loan_balance`, `branch`, `joined_date`) VALUES
(1, 'EK-10482', 'राम कुमार शर्मा (Ram Kumar Sharma)', '9857012345', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 25000.00, 148500.00, 0.00, 'Main Branch - Butwal-4', '2065-04-15');

-- Passbook History for EK-10482
INSERT IGNORE INTO `transactions` (`id`, `member_code`, `type`, `amount`, `balance_after`, `particulars`, `trans_date`) VALUES
(1, 'EK-10482', 'Credit', 15000.00, 15000.00, 'Opening Share & Regular Deposit', '2081-01-05 10:15:00'),
(2, 'EK-10482', 'Credit', 25000.00, 40000.00, 'Monthly Recurring Deposit Transfer', '2081-02-02 11:30:00'),
(3, 'EK-10482', 'Credit', 100000.00, 140000.00, '1-Year High Yield Term Deposit', '2081-04-10 14:00:00'),
(4, 'EK-10482', 'Credit', 8500.00, 148500.00, 'Quarterly Interest Capitalized @ 9.5%', '2081-06-30 16:45:00');

-- Sample Loan Applications
INSERT IGNORE INTO `loan_applications` (`id`, `tracking_code`, `applicant_name`, `phone`, `email`, `member_code`, `citizenship_no`, `address`, `province`, `district`, `branch`, `occupation`, `collateral_type`, `loan_scheme`, `interest_rate`, `amount`, `tenure_months`, `monthly_income`, `purpose`, `status`, `remarks`, `submitted_at`, `created_at`) VALUES
(1, 'EKT-LN-2083-101', 'Bishnu Prasad Poudel', '9857033211', 'bishnu.poudel@gmail.com', 'EK-10241', '38-01-71-04512', 'Tilottama-05, Manigram, Rupandehi', 'Lumbini Province', 'Rupandehi', 'Manigram Service Point', 'Commercial Dairy Farming', 'Land & Building (Ghar-Jagga)', 'Agricultural Productive Loan', 12.00, 1200000.00, 48, 85000.00, 'Expansion of commercial dairy farm and purchase of 4 Holstein cows.', 'Under Review', 'Field inspection scheduled by Credit Officer.', '2026-08-28 11:20:00', '2026-08-28 11:20:00'),
(2, 'EKT-LN-2083-102', 'Saraswati Devi Gyawali', '9847055412', 'saraswati.gyawali@yahoo.com', 'EK-10389', '38-01-74-08921', 'Butwal-04, Traffic Chowk, Rupandehi', 'Lumbini Province', 'Rupandehi', 'Butwal Main Branch', 'Retail & Wholesale Trade', 'Land & Building (Ghar-Jagga)', 'SME & Enterprise Expansion Loan', 13.50, 2500000.00, 60, 140000.00, 'Working capital and inventory expansion for wholesale hardware store.', 'Approved', 'Approved by Credit Committee; collateral valuation verified.', '2026-08-26 14:15:00', '2026-08-26 14:15:00');

-- Standard Interest Rates
INSERT IGNORE INTO `interest_rates` (`id`, `category`, `scheme_en`, `scheme_np`, `rate_percent`, `basis_en`, `basis_np`, `min_balance`) VALUES
(1, 'Deposit', 'Regular Savings Account', 'साधारण बचत खाता', 7.25, 'Daily balance calculation, quarterly interest payout', 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी', 500.00),
(2, 'Deposit', 'Nari Kalyan Bachat', 'नारी कल्याण बचत', 8.00, 'Monthly interest payout with free ATM/QR', 'मासिक ब्याज भुक्तानी तथा निःशुल्क मोबाइल बैंकिङ', 1000.00),
(3, 'Deposit', 'Senior Citizen Care Fund', 'ज्येष्ठ नागरिक सम्मान बचत', 9.50, 'Quarterly interest, priority counter service', 'त्रैमासिक ब्याज, ज्येष्ठ नागरिक विशेष काउन्टर', 1000.00),
(4, 'Deposit', 'Child Bright Future Scheme', 'बाल उज्ज्वल भविष्य बचत', 9.00, 'Annual compounding growth for education', 'वार्षिक चक्रवृद्धिय ब्याज, उच्च शिक्षा योजना', 500.00),
(5, 'Deposit', '1-Year Fixed Term Deposit', '१ वर्षे मुद्दती निक्षेप', 10.50, 'Highest quarterly credited returns', 'त्रैमासिक रूपमा खातामै ब्याज जम्मा', 25000.00),
(6, 'Deposit', '2-Year+ Golden Term Deposit', '२ वर्षे स्वर्ण मुद्दती निक्षेप', 11.75, 'Maximum yield with 90% loan facility', 'सर्वाधिक ११.७५% प्रतिफल तथा ९०% सम्म कर्जा सुविधा', 50000.00),
(7, 'Loan', 'Agricultural Productive Loan', 'व्यावसायिक कृषि तथा पशुपालन कर्जा', 12.00, 'Subsidized priority credit for local farmers', 'स्थानीय किसानहरूको लागि सहुलियतपूर्ण ब्याज', 0.00),
(8, 'Loan', 'SME & Enterprise Expansion Loan', 'साना तथा मझौला व्यवसाय कर्जा', 13.50, 'Working capital for trading and shops', 'पसल तथा व्यवसाय सञ्चालनका लागि सरल कर्जा', 0.00),
(9, 'Loan', 'Residential Housing & Land Loan', 'आवास निर्माण तथा जग्गा खरिद कर्जा', 13.00, 'Up to 15 years flexible amortization', '१५ वर्षसम्मको सहज किस्ताबन्दी सुविधा', 0.00),
(10, 'Loan', 'Social & Foreign Employment Loan', 'सामाजिक तथा वैदेशिक रोजगार कर्जा', 13.50, 'Fast approval for skill & career opportunities', 'द्रुत प्रक्रियाबाट सहज कर्जा प्रवाह', 0.00);

-- Notices
INSERT IGNORE INTO `notices` (`id`, `title_en`, `title_np`, `category`, `category_en`, `publish_date`, `date_en`, `content_en`, `content_np`, `is_active`) VALUES
(1, '24th Annual General Meeting Report Published', '२४औं वार्षिक साधारण सभाको प्रतिवेदन पुस्तिका प्रकाशन सम्बन्धमा', 'AGM Notice', 'AGM Notice', '२०८१ असोज १५', '15 Sep 2026', 'The official report book of the 24th AGM has been published and is available for all shareholders at our head office and digital portal.', 'संस्थाको २४औं वार्षिक साधारण सभाको पूर्ण प्रतिवेदन पुस्तिका आधिकारिक वेबसाइट तथा मुख्य कार्यालय बुटवलमा उपलब्ध छ।', 1),
(2, 'Revised Interest Rates Effective from Kartik 1, 2081', 'नयाँ ब्याजदर तालिका मिति २०८१ कार्तिक १ गतेदेखि लागू भएको सम्बन्धी सूचना', 'Interest Rates', 'Interest Rates', '२०८१ कार्तिक ०१', '18 Sep 2026', 'All valued members are notified that high yield deposit interest rates up to 11.75% per annum are now active across all branches.', 'सम्पूर्ण आदरणीय सेयर सदस्य महानुभावहरूमा अधिकतम ११.७५% सम्मको नयाँ ब्याजदर लागू भएको जानकारी गराइन्छ।', 1),
(3, 'Staff Career Vacancies Application Process', 'खुला पदपूर्ति दरखास्त आह्वान सम्बन्धी सूचना', 'Career', 'Career', '२०८१ असोज २५', '10 Sep 2026', 'Ekata Cooperative invites eligible, dedicated candidates for the positions of Assistant Manager and Junior Teller. Applications open till deadline.', 'यस संस्थाका लागि आवश्यक सहायक प्रबन्धक तथा कनिष्ठ सहायक (टेलर) पदमा आवेदन खुला गरिएको छ।', 1);

-- Popup Notices
INSERT IGNORE INTO `popup_notices` (`id`, `notice_key`, `active`, `title_en`, `title_np`, `category_en`, `category_np`, `image_url`, `content_en`, `content_np`, `date_en`, `date_np`, `notice_ref`, `action_text_en`, `action_text_np`, `action_link`) VALUES
(1, 'notice-agm-24', 1, '24th Annual General Meeting (AGM) & 15.5% Dividend Distribution Notice', '२४औं वार्षिक साधारण सभा तथा १५.५% लाभांश वितरण सम्बन्धी अत्यन्त जरुरी सूचना', 'Annual General Meeting', 'वार्षिक साधारण सभा सूचना', '/uploads/media/notice-agm.svg', 'All respected shareholder members of Ekata Saving & Credit Cooperative Ltd. are cordially invited to attend the 24th Annual General Meeting scheduled for Saturday, Ashwin 18, 2083 (11:00 AM) at the Central Assembly Hall, Butwal-04.', 'एकता बचत तथा ऋण सहकारी संस्था लि. का सम्पूर्ण आदरणीय सेयर सदस्य महानुभावहरूमा २४औं वार्षिक साधारण सभामा उपस्थितिका लागि हार्दिक अनुरोध गरिन्छ।', '24 Sep 2026', '२०८३ असोज १० गते', 'सूचना नं. ०४/२०८३-८४', 'Update eKYM for Dividend', 'लाभांशका लागि eKYM भर्नुहोस्', '#ekym'),
(2, 'notice-ekym-mandatory', 1, 'Mandatory eKYM Digital Profile Verification Before Quarter-End', 'अनिवार्य eKYM डिजिटल सदस्य विवरण अद्यावधिक गर्ने सम्बन्धी सूचना', 'Member Regulatory Notice', 'सदस्य जरुरी सूचना', '/uploads/media/notice-ekym.svg', 'Pursuant to the Cooperative Act 2074 and regulatory directives of the Cooperative Department, all registered members of Ekata Cooperative are required to verify their Know Your Member (eKYM) credentials online.', 'सहकारी ऐन २०७४ तथा नियामक निकायको वित्तीय निर्देशिका बमोजिम संस्थाका सम्पूर्ण आदरणीय सदस्यहरूले आफ्ना विवरणहरू अनलाइन eKYM मार्फत अद्यावधिक गर्नुहुन अनुरोध छ।', '18 Sep 2026', '२०८३ असोज ०२ गते', 'सूचना नं. ०३/२०८३-८४', 'Open eKYM Online Form', 'अनलाइन eKYM फाराम खोल्नुहोस्', '#ekym');

-- Media Files Library
INSERT IGNORE INTO `media_files` (`id`, `media_key`, `title`, `filename`, `file_path`, `file_type`, `file_size`, `category`, `alt_text`, `is_system_default`) VALUES
(1, 'logo-official-default', 'Ekata Official Logo (Vector Emblem)', 'ekata-logo-default.svg', '/uploads/logos/ekata-logo-default.svg', 'image/svg+xml', 5543, 'branding', 'Ekata Saving & Credit Cooperative Ltd. Official Logo', 1),
(2, 'slide-financial-pillar', 'Hero Slide: Trusted Financial Pillar of Rupandehi', 'slide-banking.svg', '/uploads/media/slide-banking.svg', 'image/svg+xml', 4114, 'hero', 'Classical cooperative banking hall with growth curve', 1);

-- Sample eKYM records
INSERT IGNORE INTO `ekym_submissions` (`id`, `application_no`, `full_name_en`, `full_name_np`, `father_name`, `grandfather_name`, `dob`, `gender`, `citizenship_no`, `citizenship_district`, `phone`, `permanent_address`, `current_address`, `occupation`, `annual_income`, `bank_name`, `bank_account_no`, `nominee_name`, `nominee_relation`, `status`, `remarks`) VALUES
(1, 'EKT-KYC-2083-0941', 'Subhash Sharma', 'सुभाष शर्मा', 'Bishnu Prasad Sharma', 'Chhabilal Sharma', '2045-03-14', 'Male', '38-01-72-04821', 'Rupandehi', '9857099441', 'Butwal-4, Traffic Chowk', 'Butwal-4', 'Wholesale Grocery Merchant', 'Rs. 950,000', 'Global IME Bank Ltd.', '04801010048123', 'Sunita Sharma', 'Wife', 'Pending', 'Awaiting executive verification'),
(2, 'EKT-KYC-2083-0940', 'Ram Chandra Sharma', 'रामचन्द्र शर्मा', 'Loknath Sharma', 'Gangadhar Sharma', '2038-06-18', 'Male', '38-01-68-09123', 'Rupandehi', '9857012345', 'Butwal-4, Golpark', 'Butwal-4', 'Commercial Agriculture', 'Rs. 840,000', 'Siddhartha Bank Ltd.', '0182049182741', 'Kamala Sharma', 'Wife', 'Approved', 'Verified by CEO / Audit');

-- Site Settings
INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('coop_name_en', 'Ekata Saving & Credit Cooperative Ltd.'),
('coop_name_np', 'एकता बचत तथा ऋण सहकारी संस्था लि.'),
('coop_logo_url', '/uploads/logos/ekata-logo-default.svg'),
('coopLogoUrl', '/uploads/logos/ekata-logo-default.svg'),
('logo_url', '/uploads/logos/ekata-logo-default.svg'),
('tagline_en', 'Butwal-4, Rupandehi • Regd. No: 421/057/058 • Established 2057 B.S.'),
('tagline_np', 'बुटवल-४, रुपन्देही • दर्ता नं: ४२१/०५७/०५८ • स्थापना: २०५७ वि.सं.'),
('established_bs', '2057'),
('ticker_text_en', 'Welcome to Ekata Saving & Credit Cooperative Ltd. | Member eKYM Digital Update active | High-Yield Term Deposits up to 11.75% | Toll-Free: 1660-01-99887'),
('ticker_text_np', 'एकता बचत तथा ऋण सहकारी संस्था लि. मा हार्दिक स्वागत गर्दछौं। | अनलाइन eKYM अध्यावधिक सुरु | ११.७५% सम्म मुद्दती निक्षेप प्रतिफल | टोल-फ्री: १६६०-०१-९९८८७'),
('ticker_active', '1'),
('phone_headoffice', '071-540123 / 540456'),
('phone_tollfree', '1660-01-99887'),
('email_official', 'info@ekatacoop.com.np'),
('address_headoffice', 'Main Road, Butwal-4, Rupandehi, Lumbini Province, Nepal'),
('office_hours', 'Sunday - Friday: 10:00 AM - 5:00 PM (Cash Counter till 4:00 PM)'),
('regd_no', '421/057/058'),
('pan_no', '301548921'),
('stat_members', '15,420+'),
('stat_savings', 'Rs. 1.28 Arba'),
('stat_loans', 'Rs. 98.40 Crore'),
('stat_capital', 'Rs. 24.50 Crore'),
('stat_branches', ''),
('about_intro_en', 'Established in 2057 B.S. under the Cooperative Act, Ekata Saving & Credit Cooperative Ltd. is a community-anchored financial institution committed to sustainable economic development, grassroots empowerment, and modern digital banking in Western Nepal.'),
('about_intro_np', 'सहकारी ऐन अन्तर्गत वि.सं. २०५७ सालमा स्थापित एकता बचत तथा ऋण सहकारी संस्था लि. समुदायमा आधारित, सदस्य-केन्द्रित र वित्तीय सुशासनयुक्त भरपर्दो वित्तीय संस्था हो।');

-- Frontend Slides
INSERT IGNORE INTO `frontend_slides` (`id`, `title_en`, `title_np`, `subtitle_en`, `subtitle_np`, `image_url`, `cta_text_en`, `cta_text_np`, `cta_link`, `sort_order`) VALUES
(1, 'Trusted Financial Pillar of Rupandehi', 'समुदायमा आधारित, सदस्य केन्द्रित भरपर्दो वित्तीय संस्था', 'Serving members since 2057 B.S. with secure savings, productive business loans, and modern mobile banking.', 'वि.सं. २०५७ देखि रुपन्देही र आसपासका क्षेत्रमा सुरक्षित बचत, उत्पादनशील कर्जा र आधुनिक डिजिटल बैंकिङ सेवा।', '/uploads/media/slide-banking.svg', 'Explore Services', 'सेवाहरू हेर्नुहोस्', '#services', 1),
(2, 'Earn Up To 11.75% On Term Deposits', 'मुद्दती निक्षेपमा ११.७५% सम्म आकर्षक प्रतिफल', 'Flexible tenure from 3 months to 5 years, quarterly interest compounding, and instant 90% loan facility against fixed deposits.', '३ महिनादेखि ५ वर्षसम्मको सहज अवधि, त्रैमासिक ब्याज भुक्तानी तथा मुद्दती रसिद धितोमा ९०% सम्म कर्जा सुविधा।', '/uploads/media/slide-deposits.svg', 'View Interest Rates', 'ब्याजदर तालिका', '#rates', 2),
(3, 'Empowering Local Agriculture & Enterprise', 'कृषि, व्यापार र साना उद्यमशीलताको भरपर्दो सहयात्री', 'Subsidized collateral loans for modern farming, livestock, retail trade, and housing with swift paperwork.', 'आधुनिक कृषि, व्यापार प्रवर्द्धन, आवास र स्वरोजगारका लागि सरल प्रक्रियामा कर्जा प्रवाह।', '/uploads/media/slide-agriculture.svg', 'Apply for Loan', 'कर्जा आवेदन दिनुहोस्', '#services-loans', 3);

-- Gallery Items
INSERT IGNORE INTO `gallery_items` (`id`, `title_en`, `title_np`, `category`, `image_url`) VALUES
(1, 'Annual General Meeting & Honor Ceremony', 'वार्षिक साधारण सभा तथा सम्मान कार्यक्रम', 'General Meeting', '/uploads/media/gallery-agm.svg'),
(2, 'Financial Literacy for Women Micro-Entrepreneurs', 'महिला लघुउद्यमीहरूलाई वित्तीय साक्षरता तालिम', 'Empowerment', '/uploads/media/gallery-literacy.svg'),
(3, 'Free Community Health Camp & Blood Donation', 'निःशुल्क सामुदायिक स्वास्थ्य शिविर तथा रक्तदान', 'Social CSR', '/uploads/media/gallery-healthcamp.svg');

-- Services Catalog
INSERT IGNORE INTO `services_cms` (`id`, `slug`, `title_en`, `title_np`, `description_en`, `description_np`, `icon`, `category`, `badge`) VALUES
(1, 'member-service', 'Member Service', 'सदस्य सेवा', 'Share membership, regular financial counseling, welfare relief fund, and assembly voting rights.', 'सेयर सदस्यता, नियमित वित्तीय परामर्श, सदस्य सुरक्षा कोष तथा साधारण सभा मतदान अधिकार।', '👥', 'member', 'Core Member'),
(2, 'deposit-product', 'Deposit Product', 'बचत योजना', 'High-yield recurring, daily, child future, and fixed term deposits yielding up to 11.75% per annum.', 'दैनिक बचत, बाल उज्ज्वल बचत, नारी बचत तथा ११.७५% सम्म आकर्षक ब्याज प्राप्त हुने मुद्दती निक्षेप।', '🪙', 'savings', 'Up to 11.75%'),
(3, 'loan', 'Loan', 'कर्जा सेवा', 'Productive agricultural loans, small business expansion credit, housing, and social enterprise finance.', 'व्यावसायिक कृषि, पशुपालन, साना तथा मझौला व्यापार, आवास निर्माण तथा सुलभ व्यक्तिगत कर्जा।', '💼', 'loan', 'From 12.00%'),
(4, 'remittance', 'Remittance', 'रेमिट्यान्स सेवा', 'Domestic and international money transfer payout via Prabhu, IME, Western Union, and Global Remit.', 'विश्वका सबै देशहरूबाट पठाएको रकम प्रभु, आइएमई तथा वेस्टर्न युनियनमार्फत तत्काल काउन्टर भुक्तानी।', '↗', 'remittance', 'Instant Payout'),
(5, 'insurance', 'Insurance', 'सुरक्षण तथा बीमा', 'Member health & accident safety micro-insurance, livestock/crop safety, and loan risk protection.', 'सदस्य दुर्घटना तथा स्वास्थ्य सुरक्षा, पशुधन तथा बाली बिमा र कर्जा सुरक्षण सुविधा।', '🛡️', 'insurance', 'Micro-Safety'),
(6, 'digital-services', 'Smart Digital Services', 'डिजिटल सेवाहरू', 'Ekata Smart mobile banking, NepalPay merchant QR, utility bills, fund transfers, and SMS notifications.', 'एकता स्मार्ट मोबाइल बैंकिङ, नेपालपे क्युआर भुक्तानी, बिजुली-पानी महसुल तथा अन्तरबैंक रकम ट्रान्सफर।', '📱', 'digital', 'NepalPay QR');
