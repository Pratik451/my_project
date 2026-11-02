import React from 'react';
import { MegaMenuItem, Language, NavItem } from '../types';

interface NavDropdownProps {
  item: NavItem;
  lang: Language;
  onItemClick: (item: MegaMenuItem) => void;
  align?: 'left' | 'right' | 'center';
  isMobile?: boolean;
}

interface ItemTheme {
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  iconHoverBg: string;
  hoverBorder: string;
  hoverBg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeEn?: string;
  badgeNp?: string;
}

const ITEM_THEMES: Record<string, ItemTheme> = {
  // ================= SERVICES =================
  'member-service': {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    iconBorder: 'border-indigo-200/70',
    iconHoverBg: 'group-hover:bg-indigo-600',
    hoverBorder: 'hover:border-indigo-300',
    hoverBg: 'hover:bg-indigo-50/50',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200/80',
    badgeEn: 'Welfare',
    badgeNp: 'कल्याणकारी',
  },
  'deposit-product': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: '11.75% P.A.',
    badgeNp: '११.७५%',
  },
  'loan': {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-200/70',
    iconHoverBg: 'group-hover:bg-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverBg: 'hover:bg-amber-50/50',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    badgeEn: 'Low Interest',
    badgeNp: 'सहुलियत',
  },
  'remittance': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Instant',
    badgeNp: 'तत्काल',
  },
  'insurance': {
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    iconBorder: 'border-rose-200/70',
    iconHoverBg: 'group-hover:bg-rose-600',
    hoverBorder: 'hover:border-rose-300',
    hoverBg: 'hover:bg-rose-50/50',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200/80',
    badgeEn: 'Protection',
    badgeNp: 'सुरक्षा',
  },
  'digital-services': {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconBorder: 'border-purple-200/70',
    iconHoverBg: 'group-hover:bg-purple-600',
    hoverBorder: 'hover:border-purple-300',
    hoverBg: 'hover:bg-purple-50/50',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200/80',
    badgeEn: '24/7 Smart',
    badgeNp: 'स्मार्ट बैंकिङ',
  },

  // ================= REPORTS =================
  'reports-monthly': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Monthly',
    badgeNp: 'मासिक',
  },
  'reports-progress': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Quarterly',
    badgeNp: 'त्रैमासिक',
  },
  'reports-annual': {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-200/70',
    iconHoverBg: 'group-hover:bg-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverBg: 'hover:bg-amber-50/50',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    badgeEn: '24th AGM',
    badgeNp: '२४औं सभा',
  },
  'reports-audit': {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconBorder: 'border-purple-200/70',
    iconHoverBg: 'group-hover:bg-purple-600',
    hoverBorder: 'hover:border-purple-300',
    hoverBg: 'hover:bg-purple-50/50',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200/80',
    badgeEn: 'Statutory CA',
    badgeNp: 'वैधानिक',
  },

  // ================= CAREER =================
  'career-vacancies': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Active Hiring',
    badgeNp: 'आवेदन खुला',
  },
  'career-requirements': {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBorder: 'border-blue-200/70',
    iconHoverBg: 'group-hover:bg-blue-600',
    hoverBorder: 'hover:border-blue-300',
    hoverBg: 'hover:bg-blue-50/50',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200/80',
    badgeEn: 'Criteria',
    badgeNp: 'मापदण्ड',
  },
  'career-process': {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-200/70',
    iconHoverBg: 'group-hover:bg-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverBg: 'hover:bg-amber-50/50',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    badgeEn: 'Form & Steps',
    badgeNp: 'प्रक्रिया',
  },

  // ================= CONTACT =================
  'contact-head-office': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-700',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-700',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Head Office',
    badgeNp: 'केन्द्रीय',
  },
  'contact-branches': {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBorder: 'border-blue-200/70',
    iconHoverBg: 'group-hover:bg-blue-600',
    hoverBorder: 'hover:border-blue-300',
    hoverBg: 'hover:bg-blue-50/50',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200/80',
    badgeEn: '3 Branches',
    badgeNp: '३ सेवा केन्द्र',
  },
  'contact-support': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Toll-Free',
    badgeNp: 'टोल-फ्री',
  },
  'contact-grievance': {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-200/70',
    iconHoverBg: 'group-hover:bg-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverBg: 'hover:bg-amber-50/50',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    badgeEn: 'Redressal',
    badgeNp: 'गुनासो पेटिका',
  },

  // ================= ABOUT US =================
  'profile': {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    iconBorder: 'border-indigo-200/70',
    iconHoverBg: 'group-hover:bg-indigo-600',
    hoverBorder: 'hover:border-indigo-300',
    hoverBg: 'hover:bg-indigo-50/50',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200/80',
    badgeEn: 'Overview',
    badgeNp: 'परिचय',
  },
  'history': {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-200/70',
    iconHoverBg: 'group-hover:bg-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverBg: 'hover:bg-amber-50/50',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    badgeEn: 'Estd 2057',
    badgeNp: '२०५७',
  },
  'mission-vision': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Goals',
    badgeNp: 'ध्येय',
  },
  'core-values': {
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    iconBorder: 'border-cyan-200/70',
    iconHoverBg: 'group-hover:bg-cyan-600',
    hoverBorder: 'hover:border-cyan-300',
    hoverBg: 'hover:bg-cyan-50/50',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200/80',
    badgeEn: 'Values',
    badgeNp: 'मान्यता',
  },
  'chairman': {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBorder: 'border-blue-200/70',
    iconHoverBg: 'group-hover:bg-blue-600',
    hoverBorder: 'hover:border-blue-300',
    hoverBg: 'hover:bg-blue-50/50',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200/80',
    badgeEn: 'Message',
    badgeNp: 'सन्देश',
  },
  'ceo': {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconBorder: 'border-purple-200/70',
    iconHoverBg: 'group-hover:bg-purple-600',
    hoverBorder: 'hover:border-purple-300',
    hoverBg: 'hover:bg-purple-50/50',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200/80',
    badgeEn: 'Executive',
    badgeNp: 'कार्यकारी',
  },
  'institutional-profile': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-700',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-700',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Statutory Facts',
    badgeNp: 'तथ्य',
  },
  'why-choose-us': {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-200/70',
    iconHoverBg: 'group-hover:bg-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverBg: 'hover:bg-amber-50/50',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200/80',
    badgeEn: 'Trust',
    badgeNp: 'सुरक्षित',
  },
  'success-stories': {
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    iconBorder: 'border-rose-200/70',
    iconHoverBg: 'group-hover:bg-rose-600',
    hoverBorder: 'hover:border-rose-300',
    hoverBg: 'hover:bg-rose-50/50',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200/80',
    badgeEn: 'Empowerment',
    badgeNp: 'सफलता',
  },
  'board': {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    iconBorder: 'border-slate-300',
    iconHoverBg: 'group-hover:bg-slate-700',
    hoverBorder: 'hover:border-slate-300',
    hoverBg: 'hover:bg-slate-100/60',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    badgeEn: 'Governance',
    badgeNp: 'सञ्चालक',
  },
  'management': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Administration',
    badgeNp: 'व्यवस्थापन',
  },
  'departments': {
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    iconBorder: 'border-violet-200/70',
    iconHoverBg: 'group-hover:bg-violet-600',
    hoverBorder: 'hover:border-violet-300',
    hoverBg: 'hover:bg-violet-50/50',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200/80',
    badgeEn: 'Divisions',
    badgeNp: 'विभागहरू',
  },
  'service-centers': {
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    iconBorder: 'border-sky-200/70',
    iconHoverBg: 'group-hover:bg-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverBg: 'hover:bg-sky-50/50',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200/80',
    badgeEn: 'Branches',
    badgeNp: 'शाखाहरू',
  },
};

