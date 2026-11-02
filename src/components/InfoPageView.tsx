import React, { useState } from 'react';
import { Language, SiteSettingsCMS, SuggestionItemCMS, HeadOfficeInfoCMS } from '../types';
import { ModalData, DiscoverCardItem } from './DetailModal';
import { InstitutionalReportSection } from './InstitutionalReportSection';
import { MonthlyReportComparisonSection } from './MonthlyReportComparison';

interface InfoPageViewProps {
  data: ModalData;
  lang: Language;
  onNavigateToItem: (itemId: string) => void;
  onBackToHome: () => void;
  cmsSettings?: SiteSettingsCMS;
  headOffice?: HeadOfficeInfoCMS;
  onApplyLoan?: (schemeName?: string) => void;
  onSubmitSuggestion?: (suggestion: Omit<SuggestionItemCMS, 'id' | 'ticketNo' | 'submittedAt' | 'status'>) => Promise<string | void>;
  onLanguageChange?: (lang: Language) => void;
}

// Line icons helper for the clean Discover section
const renderDiscoverLineIcon = (iconType: string) => {
  switch (iconType) {
    case 'mission':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'board':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'management':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'chairman':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </svg>
      );
    case 'departments':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
        </svg>
      );
    case 'service-centers':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'savings':
    case 'deposit':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'loan':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z" />
        </svg>
      );
    case 'digital':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'remittance':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case 'insurance':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'reports':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'career':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      );
    case 'contact':
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
};

// 1. All About Us directory items for the sidebar (without Core Values, Institutional Profile, Member Success Stories)
const ABOUT_DIRECTORY_ITEMS = [
  { id: 'profile', icon: '🏛️', titleEn: 'Our Profile', titleNp: 'हाम्रो परिचय' },
  { id: 'history', icon: '📜', titleEn: 'History & Milestones', titleNp: 'इतिहास तथा विकासक्रम' },
  { id: 'mission-vision', icon: '🎯', titleEn: 'Vision & Mission', titleNp: 'ध्येय तथा दृष्टि' },
  { id: 'chairman', icon: '♟', titleEn: "Chairman's Message", titleNp: 'अध्यक्षको सन्देश' },
  { id: 'ceo', icon: '♜', titleEn: "CEO's Message", titleNp: 'प्रमुख कार्यकारी सन्देश' },
  { id: 'why-choose-us', icon: '⭐', titleEn: 'Why Choose Us', titleNp: 'हामीलाई किन रोज्ने?' },
  { id: 'board', icon: '👥', titleEn: 'Board of Directors', titleNp: 'सञ्चालक समिति' },
  { id: 'management', icon: '💼', titleEn: 'Management Team', titleNp: 'व्यवस्थापन टोली' },
  { id: 'departments', icon: '🏢', titleEn: 'Departments', titleNp: 'विभागहरू' },
  { id: 'service-centers', icon: '📍', titleEn: 'Service Centers', titleNp: 'सेवा केन्द्रहरू' },
];

// 2. All 6 Services directory items for the sidebar
const SERVICES_DIRECTORY_ITEMS = [
  { id: 'member-service', icon: '👥', titleEn: 'Member Service & Welfare', titleNp: 'सदस्य सेवा तथा कल्याणकारी सुविधा' },
  { id: 'deposit-product', icon: '🪙', titleEn: 'Deposit Products & Savings Plans', titleNp: 'बचत तथा निक्षेप योजनाहरू' },
  { id: 'loan', icon: '💼', titleEn: 'Productive Loans & Credit', titleNp: 'उत्पादनमूलक कर्जा तथा ऋण सुविधाहरू' },
  { id: 'remittance', icon: '↗', titleEn: 'Fast Remittance Payout', titleNp: 'सुरक्षित तथा छिटो रेमिट्यान्स' },
  { id: 'insurance', icon: '🛡️', titleEn: 'Micro-Insurance & Protection', titleNp: 'बिमा तथा सुरक्षण योजनाहरू' },
  { id: 'digital-services', icon: '📱', titleEn: 'Digital Banking & NepalPay QR', titleNp: 'डिजिटल सेवाहरू तथा स्मार्ट बैंकिङ' },
];

// 3. Reports directory items
const REPORTS_DIRECTORY_ITEMS = [
  { id: 'reports', icon: '📑', titleEn: 'All Publications & Reports', titleNp: 'सम्पूर्ण प्रतिवेदन तथा प्रकाशन' },
  { id: 'reports-monthly', icon: '📅', titleEn: 'Monthly Report', titleNp: 'मासिक प्रतिवेदन' },
  { id: 'reports-progress', icon: '📈', titleEn: 'Progress Report', titleNp: 'प्रगति प्रतिवेदन' },
  { id: 'reports-annual', icon: '📘', titleEn: 'Annual Report (AGM)', titleNp: 'वार्षिक प्रतिवेदन' },
  { id: 'reports-audit', icon: '⚖', titleEn: 'Statutory Audit Report', titleNp: 'लेखापरीक्षण प्रतिवेदन' },
];

// 4. Careers directory items
const CAREERS_DIRECTORY_ITEMS = [
  { id: 'career', icon: '📢', titleEn: 'Opening Vacancies & Jobs', titleNp: 'खुला पदपूर्ति विज्ञापन' },
  { id: 'career-requirements', icon: '📋', titleEn: 'Eligibility & Experience Criteria', titleNp: 'योग्यता तथा अनुभव मापदण्ड' },
  { id: 'career-process', icon: '✉', titleEn: 'Application Guidelines & Form', titleNp: 'दरखास्त फाराम तथा प्रक्रिया' },
];

// 5. Contact directory items (without Toll Free Helpline)
const CONTACT_DIRECTORY_ITEMS = [
  { id: 'head-office', icon: '🏛️', titleEn: 'Head Office Information', titleNp: 'केन्द्रीय कार्यालय विवरण' },
  { id: 'contact-branches', icon: '🏢', titleEn: 'Service Centers & Branches', titleNp: 'सेवा केन्द्रहरू तथा शाखाहरू' },
  { id: 'contact-grievance', icon: '✉', titleEn: 'Grievance Redressal & Feedback', titleNp: 'गुनासो तथा सुझाव पेटिका' },
];

// 6. More directory items (without Sahakari Patro and Member Marketplace)
const MORE_DIRECTORY_ITEMS = [
  { id: 'news', icon: '📰', titleEn: 'News & Activities', titleNp: 'समाचार तथा गतिविधि' },
  { id: 'career', icon: '💼', titleEn: 'Career & Opportunities', titleNp: 'करियर तथा अवसर' },
  { id: 'reports', icon: '📑', titleEn: 'Reports & Publications', titleNp: 'प्रतिवेदन तथा प्रकाशन' },
  { id: 'downloads', icon: '⬇', titleEn: 'Downloads & Forms', titleNp: 'डाउनलोड तथा फाराम' },
  { id: 'suggestions', icon: '💡', titleEn: 'Suggestion Box', titleNp: 'सुझाव पेटिका' },
  { id: 'faq', icon: '❓', titleEn: 'Frequently Asked Questions', titleNp: 'बारम्बार सोधिने प्रश्न' },
];

