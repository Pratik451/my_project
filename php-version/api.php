<?php
/**
 * Ekata Saving & Credit Cooperative Ltd.
 * Full-Featured REST API Router
 * File: php-version/api.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

// Parse JSON body if applicable
$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?? [];
} else {
    $input = $_POST;
}

try {
    switch ($action) {
        // 1. Fetch live interest rates
        case 'rates':
            $stmt = $db->query("SELECT * FROM interest_rates ORDER BY id ASC");
            jsonResponse([
                'success' => true,
                'data' => $stmt->fetchAll()
            ]);
            break;

        // 2. Fetch notices
        case 'notices':
            $stmt = $db->query("SELECT * FROM notices WHERE is_active = 1 ORDER BY id DESC");
            jsonResponse([
                'success' => true,
                'data' => $stmt->fetchAll()
            ]);
            break;

        // 3. Member Login (Member Code or Phone + PIN)
        case 'login_member':
            $memberIdentifier = trim($input['member_code'] ?? '');
            $pin = trim($input['pin'] ?? '');

            if (empty($memberIdentifier) || empty($pin)) {
                jsonResponse(['success' => false, 'message' => 'Please provide both Member Code / Phone and Security PIN.'], 400);
            }

            $stmt = $db->prepare("SELECT * FROM members WHERE member_code = ? OR phone = ? LIMIT 1");
            $stmt->execute([$memberIdentifier, $memberIdentifier]);
            $member = $stmt->fetch();

            if (!$member || !password_verify($pin, $member['pin_hash'])) {
                jsonResponse(['success' => false, 'message' => 'Invalid Member ID or Security PIN. (Demo: ID: EK-10482, PIN: 1234)'], 401);
            }

            // Set session
            $_SESSION['member_id'] = $member['id'];
            $_SESSION['member_code'] = $member['member_code'];
            $_SESSION['member_name'] = $member['full_name'];

            // Fetch recent transactions
            $txStmt = $db->prepare("SELECT * FROM transactions WHERE member_code = ? ORDER BY id DESC LIMIT 10");
            $txStmt->execute([$member['member_code']]);
            $transactions = $txStmt->fetchAll();

            unset($member['pin_hash']);

            jsonResponse([
                'success' => true,
                'message' => 'Member verified successfully',
                'member' => $member,
                'transactions' => $transactions
            ]);
            break;

        // 4. Staff / Admin Login
        case 'login_office':
            $username = trim($input['username'] ?? '');
            $password = trim($input['password'] ?? '');

            if (empty($username) || empty($password)) {
                jsonResponse(['success' => false, 'message' => 'Please provide username and password.'], 400);
            }

            $stmt = $db->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                jsonResponse(['success' => false, 'message' => 'Invalid staff credentials. (Demo: admin / Admin@123)'], 401);
            }

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            // Provide high level cooperative stats
            $memTotal = $db->query("SELECT COUNT(*) as c FROM members")->fetch()['c'];
            $depTotal = $db->query("SELECT SUM(regular_saving_balance) as s FROM members")->fetch()['s'] ?? 0;
            $pendingLoans = $db->query("SELECT COUNT(*) as c FROM loan_applications WHERE status = 'Under Review'")->fetch()['c'];
            $pendingMembers = $db->query("SELECT COUNT(*) as c FROM member_applications WHERE status = 'Pending Verification'")->fetch()['c'];

            unset($user['password_hash']);

            jsonResponse([
                'success' => true,
                'message' => 'Staff authorization granted',
                'user' => $user,
                'dashboard' => [
                    'total_members' => $memTotal,
                    'total_savings' => (float)$depTotal,
                    'pending_loan_applications' => $pendingLoans,
                    'pending_membership_requests' => $pendingMembers
                ]
            ]);
            break;

        // 5. Check Current Session
        case 'session_status':
            $isMember = isset($_SESSION['member_code']);
            $isStaff = isset($_SESSION['user_id']);

            jsonResponse([
                'success' => true,
                'is_member' => $isMember,
                'member_code' => $_SESSION['member_code'] ?? null,
                'member_name' => $_SESSION['member_name'] ?? null,
                'is_staff' => $isStaff,
                'username' => $_SESSION['username'] ?? null,
                'role' => $_SESSION['role'] ?? null
            ]);
            break;

        // 6. Logout
        case 'logout':
            session_unset();
            session_destroy();
            jsonResponse(['success' => true, 'message' => 'Logged out successfully.']);
            break;

        // 7. Calculate Loan EMI & Amortization
        case 'calculate_emi':
            $principal = (float)($input['amount'] ?? 500000);
            $annualRate = (float)($input['rate'] ?? 12.0);
            $tenureMonths = (int)($input['tenure'] ?? 36);

            if ($principal <= 0 || $annualRate <= 0 || $tenureMonths <= 0) {
                jsonResponse(['success' => false, 'message' => 'Please provide valid positive values.'], 400);
            }

            $monthlyRate = ($annualRate / 12) / 100;
            $emi = ($principal * $monthlyRate * pow(1 + $monthlyRate, $tenureMonths)) / (pow(1 + $monthlyRate, $tenureMonths) - 1);
            $totalPayment = $emi * $tenureMonths;
            $totalInterest = $totalPayment - $principal;

            // Generate monthly breakdown sample (first 6 months)
            $schedule = [];
            $balance = $principal;
            for ($m = 1; $m <= min(12, $tenureMonths); $m++) {
                $interestMonth = $balance * $monthlyRate;
                $principalMonth = $emi - $interestMonth;
                $balance -= $principalMonth;
                $schedule[] = [
                    'month' => $m,
                    'emi' => round($emi, 2),
                    'principal_paid' => round($principalMonth, 2),
                    'interest_paid' => round($interestMonth, 2),
                    'remaining_balance' => max(0, round($balance, 2))
                ];
            }

            jsonResponse([
                'success' => true,
                'principal' => $principal,
                'annual_rate' => $annualRate,
                'tenure_months' => $tenureMonths,
                'monthly_emi' => round($emi, 2),
                'total_interest' => round($totalInterest, 2),
                'total_payable' => round($totalPayment, 2),
                'schedule_preview' => $schedule
            ]);
            break;

        // 8. Calculate Deposit Maturity
        case 'calculate_deposit':
            $depositAmount = (float)($input['amount'] ?? 100000);
            $annualRate = (float)($input['rate'] ?? 11.75);
            $years = (float)($input['years'] ?? 2);
            $scheme = $input['scheme'] ?? 'fixed'; // 'fixed' or 'recurring'

            if ($depositAmount <= 0 || $annualRate <= 0 || $years <= 0) {
                jsonResponse(['success' => false, 'message' => 'Please provide valid positive numbers.'], 400);
            }

            if ($scheme === 'recurring') {
                // Monthly recurring deposit compounded quarterly
                $months = $years * 12;
                $monthlyRate = ($annualRate / 100) / 12;
                $maturity = 0;
                for ($i = 1; $i <= $months; $i++) {
                    $maturity += $depositAmount * pow(1 + $monthlyRate, $months - $i + 1);
                }
                $totalInvested = $depositAmount * $months;
            } else {
                // Fixed Deposit compounded quarterly (n = 4)
                $n = 4;
                $maturity = $depositAmount * pow(1 + (($annualRate / 100) / $n), $n * $years);
                $totalInvested = $depositAmount;
            }

            $interestEarned = $maturity - $totalInvested;

            jsonResponse([
                'success' => true,
                'invested_amount' => round($totalInvested, 2),
                'annual_rate' => $annualRate,
                'period_years' => $years,
                'scheme' => $scheme,
                'interest_earned' => round($interestEarned, 2),
                'maturity_amount' => round($maturity, 2)
            ]);
            break;

        // 9. Submit Loan Application
        case 'apply_loan':
            $name = sanitizeInput($input['applicant_name'] ?? '');
            $phone = sanitizeInput($input['phone'] ?? '');
            $email = sanitizeInput($input['email'] ?? '');
            $scheme = sanitizeInput($input['loan_scheme'] ?? 'Agricultural Productive Loan');
            $amount = (float)($input['amount'] ?? 0);
            $tenure = (int)($input['tenure_months'] ?? 24);
            $income = (float)($input['monthly_income'] ?? 0);
            $purpose = sanitizeInput($input['purpose'] ?? '');

            if (empty($name) || empty($phone) || $amount <= 0) {
                jsonResponse(['success' => false, 'message' => 'Please provide complete applicant name, phone and requested amount.'], 400);
            }

            $trackingCode = 'EKT-LN-' . strtoupper(substr(md5(uniqid()), 0, 8));
            $stmt = $db->prepare("INSERT INTO loan_applications (tracking_code, applicant_name, phone, email, loan_scheme, amount, tenure_months, monthly_income, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review')");
            $stmt->execute([$trackingCode, $name, $phone, $email, $scheme, $amount, $tenure, $income, $purpose]);

            jsonResponse([
                'success' => true,
                'message' => 'Loan application submitted successfully to Ekata Credit Committee.',
                'tracking_code' => $trackingCode,
                'loan_amount' => $amount,
                'scheme' => $scheme
            ]);
            break;

        // 10. Submit Member Registration
        case 'apply_member':
            $name = sanitizeInput($input['full_name'] ?? '');
            $citizenship = sanitizeInput($input['citizenship_no'] ?? '');
            $phone = sanitizeInput($input['phone'] ?? '');
            $address = sanitizeInput($input['address'] ?? '');
            $scheme = sanitizeInput($input['saving_scheme'] ?? 'Regular Savings Account');
            $initial = (float)($input['initial_deposit'] ?? 1000);

            if (empty($name) || empty($phone) || empty($citizenship)) {
                jsonResponse(['success' => false, 'message' => 'Please fill in Name, Citizenship No., and Mobile Number.'], 400);
            }

            $appNo = 'EKT-MEM-' . strtoupper(substr(md5(uniqid()), 0, 8));
            $stmt = $db->prepare("INSERT INTO member_applications (application_no, full_name, citizenship_no, phone, address, saving_scheme, initial_deposit, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending Verification')");
            $stmt->execute([$appNo, $name, $citizenship, $phone, $address, $scheme, $initial]);

            jsonResponse([
                'success' => true,
                'message' => 'Membership application registered successfully! Bring KYC documents to Butwal branch.',
                'application_no' => $appNo,
                'full_name' => $name
            ]);
            break;

        // 11. Contact Message Submission
        case 'contact':
            $name = sanitizeInput($input['sender_name'] ?? '');
            $phone = sanitizeInput($input['phone'] ?? '');
            $email = sanitizeInput($input['email'] ?? '');
            $subject = sanitizeInput($input['subject'] ?? 'General Inquiry');
            $message = sanitizeInput($input['message'] ?? '');

            if (empty($name) || empty($phone) || empty($message)) {
                jsonResponse(['success' => false, 'message' => 'Please complete Name, Contact Number, and Message.'], 400);
            }

            $stmt = $db->prepare("INSERT INTO contact_messages (sender_name, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $phone, $email, $subject, $message]);

            jsonResponse([
                'success' => true,
                'message' => 'Thank you for reaching out! Our cooperative desk will contact you shortly.'
            ]);
            break;

        // 12. Institutional Summary Figures
        case 'stats':
            $members = 12500;
            $branches = 4;
            $totalDeposits = 1450000000.00;
            $totalLoans = 1220000000.00;
            $capital = 185000000.00;

            jsonResponse([
                'success' => true,
                'stats' => [
                    'active_members' => $members,
                    'service_branches' => $branches,
                    'total_deposits' => $totalDeposits,
                    'total_loans' => $totalLoans,
                    'share_capital' => $capital,
                    'grade' => 'Certified A-Grade'
                ]
            ]);
            break;

        // 13. eKYM Form Submission
        case 'submit_ekym':
            $nameEn = sanitizeInput($input['full_name_en'] ?? '');
            $nameNp = sanitizeInput($input['full_name_np'] ?? '');
            $father = sanitizeInput($input['father_name'] ?? '');
            $gfather = sanitizeInput($input['grandfather_name'] ?? '');
            $citNo = sanitizeInput($input['citizenship_no'] ?? '');
            $phone = sanitizeInput($input['phone'] ?? '');
            $addr = sanitizeInput($input['permanent_address'] ?? '');

            if (empty($nameEn) || empty($citNo) || empty($phone)) {
                jsonResponse(['success' => false, 'message' => 'Please provide complete Name, Citizenship, and Mobile number.'], 400);
            }

            $appRef = 'EKT-KYC-' . date('Y') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
            $stmt = $db->prepare("INSERT INTO ekym_submissions (
                application_no, full_name_en, full_name_np, father_name, grandfather_name,
                dob, gender, citizenship_no, citizenship_district, phone, email,
                permanent_address, current_address, occupation, annual_income,
                bank_name, bank_account_no, nominee_name, nominee_relation, status, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Submitted online via eKYM API')");

            $stmt->execute([
                $appRef, $nameEn, $nameNp, $father, $gfather,
                sanitizeInput($input['dob'] ?? '2045-01-01'),
                sanitizeInput($input['gender'] ?? 'Male'),
                $citNo,
                sanitizeInput($input['citizenship_district'] ?? 'Rupandehi'),
                $phone,
                sanitizeInput($input['email'] ?? ''),
                $addr,
                sanitizeInput($input['current_address'] ?? $addr),
                sanitizeInput($input['occupation'] ?? 'Business / Agriculture'),
                sanitizeInput($input['annual_income'] ?? 'Rs. 500,000'),
                sanitizeInput($input['bank_name'] ?? 'Local Bank'),
                sanitizeInput($input['bank_account_no'] ?? '123456789'),
                sanitizeInput($input['nominee_name'] ?? 'Nominee'),
                sanitizeInput($input['nominee_relation'] ?? 'Family')
            ]);

            jsonResponse([
                'success' => true,
                'message' => 'eKYM submitted successfully',
                'application_no' => $appRef
            ]);
            break;

        // 14. Admin: List eKYM Submissions
        case 'admin_ekym_list':
            $stmt = $db->query("SELECT * FROM ekym_submissions ORDER BY id DESC");
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        // 15. Admin: Update eKYM Status
        case 'admin_ekym_status':
            $id = (int)($input['id'] ?? 0);
            $status = sanitizeInput($input['status'] ?? 'Approved');
            $remarks = sanitizeInput($input['remarks'] ?? 'Verified by Admin');
            $stmt = $db->prepare("UPDATE ekym_submissions SET status = ?, remarks = ? WHERE id = ?");
            $stmt->execute([$status, $remarks, $id]);
            jsonResponse(['success' => true, 'message' => "Application status updated to $status"]);
            break;

        // 16. Admin: List Loan Applications
        case 'admin_loans_list':
            $stmt = $db->query("SELECT * FROM loan_applications ORDER BY id DESC");
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        // 17. Admin: Update Loan Status
        case 'admin_loan_status':
            $id = (int)($input['id'] ?? 0);
            $status = sanitizeInput($input['status'] ?? 'Approved');
            $stmt = $db->prepare("UPDATE loan_applications SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            jsonResponse(['success' => true, 'message' => "Loan status updated to $status"]);
            break;

        // 18. Admin: List Members
        case 'admin_members_list':
            $stmt = $db->query("SELECT id, member_code, full_name, phone, branch, share_amount, regular_saving_balance, loan_balance, kyc_status FROM members ORDER BY id ASC");
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        // 19. Admin: Adjust Member Balance
        case 'admin_adjust_balance':
            $memberCode = sanitizeInput($input['member_code'] ?? '');
            $type = sanitizeInput($input['type'] ?? 'Credit');
            $amount = (float)($input['amount'] ?? 0);
            $particulars = sanitizeInput($input['particulars'] ?? 'Counter Cash Deposit');

            $mStmt = $db->prepare("SELECT regular_saving_balance FROM members WHERE member_code = ? LIMIT 1");
            $mStmt->execute([$memberCode]);
            $member = $mStmt->fetch();

            if (!$member) {
                jsonResponse(['success' => false, 'message' => 'Member not found'], 404);
            }

            $cur = (float)$member['regular_saving_balance'];
            $newBal = ($type === 'Credit') ? ($cur + $amount) : ($cur - $amount);
            $upd = $db->prepare("UPDATE members SET regular_saving_balance = ? WHERE member_code = ?");
            $upd->execute([$newBal, $memberCode]);

            $tx = $db->prepare("INSERT INTO transactions (member_code, type, amount, balance_after, particulars) VALUES (?, ?, ?, ?, ?)");
            $tx->execute([$memberCode, $type, $amount, $newBal, $particulars]);

            jsonResponse(['success' => true, 'new_balance' => $newBal]);
            break;

        // 20. Database & System Health Status
        case 'db_status':
            $health = Database::checkHealth();
            jsonResponse([
                'success' => true,
                'health' => $health
            ]);
            break;

        // 21. Popup Notices (Active Notice for Frontend Modal)
        case 'popup_notices':
            $showAll = isset($_GET['all']) && $_GET['all'] === '1';
            $sql = $showAll ? "SELECT * FROM popup_notices ORDER BY id DESC" : "SELECT * FROM popup_notices WHERE active = 1 ORDER BY id ASC";
            $stmt = $db->query($sql);
            $rawNotices = $stmt->fetchAll();
            $formatted = array_map(function($r) {
                return [
                    'id' => (string)$r['id'],
                    'noticeKey' => $r['notice_key'] ?? ('notice-' . $r['id']),
                    'active' => (bool)$r['active'],
                    'titleEn' => $r['title_en'],
                    'titleNp' => $r['title_np'],
                    'categoryEn' => $r['category_en'],
                    'categoryNp' => $r['category_np'],
                    'imageUrl' => $r['image_url'] ?? '',
                    'contentEn' => $r['content_en'],
                    'contentNp' => $r['content_np'],
                    'bulletPointsEn' => !empty($r['bullet_points_en']) ? json_decode($r['bullet_points_en'], true) : [],
                    'bulletPointsNp' => !empty($r['bullet_points_np']) ? json_decode($r['bullet_points_np'], true) : [],
                    'dateEn' => $r['date_en'],
                    'dateNp' => $r['date_np'],
                    'noticeRef' => $r['notice_ref'] ?? '',
                    'actionTextEn' => $r['action_text_en'] ?? 'Learn More',
                    'actionTextNp' => $r['action_text_np'] ?? 'थप जानकारी',
                    'actionLink' => $r['action_link'] ?? '#ekym',
                    'createdAt' => $r['created_at'] ?? '',
                    'updatedAt' => $r['updated_at'] ?? ''
                ];
            }, $rawNotices);

            jsonResponse([
                'success' => true,
                'data' => $formatted
            ]);
            break;

        // 22. Toggle Popup Notice Active State
        case 'toggle_popup_notice':
            $id = (int)($input['id'] ?? 0);
            $stmt = $db->prepare("SELECT active FROM popup_notices WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) {
                jsonResponse(['success' => false, 'message' => 'Notice not found'], 404);
            }
            $newActive = $row['active'] ? 0 : 1;
            $upd = $db->prepare("UPDATE popup_notices SET active = ? WHERE id = ?");
            $upd->execute([$newActive, $id]);
            jsonResponse(['success' => true, 'id' => $id, 'active' => (bool)$newActive]);
            break;

        // 23. Exchange Rates (NRB Fixed INR + Admin Manageable Currencies)
        case 'exchange_rates':
            $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'cms_exchange_rates' LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch();
            $rates = (!empty($row['setting_value'])) ? json_decode($row['setting_value'], true) : [];
            if (!is_array($rates)) {
                $rates = [];
            }
            $hasInr = false;
            foreach ($rates as &$r) {
                if (strtoupper($r['currencyCode'] ?? '') === 'INR') {
                    $r['unit'] = 100;
                    $r['buyingRate'] = '160.00';
                    $r['sellingRate'] = '160.15';
                    $r['isFixed'] = true;
                    $r['isEnabled'] = true;
                    $hasInr = true;
                }
            }
            unset($r);
            if (!$hasInr) {
                array_unshift($rates, [
                    'id' => 'fx-inr',
                    'currencyCode' => 'INR',
                    'currencyNameEn' => 'Indian Rupee',
                    'currencyNameNp' => 'भारतीय रूपैयाँ',
                    'flag' => '🇮🇳',
                    'unit' => 100,
                    'buyingRate' => '160.00',
                    'sellingRate' => '160.15',
                    'isFixed' => true,
                    'isEnabled' => true,
                    'updatedAt' => date('Y-m-d'),
                    'sortOrder' => 1
                ]);
            }
            jsonResponse(['success' => true, 'data' => $rates]);
            break;

        // 24. Admin: Save Exchange Rates (keeps INR fixed per NRB)
        case 'save_exchange_rates':
            $incoming = $input['rates'] ?? ($input['data'] ?? []);
            if (!is_array($incoming)) {
                jsonResponse(['success' => false, 'message' => 'Invalid exchange rates payload'], 400);
            }
            $hasInr = false;
            foreach ($incoming as &$r) {
                if (strtoupper($r['currencyCode'] ?? '') === 'INR') {
                    $r['unit'] = 100;
                    $r['buyingRate'] = '160.00';
                    $r['sellingRate'] = '160.15';
                    $r['isFixed'] = true;
                    $r['isEnabled'] = true;
                    $hasInr = true;
                } else {
                    $r['isFixed'] = false;
                }
            }
            unset($r);
            if (!$hasInr) {
                array_unshift($incoming, [
                    'id' => 'fx-inr',
                    'currencyCode' => 'INR',
                    'currencyNameEn' => 'Indian Rupee',
                    'currencyNameNp' => 'भारतीय रूपैयाँ',
                    'flag' => '🇮🇳',
                    'unit' => 100,
                    'buyingRate' => '160.00',
                    'sellingRate' => '160.15',
                    'isFixed' => true,
                    'isEnabled' => true,
                    'updatedAt' => date('Y-m-d'),
                    'sortOrder' => 1
                ]);
            }
            $jsonVal = json_encode(array_values($incoming), JSON_UNESCAPED_UNICODE);
            Database::setSetting('cms_exchange_rates', $jsonVal);
            jsonResponse(['success' => true, 'data' => array_values($incoming), 'message' => 'Exchange rates saved to MySQL database']);
            break;

        // 25. Institutional Profiles (Admin Full CRUD + Frontend Display)
        case 'institutional_profiles':
            $stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'cms_institutional_profiles' LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch();
            $profiles = (!empty($row['setting_value'])) ? json_decode($row['setting_value'], true) : [];
            jsonResponse(['success' => true, 'data' => is_array($profiles) ? $profiles : []]);
            break;

        // 26. Admin: Save Institutional Profiles
        case 'save_institutional_profiles':
            $profiles = $input['profiles'] ?? ($input['data'] ?? []);
            if (!is_array($profiles)) {
                jsonResponse(['success' => false, 'message' => 'Invalid institutional profiles payload'], 400);
            }
            $jsonVal = json_encode(array_values($profiles), JSON_UNESCAPED_UNICODE);
            Database::setSetting('cms_institutional_profiles', $jsonVal);
            jsonResponse(['success' => true, 'data' => array_values($profiles), 'message' => 'Institutional profiles saved to MySQL database']);
            break;

        // 27. Get All Site Settings / CMS
        case 'site_settings':
            $all = Database::getAllSettings();
            jsonResponse(['success' => true, 'data' => $all]);
            break;

        // 28. Save Site Settings / CMS / Logo
        case 'save_site_settings':
        case 'save_logo':
            $settings = $input['settings'] ?? $input;
            if (isset($input['logoUrl']) || isset($input['coop_logo_url'])) {
                $logoUrl = trim($input['logoUrl'] ?? ($input['coop_logo_url'] ?? ''));
                if ($logoUrl !== '') {
                    Database::setSetting('coop_logo_url', $logoUrl);
                    $rawHeader = Database::getSetting('cms_header_config', '');
                    $headerObj = !empty($rawHeader) ? json_decode($rawHeader, true) : [];
                    if (!is_array($headerObj)) {
                        $headerObj = [];
                    }
                    $headerObj['logoUrl'] = $logoUrl;
                    Database::setSetting('cms_header_config', json_encode($headerObj, JSON_UNESCAPED_UNICODE));
                }
            }
            if (is_array($settings)) {
                foreach ($settings as $k => $v) {
                    if ($k === 'action' || $k === 'logoUrl') continue;
                    $valStr = is_scalar($v) ? (string)$v : json_encode($v, JSON_UNESCAPED_UNICODE);
                    Database::setSetting((string)$k, $valStr);
                }
            }
            jsonResponse([
                'success' => true,
                'message' => 'Settings and logo saved to MySQL database',
                'coop_logo_url' => Database::getSetting('coop_logo_url', 'assets/images/ekata-logo.svg')
            ]);
            break;

        default:
            jsonResponse([
                'success' => false,
                'message' => 'Invalid API action requested.',
                'available_actions' => [
                    'rates', 'notices', 'popup_notices', 'toggle_popup_notice', 'stats', 'login_member', 'login_office',
                    'session_status', 'logout', 'calculate_emi', 'calculate_deposit',
                    'apply_loan', 'apply_member', 'contact', 'submit_ekym',
                    'admin_ekym_list', 'admin_ekym_status', 'admin_loans_list',
                    'admin_loan_status', 'admin_members_list', 'admin_adjust_balance',
                    'exchange_rates', 'save_exchange_rates', 'institutional_profiles', 'save_institutional_profiles',
                    'site_settings', 'save_site_settings', 'save_logo', 'db_status'
                ]
            ], 404);
            break;
    }
} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Server Error: ' . $e->getMessage()
    ], 500);
}
