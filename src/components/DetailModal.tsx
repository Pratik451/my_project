import React, { useState, useEffect } from 'react';
import { Language, AuthUser, SiteSettingsCMS, TeamMemberCMS, InterestRate, MonthlyFinancialReportCMS } from '../types';
import { INITIAL_MEMBERS } from '../data/backendData';
import { INTEREST_RATES } from '../data/cooperativeData';
import { usePreetiTyping } from '../context/PreetiTypingContext';
import { InstitutionalReportSection } from './InstitutionalReportSection';
import { MonthlyReportComparisonSection } from './MonthlyReportComparison';

export interface ModalCardItem {
  id?: string;
  titleEn: string;
  titleNp: string;
  subtitleEn?: string;
  subtitleNp?: string;
  badgeEn?: string;
  badgeNp?: string;
  phone?: string;
  email?: string;
  mapUrl?: string;
  fileUrl?: string;
  fileSize?: string;
  deadline?: string;
  pointsEn?: string[];
  pointsNp?: string[];
}

export interface DiscoverCardItem {
  id: string;
  targetId: string;
  titleEn: string;
  titleNp: string;
  subtitleEn?: string;
  subtitleNp?: string;
  iconType: 'mission' | 'board' | 'management' | 'chairman' | 'departments' | 'service-centers' | 'savings' | 'loan' | 'digital' | 'remittance' | 'insurance' | 'reports' | 'career' | 'contact' | string;
}

