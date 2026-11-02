import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import mysql from 'mysql2/promise';

export interface DbStatus {
  driver: 'mysql' | 'sqlite';
  configuredDriver: string;
  mysql: {
    host: string;
    port: number;
    user: string;
    database: string;
    connected: boolean;
    error?: string;
  };
  sqlite: {
    path: string;
    exists: boolean;
  };
  counts: {
    ekymSubmissions: number;
    popupNotices: number;
    mediaFiles: number;
  };
  timestamp: string;
}

// Database config from environment
const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'ekata_cooperative';
const REQUESTED_DRIVER = (process.env.DB_DRIVER || 'mysql').toLowerCase();

// SQLite database fallback
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const sqlitePath = path.resolve(dbDir, 'ekata_coop.sqlite');
let sqliteDb: DatabaseSync | null = null;

function getSqliteDb(): DatabaseSync {
  if (!sqliteDb) {
    sqliteDb = new DatabaseSync(sqlitePath);
  }
  return sqliteDb;
}

// MySQL pool
let mysqlPool: mysql.Pool | null = null;
let activeDriver: 'mysql' | 'sqlite' = 'sqlite';
let mysqlConnectionError: string | null = null;

// Initial seed data for Popup Notices
export const INITIAL_POPUP_NOTICES = [
  {
    notice_key: 'notice-agm-24',
    active: 1,
    title_en: '24th Annual General Meeting (AGM) & 15.5% Dividend Distribution Notice',
    title_np: '२४औं वार्षिक साधारण सभा तथा १५.५% लाभांश वितरण सम्बन्धी अत्यन्त जरुरी सूचना',
    category_en: 'Annual General Meeting',
    category_np: 'वार्षिक साधारण सभा सूचना',
    image_url: '/uploads/media/notice-agm.svg',
    content_en: 'All respected shareholder members of Ankur Saving & Credit Cooperative Ltd. are cordially invited to attend the 24th Annual General Meeting scheduled for Saturday, Ashwin 18, 2083 (11:00 AM) at the Central Assembly Hall, Butwal-04. The AGM will deliberate on the Audited Annual Financial Report (FY 2082/83), approve the recommended 15.5% dividend payout (bonus shares and cash dividend), and ratify the institutional development plan.',
    content_np: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. का सम्पूर्ण आदरणीय सेयर सदस्य महानुभावहरूमा हार्दिक नमस्कार। संस्थाको सञ्चालक समितिको निर्णयानुसार संस्थाको २४औं वार्षिक साधारण सभा आगामी २०८३ असोज १८ गते शनिबार बिहान ११:०० बजे केन्द्रीय सभाहल, बुटवल-०४ (ट्राफिक चोक) मा भव्यताका साथ सम्पन्न हुन गइरहेको व्यहोरा सूचित गरिन्छ। सभामा आ.व. २०८२/८३ को लेखापरीक्षण प्रतिवेदन, १५.५% लाभांश (बोनस सेयर तथा नगद) वितरण प्रस्ताव एवं आगामी आर्थिक वर्षको नीति तथा कार्यक्रम प्रस्तुत गरिनेछ।',
    bullet_points_en: JSON.stringify([
      'Members are requested to bring their original Share Certificate or Citizenship card for verification.',
      'Dividend amounts will be transferred directly to active bank accounts; kindly complete your eKYM update.',
      'Annual reports and token of appreciation will be distributed at registration counters from 9:30 AM.',
      'For inquiries, contact Central Office Butwal (071-540123) or your local service center.'
    ]),
    bullet_points_np: JSON.stringify([
      '१. सभामा प्रवेशका लागि आफ्नो सक्कल सेयर प्रमाणपत्र वा नागरिकता साथमा लिएर आउनुहुन अनुरोध छ।',
      '२. लाभांश रकम सिधै सदस्यको बचत खातामा जम्मा गरिने हुँदा सम्पूर्ण सदस्यहरूले eKYM विवरण अनिवार्य अद्यावधिक गर्नुपर्नेछ।',
      '३. साधारण सभाको प्रतिवेदन तथा उपहार कुपन प्रवेशद्वारको दर्ता काउन्टरबाट बिहान ९:३० बजेदेखि उपलब्ध हुनेछ।',
      '४. थप जानकारीका लागि केन्द्रीय कार्यालय बुटवल (०७१-५४०१२३) वा नजिकको सेवा केन्द्रमा सम्पर्क गर्नुहोला।'
    ]),
    date_en: '24 Sep 2026',
    date_np: '२०८३ असोज १० गते',
    notice_ref: 'सूचना नं. ०४/२०८३-८४',
    action_text_en: 'Update eKYM for Dividend',
    action_text_np: 'लाभांशका लागि eKYM भर्नुहोस्',
    action_link: '#ekym'
  },
  {
    notice_key: 'notice-ekym-mandatory',
    active: 1,
    title_en: 'Mandatory eKYM Digital Profile Verification Before Quarter-End',
    title_np: 'अनिवार्य eKYM डिजिटल सदस्य विवरण अद्यावधिक गर्ने सम्बन्धी सूचना',
    category_en: 'Member Regulatory Notice',
    category_np: 'सदस्य जरुरी सूचना',
    image_url: '/uploads/media/notice-ekym.svg',
    content_en: 'Pursuant to the Cooperative Act 2074 and regulatory directives of the Cooperative Department, all registered members of Ankur Cooperative are required to verify their Know Your Member (eKYM) credentials online. Please complete the 3-minute digital identity update through our web portal to ensure uninterrupted mobile banking, SMS alert services, ATM access, and dividend disbursements.',
    content_np: 'सहकारी ऐन २०७४ तथा नियामक निकायको वित्तीय निर्देशिका बमोजिम संस्थाका सम्पूर्ण आदरणीय सदस्यहरूले आफ्ना व्यक्तिगत, पारिवारिक, तीन पुस्ते तथा बैंकिङ विवरणहरू डिजिटल माध्यमबाट अद्यावधिक गर्नुपर्ने कानुनी व्यवस्था रहेको छ। डिजिटल कारोबार, मोबाइल बैंकिङ तथा कर्जा सुविधा निर्वाध रूपमा सञ्चालन गर्नको लागि संस्थाको अनलाइन eKYM पोर्टल प्रयोग गरी तत्काल फाराम भर्नुहुन विनम्र अनुरोध गर्दछौं।',
    bullet_points_en: JSON.stringify([
      'Upload clear front & back copies of your Nepali Citizenship Card.',
      'Attach recent passport-sized digital photograph and signature specimen.',
      'Takes less than 3 minutes directly through your phone or computer.',
      'A digital tracking number will be generated immediately for live status check.'
    ]),
    bullet_points_np: JSON.stringify([
      '• नागरिकता प्रमाणपत्रको दुवैतर्फको स्पष्ट प्रतिलिपि अपलोड गर्नुपर्नेछ।',
      '• हालसालै खिचिएको पासपोर्ट साइजको डिजिटल फोटो तथा हस्ताक्षर कार्ड पेश गर्नुपर्नेछ।',
      '• मोबाइल वा कम्प्युटरबाट ३ मिनेटमा सजिलै eKYM फाराम भर्न सकिनेछ।',
      '• फाराम दर्ता हुनासाथ ट्र्याकिङ नम्बर तुरुन्त प्राप्त हुनेछ।'
    ]),
    date_en: '18 Sep 2026',
    date_np: '२०८३ असोज ०२ गते',
    notice_ref: 'सूचना नं. ०३/२०८३-८४',
    action_text_en: 'Open eKYM Online Form',
    action_text_np: 'अनलाइन eKYM फाराम खोल्नुहोस्',
    action_link: '#ekym'
  },
  {
    notice_key: 'notice-festive-scheme',
    active: 1,
    title_en: 'Festive Super Savings & Subsidized Business Loan Campaign 2083',
    title_np: 'दशैं–तिहार–छठ विशेष सहुलियत ऋण तथा मुद्दती बचत योजना २०८३',
    category_en: 'Special Festive Scheme',
    category_np: 'बचत तथा कर्जा विशेष अफर',
    image_url: '/uploads/media/notice-festive.svg',
    content_en: 'On the auspicious occasion of Dashain, Tihar, and Chhath festivals, Ankur Cooperative announces the "Ankur Utsav Loan Scheme" with subsidized interest rates and zero administrative processing delays for local entrepreneurs and agriculture businesses. Special High-Yield Fixed Deposits are also available with guaranteed returns up to 10.75% per annum.',
    content_np: 'आउँदै गरेका महान चाडपर्वहरू बडादशैं, तिहार तथा छठ पर्वको सुखद् उपलक्ष्यमा हाम्रा उद्यमी सेयर सदस्यहरूलाई लक्षित गरी विशेष सहुलियत ब्याजदरमा "अंकुर उत्सव कर्जा" र मुद्दती निक्षेपमा वार्षिक १०.७५% सम्म आकर्षक ब्याज प्रदान गर्ने नयाँ योजना सार्वजनिक गरिएको छ। सीमित अवधिका लागि सेवा शुल्कमा ५०% विशेष छुट प्रदान गरिएको छ।',
    bullet_points_en: JSON.stringify([
      'Subsidized Festive Business Loan up to Rs. 1,000,000 with 48-hour approval.',
      'High-Yield Festive Fixed Deposit offering up to 10.75% annual interest.',
      '50% discount on administrative service charges during the festive season.',
      'Visit any of our 4 service branches or apply via digital consultation.'
    ]),
    bullet_points_np: JSON.stringify([
      '• ४८ घण्टाभित्र स्वीकृत हुने रु. १०,००,००० सम्मको सहुलियत चाडपर्व कर्जा।',
      '• मुद्दती निक्षेपमा वार्षिक १०.७५% सम्म सुनिश्चित उच्च प्रतिफल।',
      '• चाडपर्व अवधिभर प्रशासनिक सेवा शुल्कमा ५०% विशेष छुट।',
      '• हाम्रा ४ वटै शाखा वा डिजिटल परामर्शमार्फत तुरुन्त आवेदन दिन सकिने।'
    ]),
    date_en: '13 Sep 2026',
    date_np: '२०८३ भदौ २८ गते',
    notice_ref: 'सूचना नं. ०५/२०८३-८४',
    action_text_en: 'View Interest Rates Schedule',
    action_text_np: 'ब्याजदर तालिका हेर्नुहोस्',
    action_link: '#rates'
  }
];

export const INITIAL_MEDIA_FILES = [
  {
    media_key: 'logo-official-default',
    title: 'Ankur Official Logo (Vector Emblem)',
    filename: 'ekata-logo-default.svg',
    file_path: '/uploads/logos/ekata-logo-default.svg',
    file_type: 'image/svg+xml',
    file_size: 5543,
    category: 'branding',
    alt_text: 'Ankur Saving & Credit Cooperative Ltd. Official Logo',
    is_system_default: 1
  },
  {
    media_key: 'slide-financial-pillar',
    title: 'Hero Slide: Trusted Financial Pillar of Rupandehi',
    filename: 'slide-banking.svg',
    file_path: '/uploads/media/slide-banking.svg',
    file_type: 'image/svg+xml',
    file_size: 4114,
    category: 'hero',
    alt_text: 'Classical cooperative banking hall with growth curve',
    is_system_default: 1
  },
  {
    media_key: 'slide-term-deposits',
    title: 'Hero Slide: High Yield 11.75% Term Deposits',
    filename: 'slide-deposits.svg',
    file_path: '/uploads/media/slide-deposits.svg',
    file_type: 'image/svg+xml',
    file_size: 2750,
    category: 'hero',
    alt_text: 'Golden security vault and high return term deposit banner',
    is_system_default: 1
  },
  {
    media_key: 'slide-agriculture-micro',
    title: 'Hero Slide: Empowering Local Agriculture & Enterprise',
    filename: 'slide-agriculture.svg',
    file_path: '/uploads/media/slide-agriculture.svg',
    file_type: 'image/svg+xml',
    file_size: 2492,
    category: 'hero',
    alt_text: 'Agro-tools, livestock and productive enterprise loans',
    is_system_default: 1
  },
  {
    media_key: 'slide-mobile-banking',
    title: 'Hero Slide: Modern Mobile Banking 3.0',
    filename: 'slide-digital.svg',
    file_path: '/uploads/media/slide-digital.svg',
    file_type: 'image/svg+xml',
    file_size: 2351,
    category: 'hero',
    alt_text: 'Smartphone mobile banking app with QR payment and instant transfer',
    is_system_default: 1
  },
  {
    media_key: 'gallery-agm-photo',
    title: 'Gallery: 24th Annual General Meeting Stage',
    filename: 'gallery-agm.svg',
    file_path: '/uploads/media/gallery-agm.svg',
    file_type: 'image/svg+xml',
    file_size: 1704,
    category: 'gallery',
    alt_text: 'Shareholder members attending 24th AGM in Butwal hall',
    is_system_default: 1
  },
  {
    media_key: 'gallery-women-literacy',
    title: 'Gallery: Financial Literacy for Women Micro-Entrepreneurs',
    filename: 'gallery-literacy.svg',
    file_path: '/uploads/media/gallery-literacy.svg',
    file_type: 'image/svg+xml',
    file_size: 1958,
    category: 'gallery',
    alt_text: 'Women entrepreneur financial literacy and micro-enterprise workshop',
    is_system_default: 1
  },
  {
    media_key: 'gallery-community-healthcamp',
    title: 'Gallery: Free Community Health Camp & Blood Donation Drive',
    filename: 'gallery-healthcamp.svg',
    file_path: '/uploads/media/gallery-healthcamp.svg',
    file_type: 'image/svg+xml',
    file_size: 1652,
    category: 'gallery',
    alt_text: 'Medical volunteers and member community health camp',
    is_system_default: 1
  },
  {
    media_key: 'gallery-tech-summit',
    title: 'Gallery: Cooperative Youth & Digital Banking Summit',
    filename: 'gallery-tech.svg',
    file_path: '/uploads/media/gallery-tech.svg',
    file_type: 'image/svg+xml',
    file_size: 1443,
    category: 'gallery',
    alt_text: 'Cooperative digital security and technology seminar',
    is_system_default: 1
  },
  {
    media_key: 'notice-agm-banner',
    title: 'Notice Banner: 24th AGM and Dividend Notice',
    filename: 'notice-agm.svg',
    file_path: '/uploads/media/notice-agm.svg',
    file_type: 'image/svg+xml',
    file_size: 1449,
    category: 'notice',
    alt_text: 'Official notice bulletin for 24th AGM and 15.5% dividend payout',
    is_system_default: 1
  },
  {
    media_key: 'notice-ekym-banner',
    title: 'Notice Banner: Mandatory eKYM Verification',
    filename: 'notice-ekym.svg',
    file_path: '/uploads/media/notice-ekym.svg',
    file_type: 'image/svg+xml',
    file_size: 1298,
    category: 'notice',
    alt_text: 'Mandatory online member digital identity verification bulletin',
    is_system_default: 1
  },
  {
    media_key: 'notice-festive-loan',
    title: 'Notice Banner: Festive Productive Loan Scheme',
    filename: 'notice-festive.svg',
    file_path: '/uploads/media/notice-festive.svg',
    file_type: 'image/svg+xml',
    file_size: 1521,
    category: 'notice',
    alt_text: 'Dashain-Tihar festive agricultural and business loan banner',
    is_system_default: 1
  }
];

