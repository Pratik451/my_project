import React, { useState, useEffect } from 'react';
import { MonthlyFinancialReportCMS, Language, SiteSettingsCMS } from '../types';
import {
  Share2,
  Copy,
  Printer,
  Check,
  Calendar,
  Users,
  ShieldCheck,
  Landmark,
  TrendingUp,
  Wallet,
  Building2,
  Coins,
  Globe,
} from 'lucide-react';

const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliDigits(str: string | number | undefined | null): string {
  const s = String(str ?? '');
  return s.replace(/[0-9]/g, (d) => NEP_DIGITS[parseInt(d, 10)]);
}

export function toEnglishDigits(str: string | number | undefined | null): string {
  const s = String(str ?? '');
  return s.replace(/[०-९]/g, (d) => String(NEP_DIGITS.indexOf(d)));
}

/**
 * Formats a number with South Asian grouping (thousands, lakhs, crores)
 * e.g. 310840400 -> 31,08,40,400
 */
export function formatSouthAsianNumber(numStr: string): string {
  if (!numStr) return '';
  if (numStr.includes(',')) return numStr;
  const parts = numStr.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';

  if (integerPart.length <= 3) return integerPart + decimalPart;

  const lastThree = integerPart.substring(integerPart.length - 3);
  const remaining = integerPart.substring(0, integerPart.length - 3);
  const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${grouped},${lastThree}${decimalPart}`;
}

/**
 * Converts mixed Nepali numbers, currency, and notes into clean English equivalents
 */
export function convertNepaliNumberAndTextToEnglish(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  let s = toEnglishDigits(String(str));
  // Replace currency
  s = s.replace(/रु\.\s*/g, 'Rs. ');
  s = s.replace(/रु\s*/g, 'Rs. ');
  // Replace growth/decrease words
  s = s.replace(/वृद्धि/g, 'Growth');
  s = s.replace(/कमी/g, 'Decrease');
  s = s.replace(/बढोत्तरी/g, 'Growth');
  // Replace member/borrower units
  s = s.replace(/ऋणी\s*सदस्य/g, 'Borrowers');
  s = s.replace(/ऋणी/g, 'Borrowers');
  s = s.replace(/जना/g, 'Members');
  s = s.replace(/सदस्य/g, 'Members');
  // Replace common notes
  s = s.replace(/जगेडा\s*\+\s*अन्य/g, 'Reserve + Other');
  s = s.replace(/जगेडा\s*कोष/g, 'Reserve Fund');
  s = s.replace(/अन्य\s*कोष/g, 'Other Funds');
  s = s.replace(/सक्रिय\s*सेयरधनी/g, 'Active Shareholders');
  s = s.replace(/भौतिक\s*पूर्वाधार/g, 'Physical Infrastructure');
  s = s.replace(/विभिन्न\s*सुरक्षित\s*कोष/g, 'Various Statutory Funds');
  s = s.replace(/चुक्ता\s*पुँजी/g, 'Paid-up Capital');
  s = s.replace(/आ\.व\.\s*/g, 'FY ');
  s = s.replace(/मसान्त/g, 'End of Month');
  return s.trim();
}

/**
 * Formats monetary amounts for the specified language:
 * - English: "Rs. 31,08,40,400/-"
 * - Nepali: "रु. ३१,०८,४०,४००/-"
 */
export function formatAmount(val: string | number | undefined | null, lang: Language): string {
  if (val === undefined || val === null) return '-';
  const clean = String(val).trim();
  if (clean === '-' || clean === '') return '-';

  const engDigits = toEnglishDigits(clean);
  const numMatch = engDigits.match(/[\d,]+(\.\d+)?/);
  const numStr = numMatch ? numMatch[0] : '';

  if (!numStr) {
    return lang === 'np' ? toNepaliDigits(clean) : convertNepaliNumberAndTextToEnglish(clean);
  }

  const formattedNum = formatSouthAsianNumber(numStr);

  if (lang === 'en') {
    return `Rs. ${formattedNum}/-`;
  } else {
    return `रु. ${toNepaliDigits(formattedNum)}/-`;
  }
}

/**
 * Formats member / count figures:
 * - English: "43,892 Members" or "10,380 Borrowers"
 * - Nepali: "४३,८९२ जना" or "१०,३८० ऋणी सदस्य"
 */
export function formatCount(
  val: string | number | undefined | null,
  lang: Language,
  defaultUnit?: { en: string; np: string }
): string {
  if (val === undefined || val === null) return '-';
  const clean = String(val).trim();
  if (clean === '-' || clean === '') return '-';

  const engDigits = toEnglishDigits(clean);
  const numMatch = engDigits.match(/[\d,]+(\.\d+)?/);
  const numStr = numMatch ? numMatch[0] : '';

  if (!numStr) {
    return lang === 'np' ? toNepaliDigits(clean) : convertNepaliNumberAndTextToEnglish(clean);
  }

  const formattedNum = formatSouthAsianNumber(numStr);
  const isBorrower = clean.includes('ऋणी') || clean.toLowerCase().includes('borrower');
  const isMember = clean.includes('सदस्य') || clean.toLowerCase().includes('member');

  if (lang === 'en') {
    let suffix = '';
    if (defaultUnit?.en) suffix = ` ${defaultUnit.en}`;
    else if (isBorrower) suffix = ' Borrowers';
    else if (isMember) suffix = ' Members';
    return `${formattedNum}${suffix}`;
  } else {
    let suffix = '';
    if (defaultUnit?.np) suffix = ` ${defaultUnit.np}`;
    else if (isBorrower) suffix = ' ऋणी सदस्य';
    else if (isMember) suffix = ' सदस्य';
    return `${toNepaliDigits(formattedNum)}${suffix}`;
  }
}

/**
 * Formats growth percentages:
 * - English: "0.00% Growth" or "+0.80% Growth" or "-0.50% Decrease"
 * - Nepali: "०.००% वृद्धि" or "+०.८०% वृद्धि" or "-०.५०% कमी"
 */
export function formatGrowth(val: string | number | undefined | null, lang: Language): string {
  if (val === undefined || val === null) return '-';
  const clean = String(val).trim();
  if (clean === '-' || clean === '') return '-';

  const engDigits = toEnglishDigits(clean);
  const numMatch = engDigits.match(/[\d,]+(\.\d+)?%/);
  const isDecrease = clean.includes('कमी') || clean.toLowerCase().includes('decrease') || clean.startsWith('-');

  if (lang === 'en') {
    if (numMatch) {
      const sign = clean.startsWith('+') ? '+' : '';
      return `${sign}${numMatch[0]} ${isDecrease ? 'Decrease' : 'Growth'}`;
    }
    return engDigits
      .replace(/वृद्धि/g, 'Growth')
      .replace(/कमी/g, 'Decrease')
      .replace(/चुक्ता पुँजी/g, 'Paid-up Capital');
  } else {
    if (numMatch) {
      const sign = clean.startsWith('+') ? '+' : '';
      return `${sign}${toNepaliDigits(numMatch[0])} ${isDecrease ? 'कमी' : 'वृद्धि'}`;
    }
    return toNepaliDigits(clean);
  }
}

/**
 * Formats percentage or ratio strings:
 * - English: "27.56%"
 * - Nepali: "२७.५६%"
 */
export function formatPercent(val: string | number | undefined | null, lang: Language): string {
  if (val === undefined || val === null) return '-';
  const clean = String(val).trim();
  if (lang === 'en') {
    return toEnglishDigits(clean);
  } else {
    return toNepaliDigits(clean);
  }
}

/**
 * Formats KPI badge indicators:
 */
export function formatKpiBadge(
  val: string | number | undefined | null,
  type: 'npa' | 'npl' | 'liq',
  lang: Language
): string {
  if (!val) return '';
  const clean = String(val).trim();
  const eng = toEnglishDigits(clean);
  const numMatch = eng.match(/[\d,]+(\.\d+)?%/);
  const num = numMatch ? numMatch[0] : eng.replace(/[^0-9.%]/g, '');

  const displayNum = lang === 'np' ? toNepaliDigits(num) : num;
  if (type === 'npl') return `NPL ${displayNum}`;
  if (type === 'npa') return `NPA ${displayNum}`;
  return `Liq ${displayNum}`;
}

interface Props {
  reports: MonthlyFinancialReportCMS[];
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  cmsSettings?: SiteSettingsCMS;
  initialSelectedId?: string;
  onRegisterClick?: () => void;
}

export const InstitutionalReportSection: React.FC<Props> = ({
  reports,
  lang,
  onLanguageChange,
  cmsSettings,
  initialSelectedId,
  onRegisterClick,
}) => {
  // Allow direct language switching within the report toolbar as well as syncing with parent
  const [currentLang, setCurrentLang] = useState<Language>(lang);

  useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  const handleToggleLang = (newLang: Language) => {
    setCurrentLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const isNp = currentLang === 'np';

  const publishedReports = (reports && reports.length > 0 ? reports : [])
    .filter((r) => r.isPublished !== false)
    .sort((a, b) => {
      if (a.isLatest && !b.isLatest) return -1;
      if (!a.isLatest && b.isLatest) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

  const latestReport = publishedReports.find((r) => r.isLatest) || publishedReports[0];
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || (latestReport ? latestReport.id : '')
  );
  const [copiedToast, setCopiedToast] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const currentReport =
    publishedReports.find((r) => r.id === selectedId) || latestReport || reports[0];

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'institutional-profile');
    if (currentReport?.id) {
      url.searchParams.set('report', currentReport.id);
    }
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    });
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'institutional-profile');
    if (currentReport?.id) {
      url.searchParams.set('report', currentReport.id);
    }
    const shareData = {
      title: isNp
        ? `अंकुर सहकारी - संस्थागत वित्तीय विवरण (${currentReport?.monthNp} ${currentReport?.fiscalYear})`
        : `Ankur Cooperative - Monthly Financial Report (${currentReport?.monthEn || currentReport?.monthNp})`,
      text: isNp
        ? `अंकुर बचत तथा ऋण सहकारी संस्था लि. को ${currentReport?.monthNp} मसान्तको आधिकारिक संस्थागत वित्तीय विवरण हेर्नुहोस्।`
        : `Check the official monthly financial report of Ankur Saving & Credit Cooperative Ltd.`,
      url: url.toString(),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyLink();
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentReport) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
        {isNp
          ? 'हाल कुनै संस्थागत वित्तीय प्रतिवेदन प्रकाशित भएको छैन।'
          : 'No monthly financial reports currently published.'}
      </div>
    );
  }

  return (
    <div className="institutional-report-container space-y-6">
      {/* Toast Notification for Link Copy */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#074766] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-500/50 animate-bounce text-xs sm:text-sm font-semibold">
          <Check className="w-5 h-5 text-sky-400 shrink-0" />
          <span>
            {isNp
              ? 'प्रतिवेदनको लिंक क्लिपबोर्डमा कपी गरियो!'
              : 'Direct report link copied to clipboard!'}
          </span>
        </div>
      )}

      {/* Share Modal Fallback */}
      {showShareModal && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#0981ae]" />
              <span>{isNp ? 'प्रतिवेदन साझेदारी गर्नुहोस्' : 'Share Financial Report'}</span>
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {isNp
                ? 'तपाईं यो लिंक मार्फत अंकुर सहकारीको आधिकारिक वित्तीय प्रतिवेदन अरूलाई पठाउन सक्नुहुन्छ:'
                : 'Share this link to directly view this certified financial report:'}
            </p>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-800 break-all border border-slate-200 select-all mb-4">
              {window.location.origin}/?page=institutional-profile&report={currentReport.id}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCopyLink();
                  setShowShareModal(false);
                }}
                className="flex-1 py-2.5 bg-[#0981ae] text-white rounded-xl text-xs font-bold hover:bg-[#07678d] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>{isNp ? 'लिंक कपी गर्नुहोस्' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition cursor-pointer"
              >
                {isNp ? 'बन्द' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Controls Toolbar: Month Selector + Language Switcher + Actions */}
      <div className="no-print bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Month Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 shrink-0 mr-1">
            <Calendar className="w-4 h-4 text-[#0981ae]" />
            <span>{isNp ? 'प्रतिवेदन महिना:' : 'Report Month:'}</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {publishedReports.map((rep) => {
              const isSelected = rep.id === currentReport.id;
              const monthLabel = isNp
                ? `${rep.monthNp} ${toNepaliDigits(rep.fiscalYear.replace('आ.व. ', ''))}`
                : `${rep.monthEn || rep.monthNp} (${toEnglishDigits(rep.fiscalYear)})`;

              return (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setSelectedId(rep.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0981ae] to-[#0cb3f0] text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-300'
                  }`}
                >
                  {rep.isLatest && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  )}
                  <span>{monthLabel}</span>
                  {rep.isLatest && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-black ${
                        isSelected ? 'bg-black/25 text-white' : 'bg-sky-100 text-[#074766]'
                      }`}
                    >
                      {isNp ? 'नवीनतम' : 'Latest'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Toolbar: Language Switcher + Share / Copy / Print */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 flex-wrap">
          {/* Quick Language Toggle Pill */}
          <div className="inline-flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleToggleLang('np')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isNp
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="नेपालीमा विवरण हेर्नुहोस्"
            >
              <span>🇳🇵</span>
              <span>नेपाली</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleLang('en')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                !isNp
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="View in English"
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-[#0981ae] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title={isNp ? 'साझेदारी गर्नुहोस्' : 'Share Report'}
          >
            <Share2 className="w-3.5 h-3.5 text-[#0981ae]" />
            <span className="hidden xs:inline">{isNp ? 'Share' : 'Share'}</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-[#0981ae] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title={isNp ? 'सिधा लिंक कपी गर्नुहोस्' : 'Copy Direct Link'}
          >
            <Copy className="w-3.5 h-3.5 text-[#0981ae]" />
            <span className="hidden xs:inline">{isNp ? 'Copy Link' : 'Copy Link'}</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
            title={isNp ? 'प्रिन्ट वा PDF सुरक्षित गर्नुहोस्' : 'Print or Export PDF'}
          >
            <Printer className="w-3.5 h-3.5 text-sky-300" />
            <span>{isNp ? 'Print / PDF' : 'Print / PDF'}</span>
          </button>

          {/* Monthly Comparison Jump Button */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('monthly-comparison');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-3.5 py-2 bg-[#074766] hover:bg-[#052636] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
            title={isNp ? 'दुई महिना बीचको वित्तीय तुलना हेर्नुहोस्' : 'Compare two months side by side'}
          >
            <span>⚖️</span>
            <span>{isNp ? 'मासिक तुलना' : 'Compare Months'}</span>
          </button>
        </div>
      </div>

      {/* Printable Official Document Wrapper */}
      <div className="print-area bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-md">
        {/* Official Header */}
        <div className="border-b-2 border-[#0981ae]/30 pb-5 mb-6 text-center relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0981ae] block mb-1">
                {isNp
                  ? 'नेपाल सरकार सहकारी विभाग दर्ता नं. ४२१/०५७/०५८'
                  : 'Regd. Under Cooperative Act • Regd No: 421/057/058'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {isNp
                  ? cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.'
                  : cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isNp
                  ? cmsSettings?.addressNp || 'मुख्य सडक, बुटवल-४, रुपन्देही, लुम्बिनी प्रदेश, नेपाल'
                  : cmsSettings?.addressEn || 'Main Road, Traffic Chowk, Butwal-04, Rupandehi, Nepal'}{' '}
                • {isNp ? toNepaliDigits(cmsSettings?.phone || '०७१-५४०१२३') : toEnglishDigits(cmsSettings?.phone || '071-540123')}
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0981ae] border border-sky-200 text-xs font-black uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                <span>
                  {currentReport.isLatest
                    ? (isNp ? 'नवीनतम प्रमाणीकरण' : 'LATEST AUDITED')
                    : (isNp ? 'प्रमाणित वित्तीय विवरण' : 'OFFICIAL STATEMENT')}
                </span>
              </span>
              <div className="text-xs text-slate-600 font-bold">
                {isNp ? (
                  <>
                    {toNepaliDigits(currentReport.fiscalYear)} •{' '}
                    <span className="text-[#0981ae] font-black">{currentReport.monthNp} मसान्त</span>
                  </>
                ) : (
                  <>
                    {toEnglishDigits(currentReport.fiscalYear).replace('आ.व. ', 'FY ')} •{' '}
                    <span className="text-[#0981ae] font-black">
                      End of {currentReport.monthEn || currentReport.monthNp}
                    </span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {isNp ? 'प्रकाशन मिति:' : 'Published:'}{' '}
                {isNp
                  ? toNepaliDigits(currentReport.reportDateNp)
                  : `${currentReport.reportDateEn || currentReport.reportDateNp} (${toEnglishDigits(currentReport.reportDateNp)})`}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-[#074766]">
              {isNp
                ? '📊 मासिक संस्थागत वित्तीय विवरण तथा प्रमुख परिसूचकहरू'
                : '📊 Monthly Institutional Financial Indicators & Summary Statement'}
            </span>
            <span className="text-[11px] text-slate-500 italic">
              {isNp
                ? currentReport.remarksNp || currentReport.remarksEn || ''
                : currentReport.remarksEn || currentReport.remarksNp || ''}
            </span>
          </div>
        </div>

        {/* 6 Key Metrics Highlight Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-7">
          {/* 1. Total Members */}
          <div className="bg-gradient-to-br from-sky-50 via-white to-sky-50/50 p-4 rounded-2xl border border-sky-100 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-sky-800 mb-1">
              <span className="text-xs font-bold">
                {isNp ? 'कुल सदस्य संख्या' : 'Total Members'}
              </span>
              <Users className="w-4 h-4 text-[#0981ae]" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatCount(currentReport.totalMembers, currentLang, { en: 'Members', np: 'जना' })}
            </div>
            <div className="text-[10px] text-sky-700 font-semibold mt-1">
              {isNp ? 'सक्रिय सेयरधनी परिवारहरू' : 'Active Shareholder Base'}
            </div>
          </div>

          {/* 2. Share Capital */}
          <div className="bg-gradient-to-br from-cyan-50 via-white to-sky-50/50 p-4 rounded-2xl border border-sky-100 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-[#074766] mb-1">
              <span className="text-xs font-bold">
                {isNp ? 'सेयर पूँजी' : 'Share Capital'}
              </span>
              <Coins className="w-4 h-4 text-[#0981ae]" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight truncate">
              {formatAmount(currentReport.shareCapital, currentLang)}
            </div>
            <div className="text-[10px] text-[#0981ae] font-semibold mt-1">
              {formatGrowth(currentReport.shareCapitalGrowth, currentLang) || (isNp ? 'चुक्ता पुँजी' : 'Paid-Up Capital')}
            </div>
          </div>

          {/* 3. Total Savings Deposits */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-indigo-800 mb-1">
              <span className="text-xs font-bold">
                {isNp ? 'कुल बचत संकलन' : 'Total Savings Deposits'}
              </span>
              <Wallet className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight truncate">
              {formatAmount(currentReport.totalSavings, currentLang)}
            </div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-1">
              {formatGrowth(currentReport.totalSavingsGrowth, currentLang) || (isNp ? 'सदस्य बचत मौज्दात' : 'Member Deposits')}
            </div>
          </div>

          {/* 4. Loans Disbursed */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 p-4 rounded-2xl border border-amber-100 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-xs font-bold">
                {isNp ? 'लगानीमा रहेको ऋण' : 'Loans Outstanding'}
              </span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight truncate">
              {formatAmount(currentReport.loansDisbursed, currentLang)}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-1">
              {formatCount(currentReport.borrowerMembersCount, currentLang, { en: 'Borrowers', np: 'ऋणी सदस्य' }) ||
                (isNp ? 'ऋणी सदस्य संख्या' : 'Borrower Base')}
            </div>
          </div>

          {/* 5. Liquidity */}
          <div className="bg-gradient-to-br from-cyan-50 via-white to-cyan-50/50 p-4 rounded-2xl border border-cyan-100 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-cyan-800 mb-1">
              <span className="text-xs font-bold">
                {isNp ? 'तरलता (नगद/बैंक मौज्दात)' : 'Liquidity Reserve'}
              </span>
              <Landmark className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight truncate">
              {formatAmount(currentReport.liquidityAmount, currentLang)}
            </div>
            <div className="text-[10px] text-cyan-700 font-bold mt-1">
              {isNp
                ? `तरलता अनुपात: ${formatPercent(currentReport.liquidityPercent, currentLang)}`
                : `Liquidity: ${formatPercent(currentReport.liquidityPercent, currentLang)}`}
            </div>
          </div>

          {/* 6. Total Assets */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/50 p-4 rounded-2xl border border-purple-100 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-purple-800 mb-1">
              <span className="text-xs font-bold">
                {isNp ? 'कुल सम्पत्ति (वासलात)' : 'Total Balance Sheet'}
              </span>
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight truncate">
              {formatAmount(currentReport.totalAssets, currentLang)}
            </div>
            <div className="text-[10px] text-purple-700 font-semibold mt-1">
              {isNp ? 'कुल वासलात आकार' : 'Audited Assets'}
            </div>
          </div>
        </div>

        {/* Detailed 10-Row Financial Indicator Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-xs mb-6">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#052636] to-[#074766] text-white">
                <th className="py-3.5 px-3 sm:px-4 font-bold text-center w-14 sm:w-16">
                  {isNp ? 'क्र.सं.' : 'S.N.'}
                </th>
                <th className="py-3.5 px-3 sm:px-5 font-bold">
                  {isNp ? 'वित्तीय सूचक विवरण' : 'Financial Statement Particulars'}
                </th>
                <th className="py-3.5 px-3 sm:px-5 font-bold text-right">
                  {isNp ? 'रकम / संख्या (रु.)' : 'Amount / Count (NPR)'}
                </th>
                <th className="py-3.5 px-3 sm:px-4 font-bold text-center">
                  {isNp ? 'कैफियत / अनुपात' : 'Remarks / Growth / Ratio'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {/* Row 1: Total Members */}
              <tr className="hover:bg-sky-50/60 transition-colors">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '१.' : '1.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'कुल सदस्य संख्या (Shareholder Members)' : 'Total Shareholder Members'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-[#074766]">
                  {formatCount(currentReport.totalMembers, currentLang, { en: 'Members', np: 'जना' })}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-slate-600">
                  {isNp ? 'सक्रिय सेयरधनी' : 'Active Shareholders'}
                </td>
              </tr>

              {/* Row 2: Share Capital */}
              <tr className="hover:bg-sky-50/60 transition-colors bg-slate-50/40">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '२.' : '2.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'सेयर पूँजी (Share Capital)' : 'Share Capital'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-slate-900">
                  {formatAmount(currentReport.shareCapital, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-[#0981ae] font-semibold">
                  {formatGrowth(currentReport.shareCapitalGrowth, currentLang)}
                </td>
              </tr>

              {/* Row 3: Statutory Reserve Fund */}
              <tr className="hover:bg-sky-50/60 transition-colors">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '३.' : '3.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'जगेडा कोष (Statutory Reserve Fund)' : 'Statutory Reserve Fund'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-slate-900">
                  {formatAmount(currentReport.reserveFund, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-[#0981ae] font-semibold">
                  {formatGrowth(currentReport.reserveFundGrowth, currentLang)}
                </td>
              </tr>

              {/* Row 4: Total Institutional Capital */}
              <tr className="hover:bg-sky-50/60 transition-colors bg-slate-50/40">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '४.' : '4.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'कुल संस्थागत पूँजी (Total Institutional Capital)' : 'Total Institutional Capital'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-[#0981ae]">
                  {formatAmount(currentReport.totalInstitutionalCapital, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-slate-600">
                  {isNp
                    ? currentReport.totalInstitutionalCapitalNote || 'जगेडा + अन्य'
                    : 'Reserve + Other Funds'}
                </td>
              </tr>

              {/* Row 5: Other Funds */}
              <tr className="hover:bg-sky-50/60 transition-colors">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '५.' : '5.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'अन्य कोषहरू (Other Statutory Funds)' : 'Other Statutory Funds'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-slate-900">
                  {formatAmount(currentReport.otherFunds, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-slate-500">
                  {isNp ? 'विभिन्न सुरक्षित कोष' : 'Reserved Funds'}
                </td>
              </tr>

              {/* Row 6: Total Savings Deposits */}
              <tr className="hover:bg-sky-50/60 transition-colors bg-slate-50/40">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '६.' : '6.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'कुल बचत संकलन (Total Member Savings Deposits)' : 'Total Member Savings Deposits'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-indigo-900">
                  {formatAmount(currentReport.totalSavings, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-[#0981ae] font-semibold">
                  {formatGrowth(currentReport.totalSavingsGrowth, currentLang)}
                </td>
              </tr>

              {/* Row 7: Loans Outstanding */}
              <tr className="hover:bg-sky-50/60 transition-colors">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '७.' : '7.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'लगानीमा रहेको ऋण (Loans Outstanding & Disbursed)' : 'Loans Outstanding & Disbursed'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-amber-900">
                  {formatAmount(currentReport.loansDisbursed, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-amber-800 font-semibold">
                  {formatCount(currentReport.borrowerMembersCount, currentLang, { en: 'Borrowers', np: 'ऋणी सदस्य' })}
                </td>
              </tr>

              {/* Row 8: Liquidity */}
              <tr className="hover:bg-sky-50/60 transition-colors bg-slate-50/40">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '८.' : '8.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'तरलता (नगद तथा बैंक मौज्दात)' : 'Liquidity (Cash & Bank Balance)'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-cyan-900">
                  {formatAmount(currentReport.liquidityAmount, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-cyan-800 font-bold">
                  {formatPercent(currentReport.liquidityPercent, currentLang)}
                </td>
              </tr>

              {/* Row 9: Fixed Assets */}
              <tr className="hover:bg-sky-50/60 transition-colors">
                <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                  {isNp ? '९.' : '9.'}
                </td>
                <td className="py-3 px-3 sm:px-5 font-semibold text-slate-900">
                  {isNp ? 'स्थिर सम्पत्ति (Fixed Assets & Property)' : 'Fixed Assets & Property'}
                </td>
                <td className="py-3 px-3 sm:px-5 text-right font-mono font-bold text-slate-900">
                  {formatAmount(currentReport.fixedAssets, currentLang)}
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-xs text-slate-500">
                  {isNp ? 'भौतिक पूर्वाधार' : 'Physical Infrastructure'}
                </td>
              </tr>

              {/* Row 10 - Highlight Total Assets */}
              <tr className="bg-sky-100/60 font-bold border-t-2 border-sky-300">
                <td className="py-3.5 px-3 sm:px-4 text-center font-mono text-base text-[#074766]">
                  {isNp ? '१०.' : '10.'}
                </td>
                <td className="py-3.5 px-3 sm:px-5 text-slate-950 font-black text-sm sm:text-base">
                  {isNp ? 'कुल सम्पत्ति / वासलात (Total Assets / Balance Sheet)' : 'Total Assets (Audited Balance Sheet)'}
                </td>
                <td className="py-3.5 px-3 sm:px-5 text-right font-mono font-black text-base sm:text-lg text-[#074766]">
                  {formatAmount(currentReport.totalAssets, currentLang)}
                </td>
                <td className="py-3.5 px-3 sm:px-4 text-center text-xs text-[#0981ae] font-extrabold uppercase">
                  {isNp ? 'कुल वासलात आकार' : 'Total Asset Size'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Indicators: Only NPL, NPA, Liq */}
        {(currentReport.nplPercent || currentReport.npaPercent || currentReport.liqPercentBadge) && (
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#074766] text-white flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-3 shadow-lg mb-2">
            {currentReport.nplPercent && (
              <span className="px-4 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm font-bold text-sky-300 font-mono tracking-wide">
                {formatKpiBadge(currentReport.nplPercent, 'npl', currentLang)}
              </span>
            )}
            {currentReport.npaPercent && (
              <span className="px-4 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm font-bold text-amber-300 font-mono tracking-wide">
                {formatKpiBadge(currentReport.npaPercent, 'npa', currentLang)}
              </span>
            )}
            {currentReport.liqPercentBadge && (
              <span className="px-4 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm font-bold text-cyan-300 font-mono tracking-wide">
                {formatKpiBadge(currentReport.liqPercentBadge, 'liq', currentLang)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
