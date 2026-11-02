<?php
/**
 * Ekata Saving & Credit Cooperative Ltd.
 * Member Internet Banking, Passbook Portal & Loan EMI Calculator (PHP Standalone)
 * File: member.php (and php-version/member.php)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Handle direct member login or authentication check
$loginError = '';
$reqMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($reqMethod === 'POST' && isset($_POST['login_member'])) {
    $db = Database::getConnection();
    $code = sanitizeInput($_POST['member_code'] ?? '');
    $pin = trim($_POST['pin'] ?? '');

    if (empty($code) || empty($pin)) {
        $loginError = 'Please provide both Member Code / Phone and your 4-digit PIN.';
    } else {
        $stmt = $db->prepare("SELECT * FROM members WHERE member_code = ? OR phone = ? LIMIT 1");
        $stmt->execute([$code, $code]);
        $m = $stmt->fetch();

        // Check password hash or demo accounts fallback
        $isDemoMember = in_array(strtoupper($code), ['EK-10482', 'EK-10483', 'EK-10484', 'EK-10485']) && $pin === '1234';

        if ($m && (password_verify($pin, $m['pin_hash']) || $isDemoMember)) {
            $_SESSION['member_code'] = $m['member_code'];
            $_SESSION['member_name'] = $m['full_name'];
            header('Location: member.php');
            exit;
        } else {
            $loginError = 'Invalid Member Code or 4-digit PIN. Try demo account: EK-10482 with PIN: 1234';
        }
    }
}

// IF NOT LOGGED IN -> RENDER USER-FRIENDLY MEMBER LOGIN & EMI CALCULATOR PORTAL
if (!isset($_SESSION['member_code'])) {
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Member Internet Banking & Loan EMI Calculator - Ekata Saving & Credit Cooperative Ltd.</title>
  <link rel="stylesheet" href="style.css">
  <style>
    :root {
      --primary: #075c36;
      --primary-dark: #053b23;
      --primary-light: #eef7f2;
      --accent: #f4b52b;
      --accent-hover: #dfa119;
      --emerald-dark: #064e3b;
      --text-main: #133824;
      --text-muted: #526b5c;
      --border-color: #cbe3d6;
      --bg-canvas: #f2f7f4;
      --white: #ffffff;
      --radius-lg: 16px;
      --radius-md: 10px;
      --shadow-soft: 0 10px 30px -5px rgba(7, 92, 54, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
      --shadow-card: 0 20px 35px -8px rgba(5, 38, 21, 0.25);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at top, #114227 0%, #052615 100%);
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      line-height: 1.5;
    }

    .login-wrapper {
      width: 100%;
      max-width: 580px;
      margin: 0 auto;
    }

    .login-wrapper.wide-mode {
      max-width: 820px;
    }

    /* Top branding banner */
    .brand-topbar {
      text-align: center;
      margin-bottom: 20px;
    }

    .brand-logo-wrap {
      width: 76px;
      height: 76px;
      background: #ffffff;
      border-radius: 20px;
      padding: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
      border: 2px solid rgba(244, 181, 43, 0.5);
      margin-bottom: 12px;
    }

    .brand-logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .brand-title {
      font-size: 21px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .brand-title-np {
      font-size: 14px;
      color: #a7f3d0;
      margin-top: 2px;
      font-weight: 500;
    }

    .brand-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      color: #d1fae5;
      font-weight: 600;
    }

    .badge-pill.security {
      color: #fde68a;
      border-color: rgba(244, 181, 43, 0.4);
    }

    /* Main Container Card */
    .portal-card {
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: all 0.25s ease;
    }

    /* Tab Switcher */
    .tab-nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #f1f5f3;
      border-bottom: 1px solid var(--border-color);
      padding: 6px;
      gap: 6px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 14px;
      border: none;
      background: transparent;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 700;
      color: #526b5c;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: var(--primary-dark);
      background: rgba(255, 255, 255, 0.6);
    }

    .tab-btn.active {
      background: #ffffff;
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border-color);
    }

    .card-body {
      padding: 28px 32px;
    }

    @media (max-width: 640px) {
      .card-body { padding: 20px 18px; }
      .brand-title { font-size: 18px; }
    }

    /* Alert and Notice Boxes */
    .alert-box {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .alert-error {
      background: #fee2e2;
      border: 1px solid #f87171;
      color: #991b1b;
    }

    .alert-info {
      background: #eef7f2;
      border: 1px solid #cbe3d6;
      color: #075c36;
    }

    /* Form Fields */
    .form-group {
      margin-bottom: 18px;
    }

    .form-group label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 7px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      font-size: 16px;
      pointer-events: none;
    }

    .form-control {
      width: 100%;
      padding: 12px 14px 12px 42px;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 14px;
      color: #0f172a;
      font-weight: 500;
      outline: none;
      transition: all 0.15s ease-in-out;
    }

    .form-control:focus {
      background: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(7, 92, 54, 0.15);
    }

    .btn-toggle-eye {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      font-size: 15px;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
    }

    .btn-toggle-eye:hover {
      color: #0f172a;
    }

    /* Primary Action Buttons */
    .btn-primary {
      width: 100%;
      background: linear-gradient(135deg, #075c36 0%, #053b23 100%);
      color: #ffffff;
      border: none;
      padding: 13px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(7, 92, 54, 0.28);
      transition: all 0.2s;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #087a45 0%, #064e2e 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(7, 92, 54, 0.35);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    /* Quick 1-Click Demo Profiles (Like Admin Portal) */
    .demo-section {
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
    }

    .demo-label {
      font-size: 11.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 10px;
    }

    .demo-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s;
    }

    .demo-card:hover {
      background: #eef7f2;
      border-color: #6ee7b7;
      transform: translateY(-1px);
    }

    .demo-card.active {
      background: #ecfdf5;
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .demo-card strong {
      display: block;
      font-size: 12px;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .demo-card span {
      display: block;
      font-size: 11px;
      color: #64748b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 2px;
    }

    /* EMI Calculator Styles */
    .calc-box {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .scheme-select {
      width: 100%;
      padding: 11px 14px;
      border-radius: 10px;
      border: 1.5px solid #cbd5e1;
      background: #ffffff;
      font-size: 13.5px;
      font-weight: 600;
      color: #0f172a;
      outline: none;
    }

    .scheme-select:focus {
      border-color: var(--primary);
    }

    .calc-slider-group {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .slider-header span {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
    }

    .slider-header strong {
      font-size: 15px;
      font-weight: 800;
      color: var(--primary);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .calc-range {
      width: 100%;
      accent-color: var(--primary);
      cursor: pointer;
      height: 6px;
    }

    .quick-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }

    .chip-btn {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 4px 9px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s;
    }

    .chip-btn:hover, .chip-btn.active {
      background: #eef7f2;
      border-color: #075c36;
      color: #075c36;
    }

    /* Calculator Results Banner */
    .results-banner {
      background: linear-gradient(135deg, #075c36 0%, #053b23 100%);
      color: #ffffff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 14px rgba(7, 92, 54, 0.2);
    }

    .results-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .result-item small {
      display: block;
      font-size: 11px;
      color: #a7f3d0;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .result-item .val {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      margin-top: 2px;
    }

    .result-item.highlight .val {
      color: #fde68a;
      font-size: 24px;
    }

    .breakdown-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      margin-top: 14px;
      overflow: hidden;
      display: flex;
    }

    .bar-principal {
      background: #34d399;
      height: 100%;
    }

    .bar-interest {
      background: #fde68a;
      height: 100%;
    }

    .bar-legend {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-top: 6px;
      color: #d1fae5;
    }

    /* Amortization Table Preview */
    .schedule-preview {
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-top: 14px;
    }

    .schedule-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      text-align: left;
    }

    .schedule-table th {
      background: #f1f5f9;
      padding: 6px 10px;
      color: #475569;
      font-weight: 700;
      position: sticky;
      top: 0;
    }

    .schedule-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }

    /* Bottom Quick Links */
    .footer-links {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 12.5px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .footer-links a {
      color: #075c36;
      text-decoration: none;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    .footer-links .sub-link {
      color: #64748b;
      font-weight: 500;
    }

    .footer-links .sub-link:hover {
      color: #0f172a;
    }

    /* Help Modal */
    .help-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 10px;
      padding: 14px;
      margin-top: 16px;
      font-size: 12px;
      color: #92400e;
      display: none;
    }

    .help-box.show {
      display: block;
    }
  </style>
</head>
<body>

  <div class="login-wrapper" id="mainWrapper">
    <!-- Cooperative Brand Header -->
    <div class="brand-topbar">
      <div class="brand-logo-wrap">
        <img src="assets/images/ekata-logo.svg" alt="Ekata Cooperative Emblem" onerror="this.src='../assets/images/ekata-logo.svg'">
      </div>
      <h1 class="brand-title">Ekata Saving & Credit Cooperative Ltd.</h1>
      <p class="brand-title-np">एकता बचत तथा ऋण सहकारी संस्था लि. • सदस्य अनलाइन बैंकिङ</p>
      
      <div class="brand-badges">
        <span class="badge-pill">📍 Butwal-4, Rupandehi</span>
        <span class="badge-pill">📜 Regd. 421/057/058</span>
        <span class="badge-pill security">🔒 256-Bit TLS Secured</span>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="portal-card">
      <!-- Top Dual Tabs: Member Login vs Loan EMI Calculator -->
      <div class="tab-nav">
        <button type="button" class="tab-btn active" id="tabBtnLogin" onclick="switchView('login')">
          <span>👤</span>
          <span>Member Sign In (सदस्य लगइन)</span>
        </button>
        <button type="button" class="tab-btn" id="tabBtnCalc" onclick="switchView('calc')">
          <span>🧮</span>
          <span>Loan EMI Calculator (कर्जा ईएमआई)</span>
        </button>
      </div>

      <!-- TAB 1: MEMBER SIGN IN -->
      <div class="card-body" id="viewLogin">
        <?php if (!empty($loginError)): ?>
          <div class="alert-box alert-error">
            <span>⚠️</span>
            <div><?= htmlspecialchars($loginError) ?></div>
          </div>
        <?php endif; ?>

        <form method="POST" action="member.php" id="loginForm">
          <input type="hidden" name="login_member" value="1">
          
          <div class="form-group">
            <label for="member_code">
              <span>Member Account No. or Mobile (खाता वा मोबाइल)</span>
              <span style="color: #ef4444;">*</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">💳</span>
              <input 
                type="text" 
                id="member_code" 
                name="member_code" 
                class="form-control" 
                placeholder="e.g. EK-10482 or 9857012345" 
                value="<?= htmlspecialchars($_POST['member_code'] ?? 'EK-10482') ?>" 
                required 
                autofocus
              >
            </div>
          </div>

          <div class="form-group">
            <label for="pin">
              <span>4-Digit Security PIN (४-अङ्कको गोप्य पिन)</span>
              <a href="javascript:void(0)" onclick="toggleHelp()" style="color: #075c36; font-size: 11.5px; text-decoration: none;">Forgot PIN?</a>
            </label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                id="pin" 
                name="pin" 
                class="form-control" 
                maxlength="6" 
                placeholder="••••" 
                value="<?= htmlspecialchars($_POST['pin'] ?? '1234') ?>" 
                required
              >
              <button type="button" class="btn-toggle-eye" onclick="togglePinVisibility()" title="Toggle PIN visibility">
                <span id="eyeIcon">👁️</span>
              </button>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
            <label style="display: flex; align-items: center; gap: 7px; font-size: 12px; color: #64748b; cursor: pointer;">
              <input type="checkbox" name="remember" checked style="accent-color: #075c36;">
              <span>Remember Member Code</span>
            </label>
            <span style="font-size: 11px; color: #10b981; font-weight: 700;">● CBS Server Online</span>
          </div>

          <button type="submit" class="btn-primary">
            <span>Sign In to Member Portal</span>
            <span>➔</span>
          </button>
        </form>

        <!-- Help Drawer (Lost PIN / Helpline) -->
        <div class="help-box" id="helpDrawer">
          <strong>🔑 Security Notice & PIN Reset:</strong><br>
          For your account protection, please contact Ekata Cooperative Central Office at <strong>071-540123</strong> or Toll-Free <strong>1660-71-54000</strong> from your registered phone. For testing, default PIN is <code>1234</code>.
        </div>

        <!-- 1-Click Fast Fill Demo Accounts (Identical to Admin Portal convenience) -->
        <div class="demo-section">
          <div class="demo-label">
            <span>⚡ 1-Click Quick Demo Profiles:</span>
            <span style="color: #075c36; font-size: 11px;">Click to auto-fill</span>
          </div>
          <div class="demo-grid">
            <div class="demo-card active" onclick="fillDemo('EK-10482', '1234', this)">
              <strong>👤 Ram Chandra Sharma</strong>
              <span>EK-10482 (PIN: 1234)</span>
            </div>
            <div class="demo-card" onclick="fillDemo('EK-10483', '1234', this)">
              <strong>👤 Sita Devi Thapa</strong>
              <span>EK-10483 (PIN: 1234)</span>
            </div>
            <div class="demo-card" onclick="fillDemo('EK-10484', '1234', this)">
              <strong>👤 Hari Prasad Poudel</strong>
              <span>EK-10484 (PIN: 1234)</span>
            </div>
          </div>
        </div>

        <!-- Quick Switcher Footer Links -->
        <div class="footer-links">
          <a href="index.php">← Public Website</a>
          <a href="admin.php" style="color: #0369a1;">🏢 Admin CBS Portal →</a>
          <a href="ekym.php" class="sub-link">📝 Open New Account (eKYM)</a>
        </div>
      </div>

      <!-- TAB 2: INTERACTIVE LOAN EMI & INTEREST CALCULATOR -->
      <div class="card-body" id="viewCalc" style="display: none;">
        <div class="calc-box">
          <div>
            <label style="display: block; font-size: 12.5px; font-weight: 700; color: #1e293b; margin-bottom: 7px;">
              Select Loan Product Scheme (कर्जा योजना चयन गर्नुहोस्):
            </label>
            <select id="calcScheme" class="scheme-select" onchange="onSchemeChange()">
              <option value="agri" data-rate="12.00" data-max="60" data-name="Agricultural Productive Loan">
                🌾 Agricultural Productive Loan (व्यावसायिक कृषि कर्जा @ 12.00%)
              </option>
              <option value="sme" data-rate="13.50" data-max="84" data-name="SME & Enterprise Expansion Loan">
                🏪 SME & Enterprise Expansion Loan (साना तथा मझौला व्यवसाय कर्जा @ 13.50%)
              </option>
              <option value="housing" data-rate="13.00" data-max="120" data-name="Residential Housing & Land Loan">
                🏡 Residential Housing & Land Loan (घरजग्गा तथा आवास निर्माण कर्जा @ 13.00%)
              </option>
              <option value="education" data-rate="11.50" data-max="60" data-name="Higher Educational Loan">
                🎓 Higher Educational Loan (उच्च शिक्षा तथा प्राविधिक कर्जा @ 11.50%)
              </option>
              <option value="auto" data-rate="14.00" data-max="60" data-name="Auto & Commercial Vehicle Loan">
                🚗 Auto & Commercial Vehicle Loan (सवारी तथा ढुवानी साधन कर्जा @ 14.00%)
              </option>
              <option value="social" data-rate="13.50" data-max="36" data-name="Social & Personal Welfare Loan">
                🤝 Social & Personal Welfare Loan (सामाजिक तथा घरायसी कर्जा @ 13.50%)
              </option>
            </select>
            <p id="schemeDesc" style="font-size: 11.5px; color: #526b5c; margin-top: 6px;">
              Priority credit for farming, dairy, livestock, greenhouse irrigation, and agro-processing equipment.
            </p>
          </div>

          <!-- Principal Slider -->
          <div class="calc-slider-group">
            <div class="slider-header">
              <span>LOAN PRINCIPAL (ऋण साँवा रकम):</span>
              <strong id="principalDisplay">Rs. 3,00,000</strong>
            </div>
            <input 
              type="range" 
              id="principalSlider" 
              class="calc-range" 
              min="25000" 
              max="5000000" 
              step="25000" 
              value="300000" 
              oninput="syncPrincipal(this.value)"
            >
            <div class="quick-chips">
              <button type="button" class="chip-btn" onclick="syncPrincipal(100000)">Rs. 1 Lakh</button>
              <button type="button" class="chip-btn active" onclick="syncPrincipal(300000)">Rs. 3 Lakh</button>
              <button type="button" class="chip-btn" onclick="syncPrincipal(500000)">Rs. 5 Lakh</button>
              <button type="button" class="chip-btn" onclick="syncPrincipal(1000000)">Rs. 10 Lakh</button>
              <button type="button" class="chip-btn" onclick="syncPrincipal(2500000)">Rs. 25 Lakh</button>
            </div>
          </div>

          <!-- Tenure Slider -->
          <div class="calc-slider-group">
            <div class="slider-header">
              <span>REPAYMENT TENURE (भुक्तानी अवधि):</span>
              <strong id="tenureDisplay">24 Months (2.0 Years)</strong>
            </div>
            <input 
              type="range" 
              id="tenureSlider" 
              class="calc-range" 
              min="6" 
              max="120" 
              step="6" 
              value="24" 
              oninput="syncTenure(this.value)"
            >
            <div class="quick-chips">
              <button type="button" class="chip-btn" onclick="syncTenure(12)">1 Year (12 M)</button>
              <button type="button" class="chip-btn active" onclick="syncTenure(24)">2 Years (24 M)</button>
              <button type="button" class="chip-btn" onclick="syncTenure(36)">3 Years (36 M)</button>
              <button type="button" class="chip-btn" onclick="syncTenure(60)">5 Years (60 M)</button>
              <button type="button" class="chip-btn" onclick="syncTenure(84)">7 Years (84 M)</button>
            </div>
          </div>

          <!-- Rate of Interest Input -->
          <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px;">
            <div>
              <span style="display: block; font-size: 12px; font-weight: 700; color: #1e293b;">Annual Interest Rate (ब्याजदर % p.a.):</span>
              <span style="font-size: 11px; color: #64748b;">Determined by cooperative policy</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input 
                type="number" 
                id="rateInput" 
                step="0.1" 
                min="5" 
                max="20" 
                value="12.00" 
                style="width: 80px; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 800; text-align: right; color: #075c36;" 
                oninput="calculateEmi()"
              >
              <span style="font-weight: 800; color: #075c36;">%</span>
            </div>
          </div>

          <!-- Result Banner -->
          <div class="results-banner">
            <div class="results-grid">
              <div class="result-item highlight">
                <small>Monthly Installment (EMI)</small>
                <div class="val" id="resEmi">Rs. 14,122</div>
              </div>
              <div class="result-item">
                <small>Total Interest Payable</small>
                <div class="val" id="resInterest">Rs. 38,928</div>
              </div>
              <div class="result-item">
                <small>Total Principal</small>
                <div class="val" id="resPrincipal">Rs. 3,00,000</div>
              </div>
              <div class="result-item">
                <small>Total Repayment (P + I)</small>
                <div class="val" id="resTotal">Rs. 3,38,928</div>
              </div>
            </div>

            <!-- Principal vs Interest Proportion Bar -->
            <div class="breakdown-bar">
              <div class="bar-principal" id="barPrincipal" style="width: 88.5%;"></div>
              <div class="bar-interest" id="barInterest" style="width: 11.5%;"></div>
            </div>
            <div class="bar-legend">
              <span>● Principal (<span id="pctPrincipal">88.5%</span>)</span>
              <span>● Interest (<span id="pctInterest">11.5%</span>)</span>
            </div>
          </div>

          <!-- Amortization Schedule Preview (First 6 Months) -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 700; color: #334155;">Monthly Repayment Schedule Preview (मासिक किस्ता तालिका):</span>
              <span style="font-size: 11px; color: #075c36; font-weight: 600;">Standard Diminishing Balance</span>
            </div>
            <div class="schedule-preview">
              <table class="schedule-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Installment</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Remaining Balance</th>
                  </tr>
                </thead>
                <tbody id="scheduleBody">
                  <!-- Dynamically inserted -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Apply / Transfer CTA -->
          <button type="button" class="btn-primary" onclick="proceedToApply()">
            <span>Sign In to Apply for this Loan Scheme ➔</span>
          </button>
        </div>

        <div class="footer-links">
          <a href="javascript:void(0)" onclick="switchView('login')">← Back to Member Sign In</a>
          <a href="index.php" class="sub-link">Return to Home</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Tab and Layout Management
    function switchView(mode) {
      const wrapper = document.getElementById('mainWrapper');
      const tabLogin = document.getElementById('tabBtnLogin');
      const tabCalc = document.getElementById('tabBtnCalc');
      const viewLogin = document.getElementById('viewLogin');
      const viewCalc = document.getElementById('viewCalc');

      if (mode === 'calc') {
        tabLogin.classList.remove('active');
        tabCalc.classList.add('active');
        viewLogin.style.display = 'none';
        viewCalc.style.display = 'block';
        wrapper.classList.add('wide-mode');
        calculateEmi();
      } else {
        tabCalc.classList.remove('active');
        tabLogin.classList.add('active');
        viewCalc.style.display = 'none';
        viewLogin.style.display = 'block';
        wrapper.classList.remove('wide-mode');
      }
    }

    // Toggle Password Visibility
    function togglePinVisibility() {
      const pinInput = document.getElementById('pin');
      const eyeIcon = document.getElementById('eyeIcon');
      if (pinInput.type === 'password') {
        pinInput.type = 'text';
        eyeIcon.textContent = '👁️‍🗨️';
      } else {
        pinInput.type = 'password';
        eyeIcon.textContent = '👁️';
      }
    }

    // Toggle Help Box
    function toggleHelp() {
      const drawer = document.getElementById('helpDrawer');
      drawer.classList.toggle('show');
    }

    // Quick 1-Click Demo Profiles Fill
    function fillDemo(code, pin, cardEl) {
      document.getElementById('member_code').value = code;
      document.getElementById('pin').value = pin;
      
      // Highlight active card
      document.querySelectorAll('.demo-card').forEach(c => c.classList.remove('active'));
      if (cardEl) cardEl.classList.add('active');

      // Visual brief feedback
      const btn = document.querySelector('.btn-primary');
      btn.style.filter = 'brightness(1.15)';
      setTimeout(() => { btn.style.filter = 'none'; }, 200);
    }

    // Scheme Descriptions and Rate mapping
    const schemeDetails = {
      agri: {
        rate: 12.00,
        maxMonths: 60,
        desc: 'Priority credit for commercial farming, dairy, livestock, greenhouse irrigation, and harvesting equipment.'
      },
      sme: {
        rate: 13.50,
        maxMonths: 84,
        desc: 'Working capital and fixed asset acquisition for retailers, wholesalers, workshop machinery, and hotels.'
      },
      housing: {
        rate: 13.00,
        maxMonths: 120,
        desc: 'Long-term financing for residential construction, land plot acquisition, structural remodeling, and finishing.'
      },
      education: {
        rate: 11.50,
        maxMonths: 60,
        desc: 'Subsidized loan for domestic technical diploma, MBBS, engineering, and recognized overseas university tuition.'
      },
      auto: {
        rate: 14.00,
        maxMonths: 60,
        desc: 'Commercial passenger vehicle, cargo pickup, tractor, and private automobile purchase.'
      },
      social: {
        rate: 13.50,
        maxMonths: 36,
        desc: 'Social welfare credit for community ceremonies, festivals, overseas job preparation, and family emergency.'
      }
    };

    function onSchemeChange() {
      const sel = document.getElementById('calcScheme');
      const val = sel.value;
      const data = schemeDetails[val] || schemeDetails.agri;
      
      document.getElementById('rateInput').value = data.rate.toFixed(2);
      document.getElementById('schemeDesc').textContent = data.desc;

      const tenureSlider = document.getElementById('tenureSlider');
      tenureSlider.max = data.maxMonths;
      if (parseInt(tenureSlider.value, 10) > data.maxMonths) {
        syncTenure(data.maxMonths);
      } else {
        calculateEmi();
      }
    }

    function syncPrincipal(val) {
      val = parseInt(val, 10);
      document.getElementById('principalSlider').value = val;
      document.getElementById('principalDisplay').textContent = 'Rs. ' + val.toLocaleString();
      
      // Update chip states
      document.querySelectorAll('#viewCalc .calc-slider-group:nth-of-type(1) .chip-btn').forEach(btn => {
        const text = btn.textContent.replace(/\D/g, '');
        const btnVal = text === '1' ? 100000 : text === '3' ? 300000 : text === '5' ? 500000 : text === '10' ? 1000000 : 2500000;
        btn.classList.toggle('active', btnVal === val);
      });

      calculateEmi();
    }

    function syncTenure(val) {
      val = parseInt(val, 10);
      document.getElementById('tenureSlider').value = val;
      const yrs = (val / 12).toFixed(1);
      document.getElementById('tenureDisplay').textContent = val + ' Months (' + yrs + ' Years)';

      // Update chip states
      document.querySelectorAll('#viewCalc .calc-slider-group:nth-of-type(2) .chip-btn').forEach(btn => {
        const text = btn.textContent.replace(/\D/g, '');
        const btnVal = parseInt(text, 10);
        btn.classList.toggle('active', btnVal === val);
      });

      calculateEmi();
    }

    function calculateEmi() {
      const p = parseFloat(document.getElementById('principalSlider').value) || 0;
      const n = parseInt(document.getElementById('tenureSlider').value, 10) || 1;
      const annualRate = parseFloat(document.getElementById('rateInput').value) || 0;

      const monthlyRate = (annualRate / 12) / 100;
      let emi = 0;

      if (monthlyRate > 0) {
        emi = Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
      } else {
        emi = Math.round(p / n);
      }

      const totalRepay = emi * n;
      const totalInterest = Math.max(0, totalRepay - p);

      document.getElementById('resEmi').textContent = 'Rs. ' + emi.toLocaleString();
      document.getElementById('resInterest').textContent = 'Rs. ' + totalInterest.toLocaleString();
      document.getElementById('resPrincipal').textContent = 'Rs. ' + Math.round(p).toLocaleString();
      document.getElementById('resTotal').textContent = 'Rs. ' + totalRepay.toLocaleString();

      const principalPct = totalRepay > 0 ? ((p / totalRepay) * 100).toFixed(1) : 100;
      const interestPct = totalRepay > 0 ? ((totalInterest / totalRepay) * 100).toFixed(1) : 0;

      document.getElementById('barPrincipal').style.width = principalPct + '%';
      document.getElementById('barInterest').style.width = interestPct + '%';
      document.getElementById('pctPrincipal').textContent = principalPct + '%';
      document.getElementById('pctInterest').textContent = interestPct + '%';

      // Generate Amortization Table for First 6 Months
      let balance = p;
      const tbody = document.getElementById('scheduleBody');
      tbody.innerHTML = '';

      const previewMonths = Math.min(n, 6);
      for (let m = 1; m <= previewMonths; m++) {
        const interestM = Math.round(balance * monthlyRate);
        const principalM = emi - interestM;
        balance = Math.max(0, balance - principalM);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>Month ${m}</td>
          <td>Rs. ${emi.toLocaleString()}</td>
          <td style="color:#075c36; font-weight:600;">Rs. ${principalM.toLocaleString()}</td>
          <td style="color:#b45309;">Rs. ${interestM.toLocaleString()}</td>
          <td style="font-weight:600;">Rs. ${balance.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      }
    }

    function proceedToApply() {
      const sel = document.getElementById('calcScheme');
      const selectedOption = sel.options[sel.selectedIndex];
      const schemeName = selectedOption.getAttribute('data-name');
      const principal = document.getElementById('principalSlider').value;
      const tenure = document.getElementById('tenureSlider').value;

      // Save chosen scheme to sessionStorage so it fills automatically if logged in
      sessionStorage.setItem('ekata_loan_scheme', schemeName);
      sessionStorage.setItem('ekata_loan_amount', principal);
      sessionStorage.setItem('ekata_loan_tenure', tenure);

      // Switch back to Login view
      switchView('login');

      // Add a helpful guidance banner
      let notice = document.getElementById('calcNotice');
      if (!notice) {
        notice = document.createElement('div');
        notice.id = 'calcNotice';
        notice.className = 'alert-box alert-info';
        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(notice, form);
      }
      notice.innerHTML = `
        <span>💡</span>
        <div>Selected: <strong>${schemeName}</strong> (Rs. ${parseInt(principal).toLocaleString()} for ${tenure} months). Sign in below to complete application.</div>
      `;
    }

    // Initial calculation on load
    document.addEventListener('DOMContentLoaded', () => {
      calculateEmi();
    });
  </script>
</body>
</html>
<?php
    exit;
}

// =========================================================================
// LOGGED IN MEMBER DASHBOARD (With Embedded Loan EMI Calculator & Passbook)
// =========================================================================

$db = Database::getConnection();
$memberCode = $_SESSION['member_code'];

// Fetch member details
$stmt = $db->prepare("SELECT * FROM members WHERE member_code = ? LIMIT 1");
$stmt->execute([$memberCode]);
$member = $stmt->fetch();

if (!$member) {
    session_destroy();
    header('Location: member.php');
    exit;
}

// Handle member loan application
$loanNotice = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['apply_member_loan'])) {
    $scheme = sanitizeInput($_POST['loan_scheme'] ?? 'Agricultural Productive Loan');
    $amount = (float)($_POST['amount'] ?? 0);
    $tenure = (int)($_POST['tenure_months'] ?? 24);
    $monthlyIncome = (float)($_POST['monthly_income'] ?? 0);
    $purpose = sanitizeInput($_POST['purpose'] ?? '');

    if ($amount > 0) {
        $trackingCode = 'EKT-LN-' . strtoupper(substr(md5(uniqid()), 0, 8));
        $ins = $db->prepare("INSERT INTO loan_applications (tracking_code, applicant_name, phone, loan_scheme, amount, tenure_months, monthly_income, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Under Review')");
        $ins->execute([$trackingCode, $member['full_name'], $member['phone'], $scheme, $amount, $tenure, $monthlyIncome, $purpose]);
        $loanNotice = "Loan application submitted successfully! Reference tracking code: $trackingCode. Our Credit Committee will review within 2 working days.";
    }
}

// Fetch member transactions
$txStmt = $db->prepare("SELECT * FROM transactions WHERE member_code = ? ORDER BY id DESC LIMIT 25");
$txStmt->execute([$memberCode]);
$transactions = $txStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Member Internet Banking - Ekata Saving & Credit Cooperative Ltd.</title>
  <link rel="stylesheet" href="style.css">
  <style>
    :root {
      --primary: #075c36;
      --primary-dark: #053b23;
      --accent: #f4b52b;
      --bg: #f4f8f5;
      --card-bg: #ffffff;
      --border: #cfe3d7;
      --text: #133824;
      --text-muted: #526b5c;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
    }

    /* Modern Topbar */
    .member-topbar {
      background: linear-gradient(90deg, #052615 0%, #083c21 50%, #052615 100%);
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .topbar-logo {
      background: #ffffff;
      border-radius: 10px;
      padding: 4px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .topbar-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .topbar-nav {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .topbar-nav a {
      color: #d1fae5;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      transition: background 0.15s;
    }

    .topbar-nav a:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    .topbar-nav a.btn-logout {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    .topbar-nav a.btn-logout:hover {
      background: #dc2626;
      color: #ffffff;
    }

    /* Main Container */
    .member-container {
      max-width: 1180px;
      margin: 24px auto 60px auto;
      padding: 0 18px;
    }

    /* Profile Header */
    .profile-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 18px;
      box-shadow: 0 4px 12px rgba(7, 92, 54, 0.05);
    }

    .profile-info h1 {
      font-size: 22px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .profile-info p {
      color: var(--text-muted);
      font-size: 13.5px;
    }

    .badge-ekym {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #dcfce7;
      color: #166534;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #86efac;
    }

    /* Balances Grid */
    .balances-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
      margin-bottom: 26px;
    }

    .balance-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px;
      border: 1px solid var(--border);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      position: relative;
      overflow: hidden;
    }

    .balance-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary);
    }

    .balance-card.gold::before { background: var(--accent); }
    .balance-card.loan::before { background: #e11d48; }

    .balance-card small {
      display: block;
      color: var(--text-muted);
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .balance-card strong {
      display: block;
      font-size: 24px;
      font-weight: 900;
      color: var(--primary);
      margin-top: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .balance-card.loan strong {
      color: #e11d48;
    }

    .balance-sub {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      display: block;
    }

    /* Content Boxes */
    .content-box {
      background: #ffffff;
      border-radius: 16px;
      padding: 26px;
      border: 1px solid var(--border);
      margin-bottom: 26px;
      box-shadow: 0 4px 12px rgba(7, 92, 54, 0.04);
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .content-header h2 {
      font-size: 18px;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Table Styling */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .data-table th {
      background: #eef7f2;
      padding: 12px 14px;
      text-align: left;
      border-bottom: 2px solid var(--border);
      color: var(--primary-dark);
      font-weight: 700;
    }

    .data-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f3;
    }

    .badge-cr { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
    .badge-dr { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }

    /* Loan Application Form Controls */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-item label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .form-item input, .form-item select, .form-item textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13.5px;
      outline: none;
      background: #f8fafc;
    }

    .form-item input:focus, .form-item select:focus, .form-item textarea:focus {
      background: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(7, 92, 54, 0.12);
    }

    .btn-action {
      background: linear-gradient(135deg, #075c36 0%, #053b23 100%);
      color: #ffffff;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(7, 92, 54, 0.25);
    }

    .btn-action:hover {
      background: #087a45;
    }

    /* Embedded EMI Calculator in Dashboard */
    .dashboard-calc-container {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 14px;
      padding: 22px;
      margin-bottom: 24px;
    }

    .calc-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .calc-row { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- Top Bar -->
  <header class="member-topbar">
    <div class="topbar-left">
      <div class="topbar-logo">
        <img src="assets/images/ekata-logo.svg" alt="Logo" onerror="this.src='../assets/images/ekata-logo.svg'">
      </div>
      <div>
        <strong style="font-size: 14px;">Ekata Member Internet Banking</strong>
        <span style="font-size: 12px; color: #a7f3d0; margin-left: 8px;">
          Member Code: <strong style="color: #fde68a; font-family: monospace;"><?= htmlspecialchars($member['member_code']) ?></strong>
        </span>
      </div>
    </div>

    <nav class="topbar-nav">
      <a href="index.php">🌐 Main Website</a>
      <a href="admin.php" style="color: #67e8f9;">🏢 Admin Console</a>
      <a href="ekym.php">📝 eKYM Profile</a>
      <a href="api.php?action=logout" class="btn-logout">🚪 Sign Out</a>
    </nav>
  </header>

  <main class="member-container">
    <?php if (!empty($loanNotice)): ?>
      <div style="background: #dcfce7; border: 1px solid #86efac; color: #166534; padding: 14px 18px; border-radius: 10px; margin-bottom: 22px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        <span>✓</span>
        <div><?= htmlspecialchars($loanNotice) ?></div>
      </div>
    <?php endif; ?>

    <!-- Member Profile Overview -->
    <div class="profile-card">
      <div class="profile-info">
        <h1><?= htmlspecialchars($member['full_name']) ?></h1>
        <p>
          Member Code: <strong style="color: #075c36;"><?= htmlspecialchars($member['member_code']) ?></strong> • 
          Mobile: <strong><?= htmlspecialchars($member['phone']) ?></strong> • 
          Branch: <strong><?= htmlspecialchars($member['branch']) ?></strong> • 
          Member Since: <?= htmlspecialchars($member['joined_date']) ?>
        </p>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="badge-ekym">✓ eKYM Verified Member</span>
        <button type="button" onclick="window.print()" style="padding: 8px 14px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
          🖨️ Print Passbook
        </button>
      </div>
    </div>

    <!-- Account Balances -->
    <div class="balances-grid">
      <div class="balance-card">
        <small>Regular Savings Balance</small>
        <strong>Rs. <?= number_format((float)$member['regular_saving_balance'], 2) ?></strong>
        <span class="balance-sub">Daily balance interest credited quarterly</span>
      </div>

      <div class="balance-card gold">
        <small>Share Capital Account</small>
        <strong>Rs. <?= number_format((float)$member['share_amount'], 2) ?></strong>
        <span class="balance-sub">Cooperative Voting & 18% Dividend Right</span>
      </div>

      <div class="balance-card loan">
        <small>Active Loan Principal Balance</small>
        <strong>Rs. <?= number_format((float)$member['loan_balance'], 2) ?></strong>
        <span class="balance-sub">
          <?= (float)$member['loan_balance'] > 0 ? 'Monthly EMI due on 15th of month' : 'No active loan balance outstanding' ?>
        </span>
      </div>
    </div>

    <!-- NEW SECTION: EMBEDDED LOAN EMI & INTEREST CALCULATOR -->
    <div class="content-box">
      <div class="content-header">
        <h2>
          <span>🧮</span>
          <span>Cooperative Loan Products & Interactive EMI Calculator</span>
        </h2>
        <span style="font-size: 12px; color: #526b5c; font-weight: 600;">
          Calculate your monthly installment before applying
        </span>
      </div>

      <div class="dashboard-calc-container">
        <div class="calc-row">
          <!-- Left: Controls -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px;">
                Select Loan Scheme:
              </label>
              <select id="dashScheme" style="width: 100%; padding: 9px 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 13.5px; font-weight: 600;" onchange="updateDashEmi()">
                <option value="Agricultural Productive Loan" data-rate="12.00" data-max="60">Agricultural Productive Loan (12.00% p.a.)</option>
                <option value="SME & Enterprise Expansion Loan" data-rate="13.50" data-max="84">SME & Enterprise Expansion Loan (13.50% p.a.)</option>
                <option value="Residential Housing & Land Loan" data-rate="13.00" data-max="120">Residential Housing & Land Loan (13.00% p.a.)</option>
                <option value="Higher Educational Loan" data-rate="11.50" data-max="60">Higher Educational Loan (11.50% p.a.)</option>
                <option value="Auto & Commercial Vehicle Loan" data-rate="14.00" data-max="60">Auto & Commercial Vehicle Loan (14.00% p.a.)</option>
                <option value="Social & Personal Welfare Loan" data-rate="13.50" data-max="36">Social & Personal Welfare Loan (13.50% p.a.)</option>
              </select>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
                <span>Principal Amount:</span>
                <span id="dashPDisp" style="color: #075c36; font-family: monospace; font-size: 14px;">Rs. 2,50,000</span>
              </div>
              <input type="range" id="dashPSlider" min="25000" max="3000000" step="25000" value="250000" style="width: 100%; accent-color: #075c36;" oninput="updateDashEmi()">
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
                <span>Repayment Tenure:</span>
                <span id="dashTDisp" style="color: #075c36; font-family: monospace; font-size: 14px;">24 Months (2 Yrs)</span>
              </div>
              <input type="range" id="dashTSlider" min="6" max="60" step="6" value="24" style="width: 100%; accent-color: #075c36;" oninput="updateDashEmi()">
            </div>
          </div>

          <!-- Right: Summary Output & Auto-Fill Action -->
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <small style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Monthly EMI</small>
                <div id="dashEmiVal" style="font-size: 20px; font-weight: 900; color: #075c36; font-family: monospace;">Rs. 11,768</div>
              </div>
              <div>
                <small style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Interest</small>
                <div id="dashIntVal" style="font-size: 16px; font-weight: 800; color: #b45309; font-family: monospace;">Rs. 32,440</div>
              </div>
              <div>
                <small style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Interest Rate</small>
                <div id="dashRateVal" style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace;">12.00% P.A.</div>
              </div>
              <div>
                <small style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Repayment</small>
                <div id="dashTotalVal" style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace;">Rs. 2,82,440</div>
              </div>
            </div>

            <button type="button" onclick="transferToApplicationForm()" style="width: 100%; padding: 10px; background: #eef7f2; border: 1.5px dashed #075c36; color: #075c36; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.15s;">
              ⬇️ Transfer Values to Loan Application Below
            </button>
          </div>
        </div>
      </div>

      <!-- Loan Application Form -->
      <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 12px;">Submit Official Credit Application</h3>
      <form method="POST" id="loanForm">
        <input type="hidden" name="apply_member_loan" value="1">
        
        <div class="form-grid">
          <div class="form-item">
            <label for="apply_loan_scheme">Loan Scheme</label>
            <select name="loan_scheme" id="apply_loan_scheme">
              <option value="Agricultural Productive Loan">Agricultural Productive Loan (12.00%)</option>
              <option value="SME & Enterprise Expansion Loan">SME & Enterprise Expansion Loan (13.50%)</option>
              <option value="Residential Housing & Land Loan">Residential Housing & Land Loan (13.00%)</option>
              <option value="Higher Educational Loan">Higher Educational Loan (11.50%)</option>
              <option value="Auto & Commercial Vehicle Loan">Auto & Commercial Vehicle Loan (14.00%)</option>
              <option value="Social & Personal Welfare Loan">Social & Personal Welfare Loan (13.50%)</option>
            </select>
          </div>

          <div class="form-item">
            <label for="apply_amount">Requested Loan Amount (Rs.)</label>
            <input type="number" name="amount" id="apply_amount" min="10000" step="5000" value="250000" required>
          </div>

          <div class="form-item">
            <label for="apply_tenure">Tenure (Months)</label>
            <select name="tenure_months" id="apply_tenure">
              <option value="12">12 Months (1 Year)</option>
              <option value="24" selected>24 Months (2 Years)</option>
              <option value="36">36 Months (3 Years)</option>
              <option value="48">48 Months (4 Years)</option>
              <option value="60">60 Months (5 Years)</option>
            </select>
          </div>

          <div class="form-item">
            <label for="monthly_income">Verified Monthly Household Income (Rs.)</label>
            <input type="number" name="monthly_income" id="monthly_income" placeholder="e.g. 55000" required>
          </div>
        </div>

        <div class="form-item" style="margin-bottom: 16px;">
          <label for="purpose">Loan Purpose & Productive Utilization Summary</label>
          <textarea name="purpose" id="purpose" rows="2" placeholder="Detail how funds will be invested (e.g. purchasing commercial greenhouse equipment, retail inventory, home remodeling)..." required></textarea>
        </div>

        <button type="submit" class="btn-action">
          <span>Submit Loan Application to Credit Committee ➔</span>
        </button>
      </form>
    </div>

    <!-- Digital Passbook Statement -->
    <div class="content-box">
      <div class="content-header">
        <h2>
          <span>📜</span>
          <span>Digital Passbook & Transaction Statement</span>
        </h2>
        <button type="button" onclick="exportPassbookCsv()" style="padding: 6px 12px; background: #eef7f2; border: 1px solid var(--border); color: var(--primary); font-size: 12px; font-weight: 700; border-radius: 6px; cursor: pointer;">
          📥 Download CSV Statement
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table class="data-table" id="txTable">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Particulars & Narration</th>
              <th>Type</th>
              <th>Amount (Rs.)</th>
              <th>Balance After (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($transactions)): ?>
              <tr>
                <td colspan="5" style="text-align: center; color: #64748b; padding: 24px;">No transactions recorded for this account.</td>
              </tr>
            <?php else: ?>
              <?php foreach ($transactions as $tx): ?>
                <tr>
                  <td style="font-family: monospace; font-size: 12px;"><?= htmlspecialchars($tx['trans_date']) ?></td>
                  <td><strong><?= htmlspecialchars($tx['particulars']) ?></strong></td>
                  <td>
                    <span class="<?= ($tx['type'] === 'Credit' || $tx['type'] === 'CR') ? 'badge-cr' : 'badge-dr' ?>">
                      <?= htmlspecialchars($tx['type']) ?>
                    </span>
                  </td>
                  <td style="font-weight: 800; font-family: monospace;">
                    Rs. <?= number_format((float)$tx['amount'], 2) ?>
                  </td>
                  <td style="color: #075c36; font-weight: 800; font-family: monospace;">
                    Rs. <?= number_format((float)$tx['balance_after'], 2) ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <script>
    // Dashboard EMI Calculator Logic
    function updateDashEmi() {
      const schemeSel = document.getElementById('dashScheme');
      const opt = schemeSel.options[schemeSel.selectedIndex];
      const rate = parseFloat(opt.getAttribute('data-rate')) || 12;
      const maxMonths = parseInt(opt.getAttribute('data-max'), 10) || 60;

      const pSlider = document.getElementById('dashPSlider');
      const tSlider = document.getElementById('dashTSlider');
      tSlider.max = maxMonths;

      const p = parseFloat(pSlider.value) || 0;
      const n = parseInt(tSlider.value, 10) || 1;

      document.getElementById('dashPDisp').textContent = 'Rs. ' + p.toLocaleString();
      document.getElementById('dashTDisp').textContent = n + ' Months (' + (n / 12).toFixed(1) + ' Yrs)';
      document.getElementById('dashRateVal').textContent = rate.toFixed(2) + '% P.A.';

      const monthlyRate = (rate / 12) / 100;
      let emi = 0;
      if (monthlyRate > 0) {
        emi = Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
      } else {
        emi = Math.round(p / n);
      }

      const total = emi * n;
      const interest = Math.max(0, total - p);

      document.getElementById('dashEmiVal').textContent = 'Rs. ' + emi.toLocaleString();
      document.getElementById('dashIntVal').textContent = 'Rs. ' + interest.toLocaleString();
      document.getElementById('dashTotalVal').textContent = 'Rs. ' + total.toLocaleString();
    }

    function transferToApplicationForm() {
      const schemeName = document.getElementById('dashScheme').value;
      const p = document.getElementById('dashPSlider').value;
      const n = document.getElementById('dashTSlider').value;

      document.getElementById('apply_loan_scheme').value = schemeName;
      document.getElementById('apply_amount').value = p;
      document.getElementById('apply_tenure').value = n;

      const formEl = document.getElementById('loanForm');
      formEl.scrollIntoView({ behavior: 'smooth' });
      formEl.style.outline = '2px solid #075c36';
      setTimeout(() => { formEl.style.outline = 'none'; }, 1500);
    }

    function exportPassbookCsv() {
      const rows = document.querySelectorAll('#txTable tr');
      let csvContent = 'data:text/csv;charset=utf-8,';
      rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(c => {
          rowData.push('"' + c.innerText.replace(/"/g, '""').trim() + '"');
        });
        csvContent += rowData.join(',') + '\r\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'Ekata_Passbook_Statement.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Auto-fill from sessionStorage if user came from pre-login calculator
    document.addEventListener('DOMContentLoaded', () => {
      updateDashEmi();

      const savedScheme = sessionStorage.getItem('ekata_loan_scheme');
      const savedAmount = sessionStorage.getItem('ekata_loan_amount');
      const savedTenure = sessionStorage.getItem('ekata_loan_tenure');

      if (savedScheme && savedAmount) {
        document.getElementById('apply_loan_scheme').value = savedScheme;
        document.getElementById('apply_amount').value = savedAmount;
        if (savedTenure) document.getElementById('apply_tenure').value = savedTenure;

        // Clear after filling
        sessionStorage.removeItem('ekata_loan_scheme');
        sessionStorage.removeItem('ekata_loan_amount');
        sessionStorage.removeItem('ekata_loan_tenure');
      }
    });
  </script>
</body>
</html>
