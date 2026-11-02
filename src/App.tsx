import React, { useState, useEffect } from 'react';
import {
  Language,
  MegaMenuItem,
  ServiceItem,
  NoticeItem,
  GalleryItem,
  AuthUser,
  SiteSettingsCMS,
  CmsPagesState,
  DepartmentCMS,
  ServiceCenterCMS,
  ReportCMS,
  CareerCMS,
  TeamMemberCMS,
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
  HeadOfficeInfoCMS,
  LeadershipMemberCMS,
} from './types';
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
} from './data/cmsInitialData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuickPanel } from './components/QuickPanel';
import { StatsSection } from './components/StatsSection';
import { ServicesSection } from './components/ServicesSection';
import { LeadershipSection } from './components/LeadershipSection';
import { ChairmanMessagePage } from './components/ChairmanMessagePage';
import { DigitalSection } from './components/DigitalSection';
import { RatesAndNotices } from './components/RatesAndNotices';
import { GallerySection } from './components/GallerySection';
import { WhySection } from './components/WhySection';
import { MembershipBanner } from './components/MembershipBanner';
import { Footer } from './components/Footer';
import { DetailModal, ModalData } from './components/DetailModal';
import { InfoPageView } from './components/InfoPageView';
import { NoticePopupModal } from './components/NoticePopupModal';
import { LoanApplicationModal } from './components/LoanApplicationModal';
import { SmartServicesModal } from './components/SmartServicesModal';
import { AdminPortal, DEFAULT_CMS_SETTINGS, DEFAULT_CMS_SLIDES } from './components/AdminPortal';
import { MemberPortal } from './components/MemberPortal';
import { EkymPortal } from './components/EkymPortal';
import { SERVICES_DATA, INTEREST_RATES, NOTICES_DATA, GALLERY_ITEMS, DEFAULT_TEAM_MEMBERS } from './data/cooperativeData';
import {
  fetchInterestRates,
  fetchNotices,
  saveAllInterestRates,
  saveAllNoticesApi,
} from './services/cooperativeApi';
import {
  fetchSiteSettings,
  fetchWebsiteLogo,
  updateSiteSettings,
  fetchAllCmsData,
  saveCmsPages,
  saveCmsDepartments,
  saveCmsServiceCenters,
  saveCmsReports,
  saveCmsCareers,
  saveCmsTeam,
  saveCmsSlides,
  saveCmsServices,
  saveCmsGallery,
  saveCmsPrivacyPolicy,
  saveCmsSocialLinks,
  saveCmsBrandTheme,
  saveCmsDocuments,
  saveCmsNewsActivities,
  saveCmsSuggestions,
  submitCmsSuggestion,
  saveCmsFaqs,
  saveCmsHistoryMilestones,
  saveCmsWhyChooseUs,
  saveCmsExchangeRates,
  saveCmsInstitutionalProfiles,
  saveCmsMonthlyFinancialReports,
  fetchCmsHeadOffice,
  saveCmsHeadOffice,
  fetchCmsLeadership,
  saveCmsLeadership,
} from './services/mediaApi';

