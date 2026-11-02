# Ekata Saving & Credit Cooperative Ltd.
## Complete PHP, CSS, JS & MySQL Installation & Setup Guide

This document provides complete, step-by-step instructions to set up, configure, and run the **Ekata Saving & Credit Cooperative Ltd.** portal using **PHP, MySQL, CSS, and Vanilla JavaScript**.

---

## 📁 File Structure & Architectural Overview

The application is structured into modular PHP, CSS, and JavaScript files:

| File | Type | Purpose & Responsibility |
|---|---|---|
| `index.php` | PHP | Main public cooperative portal with dynamic server-side rendering (rates, notices, CMS settings, hero slider, services, interactive modals) |
| `index.html` | HTML5 | Static pure HTML5/JS entry point matching the exact portal design |
| `style.css` | CSS3 | Unified stylesheet implementing the official Ekata forest green & warm gold theme, responsive layout, mega-menus, cards, and modal components |
| `app.js` | Vanilla JS | Client controller: bilingual toggle (English/Nepali), loan EMI and deposit interest calculators, modal popups, and AJAX form submissions |
| `admin.php` | PHP | Core Banking System (CBS) Admin Console: member approvals, loan underwriting, eKYM verification, rate matrix editing, CMS configuration |
| `member.php` | PHP | Member Internet Banking, Digital Passbook & Loan EMI Calculator: real-time account balances, interactive loan calculation suite, credit application, passbook statement, and CSV download |
| `ekym.php` | PHP | 4-Step Electronic Know Your Member (eKYM) digital onboarding portal conforming to Nepal Cooperative Act standards |
| `api.php` | PHP | RESTful JSON API: endpoints for interest rates (`?action=rates`), circular notices (`?action=notices`), stats, loan and member applications |
| `database.php` | PHP | PDO database manager: automatic database creation (`ekata_cooperative`), table provisioning, and initial demo data seeding |
| `config.php` | PHP | Central configuration file: database host, port, credentials, and driver settings |
| `check_db.php` | PHP | Visual database diagnostic & health-check dashboard for inspecting tables, record counts, and repairing schemas |
| `schema.sql` | SQL | Full relational database schema with all 13 tables and pre-seeded demo records for phpMyAdmin / MySQL CLI |

---

## 🔑 Default Credentials (Ready for Testing)

| Portal / Role | Access URL | Username / ID | Password / PIN | Access Level |
|---|---|---|---|---|
| **Executive Admin (CEO)** | `admin.php` | `admin` | `Admin@123` | Full Core Banking & CMS Administration |
| **Branch Staff** | `admin.php` | `staff` | `staff@2057` | Back-Office Verification & Approvals |
| **Cooperative Member** | `member.php` | `EK-10482` | `1234` | Member Passbook, Statement, Fund Transfer |

---

## 🚀 Setup Method 1: Local Setup with XAMPP (Recommended)

### Step 1: Copy Files to `htdocs`
1. Download or copy the project files into your XAMPP web root directory:
   - **Windows:** `C:\xampp\htdocs\ekata-coop\`
   - **macOS (XAMPP-VM / MAMP):** `/Applications/XAMPP/htdocs/ekata-coop/` (or `/Applications/MAMP/htdocs/ekata-coop/`)
   - **Linux (LAMPP):** `/opt/lampp/htdocs/ekata-coop/`

### Step 2: Start Apache and MySQL
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.

### Step 3: Zero-Configuration Auto-Deployment
The system includes **Automated Zero-Config Database Provisioning**:
- When you first visit `http://localhost/ekata-coop/index.php`, `database.php` detects the local MySQL service (`127.0.0.1:3306`, user: `root`, blank password).
- It automatically executes `CREATE DATABASE IF NOT EXISTS ekata_cooperative`.
- It creates all 13 required database tables.
- It inserts default interest rates, circular notices, admin accounts, demo members, and CMS settings.
- **No manual SQL query or command line execution is required.**

### Step 4: Open in Web Browser
- **Public Portal:** `http://localhost/ekata-coop/index.php`
- **Admin Console:** `http://localhost/ekata-coop/admin.php`
- **Member Internet Banking:** `http://localhost/ekata-coop/member.php`
- **eKYM Digital Onboarding:** `http://localhost/ekata-coop/ekym.php`
- **Database Diagnostic Tool:** `http://localhost/ekata-coop/check_db.php`

---

## 🛠️ Setup Method 2: Manual Database Import via phpMyAdmin

If your environment restricts automatic database creation:
1. Open `http://localhost/phpmyadmin` in your web browser.
2. Click the **Import** tab on the top navigation bar.
3. Click **Choose File** and select `schema.sql` from the project root.
4. Click the **Go** or **Import** button at the bottom.
5. The script creates the `ekata_cooperative` database and populates all 13 tables with demo records.

---

## 💻 Setup Method 3: Instant Run using PHP Built-In Server

If you have PHP installed without XAMPP:
1. Open your terminal or Command Prompt.
2. Navigate to the project directory:
   ```bash
   cd /path/to/project
   ```
