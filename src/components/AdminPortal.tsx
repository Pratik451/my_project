import React, { useState, useEffect } from 'react';
import {
  Language,
  AuthUser,
  EkymRecord,
  LoanRecord,
  MemberRecord,
  SiteSettingsCMS,
  SlideCMS,
  ServiceItem,
  InterestRate,
  NoticeItem,
  GalleryItem,
  PopupNoticeItem,
  TeamMemberCMS,
  CmsPagesState,
  DepartmentCMS,
  ServiceCenterCMS,
  ReportCMS,
  CareerCMS,
  HeadOfficeInfoCMS,
  GrievanceRecordCMS,
  GrievanceOfficerCMS,
  PrivacyPolicyCMS,
  SocialLinksCMS,
  BrandThemeCMS,
  DocumentItemCMS,
  NewsActivityItemCMS,
  SuggestionItemCMS,
  FaqItemCMS,
  HistoryMilestonesPageCMS,
  WhyChooseUsPageCMS,
  ExchangeRateItemCMS,
  InstitutionalProfileItemCMS,
  MonthlyFinancialReportCMS,
  LeadershipMemberCMS,
} from '../types';
import {
  INITIAL_CMS_PAGES,
  INITIAL_CMS_DEPARTMENTS,
  INITIAL_CMS_SERVICE_CENTERS,
  INITIAL_CMS_REPORTS,
  INITIAL_CMS_CAREERS,
  INITIAL_CMS_PRIVACY_POLICY,
  INITIAL_CMS_SOCIAL_LINKS,
  INITIAL_CMS_BRAND_THEME,
  INITIAL_CMS_DOCUMENTS,
  INITIAL_CMS_NEWS_ACTIVITIES,
  INITIAL_CMS_SUGGESTIONS,
  INITIAL_CMS_FAQS,
  INITIAL_CMS_HISTORY_MILESTONES,
  INITIAL_CMS_WHY_CHOOSE_US,
  INITIAL_CMS_EXCHANGE_RATES,
  INITIAL_CMS_INSTITUTIONAL_PROFILES,
  INITIAL_MONTHLY_FINANCIAL_REPORTS,
  INITIAL_CMS_HEAD_OFFICE,
  INITIAL_CMS_LEADERSHIP_MEMBERS,
} from '../data/cmsInitialData';
import {
  INITIAL_EKYM_RECORDS,
  INITIAL_LOAN_RECORDS,
  INITIAL_MEMBERS,
} from '../data/backendData';
import {
  INTEREST_RATES,
  NOTICES_DATA,
  SERVICES_DATA,
  GALLERY_ITEMS,
  DEFAULT_TEAM_MEMBERS,
} from '../data/cooperativeData';
import {
  fetchEkymApplications,
  updateEkymApplicationStatus,
} from '../services/ekymApi';
import {
  fetchLoanApplications,
  updateLoanStatusApi,
  createNoticeApi,
  deleteNoticeApi,
  saveAllNoticesApi,
  saveAllInterestRates,
} from '../services/cooperativeApi';
import {
  fetchPopupNotices,
  savePopupNotice,
  togglePopupNoticeStatus,
  deletePopupNotice,
  updatePopupNoticeImage,
} from '../services/noticeApi';
import {
  uploadSingleMediaImage,
  deleteMediaByPath,
  deleteWebsiteLogo,
  saveCmsSlides,
  saveCmsGallery,
  saveCmsServices,
  saveCmsTeam,
  saveCmsPages,
  saveCmsDepartments,
  saveCmsServiceCenters,
  saveCmsReports,
  saveCmsCareers,
  saveCmsHeadOffice,
  saveCmsGrievances,
  saveCmsGrievanceOfficer,
  saveCmsPrivacyPolicy,
  saveCmsSocialLinks,
  saveCmsBrandTheme,
  saveCmsDocuments,
  saveCmsNewsActivities,
  saveCmsSuggestions,
  saveCmsFaqs,
  saveCmsHistoryMilestones,
  saveCmsWhyChooseUs,
  saveCmsExchangeRates,
  saveCmsInstitutionalProfiles,
  saveCmsMonthlyFinancialReports,
  saveCmsMembers,
  saveCmsAuditLogs,
  fetchAllCmsData,
  fetchSiteSettings,
  uploadWebsiteLogo,
  saveWebsiteLogoUrl,
  updateSiteSettings,
} from '../services/mediaApi';
import { EkymDetailsModal } from './admin/EkymDetailsModal';
import { LoanApplicationsManager } from './admin/LoanApplicationsManager';
import { LogoManagement } from './admin/LogoManagement';
import { MediaManagement } from './admin/MediaManagement';
import { PrintableKymDocument } from './ekym/PrintableKymDocument';
import { OrganizationProfileManager } from './admin/cms/OrganizationProfileManager';
import { DepartmentsManager } from './admin/cms/DepartmentsManager';
import { ServiceCentersManager } from './admin/cms/ServiceCentersManager';
import { ReportsManager } from './admin/cms/ReportsManager';
import { CareersManager } from './admin/cms/CareersManager';
import { TeamManager } from './admin/cms/TeamManager';
import { ServicesManager } from './admin/cms/ServicesManager';
import { HeadOfficeManager } from './admin/cms/HeadOfficeManager';
import { GrievanceManager } from './admin/cms/GrievanceManager';
import { InterestRatesManager } from './admin/cms/InterestRatesManager';
import { PrivacyPolicyManager } from './admin/cms/PrivacyPolicyManager';
import { SocialLinksManager } from './admin/cms/SocialLinksManager';
import { BrandThemeManager } from './admin/cms/BrandThemeManager';
import { DocumentsManager } from './admin/cms/DocumentsManager';
import { NewsActivitiesManager } from './admin/cms/NewsActivitiesManager';
import { SuggestionBoxManager } from './admin/cms/SuggestionBoxManager';
import { FaqManager } from './admin/cms/FaqManager';
import { HistoryMilestonesManager } from './admin/cms/HistoryMilestonesManager';
import { WhyChooseUsManager } from './admin/cms/WhyChooseUsManager';
import { ExchangeRatesManager } from './admin/cms/ExchangeRatesManager';
import { InstitutionalProfileManager } from './admin/cms/InstitutionalProfileManager';
import { LeadershipManager } from './admin/cms/LeadershipManager';
import { DigitalServicesManager } from './admin/cms/DigitalServicesManager';
import { usePreetiTyping } from '../context/PreetiTypingContext';
import { PreetiFloatingToolbar } from './admin/PreetiFloatingToolbar';
import {
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Database,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  Filter,
  Printer,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';

export const DEFAULT_CMS_SETTINGS: SiteSettingsCMS = {
  coopNameEn: 'Ankur Saving & Credit Cooperative Ltd.',
  coopNameNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि.',
  coopLogoUrl: '',
  taglineEn: 'Butwal-4, Rupandehi • Regd. No: 421/057/058 • Established 2057 B.S.',
  taglineNp: 'बुटवल-४, रुपन्देही • दर्ता नं: ४२१/०५७/०५८ • स्थापना: २०५७ वि.सं.',
  establishedBs: '2057',
  establishedAd: '2000',
  establishedDateEn: 'Established in 2057 B.S. (2000 A.D.)',
  establishedDateNp: 'स्थापना: २०५७ वि.सं. (२००० इ.सं.)',
  tickerTextEn:
    'Welcome to Ankur Saving & Credit Cooperative Ltd. | Member eKYM Digital Update active | High-Yield Term Deposits up to 11.75% | Toll-Free: 1660-01-99887',
  tickerTextNp:
    'अंकुर बचत तथा ऋण सहकारी संस्था लि. मा हार्दिक स्वागत गर्दछौं। | अनलाइन eKYM अध्यावधिक सुरु | ११.७५% सम्म मुद्दती निक्षेप प्रतिफल | टोल-फ्री: १६६०-०१-९९८८७',
  tickerActive: true,
  phoneHeadOffice: '071-540123 / 540456',
  phoneTollFree: '1660-01-99887',
  emailOfficial: 'info@ekatacoop.com.np',
  addressHeadOffice: 'Main Road, Butwal-4, Rupandehi, Lumbini Province, Nepal',
  addressHeadOfficeNp: 'मुख्य सडक, बुटवल-४, रुपन्देही, लुम्बिनी प्रदेश, नेपाल',
  province: 'Lumbini Province',
  district: 'Rupandehi',
  cityMunicipality: 'Butwal Sub-Metropolitan City',
  wardNo: '4',
  streetTole: 'Main Road, Traffic Chowk',
  serviceAreaEn: 'Lumbini Province & Rupandehi District',
  serviceAreaNp: 'लुम्बिनी प्रदेश तथा रुपन्देही जिल्ला',
  branchNetworkInfo: 'Central Head Office + 4 Service Centers across Rupandehi',
  mapsEmbedUrl: '',
  officeHours: 'Sunday - Friday: 10:00 AM - 5:00 PM (Counter till 4:00 PM)',
  regdNo: '421/057/058',
  panNo: '301548921',
  statMembers: '15,420+',
  statSavings: 'Rs. 1.28 Arba',
  statLoans: 'Rs. 98.40 Crore',
  statCapital: 'Rs. 24.50 Crore',
  statBranches: '',
};

export const DEFAULT_CMS_SLIDES: SlideCMS[] = [
  {
    id: 'slide-1',
    titleEn: 'Trusted Financial Pillar of Rupandehi',
    titleNp: 'समुदायमा आधारित, सदस्य-केन्द्रित भरपर्दो वित्तीय संस्था',
    subtitleEn:
      'Serving over 15,420 members since 2057 B.S. with secure savings, productive loans, and community prosperity.',
    subtitleNp:
      'वि.सं. २०५७ देखि रुपन्देहीमा सुरक्षित बचत, उत्पादनशील कर्जा र सामुदायिक समृद्धिका लागि समर्पित सहकारी संस्था।',
    imageUrl: '/uploads/media/slide-banking.svg',
    ctaTextEn: 'Explore Services',
    ctaTextNp: 'सेवाहरू हेर्नुहोस्',
    ctaLink: '#services',
    sortOrder: 1,
  },
  {
    id: 'slide-2',
    titleEn: 'Dedicated Member Care & Safe Savings',
    titleNp: 'आत्मीय सेवा, भरपर्दो बचत तथा निक्षेप सुरक्षा',
    subtitleEn:
      'Earn attractive quarterly interest on daily balances with instant counter withdrawals and passbook facilities.',
    subtitleNp:
      'दैनिक मौज्दातमा आकर्षक ब्याज, सहज काउन्टर भुक्तानी र भरपर्दो सदस्य कल्याणकारी योजनाहरू।',
    imageUrl: '/uploads/media/slide-deposits.svg',
    ctaTextEn: 'View Savings Schemes',
    ctaTextNp: 'बचत योजनाहरू',
    ctaLink: '#rates',
    sortOrder: 2,
  },
  {
    id: 'slide-3',
    titleEn: 'Empowering Local Farmers & Agriculture',
    titleNp: 'किसान र कृषि उत्पादकत्व प्रवर्द्धनमा सुलभ कर्जा',
    subtitleEn:
      'Subsidized credit for modern farming, livestock, dairy cooperatives, and agricultural machinery.',
    subtitleNp:
      'आधुनिक कृषि, पशुपालन, दुग्ध व्यवसाय र यन्त्र खरिदका लागि सहुलियतपूर्ण कर्जा सुविधा।',
    imageUrl: '/uploads/media/slide-agriculture.svg',
    ctaTextEn: 'Calculate Loan EMI',
    ctaTextNp: 'कर्जा किस्ता हिसाब',
    ctaLink: '#calculator',
    sortOrder: 3,
  },
  {
    id: 'slide-4',
    titleEn: 'Fueling Micro-Enterprise & Business Growth',
    titleNp: 'व्यापार, उद्यमशीलता र साना व्यवसायको सहयात्री',
    subtitleEn:
      'Hassle-free business installment credit designed to scale local commerce and family enterprises.',
    subtitleNp:
      'स्थानीय व्यापार विस्तार, स्वरोजगार र साना उद्यमलाई अगाडि बढाउन छरितो कर्जा सेवा।',
    imageUrl: '/uploads/media/gallery-tech.svg',
    ctaTextEn: 'View Loan Schemes',
    ctaTextNp: 'कर्जा योजनाहरू',
    ctaLink: '#rates',
    sortOrder: 4,
  },
  {
    id: 'slide-5',
    titleEn: 'Smart Ankur Mobile Banking & QR',
    titleNp: 'हात-हातमा आधुनिक डिजिटल सहकारी सेवा',
    subtitleEn:
      'Experience mobile banking, Fonepay QR merchant scan, inter-cooperative fund transfers, and eKYM updates anywhere.',
    subtitleNp:
      'घरमै बसी मोबाइल बैंकिङ, क्युआर भुक्तानी, अन्तरसहकारी रकम स्थानान्तरण र eKYM अध्यावधिक।',
    imageUrl: '/uploads/media/slide-digital.svg',
    ctaTextEn: 'Digital Banking',
    ctaTextNp: 'डिजिटल बैंकिङ',
    ctaLink: '#digital',
    sortOrder: 5,
  },
];

interface AdminPortalProps {
  lang: Language;
  user: AuthUser;
  onLogout: () => void;
  onExitToWebsite: () => void;
  onSwitchToMember: () => void;
  cmsSettings?: SiteSettingsCMS;
  onUpdateCmsSettings?: (newSettings: Partial<SiteSettingsCMS>) => void;
  slides?: SlideCMS[];
  onUpdateSlides?: (newSlides: SlideCMS[]) => void;
  services?: ServiceItem[];
  onUpdateServices?: (newServices: ServiceItem[]) => void;
  rates?: InterestRate[];
  onUpdateRates?: (newRates: InterestRate[]) => void;
  notices?: NoticeItem[];
  onUpdateNotices?: (newNotices: NoticeItem[]) => void;
  gallery?: GalleryItem[];
  onUpdateGallery?: (newGallery: GalleryItem[]) => void;
  team?: TeamMemberCMS[];
  onUpdateTeam?: (newTeam: TeamMemberCMS[]) => void;
  cmsPages?: CmsPagesState;
  onUpdateCmsPages?: (newPages: CmsPagesState) => void;
  departments?: DepartmentCMS[];
  onUpdateDepartments?: (newDepartments: DepartmentCMS[]) => void;
  serviceCenters?: ServiceCenterCMS[];
  onUpdateServiceCenters?: (newCenters: ServiceCenterCMS[]) => void;
  reports?: ReportCMS[];
  onUpdateReports?: (newReports: ReportCMS[]) => void;
  careers?: CareerCMS[];
  onUpdateCareers?: (newCareers: CareerCMS[]) => void;
  headOffice?: HeadOfficeInfoCMS | null;
  onUpdateHeadOffice?: (newInfo: HeadOfficeInfoCMS) => void;
  grievances?: GrievanceRecordCMS[] | null;
  onUpdateGrievances?: (records: GrievanceRecordCMS[]) => void;
  grievanceOfficer?: GrievanceOfficerCMS | null;
  onUpdateGrievanceOfficer?: (officer: GrievanceOfficerCMS) => void;
  privacyPolicy?: PrivacyPolicyCMS | null;
  onUpdatePrivacyPolicy?: (policy: PrivacyPolicyCMS) => void;
  socialLinks?: SocialLinksCMS | null;
  onUpdateSocialLinks?: (links: SocialLinksCMS) => void;
  brandTheme?: BrandThemeCMS | null;
  onUpdateBrandTheme?: (theme: BrandThemeCMS) => void;
  documents?: DocumentItemCMS[];
  onUpdateDocuments?: (docs: DocumentItemCMS[]) => void;
  newsActivities?: NewsActivityItemCMS[];
  onUpdateNewsActivities?: (items: NewsActivityItemCMS[]) => void;
  suggestions?: SuggestionItemCMS[];
  onUpdateSuggestions?: (items: SuggestionItemCMS[]) => void;
  faqs?: FaqItemCMS[];
  onUpdateFaqs?: (items: FaqItemCMS[]) => void;
  historyMilestones?: HistoryMilestonesPageCMS;
  onUpdateHistoryMilestones?: (data: HistoryMilestonesPageCMS) => void;
  whyChooseUs?: WhyChooseUsPageCMS;
  onUpdateWhyChooseUs?: (data: WhyChooseUsPageCMS) => void;
  exchangeRates?: ExchangeRateItemCMS[];
  onUpdateExchangeRates?: (rates: ExchangeRateItemCMS[]) => void;
  institutionalProfiles?: InstitutionalProfileItemCMS[];
  onUpdateInstitutionalProfiles?: (profiles: InstitutionalProfileItemCMS[]) => void;
  monthlyReports?: MonthlyFinancialReportCMS[];
  onUpdateMonthlyReports?: (reports: MonthlyFinancialReportCMS[]) => void;
  leadershipMembers?: LeadershipMemberCMS[];
  onUpdateLeadershipMembers?: (members: LeadershipMemberCMS[]) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  lang,
  user,
  onLogout,
  onExitToWebsite,
  onSwitchToMember,
  cmsSettings = DEFAULT_CMS_SETTINGS,
  onUpdateCmsSettings,
  slides = DEFAULT_CMS_SLIDES,
  onUpdateSlides,
  services = SERVICES_DATA,
  onUpdateServices,
  rates = INTEREST_RATES,
  onUpdateRates,
  notices = NOTICES_DATA,
  onUpdateNotices,
  gallery = GALLERY_ITEMS,
  onUpdateGallery,
  team = DEFAULT_TEAM_MEMBERS,
  onUpdateTeam,
  cmsPages = INITIAL_CMS_PAGES,
  onUpdateCmsPages,
  departments = INITIAL_CMS_DEPARTMENTS,
  onUpdateDepartments,
  serviceCenters = INITIAL_CMS_SERVICE_CENTERS,
  onUpdateServiceCenters,
  reports = INITIAL_CMS_REPORTS,
  onUpdateReports,
  careers = INITIAL_CMS_CAREERS,
  onUpdateCareers,
  headOffice = INITIAL_CMS_HEAD_OFFICE,
  onUpdateHeadOffice,
  grievances = null,
  onUpdateGrievances,
  grievanceOfficer = null,
  onUpdateGrievanceOfficer,
  privacyPolicy = INITIAL_CMS_PRIVACY_POLICY,
  onUpdatePrivacyPolicy,
  socialLinks = INITIAL_CMS_SOCIAL_LINKS,
  onUpdateSocialLinks,
  brandTheme = INITIAL_CMS_BRAND_THEME,
  onUpdateBrandTheme,
  documents = INITIAL_CMS_DOCUMENTS,
  onUpdateDocuments,
  newsActivities = INITIAL_CMS_NEWS_ACTIVITIES,
  onUpdateNewsActivities,
  suggestions = INITIAL_CMS_SUGGESTIONS,
  onUpdateSuggestions,
  faqs = INITIAL_CMS_FAQS,
  onUpdateFaqs,
  historyMilestones = INITIAL_CMS_HISTORY_MILESTONES,
  onUpdateHistoryMilestones,
  whyChooseUs = INITIAL_CMS_WHY_CHOOSE_US,
  onUpdateWhyChooseUs,
  exchangeRates = INITIAL_CMS_EXCHANGE_RATES,
  onUpdateExchangeRates,
  institutionalProfiles = INITIAL_CMS_INSTITUTIONAL_PROFILES,
  onUpdateInstitutionalProfiles,
  monthlyReports = INITIAL_MONTHLY_FINANCIAL_REPORTS,
  onUpdateMonthlyReports,
  leadershipMembers = INITIAL_CMS_LEADERSHIP_MEMBERS,
  onUpdateLeadershipMembers,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'frontend-cms'
    | 'cms-logo'
    | 'cms-services'
    | 'cms-digital-services'
    | 'cms-profile'
    | 'cms-institutional-profile'
    | 'cms-history'
    | 'cms-why-choose-us'
    | 'cms-departments'
    | 'cms-branches'
    | 'cms-reports'
    | 'cms-careers'
    | 'cms-leadership'
    | 'cms-team'
    | 'cms-management'
    | 'cms-headoffice'
    | 'cms-grievances'
    | 'cms-privacy'
    | 'cms-social'
    | 'cms-theme'
    | 'cms-documents'
    | 'cms-news'
    | 'cms-suggestions'
    | 'cms-faqs'
    | 'ekym'
    | 'loans'
    | 'members'
    | 'rates'
    | 'exchange-rates'
    | 'notices'
    | 'accounting'
    | 'dividend'
    | 'audit-logs'
    | 'php-system'
  >('dashboard');

  // Sub-tabs for Frontend CMS
  const [cmsSubTab, setCmsSubTab] = useState<
    | 'general'
    | 'logo'
    | 'slides'
    | 'profile'
    | 'institutional-profile'
    | 'history'
    | 'why-choose-us'
    | 'departments'
    | 'branches'
    | 'headoffice'
    | 'grievances'
    | 'privacy'
    | 'social'
    | 'theme'
    | 'documents'
    | 'news'
    | 'suggestions'
    | 'faqs'
    | 'reports'
    | 'careers'
    | 'leadership'
    | 'media'
    | 'stats'
    | 'services'
    | 'gallery'
    | 'team'
    | 'management'
    | 'exchange-rates'
  >('general');

  const { isPreetiMode, togglePreetiMode, openKeyboardGuide, openConverter } = usePreetiTyping();

  const normalizeTeamProp = (raw: any): TeamMemberCMS[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray(raw.team)) return raw.team;
    return DEFAULT_TEAM_MEMBERS;
  };

  // Local state initialized with props
  const [localSettings, setLocalSettings] = useState<SiteSettingsCMS>(cmsSettings || DEFAULT_CMS_SETTINGS);
  const [localSlides, setLocalSlides] = useState<SlideCMS[]>(Array.isArray(slides) ? slides : DEFAULT_CMS_SLIDES);
  const [localServices, setLocalServices] = useState<ServiceItem[]>(Array.isArray(services) ? services : SERVICES_DATA);
  const [localRates, setLocalRates] = useState<InterestRate[]>(Array.isArray(rates) ? rates : INTEREST_RATES);
  const [localNotices, setLocalNotices] = useState<NoticeItem[]>(Array.isArray(notices) ? notices : NOTICES_DATA);
  const [localGallery, setLocalGallery] = useState<GalleryItem[]>(Array.isArray(gallery) ? gallery : GALLERY_ITEMS);
  const [localTeam, setLocalTeam] = useState<TeamMemberCMS[]>(() => normalizeTeamProp(team));
  const [localCmsPages, setLocalCmsPages] = useState<CmsPagesState>(cmsPages || INITIAL_CMS_PAGES);
  const [localDepartments, setLocalDepartments] = useState<DepartmentCMS[]>(
    Array.isArray(departments) ? departments : INITIAL_CMS_DEPARTMENTS
  );
  const [localServiceCenters, setLocalServiceCenters] = useState<ServiceCenterCMS[]>(
    Array.isArray(serviceCenters) ? serviceCenters : INITIAL_CMS_SERVICE_CENTERS
  );
  const [localReports, setLocalReports] = useState<ReportCMS[]>(
    Array.isArray(reports) ? reports : INITIAL_CMS_REPORTS
  );
  const [localCareers, setLocalCareers] = useState<CareerCMS[]>(
    Array.isArray(careers) ? careers : INITIAL_CMS_CAREERS
  );
  const [localHeadOffice, setLocalHeadOffice] = useState<HeadOfficeInfoCMS>(
    headOffice || INITIAL_CMS_HEAD_OFFICE
  );
  const [localGrievances, setLocalGrievances] = useState<GrievanceRecordCMS[] | null>(grievances);
  const [localGrievanceOfficer, setLocalGrievanceOfficer] = useState<GrievanceOfficerCMS | null>(grievanceOfficer);
  const [localPrivacyPolicy, setLocalPrivacyPolicy] = useState<PrivacyPolicyCMS>(privacyPolicy || INITIAL_CMS_PRIVACY_POLICY);
  const [localSocialLinks, setLocalSocialLinks] = useState<SocialLinksCMS>(socialLinks || INITIAL_CMS_SOCIAL_LINKS);
  const [localBrandTheme, setLocalBrandTheme] = useState<BrandThemeCMS>(brandTheme || INITIAL_CMS_BRAND_THEME);
  const [localDocuments, setLocalDocuments] = useState<DocumentItemCMS[]>(documents || INITIAL_CMS_DOCUMENTS);
  const [localNewsActivities, setLocalNewsActivities] = useState<NewsActivityItemCMS[]>(newsActivities || INITIAL_CMS_NEWS_ACTIVITIES);
  const [localSuggestions, setLocalSuggestions] = useState<SuggestionItemCMS[]>(suggestions || INITIAL_CMS_SUGGESTIONS);
  const [localFaqs, setLocalFaqs] = useState<FaqItemCMS[]>(faqs || INITIAL_CMS_FAQS);
  const [localHistoryMilestones, setLocalHistoryMilestones] = useState<HistoryMilestonesPageCMS>(
    historyMilestones || INITIAL_CMS_HISTORY_MILESTONES
  );
  const [localWhyChooseUs, setLocalWhyChooseUs] = useState<WhyChooseUsPageCMS>(
    whyChooseUs || INITIAL_CMS_WHY_CHOOSE_US
  );
  const [localExchangeRates, setLocalExchangeRates] = useState<ExchangeRateItemCMS[]>(
    exchangeRates || INITIAL_CMS_EXCHANGE_RATES
  );
  const [localInstitutionalProfiles, setLocalInstitutionalProfiles] = useState<InstitutionalProfileItemCMS[]>(
    institutionalProfiles || INITIAL_CMS_INSTITUTIONAL_PROFILES
  );
  const [localMonthlyReports, setLocalMonthlyReports] = useState<MonthlyFinancialReportCMS[]>(
    monthlyReports || INITIAL_MONTHLY_FINANCIAL_REPORTS
  );
  const [localLeadershipMembers, setLocalLeadershipMembers] = useState<LeadershipMemberCMS[]>(
    Array.isArray(leadershipMembers) ? leadershipMembers : INITIAL_CMS_LEADERSHIP_MEMBERS
  );

  // Synchronize local CMS state whenever parent props update (e.g. on backend fetch)
  useEffect(() => {
    if (monthlyReports && monthlyReports.length > 0) {
      setLocalMonthlyReports(monthlyReports);
    }
  }, [monthlyReports]);

  useEffect(() => {
    if (leadershipMembers && leadershipMembers.length > 0) {
      setLocalLeadershipMembers(leadershipMembers);
    }
  }, [leadershipMembers]);

  useEffect(() => {
    if (rates && rates.length > 0) setLocalRates(rates);
  }, [rates]);

  useEffect(() => {
    if (headOffice) setLocalHeadOffice(headOffice);
  }, [headOffice]);

  useEffect(() => {
    if (grievances) setLocalGrievances(grievances);
  }, [grievances]);

  useEffect(() => {
    if (grievanceOfficer) setLocalGrievanceOfficer(grievanceOfficer);
  }, [grievanceOfficer]);

  useEffect(() => {
    if (privacyPolicy) setLocalPrivacyPolicy(privacyPolicy);
  }, [privacyPolicy]);

  useEffect(() => {
    if (socialLinks) setLocalSocialLinks(socialLinks);
  }, [socialLinks]);

  useEffect(() => {
    if (brandTheme) setLocalBrandTheme(brandTheme);
  }, [brandTheme]);

  useEffect(() => {
    if (documents) setLocalDocuments(documents);
  }, [documents]);

  useEffect(() => {
    if (newsActivities) setLocalNewsActivities(newsActivities);
  }, [newsActivities]);

  useEffect(() => {
    if (suggestions) setLocalSuggestions(suggestions);
  }, [suggestions]);

  useEffect(() => {
    if (faqs) setLocalFaqs(faqs);
  }, [faqs]);

  useEffect(() => {
    if (historyMilestones) setLocalHistoryMilestones(historyMilestones);
  }, [historyMilestones]);

  useEffect(() => {
    if (whyChooseUs) setLocalWhyChooseUs(whyChooseUs);
  }, [whyChooseUs]);

  useEffect(() => {
    if (exchangeRates && exchangeRates.length > 0) setLocalExchangeRates(exchangeRates);
  }, [exchangeRates]);

  useEffect(() => {
    if (institutionalProfiles && institutionalProfiles.length > 0) setLocalInstitutionalProfiles(institutionalProfiles);
  }, [institutionalProfiles]);

  // Synchronize local CMS state whenever parent props update (e.g. on backend fetch)
  useEffect(() => {
    if (cmsSettings) {
      setLocalSettings((prev) => ({
        ...prev,
        ...cmsSettings,
        coopLogoUrl: cmsSettings.coopLogoUrl || prev.coopLogoUrl,
      }));
    }
  }, [cmsSettings]);

  // Fetch latest site settings (including active official logo) directly from MySQL on AdminPortal mount
  useEffect(() => {
    let mounted = true;
    fetchSiteSettings()
      .then((dbSettings) => {
        if (mounted && dbSettings && Object.keys(dbSettings).length > 0) {
          setLocalSettings((prev) => ({
            ...prev,
            ...dbSettings,
            coopLogoUrl: dbSettings.coopLogoUrl || prev.coopLogoUrl,
          }));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (cmsPages) setLocalCmsPages(cmsPages);
  }, [cmsPages]);

  useEffect(() => {
    if (departments) setLocalDepartments(departments);
  }, [departments]);

  useEffect(() => {
    if (serviceCenters) setLocalServiceCenters(serviceCenters);
  }, [serviceCenters]);

  useEffect(() => {
    if (reports) setLocalReports(reports);
  }, [reports]);

  useEffect(() => {
    if (careers) setLocalCareers(careers);
  }, [careers]);

  const handleSaveServices = async (updated: ServiceItem[]) => {
    setLocalServices(updated);
    if (onUpdateServices) onUpdateServices(updated);
    try {
      await saveCmsServices(updated);
      triggerToast('Services & scheme cards saved to database successfully!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveCmsPages = async (updated: CmsPagesState) => {
    setLocalCmsPages(updated);
    if (onUpdateCmsPages) onUpdateCmsPages(updated);
    try {
      await saveCmsPages(updated);
      triggerToast('Organization profile & leadership messages saved successfully!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveDepartments = async (updated: DepartmentCMS[]) => {
    setLocalDepartments(updated);
    if (onUpdateDepartments) onUpdateDepartments(updated);
    try {
      await saveCmsDepartments(updated);
      triggerToast('Department divisions saved and updated in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveServiceCenters = async (updated: ServiceCenterCMS[]) => {
    setLocalServiceCenters(updated);
    if (onUpdateServiceCenters) onUpdateServiceCenters(updated);
    try {
      await saveCmsServiceCenters(updated);
      triggerToast('Service centers and branch network updated in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveReports = async (updated: ReportCMS[]) => {
    setLocalReports(updated);
    if (onUpdateReports) onUpdateReports(updated);
    try {
      await saveCmsReports(updated);
      triggerToast('Reports & publications catalog saved in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveCareers = async (updated: CareerCMS[]) => {
    setLocalCareers(updated);
    if (onUpdateCareers) onUpdateCareers(updated);
    try {
      await saveCmsCareers(updated);
      triggerToast('Careers and vacancy listings saved in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveHeadOffice = async (updated: HeadOfficeInfoCMS): Promise<boolean> => {
    setLocalHeadOffice(updated);
    if (onUpdateHeadOffice) onUpdateHeadOffice(updated);

    const syncedSettings: SiteSettingsCMS = {
      ...localSettings,
      addressEn: updated.addressEn || localSettings.addressEn,
      addressNp: updated.addressNp || localSettings.addressNp,
      provinceEn: updated.province || localSettings.provinceEn,
      districtEn: updated.district || localSettings.districtEn,
      municipalityEn: updated.city || localSettings.municipalityEn,
      wardNo: updated.ward || localSettings.wardNo,
      phone: updated.primaryPhone || localSettings.phone,
      altPhone: updated.altPhone ?? localSettings.altPhone,
      tollFree: updated.tollFreePhone ?? localSettings.tollFree,
      email: updated.officialEmail || localSettings.email,
      regdNo: updated.regNumber || localSettings.regdNo,
      panNo: updated.panNumber || localSettings.panNo,
      establishedYear: updated.establishedDate || localSettings.establishedYear,
      mapsEmbedUrl: updated.googleMapEmbedUrl ?? localSettings.mapsEmbedUrl,
      officeHours: updated.sunToThuHoursEn || localSettings.officeHours,
    };
    setLocalSettings(syncedSettings);

    try {
      const ok = await saveCmsHeadOffice(updated);
      if (ok) {
        triggerToast('Head Office Information saved permanently in MySQL database!');
        return true;
      } else {
        triggerToast('Failed to save Head Office Information to database.');
        return false;
      }
    } catch (e: any) {
      triggerToast(`Database error: ${e.message}`);
      return false;
    }
  };

  const handleSaveGrievances = async (updated: GrievanceRecordCMS[]) => {
    setLocalGrievances(updated);
    if (onUpdateGrievances) onUpdateGrievances(updated);
    try {
      await saveCmsGrievances(updated);
      triggerToast('Grievance records updated in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveGrievanceOfficer = async (updated: GrievanceOfficerCMS) => {
    setLocalGrievanceOfficer(updated);
    if (onUpdateGrievanceOfficer) onUpdateGrievanceOfficer(updated);
    try {
      await saveCmsGrievanceOfficer(updated);
      triggerToast('Grievance officer information updated in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSavePrivacyPolicy = async (updated: PrivacyPolicyCMS) => {
    setLocalPrivacyPolicy(updated);
    if (onUpdatePrivacyPolicy) onUpdatePrivacyPolicy(updated);
    try {
      await saveCmsPrivacyPolicy(updated);
      triggerToast('Privacy policy saved and published to website!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveSocialLinks = async (updated: SocialLinksCMS) => {
    setLocalSocialLinks(updated);
    if (onUpdateSocialLinks) onUpdateSocialLinks(updated);
    try {
      await saveCmsSocialLinks(updated);
      triggerToast('Social media links saved and updated on website!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveBrandTheme = async (updated: BrandThemeCMS) => {
    setLocalBrandTheme(updated);
    if (onUpdateBrandTheme) onUpdateBrandTheme(updated);
    try {
      await saveCmsBrandTheme(updated);
      triggerToast('Website brand colors saved and applied!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveDocuments = async (updated: DocumentItemCMS[]) => {
    setLocalDocuments(updated);
    if (onUpdateDocuments) onUpdateDocuments(updated);
    try {
      await saveCmsDocuments(updated);
      triggerToast('Downloads & forms vault updated in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveNewsActivities = async (updated: NewsActivityItemCMS[]) => {
    setLocalNewsActivities(updated);
    if (onUpdateNewsActivities) onUpdateNewsActivities(updated);
    try {
      await saveCmsNewsActivities(updated);
      triggerToast('News & Activities saved and published to website!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveSuggestions = async (updated: SuggestionItemCMS[]) => {
    setLocalSuggestions(updated);
    if (onUpdateSuggestions) onUpdateSuggestions(updated);
    try {
      await saveCmsSuggestions(updated);
      triggerToast('Suggestion Box records updated in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveFaqs = async (updated: FaqItemCMS[]) => {
    setLocalFaqs(updated);
    if (onUpdateFaqs) onUpdateFaqs(updated);
    try {
      await saveCmsFaqs(updated);
      triggerToast('Frequently Asked Questions (FAQs) saved to database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveHistoryMilestones = async (updated: HistoryMilestonesPageCMS) => {
    setLocalHistoryMilestones(updated);
    if (onUpdateHistoryMilestones) onUpdateHistoryMilestones(updated);
    try {
      await saveCmsHistoryMilestones(updated);
      triggerToast('History & Milestones updated and saved in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveWhyChooseUs = async (updated: WhyChooseUsPageCMS) => {
    setLocalWhyChooseUs(updated);
    if (onUpdateWhyChooseUs) onUpdateWhyChooseUs(updated);
    try {
      await saveCmsWhyChooseUs(updated);
      triggerToast('Why Choose Us pillars & stats saved to database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveExchangeRates = async (updated: ExchangeRateItemCMS[]) => {
    setLocalExchangeRates(updated);
    if (onUpdateExchangeRates) onUpdateExchangeRates(updated);
    try {
      await saveCmsExchangeRates(updated);
      triggerToast('Foreign Exchange Rates saved to database (INR fixed per NRB peg)!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveInstitutionalProfiles = async (updated: InstitutionalProfileItemCMS[]) => {
    setLocalInstitutionalProfiles(updated);
    if (onUpdateInstitutionalProfiles) onUpdateInstitutionalProfiles(updated);
    try {
      await saveCmsInstitutionalProfiles(updated);
      triggerToast('Institutional Profile records saved to database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveMonthlyReports = async (updated: MonthlyFinancialReportCMS[]) => {
    setLocalMonthlyReports(updated);
    if (onUpdateMonthlyReports) onUpdateMonthlyReports(updated);
    try {
      await saveCmsMonthlyFinancialReports(updated);
      triggerToast('मासिक संस्थागत वित्तीय विवरण MySQL डाटाबेसमा सुरक्षित भयो!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  const handleSaveTeam = async (updated: TeamMemberCMS[]) => {
    setLocalTeam(updated);
    if (onUpdateTeam) onUpdateTeam(updated);
    try {
      await saveCmsTeam(updated);
      triggerToast('Board of Directors & Management team saved in database!');
    } catch (e: any) {
      triggerToast(`Saved locally: ${e.message}`);
    }
  };

  useEffect(() => {
    if (Array.isArray(slides)) setLocalSlides(slides);
  }, [slides]);

  useEffect(() => {
    if (Array.isArray(services)) setLocalServices(services);
  }, [services]);

  useEffect(() => {
    if (Array.isArray(rates)) setLocalRates(rates);
  }, [rates]);

  useEffect(() => {
    if (Array.isArray(notices)) setLocalNotices(notices);
  }, [notices]);

  useEffect(() => {
    if (Array.isArray(gallery)) setLocalGallery(gallery);
  }, [gallery]);

  useEffect(() => {
    if (team) setLocalTeam(normalizeTeamProp(team));
  }, [team]);

  const handleResetAllFrontendCms = async () => {
    const preservedLogoSettings = { ...DEFAULT_CMS_SETTINGS, coopLogoUrl: localSettings.coopLogoUrl };
    setLocalSettings(preservedLogoSettings);
    setLocalSlides(DEFAULT_CMS_SLIDES);
    setLocalServices(SERVICES_DATA);
    setLocalGallery(GALLERY_ITEMS);
    setLocalTeam(DEFAULT_TEAM_MEMBERS);
    setLocalCmsPages(INITIAL_CMS_PAGES);
    setLocalDepartments(INITIAL_CMS_DEPARTMENTS);
    setLocalServiceCenters(INITIAL_CMS_SERVICE_CENTERS);
    setLocalReports(INITIAL_CMS_REPORTS);
    setLocalCareers(INITIAL_CMS_CAREERS);
    setLocalPrivacyPolicy(INITIAL_CMS_PRIVACY_POLICY);
    setLocalSocialLinks(INITIAL_CMS_SOCIAL_LINKS);
    setLocalBrandTheme(INITIAL_CMS_BRAND_THEME);
    setLocalDocuments(INITIAL_CMS_DOCUMENTS);
    setLocalNewsActivities(INITIAL_CMS_NEWS_ACTIVITIES);
    setLocalSuggestions(INITIAL_CMS_SUGGESTIONS);
    setLocalFaqs(INITIAL_CMS_FAQS);
    setLocalHistoryMilestones(INITIAL_CMS_HISTORY_MILESTONES);
    setLocalWhyChooseUs(INITIAL_CMS_WHY_CHOOSE_US);
    setLocalExchangeRates(INITIAL_CMS_EXCHANGE_RATES);
    setLocalInstitutionalProfiles(INITIAL_CMS_INSTITUTIONAL_PROFILES);

    if (onUpdateCmsSettings) onUpdateCmsSettings(preservedLogoSettings);
    if (onUpdateSlides) onUpdateSlides(DEFAULT_CMS_SLIDES);
    if (onUpdateServices) onUpdateServices(SERVICES_DATA);
    if (onUpdateGallery) onUpdateGallery(GALLERY_ITEMS);
    if (onUpdateTeam) onUpdateTeam(DEFAULT_TEAM_MEMBERS);
    if (onUpdateCmsPages) onUpdateCmsPages(INITIAL_CMS_PAGES);
    if (onUpdateDepartments) onUpdateDepartments(INITIAL_CMS_DEPARTMENTS);
    if (onUpdateServiceCenters) onUpdateServiceCenters(INITIAL_CMS_SERVICE_CENTERS);
    if (onUpdateReports) onUpdateReports(INITIAL_CMS_REPORTS);
    if (onUpdateCareers) onUpdateCareers(INITIAL_CMS_CAREERS);
    if (onUpdatePrivacyPolicy) onUpdatePrivacyPolicy(INITIAL_CMS_PRIVACY_POLICY);
    if (onUpdateSocialLinks) onUpdateSocialLinks(INITIAL_CMS_SOCIAL_LINKS);
    if (onUpdateBrandTheme) onUpdateBrandTheme(INITIAL_CMS_BRAND_THEME);
    if (onUpdateDocuments) onUpdateDocuments(INITIAL_CMS_DOCUMENTS);
    if (onUpdateNewsActivities) onUpdateNewsActivities(INITIAL_CMS_NEWS_ACTIVITIES);
    if (onUpdateSuggestions) onUpdateSuggestions(INITIAL_CMS_SUGGESTIONS);
    if (onUpdateFaqs) onUpdateFaqs(INITIAL_CMS_FAQS);
    if (onUpdateHistoryMilestones) onUpdateHistoryMilestones(INITIAL_CMS_HISTORY_MILESTONES);
    if (onUpdateWhyChooseUs) onUpdateWhyChooseUs(INITIAL_CMS_WHY_CHOOSE_US);
    if (onUpdateExchangeRates) onUpdateExchangeRates(INITIAL_CMS_EXCHANGE_RATES);
    if (onUpdateInstitutionalProfiles) onUpdateInstitutionalProfiles(INITIAL_CMS_INSTITUTIONAL_PROFILES);

    try {
      await Promise.all([
        saveCmsSlides(DEFAULT_CMS_SLIDES),
        saveCmsServices(SERVICES_DATA),
        saveCmsGallery(GALLERY_ITEMS),
        saveCmsTeam(DEFAULT_TEAM_MEMBERS),
        saveCmsPages(INITIAL_CMS_PAGES),
        saveCmsDepartments(INITIAL_CMS_DEPARTMENTS),
        saveCmsServiceCenters(INITIAL_CMS_SERVICE_CENTERS),
        saveCmsReports(INITIAL_CMS_REPORTS),
        saveCmsCareers(INITIAL_CMS_CAREERS),
        saveCmsPrivacyPolicy(INITIAL_CMS_PRIVACY_POLICY),
        saveCmsSocialLinks(INITIAL_CMS_SOCIAL_LINKS),
        saveCmsBrandTheme(INITIAL_CMS_BRAND_THEME),
        saveCmsDocuments(INITIAL_CMS_DOCUMENTS),
        saveCmsNewsActivities(INITIAL_CMS_NEWS_ACTIVITIES),
        saveCmsSuggestions(INITIAL_CMS_SUGGESTIONS),
        saveCmsFaqs(INITIAL_CMS_FAQS),
        saveCmsHistoryMilestones(INITIAL_CMS_HISTORY_MILESTONES),
        saveCmsWhyChooseUs(INITIAL_CMS_WHY_CHOOSE_US),
        saveCmsExchangeRates(INITIAL_CMS_EXCHANGE_RATES),
        saveCmsInstitutionalProfiles(INITIAL_CMS_INSTITUTIONAL_PROFILES),
      ]);
      triggerToast('Frontend Website CMS has been reset to official default values and synchronized with the database!');
    } catch (e: any) {
      triggerToast('Frontend Website CMS reset to default values!');
    }
  };

  // Operational State
  const [ekymList, setEkymList] = useState<EkymRecord[]>(INITIAL_EKYM_RECORDS);
  const [ekymLoading, setEkymLoading] = useState<boolean>(false);
  const [ekymError, setEkymError] = useState<string | null>(null);
  const [ekymFilter, setEkymFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Returned'>('All');
  const [ekymSearchQuery, setEkymSearchQuery] = useState<string>('');
  const [selectedEkym, setSelectedEkym] = useState<EkymRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  // Quick Action / Remarks Dialog
  const [remarksDialog, setRemarksDialog] = useState<{
    isOpen: boolean;
    record: EkymRecord | null;
    status: 'Approved' | 'Rejected' | 'Returned';
    remarks: string;
  }>({
    isOpen: false,
    record: null,
    status: 'Approved',
    remarks: '',
  });

  const [loanList, setLoanList] = useState<LoanRecord[]>(INITIAL_LOAN_RECORDS);
  const [loanLoading, setLoanLoading] = useState<boolean>(false);
  const [memberList, setMemberList] = useState<MemberRecord[]>(INITIAL_MEMBERS);

  // Load eKYM applications directly from SQLite database
  const loadEkymData = async () => {
    setEkymLoading(true);
    setEkymError(null);
    try {
      const data = await fetchEkymApplications();
      setEkymList(data);
    } catch (err: any) {
      console.error('Failed to load eKYM applications from database:', err);
      setEkymError(err?.message || 'Database connection error');
    } finally {
      setEkymLoading(false);
    }
  };

  // Load Loan applications directly from database
  const loadLoanData = async () => {
    setLoanLoading(true);
    try {
      const data = await fetchLoanApplications();
      if (Array.isArray(data) && data.length > 0) {
        setLoanList(data);
      }
    } catch (err: any) {
      console.error('Failed to load loan applications from database:', err);
    } finally {
      setLoanLoading(false);
    }
  };

  useEffect(() => {
    loadEkymData();
    loadLoanData();
    fetchAllCmsData()
      .then((all) => {
        if (all.headOffice) {
          setLocalHeadOffice(all.headOffice);
          if (onUpdateHeadOffice) onUpdateHeadOffice(all.headOffice);
        }
        if (all.members && Array.isArray(all.members) && all.members.length > 0) {
          setMemberList(all.members);
        }
        if (all.auditLogs && Array.isArray(all.auditLogs) && all.auditLogs.length > 0) {
          setAuditLogs(all.auditLogs);
        }
      })
      .catch(() => {});
  }, []);

  // Popup Notices MySQL State
  const [noticeSubTab, setNoticeSubTab] = useState<'popup-mysql' | 'board'>('popup-mysql');
  const [popupNoticesList, setPopupNoticesList] = useState<PopupNoticeItem[]>([]);
  const [popupLoading, setPopupLoading] = useState<boolean>(false);
  const [popupSaving, setPopupSaving] = useState<boolean>(false);
  const [popupTitleEn, setPopupTitleEn] = useState<string>('');
  const [popupTitleNp, setPopupTitleNp] = useState<string>('');
  const [popupCategoryEn, setPopupCategoryEn] = useState<string>('Important Announcement');
  const [popupCategoryNp, setPopupCategoryNp] = useState<string>('महत्वपूर्ण सूचना');
  const [popupContentEn, setPopupContentEn] = useState<string>('');
  const [popupContentNp, setPopupContentNp] = useState<string>('');
  const [popupBulletsEn, setPopupBulletsEn] = useState<string>('');
  const [popupBulletsNp, setPopupBulletsNp] = useState<string>('');
  const [popupNoticeRef, setPopupNoticeRef] = useState<string>('सूचना नं. ०६/२०८३-८४');
  const [popupImageUrl, setPopupImageUrl] = useState<string>('/uploads/media/notice-agm.svg');
  const [popupActionTextEn, setPopupActionTextEn] = useState<string>('Learn More');
  const [popupActionTextNp, setPopupActionTextNp] = useState<string>('थप जानकारी');
  const [popupActionLink, setPopupActionLink] = useState<string>('#rates');

  const loadPopupNoticesFromDb = async () => {
    setPopupLoading(true);
    try {
      const data = await fetchPopupNotices(true);
      setPopupNoticesList(data);
    } catch (e) {
      console.warn('Failed to load popup notices:', e);
    } finally {
      setPopupLoading(false);
    }
  };

  useEffect(() => {
    loadPopupNoticesFromDb();
  }, []);

  const handleCreatePopupNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popupTitleEn.trim() || !popupContentEn.trim()) {
      triggerToast('Please fill title and content for the popup notice.');
      return;
    }
    setPopupSaving(true);
    try {
      const bulletsEn = popupBulletsEn
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const bulletsNp = popupBulletsNp
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const saved = await savePopupNotice({
        titleEn: popupTitleEn.trim(),
        titleNp: popupTitleNp.trim() || popupTitleEn.trim(),
        categoryEn: popupCategoryEn.trim(),
        categoryNp: popupCategoryNp.trim(),
        contentEn: popupContentEn.trim(),
        contentNp: popupContentNp.trim() || popupContentEn.trim(),
        bulletPointsEn: bulletsEn.length > 0 ? bulletsEn : undefined,
        bulletPointsNp: bulletsNp.length > 0 ? bulletsNp : undefined,
        noticeRef: popupNoticeRef.trim(),
        imageUrl: popupImageUrl.trim(),
        actionTextEn: popupActionTextEn.trim(),
        actionTextNp: popupActionTextNp.trim(),
        actionLink: popupActionLink.trim(),
        active: true,
      });

      if (saved) {
        triggerToast('Website entry popup notice saved directly to MySQL database!');
        setPopupTitleEn('');
        setPopupTitleNp('');
        setPopupContentEn('');
        setPopupContentNp('');
        setPopupBulletsEn('');
        setPopupBulletsNp('');
        await loadPopupNoticesFromDb();
      } else {
        triggerToast('Failed to save popup notice to MySQL database.');
      }
    } catch (err: any) {
      triggerToast('Error saving notice: ' + (err?.message || 'Database error'));
    } finally {
      setPopupSaving(false);
    }
  };

  const handleToggleNoticeActive = async (id: string) => {
    const success = await togglePopupNoticeStatus(id);
    if (success) {
      triggerToast('Notice active status updated in MySQL database.');
      await loadPopupNoticesFromDb();
    } else {
      triggerToast('Failed to update notice status in database.');
    }
  };

  const handleDeletePopupItem = async (id: string) => {
    const success = await deletePopupNotice(id);
    if (success) {
      triggerToast('Notice removed from MySQL database.');
      await loadPopupNoticesFromDb();
    } else {
      triggerToast('Failed to delete notice from database.');
    }
  };

  // Feedback banner
  const [toastMsg, setToastMsg] = useState<string>('');

  // Counter transaction state
  const [txMemberCode, setTxMemberCode] = useState('EK-10482');
  const [txType, setTxType] = useState<'Credit' | 'Debit'>('Credit');
  const [txAmount, setTxAmount] = useState('5000');
  const [txParticulars, setTxParticulars] = useState('Counter Cash Deposit');

  // Tracking uploading states for individual media items
  const [uploadingImageTarget, setUploadingImageTarget] = useState<string | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // New slide form
  const [newSlideTitleEn, setNewSlideTitleEn] = useState('');
  const [newSlideTitleNp, setNewSlideTitleNp] = useState('');
  const [newSlideSubtitleEn, setNewSlideSubtitleEn] = useState('');
  const [newSlideImg, setNewSlideImg] = useState('');

  // New notice form
  const [newNoticeTitleEn, setNewNoticeTitleEn] = useState('');
  const [newNoticeTitleNp, setNewNoticeTitleNp] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('AGM Notice');

  // New gallery form
  const [newPhotoTitleEn, setNewPhotoTitleEn] = useState('');
  const [newPhotoTitleNp, setNewPhotoTitleNp] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('General Meeting');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // New team member form
  const [newTeamNameEn, setNewTeamNameEn] = useState('');
  const [newTeamNameNp, setNewTeamNameNp] = useState('');
  const [newTeamRoleEn, setNewTeamRoleEn] = useState('');
  const [newTeamRoleNp, setNewTeamRoleNp] = useState('');
  const [newTeamCategory, setNewTeamCategory] = useState<'board' | 'management'>('board');
  const [newTeamPhone, setNewTeamPhone] = useState('');
  const [newTeamImageUrl, setNewTeamImageUrl] = useState('/uploads/media/team-ceo.svg');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // 1. CMS: Save General Settings
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCmsSettings) {
      onUpdateCmsSettings(localSettings);
    }
    try {
      if (localSettings.coopLogoUrl) {
        await saveWebsiteLogoUrl(localSettings.coopLogoUrl);
      }
      await updateSiteSettings(localSettings);
      triggerToast('General settings, official logo, address & establishment details updated and saved to database!');
    } catch (err: any) {
      triggerToast('General settings updated!');
    }
  };

  const handleInlineLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImageTarget('inline-logo');
    try {
      const newLogoUrl = await uploadWebsiteLogo(file);
      await saveWebsiteLogoUrl(newLogoUrl);
      const updated = { ...localSettings, coopLogoUrl: newLogoUrl };
      setLocalSettings(updated);
      if (onUpdateCmsSettings) onUpdateCmsSettings(updated);
      triggerToast('Official website logo uploaded and saved to database!');
    } catch (err: any) {
      triggerToast(`Logo upload error: ${err?.message || 'Failed to upload logo'}`);
    } finally {
      setUploadingImageTarget(null);
      e.target.value = '';
    }
  };

  const handleDeleteInlineLogo = async () => {
    setUploadingImageTarget('inline-logo');
    try {
      const resetLogoUrl = await deleteWebsiteLogo();
      const updated = { ...localSettings, coopLogoUrl: resetLogoUrl };
      setLocalSettings(updated);
      if (onUpdateCmsSettings) onUpdateCmsSettings(updated);
      triggerToast('Uploaded logo deleted from server and reset in MySQL database!');
    } catch (err: any) {
      triggerToast(`Error deleting logo: ${err?.message || 'Failed'}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  // 2. CMS: Banner Slide Handlers & Uploads
  const handleUpdateSlideField = (id: string, field: keyof SlideCMS, value: string | number) => {
    const updated = localSlides.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setLocalSlides(updated);
    if (onUpdateSlides) onUpdateSlides(updated);
    saveCmsSlides(updated).catch(() => {});
  };

  const handleUploadSlideImage = async (slideId: string, file: File) => {
    setUploadingImageTarget(`slide-${slideId}`);
    try {
      const existingSlide = localSlides.find((s) => s.id === slideId);
      const oldUrl = existingSlide?.imageUrl;
      const res = await uploadSingleMediaImage(file, 'banners', `slide-${slideId}`);
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== res.file.url) {
          await deleteMediaByPath(oldUrl);
        }
        const updated = localSlides.map((s) =>
          s.id === slideId ? { ...s, imageUrl: res.file!.url } : s
        );
        setLocalSlides(updated);
        if (onUpdateSlides) onUpdateSlides(updated);
        await saveCmsSlides(updated);
        triggerToast('Slide banner image uploaded and persisted to backend successfully!');
      } else {
        triggerToast(res.error || 'Failed to upload slide image');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleDeleteSlideImage = async (slideId: string) => {
    setUploadingImageTarget(`slide-${slideId}`);
    try {
      const existingSlide = localSlides.find((s) => s.id === slideId);
      if (existingSlide?.imageUrl && existingSlide.imageUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(existingSlide.imageUrl);
      }
      const updated = localSlides.map((s) =>
        s.id === slideId ? { ...s, imageUrl: '' } : s
      );
      setLocalSlides(updated);
      if (onUpdateSlides) onUpdateSlides(updated);
      await saveCmsSlides(updated);
      triggerToast('Slide background image deleted from server and MySQL database.');
    } catch (err: any) {
      triggerToast(`Delete error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleUploadNewSlideImage = async (file: File) => {
    setUploadingImageTarget('new-slide');
    try {
      const oldUrl = newSlideImg;
      const res = await uploadSingleMediaImage(file, 'banners', 'new-slide');
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== res.file.url) {
          await deleteMediaByPath(oldUrl);
        }
        setNewSlideImg(res.file.url);
        triggerToast('Slide image uploaded to server and ready!');
      } else {
        triggerToast(res.error || 'Failed to upload slide image');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleDeleteNewSlideImage = async () => {
    if (!newSlideImg) return;
    setUploadingImageTarget('new-slide');
    try {
      if (newSlideImg.startsWith('/uploads/')) {
        await deleteMediaByPath(newSlideImg);
      }
      setNewSlideImg('');
      triggerToast('Uploaded slide image removed from server.');
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitleEn.trim()) return;
    if (!newSlideImg) {
      triggerToast('Please upload a background banner image before publishing the slide.');
      return;
    }
    const newSlide: SlideCMS = {
      id: `slide-${Date.now()}`,
      titleEn: newSlideTitleEn,
      titleNp: newSlideTitleNp || newSlideTitleEn,
      subtitleEn: newSlideSubtitleEn,
      subtitleNp: newSlideSubtitleEn,
      imageUrl: newSlideImg,
      ctaTextEn: 'Explore Services',
      ctaTextNp: 'सेवाहरू हेर्नुहोस्',
      ctaLink: '#services',
      sortOrder: localSlides.length + 1,
    };
    const updated = [...localSlides, newSlide];
    setLocalSlides(updated);
    if (onUpdateSlides) onUpdateSlides(updated);
    await saveCmsSlides(updated);
    setNewSlideTitleEn('');
    setNewSlideTitleNp('');
    setNewSlideSubtitleEn('');
    setNewSlideImg('');
    triggerToast('New banner slide added and saved to backend database!');
  };

  const handleDeleteSlide = async (id: string) => {
    const target = localSlides.find((s) => s.id === id);
    if (target?.imageUrl && target.imageUrl.startsWith('/uploads/')) {
      await deleteMediaByPath(target.imageUrl);
    }
    const updated = localSlides.filter((s) => s.id !== id);
    setLocalSlides(updated);
    if (onUpdateSlides) onUpdateSlides(updated);
    await saveCmsSlides(updated);
    triggerToast('Slide removed and database updated.');
  };

  // 3. CMS: Services Handlers & Image Uploads
  const handleUpdateServiceField = (id: string, field: keyof ServiceItem, value: string) => {
    const updated = localServices.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setLocalServices(updated);
    if (onUpdateServices) onUpdateServices(updated);
  };

  const handleUploadServiceImage = async (serviceId: string, file: File) => {
    setUploadingImageTarget(`service-${serviceId}`);
    try {
      const res = await uploadSingleMediaImage(file, 'services', `service-${serviceId}`);
      if (res.success && res.file) {
        const updated = localServices.map((s) =>
          s.id === serviceId ? { ...s, imageUrl: res.file!.url } : s
        );
        setLocalServices(updated);
        if (onUpdateServices) onUpdateServices(updated);
        await saveCmsServices(updated);
        triggerToast('Service image uploaded and saved to backend database!');
      } else {
        triggerToast(res.error || 'Failed to upload service image');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleSaveAllServices = async () => {
    if (onUpdateServices) onUpdateServices(localServices);
    await saveCmsServices(localServices);
    triggerToast('All services saved to backend database successfully!');
  };

  // 4. CMS: Gallery Handlers & Image Uploads
  const handleUploadGalleryImage = async (photoId: string, file: File) => {
    setUploadingImageTarget(`gal-${photoId}`);
    try {
      const existingPhoto = localGallery.find((p) => p.id === photoId);
      const oldUrl = existingPhoto?.image;
      const res = await uploadSingleMediaImage(file, 'gallery', `gallery-${photoId}`);
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== res.file.url) {
          await deleteMediaByPath(oldUrl);
        }
        const updated = localGallery.map((p) =>
          p.id === photoId ? { ...p, image: res.file!.url } : p
        );
        setLocalGallery(updated);
        if (onUpdateGallery) onUpdateGallery(updated);
        await saveCmsGallery(updated);
        triggerToast('Gallery photo replaced and saved to database!');
      } else {
        triggerToast(res.error || 'Failed to upload gallery image');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleDeleteGalleryImageOnly = async (photoId: string) => {
    setUploadingImageTarget(`gal-${photoId}`);
    try {
      const existingPhoto = localGallery.find((p) => p.id === photoId);
      if (existingPhoto?.image && existingPhoto.image.startsWith('/uploads/')) {
        await deleteMediaByPath(existingPhoto.image);
      }
      const updated = localGallery.map((p) =>
        p.id === photoId ? { ...p, image: '' } : p
      );
      setLocalGallery(updated);
      if (onUpdateGallery) onUpdateGallery(updated);
      await saveCmsGallery(updated);
      triggerToast('Photo file deleted from server and cleared in database.');
    } catch (err: any) {
      triggerToast(`Delete error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleUploadNewGalleryImage = async (file: File) => {
    setUploadingImageTarget('new-gallery');
    try {
      const oldUrl = newPhotoUrl;
      const res = await uploadSingleMediaImage(file, 'gallery', newPhotoTitleEn || 'gallery-photo');
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== res.file.url) {
          await deleteMediaByPath(oldUrl);
        }
        setNewPhotoUrl(res.file.url);
        triggerToast('Gallery photo uploaded successfully!');
      } else {
        triggerToast(res.error || 'Failed to upload image');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleDeleteNewGalleryImage = async () => {
    if (!newPhotoUrl) return;
    setUploadingImageTarget('new-gallery');
    try {
      if (newPhotoUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(newPhotoUrl);
      }
      setNewPhotoUrl('');
      triggerToast('Uploaded gallery photo removed from server.');
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitleEn || !newPhotoUrl) {
      triggerToast('Please provide a title and upload a photo file first.');
      return;
    }
    const newPhoto: GalleryItem = {
      id: `gal-${Date.now()}`,
      titleEn: newPhotoTitleEn,
      titleNp: newPhotoTitleNp || newPhotoTitleEn,
      category: newPhotoCategory,
      image: newPhotoUrl,
    };
    const updated = [newPhoto, ...localGallery];
    setLocalGallery(updated);
    if (onUpdateGallery) onUpdateGallery(updated);
    await saveCmsGallery(updated);
    setNewPhotoTitleEn('');
    setNewPhotoTitleNp('');
    setNewPhotoUrl('');
    triggerToast('Photo published to gallery and saved to backend database!');
  };

  const handleDeletePhoto = async (id: string) => {
    const target = localGallery.find((g) => g.id === id);
    if (target?.image && target.image.startsWith('/uploads/')) {
      await deleteMediaByPath(target.image);
    }
    const updated = localGallery.filter((g) => g.id !== id);
    setLocalGallery(updated);
    if (onUpdateGallery) onUpdateGallery(updated);
    await saveCmsGallery(updated);
    triggerToast('Photo removed from gallery and server disk.');
  };

  const handleSaveLeadershipMembers = (updated: LeadershipMemberCMS[]) => {
    setLocalLeadershipMembers(updated);
    if (onUpdateLeadershipMembers) onUpdateLeadershipMembers(updated);
    triggerToast('Leadership profiles saved and synchronized with MySQL database!');
  };

  // 5. CMS: Team & Leadership Handlers & Image Uploads
  const handleUploadTeamMemberPhoto = async (memberId: string, file: File) => {
    setUploadingImageTarget(`team-${memberId}`);
    try {
      const res = await uploadSingleMediaImage(file, 'team', `member-${memberId}`);
      if (res.success && res.file) {
        const updated = localTeam.map((m) =>
          m.id === memberId ? { ...m, imageUrl: res.file!.url } : m
        );
        setLocalTeam(updated);
        if (onUpdateTeam) onUpdateTeam(updated);
        await saveCmsTeam(updated);
        triggerToast('Team member photo uploaded and saved to backend database!');
      } else {
        triggerToast(res.error || 'Failed to upload member photo');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleUploadNewTeamPhoto = async (file: File) => {
    setUploadingImageTarget('new-team');
    try {
      const res = await uploadSingleMediaImage(file, 'team', newTeamNameEn || 'new-member');
      if (res.success && res.file) {
        setNewTeamImageUrl(res.file.url);
        triggerToast('Member photo uploaded successfully!');
      } else {
        triggerToast(res.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamNameEn || !newTeamRoleEn) return;
    const newMember: TeamMemberCMS = {
      id: `team-${Date.now()}`,
      nameEn: newTeamNameEn,
      nameNp: newTeamNameNp || newTeamNameEn,
      roleEn: newTeamRoleEn,
      roleNp: newTeamRoleNp || newTeamRoleEn,
      category: newTeamCategory,
      phone: newTeamPhone,
      imageUrl: newTeamImageUrl || '/uploads/media/team-ceo.svg',
      order: localTeam.length + 1,
    };
    const updated = [...localTeam, newMember];
    setLocalTeam(updated);
    if (onUpdateTeam) onUpdateTeam(updated);
    await saveCmsTeam(updated);
    setNewTeamNameEn('');
    setNewTeamNameNp('');
    setNewTeamRoleEn('');
    setNewTeamRoleNp('');
    setNewTeamPhone('');
    setNewTeamImageUrl('/uploads/media/team-ceo.svg');
    triggerToast('New leadership member added and saved to backend database!');
  };

  const handleDeleteTeamMember = async (id: string) => {
    const updated = localTeam.filter((m) => m.id !== id);
    setLocalTeam(updated);
    if (onUpdateTeam) onUpdateTeam(updated);
    await saveCmsTeam(updated);
    triggerToast('Member removed from leadership directory.');
  };

  const handleUploadNoticeBanner = async (file: File) => {
    setUploadingImageTarget('notice-banner');
    try {
      const oldUrl = popupImageUrl;
      const res = await uploadSingleMediaImage(file, 'notices', popupTitleEn || 'notice-banner');
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== res.file.url) {
          await deleteMediaByPath(oldUrl);
        }
        setPopupImageUrl(res.file.url);
        triggerToast('Notice banner image uploaded to backend successfully!');
      } else {
        triggerToast(res.error || 'Failed to upload notice banner');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleDeleteNoticeBanner = async () => {
    if (!popupImageUrl) return;
    setUploadingImageTarget('notice-banner');
    try {
      if (popupImageUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(popupImageUrl);
      }
      setPopupImageUrl('');
      triggerToast('Notice banner image deleted from server.');
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleReplaceExistingNoticeBanner = async (noticeId: string, oldUrl: string | undefined, file: File) => {
    setUploadingImageTarget(`popup-notice-${noticeId}`);
    try {
      const res = await uploadSingleMediaImage(file, 'notices', `popup-notice-${noticeId}`);
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== res.file.url) {
          await deleteMediaByPath(oldUrl);
        }
        await updatePopupNoticeImage(noticeId, res.file.url);
        await loadPopupNoticesFromDb();
        triggerToast('Popup notice banner replaced and updated in MySQL database!');
      } else {
        triggerToast(res.error || 'Failed to upload replacement banner');
      }
    } catch (err: any) {
      triggerToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  const handleDeleteExistingNoticeBanner = async (noticeId: string, oldUrl: string | undefined) => {
    if (!oldUrl) return;
    setUploadingImageTarget(`popup-notice-${noticeId}`);
    try {
      if (oldUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(oldUrl);
      }
      await updatePopupNoticeImage(noticeId, '');
      await loadPopupNoticesFromDb();
      triggerToast('Popup notice banner deleted from server and MySQL database!');
    } catch (err: any) {
      triggerToast(`Delete error: ${err.message}`);
    } finally {
      setUploadingImageTarget(null);
    }
  };

  // 5. Rates
  const handleUpdateRate = async (id: string, newRate: string) => {
    const rateNum = parseFloat(String(newRate).replace(/[^0-9.]/g, '')) || 0;
    const formattedRate = String(newRate).includes('%') ? newRate : `${newRate}%`;
    const updated = localRates.map((r) =>
      r.id === id ? { ...r, rate: formattedRate, ratePercent: rateNum || r.ratePercent } : r
    );
    setLocalRates(updated);
    if (onUpdateRates) onUpdateRates(updated);
    await saveAllInterestRates(updated);
    triggerToast(`Interest rate updated to ${formattedRate} and saved in database.`);
  };

  // 6. Notices
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitleEn) return;
    const tempNotice: NoticeItem = {
      id: `notice-${Date.now()}`,
      titleEn: newNoticeTitleEn,
      titleNp: newNoticeTitleNp || newNoticeTitleEn,
      contentEn: newNoticeTitleEn,
      contentNp: newNoticeTitleNp || newNoticeTitleEn,
      date: '२०८१ असोज १५',
      month: 'असोज',
      day: '१५',
      category: newNoticeCategory,
    };
    const created = await createNoticeApi(tempNotice);
    const finalNotice = created || tempNotice;
    const updated = [finalNotice, ...localNotices];
    setLocalNotices(updated);
    if (onUpdateNotices) onUpdateNotices(updated);
    await saveAllNoticesApi(updated);
    setNewNoticeTitleEn('');
    setNewNoticeTitleNp('');
    triggerToast('New official notice published and saved to database!');
  };

  const handleDeleteNotice = async (id: string) => {
    await deleteNoticeApi(id);
    const updated = localNotices.filter((n) => n.id !== id);
    setLocalNotices(updated);
    if (onUpdateNotices) onUpdateNotices(updated);
    await saveAllNoticesApi(updated);
    triggerToast('Notice deleted from database and website.');
  };

  // 7. eKYM Status - Persisted to SQLite/MySQL Database
  const handleUpdateEkym = async (
    id: string,
    status: 'Approved' | 'Rejected' | 'Returned',
    remarks: string
  ) => {
    try {
      await updateEkymApplicationStatus(id, status, remarks);
      setEkymList((prev) =>
        prev.map((item) =>
          item.id === id || item.applicationNo === id
            ? { ...item, status, remarks }
            : item
        )
      );
      triggerToast(`eKYM application #${id} status updated to "${status}" in database.`);
      if (selectedEkym && (selectedEkym.id === id || selectedEkym.applicationNo === id)) {
        setSelectedEkym({ ...selectedEkym, status, remarks });
      }
    } catch (err: any) {
      console.error('Failed to update status in database:', err);
      triggerToast(`Error updating database: ${err?.message || 'Failed'}`);
    }
  };

  // 8. Loan Status
  const handleUpdateLoan = async (id: string, status: 'Approved' | 'Rejected' | 'Disbursed') => {
    await updateLoanStatusApi(id, status);
    setLoanList((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    triggerToast(`Loan application status updated to ${status} in database.`);
  };

  // 9. Counter Transaction
  const handlePostCounterTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return;

    let found = false;
    const updatedMembers = memberList.map((m) => {
      if (m.memberCode === txMemberCode) {
        found = true;
        const newBal =
          txType === 'Credit'
            ? m.regularSavingBalance + amount
            : m.regularSavingBalance - amount;
        return { ...m, regularSavingBalance: newBal };
      }
      return m;
    });

    if (found) {
      setMemberList(updatedMembers);
      await saveCmsMembers(updatedMembers);
      triggerToast(
        `Counter cash ${txType} of Rs. ${amount.toLocaleString()} posted to ${txMemberCode} and saved in database.`
      );
    } else {
      triggerToast(`Member account code ${txMemberCode} not found in CBS!`);
    }
  };

  // 10. Accounting & Day-End Closing (EOD)
  const [isEodExecuted, setIsEodExecuted] = useState(false);
  const [eodBatchTime, setEodBatchTime] = useState('');
  const [vaultOpeningCash] = useState(1450000);
  const [counterCashDeposits] = useState(845200);
  const [counterCashWithdrawals] = useState(420500);
  const [digitalQrSettlements] = useState(165800);
  const expectedClosingVault = vaultOpeningCash + counterCashDeposits - counterCashWithdrawals + digitalQrSettlements;

  // 11. AGM Share Dividend & Patronage Distribution
  const [dividendRate, setDividendRate] = useState(18);
  const [patronageRate, setPatronageRate] = useState(5);
  const [dividendPosted, setDividendPosted] = useState(false);

  // 12. CBS Security Audit Trail
  interface AuditLogItem {
    id: string;
    timestamp: string;
    operator: string;
    category: string;
    action: string;
    details: string;
    status: 'SUCCESS' | 'WARNING' | 'ALERT';
  }

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      timestamp: '2083-05-12 14:35:20',
      operator: 'Chief Executive Officer (admin)',
      category: 'CBS_EOD',
      action: 'DAY_END_CLOSING',
      details: 'Automated daily savings interest batch executed across 15,420 accounts',
      status: 'SUCCESS',
    },
    {
      id: 'log-2',
      timestamp: '2083-05-12 11:20:15',
      operator: 'Senior Credit Officer (cro_butwal)',
      category: 'LOAN_EVAL',
      action: 'LOAN_DISBURSEMENT',
      details: 'Approved Agricultural loan of Rs. 350,000 for member EK-10482',
      status: 'SUCCESS',
    },
    {
      id: 'log-3',
      timestamp: '2083-05-12 10:15:00',
      operator: 'Head Cashier (teller_1)',
      category: 'CASH_COUNTER',
      action: 'VAULT_OPENING',
      details: 'Vault cash verified and counter drawer opened: Rs. 1,450,000',
      status: 'SUCCESS',
    },
    {
      id: 'log-4',
      timestamp: '2083-05-11 16:40:10',
      operator: 'Branch Manager (bm_butwal)',
      category: 'EKYM_COMPLIANCE',
      action: 'MEMBER_VERIFY',
      details: 'Member eKYM verified for Sita Devi Thapa (EK-10483)',
      status: 'SUCCESS',
    },
    {
      id: 'log-5',
      timestamp: '2083-05-11 15:10:00',
      operator: 'Finance Manager (cfo_ankur)',
      category: 'RATE_REVISION',
      action: 'INTEREST_POLICY',
      details: 'Quarterly Fixed Deposit interest rate updated to 11.75%',
      status: 'SUCCESS',
    },
  ]);

  const [auditFilterCat, setAuditFilterCat] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  const handleRunEod = async () => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: true });
    setIsEodExecuted(true);
    setEodBatchTime(timeStr);
    const newAudit: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: 'Chief Executive Officer (admin)',
      category: 'CBS_EOD',
      action: 'DAY_END_CLOSING_BATCH',
      details: `EOD reconciliation closed. Vault cash: Rs. ${expectedClosingVault.toLocaleString()}. Daily interest accrued for 15,420 accounts.`,
      status: 'SUCCESS',
    };
    const updatedLogs = [newAudit, ...auditLogs];
    setAuditLogs(updatedLogs);
    await saveCmsAuditLogs(updatedLogs);
    triggerToast(`Day-End CBS Batch (EOD) executed successfully at ${timeStr}. Ledger closed.`);
  };

  const handlePostDividendBatch = async () => {
    const updatedMembers = memberList.map((m) => {
      const grossDiv = Math.round((m.shareAmount * dividendRate) / 100);
      const tax = Math.round((grossDiv * 5) / 100);
      const netDiv = grossDiv - tax;
      return {
        ...m,
        regularSavingBalance: m.regularSavingBalance + netDiv,
      };
    });
    setMemberList(updatedMembers);
    setDividendPosted(true);
    const newAudit: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: 'Chief Executive Officer (admin)',
      category: 'DIVIDEND_DISTRIBUTION',
      action: 'AGM_DIVIDEND_POSTED',
      details: `Posted ${dividendRate}% share dividend to all member regular savings accounts.`,
      status: 'SUCCESS',
    };
    const updatedLogs = [newAudit, ...auditLogs];
    setAuditLogs(updatedLogs);
    await Promise.all([saveCmsMembers(updatedMembers), saveCmsAuditLogs(updatedLogs)]);
    triggerToast(
      `AGM Dividend (${dividendRate}%) credited to all member savings accounts and saved in database!`
    );
  };

  const handleExportDividendCsv = () => {
    const headers = 'Member Code,Full Name,Share Capital (Rs.),Gross Dividend (Rs.),TDS Tax (5%),Net Credit (Rs.)\n';
    const rows = memberList
      .map((m) => {
        const gross = Math.round((m.shareAmount * dividendRate) / 100);
        const tax = Math.round((gross * 5) / 100);
        const net = gross - tax;
        return `"${m.memberCode}","${m.fullName}",${m.shareAmount},${gross},${tax},${net}`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ankur_AGM_Dividend_Schedule_${dividendRate}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Dividend schedule exported to CSV.');
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditFilterCat !== 'ALL' && log.category !== auditFilterCat) return false;
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      return (
        log.operator.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportAuditLogs = () => {
    const headers = 'Timestamp,Operator,Category,Action,Details,Status\n';
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.timestamp}","${l.operator}","${l.category}","${l.action}","${l.details.replace(/"/g, '""')}","${l.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ankur_CBS_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Audit logs exported to CSV.');
  };

  // 13. Add Member Modal & Voucher Slip
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemCode, setNewMemCode] = useState('EK-10487');
  const [newMemName, setNewMemName] = useState('');
  const [newMemPhone, setNewMemPhone] = useState('');
  const [newMemBranch, setNewMemBranch] = useState('Butwal Main Branch');
  const [newMemShare, setNewMemShare] = useState('25000');
  const [newMemSavings, setNewMemSavings] = useState('10000');

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemCode) return;
    const newMember: MemberRecord = {
      id: `mem-${Date.now()}`,
      memberCode: newMemCode,
      fullName: newMemName,
      phone: newMemPhone || '9857099881',
      email: `${newMemCode.toLowerCase()}@ekatacoop.com.np`,
      branch: newMemBranch,
      joinedDate: '२०८१ असोज १५',
      shareAmount: parseFloat(newMemShare) || 25000,
      regularSavingBalance: parseFloat(newMemSavings) || 10000,
      loanBalance: 0,
      status: 'Active',
    };
    const updatedMembers = [newMember, ...memberList];
    setMemberList(updatedMembers);
    setShowAddMemberModal(false);
    setNewMemName('');
    setNewMemPhone('');
    const newAudit: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: 'Branch Operations Officer (admin)',
      category: 'MEMBER_REGISTRATION',
      action: 'NEW_ACCOUNT_ENROLLED',
      details: `New member enrolled: ${newMember.fullName} (${newMember.memberCode}) with Share: Rs. ${newMember.shareAmount.toLocaleString()}`,
      status: 'SUCCESS',
    };
    const updatedLogs = [newAudit, ...auditLogs];
    setAuditLogs(updatedLogs);
    await Promise.all([saveCmsMembers(updatedMembers), saveCmsAuditLogs(updatedLogs)]);
    triggerToast(`New member ${newMember.fullName} (${newMember.memberCode}) enrolled in CBS and saved in database!`);
  };

  const [receiptModalData, setReceiptModalData] = useState<{
    memberCode: string;
    memberName: string;
    type: 'Deposit' | 'Withdrawal';
    amount: number;
    refNo: string;
    date: string;
  } | null>(null);

  const pendingEkymCount = ekymList.filter((e) => e.status === 'Pending').length;
  const pendingLoanCount = loanList.filter((l) => l.status === 'Under Review').length;

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 font-sans">
      {/* 1. Left Enterprise Dark-Slate Sidebar */}
      <aside className="w-68 bg-[#052636] text-slate-200 flex-shrink-0 flex flex-col border-r border-[#0c2d3e] sticky top-0 h-screen overflow-y-auto z-20">
        {/* Brand Header with Official Cooperative Emblem */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#052636]">
          <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md flex-shrink-0 border border-sky-500/40">
            {(localSettings.coopLogoUrl || cmsSettings?.coopLogoUrl) ? (
              <img
                key={localSettings.coopLogoUrl || cmsSettings?.coopLogoUrl}
                src={localSettings.coopLogoUrl || cmsSettings?.coopLogoUrl}
                alt="Ankur Logo"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-extrabold text-xs tracking-tight text-white uppercase truncate">
              {cmsSettings?.coopNameEn || 'Ankur Cooperative'}
            </h2>
            <span className="text-[10px] text-sky-400 font-semibold block uppercase tracking-wider">
              Core CBS & Management
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex-1 flex flex-col gap-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-2">
            Overview
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📊</span> Executive Dashboard
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 pt-4 pb-2">
            Frontend Management (CMS)
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('frontend-cms')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'frontend-cms'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🎨</span> Frontend Website CMS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-logo')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-logo'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🛡️</span> Website Logo & Branding
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-services')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-services'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🌟</span> Services & Schemes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-digital-services')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-digital-services'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-base">📱</span> Digital Services
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              CRUD
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-profile'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🏢</span> Profile & Messages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-leadership')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-leadership'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-base">👑</span> Messages from Leadership
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {(localLeadershipMembers || []).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-institutional-profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-institutional-profile'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📊</span> Institutional Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-history')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-history'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📜</span> History & Milestones
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-why-choose-us')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-why-choose-us'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">⭐</span> Why Choose Us
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-departments')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-departments'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🏛</span> Departments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-branches')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-branches'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📍</span> Service Centers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-headoffice')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-headoffice'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🏛️</span> Head Office Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-grievances')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-grievances'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">✉</span> Grievance & Feedback
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-reports'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📑</span> Reports & Publications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-news')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-news'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📰</span> News & Activities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-documents')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-documents'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📥</span> Downloads & Forms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-suggestions')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-suggestions'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">💡</span> Suggestion Box
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-faqs')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-faqs'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">❓</span> Frequently Asked Questions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-careers')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-careers'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">💼</span> Career Vacancies
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-leadership')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-leadership'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-base">👑</span> Messages from Leadership
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {(localLeadershipMembers || []).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-team')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-team'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🌳</span> BOD Tree Structure
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-management')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-management'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">👔</span> Management Team CRUD
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-privacy')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-privacy'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🛡️</span> Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-social')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-social'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🔗</span> Social Media Links
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cms-theme')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cms-theme'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🎨</span> Brand Colors & Theme
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'notices'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📢</span> Notices & Bulletins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'rates'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📈</span> Interest Rates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exchange-rates')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'exchange-rates'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">💱</span> Exchange Rates (Forex)
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 pt-4 pb-2">
            Core Banking Operations
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('ekym')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ekym'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">📝</span> eKYM Member Requests
            </div>
            {pendingEkymCount > 0 && (
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingEkymCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'loans'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">💼</span> Loan Applications
            </div>
            {pendingLoanCount > 0 && (
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingLoanCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'members'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">👥</span> Member CBS Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accounting')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'accounting'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">📑</span> Day-End Closing (EOD)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dividend')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dividend'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">💰</span> AGM Share Dividend
          </button>

          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 pt-4 pb-2">
            System & Tools
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('audit-logs')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'audit-logs'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">🛡️</span> Security & Audit Logs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('php-system')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'php-system'
                ? 'bg-[#0981ae] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-300 hover:bg-[#052636] hover:text-white'
            }`}
          >
            <span className="text-base">⚙️</span> Pure PHP Architecture
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span className="font-semibold text-white block">CBS v2.8</span>
            <span>PHP 8.2 & SQLite</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 font-semibold transition-colors"
          >
            Sign Out →
          </button>
        </div>
      </aside>

      {/* 2. Main Executive Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🏢</span>
              {activeTab === 'dashboard' && 'Executive Overview & CBS Metrics'}
              {activeTab === 'frontend-cms' && 'Complete Frontend Website CMS'}
              {activeTab === 'cms-leadership' && 'Home Page Messages from Leadership CMS (CRUD)'}
              {activeTab === 'cms-profile' && 'Organization & Leadership Profiles CMS'}
              {activeTab === 'notices' && 'Notices & Circulars Publisher'}
              {activeTab === 'rates' && 'Interest Rates Schedule Manager'}
              {activeTab === 'ekym' && 'eKYM Member Applications Queue'}
              {activeTab === 'loans' && 'Loan Underwriting & Evaluation'}
              {activeTab === 'members' && 'Core Banking Members Registry'}
              {activeTab === 'php-system' && 'Pure PHP Server & Database Details'}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse"></span>
              Live CBS Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Preeti Font-based Nepali Typing Controls in Admin Topbar */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={togglePreetiMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isPreetiMode
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
                title="प्रिती र अङ्ग्रेजी टाइपिङ फेर्नुहोस् (Ctrl + M)"
              >
                <span>⌨️</span>
                <span>{isPreetiMode ? 'प्रिती (Preeti) सक्रिय' : 'English (अङ्ग्रेजी)'}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/10">
                  Ctrl+M
                </span>
              </button>
              <button
                type="button"
                onClick={openKeyboardGuide}
                className="px-2 py-1 text-xs font-medium rounded-lg text-slate-700 hover:text-sky-700 hover:bg-white transition-colors cursor-pointer"
                title="प्रिती किबोर्ड लेआउट गाइड खोल्नुहोस्"
              >
                किबोर्ड गाइड
              </button>
              <button
                type="button"
                onClick={openConverter}
                className="px-2 py-1 text-xs font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-white transition-colors cursor-pointer"
                title="प्रिती ⇄ युनिकोड रूपान्तरण"
              >
                कन्भर्टर
              </button>
            </div>

            {/* Quick Test Public Website button */}
            <button
              type="button"
              onClick={onExitToWebsite}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
              title="Return to the public homepage to preview CMS edits"
            >
              👁 View Public Website
            </button>

            <button
              type="button"
              onClick={onSwitchToMember}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-sky-300 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 transition-colors"
            >
              👤 Switch to Member
            </button>

            {/* Admin Avatar Pill */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0981ae] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                A
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user.fullName || 'Chief Executive Officer'}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Super Admin ({user.username || 'admin'})
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-8 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMsg && (
            <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-300 text-sky-900 text-sm font-medium flex items-center gap-2 shadow-sm animate-fade-in">
              <span className="text-sky-600 font-bold text-base">✓</span>
              {toastMsg}
            </div>
          )}

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Project Manager System & Frontend Overview Banner */}
              <div className="bg-gradient-to-r from-[#052636] via-[#072f42] to-[#052636] rounded-2xl p-6 text-white border border-sky-500/40 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-sky-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black uppercase tracking-wider border border-sky-500/40">
                        ✦ Project Manager Overview
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20">
                        MySQL DB ➔ Express API ➔ Live React UI
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold border border-sky-400/30">
                        ✓ All 13 Pages Synchronized
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Full-Window About Us Engine & Standardized Design System
                    </h2>
                    <p className="text-xs sm:text-sm text-sky-100/80 max-w-3xl leading-relaxed">
                      All website sections (Services, About Us, Interest Rates, Reports, Why Ankur, Gallery) follow the unified, larger card format with generous spacing, dedicated icon boxes, and responsive 3-column layouts. The 13 About Us information categories and 6 Discover cards are live in the CMS.
                    </p>
                  </div>

                  <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('cms-leadership')}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      <span>👑</span>
                      <span>Messages from Leadership ({(localLeadershipMembers || []).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('cms-profile')}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      <span>📑</span>
                      <span>Review 13 Pages in CMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExitToWebsite}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/25 transition cursor-pointer"
                    >
                      <span>👁️</span>
                      <span>Preview Live Website</span>
                    </button>
                  </div>
                </div>

                {/* Live Status Indicators Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-sky-300 font-bold uppercase block mb-0.5">Services Section</span>
                    <strong className="text-white text-xs">6 Large Cards (3-Col Grid)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-sky-300 font-bold uppercase block mb-0.5">About Us Pages</span>
                    <strong className="text-white text-xs">13 Full-Window Modules</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-sky-300 font-bold uppercase block mb-0.5">Discover Section</span>
                    <strong className="text-white text-xs">6 Interactive Line-Icon Cards</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-sky-300 font-bold uppercase block mb-0.5">Data Pipeline</span>
                    <strong className="text-sky-300 text-xs">Admin ➔ API ➔ DB ➔ UI</strong>
                  </div>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="w-1 absolute left-0 top-0 bottom-0 bg-[#0981ae]" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Active Members
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {localSettings.statMembers}
                  </div>
                  <span className="text-[11px] text-sky-600 font-medium mt-1 flex items-center gap-1">
                    ✓ Verified KYC Accounts
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="w-1 absolute left-0 top-0 bottom-0 bg-amber-500" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Deposits (CBS)
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {localSettings.statSavings}
                  </div>
                  <span className="text-[11px] text-sky-600 font-medium mt-1 flex items-center gap-1">
                    ↑ 8.4% Annual Growth Rate
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="w-1 absolute left-0 top-0 bottom-0 bg-blue-600" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Loans Disbursed
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {localSettings.statLoans}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">
                    Priority Agriculture & Enterprise
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="w-1 absolute left-0 top-0 bottom-0 bg-purple-600" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Pending eKYM Queue
                  </span>
                  <div className="text-2xl font-black text-purple-700 mt-1">
                    {pendingEkymCount} Applications
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ekym')}
                    className="text-[11px] text-purple-600 hover:underline font-semibold mt-1 inline-block"
                  >
                    Review applicants →
                  </button>
                </div>
              </div>

              {/* Home Page Messages from Leadership (CRUD Engine) Quick Hub */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-xl shrink-0">
                      👑
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Home Page Messages from Leadership (CRUD Manager)
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {(localLeadershipMembers || []).length} Profiles in Database
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Perform full CRUD operations (Create, Read, Update photo &amp; messages, Delete, Reorder) on the leadership cards positioned immediately after the EMI Calculator on the public home page.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('cms-leadership')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0981ae] hover:bg-[#065371] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>⚙️</span>
                      <span>Open Leadership CRUD Portal</span>
                    </button>
                  </div>
                </div>

                {/* Profiles mini-preview row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {(localLeadershipMembers || []).slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setActiveTab('cms-leadership')}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-sky-50/50 hover:border-sky-300 transition-all cursor-pointer group flex items-start gap-3"
                    >
                      <img
                        src={m.photoUrl}
                        alt={m.nameEn}
                        className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 group-hover:border-[#0981ae] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate group-hover:text-[#0981ae]">
                          {m.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {m.designationEn}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${m.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-[10px] font-semibold text-slate-600">
                            {m.isActive !== false ? 'Active on Home' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Split Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Recent eKYM & Loan Submissions */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          📝 Recent eKYM Applications
                        </h3>
                        <p className="text-xs text-slate-500">
                          Online member registrations received via digital portal
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ekym')}
                        className="text-xs text-[#0981ae] font-semibold hover:underline cursor-pointer"
                      >
                        View All ({ekymList.length}) →
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">App No</th>
                            <th className="p-3">Applicant</th>
                            <th className="p-3">Citizenship</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ekymList.slice(0, 4).map((ek) => (
                            <tr key={ek.id} className="hover:bg-slate-50/70">
                              <td className="p-3 font-semibold text-slate-800">
                                {ek.applicationNo}
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">
                                  {ek.fullNameEn}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  📱 {ek.phone}
                                </span>
                              </td>
                              <td className="p-3">{ek.citizenshipNo}</td>
                              <td className="p-3 text-slate-500">{ek.submittedAt}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    ek.status === 'Approved'
                                      ? 'bg-sky-100 text-sky-800'
                                      : ek.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {ek.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Loan Applications */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          💼 Recent Loan Applications
                        </h3>
                        <p className="text-xs text-slate-500">
                          Online loan applications with full CRUD &amp; downloadable PDF dossier
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('loans')}
                        className="text-xs text-[#0981ae] font-semibold hover:underline cursor-pointer"
                      >
                        Manage Loans ({loanList.length}) →
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Tracking Code</th>
                            <th className="p-3">Applicant</th>
                            <th className="p-3">Branch &amp; Loan Type</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {loanList.slice(0, 4).map((ln) => (
                            <tr key={ln.id} className="hover:bg-slate-50/70">
                              <td className="p-3 font-mono font-bold text-slate-800">
                                {ln.trackingCode}
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">
                                  {ln.applicantName}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  📱 {ln.phone}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold text-[#0981ae] block">
                                  {ln.loanScheme}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {ln.branch || 'Head Office'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">{ln.appliedDate}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    ln.status === 'Approved' || ln.status === 'Disbursed'
                                      ? 'bg-sky-100 text-sky-800'
                                      : ln.status === 'Under Review'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {ln.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Counter Cash Transaction */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-1">
                    <span>💵</span> CBS Counter Transaction
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Credit deposit or debit withdrawal to member passbook
                  </p>

                  <form onSubmit={handlePostCounterTx} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Member Account Code
                      </label>
                      <input
                        type="text"
                        value={txMemberCode}
                        onChange={(e) => setTxMemberCode(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        placeholder="e.g. EK-10482"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Transaction Action
                      </label>
                      <select
                        value={txType}
                        onChange={(e) => setTxType(e.target.value as 'Credit' | 'Debit')}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                      >
                        <option value="Credit">Credit (Deposit to Regular Savings)</option>
                        <option value="Debit">Debit (Cash Withdrawal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Amount (NPR)
                      </label>
                      <input
                        type="number"
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                        step="100"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Particulars
                      </label>
                      <input
                        type="text"
                        value={txParticulars}
                        onChange={(e) => setTxParticulars(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-2 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Post Counter Transaction
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FRONTEND WEBSITE CMS (FULL ACCESS TO CHANGE PUBLIC WEBSITE) */}
          {activeTab === 'frontend-cms' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>🎨</span> Frontend Content Management System (CMS)
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    You have complete administrative authority to change website texts, slogans, ticker announcements, hero slides, operational statistics, and core services.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetAllFrontendCms}
                    className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    ↻ Reset CMS Defaults
                  </button>
                  <button
                    type="button"
                    onClick={onExitToWebsite}
                    className="px-4 py-2 bg-[#0981ae] text-white rounded-lg text-xs font-bold hover:bg-[#065371] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    👁 View Public Website Changes
                  </button>
                </div>
              </div>

              {/* Sub-Navigation for CMS */}
              <div className="flex border-b border-slate-200 px-6 pt-2 bg-white gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCmsSubTab('general')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'general'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🏛 General Identity & Ticker
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('logo')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'logo'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🛡️ Website Logo & Branding
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('slides')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'slides'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🖼 Hero Banner Slides ({(localSlides || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('profile')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'profile'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🏢 Profile & Leadership
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('institutional-profile')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'institutional-profile'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📊 Institutional Profile ({(localInstitutionalProfiles || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('exchange-rates')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'exchange-rates'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💱 Exchange Rates ({(localExchangeRates || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('departments')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'departments'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🏛 Departments ({(localDepartments || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('branches')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'branches'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📍 Service Centers ({(localServiceCenters || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('reports')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'reports'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📑 Reports & Publications ({(localReports || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('careers')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'careers'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💼 Career Vacancies ({(localCareers || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('media')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'media'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📁 Image Upload & Media Archive
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('stats')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'stats'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📊 Key Operational Statistics
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('services')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'services'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💼 Core Services Catalog ({(localServices || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('gallery')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'gallery'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📸 Photo Gallery Archive ({(localGallery || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('leadership')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'leadership'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👑 Messages from Leadership ({(localLeadershipMembers || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('team')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'team'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🌳 BOD Tree Structure ({(Array.isArray(localTeam) ? localTeam : []).filter((m) => m.category === 'board' || m.category === 'committee').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('management')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'management'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👔 Management Team CRUD ({(Array.isArray(localTeam) ? localTeam : []).filter((m) => m.category === 'management').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('history')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'history'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📜 History & Milestones ({(localHistoryMilestones?.milestones || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('why-choose-us')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'why-choose-us'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ⭐ Why Choose Us ({(localWhyChooseUs?.items || localWhyChooseUs?.pillars || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('headoffice')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'headoffice'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🏛️ Head Office Info
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('grievances')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'grievances'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✉️ Grievances & Officer
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('privacy')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'privacy'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🛡️ Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('social')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'social'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🔗 Social Media Links
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('theme')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'theme'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🎨 Brand Colors & Theme
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('news')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'news'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📰 News & Activities ({(localNewsActivities || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('documents')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'documents'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📥 Downloads & Forms ({(localDocuments || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('suggestions')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'suggestions'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💡 Suggestion Box ({(localSuggestions || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCmsSubTab('faqs')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    cmsSubTab === 'faqs'
                      ? 'border-[#0981ae] text-[#0981ae]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ❓ FAQs ({(localFaqs || []).length})
                </button>
              </div>

              {/* Subpane: Website Logo & Branding */}
              {cmsSubTab === 'logo' && (
                <div className="p-6">
                  <LogoManagement
                    currentLogoUrl={localSettings.coopLogoUrl}
                    onUpdateLogo={(newUrl) => {
                      const updated = { ...localSettings, coopLogoUrl: newUrl };
                      setLocalSettings(updated);
                      if (onUpdateCmsSettings) onUpdateCmsSettings(updated);
                      triggerToast('Website logo updated and synchronized successfully!');
                    }}
                    onExitToWebsite={onExitToWebsite}
                  />
                </div>
              )}

              {/* Subpane: Image Upload & Media Management */}
              {cmsSubTab === 'media' && (
                <div className="p-6">
                  <MediaManagement
                    onExitToWebsite={onExitToWebsite}
                    currentLogoUrl={localSettings.coopLogoUrl}
                    onUpdateLogo={(newUrl) => {
                      const updated = { ...localSettings, coopLogoUrl: newUrl };
                      setLocalSettings(updated);
                      if (onUpdateCmsSettings) onUpdateCmsSettings(updated);
                      triggerToast('Website logo updated and saved to database!');
                    }}
                  />
                </div>
              )}

              {/* Subpane: General Identity & Ticker */}
              {cmsSubTab === 'general' && (
                <form onSubmit={handleSaveGeneralSettings} className="p-6 space-y-6">
                  {/* Official Cooperative Logo Uploader, Preview, Replace & Delete */}
                  <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-xs shrink-0">
                        {localSettings.coopLogoUrl ? (
                          <img
                            key={localSettings.coopLogoUrl}
                            src={localSettings.coopLogoUrl}
                            alt="Active Cooperative Logo"
                            className="max-h-12 max-w-12 object-contain cursor-pointer"
                            onClick={() => setPreviewMediaUrl(localSettings.coopLogoUrl)}
                          />
                        ) : null}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Official Website Logo (Saved on Server & MySQL)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                            Live
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Upload, preview, replace, or delete the official cooperative logo directly on the server.
                        </p>
                        {localSettings.coopLogoUrl && (
                          <span className="inline-block text-[10px] font-mono text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
                            Stored: {localSettings.coopLogoUrl.split('/').pop()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {localSettings.coopLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewMediaUrl(localSettings.coopLogoUrl)}
                          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0981ae]" />
                          <span>Preview</span>
                        </button>
                      )}
                      <label className="px-3.5 py-2 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors inline-flex items-center gap-1.5">
                        <span>
                          {uploadingImageTarget === 'inline-logo'
                            ? '⏳ Uploading...'
                            : localSettings.coopLogoUrl && !localSettings.coopLogoUrl.includes('ekata-logo-default.svg')
                            ? '🔄 Replace Logo'
                            : '📤 Upload Logo'}
                        </span>
                        <input
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg,.webp,.gif,.ico,image/*"
                          onChange={handleInlineLogoFileUpload}
                          disabled={uploadingImageTarget === 'inline-logo'}
                          className="hidden"
                        />
                      </label>
                      {localSettings.coopLogoUrl && !localSettings.coopLogoUrl.includes('ekata-logo-default.svg') && (
                        <button
                          type="button"
                          onClick={handleDeleteInlineLogo}
                          disabled={uploadingImageTarget === 'inline-logo'}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          🗑️ Delete Logo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCmsSubTab('logo')}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        🛡️ Open Logo Studio
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                      <span>1. Institutional Identity & Slogan</span>
                      <span className="text-[11px] font-normal text-slate-500">Editable from Admin Panel</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cooperative Name (English)
                        </label>
                        <input
                          type="text"
                          value={localSettings.coopNameEn}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, coopNameEn: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cooperative Name (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={localSettings.coopNameNp}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, coopNameNp: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Header Tagline (English)
                        </label>
                        <input
                          type="text"
                          value={localSettings.taglineEn}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, taglineEn: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Header Tagline (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={localSettings.taglineNp}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, taglineNp: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Editable Since & Establishment Details */}
                  <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-sky-200/60 flex items-center gap-2">
                      <span>📅</span> "Since" & Establishment Information
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-3">
                      Updates the establishment date and badge displays across the header, footer, hero banners, and corporate profiles.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Established Year (B.S.)
                        </label>
                        <input
                          type="text"
                          value={localSettings.establishedBs || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, establishedBs: e.target.value })
                          }
                          placeholder="e.g. 2057"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Established Year (A.D.)
                        </label>
                        <input
                          type="text"
                          value={localSettings.establishedAd || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, establishedAd: e.target.value })
                          }
                          placeholder="e.g. 2000"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Established Label (English)
                        </label>
                        <input
                          type="text"
                          value={localSettings.establishedDateEn || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, establishedDateEn: e.target.value })
                          }
                          placeholder="e.g. Established in 2057 B.S. (2000 A.D.)"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Established Label (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={localSettings.establishedDateNp || ''}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, establishedDateNp: e.target.value })
                        }
                        placeholder="e.g. स्थापना: २०५७ वि.सं. (२००० इ.सं.)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                      />
                    </div>
                  </div>

                  {/* Detailed Location & Address Information */}
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-blue-200/60 flex items-center gap-2">
                      <span>📍</span> Location & Address Information
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-3">
                      Manage official registered head office location, jurisdiction, ward, province, and operational area.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Head Office Full Address (English)
                        </label>
                        <input
                          type="text"
                          value={localSettings.addressHeadOffice || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, addressHeadOffice: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Head Office Full Address (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={localSettings.addressHeadOfficeNp || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, addressHeadOfficeNp: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Province
                        </label>
                        <input
                          type="text"
                          value={localSettings.province || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, province: e.target.value })
                          }
                          placeholder="e.g. Lumbini Province"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={localSettings.district || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, district: e.target.value })
                          }
                          placeholder="e.g. Rupandehi"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          City / Municipality
                        </label>
                        <input
                          type="text"
                          value={localSettings.cityMunicipality || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, cityMunicipality: e.target.value })
                          }
                          placeholder="e.g. Butwal Sub-Metro"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ward No.
                        </label>
                        <input
                          type="text"
                          value={localSettings.wardNo || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, wardNo: e.target.value })
                          }
                          placeholder="e.g. 4"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Street / Tole
                        </label>
                        <input
                          type="text"
                          value={localSettings.streetTole || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, streetTole: e.target.value })
                          }
                          placeholder="e.g. Traffic Chowk"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Operational Service Area (English)
                        </label>
                        <input
                          type="text"
                          value={localSettings.serviceAreaEn || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, serviceAreaEn: e.target.value })
                          }
                          placeholder="e.g. Lumbini Province & Rupandehi District"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Operational Service Area (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={localSettings.serviceAreaNp || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, serviceAreaNp: e.target.value })
                          }
                          placeholder="e.g. लुम्बिनी प्रदेश तथा रुपन्देही जिल्ला"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Branch Network & Service Centers Summary
                        </label>
                        <input
                          type="text"
                          value={localSettings.branchNetworkInfo || ''}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, branchNetworkInfo: e.target.value })
                          }
                          placeholder="e.g. Central Head Office + 4 Service Centers across Rupandehi"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Registration / PAN No.
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={localSettings.regdNo || ''}
                            onChange={(e) =>
                              setLocalSettings({ ...localSettings, regdNo: e.target.value })
                            }
                            placeholder="Regd No"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                          <input
                            type="text"
                            value={localSettings.panNo || ''}
                            onChange={(e) =>
                              setLocalSettings({ ...localSettings, panNo: e.target.value })
                            }
                            placeholder="PAN No"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                      2. Urgent Announcement Ticker Bar
                    </h4>
                    <div className="mb-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={localSettings.tickerActive}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              tickerActive: e.target.checked,
                            })
                          }
                          className="rounded text-[#0981ae] focus:ring-[#0981ae]"
                        />
                        <span>
                          <strong>Enable Live Running Ticker</strong> on Public Website Topbar
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Ticker Notice (English)
                        </label>
                        <textarea
                          rows={2}
                          value={localSettings.tickerTextEn}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, tickerTextEn: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Ticker Notice (नेपाली)
                        </label>
                        <textarea
                          rows={2}
                          value={localSettings.tickerTextNp}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, tickerTextNp: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">
                      3. Official Helpline & Contact Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Head Office Phone
                        </label>
                        <input
                          type="text"
                          value={localSettings.phoneHeadOffice}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              phoneHeadOffice: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Toll-Free Helpline
                        </label>
                        <input
                          type="text"
                          value={localSettings.phoneTollFree}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              phoneTollFree: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Official Email
                        </label>
                        <input
                          type="email"
                          value={localSettings.emailOfficial}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              emailOfficial: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Office Working Hours
                      </label>
                      <input
                        type="text"
                        value={localSettings.officeHours}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            officeHours: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
                  >
                    💾 Save General Settings & Location to Database
                  </button>
                </form>
              )}

              {/* Subpane: Hero Banner Slides */}
              {cmsSubTab === 'slides' && (
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {localSlides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#0981ae]">
                            Slide #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-[11px] font-bold"
                          >
                            Delete Slide
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Headline (English)
                            </label>
                            <input
                              type="text"
                              value={slide.titleEn}
                              onChange={(e) =>
                                handleUpdateSlideField(slide.id, 'titleEn', e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Headline (नेपाली)
                            </label>
                            <input
                              type="text"
                              value={slide.titleNp}
                              onChange={(e) =>
                                handleUpdateSlideField(slide.id, 'titleNp', e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Subtitle (English)
                            </label>
                            <textarea
                              rows={2}
                              value={slide.subtitleEn}
                              onChange={(e) =>
                                handleUpdateSlideField(slide.id, 'subtitleEn', e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Subtitle (नेपाली)
                            </label>
                            <textarea
                              rows={2}
                              value={slide.subtitleNp}
                              onChange={(e) =>
                                handleUpdateSlideField(slide.id, 'subtitleNp', e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                            Slide Banner Image (Upload, Preview, Replace & Delete)
                          </label>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                            {slide.imageUrl ? (
                              <img
                                src={slide.imageUrl}
                                alt={slide.titleEn}
                                className="w-28 h-16 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer"
                                onClick={() => setPreviewMediaUrl(slide.imageUrl)}
                              />
                            ) : (
                              <div className="w-28 h-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                                No Image
                              </div>
                            )}
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <label className="px-3 py-1.5 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                                  <span>
                                    {uploadingImageTarget === `slide-${slide.id}`
                                      ? '⏳ Uploading...'
                                      : slide.imageUrl
                                      ? '🔄 Replace Image'
                                      : '📤 Upload Image'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingImageTarget === `slide-${slide.id}`}
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleUploadSlideImage(slide.id, f);
                                      e.target.value = '';
                                    }}
                                  />
                                </label>
                                {slide.imageUrl && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewMediaUrl(slide.imageUrl)}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      👁️ Preview
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlideImage(slide.id)}
                                      disabled={uploadingImageTarget === `slide-${slide.id}`}
                                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                    >
                                      🗑️ Delete Image
                                    </button>
                                  </>
                                )}
                              </div>
                              {slide.imageUrl && (
                                <span className="block text-[10px] font-mono text-slate-500">
                                  Stored on server: {slide.imageUrl.split('/').pop()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Slide Form */}
                  <div className="p-5 rounded-xl border border-dashed border-sky-500 bg-sky-50/40">
                    <h4 className="font-bold text-xs text-sky-900 mb-3">
                      ➕ Add New Banner Slide
                    </h4>
                    <form onSubmit={handleAddSlide} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Headline (English)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Modern Mobile Banking Experience"
                            value={newSlideTitleEn}
                            onChange={(e) => setNewSlideTitleEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Headline (नेपाली)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. आधुनिक मोबाइल बैंकिङ अनुभव"
                            value={newSlideTitleNp}
                            onChange={(e) => setNewSlideTitleNp(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          placeholder="Short summary for the slide..."
                          value={newSlideSubtitleEn}
                          onChange={(e) => setNewSlideSubtitleEn(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                          Slide Banner Image * (Upload to Server)
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-sky-200 bg-white">
                          {newSlideImg ? (
                            <img
                              src={newSlideImg}
                              alt="New slide preview"
                              className="w-28 h-16 object-cover rounded-lg border border-sky-200 shrink-0 cursor-pointer"
                              onClick={() => setPreviewMediaUrl(newSlideImg)}
                            />
                          ) : (
                            <div className="w-28 h-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                              No Image Yet
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                              <span>
                                {uploadingImageTarget === 'new-slide'
                                  ? '⏳ Uploading...'
                                  : newSlideImg
                                  ? '🔄 Replace Image'
                                  : '📤 Upload Slide Image'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingImageTarget === 'new-slide'}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleUploadNewSlideImage(f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {newSlideImg && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPreviewMediaUrl(newSlideImg)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  👁️ Preview
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDeleteNewSlideImage}
                                  disabled={uploadingImageTarget === 'new-slide'}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  🗑️ Delete Image
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Publish Slide to Homepage
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Subpane: Key Operational Statistics */}
              {cmsSubTab === 'stats' && (
                <form onSubmit={handleSaveGeneralSettings} className="p-6 space-y-6">
                  <p className="text-xs text-slate-600">
                    These 5 metrics are displayed directly in the prominent statistics banner under the homepage hero slider.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Active Members Display
                      </label>
                      <input
                        type="text"
                        value={localSettings.statMembers}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, statMembers: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Total Savings Collected
                      </label>
                      <input
                        type="text"
                        value={localSettings.statSavings}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, statSavings: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Total Loans Disbursed
                      </label>
                      <input
                        type="text"
                        value={localSettings.statLoans}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, statLoans: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Reserve & Share Capital Fund
                      </label>
                      <input
                        type="text"
                        value={localSettings.statCapital}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, statCapital: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Branch & Service Centers
                      </label>
                      <input
                        type="text"
                        value={localSettings.statBranches}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, statBranches: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    💾 Update Key Statistics on Homepage
                  </button>
                </form>
              )}

              {/* Subpane: Core Services & Schemes */}
              {cmsSubTab === 'services' && (
                <div className="p-6">
                  <ServicesManager
                    services={localServices}
                    onSaveServices={handleSaveServices}
                  />
                </div>
              )}

              {/* Subpane: Photo Gallery Archive */}
              {cmsSubTab === 'gallery' && (
                <div className="p-6 space-y-6">
                  {/* Add Photo Form */}
                  <div className="p-5 rounded-xl border border-dashed border-sky-500 bg-sky-50/40">
                    <h4 className="font-bold text-xs text-sky-900 mb-3">
                      📸 Add New Photo to Gallery
                    </h4>
                    <form onSubmit={handleAddPhoto} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Title (English)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Health Camp & Blood Donation"
                            value={newPhotoTitleEn}
                            onChange={(e) => setNewPhotoTitleEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Title (नेपाली)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. स्वास्थ्य शिविर तथा रक्तदान"
                            value={newPhotoTitleNp}
                            onChange={(e) => setNewPhotoTitleNp(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Category
                          </label>
                          <select
                            value={newPhotoCategory}
                            onChange={(e) => setNewPhotoCategory(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          >
                            <option value="General Meeting">General Meeting (AGM)</option>
                            <option value="Empowerment">Empowerment & Literacy</option>
                            <option value="Social CSR">Social CSR & Health Camp</option>
                            <option value="Celebration">Anniversary</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                          Gallery Photo File * (Upload, Preview, Replace & Delete)
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-sky-200 bg-white">
                          {newPhotoUrl ? (
                            <img
                              src={newPhotoUrl}
                              alt="New gallery preview"
                              className="w-24 h-16 object-cover rounded-lg border border-sky-200 shrink-0 cursor-pointer"
                              onClick={() => setPreviewMediaUrl(newPhotoUrl)}
                            />
                          ) : (
                            <div className="w-24 h-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                              No Photo
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                              <span>
                                {uploadingImageTarget === 'new-gallery'
                                  ? '⏳ Uploading...'
                                  : newPhotoUrl
                                  ? '🔄 Replace Photo'
                                  : '📤 Upload Photo'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingImageTarget === 'new-gallery'}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleUploadNewGalleryImage(f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {newPhotoUrl && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setPreviewMediaUrl(newPhotoUrl)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  👁️ Preview
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDeleteNewGalleryImage}
                                  disabled={uploadingImageTarget === 'new-gallery'}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  🗑️ Delete File
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Publish Photo to Website Gallery
                      </button>
                    </form>
                  </div>

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {localGallery.map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col justify-between"
                      >
                        {photo.image ? (
                          <img
                            src={photo.image}
                            alt={photo.titleEn}
                            className="w-full h-36 object-cover cursor-pointer"
                            onClick={() => setPreviewMediaUrl(photo.image)}
                          />
                        ) : (
                          <div className="w-full h-36 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                            No Image Uploaded
                          </div>
                        )}
                        <div className="p-3 space-y-2">
                          <div>
                            <span className="text-[10px] font-bold text-[#0981ae] uppercase tracking-wide">
                              {photo.category}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 mt-0.5">
                              {photo.titleEn}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                            {photo.image && (
                              <button
                                type="button"
                                onClick={() => setPreviewMediaUrl(photo.image)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                👁️ Preview
                              </button>
                            )}
                            <label className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[10px] font-bold cursor-pointer">
                              <span>
                                {uploadingImageTarget === `gal-${photo.id}`
                                  ? '⏳...'
                                  : photo.image
                                  ? '🔄 Replace'
                                  : '📤 Upload'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingImageTarget === `gal-${photo.id}`}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleUploadGalleryImage(photo.id, f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {photo.image && (
                              <button
                                type="button"
                                onClick={() => handleDeleteGalleryImageOnly(photo.id)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Clear File
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold hover:bg-red-200 cursor-pointer"
                            >
                              🗑️ Delete Card
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subpane: Profile & Leadership */}
              {cmsSubTab === 'profile' && (
                <div className="p-6">
                  <OrganizationProfileManager
                    pages={localCmsPages}
                    onSavePages={handleSaveCmsPages}
                    historyMilestones={localHistoryMilestones}
                    onSaveHistoryMilestones={handleSaveHistoryMilestones}
                    whyChooseUs={localWhyChooseUs}
                    onSaveWhyChooseUs={handleSaveWhyChooseUs}
                    team={localTeam}
                    onSaveTeam={handleSaveTeam}
                    institutionalProfiles={localInstitutionalProfiles}
                    onSaveInstitutionalProfiles={handleSaveInstitutionalProfiles}
                    onOpenLeadershipMessages={() => setActiveTab('cms-leadership')}
                  />
                </div>
              )}

              {/* Subpane: History & Milestones */}
              {cmsSubTab === 'history' && (
                <div className="p-6">
                  <HistoryMilestonesManager
                    data={localHistoryMilestones}
                    onSave={handleSaveHistoryMilestones}
                  />
                </div>
              )}

              {/* Subpane: Why Choose Us */}
              {cmsSubTab === 'why-choose-us' && (
                <div className="p-6">
                  <WhyChooseUsManager
                    data={localWhyChooseUs}
                    onSave={handleSaveWhyChooseUs}
                  />
                </div>
              )}

              {/* Subpane: Departments */}
              {cmsSubTab === 'departments' && (
                <div className="p-6">
                  <DepartmentsManager
                    departments={localDepartments}
                    onSaveDepartments={handleSaveDepartments}
                  />
                </div>
              )}

              {/* Subpane: Service Centers */}
              {cmsSubTab === 'branches' && (
                <div className="p-6">
                  <ServiceCentersManager
                    serviceCenters={localServiceCenters}
                    onSaveServiceCenters={handleSaveServiceCenters}
                  />
                </div>
              )}

              {/* Subpane: Reports */}
              {cmsSubTab === 'reports' && (
                <div className="p-6">
                  <ReportsManager
                    reports={localReports}
                    onSaveReports={handleSaveReports}
                  />
                </div>
              )}

              {/* Subpane: Careers */}
              {cmsSubTab === 'careers' && (
                <div className="p-6">
                  <CareersManager
                    careers={localCareers}
                    onSaveCareers={handleSaveCareers}
                  />
                </div>
              )}

              {/* Subpane: Messages from Leadership */}
              {cmsSubTab === 'leadership' && (
                <div className="p-6">
                  <LeadershipManager
                    initialMembers={localLeadershipMembers}
                    onUpdate={handleSaveLeadershipMembers}
                  />
                </div>
              )}

              {/* Subpane: Team & Leadership (BOD Tree) */}
              {cmsSubTab === 'team' && (
                <div className="p-6">
                  <TeamManager
                    team={localTeam}
                    onSaveTeam={handleSaveTeam}
                    defaultView="bod-tree"
                  />
                </div>
              )}

              {/* Subpane: Management Team CRUD */}
              {cmsSubTab === 'management' && (
                <div className="p-6">
                  <TeamManager
                    team={localTeam}
                    onSaveTeam={handleSaveTeam}
                    defaultView="management"
                  />
                </div>
              )}

              {/* Subpane: Head Office Info */}
              {cmsSubTab === 'headoffice' && (
                <div className="p-6">
                  <HeadOfficeManager
                    headOffice={localHeadOffice}
                    onSave={handleSaveHeadOffice}
                    showToast={(msg) => triggerToast(msg)}
                  />
                </div>
              )}

              {/* Subpane: Grievances & Feedback */}
              {cmsSubTab === 'grievances' && (
                <div className="p-6 space-y-8">
                  <SuggestionBoxManager
                    suggestions={localSuggestions}
                    onSaveSuggestions={handleSaveSuggestions}
                  />
                  <div className="border-t border-slate-200 pt-8">
                    <GrievanceManager
                      officer={localGrievanceOfficer}
                      grievances={localGrievances || []}
                      onSaveOfficer={handleSaveGrievanceOfficer}
                      onSaveGrievances={handleSaveGrievances}
                    />
                  </div>
                </div>
              )}

              {/* Subpane: Privacy Policy */}
              {cmsSubTab === 'privacy' && (
                <div className="p-6">
                  <PrivacyPolicyManager
                    policy={localPrivacyPolicy}
                    onSave={handleSavePrivacyPolicy}
                  />
                </div>
              )}

              {/* Subpane: Social Media Links */}
              {cmsSubTab === 'social' && (
                <div className="p-6">
                  <SocialLinksManager
                    socialLinks={localSocialLinks}
                    onSave={handleSaveSocialLinks}
                  />
                </div>
              )}

              {/* Subpane: Brand Colors & Theme */}
              {cmsSubTab === 'theme' && (
                <div className="p-6">
                  <BrandThemeManager
                    theme={localBrandTheme}
                    onSave={handleSaveBrandTheme}
                  />
                </div>
              )}

              {/* Subpane: Documents Vault / Downloads */}
              {cmsSubTab === 'documents' && (
                <div className="p-6">
                  <DocumentsManager
                    documents={localDocuments}
                    onSaveDocuments={handleSaveDocuments}
                  />
                </div>
              )}

              {/* Subpane: News & Activities */}
              {cmsSubTab === 'news' && (
                <div className="p-6">
                  <NewsActivitiesManager
                    items={localNewsActivities}
                    onSaveItems={handleSaveNewsActivities}
                  />
                </div>
              )}

              {/* Subpane: Suggestion Box */}
              {cmsSubTab === 'suggestions' && (
                <div className="p-6">
                  <SuggestionBoxManager
                    suggestions={localSuggestions}
                    onSaveSuggestions={handleSaveSuggestions}
                  />
                </div>
              )}

              {/* Subpane: Frequently Asked Questions */}
              {cmsSubTab === 'faqs' && (
                <div className="p-6">
                  <FaqManager
                    faqs={localFaqs}
                    onSaveFaqs={handleSaveFaqs}
                  />
                </div>
              )}

              {/* Subpane: Institutional Profile */}
              {cmsSubTab === 'institutional-profile' && (
                <div className="p-6">
                  <InstitutionalProfileManager
                    profiles={localInstitutionalProfiles}
                    onSave={handleSaveInstitutionalProfiles}
                    monthlyReports={localMonthlyReports}
                    onSaveMonthlyReports={handleSaveMonthlyReports}
                  />
                </div>
              )}

              {/* Subpane: Exchange Rates (Forex) */}
              {cmsSubTab === 'exchange-rates' && (
                <div className="p-6">
                  <ExchangeRatesManager
                    rates={localExchangeRates}
                    onSave={handleSaveExchangeRates}
                  />
                </div>
              )}
            </div>
          )}

          {/* DEDICATED CMS VIEWS (WHEN ACCESSED VIA SIDEBAR) */}
          {activeTab === 'cms-logo' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <LogoManagement
                currentLogoUrl={localSettings.coopLogoUrl}
                onUpdateLogo={(newUrl) => {
                  const updated = { ...localSettings, coopLogoUrl: newUrl };
                  setLocalSettings(updated);
                  if (onUpdateCmsSettings) onUpdateCmsSettings(updated);
                  triggerToast('Website logo updated and saved to database successfully!');
                }}
                onExitToWebsite={onExitToWebsite}
              />
            </div>
          )}

          {activeTab === 'cms-news' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <NewsActivitiesManager
                items={localNewsActivities}
                onSaveItems={handleSaveNewsActivities}
              />
            </div>
          )}

          {activeTab === 'cms-suggestions' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <SuggestionBoxManager
                suggestions={localSuggestions}
                onSaveSuggestions={handleSaveSuggestions}
              />
            </div>
          )}

          {activeTab === 'cms-faqs' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <FaqManager
                faqs={localFaqs}
                onSaveFaqs={handleSaveFaqs}
              />
            </div>
          )}
          {activeTab === 'cms-services' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <ServicesManager
                services={localServices}
                onSaveServices={handleSaveServices}
              />
            </div>
          )}

          {activeTab === 'cms-digital-services' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <DigitalServicesManager
                onSaveServices={handleSaveServices}
              />
            </div>
          )}

          {activeTab === 'cms-profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <OrganizationProfileManager
                pages={localCmsPages}
                onSavePages={handleSaveCmsPages}
                historyMilestones={localHistoryMilestones}
                onSaveHistoryMilestones={handleSaveHistoryMilestones}
                whyChooseUs={localWhyChooseUs}
                onSaveWhyChooseUs={handleSaveWhyChooseUs}
                team={localTeam}
                onSaveTeam={handleSaveTeam}
                institutionalProfiles={localInstitutionalProfiles}
                onSaveInstitutionalProfiles={handleSaveInstitutionalProfiles}
                onOpenLeadershipMessages={() => setActiveTab('cms-leadership')}
              />
            </div>
          )}

          {activeTab === 'cms-institutional-profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <InstitutionalProfileManager
                profiles={localInstitutionalProfiles}
                onSave={handleSaveInstitutionalProfiles}
                monthlyReports={localMonthlyReports}
                onSaveMonthlyReports={handleSaveMonthlyReports}
              />
            </div>
          )}

          {activeTab === 'exchange-rates' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <ExchangeRatesManager
                rates={localExchangeRates}
                onSave={handleSaveExchangeRates}
              />
            </div>
          )}

          {activeTab === 'cms-history' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <HistoryMilestonesManager
                data={localHistoryMilestones}
                onSave={handleSaveHistoryMilestones}
              />
            </div>
          )}

          {activeTab === 'cms-why-choose-us' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <WhyChooseUsManager
                data={localWhyChooseUs}
                onSave={handleSaveWhyChooseUs}
              />
            </div>
          )}

          {activeTab === 'cms-departments' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <DepartmentsManager
                departments={localDepartments}
                onSaveDepartments={handleSaveDepartments}
              />
            </div>
          )}

          {activeTab === 'cms-branches' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <ServiceCentersManager
                serviceCenters={localServiceCenters}
                onSaveServiceCenters={handleSaveServiceCenters}
              />
            </div>
          )}

          {activeTab === 'cms-reports' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <ReportsManager
                reports={localReports}
                onSaveReports={handleSaveReports}
              />
            </div>
          )}

          {activeTab === 'cms-careers' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <CareersManager
                careers={localCareers}
                onSaveCareers={handleSaveCareers}
              />
            </div>
          )}

          {activeTab === 'cms-leadership' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <LeadershipManager
                initialMembers={localLeadershipMembers}
                onUpdate={handleSaveLeadershipMembers}
              />
            </div>
          )}

          {activeTab === 'cms-team' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <TeamManager
                team={localTeam}
                onSaveTeam={handleSaveTeam}
                defaultView="bod-tree"
              />
            </div>
          )}

          {activeTab === 'cms-management' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <TeamManager
                team={localTeam}
                onSaveTeam={handleSaveTeam}
                defaultView="management"
              />
            </div>
          )}

          {activeTab === 'cms-headoffice' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <HeadOfficeManager
                headOffice={localHeadOffice}
                onSave={handleSaveHeadOffice}
                showToast={(msg) => triggerToast(msg)}
              />
            </div>
          )}

          {activeTab === 'cms-grievances' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <GrievanceManager
                officer={localGrievanceOfficer}
                grievances={localGrievances || []}
                onSaveOfficer={handleSaveGrievanceOfficer}
                onSaveGrievances={handleSaveGrievances}
              />
            </div>
          )}

          {activeTab === 'cms-privacy' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <PrivacyPolicyManager
                policy={localPrivacyPolicy}
                onSave={handleSavePrivacyPolicy}
              />
            </div>
          )}

          {activeTab === 'cms-social' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <SocialLinksManager
                socialLinks={localSocialLinks}
                onSave={handleSaveSocialLinks}
              />
            </div>
          )}

          {activeTab === 'cms-theme' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <BrandThemeManager
                theme={localBrandTheme}
                onSave={handleSaveBrandTheme}
              />
            </div>
          )}

          {activeTab === 'cms-documents' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <DocumentsManager
                documents={localDocuments}
                onSaveDocuments={handleSaveDocuments}
              />
            </div>
          )}

          {/* TAB 3: eKYM APPLICATIONS QUEUE */}
          {activeTab === 'ekym' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              {/* Header & Controls */}
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-sky-100 text-[#0981ae]">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        eKYM Member Applications Queue
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-300">
                          <Database className="w-3 h-3 text-sky-700" />
                          Live Database
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Directly synchronized with SQLite database (ekata_coop.sqlite). Manage member verification, review dossier, and update status.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    id="btn-admin-refresh-ekym"
                    type="button"
                    onClick={loadEkymData}
                    disabled={ekymLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#0981ae] ${ekymLoading ? 'animate-spin' : ''}`} />
                    <span>{ekymLoading ? 'Syncing...' : 'Refresh Database'}</span>
                  </button>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0981ae] text-white shadow-2xs">
                    {ekymList.length} Total Submissions
                  </span>
                </div>
              </div>

              {/* Database Error Banner if any */}
              {ekymError && (
                <div className="mx-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{ekymError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={loadEkymData}
                    className="font-bold underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Filter Tabs & Search Bar */}
              <div className="px-6 flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
                  {(['All', 'Pending', 'Approved', 'Returned', 'Rejected'] as const).map((tab) => {
                    const count = tab === 'All'
                      ? ekymList.length
                      : ekymList.filter((item) => item.status === tab).length;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setEkymFilter(tab)}
                        className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                          ekymFilter === tab
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{tab}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          tab === 'Approved' ? 'bg-sky-100 text-sky-800' :
                          tab === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          tab === 'Returned' ? 'bg-blue-100 text-blue-800' :
                          tab === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ekymSearchQuery}
                    onChange={(e) => setEkymSearchQuery(e.target.value)}
                    placeholder="Search name, app no, mobile, citizenship..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0981ae] focus:bg-white"
                  />
                  {ekymSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setEkymSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto border-t border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 whitespace-nowrap">Application Number & Date</th>
                      <th className="p-3.5 whitespace-nowrap">Applicant Name</th>
                      <th className="p-3.5 whitespace-nowrap">Personal & Lineage Info</th>
                      <th className="p-3.5 whitespace-nowrap">Citizenship & Address</th>
                      <th className="p-3.5 whitespace-nowrap">Bank & Nominee</th>
                      <th className="p-3.5 whitespace-nowrap">Application Status</th>
                      <th className="p-3.5 whitespace-nowrap min-w-[200px]">Remarks</th>
                      <th className="p-3.5 whitespace-nowrap text-right min-w-[240px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ekymList
                      .filter((ek) => {
                        if (ekymFilter !== 'All' && ek.status !== ekymFilter) return false;
                        if (!ekymSearchQuery) return true;
                        const q = ekymSearchQuery.toLowerCase();
                        return (
                          ek.applicationNo.toLowerCase().includes(q) ||
                          ek.fullNameEn.toLowerCase().includes(q) ||
                          (ek.fullNameNp && ek.fullNameNp.toLowerCase().includes(q)) ||
                          ek.phone.toLowerCase().includes(q) ||
                          ek.citizenshipNo.toLowerCase().includes(q)
                        );
                      })
                      .map((ek) => (
                        <tr key={ek.id} className="hover:bg-slate-50/80 transition">
                          {/* 1. Application Number & Submission Date */}
                          <td className="p-3.5 align-top">
                            <span className="font-mono font-bold text-slate-900 block bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                              {ek.applicationNo}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{ek.submittedAt}</span>
                            </div>
                          </td>

                          {/* 2. Applicant Name & Photo */}
                          <td className="p-3.5 align-top">
                            <div className="flex items-start gap-2.5">
                              {ek.memberPhoto || ek.details?.memberPhoto ? (
                                <img
                                  src={ek.memberPhoto || ek.details?.memberPhoto}
                                  alt={ek.fullNameEn}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-sky-500 shrink-0 shadow-2xs cursor-pointer hover:opacity-90"
                                  onClick={() => {
                                    setSelectedEkym(ek);
                                    setIsDetailsModalOpen(true);
                                  }}
                                  title="Click to view full dossier"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-300">
                                  {ek.fullNameEn.charAt(0)}
                                </div>
                              )}
                              <div>
                                <strong className="text-slate-900 block text-sm font-bold">{ek.fullNameEn}</strong>
                                {ek.fullNameNp && (
                                  <span className="text-slate-600 block text-xs">{ek.fullNameNp}</span>
                                )}
                                <div className="text-[11px] text-sky-800 font-medium mt-1 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-sky-600" />
                                  <span>{ek.phone}</span>
                                </div>
                                {ek.email && (
                                  <span className="text-[10px] text-slate-400 block">{ek.email}</span>
                                )}
                                <div className="mt-1 flex items-center gap-1 flex-wrap">
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                    ek.citizenshipFront || ek.details?.citizenshipFront ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    Front: {ek.citizenshipFront || ek.details?.citizenshipFront ? '✓' : '—'}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                    ek.citizenshipBack || ek.details?.citizenshipBack ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    Back: {ek.citizenshipBack || ek.details?.citizenshipBack ? '✓' : '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Personal & Lineage Info */}
                          <td className="p-3.5 align-top text-[11px] space-y-0.5">
                            <div><span className="text-slate-400">Father:</span> <strong>{ek.fatherName}</strong></div>
                            <div><span className="text-slate-400">GF:</span> {ek.grandfatherName}</div>
                            {ek.spouseName && (
                              <div><span className="text-slate-400">Spouse:</span> {ek.spouseName}</div>
                            )}
                            <div className="pt-1 text-[10px] text-slate-500">
                              DOB: {ek.dob} &bull; {ek.gender}
                            </div>
                            <div className="text-[10px] text-sky-700 font-semibold">
                              {ek.occupation} ({ek.annualIncome})
                            </div>
                          </td>

                          {/* 4. Citizenship & Address */}
                          <td className="p-3.5 align-top">
                            <div>
                              <span className="font-bold text-slate-800">{ek.citizenshipNo}</span>
                              <span className="text-[11px] text-slate-500 block">
                                Dist: {ek.citizenshipDistrict}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1.5 max-w-[200px] line-clamp-2">
                              {ek.permanentAddress}
                            </p>
                          </td>

                          {/* 5. Bank & Nominee */}
                          <td className="p-3.5 align-top text-[11px] space-y-1">
                            <div>
                              <span className="text-slate-400 block">Bank A/C:</span>
                              <span className="font-medium text-slate-800">{ek.bankName}</span>
                              <span className="font-mono text-[10px] text-slate-500 block">{ek.bankAccountNo}</span>
                            </div>
                            <div className="pt-1 border-t border-slate-100">
                              <span className="text-slate-400 block">Nominee:</span>
                              <span className="font-semibold text-slate-800">{ek.nomineeName}</span>
                              <span className="text-slate-500 text-[10px]"> ({ek.nomineeRelation})</span>
                            </div>
                          </td>

                          {/* 6. Application Status */}
                          <td className="p-3.5 align-top">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 border ${
                                ek.status === 'Approved'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : ek.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : ek.status === 'Returned'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-red-50 text-red-800 border-red-300'
                              }`}
                            >
                              {ek.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-sky-600" />}
                              {ek.status === 'Pending' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                              {ek.status === 'Returned' && <RotateCcw className="w-3 h-3 text-blue-600" />}
                              {ek.status === 'Rejected' && <XCircle className="w-3 h-3 text-red-600" />}
                              {ek.status}
                            </span>
                          </td>

                          {/* 7. Remarks */}
                          <td className="p-3.5 align-top">
                            <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] text-slate-700 max-w-[220px]">
                              {ek.remarks ? (
                                <p className="line-clamp-3">{ek.remarks}</p>
                              ) : (
                                <span className="text-slate-400 italic">No remarks recorded</span>
                              )}
                            </div>
                          </td>

                          {/* 8. Actions: View Details, Approve, Reject/Return */}
                          <td className="p-3.5 align-top text-right">
                            <div className="flex flex-col gap-1.5 items-end">
                              {/* View Details Button */}
                              <button
                                id={`btn-view-details-${ek.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedEkym(ek);
                                  setIsDetailsModalOpen(true);
                                }}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-300 cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#0981ae]" />
                                <span>View Details</span>
                              </button>

                              {/* Decision Action Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  id={`btn-approve-${ek.id}`}
                                  type="button"
                                  onClick={() =>
                                    setRemarksDialog({
                                      isOpen: true,
                                      record: ek,
                                      status: 'Approved',
                                      remarks: 'Verified KYC credentials and approved for cooperative membership.',
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                                  title="Approve Member Application"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  id={`btn-return-${ek.id}`}
                                  type="button"
                                  onClick={() =>
                                    setRemarksDialog({
                                      isOpen: true,
                                      record: ek,
                                      status: 'Returned',
                                      remarks: 'Returned to applicant for missing documentation update.',
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                                  title="Return Application for Revision"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Return</span>
                                </button>

                                <button
                                  id={`btn-reject-${ek.id}`}
                                  type="button"
                                  onClick={() =>
                                    setRemarksDialog({
                                      isOpen: true,
                                      record: ek,
                                      status: 'Rejected',
                                      remarks: 'Application rejected due to verification discrepancy.',
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                                  title="Reject Application"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {ekymList.length === 0 && !ekymLoading && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          <p className="text-sm font-semibold">No eKYM applications found in the database.</p>
                          <p className="text-xs text-slate-400 mt-1">
                            New applications submitted through the e-KYM wizard will appear here immediately.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LOAN APPLICATIONS (FULL CRUD & DOWNLOAD DOSSIER) */}
          {activeTab === 'loans' && (
            <LoanApplicationsManager
              loans={loanList}
              loading={loanLoading}
              onRefresh={loadLoanData}
              onLoansChange={(updated) => setLoanList(updated)}
              rates={localRates}
              serviceCenters={localServiceCenters}
              coopLogoUrl={localSettings.coopLogoUrl || cmsSettings?.coopLogoUrl || ''}
              onTriggerToast={triggerToast}
            />
          )}

          {/* TAB 5: MEMBER REGISTRY */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>👥</span> Core Banking Member Registry
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Live account balances, savings passbooks, and share equity
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 font-semibold">
                    {memberList.length} Active Accounts
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(true)}
                    className="bg-[#0981ae] hover:bg-[#07678d] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>➕</span> Register New Member
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Member Code</th>
                      <th className="p-3.5">Full Name</th>
                      <th className="p-3.5">Branch</th>
                      <th className="p-3.5">Share Equity</th>
                      <th className="p-3.5">Regular Savings</th>
                      <th className="p-3.5">Loan Balance</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 font-bold text-slate-900 font-mono">{m.memberCode}</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">{m.fullName}</strong>
                          <span className="text-[11px] text-slate-500">📱 {m.phone}</span>
                        </td>
                        <td className="p-3.5">{m.branch}</td>
                        <td className="p-3.5 font-semibold">Rs. {m.shareAmount.toLocaleString()}</td>
                        <td className="p-3.5">
                          <strong className="text-[#0981ae] font-bold">
                            Rs. {m.regularSavingBalance.toLocaleString()}
                          </strong>
                        </td>
                        <td className="p-3.5 font-semibold text-rose-700">Rs. {m.loanBalance.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-sky-100 text-sky-800">
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptModalData({
                                memberCode: m.memberCode,
                                memberName: m.fullName,
                                type: 'Deposit',
                                amount: 5000,
                                refNo: 'SLIP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                                date: new Date().toISOString().split('T')[0],
                              });
                            }}
                            className="text-[11px] bg-slate-100 hover:bg-[#0981ae] hover:text-white text-slate-700 font-bold px-2.5 py-1 rounded transition cursor-pointer"
                          >
                            🧾 Cash Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: NOTICES */}
          {activeTab === 'notices' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <span>📢</span> Notices & Bulletins Publisher
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage website popup alerts (stored directly in MySQL) and general announcements
                  </p>
                </div>
                {/* Subtab Switcher */}
                <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNoticeSubTab('popup-mysql')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      noticeSubTab === 'popup-mysql'
                        ? 'bg-[#0981ae] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔔 Website Popup Notice (Live in MySQL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeSubTab('board')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      noticeSubTab === 'board'
                        ? 'bg-[#0981ae] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 General Board Notices
                  </button>
                </div>
              </div>

              {/* SUBTAB 1: POPUP NOTICES (MYSQL DATABASE DIRECT) */}
              {noticeSubTab === 'popup-mysql' && (
                <div className="space-y-6">
                  {/* Database Info Banner */}
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0981ae] text-white flex items-center justify-center font-bold">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-sky-950">
                          MySQL Database Backend: `popup_notices` Table
                        </h4>
                        <p className="text-[11px] text-sky-700">
                          Notices created here are directly written to MySQL and show up immediately in the website entrance popup modal.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={loadPopupNoticesFromDb}
                      disabled={popupLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sky-300 text-sky-800 text-xs font-bold rounded-lg hover:bg-sky-100 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${popupLoading ? 'animate-spin' : ''}`} />
                      Refresh from MySQL
                    </button>
                  </div>

                  {/* Create New Popup Notice in MySQL */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>✍️</span> Write New Popup Notice to MySQL Database
                    </h4>

                    <form onSubmit={handleCreatePopupNotice} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Notice Title (English) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Special Festive Agricultural Loan 2083"
                            value={popupTitleEn}
                            onChange={(e) => setPopupTitleEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Notice Title (नेपाली)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. विशेष चाडपर्व तथा कृषि कर्जा २०८३"
                            value={popupTitleNp}
                            onChange={(e) => setPopupTitleNp(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Category (English)
                          </label>
                          <input
                            type="text"
                            value={popupCategoryEn}
                            onChange={(e) => setPopupCategoryEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Category (नेपाली)
                          </label>
                          <input
                            type="text"
                            value={popupCategoryNp}
                            onChange={(e) => setPopupCategoryNp(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Notice Ref / दर्ता नं.
                          </label>
                          <input
                            type="text"
                            value={popupNoticeRef}
                            onChange={(e) => setPopupNoticeRef(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Notice Written Content (English) *
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Write the full announcement text here..."
                            value={popupContentEn}
                            onChange={(e) => setPopupContentEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white resize-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Notice Written Content (नेपाली)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="नेपालीमा पूरा विवरण यहाँ लेख्नुहोस्..."
                            value={popupContentNp}
                            onChange={(e) => setPopupContentNp(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Bullet Points (English - 1 per line)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Special subsidy at 8.75%&#10;Fast approval within 48 hours"
                            value={popupBulletsEn}
                            onChange={(e) => setPopupBulletsEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Bullet Points (नेपाली - १ प्रति हरफ)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="वार्षिक ८.७५% सहुलियत ब्याजदर&#10;४८ घण्टाभित्रै कर्जा स्वीकृति"
                            value={popupBulletsNp}
                            onChange={(e) => setPopupBulletsNp(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Notice Banner Image (Upload, Preview, Replace & Delete)
                          </label>
                          <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white">
                            {popupImageUrl ? (
                              <img
                                src={popupImageUrl}
                                alt="Notice Banner"
                                className="w-12 h-10 object-cover rounded border border-slate-200 shrink-0 cursor-pointer"
                                onClick={() => setPreviewMediaUrl(popupImageUrl)}
                              />
                            ) : (
                              <div className="w-12 h-10 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
                                None
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <label className="px-2.5 py-1 bg-[#0981ae] hover:bg-[#065371] text-white rounded text-[11px] font-bold cursor-pointer transition-colors">
                                <span>
                                  {uploadingImageTarget === 'notice-banner'
                                    ? '⏳...'
                                    : popupImageUrl
                                    ? '🔄 Replace'
                                    : '📤 Upload'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingImageTarget === 'notice-banner'}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleUploadNoticeBanner(f);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              {popupImageUrl && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewMediaUrl(popupImageUrl)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleDeleteNoticeBanner}
                                    disabled={uploadingImageTarget === 'notice-banner'}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-bold cursor-pointer"
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Action Button Label (English)
                          </label>
                          <input
                            type="text"
                            value={popupActionTextEn}
                            onChange={(e) => setPopupActionTextEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Action Link (#ekym, #rates, etc.)
                          </label>
                          <input
                            type="text"
                            value={popupActionLink}
                            onChange={(e) => setPopupActionLink(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={popupSaving}
                          className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#065371] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Database className="w-4 h-4" />
                          {popupSaving ? 'Saving to MySQL...' : 'Save Notice to MySQL Database'}
                        </button>
                        <span className="text-[11px] text-slate-500">
                          Data is immediately saved to MySQL server port 3306.
                        </span>
                      </div>
                    </form>
                  </div>

                  {/* List of Popup Notices in MySQL */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 mb-3 flex items-center justify-between">
                      <span>Existing Notices in MySQL Database ({popupNoticesList.length})</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        Active notices appear in the popup carousel on the homepage
                      </span>
                    </h4>

                    {popupNoticesList.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                        No popup notices currently in MySQL. Use the form above to write and publish one!
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Status</th>
                              <th className="p-3">Banner Image</th>
                              <th className="p-3">Title & Category</th>
                              <th className="p-3">Notice Reference</th>
                              <th className="p-3">Date</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {popupNoticesList.map((n) => (
                              <tr key={n.id} className="hover:bg-slate-50/70">
                                <td className="p-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleNoticeActive(n.id)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                                      n.active
                                        ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {n.active ? '🟢 Active' : '⚪ Inactive'}
                                  </button>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    {n.imageUrl ? (
                                      <img
                                        src={n.imageUrl}
                                        alt={n.titleEn}
                                        className="w-12 h-9 object-cover rounded border border-slate-200 cursor-pointer shrink-0"
                                        onClick={() => setPreviewMediaUrl(n.imageUrl!)}
                                      />
                                    ) : (
                                      <div className="w-12 h-9 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
                                        None
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      {n.imageUrl && (
                                        <button
                                          type="button"
                                          onClick={() => setPreviewMediaUrl(n.imageUrl!)}
                                          className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                                          title="Preview Banner"
                                        >
                                          👁️
                                        </button>
                                      )}
                                      <label
                                        className="px-1.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[10px] font-bold cursor-pointer"
                                        title={n.imageUrl ? 'Replace Banner' : 'Upload Banner'}
                                      >
                                        <span>{uploadingImageTarget === `popup-notice-${n.id}` ? '⏳' : n.imageUrl ? '🔄' : '📤'}</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          disabled={uploadingImageTarget === `popup-notice-${n.id}`}
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleReplaceExistingNoticeBanner(n.id, n.imageUrl, f);
                                            e.target.value = '';
                                          }}
                                        />
                                      </label>
                                      {n.imageUrl && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteExistingNoticeBanner(n.id, n.imageUrl)}
                                          disabled={uploadingImageTarget === `popup-notice-${n.id}`}
                                          className="px-1.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-bold cursor-pointer"
                                          title="Delete Banner Image"
                                        >
                                          🗑️
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 max-w-xs">
                                  <strong className="text-slate-900 block truncate">{n.titleEn}</strong>
                                  <span className="text-slate-500 text-[11px] block truncate">{n.titleNp}</span>
                                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                                    {n.categoryEn}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-[11px] text-slate-600">
                                  {n.noticeRef || 'N/A'}
                                </td>
                                <td className="p-3 text-slate-500 text-[11px]">
                                  {n.dateEn || n.dateNp}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleNoticeActive(n.id)}
                                    className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-[11px] font-semibold transition"
                                  >
                                    {n.active ? 'Disable' : 'Enable'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePopupItem(n.id)}
                                    className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[11px] font-bold transition"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: GENERAL BOARD NOTICES */}
              {noticeSubTab === 'board' && (
                <div className="space-y-6">
                  {/* Add Notice */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h4 className="font-bold text-xs text-slate-800">➕ Publish New General Notice</h4>
                    <form onSubmit={handleAddNotice} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Title (English)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 24th AGM Circular"
                            value={newNoticeTitleEn}
                            onChange={(e) => setNewNoticeTitleEn(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Title (नेपाली)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. २४औं साधारण सभा सूचना"
                            value={newNoticeTitleNp}
                            onChange={(e) => setNewNoticeTitleNp(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Category
                          </label>
                          <select
                            value={newNoticeCategory}
                            onChange={(e) => setNewNoticeCategory(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                          >
                            <option value="AGM Notice">AGM Notice</option>
                            <option value="Interest Rates">Interest Rates</option>
                            <option value="Career">Career & Vacancy</option>
                            <option value="General">General Notice</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0981ae] hover:bg-[#065371] text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Publish Notice to Website
                      </button>
                    </form>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Notice Title</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {localNotices.map((n) => (
                          <tr key={n.id} className="hover:bg-slate-50/70">
                            <td className="p-3">
                              <strong className="text-slate-900 block">{n.titleEn}</strong>
                              <span className="text-slate-500 text-[11px]">{n.titleNp}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                {n.category}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{n.date}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => handleDeleteNotice(n.id)}
                                className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-[10px] font-bold"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: INTEREST RATES */}
          {activeTab === 'rates' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <InterestRatesManager
                rates={localRates}
                onRatesUpdated={(updated) => {
                  setLocalRates(updated);
                  if (onUpdateRates) onUpdateRates(updated);
                  triggerToast('Interest rate schedule updated and synchronized!');
                }}
              />
            </div>
          )}

          {/* TAB 8: ACCOUNTING & DAY-END CLOSING (EOD) */}
          {activeTab === 'accounting' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>📑</span> Day-End CBS Closing & Vault Cash Reconciliation (EOD)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Daily cashier vault audit, teller drawer balance reconciliation, interest accrual, and general ledger lock.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRunEod}
                      disabled={isEodExecuted}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                        isEodExecuted
                          ? 'bg-sky-100 text-sky-800 border border-sky-300 cursor-not-allowed'
                          : 'bg-[#0981ae] hover:bg-[#07678d] text-white'
                      }`}
                    >
                      <span>{isEodExecuted ? '✓' : '⚡'}</span>
                      {isEodExecuted ? `EOD Completed (${eodBatchTime})` : 'Execute Day-End Batch (EOD)'}
                    </button>
                  </div>
                </div>

                {isEodExecuted ? (
                  <div className="mt-4 p-4 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sky-600 text-lg">✅</span>
                      <div>
                        <strong className="block font-bold">CBS Day-End Closing Batch Finished at {eodBatchTime}</strong>
                        <span>All counter cash books balanced, daily savings interest calculated, and ledger locked for the date.</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-sky-300 text-sky-800 font-bold">
                      BATCH-REF-EOD-2083-05-12
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <span className="text-amber-600 text-lg">⚠️</span>
                    <span>
                      Counter cash drawers are currently active. Verify the physical currency count below before executing Day-End Closing.
                    </span>
                  </div>
                )}

                {/* Vault Financial Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Opening Vault Cash</span>
                    <strong className="text-sm font-bold text-slate-900 font-mono">
                      Rs. {vaultOpeningCash.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-sky-50/40">
                    <span className="text-[11px] font-semibold text-sky-700 block mb-1">+ Counter Deposits</span>
                    <strong className="text-sm font-bold text-sky-800 font-mono">
                      Rs. {counterCashDeposits.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-rose-50/40">
                    <span className="text-[11px] font-semibold text-rose-700 block mb-1">- Cash Withdrawals</span>
                    <strong className="text-sm font-bold text-rose-800 font-mono">
                      Rs. {counterCashWithdrawals.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-sky-50/40">
                    <span className="text-[11px] font-semibold text-sky-700 block mb-1">+ Digital / QR Net</span>
                    <strong className="text-sm font-bold text-sky-800 font-mono">
                      Rs. {digitalQrSettlements.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border-2 border-[#0981ae]/30 bg-sky-50/60 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-[#0981ae] block mb-1">Expected Vault Balance</span>
                    <strong className="text-sm font-bold text-[#0981ae] font-mono">
                      Rs. {expectedClosingVault.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Physical Denomination Sheet & General Ledger Trial Balance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Physical Denominations */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>💵</span> Physical Cash Denomination Tally
                    </h3>
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      Zero Cash Discrepancy (Rs. 0.00)
                    </span>
                  </div>

                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 font-bold border-b border-slate-200 bg-slate-50/50">
                      <tr>
                        <th className="p-2.5">Note (Rs.)</th>
                        <th className="p-2.5 text-center">Quantity</th>
                        <th className="p-2.5 text-right">Total Amount (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="p-2.5 font-bold">1,000</td>
                        <td className="p-2.5 text-center">1,500 pcs</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">1,500,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">500</td>
                        <td className="p-2.5 text-center">850 pcs</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">425,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">100</td>
                        <td className="p-2.5 text-center">950 pcs</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">95,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">50</td>
                        <td className="p-2.5 text-center">300 pcs</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">15,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">20</td>
                        <td className="p-2.5 text-center">200 pcs</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">4,000</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">10</td>
                        <td className="p-2.5 text-center">150 pcs</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">1,500</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="p-2.5">Total Physical Cash</td>
                        <td className="p-2.5 text-center">3,950 notes</td>
                        <td className="p-2.5 text-right text-[#0981ae]">Rs. 2,040,500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Trial Balance & Compliance Checks */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>⚖️</span> CBS General Ledger & Statutory Liquidity
                      </h3>
                      <span className="text-[11px] font-bold text-[#0981ae] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                        Balanced (Debit = Credit)
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div>
                          <strong className="block text-slate-900">Total Assets (Loan Portfolio + Vault + Bank)</strong>
                          <span className="text-slate-500 text-[11px]">Primary liquidity & member credit exposures</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">Rs. 1,280,000,000</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div>
                          <strong className="block text-slate-900">Total Liabilities & Member Equity</strong>
                          <span className="text-slate-500 text-[11px]">Member savings, share capital, and institutional reserve</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">Rs. 1,280,000,000</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50/60 border border-sky-200 text-sky-900">
                        <div>
                          <strong className="block">Statutory Liquidity Ratio (SLR)</strong>
                          <span className="text-[11px] text-sky-700">Cooperative Act statutory requirement: &gt; 15%</span>
                        </div>
                        <span className="font-mono font-bold text-sky-800 text-sm">18.42% (Optimal)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Authorized by: <strong>Chief Executive Officer</strong></span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                    >
                      🖨️ Print EOD Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AGM SHARE DIVIDEND & PATRONAGE */}
          {activeTab === 'dividend' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>💰</span> AGM Share Dividend & Patronage Distribution Engine
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure proposed AGM dividend percentage, compute 5% Government Withholding Tax (TDS), and auto-credit members' savings accounts.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleExportDividendCsv}
                      className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📥</span> Export Schedule (CSV)
                    </button>
                    <button
                      type="button"
                      onClick={handlePostDividendBatch}
                      disabled={dividendPosted}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                        dividendPosted
                          ? 'bg-sky-100 text-sky-800 border border-sky-300 cursor-not-allowed'
                          : 'bg-[#0981ae] hover:bg-[#07678d] text-white'
                      }`}
                    >
                      <span>{dividendPosted ? '✓' : '⚡'}</span>
                      {dividendPosted ? 'Dividends Credited to Passbooks' : 'Post All Dividends to Savings'}
                    </button>
                  </div>
                </div>

                {/* Configuration Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Proposed Share Dividend Rate: <span className="text-[#0981ae] text-sm">{dividendRate}%</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="0.5"
                      value={dividendRate}
                      disabled={dividendPosted}
                      onChange={(e) => setDividendRate(parseFloat(e.target.value))}
                      className="w-full accent-[#0981ae] cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-500">Cooperative Act ceiling: 18.00%</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patronage Refund Ratio: <span className="text-sky-700 text-sm">{patronageRate}%</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={patronageRate}
                      disabled={dividendPosted}
                      onChange={(e) => setPatronageRate(parseFloat(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-500">Based on annual interest contribution</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Government TDS Rate (Withholding): <span className="text-slate-900 text-sm">5.00%</span>
                    </label>
                    <div className="p-2 bg-white rounded border border-slate-300 text-xs font-semibold text-slate-700">
                      Standard Income Tax deduction
                    </div>
                    <span className="text-[11px] text-slate-500">Deducted at source automatically</span>
                  </div>
                </div>

                {/* Distribution Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Share Equity</span>
                    <strong className="text-sm font-bold text-slate-900 font-mono">Rs. 24,500,000</strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-amber-50/50">
                    <span className="text-[11px] font-semibold text-amber-700 block mb-1">Gross Dividend Payout</span>
                    <strong className="text-sm font-bold text-amber-900 font-mono">
                      Rs. {Math.round((24500000 * dividendRate) / 100).toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-rose-50/50">
                    <span className="text-[11px] font-semibold text-rose-700 block mb-1">5% TDS Tax to Govt</span>
                    <strong className="text-sm font-bold text-rose-900 font-mono">
                      Rs. {Math.round((24500000 * dividendRate * 0.05) / 100).toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-lg border-2 border-[#0981ae]/30 bg-sky-50/60">
                    <span className="text-[11px] font-semibold text-[#0981ae] block mb-1">Net Member Savings Credit</span>
                    <strong className="text-sm font-bold text-[#0981ae] font-mono">
                      Rs. {Math.round((24500000 * dividendRate * 0.95) / 100).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Member Dividend Breakdown Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Member-by-Member Distribution Schedule ({dividendRate}%)
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {memberList.length} Active Shareholders
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Member Code</th>
                        <th className="p-3.5">Full Name</th>
                        <th className="p-3.5">Share Capital</th>
                        <th className="p-3.5">Gross Dividend</th>
                        <th className="p-3.5">5% Tax (TDS)</th>
                        <th className="p-3.5">Net Credit</th>
                        <th className="p-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {memberList.map((m) => {
                        const gross = Math.round((m.shareAmount * dividendRate) / 100);
                        const tax = Math.round((gross * 5) / 100);
                        const net = gross - tax;
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/60">
                            <td className="p-3.5 font-bold text-slate-900">{m.memberCode}</td>
                            <td className="p-3.5 font-sans font-semibold text-slate-900">{m.fullName}</td>
                            <td className="p-3.5">Rs. {m.shareAmount.toLocaleString()}</td>
                            <td className="p-3.5 font-semibold text-amber-700">Rs. {gross.toLocaleString()}</td>
                            <td className="p-3.5 text-rose-600">-Rs. {tax.toLocaleString()}</td>
                            <td className="p-3.5 font-bold text-[#0981ae]">Rs. {net.toLocaleString()}</td>
                            <td className="p-3.5 text-right font-sans">
                              {dividendPosted ? (
                                <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Credited ✓
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Ready
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SECURITY AUDIT TRAIL & SYSTEM LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>🛡️</span> Core Banking Security Audit Trail & Event Logs
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Immutable operational audit logs tracking vault movements, interest rate revisions, loan disbursements, and member compliance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleExportAuditLogs}
                      className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📥</span> Export Audit Log (CSV)
                    </button>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {['ALL', 'CBS_EOD', 'LOAN_EVAL', 'CASH_COUNTER', 'EKYM_COMPLIANCE', 'MEMBER_REGISTRATION', 'RATE_REVISION'].map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAuditFilterCat(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            auditFilterCat === cat
                              ? 'bg-[#0981ae] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'ALL' ? 'All Events' : cat.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>

                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search operator, event or detail..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Operator</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Action</th>
                        <th className="p-3.5">Event Details</th>
                        <th className="p-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3.5 font-semibold text-slate-900 whitespace-nowrap">{log.operator}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-semibold text-sky-800 whitespace-nowrap">
                            {log.action}
                          </td>
                          <td className="p-3.5 text-slate-700 max-w-md">{log.details}</td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-sky-100 text-sky-800">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: PURE PHP SYSTEM ARCHITECTURE */}
          {activeTab === 'php-system' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <span>⚙️</span> Complete Backend in Pure PHP Only
                </h2>
                <p className="text-xs text-slate-500">
                  Everything is implemented in self-contained native PHP 8.2 + SQLite CBS in the <code>php-version/</code> directory.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900">
                    🖥 Running the Pure PHP Application
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The entire system operates on any standard Apache, Nginx, cPanel, XAMPP, or LAMP stack without requiring Node.js or any external servers.
                  </p>
                  <pre className="bg-[#0f172a] text-sky-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`# Start standalone native PHP web server:
cd php-version
php -S 0.0.0.0:8000

# Access in browser:
http://localhost:8000/index.php   (Public Portal)
http://localhost:8000/admin.php   (Admin Console & CMS)`}
                  </pre>
                  <p className="text-[11px] text-slate-500">
                    Administrator login: <code>Protected Staff Session</code><br />
                    Member test login: <code>EK-10482</code> / <code>1234</code>
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900">
                    📂 Pure PHP Backend Structure
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>
                      <code>php-version/index.php</code>: Public portal with dynamic CMS integration
                    </li>
                    <li>
                      <code>php-version/admin.php</code>: Complete executive dashboard and frontend system CMS
                    </li>
                    <li>
                      <code>php-version/member.php</code>: Member digital passbook & statement ledger
                    </li>
                    <li>
                      <code>php-version/database.php</code>: PDO SQLite CBS & CMS schema initialization
                    </li>
                    <li>
                      <code>php-version/api.php</code>: JSON endpoints for eKYM, loans, and balance checks
                    </li>
                    <li>
                      <code>php-version/config.php</code>: Session, security, and credentials config
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: Register New Member */}
          {showAddMemberModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>➕</span> Register New Member Account
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateMember} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Member Account Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={newMemCode}
                        onChange={(e) => setNewMemCode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Branch Assignment
                      </label>
                      <select
                        value={newMemBranch}
                        onChange={(e) => setNewMemBranch(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                      >
                        <option value="Butwal Main Branch">Butwal Main Branch</option>
                        <option value="Manigram Service Point">Manigram Service Point</option>
                        <option value="Devdaha Counter">Devdaha Counter</option>
                        <option value="Drivertole Branch">Drivertole Branch</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar Shrestha"
                      value={newMemName}
                      onChange={(e) => setNewMemName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (Nepal Telecom / Ncell)
                    </label>
                    <input
                      type="text"
                      placeholder="98XXXXXXXX"
                      value={newMemPhone}
                      onChange={(e) => setNewMemPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Opening Share Equity (Rs.)
                      </label>
                      <input
                        type="number"
                        value={newMemShare}
                        onChange={(e) => setNewMemShare(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Initial Regular Savings (Rs.)
                      </label>
                      <input
                        type="number"
                        value={newMemSavings}
                        onChange={(e) => setNewMemSavings(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-[11px] text-sky-800">
                    ℹ️ Standard Member Passbook, Share Certificate, and Digital Banking PIN will be activated automatically upon enrollment.
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(false)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Enrol Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Printable Counter Voucher Slip */}
          {receiptModalData && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Cash Counter Voucher (भौचर)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setReceiptModalData(null)}
                    className="text-slate-400 hover:text-slate-600 text-base p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Printable Slip Container */}
                <div className="p-5 border border-slate-300 rounded-xl bg-amber-50/20 font-mono text-xs space-y-3">
                  <div className="text-center border-b border-dashed border-slate-300 pb-3">
                    <h4 className="font-bold font-sans text-sm text-slate-900">
                      ANKUR SAVINGS & CREDIT CO-OPERATIVE LTD.
                    </h4>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Butwal-4, Rupandehi, Lumbini Province | Regd: 421/057/058
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">
                      CASH DEPOSIT / WITHDRAWAL VOUCHER
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Voucher No:</span>
                      <strong className="text-slate-900">{receiptModalData.refNo}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Date:</span>
                      <strong className="text-slate-900">{receiptModalData.date}</strong>
                    </div>
                  </div>

                  <div className="border-t border-b border-dashed border-slate-200 py-2.5 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Member A/C:</span>
                      <strong className="text-slate-900">{receiptModalData.memberCode}</strong>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-slate-500">Member Name:</span>
                      <strong className="text-slate-900">{receiptModalData.memberName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Particulars:</span>
                      <span className="text-slate-700">Regular Savings {receiptModalData.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-sky-50 p-2.5 rounded border border-sky-200">
                    <span className="font-bold text-slate-700">Amount (Rs.):</span>
                    <strong className="text-base text-[#0981ae]">
                      Rs. {receiptModalData.amount.toLocaleString()}
                    </strong>
                  </div>

                  <div className="pt-6 grid grid-cols-2 gap-6 text-center text-[10px] text-slate-500 font-sans">
                    <div className="border-t border-slate-300 pt-1">
                      <span>Depositor Signature</span>
                    </div>
                    <div className="border-t border-slate-300 pt-1">
                      <span>Authorized Teller / Cashier</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setReceiptModalData(null)}
                    className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-1.5 bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    🖨️ Print Slip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* eKYM Applicant Details Modal */}
          <EkymDetailsModal
            record={selectedEkym}
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            onUpdateStatus={handleUpdateEkym}
            coopLogoUrl={localSettings.coopLogoUrl || cmsSettings?.coopLogoUrl || ''}
          />

          {/* Quick Decision & Remarks Dialog */}
          {remarksDialog.isOpen && remarksDialog.record && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {remarksDialog.status === 'Approved' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                    {remarksDialog.status === 'Returned' && <RotateCcw className="w-4 h-4 text-blue-600" />}
                    {remarksDialog.status === 'Rejected' && <XCircle className="w-4 h-4 text-red-600" />}
                    <span>Confirm Decision: Mark as {remarksDialog.status}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setRemarksDialog({ isOpen: false, record: null, status: 'Approved', remarks: '' })}
                    className="text-slate-400 hover:text-slate-600 text-base cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p>
                      <strong>Applicant:</strong> {remarksDialog.record.fullNameEn} ({remarksDialog.record.applicationNo})
                    </p>
                    <p className="mt-1 text-slate-500">
                      Citizenship: {remarksDialog.record.citizenshipNo} &bull; Phone: {remarksDialog.record.phone}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Remarks / Reason:
                    </label>
                    <textarea
                      value={remarksDialog.remarks}
                      onChange={(e) => setRemarksDialog({ ...remarksDialog, remarks: e.target.value })}
                      placeholder="Add administrative remarks or verification notes..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                      rows={3}
                    />
                  </div>

                  {/* Preset quick remarks */}
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Quick reason templates:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {remarksDialog.status === 'Approved' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setRemarksDialog({ ...remarksDialog, remarks: 'Verified KYC credentials, citizenship card, and approved by cooperative officer.' })}
                            className="text-[10px] bg-sky-50 hover:bg-sky-100 text-sky-800 px-2 py-1 rounded border border-sky-200 cursor-pointer"
                          >
                            All Documents Verified
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemarksDialog({ ...remarksDialog, remarks: 'Specimen signature card verified and approved.' })}
                            className="text-[10px] bg-sky-50 hover:bg-sky-100 text-sky-800 px-2 py-1 rounded border border-sky-200 cursor-pointer"
                          >
                            Signature Verified
                          </button>
                        </>
                      )}
                      {remarksDialog.status === 'Returned' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setRemarksDialog({ ...remarksDialog, remarks: 'Returned for re-upload: Citizenship photo is blurry or unreadable.' })}
                            className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200 cursor-pointer"
                          >
                            Blurry Citizenship
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemarksDialog({ ...remarksDialog, remarks: 'Returned for update: Permanent address does not match citizenship record.' })}
                            className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200 cursor-pointer"
                          >
                            Address Discrepancy
                          </button>
                        </>
                      )}
                      {remarksDialog.status === 'Rejected' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setRemarksDialog({ ...remarksDialog, remarks: 'Rejected: Applicant does not fall within the cooperative operating area.' })}
                            className="text-[10px] bg-red-50 hover:bg-red-100 text-red-800 px-2 py-1 rounded border border-red-200 cursor-pointer"
                          >
                            Outside Operating Area
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemarksDialog({ ...remarksDialog, remarks: 'Rejected: Duplicate application found in membership records.' })}
                            className="text-[10px] bg-red-50 hover:bg-red-100 text-red-800 px-2 py-1 rounded border border-red-200 cursor-pointer"
                          >
                            Duplicate Record
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRemarksDialog({ isOpen: false, record: null, status: 'Approved', remarks: '' })}
                    className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (remarksDialog.record) {
                        handleUpdateEkym(remarksDialog.record.id, remarksDialog.status, remarksDialog.remarks);
                        setRemarksDialog({ isOpen: false, record: null, status: 'Approved', remarks: '' });
                      }
                    }}
                    className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer ${
                      remarksDialog.status === 'Approved'
                        ? 'bg-sky-600 hover:bg-sky-700'
                        : remarksDialog.status === 'Returned'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    Confirm {remarksDialog.status}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Full-Screen Media Preview Lightbox Modal */}
          {previewMediaUrl && (
            <div
              className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setPreviewMediaUrl(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl border border-slate-200 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Server Media Preview</h3>
                    <p className="text-[11px] font-mono text-slate-500">{previewMediaUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewMediaUrl(null)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-center max-h-[70vh] overflow-auto border border-slate-200">
                  <img
                    src={previewMediaUrl}
                    alt="Media Preview"
                    className="max-h-[62vh] max-w-full object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Preeti Font-based Nepali Typing Assistant Toolbar */}
      <PreetiFloatingToolbar />
    </div>
  );
};