export const INITIAL_SITE_SETTINGS: Record<string, string> = {
  coop_name_en: 'Ankur Saving & Credit Cooperative Ltd.',
  coop_name_np: 'अंकुर बचत तथा ऋण सहकारी संस्था लि.',
  coop_logo_url: '/uploads/logos/ekata-logo-default.svg',
  tagline_en: 'Butwal-4, Rupandehi • Regd. No: 421/057/058 • Established 2057 B.S.',
  tagline_np: 'बुटवल-४, रुपन्देही • दर्ता नं: ४२१/०५७/०५८ • स्थापना: २०५७ वि.सं.',
  established_bs: '2057',
  established_ad: '2000',
  established_date_full_en: 'Established 2057 B.S. (2000 A.D.)',
  established_date_full_np: 'स्थापना: २०५७ वि.सं. (२००० इ.सं.)',
  ticker_text_en: 'Welcome to Ankur Saving & Credit Cooperative Ltd. | Member eKYM Digital Update active | High-Yield Term Deposits up to 11.75% | Head Office: 071-540123',
  ticker_text_np: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. मा हार्दिक स्वागत गर्दछौं। | अनलाइन eKYM अध्यावधिक सुरु | ११.७५% सम्म मुद्दती निक्षेप प्रतिफल | मुख्य कार्यालय: ०७१-५४०१२३',
  ticker_active: '1',
  phone_head_office: '071-540123 / 540456',
  email_official: 'info@ekatacoop.com.np',
  address_head_office: 'Main Road, Butwal-4, Rupandehi, Lumbini Province, Nepal',
  address_head_office_np: 'मुख्य सडक, बुटवल-४, रुपन्देही, लुम्बिनी प्रदेश, नेपाल',
  province: 'Lumbini Province',
  district: 'Rupandehi',
  city_municipality: 'Butwal-4',
  ward_no: '4',
  tole_street: 'Main Road, Traffic Chowk',
  service_coverage_en: 'Rupandehi District & Lumbini Province',
  service_coverage_np: 'रुपन्देही जिल्ला तथा लुम्बिनी प्रदेश',
  branch_network_text_en: 'Head Office: Butwal-4 (Traffic Chowk) | Branch 1: Milanchowk (Ward 8) | Branch 2: Golpark | Branch 3: Amarpath Extension',
  branch_network_text_np: 'केन्द्रीय कार्यालय: बुटवल-४ (ट्राफिक चोक) | शाखा १: मिलनचोक (वडा ८) | शाखा २: गोलपार्क | शाखा ३: अमरपथ सेवा काउन्टर',
  google_maps_embed_url: 'https://maps.google.com/?q=Butwal+Rupandehi+Nepal',
  office_hours: 'Sunday - Friday: 10:00 AM - 5:00 PM (Counter till 4:00 PM)',
  regd_no: '421/057/058',
  pan_no: '301548921',
  stat_members: '15,420+',
  stat_savings: 'Rs. 1.28 Arba',
  stat_loans: 'Rs. 98.40 Crore',
  stat_capital: 'Rs. 24.50 Crore',
  cms_head_office: JSON.stringify({
    officeNameEn: 'Ankur Saving & Credit Cooperative Ltd.',
    officeNameNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि.',
    descriptionEn:
      'Get in touch with the Central Head Office of Ankur Saving & Credit Cooperative Ltd., division desks, and member helpline for swift financial service assistance, account inquiries, credit consultation, or institutional correspondence.',
    descriptionNp:
      'अंकुर बचत तथा ऋण सहकारी संस्था लि. को केन्द्रीय मुख्य कार्यालय, आन्तरिक विभागीय डेस्कहरू र सदस्य सहायता कक्षमा सीधै सम्पर्क गरी वित्तीय सेवा परामर्श, खाता जानकारी वा संस्थागत सेवा लिनुहोस्।',
    addressEn: 'Main Road, Traffic Chowk, Butwal-04, Rupandehi, Lumbini Province, Nepal',
    addressNp: 'मुख्य सडक, ट्राफिक चोक, बुटवल-४, रुपन्देही, लुम्बिनी प्रदेश, नेपाल',
    province: 'Lumbini Province',
    district: 'Rupandehi',
    city: 'Butwal Sub-Metropolitan City',
    ward: '04',
    primaryPhone: '071-540123',
    altPhone: '071-540456',
    tollFreePhone: '1660-01-99887',
    fax: '071-540789',
    officialEmail: 'info@ekatacoop.com.np',
    supportEmail: 'support@ekatacoop.com.np',
    websiteUrl: 'www.ankurcoop.com.np',
    workingDaysEn: 'Sunday to Friday (6 Days a Week)',
    workingDaysNp: 'आइतबार देखि शुक्रबारसम्म (हप्ताको ६ दिन)',
    workingHoursEn: '10:00 AM - 5:00 PM',
    workingHoursNp: 'बिहान १०:०० बजे देखि साँझ ५:०० बजेसम्म',
    counterHoursEn: '10:00 AM - 4:00 PM',
    counterHoursNp: 'बिहान १०:०० बजे देखि दिउँसो ४:०० बजेसम्म',
    regdNo: '421/057/058',
    panNo: '301548921',
    postalCode: '32907',
    mapUrl: 'https://maps.google.com/?q=Butwal+Rupandehi+Nepal',
    emergencyContact: '9857099441',
    departmentsDirectory: [
      {
        id: 'ho-dept-1',
        name: 'Member Service & Account Opening',
        nameNp: 'सदस्य सेवा तथा खाता सञ्चालन कक्ष',
        ext: '101',
        incharge: 'Mr. Deepak Thapa',
        inchargeNp: 'श्री दीपक थापा',
        phone: '071-540123 (Ext. 101)',
        email: 'csd@ekatacoop.com.np'
      },
      {
        id: 'ho-dept-2',
        name: 'Credit & Business Loan Appraisal',
        nameNp: 'कर्जा प्रवाह तथा मूल्याङ्कन विभाग',
        ext: '103',
        incharge: 'Mr. Rajesh Shrestha',
        inchargeNp: 'श्री राजेश श्रेष्ठ',
        phone: '071-540123 (Ext. 103)',
        email: 'credit@ekatacoop.com.np'
      },
      {
        id: 'ho-dept-3',
        name: 'Internal Audit & Risk Compliance',
        nameNp: 'आन्तरिक लेखापरीक्षण तथा अनुपालन एकाइ',
        ext: '106',
        incharge: 'Mr. Manoj Poudel',
        inchargeNp: 'श्री मनोज पौडेल',
        phone: '071-540123 (Ext. 106)',
        email: 'audit@ekatacoop.com.np'
      },
      {
        id: 'ho-dept-4',
        name: 'IT Infrastructure & Digital Banking',
        nameNp: 'सूचना प्रविधि तथा डिजिटल बैंकिङ विभाग',
        ext: '108',
        incharge: 'Er. Sujan Adhikari',
        inchargeNp: 'इ. सुजन अधिकारी',
        phone: '071-540123 (Ext. 108)',
        email: 'it@ekatacoop.com.np'
      },
      {
        id: 'ho-dept-5',
        name: 'Executive Secretariat & General Administration',
        nameNp: 'कार्यकारी सचिवालय तथा सामान्य प्रशासन',
        ext: '110',
        incharge: 'Mrs. Shanti Aryal',
        inchargeNp: 'श्रीमती शान्ति अर्याल',
        phone: '071-540123 (Ext. 110)',
        email: 'admin@ekatacoop.com.np'
      }
    ]
  }),
  cms_grievance_officer: JSON.stringify({
    officerNameEn: 'Mr. Manoj Poudel',
    officerNameNp: 'श्री मनोज पौडेल',
    designationEn: 'Senior Compliance Officer & Grievance Hearing In-Charge',
    designationNp: 'वरिष्ठ अनुपालन अधिकृत तथा गुनासो सुनुवाइ अधिकारी',
    phone: '071-540123 (Ext. 106)',
    directMobile: '9857099445',
    email: 'grievance@ekatacoop.com.np',
    roomNo: 'Room 204, Second Floor, Head Office Building',
    availabilityEn: 'Sunday to Friday: 11:00 AM - 3:00 PM',
    availabilityNp: 'आइतबार देखि शुक्रबार: बिहान ११:०० देखि दिउँसो ३:०० बजेसम्म',
    redressalCommitmentEn: 'All member grievances registered in person or digitally are acknowledged within 24 hours and formally resolved within 3 to 7 working days as per institutional charter.',
    redressalCommitmentNp: 'दर्ता भएका सम्पूर्ण गुनासाहरूको २४ घण्टाभित्र प्रारम्भिक सुनुवाइ तथा ३ देखि ७ कार्यदिनभित्र औपचारिक समाधान गरिनेछ।'
  }),
  cms_grievances: JSON.stringify([
    {
      id: 'grv-1',
      ticketNo: 'GRV-2083-018',
      senderName: 'Ramesh Kumar Gurung',
      phone: '9857022145',
      email: 'ramesh.gurung@gmail.com',
      memberCode: 'EK-10482',
      subject: 'SMS Transaction Alert Delay on Counter Deposit',
      category: 'digital',
      message: 'Deposited Rs. 25,000 at Traffic Chowk counter yesterday, receipt received but SMS alert was received after 4 hours. Kindly ensure instant SMS gateway.',
      status: 'Resolved',
      submittedAt: '2083-05-08 02:15 PM',
      resolutionNotes: 'Telecom SMS gateway buffer cleared with Nepal Telecom. Instant push tested and member informed via telephone.',
      officerAssigned: 'Er. Sujan Adhikari (IT Lead)'
    },
    {
      id: 'grv-2',
      ticketNo: 'GRV-2083-024',
      senderName: 'Saraswati KC',
      phone: '9847099321',
      email: 'saraswati.kc@yahoo.com',
      memberCode: 'EK-08941',
      subject: 'Clarification on Agricultural Loan Subsidy Guidelines',
      category: 'loan',
      message: 'Requesting fast-track review of livestock shed inspection schedule for agricultural loan disbursement.',
      status: 'Under Review',
      submittedAt: '2083-05-11 11:30 AM',
      resolutionNotes: 'Field officer Mr. Rajesh Shrestha assigned to conduct physical site appraisal tomorrow morning.',
      officerAssigned: 'Mr. Rajesh Shrestha (Credit In-Charge)'
    }
  ]),
  cms_reports: JSON.stringify([
    {
      id: 'rep-1',
      titleEn: 'Monthly Financial Highlights & Deposits Summary (Shrawan 2081)',
      titleNp: 'मासिक वित्तीय कारोबार तथा बचत संकलन सारांश (श्रावण २०८१)',
      category: 'monthly',
      fiscalYear: '2081/82 Shrawan',
      fileSize: '1.4 MB',
      fileUrl: '/downloads/reports/sample-report.pdf',
      publishDate: 'Bhadra 2081 B.S.',
      descriptionEn: 'Monthly deposit mobilization summary, liquidity ratio, loan repayment highlights and member welfare disbursements.',
      descriptionNp: 'मासिक बचत संकलन, तरलता अनुपात, कर्जा असुली तथा सदस्य कल्याणकारी कोष खर्च सम्बन्धी मासिक प्रतिवेदन।'
    },
    {
      id: 'rep-2',
      titleEn: 'Quarterly Institutional Progress & Targets Report (Q1 2081/82)',
      titleNp: 'प्रथम त्रैमासिक संस्थागत प्रगति तथा लक्ष्य समीक्षा प्रतिवेदन (आ.व. २०८१/८२)',
      category: 'progress',
      fiscalYear: '2081/82 Q1',
      fileSize: '2.1 MB',
      fileUrl: '/downloads/reports/sample-report.pdf',
      publishDate: 'Kartik 2081 B.S.',
      descriptionEn: 'Detailed quarterly progress against annual strategic plan, member growth, digital onboarding, and branch expansion.',
      descriptionNp: 'वार्षिक रणनीतिक योजना अनुरुपको त्रैमासिक प्रगति, सदस्य वृद्धि, डिजिटल बैंकिङ र शाखा विस्तारको प्रगति समीक्षा।'
    },
    {
      id: 'rep-3',
      titleEn: '24th Annual General Meeting (AGM) Comprehensive Annual Report 2080/81',
      titleNp: '२४औं वार्षिक साधारण सभाको विस्तृत वार्षिक प्रतिवेदन पुस्तक (आ.व. २०८०/८१)',
      category: 'annual',
      fiscalYear: '2080/81 B.S.',
      fileSize: '4.8 MB',
      fileUrl: '/downloads/reports/sample-report.pdf',
      publishDate: 'Ashwin 2081 B.S.',
      descriptionEn: 'Official audited annual report book passed by 24th AGM including Board report, CEO review, and 15.5% dividend resolution.',
      descriptionNp: 'सञ्चालक समितिको प्रतिवेदन, प्रमुख कार्यकारी अधिकृतको समीक्षा र साधारण सभाबाट पारित १५.५% लाभांश सम्बन्धी आधिकारिक पुस्तक।'
    },
    {
      id: 'rep-4',
      titleEn: 'Independent Statutory Auditor Report & Final Statements (FY 2080/81)',
      titleNp: 'स्वतन्त्र वैधानिक लेखापरीक्षकको प्रतिवेदन तथा प्रमाणित वित्तीय विवरण (आ.व. २०८०/८१)',
      category: 'audit',
      fiscalYear: '2080/81 B.S.',
      fileSize: '3.2 MB',
      fileUrl: '/downloads/reports/sample-report.pdf',
      publishDate: 'Bhadra 2081 B.S.',
      descriptionEn: 'Unqualified statutory audit opinion issued by registered Chartered Accountants under NFRS and cooperative norms.',
      descriptionNp: 'नेपाल चार्टर्ड एकाउन्ट्यान्ट्स संस्था (ICAN) का दर्तावाल लेखापरीक्षकद्वारा जारी गरिएको आधिकारिक लेखापरीक्षण प्रतिवेदन।'
    }
  ]),
  cms_privacy_policy: JSON.stringify({
    titleEn: 'Privacy Policy & Member Data Protection Guidelines',
    titleNp: 'गोपनीयता नीति तथा सदस्य तथ्याङ्क सुरक्षा निर्देशिका',
    lastUpdated: '2081 Ashwin (October 2024)',
    sections: [
      {
        headingEn: '1. Institutional Commitment to Member Privacy',
        headingNp: '१. गोपनीयता तथा सदस्य सुरक्षा प्रतिबद्धता',
        bodyEn: 'Ankur Saving & Credit Cooperative Ltd. is firmly committed to safeguarding the personal and financial privacy of every member shareholder. Operating in strict conformity with the Cooperative Act 2074, Nepal Privacy Act 2075, and regulatory prudential norms, we ensure that member information is preserved with fiduciary care.',
        bodyNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. सहकारी ऐन २०७४, वैयक्तिक गोपनीयता सम्बन्धी ऐन २०७५ तथा नियामक निकायका वित्तीय मापदण्डहरू बमोजिम आफ्ना सम्पूर्ण सेयर सदस्यहरूको व्यक्तिगत तथा वित्तीय विवरणको उच्च सुरक्षा र गोपनीयता कायम राख्न दृढ संकल्पित छ।'
      },
      {
        headingEn: '2. Information Collected & KYC / eKYM Verification',
        headingNp: '२. संकलित विवरण तथा eKYM प्रमाणीकरण',
        bodyEn: 'To establish verified membership, maintain Core Banking Software (CBS) ledgers, prevent money laundering (AML/CFT), and disburse loan funds, we collect lawful details including citizenship numbers, biometric photographs, source of funds declarations, family genealogy, and tax compliance records.',
        bodyNp: 'सदस्य पहिचान (eKYM), कोर बैंकिङ सफ्टवेयर (CBS) खाता सञ्चालन, सम्पत्ति शुद्धीकरण (AML) निवारण र कर्जा लगानी प्रयोजनका लागि नागरिकता नम्बर, फोटो, तीन पुस्ते विवरण तथा आयस्रोत सम्बन्धी आवश्यक कानुनी विवरण संकलन गरिन्छ।'
      },
      {
        headingEn: '3. Data Security, Non-Disclosure & Confidentiality',
        headingNp: '३. तथ्याङ्क सुरक्षा तथा गैर-प्रकटीकरण',
        bodyEn: 'We never sell, trade, or distribute your private contact or financial balance information to external marketing agencies or commercial third parties. Disclosure only occurs when required by law under official court warrant or authorized state regulatory audits.',
        bodyNp: 'हामी कुनै पनि सदस्यको व्यक्तिगत, टेलिफोन वा बचत तथा ऋण मौज्दात सम्बन्धी जानकारी कुनै पनि बाह्य व्यापारिक संस्थालाई बिक्री वा सम्प्रेषण गर्दैनौं। कानुनी अदालत वा सरकारी नियामक निकायको आधिकारिक आदेश बाहेक सम्पूर्ण विवरण पूर्ण गोप्य रहन्छ।'
      },
      {
        headingEn: '4. Digital Banking, Mobile App & Payment Security',
        headingNp: '४. डिजिटल बैंकिङ तथा अनलाइन भुक्तानी सुरक्षा',
        bodyEn: 'Our digital mobile application and web portals employ TLS 256-bit bank-grade SSL encryption, biometric login tokens, and time-sensitive SMS OTP verification to prevent unauthorized account access and secure electronic transfers.',
        bodyNp: 'हाम्रो स्मार्ट मोबाइल बैंकिङ र अनलाइन पोर्टलमा २५६-बिट ईन्क्रिप्शन, बायोमेट्रिक फिंगरप्रिन्ट लगइन र सुरक्षित एसएमएस ओटिपी प्रविधिको प्रयोग गरिएको छ, जसले अनधिकृत पहुँचबाट खातालाई पूर्ण सुरक्षा प्रदान गर्दछ।'
      },
      {
        headingEn: '5. Grievance Redressal & Compliance Inquiries',
        headingNp: '५. गुनासो सुनुवाइ तथा सम्पर्क',
        bodyEn: 'If you have questions, wish to inspect your registered records, or need clarification regarding our privacy practices, contact our Senior Compliance Officer at grievance@ekatacoop.com.np or telephone 071-540123 (Ext. 106).',
        bodyNp: 'गोपनीयता नीति सम्बन्धी कुनै सुझाव, विवरण संशोधन वा गुनासो भएमा हाम्रा वरिष्ठ अनुपालन अधिकृतलाई grievance@ekatacoop.com.np वा फोन ०७१-५४०१२३ (एक्स्टेन्सन १०६) मा सम्पर्क गर्न सक्नुहुनेछ।'
      }
    ]
  }),
  cms_social_links: JSON.stringify({
    facebook: 'https://facebook.com/ekatacooperative.butwal',
    twitter: 'https://twitter.com/ekatacoop_np',
    instagram: 'https://instagram.com/ekatacooperative',
    youtube: 'https://youtube.com/@ekatacooperative',
    linkedin: 'https://linkedin.com/company/ekata-cooperative',
    whatsapp: '9857099441',
    tiktok: 'https://tiktok.com/@ekatacoop'
  }),
  cms_brand_theme: JSON.stringify({
    themePreset: 'cyan',
    primaryColor: '#0981ae',
    primaryHover: '#07678d',
    primaryLight: '#eef8fc',
    secondaryColor: '#0cb3f0',
    accentColor: '#0284c7',
    headerBg: '#0981ae',
    topbarBg: '#052636'
  }),
  cms_documents: JSON.stringify([
    {
      id: 'doc-1',
      titleEn: '24th Annual General Meeting (AGM) Comprehensive Annual Report 2080/81',
      titleNp: '२४औं वार्षिक साधारण सभाको विस्तृत वार्षिक प्रतिवेदन पुस्तक (आ.व. २०८०/८१)',
      category: 'reports',
      fiscalYear: '2080/81 B.S.',
      fileSize: '4.8 MB',
      fileUrl: '/uploads/documents/ekata-annual-report-2080-81.pdf',
      publishDate: 'Ashwin 2081 B.S.',
      descriptionEn: 'Audited balance sheets, Board report, supervisory committee audit and dividend distribution statement.',
      descriptionNp: 'लेखापरीक्षित वासलात, सञ्चालक समिति प्रतिवेदन र लाभांश वितरण सम्बन्धी आधिकारिक पुस्तक।'
    },
    {
      id: 'doc-2',
      titleEn: 'Independent Statutory Chartered Accountant Audit Report (FY 2080/81)',
      titleNp: 'स्वतन्त्र वैधानिक लेखापरीक्षकको प्रतिवेदन तथा वासलात विवरण (आ.व. २०८०/८१)',
      category: 'reports',
      fiscalYear: '2080/81 B.S.',
      fileSize: '3.2 MB',
      fileUrl: '/uploads/documents/ekata-statutory-audit-2080-81.pdf',
      publishDate: 'Bhadra 2081 B.S.',
      descriptionEn: 'Unqualified statutory audit opinion issued by registered Chartered Accountants under NFRS norms.',
      descriptionNp: 'नेपाल चार्टर्ड एकाउन्ट्यान्ट्स संस्था (ICAN) का दर्तावाल लेखापरीक्षकद्वारा जारी गरिएको आधिकारिक लेखापरीक्षण प्रतिवेदन।'
    },
    {
      id: 'doc-3',
      titleEn: 'Approved Institutional Bylaws & Governance Regulations 2080 (Viniyamavali)',
      titleNp: 'संस्थाको स्वीकृत विनियम तथा विनियमावली २०८०',
      category: 'bylaws',
      fiscalYear: '2080 Revised',
      fileSize: '2.4 MB',
      fileUrl: '/uploads/documents/ekata-cooperative-bylaws-2080.pdf',
      publishDate: 'Mangsir 2080 B.S.',
      descriptionEn: 'Official bylaws governing share capital, savings accounts, credit appraisal, and member rights.',
      descriptionNp: 'सेयर पुँजी, बचत खाता, कर्जा लगानी तथा सदस्य अधिकार सम्बन्धी आधिकारिक विनियम।'
    },
    {
      id: 'doc-4',
      titleEn: 'Member Account Opening & eKYM Verification Physical Application Form',
      titleNp: 'नयाँ सदस्यता तथा भौतिक eKYM फाराम (डाउनलोड)',
      category: 'forms',
      fiscalYear: 'Current 2081/82',
      fileSize: '850 KB',
      fileUrl: '/uploads/documents/ekata-membership-ekym-form.pdf',
      publishDate: 'Baishakh 2081 B.S.',
      descriptionEn: 'Printable application form for offline counter submission, share issuance, and nominee registration.',
      descriptionNp: 'काउन्टरमा बुझाउन मिल्ने नयाँ शेयर सदस्यता तथा खाता खोल्ने आधिकारिक प्रिन्टयोग्य फाराम।'
    },
    {
      id: 'doc-5',
      titleEn: 'Cooperative Department PEARLS Prudential Standards & Supervision Directives',
      titleNp: 'सहकारी विभाग पर्ल्स (PEARLS) अनुगमन तथा वित्तीय मापदण्ड निर्देशिका',
      category: 'directives',
      fiscalYear: '2081 Directive',
      fileSize: '1.6 MB',
      fileUrl: '/uploads/documents/cooperative-pearls-directives.pdf',
      publishDate: 'Jestha 2081 B.S.',
      descriptionEn: 'Prudential norms, capital adequacy directives and risk management guidelines followed by Ankur Cooperative.',
      descriptionNp: 'पुँजी पर्याप्तता, तरलता व्यवस्थापन र कर्जा जोखिम सम्बन्धी कानुनी वित्तीय निर्देशिका।'
    }
  ]),
  cms_exchange_rates: JSON.stringify([
    {
      id: 'fx-inr',
      currencyCode: 'INR',
      currencyNameEn: 'Indian Rupee',
      currencyNameNp: 'भारतीय रूपैयाँ',
      flag: '🇮🇳',
      unit: 100,
      buyingRate: '160.00',
      sellingRate: '160.15',
      isFixed: true,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 1
    },
    {
      id: 'fx-usd',
      currencyCode: 'USD',
      currencyNameEn: 'U.S. Dollar',
      currencyNameNp: 'अमेरिकी डलर',
      flag: '🇺🇸',
      unit: 1,
      buyingRate: '134.25',
      sellingRate: '134.85',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 2
    },
    {
      id: 'fx-eur',
      currencyCode: 'EUR',
      currencyNameEn: 'European Euro',
      currencyNameNp: 'युरोपेली युरो',
      flag: '🇪🇺',
      unit: 1,
      buyingRate: '148.40',
      sellingRate: '149.06',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 3
    },
    {
      id: 'fx-gbp',
      currencyCode: 'GBP',
      currencyNameEn: 'UK Pound Sterling',
      currencyNameNp: 'बेलायती पाउण्ड स्टर्लिङ',
      flag: '🇬🇧',
      unit: 1,
      buyingRate: '175.80',
      sellingRate: '176.59',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 4
    },
    {
      id: 'fx-aud',
      currencyCode: 'AUD',
      currencyNameEn: 'Australian Dollar',
      currencyNameNp: 'अष्ट्रेलियन डलर',
      flag: '🇦🇺',
      unit: 1,
      buyingRate: '90.65',
      sellingRate: '91.06',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 5
    },
    {
      id: 'fx-cad',
      currencyCode: 'CAD',
      currencyNameEn: 'Canadian Dollar',
      currencyNameNp: 'क्यानेडियन डलर',
      flag: '🇨🇦',
      unit: 1,
      buyingRate: '99.10',
      sellingRate: '99.55',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 6
    },
    {
      id: 'fx-jpy',
      currencyCode: 'JPY',
      currencyNameEn: 'Japanese Yen',
      currencyNameNp: 'जापानी येन',
      flag: '🇯🇵',
      unit: 10,
      buyingRate: '9.32',
      sellingRate: '9.36',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 7
    },
    {
      id: 'fx-sar',
      currencyCode: 'SAR',
      currencyNameEn: 'Saudi Arabian Riyal',
      currencyNameNp: 'साउदी अरेबियन रियाल',
      flag: '🇸🇦',
      unit: 1,
      buyingRate: '35.78',
      sellingRate: '35.94',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 8
    },
    {
      id: 'fx-qar',
      currencyCode: 'QAR',
      currencyNameEn: 'Qatari Riyal',
      currencyNameNp: 'कतारी रियाल',
      flag: '🇶🇦',
      unit: 1,
      buyingRate: '36.82',
      sellingRate: '36.99',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 9
    },
    {
      id: 'fx-aed',
      currencyCode: 'AED',
      currencyNameEn: 'UAE Dirham',
      currencyNameNp: 'युएई दिराम',
      flag: '🇦🇪',
      unit: 1,
      buyingRate: '36.55',
      sellingRate: '36.71',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 10
    },
    {
      id: 'fx-myr',
      currencyCode: 'MYR',
      currencyNameEn: 'Malaysian Ringgit',
      currencyNameNp: 'मलेसियन रिंगिट',
      flag: '🇲🇾',
      unit: 1,
      buyingRate: '31.15',
      sellingRate: '31.29',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 11
    },
    {
      id: 'fx-krw',
      currencyCode: 'KRW',
      currencyNameEn: 'South Korean Won',
      currencyNameNp: 'दक्षिण कोरियन वन',
      flag: '🇰🇷',
      unit: 100,
      buyingRate: '10.04',
      sellingRate: '10.09',
      isFixed: false,
      isEnabled: true,
      updatedAt: '2083-05-15',
      sortOrder: 12
    }
  ]),
  cms_institutional_profiles: JSON.stringify([
    {
      id: 'inst-profile-1',
      titleEn: 'Corporate Identity & Statutory Charter',
      titleNp: 'संस्थागत पहिचान तथा वैधानिक वडापत्र',
      categoryEn: 'Statutory Profile',
      categoryNp: 'वैधानिक विवरण',
      subtitleEn: 'Registered under Cooperative Act 2048 & 2074 • Regd. No. 421/057/058',
      subtitleNp: 'सहकारी ऐन २०४८ र २०७४ बमोजिम दर्ता • दर्ता नं. ४२१/०५७/०५८',
      contentEn: 'Ankur Saving & Credit Cooperative Ltd. was formally registered on Baishakh 15, 2057 B.S. (2000 A.D.) under the Department of Cooperatives, Government of Nepal. Headquartered at Main Road, Traffic Chowk, Butwal-04, Rupandehi, the cooperative operates as a member-owned, democratically governed financial institution dedicated to sustainable socio-economic transformation across Lumbini Province.',
      contentNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. नेपाल सरकार सहकारी विभाग अन्तर्गत वि.सं. २०५७ वैशाख १५ गते विधिवत् रूपमा दर्ता भई सञ्चालनमा रहेको सदस्य-केन्द्रित वित्तीय संस्था हो। बुटवल-४, ट्राफिक चोकमा केन्द्रीय कार्यालय रहेको यस संस्थाले लुम्बिनी प्रदेशका सदस्यहरूको आर्थिक तथा सामाजिक रूपान्तरणमा अग्रणी भूमिका निर्वाह गर्दै आएको छ।',
      highlightsEn: [
        'Registration No.: 421/057/058 (Cooperative Department)',
        'PAN No.: 301548921 (Inland Revenue Office, Butwal)',
        'Working Jurisdiction: Rupandehi District & Lumbini Province',
        'Core Banking System (CBS) with 100% digital ledger compliance'
      ],
      highlightsNp: [
        'दर्ता नं.: ४२१/०५७/०५८ (डिभिजन सहकारी कार्यालय, रूपन्देही)',
        'स्थायी लेखा नं. (PAN): ३०१५४८९२१ (आन्तरिक राजस्व कार्यालय, बुटवल)',
        'कार्यक्षेत्र: रूपन्देही जिल्ला तथा लुम्बिनी प्रदेश',
        'पूर्ण डिजिटल कोर बैंकिङ प्रणाली (CBS) बाट सुरक्षित कारोबार'
      ],
      badgeEn: 'Statutory Identity',
      badgeNp: 'वैधानिक पहिचान',
      imageUrl: '/uploads/media/slide-banking.svg',
      isPublished: true,
      sortOrder: 1,
      updatedAt: '2083-05-15'
    },
    {
      id: 'inst-profile-2',
      titleEn: 'Financial Strength & PEARLS Prudential Indicators',
      titleNp: 'वित्तीय सबलता तथा पर्ल्स (PEARLS) सूचकांक विवरण',
      categoryEn: 'Financial Standing',
      categoryNp: 'वित्तीय अवस्था',
      subtitleEn: 'Audited Balance Sheet & Capital Adequacy Highlights (FY 2082/83)',
      subtitleNp: 'लेखापरीक्षित वासलात तथा पुँजी पर्याप्तता विवरण (आ.व. २०८२/८३)',
      contentEn: 'Guided by World Council of Credit Unions (WOCCU) PEARLS monitoring standards, Ankur Cooperative maintains a highly resilient balance sheet with Rs. 24.50 Crore in Institutional & Share Capital, Rs. 1.28 Arba in Member Savings, and 19.4% statutory liquid reserves. Every financial quarter undergoes rigorous internal audit by the Supervisory Committee and annual statutory audit by ICAN Chartered Accountants.',
      contentNp: 'अन्तर्राष्ट्रिय पर्ल्स (PEARLS) अनुगमन प्रणालीको पूर्ण पालना गर्दै यस संस्थाले रु. २४.५० करोड सेयर पुँजी, रु. १.२८ अर्ब बचत निक्षेप र १९.४% तरलता कोष कायम गरेको छ। लेखा सुपरिवेक्षण समितिबाट त्रैमासिक आन्तरिक लेखापरीक्षण तथा चार्टर्ड एकाउन्ट्यान्टबाट वार्षिक वैधानिक लेखापरीक्षण सम्पन्न गरिन्छ।',
      highlightsEn: [
        'Total Shareholding Members: 15,420+ Active Shareholder Families',
        'Total Savings & Deposits: Rs. 1.28 Arba (Audited)',
        'Productive Credit Portfolio: Rs. 98.40 Crore (NPL below 1.35%)',
        'Statutory Liquidity Reserve: 19.4% (Above 15% regulatory norm)'
      ],
      highlightsNp: [
        'कुल सेयर सदस्य संख्या: १५,४२०+ सक्रिय सदस्य परिवारहरू',
        'कुल बचत तथा निक्षेप: रु. १.२८ अर्ब (लेखापरीक्षित)',
        'कुल कर्जा लगानी: रु. ९८.४० करोड (भाखा नाघेको कर्जा १.३५% भन्दा कम)',
        'संस्थागत तरलता अनुपात: १९.४% (नियामक मापदण्ड १५% भन्दा माथि)'
      ],
      badgeEn: 'PEARLS Compliant',
      badgeNp: 'सबल वित्तीय सूचकांक',
      imageUrl: '/uploads/media/slide-deposits.svg',
      isPublished: true,
      sortOrder: 2,
      updatedAt: '2083-05-15'
    },
    {
      id: 'inst-profile-3',
      titleEn: 'Governance Structure, Affiliations & Social Responsibility',
      titleNp: 'संस्थागत सुशासन, आबद्धता तथा सामाजिक उत्तरदायित्व',
      categoryEn: 'Governance & CSR',
      categoryNp: 'सुशासन र समाज',
      subtitleEn: 'Affiliated with NEFSCUN, District Cooperative Union & National Cooperative Bank',
      subtitleNp: 'नेफ्स्कून, जिल्ला सहकारी संघ तथा राष्ट्रिय सहकारी बैंकमा आबद्ध',
      contentEn: 'Ankur Cooperative practices transparent three-tier democratic governance comprising the General Assembly, an elected 9-member Board of Directors, and an independent 3-member Account Supervisory Committee. Beyond financial intermediation, the institution invests 10% of annual net surplus into the Member Welfare, Health Relief, Scholarship, and Community Development Fund.',
      contentNp: 'साधारण सभा सर्वोच्च निकाय रहने गरी ९ सदस्यीय निर्वाचित सञ्चालक समिति र ३ सदस्यीय स्वतन्त्र लेखा सुपरिवेक्षण समितिमार्फत पूर्ण लोकतान्त्रिक सुशासन अभ्यास गरिएको छ। वित्तीय सेवाका अतिरिक्त संस्थाले सदस्य स्वास्थ्य उपचार कोष, जेहेन्दार छात्रवृत्ति, रक्तदान तथा वित्तीय साक्षरता अभियानहरू नियमित सञ्चालन गर्दछ।',
      highlightsEn: [
        'Affiliated with NEFSCUN, National Cooperative Bank & District Union',
        'Independent Account Supervisory Committee & Credit Sub-Committee',
        'Up to Rs. 50,000 Medical Hospitalization Relief for Members',
        'Annual Blood Donation, Tree Plantation & Women Entrepreneurship Grants'
      ],
      highlightsNp: [
        'नेफ्स्कून (NEFSCUN), राष्ट्रिय सहकारी बैंक तथा जिल्ला संघमा आबद्ध',
        'स्वतन्त्र लेखा सुपरिवेक्षण समिति तथा कर्जा उप-समितिद्वारा नियमित अनुगमन',
        'सदस्य आकस्मिक औषधि उपचारमा रु. ५०,००० सम्म कल्याणकारी राहत',
        'वार्षिक रक्तदान, वृक्षारोपण, महिला उद्यमशीलता र वित्तीय साक्षरता कार्यक्रम'
      ],
      badgeEn: 'Democratic Governance',
      badgeNp: 'पारदर्शी सुशासन',
      imageUrl: '/uploads/media/gallery-agm.svg',
      isPublished: true,
      sortOrder: 3,
      updatedAt: '2083-05-15'
    }
  ]),
  cms_monthly_financial_reports: JSON.stringify([
    {
      id: 'rep-m-2083-06',
      fiscalYear: 'आ.व. २०८३/८४',
      monthNp: 'असोज',
      monthEn: 'Ashwin',
      reportDateNp: '२०८३-०६-०१',
      reportDateEn: '2026-09-17',
      totalMembers: '44,520',
      shareCapital: 'रु. ३१,५०,००,०००/-',
      shareCapitalGrowth: '0.00% वृद्धि',
      reserveFund: 'रु. ४१,५०,००,०००/-',
      reserveFundGrowth: '0.00% वृद्धि',
      totalInstitutionalCapital: 'रु. ४३,१०,००,०००/-',
      totalInstitutionalCapitalNote: 'जगेडा + अन्य',
      otherFunds: 'रु. १,६०,००,०००/-',
      totalSavings: 'रु. ३,९२,००,००,०००/-',
      totalSavingsGrowth: '0.00% वृद्धि',
      loansDisbursed: 'रु. ३,७०,००,००,०००/-',
      borrowerMembersCount: '10,540 ऋणी सदस्य',
      liquidityAmount: 'रु. १,१०,००,००,०००/-',
      liquidityPercent: '28.06%',
      fixedAssets: 'रु. ८,९०,००,०००/-',
      totalAssets: 'रु. ४,९५,३५,४०,०००/-',
      npaPercent: 'NPA 4.75%',
      nplPercent: 'NPL 2.40%',
      liqPercentBadge: 'Liq 28.06%',
      isPublished: true,
      isLatest: true,
      sortOrder: 1,
      remarksNp: 'आ.व. २०८३/८४ असोज मसान्तसम्मको मासिक संस्थागत वित्तीय विवरण',
      remarksEn: 'Monthly institutional financial summary up to end of Ashwin 2083',
      updatedAt: '2083-06-01'
    },
    {
      id: 'rep-m-2083-05',
      fiscalYear: 'आ.व. २०८३/८४',
      monthNp: 'भदौ',
      monthEn: 'Bhadra',
      reportDateNp: '२०८३-०५-०१',
      reportDateEn: '2026-08-17',
      totalMembers: '44,180',
      shareCapital: 'रु. ३१,२५,००,०००/-',
      shareCapitalGrowth: '0.00% वृद्धि',
      reserveFund: 'रु. ४१,३०,००,०००/-',
      reserveFundGrowth: '0.00% वृद्धि',
      totalInstitutionalCapital: 'रु. ४२,८०,००,०००/-',
      totalInstitutionalCapitalNote: 'जगेडा + अन्य',
      otherFunds: 'रु. १,५०,००,०००/-',
      totalSavings: 'रु. ३,८८,००,००,०००/-',
      totalSavingsGrowth: '0.00% वृद्धि',
      loansDisbursed: 'रु. ३,६८,००,००,०००/-',
      borrowerMembersCount: '10,450 ऋणी सदस्य',
      liquidityAmount: 'रु. १,०८,५०,००,०००/-',
      liquidityPercent: '27.96%',
      fixedAssets: 'रु. ८,८५,००,०००/-',
      totalAssets: 'रु. ४,९१,१०,२०,०००/-',
      npaPercent: 'NPA 4.78%',
      nplPercent: 'NPL 2.42%',
      liqPercentBadge: 'Liq 27.96%',
      isPublished: true,
      isLatest: false,
      sortOrder: 2,
      remarksNp: 'आ.व. २०८३/८४ भदौ मसान्तसम्मको मासिक संस्थागत वित्तीय विवरण',
      remarksEn: 'Monthly institutional financial summary up to end of Bhadra 2083',
      updatedAt: '2083-05-01'
    },
    {
      id: 'rep-m-2083-03',
      fiscalYear: 'आ.व. २०८२/८३',
      monthNp: 'असार',
      monthEn: 'Ashadh',
      reportDateNp: '२०८३-०३-०१',
      reportDateEn: '2026-06-15',
      totalMembers: '43,892',
      shareCapital: 'रु. ३१,०८,४०,४००/-',
      shareCapitalGrowth: '0.00% वृद्धि',
      reserveFund: 'रु. ४१,१८,२४,२८०/-',
      reserveFundGrowth: '0.00% वृद्धि',
      totalInstitutionalCapital: 'रु. ४२,६६,४४,५५८/-',
      totalInstitutionalCapitalNote: 'जगेडा + अन्य',
      otherFunds: 'रु. १,४८,२०,२७८/-',
      totalSavings: 'रु. ३,८०,१८,०७,८६०/-',
      totalSavingsGrowth: '0.00% वृद्धि',
      loansDisbursed: 'रु. ३,६४,७०,९१,०६६/-',
      borrowerMembersCount: '10,380 ऋणी सदस्य',
      liquidityAmount: 'रु. १,०७,५३,५४,०५५/-',
      liquidityPercent: '27.56%',
      fixedAssets: 'रु. ८,८३,४७,०५४/-',
      totalAssets: 'रु. ४,८८,२२,३८,५६१/-',
      npaPercent: 'NPA 4.82%',
      nplPercent: 'NPL 2.45%',
      liqPercentBadge: 'Liq 27.56%',
      isPublished: true,
      isLatest: false,
      sortOrder: 3,
      remarksNp: 'आ.व. २०८२/८३ असार मसान्तसम्मको मासिक संस्थागत वित्तीय सारांश',
      remarksEn: 'Monthly institutional financial summary up to end of Ashadh 2083',
      updatedAt: '2083-03-01'
    },
    {
      id: 'rep-m-2083-02',
      fiscalYear: 'आ.व. २०८२/८३',
      monthNp: 'जेठ',
      monthEn: 'Jestha',
      reportDateNp: '२०८३-०२-०१',
      reportDateEn: '2026-05-15',
      totalMembers: '43,369',
      shareCapital: 'रु. ३०,८६,४३,४००/-',
      shareCapitalGrowth: '0.00% वृद्धि',
      reserveFund: 'रु. ४१,१८,२४,२८०/-',
      reserveFundGrowth: '0.00% वृद्धि',
      totalInstitutionalCapital: 'रु. ४२,६६,४४,५५८/-',
      totalInstitutionalCapitalNote: 'जगेडा + अन्य',
      otherFunds: 'रु. १,४८,२०,२८८/-',
      totalSavings: 'रु. ३,८५,६५,६१,५७८/-',
      totalSavingsGrowth: '0.00% वृद्धि',
      loansDisbursed: 'रु. ३,५८,५९,३७,८०९/-',
      borrowerMembersCount: '11,309 ऋणी सदस्य',
      liquidityAmount: 'रु. १,०७,१८,६५,६८६/-',
      liquidityPercent: '27.79%',
      fixedAssets: 'रु. ८,८८,६७,४३७/-',
      totalAssets: 'रु. ४,८१,६०,७२,८२४/-',
      npaPercent: 'NPA 4.66%',
      nplPercent: 'NPL 2.67%',
      liqPercentBadge: 'Liq 27.79%',
      isPublished: true,
      isLatest: false,
      sortOrder: 4,
      remarksNp: 'आ.व. २०८२/८३ जेठ मसान्तसम्मको मासिक संस्थागत वित्तीय सारांश',
      remarksEn: 'Monthly institutional financial summary up to end of Jestha 2083',
      updatedAt: '2083-02-01'
    }
  ]),
  cms_leadership_members: JSON.stringify([
    {
      id: 'lead-1',
      category: 'chairman',
      nameEn: 'Mr. Bharat Sharma Pokhrel',
      nameNp: 'श्री भरत शर्मा पोखरेल',
      designationEn: 'Chairman, Board of Directors',
      designationNp: 'अध्यक्ष, सञ्चालक समिति',
      photoUrl: '/uploads/media/team-chairman.svg',
      shortMessageEn: 'Over 24 glorious years, Ankur Cooperative has stood firm on the rock of integrity, accountability, and collective member empowerment. Every rupee entrusted to Ankur remains 100% safe, productive, and transparent.',
      shortMessageNp: 'विगत २४ वर्षको गौरवमय यात्रामा यस संस्थाले समुदायको विश्वास, पारदर्शिता र वित्तीय सुशासनलाई आफ्नो मूल मन्त्र बनाएको छ। संस्थामा जम्मा भएको हरेक पैसा १००% सुरक्षित र उत्पादनशील छ।',
      fullMessageEn: 'Warm greetings to all our respected members, well-wishers, and community partners.\n\nOver the past 24 years, Ankur Saving & Credit Cooperative Ltd. has stood firm on the rock of integrity, accountability, and collective empowerment. Even in challenging macroeconomic landscapes, our cooperative has recorded steady growth in deposits, prudent loan management, and robust reserve capital. This resilience is solely due to the unwavering trust of our 15,420+ members.\n\nOur focus today is dual: deepening grassroots member welfare through affordable agricultural and enterprise credit, while rapidly adopting world-class digital banking systems such as NepalPay QR, instant interbank transfers, and 24/7 mobile access. We reiterate our sacred pledge that every single rupee entrusted to Ankur Cooperative remains completely secure, productive, and transparently accounted for.\n\nI convey my profound gratitude to our Board members, statutory committees, dedicated employees, and especially our shareholder members whose active participation is the beating heart of Ankur.',
      fullMessageNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. का सम्पूर्ण आदरणीय शेयर सदस्य महानुभावहरू, नियमनकारी निकाय तथा शुभचिन्तकहरूमा हार्दिक नमस्कार तथा न्यानो अभिवादन व्यक्त गर्दछु।\n\nविगत २४ वर्षको गौरवमय यात्रामा यस संस्थाले समुदायको विश्वास, पारदर्शिता र वित्तीय सुशासनलाई आफ्नो मूल मन्त्र बनाएको छ। आर्थिक चुनौतीका बाबजुद हाम्रो संस्थाले निक्षेप संकलन, सुरक्षित कर्जा प्रवाह र जगेडा कोष सुदृढीकरणमा ऐतिहासिक सफलता हासिल गरेको छ। यो सफलता सम्पूर्ण १५,४२० भन्दा बढी सदस्यहरूको अविचल भरोसाको प्रतिफल हो।\n\nआजको युग प्रविधिको युग हो। हामीले सदस्यहरूको सुविधाका लागि मोबाइल बैंकिङ, नेपालपे क्युआर भुक्तानी र अनलाइन eKYM जस्ता आधुनिक सेवाहरू घरघरमै पुर्याएका छौं। संस्थामा जम्मा भएको हरेक पैसा १००% सुरक्षित र उत्पादनशील क्षेत्रमा परिचालन भइरहेको व्यहोरा म स्पष्ट पार्न चाहन्छु।\n\nसंस्थालाई यहाँसम्म पुर्याउन अहोरात्र खट्नुहुने सञ्चालक समिति, लेखा सुपरिवेक्षण समिति, सम्पूर्ण समर्पित कर्मचारी तथा सदैव मार्गदर्शन गर्नुहुने सम्पूर्ण शेयर सदस्यज्यूहरूमा हार्दिक कृतज्ञता व्यक्त गर्दछु।',
      phone: '071-540123 (Ext. 101)',
      email: 'chairman@ekatacoop.com.np',
      officeRoomEn: 'Executive Board Suite, 3rd Floor',
      officeRoomNp: 'कार्यकारी सञ्चालक कक्ष, तेस्रो तल्ला',
      availabilityEn: 'Sunday to Friday: 11:00 AM - 3:00 PM',
      availabilityNp: 'आइतबार देखि शुक्रबार: बिहान ११:०० देखि दिउँसो ३:०० बजेसम्म',
      actionType: 'read_more',
      actionLabelEn: 'Read More',
      actionLabelNp: 'विस्तृत सन्देश',
      sortOrder: 1,
      isActive: true,
      publishedDate: '2081 Ashwin'
    },
    {
      id: 'lead-2',
      category: 'ceo',
      nameEn: 'Mr. Ramesh Kumar Gautam',
      nameNp: 'श्री रमेश कुमार गौतम',
      designationEn: 'Chief Executive Officer (CEO)',
      designationNp: 'प्रमुख कार्यकारी अधिकृत (CEO)',
      photoUrl: '/uploads/media/team-ceo.svg',
      shortMessageEn: 'Our executive priority is translating board policies into swift, transparent daily financial operations. In FY 2081/82, we upgraded our Core Banking System and streamlined loan turnaround to under 48 hours.',
      shortMessageNp: 'हाम्रो व्यवस्थापकीय ध्येय भनेको सदस्यहरूलाई छिटोछरितो, पारदर्शी र आधुनिक वित्तीय सेवा प्रवाह गर्नु हो। आधुनिक सीबीएस, ४८ घण्टाभित्रै कर्जा प्रक्रिया र घरदैलो बैंकिङ हाम्रो प्रतिबद्धता हो।',
      fullMessageEn: 'Dear Esteemed Members and Stakeholders,\n\nIt is an honor to steer the operational management of Ankur Saving & Credit Cooperative Ltd. Our core mission as the executive team is to translate the vision of the Board of Directors into swift, transparent, and seamless daily financial services for every member visiting our counters or tapping on our mobile app.\n\nIn Fiscal Year 2081/82, we have upgraded our Core Banking System (CBS) to an enterprise-grade platform with real-time audit controls, automated interest postings, and multi-factor TLS encryption. Our turnaround time for personal and micro-business credit evaluation has been reduced from days to under 48 hours. Furthermore, our risk appraisal committee conducts direct site visits to ensure productive capital utilization and high loan recovery rates.\n\nWhether you need a safe avenue for daily savings, funding for children\'s higher education, business expansion loans, or instant worldwide remittances, our competent team across all service centers is at your service with humility and professional competence.',
      fullMessageNp: 'आदरणीय शेयर सदस्य महानुभावहरू तथा सरोकारवालाहरूमा नमस्कार।\n\nअंकुर बचत तथा ऋण सहकारी संस्थाको दैनिक कार्य सञ्चालन र व्यवस्थापकीय नेतृत्व सम्हाल्न पाउँदा म अत्यन्त गौरवान्वित छु। हाम्रो व्यवस्थापन टोलीको मुख्य ध्येय भनेको सञ्चालक समितिले तय गरेका रणनीतिक नीतिहरूलाई व्यवहारमा उतारी सदस्यहरूलाई छिटोछरितो, पारदर्शी र आधुनिक वित्तीय सेवा प्रवाह गर्नु हो।\n\nचालु आर्थिक वर्षमा हामीले हाम्रो कोर बैंकिङ प्रणाली (CBS) लाई अत्याधुनिक बनाउँदै स्वचालित ब्याज भुक्तानी, दैनिक कारोबार अडिट र सुरक्षित डिजिटल बैंकिङ सुनिश्चित गरेका छौं। कर्जा आवेदन परेको ४८ घण्टाभित्रै स्थलगत निरीक्षण र मूल्याङ्कन सम्पन्न गरी ऋण प्रवाह गर्ने प्रणाली स्थापित गरिएको छ।\n\nतपाईंलाई दैनिक बचत, बालबालिकाको उच्च शिक्षा, व्यापार विस्तार कर्जा वा अन्तर्राष्ट्रिय रेमिट्यान्स सेवा आवश्यक पर्दा हाम्रा सम्पूर्ण सेवा केन्द्रका कर्मचारी साथीहरू सदैव यहाँहरूको सेवामा समर्पित रहनेछन्।',
      phone: '071-540123 (Ext. 102)',
      email: 'ceo@ekatacoop.com.np',
      officeRoomEn: 'CEO Secretariat, 2nd Floor',
      officeRoomNp: 'प्रमुख कार्यकारी सचिवालय, दोस्रो तल्ला',
      availabilityEn: 'Sunday to Friday: 10:00 AM - 4:00 PM',
      availabilityNp: 'आइतबार देखि शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० बजेसम्म',
      actionType: 'read_more',
      actionLabelEn: 'Read More',
      actionLabelNp: 'विस्तृत सन्देश',
      sortOrder: 2,
      isActive: true,
      publishedDate: '2081 Ashwin'
    },
    {
      id: 'lead-3',
      category: 'info_officer',
      nameEn: 'Er. Sujan Adhikari',
      nameNp: 'इ. सुजन अधिकारी',
      designationEn: 'Information Officer & IT Head',
      designationNp: 'सूचना अधिकारी तथा सूचना प्रविधि प्रमुख',
      photoUrl: '/uploads/media/team-info-officer.svg',
      shortMessageEn: 'Right to Information (RTI) Desk: Respected members and citizens can freely access audited balance sheets, interest schedules, institutional decisions, and regulatory disclosures.',
      shortMessageNp: 'सूचनाको हक (RTI) सम्बन्धी डेस्क: आदरणीय सदस्य महानुभावहरू तथा नागरिकहरूले संस्थागत विवरण, लेखापरीक्षण प्रतिवेदन, ब्याजदर तालिका र नियमनकारी सूचना सहजै प्राप्त गर्न सक्नुहुनेछ।',
      fullMessageEn: 'Under Article 27 of the Constitution of Nepal and the Right to Information Act 2064, Ankur Saving & Credit Cooperative Ltd. upholds total institutional transparency.\n\nAll quarterly financial health statements, PEARLS monitoring indices, AGM decisions, and cooperative audit reports are proactively maintained and accessible to members. Should any member require specific public disclosures or official documentation, please reach out to the Information Desk via phone, email, or in-person visit during official business hours.',
      fullMessageNp: 'नेपालको संविधानको धारा २७ तथा सूचनाको हक सम्बन्धी ऐन २०६४ को मर्म अनुरूप अंकुर बचत तथा ऋण सहकारी संस्था लि. ले संस्थागत पारदर्शितालाई पूर्ण रूपमा आत्मसात् गरेको छ।\n\nसंस्थाका त्रैमासिक वित्तीय विवरणहरू, पर्ल्स (PEARLS) अनुगमन सूचकांकहरू, साधारण सभाका निर्णयहरू तथा लेखापरीक्षण प्रतिवेदनहरू नियमित रूपमा सार्वजनिक गरिँदै आएको छ। कुनै पनि आधिकारिक सूचना वा विवरण आवश्यक परेमा सूचना अधिकारीको कार्यकक्षमा सम्पर्क गरी वा तोकिएको प्रक्रिया पूरा गरी प्राप्त गर्न सकिनेछ।',
      phone: '071-540123 (Ext. 108)',
      email: 'info@ekatacoop.com.np',
      officeRoomEn: 'RTI & Digital Desk, Room 108, 1st Floor',
      officeRoomNp: 'सूचना डेस्क तथा डिजिटल कक्ष, कोठा १०८, पहिलो तल्ला',
      availabilityEn: 'Sunday to Friday: 10:30 AM - 4:30 PM',
      availabilityNp: 'आइतबार देखि शुक्रबार: बिहान १०:३० देखि दिउँसो ४:३० बजेसम्म',
      actionType: 'view_details',
      actionLabelEn: 'View Details',
      actionLabelNp: 'विवरण हेर्नुहोस्',
      sortOrder: 3,
      isActive: true,
      publishedDate: '2081 Ashwin'
    },
    {
      id: 'lead-4',
      category: 'grievance_officer',
      nameEn: 'Mr. Manoj Poudel',
      nameNp: 'श्री मनोज पौडेल',
      designationEn: 'Grievance Hearing Officer & Senior Compliance Lead',
      designationNp: 'वरिष्ठ अनुपालन अधिकृत तथा गुनासो सुनुवाइ अधिकारी',
      photoUrl: '/uploads/media/team-grievance-officer.svg',
      shortMessageEn: 'Member Grievance & Redressal Cell: All complaints, suggestions, and counter feedback are confidentially logged, acknowledged within 24 hours, and resolved within 3 to 7 working days.',
      shortMessageNp: 'सदस्य गुनासो सुनुवाइ कक्ष: काउन्टर सेवा, एसएमएस, कर्जा वा बचत सम्बन्धी सम्पूर्ण गुनासाहरू २४ घण्टाभित्र प्रारम्भिक सुनुवाइ तथा ३ देखि ७ कार्यदिनभित्र निष्पक्ष रूपमा समाधान गरिनेछ।',
      fullMessageEn: 'Ankur Saving & Credit Cooperative Ltd. maintains a zero-tolerance policy toward service lapses and member dissatisfaction. As the designated Grievance Hearing Officer, I personally oversee every formal complaint submitted through physical suggestion boxes, our digital website portal, or in-person petitions.\n\nOur institutional grievance charter guarantees:\n1. A unique tracking ticket code for every submission.\n2. Initial acknowledgement and triage within 24 business hours.\n3. Fair, confidential investigation by the Internal Audit & Supervisory Committee.\n4. Complete redressal and formal telephonic/written feedback within 3 to 7 working days.\n\nWe encourage all members to voice their honest concerns to help us continuously elevate our service standards.',
      fullMessageNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. ले सदस्य सन्तुष्टि र उपभोक्ता संरक्षणलाई सर्वोच्च प्राथमिकता दिएको छ। संस्थाको गुनासो सुनुवाइ अधिकारीका रूपमा वेबसाइट, सुझाव पेटिका वा प्रत्यक्ष दर्ता भएका सम्पूर्ण गुनासाहरूको निष्पक्ष छानबिन र सुनुवाइ गर्ने जिम्मेवारी म वहन गर्दछु।\n\nहाम्रो गुनासो सुनुवाइ कार्यविधि अनुसार:\n१. प्रत्येक गुनासोको छुट्टै ट्र्याकिङ टिकट कोड प्रदान गरिनेछ।\n२. २४ घण्टाभित्र प्रारम्भिक सुनुवाइ र सम्बन्धित शाखा/विभागमा छानबिन सुरु गरिनेछ।\n३. आन्तरिक लेखापरीक्षण एकाइद्वारा ३ देखि ७ कार्यदिनभित्र सन्तोषजनक समाधान गरिनेछ।\n४. गुनासोकर्ता सदस्यलाई समाधानको औपचारिक जानकारी टेलिफोन वा लिखित रूपमा दिइनेछ।\n\nकुनै पनि सेवा सम्बन्धी समस्या भएमा निर्धक्क भई आफ्नो गुनासो दर्ता गराउनुहोला।',
      phone: '071-540123 (Ext. 106)',
      email: 'grievance@ekatacoop.com.np',
      officeRoomEn: 'Compliance & Audit Cell, Room 204, 2nd Floor',
      officeRoomNp: 'अनुपालन तथा आन्तरिक लेखा कक्ष, कोठा २०४, दोस्रो तल्ला',
      availabilityEn: 'Sunday to Friday: 11:00 AM - 3:00 PM',
      availabilityNp: 'आइतबार देखि शुक्रबार: बिहान ११:०० देखि दिउँसो ३:०० बजेसम्म',
      actionType: 'file_grievance',
      actionLabelEn: 'File Grievance',
      actionLabelNp: 'गुनासो दर्ता',
      sortOrder: 4,
      isActive: true,
      publishedDate: '2081 Ashwin'
    }
  ])
};

