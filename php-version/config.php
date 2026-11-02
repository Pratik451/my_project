<?php
/**
 * Ekata Saving & Credit Cooperative Ltd.
 * Configuration Settings
 * File: php-version/config.php
 */

// Environment settings
define('APP_NAME_EN', 'Ekata Saving & Credit Cooperative Ltd.');
define('APP_NAME_NP', 'एकता बचत तथा ऋण सहकारी संस्था लि.');
define('APP_REGD_NO', '२४५/०५६/०५७');
define('APP_ESTABLISHED_BS', '२०५७');
define('APP_ESTABLISHED_AD', '2000');

// Database driver: 'mysql' (Standard for XAMPP / MariaDB / phpMyAdmin / cPanel)
// - 'mysql': Connects directly to MySQL / MariaDB (XAMPP default: 127.0.0.1:3306, user: root, password: "")
// - 'auto': Tries MySQL first, falls back to SQLite if MySQL service is not running
// - 'sqlite': Forces SQLite (single-file database in /data/ekata_coop.sqlite)
define('DB_DRIVER', 'mysql');

// SQLite configuration (stored locally in database directory)
define('SQLITE_DB_PATH', __DIR__ . '/data/ekata_coop.sqlite');

// MySQL configuration (for cPanel, phpMyAdmin, or LAMP stack)
define('MYSQL_HOST', '127.0.0.1');
define('MYSQL_PORT', '3306');
define('MYSQL_DB', 'ekata_cooperative');
define('MYSQL_USER', 'root');
define('MYSQL_PASS', '');
define('MYSQL_CHARSET', 'utf8mb4');

// Security and Session settings
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// JSON response helper
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Clean and sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim((string)$data), ENT_QUOTES, 'UTF-8');
}
