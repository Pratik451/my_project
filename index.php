<?php
/**
 * Ekata Saving & Credit Cooperative Ltd. (एकता बचत तथा ऋण सहकारी संस्था लि.)
 * File: php-version/index.php
 * Production Full-Stack PHP Web Portal with Database Integration
 * Compatible with Apache, Nginx, cPanel, XAMPP, and LAMP stacks
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Initialize DB connection
$db = Database::getConnection();

// Fetch dynamic interest rates from database
$ratesStmt = $db->query("SELECT * FROM interest_rates ORDER BY id ASC");
$dbRates = $ratesStmt->fetchAll();

// Fetch latest notices from database
$noticesStmt = $db->query("SELECT * FROM notices WHERE is_active = 1 ORDER BY id DESC");
$dbNotices = $noticesStmt->fetchAll();

// Fetch institutional count & CMS settings
$memberCountStmt = $db->query("SELECT COUNT(*) as cnt FROM members");
$totalVerifiedMembers = $memberCountStmt->fetch()['cnt'] ?? 15420;

// Fetch Dynamic CMS Site Settings
$cmsSettings = Database::getAllSettings();
$coopNameEn = $cmsSettings['coop_name_en'] ?? APP_NAME_EN;
$coopNameNp = $cmsSettings['coop_name_np'] ?? APP_NAME_NP;
$taglineEn = $cmsSettings['tagline_en'] ?? ("Butwal-4, Rupandehi • Regd. No: " . APP_REGD_NO . " • Established " . APP_ESTABLISHED_BS . " B.S.");
$taglineNp = $cmsSettings['tagline_np'] ?? ("बुटवल-४, रुपन्देही • दर्ता नं: " . APP_REGD_NO . " • स्थापना: " . APP_ESTABLISHED_BS . " वि.सं.");
$tickerTextEn = $cmsSettings['ticker_text_en'] ?? 'Welcome to Ekata Saving & Credit Cooperative Ltd. | Member eKYM Digital Update active | High-Yield Term Deposits up to 11.75%';
$tickerTextNp = $cmsSettings['ticker_text_np'] ?? 'एकता बचत तथा ऋण सहकारी संस्था लि. मा हार्दिक स्वागत गर्दछौं। | अनलाइन eKYM अध्यावधिक सुरु | ११.७५% सम्म मुद्दती निक्षेप प्रतिफल';
$tickerActive = ($cmsSettings['ticker_active'] ?? '1') === '1';
$helpline = $cmsSettings['phone_tollfree'] ?? "1660-01-99887";
$headOfficePhone = $cmsSettings['phone_headoffice'] ?? "071-540123 / 540456";
$email = $cmsSettings['email_official'] ?? "info@ekatacoop.com.np";
$addressHeadoffice = $cmsSettings['address_headoffice'] ?? "Main Road, Butwal-4, Rupandehi, Nepal";
$officeHours = $cmsSettings['office_hours'] ?? "Sunday - Friday: 10:00 AM - 5:00 PM";
$statMembers = $cmsSettings['stat_members'] ?? "15,420+";
$statSavings = $cmsSettings['stat_savings'] ?? "Rs. 1.28 Arba";
$statLoans = $cmsSettings['stat_loans'] ?? "Rs. 98.40 Crore";
$statCapital = $cmsSettings['stat_capital'] ?? "Rs. 24.50 Crore";
$statBranches = $cmsSettings['stat_branches'] ?? "";

// Fetch Dynamic CMS Services
$dbServicesStmt = $db->query("SELECT * FROM services_cms ORDER BY id ASC");
$cmsServicesList = $dbServicesStmt->fetchAll();
if (!empty($cmsServicesList)) {
    $services = [];
    foreach ($cmsServicesList as $row) {
        $services[] = [
            'id' => $row['slug'],
            'titleEn' => $row['title_en'],
            'titleNp' => $row['title_np'],
            'descEn' => $row['description_en'],
            'descNp' => $row['description_np'],
            'icon' => $row['icon'],
            'badge' => $row['badge'] ?? 'Featured'
        ];
    }
} else {
    // 6 Core Services Fallback
    $services = [
        [
            'id' => 'member-service',
            'titleEn' => 'Member Service',
            'titleNp' => 'सदस्य सेवा',
            'descEn' => 'Share membership, regular financial counseling, welfare relief fund, and assembly voting rights.',
            'descNp' => 'सेयर सदस्यता, नियमित वित्तीय परामर्श, सदस्य सुरक्षा कोष तथा साधारण सभा मतदान अधिकार।',
            'icon' => '👥',
            'badge' => 'Core Member'
        ],
        [
            'id' => 'deposit-product',
            'titleEn' => 'Deposit Product',
            'titleNp' => 'बचत योजना',
            'descEn' => 'High-yield recurring, daily, child future, and fixed term deposits yielding up to 11.75% per annum.',
            'descNp' => 'दैनिक बचत, बाल उज्ज्वल बचत, नारी बचत तथा ११.७५% सम्म आकर्षक ब्याज प्राप्त हुने मुद्दती निक्षेप।',
            'icon' => '🪙',
            'badge' => 'Up to 11.75%'
        ],
        [
            'id' => 'loan',
            'titleEn' => 'Loan',
            'titleNp' => 'कर्जा सेवा',
            'descEn' => 'Productive agricultural loans, small business expansion credit, housing, and social enterprise finance.',
            'descNp' => 'व्यावसायिक कृषि, पशुपालन, साना तथा मझौला व्यापार, आवास निर्माण तथा सुलभ व्यक्तिगत कर्जा।',
            'icon' => '💼',
            'badge' => 'From 12.00%'
        ],
        [
            'id' => 'remittance',
            'titleEn' => 'Remittance',
            'titleNp' => 'रेमिट्यान्स सेवा',
            'descEn' => 'Domestic and international money transfer payout via Prabhu, IME, Western Union, and Global Remit.',
            'descNp' => 'विश्वका सबै देशहरूबाट पठाएको रकम प्रभु, आइएमई तथा वेस्टर्न युनियनमार्फत तत्काल काउन्टर भुक्तानी।',
            'icon' => '↗',
            'badge' => 'Instant Payout'
        ],
        [
            'id' => 'insurance',
            'titleEn' => 'Insurance',
            'titleNp' => 'सुरक्षण तथा बीमा',
            'descEn' => 'Member health & accident safety micro-insurance, livestock/crop safety, and loan risk protection.',
            'descNp' => 'सदस्य दुर्घटना तथा स्वास्थ्य सुरक्षा, पशुधन तथा बाली बिमा र कर्जा सुरक्षण सुविधा।',
            'icon' => '🛡️',
            'badge' => 'Safety Cover'
        ],
        [
            'id' => 'digital-services',
            'titleEn' => 'Digital Services',
            'titleNp' => 'डिजिटल सेवाहरू',
            'descEn' => 'Ekata Smart Mobile Banking app, instant NepalPay QR merchant payments, utility bills, and bank transfers.',
            'descNp' => 'एकता स्मार्ट मोबाइल बैंकिङ, नेपालपे क्युआर भुक्तानी, मोबाइल टप-अप तथा बिजुली/खानेपानी महसुल भुक्तानी।',
            'icon' => '📱',
            'badge' => '24/7 Digital'
        ]
    ];
}

// Reports List
$reportItems = [
    [
        'id' => 'reports-monthly',
        'titleEn' => 'Monthly Report',
        'titleNp' => 'मासिक प्रतिवेदन',
        'subEn' => 'Monthly deposits, liquidity & loan recovery statement',
        'subNp' => 'मासिक बचत, तरलता तथा कर्जा असुलीको प्रगति सारांश',
        'icon' => '📅'
    ],
    [
        'id' => 'reports-progress',
        'titleEn' => 'Progress Report',
        'titleNp' => 'प्रगति प्रतिवेदन',
        'subEn' => 'Quarterly institutional indicators & member growth',
        'subNp' => 'त्रैमासिक संस्थागत सूचकाङ्क तथा सदस्य संख्या वृद्धि',
        'icon' => '📈'
    ],
    [
        'id' => 'reports-annual',
        'titleEn' => 'Annual Report',
        'titleNp' => 'वार्षिक प्रतिवेदन',
        'subEn' => '24th Annual General Meeting official report book',
        'subNp' => '२४औं वार्षिक साधारण सभाको आधिकारिक संस्थागत प्रतिवेदन',
        'icon' => '📑'
    ],
    [
        'id' => 'reports-audit',
        'titleEn' => 'Audit Report',
        'titleNp' => 'लेखापरीक्षण प्रतिवेदन',
        'subEn' => 'Statutory audit financial statements & balance sheet',
        'subNp' => 'आधिकारिक लेखापरीक्षकबाट प्रमाणित वित्तीय विवरण तथा वासलात',
        'icon' => '⚖'
    ]
];

// Career List
$careerItems = [
    [
        'id' => 'career-vacancies',
        'titleEn' => 'Opening Vacancies',
        'titleNp' => 'खुला पदपूर्ति विज्ञापन',
        'subEn' => 'Explore active job vacancies in cooperative',
        'subNp' => 'खुलेका जागिरका अवसरहरू तथा विज्ञापन विवरण',
        'icon' => '📢'
    ],
    [
        'id' => 'career-requirements',
        'titleEn' => 'Eligibility & Criteria',
        'titleNp' => 'योग्यता तथा अनुभव',
        'subEn' => 'Qualification, age limit & skill metrics',
        'subNp' => 'शैक्षिक योग्यता, उमेरको हद तथा आवश्यक अनुभव',
        'icon' => '📋'
    ],
    [
        'id' => 'career-process',
        'titleEn' => 'Application Process',
        'titleNp' => 'दरखास्त प्रक्रिया',
        'subEn' => 'Form download, submission email & deadline',
        'subNp' => 'फाराम डाउनलोड, बुझाउने तरिका र अन्तिम मिति',
        'icon' => '✉'
    ]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo htmlspecialchars($coopNameEn); ?> | <?php echo htmlspecialchars($coopNameNp); ?></title>
  <meta name="description" content="Official Portal of Ekata Saving & Credit Cooperative Ltd., Butwal-4 Rupandehi. Delivering trusted community cooperative banking, deposits, productive loans, remittance and digital banking.">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- ================= CONSTANT FIXED HEADER WRAPPER ================= -->
  <div class="fixed-header-wrapper">
    <!-- ================= TOPBAR ================= -->
    <div class="topbar">
      <div class="container topbar-content">
        <?php if ($tickerActive): ?>
        <div class="ticker-wrap">
          <span class="ticker-badge">NOTICES</span>
          <span class="ticker-text" data-lang-en="✦ <?php echo htmlspecialchars($tickerTextEn); ?> • Toll-Free: <?php echo htmlspecialchars($helpline); ?> ✦" data-lang-np="✦ <?php echo htmlspecialchars($tickerTextNp); ?> • टोल-फ्री: <?php echo htmlspecialchars($helpline); ?> ✦">
            ✦ <?php echo htmlspecialchars($tickerTextNp); ?> • टोल-फ्री: <?php echo htmlspecialchars($helpline); ?> ✦
          </span>
        </div>
        <?php endif; ?>
        <div class="topbar-links">
          <a href="#calculator-section">🧮 <span data-lang-en="EMI Calculator" data-lang-np="ईएमआई क्याल्कुलेटर">EMI Calculator</span></a>
          <a href="#date-converter">📅 <span data-lang-en="Date Converter (BS ↔ AD)" data-lang-np="मिति रूपान्तरण (BS ↔ AD)">Date Converter (BS ↔ AD)</span></a>
          <a href="#exchange-rates">💱 <span data-lang-en="Exchange Rates" data-lang-np="विनिमय दर">Exchange Rates</span></a>
          <a href="ekym.php" style="color:#10b981; font-weight:600;">📝 <span data-lang-en="Online eKYM" data-lang-np="अनलाइन eKYM">Online eKYM</span></a>
          <button id="langSwitchBtn" class="lang-btn" type="button" title="Switch Language">नेपाली</button>
        </div>
      </div>
    </div>

    <!-- ================= BRAND HEADER & CONSTANT FIXED NAVBAR ================= -->
    <header class="main-header">
      <div class="container header-brand-row">
        <div class="brand-wrapper">
          <div class="coop-emblem" style="background:#fff; border-radius:12px; padding:3px; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
            <img src="/assets/images/ekata-logo.svg" alt="Ekata Logo" style="height:44px; width:auto; object-fit:contain;" onerror="this.src='../assets/images/ekata-logo.svg'">
          </div>
          <div class="brand-info">
            <h1 data-lang-en="<?php echo htmlspecialchars($coopNameEn); ?>" data-lang-np="<?php echo htmlspecialchars($coopNameNp); ?>">
              <?php echo htmlspecialchars($coopNameEn); ?>
            </h1>
            <p data-lang-en="<?php echo htmlspecialchars($taglineEn); ?>" data-lang-np="<?php echo htmlspecialchars($taglineNp); ?>">
              <?php echo htmlspecialchars($taglineEn); ?>
            </p>
            <span class="brand-meta-badge">Certified A-Grade Cooperative • Rupandehi</span>
          </div>
        </div>

        <!-- Right side info & since badge (NO EN/Nepali toggle button here) -->
        <div class="header-actions">
          <div class="header-info-badge hidden-mobile">
            <span class="info-icon">📍</span>
            <div>
              <strong data-lang-en="<?php echo htmlspecialchars($addressHeadoffice); ?>" data-lang-np="बुटवल-४, रुपन्देही"><?php echo htmlspecialchars($addressHeadoffice); ?></strong>
              <small>☎ <?php echo htmlspecialchars($headOfficePhone); ?></small>
            </div>
          </div>

          <!-- Official Since 2057 Badge (Dynamic translation with language toggle) -->
          <div class="since-badge" id="headerSinceBadge" aria-label="Established 2057 B.S.">
            <small id="sinceLabel" data-lang-en="SINCE" data-lang-np="स्थापना">SINCE</small>
            <b id="sinceYear" data-lang-en="2057" data-lang-np="२०५७">2057</b>
          </div>

          <div class="helpline-box">
            <div class="icon">📞</div>
            <div>
              <div class="label" data-lang-en="Toll-Free Helpline" data-lang-np="टोल-फ्री हटलाइन">Toll-Free Helpline</div>
              <div class="number"><?php echo $helpline; ?></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= NAVBAR WITH EXACT REQUESTED MENUS ================= -->
      <nav class="navbar-strip">
        <div class="container navbar-container">
          <ul class="nav-menu">
            <li class="nav-item">
              <a href="#" class="nav-link">
                🏠 <span data-lang-en="Home" data-lang-np="गृहपृष्ठ">Home</span>
              </a>
            </li>

            <!-- 6 CORE SERVICES DROPDOWN -->
            <li class="nav-item">
              <button type="button" class="nav-link">
                ✦ <span data-lang-en="Services" data-lang-np="सेवाहरू">Services</span>
                <span class="dropdown-caret">▼</span>
              </button>
              <div class="dropdown-menu">
                <?php foreach ($services as $srv): ?>
                <div class="dropdown-item" data-modal-target="<?php echo $srv['id']; ?>">
                  <div class="icon"><?php echo $srv['icon']; ?></div>
                  <div>
                    <div class="text-title" data-lang-en="<?php echo $srv['titleEn']; ?>" data-lang-np="<?php echo $srv['titleNp']; ?>">
                      <?php echo $srv['titleEn']; ?>
                    </div>
                    <div class="text-desc" data-lang-en="<?php echo $srv['badge']; ?>" data-lang-np="<?php echo $srv['titleNp']; ?>">
                      <?php echo $srv['descEn']; ?>
                    </div>
                  </div>
                </div>
                <?php endforeach; ?>
              </div>
            </li>

            <!-- INTEREST RATES -->
            <li class="nav-item">
              <a href="#rates-section" class="nav-link">
                ⌁ <span data-lang-en="Interest Rates" data-lang-np="ब्याज दर">Interest Rates</span>
              </a>
            </li>

            <!-- REPORTS (MONTHLY, PROGRESS, ANNUAL, AUDIT) -->
            <li class="nav-item">
              <button type="button" class="nav-link">
                📑 <span data-lang-en="Reports" data-lang-np="प्रतिवेदन">Reports</span>
                <span class="dropdown-caret">▼</span>
              </button>
              <div class="dropdown-menu">
                <?php foreach ($reportItems as $rep): ?>
                <div class="dropdown-item" data-modal-target="<?php echo $rep['id']; ?>">
                  <div class="icon"><?php echo $rep['icon']; ?></div>
                  <div>
                    <div class="text-title" data-lang-en="<?php echo $rep['titleEn']; ?>" data-lang-np="<?php echo $rep['titleNp']; ?>">
                      <?php echo $rep['titleEn']; ?>
                    </div>
                    <div class="text-desc" data-lang-en="<?php echo $rep['subEn']; ?>" data-lang-np="<?php echo $rep['subNp']; ?>">
                      <?php echo $rep['subEn']; ?>
                    </div>
                  </div>
                </div>
                <?php endforeach; ?>
              </div>
            </li>

            <!-- CAREER (OPENING VACANCIES, ELIGIBILITY, APPLICATION PROCESS) -->
            <li class="nav-item">
              <button type="button" class="nav-link">
                💼 <span data-lang-en="Career" data-lang-np="करियर">Career</span>
                <span class="dropdown-caret">▼</span>
              </button>
              <div class="dropdown-menu">
                <?php foreach ($careerItems as $car): ?>
                <div class="dropdown-item" data-modal-target="<?php echo $car['id']; ?>">
                  <div class="icon"><?php echo $car['icon']; ?></div>
                  <div>
                    <div class="text-title" data-lang-en="<?php echo $car['titleEn']; ?>" data-lang-np="<?php echo $car['titleNp']; ?>">
                      <?php echo $car['titleEn']; ?>
                    </div>
                    <div class="text-desc" data-lang-en="<?php echo $car['subEn']; ?>" data-lang-np="<?php echo $car['subNp']; ?>">
                      <?php echo $car['subEn']; ?>
                    </div>
                  </div>
                </div>
                <?php endforeach; ?>
              </div>
            </li>

            <!-- CONTACT -->
            <li class="nav-item">
              <a href="#contact" class="nav-link" data-modal-target="contact-info">
                ✉ <span data-lang-en="Contact" data-lang-np="सम्पर्क">Contact</span>
              </a>
            </li>
          </ul>

          <!-- Action Buttons: Login Dropdown and Become Member -->
          <div class="nav-right-actions">
            <!-- LOGIN BUTTON WITH CLEAN DROPDOWN (NO SECURE PORTAL ACCESS HEADER BOX) -->
            <div class="login-dropdown-wrapper">
              <button class="nav-login-btn" id="loginDropdownBtn" type="button" aria-haspopup="true" aria-expanded="false">
                <span>🔐</span>
                <span data-lang-en="Login" data-lang-np="लगइन">Login</span>
                <span class="caret">▼</span>
              </button>
              
              <!-- CLEAN LOGIN MENU: DIRECT CHOICES ONLY (Member Login and Office/Admin Login) -->
              <div class="login-dropdown-panel" id="loginDropdownMenu" role="menu">
                <!-- Member Login Option -->
                <button type="button" class="login-choice-row" data-open-login="member">
                  <div class="choice-icon member">👤</div>
                  <div class="choice-text">
                    <strong data-lang-en="Member Login" data-lang-np="सदस्य लगइन">Member Login</strong>
                    <small data-lang-en="Savings, passbook & member portal" data-lang-np="आफ्नो सदस्य खाता तथा बचत विवरण">Savings, passbook & member portal</small>
                  </div>
                  <span class="arrow">›</span>
                </button>

                <!-- Office / Admin Login Option -->
                <button type="button" class="login-choice-row" data-open-login="office">
                  <div class="choice-icon office">🏢</div>
                  <div class="choice-text">
                    <strong data-lang-en="Office / Admin Login" data-lang-np="कार्यालय / प्रशासन लगइन">Office / Admin Login</strong>
                    <small data-lang-en="Staff, MIS & CBS administration" data-lang-np="कर्मचारी तथा मुख्य प्रशासन पोर्टल">Staff, MIS & CBS administration</small>
                  </div>
                  <span class="arrow">›</span>
                </button>
                
                <div class="login-choice-footer" style="padding: 10px 14px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 12px;">
                    <a href="member.php" style="color: #059669; font-weight: 600; text-decoration: none;">👤 Member Portal &rarr;</a>
                    <a href="admin.php" style="color: #2563eb; font-weight: 600; text-decoration: none;">🏢 Admin Console &rarr;</a>
                  </div>
                  <span style="font-size: 11px; color: #64748b;">🔒 256-bit SSL Protected Banking Portal</span>
                </div>
              </div>
            </div>

            <button class="btn-primary" type="button" data-modal-target="apply-membership">
              + <span data-lang-en="Become a Member" data-lang-np="सदस्य बन्नुहोस्">Become a Member</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  </div>

  <!-- Persistent Header Spacer for Smooth Flow -->
  <div class="fixed-header-spacer"></div>

  <!-- ================= HERO SECTION ================= -->
  <section class="hero-section">
    <div class="container hero-grid">
      <div class="hero-content">
        <h2 data-lang-en="Empowering Communities Through <span class='highlight-gold'>Trusted Cooperative Banking</span>" data-lang-np="विश्वसनीय सहकारी बैंकिङबाट <span class='highlight-gold'>समुदायको आर्थिक सबलीकरण</span>">
          Empowering Communities Through <span class="highlight-gold">Trusted Cooperative Banking</span>
        </h2>
        <p data-lang-en="Ekata Saving & Credit Cooperative Ltd. serves over <?php echo number_format($totalVerifiedMembers); ?> active members in Rupandehi with secure high-yield savings, productive credit, and 24/7 digital finance." data-lang-np="एकता बचत तथा ऋण सहकारी संस्था लि. ले रूपन्देहीका <?php echo number_format($totalVerifiedMembers); ?> भन्दा बढी सदस्यहरूलाई उच्च ब्याजदरको सुरक्षित बचत, उत्पादनमूलक कर्जा तथा डिजिटल बैंकिङ सेवा प्रदान गर्दै आएको छ।">
          Ekata Saving & Credit Cooperative Ltd. serves over <?php echo number_format($totalVerifiedMembers); ?> active members in Rupandehi with secure high-yield savings, productive credit, and 24/7 digital finance.
        </p>
        <div class="hero-cta-group">
          <button class="btn-primary" data-modal-target="apply-membership">
            + <span data-lang-en="Open an Account" data-lang-np="खाता खोल्नुहोस्">Open an Account</span>
          </button>
          <a href="#rates-section" class="btn-secondary">
            ⌁ <span data-lang-en="Explore Interest Rates" data-lang-np="ब्याजदर हेर्नुहोस्">Explore Interest Rates</span>
          </a>
          <button class="btn-secondary" data-modal-target="apply-loan">
            💼 <span data-lang-en="Apply for Loan" data-lang-np="कर्जा आवेदन">Apply for Loan</span>
          </button>
        </div>
      </div>

      <div class="hero-highlights-card">
        <h3>✦ <span data-lang-en="Institutional Highlights" data-lang-np="संस्थागत मुख्य सूचकहरू">Institutional Highlights</span></h3>
        <div class="highlight-row">
          <span data-lang-en="Maximum Deposit Interest" data-lang-np="अधिकतम बचत ब्याजदर">Maximum Deposit Interest</span>
          <span class="val highlight-gold">11.75% p.a.</span>
        </div>
        <div class="highlight-row">
          <span data-lang-en="Total Active Members" data-lang-np="कुल सेयर सदस्य संख्या">Total Active Members</span>
          <span class="val"><?php echo number_format($totalVerifiedMembers); ?>+ Verified</span>
        </div>
        <div class="highlight-row">
          <span data-lang-en="Statutory Liquidity Ratio" data-lang-np="तरलता अनुपात">Statutory Liquidity Ratio</span>
          <span class="val">22.40% (Surplus)</span>
        </div>
        <div class="highlight-row">
          <span data-lang-en="Established Year" data-lang-np="स्थापना वर्ष">Established Year</span>
          <span class="val">२०५७ वि.सं. (2000 A.D.)</span>
        </div>
        <div class="highlight-row">
          <span data-lang-en="Supervisory Regulatory Body" data-lang-np="नियमनकारी निकाय">Supervisory Regulatory Body</span>
          <span class="val">Dept. of Cooperatives, Nepal</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= 6 CORE SERVICES SECTION ================= -->
  <section class="section bg-light" id="services-section">
    <div class="container">
      <div class="section-title-wrap">
        <h2 data-lang-en="Comprehensive Financial Solutions for Every Member" data-lang-np="सदस्यहरूको सर्वाङ्गीण विकासका लागि भरपर्दो सेवाहरू">
          Comprehensive Financial Solutions for Every Member
        </h2>
        <p data-lang-en="Explore our 6 core cooperative offerings tailored to the economic growth of our community." data-lang-np="समुदायको आर्थिक उन्नति तथा समृद्धिका लागि हाम्रा ६ मुख्य सेवाहरू।">
          Explore our 6 core cooperative offerings tailored to the economic growth of our community.
        </p>
      </div>

      <div class="services-grid">
        <?php foreach ($services as $srv): ?>
        <div class="service-card" data-modal-target="<?php echo $srv['id']; ?>">
          <div class="service-badge"><?php echo $srv['badge']; ?></div>
          <div class="service-icon"><?php echo $srv['icon']; ?></div>
          <h3 data-lang-en="<?php echo $srv['titleEn']; ?>" data-lang-np="<?php echo $srv['titleNp']; ?>">
            <?php echo $srv['titleEn']; ?>
          </h3>
          <p data-lang-en="<?php echo $srv['descEn']; ?>" data-lang-np="<?php echo $srv['descNp']; ?>">
            <?php echo $srv['descEn']; ?>
          </p>
          <div class="service-link">
            <span data-lang-en="Explore Details" data-lang-np="विस्तृत विवरण">Explore Details</span> →
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ================= LIVE INTEREST RATES TABLE (FROM PHP DATABASE) ================= -->
  <section class="section" id="rates-section">
    <div class="container">
      <div class="section-title-wrap">
        <h2 data-lang-en="Official Interest Rate Schedule (Effective from Kartik 1, 2081)" data-lang-np="आधिकारिक ब्याजदर तालिका (लागू मिति: २०८१ कार्तिक १ देखि)">
          Official Interest Rate Schedule (Effective from Kartik 1, 2081)
        </h2>
        <p data-lang-en="Transparent, competitive returns regulated under the Cooperative Act of Nepal." data-lang-np="सहकारी ऐन तथा नियमावली अनुसार पारदर्शी तथा अधिकतम प्रतिफल।">
          Transparent, competitive returns regulated under the Cooperative Act of Nepal.
        </p>
      </div>

      <div class="rates-table-wrap">
        <table class="rates-table">
          <thead>
            <tr>
              <th data-lang-en="Scheme / Product Name" data-lang-np="बचत / कर्जा योजना">Scheme / Product Name</th>
              <th data-lang-en="Category" data-lang-np="प्रकार">Category</th>
              <th data-lang-en="Interest Rate (p.a.)" data-lang-np="ब्याजदर (वार्षिक)">Interest Rate (p.a.)</th>
              <th data-lang-en="Interest Calculation Basis" data-lang-np="ब्याज गणना विधि">Interest Calculation Basis</th>
              <th data-lang-en="Action" data-lang-np="कार्य">Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($dbRates as $r): ?>
            <tr>
              <td>
                <strong data-lang-en="<?php echo htmlspecialchars($r['scheme_en']); ?>" data-lang-np="<?php echo htmlspecialchars($r['scheme_np']); ?>">
                  <?php echo htmlspecialchars($r['scheme_en']); ?>
                </strong>
                <?php if ($r['min_balance'] > 0): ?>
                <small class="rate-sub">Min Balance: Rs. <?php echo number_format($r['min_balance']); ?></small>
                <?php endif; ?>
              </td>
              <td>
                <span class="tag-pill <?php echo $r['category'] === 'Deposit' ? 'tag-deposit' : 'tag-loan'; ?>">
                  <?php echo htmlspecialchars($r['category']); ?>
                </span>
              </td>
              <td class="rate-val"><?php echo number_format($r['rate_percent'], 2); ?>%</td>
              <td class="rate-basis" data-lang-en="<?php echo htmlspecialchars($r['basis_en']); ?>" data-lang-np="<?php echo htmlspecialchars($r['basis_np']); ?>">
                <?php echo htmlspecialchars($r['basis_en']); ?>
              </td>
              <td>
                <?php if ($r['category'] === 'Deposit'): ?>
                <button class="btn-sm" data-modal-target="apply-membership">Open Account</button>
                <?php else: ?>
                <button class="btn-sm" data-modal-target="apply-loan">Apply Loan</button>
                <?php endif; ?>
              </td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ================= LOAN & DEPOSIT EMI CALCULATOR ================= -->
  <section class="section bg-light" id="calculator-section">
    <div class="container">
      <div class="section-title-wrap">
        <h2 data-lang-en="Interactive Loan EMI & Savings Calculator" data-lang-np="अन्तरक्रियात्मक कर्जा किस्ता (EMI) तथा बचत क्याल्कुलेटर">
          Interactive Loan EMI & Savings Calculator
        </h2>
        <p data-lang-en="Accurately compute monthly installments, total interest, and maturity values." data-lang-np="आफ्नो कर्जाको मासिक किस्ता, कुल ब्याज तथा बचतको प्रतिफल सजिलै हिसाब गर्नुहोस्।">
          Accurately compute monthly installments, total interest, and maturity values.
        </p>
      </div>

      <div class="calculator-grid">
        <div class="calc-card">
          <h3>🧮 <span data-lang-en="Loan Repayment Parameters" data-lang-np="कर्जा विवरण">Loan Repayment Parameters</span></h3>
          <div class="calc-group">
            <div class="calc-label-row">
              <label data-lang-en="Loan Amount" data-lang-np="कर्जा रकम">Loan Amount</label>
              <span class="calc-val-badge" id="amountDisplay">Rs. 500,000</span>
            </div>
            <input type="range" id="loanAmountSlider" min="50000" max="5000000" step="25000" value="500000">
          </div>

          <div class="calc-group">
            <div class="calc-label-row">
              <label data-lang-en="Annual Interest Rate" data-lang-np="वार्षिक ब्याजदर">Annual Interest Rate</label>
              <span class="calc-val-badge" id="rateDisplay">12.00%</span>
            </div>
            <input type="range" id="loanInterestSlider" min="8" max="18" step="0.25" value="12.00">
          </div>

          <div class="calc-group">
            <div class="calc-label-row">
              <label data-lang-en="Repayment Tenure" data-lang-np="भुक्तानी अवधि">Repayment Tenure</label>
              <span class="calc-val-badge" id="tenureDisplay">36 Months (3.0 Yrs)</span>
            </div>
            <input type="range" id="loanTenureSlider" min="6" max="120" step="6" value="36">
          </div>
        </div>

        <div class="calc-result-card">
          <h3>📊 <span data-lang-en="Repayment Summary" data-lang-np="भुक्तानी सारांश">Repayment Summary</span></h3>
          <div class="emi-result-box">
            <small data-lang-en="Estimated Monthly EMI" data-lang-np="अनुमानित मासिक किस्ता">Estimated Monthly EMI</small>
            <strong id="emiAmountDisplay" class="highlight-gold">Rs. 16,607</strong>
          </div>
          <div class="result-details">
            <div class="res-row">
              <span data-lang-en="Total Interest Payable" data-lang-np="कुल बुझाउनुपर्ने ब्याज">Total Interest Payable:</span>
              <strong id="totalInterestDisplay">Rs. 97,858</strong>
            </div>
            <div class="res-row">
              <span data-lang-en="Total Principal + Interest" data-lang-np="साँवा तथा कुल रकम">Total Principal + Interest:</span>
              <strong id="totalPaymentDisplay">Rs. 597,858</strong>
            </div>
          </div>
          <button class="btn-primary w-full" style="margin-top: 15px;" data-modal-target="apply-loan">
            💼 <span data-lang-en="Apply for This Loan" data-lang-np="यो कर्जा आवेदन गर्नुहोस्">Apply for This Loan</span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= FOOTER ================= -->
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <div class="footer-logo" style="display:flex; align-items:center; gap:8px;">
          <img src="/assets/images/ekata-logo.svg" alt="Ekata Logo" style="height:28px; width:auto; background:#fff; border-radius:6px; padding:2px;" onerror="this.src='../assets/images/ekata-logo.svg'">
          <span><?php echo htmlspecialchars($coopNameNp); ?></span>
        </div>
        <p class="footer-desc">
          <?php echo htmlspecialchars($coopNameEn); ?> • दर्ता नं: २४५/०५६/०५७ • स्थापना: २०५७ वि.सं.। बुटवल-४, रुपन्देही। सदस्य हित र वित्तीय अनुशासन हाम्रो पहिलो प्राथमिकता।
        </p>
      </div>
      <div>
        <h4>मुख्य सेवाहरू (Services)</h4>
        <ul class="footer-links">
          <li><a href="#" data-modal-target="deposit-product">बचत योजना (मुद्दती ११.७५%)</a></li>
          <li><a href="#" data-modal-target="loan">उत्पादनमूलक कर्जा (१२.००%)</a></li>
          <li><a href="#" data-modal-target="remittance">रेमिट्यान्स काउन्टर भुक्तानी</a></li>
          <li><a href="#" data-modal-target="digital-services">एकता स्मार्ट मोबाइल बैंकिङ</a></li>
        </ul>
      </div>
      <div>
        <h4>प्रतिवेदन तथा प्रशासन</h4>
        <ul class="footer-links">
          <li><a href="#" data-modal-target="reports-annual">२४औं वार्षिक साधारण सभा प्रतिवेदन</a></li>
          <li><a href="#" data-modal-target="reports-audit">लेखापरीक्षण प्रतिवेदन</a></li>
          <li><a href="ekym.php">अनलाइन eKYM दर्ता (ekym.php)</a></li>
          <li><a href="member.php">सदस्य इन्टरनेट बैंकिङ (member.php)</a></li>
          <li><a href="admin.php">कर्मचारी तथा मुख्य प्रशासन (admin.php)</a></li>
          <li><a href="check_db.php">प्रणाली तथा डाटाबेस स्थिति (check_db.php)</a></li>
        </ul>
      </div>
      <div>
        <h4>सम्पर्क ठेगाना</h4>
        <p class="footer-desc">
          📍 मुख्य कार्यालय: बुटवल-४, अमरपथ, रुपन्देही<br>
          ☎ टेलिफोन: ०७१-५४०१२३ / ५४०४५६<br>
          📞 टोल-फ्री हटलाइन: १६६०-०१-९९८८७<br>
          ✉ इमेल: info@ekatacoop.com.np
        </p>
      </div>
    </div>
    <div class="container footer-bottom">
      <div>© <?php echo date('Y'); ?> <?php echo htmlspecialchars($coopNameEn); ?>. All Rights Reserved.</div>
      <div>Regd. No. २४५/०५६/०५७ • Certified A-Grade Cooperative</div>
    </div>
  </footer>

  <!-- ================= DYNAMIC MODALS ================= -->

  <!-- 1. General Details Modal (Services, Reports, Careers) -->
  <div class="modal-overlay" id="generalModalOverlay" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon" id="modalIcon">📄</span>
          <h3 id="modalTitle">Details</h3>
        </div>
        <button type="button" class="modal-close" id="generalModalClose">✕</button>
      </div>
      <div class="modal-body">
        <p id="modalDesc" class="modal-desc"></p>
        <ul id="modalPoints" class="modal-points"></ul>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary" id="generalModalCancel">Close</button>
        <button type="button" class="btn-primary" id="modalActionBtn">Proceed</button>
      </div>
    </div>
  </div>

  <!-- 2. Member Login Modal (Connected to api.php) -->
  <div class="modal-overlay" id="memberLoginModal" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon member">👤</span>
          <div>
            <h3 data-lang-en="Member Account Login" data-lang-np="सदस्य खाता लगइन">Member Account Login</h3>
            <small class="text-muted">Access passbook, balances & transaction history</small>
          </div>
        </div>
        <button type="button" class="modal-close" data-close-modal="memberLoginModal">✕</button>
      </div>
      <div class="modal-body">
        <div id="memberLoginAlert" class="alert-box hidden"></div>
        <form id="memberLoginForm">
          <div class="form-group">
            <label data-lang-en="Member Code or Registered Mobile" data-lang-np="सदस्य कोड वा दर्ता भएको मोबाइल">Member Code or Registered Mobile</label>
            <input type="text" name="member_code" id="memInputCode" placeholder="e.g. EK-10482 or 9857012345" required value="EK-10482">
            <small class="hint">Demo: EK-10482</small>
          </div>
          <div class="form-group">
            <label data-lang-en="Security PIN" data-lang-np="सुरक्षा पिन">Security PIN</label>
            <input type="password" name="pin" id="memInputPin" placeholder="Enter 4-digit PIN" required value="1234">
            <small class="hint">Demo PIN: 1234</small>
          </div>
          <button type="submit" class="btn-primary w-full" id="memLoginSubmitBtn">
            🔐 <span data-lang-en="Secure Login" data-lang-np="सुरक्षित लगइन">Secure Login</span>
          </button>
        </form>

        <!-- Member Dashboard Panel (Appears on success) -->
        <div id="memberDashboardPanel" class="hidden">
          <div class="member-profile-summary">
            <h4 id="memDispName">Ram Kumar Sharma</h4>
            <div class="mem-badge" id="memDispCode">ID: EK-10482</div>
            <div class="balance-grid">
              <div class="bal-box">
                <small>Savings Balance</small>
                <strong id="memDispSaving">Rs. 148,500</strong>
              </div>
              <div class="bal-box">
                <small>Share Capital</small>
                <strong id="memDispShare">Rs. 25,000</strong>
              </div>
            </div>
          </div>
          <h5 style="margin-top: 15px; margin-bottom: 8px;">Recent Passbook Transactions</h5>
          <div class="tx-history-list" id="memTxList"></div>
          <button type="button" class="btn-secondary w-full" style="margin-top: 15px;" id="memLogoutBtn">Logout from Session</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 3. Office / Admin Login Modal (Connected to api.php) -->
  <div class="modal-overlay" id="officeLoginModal" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon office">🏢</span>
          <div>
            <h3 data-lang-en="Office & Admin Staff Login" data-lang-np="कार्यालय तथा प्रशासन लगइन">Office & Admin Staff Login</h3>
            <small class="text-muted">Core Banking System & Member Administration</small>
          </div>
        </div>
        <button type="button" class="modal-close" data-close-modal="officeLoginModal">✕</button>
      </div>
      <div class="modal-body">
        <div id="officeLoginAlert" class="alert-box hidden"></div>
        <form id="officeLoginForm">
          <div class="form-group">
            <label data-lang-en="Staff Username" data-lang-np="कर्मचारी युजरनेम">Staff Username</label>
            <input type="text" name="username" id="staffUser" placeholder="admin or staff" required value="admin">
          </div>
          <div class="form-group">
            <label data-lang-en="System Password" data-lang-np="पासवर्ड">System Password</label>
            <input type="password" name="password" id="staffPass" placeholder="Enter password" required value="Admin@123">
            <small class="hint">Demo credentials: admin / Admin@123</small>
          </div>
          <button type="submit" class="btn-primary w-full" id="officeLoginSubmitBtn">
            🏢 <span data-lang-en="Staff Authorization" data-lang-np="कर्मचारी लगइन">Staff Authorization</span>
          </button>
        </form>

        <div id="officeDashboardPanel" class="hidden">
          <div class="admin-welcome-box">
            <h4 id="adminDispName">Chief Executive Officer</h4>
            <span class="role-badge" id="adminDispRole">Role: Admin</span>
          </div>
          <div class="stats-overview-grid" id="adminStatsGrid"></div>
          <button type="button" class="btn-secondary w-full" style="margin-top: 15px;" id="officeLogoutBtn">Sign Out of Admin Portal</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. Online Member Application Modal (Connected to api.php) -->
  <div class="modal-overlay" id="applyMemberModal" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon">👥</span>
          <div>
            <h3 data-lang-en="Online Member Registration" data-lang-np="अनलाइन सेयर सदस्यता आवेदन">Online Member Registration</h3>
            <small class="text-muted">Ekata Saving & Credit Cooperative Ltd.</small>
          </div>
        </div>
        <button type="button" class="modal-close" data-close-modal="applyMemberModal">✕</button>
      </div>
      <div class="modal-body">
        <div id="applyMemberAlert" class="alert-box hidden"></div>
        <form id="applyMemberForm">
          <div class="form-group">
            <label>Full Applicant Name *</label>
            <input type="text" name="full_name" required placeholder="e.g. Shyam Prasad Poudel">
          </div>
          <div class="form-group">
            <label>Citizenship / National ID Number *</label>
            <input type="text" name="citizenship_no" required placeholder="e.g. 48-01-76-12345">
          </div>
          <div class="form-group">
            <label>Mobile Number (Registered) *</label>
            <input type="tel" name="phone" required placeholder="98XXXXXXXX">
          </div>
          <div class="form-group">
            <label>Permanent / Current Address in Rupandehi *</label>
            <input type="text" name="address" required placeholder="e.g. Butwal-4, Amarpath">
          </div>
          <div class="form-group">
            <label>Preferred Savings Scheme *</label>
            <select name="saving_scheme">
              <option value="Regular Savings Account">Regular Savings Account (7.25%)</option>
              <option value="Nari Kalyan Bachat">Nari Kalyan Bachat (8.00%)</option>
              <option value="Senior Citizen Care Fund">Senior Citizen Care Fund (9.50%)</option>
              <option value="Child Bright Future Scheme">Child Bright Future Scheme (9.00%)</option>
              <option value="1-Year Fixed Term Deposit">1-Year Fixed Term Deposit (10.50%)</option>
              <option value="2-Year+ Golden Term Deposit">2-Year+ Golden Term Deposit (11.75%)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Initial Deposit (Min. Rs. 1,000)</label>
            <input type="number" name="initial_deposit" value="1000" min="500" step="500">
          </div>
          <button type="submit" class="btn-primary w-full">Submit Membership Registration</button>
        </form>
      </div>
    </div>
  </div>

  <!-- 5. Online Loan Application Modal (Connected to api.php) -->
  <div class="modal-overlay" id="applyLoanModal" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon">💼</span>
          <div>
            <h3 data-lang-en="Online Loan Application" data-lang-np="अनलाइन कर्जा आवेदन">Online Loan Application</h3>
            <small class="text-muted">Subsidized & Productive Community Credit</small>
          </div>
        </div>
        <button type="button" class="modal-close" data-close-modal="applyLoanModal">✕</button>
      </div>
      <div class="modal-body">
        <div id="applyLoanAlert" class="alert-box hidden"></div>
        <form id="applyLoanForm">
          <div class="form-group">
            <label>Applicant Full Name *</label>
            <input type="text" name="applicant_name" required placeholder="e.g. Hari Krishna Shrestha">
          </div>
          <div class="form-group">
            <label>Mobile Number *</label>
            <input type="tel" name="phone" required placeholder="98XXXXXXXX">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="applicant@example.com">
          </div>
          <div class="form-group">
            <label>Loan Scheme *</label>
            <select name="loan_scheme">
              <option value="Agricultural Productive Loan">Agricultural Productive Loan (12.00%)</option>
              <option value="SME & Enterprise Expansion Loan">SME & Enterprise Expansion Loan (13.50%)</option>
              <option value="Residential Housing & Land Loan">Residential Housing & Land Loan (13.00%)</option>
              <option value="Social & Foreign Employment Loan">Social & Foreign Employment Loan (13.50%)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Requested Loan Amount (Rs.) *</label>
            <input type="number" name="amount" required value="500000" min="50000" step="50000">
          </div>
          <div class="form-group">
            <label>Tenure (Months) *</label>
            <input type="number" name="tenure_months" required value="36" min="6" max="180">
          </div>
          <div class="form-group">
            <label>Monthly Household / Business Income (Rs.) *</label>
            <input type="number" name="monthly_income" required value="45000" min="10000">
          </div>
          <div class="form-group">
            <label>Purpose of Loan</label>
            <textarea name="purpose" rows="2" placeholder="Briefly describe agriculture, trading, or construction purpose..."></textarea>
          </div>
          <button type="submit" class="btn-primary w-full">Submit Loan Request to Credit Committee</button>
        </form>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