export interface ModalData {
  id?: string;
  titleEn: string;
  titleNp: string;
  categoryEn?: string;
  categoryNp?: string;
  icon?: string;
  descriptionEn?: string;
  descriptionNp?: string;
  bulletPointsEn?: string[];
  bulletPointsNp?: string[];
  actionLabelEn?: string;
  actionLabelNp?: string;
  actionType?: 'register' | 'contact' | 'download' | 'portal' | 'profile' | 'mission-vision' | 'board' | string;
  imageUrl?: string;
  teamMembers?: TeamMemberCMS[];
  cards?: ModalCardItem[];
  ratesTable?: InterestRate[];
  discoverCards?: DiscoverCardItem[];
  showDiscoverSection?: boolean;
  monthlyReports?: MonthlyFinancialReportCMS[];
  selectedReportId?: string;
  isInstitutionalProfile?: boolean;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ModalData | null;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  cmsSettings?: SiteSettingsCMS;
  teamMembers?: TeamMemberCMS[];
  rates?: InterestRate[];
  onApplyLoan?: (schemeName?: string, amount?: number, tenure?: number) => void;
  onAction?: (actionType?: string) => void;
  onLoginSuccess?: (role: 'admin' | 'member', user: AuthUser) => void;
  onNavigateToItem?: (itemId: string) => void;
  onExpandToFullPage?: () => void;
}

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

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  data,
  lang,
  onLanguageChange,
  cmsSettings,
  teamMembers,
  rates,
  onApplyLoan,
  onAction,
  onLoginSuccess,
  onNavigateToItem,
  onExpandToFullPage,
}) => {
  // Determine if initial intent was office/admin
  const initialIsOffice = Boolean(
    data?.titleEn?.toLowerCase().includes('office') ||
    data?.titleEn?.toLowerCase().includes('admin') ||
    data?.titleNp?.includes('प्रशासन') ||
    data?.titleNp?.includes('कर्मचारी')
  );

  const [authTab, setAuthTab] = useState<'member' | 'office' | 'calc'>(initialIsOffice ? 'office' : 'member');
  const [username, setUsername] = useState(initialIsOffice ? '' : 'EK-10482');
  const [password, setPassword] = useState(initialIsOffice ? '' : '1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string>('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { isPreetiMode, togglePreetiMode, openKeyboardGuide, openConverter } = usePreetiTyping();

  const activeLoanProducts = (Array.isArray(rates) && rates.length > 0 ? rates : INTEREST_RATES).filter(
    (r) => r.category === 'loan'
  );
  const parseNumericRate = (rateStr: string): number => {
    const cleaned = String(rateStr || '').replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return !isNaN(parsed) && parsed > 0 ? parsed : 12.5;
  };

  // Pre-login EMI Calculator state
  const [calcScheme, setCalcScheme] = useState(activeLoanProducts[0]?.schemeEn || 'Agricultural / Livestock Loan');
  const [calcRate, setCalcRate] = useState(parseNumericRate(activeLoanProducts[0]?.rate || '12.50%'));
  const [calcPrincipalInput, setCalcPrincipalInput] = useState<string>('500000');
  const [calcTenureInput, setCalcTenureInput] = useState<string>('36');
  const [selectedLoanNotice, setSelectedLoanNotice] = useState<string>('');

  useEffect(() => {
    if (activeLoanProducts.length > 0) {
      const matched = activeLoanProducts.find((p) => p.schemeEn === calcScheme) || activeLoanProducts[0];
      if (matched) {
        setCalcScheme(matched.schemeEn);
        setCalcRate(parseNumericRate(matched.rate));
      }
    }
  }, [rates]);

  // Sync state whenever modal data changes
  useEffect(() => {
    if (data?.actionType === 'portal') {
      const isCalc = Boolean(
        data.titleEn?.toLowerCase().includes('calculator') ||
        data.titleEn?.toLowerCase().includes('emi') ||
        data.titleNp?.includes('क्याल्कुलेटर') ||
        data.titleNp?.includes('ईएमआई')
      );
      const office = Boolean(
        data.titleEn?.toLowerCase().includes('office') ||
        data.titleEn?.toLowerCase().includes('admin') ||
        data.titleNp?.includes('प्रशासन') ||
        data.titleNp?.includes('कर्मचारी')
      );
      setAuthTab(isCalc ? 'calc' : office ? 'office' : 'member');
      setUsername(office ? '' : 'EK-10482');
      setPassword(office ? '' : '1234');
      setLoginError('');
      setShowPassword(false);
    }
  }, [data]);

  // When switching tabs within the modal
  const handleTabSwitch = (newTab: 'member' | 'office' | 'calc') => {
    setAuthTab(newTab);
    setLoginError('');
    if (newTab === 'office') {
      setUsername('');
      setPassword('');
    } else if (newTab === 'member') {
      setUsername('EK-10482');
      setPassword('1234');
    }
  };

  // EMI math
  const calcPrincipal = Math.max(0, parseFloat(calcPrincipalInput) || 0);
  const parsedCalcTenure = parseInt(calcTenureInput, 10);
  const calcTenure = !isNaN(parsedCalcTenure) && parsedCalcTenure > 0 ? parsedCalcTenure : 0;
  const monthlyRate = (calcRate / 12) / 100;
  const calculatedEmi =
    calcPrincipal > 0 && monthlyRate > 0 && calcTenure > 0
      ? Math.round((calcPrincipal * monthlyRate * Math.pow(1 + monthlyRate, calcTenure)) / (Math.pow(1 + monthlyRate, calcTenure) - 1))
      : calcPrincipal > 0 && calcTenure > 0
      ? Math.round(calcPrincipal / calcTenure)
      : 0;
  const totalRepayment = calcTenure > 0 ? calculatedEmi * calcTenure : 0;
  const totalInterest = Math.max(0, totalRepayment - calcPrincipal);

  if (!isOpen || !data) return null;

  const isPortalModal = data.actionType === 'portal';

  const handlePortalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUser = username.trim();
    const trimmedPw = password.trim();

    if (!trimmedUser) {
      setLoginError(
        lang === 'np'
          ? 'कृपया प्रयोगकर्ता नाम वा खाता नम्बर प्रविष्ट गर्नुहोस्।'
          : 'Please enter your account number or username.'
      );
      return;
    }

    if (!trimmedPw) {
      setLoginError(
        lang === 'np'
          ? 'कृपया पासवर्ड वा ४-अङ्कको पिन प्रविष्ट गर्नुहोस्।'
          : 'Please enter your password or PIN.'
      );
      return;
    }

    // 1. Office / Admin Authentication
    if (authTab === 'office') {
      if (trimmedUser.toLowerCase() === 'admin' && trimmedPw === 'Admin@123') {
        const adminUser: AuthUser = {
          id: 'usr-1',
          username: 'admin',
          fullName: 'Chief Executive Officer',
          role: 'admin',
          email: 'ceo@ekatacoop.com.np',
        };
        if (onLoginSuccess) {
          onLoginSuccess('admin', adminUser);
        }
        onClose();
        return;
      } else if (trimmedUser.toLowerCase() === 'staff' && trimmedPw === 'staff@2057') {
        const staffUser: AuthUser = {
          id: 'usr-2',
          username: 'staff',
          fullName: 'Branch Staff Teller',
          role: 'staff',
          email: 'staff@ekatacoop.com.np',
        };
        if (onLoginSuccess) {
          onLoginSuccess('admin', staffUser);
        }
        onClose();
        return;
      } else {
        setLoginError(
          lang === 'np'
            ? 'प्रशासन प्रयोगकर्ता नाम वा पासवर्ड मिलेन। कृपया आधिकारिक विवरण जाँच गर्नुहोस्।'
            : 'Invalid administrator credentials. Please check your username and password.'
        );
        return;
      }
    }

    // 2. Member Authentication - lookup against database
    const matchedMember = INITIAL_MEMBERS.find(
      (m) =>
        m.memberCode.toLowerCase() === trimmedUser.toLowerCase() ||
        m.phone === trimmedUser ||
        m.fullName.toLowerCase().includes(trimmedUser.toLowerCase()) ||
        (trimmedUser.includes('10482') && m.memberCode === 'EK-10482')
    );

    if (matchedMember) {
      if (trimmedPw === '1234' || trimmedPw.length >= 4) {
        const memberUser: AuthUser = {
          id: matchedMember.id,
          username: matchedMember.memberCode,
          fullName: matchedMember.fullName,
          role: 'member',
          memberCode: matchedMember.memberCode,
          email: matchedMember.email || `${matchedMember.memberCode.toLowerCase()}@ekatacoop.com.np`,
        };
        if (onLoginSuccess) {
          onLoginSuccess('member', memberUser);
        }
        onClose();
        return;
      } else {
        setLoginError(
          lang === 'np'
            ? 'सदस्य गोप्य पिन मिलेन! (परीक्षण पिन: 1234)'
            : 'Invalid Member PIN. (Demo PIN: 1234)'
        );
        return;
      }
    }

    // Permissive fallback login for custom testing IDs
    if (trimmedUser && trimmedPw) {
      const genericUser: AuthUser = {
        id: `mem-${Date.now()}`,
        username: trimmedUser,
        fullName: trimmedUser,
        role: 'member',
        memberCode: trimmedUser.startsWith('EK-') ? trimmedUser : `EK-${trimmedUser}`,
        email: `${trimmedUser.toLowerCase()}@ekatacoop.com.np`,
      };
      if (onLoginSuccess) {
        onLoginSuccess('member', genericUser);
      }
      onClose();
      return;
    }
  };

  // RENDER DEDICATED BANKING AUTHENTICATION MODAL
  if (isPortalModal) {
    return (
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
          {/* Header with Official Logo & Language Toggle */}
          <div className="bg-gradient-to-r from-[#052636] via-[#072f42] to-[#052636] p-5 text-white relative">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                {cmsSettings?.coopLogoUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md flex-shrink-0 border border-sky-400/40">
                    <img
                      key={cmsSettings.coopLogoUrl}
                      src={cmsSettings.coopLogoUrl}
                      alt="Ankur Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : null}
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight uppercase leading-tight">
                    {lang === 'np'
                      ? (cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.')
                      : (cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.')}
                  </h3>
                  <span className="text-[11px] text-sky-300 font-medium block mt-0.5">
                    {lang === 'np'
                      ? 'स्मार्ट अनलाइन बैंकिङ तथा कोर वित्तीय प्रणाली'
                      : 'Smart Internet Banking & Core Banking System'}
                  </span>
                </div>
              </div>

              {/* Language Switcher & Close */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {onLanguageChange && (
                  <div className="flex rounded-md bg-black/30 p-0.5 border border-white/20 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => onLanguageChange('en')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        lang === 'en' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => onLanguageChange('np')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        lang === 'np' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      नेपाली
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white/70 hover:text-white text-lg p-1 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Security Indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-sky-200">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                {lang === 'np' ? '२५६-बिट सुरक्षित प्रमाणीकरण' : '256-Bit TLS Secured Portal'}
              </span>
              <span className="font-mono text-amber-300 font-bold text-[10px]">
                {authTab === 'member'
                  ? (lang === 'np' ? 'सदस्य पोर्टल' : 'Member Portal')
                  : (lang === 'np' ? 'प्रशासन कन्सोल' : 'Core CBS Console')}
              </span>
            </div>
          </div>

          {/* Triple Tab Switcher: Member vs EMI Calculator vs Admin */}
          <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabSwitch('member')}
              className={`py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authTab === 'member'
                  ? 'bg-white text-[#0981ae] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👤</span>
              <span className="truncate">{lang === 'np' ? 'सदस्य लगइन' : 'Member Login'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('calc')}
              className={`py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authTab === 'calc'
                  ? 'bg-white text-[#0981ae] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🧮</span>
              <span className="truncate">{lang === 'np' ? 'ईएमआई क्याल्कुलेटर' : 'EMI Calculator'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('office')}
              className={`py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authTab === 'office'
                  ? 'bg-white text-[#0981ae] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏢</span>
              <span className="truncate">{lang === 'np' ? 'प्रशासन' : 'Staff Admin'}</span>
            </button>
          </div>

          {/* Form / Calculator Body */}
          <div className="p-6 space-y-4">
            {authTab === 'calc' ? (
              /* Clean Pre-Login Loan EMI & Product Calculator */
              <div className="space-y-4 text-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'सहकारी कर्जा योजना छनौट गर्नुहोस्:' : 'Select Loan Product Scheme:'}
                  </label>
                  <select
                    value={calcScheme}
                    onChange={(e) => {
                      const sName = e.target.value;
                      setCalcScheme(sName);
                      const matched = activeLoanProducts.find((p) => p.schemeEn === sName);
                      if (matched) {
                        setCalcRate(parseNumericRate(matched.rate));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#0981ae]"
                  >
                    {activeLoanProducts.map((p) => (
                      <option key={p.id || p.schemeEn} value={p.schemeEn}>
                        {lang === 'np' ? `${p.schemeNp} (${p.rate})` : `${p.schemeEn} (${p.rate})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-generated Interest Rate from Admin */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs">
                  <span className="font-semibold text-slate-700">
                    {lang === 'np' ? 'वार्षिक ब्याजदर (प्रशासनबाट स्वचालित):' : 'Interest Rate (Auto from Admin):'}
                  </span>
                  <strong className="font-mono font-black text-sm text-[#0981ae]">{calcRate.toFixed(2)}% P.A.</strong>
                </div>

                {/* Principal Amount with Direct User Input (No Spinner Buttons) */}
                <div>
                  <label htmlFor="modal-calc-principal" className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'ऋण रकम प्रविष्ट गर्नुहोस् (Rs.):' : 'Enter Loan Amount (Rs.):'}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-slate-400 text-xs">Rs.</span>
                    <input
                      id="modal-calc-principal"
                      type="text"
                      inputMode="numeric"
                      value={calcPrincipalInput}
                      onChange={(e) => setCalcPrincipalInput(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="e.g. 500000"
                      className="no-spinner w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:border-[#0981ae] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Tenure (Months) with Direct User Input (No Spinner Buttons) */}
                <div>
                  <label htmlFor="modal-calc-tenure" className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'भुक्तानी अवधि (महिना):' : 'Loan Tenure (Months):'}
                  </label>
                  <input
                    id="modal-calc-tenure"
                    type="text"
                    inputMode="numeric"
                    value={calcTenureInput}
                    onChange={(e) => setCalcTenureInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 36"
                    className="no-spinner w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:border-[#0981ae] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Result Display Grid */}
                <div className="p-3.5 bg-gradient-to-br from-[#07678d] to-[#052636] text-white rounded-xl shadow-inner">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                      <span className="text-[10px] text-sky-200 uppercase font-bold block">{lang === 'np' ? 'मासिक किस्ता (EMI)' : 'Monthly EMI'}</span>
                      <strong className="text-lg font-mono font-black text-amber-300">Rs. {calculatedEmi.toLocaleString()}</strong>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                      <span className="text-[10px] text-sky-200 uppercase font-bold block">{lang === 'np' ? 'कुल ब्याज रकम' : 'Total Interest'}</span>
                      <strong className="text-sm font-mono font-bold text-white">Rs. {totalInterest.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-sky-100 pt-2 border-t border-white/15 mt-2">
                    <span>{lang === 'np' ? 'वार्षिक ब्याजदर:' : 'Interest Rate:'} <strong>{calcRate.toFixed(2)}% P.A.</strong></span>
                    <span>{lang === 'np' ? 'कुल भुक्तानी:' : 'Total Repayment:'} <strong className="font-mono">Rs. {totalRepayment.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Direct Apply for Loan button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onApplyLoan) {
                      onApplyLoan(calcScheme, calcPrincipal, calcTenure);
                    } else if (onAction) {
                      onAction('apply-loan');
                    }
                  }}
                  className="w-full py-3 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📝</span>
                  <span>{lang === 'np' ? 'कर्जा आवेदन दिनुहोस् (Apply for Loan) ➔' : 'Apply for Loan ➔'}</span>
                </button>
              </div>
            ) : (
              <>
                {selectedLoanNotice && authTab === 'member' && (
                  <div className="p-2.5 bg-sky-50 border border-sky-300 rounded-xl text-xs font-semibold text-sky-800 flex items-center gap-2">
                    <span>💡</span>
                    <span>{lang === 'np' ? 'चयन गरिएको कर्जा:' : 'Selected:'} <strong>{selectedLoanNotice}</strong>. {lang === 'np' ? 'लगइनपछि आवेदन फाराम खुल्नेछ।' : 'Sign in below to finalize.'}</span>
                  </div>
                )}

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-shake">
                    <span>⚠️</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handlePortalSubmit} className="space-y-4">
                  {/* Digital Services CRUD Channel in Admin Login */}
                  {authTab === 'office' && (
                    <div className="p-3 bg-gradient-to-r from-sky-50 via-indigo-50/60 to-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#0981ae] text-white flex items-center justify-center text-base shadow-xs shrink-0">
                          📱
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{lang === 'np' ? 'डिजिटल सेवाहरू' : 'Digital Services'}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-sky-600 text-white tracking-wider">
                              CRUD
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block leading-tight">
                            {lang === 'np'
                              ? 'मोबाइल बैंकिङ, नेपालपे क्युआर तथा बिलिङ च्यानल व्यवस्थापन'
                              : 'Mobile app, NepalPay QR & digital channels CRUD management'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-1 rounded-md border border-sky-200 shrink-0">
                        Active
                      </span>
                    </div>
                  )}

                  {/* Preeti Font-based Nepali Typing Assistant in Admin Login */}
                  <div className="p-2.5 bg-gradient-to-r from-sky-50 via-emerald-50 to-teal-50 border border-sky-200/90 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isPreetiMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <span>⌨️</span>
                          <span>{isPreetiMode ? 'प्रिती (Preeti) सक्रिय' : 'अङ्ग्रेजी (English) मोड'}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          {isPreetiMode ? 'टाइप गर्दा सोझै युनिकोड बन्छ' : 'Toggle: Ctrl + M'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={togglePreetiMode}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          isPreetiMode
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                        title="प्रिती र अङ्ग्रेजी टाइपिङ फेर्नुहोस् (Ctrl+M)"
                      >
                        {isPreetiMode ? '✓ प्रिती (Preeti)' : 'English'}
                      </button>
                      <button
                        type="button"
                        onClick={openKeyboardGuide}
                        className="px-2 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-colors cursor-pointer"
                        title="प्रिती किबोर्ड लेआउट हेर्नुहोस्"
                      >
                        गाइड
                      </button>
                      <button
                        type="button"
                        onClick={openConverter}
                        className="px-2 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors cursor-pointer"
                        title="प्रिती ⇄ युनिकोड रूपान्तरण"
                      >
                        कन्भर्टर
                      </button>
                    </div>
                  </div>

              {/* Username / Account Code Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {authTab === 'member'
                    ? (lang === 'np' ? 'सदस्य खाता नं. वा मोबाइल' : 'Member Account No. or Mobile')
                    : (lang === 'np' ? 'कर्मचारी आइडी / प्रयोगकर्ता नाम' : 'Staff Username / Operator ID')}
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                    {authTab === 'member' ? '💳' : '👤'}
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      authTab === 'member'
                        ? (lang === 'np' ? 'उदा: EK-10482 वा 9857012345' : 'e.g. EK-10482 or 9857012345')
                        : (lang === 'np' ? 'अधिकृत प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्' : 'Enter authorized username')
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0981ae] focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password / PIN Field - strictly hidden in admin login */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {authTab === 'member'
                      ? (lang === 'np' ? 'गोप्य पासवर्ड / ४-अङ्कको पिन' : 'Secret Password / 4-Digit PIN')
                      : (lang === 'np' ? 'प्रशासनिक पासवर्ड' : 'Administrative Password')}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  {authTab === 'member' && (
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-semibold text-[#0981ae] hover:underline cursor-pointer"
                    >
                      {lang === 'np' ? 'बिर्सनुभयो?' : 'Forgot PIN?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                    🔒
                  </div>
                  <input
                    type={authTab === 'office' ? 'password' : (showPassword ? 'text' : 'password')}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      authTab === 'member'
                        ? (lang === 'np' ? '४-अङ्कको गोप्य पिन प्रविष्ट गर्नुहोस्' : 'Enter your 4-digit PIN')
                        : (lang === 'np' ? 'गोप्य पासवर्ड प्रविष्ट गर्नुहोस्' : 'Enter secure password')
                    }
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0981ae] focus:border-transparent transition"
                  />
                  {authTab === 'member' && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick 1-Click Demo Profiles (Shown ONLY for Member Login) */}
              {authTab === 'member' && (
                <div className="pt-1">
                  <span className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    {lang === 'np' ? 'द्रुत परीक्षण प्रोफाइलहरू (१-क्लिक):' : 'Quick Demo Profiles (1-Click Fill):'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('EK-10482');
                        setPassword('1234');
                        setLoginError('');
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-slate-800 truncate">👤 Ram Chandra</div>
                      <div className="text-[10px] text-slate-500 font-mono">EK-10482 (PIN: 1234)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('EK-10483');
                        setPassword('1234');
                        setLoginError('');
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-slate-800 truncate">👤 Sita Devi Thapa</div>
                      <div className="text-[10px] text-slate-500 font-mono">EK-10483 (PIN: 1234)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('EK-10484');
                        setPassword('1234');
                        setLoginError('');
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-slate-800 truncate">👤 Hari Prasad</div>
                      <div className="text-[10px] text-slate-500 font-mono">EK-10484 (PIN: 1234)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('EK-10485');
                        setPassword('1234');
                        setLoginError('');
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 text-left transition cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-slate-800 truncate">👤 Gita Sharma</div>
                      <div className="text-[10px] text-slate-500 font-mono">EK-10485 (PIN: 1234)</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#0981ae] focus:ring-[#0981ae]"
                  />
                  <span>
                    {authTab === 'member'
                      ? (lang === 'np' ? 'यस यन्त्रमा खाता सम्झनुहोस्' : 'Remember my Account Code')
                      : (lang === 'np' ? 'कर्मचारी विवरण सुरक्षित राख्नुहोस्' : 'Remember Admin Session')}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>🔐</span>
                <span>
                  {authTab === 'member'
                    ? (lang === 'np' ? 'सदस्य पोर्टलमा लगइन गर्नुहोस् ➔' : 'Sign In to Member Portal ➔')
                    : (lang === 'np' ? 'प्रशासन कन्सोलमा प्रवेश गर्नुहोस् ➔' : 'Enter Admin CBS Console ➔')}
                </span>
              </button>
            </form>

            {/* Member eKYM Registration Prompt */}
            {authTab === 'member' ? (
              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  {lang === 'np' ? 'नयाँ सदस्य हुनुहुन्छ?' : 'Not registered yet?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onAction) onAction('register');
                    }}
                    className="font-bold text-[#0981ae] hover:underline cursor-pointer"
                  >
                    {lang === 'np' ? 'अनलाइन eKYM दर्ता गर्नुहोस् ✦' : 'Register via eKYM Digital Portal ✦'}
                  </button>
                </p>
              </div>
            ) : (
              <div className="pt-2 text-center border-t border-slate-100 text-[11px] text-slate-500">
                {lang === 'np'
                  ? 'सुरक्षित कोर बैंकिङ सत्र: सबै प्रशासनिक गतिविधि अडिट लगमा सुरक्षित हुन्छ।'
                  : 'Core Banking Security: All administrative actions are permanently logged in the audit trail.'}
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* FORGOT PIN HELP MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span>🔑</span>
                <span>{lang === 'np' ? 'पासवर्ड / पिन सहायता' : 'Credentials Assistance'}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {lang === 'np'
                  ? 'सुरक्षा नियमका कारण पासवर्ड रिसेट गर्न केन्द्रीय कार्यालय बुटवल ०७१-५४०१२३ वा टोल-फ्री १६६०-०१-९९८८७ मा आफ्नो दर्ता भएको मोबाइल नम्बरबाट सम्पर्क गर्नुहोस्।'
                  : 'For security reasons, to reset your Internet Banking PIN or staff password, please contact Ankur Head Office Butwal at 071-540123 or Toll-Free 1660-01-99887 from your registered mobile.'}
              </p>
              <div className="p-3 bg-sky-50 rounded-lg text-[11px] text-sky-800 font-semibold mb-4">
                {lang === 'np'
                  ? 'सुरक्षा नियमका कारण पासवर्ड वा पिन बिर्सनुभएमा आधिकारिक परिचयपत्रसहित शाखा कार्यालयमा सम्पर्क गर्नुहोस्।'
                  : 'For security and audit compliance, please contact your branch or system administrator with official identification to reset credentials.'}
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {lang === 'np' ? 'बुझें, बन्द गर्नुहोस्' : 'Got it, Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // REGULAR INFORMATIONAL MODAL (About, Reports, Services, Career, etc.)
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-card ${
          data.isInstitutionalProfile ? '!w-[98vw] !max-w-7xl !h-[96vh] !max-h-[96vh] !p-5 sm:!p-8 overflow-y-auto' : ''
        }`}
      >
        {onExpandToFullPage && (
          <button
            type="button"
            className="absolute top-[18px] right-[60px] w-9 h-9 rounded-full border border-[#cce3ee] bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0c2d3e] hover:text-[#0981ae] text-sm flex items-center justify-center transition cursor-pointer"
            onClick={onExpandToFullPage}
            title={lang === 'np' ? 'पूरा विन्डोमा हेर्नुहोस्' : 'View Full Window Page'}
            aria-label="Expand to full window"
          >
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          {data.icon && (
            <div className="w-12 h-12 rounded-xl bg-[#eef8fc] text-[#0981ae] flex items-center justify-center text-2xl font-bold">
              {data.icon}
            </div>
          )}
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#0981ae]">
              {lang === 'np'
                ? data.categoryNp || 'अंकुर सहकारी जानकारी'
                : data.categoryEn || 'Ankur Cooperative Info'}
            </span>
            <h2 className="text-2xl font-extrabold text-[#0c2d3e] m-0">
              {lang === 'np' ? data.titleNp : data.titleEn}
            </h2>
          </div>
        </div>

        {/* Optional Main Banner Image (Hidden for Institutional Profile) */}
        {data.imageUrl && !data.isInstitutionalProfile && (
          <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden mb-4 bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={data.imageUrl}
              alt={lang === 'np' ? data.titleNp : data.titleEn}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {data.descriptionEn && !data.isInstitutionalProfile && (
          <div className="text-base text-[#526b7a] leading-relaxed mb-6">
            <p>{lang === 'np' ? data.descriptionNp : data.descriptionEn}</p>
          </div>
        )}

        {/* Dynamic Monthly Institutional Financial Reports (Card & Table with Share, Copy, Print) */}
        {data.monthlyReports && data.monthlyReports.length > 0 && (
          <div className="mb-8">
            <MonthlyReportComparisonSection
              reports={data.monthlyReports}
              lang={lang}
              onLanguageChange={onLanguageChange}
              cmsSettings={cmsSettings}
            />
          </div>
        )}

        {/* Team Members Directory (For Board, Management, Leadership) */}
        {(() => {
          const membersToDisplay = (data.teamMembers && data.teamMembers.length > 0)
            ? data.teamMembers
            : (teamMembers && teamMembers.length > 0)
            ? teamMembers.filter((m) => {
                const titleLower = data.titleEn?.toLowerCase() || '';
                if (titleLower.includes('board') || titleLower.includes('governance')) {
                  return m.category === 'board';
                }
                if (titleLower.includes('management') || titleLower.includes('executive')) {
                  return m.category === 'management';
                }
                if (titleLower.includes('chairman')) {
                  return m.roleEn?.toLowerCase().includes('chair');
                }
                return true;
              })
            : [];

          if (membersToDisplay.length === 0) return null;

          return (
            <div className="mb-6 bg-[#f0f9ff] p-4 rounded-xl border border-[#e0f2fe]">
              <h4 className="text-xs font-bold text-[#0c2d3e] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>👥</span>
                <span>
                  {lang === 'np'
                    ? 'पदाधिकारी तथा व्यवस्थापक समूह'
                    : 'Designated Officials & Leadership'}
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {membersToDisplay.map((tm) => (
                  <div
                    key={tm.id}
                    className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 shadow-xs"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-sky-100 flex-shrink-0 border border-sky-300">
                      {tm.imageUrl || tm.photoUrl ? (
                        <img
                          src={tm.imageUrl || tm.photoUrl}
                          alt={lang === 'np' ? tm.nameNp : tm.nameEn}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/uploads/media/team-ceo.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sky-800 font-bold text-sm">
                          {tm.nameEn ? tm.nameEn.charAt(0) : 'E'}
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-bold text-slate-900 truncate">
                        {lang === 'np' ? tm.nameNp : tm.nameEn}
                      </h5>
                      <p className="text-[11px] text-[#0981ae] font-semibold truncate">
                        {lang === 'np' ? tm.roleNp : tm.roleEn}
                      </p>
                      {tm.phone && (
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          ☎ {tm.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Structured Directory Cards (Departments, Service Centers, Reports, Careers) */}
        {data.cards && data.cards.length > 0 && !data.isInstitutionalProfile && (
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {data.cards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {lang === 'np' ? card.titleNp : card.titleEn}
                      </h4>
                      {(card.badgeEn || card.badgeNp) && (
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-full border border-sky-200 shrink-0">
                          {lang === 'np' ? card.badgeNp || card.badgeEn : card.badgeEn}
                        </span>
                      )}
                    </div>

                    {(card.subtitleEn || card.subtitleNp) && (
                      <p className="text-xs text-[#0981ae] font-semibold mb-2">
                        {lang === 'np' ? card.subtitleNp : card.subtitleEn}
                      </p>
                    )}

                    {((lang === 'np' && card.pointsNp) || card.pointsEn) && (
                      <ul className="text-xs text-slate-600 space-y-1 my-2 pl-3 border-l-2 border-sky-200">
                        {(lang === 'np' ? card.pointsNp : card.pointsEn)?.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {card.phone && (
                      <a
                        href={`tel:${card.phone}`}
                        className="text-slate-600 hover:text-sky-700 font-mono flex items-center gap-1"
                      >
                        <span>☎</span> {card.phone}
                      </a>
                    )}
                    {card.email && (
                      <a
                        href={`mailto:${card.email}`}
                        className="text-slate-500 hover:text-sky-700 flex items-center gap-1 text-[11px]"
                      >
                        <span>✉</span> {card.email}
                      </a>
                    )}
                    {card.mapUrl && (
                      <a
                        href={card.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <span>📍</span> {lang === 'np' ? 'नक्सा हेर्नुहोस्' : 'View Location'}
                      </a>
                    )}
                    {card.fileUrl && (
                      <a
                        href={card.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 text-white rounded-lg text-[11px] font-bold hover:bg-sky-700 shadow-2xs"
                      >
                        <span>📥</span> {lang === 'np' ? 'डाउनलोड गर्नुहोस्' : 'Download File'}
                        {card.fileSize && <span className="opacity-80">({card.fileSize})</span>}
                      </a>
                    )}
                    {card.deadline && (
                      <span className="text-amber-700 font-medium text-[11px]">
                        {lang === 'np' ? 'म्याद:' : 'Deadline:'} {card.deadline}
                      </span>
                    )}
                    {data.actionType === 'apply-loan' && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onApplyLoan) {
                            onApplyLoan(card.titleEn);
                          } else if (onAction) {
                            onAction('apply-loan');
                          }
                        }}
                        className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-[#0981ae] hover:bg-[#07678d] text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        <span>📝</span>
                        <span>{lang === 'np' ? 'कर्जा आवेदन दिनुहोस् →' : 'Apply for Loan →'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data.actionType === 'apply-loan' && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 via-sky-50 to-amber-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {lang === 'np' ? 'अनलाइन कर्जा आवेदन फाराम (Apply for Loan)' : 'Ready to Apply for a Loan?'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {lang === 'np'
                      ? 'प्रशासन पोर्टलमा सूचीबद्ध ब्याजदर सहित अनलाइन कर्जा आवेदन दिन तलको बटनमा क्लिक गर्नुहोस्।'
                      : 'Submit your online loan application directly with interest rates synced from Admin.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onApplyLoan) {
                      onApplyLoan(data.cards?.[0]?.titleEn);
                    } else if (onAction) {
                      onAction('apply-loan');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer shrink-0"
                >
                  {lang === 'np' ? 'कर्जा आवेदन दिनुहोस् (Apply for Loan) →' : 'Apply for Loan →'}
                </button>
              </div>
            )}
          </div>
        )}

        {((lang === 'np' && data.bulletPointsNp) || data.bulletPointsEn) && !data.isInstitutionalProfile && (
          <div className="bg-[#f4f9fc] p-4 rounded-xl border border-[#cce3ee] mb-5">
            <h4 className="text-sm font-bold text-[#0c2d3e] mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <span>🛡</span>
              <span>{lang === 'np' ? 'प्रमुख संस्थागत विशेषताहरू तथा विवरण' : 'Key Highlights & Information'}</span>
            </h4>
            <ul className="space-y-2 text-sm text-[#425c6b] m-0 pl-4">
              {(lang === 'np' ? data.bulletPointsNp : data.bulletPointsEn)?.map(
                (bp, idx) => (
                  <li key={idx} className="list-disc">
                    {bp}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* Two-Column Interest Rates Table when viewing Interest Rate Schedule modal */}
        {data.ratesTable && data.ratesTable.length > 0 && (() => {
          const modalLoans = data.ratesTable.filter(
            (r) =>
              (r.category || '').toLowerCase() === 'loan' ||
              r.schemeEn.toLowerCase().includes('loan') ||
              r.schemeEn.toLowerCase().includes('credit')
          );
          const modalDeposits = data.ratesTable.filter((r) => !modalLoans.includes(r));
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Left: Savings Interest Rates */}
              <div className="rounded-xl border border-sky-200 bg-white overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="px-4 py-3 bg-[#0981ae] text-white font-bold text-sm flex items-center justify-between">
                    <span>{lang === 'np' ? '🏦 बचत तथा मुद्दती ब्याजदर' : '🏦 Savings Interest Rates'}</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase">
                      {lang === 'np' ? 'निक्षेप' : 'Deposits'}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {modalDeposits.map((r) => (
                      <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {lang === 'np' ? r.schemeNp : r.schemeEn}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lang === 'np' && r.basisNp ? r.basisNp : r.basisEn || r.period}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-sky-50 text-[#0981ae] border border-sky-200 font-mono shrink-0">
                          {r.rate.includes('%') ? r.rate : `${r.rate}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Loan Interest Rates + Apply for Loan Button */}
              <div className="rounded-xl border border-amber-200 bg-white overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="px-4 py-3 bg-[#065371] text-white font-bold text-sm flex items-center justify-between">
                    <span>{lang === 'np' ? '💼 कर्जा ब्याजदर' : '💼 Loan Interest Rates'}</span>
                    <span className="text-[10px] bg-amber-400/25 text-amber-200 px-2 py-0.5 rounded uppercase">
                      {lang === 'np' ? 'कर्जा' : 'Loans'}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {modalLoans.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onClose();
                          if (onApplyLoan) onApplyLoan(r.schemeEn);
                        }}
                        className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-amber-50/50 cursor-pointer transition"
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {lang === 'np' ? r.schemeNp : r.schemeEn}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lang === 'np' && r.basisNp ? r.basisNp : r.basisEn || r.period}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300 font-mono shrink-0">
                          {r.rate.includes('%') ? r.rate : `${r.rate}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-sky-50/70 border-t border-sky-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    {lang === 'np' ? 'अनलाइन कर्जा आवेदन:' : 'Need a cooperative loan?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onApplyLoan) onApplyLoan(modalLoans[0]?.schemeEn);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs cursor-pointer transition"
                  >
                    {lang === 'np' ? 'कर्जा आवेदन दिनुहोस् →' : 'Apply for Loan →'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Centered Discover Section (Clean Clickable Cards with Line Icons for Our Profile) */}
        {data.discoverCards && data.discoverCards.length > 0 && (
          <div className="mt-8 pt-7 border-t border-slate-200">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0981ae] text-[11px] font-bold uppercase tracking-wider border border-sky-200/70 mb-2">
                <span>✦</span>
                <span>{lang === 'np' ? 'हाम्रो संस्था बारे थप जान्नुहोस्' : 'Discover Our Organization'}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0c2d3e] tracking-tight">
                {lang === 'np' ? 'संस्थागत अङ्ग, नेतृत्व तथा सेवाहरू' : 'Explore Governance, Leadership & Branches'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                {lang === 'np'
                  ? 'सञ्चालक समिति, व्यवस्थापन, ध्येय र सेवा केन्द्रहरू बारे विस्तृत जानकारी प्राप्त गर्न तलका कार्डहरूमा क्लिक गर्नुहोस्।'
                  : 'Click any card below to view detailed institutional records, leadership profiles, and branch network services.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {data.discoverCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    if (onNavigateToItem) {
                      onNavigateToItem(card.targetId);
                    }
                  }}
                  className="group p-4 bg-white hover:bg-[#f0f9ff] active:bg-[#eef8fc] rounded-2xl border border-slate-200/90 hover:border-[#0cb3f0] shadow-xs hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0981ae] border border-sky-200/60 flex items-center justify-center shrink-0 group-hover:bg-[#0981ae] group-hover:text-white group-hover:scale-105 transition-all duration-200 shadow-2xs">
                      {renderDiscoverLineIcon(card.iconType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0981ae] transition-colors leading-snug">
                        {lang === 'np' ? card.titleNp : card.titleEn}
                      </h4>
                      {(card.subtitleEn || card.subtitleNp) && (
                        <p className="text-[11px] text-slate-500 group-hover:text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                          {lang === 'np' ? card.subtitleNp : card.subtitleEn}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#0981ae]">
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{lang === 'np' ? 'थप हेर्नुहोस्' : 'View More'}</span>
                      <span>➔</span>
                    </span>
                    <span className="w-5 h-5 rounded-full bg-sky-100/70 flex items-center justify-center text-xs group-hover:bg-[#0981ae] group-hover:text-white transition-colors">
                      <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-[#e6f2f8]">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border border-[#cce3ee] font-bold text-[#526b7a] bg-white cursor-pointer hover:bg-[#f4f9fc] transition"
            onClick={onClose}
          >
            {lang === 'np' ? 'बन्द गर्नुहोस्' : 'Close'}
          </button>

          {data.actionLabelEn && data.actionType !== 'download' && !data.actionLabelEn.toLowerCase().includes('pdf') && (
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#0981ae] cursor-pointer hover:bg-[#07678d] shadow-md transition-all flex items-center gap-2"
              onClick={() => {
                if (onAction) onAction(data.actionType);
                onClose();
              }}
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{lang === 'np' ? data.actionLabelNp : data.actionLabelEn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
