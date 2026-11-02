<?php
/**
 * Ekata Saving & Credit Cooperative Ltd.
 * Production Database Connection, Auto-Migration & Schema Layer
 * Fully compatible with XAMPP (Apache + MySQL / MariaDB), phpMyAdmin, cPanel, and SQLite
 * File: php-version/database.php
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;
    private static string $activeDriver = 'mysql';

    public static function isSqlite(): bool {
        return self::$activeDriver === 'sqlite';
    }

    public static function getActiveDriver(): string {
        return self::$activeDriver;
    }

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $driverMode = defined('DB_DRIVER') ? strtolower(trim(DB_DRIVER)) : 'auto';

            if ($driverMode === 'auto') {
                // In auto mode: try MySQL first (default for XAMPP / cPanel)
                if (extension_loaded('pdo_mysql')) {
                    try {
                        self::$instance = self::connectMysql();
                        self::$activeDriver = 'mysql';
                    } catch (Throwable $e) {
                        // If MySQL fails and SQLite extension is available, fall back to SQLite
                        if (extension_loaded('pdo_sqlite')) {
                            self::$instance = self::connectSqlite();
                            self::$activeDriver = 'sqlite';
                        } else {
                            self::renderConnectionError($e, 'MySQL (and PDO SQLite extension is not loaded in php.ini)');
                        }
                    }
                } elseif (extension_loaded('pdo_sqlite')) {
                    self::$instance = self::connectSqlite();
                    self::$activeDriver = 'sqlite';
                } else {
                    die("Database Error: Neither PDO MySQL nor PDO SQLite extensions are enabled in your PHP installation.");
                }
            } elseif ($driverMode === 'mysql') {
                try {
                    self::$instance = self::connectMysql();
                    self::$activeDriver = 'mysql';
                } catch (Throwable $e) {
                    self::renderConnectionError($e, 'MySQL');
                }
            } else {
                try {
                    self::$instance = self::connectSqlite();
                    self::$activeDriver = 'sqlite';
                } catch (Throwable $e) {
                    self::renderConnectionError($e, 'SQLite');
                }
            }

            self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            // Auto initialize schemas and sample records
            self::ensureTables();
        }
        return self::$instance;
    }

    private static function connectMysql(): PDO {
        $primaryHost = defined('MYSQL_HOST') ? MYSQL_HOST : '127.0.0.1';
        $port = defined('MYSQL_PORT') ? MYSQL_PORT : '3306';
        $dbName = defined('MYSQL_DB') ? MYSQL_DB : 'ekata_cooperative';
        $user = defined('MYSQL_USER') ? MYSQL_USER : 'root';
        $pass = defined('MYSQL_PASS') ? MYSQL_PASS : '';
        $charset = defined('MYSQL_CHARSET') ? MYSQL_CHARSET : 'utf8mb4';

        // Candidates to attempt: primary host first, then localhost fallback
        $hostsToTry = array_unique([$primaryHost, '127.0.0.1', 'localhost']);
        $portsToTry = array_unique([$port, '3306', '3307']);

        $lastException = null;

        foreach ($hostsToTry as $currentHost) {
            foreach ($portsToTry as $currentPort) {
                $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', $currentHost, $currentPort, $dbName, $charset);
                try {
                    return new PDO($dsn, $user, $pass, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset"
                    ]);
                } catch (PDOException $e) {
                    $lastException = $e;

                    // Case A: Database doesn't exist yet (Error 1049) -> Auto-create database
                    if ($e->getCode() == 1049 || stripos($e->getMessage(), 'Unknown database') !== false) {
                        try {
                            $serverDsn = sprintf('mysql:host=%s;port=%s;charset=%s', $currentHost, $currentPort, $charset);
                            $serverPdo = new PDO($serverDsn, $user, $pass, [
                                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                            ]);
                            $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                            unset($serverPdo);

                            return new PDO($dsn, $user, $pass, [
                                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset"
                            ]);
                        } catch (PDOException $createEx) {
                            $lastException = $createEx;
                        }
                    }

                    // Case B: Access denied with empty password -> check if 'root' password works
                    if (($e->getCode() == 1045 || stripos($e->getMessage(), 'Access denied') !== false) && $pass === '') {
                        foreach (['root', 'admin'] as $tryPass) {
                            try {
                                return new PDO($dsn, $user, $tryPass, [
                                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset"
                                ]);
                            } catch (PDOException $passEx) {
                                // Continue trying
                            }
                        }
                    }

                    // If error is not a connection failure (e.g. 2002 Connection Refused), don't loop endlessly
                    if ($e->getCode() != 2002 && stripos($e->getMessage(), 'Connection refused') === false && stripos($e->getMessage(), 'actively refused') === false) {
                        break;
                    }
                }
            }
        }

        throw $lastException ?? new PDOException("Unable to connect to MySQL database.");
    }

    private static function connectSqlite(): PDO {
        $path = defined('SQLITE_DB_PATH') ? SQLITE_DB_PATH : (__DIR__ . '/data/ekata_coop.sqlite');
        $dir = dirname($path);
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
        return new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    }

    private static function renderConnectionError(Throwable $e, string $target): void {
        http_response_code(500);
        $rawMsg = $e->getMessage();
        $msg = htmlspecialchars($rawMsg);
        $isCli = (php_sapi_name() === 'cli');

        if ($isCli) {
            echo "\n[ERROR] Database connection failed ($target):\n$rawMsg\n\n";
            exit(1);
        }

        $host = defined('MYSQL_HOST') ? MYSQL_HOST : '127.0.0.1';
        $port = defined('MYSQL_PORT') ? MYSQL_PORT : '3306';
        $dbName = defined('MYSQL_DB') ? MYSQL_DB : 'ekata_cooperative';
        $user = defined('MYSQL_USER') ? MYSQL_USER : 'root';

        $isStopped = (stripos($rawMsg, '2002') !== false || stripos($rawMsg, 'refused') !== false || stripos($rawMsg, 'actively refused') !== false);
        $isAccessDenied = (stripos($rawMsg, '1045') !== false || stripos($rawMsg, 'Access denied') !== false);
        $isUnknownDb = (stripos($rawMsg, '1049') !== false || stripos($rawMsg, 'Unknown database') !== false);
        $isMissingExt = (!extension_loaded('pdo_mysql'));

        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MySQL Connection Error - Ekata Cooperative (XAMPP)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; line-height: 1.6; }
    .box { max-width: 720px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    h2 { color: #f87171; margin-top: 0; display: flex; align-items: center; gap: 10px; font-size: 21px; }
    .err-code { background: rgba(239,68,68,0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 14px 18px; border-radius: 8px; font-family: monospace; font-size: 13.5px; word-break: break-all; margin: 18px 0; }
    .diagnosis { background: rgba(14,165,233,0.15); border: 1px solid #0284c7; color: #7dd3fc; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .guide { background: rgba(16,185,129,0.1); border: 1px solid #059669; color: #a7f3d0; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .guide h3 { margin-top: 0; font-size: 16px; color: #34d399; }
    .guide ol { margin: 0; padding-left: 20px; font-size: 14px; }
    .guide li { margin-bottom: 10px; }
    code { background: #0f172a; border: 1px solid #334155; padding: 2px 6px; border-radius: 4px; font-size: 12.5px; font-family: monospace; color: #38bdf8; }
    .cfg-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
    .cfg-table td { padding: 6px 10px; border-bottom: 1px solid #334155; }
    .cfg-table td:first-child { color: #94a3b8; width: 140px; }
    .btn-retry { display: inline-block; background: #0284c7; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
    .btn-retry:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="box">
    <h2>⚠️ MySQL Connection Notice ($target)</h2>
    <p style="color: #cbd5e1;">The system was unable to establish a connection to MySQL with your current configuration:</p>
    
    <div class="err-code">$msg</div>

    <div class="diagnosis">
HTML;

        if ($isMissingExt) {
            echo "<strong>Primary Cause:</strong> The <code>pdo_mysql</code> extension is not enabled in your XAMPP PHP setup.<br>";
            echo "<strong>Solution:</strong> Open <code>xampp/php/php.ini</code>, find <code>;extension=pdo_mysql</code>, delete the leading semicolon <code>;</code>, and restart Apache.";
        } elseif ($isStopped) {
            echo "<strong>Primary Cause:</strong> MySQL is NOT running in your XAMPP Control Panel (Error 2002 Connection Refused).<br>";
            echo "<strong>Solution:</strong> Open the XAMPP Control Panel and click the <strong>Start</strong> button next to <strong>MySQL</strong> until the module turns green.";
        } elseif ($isAccessDenied) {
            echo "<strong>Primary Cause:</strong> Access denied for user '$user'. Your local MySQL has a non-empty password configured.<br>";
            echo "<strong>Solution:</strong> Open <code>php-version/config.php</code> and set <code>MYSQL_PASS</code> to your MySQL password.";
        } elseif ($isUnknownDb) {
            echo "<strong>Primary Cause:</strong> Database '$dbName' does not exist yet.<br>";
            echo "<strong>Solution:</strong> Open <code>http://localhost/phpmyadmin</code>, click <strong>Import</strong>, and select <code>php-version/schema.sql</code>, or create database <code>$dbName</code>.";
        } else {
            echo "<strong>Diagnosis:</strong> Could not connect to MySQL server at <code>$host:$port</code>.";
        }

        echo <<<HTML
    </div>

    <table class="cfg-table">
      <tr><td>Attempted Host</td><td><code>$host</code> (and <code>localhost</code> fallback)</td></tr>
      <tr><td>Port</td><td><code>$port</code></td></tr>
      <tr><td>Database Name</td><td><code>$dbName</code></td></tr>
      <tr><td>MySQL Username</td><td><code>$user</code></td></tr>
    </table>

    <div class="guide">
      <h3>🛠️ 3-Step Verification Checklist for XAMPP</h3>
      <ol>
        <li><strong>Start MySQL:</strong> Open <strong>XAMPP Control Panel</strong> and ensure <strong>MySQL</strong> has a green background and shows Port 3306.</li>
        <li><strong>Import schema.sql (Optional):</strong> Go to <code>http://localhost/phpmyadmin</code> → click <strong>Import</strong> tab → upload <code>php-version/schema.sql</code> → click <strong>Go</strong>.</li>
        <li><strong>Refresh:</strong> Once MySQL is started, refresh this page or test with <a href="check_db.php" style="color:#38bdf8;">check_db.php</a>.</li>
      </ol>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 12px; align-items: center;">
      <a href="" class="btn-retry">🔄 Refresh / Try Again</a>
      <a href="check_db.php" style="color: #94a3b8; font-size: 13px; text-decoration: none;">Open Diagnostic Tool (check_db.php) →</a>
    </div>
  </div>
</body>
</html>
HTML;
        exit(1);
    }

    private static function safeExec(PDO $db, string $sql): void {
        try {
            $db->exec($sql);
        } catch (Throwable $e) {
            // Column or index already exists — ignore safely
        }
    }

    private static function ensureTables(): void {
        $db = self::$instance;
        $isSqlite = self::isSqlite();
        $pk = $isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';
        $engine = $isSqlite ? '' : ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
        $longText = $isSqlite ? 'TEXT' : 'LONGTEXT';

        // 1. Users / Staff Table
        $db->exec("CREATE TABLE IF NOT EXISTS users (
            id $pk,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            role VARCHAR(30) DEFAULT 'staff',
            email VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 2. Members Table
        $db->exec("CREATE TABLE IF NOT EXISTS members (
            id $pk,
            member_code VARCHAR(30) UNIQUE NOT NULL,
            full_name VARCHAR(120) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            pin_hash VARCHAR(255) NOT NULL,
            share_amount DECIMAL(12,2) DEFAULT 0.00,
            regular_saving_balance DECIMAL(12,2) DEFAULT 0.00,
            loan_balance DECIMAL(12,2) DEFAULT 0.00,
            kyc_status VARCHAR(20) DEFAULT 'verified',
            branch VARCHAR(50) DEFAULT 'Main Branch - Butwal',
            joined_date VARCHAR(30) DEFAULT '2065-04-15',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 3. Transactions Table (Passbook history)
        $db->exec("CREATE TABLE IF NOT EXISTS transactions (
            id $pk,
            member_code VARCHAR(30) NOT NULL,
            type VARCHAR(30) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            balance_after DECIMAL(12,2) NOT NULL,
            particulars VARCHAR(255) NOT NULL,
            trans_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 4. Loan Applications
        $db->exec("CREATE TABLE IF NOT EXISTS loan_applications (
            id $pk,
            tracking_code VARCHAR(40) UNIQUE NOT NULL,
            applicant_name VARCHAR(120) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(100),
            loan_scheme VARCHAR(80) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            tenure_months INT NOT NULL,
            monthly_income DECIMAL(12,2) NOT NULL,
            purpose TEXT,
            status VARCHAR(30) DEFAULT 'Under Review',
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 5. Member Applications (Online Account Opening)
        $db->exec("CREATE TABLE IF NOT EXISTS member_applications (
            id $pk,
            application_no VARCHAR(40) UNIQUE NOT NULL,
            full_name VARCHAR(120) NOT NULL,
            citizenship_no VARCHAR(50) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            address VARCHAR(200) NOT NULL,
            saving_scheme VARCHAR(80) NOT NULL,
            initial_deposit DECIMAL(12,2) DEFAULT 1000.00,
            status VARCHAR(30) DEFAULT 'Pending Verification',
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 6. Contact & Grievance Messages
        $db->exec("CREATE TABLE IF NOT EXISTS contact_messages (
            id $pk,
            sender_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(100),
            subject VARCHAR(150),
            message TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'Unread',
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 7. Interest Rates Table
        $db->exec("CREATE TABLE IF NOT EXISTS interest_rates (
            id $pk,
            category VARCHAR(20) NOT NULL,
            scheme_en VARCHAR(100) NOT NULL,
            scheme_np VARCHAR(100) NOT NULL,
            rate_percent DECIMAL(5,2) NOT NULL,
            basis_en VARCHAR(120) NOT NULL,
            basis_np VARCHAR(120) NOT NULL,
            min_balance DECIMAL(12,2) DEFAULT 0.00,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 8. Notices Table
        $db->exec("CREATE TABLE IF NOT EXISTS notices (
            id $pk,
            title_en VARCHAR(200) NOT NULL,
            title_np VARCHAR(200) NOT NULL,
            category VARCHAR(50) DEFAULT 'General',
            category_en VARCHAR(80) DEFAULT 'General',
            category_np VARCHAR(80) DEFAULT 'सामान्य सूचना',
            publish_date VARCHAR(30) NOT NULL,
            date_en VARCHAR(50),
            date_np VARCHAR(50),
            summary_en TEXT,
            summary_np TEXT,
            content_en TEXT,
            content_np TEXT,
            is_urgent INT DEFAULT 0,
            is_active INT DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 9. Electronic Know Your Member (eKYM) Submissions Table
        $db->exec("CREATE TABLE IF NOT EXISTS ekym_submissions (
            id $pk,
            application_no VARCHAR(40) UNIQUE NOT NULL,
            member_no VARCHAR(40),
            submission_type VARCHAR(20) DEFAULT 'update',
            saving_scheme VARCHAR(80) DEFAULT 'regular',
            initial_deposit VARCHAR(40) DEFAULT '1000',
            full_name_en VARCHAR(120) NOT NULL,
            full_name_np VARCHAR(120) NOT NULL,
            father_name VARCHAR(120) NOT NULL,
            grandfather_name VARCHAR(120) NOT NULL,
            mother_name VARCHAR(120),
            spouse_name VARCHAR(120),
            dob VARCHAR(30) NOT NULL,
            dob_ad VARCHAR(30),
            gender VARCHAR(20) NOT NULL,
            marital_status VARCHAR(30),
            nationality VARCHAR(40) DEFAULT 'Nepali',
            citizenship_no VARCHAR(50) NOT NULL,
            citizenship_district VARCHAR(50) NOT NULL,
            citizenship_issue_date VARCHAR(30),
            pan_no VARCHAR(40),
            phone VARCHAR(20) NOT NULL,
            alt_phone VARCHAR(20),
            email VARCHAR(100),
            perm_province VARCHAR(80),
            perm_district VARCHAR(80),
            perm_municipality VARCHAR(120),
            perm_ward VARCHAR(20),
            perm_tole VARCHAR(120),
            temp_municipality VARCHAR(120),
            temp_ward VARCHAR(20),
            temp_tole VARCHAR(120),
            temp_district VARCHAR(80),
            permanent_address VARCHAR(200) NOT NULL,
            current_address VARCHAR(200) NOT NULL,
            occupation VARCHAR(100) NOT NULL,
            organization_name VARCHAR(150),
            annual_income VARCHAR(50) NOT NULL,
            income_source VARCHAR(100),
            bank_name VARCHAR(100) NOT NULL,
            bank_account_no VARCHAR(50) NOT NULL,
            nominee_name VARCHAR(120) NOT NULL,
            nominee_relation VARCHAR(50) NOT NULL,
            nominee_citizenship VARCHAR(50),
            nominee_phone VARCHAR(30),
            doc_photo VARCHAR(255),
            doc_citizenship VARCHAR(255),
            doc_signature VARCHAR(255),
            doc_photo_data $longText,
            doc_citizenship_data $longText,
            doc_signature_data $longText,
            status VARCHAR(30) DEFAULT 'Pending',
            remarks TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 10. Site Settings (Frontend System CMS)
        $db->exec("CREATE TABLE IF NOT EXISTS site_settings (
            setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
            setting_value $longText NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 11. Frontend Hero Slider
        $db->exec("CREATE TABLE IF NOT EXISTS frontend_slides (
            id $pk,
            title_en VARCHAR(200) NOT NULL,
            title_np VARCHAR(200) NOT NULL,
            subtitle_en TEXT,
            subtitle_np TEXT,
            image_url TEXT NOT NULL,
            cta_text_en VARCHAR(100),
            cta_text_np VARCHAR(100),
            cta_link VARCHAR(200),
            sort_order INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 12. Frontend Gallery Items
        $db->exec("CREATE TABLE IF NOT EXISTS gallery_items (
            id $pk,
            title_en VARCHAR(200) NOT NULL,
            title_np VARCHAR(200) NOT NULL,
            category VARCHAR(80) NOT NULL,
            image_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 13. Frontend Services Catalog
        $db->exec("CREATE TABLE IF NOT EXISTS services_cms (
            id $pk,
            slug VARCHAR(60) UNIQUE NOT NULL,
            title_en VARCHAR(150) NOT NULL,
            title_np VARCHAR(150) NOT NULL,
            description_en TEXT NOT NULL,
            description_np TEXT NOT NULL,
            icon VARCHAR(30) NOT NULL,
            category VARCHAR(50) NOT NULL,
            badge VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 14. Popup Notices Table
        $db->exec("CREATE TABLE IF NOT EXISTS popup_notices (
            id $pk,
            notice_key VARCHAR(80) UNIQUE,
            active INT DEFAULT 1,
            title_en VARCHAR(255) NOT NULL,
            title_np VARCHAR(255) NOT NULL,
            category_en VARCHAR(100) NOT NULL,
            category_np VARCHAR(100) NOT NULL,
            image_url VARCHAR(255),
            content_en TEXT NOT NULL,
            content_np TEXT NOT NULL,
            bullet_points_en TEXT,
            bullet_points_np TEXT,
            date_en VARCHAR(60),
            date_np VARCHAR(60),
            notice_ref VARCHAR(100),
            action_text_en VARCHAR(120),
            action_text_np VARCHAR(120),
            action_link VARCHAR(120),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // 15. Media Files Table
        $db->exec("CREATE TABLE IF NOT EXISTS media_files (
            id $pk,
            media_key VARCHAR(100) UNIQUE NOT NULL,
            title VARCHAR(200) NOT NULL,
            category VARCHAR(60) DEFAULT 'general',
            mime_type VARCHAR(80) DEFAULT 'image/svg+xml',
            file_path VARCHAR(255) NOT NULL,
            filename VARCHAR(255),
            file_data $longText,
            file_size INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )$engine");

        // Safe column migrations for pre-existing tables
        $migrations = [
            "ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE members ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE members ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE transactions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE loan_applications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE loan_applications ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE loan_applications ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE member_applications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE member_applications ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE member_applications ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE contact_messages ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE contact_messages ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE interest_rates ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE interest_rates ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE notices ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE notices ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE notices ADD COLUMN category_en VARCHAR(80) DEFAULT 'General'",
            "ALTER TABLE notices ADD COLUMN category_np VARCHAR(80) DEFAULT 'सामान्य सूचना'",
            "ALTER TABLE ekym_submissions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE ekym_submissions ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE ekym_submissions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE ekym_submissions ADD COLUMN doc_photo_data $longText",
            "ALTER TABLE ekym_submissions ADD COLUMN doc_citizenship_data $longText",
            "ALTER TABLE ekym_submissions ADD COLUMN doc_signature_data $longText",
            "ALTER TABLE frontend_slides ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE frontend_slides ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE gallery_items ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE gallery_items ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE services_cms ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE services_cms ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE popup_notices ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE popup_notices ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE media_files ADD COLUMN filename VARCHAR(255)",
            "ALTER TABLE media_files ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE media_files ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP"
        ];
        foreach ($migrations as $mSql) {
            self::safeExec($db, $mSql);
        }

        // Seed initial data if tables are empty
        self::seedDefaults($db);
    }

    public static function getSetting(string $key, string $default = ''): string {
        $db = self::getConnection();
        $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return $row ? $row['setting_value'] : $default;
    }

    public static function setSetting(string $key, string $value): void {
        $db = self::getConnection();
        if (self::isSqlite()) {
            $stmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP");
        } else {
            $stmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()");
        }
        $stmt->execute([$key, $value]);
    }

    public static function getAllSettings(): array {
        $db = self::getConnection();
        $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
        $rows = $stmt->fetchAll();
        $res = [];
        foreach ($rows as $r) {
            $res[$r['setting_key']] = $r['setting_value'];
        }
        return $res;
    }

    private static function seedDefaults(PDO $db): void {
        $isSqlite = self::isSqlite();

        // 1. Admin user ('admin' / 'Admin@123')
        $adminPass = password_hash('Admin@123', PASSWORD_DEFAULT);
        $stmt = $db->prepare("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
        $stmt->execute();
        $adminUser = $stmt->fetch();

        if ($adminUser) {
            $upd = $db->prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'");
            $upd->execute([$adminPass]);
        } else {
            $ins = $db->prepare("INSERT INTO users (username, password_hash, full_name, role, email) VALUES (?, ?, ?, ?, ?)");
            $ins->execute(['admin', $adminPass, 'Chief Executive Officer', 'admin', 'ceo@ekatacoop.com.np']);
        }

        // 2. Staff user ('staff' / 'staff@2057')
        $staffStmt = $db->prepare("SELECT id FROM users WHERE username = 'staff' LIMIT 1");
        $staffStmt->execute();
        if (!$staffStmt->fetch()) {
            $ins = $db->prepare("INSERT INTO users (username, password_hash, full_name, role, email) VALUES (?, ?, ?, ?, ?)");
            $ins->execute(['staff', password_hash('staff@2057', PASSWORD_DEFAULT), 'Branch Operations Officer', 'staff', 'ops@ekatacoop.com.np']);
        }

        // 3. Demo Member (Code: EK-10482, PIN: 1234)
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM members");
        $memCount = (int)$stmt->fetch()['cnt'];

        if ($memCount === 0) {
            $pinHash = password_hash('1234', PASSWORD_DEFAULT);
            $insMem = $db->prepare("INSERT INTO members (member_code, full_name, phone, pin_hash, share_amount, regular_saving_balance, loan_balance, branch, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $insMem->execute([
                'EK-10482',
                'राम कुमार शर्मा (Ram Kumar Sharma)',
                '9857012345',
                $pinHash,
                25000.00,
                148500.00,
                0.00,
                'Main Branch - Butwal-4',
                '2065-04-15'
            ]);
            $insMem->execute([
                'EK-10483',
                'सीता देवी थापा (Sita Devi Thapa)',
                '9857054321',
                $pinHash,
                50000.00,
                285000.00,
                150000.00,
                'Traffic Chowk Branch - Butwal-6',
                '2068-07-22'
            ]);
            $insMem->execute([
                'EK-10484',
                'हरि प्रसाद पौडेल (Hari Prasad Poudel)',
                '9847098765',
                $pinHash,
                100000.00,
                542000.00,
                0.00,
                'Main Branch - Butwal-4',
                '2062-11-10'
            ]);

            // Passbook transactions
            $insTx = $db->prepare("INSERT INTO transactions (member_code, type, amount, balance_after, particulars, trans_date) VALUES (?, ?, ?, ?, ?, ?)");
            $insTx->execute(['EK-10482', 'Credit', 15000.00, 15000.00, 'Opening Share & Regular Deposit', '2081-01-05 10:15:00']);
            $insTx->execute(['EK-10482', 'Credit', 25000.00, 40000.00, 'Monthly Recurring Deposit Transfer', '2081-02-02 11:30:00']);
            $insTx->execute(['EK-10482', 'Credit', 100000.00, 140000.00, '1-Year High Yield Term Deposit', '2081-04-10 14:00:00']);
            $insTx->execute(['EK-10482', 'Credit', 8500.00, 148500.00, 'Quarterly Interest Capitalized @ 9.5%', '2081-06-30 16:45:00']);
            
            $insTx->execute(['EK-10483', 'Credit', 50000.00, 50000.00, 'Opening Share Capital Deposit', '2081-01-10 11:00:00']);
            $insTx->execute(['EK-10483', 'Credit', 235000.00, 285000.00, 'Business Remittance Inward Transfer', '2081-03-15 14:20:00']);
            
            $insTx->execute(['EK-10484', 'Credit', 100000.00, 100000.00, 'Senior Citizen Welfare Deposit', '2080-12-01 09:30:00']);
            $insTx->execute(['EK-10484', 'Credit', 442000.00, 542000.00, 'Fixed Term Deposit Maturity Credit', '2081-05-20 12:45:00']);
        }

        // 4. Interest Rates
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM interest_rates");
        if ((int)$stmt->fetch()['cnt'] === 0) {
            $rates = [
                ['Deposit', 'Regular Savings Account', 'साधारण बचत खाता', 7.25, 'Daily balance calculation, quarterly interest payout', 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी', 500],
                ['Deposit', 'Nari Kalyan Bachat', 'नारी कल्याण बचत', 8.00, 'Monthly interest payout with free ATM/QR', 'मासिक ब्याज भुक्तानी तथा निःशुल्क मोबाइल बैंकिङ', 1000],
                ['Deposit', 'Senior Citizen Care Fund', 'ज्येष्ठ नागरिक सम्मान बचत', 9.50, 'Quarterly interest, priority counter service', 'त्रैमासिक ब्याज, ज्येष्ठ नागरिक विशेष काउन्टर', 1000],
                ['Deposit', 'Child Bright Future Scheme', 'बाल उज्ज्वल भविष्य बचत', 9.00, 'Annual compounding growth for education', 'वार्षिक चक्रवृद्धिय ब्याज, उच्च शिक्षा योजना', 500],
                ['Deposit', '1-Year Fixed Term Deposit', '१ वर्षे मुद्दती निक्षेप', 10.50, 'Highest quarterly credited returns', 'त्रैमासिक रूपमा खातामै ब्याज जम्मा', 25000],
                ['Deposit', '2-Year+ Golden Term Deposit', '२ वर्षे स्वर्ण मुद्दती निक्षेप', 11.75, 'Maximum yield with 90% loan facility', 'सर्वाधिक ११.७५% प्रतिफल तथा ९०% सम्म कर्जा सुविधा', 50000],
                ['Loan', 'Agricultural Productive Loan', 'व्यावसायिक कृषि तथा पशुपालन कर्जा', 12.00, 'Subsidized priority credit for local farmers', 'स्थानीय किसानहरूको लागि सहुलियतपूर्ण ब्याज', 0],
                ['Loan', 'SME & Enterprise Expansion Loan', 'साना तथा मझौला व्यवसाय कर्जा', 13.50, 'Working capital for trading and shops', 'पसल तथा व्यवसाय सञ्चालनका लागि सरल कर्जा', 0],
                ['Loan', 'Residential Housing & Land Loan', 'आवास निर्माण तथा जग्गा खरिद कर्जा', 13.00, 'Up to 15 years flexible amortization', '१५ वर्षसम्मको सहज किस्ताबन्दी सुविधा', 0],
                ['Loan', 'Social & Foreign Employment Loan', 'सामाजिक तथा वैदेशिक रोजगार कर्जा', 13.50, 'Fast approval for skill & career opportunities', 'द्रुत प्रक्रियाबाट सहज कर्जा प्रवाह', 0]
            ];

            $insRate = $db->prepare("INSERT INTO interest_rates (category, scheme_en, scheme_np, rate_percent, basis_en, basis_np, min_balance) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($rates as $r) {
                $insRate->execute($r);
            }
        }

        // 5. Notices
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM notices");
        if ((int)$stmt->fetch()['cnt'] === 0) {
            $notices = [
                [
                    '24th Annual General Meeting Report Published',
                    '२४औं वार्षिक साधारण सभाको प्रतिवेदन पुस्तिका प्रकाशन सम्बन्धमा',
                    'AGM Notice',
                    '२०८१ असोज १५',
                    'The official report book of the 24th AGM has been published and is available for all shareholders at our head office and digital portal.',
                    'संस्थाको २४औं वार्षिक साधारण सभाको पूर्ण प्रतिवेदन पुस्तिका आधिकारिक वेबसाइट तथा मुख्य कार्यालय बुटवलमा उपलब्ध छ।'
                ],
                [
                    'Revised Interest Rates Effective from Kartik 1, 2081',
                    'नयाँ ब्याजदर तालिका मिति २०८१ कार्तिक १ गतेदेखि लागू भएको सम्बन्धी सूचना',
                    'Interest Rates',
                    '२०८१ कार्तिक ०१',
                    'All valued members are notified that high yield deposit interest rates up to 11.75% per annum are now active across all branches.',
                    'सम्पूर्ण आदरणीय सेयर सदस्य महानुभावहरूमा अधिकतम ११.७५% सम्मको नयाँ ब्याजदर लागू भएको जानकारी गराइन्छ।'
                ],
                [
                    'Staff Career Vacancies Application Process',
                    'खुला पदपूर्ति दरखास्त आह्वान सम्बन्धी सूचना',
                    'Career',
                    '२०८१ असोज २५',
                    'Ekata Cooperative invites eligible, dedicated candidates for the positions of Assistant Manager and Junior Teller. Applications open till deadline.',
                    'यस संस्थाका लागि आवश्यक सहायक प्रबन्धक तथा कनिष्ठ सहायक (टेलर) पदमा आवेदन खुला गरिएको छ।'
                ]
            ];

            $insNotice = $db->prepare("INSERT INTO notices (title_en, title_np, category, publish_date, content_en, content_np) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($notices as $n) {
                $insNotice->execute($n);
            }
        }

        // 6. Site Settings
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM site_settings");
        if ((int)$stmt->fetch()['cnt'] === 0) {
            $defaultSettings = [
                'coop_name_en' => 'Ekata Saving & Credit Cooperative Ltd.',
                'coop_name_np' => 'एकता बचत तथा ऋण सहकारी संस्था लि.',
                'coop_logo_url' => 'assets/images/ekata-logo.svg',
                'tagline_en' => 'Butwal-4, Rupandehi • Regd. No: 421/057/058 • Established 2057 B.S.',
                'tagline_np' => 'बुटवल-४, रुपन्देही • दर्ता नं: ४२१/०५७/०५८ • स्थापना: २०५७ वि.सं.',
                'established_bs' => '2057',
                'ticker_text_en' => 'Welcome to Ekata Saving & Credit Cooperative Ltd. | Member eKYM Digital Update active | High-Yield Term Deposits up to 11.75% | Toll-Free: 1660-01-99887',
                'ticker_text_np' => 'एकता बचत तथा ऋण सहकारी संस्था लि. मा हार्दिक स्वागत गर्दछौं। | अनलाइन eKYM अध्यावधिक सुरु | ११.७५% सम्म मुद्दती निक्षेप प्रतिफल | टोल-फ्री: १६६०-०१-९९८८७',
                'ticker_active' => '1',
                'phone_headoffice' => '071-540123 / 540456',
                'phone_tollfree' => '1660-01-99887',
                'email_official' => 'info@ekatacoop.com.np',
                'address_headoffice' => 'Main Road, Butwal-4, Rupandehi, Lumbini Province, Nepal',
                'office_hours' => 'Sunday - Friday: 10:00 AM - 5:00 PM (Cash Counter till 4:00 PM)',
                'regd_no' => '421/057/058',
                'pan_no' => '301548921',
                'stat_members' => '15,420+',
                'stat_savings' => 'Rs. 1.28 Arba',
                'stat_loans' => 'Rs. 98.40 Crore',
                'stat_capital' => 'Rs. 24.50 Crore',
                'stat_branches' => '',
                'about_intro_en' => 'Established in 2057 B.S. under the Cooperative Act, Ekata Saving & Credit Cooperative Ltd. is a community-anchored financial institution committed to sustainable economic development, grassroots empowerment, and modern digital banking in Western Nepal.',
                'about_intro_np' => 'सहकारी ऐन अन्तर्गत वि.सं. २०५७ सालमा स्थापित एकता बचत तथा ऋण सहकारी संस्था लि. समुदायमा आधारित, सदस्य-केन्द्रित र वित्तीय सुशासनयुक्त भरपर्दो वित्तीय संस्था हो।'
            ];

            $insertSql = $isSqlite 
                ? "INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)"
                : "INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)";

            $insSetting = $db->prepare($insertSql);
            foreach ($defaultSettings as $k => $v) {
                $insSetting->execute([$k, $v]);
            }
        }

        // 7. Frontend Slides
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM frontend_slides");
        if ((int)$stmt->fetch()['cnt'] === 0) {
            $slides = [
                [
                    'Trusted Financial Pillar of Rupandehi',
                    'समुदायमा आधारित, सदस्य केन्द्रित भरपर्दो वित्तीय संस्था',
                    'Serving members since 2057 B.S. with secure savings, productive business loans, and modern mobile banking.',
                    'वि.सं. २०५७ देखि रुपन्देही र आसपासका क्षेत्रमा सुरक्षित बचत, उत्पादनशील कर्जा र आधुनिक डिजिटल बैंकिङ सेवा।',
                    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1600&auto=format&fit=crop&q=80',
                    'Explore Services',
                    'सेवाहरू हेर्नुहोस्',
                    '#services',
                    1
                ],
                [
                    'Earn Up To 11.75% On Term Deposits',
                    'मुद्दती निक्षेपमा ११.७५% सम्म आकर्षक प्रतिफल',
                    'Flexible tenure from 3 months to 5 years, quarterly interest compounding, and instant 90% loan facility against fixed deposits.',
                    '३ महिनादेखि ५ वर्षसम्मको सहज अवधि, त्रैमासिक ब्याज भुक्तानी तथा मुद्दती रसिद धितोमा ९०% सम्म कर्जा सुविधा।',
                    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&auto=format&fit=crop&q=80',
                    'View Interest Rates',
                    'ब्याजदर तालिका',
                    '#rates',
                    2
                ],
                [
                    'Empowering Local Agriculture & Enterprise',
                    'कृषि, व्यापार र साना उद्यमशीलताको भरपर्दो सहयात्री',
                    'Subsidized collateral loans for modern farming, livestock, retail trade, and housing with swift paperwork.',
                    'आधुनिक कृषि, व्यापार प्रवर्द्धन, आवास र स्वरोजगारका लागि सरल प्रक्रियामा कर्जा प्रवाह।',
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop&q=80',
                    'Apply for Loan',
                    'कर्जा आवेदन दिनुहोस्',
                    '#services-loans',
                    3
                ]
            ];

            $insSlide = $db->prepare("INSERT INTO frontend_slides (title_en, title_np, subtitle_en, subtitle_np, image_url, cta_text_en, cta_text_np, cta_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($slides as $s) {
                $insSlide->execute($s);
            }
        }

        // 8. Gallery Items
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM gallery_items");
        if ((int)$stmt->fetch()['cnt'] === 0) {
            $gallery = [
                ['Annual General Meeting & Honor Ceremony', 'वार्षिक साधारण सभा तथा सम्मान कार्यक्रम', 'General Meeting', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'],
                ['Financial Literacy for Women Micro-Entrepreneurs', 'महिला लघुउद्यमीहरूलाई वित्तीय साक्षरता तालिम', 'Empowerment', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'],
                ['Free Community Health Camp & Blood Donation', 'निःशुल्क सामुदायिक स्वास्थ्य शिविर तथा रक्तदान', 'Social CSR', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80']
            ];

            $insG = $db->prepare("INSERT INTO gallery_items (title_en, title_np, category, image_url) VALUES (?, ?, ?, ?)");
            foreach ($gallery as $g) {
                $insG->execute($g);
            }
        }

        // 9. Services CMS
        $stmt = $db->query("SELECT COUNT(*) as cnt FROM services_cms");
        if ((int)$stmt->fetch()['cnt'] === 0) {
            $services = [
                ['member-service', 'Member Service', 'सदस्य सेवा', 'Share membership, regular financial counseling, welfare relief fund, and assembly voting rights.', 'सेयर सदस्यता, नियमित वित्तीय परामर्श, सदस्य सुरक्षा कोष तथा साधारण सभा मतदान अधिकार।', '👥', 'member', 'Core Member'],
                ['deposit-product', 'Deposit Product', 'बचत योजना', 'High-yield recurring, daily, child future, and fixed term deposits yielding up to 11.75% per annum.', 'दैनिक बचत, बाल उज्ज्वल बचत, नारी बचत तथा ११.७५% सम्म आकर्षक ब्याज प्राप्त हुने मुद्दती निक्षेप।', '🪙', 'savings', 'Up to 11.75%'],
                ['loan', 'Loan', 'कर्जा सेवा', 'Productive agricultural loans, small business expansion credit, housing, and social enterprise finance.', 'व्यावसायिक कृषि, पशुपालन, साना तथा मझौला व्यापार, आवास निर्माण तथा सुलभ व्यक्तिगत कर्जा।', '💼', 'loan', 'From 12.00%'],
                ['remittance', 'Remittance', 'रेमिट्यान्स सेवा', 'Domestic and international money transfer payout via Prabhu, IME, Western Union, and Global Remit.', 'विश्वका सबै देशहरूबाट पठाएको रकम प्रभु, आइएमई तथा वेस्टर्न युनियनमार्फत तत्काल काउन्टर भुक्तानी।', '↗', 'remittance', 'Instant Payout'],
                ['insurance', 'Insurance', 'सुरक्षण तथा बीमा', 'Member health & accident safety micro-insurance, livestock/crop safety, and loan risk protection.', 'सदस्य दुर्घटना तथा स्वास्थ्य सुरक्षा, पशुधन तथा बाली बिमा र कर्जा सुरक्षण सुविधा।', '🛡️', 'insurance', 'Micro-Safety'],
                ['digital-services', 'Smart Digital Services', 'डिजिटल सेवाहरू', 'Ekata Smart mobile banking, NepalPay merchant QR, utility bills, fund transfers, and SMS notifications.', 'एकता स्मार्ट मोबाइल बैंकिङ, नेपालपे क्युआर भुक्तानी, बिजुली-पानी महसुल तथा अन्तरबैंक रकम ट्रान्सफर।', '📱', 'digital', 'NepalPay QR']
            ];

            $insSvc = $db->prepare("INSERT INTO services_cms (slug, title_en, title_np, description_en, description_np, icon, category, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($services as $sc) {
                $insSvc->execute($sc);
            }
        }

        // 10. Exchange Rates & Institutional Profiles in site_settings
        $insertSettingSql = $isSqlite 
            ? "INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)"
            : "INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)";
        $insCmsSetting = $db->prepare($insertSettingSql);
        $insCmsSetting->execute([
            'cms_exchange_rates',
            json_encode([
                ['id' => 'fx-inr', 'currencyCode' => 'INR', 'currencyNameEn' => 'Indian Rupee', 'currencyNameNp' => 'भारतीय रूपैयाँ', 'flag' => '🇮🇳', 'unit' => 100, 'buyingRate' => '160.00', 'sellingRate' => '160.15', 'isFixed' => true, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 1],
                ['id' => 'fx-usd', 'currencyCode' => 'USD', 'currencyNameEn' => 'U.S. Dollar', 'currencyNameNp' => 'अमेरिकी डलर', 'flag' => '🇺🇸', 'unit' => 1, 'buyingRate' => '134.25', 'sellingRate' => '134.85', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 2],
                ['id' => 'fx-eur', 'currencyCode' => 'EUR', 'currencyNameEn' => 'European Euro', 'currencyNameNp' => 'युरोपेली युरो', 'flag' => '🇪🇺', 'unit' => 1, 'buyingRate' => '148.40', 'sellingRate' => '149.06', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 3],
                ['id' => 'fx-gbp', 'currencyCode' => 'GBP', 'currencyNameEn' => 'UK Pound Sterling', 'currencyNameNp' => 'बेलायती पाउण्ड स्टर्लिङ', 'flag' => '🇬🇧', 'unit' => 1, 'buyingRate' => '175.80', 'sellingRate' => '176.59', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 4],
                ['id' => 'fx-aud', 'currencyCode' => 'AUD', 'currencyNameEn' => 'Australian Dollar', 'currencyNameNp' => 'अष्ट्रेलियन डलर', 'flag' => '🇦🇺', 'unit' => 1, 'buyingRate' => '90.65', 'sellingRate' => '91.06', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 5],
                ['id' => 'fx-cad', 'currencyCode' => 'CAD', 'currencyNameEn' => 'Canadian Dollar', 'currencyNameNp' => 'क्यानेडियन डलर', 'flag' => '🇨🇦', 'unit' => 1, 'buyingRate' => '99.10', 'sellingRate' => '99.55', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 6],
                ['id' => 'fx-jpy', 'currencyCode' => 'JPY', 'currencyNameEn' => 'Japanese Yen', 'currencyNameNp' => 'जापानी येन', 'flag' => '🇯🇵', 'unit' => 10, 'buyingRate' => '9.32', 'sellingRate' => '9.36', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 7],
                ['id' => 'fx-sar', 'currencyCode' => 'SAR', 'currencyNameEn' => 'Saudi Arabian Riyal', 'currencyNameNp' => 'साउदी अरेबियन रियाल', 'flag' => '🇸🇦', 'unit' => 1, 'buyingRate' => '35.78', 'sellingRate' => '35.94', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 8],
                ['id' => 'fx-qar', 'currencyCode' => 'QAR', 'currencyNameEn' => 'Qatari Riyal', 'currencyNameNp' => 'कतारी रियाल', 'flag' => '🇶🇦', 'unit' => 1, 'buyingRate' => '36.82', 'sellingRate' => '36.99', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 9],
                ['id' => 'fx-aed', 'currencyCode' => 'AED', 'currencyNameEn' => 'UAE Dirham', 'currencyNameNp' => 'युएई दिराम', 'flag' => '🇦🇪', 'unit' => 1, 'buyingRate' => '36.55', 'sellingRate' => '36.71', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 10],
                ['id' => 'fx-myr', 'currencyCode' => 'MYR', 'currencyNameEn' => 'Malaysian Ringgit', 'currencyNameNp' => 'मलेसियन रिंगिट', 'flag' => '🇲🇾', 'unit' => 1, 'buyingRate' => '31.15', 'sellingRate' => '31.29', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 11],
                ['id' => 'fx-krw', 'currencyCode' => 'KRW', 'currencyNameEn' => 'South Korean Won', 'currencyNameNp' => 'दक्षिण कोरियन वन', 'flag' => '🇰🇷', 'unit' => 100, 'buyingRate' => '10.04', 'sellingRate' => '10.09', 'isFixed' => false, 'isEnabled' => true, 'updatedAt' => '2083-05-15', 'sortOrder' => 12]
            ], JSON_UNESCAPED_UNICODE)
        ]);
    }

    public static function checkHealth(): array {
        $db = self::getConnection();
        $tables = [
            'users', 'members', 'transactions', 'loan_applications',
            'member_applications', 'contact_messages', 'interest_rates',
            'notices', 'ekym_submissions', 'site_settings',
            'frontend_slides', 'gallery_items', 'services_cms'
        ];

        $results = [];
        foreach ($tables as $t) {
            try {
                $stmt = $db->query("SELECT COUNT(*) as cnt FROM `$t`");
                $cnt = (int)$stmt->fetch()['cnt'];
                $results[$t] = ['exists' => true, 'count' => $cnt];
            } catch (Throwable $e) {
                $results[$t] = ['exists' => false, 'error' => $e->getMessage()];
            }
        }

        return [
            'driver' => self::$activeDriver,
            'tables' => $results,
            'all_ok' => !in_array(false, array_column($results, 'exists'))
        ];
    }
}