export default function App() {
  const [lang, setLang] = useState<Language>('np');
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [activePageData, setActivePageData] = useState<ModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoticePopupOpen, setIsNoticePopupOpen] = useState(false);
  const [loanModalState, setLoanModalState] = useState<{
    isOpen: boolean;
    scheme?: string;
    amount?: number;
    tenure?: number;
  }>({ isOpen: false });
  const [smartModalState, setSmartModalState] = useState<{
    isOpen: boolean;
    tab: 'date-converter' | 'exchange-rates' | 'emi-calculator';
  }>({ isOpen: false, tab: 'date-converter' });
  
  // Automatic Notice Popup on initial website load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNoticePopupOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Portal navigation & session state
  const [currentView, setCurrentView] = useState<'website' | 'admin' | 'member' | 'ekym'>('website');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Ensure body scroll is always unlocked when no modal is open or when switching views
  useEffect(() => {
    if (!isModalOpen && !isNoticePopupOpen && !loanModalState.isOpen && !smartModalState.isOpen) {
      document.body.style.overflow = '';
    }
  }, [isModalOpen, isNoticePopupOpen, loanModalState.isOpen, smartModalState.isOpen, currentView, activePageData]);

  // Dynamic CMS State synced strictly with server-side SQLite/MySQL database via API
  const [cmsSettings, setCmsSettings] = useState<SiteSettingsCMS>(DEFAULT_CMS_SETTINGS);
  const [cmsSlides, setCmsSlides] = useState(DEFAULT_CMS_SLIDES);
  const [cmsServices, setCmsServices] = useState(SERVICES_DATA);
  const [cmsRates, setCmsRates] = useState(INTEREST_RATES);
  const [cmsNotices, setCmsNotices] = useState(NOTICES_DATA);
  const [cmsGallery, setCmsGallery] = useState(GALLERY_ITEMS);
  const [cmsPages, setCmsPages] = useState<CmsPagesState>(INITIAL_CMS_PAGES);
  const [cmsDepartments, setCmsDepartments] = useState<DepartmentCMS[]>(INITIAL_CMS_DEPARTMENTS);
  const [cmsServiceCenters, setCmsServiceCenters] = useState<ServiceCenterCMS[]>(INITIAL_CMS_SERVICE_CENTERS);
  const [cmsReports, setCmsReports] = useState<ReportCMS[]>(INITIAL_CMS_REPORTS);
  const [cmsCareers, setCmsCareers] = useState<CareerCMS[]>(INITIAL_CMS_CAREERS);
  const [cmsTeam, setCmsTeam] = useState<TeamMemberCMS[]>(DEFAULT_TEAM_MEMBERS);
  const [cmsPrivacyPolicy, setCmsPrivacyPolicy] = useState<PrivacyPolicyCMS>(INITIAL_CMS_PRIVACY_POLICY);
  const [cmsSocialLinks, setCmsSocialLinks] = useState<SocialLinksCMS>(INITIAL_CMS_SOCIAL_LINKS);
  const [cmsBrandTheme, setCmsBrandTheme] = useState<BrandThemeCMS>(INITIAL_CMS_BRAND_THEME);
  const [cmsDocuments, setCmsDocuments] = useState<DocumentItemCMS[]>(INITIAL_CMS_DOCUMENTS);
  const [cmsNewsActivities, setCmsNewsActivities] = useState<NewsActivityItemCMS[]>(INITIAL_CMS_NEWS_ACTIVITIES);
  const [cmsSuggestions, setCmsSuggestions] = useState<SuggestionItemCMS[]>(INITIAL_CMS_SUGGESTIONS);
  const [cmsFaqs, setCmsFaqs] = useState<FaqItemCMS[]>(INITIAL_CMS_FAQS);
  const [cmsHistoryMilestones, setCmsHistoryMilestones] = useState<HistoryMilestonesPageCMS>(INITIAL_CMS_HISTORY_MILESTONES);
  const [cmsWhyChooseUs, setCmsWhyChooseUs] = useState<WhyChooseUsPageCMS>(INITIAL_CMS_WHY_CHOOSE_US);
  const [cmsExchangeRates, setCmsExchangeRates] = useState<ExchangeRateItemCMS[]>(
    INITIAL_CMS_EXCHANGE_RATES
  );
  const [cmsInstitutionalProfiles, setCmsInstitutionalProfiles] = useState<InstitutionalProfileItemCMS[]>(
    INITIAL_CMS_INSTITUTIONAL_PROFILES
  );
  const [cmsMonthlyFinancialReports, setCmsMonthlyFinancialReports] = useState<MonthlyFinancialReportCMS[]>(
    INITIAL_MONTHLY_FINANCIAL_REPORTS
  );
  const [cmsHeadOffice, setCmsHeadOffice] = useState<HeadOfficeInfoCMS>(
    INITIAL_CMS_HEAD_OFFICE
  );
  const [cmsLeadershipMembers, setCmsLeadershipMembers] = useState<LeadershipMemberCMS[]>(
    INITIAL_CMS_LEADERSHIP_MEMBERS
  );
  const [selectedLeadershipLeader, setSelectedLeadershipLeader] = useState<LeadershipMemberCMS | null>(null);


  // Automatically update open Institutional Profile view when monthly reports change
  useEffect(() => {
    if (activePageData?.isInstitutionalProfile) {
      setActivePageData((prev) =>
        prev
          ? {
              ...prev,
              monthlyReports: cmsMonthlyFinancialReports,
            }
          : null
      );
    }
  }, [cmsMonthlyFinancialReports]);

  // Dynamic Theme Custom Properties Injection from Admin Brand Theme Settings
  useEffect(() => {
    if (cmsBrandTheme) {
      const root = document.documentElement;
      if (cmsBrandTheme.primaryColor) {
        root.style.setProperty('--ekata-green', cmsBrandTheme.primaryColor);
      }
      if (cmsBrandTheme.primaryHover) {
        root.style.setProperty('--ekata-green-dark', cmsBrandTheme.primaryHover);
      }
      if (cmsBrandTheme.topbarBg) {
        root.style.setProperty('--ekata-green-deep', cmsBrandTheme.topbarBg);
      }
      if (cmsBrandTheme.primaryLight) {
        root.style.setProperty('--ekata-green-soft', cmsBrandTheme.primaryLight);
        root.style.setProperty('--ekata-mint', cmsBrandTheme.primaryLight);
      }
      if (cmsBrandTheme.secondaryColor) {
        root.style.setProperty('--ekata-gold', cmsBrandTheme.secondaryColor);
      }
    }
  }, [cmsBrandTheme]);

  // Database is the single source of truth for all CMS and operational data

  // Load official interest rates, notices, and all CMS sections from backend database
  const refreshAllFromDatabase = async () => {
    try {
      const allCms = await fetchAllCmsData();
      if (Array.isArray(allCms.rates) && allCms.rates.length > 0) {
        setCmsRates(allCms.rates);
      } else {
        const backendRates = await fetchInterestRates();
        if (Array.isArray(backendRates) && backendRates.length > 0) {
          setCmsRates(backendRates);
        }
      }
      if (Array.isArray(allCms.notices) && allCms.notices.length > 0) {
        setCmsNotices(allCms.notices);
      } else {
        const backendNotices = await fetchNotices();
        if (Array.isArray(backendNotices) && backendNotices.length > 0) {
          setCmsNotices(backendNotices);
        }
      }
      if (allCms.settings && Object.keys(allCms.settings).length > 0) {
        setCmsSettings((prev) => ({
          ...prev,
          ...allCms.settings,
          coopLogoUrl: allCms.settings?.coopLogoUrl || prev.coopLogoUrl,
        }));
      } else {
        const backendSettings = await fetchSiteSettings();
        if (backendSettings && Object.keys(backendSettings).length > 0) {
          setCmsSettings((prev) => ({
            ...prev,
            ...backendSettings,
            coopLogoUrl: backendSettings.coopLogoUrl || prev.coopLogoUrl,
          }));
        } else {
          const directLogo = await fetchWebsiteLogo();
          if (directLogo) {
            setCmsSettings((prev) => ({ ...prev, coopLogoUrl: directLogo }));
          }
        }
      }
      if (allCms.pages) {
        setCmsPages(allCms.pages);
      }
      if (Array.isArray(allCms.departments)) {
        setCmsDepartments(allCms.departments);
      }
      if (Array.isArray(allCms.serviceCenters)) {
        setCmsServiceCenters(allCms.serviceCenters);
      }
      if (Array.isArray(allCms.reports)) {
        setCmsReports(allCms.reports);
      }
      if (Array.isArray(allCms.careers)) {
        setCmsCareers(allCms.careers);
      }
      if (Array.isArray(allCms.team)) {
        setCmsTeam(allCms.team);
      } else if (allCms.team && typeof allCms.team === 'object' && Array.isArray((allCms.team as any).team)) {
        setCmsTeam((allCms.team as any).team);
      }
      if (Array.isArray(allCms.slides)) {
        setCmsSlides(allCms.slides);
      }
      if (Array.isArray(allCms.services)) {
        setCmsServices(allCms.services);
      }
      if (Array.isArray(allCms.gallery)) {
        setCmsGallery(allCms.gallery);
      }
      if (allCms.privacyPolicy) {
        setCmsPrivacyPolicy(allCms.privacyPolicy);
      }
      if (allCms.socialLinks) {
        setCmsSocialLinks(allCms.socialLinks);
      }
      if (allCms.theme) {
        setCmsBrandTheme(allCms.theme);
      }
      if (Array.isArray(allCms.documents)) {
        setCmsDocuments(allCms.documents);
      }
      if (Array.isArray(allCms.newsActivities)) {
        setCmsNewsActivities(allCms.newsActivities);
      }
      if (Array.isArray(allCms.suggestions)) {
        setCmsSuggestions(allCms.suggestions);
      }
      if (Array.isArray(allCms.faqs)) {
        setCmsFaqs(allCms.faqs);
      }
      if (allCms.historyMilestones) {
        setCmsHistoryMilestones(allCms.historyMilestones);
      }
      if (allCms.whyChooseUs) {
        setCmsWhyChooseUs(allCms.whyChooseUs);
      }
      if (Array.isArray(allCms.exchangeRates)) {
        setCmsExchangeRates(allCms.exchangeRates);
      }
      if (Array.isArray(allCms.institutionalProfiles)) {
        setCmsInstitutionalProfiles(allCms.institutionalProfiles);
      }
      if (Array.isArray(allCms.monthlyFinancialReports)) {
        setCmsMonthlyFinancialReports(allCms.monthlyFinancialReports);
      }
      if (allCms.headOffice && allCms.headOffice.officeNameEn) {
        setCmsHeadOffice(allCms.headOffice);
        const ho = allCms.headOffice;
        setCmsSettings((prev) => ({
          ...prev,
          addressEn: ho.addressEn || prev.addressEn,
          addressNp: ho.addressNp || prev.addressNp,
          provinceEn: ho.province || prev.provinceEn,
          districtEn: ho.district || prev.districtEn,
          municipalityEn: ho.city || prev.municipalityEn,
          wardNo: ho.ward || prev.wardNo,
          phone: ho.primaryPhone || prev.phone,
          altPhone: ho.altPhone ?? prev.altPhone,
          tollFree: ho.tollFreePhone ?? prev.tollFree,
          email: ho.officialEmail || prev.email,
          regdNo: ho.regNumber || prev.regdNo,
          panNo: ho.panNumber || prev.panNo,
          establishedYear: ho.establishedDate || prev.establishedYear,
          mapsEmbedUrl: ho.googleMapEmbedUrl ?? prev.mapsEmbedUrl,
          officeHours: ho.sunToThuHoursEn || prev.officeHours,
        }));
      } else {
        const directHo = await fetchCmsHeadOffice();
        if (directHo && directHo.officeNameEn) {
          setCmsHeadOffice(directHo);
        }
      }

      const directLead = await fetchCmsLeadership();
      if (Array.isArray(directLead) && directLead.length > 0) {
        setCmsLeadershipMembers(directLead);
      }
    } catch (err) {
      console.warn('Backend data synchronization error:', err);
    }
  };

  useEffect(() => {
    refreshAllFromDatabase();
  }, []);

  const handleUpdateCmsSettings = async (newSettings: Partial<typeof DEFAULT_CMS_SETTINGS>) => {
    setCmsSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await updateSiteSettings(newSettings);
    } catch (err) {
      console.warn('Failed to persist settings to server database:', err);
    }
  };

  const handleUpdateCmsPages = (pages: CmsPagesState) => {
    setCmsPages(pages);
    saveCmsPages(pages).catch((err) => console.warn('Failed to save CMS pages:', err));
  };

  const handleUpdateDepartments = (departments: DepartmentCMS[]) => {
    setCmsDepartments(departments);
    saveCmsDepartments(departments).catch((err) => console.warn('Failed to save departments:', err));
  };

  const handleUpdateServiceCenters = (centers: ServiceCenterCMS[]) => {
    setCmsServiceCenters(centers);
    saveCmsServiceCenters(centers).catch((err) => console.warn('Failed to save service centers:', err));
  };

  const handleUpdateReports = (reports: ReportCMS[]) => {
    setCmsReports(reports);
    saveCmsReports(reports).catch((err) => console.warn('Failed to save reports:', err));
  };

  const handleUpdateCareers = (careers: CareerCMS[]) => {
    setCmsCareers(careers);
    saveCmsCareers(careers).catch((err) => console.warn('Failed to save careers:', err));
  };

  const handleUpdateHeadOffice = (updated: HeadOfficeInfoCMS) => {
    setCmsHeadOffice(updated);
    setCmsSettings((prev) => ({
      ...prev,
      addressEn: updated.addressEn || prev.addressEn,
      addressNp: updated.addressNp || prev.addressNp,
      provinceEn: updated.province || prev.provinceEn,
      districtEn: updated.district || prev.districtEn,
      municipalityEn: updated.city || prev.municipalityEn,
      wardNo: updated.ward || prev.wardNo,
      phone: updated.primaryPhone || prev.phone,
      altPhone: updated.altPhone ?? prev.altPhone,
      tollFree: updated.tollFreePhone ?? prev.tollFree,
      email: updated.officialEmail || prev.email,
      regdNo: updated.regNumber || prev.regdNo,
      panNo: updated.panNumber || prev.panNo,
      establishedYear: updated.establishedDate || prev.establishedYear,
      mapsEmbedUrl: updated.googleMapEmbedUrl ?? prev.mapsEmbedUrl,
      officeHours: updated.sunToThuHoursEn || prev.officeHours,
    }));
  };

  const buildHeadOfficeModalData = (ho: HeadOfficeInfoCMS): ModalData => {
    const depts = Array.isArray(ho.departmentsDirectory) ? ho.departmentsDirectory : [];
    return {
      titleEn: 'Head Office Information',
      titleNp: 'केन्द्रीय कार्यालयको विवरण',
      categoryEn: 'Contact Us / Head Office Information',
      categoryNp: 'सम्पर्क / केन्द्रीय कार्यालयको विवरण',
      icon: '🏢',
      descriptionEn: `${ho.officeNameEn} — Located at ${ho.addressEn} (${ho.city} Ward No. ${ho.ward}, ${ho.district}, ${ho.province}). Established: ${ho.establishedDate || '2065 B.S.'} | Regd No.: ${ho.regNumber || '-'} | PAN: ${ho.panNumber || '-'}.`,
      descriptionNp: `${ho.officeNameNp || ho.officeNameEn} — ${ho.addressNp || ho.addressEn} (${ho.city} वडा नं. ${ho.ward}, ${ho.district}, ${ho.province})। स्थापना: ${ho.establishedDate || '२०६५'} | दर्ता नं.: ${ho.regNumber || '-'} | पान नं.: ${ho.panNumber || '-'}।`,
      bulletPointsEn: [
        `Official Name: ${ho.officeNameEn} (Regd: ${ho.regNumber || '-'} • PAN: ${ho.panNumber || '-'})`,
        `Headquarters Location: ${ho.addressEn} (${ho.city}-${ho.ward}, ${ho.district}, ${ho.province})${ho.landmarkEn ? ` • Landmark: ${ho.landmarkEn}` : ''}`,
        `Primary Dispatch & Phones: ${ho.primaryPhone}${ho.altPhone ? ` / ${ho.altPhone}` : ''}${ho.tollFreePhone ? ` • Toll-Free: ${ho.tollFreePhone}` : ''}`,
        `Official Emails & Web: ${ho.officialEmail}${ho.supportEmail ? ` | Support: ${ho.supportEmail}` : ''}${ho.websiteUrl ? ` | Web: ${ho.websiteUrl}` : ''}${ho.poBox ? ` | ${ho.poBox}` : ''}`,
        `Operating Hours: ${ho.sunToThuHoursEn} | ${ho.fridayHoursEn} (${ho.holidayNoticeEn || 'Closed on Saturdays & Public Holidays'})`,
      ],
      bulletPointsNp: [
        `आधिकारिक नाम: ${ho.officeNameNp || ho.officeNameEn} (दर्ता नं.: ${ho.regNumber || '-'} • पान: ${ho.panNumber || '-'})`,
        `केन्द्रीय कार्यालय ठेगाना: ${ho.addressNp || ho.addressEn}${ho.landmarkNp ? ` • पहिचान: ${ho.landmarkNp}` : ''}`,
        `मुख्य टेलिफोन तथा सम्पर्क: ${ho.primaryPhone}${ho.altPhone ? ` / ${ho.altPhone}` : ''}${ho.tollFreePhone ? ` • टोल-फ्री: ${ho.tollFreePhone}` : ''}`,
        `आधिकारिक इमेल तथा वेबसाइट: ${ho.officialEmail}${ho.supportEmail ? ` | सहायता: ${ho.supportEmail}` : ''}${ho.websiteUrl ? ` | वेब: ${ho.websiteUrl}` : ''}`,
        `कार्यालय समय: ${ho.sunToThuHoursNp || ho.sunToThuHoursEn} | ${ho.fridayHoursNp || ho.fridayHoursEn} (${ho.holidayNoticeNp || ho.holidayNoticeEn || 'शनिबार र सार्वजनिक बिदामा बन्द'})`,
      ],
      cards: depts.map((dept, index) => ({
        id: dept.id || `ho-dept-${index + 1}`,
        titleEn: dept.name,
        titleNp: dept.nameNp || dept.name,
        subtitleEn: `Desk In-Charge: ${dept.incharge} • Direct Ext: ${dept.ext}${dept.phone ? ` • Tel: ${dept.phone}` : ''}`,
        subtitleNp: `शाखा प्रमुख/सम्पर्क व्यक्ति: ${dept.inchargeNp || dept.incharge} • एक्सटेन्सन: ${dept.ext}${dept.phone ? ` • फोन: ${dept.phone}` : ''}`,
        badgeEn: `Ext. ${dept.ext}`,
        badgeNp: `Ext. ${dept.ext}`,
        phone: dept.phone || ho.primaryPhone,
        email: dept.email || ho.officialEmail,
        mapUrl: ho.googleMapEmbedUrl || `https://maps.google.com/?q=${encodeURIComponent(ho.addressEn)}`,
      })),
      actionLabelEn: `Call Head Office (${ho.primaryPhone})`,
      actionLabelNp: `केन्द्रीय कार्यालयमा फोन गर्नुहोस् (${ho.primaryPhone})`,
      actionType: 'contact',
    };
  };

  useEffect(() => {
    if (!activePageData) return;
    const tEn = (activePageData.titleEn || '').toLowerCase();
    const catEn = (activePageData.categoryEn || '').toLowerCase();
    if (tEn.includes('head office information') || catEn.includes('head office information')) {
      setActivePageData(buildHeadOfficeModalData(cmsHeadOffice));
    }
  }, [cmsHeadOffice]);

  const handleUpdateTeam = (team: TeamMemberCMS[]) => {
    setCmsTeam(team);
    saveCmsTeam(team).catch((err) => console.warn('Failed to save team:', err));
  };

  const handleUpdateSlides = (slides: typeof DEFAULT_CMS_SLIDES) => {
    setCmsSlides(slides);
    saveCmsSlides(slides).catch((err) => console.warn('Failed to save slides:', err));
  };

  const handleUpdateServices = (services: typeof SERVICES_DATA) => {
    setCmsServices(services);
    saveCmsServices(services).catch((err) => console.warn('Failed to save services:', err));
  };

  const handleUpdateRates = (rates: typeof INTEREST_RATES) => {
    setCmsRates(rates);
    saveAllInterestRates(rates).catch((err) => console.warn('Failed to save rates:', err));
  };

  const handleUpdateNotices = (notices: typeof NOTICES_DATA) => {
    setCmsNotices(notices);
    saveAllNoticesApi(notices).catch((err) => console.warn('Failed to save notices:', err));
  };

  const handleUpdateGallery = (gallery: typeof GALLERY_ITEMS) => {
    setCmsGallery(gallery);
    saveCmsGallery(gallery).catch((err) => console.warn('Failed to save gallery:', err));
  };

  const handleOpenPrivacyPolicy = () => {
    showModal({
      titleEn: cmsPrivacyPolicy?.titleEn || 'Privacy Policy & Member Data Protection Guidelines',
      titleNp: cmsPrivacyPolicy?.titleNp || 'गोपनीयता नीति तथा सदस्य तथ्याङ्क सुरक्षा निर्देशिका',
      categoryEn: 'Governance & Privacy',
      categoryNp: 'सुशासन तथा गोपनीयता',
      icon: '🛡️',
      descriptionEn: `Last Updated: ${cmsPrivacyPolicy?.lastUpdated || '2081 Ashwin'}. Ankur Saving & Credit Cooperative Ltd. is committed to protecting member confidentiality, transactional records, and data rights under regulatory and statutory standards.`,
      descriptionNp: `अन्तिम परिमार्जन: ${cmsPrivacyPolicy?.lastUpdated || '२०८१ असोज'}। अंकुर बचत तथा ऋण सहकारी संस्था लि. आफ्ना सम्पूर्ण सदस्यहरूको व्यक्तिगत गोपनीयता, बचत-ऋण विवरण र कारोबार तथ्याङ्कको सुरक्षा गर्न पूर्ण प्रतिबद्ध छ।`,
      bulletPointsEn: (cmsPrivacyPolicy?.sections || []).map((s) => `${s.headingEn}: ${s.bodyEn}`),
      bulletPointsNp: (cmsPrivacyPolicy?.sections || []).map((s) => `${s.headingNp}: ${s.bodyNp}`),
      cards: (cmsPrivacyPolicy?.sections || []).map((s) => ({
        titleEn: s.headingEn,
        titleNp: s.headingNp,
        subtitleEn: s.bodyEn,
        subtitleNp: s.bodyNp,
        badgeEn: 'Policy Clause',
        badgeNp: 'नीति बुँदा',
      })),
      actionLabelEn: 'Contact Grievance & Compliance Officer',
      actionLabelNp: 'गुनासो तथा अनुपालन अधिकारी सम्पर्क',
      actionType: 'contact',
    });
  };

  const handleOpenDocumentsVault = () => {
    showModal({
      titleEn: 'Downloads, Official Forms & Publication Vault',
      titleNp: 'आधिकारिक फाराम, कागजात तथा डाउनलोड पोर्टल',
      categoryEn: 'More / Downloads & Forms',
      categoryNp: 'थप / डाउनलोड तथा फाराम',
      icon: '📥',
      descriptionEn: 'Browse and download verified cooperative forms, membership & eKYM application sheets, loan appraisal forms, statutory audit balance sheets, and cooperative bylaws.',
      descriptionNp: 'वार्षिक साधारण सभाका आधिकारिक प्रतिवेदनहरू, वैधानिक लेखापरीक्षण वासलात, संस्थाको विनियम, सदस्यता फाराम तथा कर्जा आवेदन फारामहरू डाउनलोड गर्नुहोस्।',
      cards: (cmsDocuments || []).map((doc) => ({
        id: doc.id,
        titleEn: doc.titleEn,
        titleNp: doc.titleNp,
        subtitleEn: `${doc.fiscalYear || 'FY 2081/82'} • ${doc.descriptionEn || ''}`,
        subtitleNp: `${doc.fiscalYear || 'आ.व. २०८१/८२'} • ${doc.descriptionNp || ''}`,
        badgeEn: doc.category.toUpperCase(),
        badgeNp: 'डाउनलोड',
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize || 'PDF',
      })),
      actionLabelEn: 'Explore Reports Archive',
      actionLabelNp: 'प्रतिवेदन अभिलेख हेर्नुहोस्',
      actionType: 'reports',
    });
  };

  // Helper to open full-window page view
  const openFullPage = (data: ModalData) => {
    setActivePageData(data);
    setIsModalOpen(false);
    if (currentView !== 'website') {
      setCurrentView('website');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to open modal or full-window page
  const showModal = (data: ModalData) => {
    // If it is an About Us, Services, Reports, Careers, Contact category, or has cards/team/discover, or is institutional profile / monthly reports, open as full window page view
    const catEn = (data.categoryEn || '').toLowerCase();
    const catNp = data.categoryNp || '';
    const isFullPageCategory =
      data.isInstitutionalProfile ||
      Boolean(data.monthlyReports && data.monthlyReports.length > 0) ||
      catEn.includes('statement') ||
      catEn.includes('institutional') ||
      catEn.includes('about') ||
      catEn.includes('service') ||
      catEn.includes('report') ||
      catEn.includes('career') ||
      catEn.includes('contact') ||
      catEn.includes('more') ||
      catEn.includes('suggestion') ||
      catEn.includes('feedback') ||
      catNp.includes('हाम्रो बारेमा') ||
      catNp.includes('सेवा') ||
      catNp.includes('प्रतिवेदन') ||
      catNp.includes('करियर') ||
      catNp.includes('सम्पर्क') ||
      catNp.includes('थप') ||
      catNp.includes('सुझाव') ||
      catNp.includes('संस्थागत') ||
      catNp.includes('विवरण') ||
      data.showDiscoverSection ||
      (data.discoverCards && data.discoverCards.length > 0) ||
      (data.cards && data.cards.length > 0) ||
      (data.teamMembers && data.teamMembers.length > 0);

    if (isFullPageCategory) {
      openFullPage(data);
      return;
    }
    setModalData(data);
    setIsModalOpen(true);
  };

  // Handle clicks on any mega-menu item across About Us, Services, Reports, Career, Notices, Contact, More
  const handleMegaMenuItemClick = (item: MegaMenuItem) => {
    if (currentView !== 'website') {
      setCurrentView('website');
    }
    if (item.id === 'digital-services' || item.id === 'digital') {
      setActivePageData({
        id: 'digital-services',
        titleEn: item.titleEn || 'Digital Services & Smart Banking',
        titleNp: item.titleNp || 'डिजिटल सेवाहरू तथा अनलाइन अनुरोध',
        subtitleEn: item.subtitleEn || 'Missed call banking, statement, mobile & card services',
        subtitleNp: item.subtitleNp || 'मिस्ड कल बैंकिङ, स्टेटमेन्ट, मोबाइल तथा कार्ड सेवा',
        icon: '📱',
        categoryEn: 'Services / Digital',
        categoryNp: 'सेवाहरू / डिजिटल',
        descriptionEn: 'Request and manage all digital services online.',
        descriptionNp: 'सबै डिजिटल बैंकिङ सेवाहरू अनलाइन अनुरोध गर्नुहोस्।',
      } as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (item.id === 'privacy' || item.id === 'privacy-policy' || item.id === 'privacy-guidelines') {
      handleOpenPrivacyPolicy();
      return;
    }
    if (item.id === 'documents' || item.id === 'document-vault' || item.id === 'downloads') {
      handleOpenDocumentsVault();
      return;
    }
    if (item.id === 'date-converter') {
      setSmartModalState({ isOpen: true, tab: 'date-converter' });
      return;
    }
    if (item.id === 'exchange-rates') {
      setSmartModalState({ isOpen: true, tab: 'exchange-rates' });
      return;
    }

    // Smooth scroll only for on-page EMI calculator tool
    if (item.id === 'calculator') {
      setActivePageData(null);
      setTimeout(() => {
        const el = document.getElementById('calculator');
        if (el) {
          const yOffset = -90;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          setSmartModalState({ isOpen: true, tab: 'emi-calculator' });
        }
      }, 50);
      return;
    }

    switch (item.id) {
      // OVERVIEW OF ALL SERVICES
      case 'services':
        showModal({
          titleEn: 'All Cooperative Services & Financial Solutions',
          titleNp: 'अंकुर सहकारीका सम्पूर्ण सेवाहरू तथा वित्तीय समाधानहरू',
          categoryEn: 'Services / Overview',
          categoryNp: 'सेवाहरू / समग्र सेवाहरू',
          icon: '▣',
          descriptionEn:
            'Explore our full suite of member-driven financial products designed to foster economic resilience, thrift habit, entrepreneurship, and community prosperity across Rupandehi district.',
          descriptionNp:
            'रुपन्देही जिल्लाभरिका आम नागरिक, उद्यमी तथा सदस्य परिवारको आर्थिक सशक्तीकरण र पुँजी निर्माणका लागि अंकुर सहकारीले सञ्चालन गरेका प्रमुख ६ वटा आधुनिक वित्तीय सेवाहरू।',
          bulletPointsEn: [
            'Safe, government-regulated cooperative banking serving 10,480+ active member families.',
            'Competitive deposit returns with daily interest capitalization up to 11.75% per annum.',
            'Rapid appraisal productive credit facilities for agriculture, trade, housing & employment.',
            'Integrated modern mobile banking app, NepalPay QR merchant payments, and nationwide remittance.',
          ],
          bulletPointsNp: [
            '१०,४८० भन्दा बढी सदस्य परिवारलाई भरपर्दो, सुरक्षित र सहकारी मूल्य-मान्यतामा आधारित वित्तीय सेवा।',
            'दैनिक मौज्दातमा उच्च प्रतिफल तथा मुद्दती निक्षेपमा वार्षिक ११.७५% सम्म आकर्षक ब्याज।',
            'कृषि, साना व्यापार, आवास तथा युवा स्वरोजगार प्रवर्द्धनका लागि सरल र छरितो कर्जा सुविधा।',
            'स्मार्ट मोबाइल बैंकिङ, नेपालपे क्युआर, युटिलिटी भुक्तानी र द्रुत रेमिट्यान्स सेवा।',
          ],
          cards: [
            {
              id: 'member-service',
              titleEn: 'Member Services & Welfare Benefits',
              titleNp: 'सदस्य सेवा तथा कल्याणकारी सुविधा',
              subtitleEn: 'Share capital certificates, maternity aid, health relief & patronage bonus',
              subtitleNp: 'सेयर पुँजी, सुत्केरी पोषण भत्ता, आकस्मिक स्वास्थ्य उपचार तथा संरक्षित लाभांश',
              badgeEn: 'Core Welfare',
              badgeNp: 'कल्याणकारी',
            },
            {
              id: 'deposit-product',
              titleEn: 'Deposit Products & Savings Plans',
              titleNp: 'बचत तथा निक्षेप योजनाहरू',
              subtitleEn: 'Regular, Child, Senior Citizen & High-Yield Fixed Deposits up to 11.75%',
              subtitleNp: 'साधारण, बाल भविष्य, ज्येष्ठ नागरिक र ११.७५% सम्म मुद्दती निक्षेप',
              badgeEn: 'Up to 11.75%',
              badgeNp: '११.७५% सम्म',
            },
            {
              id: 'loan',
              titleEn: 'Productive Loans & Credit Facilities',
              titleNp: 'उत्पादनमूलक कर्जा तथा ऋण सुविधाहरू',
              subtitleEn: 'Concessional agriculture, business enterprise, housing & vehicle credit',
              subtitleNp: 'सहुलियतपूर्ण कृषि, साना व्यापार व्यवसाय, आवास तथा हायर पर्चेज कर्जा',
              badgeEn: 'Low Interest',
              badgeNp: 'सहुलियत ब्याज',
            },
            {
              id: 'remittance',
              titleEn: 'Fast & Secure Remittance Services',
              titleNp: 'सुरक्षित तथा छिटो रेमिट्यान्स भुक्तानी',
              subtitleEn: 'Instant domestic & international payout via Prabhu, IME, Western Union',
              subtitleNp: 'प्रभु, आइएमई, वेस्टर्न युनियनमार्फत तत्काल नगद भुक्तानी तथा खातामा जम्मा',
              badgeEn: 'Global Network',
              badgeNp: 'विश्वव्यापी',
            },
            {
              id: 'insurance',
              titleEn: 'Cooperative Insurance & Safety Schemes',
              titleNp: 'बिमा तथा सुरक्षण योजनाहरू',
              subtitleEn: 'Member life & accidental micro-insurance, livestock & crop safety',
              subtitleNp: 'सदस्य दुर्घटना लघुबिमा, पशुधन तथा बाली सुरक्षण र कर्जा राहत',
              badgeEn: 'Risk Protection',
              badgeNp: 'सुरक्षित भविष्य',
            },
            {
              id: 'help',
              titleEn: 'Help & Member Support',
              titleNp: 'सहायता तथा सदस्य सेवा',
              subtitleEn: '24/7 Helpline, FAQs, Grievance desk & financial self-service tools',
              subtitleNp: '२४/७ हेल्पलाइन, सोधिने प्रश्नहरू, गुनासो सुनुवाइ तथा वित्तीय उपकरणहरू',
              badgeEn: '24/7 Support',
              badgeNp: '२४/७ सेवा',
            },
          ],
          actionLabelEn: 'Join Membership Online',
          actionLabelNp: 'अनलाइन सदस्यता लिनुहोस्',
          actionType: 'register',
        });
        break;

      // SERVICES (Only Member service, deposit product, loan, remittance, insurance, digital services)
      case 'member-service':
      case 'new-member':
      case 'register':
      case 'membership':
        showModal({
          titleEn: 'Member Services & Welfare Benefits',
          titleNp: 'सदस्य सेवा तथा कल्याणकारी सुविधा',
          categoryEn: 'Services / Member Service',
          categoryNp: 'सेवाहरू / सदस्य सेवा',
          icon: '👥',
          descriptionEn:
            'Dedicated member onboarding, share capital issuance, cooperative training workshops, and comprehensive welfare assistance including maternity relief, member accident aid, and patron dividend bonuses.',
          descriptionNp:
            'नयाँ सदस्यता दर्ता, सेयर प्रमाणपत्र जारी, सदस्य शिक्षा तालिम र सामाजिक सुरक्षा योजनाहरू। यस अन्तर्गत सुत्केरी पोषण भत्ता, आकस्मिक स्वास्थ्य उपचार सहयोग, जेहेन्दार छात्रवृत्ति र संरक्षित लाभांश वितरण पर्दछन्।',
          bulletPointsEn: [
            'Member Share Capital: 18% annual return/bonus ceiling compliance.',
            'Member Welfare Relief Fund: Up to Rs. 50,000 medical emergency assistance.',
            'Maternity Nutrition Allowance: Rs. 10,000 for female member childbirth.',
            'Cooperative Education: Regular financial literacy and entrepreneurship workshops.',
          ],
          bulletPointsNp: [
            'सदस्य सेयर पुँजी: ऐन-नियम अनुसार आकर्षक वार्षिक सेयर लाभांश वितरण।',
            'सदस्य राहत तथा कल्याणकारी कोष: आकस्मिक स्वास्थ्य उपचारमा रु. ५०,००० सम्म सहयोग।',
            'सुत्केरी पोषण स्याहार भत्ता: महिला सदस्य वा सदस्यका श्रीमतीलाई रु. १०,००० सहयोग।',
            'सहकारी शिक्षा तथा तालिम: वित्तीय साक्षरता र साना उद्यमशीलता तालिमहरू।',
          ],
          cards: [
            {
              id: 'ms-share',
              titleEn: 'Share Capital & Membership Certificate',
              titleNp: 'सेयर पुँजी तथा सदस्यता प्रमाणपत्र',
              subtitleEn: 'Own an equity stake in Ankur with statutory dividend earnings up to 18%',
              subtitleNp: 'सहकारीको स्वामित्व, साधारण सभामा मताधिकार र वार्षिक १८% सम्म लाभांश',
              badgeEn: 'Ownership',
              badgeNp: 'स्वामित्व',
            },
            {
              id: 'ms-maternity',
              titleEn: 'Maternity Nutrition & Childcare Grant',
              titleNp: 'सुत्केरी पोषण स्याहार भत्ता',
              subtitleEn: 'Direct grant of Rs. 10,000 per childbirth for member mothers',
              subtitleNp: 'शिशु जन्मिएपछि महिला सदस्यलाई पोषण स्याहार स्वरूप रु. १०,००० राहत',
              badgeEn: 'Rs. 10,000',
              badgeNp: 'रु. १०,०००',
            },
            {
              id: 'ms-medical',
              titleEn: 'Emergency Medical Treatment Assistance',
              titleNp: 'आकस्मिक स्वास्थ्य उपचार कोष',
              subtitleEn: 'Financial relief up to Rs. 50,000 for critical illness hospitalization',
              subtitleNp: 'अस्पताल भर्ना तथा गम्भीर रोग उपचारका लागि रु. ५०,००० सम्म सहयोग',
              badgeEn: 'Up to Rs. 50k',
              badgeNp: 'रु. ५०,००० सम्म',
            },
            {
              id: 'ms-patron',
              titleEn: 'Patronage Refund & Senior Citizen Honor',
              titleNp: 'संरक्षित पुँजी फिर्ता तथा ज्येष्ठ नागरिक सम्मान',
              subtitleEn: 'Refund bonus based on member transaction volume plus annual senior felicitation',
              subtitleNp: 'कारोबारका आधारमा संरक्षित पुँजी फिर्ता लाभांश र ७० वर्ष माथिका सदस्य सम्मान',
              badgeEn: 'Annual Bonus',
              badgeNp: 'वार्षिक सम्मान',
            },
          ],
          actionLabelEn: 'Join Membership Online',
          actionLabelNp: 'अनलाइन सदस्यता आवेदन',
          actionType: 'register',
        });
        break;

      case 'deposit-product':
      case 'savings':
        showModal({
          titleEn: 'Deposit Products & Savings Plans',
          titleNp: 'बचत तथा निक्षेप योजनाहरू',
          categoryEn: 'Services / Deposit Product',
          categoryNp: 'सेवाहरू / निक्षेप योजना',
          icon: '🪙',
          descriptionEn:
            'Ankur Cooperative offers tailored savings schemes engineered to build family security and financial independence with competitive quarterly/daily compounding interest up to 11.75%.',
          descriptionNp:
            'अंकुर बचत तथा ऋण सहकारीले परिवारको सुरक्षित भविष्य, बचत बानीको विकास र पुँजी निर्माणका लागि विभिन्न आकर्षक तथा उच्च प्रतिफल दिने बचत योजनाहरू सञ्चालन गरेको छ।',
          bulletPointsEn: [
            'Ankur Regular Saving: 7.50% daily interest with unrestricted withdrawals.',
            'Ankur Child Future Saving: 8.25% monthly compounding for educational dreams.',
            'Senior Citizen Honor Saving: 8.50% quarterly payout with doorstep assistance.',
            'Special Fixed Term Deposits: Guaranteed returns up to 11.75% per annum.',
          ],
          bulletPointsNp: [
            'साधारण बचत: दैनिक मौज्दातमा ७.५०% ब्याजदर, बिना झन्झट जतिबेला पनि झिक्न मिल्ने।',
            'बाल भविष्य बचत: ८.२५% मासिक चक्रवर्ती ब्याज, बालबालिकाको उच्च शिक्षाका लागि उत्तम।',
            'ज्येष्ठ नागरिक सम्मान बचत: ८.५०% त्रैमासिक भुक्तानी तथा ज्येष्ठ सदस्य सहायता।',
            'मुद्दती निक्षेप: १ देखि ३ वर्षे मुद्दतीमा ११.७५% सम्म सुनिश्चित प्रतिफल।',
          ],
          cards: [
            {
              id: 'dep-regular',
              titleEn: 'Ankur Regular Savings',
              titleNp: 'अंकुर साधारण बचत',
              subtitleEn: '7.50% interest calculated on daily balance, anytime flexible deposit and withdrawal',
              subtitleNp: 'दैनिक मौज्दातमा ७.५०% ब्याज, आवश्यकता अनुसार जतिबेला पनि झिक्न र राख्न मिल्ने',
              badgeEn: '7.50% p.a.',
              badgeNp: '७.५०% ब्याज',
            },
            {
              id: 'dep-child',
              titleEn: 'Child Future Educational Deposit',
              titleNp: 'बाल भविष्य शैक्षिक बचत',
              subtitleEn: '8.25% compounding interest designed to secure higher education milestones',
              subtitleNp: '८.२५% चक्रवर्ती ब्याज, बालबालिकाको १८ वर्ष पुग्दासम्म उच्च शिक्षा कोष',
              badgeEn: '8.25% p.a.',
              badgeNp: '८.२५% ब्याज',
            },
            {
              id: 'dep-senior',
              titleEn: 'Senior Citizen Honor Deposit',
              titleNp: 'ज्येष्ठ नागरिक सम्मान बचत',
              subtitleEn: '8.50% quarterly interest payout with home visit service for senior members',
              subtitleNp: '८.५०% त्रैमासिक ब्याज भुक्तानी तथा अशक्त ज्येष्ठ सदस्यलाई घरदैलो सेवा',
              badgeEn: '8.50% p.a.',
              badgeNp: '८.५०% ब्याज',
            },
            {
              id: 'dep-fixed',
              titleEn: 'Special Fixed Term Deposit',
              titleNp: 'विशेष मुद्दती निक्षेप',
              subtitleEn: 'Guaranteed highest returns up to 11.75% for 1 to 3 year tenures',
              subtitleNp: '१ देखि ३ वर्षे मुद्दतीमा ११.७५% सम्म सुनिश्चित प्रतिफल र कर्जा सुविधा',
              badgeEn: '11.75% p.a.',
              badgeNp: '११.७५% ब्याज',
            },
            {
              id: 'dep-women',
              titleEn: 'Ankur Mahila Empowerment Saving',
              titleNp: 'अंकुर महिला सशक्तीकरण बचत',
              subtitleEn: '8.00% annual interest designed to foster female entrepreneurship and self-reliance',
              subtitleNp: '८.००% वार्षिक ब्याज, महिला सदस्यहरूको आर्थिक स्वावलम्बन तथा उद्यमशीलताका लागि',
              badgeEn: '8.00% p.a.',
              badgeNp: '८.००% ब्याज',
            },
            {
              id: 'dep-daily',
              titleEn: 'Daily Piggy Bank / Khutruke Saving',
              titleNp: 'दैनिक खुत्रुके / बजार बचत',
              subtitleEn: 'Convenient daily collection service at member shops, markets and farm gates',
              subtitleNp: 'पसल, बजार र घरदैलोमै पुगी बजार प्रतिनिधिद्वारा दैनिक बचत संकलन सेवा',
              badgeEn: 'Doorstep',
              badgeNp: 'घरदैलो',
            },
          ],
          actionLabelEn: 'Open Account Online',
          actionLabelNp: 'अनलाइन खाता खोल्नुहोस्',
          actionType: 'register',
        });
        break;

      case 'loan':
      case 'loans': {
        const dynamicLoanProducts = cmsRates.filter(
          (r) =>
            r.category?.toLowerCase() === 'loan' ||
            r.schemeEn.toLowerCase().includes('loan') ||
            r.schemeEn.toLowerCase().includes('credit')
        );
        const loanCards =
          dynamicLoanProducts.length > 0
            ? dynamicLoanProducts.map((lp, idx) => ({
                id: `loan-${lp.id || idx}`,
                titleEn: lp.schemeEn,
                titleNp: lp.schemeNp,
                subtitleEn: `${lp.basisEn || lp.period || 'Flexible repayment tenure'} • Auto Interest Rate: ${lp.rate}`,
                subtitleNp: `${lp.basisNp || 'सुलभ मासिक किस्ताबन्दी'} • वार्षिक ब्याजदर: ${lp.rate}`,
                badgeEn: lp.rate,
                badgeNp: lp.rate,
              }))
            : [
                {
                  id: 'loan-agri',
                  titleEn: 'Agriculture & Livestock Credit',
                  titleNp: 'कृषि तथा पशुपन्छी कर्जा',
                  subtitleEn: 'Concessional credit for modern farming, dairy production, seeds and drip irrigation',
                  subtitleNp: 'व्यावसायिक तरकारी खेती, गाईभैंसी पालन र आधुनिक कृषि औजारका लागि सहुलियत कर्जा',
                  badgeEn: '12.50%',
                  badgeNp: '१२.५०%',
                },
                {
                  id: 'loan-sme',
                  titleEn: 'SME & Retail Enterprise Business Loan',
                  titleNp: 'साना तथा मझौला व्यापार व्यवसाय कर्जा',
                  subtitleEn: 'Working capital and inventory financing for local shopkeepers and manufacturers',
                  subtitleNp: 'स्थानीय खुद्रा तथा थोक पसल, घरेलु उद्योग र व्यवसाय विस्तारका लागि चालु पुँजी',
                  badgeEn: '13.50%',
                  badgeNp: '१३.५०%',
                },
                {
                  id: 'loan-housing',
                  titleEn: 'Ankur Affordable Housing Loan',
                  titleNp: 'अंकुर आवास निर्माण तथा खरिद कर्जा',
                  subtitleEn: 'Up to 15-year tenure for residential land purchase, home building and remodeling',
                  subtitleNp: 'घर निर्माण, जग्गा खरिद र मर्मतका लागि १५ वर्षसम्मको सहज मासिक किस्ताबन्दी',
                  badgeEn: '13.75%',
                  badgeNp: '१३.७५%',
                },
              ];

        showModal({
          titleEn: 'Productive Loans & Credit Facilities',
          titleNp: 'उत्पादनमूलक कर्जा तथा ऋण सुविधाहरू',
          categoryEn: 'Services / Loan',
          categoryNp: 'सेवाहरू / ऋण सुविधा',
          icon: '💼',
          descriptionEn:
            'Flexible, transparent, and low-interest loan products created to nurture local agriculture, small businesses, self-employment, and home construction.',
          descriptionNp:
            'स्थानीय कृषि, साना तथा मझौला व्यापार व्यवसाय, युवा स्वरोजगार र आवास निर्माणलाई प्रवर्द्धन गर्न सहकारीले सुलभ तथा पारदर्शी कर्जा सुविधा उपलब्ध गराउँदै आएको छ।',
          bulletPointsEn: [
            'Agricultural & Livestock Loan: Concessional interest for farmers and dairy cooperatives.',
            'SME & Retail Business Credit: Working capital and expansion credit for local trade.',
            'Ankur Affordable Housing Loan: Long-term home purchase, building and renovation financing.',
            'Hire-Purchase & Equipment: Simplified commercial vehicle and machinery financing.',
          ],
          bulletPointsNp: [
            'कृषि तथा पशुपन्छी कर्जा: आधुनिक खेती, बीउबिजन र पशुपालनका लागि सहुलियतपूर्ण ऋण।',
            'व्यापार व्यवसाय कर्जा: स्थानीय खुद्रा तथा थोक व्यापार विस्तारका लागि चालु पुँजी कर्जा।',
            'अंकुर आवास कर्जा: घर खरिद, निर्माण तथा मर्मतका लागि सरल किस्ताबन्दी ऋण।',
            'हायर पर्चेज कर्जा: कृषि औजार, मेशिनरी र व्यावसायिक सवारी साधन खरिद सुविधा।',
          ],
          cards: loanCards,
          actionLabelEn: 'Apply for Loan',
          actionLabelNp: 'कर्जा आवेदन दिनुहोस् (Apply for Loan)',
          actionType: 'apply-loan',
        });
        break;
      }

      case 'remittance':
        showModal({
          titleEn: 'Fast & Secure Remittance Services',
          titleNp: 'सुरक्षित तथा छिटो रेमिट्यान्स भुक्तानी',
          categoryEn: 'Services / Remittance',
          categoryNp: 'सेवाहरू / विप्रेषण',
          icon: '↗',
          descriptionEn:
            'Receive remittance sent from family members worldwide directly at any Ankur service center with instant cash delivery or deposit into your savings account.',
          descriptionNp:
            'विश्वका जुनसुकै देशबाट परिवारका सदस्यले पठाएको रकम अंकुरका सबै सेवा केन्द्रबाट प्रभु रेमिट, आइएमई, वेस्टर्न युनियन मार्फत तुरुन्तै भुक्तानी लिनुहोस्।',
          bulletPointsEn: [
            'Authorized agent for Prabhu, IME, Western Union, City Express, and Esewa Money.',
            'Direct credit into high-interest cooperative savings accounts.',
            'SMS alert sent immediately upon arrival of payout.',
          ],
          bulletPointsNp: [
            'प्रभु, आइएमई, वेस्टर्न युनियन, सिटी एक्सप्रेस लगायतका आधिकारिक भुक्तानी साझेदार।',
            'सीधै आफ्नो बचत खातामा रकम जम्मा गरी थप ब्याज आर्जन गर्ने सुविधा।',
            'रकम आइपुग्नासाथ मोबाइलमा तत्काल एसएमएस सूचना प्राप्त हुने।',
          ],
          cards: [
            {
              id: 'remit-prabhu',
              titleEn: 'Prabhu Remit Worldwide',
              titleNp: 'प्रभु रेमिट अन्तर्राष्ट्रिय',
              subtitleEn: 'Fast payout from Gulf, Malaysia, USA, Europe, Japan, Korea and Australia',
              subtitleNp: 'खाडी मुलुक, मलेसिया, कोरिया, जापान र युरोपबाट पठाइएको रकम तुरुन्त भुक्तानी',
              badgeEn: 'Global Payout',
              badgeNp: 'विश्वव्यापी',
            },
            {
              id: 'remit-ime',
              titleEn: 'IME Limited Remittance',
              titleNp: 'आइएमई लिमिटेड रेमिट्यान्स',
              subtitleEn: 'Largest domestic and international payout partner network in Nepal',
              subtitleNp: 'नेपालभित्र र विदेशबाट पठाएको रकम नेपालभरिका सबै शाखाबाट भुक्तानी',
              badgeEn: 'Instant Cash',
              badgeNp: 'नगद भुक्तानी',
            },
            {
              id: 'remit-western',
              titleEn: 'Western Union Money Transfer',
              titleNp: 'वेस्टर्न युनियन मनी ट्रान्सफर',
              subtitleEn: 'Recognized worldwide money transfer corridor with strict compliance standards',
              subtitleNp: 'विश्वका २०० भन्दा बढी देशबाट भरपर्दो र सुरक्षित रकम भुक्तानी सेवा',
              badgeEn: 'Worldwide',
              badgeNp: 'अन्तर्राष्ट्रिय',
            },
            {
              id: 'remit-account',
              titleEn: 'Direct Cooperative Account Credit',
              titleNp: 'सीधै सहकारी बचत खातामा जम्मा',
              subtitleEn: 'Remitted funds credited straight into interest-earning savings accounts with zero loss',
              subtitleNp: 'रेमिट्यान्सको रकम सिधै सदस्यको बचत खातामा जम्मा भई दैनिक ब्याज आर्जन हुने',
              badgeEn: 'Zero Commission',
              badgeNp: 'खातामै जम्मा',
            },
          ],
          actionLabelEn: 'Locate Nearest Branch',
          actionLabelNp: 'नजिकको शाखा खोज्नुहोस्',
          actionType: 'contact',
        });
        break;

      case 'insurance':
        showModal({
          titleEn: 'Cooperative Insurance & Safety Schemes',
          titleNp: 'बिमा तथा सुरक्षण योजनाहरू',
          categoryEn: 'Services / Insurance',
          categoryNp: 'सेवाहरू / बिमा तथा सुरक्षा',
          icon: '🛡️',
          descriptionEn:
            'Comprehensive risk protection for cooperative members, encompassing accidental health micro-insurance, livestock and crop safety covers, and credit loan-loss protection.',
          descriptionNp:
            'सदस्यहरूको जीवन, स्वास्थ्य र आर्थिक व्यवसायलाई सम्भावित जोखिमबाट जोगाउन सहकारीले विभिन्न बिमा तथा सुरक्षण कार्यक्रमहरू सञ्चालन गरेको छ।',
          bulletPointsEn: [
            'Member Life & Accidental Micro-Insurance coverage up to Rs. 200,000.',
            'Livestock & High-Yield Crop Insurance with government subsidy coordination.',
            'Borrower Loan-Loss Protection: Safeguarding guarantor and nominee in unforeseen events.',
            'Direct settlement assistance through dedicated cooperative desks.',
          ],
          bulletPointsNp: [
            'सदस्य जीवन तथा दुर्घटना लघुबिमा: रु. २,००,००० सम्मको सुरक्षित बिमा सुविधा।',
            'पशुधन तथा बाली बिमा: सरकारी अनुदानसहित आधुनिक कृषि तथा पशुपालन सुरक्षण।',
            'कर्जा सुरक्षण बिमा: ऋणीको आकस्मिक मृत्यु वा अशक्ततामा परिवारलाई ऋणमुक्त राख्ने योजना।',
            'दाबी भुक्तानीमा सहकारीका कर्मचारीहरूद्वारा सहजीकरण र छिटो प्रक्रिया।',
          ],
          cards: [
            {
              id: 'ins-member',
              titleEn: 'Member Life & Accidental Micro-Insurance',
              titleNp: 'सदस्य जीवन तथा दुर्घटना लघुबिमा',
              subtitleEn: 'Comprehensive coverage up to Rs. 200,000 against unexpected disability or demise',
              subtitleNp: 'आकस्मिक दुर्घटना वा मृत्यु भएमा परिवारलाई रु. २,००,००० सम्मको आर्थिक सुरक्षण',
              badgeEn: 'Rs. 200,000 Cover',
              badgeNp: 'रु. २ लाख सुरक्षण',
            },
            {
              id: 'ins-livestock',
              titleEn: 'Livestock & High-Yield Crop Protection',
              titleNp: 'पशुधन तथा बाली सुरक्षण योजना',
              subtitleEn: 'Government subsidy linked insurance protection for milking cattle, poultry and cash crops',
              subtitleNp: 'सरकारी अनुदान समन्वयसहित दुधालु गाई-भैंसी, बाख्रा तथा व्यावसायिक नगदे बाली बिमा',
              badgeEn: 'Govt. Subsidy',
              badgeNp: 'सरकारी अनुदान',
            },
            {
              id: 'ins-loan',
              titleEn: 'Borrower Credit Protection Scheme',
              titleNp: 'ऋणी सुरक्षण तथा परिवार राहत',
              subtitleEn: 'Relieves surviving family members and loan guarantors from debt liability upon unforeseen tragedy',
              subtitleNp: 'ऋणीको आकस्मिक मृत्यु भएमा बाँकी ऋण बिमाबाटै भुक्तानी भई परिवार ऋणमुक्त हुने',
              badgeEn: 'Debt Relief',
              badgeNp: 'ऋण मुक्ति',
            },
            {
              id: 'ins-critical',
              titleEn: 'Critical Illness Relief Assistance',
              titleNp: 'घातक रोग उपचार सहयोग',
              subtitleEn: 'Direct humanitarian relief grant for cancer, cardiac surgery and kidney failure treatments',
              subtitleNp: 'क्यान्सर, मुटुरोग तथा मिर्गौला प्रत्यारोपण जस्ता घातक रोग उपचारमा संस्थागत सहयोग',
              badgeEn: 'Compassionate',
              badgeNp: 'राहत सहयोग',
            },
          ],
          actionLabelEn: 'Inquire Insurance Details',
          actionLabelNp: 'बिमा सम्बन्धी सोधपुछ',
          actionType: 'contact',
        });
        break;

      case 'help':
      case 'services-help':
        showModal({
          titleEn: 'Help & Member Support Center',
          titleNp: 'सहायता तथा सदस्य सेवा केन्द्र',
          categoryEn: 'Services / Help & Support',
          categoryNp: 'सेवाहरू / सहायता तथा सहयोग',
          icon: '❓',
          descriptionEn:
            'Access 24/7 dedicated cooperative helpline, member assistance desk, grievance reporting, FAQs, and instant self-service tools for quick resolution.',
          descriptionNp:
            'संस्थाको २४/७ समर्पित हेल्पलाइन (१६६०-०१-९९८८७), सदस्य सहयोग कक्ष, गुनासो तथा सुझाव पेटिका, प्रायः सोधिने प्रश्नहरू र अनलाइन सेवाहरू।',
          bulletPointsEn: [
            'Dedicated 24/7 Toll-Free Helpline: 1660-01-99887 (NTC & Ncell).',
            'Confidential grievance and suggestion submission with tracking.',
            'Instant pre-login Loan EMI Calculator and Date Converter (AD ↔ B.S).',
            'Service center locations and branch contact officer directory.',
          ],
          bulletPointsNp: [
            '२४/७ समर्पित निःशुल्क टोल-फ्री हेल्पलाइन: १६६०-०१-९९८८७।',
            'गोप्य गुनासो तथा सुझाव पेटिका एवं आवेदन ट्र्याकिङ।',
            'तत्काल कर्जा किस्ता गणना (EMI Calculator) तथा मिति रूपान्तरण (AD ↔ B.S)।',
            'शाखा कार्यालयहरू तथा सम्पर्क अधिकृत विवरण सूची।',
          ],
          actionLabelEn: 'Call Toll-Free Helpline',
          actionLabelNp: 'हेल्पलाइनमा सम्पर्क गर्नुहोस्',
          actionType: 'contact',
        });
        break;

      case 'digital-services':
      case 'digital':
        showModal({
          titleEn: 'Digital Services & Smart Banking',
          titleNp: 'डिजिटल सेवाहरू तथा स्मार्ट बैंकिङ',
          categoryEn: 'Services / Digital Services',
          categoryNp: 'सेवाहरू / डिजिटल सेवाहरू',
          icon: '📱',
          descriptionEn:
            'Carry Ankur Cooperative in your pocket with mobile banking, NepalPay QR merchant payments, utility bill settle, and real-time transaction notifications.',
          descriptionNp:
            'आफ्नो मोबाइलबाटै नेपालपे क्युआर भुक्तानी, अन्तर-बैंक रकम स्थानान्तरण, बिजुली-पानी-इन्टरनेटको बिल भुक्तानी र २४सै घण्टा खाता विवरण हेर्ने सुविधा।',
          bulletPointsEn: [
            'Instant Inter-Bank & Cooperative Fund Transfers.',
            'Scan & Pay at over 500,000 QR merchants nationwide.',
            'Utility Bill Settlement (NEA, Khanepani, NTC, Ncell, Internet, TV).',
            'Biometric Fingerprint & Face ID secure login protection.',
          ],
          bulletPointsNp: [
            'तत्काल अन्तर-बैंक तथा सहकारी खातामा रकम स्थानान्तरण।',
            'नेपालभरिका ५ लाखभन्दा बढी क्युआर मर्चेन्टहरूमा स्क्यान गरी भुक्तानी।',
            'विद्युत, खानेपानी, मोबाइल रिचार्ज, टिभी तथा इन्टरनेट महसुल भुक्तानी।',
            'बायोमेट्रिक फिंगरप्रिन्ट र फेश आइडी सुरक्षा प्रणाली।',
          ],
          cards: [
            {
              id: 'dig-app',
              titleEn: 'Ankur Smart Mobile Banking App',
              titleNp: 'अंकुर स्मार्ट मोबाइल बैंकिङ एप',
              subtitleEn: 'Check real-time balances, statement history, and manage accounts securely from Android & iOS',
              subtitleNp: 'एन्ड्रोइड र आइओएस मोबाइलबाट २४सै घण्टा मौज्दात, कारोबार स्टेटमेन्ट र खाता सञ्चालन',
              badgeEn: 'iOS & Android',
              badgeNp: 'एप उपलब्ध',
            },
            {
              id: 'dig-qr',
              titleEn: 'NepalPay QR Merchant Payment',
              titleNp: 'नेपालपे क्युआर भुक्तानी',
              subtitleEn: 'Scan and pay directly at grocery shops, pharmacies, restaurants and markets across Nepal',
              subtitleNp: 'देशभरका ५ लाखभन्दा बढी क्युआर मर्चेन्टहरूमा मोबाइलबाट सिधै स्क्यान गरी भुक्तानी',
              badgeEn: 'NepalPay QR',
              badgeNp: 'क्युआर पे',
            },
            {
              id: 'dig-transfer',
              titleEn: 'Instant Inter-Bank Fund Transfer (connectIPS)',
              titleNp: 'अन्तर-बैंक तत्काल रकम स्थानान्तरण',
              subtitleEn: 'Transfer money in seconds to any commercial bank, development bank or cooperative account',
              subtitleNp: 'नेपालका जुनसुकै वाणिज्य बैंक, विकास बैंक वा सहकारी खातामा सेकेन्डमै रकम पठाउनुहोस्',
              badgeEn: 'Instant Transfer',
              badgeNp: 'तत्काल ट्रान्सफर',
            },
            {
              id: 'dig-utility',
              titleEn: 'Utility Bill & Government Tax Payments',
              titleNp: 'विद्युत, खानेपानी तथा महसुल भुक्तानी',
              subtitleEn: 'Pay electricity, water, internet, television, flight tickets and school fees with zero lines',
              subtitleNp: 'लाइन बस्ने झन्झट बिना बिजुली, खानेपानी, इन्टरनेट, टिभी र हवाई टिकटको सहज भुक्तानी',
              badgeEn: 'Bill Pay',
              badgeNp: 'बिल भुक्तानी',
            },
            {
              id: 'dig-sms',
              titleEn: 'Real-Time SMS Alert Banking',
              titleNp: 'एसएमएस अलर्ट बैंकिङ सेवा',
              subtitleEn: 'Receive immediate SMS notifications for every credit, debit, EMI due date, and notice',
              subtitleNp: 'खातामा रकम जम्मा वा भुक्तानी हुनासाथ मोबाइलमा तत्काल एसएमएस सूचना प्राप्त हुने',
              badgeEn: 'Instant SMS',
              badgeNp: 'एसएमएस अलर्ट',
            },
            {
              id: 'dig-security',
              titleEn: 'Biometric Security & Dual Authentication',
              titleNp: 'बायोमेट्रिक फिंगरप्रिन्ट तथा सुरक्षा',
              subtitleEn: 'Bank-grade encrypted login with fingerprint, face biometric lock and SMS OTP verification',
              subtitleNp: 'फिंगरप्रिन्ट, फेश लक र दुई-तहको एसएमएस ओटिपी प्रमाणीकरणसहित सुरक्षित कारोबार',
              badgeEn: 'Bank Grade',
              badgeNp: 'सुरक्षित प्रणाली',
            },
          ],
          actionLabelEn: 'Download Smart App',
          actionLabelNp: 'एप डाउनलोड गर्नुहोस्',
          actionType: 'download',
        });
        break;

      // ABOUT US
      case 'profile':
        showModal({
          titleEn: cmsPages.profile?.titleEn || 'About Ankur Saving & Credit Cooperative',
          titleNp: cmsPages.profile?.titleNp || 'अंकुर बचत तथा ऋण सहकारी संस्थाको परिचय',
          categoryEn: 'About Us / Our Profile',
          categoryNp: 'हाम्रो बारेमा / हाम्रो परिचय',
          icon: '🏛️',
          descriptionEn:
            cmsPages.profile?.contentEn ||
            cmsPages.profile?.historyEn ||
            'Ankur Saving and Credit Cooperative Society Ltd. was established in 2057 BS with the visionary objective of providing accessible, reliable, and member-centric financial solutions to families, farmers, and entrepreneurs across Rupandehi district. Over more than two decades of dedicated community service, Ankur has evolved into one of the most trusted financial institutions in the region, operating with institutional governance, robust capital reserves, and state-of-the-art Core Banking Software.',
          descriptionNp:
            cmsPages.profile?.contentNp ||
            cmsPages.profile?.historyNp ||
            'अंकुर बचत तथा ऋण सहकारी संस्था लि. वि.सं. २०५७ सालमा रुपन्देही जिल्लाका आम नागरिक, कृषक तथा साना उद्यमीहरूलाई सुलभ, भरपर्दो र सदस्यकेन्द्रित वित्तीय सेवा प्रदान गर्ने पवित्र उद्देश्यका साथ स्थापना भएको हो। विगत २४ वर्षभन्दा लामो अविरल यात्रामा संस्थाले पारदर्शी सुशासन, दह्रो पुँजीगत आधार र आधुनिक प्रविधिको उच्चतम प्रयोग गर्दै यस क्षेत्रकै एक अग्रणी र विश्वासिलो सहकारीको रूपमा स्थापित भएको छ।',
          bulletPointsEn: cmsPages.profile?.pointsEn?.length
            ? cmsPages.profile.pointsEn
            : [
                'Registered under Cooperative Act 2048 with Official Registration No: 124/057/058.',
                'Democratic cooperative governance serving over 10,480 active shareholder members.',
                'State-of-the-art Core Banking System (CBS), mobile banking app, and NepalPay QR payment infrastructure.',
                'Robust capital reserves, regular statutory audits, and member welfare security programs.',
              ],
          bulletPointsNp: cmsPages.profile?.pointsNp?.length
            ? cmsPages.profile.pointsNp
            : [
                'सहकारी ऐन २०४८ बमोजिम डिभिजन सहकारी कार्यालय रुपन्देहीमा दर्ता नं. १२४/०५७/०५८ मा विधिवत दर्ता।',
                '१०,४८० भन्दा बढी सन्तुष्ट सेयर सदस्यहरूको प्रत्यक्ष सहभागिता र सुदृढ पुँजी संरचना।',
                'आधुनिक कोर बैंकिङ सफ्टवेयर (CBS), मोबाइल बैंकिङ र नेपालपे क्युआर भुक्तानी प्रणाली।',
                'पर्याप्त पुँजी पर्याप्तता कोष, नियमित बाह्य लेखापरीक्षण तथा सदस्य कल्याणकारी राहत योजनाहरू।',
              ],
          imageUrl: cmsPages.profile?.bannerImage || cmsPages.profile?.imageUrl,
          showDiscoverSection: true,
          discoverCards: [
            {
              id: 'disc-mission',
              targetId: 'mission-vision',
              titleEn: 'Mission and Vision',
              titleNp: 'ध्येय तथा दृष्टि',
              subtitleEn: 'Strategic direction, purpose, core values and targets',
              subtitleNp: 'रणनीतिक लक्ष्य, उद्देश्य, मूल्य मान्यता र दूरदृष्टि',
              iconType: 'mission',
            },
            {
              id: 'disc-board',
              targetId: 'board',
              titleEn: 'Board of Directors',
              titleNp: 'सञ्चालक समिति',
              subtitleEn: 'Elected fiduciary leadership, policies & governance',
              subtitleNp: 'निर्वाचित नेतृत्व, नीति तर्जुमा र संस्थागत सुशासन',
              iconType: 'board',
            },
            {
              id: 'disc-management',
              targetId: 'management',
              titleEn: 'Management Team',
              titleNp: 'व्यवस्थापन टोली',
              subtitleEn: 'Executive administration, department heads & staff',
              subtitleNp: 'दैनिक कार्यसञ्चालन, विभागीय प्रमुख तथा कर्मचारीहरू',
              iconType: 'management',
            },
            {
              id: 'disc-chairman',
              targetId: 'chairman',
              titleEn: "Chairman's Message",
              titleNp: 'अध्यक्षको सन्देश',
              subtitleEn: 'Message from the Chairman on growth & commitment',
              subtitleNp: 'अध्यक्षबाट संस्थागत विकास र सदस्य सेवाको शुभकामना',
              iconType: 'chairman',
            },
            {
              id: 'disc-departments',
              targetId: 'departments',
              titleEn: 'Departments',
              titleNp: 'विभागहरू',
              subtitleEn: 'Finance, credit, member welfare, audit & IT divisions',
              subtitleNp: 'प्रशासन, कर्जा, सदस्य सुरक्षा, आन्तरिक लेखा र सूचना प्रविधि',
              iconType: 'departments',
            },
            {
              id: 'disc-centers',
              targetId: 'service-centers',
              titleEn: 'Service Centers',
              titleNp: 'सेवा केन्द्रहरू',
              subtitleEn: 'Head Office Butwal, Drivertole & branch networks',
              subtitleNp: 'केन्द्रीय कार्यालय बुटवल, ड्राइभरटोल तथा शाखा कार्यालयहरू',
              iconType: 'service-centers',
            },
          ],
        });
        break;

      case 'history': {
        const histData = cmsHistoryMilestones || INITIAL_CMS_HISTORY_MILESTONES;
        const sortedMilestones = (histData.milestones || [])
          .slice()
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        showModal({
          titleEn: histData.titleEn || 'History & Evolutionary Milestones',
          titleNp: histData.titleNp || 'इतिहास तथा ऐतिहासिक विकासक्रम',
          categoryEn: 'About Us / History',
          categoryNp: 'हाम्रो बारेमा / इतिहास',
          icon: '📜',
          descriptionEn: histData.overviewEn || histData.introEn || cmsPages.profile?.historyEn || '',
          descriptionNp: histData.overviewNp || histData.introNp || cmsPages.profile?.historyNp || '',
          bulletPointsEn:
            histData.highlightsEn && histData.highlightsEn.length > 0
              ? histData.highlightsEn
              : sortedMilestones.map((m) => `${m.yearBs} BS (${m.yearAd} AD) — ${m.titleEn}: ${m.descriptionEn}`),
          bulletPointsNp:
            histData.highlightsNp && histData.highlightsNp.length > 0
              ? histData.highlightsNp
              : sortedMilestones.map((m) => `वि.सं. ${m.yearBs} (${m.yearAd} AD) — ${m.titleNp}: ${m.descriptionNp}`),
          cards: sortedMilestones.map((m) => ({
            id: m.id,
            titleEn: `${m.icon || '🏛️'} ${m.yearBs} B.S. (${m.yearAd} A.D.) — ${m.titleEn}`,
            titleNp: `${m.icon || '🏛️'} वि.सं. ${m.yearBs} (${m.yearAd} इ.सं.) — ${m.titleNp}`,
            subtitleEn: m.descriptionEn,
            subtitleNp: m.descriptionNp,
            badgeEn: m.badgeEn || `${m.yearBs} BS`,
            badgeNp: m.badgeNp || `वि.सं. ${m.yearBs}`,
          })),
          actionLabelEn: 'Explore Our Profile',
          actionLabelNp: 'संस्थागत परिचय हेर्नुहोस्',
          actionType: 'profile',
        });
        break;
      }

      case 'core-values':
        showModal({
          titleEn: 'Core Values & Cooperative Principles',
          titleNp: 'मूल मान्यता तथा अन्तर्राष्ट्रिय सहकारी सिद्धान्तहरू',
          categoryEn: 'About Us / Values',
          categoryNp: 'हाम्रो बारेमा / मूल मान्यता',
          icon: '💎',
          descriptionEn:
            'Ankur Cooperative operates upon the timeless 7 International Cooperative Principles, combining community solidarity with strict fiscal responsibility, ethical transparency, and member-first care.',
          descriptionNp:
            'अंकुर सहकारी अन्तर्राष्ट्रिय सहकारी महासंघ (ICA) द्वारा प्रतिपादित सात सिद्धान्तहरू र उच्च व्यावसायिक नैतिकतामा आधारित रहेर सम्पूर्ण सेयर सदस्यहरूको आर्थिक तथा सामाजिक उत्थानमा समर्पित छ।',
          bulletPointsEn: cmsPages.missionVision?.valuesEn?.length
            ? cmsPages.missionVision.valuesEn
            : [
                'Voluntary and Open Membership: Non-discriminatory financial inclusion for all citizens.',
                'Democratic Member Control: One member, one vote policy ensuring equitable governance.',
                'Member Economic Participation: Fair surplus distribution and dividend returns.',
                'Autonomy and Independence: Self-reliant institutional decision making.',
                'Education, Training & Information: Continuous financial literacy programs for members.',
                'Cooperation Among Cooperatives: Fostering synergy across the cooperative sector.',
                'Concern for Community: Active social responsibility and environmental stewardship.',
              ],
          bulletPointsNp: cmsPages.missionVision?.valuesNp?.length
            ? cmsPages.missionVision.valuesNp
            : [
                'खुल्ला तथा ऐच्छिक सदस्यता: सबै नागरिकहरूका लागि विभेदरहित वित्तीय पहुँच।',
                'लोकतान्त्रिक सदस्य नियन्त्रण: एक सदस्य एक मतको आधारमा पारदर्शी नीतिगत सुशासन।',
                'सदस्यको आर्थिक सहभागिता: सुरक्षित बचत र बचतमा आधारित उचित लाभांश वितरण।',
                'स्वायत्तता र स्वतन्त्रता: सदस्यहरूको सर्वोत्तम हितमा आधारित स्वतन्त्र निर्णय प्रक्रिया।',
                'शिक्षा, तालिम र सूचना: सदस्यहरूलाई निरन्तर वित्तीय साक्षरता र सीप विकास तालिम।',
                'सहकारीहरूबीच पारस्परिक सहकार्य: अभियानको सबलीकरणमा ऐक्यबद्धता।',
                'समुदायप्रति चासो: स्थानीय विकास, स्वास्थ्य र शिक्षामा सामाजिक उत्तरदायित्व।',
              ],
          actionLabelEn: 'View Mission & Vision',
          actionLabelNp: 'ध्येय तथा दृष्टि हेर्नुहोस्',
          actionType: 'mission-vision',
        });
        break;

      case 'institutional-profile':
      case 'about-intro': {
        const searchReportId = typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('report') || undefined
          : undefined;

        openFullPage({
          titleEn: 'Institutional Profile & Monthly Financial Statement',
          titleNp: 'संस्थागत प्रोफाइल तथा मासिक वित्तीय विवरण',
          categoryEn: 'Monthly Financial Statement',
          categoryNp: 'मासिक वित्तीय विवरण',
          icon: '📊',
          isInstitutionalProfile: true,
          monthlyReports: cmsMonthlyFinancialReports,
          selectedReportId: searchReportId,
          // Intentionally omitting imageUrl, bulletPoints, and cards to keep the Institutional Profile clean and dedicated
        });
        break;
      }

      case 'why-choose-us': {
        const whyData = cmsWhyChooseUs || INITIAL_CMS_WHY_CHOOSE_US;
        const sortedPillars = (whyData.items || whyData.pillars || [])
          .slice()
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        showModal({
          titleEn: whyData.titleEn || 'Why Choose Ankur Cooperative?',
          titleNp: whyData.titleNp || 'अंकुर सहकारी नै किन रोज्ने?',
          categoryEn: 'About Us / Advantage',
          categoryNp: 'हाम्रो बारेमा / विशेषताहरू',
          icon: '⭐',
          descriptionEn: whyData.overviewEn || whyData.introEn || whyData.subtitleEn,
          descriptionNp: whyData.overviewNp || whyData.introNp || whyData.subtitleNp,
          bulletPointsEn: whyData.highlightsEn || [],
          bulletPointsNp: whyData.highlightsNp || [],
          cards: sortedPillars.map((p) => ({
            id: p.id,
            titleEn: `${p.icon || '⭐'} ${p.titleEn}`,
            titleNp: `${p.icon || '⭐'} ${p.titleNp}`,
            subtitleEn: p.descriptionEn || p.descEn,
            subtitleNp: p.descriptionNp || p.descNp,
            badgeEn: p.badgeEn || 'Key Pillar',
            badgeNp: p.badgeNp || 'प्रमुख आधार',
          })),
          actionLabelEn: 'Apply for Membership',
          actionLabelNp: 'सदस्यता आवेदन गर्नुहोस्',
          actionType: 'register',
        });
        break;
      }

      case 'success-stories':
        showModal({
          titleEn: 'Member Success Stories & Community Impact',
          titleNp: 'सदस्य सफलताका कथाहरू तथा सामाजिक रूपान्तरण',
          categoryEn: 'About Us / Impact',
          categoryNp: 'हाम्रो बारेमा / सफलताका कथाहरू',
          icon: '🌱',
          descriptionEn:
            'Real stories of how micro-loans, regular savings habits, and cooperative financial advisory have transformed the livelihoods of members in Rupandehi.',
          descriptionNp:
            'सानो बचतबाट सुरु गरेर अंकुर सहकारीको सहुलियत कर्जा र परामर्शको सहयोगले उद्यमी बनेका सदस्यहरूको वास्तविक सफलता र सामाजिक रूपान्तरणका कथाहरू।',
          cards: [
            {
              titleEn: 'Sita Devi Thapa - Dairy & Organic Agriculture',
              titleNp: 'सीता देवी थापा - व्यावसायिक गाईपालन तथा तरकारी खेती',
              subtitleEn: 'Started with Rs. 3 Lakh agro loan; now employs 6 local women and supplies 150L milk daily.',
              subtitleNp: 'रु. ३ लाख कृषि कर्जाबाट सुरु गरी हाल दैनिक १५० लिटर दूध उत्पादन र ६ जना स्थानीय महिलालाई रोजगारी।',
              badgeEn: 'Agro Entrepreneur',
              badgeNp: 'सफल कृषि उद्यमी',
            },
            {
              titleEn: 'Ram Chandra Sharma - Commercial Logistics & Fleet',
              titleNp: 'रामचन्द्र शर्मा - ढुवानी तथा यातायात व्यवसाय',
              subtitleEn: 'Expanded from a single pickup van to a regional logistics fleet of 4 transport vehicles.',
              subtitleNp: 'एउटा सानो पिकअप भ्यानबाट सुरु गरी हाल ४ वटा मालवाहक गाडीको ढुवानी व्यवसाय सञ्चालन।',
              badgeEn: 'Transport Hero',
              badgeNp: 'यातायात उद्यमी',
            },
            {
              titleEn: 'Hari Prasad Gautam - Digital Service Center',
              titleNp: 'हरि प्रसाद गौतम - डिजिटल सेवा केन्द्र',
              subtitleEn: 'Youth self-employment loan recipient providing printing, IT services, and digital solutions in Butwal.',
              subtitleNp: 'युवा स्वरोजगार कर्जा मार्फत बुटवलमा आधुनिक कम्प्युटर तथा अनलाइन सेवा केन्द्र स्थापना।',
              badgeEn: 'Youth Pioneer',
              badgeNp: 'युवा स्वरोजगार',
            },
            {
              titleEn: 'Women Handicraft & Dhaka Weaving Self-Help Group',
              titleNp: 'ढाका कपडा तथा हस्तकला महिला समूह',
              subtitleEn: '15 rural female members trained under Ankur Cooperative welfare fund, generating independent household income.',
              subtitleNp: 'सहकारीको तालिम तथा सहुलियत कर्जाबाट १५ जना महिलाहरूले ढाका कपडा उत्पादन गरी आत्मनिर्भर बनेका।',
              badgeEn: 'Community Guild',
              badgeNp: 'महिला समूह',
            },
          ],
          actionLabelEn: 'Join Membership Online',
          actionLabelNp: 'अनलाइन सदस्यता लिनुहोस्',
          actionType: 'register',
        });
        break;

      case 'board': {
        const boardMembers = cmsTeam
          .filter((m) => m.category === 'board' || m.category === 'committee')
          .sort((a, b) => (a.order || a.sortOrder || 99) - (b.order || b.sortOrder || 99));
        showModal({
          titleEn: 'Board of Directors & Governance Tree',
          titleNp: 'सञ्चालक समिति तथा नीतिगत नेतृत्व संरचना',
          categoryEn: 'About Us / Governance',
          categoryNp: 'हाम्रो बारेमा / नेतृत्व',
          icon: '♙',
          descriptionEn:
            'The Board of Directors is democratically elected by members at the Annual General Meeting to maintain fiduciary trust, policy formulation, and institutional oversight.',
          descriptionNp:
            'वार्षिक साधारण सभाबाट सम्पूर्ण शेयर सदस्यहरूको मतद्वारा लोकतान्त्रिक तवरले निर्वाचित सञ्चालक समितिले संस्थाको नीति, सुशासन र रणनीतिक योजनाको नेतृत्व गर्दछ।',
          teamMembers: boardMembers.length > 0 ? boardMembers : undefined,
          cards: boardMembers.map((m) => ({
            id: m.id,
            titleEn: m.nameEn,
            titleNp: m.nameNp,
            subtitleEn: `${m.roleEn}${m.departmentEn ? ` • ${m.departmentEn}` : ''}`,
            subtitleNp: `${m.roleNp}${m.departmentNp ? ` • ${m.departmentNp}` : ''}`,
            phone: m.phone,
            email: m.email,
            badgeEn: m.roleEn,
            badgeNp: m.roleNp,
          })),
          actionLabelEn: 'Contact Board Secretariat',
          actionLabelNp: 'सञ्चालक सचिवालय सम्पर्क',
          actionType: 'contact',
        });
        break;
      }

      case 'management': {
        const managementMembers = cmsTeam
          .filter((m) => m.category === 'management')
          .sort((a, b) => (a.order || a.sortOrder || 99) - (b.order || b.sortOrder || 99));
        showModal({
          titleEn: 'Executive Management Team',
          titleNp: 'व्यवस्थापन टोली तथा कर्मचारी प्रशासन',
          categoryEn: 'About Us / Management',
          categoryNp: 'हाम्रो बारेमा / व्यवस्थापन',
          icon: '⚙',
          descriptionEn:
            'Our seasoned management professionals, led by the Chief Executive Officer, ensure smooth daily financial operations, prompt member services, and compliance.',
          descriptionNp:
            'प्रमुख कार्यकारी अधिकृतको नेतृत्वमा रहेको दक्ष र अनुभवी व्यवस्थापन समूहले दैनिक वित्तीय कारोबार, सदस्य सेवा प्रवाह र कानुनी परिपालना चुस्त राखेको छ।',
          teamMembers: managementMembers.length > 0 ? managementMembers : undefined,
          cards: managementMembers.map((m) => ({
            id: m.id,
            titleEn: m.nameEn,
            titleNp: m.nameNp,
            subtitleEn: `${m.roleEn}${m.departmentEn ? ` • ${m.departmentEn}` : ''}`,
            subtitleNp: `${m.roleNp}${m.departmentNp ? ` • ${m.departmentNp}` : ''}`,
            phone: m.phone,
            email: m.email,
            badgeEn: m.roleEn,
            badgeNp: m.roleNp,
          })),
          actionLabelEn: 'Contact Management',
          actionLabelNp: 'व्यवस्थापन सम्पर्क',
          actionType: 'contact',
        });
        break;
      }

      case 'departments':
        showModal({
          titleEn: 'Departments & Functional Divisions',
          titleNp: 'विभागीय संरचना तथा जिम्मेवारीहरू',
          categoryEn: 'About Us / Departments',
          categoryNp: 'हाम्रो बारेमा / विभागहरू',
          icon: '⌘',
          descriptionEn:
            'Ankur Cooperative operates through specialized departments designed to deliver streamlined member experiences and solid risk management.',
          descriptionNp:
            'संस्थाका सम्पूर्ण काम-कारबाहीहरूलाई व्यवस्थित र छिटोछरितो बनाउन विशिष्टीकृत विभागहरू क्रियाशील रहेका छन्।',
          cards: cmsDepartments.map((d) => ({
            id: d.id,
            titleEn: d.nameEn,
            titleNp: d.nameNp,
            subtitleEn: d.headEn ? `Head: ${d.headEn}` : undefined,
            subtitleNp: d.headNp ? `विभागीय प्रमुख: ${d.headNp}` : undefined,
            phone: d.phone,
            email: d.email,
            pointsEn: d.responsibilitiesEn,
            pointsNp: d.responsibilitiesNp,
          })),
        });
        break;

      case 'service-centers':
        showModal({
          titleEn: 'Service Centers & Branch Network',
          titleNp: 'सेवा केन्द्रहरू तथा शाखा सञ्जाल',
          categoryEn: 'About Us / Network',
          categoryNp: 'हाम्रो बारेमा / सेवा केन्द्र',
          icon: '▣',
          descriptionEn:
            'Providing accessible, friendly face-to-face services across multiple municipal wards and market hubs.',
          descriptionNp:
            'सदस्यहरूलाई पायक पर्ने स्थानबाट सेवा प्रदान गर्न विभिन्न मुख्य बजार तथा वडास्तरमा आधुनिक सेवा केन्द्रहरू सञ्चालनमा छन्।',
          cards: cmsServiceCenters.map((c) => ({
            id: c.id,
            titleEn: c.nameEn,
            titleNp: c.nameNp,
            subtitleEn: c.addressEn,
            subtitleNp: c.addressNp,
            badgeEn: c.isHeadOffice ? 'Head Office' : 'Service Center',
            badgeNp: c.isHeadOffice ? 'केन्द्रीय कार्यालय' : 'सेवा केन्द्र',
            phone: c.phone,
            email: c.email,
            mapUrl: c.mapUrl,
          })),
          actionLabelEn: 'View on Google Maps',
          actionLabelNp: 'नक्सामा शाखा हेर्नुहोस्',
          actionType: 'contact',
        });
        break;

      case 'mission-vision':
        showModal({
          titleEn: cmsPages.missionVision?.titleEn || 'Mission, Vision & Core Values',
          titleNp: cmsPages.missionVision?.titleNp || 'संस्थाको ध्येय, दृष्टि तथा मूल्यमान्यता',
          categoryEn: 'About Us / Philosophy',
          categoryNp: 'हाम्रो बारेमा / ध्येय र दृष्टि',
          icon: '◎',
          descriptionEn:
            cmsPages.missionVision?.contentEn ||
            (cmsPages.missionVision?.visionEn
              ? `Our Vision:\n${cmsPages.missionVision.visionEn}\n\nOur Mission:\n${cmsPages.missionVision.missionEn || ''}`
              : undefined),
          descriptionNp:
            cmsPages.missionVision?.contentNp ||
            (cmsPages.missionVision?.visionNp
              ? `हाम्रो दूरदृष्टि (Vision):\n${cmsPages.missionVision.visionNp}\n\nहाम्रो ध्येय (Mission):\n${cmsPages.missionVision.missionNp || ''}`
              : undefined),
          bulletPointsEn:
            cmsPages.missionVision?.valuesEn ||
            cmsPages.missionVision?.bulletPointsEn,
          bulletPointsNp:
            cmsPages.missionVision?.valuesNp ||
            cmsPages.missionVision?.bulletPointsNp,
          imageUrl: cmsPages.missionVision?.imageUrl,
        });
        break;

      case 'chairman':
      case 'about-chairman': {
        const chairMember = cmsLeadershipMembers.find((m) => m.category === 'chairman');
        if (chairMember) {
          setActivePageData(null);
          setIsModalOpen(false);
          setSelectedLeadershipLeader(chairMember);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        showModal({
          titleEn: cmsPages.chairman?.titleEn || 'Message from the Chairman',
          titleNp: cmsPages.chairman?.titleNp || 'अध्यक्षको शुभकामना सन्देश',
          categoryEn: 'About Us / Message',
          categoryNp: 'हाम्रो बारेमा / सन्देश',
          icon: '♟',
          descriptionEn: cmsPages.chairman?.messageEn || cmsPages.chairman?.contentEn,
          descriptionNp: cmsPages.chairman?.messageNp || cmsPages.chairman?.contentNp,
          bulletPointsEn: cmsPages.chairman?.bulletPointsEn,
          bulletPointsNp: cmsPages.chairman?.bulletPointsNp,
          imageUrl: cmsPages.chairman?.photoUrl || cmsPages.chairman?.imageUrl,
          actionLabelEn: 'Contact Chairman Office',
          actionLabelNp: 'अध्यक्ष कार्यालय सम्पर्क',
          actionType: 'contact',
        });
        break;
      }

      case 'ceo':
      case 'about-ceo': {
        const ceoMember = cmsLeadershipMembers.find((m) => m.category === 'ceo');
        if (ceoMember) {
          setActivePageData(null);
          setIsModalOpen(false);
          setSelectedLeadershipLeader(ceoMember);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        showModal({
          titleEn: cmsPages.ceo?.titleEn || 'Message from the Chief Executive Officer',
          titleNp: cmsPages.ceo?.titleNp || 'प्रमुख कार्यकारी अधिकृत (CEO) बाट सन्देश',
          categoryEn: 'About Us / Message',
          categoryNp: 'हाम्रो बारेमा / सन्देश',
          icon: '♜',
          descriptionEn: cmsPages.ceo?.messageEn || cmsPages.ceo?.contentEn,
          descriptionNp: cmsPages.ceo?.messageNp || cmsPages.ceo?.contentNp,
          bulletPointsEn: cmsPages.ceo?.bulletPointsEn,
          bulletPointsNp: cmsPages.ceo?.bulletPointsNp,
          imageUrl: cmsPages.ceo?.photoUrl || cmsPages.ceo?.imageUrl,
          actionLabelEn: 'Contact Executive Office',
          actionLabelNp: 'कार्यकारी कार्यालय सम्पर्क',
          actionType: 'contact',
        });
        break;
      }


      // NOTICES / CALCULATOR
      case 'calculator': {
        const calcEl = document.getElementById('calculator');
        if (calcEl) {
          calcEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          showModal({
            titleEn: 'Loan EMI & Interest Calculator',
            titleNp: 'कर्जा ईएमआई तथा ब्याज क्याल्कुलेटर',
            icon: '🧮',
            descriptionEn:
              'Calculate your estimated monthly installment (EMI), interest rate, and total repayment schedule for cooperative loans.',
            descriptionNp:
              'आफ्नो कर्जाको मासिक किस्ता (EMI), ब्याज रकम र भुक्तानी तालिका सजिलै हिसाब गर्नुहोस्।',
            actionType: 'portal',
          });
        }
        break;
      }
      case 'latest-notices':
      case 'programs':
      case 'financial-reports':
        showModal({
          titleEn: item.titleEn,
          titleNp: item.titleNp,
          categoryEn: 'Notices & Circulars',
          categoryNp: 'सूचना तथा परिपत्र',
          icon: item.icon,
          descriptionEn: item.subtitleEn,
          descriptionNp: item.subtitleNp,
          bulletPointsEn: [
            'All official notifications are published following approval from the Board of Directors.',
            'Members can subscribe to SMS alerts to receive instant reminders on meetings and rate revisions.',
            'Copies of complete notice documents are accessible at branch reception desks.',
          ],
          bulletPointsNp: [
            'सबै आधिकारिक सूचनाहरू सञ्चालक समितिको निर्णय पश्चात् प्रकाशित गरिएका हुन्।',
            'महत्वपूर्ण साधारण सभा र ब्याजदर संशोधनका सूचनाहरू सदस्यको मोबाइलमा एसएमएसमार्फत समेत पठाइन्छ।',
            'विस्तृत सूचना तथा परिपत्रको प्रतिलिपि नजिकको शाखा कार्यालयको सूचना पाटीमा पनि हेर्न सकिनेछ।',
          ],
          actionLabelEn: 'View All Official Notices',
          actionLabelNp: 'सबै सूचना हेर्नुहोस्',
          actionType: 'contact',
        });
        break;

      // REPORTS
      case 'reports':
      case 'reports-monthly':
      case 'reports-progress':
      case 'reports-annual':
      case 'reports-audit': {
        const filteredReports = item.id === 'reports-monthly'
          ? cmsReports.filter((r) => r.category.toLowerCase().includes('monthly'))
          : item.id === 'reports-annual'
          ? cmsReports.filter((r) => r.category.toLowerCase().includes('annual') || r.category.toLowerCase().includes('agm'))
          : item.id === 'reports-audit'
          ? cmsReports.filter((r) => r.category.toLowerCase().includes('audit'))
          : item.id === 'reports-progress'
          ? cmsReports.filter((r) => r.category.toLowerCase().includes('progress'))
          : cmsReports;
        
        const activeReports = filteredReports.length > 0 ? filteredReports : cmsReports;

        showModal({
          titleEn: item.id === 'reports-monthly'
            ? 'Monthly Financial & Transaction Report'
            : item.id === 'reports-progress'
            ? 'Progress Report & Developmental Target Metrics'
            : item.id === 'reports-annual'
            ? 'Annual General Meeting (AGM) Report'
            : item.id === 'reports-audit'
            ? 'Statutory Auditor & Compliance Inspection Report'
            : 'Cooperative Publication & Audit Reports',
          titleNp: item.id === 'reports-monthly'
            ? 'मासिक वित्तीय कारोबार तथा निक्षेप प्रतिवेदन'
            : item.id === 'reports-progress'
            ? 'संस्थागत प्रगति प्रतिवेदन तथा लक्ष्य सूचकाङ्क'
            : item.id === 'reports-annual'
            ? 'वार्षिक साधारण सभाको आधिकारिक प्रतिवेदन'
            : item.id === 'reports-audit'
            ? 'आधिकारिक लेखापरीक्षण तथा अनुपालन प्रतिवेदन'
            : 'सहकारी प्रतिवेदन तथा आधिकारिक प्रकाशनहरू',
          categoryEn: 'Governance / Reports',
          categoryNp: 'सुशासन / संस्थागत प्रतिवेदन',
          icon: item.id === 'reports-monthly' ? '📅' : item.id === 'reports-progress' ? '📈' : item.id === 'reports-audit' ? '⚖' : '📑',
          descriptionEn: 'Browse and download certified cooperative fiscal audits, monthly summaries, and annual disclosures.',
          descriptionNp: 'संस्थाका प्रमाणित वित्तीय वासलात, मासिक प्रगति विवरण र वार्षिक साधारण सभाका प्रतिवेदनहरू यहाँबाट हेर्न र डाउनलोड गर्न सक्नुहुन्छ।',
          cards: activeReports.map((r) => ({
            id: r.id,
            titleEn: r.titleEn,
            titleNp: r.titleNp,
            subtitleEn: `${r.fiscalYear} • Published: ${r.publishDate}`,
            subtitleNp: `${r.fiscalYear} • प्रकाशित: ${r.publishDate}`,
            badgeEn: r.category,
            badgeNp: r.category,
            fileUrl: r.fileUrl,
            fileSize: r.fileSize,
          })),
          actionLabelEn: 'Download Report (PDF)',
          actionLabelNp: 'प्रतिवेदन डाउनलोड गर्नुहोस् (PDF)',
          actionType: 'download',
        });
        break;
      }

      // CAREER & OPENING VACANCIES
      case 'career':
      case 'career-vacancies':
      case 'career-requirements':
      case 'career-process':
        showModal({
          titleEn: 'Opening Vacancies & Career Opportunities',
          titleNp: 'खुला पदपूर्ति विज्ञापन तथा जागिरका अवसरहरू',
          categoryEn: 'Careers / Vacancy Notice',
          categoryNp: 'करियर / खुला पदपूर्ति',
          icon: '📢',
          descriptionEn:
            'Ankur Saving & Credit Cooperative Ltd. invites applications from dynamic, qualified, and motivated Nepali citizens for the following vacant positions across our Head Office and Service Centers.',
          descriptionNp:
            'अंकुर बचत तथा ऋण सहकारी संस्था लि. को केन्द्रीय कार्यालय तथा सेवा केन्द्रहरूका लागि तपसिल बमोजिमका पदहरूमा खुला प्रतिस्पर्धाद्वारा पदपूर्ति गर्न योग्य, कर्मठ तथा अनुभवी नेपाली नागरिकहरूबाट दरखास्त आह्वान गरिन्छ।',
          cards: cmsCareers.map((c) => ({
            id: c.id,
            titleEn: c.titleEn,
            titleNp: c.titleNp,
            subtitleEn: `${c.department} • Positions: ${c.positions} • Exp: ${c.experience}`,
            subtitleNp: `${c.department} • पद: ${c.positions} • अनुभव: ${c.experience}`,
            badgeEn: c.status === 'open' ? 'Actively Hiring' : 'Application Closed',
            badgeNp: c.status === 'open' ? 'आवेदन खुला' : 'म्याद समाप्त',
            deadline: c.deadline,
            pointsEn: c.requirementsEn,
            pointsNp: c.requirementsNp,
            email: c.applyEmail || 'career@ekatacoop.com.np',
          })),
          actionLabelEn: 'Download Application Form',
          actionLabelNp: 'दरखास्त फाराम डाउनलोड गर्नुहोस्',
          actionType: 'download',
        });
        break;

      // HEAD OFFICE INFORMATION (Dedicated dynamic view from MySQL cmsHeadOffice)
      case 'head-office':
      case 'contact-head-office':
        showModal(buildHeadOfficeModalData(cmsHeadOffice));
        break;

      // CONTACT & BRANCHES
      case 'contact':
      case 'branch-contacts':
      case 'feedback':
      case 'contact-branches':
      case 'contact-support':
      case 'contact-grievance':
      case 'board-contact':
      case 'executives':
      case 'branch-officers':
      case 'grievance':
        showModal({
          titleEn:
            item.id === 'contact-support'
              ? 'Member Helpline & Emergency Support'
              : item.id === 'contact-grievance' || item.id === 'grievance'
              ? 'Member Grievance Redressal & Feedback'
              : item.id === 'contact-branches' || item.id === 'branch-officers'
              ? 'Branch Network & Service Centers'
              : 'Contact Ankur Cooperative & Service Centers',
          titleNp:
            item.id === 'contact-support'
              ? 'सदस्य सहायता तथा आकस्मिक हटलाइन'
              : item.id === 'contact-grievance' || item.id === 'grievance'
              ? 'सदस्य गुनासो सुनुवाइ तथा सुझाव पेटिका'
              : item.id === 'contact-branches' || item.id === 'branch-officers'
              ? 'शाखा सञ्जाल तथा सेवा केन्द्रहरू'
              : 'सम्पर्क तथा सेवा केन्द्रहरू',
          categoryEn: 'Contact Us / Head Office & Branches',
          categoryNp: 'सम्पर्क / केन्द्रीय कार्यालय तथा शाखाहरू',
          icon: '✉',
          descriptionEn:
            'Get in touch with Ankur Cooperative head office, branch desks, and member helpline for swift financial service assistance, inquiries, or feedback.',
          descriptionNp:
            'अंकुर बचत तथा ऋण सहकारी संस्थाको केन्द्रीय कार्यालय, शाखा सेवा केन्द्रहरू र टोल-फ्री सदस्य सहायता डेस्कमा सीधै सम्पर्क गरी सेवा परामर्श तथा जानकारी लिनुहोस्।',
          bulletPointsEn: [
            `Head Office: ${cmsHeadOffice.addressEn} • Tel: ${cmsHeadOffice.primaryPhone}${cmsHeadOffice.altPhone ? ` / ${cmsHeadOffice.altPhone}` : ''}`,
            `Service Centers: ${cmsServiceCenters.map((c) => `${c.nameEn} (${c.phone})`).join(' | ')}`,
            `Official Email: ${cmsHeadOffice.officialEmail} | Website: ${cmsHeadOffice.websiteUrl || 'www.ankurcooperative.coop.np'}`,
            `Toll-Free Member Helpline: ${cmsHeadOffice.tollFreePhone || '1660-01-24580'} (${cmsHeadOffice.sunToThuHoursEn})`,
            `Operating Hours: ${cmsHeadOffice.sunToThuHoursEn} | ${cmsHeadOffice.fridayHoursEn}`,
          ],
          bulletPointsNp: [
            `केन्द्रीय कार्यालय: ${cmsHeadOffice.addressNp || cmsHeadOffice.addressEn} • फोन: ${cmsHeadOffice.primaryPhone}${cmsHeadOffice.altPhone ? ` / ${cmsHeadOffice.altPhone}` : ''}`,
            `शाखा सेवा केन्द्रहरू: ${cmsServiceCenters.map((c) => `${c.nameNp || c.nameEn} (${c.phone})`).join(', ')}`,
            `आधिकारिक इमेल: ${cmsHeadOffice.officialEmail} • वेवसाइट: ${cmsHeadOffice.websiteUrl || 'www.ankurcooperative.coop.np'}`,
            `निःशुल्क सदस्य हटलाइन: ${cmsHeadOffice.tollFreePhone || '१६६०-०१-२४५८०'} (${cmsHeadOffice.sunToThuHoursNp || cmsHeadOffice.sunToThuHoursEn})`,
            `कार्यालय समय: ${cmsHeadOffice.sunToThuHoursNp || cmsHeadOffice.sunToThuHoursEn} | ${cmsHeadOffice.fridayHoursNp || cmsHeadOffice.fridayHoursEn}`,
          ],
          cards:
            item.id === 'contact-grievance'
              ? []
              : cmsServiceCenters.map((center) => ({
                  id: center.id,
                  titleEn: center.nameEn,
                  titleNp: center.nameNp,
                  subtitleEn: `${center.addressEn} • Manager: ${center.managerEn || 'Branch In-Charge'}`,
                  subtitleNp: `${center.addressNp} • व्यवस्थापक: ${center.managerNp || 'शाखा प्रमुख'}`,
                  badgeEn: center.code,
                  badgeNp: center.code,
                  phone: center.phone,
                  email: center.email || cmsHeadOffice.officialEmail,
                  mapUrl: center.mapUrl || cmsHeadOffice.googleMapEmbedUrl || 'https://maps.google.com/?q=Birtamode+Jhapa',
                })),
          actionLabelEn: 'Call Head Office Helpline',
          actionLabelNp: `केन्द्रीय कार्यालयमा फोन गर्नुहोस् (${cmsHeadOffice.primaryPhone})`,
          actionType: 'contact',
        });
        break;

      // NEWS & ACTIVITIES (Connected to Admin CRUD)
      case 'news': {
        const publishedNews = (cmsNewsActivities || []).filter((n) => n.status !== 'Draft');
        showModal({
          titleEn: 'Official News, Notices & Community Activities',
          titleNp: 'आधिकारिक समाचार, सूचना तथा सामुदायिक गतिविधि',
          categoryEn: 'More / News & Activities',
          categoryNp: 'थप / समाचार तथा गतिविधि',
          icon: '📰',
          descriptionEn:
            'Stay updated with Ankur Cooperative official circulars, AGM notices, community welfare campaigns, financial literacy workshops, and special member events.',
          descriptionNp:
            'सहकारीका पछिल्ला आधिकारिक निर्णयहरू, साधारण सभा सम्बन्धी सूचना, संस्थागत गतिविधि र सामाजिक उत्तरदायित्व कार्यक्रमहरूको पूर्ण विवरण।',
          bulletPointsEn: publishedNews.map((n) => `${n.titleEn} (${n.publishDate})`),
          bulletPointsNp: publishedNews.map((n) => `${n.titleNp} (${n.publishDate})`),
          cards: publishedNews.map((n) => ({
            id: n.id,
            titleEn: n.titleEn,
            titleNp: n.titleNp,
            subtitleEn: `${n.publishDate}${n.locationEn ? ` • ${n.locationEn}` : ''} — ${n.summaryEn}`,
            subtitleNp: `${n.publishDate}${n.locationNp ? ` • ${n.locationNp}` : ''} — ${n.summaryNp}`,
            badgeEn: n.category,
            badgeNp: n.category,
            pointsEn: n.highlightsEn,
            pointsNp: n.highlightsNp,
          })),
          actionLabelEn: 'Contact Head Office Desk',
          actionLabelNp: 'केन्द्रीय कार्यालयमा सम्पर्क गर्नुहोस्',
          actionType: 'contact',
        });
        break;
      }

      // OFFICIAL DOWNLOADS (Connected to Admin Downloads & Forms CRUD)
      case 'downloads':
        handleOpenDocumentsVault();
        break;

      // SUGGESTION & FEEDBACK BOX (Connected to Admin Suggestion Box CRUD)
      case 'suggestions':
        showModal({
          titleEn: 'Confidential Suggestion & Feedback Box',
          titleNp: 'गोप्य सुझाव तथा सल्लाह पेटिका',
          categoryEn: 'More / Suggestion Box',
          categoryNp: 'थप / सुझाव पेटिका',
          icon: '💡',
          descriptionEn:
            'Your constructive suggestions help us elevate service quality, accountability, and member satisfaction. All submissions are placed directly before the Internal Supervisory Committee and can be managed in the Admin Console.',
          descriptionNp:
            'तपाईंको रचनात्मक सल्लाह तथा सुझाव संस्थाको सेवा गुणस्तर अभिवृद्धि र पारदर्शिताका लागि अमूल्य छ। प्राप्त सुझाव सीधै आन्तरिक लेखा सुपरिवेक्षण समितिमा पेश हुन्छ।',
          bulletPointsEn: [
            'Confidential Review: Submitted suggestions are treated with strict confidentiality.',
            'Direct Access to Supervisory Committee: Reviewed every 15 days.',
            'Track Resolution: Feedback receipt code issued for logged suggestions.',
            `Help Desk Phone: ${cmsHeadOffice.primaryPhone || cmsSettings?.phoneHeadOffice || '023-540123'}`,
          ],
          bulletPointsNp: [
            'गोपनीयता सुनिश्चित: प्राप्त सुझाव तथा सल्लाह पूर्ण गोप्य राखिन्छ।',
            'लेखा सुपरिवेक्षण समितिसमक्ष सिधै पेश: हरेक १५ दिनमा समीक्षा बैठक।',
            'गुनासो सम्बोधन ट्र्याकिङ: दर्ता नम्बर मार्फत कारबाहीको अवस्था बुझ्न सकिने।',
            `सहायता फोन सम्पर्क: ${cmsHeadOffice.primaryPhone || cmsSettings?.phoneHeadOffice || '०२३-५४०१२३'}`,
          ],
          cards: [],
          actionLabelEn: 'Call Member Helpline',
          actionLabelNp: 'फोन सम्पर्क गर्नुहोस्',
          actionType: 'contact',
        });
        break;

      // FREQUENTLY ASKED QUESTIONS (FAQ) (Connected to Admin FAQ CRUD)
      case 'faq':
        showModal({
          titleEn: 'Frequently Asked Questions (FAQ)',
          titleNp: 'बारम्बार सोधिने प्रश्नहरू (FAQ)',
          categoryEn: 'More / Frequently Asked Questions',
          categoryNp: 'थप / बारम्बार सोधिने प्रश्न',
          icon: '❓',
          descriptionEn:
            'Find rapid, authoritative answers regarding membership eligibility, minimum savings balance, interest payout schedules, loan documentation, and digital mobile banking features.',
          descriptionNp:
            'सदस्यता कसरी लिने, बचत खाताको न्यूनतम मौज्दात, ब्याज गणना विधि, ऋण लिन आवश्यक प्रक्रिया र मोबाइल बैंकिङ सम्बन्धी आम जिज्ञासाहरूको आधिकारिक समाधान।',
          bulletPointsEn: (cmsFaqs || []).map((f) => `Q: ${f.questionEn} — ${f.answerEn}`),
          bulletPointsNp: (cmsFaqs || []).map((f) => `प्र: ${f.questionNp} — ${f.answerNp}`),
          cards: (cmsFaqs || []).map((f, idx) => ({
            id: f.id || `faq-${idx}`,
            titleEn: `Q${idx + 1}: ${f.questionEn}`,
            titleNp: `प्रश्न ${idx + 1}: ${f.questionNp}`,
            subtitleEn: f.answerEn,
            subtitleNp: f.answerNp,
            badgeEn: f.category,
            badgeNp: f.category,
          })),
          actionLabelEn: 'Call Member Desk',
          actionLabelNp: 'थप जानकारीका लागि सम्पर्क',
          actionType: 'contact',
        });
        break;

      case 'ekym':
        setIsModalOpen(false);
        setActivePageData(null);
        setCurrentView('ekym');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 'portal':
      case 'member-portal':
        setIsModalOpen(false);
        setActivePageData(null);
        setCurrentView('member');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 'admin':
      case 'admin-login':
        setIsModalOpen(false);
        setActivePageData(null);
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 'apply-loan':
        setLoanModalState({ isOpen: true });
        break;

      case 'emi-calculator':
        setSmartModalState({ isOpen: true, tab: 'emi-calculator' });
        break;

      case 'date-converter':
        setSmartModalState({ isOpen: true, tab: 'date-converter' });
        break;

      case 'exchange-rates':
        setSmartModalState({ isOpen: true, tab: 'exchange-rates' });
        break;

      // MORE / FALLBACK
      default:
        showModal({
          titleEn: item.titleEn || 'Information & Publications',
          titleNp: item.titleNp || 'जानकारी तथा प्रकाशनहरू',
          categoryEn: 'About Us / Information',
          categoryNp: 'हाम्रो बारेमा / थप जानकारी',
          icon: item.icon || 'ℹ️',
          descriptionEn: item.subtitleEn || 'Explore official publications, forms, community activities, and member support.',
          descriptionNp: item.subtitleNp || 'वार्षिक प्रतिवेदन, फाराम डाउनलोड, सुझाव पेटिका र सामाजिक गतिविधिको पूर्ण विवरण।',
          bulletPointsEn: [
            'Explore official publications, downloadable forms, and community activities.',
            'Suggestions submitted via this portal are reviewed directly by the internal audit committee.',
          ],
          bulletPointsNp: [
            'वार्षिक प्रतिवेदन, फाराम डाउनलोड र सामाजिक गतिविधिको पूर्ण विवरण।',
            'यस पोर्टलबाट प्राप्त सुझावहरू सीधै आन्तरिक अनुगमन समितिमा पेश हुनेछन्।',
          ],
          actionLabelEn: 'Call Member Desk',
          actionLabelNp: 'थप जानकारीका लागि सम्पर्क',
          actionType: 'contact',
        });
        break;
    }
  };

  // Login handler
  const handleLoginClick = (type: 'member' | 'office') => {
    if (type === 'member') {
      showModal({
        titleEn: 'Member Internet Banking Login',
        titleNp: 'सदस्य अनलाइन बैंकिङ लगइन',
        categoryEn: 'Member Portal',
        categoryNp: 'सदस्य पोर्टल',
        icon: '♙',
        descriptionEn:
          'Sign in with your Member Account Number and secure password to view balance, transfer funds, check loan statements, and download tax clearance certificates.',
        descriptionNp:
          'आफ्नो सदस्य नम्बर र पासवर्ड प्रयोग गरी लगइन गर्नुहोस्। बचत मौज्दात, कर्जा स्टेटमेन्ट र कारोबारको पूर्ण विवरण तुरुन्त हेर्नुहोस्।',
        bulletPointsEn: [
          'Demo Account No: ANKUR-10482',
          'Demo PIN/Pass: •••••• (Sample view provided in sandbox)',
          'Two-factor SMS OTP authentication is enabled for maximum security.',
        ],
        bulletPointsNp: [
          'डेमो खाता नं.: ANKUR-10482',
          'डेमो पिन/पासवर्ड: •••••• (परीक्षण सुविधा)',
          'खाताको सुरक्षाका लागि दुई-तहको एसएमएस ओटिपी (OTP) सुरक्षा प्रणाली सक्रिय छ।',
        ],
        actionLabelEn: 'Enter Member Portal',
        actionLabelNp: 'सदस्य पोर्टल प्रवेश',
        actionType: 'portal',
      });
    } else {
      showModal({
        titleEn: 'Office & Staff Administration Login',
        titleNp: 'कार्यालय तथा कर्मचारी प्रशासन लगइन',
        categoryEn: 'Administration',
        categoryNp: 'प्रशासन पोर्टल',
        icon: '♟',
        descriptionEn:
          'Authorized staff and administrator access to the core banking back-office, loan approvals, member KYC verification, and financial reporting modules.',
        descriptionNp:
          'अधिकृत कर्मचारी तथा व्यवस्थापकहरूका लागि कोर बैंकिङ प्रणाली, कर्जा स्वीकृति, केवाइसी प्रमाणीकरण र लेखा रिपोर्टिङ व्यवस्थापन।',
        bulletPointsEn: [
          'Admin Login: Secure portal with credential verification for authorized staff.',
          'IP Whitelisting & audit logging enabled for all administrative sessions.',
          'Full Website CMS: Complete CRUD operations for Home Page Messages from Leadership, Services, and Reports.',
          'Access to member registry, loan evaluations, eKYM and financial CBS reports.',
        ],
        bulletPointsNp: [
          'प्रशासन लगइन: अधिकृत कर्मचारी तथा व्यवस्थापकहरूका लागि सुरक्षित पहुँच प्रणाली।',
          'प्रशासनिक सत्रका लागि सुरक्षित आइपी र अडिट लगिङ सक्रिय छ।',
          'पूर्ण वेबसाइट CMS: मुख्य पृष्ठको नेतृत्व सन्देश (पूर्ण CRUD तथा फोटो अपलोड), सेवाहरू र प्रतिवेदन व्यवस्थापन।',
          'सदस्य विवरण, कर्जा मूल्याङ्कन, eKYM प्रमाणीकरण र वित्तीय लेखा व्यवस्थापन।',
        ],
        actionLabelEn: 'Proceed to Admin Console',
        actionLabelNp: 'प्रशासन कन्सोल खोल्नुहोस्',
        actionType: 'portal',
      });
    }
  };

  // Quick navigation
  const handleQuickNav = (targetId: string) => {
    if (currentView !== 'website') {
      setCurrentView('website');
    }
    if (targetId === 'digital-services' || targetId === 'digital') {
      setActivePageData({
        id: 'digital-services',
        titleEn: 'Digital Services & Smart Banking',
        titleNp: 'डिजिटल सेवाहरू तथा अनलाइन अनुरोध',
        subtitleEn: 'Missed call banking, statement, mobile & card services',
        subtitleNp: 'मिस्ड कल बैंकिङ, स्टेटमेन्ट, मोबाइल तथा कार्ड सेवा',
        icon: '📱',
        categoryEn: 'Services / Digital',
        categoryNp: 'सेवाहरू / डिजिटल',
        descriptionEn: 'Request and manage all digital services online.',
        descriptionNp: 'सबै डिजिटल बैंकिङ सेवाहरू अनलाइन अनुरोध गर्नुहोस्।',
      } as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (targetId === 'privacy' || targetId === 'privacy-policy') {
      handleOpenPrivacyPolicy();
      return;
    }
    if (targetId === 'documents' || targetId === 'document-vault' || targetId === 'downloads') {
      handleOpenDocumentsVault();
      return;
    }
    if (targetId === 'news' || targetId === 'notices') {
      handleMegaMenuItemClick({
        id: 'news',
        titleEn: 'News & Activities',
        titleNp: 'समाचार तथा गतिविधि',
        subtitleEn: 'Community events, CSR and field activities',
        subtitleNp: 'सामुदायिक गतिविधि, सामाजिक उत्तरदायित्व',
        icon: '📰',
        link: '#more-news',
      });
      return;
    }
    if (targetId === 'suggestions') {
      handleMegaMenuItemClick({
        id: 'suggestions',
        titleEn: 'Suggestion Box',
        titleNp: 'सुझाव पेटिका',
        subtitleEn: 'Submit confidential feedback & ideas',
        subtitleNp: 'आफ्ना महत्वपूर्ण सुझाव तथा सल्लाह पठाउनुहोस्',
        icon: '💡',
        link: '#more-suggestions',
      });
      return;
    }
    if (targetId === 'faq') {
      handleMegaMenuItemClick({
        id: 'faq',
        titleEn: 'Frequently Asked Questions',
        titleNp: 'बारम्बार सोधिने प्रश्न',
        subtitleEn: 'Clear answers on accounts, loans and rules',
        subtitleNp: 'खाता, कर्जा र सदस्यता सम्बन्धी जानकारी',
        icon: '❓',
        link: '#more-faq',
      });
      return;
    }
    if (targetId === 'home') {
      setActivePageData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (targetId === 'services') {
      handleMegaMenuItemClick({
        id: 'services',
        titleEn: 'All Cooperative Services & Financial Solutions',
        titleNp: 'अंकुर सहकारीका सम्पूर्ण सेवाहरू तथा वित्तीय समाधानहरू',
        subtitleEn: 'Comprehensive member savings, loans, remittance & digital banking',
        subtitleNp: 'सदस्यकेन्द्रित बचत, कर्जा, रेमिट्यान्स तथा आधुनिक डिजिटल बैंकिङ',
        icon: '▣',
        link: '#services',
      });
      return;
    }
    if (targetId === 'reports') {
      handleMegaMenuItemClick({
        id: 'reports',
        titleEn: 'Cooperative Publication & Audit Reports',
        titleNp: 'सहकारी प्रतिवेदन तथा आधिकारिक प्रकाशनहरू',
        subtitleEn: 'Financial audits, AGM books and quarterly disclosures',
        subtitleNp: 'लेखापरीक्षण, वार्षिक प्रतिवेदन तथा प्रगति विवरण',
        icon: '📑',
        link: '#reports',
      });
      return;
    }
    if (targetId === 'career') {
      handleMegaMenuItemClick({
        id: 'career',
        titleEn: 'Opening Vacancies & Career Opportunities',
        titleNp: 'खुला पदपूर्ति विज्ञापन तथा जागिरका अवसरहरू',
        subtitleEn: 'Explore active job openings in cooperative',
        subtitleNp: 'सहकारीमा हाल खुलेका जागिरका अवसरहरू',
        icon: '📢',
        link: '#career',
      });
      return;
    }
    if (targetId === 'contact') {
      handleMegaMenuItemClick({
        id: 'contact',
        titleEn: 'Contact Ankur Cooperative & Service Network',
        titleNp: 'सम्पर्क, केन्द्रीय कार्यालय तथा सेवा केन्द्रहरू',
        subtitleEn: 'Head Office Butwal, branches & member helpline',
        subtitleNp: 'केन्द्रीय कार्यालय बुटवल, शाखा तथा हटलाइन सहायता',
        icon: '✉',
        link: '#contact',
      });
      return;
    }
    if (targetId === 'about') {
      handleMegaMenuItemClick({
        id: 'profile',
        titleEn: 'Our Profile',
        titleNp: 'हाम्रो परिचय',
        subtitleEn: 'Institutional Profile & History',
        subtitleNp: 'संस्थागत परिचय तथा इतिहास',
        icon: '🏛️',
        link: '#about-profile',
      });
      return;
    }
    if (targetId === 'centers') {
      handleMegaMenuItemClick({
        id: 'service-centers',
        titleEn: 'Service Centers',
        titleNp: 'सेवा केन्द्रहरू',
        subtitleEn: 'Service branch locations',
        subtitleNp: 'सेवा स्थानहरू तथा शाखाहरू',
        icon: '📍',
        link: '#about-centers',
      });
      return;
    }
    if (targetId === 'help' || targetId === 'services-help') {
      handleMegaMenuItemClick({
        id: 'help',
        titleEn: 'Help & Member Support Center',
        titleNp: 'सहायता तथा सदस्य सेवा केन्द्र',
        subtitleEn: '24/7 Helpline, FAQs, Grievance desk & financial self-service tools',
        subtitleNp: '२४/७ हेल्पलाइन, सोधिने प्रश्नहरू, गुनासो सुनुवाइ तथा वित्तीय उपकरणहरू',
        icon: '❓',
        link: '#services-help',
      });
      return;
    }
    if (targetId === 'digital' || targetId === 'digital-services' || targetId === 'smart-banking') {
      setActivePageData(null);
      setCurrentView('website');
      setTimeout(() => {
        const el = document.getElementById('digital-services');
        if (el) {
          const yOffset = -80;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 60);
      return;
    }
    if (targetId === 'ekym') {
      setCurrentView('ekym');
      return;
    }
    if (targetId === 'date-converter') {
      setSmartModalState({ isOpen: true, tab: 'date-converter' });
      return;
    }
    if (targetId === 'exchange-rates') {
      setSmartModalState({ isOpen: true, tab: 'exchange-rates' });
      return;
    }
    if (targetId === 'smart-emi') {
      setSmartModalState({ isOpen: true, tab: 'emi-calculator' });
      return;
    }

    // Scroll to on-page visual sections (calculator, rates, notices, etc.)
    setActivePageData(null);
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        if (targetId === 'calculator') {
          showModal({
            titleEn: 'Loan EMI & Interest Calculator',
            titleNp: 'कर्जा ईएमआई तथा ब्याज क्याल्कुलेटर',
            icon: '🧮',
            descriptionEn:
              'Calculate your estimated monthly installment (EMI), interest rate, and total repayment schedule for cooperative loans.',
            descriptionNp:
              'आफ्नो कर्जाको मासिक किस्ता (EMI), ब्याज रकम र भुक्तानी तालिका सजिलै हिसाब गर्नुहोस्।',
            actionType: 'portal',
          });
        } else if (targetId === 'downloads') {
          showModal({
            titleEn: 'Downloads & Official Forms',
            titleNp: 'डाउनलोड तथा फारामहरू',
            icon: '⬇',
            descriptionEn:
              'Download membership forms, loan application sheets, KYC update templates, and annual report books in PDF format.',
            descriptionNp:
              'खाता खोल्ने फाराम, कर्जा आवेदन, केवाइसी फाराम र वार्षिक प्रतिवेदन पुस्तक पिडिएफ ढाँचामा डाउनलोड गर्नुहोस्।',
          });
        }
      }
    }, 40);
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page') || params.get('view');
      const hash = window.location.hash;
      if (
        page === 'institutional-profile' ||
        hash === '#institutional-profile' ||
        hash === '#about-institutional-profile'
      ) {
        setTimeout(() => {
          handleMegaMenuItemClick({
            id: 'institutional-profile',
            titleEn: 'Institutional Profile',
            titleNp: 'संस्थागत विवरण',
            subtitleEn: 'Institutional Profile & Monthly Statements',
            subtitleNp: 'संस्थागत प्रोफाइल तथा मासिक वित्तीय विवरण',
            icon: '📊',
            link: '#about-institutional-profile',
          });
        }, 300);
      }
    } catch (e) {}
  }, []);

  if (currentView === 'admin') {
    return (
      <AdminPortal
        lang={lang}
        user={
          currentUser || {
            id: 'usr-1',
            username: 'admin',
            fullName: 'Chief Executive Officer',
            role: 'admin',
            email: 'ceo@ekatacoop.com.np',
          }
        }
        cmsSettings={cmsSettings}
        onUpdateCmsSettings={handleUpdateCmsSettings}
        slides={cmsSlides}
        onUpdateSlides={handleUpdateSlides}
        services={cmsServices}
        onUpdateServices={handleUpdateServices}
        rates={cmsRates}
        onUpdateRates={handleUpdateRates}
        notices={cmsNotices}
        onUpdateNotices={handleUpdateNotices}
        gallery={cmsGallery}
        onUpdateGallery={handleUpdateGallery}
        cmsPages={cmsPages}
        onUpdateCmsPages={handleUpdateCmsPages}
        departments={cmsDepartments}
        onUpdateDepartments={handleUpdateDepartments}
        serviceCenters={cmsServiceCenters}
        onUpdateServiceCenters={handleUpdateServiceCenters}
        reports={cmsReports}
        onUpdateReports={handleUpdateReports}
        careers={cmsCareers}
        onUpdateCareers={handleUpdateCareers}
        headOffice={cmsHeadOffice}
        onUpdateHeadOffice={handleUpdateHeadOffice}
        team={cmsTeam}
        onUpdateTeam={handleUpdateTeam}
        privacyPolicy={cmsPrivacyPolicy}
        onUpdatePrivacyPolicy={(updated) => {
          setCmsPrivacyPolicy(updated);
          saveCmsPrivacyPolicy(updated).catch(() => {});
        }}
        socialLinks={cmsSocialLinks}
        onUpdateSocialLinks={(updated) => {
          setCmsSocialLinks(updated);
          saveCmsSocialLinks(updated).catch(() => {});
        }}
        brandTheme={cmsBrandTheme}
        onUpdateBrandTheme={(updated) => {
          setCmsBrandTheme(updated);
          saveCmsBrandTheme(updated).catch(() => {});
        }}
        documents={cmsDocuments}
        onUpdateDocuments={(updated) => {
          setCmsDocuments(updated);
          saveCmsDocuments(updated).catch(() => {});
        }}
        newsActivities={cmsNewsActivities}
        onUpdateNewsActivities={(updated) => {
          setCmsNewsActivities(updated);
          saveCmsNewsActivities(updated).catch(() => {});
        }}
        suggestions={cmsSuggestions}
        onUpdateSuggestions={(updated) => {
          setCmsSuggestions(updated);
          saveCmsSuggestions(updated).catch(() => {});
        }}
        faqs={cmsFaqs}
        onUpdateFaqs={(updated) => {
          setCmsFaqs(updated);
          saveCmsFaqs(updated).catch(() => {});
        }}
        historyMilestones={cmsHistoryMilestones}
        onUpdateHistoryMilestones={(updated) => {
          setCmsHistoryMilestones(updated);
          saveCmsHistoryMilestones(updated).catch(() => {});
        }}
        whyChooseUs={cmsWhyChooseUs}
        onUpdateWhyChooseUs={(updated) => {
          setCmsWhyChooseUs(updated);
          saveCmsWhyChooseUs(updated).catch(() => {});
        }}
        exchangeRates={cmsExchangeRates}
        onUpdateExchangeRates={(updated) => {
          setCmsExchangeRates(updated);
          saveCmsExchangeRates(updated).catch(() => {});
        }}
        institutionalProfiles={cmsInstitutionalProfiles}
        onUpdateInstitutionalProfiles={(updated) => {
          setCmsInstitutionalProfiles(updated);
          saveCmsInstitutionalProfiles(updated).catch(() => {});
        }}
        monthlyReports={cmsMonthlyFinancialReports}
        onUpdateMonthlyReports={(updated) => {
          setCmsMonthlyFinancialReports(updated);
          saveCmsMonthlyFinancialReports(updated).catch(() => {});
        }}
        leadershipMembers={cmsLeadershipMembers}
        onUpdateLeadershipMembers={(updated) => {
          setCmsLeadershipMembers(updated);
          saveCmsLeadership(updated).catch(() => {});
        }}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView('website');
          refreshAllFromDatabase();
        }}
        onExitToWebsite={() => {
          setCurrentView('website');
          refreshAllFromDatabase();
        }}
        onSwitchToMember={() => setCurrentView('member')}
      />
    );
  }

  if (currentView === 'member') {
    return (
      <MemberPortal
        lang={lang}
        onLanguageChange={setLang}
        cmsSettings={cmsSettings}
        user={
          currentUser || {
            id: 'mem-1',
            username: 'EK-10482',
            fullName: 'Ram Chandra Sharma',
            role: 'member',
            memberCode: 'EK-10482',
            email: 'ram.sharma@ekatacoop.com.np',
          }
        }
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView('website');
        }}
        onExitToWebsite={() => setCurrentView('website')}
        onSwitchToAdmin={() => setCurrentView('admin')}
        onOpenEkym={() => setCurrentView('ekym')}
      />
    );
  }

  if (currentView === 'ekym') {
    return (
      <EkymPortal
        lang={lang}
        cmsSettings={cmsSettings}
        onExitToWebsite={() => setCurrentView('website')}
        onOpenAdmin={() => setCurrentView('admin')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fcfe]">
      {/* Header with Clickable Mega Menu for About Us, Services, Notices, Contact Officers, More & Login */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        onMegaMenuItemClick={handleMegaMenuItemClick}
        onLoginClick={handleLoginClick}
        onQuickNav={handleQuickNav}
        currentUser={currentUser}
        onOpenAdminConsole={() => setCurrentView('admin')}
        onOpenMemberPortal={() => setCurrentView('member')}
        onOpenEkym={() => setCurrentView('ekym')}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView('website');
        }}
        cmsSettings={cmsSettings}
        headOffice={cmsHeadOffice}
        socialLinks={cmsSocialLinks}
        onOpenNoticePopup={() => setIsNoticePopupOpen(true)}
        activePageId={activePageData?.id}
      />

      <main className="flex-1">
        {selectedLeadershipLeader ? (
          <ChairmanMessagePage
            leader={selectedLeadershipLeader}
            lang={lang}
            onBackToAbout={() => {
              setSelectedLeadershipLeader(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activePageData ? (
          activePageData.id === 'digital-services' || activePageData.id === 'digital' ? (

            <div className="min-h-screen bg-[#f4f7f6]">
              {/* Dedicated Breadcrumb and Page Banner */}
              <div className="bg-[#074766] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-[#05354d]">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center gap-2 text-xs font-medium text-sky-200 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePageData(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-white cursor-pointer transition flex items-center gap-1"
                    >
                      <span>🏠</span>
                      <span>{lang === 'np' ? 'गृहपृष्ठ' : 'Home'}</span>
                    </button>
                    <span>/</span>
                    <span className="text-white font-semibold">
                      {lang === 'np' ? 'डिजिटल सेवाहरू' : 'Digital Services'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    <span className="text-3xl">📱</span>
                    <span>
                      {lang === 'np'
                        ? 'डिजिटल सेवाहरू तथा अनलाइन अनुरोध'
                        : 'Digital Services & Online Request'}
                    </span>
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-sky-100 max-w-3xl">
                    {lang === 'np'
                      ? 'मिस्ड कल बैंकिङ, स्टेटमेन्ट, मोबाइल बैंकिङ, एसएमएस अलर्ट तथा अन्य डिजिटल सेवाहरूको लागि अनलाइन फाराम।'
                      : 'Request missed call banking, account statements, mobile banking, SMS alerts, and other digital services online.'}
                  </p>
                </div>
              </div>

              {/* Digital Services Section */}
              <DigitalSection
                lang={lang}
                onOpenEkym={() => setCurrentView('ekym')}
              />
            </div>
          ) : (
            <InfoPageView
              data={activePageData}
              lang={lang}
              onLanguageChange={setLang}
              cmsSettings={cmsSettings}
              headOffice={cmsHeadOffice}
              onApplyLoan={(schemeName) => {
                setLoanModalState({
                  isOpen: true,
                  scheme: schemeName,
                });
              }}
              onSubmitSuggestion={async (newSug) => {
                const ticketNo = `SUG-2083-${Math.floor(100 + Math.random() * 900)}`;
                const created: SuggestionItemCMS = {
                  id: `sug-${Date.now()}`,
                  ticketNo,
                  submittedAt: new Date().toISOString().split('T')[0],
                  status: 'New',
                  ...newSug,
                };
                const res = await submitCmsSuggestion(created);
                if (res.success && Array.isArray(res.data)) {
                  setCmsSuggestions(res.data);
                  return res.item?.ticketNo || ticketNo;
                }
                const updatedList = [created, ...cmsSuggestions];
                setCmsSuggestions(updatedList);
                try {
                  await saveCmsSuggestions(updatedList);
                } catch (e) {}
                return ticketNo;
              }}
              onNavigateToItem={(targetId) => {
                if (targetId === 'apply-loan' || targetId.startsWith('loan-')) {
                  setLoanModalState({ isOpen: true });
                  return;
                }
                if (targetId === 'calculator' || targetId === 'emi-calculator') {
                  setSmartModalState({ isOpen: true, tab: 'emi-calculator' });
                  return;
                }
                if (targetId === 'date-converter') {
                  setSmartModalState({ isOpen: true, tab: 'date-converter' });
                  return;
                }
                if (targetId === 'exchange-rates') {
                  setSmartModalState({ isOpen: true, tab: 'exchange-rates' });
                  return;
                }
                if (targetId === 'privacy' || targetId === 'privacy-policy') {
                  handleOpenPrivacyPolicy();
                  return;
                }
                if (targetId === 'digital-services' || targetId === 'digital') {
                  handleQuickNav('digital-services');
                  return;
                }
                handleMegaMenuItemClick({
                  id: targetId,
                  titleEn: 'Contact & Inquiry Desk',
                  titleNp: 'सम्पर्क तथा सोधपुछ कक्ष',
                  subtitleEn: 'Reach out to Ankur Cooperative Head Office or Service Centers for assistance.',
                  subtitleNp: 'अंकुर सहकारीको केन्द्रीय कार्यालय वा सेवा केन्द्रमा सम्पर्क गर्नुहोस्।',
                  icon: '📞',
                  link: '#contact',
                });
              }}
              onBackToHome={() => {
                setActivePageData(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        ) : (
          <>
            {/* Hero Section with Slider */}
            <Hero
          lang={lang}
          onCtaClick={() => handleQuickNav('services')}
          slides={cmsSlides}
          cmsSettings={cmsSettings}
        />

        {/* Key Operational Statistics (Active Members, Total Savings, etc.) - Placed directly under Hero */}
        <StatsSection lang={lang} stats={cmsSettings} />

        {/* Quick Links & Reports Panel (Institutional Profile, Monthly Report, Progress Report, Annual Report, Audit Report) - Exchanged down */}
        <QuickPanel
          lang={lang}
          onSelectReport={(reportName) => {
            if (reportName === 'profile') {
              handleMegaMenuItemClick({
                id: 'institutional-profile',
                titleEn: 'Institutional Profile & Monthly Financial Statement',
                titleNp: 'संस्थागत प्रोफाइल तथा मासिक वित्तीय विवरण',
                subtitleEn: 'Monthly certified institutional financial statement, share capital, reserves & liquidity',
                subtitleNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. को आधिकारिक मासिक संस्थागत वित्तीय विवरण',
                icon: '📊',
                link: '#about-institutional-profile',
              });
            } else if (reportName === 'monthly') {
              handleMegaMenuItemClick({
                id: 'reports-monthly',
                titleEn: 'Monthly Report',
                titleNp: 'मासिक प्रतिवेदन',
                subtitleEn: 'Monthly financial & transaction statement',
                subtitleNp: 'मासिक वित्तीय कारोबार प्रतिवेदन',
                icon: '📅',
                link: '#reports-monthly',
              });
            } else if (reportName === 'progress') {
              handleMegaMenuItemClick({
                id: 'reports-progress',
                titleEn: 'Progress Report',
                titleNp: 'प्रगति प्रतिवेदन',
                subtitleEn: 'Institutional progress metrics and member growth',
                subtitleNp: 'संस्थागत प्रगति प्रतिवेदन तथा लक्ष्य सूचकाङ्क',
                icon: '📈',
                link: '#reports-progress',
              });
            } else if (reportName === 'annual') {
              handleMegaMenuItemClick({
                id: 'reports-annual',
                titleEn: 'Annual Report',
                titleNp: 'वार्षिक प्रतिवेदन',
                subtitleEn: '24th AGM comprehensive financial & operational book',
                subtitleNp: '२४औं साधारण सभाको संस्थागत प्रतिवेदन',
                icon: '📑',
                link: '#reports-annual',
              });
            } else if (reportName === 'audit') {
              handleMegaMenuItemClick({
                id: 'reports-audit',
                titleEn: 'Audit Report',
                titleNp: 'लेखापरीक्षण प्रतिवेदन',
                subtitleEn: 'Independent statutory certified chartered accountant audit',
                subtitleNp: 'स्वतन्त्र बाह्य लेखापरीक्षण तथा वासलात',
                icon: '⚖',
                link: '#reports-audit',
              });
            } else {
              handleMegaMenuItemClick({
                id: 'reports-annual',
                titleEn: 'Annual Reports',
                titleNp: 'वार्षिक प्रतिवेदन',
                subtitleEn: 'Financial & operational publication',
                subtitleNp: 'वित्तीय तथा संस्थागत प्रतिवेदन',
                icon: '📑',
                link: '#reports-annual',
              });
            }
          }}
        />

        {/* Services Showcase */}
        <ServicesSection
          lang={lang}
          onViewAllServices={() => handleQuickNav('services')}
          onSelectService={(service: ServiceItem) => {
            handleMegaMenuItemClick({
              id: service.id,
              titleEn: service.titleEn,
              titleNp: service.titleNp,
              subtitleEn: service.descriptionEn,
              subtitleNp: service.descriptionNp,
              icon: service.icon,
              link: `#services-${service.id}`,
            });
          }}
          services={cmsServices}
        />



        {/* Current Interest Rates & Live Loan EMI Calculator */}
        <RatesAndNotices
          lang={lang}
          onViewAllRates={() => {
            handleMegaMenuItemClick({
              id: 'deposit-product',
              titleEn: 'Comprehensive Interest Rate Schedule (Effective 2083)',
              titleNp: 'विस्तृत ब्याजदर तालिका (लागू मिति २०८३)',
              subtitleEn: 'Deposit & loan interest rate schemes',
              subtitleNp: 'बचत तथा कर्जा ब्याजदर तालिका',
              icon: '⌁',
              link: '#rates',
            });
          }}
          onApplyLoan={(schemeName, amount, tenure) => {
            setLoanModalState({
              isOpen: true,
              scheme: schemeName,
              amount,
              tenure,
            });
          }}
          rates={cmsRates}
        />

        {/* Professional Messages from Leadership Section (Positioned after EMI Calculator) */}
        <LeadershipSection
          lang={lang}
          members={cmsLeadershipMembers}
          onSelectLeader={(member) => {
            setSelectedLeadershipLeader(member);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          externalSelectedLeader={selectedLeadershipLeader}
          onClearExternalSelectedLeader={() => setSelectedLeadershipLeader(null)}
          onFileGrievance={() => {
            handleMegaMenuItemClick({
              id: 'contact-grievance',
              titleEn: 'Member Grievances & Redressal Desk',
              titleNp: 'सदस्य गुनासो सुनुवाइ तथा सुझाव डेस्क',
              subtitleEn: 'Submit official feedback or complaints',
              subtitleNp: 'आधिकारिक सुझाव वा गुनासो दर्ता गर्नुहोस्',
              icon: '✉',
              link: '#contact-grievance',
            });
          }}
          onOpenOfficerDetails={(member) => {
            setSelectedLeadershipLeader(member);
          }}
        />

        {/* Gallery */}
        <GallerySection
          lang={lang}
          onViewAll={() => {
            showModal({
              titleEn: 'Ankur Cooperative Photo Gallery Archive',
              titleNp: 'अंकुर सहकारी फोटो ग्यालरी संग्रह',
              categoryEn: 'More / Photo Gallery',
              categoryNp: 'थप / फोटो ग्यालरी',
              icon: '▧',
              descriptionEn:
                'Photographic memories of our community programs, blood donation camps, training workshops, and Annual General Meetings.',
              descriptionNp:
                'सामुदायिक स्वास्थ्य शिविर, रक्तदान, महिला उद्यमशीलता तालिम र वार्षिक साधारण सभाका स्मरणीय क्षणहरू।',
              imageUrl: cmsGallery?.[0]?.image,
              cards: (cmsGallery || []).map((g) => ({
                id: g.id,
                titleEn: g.titleEn,
                titleNp: g.titleNp,
                subtitleEn: g.category,
                subtitleNp: g.category,
                badgeEn: g.category,
                badgeNp: 'ग्यालरी',
                fileUrl: g.image,
              })),
            });
          }}
          onSelectPhoto={(photo: GalleryItem) => {
            showModal({
              titleEn: photo.titleEn,
              titleNp: photo.titleNp,
              categoryEn: `Gallery / ${photo.category}`,
              categoryNp: 'थप / फोटो ग्यालरी',
              icon: '📸',
              imageUrl: photo.image,
              descriptionEn: `Visual capture from ${photo.titleEn} conducted across our cooperative operational zone.`,
              descriptionNp: `अंकुर सहकारीको कार्यक्षेत्रमा सञ्चालित ${photo.titleNp} को तस्विर।`,
            });
          }}
          gallery={cmsGallery}
        />

        {/* Why Ankur Section */}
        <WhySection
          lang={lang}
          whyChooseUs={cmsWhyChooseUs}
          onLearnMore={() =>
            handleMegaMenuItemClick({
              id: 'why-choose-us',
              titleEn: 'Why Choose Ankur Cooperative?',
              titleNp: 'अंकुर सहकारी नै किन रोज्ने?',
              subtitleEn: 'Discover our core advantages',
              subtitleNp: 'हाम्रा प्रमुख विशेषताहरू',
              icon: '⭐',
              link: '#about-why-choose-us',
            })
          }
        />

        {/* Membership CTA Banner */}
        <MembershipBanner
          lang={lang}
          onRegisterClick={() =>
            handleMegaMenuItemClick({
              id: 'ekym',
              titleEn: 'Become an Ankur Member',
              titleNp: 'अंकुर सहकारीको सदस्य बन्नुहोस्',
              subtitleEn: 'Digital membership registration',
              subtitleNp: 'डिजिटल सदस्यता दर्ता',
              icon: '✦',
              link: '#',
            })
          }
        />
          </>
        )}
      </main>

      {/* Comprehensive Footer */}
      <Footer
        lang={lang}
        onLinkClick={(section) => {
          handleQuickNav(section);
        }}
        cmsSettings={cmsSettings}
        headOffice={cmsHeadOffice}
        socialLinks={cmsSocialLinks}
        privacyPolicy={cmsPrivacyPolicy}
        onOpenPrivacyPolicy={handleOpenPrivacyPolicy}
      />

      {/* Detail / Interactive Modal */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
        lang={lang}
        onLanguageChange={setLang}
        cmsSettings={cmsSettings}
        rates={cmsRates}
        onApplyLoan={(schemeName, amount, tenure) => {
          setIsModalOpen(false);
          setLoanModalState({
            isOpen: true,
            scheme: schemeName,
            amount,
            tenure,
          });
        }}
        onExpandToFullPage={modalData ? () => openFullPage(modalData) : undefined}
        onNavigateToItem={(targetId) => {
          handleMegaMenuItemClick({
            id: targetId,
            titleEn: '',
            titleNp: '',
            subtitleEn: '',
            subtitleNp: '',
            icon: '',
            link: '',
          });
        }}
        onLoginSuccess={(role, user) => {
          setCurrentUser(user);
          setCurrentView(role === 'admin' ? 'admin' : 'member');
        }}
        onAction={(actionType) => {
          if (
            actionType === 'profile' ||
            actionType === 'mission-vision' ||
            actionType === 'board' ||
            actionType === 'institutional-profile' ||
            actionType === 'about-intro'
          ) {
            handleMegaMenuItemClick({
              id: actionType === 'about-intro' ? 'institutional-profile' : actionType,
              titleEn: '',
              titleNp: '',
              subtitleEn: '',
              subtitleNp: '',
              icon: '',
              link: '',
            });
            return;
          }
          if (actionType === 'portal') {
            if (modalData?.titleEn?.includes('Office') || modalData?.titleNp?.includes('प्रशासन')) {
              setCurrentUser({
                id: 'usr-1',
                username: 'admin',
                fullName: 'Chief Executive Officer',
                role: 'admin',
                email: 'ceo@ekatacoop.com.np',
              });
              setCurrentView('admin');
            } else {
              setCurrentUser({
                id: 'mem-1',
                username: 'EK-10482',
                fullName: 'Ram Chandra Sharma',
                role: 'member',
                memberCode: 'EK-10482',
                email: 'ram.sharma@ekatacoop.com.np',
              });
              setCurrentView('member');
            }
          } else if (actionType === 'apply-loan' || actionType === '#apply-loan') {
            setIsModalOpen(false);
            setLoanModalState({ isOpen: true });
          } else if (actionType === 'register') {
            setCurrentView('ekym');
          } else if (actionType === 'contact') {
            handleQuickNav('contact');
          }
        }}
      />

      {/* Smart Digital Services Full-Window Portal: Date Converter (BS <-> AD), Foreign Exchange Rates (NRB INR Fixed), and EMI Calculator */}
      <SmartServicesModal
        isOpen={smartModalState.isOpen}
        initialTab={smartModalState.tab}
        lang={lang}
        onLanguageChange={setLang}
        cmsSettings={cmsSettings}
        exchangeRates={cmsExchangeRates}
        onClose={() => setSmartModalState((prev) => ({ ...prev, isOpen: false }))}
        onJumpToEmiSection={() => handleQuickNav('calculator')}
      />

      {/* Full-Window Loan Application Portal */}
      <LoanApplicationModal
        isOpen={loanModalState.isOpen}
        onClose={() => setLoanModalState((prev) => ({ ...prev, isOpen: false }))}
        lang={lang}
        onLanguageChange={setLang}
        rates={cmsRates}
        serviceCenters={cmsServiceCenters}
        initialScheme={loanModalState.scheme}
        initialAmount={loanModalState.amount}
        initialTenure={loanModalState.tenure}
        cmsSettings={cmsSettings}
      />

      {/* Automatic Notice Popup Modal with large image, darkened background overlay & top-right close (X) button */}
      <NoticePopupModal
        lang={lang}
        isOpen={isNoticePopupOpen}
        onClose={() => setIsNoticePopupOpen(false)}
        onAction={(link) => {
          if (link === '#ekym') {
            setCurrentView('ekym');
          } else if (link === '#rates' || link === '#calculator') {
            handleQuickNav('calculator');
          } else {
            handleQuickNav('rates');
          }
        }}
      />
    </div>
  );
}
