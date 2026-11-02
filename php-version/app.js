/**
 * EKATA SAVING & CREDIT COOPERATIVE LTD.
 * File: php-version/app.js
 * Vanilla JavaScript Frontend Controller with PHP REST API Integration
 */

(function () {
  'use strict';

  let currentLang = 'en';

  // Details Data for Information Modals
  const MODAL_DATA = {
    'about-intro': {
      titleEn: 'Institutional Profile - Ekata Cooperative',
      titleNp: 'संस्थागत परिचय - एकता सहकारी संस्था लि.',
      icon: '▥',
      descEn: 'Ekata Saving & Credit Cooperative Ltd. was established in 2057 B.S. in Butwal-4, Rupandehi. Governed under Nepal Cooperative Act, certified A-Grade community institution.',
      descNp: 'एकता बचत तथा ऋण सहकारी संस्था लि. वि.सं. २०५७ मा बुटवल-४, रुपन्देहीमा स्थापना भएको "क" वर्गको समुदायमा आधारित अग्रणी सहकारी संस्था हो।',
      pointsEn: [
        'Registration No: 245/056/057 • Jurisdiction: Lumbini Province.',
        'Over 12,500 active verified members and 4 convenient service centers.',
        'Audited capital base exceeding Rs. 1.14 Billion with 22.40% liquidity ratio.',
        'Certified Grade-A cooperative by National Cooperative Federation.'
      ],
      pointsNp: [
        'दर्ता नं: २४५/०५६/०५७ • कार्यक्षेत्र: लुम्बिनी प्रदेश।',
        '१२,५०० भन्दा बढी सक्रिय सेयर सदस्यहरू र ४ वटा आधुनिक शाखा सेवा केन्द्रहरू।',
        'रु. १.१४ अर्बभन्दा बढीको कुल वासलात र २२.४०% सुरक्षित तरलता अनुपात।',
        'राष्ट्रिय सहकारी महासंघ तथा नियमनकारी निकायबाट "क" वर्ग प्रमाणित संस्था।'
      ],
      actionEn: 'Apply for Membership',
      actionNp: 'सदस्यताका लागि आवेदन',
      actionTarget: 'apply-membership'
    },
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
      actionEn: 'Become a Member',
      actionNp: 'सदस्य बन्नुहोस्',
      actionTarget: 'apply-membership'
    },
    'deposit-product': {
      titleEn: 'Deposit Products & High-Yield Savings',
      titleNp: 'बचत तथा निक्षेप योजनाहरू',
      icon: '🪙',
      descEn: 'Flexible regular, recurring, child future, senior citizen, and fixed term deposits up to 11.75% per annum.',
      descNp: 'दैनिक ब्याज गणना हुने साधारण, आवधिक, बाल, ज्येष्ठ नागरिक तथा ११.७५% सम्म आकर्षक मुद्दती निक्षेप।',
      pointsEn: [
        'Regular Savings Account: 7.25% p.a., free mobile banking & cheque book.',
        'Ekata Golden Fixed Deposit: 11.75% p.a., quarterly credited interest.',
        'Child Bright Future Scheme: 9.00% p.a., structured compounding for education.',
        'Senior Citizen Honor Fund: 9.50% p.a., priority counter service.'
      ],
      pointsNp: [
        'साधारण बचत खाता: ७.२५% ब्याजदर, निःशुल्क मोबाइल बैंकिङ।',
        'एकता स्वर्ण मुद्दती निक्षेप: ११.७५% सम्म त्रैमासिक ब्याज भुक्तानी।',
        'बाल उज्ज्वल भविष्य बचत: ९.००% वार्षिक ब्याज, उच्च शिक्षा योजना।',
        'ज्येष्ठ नागरिक सम्मान कोष: ९.५०% ब्याज, प्राथमिकता काउन्टर सेवा।'
      ],
      actionEn: 'Open Deposit Account',
      actionNp: 'खाता खोल्नुहोस्',
      actionTarget: 'apply-membership'
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
        'Transparent diminishing balance calculations and minimal processing fees.'
      ],
      pointsNp: [
        'कृषि तथा पशुपालन कर्जा: सहुलियतपूर्ण १२.००% बाट सुरु हुने ब्याजदर।',
        'साना तथा मझौला व्यापार कर्जा: रु. १.५० करोडसम्म छिटो कर्जा प्रवाह।',
        'सहकारी आवास निर्माण कर्जा: १५ वर्षसम्म लामो भुक्तानी अवधि।',
        'पारदर्शी ह्रासमान ब्याज गणना तथा न्यूनतम सेवा शुल्क।'
      ],
      actionEn: 'Apply for Loan',
      actionNp: 'कर्जा आवेदन गर्नुहोस्',
      actionTarget: 'apply-loan'
    },
    'remittance': {
      titleEn: 'Remittance Services',
      titleNp: 'रेमिट्यान्स सेवा',
      icon: '↗',
      descEn: 'Instant domestic and international money transfer payout right from our Butwal counters.',
      descNp: 'देश तथा विदेशबाट पठाएको रकम प्रभु, आइएमई तथा वेस्टर्न युनियनमार्फत तत्काल काउन्टर भुक्तानी।',
      pointsEn: [
        'Authorized payout partners: Prabhu, IME, Western Union, Global Remit, City Express.',
        'Direct deposit to member savings account with real-time SMS alert.',
        'Safe, government-regulated anti-money laundering compliance.'
      ],
      pointsNp: [
        'आधिकारिक साझेदार: प्रभु रेमिट, आइएमई, वेस्टर्न युनियन, सिटी एक्सप्रेस।',
        'सिधै सदस्य बचत खातामा रकम जम्मा तथा तत्काल एसएमएस सूचना।',
        'सुरक्षित तथा नियमनकारी मापदण्ड पूर्ण पालना।'
      ],
      actionEn: 'Contact Desk',
      actionNp: 'सम्पर्क गर्नुहोस्',
      actionTarget: 'contact-info'
    },
    'insurance': {
      titleEn: 'Micro-Insurance & Protection',
      titleNp: 'सुरक्षण तथा बिमा सेवा',
      icon: '🛡️',
      descEn: 'Member health, accidental safety micro-insurance, livestock/crop safety, and loan risk protection.',
      descNp: 'सदस्य दुर्घटना तथा स्वास्थ्य सुरक्षा, पशुधन तथा बाली बिमा र कर्जा सुरक्षण सुविधा।',
      pointsEn: [
        'Accidental death and permanent disability coverage up to Rs. 500,000.',
        'Livestock and agriculture insurance for rural borrower stability.',
        'Credit life insurance protecting borrower families from debt distress.'
      ],
      pointsNp: [
        'दुर्घटना मृत्यु तथा अशक्ततामा रु. ५ लाखसम्मको सुरक्षा बिमा।',
        'पशुपालन तथा बाली सुरक्षण बिमा सहकार्य।',
        'कर्जा सुरक्षणद्वारा परिवारलाई आर्थिक भारबाट मुक्ति।'
      ],
      actionEn: 'Learn More',
      actionNp: 'थप जानकारी',
      actionTarget: 'contact-info'
    },
    'digital-services': {
      titleEn: 'Digital Banking - Ekata Smart Mobile',
      titleNp: 'डिजिटल बैंकिङ - एकता स्मार्ट',
      icon: '📱',
      descEn: '24/7 mobile banking on Android & iOS, interoperable NepalPay QR merchant payments, utility bills and bank transfers.',
      descNp: 'एकता स्मार्ट मोबाइल एप, नेपालपे क्युआर, बिजुली/खानेपानी महसुल भुक्तानी तथा अन्तरबैंक रकम ट्रान्सफर।',
      pointsEn: [
        'Ekata Smart App: Available on Google Play Store & Apple App Store.',
        'NepalPay QR: Scan and pay at any merchant across Nepal.',
        'Instant Interbank Fund Transfer to any commercial bank in Nepal.',
        'Utility bill payments: NEA Electricity, Khanepani, NTC/Ncell Top-up.'
      ],
      pointsNp: [
        'एकता स्मार्ट एप: गुगल प्ले स्टोर र एप्पल एप स्टोरमा उपलब्ध।',
        'नेपालपे क्युआर: नेपालभरका कुनै पनि क्युआरमा स्क्यान गरी भुक्तानी।',
        'सबै वाणिज्य बैंकहरूमा तत्काल रकम ट्रान्सफर (IPS / ConnectIPS)।',
        'बिजुली, खानेपानी, टेलिफोन, इन्टरनेटको महसुल घरमै बसी भुक्तानी।'
      ],
      actionEn: 'Member Portal Login',
      actionNp: 'सदस्य पोर्टल लगइन',
      actionTarget: 'login-member'
    },
    'reports-monthly': {
      titleEn: 'Monthly Financial Summary',
      titleNp: 'मासिक वित्तीय विवरण',
      icon: '📅',
      descEn: 'Monthly deposit mobilization, liquidity ratio, loan portfolio health, and recovery status.',
      descNp: 'मासिक बचत संकलन, तरलता अवस्था तथा कर्जा असुलीको विस्तृत मासिक प्रतिवेदन।',
      pointsEn: [
        'Published every month-end following Cooperative Ministry disclosure guidelines.',
        'Current Liquidity Ratio maintained comfortably above statutory 16% threshold.',
        'Regular supervisory inspection reports verified.'
      ],
      pointsNp: [
        'सहकारी विभागको मापदण्ड अनुसार प्रत्येक महिनाको मसान्तमा प्रकाशन।',
        'तरलता अनुपात वैधानिक १६% को सीमाभन्दा माथि २२.४०% मा सुरक्षित।',
        'नियमित आन्तरिक सुपरीवेक्षण प्रतिवेदन प्रमाणित।'
      ],
      actionEn: 'Download PDF',
      actionNp: 'प्रतिवेदन डाउनलोड'
    },
    'reports-progress': {
      titleEn: 'Quarterly Progress Indicators',
      titleNp: 'त्रैमासिक संस्थागत प्रगति',
      icon: '📈',
      descEn: 'Member count growth, women empowerment metrics, and local entrepreneurship loans.',
      descNp: 'सदस्य संख्या वृद्धि, महिला सशक्तीकरण तथा साना उद्यम कर्जा विस्तारको समीक्षा।',
      pointsEn: [
        'Over 12,500 verified shareholders across Rupandehi district.',
        'More than 54% female member participation in saving schemes.',
        'Audited PEARLS cooperative performance monitoring indicators.'
      ],
      pointsNp: [
        'रुपन्देही जिल्लाभर १२,५०० भन्दा बढी सेयर सदस्यहरू।',
        'बचत योजनाहरूमा ५४% भन्दा बढी महिला सदस्यहरूको सहभागिता।',
        'पर्ल्स (PEARLS) प्रणाली अनुसार संस्थागत स्वास्थ्य विश्लेषण।'
      ],
      actionEn: 'Download Summary',
      actionNp: 'सारांश डाउनलोड'
    },
    'reports-annual': {
      titleEn: '24th AGM Annual Report Book',
      titleNp: '२४औं वार्षिक साधारण सभा प्रतिवेदन',
      icon: '📑',
      descEn: 'Complete annual report approved by the 24th Annual General Meeting including Board & Audit Committee reports.',
      descNp: '२४औं वार्षिक साधारण सभाद्वारा पारित सञ्चालक समिति, लेखा सुपरिवेक्षण समिति तथा लेखापरीक्षकको पूर्ण प्रतिवेदन।',
      pointsEn: [
        'Annual Balance Sheet and Profit & Loss Statement FY 2080/081.',
        'Patronage dividend and share dividend distribution plan.',
        'Strategic 5-year cooperative community vision roadmap.'
      ],
      pointsNp: [
        'आर्थिक वर्ष २०८०/०८१ को पूर्ण वासलात र नाफा-नोक्सान हिसाब।',
        'सदस्य सेयर लाभांश तथा संरक्षित पुँजी फिर्ता कोष वितरण।',
        'आगामी ५ वर्षे रणनीतिक विकास गुरुयोजना।'
      ],
      actionEn: 'Download AGM Book',
      actionNp: 'साधारण सभा पुस्तिका'
    },
    'reports-audit': {
      titleEn: 'Statutory Independent Audit Report',
      titleNp: 'आधिकारिक लेखापरीक्षण प्रतिवेदन',
      icon: '⚖',
      descEn: 'External independent statutory audit report certified by Chartered Accountants with unqualified clean opinion.',
      descNp: 'पंजीकृत चार्टर्ड एकाउन्टेन्टद्वारा प्रमाणित स्वतन्त्र लेखापरीक्षण प्रतिवेदन।',
      pointsEn: [
        'Clean, unmodified audit opinion under Nepal Standards on Auditing (NSA).',
        'Capital adequacy ratio and reserve fund fully backed by liquid assets.',
        'Cooperative tax clearance certificate obtained.'
      ],
      pointsNp: [
        'नेपाल लेखापरीक्षण मापदण्ड अनुसार निर्दोष (Clean) लेखापरीक्षण राय।',
        'पुँजी पर्याप्तता कोष र जगेडा कोष पूर्ण रूपमा सुरक्षित।',
        'आन्तरिक राजस्व कार्यालयबाट कर चुक्ता प्रमाणपत्र प्राप्त।'
      ],
      actionEn: 'View Certificate',
      actionNp: 'प्रमाणपत्र हेर्नुहोस्'
    },
    'career-vacancies': {
      titleEn: 'Staff Career Vacancies',
      titleNp: 'खुला पदपूर्ति विज्ञापन',
      icon: '📢',
      descEn: 'Ekata Saving & Credit Cooperative Ltd. announces openings for committed candidates in Butwal.',
      descNp: 'एकता बचत तथा ऋण सहकारी संस्था लि. को मुख्य कार्यालय तथा सेवा केन्द्रहरूका लागि कर्मचारी आवश्यकता।',
      pointsEn: [
        'Position 1: Assistant Manager (Credit Administration) - 1 Opening',
        'Position 2: Junior Assistant / Cashier / Teller - 2 Openings',
        'Attractive cooperative salary, gratuity, provident fund, and medical insurance.',
        'Equal opportunity employer; local applicants given priority.'
      ],
      pointsNp: [
        'पद १: सहायक प्रबन्धक (कर्जा प्रशासन) - १ जना',
        'पद २: कनिष्ठ सहायक / क्यासियर (टेलर) - २ जना',
        'सहकारी नियम अनुसार आकर्षक पारिश्रमिक, उपदान, संचयकोष र स्वास्थ्य बिमा।',
        'स्थानीय तथा अनुभवी उम्मेदवारलाई विशेष प्राथमिकता दिइनेछ।'
      ],
      actionEn: 'Apply Online',
      actionNp: 'दरखास्त दिनुहोस्',
      actionTarget: 'contact-info'
    },
    'career-requirements': {
      titleEn: 'Eligibility, Age Limit & Selection Criteria',
      titleNp: 'योग्यता, उमेरको हद तथा छनोट प्रक्रिया',
      icon: '📋',
      descEn: 'Detailed eligibility benchmarks set by the Staff Recruitment Committee.',
      descNp: 'पदपूर्ति समितिद्वारा निर्धारित शैक्षिक योग्यता, उमेर हद तथा छनोट मापदण्ड।',
      pointsEn: [
        'Assistant Manager: Bachelor in Commerce / BBA with min. 2 years cooperative banking experience. Age: 21 to 35 years.',
        'Junior Assistant: +2 passed in Management / Commerce. Computer proficiency (Nepali & English typing, Excel). Age: 18 to 30 years.',
        'Selection Process: Written Test, Computer Practical, and Final Interview.'
      ],
      pointsNp: [
        'सहायक प्रबन्धक: वाणिज्य शास्त्रमा स्नातक (BBS/BBA) तथा २ वर्षको अनुभव। उमेर: २१ देखि ३५ वर्ष।',
        'कनिष्ठ सहायक: व्यवस्थापनमा १२ कक्षा उत्तीर्ण, कम्प्युटर तथा लेखा ज्ञान। उमेर: १८ देखि ३० वर्ष।',
        'छनोट प्रक्रिया: लिखित परीक्षा, कम्प्युटर प्रयोगात्मक तथा अन्तिम अन्तर्वार्ता।'
      ],
      actionEn: 'Download Syllabus',
      actionNp: 'पाठ्यक्रम डाउनलोड'
    },
    'career-process': {
      titleEn: 'Job Application Process & Deadlines',
      titleNp: 'दरखास्त प्रक्रिया तथा अन्तिम म्याद',
      icon: '✉',
      descEn: 'Step-by-step instructions on submitting candidate applications.',
      descNp: 'फाराम डाउनलोड, आवश्यक कागजात बुझाउने तरिका र अन्तिम मिति।',
      pointsEn: [
        'Download official Application Form from website or collect from Head Office Butwal-4.',
        'Submit along with Bio-data, Citizenship copy, Academic Certificates, and PP photo.',
        'Email submissions accepted at: career@ekatacoop.com.np or in person at counter.',
        'Application Deadline: Kartik 25, 2081 within office hours (4:00 PM).'
      ],
      pointsNp: [
        'दरखास्त फाराम वेबसाइटबाट डाउनलोड गर्न वा मुख्य कार्यालयबाट प्राप्त गर्न सकिनेछ।',
        'बायोडाटा, नागरिकताको प्रतिलिपि, शैक्षिक प्रमाणपत्र र २ प्रति फोटोसहित बुझाउनु पर्नेछ।',
        'इमेल ठेगाना career@ekatacoop.com.np मा वा सिधै काउन्टरमा बुझाउन सकिने।',
        'दरखास्त बुझाउने अन्तिम मिति: २०८१ कार्तिक २५ गते कार्यालय समय (४:०० बजे) भित्र।'
      ],
      actionEn: 'Contact Desk',
      actionNp: 'सम्पर्क गर्नुहोस्',
      actionTarget: 'contact-info'
    },
    'contact-info': {
      titleEn: 'Contact Head Office & Help Desk',
      titleNp: 'सम्पर्क तथा सहायता केन्द्र',
      icon: '✉',
      descEn: 'We are here to assist with member queries, loan inquiries, and complaints.',
      descNp: 'कुनै पनि सोधपुछ, सल्लाह-सुझाव वा गुनासोको लागि हामीलाई सम्पर्क गर्नुहोस्।',
      pointsEn: [
        'Head Office: Butwal-4, Amarpath, Rupandehi, Lumbini Province.',
        'Phone: 071-540123 / 540456 • Toll-Free Helpline: 1660-01-99887.',
        'Email: info@ekatacoop.com.np • Web: www.ekatacoop.com.np.',
        'Office Hours: Sunday to Thursday: 10:00 AM - 4:00 PM | Friday: 10:00 AM - 2:00 PM.'
      ],
      pointsNp: [
        'मुख्य कार्यालय: बुटवल-४, अमरपथ, रुपन्देही, लुम्बिनी प्रदेश।',
        'टेलिफोन: ०७१-५४०१२३ / ५४०४५६ • टोल-फ्री हटलाइन: १६६०-०१-९९८८७।',
        'इमेल: info@ekatacoop.com.np • वेबसाइट: www.ekatacoop.com.np।',
        'कार्यालय समय: आइतबारदेखि बिहीबार: बिहान १०:०० देखि दिउँसो ४:०० | शुक्रबार: १०:०० देखि २:००।'
      ],
      actionEn: 'Call Helpline',
      actionNp: 'फोन गर्नुहोस्'
    }
  };

  // DOM Elements
  const generalModal = document.getElementById('generalModalOverlay');
  const generalModalClose = document.getElementById('generalModalClose');
  const generalModalCancel = document.getElementById('generalModalCancel');
  const modalTitle = document.getElementById('modalTitle');
  const modalIcon = document.getElementById('modalIcon');
  const modalDesc = document.getElementById('modalDesc');
  const modalPoints = document.getElementById('modalPoints');
  const modalActionBtn = document.getElementById('modalActionBtn');

  let currentModalActionTarget = null;

  function openGeneralModal(key) {
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
    currentModalActionTarget = data.actionTarget || null;

    generalModal.classList.add('active');
  }

  function closeGeneralModal() {
    if (generalModal) generalModal.classList.remove('active');
  }

  if (generalModalClose) generalModalClose.addEventListener('click', closeGeneralModal);
  if (generalModalCancel) generalModalCancel.addEventListener('click', closeGeneralModal);
  if (modalActionBtn) {
    modalActionBtn.addEventListener('click', function () {
      closeGeneralModal();
      if (currentModalActionTarget) {
        if (currentModalActionTarget === 'apply-membership') {
          openSpecificModal('applyMemberModal');
        } else if (currentModalActionTarget === 'apply-loan') {
          openSpecificModal('applyLoanModal');
        } else if (currentModalActionTarget === 'login-member') {
          openSpecificModal('memberLoginModal');
        } else {
          openGeneralModal(currentModalActionTarget);
        }
      }
    });
  }

  // Generic open/close modal by ID
  function openSpecificModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeSpecificModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  // Bind close buttons for specific modals
  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-close-modal');
      closeSpecificModal(targetId);
    });
  });

  // Close modals on overlay background click
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Login Dropdown Controller (Clean without Secure Portal Access Header)
  const loginDropdownBtn = document.getElementById('loginDropdownBtn');
  const loginDropdownMenu = document.getElementById('loginDropdownMenu');

  if (loginDropdownBtn && loginDropdownMenu) {
    loginDropdownBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = loginDropdownMenu.classList.contains('active');
      if (isOpen) {
        loginDropdownMenu.classList.remove('active');
        loginDropdownBtn.setAttribute('aria-expanded', 'false');
      } else {
        loginDropdownMenu.classList.add('active');
        loginDropdownBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', function (e) {
      if (!loginDropdownBtn.contains(e.target) && !loginDropdownMenu.contains(e.target)) {
        loginDropdownMenu.classList.remove('active');
        loginDropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Handle Member Login & Office Login Choice Clicks
    document.querySelectorAll('[data-open-login]').forEach(function (choice) {
      choice.addEventListener('click', function (e) {
        e.preventDefault();
        loginDropdownMenu.classList.remove('active');
        loginDropdownBtn.setAttribute('aria-expanded', 'false');
        const type = choice.getAttribute('data-open-login');
        if (type === 'member') {
          openSpecificModal('memberLoginModal');
        } else if (type === 'office') {
          openSpecificModal('officeLoginModal');
        }
      });
    });
  }

  // Handle all [data-modal-target] elements
  document.querySelectorAll('[data-modal-target]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const target = el.getAttribute('data-modal-target');
      if (target === 'apply-membership') {
        openSpecificModal('applyMemberModal');
      } else if (target === 'apply-loan') {
        openSpecificModal('applyLoanModal');
      } else if (target === 'login-member') {
        openSpecificModal('memberLoginModal');
      } else if (target === 'login-office') {
        openSpecificModal('officeLoginModal');
      } else {
        openGeneralModal(target);
      }
    });
  });

  // Language Switcher (Smooth English / Nepali toggle with Since 2057 sync)
  const langSwitchBtn = document.getElementById('langSwitchBtn');
  const sinceLabel = document.getElementById('sinceLabel');
  const sinceYear = document.getElementById('sinceYear');

  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', function () {
      currentLang = currentLang === 'en' ? 'np' : 'en';
      langSwitchBtn.textContent = currentLang === 'en' ? 'नेपाली' : 'English';

      // Update text in elements with data-lang-en and data-lang-np
      document.querySelectorAll('[data-lang-en]').forEach(function (el) {
        const text = currentLang === 'np' ? el.getAttribute('data-lang-np') : el.getAttribute('data-lang-en');
        if (text) {
          // If contains HTML, use innerHTML, else textContent
          if (text.includes('<') && text.includes('>')) {
            el.innerHTML = text;
          } else {
            el.textContent = text;
          }
        }
      });

      // Update Since Badge
      if (sinceLabel && sinceYear) {
        sinceLabel.textContent = currentLang === 'np' ? 'स्थापना' : 'SINCE';
        sinceYear.textContent = currentLang === 'np' ? '२०५७' : '2057';
      }
    });
  }

  // Loan EMI Calculator Logic
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
    if (!loanAmountSlider || !loanInterestSlider || !loanTenureSlider) return;
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

    amountDisplay.textContent = 'Rs. ' + P.toLocaleString('en-IN');
    rateDisplay.textContent = annualRate.toFixed(2) + '%';
    tenureDisplay.textContent = months + ' Months (' + (months / 12).toFixed(1) + ' Yrs)';

    emiAmountDisplay.textContent = 'Rs. ' + Math.round(emi).toLocaleString('en-IN');
    totalInterestDisplay.textContent = 'Rs. ' + Math.round(totalInterest).toLocaleString('en-IN');
    totalPaymentDisplay.textContent = 'Rs. ' + Math.round(totalPayment).toLocaleString('en-IN');
  }

  if (loanAmountSlider && loanInterestSlider && loanTenureSlider) {
    loanAmountSlider.addEventListener('input', calculateEMI);
    loanInterestSlider.addEventListener('input', calculateEMI);
    loanTenureSlider.addEventListener('input', calculateEMI);
    calculateEMI();
  }

  // ================= PHP BACKEND AJAX FORM HANDLERS =================

  // 1. Member Login Form Handler
  const memberLoginForm = document.getElementById('memberLoginForm');
  const memberLoginAlert = document.getElementById('memberLoginAlert');
  const memberDashboardPanel = document.getElementById('memberDashboardPanel');
  const memDispName = document.getElementById('memDispName');
  const memDispCode = document.getElementById('memDispCode');
  const memDispSaving = document.getElementById('memDispSaving');
  const memDispShare = document.getElementById('memDispShare');
  const memTxList = document.getElementById('memTxList');
  const memLogoutBtn = document.getElementById('memLogoutBtn');

  if (memberLoginForm) {
    memberLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const code = document.getElementById('memInputCode').value;
      const pin = document.getElementById('memInputPin').value;

      memberLoginAlert.className = 'alert-box alert-info';
      memberLoginAlert.textContent = 'Authenticating member credentials...';
      memberLoginAlert.classList.remove('hidden');

      try {
        const response = await fetch('api.php?action=login_member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_code: code, pin: pin })
        });
        const res = await response.json();

        if (res.success) {
          memberLoginAlert.classList.add('hidden');
          memberLoginForm.classList.add('hidden');
          memberDashboardPanel.classList.remove('hidden');

          memDispName.textContent = res.member.full_name;
          memDispCode.textContent = 'Member Code: ' + res.member.member_code + ' (' + (res.member.branch || 'Main Branch') + ')';
          memDispSaving.textContent = 'Rs. ' + Number(res.member.regular_saving_balance).toLocaleString('en-IN');
          memDispShare.textContent = 'Rs. ' + Number(res.member.share_amount).toLocaleString('en-IN');

          // Render transaction passbook rows
          memTxList.innerHTML = '';
          if (res.transactions && res.transactions.length > 0) {
            res.transactions.forEach(function (tx) {
              const item = document.createElement('div');
              item.className = 'tx-item';
              item.innerHTML = `
                <div>
                  <div class="tx-particulars">${tx.particulars}</div>
                  <div class="tx-date">${tx.trans_date}</div>
                </div>
                <div class="tx-amt ${tx.type === 'Credit' ? 'credit' : 'debit'}">
                  ${tx.type === 'Credit' ? '+' : '-'} Rs. ${Number(tx.amount).toLocaleString('en-IN')}
                </div>
              `;
              memTxList.appendChild(item);
            });
          } else {
            memTxList.innerHTML = '<p class="text-muted">No recent transactions recorded.</p>';
          }
        } else {
          memberLoginAlert.className = 'alert-box alert-error';
          memberLoginAlert.textContent = res.message || 'Login failed. Please check credentials.';
        }
      } catch (err) {
        memberLoginAlert.className = 'alert-box alert-error';
        memberLoginAlert.textContent = 'Backend Connection Note: ' + err.message;
      }
    });
  }

  if (memLogoutBtn) {
    memLogoutBtn.addEventListener('click', function () {
      fetch('api.php?action=logout');
      if (memberDashboardPanel) memberDashboardPanel.classList.add('hidden');
      if (memberLoginForm) memberLoginForm.classList.remove('hidden');
      if (memberLoginAlert) memberLoginAlert.classList.add('hidden');
    });
  }

  // 2. Office / Admin Login Form Handler
  const officeLoginForm = document.getElementById('officeLoginForm');
  const officeLoginAlert = document.getElementById('officeLoginAlert');
  const officeDashboardPanel = document.getElementById('officeDashboardPanel');
  const adminDispName = document.getElementById('adminDispName');
  const adminDispRole = document.getElementById('adminDispRole');
  const adminStatsGrid = document.getElementById('adminStatsGrid');
  const officeLogoutBtn = document.getElementById('officeLogoutBtn');

  if (officeLoginForm) {
    officeLoginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const user = document.getElementById('staffUser').value;
      const pass = document.getElementById('staffPass').value;

      officeLoginAlert.className = 'alert-box alert-info';
      officeLoginAlert.textContent = 'Verifying staff authorization...';
      officeLoginAlert.classList.remove('hidden');

      try {
        const response = await fetch('api.php?action=login_office', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass })
        });
        const res = await response.json();

        if (res.success) {
          officeLoginAlert.classList.add('hidden');
          officeLoginForm.classList.add('hidden');
          officeDashboardPanel.classList.remove('hidden');

          adminDispName.textContent = res.user.full_name;
          adminDispRole.textContent = 'Designation: ' + res.user.role.toUpperCase() + ' • Email: ' + res.user.email;

          adminStatsGrid.innerHTML = `
            <div class="bal-box">
              <small>Total Members in CBS</small>
              <strong>${res.dashboard.total_members} Verified</strong>
            </div>
            <div class="bal-box">
              <small>Total Savings Mobilized</small>
              <strong>Rs. ${Number(res.dashboard.total_savings).toLocaleString('en-IN')}</strong>
            </div>
            <div class="bal-box">
              <small>Pending Loan Reviews</small>
              <strong style="color:#d97706;">${res.dashboard.pending_loan_applications} Applications</strong>
            </div>
            <div class="bal-box">
              <small>Membership Requests</small>
              <strong style="color:#087a45;">${res.dashboard.pending_membership_requests} Pending</strong>
            </div>
          `;
        } else {
          officeLoginAlert.className = 'alert-box alert-error';
          officeLoginAlert.textContent = res.message || 'Authorization failed.';
        }
      } catch (err) {
        officeLoginAlert.className = 'alert-box alert-error';
        officeLoginAlert.textContent = 'Backend Connection Note: ' + err.message;
      }
    });
  }

  if (officeLogoutBtn) {
    officeLogoutBtn.addEventListener('click', function () {
      fetch('api.php?action=logout');
      if (officeDashboardPanel) officeDashboardPanel.classList.add('hidden');
      if (officeLoginForm) officeLoginForm.classList.remove('hidden');
      if (officeLoginAlert) officeLoginAlert.classList.add('hidden');
    });
  }

  // 3. Online Member Application Form
  const applyMemberForm = document.getElementById('applyMemberForm');
  const applyMemberAlert = document.getElementById('applyMemberAlert');

  if (applyMemberForm) {
    applyMemberForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(applyMemberForm);
      const payload = Object.fromEntries(formData.entries());

      applyMemberAlert.className = 'alert-box alert-info';
      applyMemberAlert.textContent = 'Submitting registration to Ekata CBS database...';
      applyMemberAlert.classList.remove('hidden');

      try {
        const res = await fetch('api.php?action=apply_member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        if (res.success) {
          applyMemberAlert.className = 'alert-box alert-success';
          applyMemberAlert.innerHTML = `
            <strong>Success!</strong> ${res.message}<br>
            <strong>Registration Ticket:</strong> <span class="highlight-gold">${res.application_no}</span>
          `;
          applyMemberForm.reset();
        } else {
          applyMemberAlert.className = 'alert-box alert-error';
          applyMemberAlert.textContent = res.message;
        }
      } catch (err) {
        applyMemberAlert.className = 'alert-box alert-error';
        applyMemberAlert.textContent = 'Submission error: ' + err.message;
      }
    });
  }

  // 4. Online Loan Application Form
  const applyLoanForm = document.getElementById('applyLoanForm');
  const applyLoanAlert = document.getElementById('applyLoanAlert');

  if (applyLoanForm) {
    applyLoanForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(applyLoanForm);
      const payload = Object.fromEntries(formData.entries());

      applyLoanAlert.className = 'alert-box alert-info';
      applyLoanAlert.textContent = 'Transmitting loan dossier to Credit Committee...';
      applyLoanAlert.classList.remove('hidden');

      try {
        const res = await fetch('api.php?action=apply_loan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json());

        if (res.success) {
          applyLoanAlert.className = 'alert-box alert-success';
          applyLoanAlert.innerHTML = `
            <strong>Application Submitted!</strong> ${res.message}<br>
            <strong>Tracking Code:</strong> <span class="highlight-gold">${res.tracking_code}</span>
          `;
          applyLoanForm.reset();
        } else {
          applyLoanAlert.className = 'alert-box alert-error';
          applyLoanAlert.textContent = res.message;
        }
      } catch (err) {
        applyLoanAlert.className = 'alert-box alert-error';
        applyLoanAlert.textContent = 'Submission error: ' + err.message;
      }
    });
  }

  // Header Scroll Effect
  window.addEventListener('scroll', function () {
    const fixedHeader = document.querySelector('.fixed-header-wrapper');
    if (fixedHeader) {
      if (window.scrollY > 30) {
        fixedHeader.classList.add('is-scrolled');
      } else {
        fixedHeader.classList.remove('is-scrolled');
      }
    }
  }, { passive: true });

})();