export const InfoPageView: React.FC<InfoPageViewProps> = ({
  data,
  lang,
  onNavigateToItem,
  onBackToHome,
  cmsSettings,
  headOffice,
  onApplyLoan,
  onSubmitSuggestion,
  onLanguageChange,
}) => {
  const isNepali = lang === 'np';
  const isHeadOfficePage =
    (data.titleEn || '').toLowerCase().includes('head office information') ||
    (data.categoryEn || '').toLowerCase().includes('head office information');

  // Suggestion Box Form State
  const [sugMemberType, setSugMemberType] = useState<'member' | 'non-member'>('member');
  const [sugSender, setSugSender] = useState('');
  const [sugPhone, setSugPhone] = useState('');
  const [sugEmail, setSugEmail] = useState('');
  const [sugMemberCode, setSugMemberCode] = useState('');
  const [sugCategory, setSugCategory] = useState('General Suggestion');
  const [sugSubject, setSugSubject] = useState('');
  const [sugText, setSugText] = useState('');
  const [sugAnonymous, setSugAnonymous] = useState(false);
  const [sugSubmitting, setSugSubmitting] = useState(false);
  const [sugReceiptCode, setSugReceiptCode] = useState<string | null>(null);

  // Detect section from category string
  const catEn = (data.categoryEn || '').toLowerCase();
  const catNp = data.categoryNp || '';

  const detectedSection: 'about' | 'services' | 'reports' | 'careers' | 'contact' | 'more' = 
    catEn.includes('more') ||
    catEn.includes('news') ||
    catEn.includes('download') ||
    catEn.includes('suggestion') ||
    catEn.includes('faq') ||
    catNp.includes('समाचार') ||
    catNp.includes('डाउनलोड') ||
    catNp.includes('सुझाव') ||
    catNp.includes('प्रश्न')
      ? 'more'
      : catEn.includes('service') || catNp.includes('सेवा')
      ? 'services'
      : catEn.includes('report') || catNp.includes('प्रतिवेदन')
      ? 'reports'
      : catEn.includes('career') || catNp.includes('करियर')
      ? 'careers'
      : catEn.includes('contact') || catNp.includes('सम्पर्क')
      ? 'contact'
      : 'about';

  // Local state to allow user to toggle between directories in sidebar if desired
  const [activeSidebarSection, setActiveSidebarSection] = useState<'about' | 'services' | 'reports' | 'careers' | 'contact' | 'more'>(detectedSection);

  // Sync sidebar section if page section changes
  React.useEffect(() => {
    setActiveSidebarSection(detectedSection);
    setSugReceiptCode(null);
  }, [detectedSection, data.titleEn]);

  // Choose items based on active sidebar tab
  const getSidebarItems = () => {
    switch (activeSidebarSection) {
      case 'more':
        return {
          titleEn: 'More Resources & Support',
          titleNp: 'थप जानकारी तथा सुविधा',
          badgeText: `${MORE_DIRECTORY_ITEMS.length} ${isNepali ? 'विषयहरू' : 'Items'}`,
          items: MORE_DIRECTORY_ITEMS,
        };
      case 'services':
        return {
          titleEn: 'Services Directory',
          titleNp: 'सेवा निर्देशिका',
          badgeText: `${SERVICES_DIRECTORY_ITEMS.length} ${isNepali ? 'सेवाहरू' : 'Services'}`,
          items: SERVICES_DIRECTORY_ITEMS,
        };
      case 'reports':
        return {
          titleEn: 'Reports & Disclosures',
          titleNp: 'प्रतिवेदन तथा वासलात',
          badgeText: `${REPORTS_DIRECTORY_ITEMS.length} ${isNepali ? 'प्रतिवेदन' : 'Reports'}`,
          items: REPORTS_DIRECTORY_ITEMS,
        };
      case 'careers':
        return {
          titleEn: 'Career & Opportunities',
          titleNp: 'करियर तथा अवसर',
          badgeText: `${CAREERS_DIRECTORY_ITEMS.length} ${isNepali ? 'विषयहरू' : 'Items'}`,
          items: CAREERS_DIRECTORY_ITEMS,
        };
      case 'contact':
        return {
          titleEn: 'Contact & Branches',
          titleNp: 'सम्पर्क तथा शाखा सञ्जाल',
          badgeText: `${CONTACT_DIRECTORY_ITEMS.length} ${isNepali ? 'डेस्क' : 'Desks'}`,
          items: CONTACT_DIRECTORY_ITEMS,
        };
      case 'about':
      default:
        return {
          titleEn: 'About Us Directory',
          titleNp: 'हाम्रो बारेमा निर्देशिका',
          badgeText: `${ABOUT_DIRECTORY_ITEMS.length} ${isNepali ? 'पृष्ठहरू' : 'Pages'}`,
          items: ABOUT_DIRECTORY_ITEMS,
        };
    }
  };

  const currentSidebar = getSidebarItems();

  // Determine breadcrumb category label
  const getBreadcrumbCategory = () => {
    switch (detectedSection) {
      case 'more':
        return isNepali ? 'थप जानकारी' : 'More Resources';
      case 'services':
        return isNepali ? 'हाम्रा सेवाहरू' : 'Services';
      case 'reports':
        return isNepali ? 'प्रतिवेदन तथा प्रकाशन' : 'Reports & Publications';
      case 'careers':
        return isNepali ? 'करियर तथा अवसर' : 'Careers & Opportunities';
      case 'contact':
        return isNepali ? 'सम्पर्क तथा सेवा केन्द्रहरू' : 'Contact & Branches';
      case 'about':
      default:
        return isNepali ? 'हाम्रो बारेमा' : 'About Us';
    }
  };

  // Dynamic contextual discover cards if not explicitly provided
  const getFallbackDiscoverCards = (): DiscoverCardItem[] => {
    if (data.discoverCards && data.discoverCards.length > 0) {
      return data.discoverCards;
    }

    if (detectedSection === 'services') {
      return [
        {
          id: 'disc-srv-savings',
          targetId: 'deposit-product',
          titleEn: 'Deposit Products & Savings',
          titleNp: 'बचत तथा निक्षेप योजना',
          subtitleEn: 'Regular, Child, Senior Citizen & High-yield Fixed Deposits up to 11.75%',
          subtitleNp: 'दैनिक बचत, बाल, ज्येष्ठ नागरिक र ११.७५% सम्म मुद्दती निक्षेप',
          iconType: 'savings' as const,
        },
        {
          id: 'disc-srv-loans',
          targetId: 'loan',
          titleEn: 'Productive Loans & Credit',
          titleNp: 'उत्पादनमूलक कर्जा तथा ऋण',
          subtitleEn: 'Concessional agriculture, SME trade, housing and self-employment loans',
          subtitleNp: 'सहुलियतपूर्ण कृषि, साना व्यापार, आवास तथा युवा स्वरोजगार कर्जा',
          iconType: 'loan' as const,
        },
        {
          id: 'disc-srv-digital',
          targetId: 'digital-services',
          titleEn: 'Digital Banking & QR',
          titleNp: 'डिजिटल बैंकिङ तथा क्युआर',
          subtitleEn: 'Smart mobile app, NepalPay QR merchant payments & bill settlements',
          subtitleNp: 'स्मार्ट मोबाइल एप, नेपालपे क्युआर भुक्तानी तथा महसुल भुक्तानी',
          iconType: 'digital' as const,
        },
        {
          id: 'disc-srv-remit',
          targetId: 'remittance',
          titleEn: 'Remittance Payout Services',
          titleNp: 'छिटो रेमिट्यान्स भुक्तानी',
          subtitleEn: 'Instant domestic & international payout via IME, Prabhu, Western Union',
          subtitleNp: 'प्रभु, आइएमई तथा वेस्टर्न युनियनमार्फत तत्काल नगद भुक्तानी',
          iconType: 'remittance' as const,
        },
        {
          id: 'disc-srv-welfare',
          targetId: 'member-service',
          titleEn: 'Member Welfare Relief',
          titleNp: 'सदस्य राहत तथा कल्याण कोष',
          subtitleEn: 'Share capital bonuses, maternity nutrition grants and health assistance',
          subtitleNp: 'सेयर लाभांश, सुत्केरी पोषण स्याहार तथा आकस्मिक स्वास्थ्य उपचार राहत',
          iconType: 'management' as const,
        },
        {
          id: 'disc-srv-insurance',
          targetId: 'insurance',
          titleEn: 'Insurance & Safety Schemes',
          titleNp: 'बिमा तथा सुरक्षण योजना',
          subtitleEn: 'Accidental micro-insurance, livestock/crop safety & loan protection',
          subtitleNp: 'लघुबिमा, पशुधन तथा बाली सुरक्षण र कर्जा सुरक्षण बिमा',
          iconType: 'insurance' as const,
        },
      ];
    }

    if (detectedSection === 'reports') {
      return [
        {
          id: 'disc-rep-annual',
          targetId: 'reports-annual',
          titleEn: 'Annual General Meeting Report',
          titleNp: 'वार्षिक साधारण सभा प्रतिवेदन',
          subtitleEn: 'Certified 24th AGM balance sheet, profit & loss, and audit statements',
          subtitleNp: '२४औं साधारण सभाको प्रमाणित वासलात, नाफा-नोक्सान तथा लेखापरीक्षण',
          iconType: 'reports' as const,
        },
        {
          id: 'disc-rep-audit',
          targetId: 'reports-audit',
          titleEn: 'Statutory Audit Report',
          titleNp: 'बाह्य लेखापरीक्षण प्रतिवेदन',
          subtitleEn: 'Independent Chartered Accountant compliance, PEARLS ratios & verification',
          subtitleNp: 'स्वतन्त्र चार्टर्ड एकाउन्ट्यान्ट बाह्य लेखापरीक्षण तथा अनुपालन',
          iconType: 'board' as const,
        },
        {
          id: 'disc-rep-monthly',
          targetId: 'reports-monthly',
          titleEn: 'Monthly Financial Summary',
          titleNp: 'मासिक वित्तीय विवरण',
          subtitleEn: 'Monthly deposit mobilization, credit portfolio & liquidity reserves',
          subtitleNp: 'मासिक निक्षेप संकलन, कर्जा लगानी तथा तरलता कोष स्थिति',
          iconType: 'departments' as const,
        },
        {
          id: 'disc-rep-progress',
          targetId: 'reports-progress',
          titleEn: 'Institutional Progress Metrics',
          titleNp: 'संस्थागत प्रगति सूचकाङ्क',
          subtitleEn: 'Share capital growth, reserve funds and developmental targets',
          subtitleNp: 'सेयर पुँजी वृद्धि, जगेडा कोष र संस्थागत रणनीतिक लक्ष्य',
          iconType: 'mission' as const,
        },
        {
          id: 'disc-rep-inst',
          targetId: 'institutional-profile',
          titleEn: 'Institutional Profile & Facts',
          titleNp: 'संस्थागत विवरण तथा तथ्य',
          subtitleEn: 'Registration no., operational jurisdiction, capital reserves & milestones',
          subtitleNp: 'दर्ता नं., कार्यक्षेत्र, वित्तीय पुँजी आधार तथा उपलब्धिहरू',
          iconType: 'chairman' as const,
        },
        {
          id: 'disc-rep-centers',
          targetId: 'service-centers',
          titleEn: 'Service Centers & Network',
          titleNp: 'सेवा केन्द्रहरू तथा शाखाहरू',
          subtitleEn: 'Head Office Butwal, Drivertole, Traffic Chowk and branch desks',
          subtitleNp: 'केन्द्रीय कार्यालय बुटवल, ड्राइभरटोल तथा शाखा कार्यालयहरू',
          iconType: 'service-centers' as const,
        },
      ];
    }

    if (detectedSection === 'careers') {
      return [
        {
          id: 'disc-car-vacancies',
          targetId: 'career',
          titleEn: 'Opening Vacancies',
          titleNp: 'खुला पदपूर्ति विज्ञापन',
          subtitleEn: 'Explore active job vacancies in management, accounting & field relations',
          subtitleNp: 'प्रशासन, लेखा, सूचना प्रविधि र फिल्ड सहायक पदका विज्ञापनहरू',
          iconType: 'career' as const,
        },
        {
          id: 'disc-car-criteria',
          targetId: 'career-requirements',
          titleEn: 'Eligibility & Selection Criteria',
          titleNp: 'योग्यता तथा छनोट मापदण्ड',
          subtitleEn: 'Educational qualifications, experience, age limit & equal opportunity',
          subtitleNp: 'न्यूनतम शैक्षिक योग्यता, अनुभव, उमेरको हद र समावेशी मापदण्ड',
          iconType: 'mission' as const,
        },
        {
          id: 'disc-car-process',
          targetId: 'career-process',
          titleEn: 'Application Guidelines & Form',
          titleNp: 'दरखास्त फाराम तथा प्रक्रिया',
          subtitleEn: 'Step-by-step submission steps, required documents and deadlines',
          subtitleNp: 'दरखास्त फाराम बुझाउने तरिका, आवश्यक कागजात र अन्तिम मिति',
          iconType: 'board' as const,
        },
        {
          id: 'disc-car-depts',
          targetId: 'departments',
          titleEn: 'Functional Departments',
          titleNp: 'विभागीय संरचनाहरू',
          subtitleEn: 'Credit appraisal, finance, compliance, member safety & IT divisions',
          subtitleNp: 'कर्जा, प्रशासन, आन्तरिक लेखापरीक्षण र सूचना प्रविधि विभाग',
          iconType: 'departments' as const,
        },
        {
          id: 'disc-car-mgmt',
          targetId: 'management',
          titleEn: 'Management & Culture',
          titleNp: 'व्यवस्थापन तथा कार्यसंस्कृति',
          subtitleEn: 'Professional workplace, career growth opportunities and training',
          subtitleNp: 'व्यावसायिक कार्यथलो, वृत्तिविकासका अवसर र निरन्तर तालिम',
          iconType: 'management' as const,
        },
        {
          id: 'disc-car-contact',
          targetId: 'contact',
          titleEn: 'Contact Human Resources',
          titleNp: 'मानव संशाधन सम्पर्क',
          subtitleEn: `Head Office: ${headOffice?.officialEmail || cmsSettings?.email || ''} | ${headOffice?.primaryPhone || cmsSettings?.phone || ''}`,
          subtitleNp: `केन्द्रीय कार्यालय: ${headOffice?.officialEmail || cmsSettings?.email || ''} | ${headOffice?.primaryPhone || cmsSettings?.phone || ''}`,
          iconType: 'contact' as const,
        },
      ];
    }

    if (detectedSection === 'contact') {
      return [
        {
          id: 'disc-cnt-headoffice',
          targetId: 'head-office',
          titleEn: headOffice?.officeNameEn || 'Head Office Information',
          titleNp: headOffice?.officeNameNp || 'केन्द्रीय कार्यालयको विवरण',
          subtitleEn: `${headOffice?.addressEn || cmsSettings?.addressEn || ''} • Tel: ${headOffice?.primaryPhone || cmsSettings?.phone || ''}`,
          subtitleNp: `${headOffice?.addressNp || cmsSettings?.addressNp || ''} • फोन: ${headOffice?.primaryPhone || cmsSettings?.phone || ''}`,
          iconType: 'service-centers' as const,
        },
        {
          id: 'disc-cnt-centers',
          targetId: 'service-centers',
          titleEn: 'Service Centers Network',
          titleNp: 'सेवा केन्द्रहरू तथा शाखाहरू',
          subtitleEn: cmsSettings?.branchNetworkInfo || 'Branch & Service Center desks across our operational area',
          subtitleNp: 'संस्थाको कार्यक्षेत्रभित्रका सम्पूर्ण सेवा केन्द्र तथा शाखाहरू',
          iconType: 'departments' as const,
        },
        {
          id: 'disc-cnt-helpline',
          targetId: 'contact-support',
          titleEn: 'Member Helpline & Support',
          titleNp: 'सदस्य सहायता तथा हटलाइन',
          subtitleEn: `Toll-Free ${headOffice?.tollFreePhone || cmsSettings?.tollFree || ''} & Member Support (${headOffice?.supportEmail || headOffice?.officialEmail || ''})`,
          subtitleNp: `टोल-फ्री ${headOffice?.tollFreePhone || cmsSettings?.tollFree || ''} र डिजिटल बैंकिङ सदस्य सहायता`,
          iconType: 'contact' as const,
        },
        {
          id: 'disc-cnt-feedback',
          targetId: 'contact-grievance',
          titleEn: 'Grievance & Feedback Box',
          titleNp: 'गुनासो तथा सुझाव पेटिका',
          subtitleEn: 'Direct access to institutional compliance officer and dispute redressal',
          subtitleNp: 'उजुरी सुन्ने अधिकारी तथा निष्पक्ष विवाद समाधान डेस्क',
          iconType: 'chairman' as const,
        },
        {
          id: 'disc-cnt-board',
          targetId: 'board',
          titleEn: 'Board of Directors Secretariat',
          titleNp: 'सञ्चालक समिति सचिवालय',
          subtitleEn: 'Democratic leadership, governance, institutional policies & AGMs',
          subtitleNp: 'लोकतान्त्रिक नेतृत्व, संस्थागत सुशासन र साधारण सभा',
          iconType: 'board' as const,
        },
        {
          id: 'disc-cnt-services',
          targetId: 'member-service',
          titleEn: 'Explore Member Services',
          titleNp: 'सदस्य सेवाहरू हेर्नुहोस्',
          subtitleEn: 'Savings, loans, remittance, insurance & digital banking solutions',
          subtitleNp: 'बचत, कर्जा, रेमिट्यान्स, बिमा र डिजिटल सेवाहरूको जानकारी',
          iconType: 'savings' as const,
        },
      ];
    }

    // Default About Us Discover Cards
    return [
      {
        id: 'disc-mission',
        targetId: 'mission-vision',
        titleEn: 'Mission and Vision',
        titleNp: 'ध्येय तथा दृष्टि',
        subtitleEn: 'Strategic direction, purpose, core values and targets',
        subtitleNp: 'रणनीतिक लक्ष्य, उद्देश्य, मूल्य मान्यता र दूरदृष्टि',
        iconType: 'mission' as const,
      },
      {
        id: 'disc-board',
        targetId: 'board',
        titleEn: 'Board of Directors',
        titleNp: 'सञ्चालक समिति',
        subtitleEn: 'Elected fiduciary leadership, policies & governance',
        subtitleNp: 'निर्वाचित नेतृत्व, नीति तर्जुमा र संस्थागत सुशासन',
        iconType: 'board' as const,
      },
      {
        id: 'disc-management',
        targetId: 'management',
        titleEn: 'Management Team',
        titleNp: 'व्यवस्थापन टोली',
        subtitleEn: 'Executive administration, department heads & staff',
        subtitleNp: 'दैनिक कार्यसञ्चालन, विभागीय प्रमुख तथा कर्मचारीहरू',
        iconType: 'management' as const,
      },
      {
        id: 'disc-chairman',
        targetId: 'chairman',
        titleEn: "Chairman's Message",
        titleNp: 'अध्यक्षको सन्देश',
        subtitleEn: 'Message from the Chairman on growth & commitment',
        subtitleNp: 'अध्यक्षबाट संस्थागत विकास र सदस्य सेवाको शुभकामना',
        iconType: 'chairman' as const,
      },
      {
        id: 'disc-departments',
        targetId: 'departments',
        titleEn: 'Departments',
        titleNp: 'विभागहरू',
        subtitleEn: 'Finance, credit, member welfare, audit & IT divisions',
        subtitleNp: 'प्रशासन, कर्जा, सदस्य सुरक्षा, आन्तरिक लेखा र सूचना प्रविधि',
        iconType: 'departments' as const,
      },
      {
        id: 'disc-centers',
        targetId: 'service-centers',
        titleEn: 'Service Centers',
        titleNp: 'सेवा केन्द्रहरू',
        subtitleEn: 'Head Office Butwal, Drivertole & branch networks',
        subtitleNp: 'केन्द्रीय कार्यालय बुटवल, ड्राइभरटोल तथा शाखा कार्यालयहरू',
        iconType: 'service-centers' as const,
      },
    ];
  };

  const discoverCards = getFallbackDiscoverCards();

  return (
    <div className="w-full bg-[#f8fcfe] text-slate-800 transition-colors duration-200">
      {/* 1. Top Breadcrumb & Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[72px] z-20 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium truncate">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#0981ae] transition font-bold cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{isNepali ? 'गृहपृष्ठ' : 'Home'}</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">
              {getBreadcrumbCategory()}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-[#0981ae] font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {isNepali ? data.titleNp : data.titleEn}
            </span>
          </nav>

          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#0981ae] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{isNepali ? 'गृहपृष्ठ फर्कनुहोस्' : 'Back to Home'}</span>
          </button>
        </div>
      </div>

      {/* 2. Grand Full-Window Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#072f42] via-[#07678d] to-[#052636] text-white py-12 sm:py-16 shadow-inner">
        {/* Subtle radial lighting & geometric accent */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,#0cb3f0_0,transparent_50%),radial-gradient(circle_at_80%_80%,#0cb3f0_0,transparent_50%)]" />
        <div className="absolute inset-y-0 right-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center font-black text-[240px] select-none text-white overflow-hidden">
          {data.icon || '🏛️'}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-bold tracking-wider uppercase mb-4 shadow-2xs">
                <span>{data.icon || '✦'}</span>
                <span>
                  {isNepali
                    ? data.categoryNp || getBreadcrumbCategory()
                    : data.categoryEn || getBreadcrumbCategory()}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {isNepali ? data.titleNp : data.titleEn}
              </h1>

              <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                {data.isInstitutionalProfile
                  ? (isNepali
                      ? 'अंकुर बचत तथा ऋण सहकारी संस्था लि. को आधिकारिक मासिक संस्थागत वित्तीय विवरण, सेयर पुँजी, जगेडा कोष, बचत संकलन, ऋण लगानी तथा प्रमाणित परिसूचकहरू।'
                      : 'Official monthly institutional financial statement, share capital, statutory reserves, liquidity indicators, and verified regulatory charter of Ankur Saving & Credit Cooperative Ltd.')
                  : (isNepali
                      ? 'अंकुर बचत तथा ऋण सहकारी संस्था लि. को आधिकारिक संस्थागत जानकारी, सुशासन तथा पारदर्शी सेवा विवरण।'
                      : 'Official institutional details, transparent governance, and operational standards of Ankur Saving & Credit Cooperative Ltd.')}
              </p>
            </div>

            {/* Quick Metadata Card (Suppressed for clean Institutional Profile view) */}
            {!data.isInstitutionalProfile && (
              <div className="hidden lg:flex flex-col gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white min-w-[240px] shadow-lg">
                <div className="text-[11px] uppercase font-bold tracking-wider text-sky-300 mb-1">
                  {isNepali ? 'संस्थागत परिचय' : 'Cooperative Highlights'}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-md bg-sky-500/30 flex items-center justify-center text-xs">🏛️</span>
                  <span>
                    {isNepali
                      ? `स्थापना: ${headOffice?.establishedDate || cmsSettings?.establishedYearNp || cmsSettings?.establishedYear || ''}`
                      : `Established: ${headOffice?.establishedDate || cmsSettings?.establishedYear || ''}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-md bg-sky-500/30 flex items-center justify-center text-xs">📜</span>
                  <span>
                    {isNepali
                      ? `दर्ता नं: ${headOffice?.regNumber || cmsSettings?.regdNo || ''} • पान: ${headOffice?.panNumber || cmsSettings?.panNo || ''}`
                      : `Regd No: ${headOffice?.regNumber || cmsSettings?.regdNo || ''} • PAN: ${headOffice?.panNumber || cmsSettings?.panNo || ''}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-md bg-sky-500/30 flex items-center justify-center text-xs">📞</span>
                  <span>{headOffice?.primaryPhone || cmsSettings?.phone || ''}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-md bg-sky-500/30 flex items-center justify-center text-xs">📍</span>
                  <span>
                    {isNepali
                      ? headOffice?.addressNp || cmsSettings?.addressNp || headOffice?.addressEn || ''
                      : headOffice?.addressEn || cmsSettings?.addressEn || ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Body: Full-Window Width for Institutional Profile OR 2-Column Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className={`grid grid-cols-1 ${data.isInstitutionalProfile ? 'grid-cols-1' : 'lg:grid-cols-12 gap-8 lg:gap-10'} items-start`}>
          {/* Main Column */}
          <main className={data.isInstitutionalProfile ? 'w-full space-y-8' : 'lg:col-span-8 space-y-8'}>
            {/* Optional Banner Image (Suppressed for clean Institutional Profile view) */}
            {data.imageUrl && !data.isInstitutionalProfile && (
              <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                <img
                  src={data.imageUrl}
                  alt={isNepali ? data.titleNp : data.titleEn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Dedicated Top Institutional Report Section for Institutional Profile View */}
            {data.isInstitutionalProfile && data.monthlyReports && data.monthlyReports.length > 0 && (
              <div className="mb-8">
                <MonthlyReportComparisonSection
                  reports={data.monthlyReports}
                  lang={lang}
                  onLanguageChange={onLanguageChange}
                  cmsSettings={cmsSettings}
                />
              </div>
            )}

            {/* Description Card (Suppressed for clean Institutional Profile view) */}
            {!data.isInstitutionalProfile && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0981ae] border border-sky-200/60 flex items-center justify-center text-2xl font-bold shadow-2xs">
                    {data.icon || '✦'}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#0981ae]">
                      {isNepali ? 'विस्तृत विवरण' : 'Executive Overview'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0c2d3e]">
                      {isNepali ? data.titleNp : data.titleEn}
                    </h2>
                  </div>
                </div>

                {/* Lead Paragraph / Description */}
                <div className="text-base sm:text-lg text-slate-700 leading-relaxed space-y-4">
                  {(isNepali ? data.descriptionNp : data.descriptionEn)
                    ?.split('\n\n')
                    .map((paragraph, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                </div>

                {/* Key Highlights & Guidelines Section */}
                {((isNepali && data.bulletPointsNp && data.bulletPointsNp.length > 0) || (data.bulletPointsEn && data.bulletPointsEn.length > 0)) && (
                  <div className="mt-8 p-5 sm:p-6 bg-[#f4f9fc] rounded-2xl border border-[#cce3ee]">
                    <h3 className="text-sm sm:text-base font-bold text-[#0c2d3e] mb-4 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-100 text-[#0981ae] flex items-center justify-center text-xs">
                        🛡️
                      </span>
                      <span>
                        {isNepali
                          ? 'प्रमुख विशेषताहरू, योग्यता तथा आधारभूत पक्ष'
                          : 'Key Highlights, Guidelines & Strategic Features'}
                      </span>
                    </h3>
                    <ul className="space-y-3 m-0 p-0 list-none">
                      {(isNepali ? data.bulletPointsNp : data.bulletPointsEn)?.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-sky-100/90 text-[#0981ae] flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                            ✓
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button if specified */}
                {(data.actionLabelEn || data.actionLabelNp) && (
                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const firstFileCard = data.cards?.find((c) => c.fileUrl);
                      if (data.actionType === 'apply-loan' || data.actionType === 'loan' || (data.categoryEn || '').toLowerCase().includes('loan')) {
                        if (onApplyLoan) {
                          onApplyLoan();
                        } else {
                          onNavigateToItem('apply-loan');
                        }
                      } else if (data.actionType === 'download' && firstFileCard?.fileUrl) {
                        window.open(firstFileCard.fileUrl, '_blank', 'noopener,noreferrer');
                      } else if (data.actionType === 'download') {
                        onNavigateToItem('downloads');
                      } else if (data.actionType === 'register') {
                        onNavigateToItem('new-member');
                      } else if (data.actionType === 'contact') {
                        onNavigateToItem('head-office');
                      } else {
                        onNavigateToItem(data.actionType || 'head-office');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white text-sm font-bold transition shadow-xs cursor-pointer"
                  >
                    <span>{isNepali ? data.actionLabelNp : data.actionLabelEn}</span>
                    <span>➔</span>
                  </button>
                </div>
              )}
            </div>
          )}

            {/* Team Members Directory & BOD Tree Structure (if Board of Directors or Management) */}
            {data.teamMembers && data.teamMembers.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-8">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#0981ae]">
                    {isNepali ? 'नेतृत्व संरचना र निर्देशिका' : 'Governance Tree & Leadership Directory'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0c2d3e]">
                    {isNepali ? 'पदाधिकारी तथा सदस्यहरूको संगठनात्मक संरचना' : 'Organizational Hierarchy & Elected Officials'}
                  </h3>
                </div>

                {/* Visual BOD Tree if viewing Board of Directors */}
                {data.titleEn?.toLowerCase().includes('board') && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#f4f9fc] border border-sky-200/80 flex flex-col items-center">
                    <div className="px-5 py-2 rounded-full bg-[#0c2d3e] text-white text-xs font-extrabold uppercase tracking-wider shadow-xs">
                      {isNepali ? 'साधारण सभा (सर्वोच्च निकाय)' : 'General Assembly of Members'}
                    </div>
                    <div className="w-0.5 h-5 bg-sky-500" />

                    {/* Tier 1: Chairman */}
                    {data.teamMembers
                      .filter((m) => (m.roleEn || '').toLowerCase().includes('chairman') && !(m.roleEn || '').toLowerCase().includes('vice'))
                      .map((chair) => (
                        <div
                          key={chair.id}
                          className="w-full max-w-sm p-4 rounded-2xl bg-white border-2 border-[#0981ae] shadow-md flex items-center gap-3.5"
                        >
                          <div className="w-14 h-14 rounded-full bg-sky-100 text-[#0981ae] overflow-hidden flex items-center justify-center font-bold text-lg shrink-0 border-2 border-[#0981ae]">
                            {chair.photoUrl ? (
                              <img src={chair.photoUrl} alt={chair.nameEn} className="w-full h-full object-cover" />
                            ) : (
                              <span>{(chair.nameEn || 'C')[0]}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0981ae] text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                              {isNepali ? chair.roleNp : chair.roleEn}
                            </span>
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                              {isNepali ? chair.nameNp : chair.nameEn}
                            </h4>
                            {chair.phone && <p className="text-xs text-slate-500 font-mono mt-0.5">📞 {chair.phone}</p>}
                          </div>
                        </div>
                      ))}

                    <div className="w-0.5 h-6 bg-sky-500" />
                    <div className="w-3/4 h-0.5 bg-sky-500" />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-[#0981ae]/50 bg-[#f8fcfe] hover:bg-white hover:shadow-md transition-all duration-200 flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-sky-100/80 text-[#0981ae] overflow-hidden flex items-center justify-center font-bold text-xl shrink-0 border border-sky-200/60 shadow-2xs">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={isNepali ? member.nameNp : member.nameEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{(member.nameEn || 'M')[0]}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-sky-50 text-[#0981ae] text-[10px] font-bold uppercase tracking-wider mb-1 border border-sky-200/50">
                          {isNepali ? member.roleNp : member.roleEn}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                          {isNepali ? member.nameNp : member.nameEn}
                        </h4>
                        {member.phone && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <span>📞</span>
                            <span>{member.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dedicated Dynamic Head Office Information Panel (Synced with MySQL) */}
            {isHeadOfficePage && headOffice && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#0981ae]">
                      {isNepali ? 'केन्द्रीय कार्यालय विवरण' : 'Central Headquarters Directory'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0c2d3e] mt-0.5">
                      {isNepali ? headOffice.officeNameNp || headOffice.officeNameEn : headOffice.officeNameEn}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {headOffice.regNumber && (
                      <span className="px-3 py-1 rounded-full bg-sky-50 text-[#074766] border border-sky-200 text-xs font-bold">
                        {isNepali ? 'दर्ता नं:' : 'Regd:'} {headOffice.regNumber}
                      </span>
                    )}
                    {headOffice.panNumber && (
                      <span className="px-3 py-1 rounded-full bg-sky-50 text-[#0981ae] border border-sky-200 text-xs font-bold">
                        PAN: {headOffice.panNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-Column Info Grid: Location, Communication, Operating Hours */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location Card */}
                  <div className="p-4 rounded-2xl bg-[#f8fcfe] border border-slate-200/80 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0981ae] flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{isNepali ? 'ठेगाना तथा स्थान' : 'Headquarters Location'}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {isNepali ? headOffice.addressNp || headOffice.addressEn : headOffice.addressEn}
                    </p>
                    <p className="text-xs text-slate-600">
                      {headOffice.city} {isNepali ? 'वडा नं.' : 'Ward No.'} {headOffice.ward}, {headOffice.district}, {headOffice.province}
                    </p>
                    {(headOffice.landmarkEn || headOffice.landmarkNp) && (
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold">{isNepali ? 'पहिचान:' : 'Landmark:'}</span>{' '}
                        {isNepali ? headOffice.landmarkNp || headOffice.landmarkEn : headOffice.landmarkEn}
                      </p>
                    )}
                    {headOffice.gpsCoordinates && (
                      <p className="text-[11px] font-mono text-slate-500 pt-1">
                        GPS: {headOffice.gpsCoordinates}
                      </p>
                    )}
                  </div>

                  {/* Communication Channels Card */}
                  <div className="p-4 rounded-2xl bg-[#f8fcfe] border border-slate-200/80 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0981ae] flex items-center gap-1.5">
                      <span>📞</span>
                      <span>{isNepali ? 'सम्पर्क माध्यमहरू' : 'Communication Channels'}</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-700">
                      <p>
                        <span className="font-semibold text-slate-900">{isNepali ? 'मुख्य फोन:' : 'Primary Phone:'}</span>{' '}
                        <a href={`tel:${headOffice.primaryPhone}`} className="font-bold text-[#0981ae] hover:underline">
                          {headOffice.primaryPhone}
                        </a>
                      </p>
                      {headOffice.altPhone && (
                        <p>
                          <span className="font-semibold text-slate-900">{isNepali ? 'वैकल्पिक फोन:' : 'Alt Phone:'}</span>{' '}
                          <span>{headOffice.altPhone}</span>
                        </p>
                      )}
                      {headOffice.tollFreePhone && (
                        <p>
                          <span className="font-semibold text-slate-900">{isNepali ? 'टोल-फ्री:' : 'Toll-Free:'}</span>{' '}
                          <span className="font-bold text-[#0981ae]">{headOffice.tollFreePhone}</span>
                        </p>
                      )}
                      <p className="truncate">
                        <span className="font-semibold text-slate-900">{isNepali ? 'इमेल:' : 'Email:'}</span>{' '}
                        <a href={`mailto:${headOffice.officialEmail}`} className="text-[#0981ae] hover:underline">
                          {headOffice.officialEmail}
                        </a>
                      </p>
                      {headOffice.supportEmail && (
                        <p className="truncate">
                          <span className="font-semibold text-slate-900">{isNepali ? 'सहायता इमेल:' : 'Support:'}</span>{' '}
                          <a href={`mailto:${headOffice.supportEmail}`} className="text-[#0981ae] hover:underline">
                            {headOffice.supportEmail}
                          </a>
                        </p>
                      )}
                      {headOffice.websiteUrl && (
                        <p className="truncate">
                          <span className="font-semibold text-slate-900">{isNepali ? 'वेबसाइट:' : 'Web:'}</span>{' '}
                          <span>{headOffice.websiteUrl}</span>
                        </p>
                      )}
                      {headOffice.poBox && (
                        <p>
                          <span className="font-semibold text-slate-900">P.O. Box:</span> {headOffice.poBox}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Operating Hours Card */}
                  <div className="p-4 rounded-2xl bg-[#f8fcfe] border border-slate-200/80 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0981ae] flex items-center gap-1.5">
                      <span>🕒</span>
                      <span>{isNepali ? 'कार्यालय समय' : 'Operating Hours'}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div>
                        <div className="font-bold text-slate-900">
                          {isNepali ? 'आइतबार – बिहीबार:' : 'Sunday – Thursday:'}
                        </div>
                        <div>
                          {isNepali ? headOffice.sunToThuHoursNp || headOffice.sunToThuHoursEn : headOffice.sunToThuHoursEn}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {isNepali ? 'शुक्रबार:' : 'Friday:'}
                        </div>
                        <div>
                          {isNepali ? headOffice.fridayHoursNp || headOffice.fridayHoursEn : headOffice.fridayHoursEn}
                        </div>
                      </div>
                      {(headOffice.holidayNoticeEn || headOffice.holidayNoticeNp) && (
                        <div className="pt-1 text-amber-800 font-medium">
                          {isNepali ? headOffice.holidayNoticeNp || headOffice.holidayNoticeEn : headOffice.holidayNoticeEn}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Embedded Google Map if available */}
                {headOffice.googleMapEmbedUrl && headOffice.googleMapEmbedUrl.startsWith('http') && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-64 w-full">
                    <iframe
                      title="Head Office Location Map"
                      src={headOffice.googleMapEmbedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Monthly Financial Reports Component (If not already rendered at the top) */}
            {!data.isInstitutionalProfile && data.monthlyReports && data.monthlyReports.length > 0 && (
              <div className="mb-8">
                <InstitutionalReportSection
                  reports={data.monthlyReports}
                  lang={lang}
                  onLanguageChange={onLanguageChange}
                  cmsSettings={cmsSettings}
                  initialSelectedId={data.selectedReportId}
                  onRegisterClick={() => onNavigateToItem('register')}
                />
              </div>
            )}

            {/* Custom Information Cards (Services, Reports, Careers, Branches, Departments) */}
            {data.cards &&
              data.cards.length > 0 &&
              !data.isInstitutionalProfile &&
              !(
                data.titleEn?.toLowerCase().includes('suggestion') ||
                data.categoryEn?.toLowerCase().includes('suggestion') ||
                data.titleEn?.toLowerCase().includes('grievance') ||
                data.titleEn?.toLowerCase().includes('feedback')
              ) && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#0981ae]">
                      {detectedSection === 'services'
                        ? (isNepali ? 'सेवा योजनाहरू' : 'Service Schemes & Options')
                        : detectedSection === 'reports'
                        ? (isNepali ? 'प्रमाणित प्रतिवेदनहरू' : 'Certified Publications')
                        : detectedSection === 'careers'
                        ? (isNepali ? 'सक्रिय पदहरू' : 'Active Vacancies')
                        : detectedSection === 'contact'
                        ? (isNepali ? 'शाखाहरू तथा सम्पर्क' : 'Branches & Locations')
                        : (isNepali ? 'विस्तृत विवरण' : 'Detailed Records')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0c2d3e]">
                      {detectedSection === 'services'
                        ? (isNepali ? 'योजना तथा सुविधा सूची' : 'Schemes, Interest Rates & Features')
                        : detectedSection === 'reports'
                        ? (isNepali ? 'प्रतिवेदन डाउनलोड तथा अवलोकन' : 'Official Financial & Audit Documents')
                        : detectedSection === 'careers'
                        ? (isNepali ? 'हाल खुलेका पदहरू तथा माग विवरण' : 'Current Openings & Eligibility')
                        : detectedSection === 'contact'
                        ? (isNepali ? 'सेवा केन्द्रहरू, सम्पर्क नम्बर र ठेगाना' : 'Office Desks, Numbers & Google Maps')
                        : (isNepali ? 'शाखाहरू, विभाग तथा तथ्य सूची' : 'Branches, Divisions & Key Data')}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#0981ae] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/60 self-start sm:self-auto">
                    {data.cards.length} {isNepali ? 'विवरणहरू' : 'Records'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.cards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-[#0981ae]/50 bg-[#f8fcfe] hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {isNepali ? card.titleNp : card.titleEn}
                          </h4>
                          {(card.badgeEn || card.badgeNp) && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#0981ae] text-[10px] font-bold tracking-wider shrink-0 border border-sky-200/60">
                              {isNepali ? card.badgeNp : card.badgeEn}
                            </span>
                          )}
                        </div>

                        {(card.subtitleEn || card.subtitleNp) && (
                          <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
                            {isNepali ? card.subtitleNp : card.subtitleEn}
                          </p>
                        )}

                        {/* Bullet points inside card (if available, e.g. for responsibilities or requirements) */}
                        {((isNepali && card.pointsNp) || card.pointsEn) && (
                          <ul className="space-y-1.5 mb-3 text-xs text-slate-600">
                            {(isNepali ? card.pointsNp : card.pointsEn)?.slice(0, 3).map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5">
                                <span className="text-[#0981ae] font-bold">›</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Deadlines if career */}
                        {card.deadline && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200/60 mb-2">
                            <span>⏳</span>
                            <span>{isNepali ? 'अन्तिम म्याद:' : 'Deadline:'}</span>
                            <span className="font-bold">{card.deadline}</span>
                          </div>
                        )}

                        {/* File size & report info if reports */}
                        {card.fileSize && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-[11px] font-semibold border border-sky-200/60 mb-2">
                            <span>📑</span>
                            <span>{isNepali ? 'साइज:' : 'File Size:'}</span>
                            <span className="font-bold">{card.fileSize}</span>
                          </div>
                        )}

                        {/* Contact details */}
                        <div className="space-y-1.5 text-xs text-slate-500">
                          {card.phone && (
                            <p className="flex items-center gap-1.5">
                              <span>📞</span>
                              <span className="font-medium text-slate-700">{card.phone}</span>
                            </p>
                          )}
                          {card.email && (
                            <p className="flex items-center gap-1.5">
                              <span>✉️</span>
                              <span className="font-medium text-slate-700">{card.email}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        {card.mapUrl ? (
                          <a
                            href={card.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0981ae] font-bold hover:underline"
                          >
                            <span>🗺️</span>
                            <span>{isNepali ? 'गुगल नक्सामा हेर्नुहोस्' : 'View on Google Maps'} ➔</span>
                          </a>
                        ) : card.fileUrl ? (
                          <a
                            href={card.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#0981ae] font-bold hover:underline"
                          >
                            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{isNepali ? 'प्रतिवेदन हेर्नुहोस्' : 'View Document'} ➔</span>
                          </a>
                        ) : card.email && detectedSection === 'careers' ? (
                          <a
                            href={`mailto:${card.email}?subject=Job Application - ${card.titleEn}`}
                            className="inline-flex items-center gap-1 text-[#0981ae] font-bold hover:underline"
                          >
                            <span>✉️</span>
                            <span>{isNepali ? 'इमेलबाट आवेदन' : 'Apply via Email'} ➔</span>
                          </a>
                        ) : (data.categoryEn || '').toLowerCase().includes('loan') || (card.id || '').startsWith('loan-') ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onApplyLoan) {
                                onApplyLoan(card.titleEn);
                              } else {
                                onNavigateToItem('apply-loan');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white font-bold transition cursor-pointer shadow-2xs"
                          >
                            <span>📝</span>
                            <span>{isNepali ? 'कर्जा आवेदन दिनुहोस् (Apply for Loan)' : 'Apply for Loan'} ➔</span>
                          </button>
                        ) : card.phone ? (
                          <a
                            href={`tel:${card.phone.split(',')[0].trim()}`}
                            className="inline-flex items-center gap-1 text-[#0981ae] font-bold hover:underline"
                          >
                            <span>📞</span>
                            <span>{isNepali ? 'सम्पर्क गर्नुहोस्' : 'Call Direct'} ➔</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onNavigateToItem((card as any).targetId || data.actionType || 'head-office')}
                            className="inline-flex items-center gap-1 text-[#0981ae] font-bold hover:underline cursor-pointer"
                          >
                            <span>{isNepali ? 'थप परामर्श लिनुहोस्' : 'Inquire Now'} ➔</span>
                          </button>
                        )}

                        <span className="w-5 h-5 rounded-full bg-sky-50 text-[#0981ae] flex items-center justify-center text-xs font-bold">
                          ›
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Feedback & Suggestion Form (Matching Reference Design) */}
            {(data.titleEn?.toLowerCase().includes('suggestion') ||
              data.categoryEn?.toLowerCase().includes('suggestion') ||
              data.titleEn?.toLowerCase().includes('grievance') ||
              data.titleEn?.toLowerCase().includes('feedback')) && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#0c2d3e] tracking-tight">
                    {isNepali
                      ? 'आफ्नो सुझाव वा प्रतिक्रिया पठाउनुहोस्'
                      : 'Send Us Your Feedback or Suggestion'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {isNepali
                      ? 'तलको फारम भर्नुहोस् र हाम्रो टोलीले तपाईंको सन्देशको तुरुन्तै समीक्षा गर्नेछ।'
                      : 'Fill out the form below and our team will review your message promptly.'}
                  </p>
                </div>

                {sugReceiptCode ? (
                  <div className="p-6 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-950 space-y-3">
                    <div className="font-extrabold text-base text-[#0c2d3e] flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0981ae] text-white text-xs">
                        ✓
                      </span>
                      <span>
                        {isNepali
                          ? 'तपाईंको प्रतिक्रिया सफलतापूर्वक दर्ता भयो!'
                          : 'Your Feedback Has Been Submitted Successfully!'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {isNepali
                        ? `तपाईंको दर्ता नम्बर: ${sugReceiptCode} हो। यो सन्देश डाटाबेसमा सुरक्षित गरी प्रशासनिक समीक्षाका लागि पठाइएको छ।`
                        : `Your Reference Ticket Number is ${sugReceiptCode}. Your submission has been permanently saved to the database for administrative review.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSugReceiptCode(null)}
                      className="mt-2 px-5 py-2 rounded-lg bg-[#0c2d3e] hover:bg-[#0981ae] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isNepali ? 'अर्को प्रतिक्रिया पठाउनुहोस्' : 'Submit Another Feedback'}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!sugSender.trim() || !sugPhone.trim() || !sugSubject.trim() || !sugText.trim()) return;
                      setSugSubmitting(true);
                      try {
                        const code = onSubmitSuggestion
                          ? await onSubmitSuggestion({
                              senderName: sugSender.trim(),
                              memberType: sugMemberType,
                              phone: sugPhone.trim(),
                              email: sugEmail.trim(),
                              memberCode: sugMemberType === 'member' ? sugMemberCode.trim() : '',
                              category: sugCategory,
                              subject: sugSubject.trim(),
                              suggestionText: sugText.trim(),
                              isAnonymous: false,
                            })
                          : `SUG-2083-${Math.floor(100 + Math.random() * 900)}`;
                        setSugReceiptCode(code || `SUG-2083-${Math.floor(100 + Math.random() * 900)}`);
                        setSugSender('');
                        setSugMemberCode('');
                        setSugPhone('');
                        setSugEmail('');
                        setSugCategory('General Suggestion');
                        setSugSubject('');
                        setSugText('');
                      } finally {
                        setSugSubmitting(false);
                      }
                    }}
                    className="space-y-5"
                  >
                    {/* Member / Non-Member Selection Bar */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex flex-wrap items-center gap-6">
                      <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#0c2d3e] cursor-pointer">
                        <input
                          type="radio"
                          name="feedbackMemberType"
                          checked={sugMemberType === 'member'}
                          onChange={() => setSugMemberType('member')}
                          className="w-4 h-4 accent-[#0c2d3e] cursor-pointer"
                        />
                        <span>{isNepali ? 'म संस्थाको सदस्य हुँ' : 'I am an Existing Member'}</span>
                      </label>
                      <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="feedbackMemberType"
                          checked={sugMemberType === 'non-member'}
                          onChange={() => setSugMemberType('non-member')}
                          className="w-4 h-4 accent-[#0c2d3e] cursor-pointer"
                        />
                        <span>{isNepali ? 'गैर-सदस्य / सर्वसाधारण' : 'Non-Member / General Visitor'}</span>
                      </label>
                    </div>

                    {/* Two-Column Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#0c2d3e] mb-1.5">
                          {isNepali ? 'पूरा नाम' : 'Full Name'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={sugSender}
                          onChange={(e) => setSugSender(e.target.value)}
                          placeholder={isNepali ? 'आफ्नो पूरा नाम लेख्नुहोस्' : 'Enter your full name'}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0c2d3e] focus:ring-2 focus:ring-sky-500/15 outline-none transition-all"
                        />
                      </div>

                      {/* Member ID (Optional) */}
                      <div>
                        <label className="block text-xs font-bold text-[#0c2d3e] mb-1.5">
                          {isNepali ? 'सदस्य नं. (ऐच्छिक)' : 'Member ID (Optional)'}
                        </label>
                        <input
                          type="text"
                          disabled={sugMemberType === 'non-member'}
                          value={sugMemberType === 'non-member' ? '' : sugMemberCode}
                          onChange={(e) => setSugMemberCode(e.target.value)}
                          placeholder={
                            sugMemberType === 'non-member'
                              ? isNepali
                                ? 'गैर-सदस्यका लागि आवश्यक छैन'
                                : 'Not applicable for Non-Member'
                              : 'e.g. 001245'
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0c2d3e] focus:ring-2 focus:ring-sky-500/15 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-bold text-[#0c2d3e] mb-1.5">
                          {isNepali ? 'फोन नम्बर' : 'Phone Number'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={sugPhone}
                          onChange={(e) => setSugPhone(e.target.value)}
                          placeholder="98XXXXXXXX"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0c2d3e] focus:ring-2 focus:ring-sky-500/15 outline-none transition-all"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-[#0c2d3e] mb-1.5">
                          {isNepali ? 'इमेल ठेगाना' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={sugEmail}
                          onChange={(e) => setSugEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0c2d3e] focus:ring-2 focus:ring-sky-500/15 outline-none transition-all"
                        />
                      </div>

                      {/* Feedback Type */}
                      <div>
                        <label className="block text-xs font-bold text-[#0c2d3e] mb-1.5">
                          {isNepali ? 'प्रतिक्रियाको प्रकार' : 'Feedback Type'} <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required
                          value={sugCategory}
                          onChange={(e) => setSugCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:border-[#0c2d3e] focus:ring-2 focus:ring-sky-500/15 outline-none transition-all"
                        >
                          <option value="General Suggestion">
                            {isNepali ? 'सामान्य सुझाव (General Suggestion)' : 'General Suggestion'}
                          </option>
                          <option value="Service Feedback">
                            {isNepali ? 'सेवा सम्बन्धी प्रतिक्रिया (Service Feedback)' : 'Service Feedback'}
                          </option>
                          <option value="Appreciation">
                            {isNepali ? 'प्रशंसा / धन्यवाद (Appreciation)' : 'Appreciation'}
                          </option>
                          <option value="Complaint / Grievance">
                            {isNepali ? 'गुनासो / उजुरी (Complaint / Grievance)' : 'Complaint / Grievance'}
                          </option>
                          <option value="Digital Banking">
                            {isNepali ? 'डिजिटल / मोबाइल बैंकिङ (Digital Banking)' : 'Digital Banking'}
                          </option>
                        </select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-xs font-bold text-[#0c2d3e] mb-1.5">
                          {isNepali ? 'विषय' : 'Subject'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={sugSubject}
                          onChange={(e) => setSugSubject(e.target.value)}
                          placeholder={isNepali ? 'तपाईंको सन्देशको संक्षिप्त विषय' : 'Brief subject of your message'}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0c2d3e] focus:ring-2 focus:ring-sky-500/15 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Message / Suggestion */}
                    <div>
                      <label className="block text-xs font-bold text-[#0c2d3e] mb-1.5">
                        {isNepali ? 'तपाईंको सन्देश / सुझाव' : 'Your Message / Suggestion'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={sugText}
                        onChange={(e) => setSugText(e.target.value)}
                        placeholder={
                          isNepali
                            ? 'आफ्नो सुझाव, प्रतिक्रिया वा अनुभव विस्तृत रूपमा लेख्नुहोस्...'
                            : 'Please describe your suggestion, feedback, or experience in detail...'
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0c2d3e] focus:ring-2 focus:ring-sky-500/15 outline-none transition-all resize-y"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={sugSubmitting}
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#0c2d3e] hover:bg-[#0981ae] text-white text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        <span>
                          {sugSubmitting
                            ? isNepali
                              ? 'पठाउँदै...'
                              : 'Submitting...'
                            : isNepali
                            ? 'प्रतिक्रिया पठाउनुहोस्'
                            : 'Submit Feedback'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </main>

          {/* Sticky Sidebar (4 cols) - Hidden in Full Window Institutional Profile */}
          {!data.isInstitutionalProfile && (
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* 1. Category Switcher Tabs + Directory List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              {/* Category Quick Pills */}
              <div className="mb-4 pb-3 border-b border-slate-100">
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                  {isNepali ? 'फाँट छनोट गर्नुहोस्' : 'Select Category'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveSidebarSection('about')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSidebarSection === 'about'
                        ? 'bg-[#0981ae] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isNepali ? 'हाम्रो बारेमा' : 'About'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSidebarSection('services')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSidebarSection === 'services'
                        ? 'bg-[#0981ae] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isNepali ? 'सेवाहरू' : 'Services'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSidebarSection('reports')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSidebarSection === 'reports'
                        ? 'bg-[#0981ae] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isNepali ? 'प्रतिवेदन' : 'Reports'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSidebarSection('careers')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSidebarSection === 'careers'
                        ? 'bg-[#0981ae] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isNepali ? 'करियर' : 'Career'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSidebarSection('contact')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSidebarSection === 'contact'
                        ? 'bg-[#0981ae] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isNepali ? 'सम्पर्क' : 'Contact'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSidebarSection('more')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSidebarSection === 'more'
                        ? 'bg-[#0981ae] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isNepali ? 'थप' : 'More'}
                  </button>
                </div>
              </div>

              {/* Directory Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0981ae]" />
                  <span>{isNepali ? currentSidebar.titleNp : currentSidebar.titleEn}</span>
                </h3>
                <span className="text-[11px] font-bold text-[#0981ae] bg-sky-50 px-2 py-0.5 rounded-md">
                  {currentSidebar.badgeText}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                {currentSidebar.items.map((item) => {
                  const isActive =
                    data.titleEn?.toLowerCase().includes(item.titleEn.toLowerCase()) ||
                    data.titleNp?.includes(item.titleNp) ||
                    (item.id === 'profile' && data.categoryEn?.toLowerCase().includes('profile')) ||
                    (item.id === 'loan' && data.categoryEn?.toLowerCase().includes('loan')) ||
                    (item.id === 'deposit-product' && data.categoryEn?.toLowerCase().includes('deposit'));

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigateToItem(item.id)}
                      className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#0981ae] text-white font-bold shadow-xs'
                          : 'hover:bg-[#f0f9ff] text-slate-700 hover:text-[#0981ae]'
                      }`}
                    >
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="text-xs sm:text-[13px] font-medium flex-1 truncate">
                        {isNepali ? item.titleNp : item.titleEn}
                      </span>
                      <span className={`text-xs ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        ›
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Official Helpdesk & Office Contact */}
            <div className="bg-gradient-to-br from-[#f0f9ff] to-[#eef8fc] p-5 rounded-3xl border border-sky-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#0981ae] text-white flex items-center justify-center text-lg shadow-2xs font-bold">
                  📞
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c2d3e]">
                    {isNepali ? 'केन्द्रीय कार्यालय सम्पर्क' : 'Head Office Contact'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isNepali
                      ? headOffice?.addressNp || cmsSettings?.addressNp || headOffice?.addressEn || ''
                      : headOffice?.addressEn || cmsSettings?.addressEn || ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 my-4">
                <p className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{isNepali ? 'फोन:' : 'Phone:'}</span>
                  <a
                    href={`tel:${headOffice?.primaryPhone || cmsSettings?.phone || ''}`}
                    className="text-[#0981ae] font-bold hover:underline"
                  >
                    {headOffice?.primaryPhone || cmsSettings?.phone || ''}
                    {headOffice?.altPhone ? ` / ${headOffice.altPhone}` : ''}
                  </a>
                </p>
                {(headOffice?.tollFreePhone || cmsSettings?.tollFree) && (
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{isNepali ? 'टोल-फ्री:' : 'Toll-Free:'}</span>
                    <span className="font-semibold text-[#0981ae]">
                      {headOffice?.tollFreePhone || cmsSettings?.tollFree}
                    </span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{isNepali ? 'इमेल:' : 'Email:'}</span>
                  <a
                    href={`mailto:${headOffice?.officialEmail || cmsSettings?.email || ''}`}
                    className="text-[#0981ae] hover:underline truncate"
                  >
                    {headOffice?.officialEmail || cmsSettings?.email || ''}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{isNepali ? 'समय:' : 'Hours:'}</span>
                  <span>
                    {isNepali
                      ? headOffice?.sunToThuHoursNp || headOffice?.sunToThuHoursEn || cmsSettings?.officeHours || ''
                      : headOffice?.sunToThuHoursEn || cmsSettings?.officeHours || ''}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={onBackToHome}
                className="w-full py-2.5 rounded-xl bg-[#0981ae] text-white text-xs font-bold hover:bg-[#07678d] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isNepali ? 'गृहपृष्ठमा सम्पूर्ण सेवाहरू हेर्नुहोस्' : 'Explore All Services on Home'}</span>
                <span>➔</span>
              </button>
            </div>
          </aside>
        )}
        </div>
      </div>

      {/* 4. Centered "Discover" Section (Suppressed for clean Institutional Profile view) */}
      {!data.isInstitutionalProfile && (
        <section className="bg-white py-14 border-t border-slate-200/90 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 text-[#0981ae] text-xs font-bold uppercase tracking-wider border border-sky-200/70 mb-3">
                <span>✦</span>
                <span>
                  {detectedSection === 'services'
                    ? (isNepali ? 'थप सेवा तथा सुविधाहरू' : 'Discover Our Core Services')
                    : detectedSection === 'reports'
                    ? (isNepali ? 'थप प्रतिवेदन तथा सुशासन' : 'Discover Governance & Reports')
                    : detectedSection === 'careers'
                    ? (isNepali ? 'करियर तथा कार्यसंस्कृति' : 'Discover Career & Opportunities')
                    : detectedSection === 'contact'
                    ? (isNepali ? 'शाखा तथा सहायता सञ्जाल' : 'Discover Branches & Helpline')
                    : (isNepali ? 'हाम्रो संस्था बारे थप जान्नुहोस्' : 'Discover Our Organization')}
                </span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c2d3e] tracking-tight">
                {detectedSection === 'services'
                  ? (isNepali ? 'सुरक्षित बचत, सहुलियत कर्जा र डिजिटल बैंकिङ' : 'High Returns, Flexible Credit & Digital Ease')
                  : detectedSection === 'reports'
                  ? (isNepali ? 'पारदर्शी लेखापरीक्षण, वार्षिक सभा र विवरणहरू' : 'Audited Books, Annual Disclosures & Metrics')
                  : detectedSection === 'careers'
                  ? (isNepali ? 'खुला प्रतिस्पर्धा, योग्यता र आवेदन प्रक्रिया' : 'Equal Opportunity, Fair Appraisal & Careers')
                  : detectedSection === 'contact'
                  ? (isNepali ? 'केन्द्रीय कार्यालय, शाखा सेवा केन्द्र र हटलाइन' : 'Branches, Contact Desks & Dedicated Helpline')
                  : (isNepali ? 'संस्थागत अङ्ग, नेतृत्व तथा सेवा केन्द्रहरू' : 'Explore Governance, Leadership & Branches')}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2 leading-relaxed">
                {isNepali
                  ? 'विस्तृत विवरण, मार्गदर्शन तथा जानकारी प्राप्त गर्न तलका कार्डहरूमा क्लिक गर्नुहोस्।'
                  : 'Click any card below to open its dedicated full-window page with complete information and records.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {discoverCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onNavigateToItem(card.targetId)}
                  className="group p-5 bg-white hover:bg-[#f0f9ff] active:bg-[#eef8fc] rounded-2xl border border-slate-200 hover:border-[#0cb3f0] shadow-xs hover:shadow-lg transition-all duration-200 text-left flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0981ae] border border-sky-200/60 flex items-center justify-center shrink-0 group-hover:bg-[#0981ae] group-hover:text-white group-hover:scale-105 transition-all duration-200 shadow-2xs">
                      {renderDiscoverLineIcon(card.iconType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0981ae] transition-colors leading-snug">
                        {isNepali ? card.titleNp : card.titleEn}
                      </h3>
                      {(card.subtitleEn || card.subtitleNp) && (
                        <p className="text-xs text-slate-500 group-hover:text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {isNepali ? card.subtitleNp : card.subtitleEn}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0981ae]">
                    <span className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                      <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{isNepali ? 'थप हेर्नुहोस्' : 'View More'}</span>
                      <span>➔</span>
                    </span>
                    <span className="w-6 h-6 rounded-full bg-sky-100/70 flex items-center justify-center text-xs group-hover:bg-[#0981ae] group-hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
