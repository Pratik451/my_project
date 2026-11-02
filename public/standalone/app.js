/**
 * ANKUR SAVING & CREDIT COOPERATIVE LTD.
 * File: app.js
 * Pure Vanilla JavaScript (No React / No TypeScript / No Node required)
 */

(function () {
  'use strict';

  // State
  let currentLang = 'en';

  // Details Data for Modals
  const MODAL_DATA = {
    // INSTITUTIONAL PROFILE
    'about-intro': {
      titleEn: 'Institutional Profile - Ankur Cooperative',
      titleNp: 'संस्थागत परिचय - अंकुर सहकारी संस्था लि.',
      icon: '▥',
      descEn: 'Ankur Saving & Credit Cooperative Ltd. was established in 2057 B.S. in Butwal-4, Rupandehi. Governed under Nepal Cooperative Act, certified A-Grade community institution.',
      descNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. वि.सं. २०५७ मा बुटवल-४, रुपन्देहीमा स्थापना भएको "क" वर्गको समुदायमा आधारित अग्रणी सहकारी संस्था हो।',
      pointsEn: [
        'Registration No: 245/056/057 • Established 2057 B.S.',
        'Over 14,850 active verified members and modern service centers.',
        'Audited capital base exceeding Rs. 1.14 Billion with 22.40% liquidity.',
        'Certified Grade-A cooperative by National Cooperative Federation.'
      ],
      pointsNp: [
        'दर्ता नं: २४५/०५६/०५७ • स्थापना: २०५७ वि.सं.',
        '१४,८५० भन्दा बढी सक्रिय सेयर सदस्यहरू र आधुनिक शाखा सेवा केन्द्रहरू।',
        'रु. १.१४ अर्बभन्दा बढीको कुल वासलात र २२.४०% सुरक्षित तरलता अनुपात।',
        'राष्ट्रिय सहकारी महासंघ तथा नियमनकारी निकायबाट "क" वर्ग प्रमाणित संस्था।'
      ],
      actionEn: 'Download Corporate Profile',
      actionNp: 'संस्थागत प्रोफाइल डाउनलोड'
    },

    // LOGIN PORTALS
    'login-member': {
      titleEn: 'Member Portal Login',
      titleNp: 'सदस्य पोर्टल लगइन',
      icon: '👤',
      descEn: 'Secure online banking and passbook login for verified cooperative members. Check your deposit balances, statements, and loan payment schedules.',
      descNp: 'अंकुर सहकारीका सेयर सदस्यहरूका लागि अनलाइन खाता, बचत मौज्दात र कारोबार विवरण हेर्ने सुरक्षित लगइन।',
      pointsEn: [
        'Demo Member ID: ANKUR-10482',
        'Default Password / PIN: ••••••••',
        'Protected by 256-Bit SSL Encryption & SMS OTP validation.',
        'Immediate online passbook statement access.'
      ],
      pointsNp: [
        'डेमो सदस्य परिचय नं: ANKUR-10482',
        'गोप्य पासवर्ड / पिन: ••••••••',
        '२५६-बिट एसएसएल इन्क्रिप्सन तथा एसएमएस ओटिपीबाट सुरक्षित।',
        'अनलाइन पासबुक तथा बचत स्टेटमेन्ट तुरुन्त हेर्न मिल्ने।'
      ],
      actionEn: 'Sign In to Member Portal',
      actionNp: 'सदस्य पोर्टलमा लगइन गर्नुहोस्'
    },
    'login-office': {
      titleEn: 'Office / Admin CBS Login',
      titleNp: 'कार्यालय / प्रशासन लगइन',
      icon: '🏢',
      descEn: 'Authorized access for cooperative officers, accountants, and branch managers to core banking operations.',
      descNp: 'अधिकृत कर्मचारी तथा प्रशासनका लागि कोर बैंकिङ प्रणाली, कर्जा स्वीकृति, केवाइसी प्रमाणीकरण र लेखा व्यवस्थापन।',
      pointsEn: [
        'Staff ID & Cryptographic Token Required (e.g. STAFF-ADM09).',
        'Strict audit logging and static IP verification enabled.',
        'For security support, contact IT Department at 071-540123.'
      ],
      pointsNp: [
        'कर्मचारी आइडी र सुरक्षा टोकन अनिवार्य (जस्तै STAFF-ADM09)।',
        'कडा सुरक्षा अडिट लग र आइपी प्रमाणीकरण सक्रिय।',
        'प्राविधिक सहायताको लागि बुटवल केन्द्रीय कार्यालय ०७१-५४०१२३ मा सम्पर्क गर्नुहोस्।'
      ],
      actionEn: 'Enter Admin Console',
      actionNp: 'प्रशासन कन्सोलमा प्रवेश गर्नुहोस्'
    },

    // 6 SERVICES
    'member-service': {
      titleEn: 'Member Services & Welfare Schemes',
      titleNp: 'सदस्य सेवा तथा कल्याणकारी सुविधा',
      icon: '👥',
      descEn: 'Comprehensive membership onboarding, share capital issuance, welfare relief fund, and member patron bonus dividend.',
      descNp: 'नयाँ सदस्यता दर्ता, सेयर प्रमाणपत्र जारी, सदस्य शिक्षा तालिम र सामाजिक सुरक्षा योजनाहरू।',
      pointsEn: [
        'Member Share Capital: 18% annual return ceiling compliance.',
        'Member Welfare Relief Fund: Up to Rs. 50,000 medical emergency assistance.',
        'Maternity Nutrition Allowance: Rs. 10,000 for female member childbirth.',
        'Cooperative Education: Regular financial literacy and entrepreneurship workshops.'
      ],
      pointsNp: [
        'सदस्य सेयर पुँजी: ऐन-नियम अनुसार आकर्षक वार्षिक सेयर लाभांश वितरण।',
        'सदस्य राहत तथा कल्याणकारी कोष: आकस्मिक स्वास्थ्य उपचारमा रु. ५०,००० सम्म सहयोग।',
        'सुत्केरी पोषण स्याहार भत्ता: महिला सदस्य वा सदस्यका श्रीमतीलाई रु. १०,००० सहयोग।',
        'सहकारी शिक्षा तथा तालिम: वित्तीय साक्षरता र साना उद्यमशीलता तालिमहरू।'
      ],
      actionEn: 'Apply for Membership',
      actionNp: 'सदस्यताका लागि आवेदन'
    },
    'deposit-product': {
      titleEn: 'Deposit Products & High-Yield Savings',
      titleNp: 'बचत तथा निक्षेप योजनाहरू',
      icon: '🪙',
      descEn: 'Flexible regular, recurring, child future, senior citizen, and fixed term deposits up to 11.75% per annum.',
      descNp: 'दैनिक ब्याज गणना हुने साधारण, आवधिक, बाल, ज्येष्ठ नागरिक तथा ११.७५% सम्म आकर्षक मुद्दती निक्षेप।',
      pointsEn: [
        'Regular Savings Account: 7.25% p.a., free mobile banking.',
        'Ankur Golden Fixed Deposit: 11.75% p.a., quarterly interest payout.',
        'Child Bright Future Scheme: 9.00% p.a., built for education.',
        'Senior Citizen Honor Fund: 9.50% p.a., priority counter service.'
      ],
      pointsNp: [
        'साधारण बचत खाता: ७.२५% ब्याजदर, निःशुल्क मोबाइल बैंकिङ।',
        'अंकुर स्वर्ण मुद्दती निक्षेप: ११.७५% सम्म त्रैमासिक ब्याज भुक्तानी।',
        'बाल उज्ज्वल भविष्य बचत: ९.००% वार्षिक ब्याज, उच्च शिक्षा योजना।',
        'ज्येष्ठ नागरिक सम्मान कोष: ९.५०% ब्याज, प्राथमिकता काउन्टर सेवा।'
      ],
      actionEn: 'Open Deposit Account',
      actionNp: 'खाता खोल्नुहोस्'
    },
    'loan': {
      titleEn: 'Productive Loans & Credit Facilities',
      titleNp: 'उत्पादनमूलक कर्जा तथा ऋण सुविधा',
      icon: '💼',
      descEn: 'Affordable, low-interest productive credit for agriculture, small enterprises, retail trade, and housing.',
      descNp: 'कृषि, साना व्यवसाय, व्यापार, आवास निर्माण तथा सवारी साधन खरिदका लागि सुलभ कर्जा।',
      pointsEn: [
        'Agriculture & Livestock Credit: Subsidized rate starting at 12.00%.',
        'Micro & Small Business Loan: Quick disbursement up to Rs. 1.50 Crore.',
        'Cooperative Home Construction Loan: Flexible tenure up to 15 years.',
        'Easy collateral assessment and minimal documentation fees.'
      ],
      pointsNp: [
        'कृषि तथा पशुपालन कर्जा: सहुलियतपूर्ण १२.००% बाट सुरु हुने ब्याजदर।',
        'साना तथा मझौला व्यापार कर्जा: रु. १.५० करोडसम्म छिटो कर्जा प्रवाह।',
        'सहकारी आवास निर्माण कर्जा: १५ वर्षसम्म लामो भुक्तानी अवधि।',
        'सहज धितो मूल्यांकन तथा न्यूनतम सेवा शुल्क।'
      ],
      actionEn: 'Apply for Loan',
      actionNp: 'कर्जा आवेदन गर्नुहोस्'
    },
    'remittance': {
      titleEn: 'Fast & Secure Remittance Services',
      titleNp: 'सुरक्षित रेमिट्यान्स सेवा',
      icon: '↗',
      descEn: 'Instant domestic and international payout via Prabhu, IME, Western Union, City Express, and Global IME.',
      descNp: 'विश्वका जुनसुकै देशबाट पठाएको रकम प्रभु, आइएमई तथा वेस्टर्न युनियनमार्फत तत्काल काउन्टर भुक्तानी।',
      pointsEn: [
        'Instant Counter Cash Payout at all service centers.',
        'Direct credit to Ankur savings accounts with zero remittance fee.',
        'Authorized partnership with all major national money transfer agencies.',
        'Instant SMS alerts to beneficiary upon cash availability.'
      ],
      pointsNp: [
        'सबै शाखा तथा सेवा केन्द्रहरूबाट तत्काल नगद भुक्तानी।',
        'सहकारीको बचत खातामा सिधै निःशुल्क रकम जम्मा हुने सुविधा।',
        'आइएमई, प्रभु, वेस्टर्न युनियन तथा मुख्य रेमिट एजेन्सीसँग सहकार्य।',
        'रकम प्राप्त हुनासाथ तत्काल एसएमएस सन्देश।'
      ],
      actionEn: 'Locate Payout Center',
      actionNp: 'भुक्तानी काउन्टर खोज्नुहोस्'
    },
    'insurance': {
      titleEn: 'Cooperative Insurance & Safety Schemes',
      titleNp: 'बिमा तथा सुरक्षण योजनाहरू',
      icon: '🛡️',
      descEn: 'Member health & accidental micro-insurance, livestock/crop safety protection, and borrower loan-cover schemes.',
      descNp: 'सदस्य स्वास्थ्य तथा दुर्घटना लघुबिमा, पशुधन तथा बाली सुरक्षण र कर्जा जोखिम सुरक्षा बिमा।',
      pointsEn: [
        'Member Life & Accidental Micro-Insurance coverage up to Rs. 200,000.',
        'Livestock & High-Yield Crop Insurance with government subsidy coordination.',
        'Borrower Loan-Loss Protection: Safeguarding guarantor and nominee.',
        'Direct claim settlement assistance through dedicated cooperative desks.'
      ],
      pointsNp: [
        'सदस्य जीवन तथा दुर्घटना लघुबिमा: रु. २,००,००० सम्मको सुरक्षित बिमा सुविधा।',
        'पशुधन तथा बाली बिमा: सरकारी अनुदानसहित आधुनिक कृषि सुरक्षण।',
        'कर्जा सुरक्षण बिमा: ऋणीको आकस्मिक मृत्यु वा अशक्ततामा परिवारलाई ऋणमुक्त राख्ने।',
        'दाबी भुक्तानीमा सहकारीका कर्मचारीहरूद्वारा सहजीकरण र छिटो प्रक्रिया।'
      ],
      actionEn: 'Inquire Insurance Details',
      actionNp: 'बिमा सम्बन्धी सोधपुछ'
    },
    'digital-services': {
      titleEn: 'Digital Services & Smart Banking',
      titleNp: 'डिजिटल सेवाहरू तथा स्मार्ट बैंकिङ',
      icon: '📱',
      descEn: 'Carry Ankur Cooperative on your phone with mobile banking, NepalPay QR merchant payments, and 24/7 transfers.',
      descNp: 'आफ्नो मोबाइलबाटै नेपालपे क्युआर भुक्तानी, अन्तर-बैंक रकम स्थानान्तरण र बिल भुक्तानी।',
      pointsEn: [
        'Instant Inter-Bank & Cooperative Fund Transfers.',
        'Scan & Pay at over 500,000 QR merchants nationwide.',
        'Utility Bill Settlement (NEA, Khanepani, NTC, Ncell, Internet, TV).',
        'Biometric Fingerprint & Face ID secure login protection.'
      ],
      pointsNp: [
        'तत्काल अन्तर-बैंक तथा सहकारी खातामा रकम स्थानान्तरण।',
        'नेपालभरिका ५ लाखभन्दा बढी क्युआर मर्चेन्टहरूमा स्क्यान गरी भुक्तानी।',
        'विद्युत, खानेपानी, मोबाइल रिचार्ज, टिभी तथा इन्टरनेट महसुल भुक्तानी।',
        'बायोमेट्रिक फिंगरप्रिन्ट र फेश आइडी सुरक्षा प्रणाली।'
      ],
      actionEn: 'Download Smart App',
      actionNp: 'एप डाउनलोड गर्नुहोस्'
    },

    // REPORTS (Monthly, Progress, Annual, Audit)
    'reports-monthly': {
      titleEn: 'Monthly Financial & Transaction Report',
      titleNp: 'मासिक वित्तीय कारोबार प्रतिवेदन',
      icon: '📅',
      descEn: 'Monthly summary of savings mobilization, loan repayments, liquidity position, and operational highlights.',
      descNp: 'केन्द्रीय कार्यालय र सेवा केन्द्रहरूको मासिक बचत संकलन, कर्जा असुली, तरलता अनुपात तथा मासिक कारोबार प्रगतिको विवरण।',
      pointsEn: [
        'Total Monthly Deposit Inflow: Rs. 14.80 Crore.',
        'Monthly Loan Disbursement: Rs. 11.20 Crore.',
        'Liquidity Cushion Kept: 22.40% (Compliant with Co-op Act).',
        'Active Transactions Executed: 48,500+ across counters & digital app.'
      ],
      pointsNp: [
        'मासिक बचत निक्षेप संकलन: रु. १४.८० करोड।',
        'मासिक कर्जा लगानी तथा प्रवाह: रु. ११.२० करोड।',
        'तरलता मौज्दात: २२.४०% (सहकारी मापदण्डभन्दा सुरक्षित)।',
        'मासिक सम्पन्न कारोबार संख्या: ४८,५०० भन्दा बढी।'
      ],
      actionEn: 'Download Monthly PDF',
      actionNp: 'मासिक प्रतिवेदन डाउनलोड'
    },
    'reports-progress': {
      titleEn: 'Progress Report & Developmental Metrics',
      titleNp: 'संस्थागत प्रगति प्रतिवेदन तथा लक्ष्य सूचकाङ्क',
      icon: '📈',
      descEn: 'Quarterly progress report evaluating member growth, PEARLS institutional indicators, recovery targets, and community development.',
      descNp: 'सदस्य संख्या वृद्धि, PEARLS सूचकाङ्क, कर्जा असुली लक्ष्य र सामाजिक विकास योजनाहरूको त्रैमासिक प्रगति समीक्षा प्रतिवेदन।',
      pointsEn: [
        'Total Active Shareholder Members: 12,500+ with 100% KYC.',
        'Productive Loan Portfolio: 86% allocated to agriculture & local enterprises.',
        'Community Training Workshops Conducted: 24 batches this quarter.',
        'Zero Delinquency Target: 98.4% on-time EMI recovery achieved.'
      ],
      pointsNp: [
        'सक्रिय सेयर सदस्य संख्या: १२,५००+ (पूर्ण eKYC प्रमाणीकरण)।',
        'उत्पादनमूलक कर्जा अंश: ८६% कृषि, पशुपालन र साना उद्यममा लगानी।',
        'समुदाय तथा सदस्य सीपमूलक तालिम: यस त्रैमासमा २४ वटा ब्याच सम्पन्न।',
        'कर्जा असुली दर: ९८.४% समयमै किस्ता भुक्तानी।'
      ],
      actionEn: 'Download Progress Report',
      actionNp: 'प्रगति प्रतिवेदन डाउनलोड'
    },
    'reports-annual': {
      titleEn: 'Annual Report (24th AGM Book)',
      titleNp: 'वार्षिक प्रतिवेदन (२४औं साधारण सभा)',
      icon: '📑',
      descEn: 'Comprehensive annual report approved by the Annual General Meeting, featuring audited statements, BOD summary, and dividend distribution.',
      descNp: 'वार्षिक साधारण सभाबाट पारित आधिकारिक वार्षिक प्रतिवेदन, वासलात, नाफा-नोक्सान हिसाब र लाभांश वितरण अभिलेख।',
      pointsEn: [
        'Share Capital: Rs. 14.50 Crore | Total Deposits: Rs. 82.60 Crore.',
        'Total Loans Invested: Rs. 71.80 Crore in productive sectors.',
        'Net Institutional Capital & Reserve: Rs. 7.20 Crore.',
        'Annual Dividend: 14% proposed & approved by the Assembly.'
      ],
      pointsNp: [
        'सेयर पुँजी: रु. १४.५० करोड | बचत मौज्दात: रु. ८२.६० करोड।',
        'उत्पादनशील क्षेत्रमा कुल कर्जा लगानी: रु. ७१.८० करोड।',
        'संस्थागत जगेडा कोष: रु. ७.२० करोड सुरक्षित सञ्चित।',
        'वार्षिक सेयर लाभांश: १४% साधारण सभाबाट सर्वसम्मत पारित।'
      ],
      actionEn: 'Download Annual Report (PDF)',
      actionNp: 'वार्षिक प्रतिवेदन डाउनलोड (PDF)'
    },
    'reports-audit': {
      titleEn: 'Audit Report (Statutory Inspection)',
      titleNp: 'लेखापरीक्षण प्रतिवेदन (आधिकारिक अडिट)',
      icon: '⚖',
      descEn: 'Statutory independent audit statement issued by Certified Chartered Accountants certifying accounts, liquidity ratios, and regulatory compliance.',
      descNp: 'आधिकारिक चार्टर्ड एकाउन्ट्यान्टबाट सम्पादित स्वतन्त्र बाह्य लेखापरीक्षण, वित्तीय स्थायित्व र संस्थागत अनुशासन प्रमाणीकरण।',
      pointsEn: [
        'Auditor: Registered Chartered Accountants (Auditor Grade A).',
        'Audit Verdict: Clean & Unqualified Opinion without remarks.',
        '100% compliance with Nepal Cooperative Act, 2074 & Directives.',
        'All statutory reserves and patron bonuses fully safeguarded.'
      ],
      pointsNp: [
        'लेखापरीक्षक: नेपाल सरकार स्वीकृत "क" वर्गका चार्टर्ड एकाउन्ट्यान्ट्स।',
        'लेखापरीक्षण राय: पूर्ण रूपमा स्वच्छ र बेरुजुमुक्त (Clean Opinion)।',
        'सहकारी ऐन, २०७४ तथा नेपाल राष्ट्र बैंक निर्देशिकाको पूर्ण परिपालना।',
        'सबै कानुनी जगेडा तथा सदस्य कोषहरू पूर्ण सुरक्षित।'
      ],
      actionEn: 'Download Audit Statement',
      actionNp: 'लेखापरीक्षण विवरण डाउनलोड'
    },

    // CAREER (Opening Vacancies, Eligibility & Criteria, Application Process)
    'career-vacancies': {
      titleEn: 'Opening Vacancies in Ankur Cooperative',
      titleNp: 'खुला पदपूर्ति विज्ञापन तथा जागिरका अवसरहरू',
      icon: '📢',
      descEn: 'Ankur Saving & Credit Cooperative invites applications from qualified Nepali citizens for vacant positions at Head Office and Service Centers.',
      descNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. का लागि तपसिल बमोजिमका पदहरूमा खुला प्रतिस्पर्धाद्वारा पदपूर्ति गर्न दरखास्त आह्वान गरिन्छ।',
      pointsEn: [
        '1. Branch Manager (शाखा प्रमुख) - 2 Positions | Min. BBS/BBA/MBA with 3 yrs experience.',
        '2. Credit / Loan Officer (कर्जा अधिकृत) - 3 Positions | BBS/BBA with 2 yrs credit experience.',
        '3. Junior Assistant / Teller (कनिष्ठ सहायक) - 5 Positions | 10+2 passed with computer skills.',
        '4. IT & Digital Support Assistant - 1 Position | Diploma / BSc.CSIT / BCA.',
        'Deadline: 2083 Ashwin 25 (October 11) | Age: 18 to 35 years.'
      ],
      pointsNp: [
        '१. शाखा प्रमुख (Branch Manager) - २ जना | योग्यता: BBS/BBA/MBA, ३ वर्ष अनुभव।',
        '२. कर्जा अधिकृत (Loan Officer) - ३ जना | योग्यता: BBS/BBA, २ वर्ष अनुभव।',
        '३. कनिष्ठ सहायक / काउन्टर टेलर - ५ जना | योग्यता: +२ उत्तीर्ण, कम्प्युटर ज्ञान।',
        '४. सूचना प्रविधि सहायक (IT Support) - १ जना | योग्यता: IT मा डिप्लोमा वा स्नातक।',
        'दरखास्त दिने अन्तिम मिति: २०८३ असोज २५ गते साँझ ५:०० बजेसम्म।'
      ],
      actionEn: 'Download Application Form',
      actionNp: 'दरखास्त फाराम डाउनलोड'
    },
    'career-requirements': {
      titleEn: 'Eligibility & Selection Criteria',
      titleNp: 'न्यूनतम शैक्षिक योग्यता तथा छनोट मापदण्ड',
      icon: '📋',
      descEn: 'Detailed eligibility, age restrictions, and required documentation for applicant evaluation.',
      descNp: 'उम्मेदवारहरूको शैक्षिक योग्यता, कार्यअनुभव, उमेर सीमा र मूल्यांकनका आधारहरू।',
      pointsEn: [
        'Citizenship: Must be a permanent resident of Nepal.',
        'Age Limit: 18 completed and not exceeding 35 years on deadline date.',
        'Skills: Good command of banking software, MS Office, and accounting principles.',
        'Selection Mode: Written examination, computer test, and personal interview.'
      ],
      pointsNp: [
        'नागरिकता: नेपाली नागरिक भएको हुनुपर्ने।',
        'उमेर सीमा: दरखास्त दिने अन्तिम मितिसम्म १८ वर्ष पूरा भई ३५ वर्ष ननाघेको।',
        'सीप: सहकारी बैंकिङ सफ्टवेयर, नेपाली/अंग्रेजी टाइपिङ र कम्प्युटरमा दक्ष।',
        'छनोट प्रक्रिया: लिखित परीक्षा, कम्प्युटर प्रयोगात्मक परीक्षा र अन्तर्वार्ता।'
      ],
      actionEn: 'View Job Syllabus',
      actionNp: 'पाठ्यक्रम तथा मापदण्ड हेर्नुहोस्'
    },
    'career-process': {
      titleEn: 'Application Process & Submission Instructions',
      titleNp: 'दरखास्त पेश गर्ने तरिका र निर्देशन',
      icon: '✉',
      descEn: 'Step-by-step instructions on submitting application forms, certificates, and curriculum vitae.',
      descNp: 'दरखास्त फाराम भर्ने, कागजात संलग्न गर्ने र पेश गर्ने आधिकारिक प्रक्रिया।',
      pointsEn: [
        'Step 1: Download the official Ankur Application Form from the website.',
        'Step 2: Attach copies of citizenship, academic transcripts, and experience letters.',
        'Step 3: Email scanned set to career@ekatacoop.com.np or submit in person at Butwal Head Office.',
        'Shortlisted candidates will be contacted via SMS and phone call for written exam.'
      ],
      pointsNp: [
        'पहिलो चरण: वेबसाइटबाट आधिकारिक दरखास्त फाराम डाउनलोड गरी भर्ने।',
        'दोस्रो चरण: नागरिकता, शैक्षिक प्रमाणपत्र, तालिम तथा अनुभवको प्रतिलिपि संलग्न गर्ने।',
        'तेस्रो चरण: सम्पूर्ण कागजात career@ekatacoop.com.np मा इमेल वा केन्द्रीय कार्यालय बुटवलमा बुझाउने।',
        'सर्टलिस्टमा परेका उम्मेदवारहरूलाई परीक्षाका लागि फोन वा एसएमएसमार्फत जानकारी गराइनेछ।'
      ],
      actionEn: 'Email Application',
      actionNp: 'इमेलमार्फत आवेदन पठाउनुहोस्'
    },

    // CONTACT
    'contact-info': {
      titleEn: 'Contact Ankur Cooperative',
      titleNp: 'सम्पर्क तथा सेवा केन्द्रहरू',
      icon: '✉',
      descEn: 'Connect with our head office, regional service desks, and member helpline for swift financial service assistance.',
      descNp: 'केन्द्रीय कार्यालय, शाखा सेवा केन्द्रहरू र टोल-फ्री सदस्य सहायता डेस्कमा सम्पर्क गर्नुहोस्।',
      pointsEn: [
        'Head Office: Main Road, Butwal-4, Rupandehi • Tel: 071-540123 / 540456',
        'Service Centers: Traffic Chowk (071-541111) | Milanchowk (071-542222) | Golpark (071-543333)',
        'Official Email: info@ekatacoop.com.np | Website: www.ekatacoop.com.np',
        'Toll-Free Member Helpline: 1660-01-99887 (Sunday to Friday, 10 AM - 5 PM)'
      ],
      pointsNp: [
        'केन्द्रीय कार्यालय: मुख्य सडक, बुटवल-४, रुपन्देही • फोन: ०७१-५४०१२३ / ५४०४५६',
        'शाखा सेवा केन्द्रहरू: ट्राफिक चोक (०७१-५४११११), मिलनचोक (०७१-५४२२२२), गोलपार्क (०७१-५४३३३३)',
        'इमेल: info@ekatacoop.com.np • वेबसाइट: www.ekatacoop.com.np',
        'निःशुल्क सदस्य हटलाइन: १६६०-०१-९९८८७ (आइतबारदेखि शुक्रबार बिहान १० देखि ५ सम्म)'
      ],
      actionEn: 'Call Helpline (1660-01-99887)',
      actionNp: 'हटलाइनमा फोन गर्नुहोस् (1660-01-99887)'
    }
  };

  // DOM Elements
  const modalOverlay = document.getElementById('appModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalIcon = document.getElementById('modalIcon');
  const modalDesc = document.getElementById('modalDesc');
  const modalPoints = document.getElementById('modalPoints');
  const modalActionBtn = document.getElementById('modalActionBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');

  // Open Modal Function
  function openModal(key) {
    const data = MODAL_DATA[key];
    if (!data) return;

    const isNp = currentLang === 'np';
    modalTitle.textContent = isNp ? data.titleNp : data.titleEn;
    modalIcon.textContent = data.icon;
    modalDesc.textContent = isNp ? data.descNp : data.descEn;

    modalPoints.innerHTML = '';
    const points = isNp ? data.pointsNp : data.pointsEn;
    points.forEach(function (pt) {
      const li = document.createElement('li');
      li.textContent = pt;
      modalPoints.appendChild(li);
    });

    modalActionBtn.textContent = isNp ? data.actionNp : data.actionEn;
    modalOverlay.classList.add('active');
  }

  // Close Modal Function
  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  // Bind Close Events
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Bind All Triggers
  document.querySelectorAll('[data-modal-target]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const target = el.getAttribute('data-modal-target');
      openModal(target);
    });
  });

  // Language Switcher
  const langSwitchBtn = document.getElementById('langSwitchBtn');
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', function () {
      currentLang = currentLang === 'en' ? 'np' : 'en';
      langSwitchBtn.textContent = currentLang === 'en' ? 'नेपाली' : 'English';

      // Toggle elements with data-lang-en and data-lang-np
      document.querySelectorAll('[data-lang-en]').forEach(function (el) {
        const text = currentLang === 'np' ? el.getAttribute('data-lang-np') : el.getAttribute('data-lang-en');
        if (text) el.textContent = text;
      });
    });
  }

  // Loan EMI Calculator
  const loanAmountSlider = document.getElementById('loanAmountSlider');
  const loanInterestSlider = document.getElementById('loanInterestSlider');
  const loanTenureSlider = document.getElementById('loanTenureSlider');

  const amountDisplay = document.getElementById('amountDisplay');
  const rateDisplay = document.getElementById('rateDisplay');
  const tenureDisplay = document.getElementById('tenureDisplay');

  const emiAmountDisplay = document.getElementById('emiAmountDisplay');
  const totalInterestDisplay = document.getElementById('totalInterestDisplay');
  const totalPaymentDisplay = document.getElementById('totalPaymentDisplay');

  function calculateEMI() {
    if (!loanAmountSlider) return;
    const P = parseFloat(loanAmountSlider.value);
    const annualRate = parseFloat(loanInterestSlider.value);
    const months = parseInt(loanTenureSlider.value, 10);

    const r = (annualRate / 12) / 100;
    let emi = 0;
    if (r > 0) {
      emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    } else {
      emi = P / months;
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;

    amountDisplay.textContent = 'Rs. ' + P.toLocaleString();
    rateDisplay.textContent = annualRate.toFixed(2) + '%';
    tenureDisplay.textContent = months + ' Months (' + (months / 12).toFixed(1) + ' Yrs)';

    emiAmountDisplay.textContent = 'Rs. ' + Math.round(emi).toLocaleString();
    totalInterestDisplay.textContent = 'Rs. ' + Math.round(totalInterest).toLocaleString();
    totalPaymentDisplay.textContent = 'Rs. ' + Math.round(totalPayment).toLocaleString();
  }

  if (loanAmountSlider && loanInterestSlider && loanTenureSlider) {
    loanAmountSlider.addEventListener('input', calculateEMI);
    loanInterestSlider.addEventListener('input', calculateEMI);
    loanTenureSlider.addEventListener('input', calculateEMI);
    calculateEMI();
  }

  // Constant / Fixed Navbar Scroll Effect
  window.addEventListener('scroll', function () {
    const fixedHeader = document.querySelector('.fixed-header-wrapper') || document.querySelector('.main-header');
    const mainHeader = document.querySelector('.main-header');
    if (fixedHeader) {
      if (window.scrollY > 30) {
        fixedHeader.classList.add('is-scrolled');
        if (mainHeader) mainHeader.classList.add('is-scrolled');
      } else {
        fixedHeader.classList.remove('is-scrolled');
        if (mainHeader) mainHeader.classList.remove('is-scrolled');
      }
    }
  }, { passive: true });

})();
