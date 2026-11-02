<?php
/**
 * Ekata Saving & Credit Cooperative Ltd.
 * Electronic Know Your Member (eKYM) Digital Portal (PHP Standalone)
 * File: php-version/ekym.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

$db = Database::getConnection();
$submissionSuccess = false;
$appNumber = '';
$errorMessage = '';

$reqMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($reqMethod === 'POST') {
    try {
        $nameEn = sanitizeInput($_POST['full_name_en'] ?? '');
        $nameNp = sanitizeInput($_POST['full_name_np'] ?? '');
        $father = sanitizeInput($_POST['father_name'] ?? '');
        $gfather = sanitizeInput($_POST['grandfather_name'] ?? '');
        $mother = sanitizeInput($_POST['mother_name'] ?? '');
        $spouse = sanitizeInput($_POST['spouse_name'] ?? '');
        $dob = sanitizeInput($_POST['dob'] ?? '');
        $gender = sanitizeInput($_POST['gender'] ?? '');
        $citNo = sanitizeInput($_POST['citizenship_no'] ?? '');
        $citDist = sanitizeInput($_POST['citizenship_district'] ?? '');
        $phone = sanitizeInput($_POST['phone'] ?? '');
        $email = sanitizeInput($_POST['email'] ?? '');
        $permAddr = sanitizeInput($_POST['permanent_address'] ?? '');
        $currAddr = sanitizeInput($_POST['current_address'] ?? '');
        $occ = sanitizeInput($_POST['occupation'] ?? '');
        $income = sanitizeInput($_POST['annual_income'] ?? '');
        $bankName = sanitizeInput($_POST['bank_name'] ?? '');
        $bankAcc = sanitizeInput($_POST['bank_account_no'] ?? '');
        $nomineeName = sanitizeInput($_POST['nominee_name'] ?? '');
        $nomineeRel = sanitizeInput($_POST['nominee_relation'] ?? '');
        $nomineeCit = sanitizeInput($_POST['nominee_citizenship'] ?? '');

        if (empty($nameEn) || empty($phone) || empty($citNo) || empty($citDist) || empty($dob) || empty($father) || empty($gfather)) {
            throw new Exception("Please fill in all mandatory fields marked with an asterisk (*).");
        }

        $appNumber = 'EKT-KYC-' . date('Y') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));

        $stmt = $db->prepare("INSERT INTO ekym_submissions (
            application_no, full_name_en, full_name_np, father_name, grandfather_name,
            mother_name, spouse_name, dob, gender, citizenship_no, citizenship_district,
            phone, email, permanent_address, current_address, occupation, annual_income,
            bank_name, bank_account_no, nominee_name, nominee_relation, nominee_citizenship,
            status, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Submitted online via eKYM portal')");

        $stmt->execute([
            $appNumber, $nameEn, $nameNp, $father, $gfather,
            $mother, $spouse, $dob, $gender, $citNo, $citDist,
            $phone, $email, $permAddr, $currAddr, $occ, $income,
            $bankName, $bankAcc, $nomineeName, $nomineeRel, $nomineeCit
        ]);

        $submissionSuccess = true;

    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>eKYM Digital Membership Portal - Ekata Cooperative</title>
  <link rel="stylesheet" href="style.css">
  <style>
    body {
      background: #f4f8f5;
      color: #173d29;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
    }
    .top-nav {
      background: #087a45;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    .top-nav a {
      color: #dcfce7;
      text-decoration: none;
      margin-left: 14px;
      font-weight: 600;
      font-size: 13px;
    }
    .ekym-container {
      max-width: 900px;
      margin: 28px auto;
      padding: 0 16px;
    }
    .ekym-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #cfe3d7;
      padding: 32px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }
    .header-banner {
      border-bottom: 2px solid #cfe3d7;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .header-banner h1 {
      margin: 0 0 6px 0;
      font-size: 24px;
      color: #087a45;
    }
    .header-banner p {
      margin: 0;
      color: #526b5c;
      font-size: 14px;
    }
    .form-section-title {
      font-size: 15px;
      font-weight: 700;
      color: #087a45;
      background: #eef7f2;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 24px 0 16px 0;
      border-left: 4px solid #087a45;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .form-group {
      margin-bottom: 14px;
    }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #173d29;
    }
    .req {
      color: #dc2626;
      font-weight: 700;
      margin-left: 2px;
    }
    .info-notice {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #166534;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 9px 12px;
      border: 1px solid #c4d7cc;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: #087a45;
      box-shadow: 0 0 0 3px rgba(8,122,69,0.15);
    }
    .btn-submit {
      background: #087a45;
      color: #fff;
      padding: 12px 28px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      margin-top: 16px;
    }
    .success-box {
      background: #dcfce7;
      border: 2px solid #86efac;
      padding: 24px;
      border-radius: 12px;
      color: #166534;
      text-align: center;
    }
    .error-box {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      padding: 12px;
      border-radius: 6px;
      color: #991b1b;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>

  <div class="top-nav">
    <div>
      ✦ <strong>Ekata Cooperative eKYM Portal</strong> (इलेक्ट्रोनिक ग्राहक पहिचान फाराम)
    </div>
    <div>
      <a href="index.php">🌐 Home Page</a>
      <a href="member.php">👤 Member Login</a>
      <a href="admin.php">🏢 Admin Console</a>
    </div>
  </div>

  <div class="ekym-container">
    <div class="ekym-card">
      <div class="header-banner">
        <h1>एकता बचत तथा ऋण सहकारी संस्था लि.</h1>
        <p>Electronic Know Your Member (eKYM) Digital Self-Registration & Verification Portal</p>
        <small style="color:#526b5c;">As per Nepal Cooperative Act 2074 & Department of Cooperatives KYC Compliance Directives</small>
      </div>

      <?php if ($submissionSuccess): ?>
        <div class="success-box">
          <h2 style="margin-top:0; color:#166534;">🎉 eKYM Application Submitted Successfully!</h2>
          <p>Your electronic KYC profile has been saved to the Ekata Cooperative Central Database.</p>
          <div style="background:#fff; border:1px dashed #087a45; display:inline-block; padding:12px 24px; border-radius:8px; margin:16px 0;">
            <small style="color:#666; display:block;">Official Application Reference Code:</small>
            <strong style="font-size:22px; color:#087a45;"><?= htmlspecialchars($appNumber) ?></strong>
          </div>
          <p style="font-size:13px; color:#526b5c;">An SMS acknowledgment has been registered. The administration team will review your details within 24 business hours.</p>
          <div style="margin-top:16px;">
            <a href="index.php" style="background:#087a45; color:#fff; text-decoration:none; padding:10px 20px; border-radius:6px; font-weight:600; display:inline-block;">Return to Home</a>
            <a href="admin.php" style="background:#fff; color:#087a45; border:1px solid #087a45; text-decoration:none; padding:10px 20px; border-radius:6px; font-weight:600; display:inline-block; margin-left:10px;">Review in Admin</a>
          </div>
        </div>
      <?php else: ?>

        <?php if (!empty($errorMessage)): ?>
          <div class="error-box">⚠️ <?= htmlspecialchars($errorMessage) ?></div>
        <?php endif; ?>

        <div class="info-notice">
          ℹ️ <strong>अनिवार्य जानकारी:</strong> कृपया नागरिकताको प्रमाणपत्र अनुसार सही विवरण प्रविष्ट गर्नुहोस्। रातो तारा (<span class="req">*</span>) लगाइएका सम्पूर्ण विवरणहरू भर्न अनिवार्य छ। (Fields marked with <span class="req">*</span> are required).
        </div>

        <form method="POST" autocomplete="off">
          
          <!-- 1. Personal Details -->
          <div class="form-section-title">१. व्यक्तिगत विवरण (Personal Identification Details)</div>
          <div class="grid-2">
            <div class="form-group">
              <label>Full Name in English <span class="req">*</span></label>
              <input type="text" name="full_name_en" placeholder="Full Name (as per Citizenship)" required value="<?= htmlspecialchars($_POST['full_name_en'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>नाम (नेपालीमा) <span class="req">*</span></label>
              <input type="text" name="full_name_np" placeholder="नागरिकता अनुसारको पूरा नाम" required value="<?= htmlspecialchars($_POST['full_name_np'] ?? '') ?>">
            </div>
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label>Date of Birth (B.S.) / जन्ममिति <span class="req">*</span></label>
              <input type="text" name="dob" placeholder="YYYY-MM-DD" required value="<?= htmlspecialchars($_POST['dob'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Gender / लिङ्ग <span class="req">*</span></label>
              <select name="gender" required>
                <option value="" disabled <?= empty($_POST['gender']) ? 'selected' : '' ?>>-- Select Gender / लिङ्ग --</option>
                <option value="Male" <?= ($_POST['gender'] ?? '') === 'Male' ? 'selected' : '' ?>>Male (पुरुष)</option>
                <option value="Female" <?= ($_POST['gender'] ?? '') === 'Female' ? 'selected' : '' ?>>Female (महिला)</option>
                <option value="Other" <?= ($_POST['gender'] ?? '') === 'Other' ? 'selected' : '' ?>>Other (अन्य)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Mobile Contact Number <span class="req">*</span></label>
              <input type="tel" name="phone" placeholder="98XXXXXXXX" required value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
            </div>
          </div>

          <div class="grid-3">
            <div class="form-group">
              <label>Citizenship Number (नागरिकता नं.) <span class="req">*</span></label>
              <input type="text" name="citizenship_no" placeholder="नागरिकता प्रमाणपत्र नं." required value="<?= htmlspecialchars($_POST['citizenship_no'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Issue District (जारी जिल्ला) <span class="req">*</span></label>
              <input type="text" name="citizenship_district" list="nepalDistricts" placeholder="Select or type issue district" required value="<?= htmlspecialchars($_POST['citizenship_district'] ?? '') ?>">
              <datalist id="nepalDistricts">
                <option value="Rupandehi">
                <option value="Kapilvastu">
                <option value="Nawalparasi (Bardaghat Susta West)">
                <option value="Nawalparasi (Bardaghat Susta East)">
                <option value="Palpa">
                <option value="Gulmi">
                <option value="Arghakhanchi">
                <option value="Dang">
                <option value="Banke">
                <option value="Bardiya">
                <option value="Pyuthan">
                <option value="Rolpa">
                <option value="Kathmandu">
                <option value="Lalitpur">
                <option value="Bhaktapur">
                <option value="Kaski">
                <option value="Chitwan">
                <option value="Tanahun">
                <option value="Syangja">
                <option value="Gorkha">
                <option value="Morang">
                <option value="Jhapa">
                <option value="Sunsari">
                <option value="Makwanpur">
                <option value="Kavrepalanchok">
                <option value="Sindhupalchok">
                <option value="Dhanusha">
                <option value="Parsa">
                <option value="Bara">
                <option value="Rautahat">
                <option value="Sarlahi">
                <option value="Siraha">
                <option value="Saptari">
                <option value="Surkhet">
                <option value="Kailali">
                <option value="Kanchanpur">
              </datalist>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="example@gmail.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
            </div>
          </div>

          <!-- 2. Family Details -->
          <div class="form-section-title">२. पारिवारिक विवरण (Family Background)</div>
          <div class="grid-2">
            <div class="form-group">
              <label>Grandfather's Full Name (बाजेको नाम) <span class="req">*</span></label>
              <input type="text" name="grandfather_name" placeholder="बाजेको पूरा नाम" required value="<?= htmlspecialchars($_POST['grandfather_name'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Father's Full Name (बुवाको नाम) <span class="req">*</span></label>
              <input type="text" name="father_name" placeholder="बुवाको पूरा नाम" required value="<?= htmlspecialchars($_POST['father_name'] ?? '') ?>">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Mother's Full Name (आमाको नाम)</label>
              <input type="text" name="mother_name" placeholder="आमाको पूरा नाम" value="<?= htmlspecialchars($_POST['mother_name'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Spouse's Full Name (पति/पत्नीको नाम)</label>
              <input type="text" name="spouse_name" placeholder="पति वा पत्नीको पूरा नाम (यदि भएमा)" value="<?= htmlspecialchars($_POST['spouse_name'] ?? '') ?>">
            </div>
          </div>

          <!-- 3. Address -->
          <div class="form-section-title">३. ठेगाना विवरण (Address Details)</div>
          <div class="grid-2">
            <div class="form-group">
              <label>Permanent Address (स्थायी ठेगाना) <span class="req">*</span></label>
              <input type="text" name="permanent_address" placeholder="प्रदेश, जिल्ला, पालिका, वडा नं." required value="<?= htmlspecialchars($_POST['permanent_address'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Current / Temporary Address (हालको ठेगाना) <span class="req">*</span></label>
              <input type="text" name="current_address" placeholder="टोल / चोक, शहर, हालको ठेगाना" required value="<?= htmlspecialchars($_POST['current_address'] ?? '') ?>">
            </div>
          </div>

          <!-- 4. Professional & Banking -->
          <div class="form-section-title">४. पेसा तथा बैंकिङ विवरण (Occupation & Bank Account)</div>
          <div class="grid-2">
            <div class="form-group">
              <label>Occupation / पेसा <span class="req">*</span></label>
              <input type="text" name="occupation" placeholder="उदा. कृषि, व्यापार, सेवा, उद्योग" required value="<?= htmlspecialchars($_POST['occupation'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Estimated Annual Income (वार्षिक आम्दानी)</label>
              <input type="text" name="annual_income" placeholder="उदा. रु. ५,००,०००" value="<?= htmlspecialchars($_POST['annual_income'] ?? '') ?>">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Commercial Bank Name <span class="req">*</span></label>
              <input type="text" name="bank_name" placeholder="उदा. ग्लोबल आइएमई बैंक लि. / नबिल बैंक" required value="<?= htmlspecialchars($_POST['bank_name'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Bank Account Number <span class="req">*</span></label>
              <input type="text" name="bank_account_no" placeholder="बैंक खाता नम्बर" required value="<?= htmlspecialchars($_POST['bank_account_no'] ?? '') ?>">
            </div>
          </div>

          <!-- 5. Nominee Details -->
          <div class="form-section-title">५. इच्छाएको व्यक्ति (Nominee Information)</div>
          <div class="grid-3">
            <div class="form-group">
              <label>Nominee Name (इच्छाएको व्यक्तिको नाम) <span class="req">*</span></label>
              <input type="text" name="nominee_name" placeholder="इच्छाएको व्यक्तिको पूरा नाम" required value="<?= htmlspecialchars($_POST['nominee_name'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Relation (नाता) <span class="req">*</span></label>
              <input type="text" name="nominee_relation" placeholder="उदा. पति/पत्नी, छोरा, छोरी, आमा" required value="<?= htmlspecialchars($_POST['nominee_relation'] ?? '') ?>">
            </div>
            <div class="form-group">
              <label>Nominee Citizenship No.</label>
              <input type="text" name="nominee_citizenship" placeholder="नागरिकता नं. (यदि उपलब्ध भएमा)" value="<?= htmlspecialchars($_POST['nominee_citizenship'] ?? '') ?>">
            </div>
          </div>

          <!-- Declaration -->
          <div style="margin-top:20px; font-size:12px; color:#526b5c; background:#f9fcfa; border:1px solid #cfe3d7; padding:12px; border-radius:6px;">
            <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer;">
              <input type="checkbox" required checked style="width:auto; margin-top:3px;">
              <span>I hereby certify that all information submitted in this eKYM portal is authentic, accurate, and valid under the laws of Nepal. I authorize Ekata Saving & Credit Cooperative Ltd. to verify these credentials. (म प्रमाणित गर्दछु कि माथि उल्लिखित सम्पूर्ण विवरण सत्य र तथ्यपरक छन्।)</span>
            </label>
          </div>

          <button type="submit" class="btn-submit">🔒 सुरक्षित ई-केवाइएम प्रमाणीकरण पेश गर्नुहोस् (Submit Digital eKYM)</button>
        </form>
      <?php endif; ?>

    </div>
  </div>

</body>
</html>
