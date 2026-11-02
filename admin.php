<?php
/**
 * Ekata Saving & Credit Cooperative Ltd. (एकता बचत तथा ऋण सहकारी संस्था लि.)
 * File: php-version/admin.php
 * Enterprise Administrative Console & Frontend System CMS
 * PHP Only - Production Ready
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Authenticate administrator session or handle direct login
$loginError = '';
$reqMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($reqMethod === 'POST' && isset($_POST['login_admin'])) {
    $db = Database::getConnection();
    $u = sanitizeInput($_POST['username'] ?? '');
    $p = $_POST['password'] ?? '';
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$u]);
    $user = $stmt->fetch();
    if ($user && password_verify($p, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['role'] = $user['role'];
        header('Location: admin.php');
        exit;
    } else {
        $loginError = 'Invalid username or password. Default is admin / Admin@123';
    }
}

if (!isset($_SESSION['user_id'])) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Ekata Saving & Credit Cooperative Ltd.</title>
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
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .login-card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 440px; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .logo-header { text-align: center; margin-bottom: 28px; }
    .logo-header img { width: 64px; height: 64px; margin-bottom: 12px; }
    .logo-header h1 { font-size: 19px; font-weight: 700; color: #ffffff; }
    .logo-header p { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .error-box { background: rgba(220,38,38,0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; text-align: center; }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
    .form-group input { width: 100%; padding: 11px 14px; background: #0f172a; border: 1px solid #475569; border-radius: 8px; color: #ffffff; font-size: 14px; outline: none; }
    .form-group input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,0.2); }
    .btn-submit { width: 100%; background: #0284c7; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; margin-top: 8px; }
    .btn-submit:hover { background: #0369a1; }
    .demo-creds { margin-top: 24px; padding: 14px; background: rgba(15,23,42,0.6); border: 1px dashed #475569; border-radius: 8px; font-size: 12.5px; color: #94a3b8; }
    .demo-creds strong { color: #38bdf8; }
    .links-footer { display: flex; justify-content: space-between; margin-top: 20px; font-size: 13px; }
    .links-footer a { color: #94a3b8; text-decoration: none; }
    .links-footer a:hover { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="logo-header">
      <img src="assets/images/ekata-logo.svg" alt="Ekata Logo" onerror="this.src='../public/assets/images/ekata-logo.svg'">
      <h1>Ekata Cooperative CBS</h1>
      <p>Executive Administration & Core Banking Login</p>
    </div>

    <?php if ($loginError): ?>
      <div class="error-box"><?php echo htmlspecialchars($loginError); ?></div>
    <?php endif; ?>

    <form method="POST" action="admin.php">
      <input type="hidden" name="login_admin" value="1">
      <div class="form-group">
        <label for="username">Staff / Admin Username</label>
        <input type="text" id="username" name="username" value="admin" required autofocus>
      </div>
      <div class="form-group">
        <label for="password">Security Password</label>
        <input type="password" id="password" name="password" value="Admin@123" required>
      </div>
      <button type="submit" class="btn-submit">Sign In to Admin Console →</button>
    </form>

    <div class="demo-creds">
      <div><strong>Default Admin:</strong> <code>admin</code> / <code>Admin@123</code></div>
      <div style="margin-top:4px;"><strong>Branch Staff:</strong> <code>staff</code> / <code>staff@2057</code></div>
    </div>

    <div class="links-footer">
      <a href="index.php">← Back to Public Website</a>
      <a href="member.php">Member Portal →</a>
    </div>
  </div>
</body>
</html>
<?php
    exit;
}

$db = Database::getConnection();
$currentUser = $_SESSION['username'] ?? 'admin';
$currentFullName = $_SESSION['full_name'] ?? 'Chief Executive Officer';
$currentRole = $_SESSION['role'] ?? 'admin';

$actionNotice = '';
$actionError = '';

// Handle Direct POST Actions for Admin & CMS
if (($reqMethod ?? ($_SERVER['REQUEST_METHOD'] ?? 'GET')) === 'POST') {
    $action = $_POST['admin_action'] ?? '';

    // --- 1. CMS: General & Operational Settings ---
    if ($action === 'save_general_settings') {
        $fields = [
            'coop_name_en', 'coop_name_np', 'tagline_en', 'tagline_np',
            'ticker_text_en', 'ticker_text_np', 'ticker_active',
            'phone_headoffice', 'phone_tollfree', 'email_official',
            'address_headoffice', 'office_hours', 'regd_no', 'pan_no',
            'stat_members', 'stat_savings', 'stat_loans', 'stat_capital', 'stat_branches',
            'about_intro_en', 'about_intro_np'
        ];
        foreach ($fields as $f) {
            $val = sanitizeInput($_POST[$f] ?? '');
            if ($f === 'ticker_active') {
                $val = isset($_POST['ticker_active']) ? '1' : '0';
            }
            Database::setSetting($f, $val);
        }
        $actionNotice = "Frontend general settings & statistics updated successfully! Public website updated.";
    }

    // --- 2. CMS: Update Hero Slide ---
    if ($action === 'update_slide') {
        $slideId = (int)($_POST['slide_id'] ?? 0);
        $titleEn = sanitizeInput($_POST['title_en'] ?? '');
        $titleNp = sanitizeInput($_POST['title_np'] ?? '');
        $subEn = sanitizeInput($_POST['subtitle_en'] ?? '');
        $subNp = sanitizeInput($_POST['subtitle_np'] ?? '');
        $imgUrl = sanitizeInput($_POST['image_url'] ?? '');
        $ctaEn = sanitizeInput($_POST['cta_text_en'] ?? '');
        $ctaNp = sanitizeInput($_POST['cta_text_np'] ?? '');
        $ctaLink = sanitizeInput($_POST['cta_link'] ?? '#');
        $sortOrder = (int)($_POST['sort_order'] ?? 1);

        if ($slideId > 0 && !empty($titleEn)) {
            $stmt = $db->prepare("UPDATE frontend_slides SET title_en = ?, title_np = ?, subtitle_en = ?, subtitle_np = ?, image_url = ?, cta_text_en = ?, cta_text_np = ?, cta_link = ?, sort_order = ? WHERE id = ?");
            $stmt->execute([$titleEn, $titleNp, $subEn, $subNp, $imgUrl, $ctaEn, $ctaNp, $ctaLink, $sortOrder, $slideId]);
            $actionNotice = "Banner Slide #$slideId updated successfully.";
        }
    }

    // --- 3. CMS: Add Hero Slide ---
    if ($action === 'add_slide') {
        $titleEn = sanitizeInput($_POST['title_en'] ?? '');
        $titleNp = sanitizeInput($_POST['title_np'] ?? '');
        $subEn = sanitizeInput($_POST['subtitle_en'] ?? '');
        $subNp = sanitizeInput($_POST['subtitle_np'] ?? '');
        $imgUrl = sanitizeInput($_POST['image_url'] ?? 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1600&auto=format&fit=crop&q=80');
        $ctaEn = sanitizeInput($_POST['cta_text_en'] ?? 'Explore Services');
        $ctaNp = sanitizeInput($_POST['cta_text_np'] ?? 'सेवाहरू हेर्नुहोस्');
        $ctaLink = sanitizeInput($_POST['cta_link'] ?? '#services');
        $sortOrder = (int)($_POST['sort_order'] ?? 10);

        if (!empty($titleEn)) {
            $stmt = $db->prepare("INSERT INTO frontend_slides (title_en, title_np, subtitle_en, subtitle_np, image_url, cta_text_en, cta_text_np, cta_link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$titleEn, $titleNp, $subEn, $subNp, $imgUrl, $ctaEn, $ctaNp, $ctaLink, $sortOrder]);
            $actionNotice = "New frontend banner slide added successfully.";
        }
    }

    // --- 4. CMS: Delete Hero Slide ---
    if ($action === 'delete_slide') {
        $slideId = (int)($_POST['slide_id'] ?? 0);
        if ($slideId > 0) {
            $stmt = $db->prepare("DELETE FROM frontend_slides WHERE id = ?");
            $stmt->execute([$slideId]);
            $actionNotice = "Slide #$slideId removed from frontend.";
        }
    }

    // --- 5. CMS: Update Service Catalog ---
    if ($action === 'update_service') {
        $svcId = (int)($_POST['service_id'] ?? 0);
        $titleEn = sanitizeInput($_POST['title_en'] ?? '');
        $titleNp = sanitizeInput($_POST['title_np'] ?? '');
        $descEn = sanitizeInput($_POST['desc_en'] ?? '');
        $descNp = sanitizeInput($_POST['desc_np'] ?? '');
        $badge = sanitizeInput($_POST['badge'] ?? '');

        if ($svcId > 0) {
            $stmt = $db->prepare("UPDATE services_cms SET title_en = ?, title_np = ?, description_en = ?, description_np = ?, badge = ? WHERE id = ?");
            $stmt->execute([$titleEn, $titleNp, $descEn, $descNp, $badge, $svcId]);
            $actionNotice = "Service '$titleEn' updated in frontend catalog.";
        }
    }

    // --- 6. CMS: Add Gallery Photo ---
    if ($action === 'add_gallery') {
        $titleEn = sanitizeInput($_POST['title_en'] ?? '');
        $titleNp = sanitizeInput($_POST['title_np'] ?? '');
        $category = sanitizeInput($_POST['category'] ?? 'General');
        $imgUrl = sanitizeInput($_POST['image_url'] ?? '');

        if (!empty($titleEn) && !empty($imgUrl)) {
            $stmt = $db->prepare("INSERT INTO gallery_items (title_en, title_np, category, image_url) VALUES (?, ?, ?, ?)");
            $stmt->execute([$titleEn, $titleNp, $category, $imgUrl]);
            $actionNotice = "Photo '$titleEn' added to frontend gallery.";
        }
    }

    // --- 7. CMS: Delete Gallery Photo ---
    if ($action === 'delete_gallery') {
        $gId = (int)($_POST['gallery_id'] ?? 0);
        if ($gId > 0) {
            $stmt = $db->prepare("DELETE FROM gallery_items WHERE id = ?");
            $stmt->execute([$gId]);
            $actionNotice = "Gallery photo deleted.";
        }
    }

    // --- 8. Core: eKYM Status Update ---
    if ($action === 'update_ekym_status') {
        $id = (int)($_POST['ekym_id'] ?? 0);
        $status = sanitizeInput($_POST['status'] ?? 'Pending');
        $remarks = sanitizeInput($_POST['remarks'] ?? '');
        if ($id > 0) {
            $stmt = $db->prepare("UPDATE ekym_submissions SET status = ?, remarks = ? WHERE id = ?");
            $stmt->execute([$status, $remarks, $id]);
            $actionNotice = "eKYM application #$id marked as $status successfully.";
        }
    }

    // --- 9. Core: Loan Application Status Update ---
    if ($action === 'update_loan_status') {
        $id = (int)($_POST['loan_id'] ?? 0);
        $status = sanitizeInput($_POST['status'] ?? 'Under Review');
        if ($id > 0) {
            $stmt = $db->prepare("UPDATE loan_applications SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            $actionNotice = "Loan application #$id status set to: $status.";
        }
    }

    // --- 10. Core: Counter Cash Adjustment (Credit/Debit) ---
    if ($action === 'adjust_balance') {
        $memberCode = sanitizeInput($_POST['member_code'] ?? '');
        $type = sanitizeInput($_POST['type'] ?? 'Credit');
        $amount = (float)($_POST['amount'] ?? 0);
        $particulars = sanitizeInput($_POST['particulars'] ?? 'Counter Cash Deposit');

        if (!empty($memberCode) && $amount > 0) {
            $mStmt = $db->prepare("SELECT regular_saving_balance, full_name FROM members WHERE member_code = ? LIMIT 1");
            $mStmt->execute([$memberCode]);
            $member = $mStmt->fetch();

            if ($member) {
                $cur = (float)$member['regular_saving_balance'];
                $newBal = ($type === 'Credit') ? ($cur + $amount) : ($cur - $amount);
                
                $upd = $db->prepare("UPDATE members SET regular_saving_balance = ? WHERE member_code = ?");
                $upd->execute([$newBal, $memberCode]);

                $tx = $db->prepare("INSERT INTO transactions (member_code, type, amount, balance_after, particulars) VALUES (?, ?, ?, ?, ?)");
                $tx->execute([$memberCode, $type, $amount, $newBal, $particulars]);

                $actionNotice = "Cash {$type} of Rs. " . number_format($amount) . " processed for {$member['full_name']} ({$memberCode}). New balance: Rs. " . number_format($newBal);
            } else {
                $actionError = "Member code '$memberCode' not found in database!";
            }
        }
    }

    // --- 11. Core: Update Interest Rate ---
    if ($action === 'update_rate') {
        $id = (int)($_POST['rate_id'] ?? 0);
        $newRate = (float)($_POST['rate_percent'] ?? 0);
        if ($id > 0 && $newRate > 0) {
            $stmt = $db->prepare("UPDATE interest_rates SET rate_percent = ? WHERE id = ?");
            $stmt->execute([$newRate, $id]);
            $actionNotice = "Interest rate updated successfully to $newRate%.";
        }
    }

    // --- 12. Core: Add New Rate Scheme ---
    if ($action === 'add_rate') {
        $cat = sanitizeInput($_POST['category'] ?? 'Deposit');
        $sEn = sanitizeInput($_POST['scheme_en'] ?? '');
        $sNp = sanitizeInput($_POST['scheme_np'] ?? '');
        $rate = (float)($_POST['rate_percent'] ?? 0);
        $bEn = sanitizeInput($_POST['basis_en'] ?? 'Quarterly');
        $bNp = sanitizeInput($_POST['basis_np'] ?? 'त्रैमासिक');
        $min = (float)($_POST['min_balance'] ?? 0);

        if (!empty($sEn) && $rate > 0) {
            $stmt = $db->prepare("INSERT INTO interest_rates (category, scheme_en, scheme_np, rate_percent, basis_en, basis_np, min_balance) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$cat, $sEn, $sNp, $rate, $bEn, $bNp, $min]);
            $actionNotice = "New interest rate scheme '$sEn' added to schedule.";
        }
    }

    // --- 13. Core: Add Notice ---
    if ($action === 'add_notice') {
        $titleEn = sanitizeInput($_POST['title_en'] ?? '');
        $titleNp = sanitizeInput($_POST['title_np'] ?? '');
        $category = sanitizeInput($_POST['category'] ?? 'General');
        $date = sanitizeInput($_POST['publish_date'] ?? date('Y-m-d'));
        $contentEn = sanitizeInput($_POST['content_en'] ?? '');
        $contentNp = sanitizeInput($_POST['content_np'] ?? '');

        if (!empty($titleEn)) {
            $stmt = $db->prepare("INSERT INTO notices (title_en, title_np, category, publish_date, content_en, content_np, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$titleEn, $titleNp, $category, $date, $contentEn, $contentNp]);
            $actionNotice = "New official notice published on public website.";
        }
    }

    // --- 14. Core: Delete Notice ---
    if ($action === 'delete_notice') {
        $nId = (int)($_POST['notice_id'] ?? 0);
        if ($nId > 0) {
            $stmt = $db->prepare("DELETE FROM notices WHERE id = ?");
            $stmt->execute([$nId]);
            $actionNotice = "Notice #$nId deleted from website.";
        }
    }
}

// Fetch CBS Real-Time Metrics
$membersTotal = (int)($db->query("SELECT COUNT(*) as c FROM members")->fetch()['c'] ?? 15420);
$savingsTotal = (float)($db->query("SELECT SUM(regular_saving_balance) as s FROM members")->fetch()['s'] ?? 1280000000);
$loansTotal = (float)($db->query("SELECT SUM(loan_balance) as l FROM members")->fetch()['l'] ?? 984000000);
$shareTotal = (float)($db->query("SELECT SUM(share_amount) as sh FROM members")->fetch()['sh'] ?? 245000000);

$pendingEkymCount = (int)($db->query("SELECT COUNT(*) as c FROM ekym_submissions WHERE status = 'Pending'")->fetch()['c'] ?? 0);
$pendingLoansCount = (int)($db->query("SELECT COUNT(*) as c FROM loan_applications WHERE status = 'Under Review'")->fetch()['c'] ?? 0);

// Fetch CMS Data
$allSettings = Database::getAllSettings();
$slidesList = $db->query("SELECT * FROM frontend_slides ORDER BY sort_order ASC, id ASC")->fetchAll();
$servicesList = $db->query("SELECT * FROM services_cms ORDER BY id ASC")->fetchAll();
$galleryList = $db->query("SELECT * FROM gallery_items ORDER BY id DESC")->fetchAll();

// Fetch Operational Lists
$ekymList = $db->query("SELECT * FROM ekym_submissions ORDER BY id DESC LIMIT 20")->fetchAll();
$loanList = $db->query("SELECT * FROM loan_applications ORDER BY id DESC LIMIT 20")->fetchAll();
$membersList = $db->query("SELECT * FROM members ORDER BY id ASC LIMIT 25")->fetchAll();
$ratesList = $db->query("SELECT * FROM interest_rates ORDER BY id ASC")->fetchAll();
$noticesList = $db->query("SELECT * FROM notices ORDER BY id DESC LIMIT 15")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Admin Console & Frontend CMS - Ekata Cooperative</title>
  <link rel="stylesheet" href="style.css">
  <style>
    :root {
      --bg-slate: #f8fafc;
      --sidebar-bg: #061e12;
      --sidebar-hover: #0c3321;
      --primary: #087a45;
      --primary-dark: #05522e;
      --primary-light: #e8f5ee;
      --accent: #d97706;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --card-bg: #ffffff;
    }
    * { box-sizing: border-box; }
    body {
      background-color: var(--bg-slate);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      min-height: 100vh;
    }

    /* Modern Layout: Sidebar + Main Content */
    .admin-sidebar {
      width: 270px;
      background: var(--sidebar-bg);
      color: #e2e8f0;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #143d29;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar-brand {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .sidebar-brand .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    }
    .sidebar-brand .brand-text h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.2px;
    }
    .sidebar-brand .brand-text small {
      font-size: 11px;
      color: #94a3b8;
      display: block;
      margin-top: 2px;
    }
    .sidebar-menu {
      padding: 16px 12px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .menu-header {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      font-weight: 700;
      padding: 12px 10px 6px;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      color: #cbd5e1;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.15s ease;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    .menu-item:hover {
      background: var(--sidebar-hover);
      color: #ffffff;
    }
    .menu-item.active {
      background: var(--primary);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(8,122,69,0.4);
    }
    .menu-item .badge-count {
      margin-left: auto;
      background: #dc2626;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
    }
    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 12px;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Main Content Area */
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    .admin-topbar {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .breadcrumb-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-pill {
      background: #dcfce7;
      color: #15803d;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-pill::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #16a34a;
      border-radius: 50%;
      display: inline-block;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .btn-public-preview {
      background: #f1f5f9;
      color: #334155;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid #cbd5e1;
      transition: all 0.15s;
    }
    .btn-public-preview:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .admin-user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px 4px 4px;
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 20px;
    }
    .admin-avatar {
      width: 32px;
      height: 32px;
      background: #087a45;
      color: #fff;
      font-weight: 700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .admin-user-info {
      line-height: 1.2;
    }
    .admin-user-name {
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
    }
    .admin-user-role {
      font-size: 10px;
      color: #64748b;
    }

    /* Content Body */
    .admin-content {
      padding: 28px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }
    .feedback-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 14px 20px;
      border-radius: 10px;
      margin-bottom: 24px;
      font-size: 13.5px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .feedback-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 14px 20px;
      border-radius: 10px;
      margin-bottom: 24px;
      font-size: 13.5px;
      font-weight: 500;
    }

    /* Metrics Overview Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--border-color);
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      position: relative;
      overflow: hidden;
    }
    .kpi-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--primary);
    }
    .kpi-card.accent::after { background: var(--accent); }
    .kpi-card.blue::after { background: #2563eb; }
    .kpi-card.purple::after { background: #7c3aed; }
    .kpi-label {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      margin: 8px 0 4px;
      letter-spacing: -0.5px;
    }
    .kpi-sub {
      font-size: 11.5px;
      color: #16a34a;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    /* Tab Panes */
    .tab-pane {
      display: none;
    }
    .tab-pane.active {
      display: block;
      animation: fadeIn 0.2s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Cards & Containers */
    .panel-box {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid var(--border-color);
      box-shadow: 0 1px 4px rgba(0,0,0,0.02);
      margin-bottom: 24px;
      overflow: hidden;
    }
    .panel-box-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fafbfc;
    }
    .panel-box-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .panel-box-header p {
      margin: 3px 0 0 0;
      font-size: 12.5px;
      color: var(--text-muted);
    }
    .panel-box-body {
      padding: 24px;
    }

    /* Sub Tabs for Frontend CMS */
    .cms-nav-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 2px;
      overflow-x: auto;
    }
    .cms-tab-btn {
      padding: 10px 18px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      margin-bottom: -2px;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .cms-tab-btn:hover {
      color: var(--primary);
    }
    .cms-tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      background: #f0fdf4;
      border-radius: 6px 6px 0 0;
    }

    /* Forms & Inputs */
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 18px;
    }
    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 18px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
    }
    .form-group input, .form-group textarea, .form-group select {
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s;
      font-family: inherit;
      background: #ffffff;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(8,122,69,0.1);
    }
    .btn-save {
      background: var(--primary);
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;
    }
    .btn-save:hover {
      background: var(--primary-dark);
    }

    /* Data Tables */
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .admin-table th {
      background: #f8fafc;
      padding: 12px 16px;
      text-align: left;
      font-size: 11.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-color);
    }
    .admin-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }
    .admin-table tr:hover td {
      background: #fcfdfd;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-approved { background: #dcfce7; color: #166534; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }

    /* Responsive */
    @media (max-width: 992px) {
      body { flex-direction: column; }
      .admin-sidebar { width: 100%; height: auto; position: static; }
      .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- 1. Sleek Enterprise Sidebar -->
  <aside class="admin-sidebar">
    <div class="sidebar-brand">
      <div class="logo-icon" style="background:#fff; padding:3px; border-radius:8px; display:flex; align-items:center; justify-content:center;">
        <img src="/assets/images/ekata-logo.svg" alt="Ekata" style="height:28px; width:auto;" onerror="this.src='../assets/images/ekata-logo.svg'">
      </div>
      <div class="brand-text">
        <h2>EKATA CONSOLE</h2>
        <small>Core CBS & Frontend CMS</small>
      </div>
    </div>

    <nav class="sidebar-menu">
      <div class="menu-header">Overview</div>
      <button class="menu-item active" onclick="switchMainTab('dashboard', this)">
        <span>📊</span> Executive Dashboard
      </button>

      <div class="menu-header">Frontend Management (CMS)</div>
      <button class="menu-item" onclick="switchMainTab('frontend-cms', this)">
        <span>🎨</span> Frontend Website CMS
      </button>
      <button class="menu-item" onclick="switchMainTab('notices-cms', this)">
        <span>📢</span> Notices & Bulletins
      </button>
      <button class="menu-item" onclick="switchMainTab('rates-cms', this)">
        <span>📈</span> Interest Rates
      </button>

      <div class="menu-header">Core Banking Operations</div>
      <button class="menu-item" onclick="switchMainTab('ekym-queue', this)">
        <span>📝</span> eKYM Member Requests
        <?php if ($pendingEkymCount > 0): ?>
          <span class="badge-count"><?= $pendingEkymCount ?></span>
        <?php endif; ?>
      </button>
      <button class="menu-item" onclick="switchMainTab('loans-queue', this)">
        <span>💼</span> Loan Evaluations
        <?php if ($pendingLoansCount > 0): ?>
          <span class="badge-count"><?= $pendingLoansCount ?></span>
        <?php endif; ?>
      </button>
      <button class="menu-item" onclick="switchMainTab('members-ledger', this)">
        <span>👥</span> Member CBS Ledger
      </button>
      <button class="menu-item" onclick="switchMainTab('system-tools', this)">
        <span>⚙️</span> System Architecture
      </button>
      <a href="check_db.php" target="_blank" class="menu-item" style="color: #60a5fa; text-decoration: none;">
        <span>🔍</span> Database Health Check
      </a>
    </nav>

    <div class="sidebar-footer">
      <span>CBS v2.8 • PHP 8.2</span>
      <a href="api.php?action=logout" style="color:#f87171; text-decoration:none; font-weight:600;">Sign Out →</a>
    </div>
  </aside>

  <!-- 2. Main Executive Content -->
  <main class="admin-main">
    <!-- Topbar -->
    <header class="admin-topbar">
      <div class="topbar-left">
        <div class="breadcrumb-title" id="breadcrumbLabel">
          <span>🏢</span> Executive Dashboard & Banking Control
        </div>
        <div class="status-pill">
          CBS Real-Time Engine Active
        </div>
      </div>

      <div class="topbar-right">
        <a href="index.php" target="_blank" class="btn-public-preview">
          👁 View Public Website
        </a>
        <div class="admin-user-pill">
          <div class="admin-avatar">A</div>
          <div class="admin-user-info">
            <div class="admin-user-name"><?= htmlspecialchars($currentFullName) ?></div>
            <div class="admin-user-role">Super Admin (<?= htmlspecialchars($currentUser) ?>)</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content Workspace -->
    <div class="admin-content">
      <?php if (!empty($actionNotice)): ?>
        <div class="feedback-banner">
          <span>✓</span> <?= htmlspecialchars($actionNotice) ?>
        </div>
      <?php endif; ?>

      <?php if (!empty($actionError)): ?>
        <div class="feedback-error">
          <span>⚠</span> <?= htmlspecialchars($actionError) ?>
        </div>
      <?php endif; ?>

      <!-- TAB 1: EXECUTIVE DASHBOARD -->
      <div id="tab-dashboard" class="tab-pane active">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Active Shareholders</div>
            <div class="kpi-value"><?= number_format($membersTotal) ?></div>
            <div class="kpi-sub">✓ Fully Verified KYC Accounts</div>
          </div>
          <div class="kpi-card accent">
            <div class="kpi-label">Total Deposits (CBS)</div>
            <div class="kpi-value">Rs. <?= number_format($savingsTotal / 10000000, 2) ?> Cr</div>
            <div class="kpi-sub">↑ 8.4% YoY Growth Rate</div>
          </div>
          <div class="kpi-card blue">
            <div class="kpi-label">Loans Disbursed</div>
            <div class="kpi-value">Rs. <?= number_format($loansTotal / 10000000, 2) ?> Cr</div>
            <div class="kpi-sub">Priority Agricultural & Enterprise</div>
          </div>
          <div class="kpi-card purple">
            <div class="kpi-label">eKYM Pending Queue</div>
            <div class="kpi-value"><?= $pendingEkymCount ?></div>
            <div class="kpi-sub">Awaiting Administrative Review</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          <!-- Left: Recent eKYM Submissions -->
          <div class="panel-box">
            <div class="panel-box-header">
              <div>
                <h3>📝 Recent Digital eKYM Submissions</h3>
                <p>New member KYC account opening applications received via web portal</p>
              </div>
              <button onclick="switchMainTab('ekym-queue')" style="background:none; border:none; color:var(--primary); font-weight:600; cursor:pointer; font-size:12.5px;">View All →</button>
            </div>
            <div class="panel-box-body" style="padding:0;">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>App No</th>
                    <th>Applicant Name</th>
                    <th>Citizenship</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <?php if (empty($ekymList)): ?>
                    <tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:30px;">No pending applications.</td></tr>
                  <?php else: ?>
                    <?php foreach (array_slice($ekymList, 0, 5) as $ek): ?>
                      <tr>
                        <td><strong><?= htmlspecialchars($ek['application_no']) ?></strong></td>
                        <td><?= htmlspecialchars($ek['full_name_en']) ?><br><small style="color:#64748b;"><?= htmlspecialchars($ek['phone']) ?></small></td>
                        <td><?= htmlspecialchars($ek['citizenship_no']) ?></td>
                        <td><?= substr($ek['submitted_at'], 0, 10) ?></td>
                        <td>
                          <span class="badge badge-<?= strtolower($ek['status']) ?>"><?= htmlspecialchars($ek['status']) ?></span>
                        </td>
                      </tr>
                    <?php endforeach; ?>
                  <?php endif; ?>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right: Quick Counter Cash Adjuster -->
          <div class="panel-box">
            <div class="panel-box-header">
              <div>
                <h3>💵 CBS Counter Transaction</h3>
                <p>Deposit or debit cash instantly</p>
              </div>
            </div>
            <div class="panel-box-body">
              <form method="POST">
                <input type="hidden" name="admin_action" value="adjust_balance">
                <div class="form-group" style="margin-bottom:12px;">
                  <label>Member Account Code</label>
                  <input type="text" name="member_code" value="EK-10482" required placeholder="e.g. EK-10482">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                  <label>Transaction Type</label>
                  <select name="type">
                    <option value="Credit">Deposit (Credit to Savings)</option>
                    <option value="Debit">Withdrawal (Debit from Savings)</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                  <label>Amount (NPR)</label>
                  <input type="number" name="amount" value="5000" step="100" required>
                </div>
                <div class="form-group" style="margin-bottom:16px;">
                  <label>Particulars / Remarks</label>
                  <input type="text" name="particulars" value="Branch Counter Cash Deposit" required>
                </div>
                <button type="submit" class="btn-save" style="width:100%; justify-content:center;">
                  Post Counter Transaction
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: FRONTEND WEBSITE CMS (FULL ACCESS TO CHANGE PUBLIC WEBSITE) -->
      <div id="tab-frontend-cms" class="tab-pane">
        <div class="panel-box">
          <div class="panel-box-header">
            <div>
              <h3>🎨 Complete Frontend Website CMS</h3>
              <p>You have full administrative authority to modify all text, hero slides, statistics, announcements, and services displayed on the public website.</p>
            </div>
            <a href="index.php" target="_blank" class="btn-public-preview">
              👁 Test Changes Live
            </a>
          </div>

          <div class="panel-box-body">
            <!-- Sub-Tabs for CMS -->
            <div class="cms-nav-tabs">
              <button class="cms-tab-btn active" onclick="switchCmsTab('cms-general', this)">🏛 General & Ticker</button>
              <button class="cms-tab-btn" onclick="switchCmsTab('cms-slides', this)">🖼 Hero Banner Slides (<?= count($slidesList) ?>)</button>
              <button class="cms-tab-btn" onclick="switchCmsTab('cms-stats', this)">📊 Key Statistics</button>
              <button class="cms-tab-btn" onclick="switchCmsTab('cms-services', this)">💼 Core Services (<?= count($servicesList) ?>)</button>
              <button class="cms-tab-btn" onclick="switchCmsTab('cms-gallery', this)">📸 Photo Gallery (<?= count($galleryList) ?>)</button>
            </div>

            <!-- CMS SUB-TAB 1: General Info & Ticker -->
            <div id="cms-general" class="cms-subpane">
              <form method="POST">
                <input type="hidden" name="admin_action" value="save_general_settings">
                
                <h4 style="margin:0 0 14px 0; color:#0f172a; font-size:14px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">1. Cooperative Institutional Identity</h4>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Cooperative Name (English)</label>
                    <input type="text" name="coop_name_en" value="<?= htmlspecialchars($allSettings['coop_name_en'] ?? 'Ekata Saving & Credit Cooperative Ltd.') ?>" required>
                  </div>
                  <div class="form-group">
                    <label>Cooperative Name (नेपाली)</label>
                    <input type="text" name="coop_name_np" value="<?= htmlspecialchars($allSettings['coop_name_np'] ?? 'एकता बचत तथा ऋण सहकारी संस्था लि.') ?>" required>
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Header Tagline (English)</label>
                    <input type="text" name="tagline_en" value="<?= htmlspecialchars($allSettings['tagline_en'] ?? '') ?>">
                  </div>
                  <div class="form-group">
                    <label>Header Tagline (नेपाली)</label>
                    <input type="text" name="tagline_np" value="<?= htmlspecialchars($allSettings['tagline_np'] ?? '') ?>">
                  </div>
                </div>

                <h4 style="margin:20px 0 14px 0; color:#0f172a; font-size:14px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">2. Urgent Announcement Ticker Bar</h4>
                <div class="form-group" style="margin-bottom:14px;">
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" name="ticker_active" value="1" <?= (($allSettings['ticker_active'] ?? '1') === '1') ? 'checked' : '' ?>>
                    <span><strong>Enable Live Running Ticker</strong> on Public Website Header</span>
                  </label>
                </div>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Ticker Notice (English)</label>
                    <textarea name="ticker_text_en" rows="2"><?= htmlspecialchars($allSettings['ticker_text_en'] ?? '') ?></textarea>
                  </div>
                  <div class="form-group">
                    <label>Ticker Notice (नेपाली)</label>
                    <textarea name="ticker_text_np" rows="2"><?= htmlspecialchars($allSettings['ticker_text_np'] ?? '') ?></textarea>
                  </div>
                </div>

                <h4 style="margin:20px 0 14px 0; color:#0f172a; font-size:14px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">3. Official Contact & Regulatory Details</h4>
                <div class="form-grid-3">
                  <div class="form-group">
                    <label>Head Office Phone</label>
                    <input type="text" name="phone_headoffice" value="<?= htmlspecialchars($allSettings['phone_headoffice'] ?? '') ?>">
                  </div>
                  <div class="form-group">
                    <label>Toll-Free Helpline</label>
                    <input type="text" name="phone_tollfree" value="<?= htmlspecialchars($allSettings['phone_tollfree'] ?? '') ?>">
                  </div>
                  <div class="form-group">
                    <label>Official Email</label>
                    <input type="email" name="email_official" value="<?= htmlspecialchars($allSettings['email_official'] ?? '') ?>">
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Central Office Physical Address</label>
                    <input type="text" name="address_headoffice" value="<?= htmlspecialchars($allSettings['address_headoffice'] ?? '') ?>">
                  </div>
                  <div class="form-group">
                    <label>Office Working Hours</label>
                    <input type="text" name="office_hours" value="<?= htmlspecialchars($allSettings['office_hours'] ?? '') ?>">
                  </div>
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Cooperative Registration No.</label>
                    <input type="text" name="regd_no" value="<?= htmlspecialchars($allSettings['regd_no'] ?? '') ?>">
                  </div>
                  <div class="form-group">
                    <label>PAN / VAT Number</label>
                    <input type="text" name="pan_no" value="<?= htmlspecialchars($allSettings['pan_no'] ?? '') ?>">
                  </div>
                </div>

                <!-- Hidden preserving stats from general tab -->
                <input type="hidden" name="stat_members" value="<?= htmlspecialchars($allSettings['stat_members'] ?? '15,420+') ?>">
                <input type="hidden" name="stat_savings" value="<?= htmlspecialchars($allSettings['stat_savings'] ?? 'Rs. 1.28 Arba') ?>">
                <input type="hidden" name="stat_loans" value="<?= htmlspecialchars($allSettings['stat_loans'] ?? 'Rs. 98.40 Crore') ?>">
                <input type="hidden" name="stat_capital" value="<?= htmlspecialchars($allSettings['stat_capital'] ?? 'Rs. 24.50 Crore') ?>">
                <input type="hidden" name="stat_branches" value="<?= htmlspecialchars($allSettings['stat_branches'] ?? '') ?>">

                <button type="submit" class="btn-save">
                  💾 Save General Frontend Settings
                </button>
              </form>
            </div>

            <!-- CMS SUB-TAB 2: Hero Banner Slider -->
            <div id="cms-slides" class="cms-subpane" style="display:none;">
              <h4 style="margin:0 0 16px 0; color:#0f172a; font-size:15px;">Active Slides on Public Homepage Slider</h4>
              
              <?php foreach ($slidesList as $idx => $slide): ?>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px; margin-bottom:20px;">
                  <form method="POST">
                    <input type="hidden" name="admin_action" value="update_slide">
                    <input type="hidden" name="slide_id" value="<?= $slide['id'] ?>">

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                      <strong style="color:var(--primary); font-size:14px;">Slide #<?= $idx + 1 ?> (ID: <?= $slide['id'] ?>)</strong>
                      <button type="submit" formaction="admin.php" name="admin_action" value="delete_slide" onclick="return confirm('Delete this slide?');" style="background:#fee2e2; color:#991b1b; border:none; padding:4px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:600;">
                        Delete Slide
                      </button>
                    </div>

                    <div class="form-grid-2">
                      <div class="form-group">
                        <label>Headline (English)</label>
                        <input type="text" name="title_en" value="<?= htmlspecialchars($slide['title_en']) ?>" required>
                      </div>
                      <div class="form-group">
                        <label>Headline (नेपाली)</label>
                        <input type="text" name="title_np" value="<?= htmlspecialchars($slide['title_np']) ?>" required>
                      </div>
                    </div>

                    <div class="form-grid-2">
                      <div class="form-group">
                        <label>Sub-Description (English)</label>
                        <textarea name="subtitle_en" rows="2"><?= htmlspecialchars($slide['subtitle_en']) ?></textarea>
                      </div>
                      <div class="form-group">
                        <label>Sub-Description (नेपाली)</label>
                        <textarea name="subtitle_np" rows="2"><?= htmlspecialchars($slide['subtitle_np']) ?></textarea>
                      </div>
                    </div>

                    <div class="form-grid-3">
                      <div class="form-group">
                        <label>Background Image URL</label>
                        <input type="url" name="image_url" value="<?= htmlspecialchars($slide['image_url']) ?>" required>
                      </div>
                      <div class="form-group">
                        <label>CTA Button Text (English / नेपाली)</label>
                        <input type="text" name="cta_text_en" value="<?= htmlspecialchars($slide['cta_text_en']) ?>">
                      </div>
                      <div class="form-group">
                        <label>CTA Button Link</label>
                        <input type="text" name="cta_link" value="<?= htmlspecialchars($slide['cta_link']) ?>">
                      </div>
                    </div>

                    <button type="submit" class="btn-save" style="font-size:12px; padding:7px 14px;">
                      Update Slide #<?= $idx + 1 ?>
                    </button>
                  </form>
                </div>
              <?php endforeach; ?>

              <!-- Add New Slide -->
              <div style="background:#f0fdf4; border:1px dashed #10b981; border-radius:10px; padding:20px; margin-top:20px;">
                <h4 style="margin:0 0 12px 0; color:#065f46;">➕ Add New Banner Slide</h4>
                <form method="POST">
                  <input type="hidden" name="admin_action" value="add_slide">
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label>Headline (English)</label>
                      <input type="text" name="title_en" placeholder="e.g. Modern Mobile Banking Experience" required>
                    </div>
                    <div class="form-group">
                      <label>Headline (नेपाली)</label>
                      <input type="text" name="title_np" placeholder="e.g. आधुनिक मोबाइल बैंकिङ अनुभव" required>
                    </div>
                  </div>
                  <div class="form-grid-2">
                    <div class="form-group">
                      <label>Subtitle (English)</label>
                      <input type="text" name="subtitle_en" placeholder="Brief supportive summary...">
                    </div>
                    <div class="form-group">
                      <label>Background Image URL</label>
                      <input type="url" name="image_url" value="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1600&auto=format&fit=crop&q=80" required>
                    </div>
                  </div>
                  <button type="submit" class="btn-save">
                    Add Banner Slide
                  </button>
                </form>
              </div>
            </div>

            <!-- CMS SUB-TAB 3: Key Operational Stats -->
            <div id="cms-stats" class="cms-subpane" style="display:none;">
              <form method="POST">
                <input type="hidden" name="admin_action" value="save_general_settings">
                <!-- Keep other fields preserved -->
                <input type="hidden" name="coop_name_en" value="<?= htmlspecialchars($allSettings['coop_name_en'] ?? '') ?>">
                <input type="hidden" name="coop_name_np" value="<?= htmlspecialchars($allSettings['coop_name_np'] ?? '') ?>">
                <input type="hidden" name="tagline_en" value="<?= htmlspecialchars($allSettings['tagline_en'] ?? '') ?>">
                <input type="hidden" name="tagline_np" value="<?= htmlspecialchars($allSettings['tagline_np'] ?? '') ?>">
                <input type="hidden" name="phone_headoffice" value="<?= htmlspecialchars($allSettings['phone_headoffice'] ?? '') ?>">
                <input type="hidden" name="phone_tollfree" value="<?= htmlspecialchars($allSettings['phone_tollfree'] ?? '') ?>">
                <input type="hidden" name="email_official" value="<?= htmlspecialchars($allSettings['email_official'] ?? '') ?>">
                <input type="hidden" name="address_headoffice" value="<?= htmlspecialchars($allSettings['address_headoffice'] ?? '') ?>">
                <input type="hidden" name="office_hours" value="<?= htmlspecialchars($allSettings['office_hours'] ?? '') ?>">
                <input type="hidden" name="regd_no" value="<?= htmlspecialchars($allSettings['regd_no'] ?? '') ?>">
                <input type="hidden" name="pan_no" value="<?= htmlspecialchars($allSettings['pan_no'] ?? '') ?>">
                <input type="hidden" name="ticker_text_en" value="<?= htmlspecialchars($allSettings['ticker_text_en'] ?? '') ?>">
                <input type="hidden" name="ticker_text_np" value="<?= htmlspecialchars($allSettings['ticker_text_np'] ?? '') ?>">

                <p style="color:#64748b; font-size:13px; margin-top:0;">These 5 operational metrics appear in the prominent statistics banner right below the public hero slider.</p>
                <div class="form-grid-3">
                  <div class="form-group">
                    <label>Active Members Display</label>
                    <input type="text" name="stat_members" value="<?= htmlspecialchars($allSettings['stat_members'] ?? '15,420+') ?>" required>
                  </div>
                  <div class="form-group">
                    <label>Total Savings Collected</label>
                    <input type="text" name="stat_savings" value="<?= htmlspecialchars($allSettings['stat_savings'] ?? 'Rs. 1.28 Arba') ?>" required>
                  </div>
                  <div class="form-group">
                    <label>Total Loans Disbursed</label>
                    <input type="text" name="stat_loans" value="<?= htmlspecialchars($allSettings['stat_loans'] ?? 'Rs. 98.40 Crore') ?>" required>
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Reserve & Share Fund Capital</label>
                    <input type="text" name="stat_capital" value="<?= htmlspecialchars($allSettings['stat_capital'] ?? 'Rs. 24.50 Crore') ?>" required>
                  </div>
                  <div class="form-group">
                    <label>Branch & Service Centers</label>
                    <input type="text" name="stat_branches" value="<?= htmlspecialchars($allSettings['stat_branches'] ?? '') ?>" placeholder="Optional branch statistics">
                  </div>
                </div>
                <button type="submit" class="btn-save">
                  💾 Update Statistics on Homepage
                </button>
              </form>
            </div>

            <!-- CMS SUB-TAB 4: Core Services Catalog -->
            <div id="cms-services" class="cms-subpane" style="display:none;">
              <p style="color:#64748b; font-size:13px; margin-top:0;">Edit the descriptions, headings, and promo badges for the cooperative services showcased on the public website.</p>
              
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <?php foreach ($servicesList as $svc): ?>
                  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
                    <form method="POST">
                      <input type="hidden" name="admin_action" value="update_service">
                      <input type="hidden" name="service_id" value="<?= $svc['id'] ?>">

                      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                        <span style="font-size:20px;"><?= htmlspecialchars($svc['icon']) ?></span>
                        <strong style="color:#0f172a; font-size:14px;"><?= htmlspecialchars($svc['title_en']) ?></strong>
                        <span style="margin-left:auto; font-size:11px; background:#e2e8f0; padding:2px 6px; border-radius:4px;"><?= htmlspecialchars($svc['slug']) ?></span>
                      </div>

                      <div class="form-group" style="margin-bottom:8px;">
                        <label>Title (English / नेपाली)</label>
                        <input type="text" name="title_en" value="<?= htmlspecialchars($svc['title_en']) ?>" required>
                      </div>
                      <div class="form-group" style="margin-bottom:8px;">
                        <label>Description (English)</label>
                        <textarea name="desc_en" rows="2" style="font-size:12px;"><?= htmlspecialchars($svc['description_en']) ?></textarea>
                      </div>
                      <div class="form-group" style="margin-bottom:8px;">
                        <label>Description (नेपाली)</label>
                        <textarea name="desc_np" rows="2" style="font-size:12px;"><?= htmlspecialchars($svc['description_np']) ?></textarea>
                      </div>
                      <div class="form-group" style="margin-bottom:12px;">
                        <label>Promotional Badge (e.g. Up to 11.75%)</label>
                        <input type="text" name="badge" value="<?= htmlspecialchars($svc['badge'] ?? '') ?>">
                      </div>

                      <button type="submit" class="btn-save" style="font-size:11.5px; padding:6px 12px;">
                        Save <?= htmlspecialchars($svc['title_en']) ?>
                      </button>
                    </form>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>

            <!-- CMS SUB-TAB 5: Photo Gallery Manager -->
            <div id="cms-gallery" class="cms-subpane" style="display:none;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h4 style="margin:0; color:#0f172a; font-size:15px;">Public Photo Gallery Archive</h4>
              </div>

              <!-- Add Photo -->
              <div style="background:#f0fdf4; border:1px dashed #10b981; border-radius:10px; padding:18px; margin-bottom:24px;">
                <h4 style="margin:0 0 12px 0; color:#065f46;">📸 Add New Gallery Photograph</h4>
                <form method="POST">
                  <input type="hidden" name="admin_action" value="add_gallery">
                  <div class="form-grid-3">
                    <div class="form-group">
                      <label>Photo Title (English)</label>
                      <input type="text" name="title_en" placeholder="e.g. Free Blood Donation Camp" required>
                    </div>
                    <div class="form-group">
                      <label>Photo Title (नेपाली)</label>
                      <input type="text" name="title_np" placeholder="e.g. रक्तदान कार्यक्रम" required>
                    </div>
                    <div class="form-group">
                      <label>Category Tag</label>
                      <select name="category">
                        <option value="General Meeting">General Meeting (AGM)</option>
                        <option value="Empowerment">Empowerment & Training</option>
                        <option value="Social CSR">Social CSR & Health Camp</option>
                        <option value="Celebration">Cooperative Anniversary</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group" style="margin-bottom:14px;">
                    <label>Image URL (Direct link or CDN)</label>
                    <input type="url" name="image_url" placeholder="https://images.unsplash.com/..." required>
                  </div>
                  <button type="submit" class="btn-save">
                    Publish Photo to Gallery
                  </button>
                </form>
              </div>

              <!-- Gallery Grid -->
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:16px;">
                <?php foreach ($galleryList as $g): ?>
                  <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;">
                    <img src="<?= htmlspecialchars($g['image_url']) ?>" style="width:100%; height:140px; object-fit:cover;">
                    <div style="padding:12px;">
                      <span style="font-size:10.5px; font-weight:700; color:var(--primary); text-transform:uppercase;"><?= htmlspecialchars($g['category']) ?></span>
                      <div style="font-weight:600; font-size:13px; color:#0f172a; margin:4px 0 8px;"><?= htmlspecialchars($g['title_en']) ?></div>
                      <form method="POST">
                        <input type="hidden" name="admin_action" value="delete_gallery">
                        <input type="hidden" name="gallery_id" value="<?= $g['id'] ?>">
                        <button type="submit" onclick="return confirm('Delete this photograph?');" style="background:#fee2e2; color:#991b1b; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:600;">Delete</button>
                      </form>
                    </div>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- TAB 3: eKYM VERIFICATION QUEUE -->
      <div id="tab-ekym-queue" class="tab-pane">
        <div class="panel-box">
          <div class="panel-box-header">
            <div>
              <h3>📝 eKYM Member Applications</h3>
              <p>Review digital member KYC registration applications submitted via online portal</p>
            </div>
            <span class="status-pill"><?= count($ekymList) ?> Total Applications</span>
          </div>

          <div class="panel-box-body" style="padding:0;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>App No</th>
                  <th>Applicant Name</th>
                  <th>Lineage (Father / Grandfather)</th>
                  <th>Citizenship & Dist</th>
                  <th>Permanent Address</th>
                  <th>Bank / Nominee</th>
                  <th>Status & Decision</th>
                </tr>
              </thead>
              <tbody>
                <?php if (empty($ekymList)): ?>
                  <tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No applications found.</td></tr>
                <?php else: ?>
                  <?php foreach ($ekymList as $ek): ?>
                    <tr>
                      <td>
                        <strong><?= htmlspecialchars($ek['application_no']) ?></strong><br>
                        <small style="color:#64748b;"><?= substr($ek['submitted_at'], 0, 10) ?></small>
                      </td>
                      <td>
                        <strong><?= htmlspecialchars($ek['full_name_en']) ?></strong><br>
                        <span><?= htmlspecialchars($ek['full_name_np']) ?></span><br>
                        <small style="color:#059669;">📱 <?= htmlspecialchars($ek['phone']) ?></small>
                      </td>
                      <td>
                        <small>F: <?= htmlspecialchars($ek['father_name']) ?></small><br>
                        <small>GF: <?= htmlspecialchars($ek['grandfather_name']) ?></small>
                      </td>
                      <td>
                        <?= htmlspecialchars($ek['citizenship_no']) ?><br>
                        <small style="color:#64748b;"><?= htmlspecialchars($ek['citizenship_district']) ?></small>
                      </td>
                      <td>
                        <small><?= htmlspecialchars($ek['permanent_address']) ?></small><br>
                        <small style="color:#475569;">Occ: <?= htmlspecialchars($ek['occupation']) ?></small>
                      </td>
                      <td>
                        <small>Bank: <?= htmlspecialchars($ek['bank_name']) ?></small><br>
                        <small>Nominee: <?= htmlspecialchars($ek['nominee_name']) ?> (<?= htmlspecialchars($ek['nominee_relation']) ?>)</small>
                      </td>
                      <td>
                        <span class="badge badge-<?= strtolower($ek['status']) ?>" style="margin-bottom:8px;"><?= htmlspecialchars($ek['status']) ?></span>
                        <form method="POST" style="display:flex; flex-direction:column; gap:4px; margin-top:6px;">
                          <input type="hidden" name="admin_action" value="update_ekym_status">
                          <input type="hidden" name="ekym_id" value="<?= $ek['id'] ?>">
                          <select name="status" style="font-size:11px; padding:3px 6px; border-radius:4px; border:1px solid #cbd5e1;">
                            <option value="Approved" <?= ($ek['status'] === 'Approved') ? 'selected' : '' ?>>Approve Member</option>
                            <option value="Pending" <?= ($ek['status'] === 'Pending') ? 'selected' : '' ?>>Pending Review</option>
                            <option value="Rejected" <?= ($ek['status'] === 'Rejected') ? 'selected' : '' ?>>Reject Application</option>
                          </select>
                          <input type="text" name="remarks" placeholder="Audit remarks..." value="<?= htmlspecialchars($ek['remarks'] ?? '') ?>" style="font-size:11px; padding:3px 6px; border-radius:4px; border:1px solid #cbd5e1;">
                          <button type="submit" class="btn-save" style="font-size:11px; padding:4px 8px; justify-content:center;">Update</button>
                        </form>
                      </td>
                    </tr>
                  <?php endforeach; ?>
                <?php endif; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: LOAN EVALUATIONS QUEUE -->
      <div id="tab-loans-queue" class="tab-pane">
        <div class="panel-box">
          <div class="panel-box-header">
            <div>
              <h3>💼 Loan Applications & Credit Evaluation</h3>
              <p>Underwrite member loan requests, calculate installment capacity, and sanction credit</p>
            </div>
          </div>
          <div class="panel-box-body" style="padding:0;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Tracking Code</th>
                  <th>Applicant</th>
                  <th>Loan Scheme</th>
                  <th>Requested Amount</th>
                  <th>Tenure</th>
                  <th>Monthly Income</th>
                  <th>Status & Action</th>
                </tr>
              </thead>
              <tbody>
                <?php if (empty($loanList)): ?>
                  <tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No loan applications submitted yet.</td></tr>
                <?php else: ?>
                  <?php foreach ($loanList as $l): ?>
                    <tr>
                      <td><strong><?= htmlspecialchars($l['tracking_code']) ?></strong></td>
                      <td>
                        <strong><?= htmlspecialchars($l['applicant_name']) ?></strong><br>
                        <small style="color:#64748b;">📱 <?= htmlspecialchars($l['phone']) ?></small>
                      </td>
                      <td><span style="font-weight:600; color:var(--primary);"><?= htmlspecialchars($l['loan_scheme']) ?></span></td>
                      <td><strong>Rs. <?= number_format($l['amount']) ?></strong></td>
                      <td><?= $l['tenure_months'] ?> Months</td>
                      <td>Rs. <?= number_format($l['monthly_income']) ?>/mo</td>
                      <td>
                        <form method="POST" style="display:flex; align-items:center; gap:6px;">
                          <input type="hidden" name="admin_action" value="update_loan_status">
                          <input type="hidden" name="loan_id" value="<?= $l['id'] ?>">
                          <select name="status" style="font-size:11px; padding:4px 6px;">
                            <option value="Under Review" <?= ($l['status'] === 'Under Review') ? 'selected' : '' ?>>Under Review</option>
                            <option value="Approved" <?= ($l['status'] === 'Approved') ? 'selected' : '' ?>>Approved</option>
                            <option value="Disbursed" <?= ($l['status'] === 'Disbursed') ? 'selected' : '' ?>>Disbursed</option>
                            <option value="Rejected" <?= ($l['status'] === 'Rejected') ? 'selected' : '' ?>>Rejected</option>
                          </select>
                          <button type="submit" class="btn-save" style="font-size:11px; padding:4px 8px;">Save</button>
                        </form>
                      </td>
                    </tr>
                  <?php endforeach; ?>
                <?php endif; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: MEMBERS & CBS LEDGER -->
      <div id="tab-members-ledger" class="tab-pane">
        <div class="panel-box">
          <div class="panel-box-header">
            <div>
              <h3>👥 Core Banking Members Registry</h3>
              <p>Search members, inspect savings passbook balance, and view share equity</p>
            </div>
            <div style="font-size:12.5px; color:#475569;">
              Showing <?= count($membersList) ?> Active Accounts
            </div>
          </div>
          <div class="panel-box-body" style="padding:0;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Member Code</th>
                  <th>Full Name</th>
                  <th>Branch</th>
                  <th>Share Capital</th>
                  <th>Regular Savings</th>
                  <th>Loan Balance</th>
                  <th>KYC Status</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($membersList as $m): ?>
                  <tr>
                    <td><strong><?= htmlspecialchars($m['member_code']) ?></strong></td>
                    <td>
                      <strong><?= htmlspecialchars($m['full_name']) ?></strong><br>
                      <small style="color:#64748b;">📱 <?= htmlspecialchars($m['phone']) ?></small>
                    </td>
                    <td><?= htmlspecialchars($m['branch']) ?></td>
                    <td>Rs. <?= number_format($m['share_amount']) ?></td>
                    <td><strong style="color:var(--primary);">Rs. <?= number_format($m['regular_saving_balance']) ?></strong></td>
                    <td>Rs. <?= number_format($m['loan_balance']) ?></td>
                    <td><span class="badge badge-approved">Verified KYC</span></td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 6: NOTICES & CIRCULARS CMS -->
      <div id="tab-notices-cms" class="tab-pane">
        <div class="panel-box">
          <div class="panel-box-header">
            <div>
              <h3>📢 Official Notices & Circulars Manager</h3>
              <p>Publish official announcements, AGM notices, and reports directly to the public website</p>
            </div>
          </div>
          <div class="panel-box-body">
            <!-- Add Notice Form -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px; margin-bottom:24px;">
              <h4 style="margin:0 0 12px 0; color:#0f172a;">➕ Publish New Notice</h4>
              <form method="POST">
                <input type="hidden" name="admin_action" value="add_notice">
                <div class="form-grid-3">
                  <div class="form-group">
                    <label>Notice Title (English)</label>
                    <input type="text" name="title_en" placeholder="e.g. 24th AGM Circular" required>
                  </div>
                  <div class="form-group">
                    <label>Notice Title (नेपाली)</label>
                    <input type="text" name="title_np" placeholder="e.g. २४औं साधारण सभा सूचना" required>
                  </div>
                  <div class="form-group">
                    <label>Category</label>
                    <select name="category">
                      <option value="AGM Notice">Annual General Meeting (AGM)</option>
                      <option value="Interest Rates">Interest Rates Notice</option>
                      <option value="Career">Career & Vacancy</option>
                      <option value="General">General Member Notice</option>
                    </select>
                  </div>
                </div>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label>Content (English)</label>
                    <textarea name="content_en" rows="2" placeholder="Full notice narrative..."></textarea>
                  </div>
                  <div class="form-group">
                    <label>Content (नेपाली)</label>
                    <textarea name="content_np" rows="2" placeholder="सूचनाको पूर्ण व्यहोरा..."></textarea>
                  </div>
                </div>
                <button type="submit" class="btn-save">
                  Publish Notice to Website
                </button>
              </form>
            </div>

            <!-- Existing Notices Table -->
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Title (English / नेपाली)</th>
                  <th>Category</th>
                  <th>Publish Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($noticesList as $n): ?>
                  <tr>
                    <td>
                      <strong><?= htmlspecialchars($n['title_en']) ?></strong><br>
                      <span><?= htmlspecialchars($n['title_np']) ?></span>
                    </td>
                    <td><span class="badge" style="background:#e0e7ff; color:#3730a3;"><?= htmlspecialchars($n['category']) ?></span></td>
                    <td><?= htmlspecialchars($n['publish_date']) ?></td>
                    <td>
                      <form method="POST">
                        <input type="hidden" name="admin_action" value="delete_notice">
                        <input type="hidden" name="notice_id" value="<?= $n['id'] ?>">
                        <button type="submit" onclick="return confirm('Delete this notice?');" style="background:#fee2e2; color:#991b1b; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">Delete</button>
                      </form>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 7: INTEREST RATES CMS -->
      <div id="tab-rates-cms" class="tab-pane">
        <div class="panel-box">
          <div class="panel-box-header">
            <div>
              <h3>📈 Interest Rates Management</h3>
              <p>Edit deposit yields and loan rates published on the public interest rate schedule</p>
            </div>
          </div>
          <div class="panel-box-body">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
              <?php foreach ($ratesList as $r): ?>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
                  <form method="POST">
                    <input type="hidden" name="admin_action" value="update_rate">
                    <input type="hidden" name="rate_id" value="<?= $r['id'] ?>">

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <span class="badge" style="background:#dcfce7; color:#166534;"><?= htmlspecialchars($r['category']) ?></span>
                      <strong style="color:var(--primary); font-size:18px;"><?= number_format($r['rate_percent'], 2) ?>%</strong>
                    </div>

                    <strong style="color:#0f172a; font-size:13.5px; display:block; margin-bottom:4px;"><?= htmlspecialchars($r['scheme_en']) ?></strong>
                    <span style="color:#64748b; font-size:12px; display:block; margin-bottom:12px;"><?= htmlspecialchars($r['scheme_np']) ?></span>

                    <div class="form-group" style="margin-bottom:10px;">
                      <label>New Rate Percent (% p.a.)</label>
                      <input type="number" name="rate_percent" value="<?= $r['rate_percent'] ?>" step="0.05" required>
                    </div>

                    <button type="submit" class="btn-save" style="font-size:11px; padding:6px 12px; width:100%; justify-content:center;">
                      Update Rate to <?= number_format($r['rate_percent'], 2) ?>%
                    </button>
                  </form>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 8: SYSTEM ARCHITECTURE & TOOLS -->
      <div id="tab-system-tools" class="tab-pane">
        <div class="panel-box">
          <div class="panel-box-header">
            <div>
              <h3>⚙️ Pure PHP Server & Database Architecture</h3>
              <p>Self-contained LAMP/XAMPP/cPanel environment configuration and diagnostics</p>
            </div>
          </div>
          <div class="panel-box-body">
            <div class="form-grid-2">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:20px;">
                <h4 style="margin:0 0 10px 0; color:#0f172a;">🖥 Server Information</h4>
                <p style="font-size:13px; color:#475569; margin:4px 0;"><strong>PHP Engine:</strong> <?= PHP_VERSION ?></p>
                <p style="font-size:13px; color:#475569; margin:4px 0;"><strong>Database Engine:</strong> <?= DB_DRIVER ?> (<?= SQLITE_DB_PATH ?>)</p>
                <p style="font-size:13px; color:#475569; margin:4px 0;"><strong>Active Session:</strong> <?= session_id() ?></p>
                <p style="font-size:13px; color:#475569; margin:4px 0;"><strong>Server OS:</strong> <?= PHP_OS ?></p>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:20px;">
                <h4 style="margin:0 0 10px 0; color:#0f172a;">🚀 Running Standalone PHP</h4>
                <p style="font-size:12.5px; color:#475569; line-height:1.5;">
                  To run this pure-PHP application on your local machine or server without Node.js, run:
                </p>
                <code style="display:block; background:#0f172a; color:#38bdf8; padding:10px; border-radius:6px; font-size:12px; margin:8px 0;">
                  cd php-version<br>
                  php -S 0.0.0.0:8000
                </code>
                <p style="font-size:12px; color:#64748b; margin:4px 0;">
                  Credentials: Admin: <code>admin</code> / <code>Admin@123</code> | Member: <code>EK-10482</code> / <code>1234</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>

  <script>
    function switchMainTab(tabId, btn) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.sidebar-menu .menu-item').forEach(el => el.classList.remove('active'));

      const target = document.getElementById('tab-' + tabId);
      if (target) {
        target.classList.add('active');
      }
      if (btn) {
        btn.classList.add('active');
      }

      // Update breadcrumb
      const bcrumb = document.getElementById('breadcrumbLabel');
      if (bcrumb && btn) {
        bcrumb.innerHTML = btn.innerHTML;
      }
    }

    function switchCmsTab(paneId, btn) {
      document.querySelectorAll('.cms-subpane').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.cms-tab-btn').forEach(el => el.classList.remove('active'));

      const target = document.getElementById(paneId);
      if (target) {
        target.style.display = 'block';
      }
      if (btn) {
        btn.classList.add('active');
      }
    }
  </script>
</body>
</html>
