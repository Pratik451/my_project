<?php
/**
 * Ekata Saving & Credit Cooperative Ltd.
 * Database Diagnostics & Verification Tool for XAMPP / cPanel
 * File: php-version/check_db.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

$title = "Database Status & Diagnostics - Ekata Cooperative";
$hasError = false;
$errorMsg = '';
$health = null;
$actionNotice = '';

// Re-seed action
if (isset($_GET['action']) && $_GET['action'] === 'repair') {
    try {
        $db = Database::getConnection();
        $actionNotice = "Database tables and default seeds verified successfully.";
    } catch (Throwable $e) {
        $hasError = true;
        $errorMsg = $e->getMessage();
    }
}

try {
    $db = Database::getConnection();
    $health = Database::checkHealth();
} catch (Throwable $e) {
    $hasError = true;
    $errorMsg = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $title; ?></title>
  <style>
    :root {
      --primary: #005A9C;
      --primary-dark: #003B66;
      --accent: #E31B23;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --border: #E2E8F0;
      --text: #1E293B;
      --text-muted: #64748B;
      --success: #16A34A;
      --danger: #DC2626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); padding: 32px 16px; line-height: 1.5; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--border); }
    .logo-box { display: flex; align-items: center; gap: 14px; }
    .logo-box img { width: 50px; height: 50px; object-fit: contain; }
    .logo-box h1 { font-size: 20px; color: var(--primary-dark); font-weight: 700; }
    .logo-box p { font-size: 13px; color: var(--text-muted); }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card-title { font-size: 16px; font-weight: 700; color: var(--primary-dark); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
    .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #DCFCE7; color: #166534; }
    .badge-danger { background: #FEE2E2; color: #991B1B; }
    .badge-info { background: #E0F2FE; color: #0369A1; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
    .info-label { color: var(--text-muted); }
    .info-val { font-weight: 600; color: var(--text); }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #F1F5F9; }
    th { font-size: 12px; text-transform: uppercase; color: var(--text-muted); background: #F8FAFC; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: 0.15s; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #F1F5F9; }
    .alert { padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .alert-success { background: #DCFCE7; border: 1px solid #BBF7D0; color: #166534; }
    .alert-danger { background: #FEE2E2; border: 1px solid #FECACA; color: #991B1B; }
    .actions-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo-box">
      <img src="assets/images/ekata-logo.svg" alt="Logo" onerror="this.src='../public/assets/images/ekata-logo.svg'">
      <div>
        <h1>Ekata Cooperative - Database Diagnostics</h1>
        <p>Verification tool for XAMPP / MariaDB / MySQL / SQLite</p>
      </div>
    </div>
    <div>
      <a href="index.php" class="btn btn-outline">← Back to Website</a>
    </div>
  </div>

  <?php if ($actionNotice): ?>
    <div class="alert alert-success"><?php echo htmlspecialchars($actionNotice); ?></div>
  <?php endif; ?>

  <?php if ($hasError): ?>
    <div class="alert alert-danger">
      <strong>Database Error:</strong> <?php echo htmlspecialchars($errorMsg); ?>
      <div style="margin-top: 10px; font-size: 13px;">
        Make sure MySQL is started in XAMPP Control Panel, or import <code>schema.sql</code> into phpMyAdmin.
      </div>
    </div>
  <?php endif; ?>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">
        <span>Environment & Connection</span>
        <?php if ($health && $health['all_ok']): ?>
          <span class="badge badge-success">Operational</span>
        <?php else: ?>
          <span class="badge badge-danger">Attention Needed</span>
        <?php endif; ?>
      </div>
      <div class="info-row">
        <span class="info-label">PHP Version</span>
        <span class="info-val"><?php echo PHP_VERSION; ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Config DB Driver</span>
        <span class="info-val"><?php echo htmlspecialchars(DB_DRIVER); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Active Connection Driver</span>
        <span class="info-val">
          <span class="badge badge-info"><?php echo strtoupper($health['driver'] ?? 'N/A'); ?></span>
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">PDO MySQL Extension</span>
        <span class="info-val"><?php echo extension_loaded('pdo_mysql') ? '✅ Enabled' : '❌ Disabled'; ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">PDO SQLite Extension</span>
        <span class="info-val"><?php echo extension_loaded('pdo_sqlite') ? '✅ Enabled' : '❌ Disabled'; ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Configured MySQL Host</span>
        <span class="info-val"><?php echo htmlspecialchars(MYSQL_HOST . ':' . MYSQL_PORT); ?></span>
      </div>
      <div class="info-row">
        <span class="info-label">Configured MySQL Database</span>
        <span class="info-val"><?php echo htmlspecialchars(MYSQL_DB); ?></span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        <span>Demo Credentials</span>
        <span class="badge badge-info">Ready to Test</span>
      </div>
      <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
        The system comes pre-seeded with credentials for instant testing in XAMPP:
      </div>
      <div class="info-row">
        <span class="info-label">Admin Username</span>
        <span class="info-val"><code>admin</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Admin Password</span>
        <span class="info-val"><code>Admin@123</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Staff Username</span>
        <span class="info-val"><code>staff</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Staff Password</span>
        <span class="info-val"><code>staff@2057</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Demo Member Code</span>
        <span class="info-val"><code>EK-10482</code></span>
      </div>
      <div class="info-row">
        <span class="info-label">Member PIN</span>
        <span class="info-val"><code>1234</code></span>
      </div>
    </div>
  </div>

  <?php if ($health): ?>
  <div class="card">
    <div class="card-title">
      <span>Database Tables Status (<?php echo count($health['tables']); ?> Tables)</span>
      <a href="check_db.php?action=repair" class="btn btn-outline" style="font-size: 12px; padding: 4px 10px;">Verify / Repair Tables</a>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Table Name</th>
          <th>Status</th>
          <th>Records</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <?php 
        $i = 1;
        $descriptions = [
          'users' => 'Administrative & Staff Authentication',
          'members' => 'Cooperative Shareholder Accounts',
          'transactions' => 'Passbook Ledger & Statement History',
          'loan_applications' => 'Underwriting & Loan Applications',
          'member_applications' => 'Online Account Opening Submissions',
          'contact_messages' => 'Member Inquiries & Grievances',
          'interest_rates' => 'Savings & Loan Schemes Interest Matrix',
          'notices' => 'Official Announcements & Circulars',
          'ekym_submissions' => 'Electronic Know Your Member Forms',
          'site_settings' => 'CMS Configuration & Institutional Stats',
          'frontend_slides' => 'Homepage Interactive Hero Carousel',
          'gallery_items' => 'Cooperative Activities Photo Gallery',
          'services_cms' => 'Financial Products & Services Catalog'
        ];
        foreach ($health['tables'] as $tableName => $status): 
        ?>
        <tr>
          <td style="color: var(--text-muted);"><?php echo $i++; ?></td>
          <td><strong><?php echo htmlspecialchars($tableName); ?></strong></td>
          <td>
            <?php if ($status['exists']): ?>
              <span class="badge badge-success">OK</span>
            <?php else: ?>
              <span class="badge badge-danger">Missing</span>
            <?php endif; ?>
          </td>
          <td><?php echo $status['exists'] ? number_format($status['count']) : '-'; ?></td>
          <td style="color: var(--text-muted); font-size: 13px;"><?php echo $descriptions[$tableName] ?? ''; ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>

  <div class="card">
    <div class="card-title">Portal Quick Navigation</div>
    <div class="actions-bar">
      <a href="index.php" class="btn btn-primary" target="_blank">🌐 Public Web Portal</a>
      <a href="admin.php" class="btn btn-outline" target="_blank">🔐 Admin Console (admin / Admin@123)</a>
      <a href="member.php" class="btn btn-outline" target="_blank">💳 Member Portal (EK-10482 / 1234)</a>
      <a href="ekym.php" class="btn btn-outline" target="_blank">📝 eKYM Verification Form</a>
    </div>
  </div>
</div>
</body>
</html>
