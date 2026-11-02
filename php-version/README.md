# Ekata Saving & Credit Cooperative Ltd. (एकता बचत तथा ऋण सहकारी संस्था लि.)
## Production Full-Stack PHP Web & Core Banking System
### Complete XAMPP, phpMyAdmin, cPanel, Apache & MariaDB/MySQL Support

This directory (`/php-version/`) contains the complete standalone PHP application for Ekata Cooperative, pre-configured with **zero-setup automated deployment** for local XAMPP and web hosting environments.

---

### 🔑 Default Credentials (Ready to Test)

| Role | Username / Identifier | Password / PIN | Access Level |
|---|---|---|---|
| **Administrator (CEO)** | `admin` | `Admin@123` | Full Core Banking Console (`admin.php`) |
| **Branch Staff** | `staff` | `staff@2057` | Back-office Operations & Verification |
| **Cooperative Member** | `EK-10482` | `1234` | Member Passbook & Portal (`member.php`) |

---

### 🚀 Running on XAMPP (Step-by-Step)

#### 1. Copy Files to XAMPP `htdocs`
Copy the entire `php-version` folder into your XAMPP `htdocs` directory:
- **Windows:** `C:\xampp\htdocs\ekata-coop\`
- **macOS (XAMPP-VM / MAMP):** `/Applications/XAMPP/htdocs/ekata-coop/`
- **Linux:** `/opt/lampp/htdocs/ekata-coop/`

#### 2. Start Apache & MySQL in XAMPP
Open the **XAMPP Control Panel** and click **Start** for both:
- **Apache** (Web server)
- **MySQL** (Database server)

#### 3. Automatic Zero-Config Setup
The application features **automatic database provisioning**:
- When you open the site in your browser, `database.php` detects your XAMPP MySQL server (`127.0.0.1:3306`), automatically creates the database `ekata_cooperative` if it doesn't exist, initializes all 13 tables, and seeds the default admin, rates, notices, and demo accounts!
- No manual SQL command is required.

#### 4. Open in Browser
- **Public Web Portal:** `http://localhost/ekata-coop/index.php`
- **Executive Admin Console:** `http://localhost/ekata-coop/admin.php` (login: `admin` / `Admin@123`)
- **Member Internet Banking:** `http://localhost/ekata-coop/member.php` (login: `EK-10482` / `1234`)
- **eKYM Digital Onboarding:** `http://localhost/ekata-coop/ekym.php`
- **Database Diagnostic Tool:** `http://localhost/ekata-coop/check_db.php`

---

### 🛠️ Manual Database Setup (phpMyAdmin)

If you prefer to manually import the database into phpMyAdmin:
1. Open `http://localhost/phpmyadmin` in your web browser.
2. Click the **Import** tab at the top.
3. Click **Choose File** and select `php-version/schema.sql`.
4. Click **Go** (or **Import**) at the bottom.
5. `schema.sql` creates the database `ekata_cooperative`, all 13 tables, and populates all demo data. It uses `INSERT IGNORE` to prevent any duplicate key errors on re-imports.

---

### ⚙️ Database Configuration (`config.php`)

In `php-version/config.php`:
```php
// 'auto': Tries MySQL first; automatically falls back to SQLite if MySQL is offline
// 'mysql': Forces MySQL / MariaDB (standard for XAMPP / phpMyAdmin / cPanel)
// 'sqlite': Forces SQLite (single-file database in /data/ekata_coop.sqlite)
define('DB_DRIVER', 'auto');

// MySQL configuration (default XAMPP credentials)
define('MYSQL_HOST', '127.0.0.1');
define('MYSQL_PORT', '3306');
define('MYSQL_DB', 'ekata_cooperative');
define('MYSQL_USER', 'root');
define('MYSQL_PASS', '');
define('MYSQL_CHARSET', 'utf8mb4');
```

---

### 📋 Database Architecture (13 Tables)

1. `users` — Staff and CEO administrative credentials
2. `members` — Cooperative shareholders and KYC status
3. `transactions` — Passbook debit/credit transactions ledger
4. `loan_applications` — Online credit and underwriting applications
5. `member_applications` — Online account opening requests
6. `contact_messages` — Public contact messages & member grievances
7. `interest_rates` — Deposit & loan schemes interest matrix
8. `notices` — Official announcements & AGM circulars
9. `ekym_submissions` — Digital eKYM submissions conforming to Nepal Cooperative Act
10. `site_settings` — Dynamic CMS configuration & institutional metrics
11. `frontend_slides` — Hero carousel slides
12. `gallery_items` — Cooperative activities photo gallery
13. `services_cms` — Financial products catalog