const DEFAULT_THEME: ItemTheme = {
  iconBg: 'bg-sky-50',
  iconColor: 'text-[#0981ae]',
  iconBorder: 'border-sky-200/70',
  iconHoverBg: 'group-hover:bg-[#0981ae]',
  hoverBorder: 'hover:border-sky-300',
  hoverBg: 'hover:bg-sky-50/50',
  badgeBg: 'bg-sky-50',
  badgeText: 'text-[#0981ae]',
  badgeBorder: 'border-sky-200/60',
  badgeEn: 'Explore',
  badgeNp: 'विवरण',
};

export const NavDropdown: React.FC<NavDropdownProps> = ({
  item,
  lang,
  onItemClick,
  align = 'left',
  isMobile = false,
}) => {
  const subItems = item.megaMenuItems || [];
  const itemCount = subItems.length;
  // Multi-column spacious layout across About us, Services, Reports, Career, Contact
  const isTwoColumn = !isMobile && itemCount >= 3;

  // Determine width based on category and column layout
  const getWidthClass = () => {
    if (isMobile) return 'w-full';
    if (item.id === 'about') return 'w-[680px] sm:w-[740px] max-w-[calc(100vw-24px)]';
    if (item.id === 'services') return 'w-[580px] sm:w-[650px] max-w-[calc(100vw-24px)]';
    if (item.id === 'reports') return 'w-[580px] sm:w-[640px] max-w-[calc(100vw-24px)]';
    if (item.id === 'contact') return 'w-[580px] sm:w-[640px] max-w-[calc(100vw-24px)]';
    if (item.id === 'career') return 'w-[500px] sm:w-[560px] max-w-[calc(100vw-24px)]';
    if (isTwoColumn) return 'w-[580px] sm:w-[640px] max-w-[calc(100vw-24px)]';
    return 'w-[360px] max-w-[calc(100vw-24px)]';
  };

  // Alignment classes for absolute positioning
  const getAlignClass = () => {
    if (isMobile) return 'static w-full mt-2';
    if (align === 'right') return 'absolute right-0 left-auto top-[calc(100%+8px)]';
    if (align === 'center') return 'absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)]';
    return 'absolute left-0 right-auto top-[calc(100%+8px)]';
  };

  const getCategoryFooterNotice = () => {
    switch (item.id) {
      case 'about':
        return lang === 'np'
          ? '🏛️ बुटवल केन्द्रीय कार्यालय तथा ३ वटा आधुनिक सेवा केन्द्रहरू'
          : '🏛️ Head Office Butwal & 3 Active Service Branches';
      case 'services':
        return lang === 'np'
          ? '✦ आकर्षक ब्याजदर, सुरक्षित बचत तथा सरल कर्जा सुविधा'
          : '✦ Competitive Deposit Returns & Rapid Loan Appraisal';
      case 'reports':
        return lang === 'np'
          ? '📑 वार्षिक साधारण सभा तथा बाह्य लेखापरीक्षकबाट प्रमाणित प्रतिवेदन'
          : '📑 Statutory Auditor & AGM Certified Official Publications';
      case 'career':
        return lang === 'np'
          ? '✉ सम्पर्क: career@ekatacoop.com.np | दरखास्त फाराम उपलब्ध'
          : '✉ Contact: career@ekatacoop.com.np | Application Open';
      case 'contact':
        return lang === 'np'
          ? '☎ टोल-फ्री सदस्य सहायता: १६६०-०१-९९८८७'
          : '☎ Toll-Free Member Helpline: 1660-01-99887';
      case 'more':
        return lang === 'np'
          ? '★ डिजिटल eKYM, सहकारी पात्रो तथा सदस्य बजार'
          : '★ Digital eKYM, Calendar & Member Marketplace';
      default:
        return null;
    }
  };

  const footerText = getCategoryFooterNotice();

  return (
    <div
      className={`nav-dropdown-menu z-[1600] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden ${getWidthClass()} ${getAlignClass()} animate-in fade-in slide-in-from-top-2 duration-150`}
      role="menu"
      aria-label={`${lang === 'np' ? item.labelNp : item.labelEn} submenu`}
    >
      {/* Decorative Emerald Top Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#07678d] via-[#0cb3f0] to-[#0981ae]" />

      {/* Dropdown Header Strip */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0981ae] shadow-xs animate-pulse" />
          <span className="text-[12.5px] font-extrabold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
            <span className="text-base">{item.icon}</span>
            <span>{lang === 'np' ? item.labelNp : item.labelEn}</span>
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#0981ae] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/70 shadow-2xs">
          {itemCount} {lang === 'np' ? 'विषयहरू' : 'items'}
        </span>
      </div>

      {/* Submenu Items List / Grid with Rich Card Design */}
      <div
        className={`p-3 ${
          isTwoColumn ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2'
        } max-h-[72vh] overflow-y-auto`}
      >
        {subItems.map((subItem) => {
          const theme = ITEM_THEMES[subItem.id] || DEFAULT_THEME;
          const badgeLabel = lang === 'np' ? (theme.badgeNp || 'विवरण') : (theme.badgeEn || 'Details');

          return (
            <button
              key={subItem.id}
              type="button"
              role="menuitem"
              className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl bg-white ${theme.hoverBg} border border-slate-200/80 ${theme.hoverBorder} hover:shadow-md transition-all duration-200 cursor-pointer group relative`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onItemClick(subItem);
              }}
            >
              {/* Distinctive Themed Leading Icon Box */}
              <div
                className={`w-11 h-11 rounded-xl ${theme.iconBg} ${theme.iconColor} ${theme.iconBorder} border flex items-center justify-center font-bold text-xl shrink-0 ${theme.iconHoverBg} group-hover:text-white transition-all duration-200 shadow-2xs group-hover:scale-105 group-hover:shadow-xs`}
                aria-hidden="true"
              >
                {subItem.icon}
              </div>

              {/* Title, Badge & Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                  <div className="text-[13.5px] font-bold text-slate-900 group-hover:text-[#0981ae] transition-colors leading-snug truncate">
                    {lang === 'np' ? subItem.titleNp : subItem.titleEn}
                  </div>
                  {badgeLabel && (
                    <span
                      className={`text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} shrink-0 tracking-tight leading-none`}
                    >
                      {badgeLabel}
                    </span>
                  )}
                </div>

                <div className="text-[11.5px] text-slate-500 group-hover:text-slate-700 leading-snug line-clamp-2 font-normal">
                  {lang === 'np' ? subItem.subtitleNp : subItem.subtitleEn}
                </div>
              </div>

              {/* View Action Arrow Pill */}
              <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-lg bg-slate-50 group-hover:bg-sky-50 text-slate-400 group-hover:text-[#0981ae] border border-slate-200/60 group-hover:border-sky-200/80 transition-all shrink-0 self-center">
                <svg className="w-3.5 h-3.5 stroke-current group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Category Bottom Strip */}
      {footerText && (
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 text-[11.5px] text-slate-600 font-medium flex items-center justify-between">
          <span className="truncate">{footerText}</span>
          <span className="text-[#0981ae] font-extrabold text-[11px] uppercase tracking-wider shrink-0 ml-2 flex items-center gap-1 group">
            <span>{lang === 'np' ? 'हेर्नुहोस्' : 'Explore'}</span>
            <span>→</span>
          </span>
        </div>
      )}
    </div>
  );
};