3. Run the PHP development server:
   ```bash
   php -S 127.0.0.1:8000
   ```
4. Open your browser and access:
   ```text
   http://127.0.0.1:8000/index.php
   ```
*(Note: If MySQL is not running on your machine, `database.php` automatically falls back to an embedded SQLite database in `/data/ekata_coop.sqlite` with zero configuration!)*

---

## 🌐 Setup Method 4: Production Deployment on cPanel / Apache / Nginx

### For cPanel / Shared Web Hosting:
1. Log in to your hosting **cPanel**.
2. Go to **MySQL Databases**:
   - Create a database: e.g., `yourusername_ekata`
   - Create a user with a secure password and assign **ALL PRIVILEGES** to that database.
3. Open **phpMyAdmin** in cPanel, select your database, and import `schema.sql`.
4. Upload the project files to `public_html/` (or your subdomain folder).
5. Open `config.php` and update the MySQL credentials:
   ```php
   define('DB_DRIVER', 'mysql');
   define('MYSQL_HOST', 'localhost');
   define('MYSQL_PORT', '3306');
   define('MYSQL_DB', 'yourusername_ekata');
   define('MYSQL_USER', 'yourusername_dbuser');
   define('MYSQL_PASS', 'YourSecurePasswordHere');
   ```
6. Navigate to `https://yourdomain.com/index.php` or `https://yourdomain.com/admin.php`.

---

## ⚙️ Configuration Reference (`config.php`)

```php
<?php
// Driver mode:
// 'auto'  -> Tries MySQL first, automatically falls back to SQLite if MySQL is offline
// 'mysql' -> Forces MySQL / MariaDB (Standard for XAMPP / cPanel / Linux)
// 'sqlite'-> Forces SQLite file-based database in /data/ekata_coop.sqlite
define('DB_DRIVER', 'auto');

// MySQL Credentials (Defaults for standard XAMPP)
define('MYSQL_HOST', '127.0.0.1');
define('MYSQL_PORT', '3306');
define('MYSQL_DB', 'ekata_cooperative');
define('MYSQL_USER', 'root');
define('MYSQL_PASS', '');
define('MYSQL_CHARSET', 'utf8mb4');

// Cooperative Institutional Metadata
define('APP_NAME_EN', 'Ekata Saving & Credit Cooperative Ltd.');
define('APP_NAME_NP', 'एकता बचत तथा ऋण सहकारी संस्था लि.');
define('APP_REGD_NO', '248/057/058');
define('APP_ESTABLISHED_BS', '2057');
define('APP_DISTRICT', 'Rupandehi, Nepal');
```

---

## 📊 Database Schema (13 Relational Tables)

1. `users`: Administrative staff accounts (Admin, CEO, Branch Staff) with bcrypt-hashed passwords.
2. `members`: Cooperative shareholder records, share counts, KYC verification status, and PINs.
3. `transactions`: Passbook debit/credit transaction ledger with running balance calculations.
4. `loan_applications`: Online credit requests, applicant details, collateral, and underwriting status.
5. `member_applications`: Online membership registrations submitted from the public portal.
6. `contact_messages`: Inquiries and grievances submitted via the contact modal.
7. `interest_rates`: Dynamic interest rate matrix for deposit schemes and loan products.
8. `notices`: Official circulars, AGM notices, and public announcements.
9. `ekym_submissions`: Complete 4-step electronic Know Your Member submissions with nominee details.
10. `site_settings`: Key-value CMS settings (institutional stats, helpline numbers, address).
11. `frontend_slides`: Hero carousel banners with titles, subheadings, and action buttons.
12. `gallery_items`: Photo gallery activities with captions and tags.
13. `services_cms`: Financial products catalog with icons, descriptions, and scheme tags.

---

## 🔧 Diagnostics & Troubleshooting

### Database Diagnostic Tool (`check_db.php`)
Open `http://localhost/ekata-coop/check_db.php` in your browser. This tool displays:
- Active PHP version and enabled extensions (`pdo_mysql`, `pdo_sqlite`)
- Active connection status and connection driver
- Live status and row count for each of the 13 tables
- "Verify / Repair Tables" button to automatically heal any missing tables or columns

### Common Issues & Quick Solutions

- **"Access denied for user 'root'@'localhost'"**:
  Ensure MySQL is running in the XAMPP Control Panel. If you set a root password in phpMyAdmin, update `MYSQL_PASS` in `config.php`.
- **"Port 3306 already in use"**:
  If another service is using port 3306, either stop that service or configure MySQL to use port 3307 in XAMPP and set `define('MYSQL_PORT', '3307');` in `config.php`.
- **Blank Page / 500 Internal Server Error**:
  Check that the PHP `pdo_mysql` extension is enabled in `php.ini` (standard in all XAMPP installations).
- **CSS Not Loading**:
  Ensure `style.css` is located in the same directory as `index.php`. Check browser console for 404 errors.
