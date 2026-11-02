import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Sparkles } from 'lucide-react';
import { Language, MegaMenuItem, NavItem, AuthUser, SiteSettingsCMS, SocialLinksCMS, HeadOfficeInfoCMS } from '../types';
import { NAV_ITEMS, TICKER_NOTICES } from '../data/cooperativeData';
import { NavDropdown } from './NavDropdown';

const toNepaliDigits = (val: string | number): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(val).replace(/[0-9]/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

const toEnglishDigits = (val: string | number): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(val).replace(/[०-९]/g, (d) => nepaliDigits.indexOf(d).toString());
};

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onMegaMenuItemClick: (item: MegaMenuItem) => void;
  onLoginClick: (type: 'member' | 'office') => void;
  onQuickNav: (targetId: string) => void;
  currentUser?: AuthUser | null;
  onOpenAdminConsole?: () => void;
  onOpenMemberPortal?: () => void;
  onOpenEkym?: () => void;
  onLogout?: () => void;
  cmsSettings?: SiteSettingsCMS;
  headOffice?: HeadOfficeInfoCMS;
  onOpenNoticePopup?: () => void;
  socialLinks?: SocialLinksCMS | null;
  activePageId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onMegaMenuItemClick,
  onLoginClick,
  onQuickNav,
  currentUser,
  onOpenAdminConsole,
  onOpenMemberPortal,
  onOpenEkym,
  onLogout,
  cmsSettings,
  headOffice,
  onOpenNoticePopup,
  socialLinks,
  activePageId,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isSmartServicesOpen, setIsSmartServicesOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [spacerHeight, setSpacerHeight] = useState<number>(140);
  const headerRef = useRef<HTMLDivElement>(null);

  // Track scroll position to ensure sticky navigation bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamically calibrate spacer height on mount and window resize
  useEffect(() => {
    const measureHeader = () => {
      if (headerRef.current) {
        // If not scrolled, record full natural height; otherwise preserve a healthy fallback
        const naturalHeight = headerRef.current.offsetHeight;
        if (naturalHeight > 80 && window.scrollY < 20) {
          setSpacerHeight((prev) => (Math.abs(prev - naturalHeight) > 1 ? naturalHeight : prev));
        }
      }
    };
    measureHeader();
    const t = setTimeout(measureHeader, 100);
    window.addEventListener('resize', measureHeader);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measureHeader);
    };
  }, []);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
        setIsLoginOpen(false);
        setIsSmartServicesOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
        setIsLoginOpen(false);
        setIsSmartServicesOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (id: string) => {
    setIsLoginOpen(false);
    setIsSmartServicesOpen(false);
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const toggleLogin = () => {
    setOpenDropdownId(null);
    setIsSmartServicesOpen(false);
    setIsLoginOpen((prev) => !prev);
  };

  const handleItemClick = (item: MegaMenuItem) => {
    setOpenDropdownId(null);
    setIsSmartServicesOpen(false);
    setIsMobileMenuOpen(false);
    onMegaMenuItemClick(item);
  };

  return (
    <div className="w-full">
      {/* Pinned / Constant Fixed Navigation Header Wrapper */}
      <div
        ref={headerRef}
        className="fixed-header-wrapper"
      >
        {/* Top Utility Bar: Smoothly collapses on scroll to give maximal viewable reading space */}
        <div
          className={`topbar transition-all duration-300 ease-in-out ${
            isScrolled
              ? 'max-h-0 opacity-0 overflow-hidden py-0 border-0 pointer-events-none'
              : 'max-h-14 opacity-100 overflow-visible'
          }`}
        >
          <div className="container top-inner">
            <div className="utility">
              {onOpenNoticePopup && (
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                  onClick={onOpenNoticePopup}
                  title={lang === 'np' ? 'अत्यन्त जरुरी सूचना पप-अप हेर्नुहोस्' : 'View Urgent Notice Popup'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>📢</span>
                  <span>{lang === 'np' ? 'मुख्य सूचना' : 'Notice'}</span>
                </button>
              )}
              <button
                type="button"
                className="bg-transparent border-0 text-inherit cursor-pointer hover:text-white"
                onClick={() => {
                  setOpenDropdownId(null);
                  setIsSmartServicesOpen(false);
                  setIsLoginOpen(false);
                  onQuickNav('downloads');
                }}
              >
                ⬇ {lang === 'np' ? 'डाउनलोड' : 'Downloads'}
              </button>

              {/* Help & Support Dropdown in Top Bar */}
              <div className="relative">
                <button
                  type="button"
                  id="header-topbar-help-btn"
                  className="bg-sky-800/70 hover:bg-sky-700/90 border border-sky-400/40 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(null);
                    setIsLoginOpen(false);
                    setIsSmartServicesOpen((prev) => !prev);
                  }}
                  aria-expanded={isSmartServicesOpen}
                  aria-haspopup="true"
                >
                  <span>❓</span>
                  <span>{lang === 'np' ? 'सहायता (Help)' : 'Help'}</span>
                  <span className={`text-[10px] transition-transform duration-200 ${isSmartServicesOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {isSmartServicesOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-sky-100 py-2 z-[1400] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50/70 flex items-center justify-between">
                      <span>{lang === 'np' ? 'वित्तीय उपकरणहरू' : 'Financial Utilities'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-semibold">{lang === 'np' ? 'उपकरण' : 'Tools'}</span>
                    </div>

                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50/80 flex items-start gap-3 transition cursor-pointer border-b border-slate-50"
                      onClick={() => {
                        setIsSmartServicesOpen(false);
                        onQuickNav('calculator');
                      }}
                    >
                      <span className="text-lg leading-none mt-0.5">🧮</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {lang === 'np' ? 'ईएमआई क्याल्कुलेटर (EMI Calculator)' : 'EMI Calculator'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {lang === 'np' ? 'मासिक कर्जा किस्ता र भुक्तानी तालिका गणना' : 'Monthly loan installment & repayment schedule'}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50/80 flex items-start gap-3 transition cursor-pointer border-b border-slate-50"
                      onClick={() => {
                        setIsSmartServicesOpen(false);
                        onQuickNav('date-converter');
                      }}
                    >
                      <span className="text-lg leading-none mt-0.5">📅</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {lang === 'np' ? 'मिति रूपान्तरण (AD ↔ B.S)' : 'Date Converter (AD ↔ B.S)'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {lang === 'np' ? 'इस्वी सम्वत् (AD) र विक्रम सम्वत् (B.S) रूपान्तरण' : 'Convert dates from AD to B.S and B.S to AD'}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50/80 flex items-start gap-3 transition cursor-pointer"
                      onClick={() => {
                        setIsSmartServicesOpen(false);
                        onQuickNav('exchange-rates');
                      }}
                    >
                      <span className="text-lg leading-none mt-0.5">💱</span>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {lang === 'np' ? 'विदेशी विनिमय दर (Exchange Rates)' : 'Exchange Rates'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {lang === 'np' ? 'नेपाल राष्ट्र बैंक स्थिर भा.रु. तथा विदेशी विनिमय दर' : 'NRB fixed INR & live foreign currency rates'}
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Digital Services in Top Bar right beside Help - Attractive & Spacious Fintech Oval Design */}
              <button
                type="button"
                id="header-topbar-digital-services-btn"
                className={`relative group overflow-hidden rounded-full px-5 py-1.5 sm:py-2 text-xs sm:text-[13px] font-bold flex items-center gap-2.5 cursor-pointer transition-all duration-300 ${
                  activePageId === 'digital-services' || activePageId === 'digital'
                    ? 'bg-gradient-to-r from-sky-600 via-[#075985] to-[#0284c7] text-white ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#052636] shadow-[0_0_18px_rgba(56,189,248,0.6)] scale-105'
                    : 'bg-gradient-to-r from-[#043c5b] via-[#026aa2] to-[#0284c7] text-white border border-cyan-300/50 hover:border-cyan-200 shadow-md hover:shadow-[0_4px_18px_rgba(56,189,248,0.45)] hover:-translate-y-0.5'
                }`}
                onClick={() => {
                  setIsSmartServicesOpen(false);
                  setIsLoginOpen(false);
                  setOpenDropdownId(null);
                  onQuickNav('digital-services');
                }}
                title={lang === 'np' ? 'डिजिटल सेवाहरू - अनलाइन अनुरोध पोर्टल' : 'Digital Services - Online Portal'}
              >
                {/* Subtle animated shimmer streak across button */}
                <span className="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

                {/* Live Pulse Indicator Beacon */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300 shadow-[0_0_8px_#38bdf8]"></span>
                </span>

                {/* Smartphone Icon */}
                <Smartphone className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform shrink-0" />

                {/* Text Label */}
                <span className="tracking-wide text-white font-extrabold whitespace-nowrap drop-shadow-xs px-0.5">
                  {lang === 'np' ? 'डिजिटल सेवाहरू' : 'Digital Services'}
                </span>
              </button>
            </div>
            <div className="utility-right flex items-center gap-2">
              <button
                type="button"
                className="ekym-badge cursor-pointer"
                onClick={() => onQuickNav('ekym')}
              >
                <span className="portal-star text-[#0cb3f0]">✦</span>{' '}
                {lang === 'np' ? 'eKYM दर्ता' : 'eKYM Register'}
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === 'np' ? 'active' : ''}`}
                onClick={() => onLanguageChange('np')}
              >
                {lang === 'np' ? '●' : '○'} NP
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => onLanguageChange('en')}
              >
                {lang === 'en' ? '●' : '○'} EN
              </button>
            </div>
          </div>
        </div>

        {/* Main Header Container: 2-Tier Architecture (Constant & Fixed at top:0) */}
        <header className={`main-header bg-white ${isScrolled ? 'is-scrolled' : ''}`}>
          {/* Tier 1: Brand Logo & Information Row */}
          <div className="container header-brand-row">
            <a
              href="#home"
              className="brand flex items-center gap-3.5 group"
              onClick={(e) => {
                e.preventDefault();
                setOpenDropdownId(null);
                setIsSmartServicesOpen(false);
                setIsLoginOpen(false);
                setIsMobileMenuOpen(false);
                onQuickNav('home');
              }}
              title={lang === 'np' ? (cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.') : (cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.')}
            >
              {cmsSettings?.coopLogoUrl ? (
                <img
                  key={cmsSettings.coopLogoUrl}
                  src={cmsSettings.coopLogoUrl}
                  alt={lang === 'np' ? (cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.') : (cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.')}
                  className="brand-logo-img max-h-12 md:max-h-14 w-auto object-contain transition-transform group-hover:scale-105"
                />
              ) : null}
              <div className="brand-text-block text-left">
                <span className="brand-name block font-extrabold text-sm sm:text-base md:text-lg text-[#0c2d3e] leading-tight group-hover:text-[#0981ae] transition-colors">
                  {(lang === 'np'
                    ? cmsSettings?.coopNameNp || headOffice?.officeNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.'
                    : cmsSettings?.coopNameEn || headOffice?.officeNameEn || 'Ankur Saving & Credit Cooperative Ltd.'
                  ).replace(/\s*\([^)]*\)\s*/g, '')}
                </span>
              </div>
            </a>

            <div className="header-meta-group">
              {/* Official Since Badge (Strict English / Nepali numeral format) */}
              <div
                className="since"
                aria-label={lang === 'np' ? `स्थापना ${toNepaliDigits(cmsSettings?.establishedBs || '2057')} वि.सं.` : `Established ${toEnglishDigits(cmsSettings?.establishedBs || '2057')} B.S.`}
                title={lang === 'np' ? `स्थापना: ${toNepaliDigits(cmsSettings?.establishedBs || '2057')} वि.सं. (${cmsSettings?.establishedAd ? toNepaliDigits(cmsSettings.establishedAd) : '२०००'} इ.सं.)` : `Since ${toEnglishDigits(cmsSettings?.establishedBs || '2057')} B.S. (${cmsSettings?.establishedAd || '2000'} A.D.)`}
              >
                <small>{lang === 'np' ? 'स्थापना' : 'SINCE'}</small>
                <b>{lang === 'np' ? toNepaliDigits(cmsSettings?.establishedBs || '2057') : toEnglishDigits(cmsSettings?.establishedBs || '2057')}</b>
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                className="mobile-toggle"
                aria-label="Toggle navigation menu"
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                ☰
              </button>
            </div>
          </div>

        {/* Tier 2: Full-Width Navigation Bar */}
        <div className="container header-nav-row mt-2.5">
          <nav
            className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}
            aria-label="Main Navigation"
          >
            <div className="nav-items-track">
              {/* Mobile Drawer Quick Card: Digital Services */}
              {isMobileMenuOpen && (
                <div className="lg:hidden w-full px-2 py-1.5 mb-2 border-b border-sky-100">
                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-[#043c5b] via-[#026aa2] to-[#0284c7] text-white p-2.5 rounded-xl border border-cyan-400/40 shadow-sm flex items-center justify-between cursor-pointer transition hover:opacity-95"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onQuickNav('digital-services');
                    }}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-cyan-200">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-white">
                          {lang === 'np' ? 'डिजिटल सेवाहरू' : 'Digital Services'}
                        </div>
                        <div className="text-[10px] text-cyan-100 font-normal">
                          {lang === 'np' ? 'अनलाइन बैंकिङ तथा सेवा अनुरोध फाराम' : 'Online banking & service request form'}
                        </div>
                      </div>
                    </div>
                    <span className="text-cyan-200 text-sm font-bold">›</span>
                  </button>
                </div>
              )}
              {NAV_ITEMS.map((item) => {
                if (item.hasMegaMenu && item.megaMenuItems) {
                  const isOpen = openDropdownId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="nav-dropdown-wrapper relative"
                    >
                      <button
                        type="button"
                        id={`nav-item-btn-${item.id}`}
                        className={`nav-link-btn ${isOpen ? 'active' : ''}`}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(item.id);
                        }}
                        title={`Open ${lang === 'np' ? item.labelNp : item.labelEn} menu`}
                      >
                        <span className="nav-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        <span>{lang === 'np' ? item.labelNp : item.labelEn}</span>
                        <span
                          className={`nav-chevron transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        >
                          ⌄
                        </span>
                      </button>

                      {isOpen && (
                        <NavDropdown
                          item={item}
                          lang={lang}
                          onItemClick={handleItemClick}
                          align={
                            item.id === 'contact' || item.id === 'more' || item.id === 'career'
                              ? 'right'
                              : item.id === 'reports'
                              ? 'center'
                              : 'left'
                          }
                          isMobile={isMobileMenuOpen}
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <a
                    key={item.id}
                    id={`nav-item-link-${item.id}`}
                    href={item.link || '#'}
                    className={`nav-link-btn ${
                      item.id === 'home' && !openDropdownId ? 'active-home' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenDropdownId(null);
                      setIsLoginOpen(false);
                      setIsMobileMenuOpen(false);
                      if (item.link) {
                        onQuickNav(item.id);
                      }
                    }}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{lang === 'np' ? item.labelNp : item.labelEn}</span>
                  </a>
                );
              })}

              {/* Secure Login Portal Dropdown Button on the Far Right */}
              <div className="nav-login-wrapper">
                {currentUser ? (
                  <button
                    type="button"
                    id="nav-login-dropdown-btn"
                    className="nav-login-button bg-[#0981ae] text-white font-bold"
                    aria-haspopup="true"
                    aria-expanded={isLoginOpen}
                    onClick={toggleLogin}
                    title={currentUser.role === 'admin' ? 'Admin Console Active' : 'Member Portal Active'}
                  >
                    <span className="nav-login-icon" aria-hidden="true">
                      {currentUser.role === 'admin' ? '🏢' : '👤'}
                    </span>
                    <span>
                      {currentUser.role === 'admin'
                        ? lang === 'np' ? 'प्रशासन कन्सोल' : 'Admin Console'
                        : lang === 'np' ? 'सदस्य पोर्टल' : 'Member Portal'}
                    </span>
                    <span
                      className={`nav-chevron transition-transform duration-200 ${
                        isLoginOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    >
                      ⌄
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="nav-login-dropdown-btn"
                    className={`nav-login-button ${isLoginOpen ? 'active' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={isLoginOpen}
                    onClick={toggleLogin}
                    title={lang === 'np' ? 'लगइन मेनु खोल्नुहोस्' : 'Open login portal options'}
                  >
                    <span className="nav-login-icon" aria-hidden="true">
                      🔐
                    </span>
                    <span>{lang === 'np' ? 'लगइन' : 'Login'}</span>
                    <span
                      className={`nav-chevron transition-transform duration-200 ${
                        isLoginOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    >
                      ⌄
                    </span>
                  </button>
                )}

                {/* Login Dropdown Menu Panel: Directly anchored to Login button */}
                {isLoginOpen && (
                  <div
                    className="nav-login-menu"
                    role="menu"
                    aria-label={lang === 'np' ? 'लगइन विकल्पहरू' : 'Login options'}
                  >
                    {currentUser ? (
                      <>
                        <div className="p-3 bg-[#eef8fc] border-b border-[#bae6fd] rounded-t-xl text-xs">
                          <div className="font-bold text-[#0981ae]">
                            {currentUser.fullName}
                          </div>
                          <div className="text-[11px] text-[#526b7a]">
                            Logged in as: <strong>{currentUser.username}</strong> ({currentUser.role.toUpperCase()})
                          </div>
                        </div>

                        {currentUser.role === 'admin' ? (
                          <button
                            type="button"
                            className="login-choice office-choice w-full text-left cursor-pointer"
                            onClick={() => {
                              setIsLoginOpen(false);
                              if (onOpenAdminConsole) onOpenAdminConsole();
                            }}
                          >
                            <span className="login-option-icon office">🏢</span>
                            <div>
                              <strong>Open Admin Console</strong>
                              <small>eKYM, Loans, CBS Members, Rates</small>
                            </div>
                            <span className="choice-arrow">›</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="login-choice member-choice w-full text-left cursor-pointer"
                            onClick={() => {
                              setIsLoginOpen(false);
                              if (onOpenMemberPortal) onOpenMemberPortal();
                            }}
                          >
                            <span className="login-option-icon member">👤</span>
                            <div>
                              <strong>Open Member Portal</strong>
                              <small>Passbook, Balances & Loan Request</small>
                            </div>
                            <span className="choice-arrow">›</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="login-choice member-choice w-full text-left cursor-pointer border-t border-[#e6f2f8]"
                          onClick={() => {
                            setIsLoginOpen(false);
                            if (onOpenEkym) onOpenEkym();
                          }}
                        >
                          <span className="login-option-icon member">📝</span>
                          <div>
                            <strong>Digital eKYM Portal</strong>
                            <small>Electronic Know Your Member Form</small>
                          </div>
                          <span className="choice-arrow">›</span>
                        </button>

                        <button
                          type="button"
                          className="login-choice w-full text-left cursor-pointer border-t border-[#e6f2f8] hover:bg-[#fef2f2]"
                          onClick={() => {
                            setIsLoginOpen(false);
                            if (onLogout) onLogout();
                          }}
                        >
                          <span className="login-option-icon text-[#ef4444]">🚪</span>
                          <div>
                            <strong className="text-[#ef4444]">Log Out</strong>
                            <small>End secure authenticated session</small>
                          </div>
                          <span className="choice-arrow">›</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Member Login Option */}
                        <button
                          type="button"
                          id="header-member-login-btn"
                          className="login-choice member-choice w-full text-left"
                          onClick={() => {
                            setIsLoginOpen(false);
                            onLoginClick('member');
                          }}
                        >
                          <span className="login-option-icon member">👤</span>
                          <div>
                            <strong>
                              {lang === 'np' ? 'सदस्य लगइन' : 'Member Login'}
                            </strong>
                            <small>
                              {lang === 'np'
                                ? 'खाता: EK-10482 / पिन: 1234'
                                : 'Demo: EK-10482 / PIN: 1234'}
                            </small>
                          </div>
                          <span className="choice-arrow">›</span>
                        </button>

                        {/* Office / Admin Login Option */}
                        <button
                          type="button"
                          id="header-office-admin-login-btn"
                          className="login-choice office-choice w-full text-left"
                          onClick={() => {
                            setIsLoginOpen(false);
                            onLoginClick('office');
                          }}
                        >
                          <span className="login-option-icon office">🏢</span>
                          <div>
                            <strong>
                              {lang === 'np'
                                ? 'कार्यालय / प्रशासन लगइन'
                                : 'Office / Admin Login'}
                            </strong>
                            <small>
                              {lang === 'np'
                                ? 'अधिकृत कर्मचारी तथा प्रशासन'
                                : 'Authorized Staff & Admin'}
                            </small>
                          </div>
                          <span className="choice-arrow">›</span>
                        </button>

                        <button
                          type="button"
                          className="login-choice w-full text-left border-t border-[#e6f2f8]"
                          onClick={() => {
                            setIsLoginOpen(false);
                            if (onOpenEkym) onOpenEkym();
                          }}
                        >
                          <span className="login-option-icon member">📝</span>
                          <div>
                            <strong>{lang === 'np' ? 'ई-केवाइएम (eKYM) फाराम' : 'Digital eKYM Form'}</strong>
                            <small>{lang === 'np' ? 'अनलाइन सदस्य प्रमाणीकरण' : 'Digital Self-Registration'}</small>
                          </div>
                          <span className="choice-arrow">›</span>
                        </button>

                        <div className="login-menu-foot">
                          <span>✓</span>{' '}
                          {lang === 'np'
                            ? '२५६-बिट एसएसएल सुरक्षित अनलाइन पोर्टल'
                            : '256-bit SSL Protected Banking Portal'}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>
      </div>

      {/* Persistent Spacer to ensure smooth flow without content jumping under fixed header */}
      <div
        style={{ height: `${spacerHeight}px` }}
        aria-hidden="true"
        className="fixed-header-spacer"
      />

      {/* Notice Ticker: Positioned immediately below navigation, scrolls naturally */}
      <div
        className="notice-ticker"
        aria-label={lang === 'np' ? 'सूचना' : 'Notices'}
      >
        <div className="container notice-ticker-inner">
          <div className="notice-label">
            {lang === 'np' ? 'सूचना' : 'NOTICES'}
          </div>
          <div className="notice-track">
            <div className="notice-items">
              {TICKER_NOTICES.map((n, i) => (
                <div
                  key={`t1-${i}`}
                  className="notice-item cursor-pointer"
                  onClick={() => onQuickNav('notices')}
                >
                  <span className="notice-dot">›</span>
                  <span>{lang === 'np' ? n.np : n.en}</span>
                </div>
              ))}
              {TICKER_NOTICES.map((n, i) => (
                <div
                  key={`t2-${i}`}
                  className="notice-item cursor-pointer"
                  onClick={() => onQuickNav('notices')}
                >
                  <span className="notice-dot">›</span>
                  <span>{lang === 'np' ? n.np : n.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