export const INITIAL_INTEREST_RATES = [
  { category: 'Deposit', scheme_en: 'Regular Savings Account', scheme_np: 'साधारण बचत खाता', rate_percent: 7.25, basis_en: 'Daily balance calculation, quarterly payout', basis_np: 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी', min_balance: 500 },
  { category: 'Deposit', scheme_en: 'Nari Kalyan Bachat', scheme_np: 'नारी कल्याण बचत', rate_percent: 8.00, basis_en: 'Monthly interest payout with free digital banking', basis_np: 'मासिक ब्याज भुक्तानी तथा निःशुल्क मोबाइल बैंकिङ', min_balance: 1000 },
  { category: 'Deposit', scheme_en: 'Senior Citizen Care Fund', scheme_np: 'ज्येष्ठ नागरिक सम्मान बचत', rate_percent: 9.50, basis_en: 'Quarterly interest, priority counter service', basis_np: 'त्रैमासिक ब्याज, ज्येष्ठ नागरिक विशेष काउन्टर', min_balance: 1000 },
  { category: 'Deposit', scheme_en: 'Child Bright Future Scheme', scheme_np: 'बाल उज्ज्वल भविष्य बचत', rate_percent: 9.00, basis_en: 'Annual compounding growth for education', basis_np: 'वार्षिक चक्रवृद्धिय ब्याज, उच्च शिक्षा योजना', min_balance: 500 },
  { category: 'Deposit', scheme_en: '1-Year Fixed Term Deposit', scheme_np: '१ वर्षे मुद्दती निक्षेप', rate_percent: 10.50, basis_en: 'Highest quarterly credited returns', basis_np: 'त्रैमासिक रूपमा खातामै ब्याज जम्मा', min_balance: 25000 },
  { category: 'Deposit', scheme_en: '2-Year+ Golden Term Deposit', scheme_np: '२ वर्षे स्वर्ण मुद्दती निक्षेप', rate_percent: 11.75, basis_en: 'Maximum yield with 90% loan facility', basis_np: 'सर्वाधिक ११.७५% प्रतिफल तथा ९०% सम्म कर्जा सुविधा', min_balance: 50000 },
  { category: 'Loan', scheme_en: 'Agricultural Productive Loan', scheme_np: 'व्यावसायिक कृषि तथा पशुपालन कर्जा', rate_percent: 12.00, basis_en: 'Subsidized priority credit for local farmers', basis_np: 'स्थानीय किसानहरूको लागि सहुलियतपूर्ण ब्याज', min_balance: 0 },
  { category: 'Loan', scheme_en: 'SME & Enterprise Expansion Loan', scheme_np: 'साना तथा मझौला व्यवसाय कर्जा', rate_percent: 13.50, basis_en: 'Working capital for trading and shops', basis_np: 'पसल तथा व्यवसाय सञ्चालनका लागि सरल कर्जा', min_balance: 0 },
  { category: 'Loan', scheme_en: 'Residential Housing & Land Loan', scheme_np: 'आवास निर्माण तथा जग्गा खरिद कर्जा', rate_percent: 13.00, basis_en: 'Up to 15 years flexible amortization', basis_np: '१५ वर्षसम्मको सहज किस्ताबन्दी सुविधा', min_balance: 0 },
  { category: 'Loan', scheme_en: 'Social & Foreign Employment Loan', scheme_np: 'सामाजिक तथा वैदेशिक रोजगार कर्जा', rate_percent: 13.50, basis_en: 'Fast approval for skill & career opportunities', basis_np: 'द्रुत प्रक्रियाबाट सहज कर्जा प्रवाह', min_balance: 0 }
];

export const INITIAL_NOTICES = [
  {
    title_en: '24th Annual General Meeting Report Published',
    title_np: '२४औं वार्षिक साधारण सभाको प्रतिवेदन पुस्तिका प्रकाशन सम्बन्धमा',
    category_en: 'AGM Notice',
    publish_date: '२०८१ असोज १५',
    content_en: 'The official report book of the 24th AGM has been published and is available for all shareholders at our head office and digital portal.',
    content_np: 'संस्थाको २४औं वार्षिक साधारण सभाको पूर्ण प्रतिवेदन पुस्तिका आधिकारिक वेबसाइट तथा मुख्य कार्यालय बुटवलमा उपलब्ध छ।',
    date_en: '15 Sep 2026',
    is_active: 1
  },
  {
    title_en: 'Revised Interest Rates Effective from Kartik 1, 2081',
    title_np: 'नयाँ ब्याजदर तालिका मिति २०८१ कार्तिक १ गतेदेखि लागू भएको सम्बन्धी सूचना',
    category_en: 'Interest Rates',
    publish_date: '२०८१ कार्तिक ०१',
    content_en: 'All valued members are notified that high yield deposit interest rates up to 11.75% per annum are now active across all branches.',
    content_np: 'सम्पूर्ण आदरणीय सेयर सदस्य महानुभावहरूमा अधिकतम ११.७५% सम्मको नयाँ ब्याजदर लागू भएको जानकारी गराइन्छ।',
    date_en: '18 Sep 2026',
    is_active: 1
  },
  {
    title_en: 'Staff Career Vacancies Application Process',
    title_np: 'खुला पदपूर्ति दरखास्त आह्वान सम्बन्धी सूचना',
    category_en: 'Career',
    publish_date: '२०८१ असोज २५',
    content_en: 'Ankur Cooperative invites eligible, dedicated candidates for the positions of Assistant Manager and Junior Teller. Applications open till deadline.',
    content_np: 'यस संस्थाका लागि आवश्यक सहायक प्रबन्धक तथा कनिष्ठ सहायक (टेलर) पदमा आवेदन खुला गरिएको छ।',
    date_en: '10 Sep 2026',
    is_active: 1
  }
];

export const INITIAL_EKYM_SEEDS = [
  [
    'EKT-KYC-2083-0941', 'Subhash Sharma', 'सुभाष शर्मा', 'Bishnu Prasad Sharma', 'Chhabilal Sharma',
    'Radha Devi Sharma', 'Sunita Sharma', '2045-03-14', 'Male', '38-01-72-04821', 'Rupandehi',
    '9857099441', 'subhash.sharma@gmail.com',
    'Butwal Sub-Metropolitan-04, Traffic Chowk, Rupandehi', 'Butwal-04, Rupandehi',
    'Wholesale Grocery Merchant', 'Rs. 950,000', 'Global IME Bank Ltd.', '04801010048123',
    'Sunita Sharma', 'Wife', '38-01-76-02911', 'Pending',
    'Documents uploaded: Citizenship front & back, PP photo, utility receipt verified.',
    '2083-05-12 10:30 AM'
  ],
  [
    'EKT-KYC-2083-0942', 'Anita Adhikari', 'अनिता अधिकारी', 'Dhaniram Adhikari', 'Tek Bahadur Adhikari',
    'Moti Maya Adhikari', 'Ganesh Adhikari', '2050-08-21', 'Female', '38-02-75-01992', 'Rupandehi',
    '9847088123', 'anita.adhikari@yahoo.com',
    'Tilottama Municipality-02, Janakinagar, Rupandehi', 'Tilottama-02, Rupandehi',
    'Secondary School Teacher', 'Rs. 580,000', 'Nabil Bank Ltd.', '1120098471201',
    'Ganesh Adhikari', 'Husband', '38-02-71-08471', 'Pending',
    'Awaiting signature verification on specimen card.',
    '2083-05-11 02:15 PM'
  ],
  [
    'EKT-KYC-2083-0943', 'Ramesh Bahadur Thapa', 'रमेश बहादुर थापा', 'Narayan Bahadur Thapa', 'Harka Bahadur Thapa',
    'Kaushilya Thapa', 'Meena Thapa', '2042-11-05', 'Male', '38-03-70-12849', 'Rupandehi',
    '9867011920', 'ramesh.thapa@outlook.com',
    'Sainamaina Municipality-01, Parroha, Rupandehi', 'Sainamaina-01, Rupandehi',
    'Dairy & Commercial Farm Owner', 'Rs. 1,200,000', 'Rastriya Banijya Bank', '3040001928471',
    'Meena Thapa', 'Wife', '38-03-74-09122', 'Pending',
    'Farm registration certificate attached.',
    '2083-05-10 11:45 AM'
  ],
  [
    'EKT-KYC-2083-0940', 'Ram Chandra Sharma', 'रामचन्द्र शर्मा', 'Loknath Sharma', 'Gangadhar Sharma',
    'Bhawani Devi Sharma', 'Kamala Sharma', '2038-06-18', 'Male', '38-01-68-09123', 'Rupandehi',
    '9857012345', 'ram.sharma@ekatacoop.com.np',
    'Butwal Sub-Metropolitan-04, Golpark, Rupandehi', 'Butwal-04, Rupandehi',
    'Commercial Agriculture & Enterprise', 'Rs. 840,000', 'Siddhartha Bank Ltd.', '0182049182741',
    'Kamala Sharma', 'Wife', '38-01-70-04912', 'Approved',
    'Verified by KYC Officer and approved by Credit/Executive Committee.',
    '2083-04-20 09:10 AM'
  ]
];

// Initialize SQLite tables
function initSqliteTables(sdb: DatabaseSync) {
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS ekym_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_no VARCHAR(40) UNIQUE NOT NULL,
      full_name_en VARCHAR(120) NOT NULL,
      full_name_np VARCHAR(120) NOT NULL,
      father_name VARCHAR(120) NOT NULL,
      grandfather_name VARCHAR(120) NOT NULL,
      mother_name VARCHAR(120),
      spouse_name VARCHAR(120),
      dob VARCHAR(30) NOT NULL,
      gender VARCHAR(20) NOT NULL,
      citizenship_no VARCHAR(50) NOT NULL,
      citizenship_district VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      permanent_address VARCHAR(200) NOT NULL,
      current_address VARCHAR(200) NOT NULL,
      occupation VARCHAR(100) NOT NULL,
      annual_income VARCHAR(50) NOT NULL,
      bank_name VARCHAR(100) NOT NULL,
      bank_account_no VARCHAR(50) NOT NULL,
      nominee_name VARCHAR(120) NOT NULL,
      nominee_relation VARCHAR(50) NOT NULL,
      nominee_citizenship VARCHAR(50),
      status VARCHAR(30) DEFAULT 'Pending',
      remarks TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      details_json TEXT
    );
  `);

  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN details_json TEXT;');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN member_photo TEXT;');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN citizenship_front TEXT;');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN citizenship_back TEXT;');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN perm_province VARCHAR(80);');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN perm_district VARCHAR(80);');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN temp_province VARCHAR(80);');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN temp_district VARCHAR(80);');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;');
  } catch (e) {}
  try {
    sdb.exec('ALTER TABLE ekym_submissions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;');
  } catch (e) {}

  // Create popup_notices table in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS popup_notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notice_key VARCHAR(60) UNIQUE NOT NULL,
      active INTEGER DEFAULT 1,
      title_en VARCHAR(255) NOT NULL,
      title_np VARCHAR(255) NOT NULL,
      category_en VARCHAR(100) NOT NULL,
      category_np VARCHAR(100) NOT NULL,
      image_url TEXT,
      content_en TEXT NOT NULL,
      content_np TEXT NOT NULL,
      bullet_points_en TEXT,
      bullet_points_np TEXT,
      date_en VARCHAR(50) NOT NULL,
      date_np VARCHAR(50) NOT NULL,
      notice_ref VARCHAR(100),
      action_text_en VARCHAR(100),
      action_text_np VARCHAR(100),
      action_link VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create media_files table in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_key VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size INTEGER NOT NULL,
      category VARCHAR(50) DEFAULT 'general',
      alt_text VARCHAR(255) DEFAULT '',
      is_system_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed ekym_submissions if empty
  const countEkym = sdb.prepare('SELECT count(*) as count FROM ekym_submissions').get() as { count: number };
  if (!countEkym || countEkym.count === 0) {
    const seedInsert = sdb.prepare(`
      INSERT INTO ekym_submissions (
        application_no, full_name_en, full_name_np, father_name, grandfather_name,
        mother_name, spouse_name, dob, gender, citizenship_no, citizenship_district,
        phone, email, permanent_address, current_address, occupation, annual_income,
        bank_name, bank_account_no, nominee_name, nominee_relation, nominee_citizenship,
        status, remarks, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const record of INITIAL_EKYM_SEEDS) {
      seedInsert.run(...record);
    }
  }

  // Seed popup_notices if empty
  const countPopup = sdb.prepare('SELECT count(*) as count FROM popup_notices').get() as { count: number };
  if (!countPopup || countPopup.count === 0) {
    const seedPopup = sdb.prepare(`
      INSERT INTO popup_notices (
        notice_key, active, title_en, title_np, category_en, category_np,
        image_url, content_en, content_np, bullet_points_en, bullet_points_np,
        date_en, date_np, notice_ref, action_text_en, action_text_np, action_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of INITIAL_POPUP_NOTICES) {
      seedPopup.run(
        p.notice_key, p.active, p.title_en, p.title_np, p.category_en, p.category_np,
        p.image_url, p.content_en, p.content_np, p.bullet_points_en, p.bullet_points_np,
        p.date_en, p.date_np, p.notice_ref, p.action_text_en, p.action_text_np, p.action_link
      );
    }
  }

  // Seed media_files in SQLite if empty
  const countMedia = sdb.prepare('SELECT count(*) as count FROM media_files').get() as { count: number };
  if (!countMedia || countMedia.count === 0) {
    const seedMedia = sdb.prepare(`
      INSERT INTO media_files (
        media_key, title, filename, file_path, file_type, file_size, category, alt_text, is_system_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const m of INITIAL_MEDIA_FILES) {
      seedMedia.run(
        m.media_key, m.title, m.filename, m.file_path, m.file_type, m.file_size, m.category, m.alt_text, m.is_system_default
      );
    }
  }

  // Create site_settings in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const seedSetting = sdb.prepare(`
    INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)
  `);
  for (const [k, v] of Object.entries(INITIAL_SITE_SETTINGS)) {
    seedSetting.run(k, v);
  }

  // Ensure notice image URLs point to local media instead of external links
  try {
    sdb.exec(`
      UPDATE popup_notices SET image_url = '/uploads/media/notice-agm.svg' WHERE notice_key = 'notice-agm-24' AND (image_url LIKE 'http%' OR image_url LIKE '%unsplash%');
      UPDATE popup_notices SET image_url = '/uploads/media/notice-ekym.svg' WHERE notice_key = 'notice-ekym-mandatory' AND (image_url LIKE 'http%' OR image_url LIKE '%unsplash%');
      UPDATE popup_notices SET image_url = '/uploads/media/notice-festive.svg' WHERE notice_key = 'notice-festive-scheme' AND (image_url LIKE 'http%' OR image_url LIKE '%unsplash%');
    `);
  } catch (e) {}

  // Create interest_rates in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS interest_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category VARCHAR(20) NOT NULL,
      scheme_en VARCHAR(100) NOT NULL,
      scheme_np VARCHAR(100) NOT NULL,
      rate_percent REAL NOT NULL,
      basis_en VARCHAR(120) NOT NULL,
      basis_np VARCHAR(120) NOT NULL,
      min_balance REAL DEFAULT 0
    );
  `);
  const countRates = sdb.prepare('SELECT count(*) as count FROM interest_rates').get() as { count: number };
  if (!countRates || countRates.count === 0) {
    const seedRate = sdb.prepare(`
      INSERT INTO interest_rates (category, scheme_en, scheme_np, rate_percent, basis_en, basis_np, min_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of INITIAL_INTEREST_RATES) {
      seedRate.run(r.category, r.scheme_en, r.scheme_np, r.rate_percent, r.basis_en, r.basis_np, r.min_balance);
    }
  }

  // Create notices in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_en VARCHAR(200) NOT NULL,
      title_np VARCHAR(200) NOT NULL,
      category_en VARCHAR(50) DEFAULT 'General',
      publish_date VARCHAR(30) NOT NULL,
      content_en TEXT,
      content_np TEXT,
      date_en VARCHAR(50),
      is_active INTEGER DEFAULT 1
    );
  `);
  try { sdb.exec('ALTER TABLE notices ADD COLUMN category VARCHAR(50) DEFAULT "General";'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN category_en VARCHAR(50) DEFAULT "General";'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN publish_date VARCHAR(30) DEFAULT "2081-06-15";'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN content_en TEXT;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN content_np TEXT;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN date_en VARCHAR(50);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN is_active INTEGER DEFAULT 1;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE notices ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;'); } catch (e) {}

  try {
    const countNotices = sdb.prepare('SELECT count(*) as count FROM notices').get() as { count: number };
    if (!countNotices || countNotices.count === 0) {
      const seedNotice = sdb.prepare(`
        INSERT INTO notices (title_en, title_np, category_en, publish_date, content_en, content_np, date_en, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const n of INITIAL_NOTICES) {
        seedNotice.run(n.title_en, n.title_np, n.category_en, n.publish_date, n.content_en, n.content_np, n.date_en, n.is_active);
      }
    }
  } catch (e) {
    console.warn('[Database] Notice seed warning:', e);
  }

  // Create loan_applications in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS loan_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_code VARCHAR(40) UNIQUE NOT NULL,
      applicant_name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      member_code VARCHAR(50),
      citizenship_no VARCHAR(60),
      address VARCHAR(255),
      province VARCHAR(80),
      district VARCHAR(80),
      branch VARCHAR(100),
      occupation VARCHAR(100),
      collateral_type VARCHAR(100),
      loan_scheme VARCHAR(100) NOT NULL,
      interest_rate REAL DEFAULT 12.5,
      amount REAL NOT NULL,
      tenure_months INTEGER NOT NULL,
      monthly_income REAL DEFAULT 0,
      purpose TEXT,
      status VARCHAR(30) DEFAULT 'Under Review',
      remarks TEXT,
      details_json TEXT,
      created_at VARCHAR(50) DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN email VARCHAR(100);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN member_code VARCHAR(50);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN citizenship_no VARCHAR(60);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN address VARCHAR(255);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN province VARCHAR(80);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN district VARCHAR(80);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN branch VARCHAR(100);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN occupation VARCHAR(100);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN collateral_type VARCHAR(100);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN interest_rate REAL DEFAULT 12.5;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN monthly_income REAL DEFAULT 0;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN purpose TEXT;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN status VARCHAR(30) DEFAULT "Under Review";'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN remarks TEXT;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN details_json TEXT;'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN submitted_at VARCHAR(50);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN created_at VARCHAR(50);'); } catch (e) {}
  try { sdb.exec('ALTER TABLE loan_applications ADD COLUMN updated_at VARCHAR(50);'); } catch (e) {}

  try {
    const countLoans = sdb.prepare('SELECT count(*) as count FROM loan_applications').get() as { count: number };
    if (!countLoans || countLoans.count === 0) {
      const seedLoan = sdb.prepare(`
        INSERT INTO loan_applications (
          tracking_code, applicant_name, phone, email, member_code, citizenship_no,
          address, province, district, branch, occupation, collateral_type,
          loan_scheme, interest_rate, amount, tenure_months, monthly_income, purpose, status, remarks, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      seedLoan.run(
        'EKT-LN-2083-101', 'Bishnu Prasad Poudel', '9857033211', 'bishnu.poudel@gmail.com', 'EK-10241', '38-01-71-04512',
        'Tilottama-05, Manigram, Rupandehi', 'Lumbini Province', 'Rupandehi', 'Manigram Service Point',
        'Commercial Dairy Farming', 'Land & Building (Ghar-Jagga)',
        'Agricultural Productive Loan', 12.00, 1200000, 48, 85000,
        'Expansion of commercial dairy farm and purchase of 4 Holstein cows.', 'Under Review',
        'Field inspection scheduled by Credit Officer.', '2083-05-12 11:20:00'
      );
      seedLoan.run(
        'EKT-LN-2083-102', 'Saraswati Devi Gyawali', '9847055412', 'saraswati.gyawali@yahoo.com', 'EK-10389', '38-01-74-08921',
        'Butwal-04, Traffic Chowk, Rupandehi', 'Lumbini Province', 'Rupandehi', 'Butwal Main Branch',
        'Retail & Wholesale Trade', 'Land & Building (Ghar-Jagga)',
        'SME & Enterprise Expansion Loan', 13.50, 2500000, 60, 140000,
        'Working capital and inventory expansion for wholesale hardware store.', 'Approved',
        'Approved by Credit Committee; collateral valuation verified.', '2083-05-10 14:15:00'
      );
      seedLoan.run(
        'EKT-LN-2083-103', 'Kamal Bahadur KC', '9867022890', 'kamal.kc@outlook.com', 'EK-10512', '38-02-76-01143',
        'Sainamaina-03, Murgiya, Rupandehi', 'Lumbini Province', 'Rupandehi', 'Butwal Main Branch',
        'Salaried / Civil Service', 'Land & Building (Ghar-Jagga)',
        'Residential Housing & Land Loan', 13.00, 3500000, 120, 95000,
        'Construction of two-storey residential family house in Sainamaina.', 'Disbursed',
        'First installment disbursed to member account.', '2083-05-05 10:05:00'
      );
    }
  } catch (e) {
    console.warn('[Database] Loan seed warning:', e);
  }

  // Create member_applications in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS member_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_no VARCHAR(40) UNIQUE NOT NULL,
      full_name VARCHAR(120) NOT NULL,
      citizenship_no VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address VARCHAR(200) NOT NULL,
      saving_scheme VARCHAR(100) DEFAULT 'Regular Savings Account',
      initial_deposit REAL DEFAULT 1000,
      status VARCHAR(30) DEFAULT 'Pending Verification',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create contact_messages in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      subject VARCHAR(150),
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'Unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create digital_service_requests in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS digital_service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_id VARCHAR(50) UNIQUE NOT NULL,
      is_member INTEGER NOT NULL DEFAULT 0,
      full_name VARCHAR(150) NOT NULL,
      member_no VARCHAR(50),
      mobile_number VARCHAR(30) NOT NULL,
      email_address VARCHAR(150) NOT NULL,
      service_type VARCHAR(100) NOT NULL,
      account_no VARCHAR(50),
      additional_details TEXT,
      attachment_url VARCHAR(255),
      attachment_name VARCHAR(255),
      preferred_contact VARCHAR(50) DEFAULT 'Phone Call',
      status VARCHAR(30) DEFAULT 'Pending',
      admin_notes TEXT,
      resolved_at DATETIME,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed initial digital_service_requests if empty
  try {
    const row = sdb.prepare('SELECT count(*) as count FROM digital_service_requests').get() as any;
    if (row && row.count === 0) {
      const stmt = sdb.prepare(`
        INSERT INTO digital_service_requests (
          tracking_id, is_member, full_name, member_no, mobile_number, email_address,
          service_type, account_no, additional_details, preferred_contact, status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        'DSR-2026-10481', 1, 'Akash Pame', '10482', '9827157000', 'akashpame@gmail.com',
        'Missed Call Banking', '02-10482-01', 'Please activate missed call balance notification for my secondary number.', 'Phone Call', 'In Progress', '2026-10-25 10:30:00'
      );
      stmt.run(
        'DSR-2026-10482', 1, 'Sarita Sharma', '10512', '9847023456', 'sarita.sharma@yahoo.com',
        'Statement Request', '01-10512-00', 'Require 6-month certified financial statement for visa documentation.', 'Email', 'Pending', '2026-10-26 14:15:00'
      );
      stmt.run(
        'DSR-2026-10483', 0, 'Bikash Thapa', '', '9867088990', 'bikash.thapa@gmail.com',
        'QR / Digital Payment', '', 'Interested in establishing NepalPay QR Merchant stand at my grocery store in Butwal.', 'Phone Call', 'Pending', '2026-10-27 08:45:00'
      );
    }
  } catch (seedErr) {
    console.warn('[Database] Digital service request seed error:', seedErr);
  }

  // Create head_office_info in SQLite
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS head_office_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      office_name_en VARCHAR(255) NOT NULL,
      office_name_np VARCHAR(255) NOT NULL,
      address_en VARCHAR(255) NOT NULL,
      address_np VARCHAR(255) NOT NULL,
      province VARCHAR(100),
      district VARCHAR(100),
      city VARCHAR(120),
      ward VARCHAR(20),
      primary_phone VARCHAR(60),
      alt_phone VARCHAR(60),
      toll_free_phone VARCHAR(60),
      fax VARCHAR(60),
      official_email VARCHAR(120),
      support_email VARCHAR(120),
      working_days_en VARCHAR(150),
      working_days_np VARCHAR(150),
      working_hours_en VARCHAR(100),
      working_hours_np VARCHAR(100),
      counter_hours_en VARCHAR(100),
      counter_hours_np VARCHAR(100),
      regd_no VARCHAR(80),
      pan_no VARCHAR(80),
      postal_code VARCHAR(30),
      map_url TEXT,
      emergency_contact VARCHAR(60),
      departments_json TEXT,
      full_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    const countHo = sdb.prepare('SELECT count(*) as count FROM head_office_info').get() as { count: number };
    if (!countHo || countHo.count === 0) {
      const hoInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_head_office);
      sdb.prepare(`
        INSERT OR IGNORE INTO head_office_info (
          id, office_name_en, office_name_np, address_en, address_np,
          province, district, city, ward, primary_phone, alt_phone, toll_free_phone, fax,
          official_email, support_email, working_days_en, working_days_np,
          working_hours_en, working_hours_np, counter_hours_en, counter_hours_np,
          regd_no, pan_no, postal_code, map_url, emergency_contact, departments_json, full_json
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        hoInit.officeNameEn || '', hoInit.officeNameNp || '', hoInit.addressEn || '', hoInit.addressNp || '',
        hoInit.province || '', hoInit.district || '', hoInit.city || '', hoInit.ward || '',
        hoInit.primaryPhone || '', hoInit.altPhone || '', hoInit.tollFreePhone || '', hoInit.fax || '',
        hoInit.officialEmail || '', hoInit.supportEmail || '', hoInit.workingDaysEn || '', hoInit.workingDaysNp || '',
        hoInit.workingHoursEn || '', hoInit.workingHoursNp || '', hoInit.counterHoursEn || '', hoInit.counterHoursNp || '',
        hoInit.regdNo || '', hoInit.panNo || '', hoInit.postalCode || '', hoInit.mapUrl || '', hoInit.emergencyContact || '',
        JSON.stringify(hoInit.departmentsDirectory || []), INITIAL_SITE_SETTINGS.cms_head_office
      );
    }
  } catch (e) {}

  // 17. cms_leadership_members table (SQLite)
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS cms_leadership_members (
      id VARCHAR(64) PRIMARY KEY,
      category VARCHAR(32) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      name_np VARCHAR(255) NOT NULL,
      designation_en VARCHAR(255) NOT NULL,
      designation_np VARCHAR(255) NOT NULL,
      photo_url TEXT NOT NULL,
      short_message_en TEXT,
      short_message_np TEXT,
      full_message_en TEXT,
      full_message_np TEXT,
      phone VARCHAR(100),
      email VARCHAR(100),
      office_room_en VARCHAR(100),
      office_room_np VARCHAR(100),
      availability_en VARCHAR(150),
      availability_np VARCHAR(150),
      action_type VARCHAR(50) DEFAULT 'read_more',
      action_label_en VARCHAR(100),
      action_label_np VARCHAR(100),
      custom_action_url TEXT,
      sort_order INT DEFAULT 1,
      is_active INT DEFAULT 1,
      published_date VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    const countLead = sdb.prepare('SELECT count(*) as count FROM cms_leadership_members').get() as { count: number };
    if (!countLead || countLead.count === 0) {
      const leadInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_leadership_members);
      const insertStmt = sdb.prepare(`
        INSERT OR IGNORE INTO cms_leadership_members (
          id, category, name_en, name_np, designation_en, designation_np, photo_url,
          short_message_en, short_message_np, full_message_en, full_message_np,
          phone, email, office_room_en, office_room_np, availability_en, availability_np,
          action_type, action_label_en, action_label_np, custom_action_url,
          sort_order, is_active, published_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of leadInit) {
        insertStmt.run(
          m.id, m.category, m.nameEn, m.nameNp, m.designationEn, m.designationNp, m.photoUrl,
          m.shortMessageEn, m.shortMessageNp, m.fullMessageEn, m.fullMessageNp,
          m.phone, m.email, m.officeRoomEn, m.officeRoomNp, m.availabilityEn, m.availabilityNp,
          m.actionType, m.actionLabelEn, m.actionLabelNp, m.customActionUrl || '',
          m.sortOrder, m.isActive ? 1 : 0, m.publishedDate || ''
        );
      }
    }
  } catch (e) {}

  // 18. institutional_reports table (SQLite)
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS institutional_reports (
      id VARCHAR(64) PRIMARY KEY,
      fiscal_year VARCHAR(64) NOT NULL,
      month_np VARCHAR(64) NOT NULL,
      month_en VARCHAR(64),
      report_date_np VARCHAR(64) NOT NULL,
      report_date_en VARCHAR(64),
      total_members VARCHAR(64) NOT NULL,
      share_capital VARCHAR(100) NOT NULL,
      share_capital_growth VARCHAR(100),
      reserve_fund VARCHAR(100) NOT NULL,
      reserve_fund_growth VARCHAR(100),
      total_institutional_capital VARCHAR(100) NOT NULL,
      total_institutional_capital_note VARCHAR(100),
      other_funds VARCHAR(100) NOT NULL,
      total_savings VARCHAR(100) NOT NULL,
      total_savings_growth VARCHAR(100),
      loans_disbursed VARCHAR(100) NOT NULL,
      borrower_members_count VARCHAR(100),
      liquidity_amount VARCHAR(100) NOT NULL,
      liquidity_percent VARCHAR(64) NOT NULL,
      fixed_assets VARCHAR(100) NOT NULL,
      total_assets VARCHAR(100) NOT NULL,
      npa_percent VARCHAR(64),
      npl_percent VARCHAR(64),
      liq_percent_badge VARCHAR(64),
      is_published INT DEFAULT 1,
      is_latest INT DEFAULT 0,
      sort_order INT DEFAULT 1,
      remarks_en TEXT,
      remarks_np TEXT,
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    const countRep = sdb.prepare('SELECT count(*) as count FROM institutional_reports').get() as { count: number };
    if (!countRep || countRep.count === 0) {
      const repInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_monthly_financial_reports);
      const insertRepStmt = sdb.prepare(`
        INSERT OR IGNORE INTO institutional_reports (
          id, fiscal_year, month_np, month_en, report_date_np, report_date_en,
          total_members, share_capital, share_capital_growth, reserve_fund, reserve_fund_growth,
          total_institutional_capital, total_institutional_capital_note, other_funds,
          total_savings, total_savings_growth, loans_disbursed, borrower_members_count,
          liquidity_amount, liquidity_percent, fixed_assets, total_assets,
          npa_percent, npl_percent, liq_percent_badge, is_published, is_latest, sort_order,
          remarks_en, remarks_np, details_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of repInit) {
        insertRepStmt.run(
          r.id, r.fiscalYear, r.monthNp, r.monthEn || '', r.reportDateNp, r.reportDateEn || '',
          String(r.totalMembers), r.shareCapital, r.shareCapitalGrowth || '', r.reserveFund, r.reserveFundGrowth || '',
          r.totalInstitutionalCapital, r.totalInstitutionalCapitalNote || '', r.otherFunds,
          r.totalSavings, r.totalSavingsGrowth || '', r.loansDisbursed, r.borrowerMembersCount ? String(r.borrowerMembersCount) : '',
          r.liquidityAmount, r.liquidityPercent, r.fixedAssets, r.totalAssets,
          r.npaPercent || '', r.nplPercent || '', r.liqPercentBadge || '', r.isPublished !== false ? 1 : 0, r.isLatest ? 1 : 0, r.sortOrder || 1,
          r.remarksEn || '', r.remarksNp || '', JSON.stringify(r)
        );
      }
    }
  } catch (e) {}

  // 19. institutional_profiles table (SQLite)
  sdb.exec(`
    CREATE TABLE IF NOT EXISTS institutional_profiles (
      id VARCHAR(64) PRIMARY KEY,
      title_en VARCHAR(255) NOT NULL,
      title_np VARCHAR(255) NOT NULL,
      category_en VARCHAR(100) NOT NULL,
      category_np VARCHAR(100) NOT NULL,
      subtitle_en VARCHAR(255),
      subtitle_np VARCHAR(255),
      content_en TEXT NOT NULL,
      content_np TEXT NOT NULL,
      highlights_en TEXT,
      highlights_np TEXT,
      badge_en VARCHAR(100),
      badge_np VARCHAR(100),
      icon VARCHAR(50),
      image_url VARCHAR(255),
      is_published INT DEFAULT 1,
      sort_order INT DEFAULT 1,
      updated_at VARCHAR(64),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try {
    const countProf = sdb.prepare('SELECT count(*) as count FROM institutional_profiles').get() as { count: number };
    if (!countProf || countProf.count === 0) {
      const profInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_institutional_profiles);
      const insertProfStmt = sdb.prepare(`
        INSERT OR IGNORE INTO institutional_profiles (
          id, title_en, title_np, category_en, category_np, subtitle_en, subtitle_np,
          content_en, content_np, highlights_en, highlights_np, badge_en, badge_np,
          icon, image_url, is_published, sort_order, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of profInit) {
        insertProfStmt.run(
          p.id, p.titleEn, p.titleNp, p.categoryEn, p.categoryNp, p.subtitleEn || '', p.subtitleNp || '',
          p.contentEn, p.contentNp, JSON.stringify(p.highlightsEn || []), JSON.stringify(p.highlightsNp || []),
          p.badgeEn || '', p.badgeNp || '', p.icon || '🏛️', p.imageUrl || '',
          p.isPublished !== false ? 1 : 0, p.sortOrder || 1, p.updatedAt || ''
        );
      }
    }
  } catch (e) {}
}

// Helper to safely execute DDL/migration queries on MySQL without throwing
async function safeMysqlExec(pool: mysql.Pool, sql: string, params: any[] = []): Promise<void> {
  try {
    if (params.length > 0) {
      await pool.execute(sql, params);
    } else {
      await pool.query(sql);
    }
  } catch (e) {
    // Ignore duplicate column / already exists migration notices
  }
}

// Cached counts for synchronous getDbStatus() calls when running on MySQL
let cachedMysqlCounts = {
  ekymSubmissions: 0,
  popupNotices: 0,
  mediaFiles: 0,
};

async function refreshMysqlCounts(pool: mysql.Pool): Promise<void> {
  try {
    const [r1]: any = await pool.query('SELECT count(*) as count FROM ekym_submissions');
    cachedMysqlCounts.ekymSubmissions = Number(r1?.[0]?.count ?? 0);
  } catch (e) {}
  try {
    const [r2]: any = await pool.query('SELECT count(*) as count FROM popup_notices');
    cachedMysqlCounts.popupNotices = Number(r2?.[0]?.count ?? 0);
  } catch (e) {}
  try {
    const [r3]: any = await pool.query('SELECT count(*) as count FROM media_files');
    cachedMysqlCounts.mediaFiles = Number(r3?.[0]?.count ?? 0);
  } catch (e) {}
}

// Initialize MySQL tables and seeds safely without ever crashing or closing the pool
async function initMysqlTables(pool: mysql.Pool) {
  // 1. users table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role VARCHAR(30) DEFAULT 'staff',
      email VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 2. members table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_code VARCHAR(30) NOT NULL UNIQUE,
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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE members ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE members ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 3. transactions table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_code VARCHAR(30) NOT NULL,
      type VARCHAR(30) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      balance_after DECIMAL(12,2) NOT NULL,
      particulars VARCHAR(255) NOT NULL,
      trans_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_member (member_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE transactions ADD COLUMN trans_date DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE transactions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');

  // 4. ekym_submissions table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS ekym_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      application_no VARCHAR(40) UNIQUE NOT NULL,
      full_name_en VARCHAR(120) NOT NULL,
      full_name_np VARCHAR(120) NOT NULL,
      father_name VARCHAR(120) NOT NULL,
      grandfather_name VARCHAR(120) NOT NULL,
      mother_name VARCHAR(120),
      spouse_name VARCHAR(120),
      dob VARCHAR(30) NOT NULL,
      gender VARCHAR(20) NOT NULL,
      citizenship_no VARCHAR(50) NOT NULL,
      citizenship_district VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      permanent_address VARCHAR(200) NOT NULL,
      current_address VARCHAR(200) NOT NULL,
      perm_province VARCHAR(80),
      perm_district VARCHAR(80),
      temp_province VARCHAR(80),
      temp_district VARCHAR(80),
      occupation VARCHAR(100) NOT NULL,
      annual_income VARCHAR(50) NOT NULL,
      bank_name VARCHAR(100) NOT NULL,
      bank_account_no VARCHAR(50) NOT NULL,
      nominee_name VARCHAR(120) NOT NULL,
      nominee_relation VARCHAR(50) NOT NULL,
      nominee_citizenship VARCHAR(50),
      status VARCHAR(30) DEFAULT 'Pending',
      remarks TEXT,
      member_photo LONGTEXT,
      citizenship_front LONGTEXT,
      citizenship_back LONGTEXT,
      details_json LONGTEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN details_json LONGTEXT');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN member_photo LONGTEXT');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN citizenship_front LONGTEXT');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN citizenship_back LONGTEXT');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN perm_province VARCHAR(80)');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN perm_district VARCHAR(80)');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN temp_province VARCHAR(80)');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN temp_district VARCHAR(80)');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE ekym_submissions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 5. popup_notices table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS popup_notices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      notice_key VARCHAR(60) UNIQUE NOT NULL,
      active TINYINT(1) DEFAULT 1,
      title_en VARCHAR(255) NOT NULL,
      title_np VARCHAR(255) NOT NULL,
      category_en VARCHAR(100) NOT NULL,
      category_np VARCHAR(100) NOT NULL,
      image_url TEXT,
      content_en TEXT NOT NULL,
      content_np TEXT NOT NULL,
      bullet_points_en TEXT,
      bullet_points_np TEXT,
      date_en VARCHAR(50) NOT NULL,
      date_np VARCHAR(50) NOT NULL,
      notice_ref VARCHAR(100),
      action_text_en VARCHAR(100),
      action_text_np VARCHAR(100),
      action_link VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE popup_notices ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE popup_notices ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // Seed ekym_submissions if empty
  try {
    const [ekymRows]: any = await pool.query('SELECT count(*) as count FROM ekym_submissions');
    if (Number(ekymRows?.[0]?.count ?? 0) === 0) {
      for (const record of INITIAL_EKYM_SEEDS) {
        await safeMysqlExec(pool, `
          INSERT INTO ekym_submissions (
            application_no, full_name_en, full_name_np, father_name, grandfather_name,
            mother_name, spouse_name, dob, gender, citizenship_no, citizenship_district,
            phone, email, permanent_address, current_address, occupation, annual_income,
            bank_name, bank_account_no, nominee_name, nominee_relation, nominee_citizenship,
            status, remarks, submitted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, record);
      }
    }
  } catch (e) {
    console.warn('[Database] MySQL ekym seed warning:', e);
  }

  // Seed popup_notices if empty
  try {
    const [popupRows]: any = await pool.query('SELECT count(*) as count FROM popup_notices');
    if (Number(popupRows?.[0]?.count ?? 0) === 0) {
      for (const p of INITIAL_POPUP_NOTICES) {
        await safeMysqlExec(pool, `
          INSERT INTO popup_notices (
            notice_key, active, title_en, title_np, category_en, category_np,
            image_url, content_en, content_np, bullet_points_en, bullet_points_np,
            date_en, date_np, notice_ref, action_text_en, action_text_np, action_link
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.notice_key, p.active, p.title_en, p.title_np, p.category_en, p.category_np,
          p.image_url, p.content_en, p.content_np, p.bullet_points_en, p.bullet_points_np,
          p.date_en, p.date_np, p.notice_ref, p.action_text_en, p.action_text_np, p.action_link
        ]);
      }
    }
  } catch (e) {
    console.warn('[Database] MySQL popup_notices seed warning:', e);
  }

  // 6. media_files table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS media_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      media_key VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size INT NOT NULL DEFAULT 0,
      category VARCHAR(50) DEFAULT 'general',
      alt_text VARCHAR(255) DEFAULT '',
      is_system_default TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE media_files ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE media_files ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // Seed media_files in MySQL if empty
  try {
    const [mediaRows]: any = await pool.query('SELECT count(*) as count FROM media_files');
    if (Number(mediaRows?.[0]?.count ?? 0) === 0) {
      for (const m of INITIAL_MEDIA_FILES) {
        await safeMysqlExec(pool, `
          INSERT INTO media_files (
            media_key, title, filename, file_path, file_type, file_size, category, alt_text, is_system_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          m.media_key, m.title, m.filename, m.file_path, m.file_type, m.file_size, m.category, m.alt_text, m.is_system_default
        ]);
      }
    }
  } catch (e) {
    console.warn('[Database] MySQL media_files seed warning:', e);
  }

  // 7. interest_rates table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS interest_rates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(20) NOT NULL,
      scheme_en VARCHAR(100) NOT NULL,
      scheme_np VARCHAR(100) NOT NULL,
      rate_percent DECIMAL(5,2) NOT NULL,
      basis_en VARCHAR(120) NOT NULL,
      basis_np VARCHAR(120) NOT NULL,
      min_balance DECIMAL(12,2) DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE interest_rates ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE interest_rates ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  try {
    const [rateRows]: any = await pool.query('SELECT count(*) as count FROM interest_rates');
    if (Number(rateRows?.[0]?.count ?? 0) === 0) {
      for (const r of INITIAL_INTEREST_RATES) {
        await safeMysqlExec(pool, `
          INSERT INTO interest_rates (category, scheme_en, scheme_np, rate_percent, basis_en, basis_np, min_balance)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [r.category, r.scheme_en, r.scheme_np, r.rate_percent, r.basis_en, r.basis_np, r.min_balance]);
      }
    }
  } catch (e) {
    console.warn('[Database] MySQL interest_rates seed warning:', e);
  }

  // 8. notices table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS notices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title_en VARCHAR(200) NOT NULL,
      title_np VARCHAR(200) NOT NULL,
      category VARCHAR(50) DEFAULT 'General',
      category_en VARCHAR(50) DEFAULT 'General',
      publish_date VARCHAR(30) NOT NULL,
      content_en TEXT,
      content_np TEXT,
      date_en VARCHAR(50),
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, "ALTER TABLE notices ADD COLUMN category VARCHAR(50) DEFAULT 'General'");
  await safeMysqlExec(pool, "ALTER TABLE notices ADD COLUMN category_en VARCHAR(50) DEFAULT 'General'");
  await safeMysqlExec(pool, "ALTER TABLE notices ADD COLUMN publish_date VARCHAR(30) DEFAULT '2081-06-15'");
  await safeMysqlExec(pool, 'ALTER TABLE notices ADD COLUMN content_en TEXT');
  await safeMysqlExec(pool, 'ALTER TABLE notices ADD COLUMN content_np TEXT');
  await safeMysqlExec(pool, 'ALTER TABLE notices ADD COLUMN date_en VARCHAR(50)');
  await safeMysqlExec(pool, 'ALTER TABLE notices ADD COLUMN is_active TINYINT(1) DEFAULT 1');
  await safeMysqlExec(pool, 'ALTER TABLE notices ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE notices ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  try {
    const [noticeRows]: any = await pool.query('SELECT count(*) as count FROM notices');
    if (Number(noticeRows?.[0]?.count ?? 0) === 0) {
      for (const n of INITIAL_NOTICES) {
        await safeMysqlExec(pool, `
          INSERT INTO notices (title_en, title_np, category, category_en, publish_date, content_en, content_np, date_en, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [n.title_en, n.title_np, n.category_en, n.category_en, n.publish_date, n.content_en, n.content_np, n.date_en, n.is_active]);
      }
    }
  } catch (e) {
    console.warn('[Database] MySQL notices seed warning:', e);
  }

  // 9. loan_applications table (Ensure both submitted_at and created_at exist so all queries match!)
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS loan_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tracking_code VARCHAR(40) UNIQUE NOT NULL,
      applicant_name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      member_code VARCHAR(50),
      citizenship_no VARCHAR(60),
      address VARCHAR(255),
      province VARCHAR(80),
      district VARCHAR(80),
      branch VARCHAR(100),
      occupation VARCHAR(100),
      collateral_type VARCHAR(100),
      loan_scheme VARCHAR(100) NOT NULL,
      interest_rate DECIMAL(5,2) DEFAULT 12.50,
      amount DECIMAL(12,2) NOT NULL,
      tenure_months INT NOT NULL,
      monthly_income DECIMAL(12,2) DEFAULT 0.00,
      purpose TEXT,
      status VARCHAR(30) DEFAULT 'Under Review',
      remarks TEXT,
      details_json LONGTEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN email VARCHAR(100)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN member_code VARCHAR(50)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN citizenship_no VARCHAR(60)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN address VARCHAR(255)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN province VARCHAR(80)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN district VARCHAR(80)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN branch VARCHAR(100)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN occupation VARCHAR(100)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN collateral_type VARCHAR(100)');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN interest_rate DECIMAL(5,2) DEFAULT 12.50');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN monthly_income DECIMAL(12,2) DEFAULT 0.00');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN purpose TEXT');
  await safeMysqlExec(pool, "ALTER TABLE loan_applications ADD COLUMN status VARCHAR(30) DEFAULT 'Under Review'");
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN remarks TEXT');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN details_json LONGTEXT');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE loan_applications ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  try {
    const [loanRows]: any = await pool.query('SELECT count(*) as count FROM loan_applications');
    if (Number(loanRows?.[0]?.count ?? 0) === 0) {
      await safeMysqlExec(pool, `
        INSERT INTO loan_applications (
          tracking_code, applicant_name, phone, email, member_code, citizenship_no,
          address, province, district, branch, occupation, collateral_type,
          loan_scheme, interest_rate, amount, tenure_months, monthly_income, purpose, status, remarks, submitted_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'EKT-LN-2083-101', 'Bishnu Prasad Poudel', '9857033211', 'bishnu.poudel@gmail.com', 'EK-10241', '38-01-71-04512',
        'Tilottama-05, Manigram, Rupandehi', 'Lumbini Province', 'Rupandehi', 'Manigram Service Point',
        'Commercial Dairy Farming', 'Land & Building (Ghar-Jagga)',
        'Agricultural Productive Loan', 12.00, 1200000, 48, 85000,
        'Expansion of commercial dairy farm and purchase of 4 Holstein cows.', 'Under Review',
        'Field inspection scheduled by Credit Officer.', '2026-08-28 11:20:00', '2026-08-28 11:20:00'
      ]);
    }
  } catch (e) {
    console.warn('[Database] MySQL loan_applications seed warning:', e);
  }

  // 10. member_applications table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS member_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      application_no VARCHAR(40) UNIQUE NOT NULL,
      full_name VARCHAR(120) NOT NULL,
      citizenship_no VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address VARCHAR(200) NOT NULL,
      saving_scheme VARCHAR(100) DEFAULT 'Regular Savings Account',
      initial_deposit DECIMAL(12,2) DEFAULT 1000.00,
      status VARCHAR(30) DEFAULT 'Pending Verification',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE member_applications ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE member_applications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE member_applications ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 11. contact_messages table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      subject VARCHAR(150),
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'Unread',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE contact_messages ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE contact_messages ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE contact_messages ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 11b. digital_service_requests table in MySQL
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS digital_service_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tracking_id VARCHAR(50) UNIQUE NOT NULL,
      is_member TINYINT(1) NOT NULL DEFAULT 0,
      full_name VARCHAR(150) NOT NULL,
      member_no VARCHAR(50),
      mobile_number VARCHAR(30) NOT NULL,
      email_address VARCHAR(150) NOT NULL,
      service_type VARCHAR(100) NOT NULL,
      account_no VARCHAR(50),
      additional_details TEXT,
      attachment_url VARCHAR(255),
      attachment_name VARCHAR(255),
      preferred_contact VARCHAR(50) DEFAULT 'Phone Call',
      status VARCHAR(30) DEFAULT 'Pending',
      admin_notes TEXT,
      resolved_at DATETIME,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    const [existingReqRows]: any = await pool.query('SELECT count(*) as count FROM digital_service_requests');
    if (existingReqRows && existingReqRows[0]?.count === 0) {
      await safeMysqlExec(pool, `
        INSERT IGNORE INTO digital_service_requests (
          tracking_id, is_member, full_name, member_no, mobile_number, email_address,
          service_type, account_no, additional_details, preferred_contact, status, submitted_at
        ) VALUES
        ('DSR-2026-10481', 1, 'Akash Pame', '10482', '9827157000', 'akashpame@gmail.com', 'Missed Call Banking', '02-10482-01', 'Please activate missed call balance notification for my secondary number.', 'Phone Call', 'In Progress', '2026-10-25 10:30:00'),
        ('DSR-2026-10482', 1, 'Sarita Sharma', '10512', '9847023456', 'sarita.sharma@yahoo.com', 'Statement Request', '01-10512-00', 'Require 6-month certified financial statement for visa documentation.', 'Email', 'Pending', '2026-10-26 14:15:00'),
        ('DSR-2026-10483', 0, 'Bikash Thapa', '', '9867088990', 'bikash.thapa@gmail.com', 'QR / Digital Payment', '', 'Interested in establishing NepalPay QR Merchant stand at my grocery store in Butwal.', 'Phone Call', 'Pending', '2026-10-27 08:45:00')
      `);
    }
  } catch (mSeedErr) {
    console.warn('[Database] MySQL digital service requests seed warning:', mSeedErr);
  }

  // 12. site_settings table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT AUTO_INCREMENT UNIQUE,
      setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
      setting_value LONGTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE site_settings MODIFY COLUMN setting_value LONGTEXT');
  await safeMysqlExec(pool, 'ALTER TABLE site_settings ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE site_settings ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  for (const [k, v] of Object.entries(INITIAL_SITE_SETTINGS)) {
    await safeMysqlExec(pool, `
      INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)
    `, [k, v]);
  }

  // Synchronize active logo & CMS settings between SQLite and MySQL on startup so Admin changes never revert
  try {
    const sdb = getSqliteDb();
    const logoKeys = ['coopLogoUrl', 'coop_logo_url', 'logo_url', 'logo_filename', 'logo_updated_at', 'logo_data_uri', 'logo_data_uri_path', 'cms_suggestions', 'cms_head_office'];
    const [mysqlSettingRows]: any = await pool.query(
      `SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (${logoKeys.map(() => '?').join(',')})`,
      logoKeys
    );
    const mysqlMap: Record<string, string> = {};
    if (Array.isArray(mysqlSettingRows)) {
      for (const r of mysqlSettingRows) {
        mysqlMap[r.setting_key] = r.setting_value;
      }
    }
    const sqliteRows = sdb.prepare(
      `SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (${logoKeys.map(() => '?').join(',')})`
    ).all(...logoKeys) as { setting_key: string; setting_value: string }[];
    const sqliteMap: Record<string, string> = {};
    for (const r of sqliteRows) {
      sqliteMap[r.setting_key] = r.setting_value;
    }

    const sqliteLogo = sqliteMap.coopLogoUrl || sqliteMap.coop_logo_url || sqliteMap.logo_url || '';
    const mysqlLogo = mysqlMap.coopLogoUrl || mysqlMap.coop_logo_url || mysqlMap.logo_url || '';
    const sqliteUpdated = sqliteMap.logo_updated_at || '';
    const mysqlUpdated = mysqlMap.logo_updated_at || '';

    if (sqliteLogo && (!mysqlLogo || mysqlLogo === '/uploads/logos/ekata-logo-default.svg' || sqliteUpdated > mysqlUpdated)) {
      for (const k of ['coopLogoUrl', 'coop_logo_url', 'logo_url', 'logo_filename', 'logo_updated_at', 'logo_data_uri', 'logo_data_uri_path']) {
        if (sqliteMap[k]) {
          await safeMysqlExec(pool, `
            INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
          `, [k, sqliteMap[k]]);
        }
      }
    }
  } catch (e) {}

  // 13. frontend_slides table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS frontend_slides (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE frontend_slides ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE frontend_slides ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 14. gallery_items table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS gallery_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title_en VARCHAR(200) NOT NULL,
      title_np VARCHAR(200) NOT NULL,
      category VARCHAR(80) NOT NULL,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE gallery_items ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE gallery_items ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 15. services_cms table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS services_cms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(60) NOT NULL UNIQUE,
      title_en VARCHAR(150) NOT NULL,
      title_np VARCHAR(150) NOT NULL,
      description_en TEXT NOT NULL,
      description_np TEXT NOT NULL,
      icon VARCHAR(30) NOT NULL,
      category VARCHAR(50) NOT NULL,
      badge VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await safeMysqlExec(pool, 'ALTER TABLE services_cms ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  await safeMysqlExec(pool, 'ALTER TABLE services_cms ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  // 16. head_office_info table
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS head_office_info (
      id INT PRIMARY KEY DEFAULT 1,
      office_name_en VARCHAR(255) NOT NULL,
      office_name_np VARCHAR(255) NOT NULL,
      address_en VARCHAR(255) NOT NULL,
      address_np VARCHAR(255) NOT NULL,
      province VARCHAR(100),
      district VARCHAR(100),
      city VARCHAR(120),
      ward VARCHAR(20),
      primary_phone VARCHAR(60),
      alt_phone VARCHAR(60),
      toll_free_phone VARCHAR(60),
      fax VARCHAR(60),
      official_email VARCHAR(120),
      support_email VARCHAR(120),
      working_days_en VARCHAR(150),
      working_days_np VARCHAR(150),
      working_hours_en VARCHAR(100),
      working_hours_np VARCHAR(100),
      counter_hours_en VARCHAR(100),
      counter_hours_np VARCHAR(100),
      regd_no VARCHAR(80),
      pan_no VARCHAR(80),
      postal_code VARCHAR(30),
      map_url TEXT,
      emergency_contact VARCHAR(60),
      departments_json LONGTEXT,
      full_json LONGTEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  try {
    const [hoRows]: any = await pool.query('SELECT count(*) as count FROM head_office_info');
    if (Number(hoRows?.[0]?.count ?? 0) === 0) {
      const hoInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_head_office);
      await safeMysqlExec(pool, `
        INSERT IGNORE INTO head_office_info (
          id, office_name_en, office_name_np, address_en, address_np,
          province, district, city, ward, primary_phone, alt_phone, toll_free_phone, fax,
          official_email, support_email, working_days_en, working_days_np,
          working_hours_en, working_hours_np, counter_hours_en, counter_hours_np,
          regd_no, pan_no, postal_code, map_url, emergency_contact, departments_json, full_json
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        hoInit.officeNameEn || '', hoInit.officeNameNp || '', hoInit.addressEn || '', hoInit.addressNp || '',
        hoInit.province || '', hoInit.district || '', hoInit.city || '', hoInit.ward || '',
        hoInit.primaryPhone || '', hoInit.altPhone || '', hoInit.tollFreePhone || '', hoInit.fax || '',
        hoInit.officialEmail || '', hoInit.supportEmail || '', hoInit.workingDaysEn || '', hoInit.workingDaysNp || '',
        hoInit.workingHoursEn || '', hoInit.workingHoursNp || '', hoInit.counterHoursEn || '', hoInit.counterHoursNp || '',
        hoInit.regdNo || '', hoInit.panNo || '', hoInit.postalCode || '', hoInit.mapUrl || '', hoInit.emergencyContact || '',
        JSON.stringify(hoInit.departmentsDirectory || []), INITIAL_SITE_SETTINGS.cms_head_office
      ]);
    }
  } catch (e) {}

  // 17. cms_leadership_members table (MySQL / XAMPP)
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS cms_leadership_members (
      id VARCHAR(64) PRIMARY KEY,
      category VARCHAR(32) NOT NULL,
      name_en VARCHAR(255) NOT NULL,
      name_np VARCHAR(255) NOT NULL,
      designation_en VARCHAR(255) NOT NULL,
      designation_np VARCHAR(255) NOT NULL,
      photo_url TEXT NOT NULL,
      short_message_en TEXT,
      short_message_np TEXT,
      full_message_en LONGTEXT,
      full_message_np LONGTEXT,
      phone VARCHAR(100),
      email VARCHAR(100),
      office_room_en VARCHAR(100),
      office_room_np VARCHAR(100),
      availability_en VARCHAR(150),
      availability_np VARCHAR(150),
      action_type VARCHAR(50) DEFAULT 'read_more',
      action_label_en VARCHAR(100),
      action_label_np VARCHAR(100),
      custom_action_url TEXT,
      sort_order INT DEFAULT 1,
      is_active INT DEFAULT 1,
      published_date VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  try {
    const [leadRows]: any = await pool.query('SELECT count(*) as count FROM cms_leadership_members');
    if (Number(leadRows?.[0]?.count ?? 0) === 0) {
      const leadInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_leadership_members);
      for (const m of leadInit) {
        await safeMysqlExec(pool, `
          INSERT IGNORE INTO cms_leadership_members (
            id, category, name_en, name_np, designation_en, designation_np, photo_url,
            short_message_en, short_message_np, full_message_en, full_message_np,
            phone, email, office_room_en, office_room_np, availability_en, availability_np,
            action_type, action_label_en, action_label_np, custom_action_url,
            sort_order, is_active, published_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          m.id, m.category, m.nameEn, m.nameNp, m.designationEn, m.designationNp, m.photoUrl,
          m.shortMessageEn, m.shortMessageNp, m.fullMessageEn, m.fullMessageNp,
          m.phone, m.email, m.officeRoomEn, m.officeRoomNp, m.availabilityEn, m.availabilityNp,
          m.actionType, m.actionLabelEn, m.actionLabelNp, m.customActionUrl || '',
          m.sortOrder, m.isActive ? 1 : 0, m.publishedDate || ''
        ]);
      }
    }
  } catch (e) {}

  // 18. institutional_reports table (MySQL / XAMPP)
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS institutional_reports (
      id VARCHAR(64) PRIMARY KEY,
      fiscal_year VARCHAR(64) NOT NULL,
      month_np VARCHAR(64) NOT NULL,
      month_en VARCHAR(64),
      report_date_np VARCHAR(64) NOT NULL,
      report_date_en VARCHAR(64),
      total_members VARCHAR(64) NOT NULL,
      share_capital VARCHAR(100) NOT NULL,
      share_capital_growth VARCHAR(100),
      reserve_fund VARCHAR(100) NOT NULL,
      reserve_fund_growth VARCHAR(100),
      total_institutional_capital VARCHAR(100) NOT NULL,
      total_institutional_capital_note VARCHAR(100),
      other_funds VARCHAR(100) NOT NULL,
      total_savings VARCHAR(100) NOT NULL,
      total_savings_growth VARCHAR(100),
      loans_disbursed VARCHAR(100) NOT NULL,
      borrower_members_count VARCHAR(100),
      liquidity_amount VARCHAR(100) NOT NULL,
      liquidity_percent VARCHAR(64) NOT NULL,
      fixed_assets VARCHAR(100) NOT NULL,
      total_assets VARCHAR(100) NOT NULL,
      npa_percent VARCHAR(64),
      npl_percent VARCHAR(64),
      liq_percent_badge VARCHAR(64),
      is_published INT DEFAULT 1,
      is_latest INT DEFAULT 0,
      sort_order INT DEFAULT 1,
      remarks_en TEXT,
      remarks_np TEXT,
      details_json LONGTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  try {
    const [repRows]: any = await pool.query('SELECT count(*) as count FROM institutional_reports');
    if (Number(repRows?.[0]?.count ?? 0) === 0) {
      const repInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_monthly_financial_reports);
      for (const r of repInit) {
        await safeMysqlExec(pool, `
          INSERT IGNORE INTO institutional_reports (
            id, fiscal_year, month_np, month_en, report_date_np, report_date_en,
            total_members, share_capital, share_capital_growth, reserve_fund, reserve_fund_growth,
            total_institutional_capital, total_institutional_capital_note, other_funds,
            total_savings, total_savings_growth, loans_disbursed, borrower_members_count,
            liquidity_amount, liquidity_percent, fixed_assets, total_assets,
            npa_percent, npl_percent, liq_percent_badge, is_published, is_latest, sort_order,
            remarks_en, remarks_np, details_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          r.id, r.fiscalYear, r.monthNp, r.monthEn || '', r.reportDateNp, r.reportDateEn || '',
          String(r.totalMembers), r.shareCapital, r.shareCapitalGrowth || '', r.reserveFund, r.reserveFundGrowth || '',
          r.totalInstitutionalCapital, r.totalInstitutionalCapitalNote || '', r.otherFunds,
          r.totalSavings, r.totalSavingsGrowth || '', r.loansDisbursed, r.borrowerMembersCount ? String(r.borrowerMembersCount) : '',
          r.liquidityAmount, r.liquidityPercent, r.fixedAssets, r.totalAssets,
          r.npaPercent || '', r.nplPercent || '', r.liqPercentBadge || '', r.isPublished !== false ? 1 : 0, r.isLatest ? 1 : 0, r.sortOrder || 1,
          r.remarksEn || '', r.remarksNp || '', JSON.stringify(r)
        ]);
      }
    }
  } catch (e) {}

  // 19. institutional_profiles table (MySQL / XAMPP)
  await safeMysqlExec(pool, `
    CREATE TABLE IF NOT EXISTS institutional_profiles (
      id VARCHAR(64) PRIMARY KEY,
      title_en VARCHAR(255) NOT NULL,
      title_np VARCHAR(255) NOT NULL,
      category_en VARCHAR(100) NOT NULL,
      category_np VARCHAR(100) NOT NULL,
      subtitle_en VARCHAR(255),
      subtitle_np VARCHAR(255),
      content_en LONGTEXT NOT NULL,
      content_np LONGTEXT NOT NULL,
      highlights_en LONGTEXT,
      highlights_np LONGTEXT,
      badge_en VARCHAR(100),
      badge_np VARCHAR(100),
      icon VARCHAR(50),
      image_url VARCHAR(255),
      is_published INT DEFAULT 1,
      sort_order INT DEFAULT 1,
      updated_at VARCHAR(64),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at_dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  try {
    const [profRows]: any = await pool.query('SELECT count(*) as count FROM institutional_profiles');
    if (Number(profRows?.[0]?.count ?? 0) === 0) {
      const profInit = JSON.parse(INITIAL_SITE_SETTINGS.cms_institutional_profiles);
      for (const p of profInit) {
        await safeMysqlExec(pool, `
          INSERT IGNORE INTO institutional_profiles (
            id, title_en, title_np, category_en, category_np, subtitle_en, subtitle_np,
            content_en, content_np, highlights_en, highlights_np, badge_en, badge_np,
            icon, image_url, is_published, sort_order, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p.id, p.titleEn, p.titleNp, p.categoryEn, p.categoryNp, p.subtitleEn || '', p.subtitleNp || '',
          p.contentEn, p.contentNp, JSON.stringify(p.highlightsEn || []), JSON.stringify(p.highlightsNp || []),
          p.badgeEn || '', p.badgeNp || '', p.icon || '🏛️', p.imageUrl || '',
          p.isPublished !== false ? 1 : 0, p.sortOrder || 1, p.updatedAt || ''
        ]);
      }
    }
  } catch (e) {}

  await refreshMysqlCounts(pool);
}

let mysqlLastAttemptTime = 0;
let mysqlInitPromise: Promise<mysql.Pool | null> | null = null;
let mysqlSchemaInitialized = false;
let legacySettingsSynced = false;

function isPoolFatalError(err: any): boolean {
  const msg = String(err?.message || '');
  const code = String(err?.code || '');
  return (
    msg.includes('Pool is closed') ||
    msg.includes('Cannot enqueue') ||
    msg.includes('Connection lost') ||
    msg.includes('closed state') ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
    code === 'PROTOCOL_PACKETS_OUT_OF_ORDER' ||
    code === 'ER_SERVER_SHUTDOWN' ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    code === 'ETIMEDOUT'
  );
}

function resetMysqlPool(): void {
  const oldPool = mysqlPool;
  mysqlPool = null;
  if (oldPool) {
    oldPool.end().catch(() => {});
  }
}

function isHostUnreachableError(err: any): boolean {
  const code = String(err?.code || '');
  return (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'EHOSTUNREACH' ||
    code === 'ENETUNREACH'
  );
}

export async function ensureMysqlPool(forceRetry = false): Promise<mysql.Pool | null> {
  if (mysqlPool) return mysqlPool;

  if (!forceRetry && REQUESTED_DRIVER === 'sqlite') {
    return null;
  }

  // Avoid stalling regular user requests with repeated TCP connection timeouts when MySQL is offline.
  // Retry passively every 15 seconds, or immediately when forceRetry is true.
  const now = Date.now();
  if (!forceRetry && mysqlLastAttemptTime > 0 && now - mysqlLastAttemptTime < 15000) {
    return null;
  }

  if (mysqlInitPromise) {
    return mysqlInitPromise;
  }

  mysqlLastAttemptTime = now;
  mysqlInitPromise = (async () => {
    let testPool: mysql.Pool | null = null;
    try {
      // First ensure the database itself exists in XAMPP MySQL
      try {
        const bootstrapConn = await mysql.createConnection({
          host: MYSQL_HOST,
          port: MYSQL_PORT,
          user: MYSQL_USER,
          password: MYSQL_PASSWORD,
          connectTimeout: 2500,
        });
        await bootstrapConn.query(
          `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        await bootstrapConn.end();
      } catch (bootstrapErr: any) {
        // If the MySQL server itself is unreachable (e.g. ECONNREFUSED/ETIMEDOUT), fail fast without a second timeout
        if (isHostUnreachableError(bootstrapErr)) {
          throw bootstrapErr;
        }
      }

      testPool = mysql.createPool({
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        charset: 'utf8mb4',
        connectTimeout: 5000,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
         queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      // Prevent unhandled socket error events on idle pooled connections from crashing Node
      (testPool as any).on?.('connection', (connection: any) => {
        connection.on?.('error', (connErr: any) => {
          if (isPoolFatalError(connErr)) {
            console.warn('[Database] MySQL pooled connection socket warning:', connErr?.code || connErr?.message);
          }
        });
      });

      const conn = await testPool.getConnection();
      await conn.ping();
      conn.release();

      // Connection is verified; initialize tables and migrations once before publishing pool
      if (!mysqlSchemaInitialized) {
        try {
          await initMysqlTables(testPool);
          mysqlSchemaInitialized = true;
        } catch (initErr: any) {
          console.warn('[Database] MySQL schema migration warning (connection remains active):', initErr?.message || initErr);
        }
      } else {
        await refreshMysqlCounts(testPool).catch(() => {});
      }

      mysqlPool = testPool;
      activeDriver = 'mysql';
      mysqlConnectionError = null;
      return mysqlPool;
    } catch (err: any) {
      if (testPool) {
        mysqlPool = null;
        await testPool.end().catch(() => {});
      }
      mysqlConnectionError = err?.message || 'MySQL connection failed';
      return null;
    } finally {
      mysqlInitPromise = null;
    }
  })();

  return mysqlInitPromise;
}

// Main initialize function
export async function initDatabase(): Promise<{ driver: 'mysql' | 'sqlite'; message: string }> {
  // Initialize SQLite tables so local storage is always ready if needed
  try {
    const sdb = getSqliteDb();
    initSqliteTables(sdb);
  } catch (sqliteErr: any) {
    console.error('[Database] SQLite table initialization error:', sqliteErr);
  }

  // Attempt MySQL connection
  console.log(`[Database] Attempting MySQL connection to ${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}...`);
  const pool = await ensureMysqlPool(true);
  if (pool) {
    console.log(`[Database] Successfully connected to MySQL database: ${MYSQL_DATABASE} on ${MYSQL_HOST}:${MYSQL_PORT}`);
    return {
      driver: 'mysql',
      message: `Connected successfully to MySQL (${MYSQL_DATABASE} on ${MYSQL_HOST}:${MYSQL_PORT}).`,
    };
  } else {
    activeDriver = 'sqlite';
    console.warn(`[Database] MySQL is not reachable on ${MYSQL_HOST}:${MYSQL_PORT} (${mysqlConnectionError}).`);
    return {
      driver: 'sqlite',
      message: `MySQL not available (${mysqlConnectionError}).`,
    };
  }
}

export function getActiveDriver(): 'mysql' | 'sqlite' {
  return activeDriver;
}

export async function getDbStatusAsync(forceReconnect = false): Promise<DbStatus> {
  const pool = await ensureMysqlPool(forceReconnect);
  if (pool) {
    await refreshMysqlCounts(pool);
  }
  return getDbStatus();
}

export function getDbStatus(): DbStatus {
  const isConnected = activeDriver === 'mysql' && mysqlPool !== null;
  let ekymCount = 0;
  let popupCount = 0;
  let mediaCount = 0;

  if (isConnected) {
    ekymCount = cachedMysqlCounts.ekymSubmissions;
    popupCount = cachedMysqlCounts.popupNotices;
    mediaCount = cachedMysqlCounts.mediaFiles;
  } else {
    const sdb = getSqliteDb();
    try {
      const r1 = sdb.prepare('SELECT count(*) as count FROM ekym_submissions').get() as { count: number };
      ekymCount = r1 ? r1.count : 0;
    } catch (e) {}

    try {
      const r2 = sdb.prepare('SELECT count(*) as count FROM popup_notices').get() as { count: number };
      popupCount = r2 ? r2.count : 0;
    } catch (e) {}

    try {
      const r3 = sdb.prepare('SELECT count(*) as count FROM media_files').get() as { count: number };
      mediaCount = r3 ? r3.count : 0;
    } catch (e) {}
  }

  return {
    driver: activeDriver,
    configuredDriver: REQUESTED_DRIVER,
    mysql: {
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      database: MYSQL_DATABASE,
      connected: isConnected,
      error: isConnected ? undefined : (mysqlConnectionError || 'Not connected'),
    },
    sqlite: {
      path: sqlitePath,
      exists: fs.existsSync(sqlitePath),
    },
    counts: {
      ekymSubmissions: ekymCount,
      popupNotices: popupCount,
      mediaFiles: mediaCount,
    },
    timestamp: new Date().toISOString(),
  };
}

// Unified query wrapper that executes on MySQL (with auto-recovery if pool was closed/dropped) or SQLite
export async function queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  let pool = await ensureMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(sql, params);
      return rows as T[];
    } catch (err: any) {
      if (isPoolFatalError(err)) {
        resetMysqlPool();
        pool = await ensureMysqlPool(true);
        if (pool) {
          const [rows]: any = await pool.query(sql, params);
          return rows as T[];
        }
      } else {
        throw err;
      }
    }
  }
  const sdb = getSqliteDb();
  const stmt = sdb.prepare(sql);
  return stmt.all(...params) as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  let pool = await ensureMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(sql, params);
      return (rows[0] as T) || null;
    } catch (err: any) {
      if (isPoolFatalError(err)) {
        resetMysqlPool();
        pool = await ensureMysqlPool(true);
        if (pool) {
          const [rows]: any = await pool.query(sql, params);
          return (rows[0] as T) || null;
        }
      } else {
        throw err;
      }
    }
  }
  const sdb = getSqliteDb();
  const stmt = sdb.prepare(sql);
  return (stmt.get(...params) as T) || null;
}

export async function execute(sql: string, params: any[] = []): Promise<{ insertId?: number; affectedRows: number }> {
  let pool = await ensureMysqlPool();
  if (pool) {
    try {
      const [result]: any = await pool.execute(sql, params);
      return {
        insertId: Number(result.insertId),
        affectedRows: Number(result.affectedRows)
      };
    } catch (err: any) {
      if (isPoolFatalError(err)) {
        resetMysqlPool();
        pool = await ensureMysqlPool(true);
        if (pool) {
          const [result]: any = await pool.execute(sql, params);
          return {
            insertId: Number(result.insertId),
            affectedRows: Number(result.affectedRows)
          };
        }
      } else {
        throw err;
      }
    }
  }
  const sdb = getSqliteDb();
  const stmt = sdb.prepare(sql);
  const result = stmt.run(...params);
  return {
    insertId: Number(result.lastInsertRowid),
    affectedRows: Number(result.changes)
  };
}

export async function setSiteSetting(key: string, value: string): Promise<void> {
  let pool = await ensureMysqlPool();
  if (pool) {
    const upsertSql = `
      INSERT INTO site_settings (setting_key, setting_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
    `;
    try {
      await pool.execute(upsertSql, [key, value]);
    } catch (err: any) {
      if (isPoolFatalError(err)) {
        resetMysqlPool();
        pool = await ensureMysqlPool(true);
        if (pool) {
          await pool.execute(upsertSql, [key, value]);
        }
      } else {
        throw err;
      }
    }
    // Also mirror setting to SQLite so both stay synchronized
    try {
      const sdb = getSqliteDb();
      const stmt = sdb.prepare(`
        INSERT INTO site_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(key, value);
    } catch (e) {}
    return;
  }

  const sdb = getSqliteDb();
  const stmt = sdb.prepare(`
    INSERT INTO site_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(key, value);
}

export async function getSiteSettingsMap(): Promise<Record<string, string>> {
  const rows = await queryAll<{ setting_key: string; setting_value: string }>('SELECT setting_key, setting_value FROM site_settings');
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.setting_key] = r.setting_value;
  }

  // Ensure any newly added settings are populated in database if undefined
  for (const [k, v] of Object.entries(INITIAL_SITE_SETTINGS)) {
    if (map[k] === undefined) {
      map[k] = v;
      if (!legacySettingsSynced) {
        setSiteSetting(k, v).catch(() => {});
      }
    }
  }

  // Run one-time legacy theme & project name synchronization on first access
  if (!legacySettingsSynced) {
    legacySettingsSynced = true;

    // Upgrade legacy green/emerald brand theme to the official logo blue/cyan theme
    if (map.cms_brand_theme && (map.cms_brand_theme.includes('#087a45') || map.cms_brand_theme.includes('"emerald"'))) {
      map.cms_brand_theme = INITIAL_SITE_SETTINGS.cms_brand_theme;
      setSiteSetting('cms_brand_theme', INITIAL_SITE_SETTINGS.cms_brand_theme).catch(() => {});
    }

    // Upgrade any legacy project name occurrences in site_settings to Ankur / अंकुर
    const oldEnTitle = ['E', 'kata'].join('');
    const oldEnUpper = ['E', 'KATA'].join('');
    const oldNpName = '\u090f\u0915\u0924\u093e';
    const oldNpSpaced = '\u090f \u0915 \u0924\u093e';
    for (const [k, v] of Object.entries(map)) {
      if (
        k === 'coop_logo_url' ||
        k === 'coopLogoUrl' ||
        k === 'logo_url' ||
        k === 'logo_filename' ||
        k === 'logo_data_uri' ||
        k === 'logo_data_uri_path'
      ) {
        continue;
      }
      if (typeof v === 'string' && (v.includes(oldEnTitle) || v.includes(oldEnUpper) || v.includes(oldNpName) || v.includes(oldNpSpaced))) {
        const updatedVal = v
          .split(oldEnTitle).join('Ankur')
          .split(oldEnUpper).join('ANKUR')
          .split(oldNpName).join('अंकुर')
          .split(oldNpSpaced).join('अं कु र');
        map[k] = updatedVal;
        setSiteSetting(k, updatedVal).catch(() => {});
      }
    }
  }

  // Normalize logo path so that frontend always receives the exact Admin-selected logo from MySQL/SQLite
  let logo = (map.coopLogoUrl || map.coop_logo_url || map.logo_url || '').trim();

  // If logo is a local /uploads/logos/ path, ensure it is backed up in MySQL (logo_data_uri) or restored to disk if missing
  if (logo.startsWith('/uploads/logos/')) {
    const filePart = logo.replace('/uploads/logos/', '').split('?')[0];
    const logosDir = path.resolve(process.cwd(), 'public', 'uploads', 'logos');
    if (!fs.existsSync(logosDir)) {
      try { fs.mkdirSync(logosDir, { recursive: true }); } catch (e) {}
    }
    const diskPath = path.resolve(logosDir, filePart);

    if (fs.existsSync(diskPath)) {
      // Back up binary logo to MySQL site_settings (logo_data_uri) if not already backed up for this path
      if (!map.logo_data_uri || map.logo_data_uri_path !== logo) {
        try {
          const buf = fs.readFileSync(diskPath);
          const ext = path.extname(filePart).toLowerCase().replace('.', '');
          const mime =
            ext === 'svg' ? 'image/svg+xml' :
            ext === 'png' ? 'image/png' :
            ext === 'webp' ? 'image/webp' :
            ext === 'gif' ? 'image/gif' :
            ext === 'ico' ? 'image/x-icon' : 'image/jpeg';
          const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
          map.logo_data_uri = dataUri;
          map.logo_data_uri_path = logo;
          setSiteSetting('logo_data_uri', dataUri).catch(() => {});
          setSiteSetting('logo_data_uri_path', logo).catch(() => {});
        } catch (e) {}
      }
    } else if (map.logo_data_uri && map.logo_data_uri.startsWith('data:image/')) {
      // Restore missing file on disk directly from MySQL storage so server restarts never lose the Admin logo
      try {
        const matches = map.logo_data_uri.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (matches) {
          const buf = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(diskPath, buf);
        }
      } catch (e) {
        logo = map.logo_data_uri;
      }
    }
  } else if (!logo && map.logo_data_uri && map.logo_data_uri.startsWith('data:image/')) {
    logo = map.logo_data_uri_path || map.logo_data_uri;
  }

  if (logo && !logo.startsWith('/') && !logo.startsWith('http') && !logo.startsWith('data:')) {
    logo = '/' + logo;
  }
  map.coopLogoUrl = logo;
  map.coop_logo_url = logo;
  map.logo_url = logo;

  return map;
}

export function mapDbRowToMonthlyReport(row: any) {
  let details: any = undefined;
  if (row.details_json) {
    try { details = JSON.parse(row.details_json); } catch (e) {}
  }
  return {
    id: String(row.id),
    fiscalYear: row.fiscal_year || details?.fiscalYear || 'आ.व. २०८२/८३',
    monthNp: row.month_np || details?.monthNp || '',
    monthEn: row.month_en || details?.monthEn || '',
    reportDateNp: row.report_date_np || details?.reportDateNp || '',
    reportDateEn: row.report_date_en || details?.reportDateEn || '',
    totalMembers: row.total_members || details?.totalMembers || '0',
    shareCapital: row.share_capital || details?.shareCapital || '0',
    shareCapitalGrowth: row.share_capital_growth || details?.shareCapitalGrowth || '',
    reserveFund: row.reserve_fund || details?.reserveFund || '0',
    reserveFundGrowth: row.reserve_fund_growth || details?.reserveFundGrowth || '',
    totalInstitutionalCapital: row.total_institutional_capital || details?.totalInstitutionalCapital || '0',
    totalInstitutionalCapitalNote: row.total_institutional_capital_note || details?.totalInstitutionalCapitalNote || '',
    otherFunds: row.other_funds || details?.otherFunds || '0',
    totalSavings: row.total_savings || details?.totalSavings || '0',
    totalSavingsGrowth: row.total_savings_growth || details?.totalSavingsGrowth || '',
    loansDisbursed: row.loans_disbursed || details?.loansDisbursed || '0',
    borrowerMembersCount: row.borrower_members_count || details?.borrowerMembersCount || '',
    liquidityAmount: row.liquidity_amount || details?.liquidityAmount || '0',
    liquidityPercent: row.liquidity_percent || details?.liquidityPercent || '0%',
    fixedAssets: row.fixed_assets || details?.fixedAssets || '0',
    totalAssets: row.total_assets || details?.totalAssets || '0',
    npaPercent: row.npa_percent || details?.npaPercent || '',
    nplPercent: row.npl_percent || details?.nplPercent || '',
    liqPercentBadge: row.liq_percent_badge || details?.liqPercentBadge || '',
    isPublished: Boolean(row.is_published !== 0 && row.is_published !== false),
    isLatest: Boolean(row.is_latest === 1 || row.is_latest === true),
    sortOrder: Number(row.sort_order || 1),
    remarksEn: row.remarks_en || details?.remarksEn || '',
    remarksNp: row.remarks_np || details?.remarksNp || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDbRowToInstitutionalProfile(row: any) {
  let highlightsEn: string[] = [];
  let highlightsNp: string[] = [];
  if (row.highlights_en) {
    try {
      highlightsEn = typeof row.highlights_en === 'string' ? JSON.parse(row.highlights_en) : row.highlights_en;
    } catch (e) {
      highlightsEn = String(row.highlights_en).split('\n').filter(Boolean);
    }
  }
  if (row.highlights_np) {
    try {
      highlightsNp = typeof row.highlights_np === 'string' ? JSON.parse(row.highlights_np) : row.highlights_np;
    } catch (e) {
      highlightsNp = String(row.highlights_np).split('\n').filter(Boolean);
    }
  }
  return {
    id: String(row.id),
    titleEn: row.title_en,
    titleNp: row.title_np,
    categoryEn: row.category_en,
    categoryNp: row.category_np,
    subtitleEn: row.subtitle_en || '',
    subtitleNp: row.subtitle_np || '',
    contentEn: row.content_en,
    contentNp: row.content_np,
    highlightsEn,
    highlightsNp,
    badgeEn: row.badge_en || '',
    badgeNp: row.badge_np || '',
    icon: row.icon || '🏛️',
    imageUrl: row.image_url || '',
    isPublished: Boolean(row.is_published !== 0 && row.is_published !== false),
    sortOrder: Number(row.sort_order || 1),
    updatedAt: row.updated_at || '',
    createdAt: row.created_at,
  };
}

export async function syncInstitutionalReportsPersistence(reports: any[]): Promise<void> {
  if (!Array.isArray(reports)) return;
  await setSiteSetting('cms_monthly_financial_reports', JSON.stringify(reports));

  try {
    await execute('DELETE FROM institutional_reports');
    for (const r of reports) {
      if (!r || !r.id) continue;
      await execute(`
        INSERT INTO institutional_reports (
          id, fiscal_year, month_np, month_en, report_date_np, report_date_en,
          total_members, share_capital, share_capital_growth, reserve_fund, reserve_fund_growth,
          total_institutional_capital, total_institutional_capital_note, other_funds,
          total_savings, total_savings_growth, loans_disbursed, borrower_members_count,
          liquidity_amount, liquidity_percent, fixed_assets, total_assets,
          npa_percent, npl_percent, liq_percent_badge, is_published, is_latest, sort_order,
          remarks_en, remarks_np, details_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        String(r.id), String(r.fiscalYear || 'आ.व. २०८२/८३'), String(r.monthNp || ''), String(r.monthEn || ''),
        String(r.reportDateNp || ''), String(r.reportDateEn || ''), String(r.totalMembers || '0'),
        String(r.shareCapital || '0'), String(r.shareCapitalGrowth || ''), String(r.reserveFund || '0'), String(r.reserveFundGrowth || ''),
        String(r.totalInstitutionalCapital || '0'), String(r.totalInstitutionalCapitalNote || ''), String(r.otherFunds || '0'),
        String(r.totalSavings || '0'), String(r.totalSavingsGrowth || ''), String(r.loansDisbursed || '0'), String(r.borrowerMembersCount || ''),
        String(r.liquidityAmount || '0'), String(r.liquidityPercent || '0%'), String(r.fixedAssets || '0'), String(r.totalAssets || '0'),
        String(r.npaPercent || ''), String(r.nplPercent || ''), String(r.liqPercentBadge || ''),
        r.isPublished !== false ? 1 : 0, r.isLatest ? 1 : 0, Number(r.sortOrder || 1),
        String(r.remarksEn || ''), String(r.remarksNp || ''), JSON.stringify(r)
      ]);
    }
  } catch (err) {
    console.warn('Error syncing institutional_reports table:', err);
  }
}

export async function getInstitutionalReportsFromDb(): Promise<any[]> {
  try {
    const rows = await queryAll('SELECT * FROM institutional_reports ORDER BY sort_order ASC, id DESC');
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapDbRowToMonthlyReport);
    }
  } catch (e) {}

  const map = await getSiteSettingsMap();
  const raw = map['cms_monthly_financial_reports'] || map['monthly_financial_reports'];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        syncInstitutionalReportsPersistence(parsed).catch(() => {});
        return parsed;
      }
    } catch (e) {}
  }

  if (INITIAL_SITE_SETTINGS.cms_monthly_financial_reports) {
    try {
      const seed = JSON.parse(INITIAL_SITE_SETTINGS.cms_monthly_financial_reports);
      syncInstitutionalReportsPersistence(seed).catch(() => {});
      return seed;
    } catch (e) {}
  }
  return [];
}

export async function syncInstitutionalProfilesPersistence(profiles: any[]): Promise<void> {
  if (!Array.isArray(profiles)) return;
  await setSiteSetting('cms_institutional_profiles', JSON.stringify(profiles));
  try {
    await execute('DELETE FROM institutional_profiles');
    for (const p of profiles) {
      if (!p || !p.id) continue;
      await execute(`
        INSERT INTO institutional_profiles (
          id, title_en, title_np, category_en, category_np, subtitle_en, subtitle_np,
          content_en, content_np, highlights_en, highlights_np, badge_en, badge_np,
          icon, image_url, is_published, sort_order, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        String(p.id), String(p.titleEn || ''), String(p.titleNp || ''), String(p.categoryEn || ''), String(p.categoryNp || ''),
        String(p.subtitleEn || ''), String(p.subtitleNp || ''), String(p.contentEn || ''), String(p.contentNp || ''),
        JSON.stringify(p.highlightsEn || []), JSON.stringify(p.highlightsNp || []),
        String(p.badgeEn || ''), String(p.badgeNp || ''), String(p.icon || '🏛️'), String(p.imageUrl || ''),
        p.isPublished !== false ? 1 : 0, Number(p.sortOrder || 1), String(p.updatedAt || '')
      ]);
    }
  } catch (err) {
    console.warn('Error syncing institutional_profiles table:', err);
  }
}

export async function getInstitutionalProfilesFromDb(): Promise<any[]> {
  try {
    const rows = await queryAll('SELECT * FROM institutional_profiles ORDER BY sort_order ASC, id ASC');
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapDbRowToInstitutionalProfile);
    }
  } catch (e) {}

  const map = await getSiteSettingsMap();
  const raw = map['cms_institutional_profiles'] || map['institutional_profiles'];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        syncInstitutionalProfilesPersistence(parsed).catch(() => {});
        return parsed;
      }
    } catch (e) {}
  }

  if (INITIAL_SITE_SETTINGS.cms_institutional_profiles) {
    try {
      const seed = JSON.parse(INITIAL_SITE_SETTINGS.cms_institutional_profiles);
      syncInstitutionalProfilesPersistence(seed).catch(() => {});
      return seed;
    } catch (e) {}
  }
  return [];
}

