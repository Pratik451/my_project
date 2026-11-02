import React, { useState, useMemo, useEffect } from 'react';
import { MonthlyFinancialReportCMS, Language, SiteSettingsCMS } from '../types';
import {
  Calendar,
  Users,
  Coins,
  Shield,
  Building2,
  Layers,
  PiggyBank,
  Banknote,
  Wallet,
  Landmark,
  ArrowRightLeft,
  Printer,
  Share2,
  Copy,
  Check,
  RotateCcw,
  LayoutGrid,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  toNepaliDigits,
  toEnglishDigits,
  formatAmount as baseFormatAmount,
  formatCount as baseFormatCount,
  formatPercent as baseFormatPercent,
  formatKpiBadge,
  formatSouthAsianNumber,
  convertNepaliNumberAndTextToEnglish,
} from './InstitutionalReportSection';

interface Props {
  reports: MonthlyFinancialReportCMS[];
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  cmsSettings?: SiteSettingsCMS;
  initialMonthAId?: string;
  initialMonthBId?: string;
}

// 12 Standard Nepali Months in sequence with English equivalents
export const ALL_NEPALI_MONTHS = [
  { np: 'बैशाख', en: 'Baishakh', num: '01' },
  { np: 'जेठ', en: 'Jestha', num: '02' },
  { np: 'असार', en: 'Ashadh', num: '03' },
  { np: 'श्रावण', en: 'Shrawan', num: '04' },
  { np: 'भदौ', en: 'Bhadra', num: '05' },
  { np: 'असोज', en: 'Ashwin', num: '06' },
  { np: 'कार्तिक', en: 'Kartik', num: '07' },
  { np: 'मंसिर', en: 'Mangsir', num: '08' },
  { np: 'पुष', en: 'Poush', num: '09' },
  { np: 'माघ', en: 'Magh', num: '10' },
  { np: 'फागुन', en: 'Falgun', num: '11' },
  { np: 'चैत', en: 'Chaitra', num: '12' },
];

export const NEPALI_TO_ENGLISH_MONTH: Record<string, string> = {
  बैशाख: 'Baishakh',
  वैशाख: 'Baishakh',
  जेठ: 'Jestha',
  असार: 'Ashadh',
  श्रावण: 'Shrawan',
  साउन: 'Shrawan',
  भदौ: 'Bhadra',
  भाद्र: 'Bhadra',
  असोज: 'Ashwin',
  आश्विन: 'Ashwin',
  कार्तिक: 'Kartik',
  मंसिर: 'Mangsir',
  मार्ग: 'Mangsir',
  पुष: 'Poush',
  पौष: 'Poush',
  माघ: 'Magh',
  फागुन: 'Falgun',
  फाल्गुन: 'Falgun',
  चैत: 'Chaitra',
  चैत्र: 'Chaitra',
};

// Helper to format Fiscal Year for Nepali or English (e.g. "आ.व. २०८२/८३" <-> "FY 2082/83")
export function formatFiscalYear(fy: string | undefined | null, isNp: boolean): string {
  if (!fy) return '';
  if (isNp) {
    const clean = toNepaliDigits(fy);
    return clean.includes('आ.व.') ? clean : `आ.व. ${clean}`;
  }
  const eng = toEnglishDigits(fy).replace(/आ\.व\.\s*/g, '').trim();
  return `FY ${eng}`;
}

// Helper to format Month Name into clean English or Nepali
export function formatMonthName(monthNp: string | undefined | null, monthEn: string | undefined | null, isNp: boolean): string {
  if (!monthNp && !monthEn) return '';
  if (isNp) return monthNp || '';
  if (monthEn && monthEn.trim()) return monthEn.trim();
  const cleanNp = (monthNp || '').trim();
  if (NEPALI_TO_ENGLISH_MONTH[cleanNp]) return NEPALI_TO_ENGLISH_MONTH[cleanNp];
  // Substring match for suffixed labels like "असार मसान्त"
  for (const [npKey, enVal] of Object.entries(NEPALI_TO_ENGLISH_MONTH)) {
    if (cleanNp.includes(npKey)) return enVal;
  }
  return cleanNp;
}

// Helper to format Date string (Nepali digits for Nepali, English digits & optional AD date for English)
export function formatDate(dateStr: string | undefined | null, isNp: boolean, altEn?: string | null): string {
  if (!dateStr && !altEn) return '';
  if (isNp) return toNepaliDigits(dateStr || altEn);
  if (altEn && altEn.trim() && dateStr && dateStr.trim()) {
    return `${toEnglishDigits(dateStr)} (${altEn.trim()})`;
  }
  return toEnglishDigits(dateStr || altEn);
}

// Helper to parse currency/number strings from Nepali or English into raw number
function parseRawNumber(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const eng = toEnglishDigits(String(val)).replace(/[^0-9.-]/g, '');
  const num = parseFloat(eng);
  return isNaN(num) ? 0 : num;
}

// Helper to format amounts cleanly in either Nepali (रु. ३१,०८,४०,४००/-) or English (Rs. 31,08,40,400/-)
export function formatCurrencyAmount(val: string | number | undefined | null, isNp: boolean): string {
  if (val === undefined || val === null) return '—';
  const raw = String(val).trim();
  if (raw === '' || raw === '-') return '—';

  const engDigits = toEnglishDigits(raw);
  const numMatch = engDigits.match(/[\d,]+(\.\d+)?/);
  const numStr = numMatch ? numMatch[0] : '';

  if (!numStr) {
    return isNp ? toNepaliDigits(raw) : convertNepaliNumberAndTextToEnglish(raw);
  }

  const formattedNum = formatSouthAsianNumber(numStr);

  if (isNp) {
    return `रु. ${toNepaliDigits(formattedNum)}/-`;
  } else {
    return `Rs. ${formattedNum}/-`;
  }
}

// Helper to format member/borrower counts in either language
export function formatMemberCount(val: string | number | undefined | null, isNp: boolean, isBorrower = false): string {
  if (val === undefined || val === null) return '—';
  const raw = String(val).trim();
  if (raw === '' || raw === '-') return '—';

  const engDigits = toEnglishDigits(raw);
  const numMatch = engDigits.match(/[\d,]+(\.\d+)?/);
  const numStr = numMatch ? numMatch[0] : '';

  if (!numStr) {
    return isNp ? toNepaliDigits(raw) : convertNepaliNumberAndTextToEnglish(raw);
  }

  const formattedNum = formatSouthAsianNumber(numStr);

  if (isNp) {
    const nepNum = toNepaliDigits(formattedNum);
    return isBorrower ? `${nepNum} ऋणी सदस्य` : nepNum;
  } else {
    return isBorrower ? `${formattedNum} Borrowers` : formattedNum;
  }
}

// Helper to format note/subtitle strings
export function formatSubNote(note: string | undefined | null, isNp: boolean): string {
  if (!note) return '';
  if (isNp) return toNepaliDigits(note);
  return convertNepaliNumberAndTextToEnglish(note);
}

// Helper to calculate and format growth percentage between two values
function computeGrowthBadge(
  valA: string | number | undefined | null,
  valB: string | number | undefined | null,
  fallback?: string,
  isNp = true
): { text: string; isPositive: boolean; isNegative: boolean } {
  const numA = parseRawNumber(valA);
  const numB = parseRawNumber(valB);

  if (numB <= 0 || numA <= 0) {
    if (fallback) {
      const cleanFallback = fallback.trim();
      const isDecrease = cleanFallback.includes('कमी') || cleanFallback.toLowerCase().includes('decrease') || cleanFallback.startsWith('-');
      const numMatch = toEnglishDigits(cleanFallback).match(/[\d,]+(\.\d+)?%/);

      if (isNp) {
        if (numMatch) {
          const sign = cleanFallback.startsWith('+') ? '+' : '';
          return {
            text: `${sign}${toNepaliDigits(numMatch[0])} ${isDecrease ? 'कमी' : 'वृद्धि'}`,
            isPositive: !isDecrease && sign === '+',
            isNegative: isDecrease,
          };
        }
        return {
          text: toNepaliDigits(cleanFallback.replace(/growth/gi, 'वृद्धि').replace(/decrease/gi, 'कमी')),
          isPositive: false,
          isNegative: isDecrease,
        };
      } else {
        if (numMatch) {
          const sign = cleanFallback.startsWith('+') ? '+' : '';
          return {
            text: `${sign}${numMatch[0]} ${isDecrease ? 'Decrease' : 'Growth'}`,
            isPositive: !isDecrease && sign === '+',
            isNegative: isDecrease,
          };
        }
        return {
          text: toEnglishDigits(cleanFallback.replace(/वृद्धि/g, 'Growth').replace(/कमी/g, 'Decrease')),
          isPositive: false,
          isNegative: isDecrease,
        };
      }
    }
    return {
      text: isNp ? '०.००% वृद्धि' : '0.00% Growth',
      isPositive: false,
      isNegative: false,
    };
  }

  const diff = ((numA - numB) / numB) * 100;
  if (Math.abs(diff) < 0.005) {
    return {
      text: isNp ? '०.००% वृद्धि' : '0.00% Growth',
      isPositive: false,
      isNegative: false,
    };
  }

  if (diff > 0) {
    const formatted = `+${diff.toFixed(2)}% ${isNp ? 'वृद्धि' : 'Growth'}`;
    return {
      text: isNp ? toNepaliDigits(formatted) : formatted,
      isPositive: true,
      isNegative: false,
    };
  } else {
    const formatted = `${diff.toFixed(2)}% ${isNp ? 'कमी' : 'Decrease'}`;
    return {
      text: isNp ? toNepaliDigits(formatted) : formatted,
      isPositive: false,
      isNegative: true,
    };
  }
}

export const MonthlyReportComparisonSection: React.FC<Props> = ({
  reports,
  lang,
  onLanguageChange,
  cmsSettings,
  initialMonthAId,
  initialMonthBId,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>(lang);

  useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  const isNp = currentLang === 'np';

  // Sort published reports: Latest first, then by sortOrder
  const publishedReports = useMemo(() => {
    return (reports && reports.length > 0 ? reports : [])
      .filter((r) => r.isPublished !== false)
      .sort((a, b) => {
        if (a.isLatest && !b.isLatest) return -1;
        if (!a.isLatest && b.isLatest) return 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
  }, [reports]);

  // Extract distinct available Fiscal Years from reports + presets
  const fiscalYearOptions = useMemo(() => {
    const set = new Set<string>();
    publishedReports.forEach((r) => {
      if (r.fiscalYear?.trim()) set.add(r.fiscalYear.trim());
    });
    // Add common recent fiscal years if missing
    ['आ.व. २०८३/८४', 'आ.व. २०८२/८३', 'आ.व. २०८१/८२'].forEach((fy) => set.add(fy));
    return Array.from(set);
  }, [publishedReports]);

  // Distinct available months from actual published reports
  const distinctMonths = useMemo(() => {
    const set = new Set<string>();
    publishedReports.forEach((r) => {
      if (r.monthNp?.trim()) set.add(r.monthNp.trim());
    });
    // Ensure standard months from reference image are present for convenience
    ['श्रावण', 'असार', 'जेठ'].forEach((m) => set.add(m));
    return Array.from(set);
  }, [publishedReports]);

  // Latest and Previous reports for quick selection
  const currentReport = publishedReports[0];
  const previousReport = publishedReports[1] || publishedReports[0];

  // Filter States
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('latest2');

  // Comparison Card Month IDs
  const [selectedAId, setSelectedAId] = useState<string>(() => {
    if (initialMonthAId && publishedReports.some((r) => r.id === initialMonthAId)) {
      return initialMonthAId;
    }
    return publishedReports[0]?.id || '';
  });

  const [selectedBId, setSelectedBId] = useState<string>(() => {
    if (initialMonthBId && publishedReports.some((r) => r.id === initialMonthBId)) {
      return initialMonthBId;
    }
    return publishedReports[1]?.id || publishedReports[0]?.id || '';
  });

  // UI States
  const [copiedToast, setCopiedToast] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Filtered reports matching active controls
  const filteredReports = useMemo(() => {
    return publishedReports.filter((r) => {
      // Fiscal Year Filter
      if (selectedFiscalYear !== 'all') {
        const normR = r.fiscalYear.replace(/\s+/g, '');
        const normS = selectedFiscalYear.replace(/\s+/g, '');
        if (!normR.includes(normS) && !normS.includes(normR)) return false;
      }

      // Month Filter
      if (selectedMonth !== 'all') {
        if (selectedMonth === 'annual') {
          const isAnnual =
            (r.monthNp || '').includes('वार्षिक') ||
            (r.monthEn || '').toLowerCase().includes('annual') ||
            (r.remarksNp || '').includes('वार्षिक');
          if (!isAnnual) return false;
        } else {
          const normMonth = selectedMonth.trim();
          const matchNp = (r.monthNp || '').includes(normMonth);
          const matchEn = ALL_NEPALI_MONTHS.some(
            (m) => m.np === normMonth && (r.monthEn || '').toLowerCase().includes(m.en.toLowerCase())
          );
          if (!matchNp && !matchEn) return false;
        }
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const str = [
          r.fiscalYear,
          r.monthNp,
          r.monthEn,
          r.reportDateNp,
          r.reportDateEn,
          r.totalMembers,
          r.shareCapital,
          r.totalSavings,
          r.totalAssets,
          r.loansDisbursed,
          r.remarksNp,
          r.remarksEn,
        ]
          .join(' ')
          .toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    });
  }, [publishedReports, selectedFiscalYear, selectedMonth, searchQuery]);

  // Update comparison cards whenever filtered reports change or user picks quick filter
  useEffect(() => {
    if (activeQuickFilter === 'latest2') {
      if (publishedReports.length >= 2) {
        setSelectedAId(publishedReports[0].id);
        setSelectedBId(publishedReports[1].id);
      } else if (publishedReports.length === 1) {
        setSelectedAId(publishedReports[0].id);
        setSelectedBId(publishedReports[0].id);
      }
    } else if (filteredReports.length >= 2) {
      if (!filteredReports.some((r) => r.id === selectedAId)) {
        setSelectedAId(filteredReports[0].id);
      }
      if (!filteredReports.some((r) => r.id === selectedBId)) {
        setSelectedBId(filteredReports[1]?.id || filteredReports[0].id);
      }
    } else if (filteredReports.length === 1) {
      setSelectedAId(filteredReports[0].id);
      const other = publishedReports.find((r) => r.id !== filteredReports[0].id);
      if (other) setSelectedBId(other.id);
    }
  }, [filteredReports, activeQuickFilter, publishedReports]);

  // Quick Filter Button Click Handler
  const handleQuickFilter = (filterKey: string) => {
    setActiveQuickFilter(filterKey);

    if (filterKey === 'latest2') {
      setSelectedFiscalYear('all');
      setSelectedMonth('all');
      setSearchQuery('');
      if (publishedReports.length >= 2) {
        setSelectedAId(publishedReports[0].id);
        setSelectedBId(publishedReports[1].id);
      }
    } else if (filterKey === 'all') {
      setSelectedFiscalYear('all');
      setSelectedMonth('all');
      setSearchQuery('');
    } else if (filterKey === 'current') {
      setSelectedFiscalYear('all');
      if (currentReport) {
        setSelectedMonth(currentReport.monthNp);
        setSelectedAId(currentReport.id);
        if (previousReport) setSelectedBId(previousReport.id);
      }
    } else if (filterKey === 'previous') {
      setSelectedFiscalYear('all');
      if (previousReport) {
        setSelectedMonth(previousReport.monthNp);
        setSelectedAId(previousReport.id);
        const nextOldest = publishedReports[2] || currentReport || previousReport;
        setSelectedBId(nextOldest.id);
      }
    } else {
      // Month pill clicked (e.g. 'जेठ', 'असार', 'श्रावण')
      setSelectedMonth(filterKey);
      const matched = publishedReports.find((r) => (r.monthNp || '').includes(filterKey));
      if (matched) {
        setSelectedAId(matched.id);
        const adjacent = publishedReports.find((r) => r.id !== matched.id);
        if (adjacent) setSelectedBId(adjacent.id);
      }
    }
  };

  // Reset Button Handler
  const handleResetFilters = () => {
    setSelectedFiscalYear('all');
    setSelectedMonth('all');
    setSearchQuery('');
    setActiveQuickFilter('latest2');
    if (publishedReports.length >= 2) {
      setSelectedAId(publishedReports[0].id);
      setSelectedBId(publishedReports[1].id);
    }
  };

  // Swap Month A and Month B
  const handleSwap = () => {
    const temp = selectedAId;
    setSelectedAId(selectedBId);
    setSelectedBId(temp);
  };

  // Language toggle handler
  const handleToggleLang = (newLang: Language) => {
    setCurrentLang(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  // Share & Copy Handlers
  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'institutional-profile');
    if (selectedAId) url.searchParams.set('monthA', selectedAId);
    if (selectedBId) url.searchParams.set('monthB', selectedBId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    });
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'institutional-profile');
    const shareData = {
      title: isNp
        ? 'अंकुर बचत तथा ऋण सहकारी संस्था - महिनागत आर्थिक विवरण तुलना'
        : 'Ankur Cooperative - Monthly Financial Statement Comparison',
      text: isNp
        ? 'अंकुर सहकारीको आधिकारिक महिनागत संस्थागत वित्तीय तुलना तथा परिसूचकहरू हेर्नुहोस्।'
        : 'Check the certified monthly comparative financial statements of Ankur Cooperative.',
      url: url.toString(),
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        handleCopyLink();
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Selected Month A and Month B objects
  const monthA =
    publishedReports.find((r) => r.id === selectedAId) ||
    filteredReports[0] ||
    publishedReports[0];

  const monthB =
    publishedReports.find((r) => r.id === selectedBId) ||
    filteredReports[1] ||
    publishedReports[1] ||
    publishedReports[0];

  // Growth calculations between Month A and Month B, and Month B vs prior month
  const shareCapitalGrowthA = computeGrowthBadge(
    monthA?.shareCapital,
    monthB?.shareCapital,
    monthA?.shareCapitalGrowth,
    isNp
  );
  const reserveFundGrowthA = computeGrowthBadge(
    monthA?.reserveFund,
    monthB?.reserveFund,
    monthA?.reserveFundGrowth,
    isNp
  );
  const totalSavingsGrowthA = computeGrowthBadge(
    monthA?.totalSavings,
    monthB?.totalSavings,
    monthA?.totalSavingsGrowth,
    isNp
  );

  const monthBIndex = publishedReports.findIndex((r) => r.id === monthB.id);
  const monthBPrior = monthBIndex >= 0 && monthBIndex + 1 < publishedReports.length ? publishedReports[monthBIndex + 1] : null;

  const shareCapitalGrowthB = computeGrowthBadge(
    monthB?.shareCapital,
    monthBPrior?.shareCapital,
    monthB?.shareCapitalGrowth,
    isNp
  );
  const reserveFundGrowthB = computeGrowthBadge(
    monthB?.reserveFund,
    monthBPrior?.reserveFund,
    monthB?.reserveFundGrowth,
    isNp
  );
  const totalSavingsGrowthB = computeGrowthBadge(
    monthB?.totalSavings,
    monthBPrior?.totalSavings,
    monthB?.totalSavingsGrowth,
    isNp
  );

  // Result count numbers
  const displayCount = activeQuickFilter === 'latest2' ? Math.min(2, filteredReports.length) : filteredReports.length;
  const totalCount = publishedReports.length;

  if (!monthA || !monthB) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
        {isNp
          ? 'हाल कुनै संस्थागत वित्तीय प्रतिवेदन प्रकाशित भएको छैन।'
          : 'No monthly financial reports currently available.'}
      </div>
    );
  }

  // Row renderer for the dual-column comparison table
  const renderRow = (
    snNp: string,
    snEn: string,
    IconComponent: React.ComponentType<{ className?: string }>,
    iconColor: string,
    titleNp: string,
    titleEn: string,
    valA: string | number | undefined,
    subA: string | React.ReactNode,
    valB: string | number | undefined,
    subB: string | React.ReactNode,
    isTotalRow = false
  ) => {
    const sn = isNp ? snNp : snEn;
    const title = isNp ? titleNp : titleEn;

    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 ${
          isTotalRow
            ? 'bg-sky-50/70 border-t-2 border-t-sky-300 font-bold'
            : 'hover:bg-slate-50/80 transition-colors'
        }`}
      >
        {/* Left Column (Month A) */}
        <div className="flex items-center justify-between p-3 sm:px-4 sm:py-3.5 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span
              className={`w-6 sm:w-7 text-center font-bold text-xs sm:text-sm shrink-0 ${
                isTotalRow ? 'text-[#074766] font-black' : 'text-slate-500 font-mono'
              }`}
            >
              {sn}
            </span>
            <div className={`shrink-0 ${isTotalRow ? 'text-[#074766]' : iconColor}`}>
              <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <span
              className={`text-xs sm:text-sm truncate ${
                isTotalRow ? 'text-[#074766] font-black' : 'font-semibold text-slate-800'
              }`}
            >
              {title}
            </span>
          </div>
          <div className="text-right shrink-0">
            <div
              className={`font-mono text-xs sm:text-sm ${
                isTotalRow
                  ? 'font-black text-sm sm:text-base text-[#074766]'
                  : 'font-bold text-slate-900'
              }`}
            >
              {valA || '—'}
            </div>
            {subA && (
              <div className="text-[11px] font-medium text-sky-800 leading-tight mt-0.5">
                {subA}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Month B) */}
        <div className="flex items-center justify-between p-3 sm:px-4 sm:py-3.5 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span
              className={`w-6 sm:w-7 text-center font-bold text-xs sm:text-sm shrink-0 ${
                isTotalRow ? 'text-[#074766] font-black' : 'text-slate-500 font-mono'
              }`}
            >
              {sn}
            </span>
            <div className={`shrink-0 ${isTotalRow ? 'text-[#074766]' : iconColor}`}>
              <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <span
              className={`text-xs sm:text-sm truncate ${
                isTotalRow ? 'text-[#074766] font-black' : 'font-semibold text-slate-800'
              }`}
            >
              {title}
            </span>
          </div>
          <div className="text-right shrink-0">
            <div
              className={`font-mono text-xs sm:text-sm ${
                isTotalRow
                  ? 'font-black text-sm sm:text-base text-[#074766]'
                  : 'font-bold text-slate-900'
              }`}
            >
              {valB || '—'}
            </div>
            {subB && (
              <div className="text-[11px] font-medium text-sky-800 leading-tight mt-0.5">
                {subB}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="monthly-comparison" className="monthly-comparison-container space-y-6">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#052636] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-500/50 animate-bounce text-xs sm:text-sm font-semibold">
          <Check className="w-5 h-5 text-sky-400 shrink-0" />
          <span>
            {isNp
              ? 'प्रतिवेदन तुलनाको लिंक क्लिपबोर्डमा कपी गरियो!'
              : 'Direct comparison link copied to clipboard!'}
          </span>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#0981ae]" />
              <span>{isNp ? 'प्रतिवेदन साझेदारी गर्नुहोस्' : 'Share Financial Report'}</span>
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {isNp
                ? 'तपाईं यो लिंक मार्फत अंकुर सहकारीको आधिकारिक वित्तीय प्रतिवेदन तुलना अरूलाई पठाउन सक्नुहुन्छ:'
                : 'Share this link to directly view this certified financial report comparison:'}
            </p>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-800 break-all border border-slate-200 select-all mb-4">
              {window.location.origin}/?page=institutional-profile&monthA={selectedAId}&monthB={selectedBId}
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

      {/* Top Toolbar: Language + Share + Copy + Print */}
      <div className="no-print bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0981ae]" />
            <span>
              {isNp
                ? 'अंकुर बचत तथा ऋण सहकारी संस्था — आधिकारिक मासिक विवरण'
                : 'Ankur Saving & Credit Cooperative — Certified Monthly Profile'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Language Switcher */}
          <div className="inline-flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleToggleLang('np')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isNp
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="नेपालीमा हेर्नुहोस्"
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
            title={isNp ? 'साझेदारी गर्नुहोस्' : 'Share Comparison'}
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
            className="px-3.5 py-2 bg-gradient-to-r from-[#074766] to-[#0981ae] hover:from-[#052636] hover:to-[#07678d] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
            title={isNp ? 'प्रिन्ट वा PDF सुरक्षित गर्नुहोस्' : 'Print or Export PDF'}
          >
            <Printer className="w-3.5 h-3.5 text-sky-200" />
            <span>{isNp ? 'Print / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
       * 1. BLUE FILTER CONTAINER (Matching Cooperative Blue Theme)
       * ========================================================= */}
      <div className="no-print rounded-2xl border border-slate-300 overflow-hidden shadow-xs bg-white">
        {/* Dark Blue Banner Header */}
        <div className="bg-gradient-to-r from-[#072f42] via-[#074766] to-[#0981ae] text-white px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-5 h-5 text-sky-300 shrink-0" />
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              {isNp ? 'महिनागत आर्थिक विवरण' : 'Monthly Financial Statements'}
            </h3>
          </div>
          <span className="text-xs text-sky-100 font-medium">
            {isNp
              ? 'पूर्वनिर्धारित: हालका २ महिना — अरू फिल्टरबाट'
              : 'Default: Latest 2 Months — Or select filters'}
          </span>
        </div>

        {/* Filter Controls Body */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/50">
          {/* Row 1: Dropdown Fiscal Year + Dropdown Month + Search + Reset + Result Count */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
            {/* Fiscal Year Dropdown */}
            <div className="relative min-w-[150px] shrink-0">
              <select
                value={selectedFiscalYear}
                onChange={(e) => {
                  setSelectedFiscalYear(e.target.value);
                  setActiveQuickFilter('custom');
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0981ae] cursor-pointer appearance-none pr-8"
              >
                <option value="all">{isNp ? 'सबै आ.व.' : 'All Fiscal Years'}</option>
                {fiscalYearOptions.map((fy) => (
                  <option key={fy} value={fy}>
                    {formatFiscalYear(fy, isNp)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Nepali Month Dropdown */}
            <div className="relative min-w-[160px] shrink-0">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setActiveQuickFilter('custom');
                }}
                className="w-full bg-white border border-[#0981ae] ring-1 ring-[#0981ae] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0981ae] cursor-pointer appearance-none pr-8"
              >
                <option value="all">{isNp ? 'सबै महिना' : 'All Months'}</option>
                <option value="annual">{isNp ? 'वार्षिक / कुल' : 'Annual / Cumulative'}</option>
                {ALL_NEPALI_MONTHS.map((m) => (
                  <option key={m.np} value={m.np}>
                    {isNp ? m.np : m.en}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#0981ae] absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Search Input Field */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveQuickFilter('custom');
                }}
                placeholder={
                  isNp
                    ? 'आ.व., महिना वा संकेतक खोज्नुहोस्'
                    : 'Search fiscal year, month, or indicator...'
                }
                className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-2xs shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isNp ? 'रिसेट' : 'Reset'}</span>
            </button>

            {/* Result Count Badge */}
            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 shrink-0 text-center font-mono">
              {isNp
                ? `${toNepaliDigits(displayCount)} / ${toNepaliDigits(totalCount)} देखाइयो`
                : `${displayCount} / ${totalCount} Shown`}
            </div>
          </div>

          {/* Row 2: Quick-select month buttons (Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none flex-wrap">
            {/* हालका २ */}
            <button
              type="button"
              onClick={() => handleQuickFilter('latest2')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeQuickFilter === 'latest2'
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0981ae] hover:text-[#0981ae]'
              }`}
            >
              {isNp ? 'हालका २' : 'Latest 2'}
            </button>

            {/* सबै */}
            <button
              type="button"
              onClick={() => handleQuickFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeQuickFilter === 'all'
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0981ae] hover:text-[#0981ae]'
              }`}
            >
              {isNp ? 'सबै' : 'All'}
            </button>

            {/* अहिलेको • असोज */}
            {currentReport && (
              <button
                type="button"
                onClick={() => handleQuickFilter('current')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeQuickFilter === 'current'
                    ? 'bg-[#0981ae] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0981ae] hover:text-[#0981ae]'
                }`}
              >
                {isNp
                  ? `अहिलेको • ${currentReport.monthNp}`
                  : `Current • ${formatMonthName(currentReport.monthNp, currentReport.monthEn, false)}`}
              </button>
            )}

            {/* अघिल्लो • भदौ */}
            {previousReport && (
              <button
                type="button"
                onClick={() => handleQuickFilter('previous')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeQuickFilter === 'previous'
                    ? 'bg-[#0981ae] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0981ae] hover:text-[#0981ae]'
                }`}
              >
                {isNp
                  ? `अघिल्लो • ${previousReport.monthNp}`
                  : `Previous • ${formatMonthName(previousReport.monthNp, previousReport.monthEn, false)}`}
              </button>
            )}

            {/* Available Months Pills (जेठ, असार, श्रावण, etc.) */}
            {distinctMonths.map((m) => {
              const isSelected = activeQuickFilter === m;
              const displayLabel = isNp ? m : formatMonthName(m, null, false);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleQuickFilter(m)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0981ae] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0981ae] hover:text-[#0981ae]'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
       * 2. DUAL-PERIOD COMPARISON CARDS
       * ========================================================= */}
      <div className="print-area bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Period Dropdown Selectors on Top of Cards */}
        <div className="no-print p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Month A Picker */}
          <div className="md:col-span-5 flex items-center gap-2">
            <span className="text-xs font-bold text-[#074766] shrink-0">
              {isNp ? 'बायाँ महिना (Month A):' : 'Left Period (Month A):'}
            </span>
            <select
              value={selectedAId}
              onChange={(e) => setSelectedAId(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0981ae] cursor-pointer"
            >
              {publishedReports.map((rep) => (
                <option key={`card-a-${rep.id}`} value={rep.id}>
                  {formatMonthName(rep.monthNp, rep.monthEn, isNp)} {formatFiscalYear(rep.fiscalYear, isNp)} ({formatDate(rep.reportDateNp, isNp, rep.reportDateEn)})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              title={isNp ? 'महिना साटासाट गर्नुहोस्' : 'Swap months'}
              className="w-8 h-8 rounded-full bg-white hover:bg-sky-50 text-[#0981ae] border border-slate-300 hover:border-[#0981ae] flex items-center justify-center transition shadow-2xs cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month B Picker */}
          <div className="md:col-span-5 flex items-center gap-2">
            <span className="text-xs font-bold text-[#074766] shrink-0">
              {isNp ? 'दायाँ महिना (Month B):' : 'Right Period (Month B):'}
            </span>
            <select
              value={selectedBId}
              onChange={(e) => setSelectedBId(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0981ae] cursor-pointer"
            >
              {publishedReports.map((rep) => (
                <option key={`card-b-${rep.id}`} value={rep.id}>
                  {formatMonthName(rep.monthNp, rep.monthEn, isNp)} {formatFiscalYear(rep.fiscalYear, isNp)} ({formatDate(rep.reportDateNp, isNp, rep.reportDateEn)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Period Headers matching the exact image */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-[#f0f7fa] border-b border-slate-200">
          {/* Header Month A */}
          <div className="p-4 sm:p-5">
            <h4 className="text-lg sm:text-xl font-black text-[#074766] tracking-tight">
              {formatFiscalYear(monthA.fiscalYear, isNp)}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#0981ae]" />
                <span>{formatMonthName(monthA.monthNp, monthA.monthEn, isNp)}</span>
              </span>
            </div>
            <div className="mt-1.5 text-xs font-mono font-medium text-slate-500">
              {formatDate(monthA.reportDateNp, isNp, monthA.reportDateEn)}
            </div>
          </div>

          {/* Header Month B */}
          <div className="p-4 sm:p-5">
            <h4 className="text-lg sm:text-xl font-black text-[#074766] tracking-tight">
              {formatFiscalYear(monthB.fiscalYear, isNp)}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#0981ae]" />
                <span>{formatMonthName(monthB.monthNp, monthB.monthEn, isNp)}</span>
              </span>
            </div>
            <div className="mt-1.5 text-xs font-mono font-medium text-slate-500">
              {formatDate(monthB.reportDateNp, isNp, monthB.reportDateEn)}
            </div>
          </div>
        </div>

        {/* Table Column Sub-Headers: No. (क्र.सं.), Particulars, Amount / Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-100/90 border-b border-slate-200 text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
          {/* Month A Column Header */}
          <div className="flex items-center justify-between p-2.5 sm:px-4 sm:py-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-6 sm:w-7 text-center font-bold text-slate-700">
                {isNp ? 'क्र.सं.' : 'No.'}
              </span>
              <span className="text-slate-700">
                {isNp ? 'वित्तीय परिसूचक विवरण' : 'Financial Statement Particulars'}
              </span>
            </div>
            <span className="text-right text-slate-700 font-semibold">
              {isNp ? 'रकम / स्थिति' : 'Amount / Status'}
            </span>
          </div>

          {/* Month B Column Header */}
          <div className="flex items-center justify-between p-2.5 sm:px-4 sm:py-2.5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-6 sm:w-7 text-center font-bold text-slate-700">
                {isNp ? 'क्र.सं.' : 'No.'}
              </span>
              <span className="text-slate-700">
                {isNp ? 'वित्तीय परिसूचक विवरण' : 'Financial Statement Particulars'}
              </span>
            </div>
            <span className="text-right text-slate-700 font-semibold">
              {isNp ? 'रकम / स्थिति' : 'Amount / Status'}
            </span>
          </div>
        </div>

        {/* 10 Rows with exact icons, values, and sub-stats */}
        <div>
          {/* Row 1: Total Members */}
          {renderRow(
            '१',
            '1',
            Users,
            'text-slate-600',
            'कुल सदस्य',
            'Total Members',
            formatMemberCount(monthA.totalMembers, isNp),
            null,
            formatMemberCount(monthB.totalMembers, isNp),
            null
          )}

          {/* Row 2: Share Capital */}
          {renderRow(
            '२',
            '2',
            Coins,
            'text-slate-600',
            'शेयर पूँजी',
            'Share Capital',
            formatCurrencyAmount(monthA.shareCapital, isNp),
            shareCapitalGrowthA.text,
            formatCurrencyAmount(monthB.shareCapital, isNp),
            shareCapitalGrowthB.text
          )}

          {/* Row 3: Reserve Fund */}
          {renderRow(
            '३',
            '3',
            Shield,
            'text-slate-600',
            'जगेडा कोष',
            'Reserve Fund',
            formatCurrencyAmount(monthA.reserveFund, isNp),
            reserveFundGrowthA.text,
            formatCurrencyAmount(monthB.reserveFund, isNp),
            reserveFundGrowthB.text
          )}

          {/* Row 4: Total Institutional Capital */}
          {renderRow(
            '४',
            '4',
            Building2,
            'text-slate-600',
            'कुल संस्थागत पूँजी',
            'Total Institutional Capital',
            formatCurrencyAmount(monthA.totalInstitutionalCapital, isNp),
            formatSubNote(monthA.totalInstitutionalCapitalNote || 'जगेडा + अन्य', isNp),
            formatCurrencyAmount(monthB.totalInstitutionalCapital, isNp),
            formatSubNote(monthB.totalInstitutionalCapitalNote || 'जगेडा + अन्य', isNp)
          )}

          {/* Row 5: Other Funds */}
          {renderRow(
            '५',
            '5',
            Layers,
            'text-slate-600',
            'अन्य कोष',
            'Other Funds',
            formatCurrencyAmount(monthA.otherFunds, isNp),
            null,
            formatCurrencyAmount(monthB.otherFunds, isNp),
            null
          )}

          {/* Row 6: Total Savings */}
          {renderRow(
            '६',
            '6',
            PiggyBank,
            'text-slate-600',
            'कुल बचत',
            'Total Savings Deposit',
            formatCurrencyAmount(monthA.totalSavings, isNp),
            totalSavingsGrowthA.text,
            formatCurrencyAmount(monthB.totalSavings, isNp),
            totalSavingsGrowthB.text
          )}

          {/* Row 7: Loans Disbursed */}
          {renderRow(
            '७',
            '7',
            Banknote,
            'text-slate-600',
            'लगानीमा रहेको ऋण',
            'Loans & Advances Outgoing',
            formatCurrencyAmount(monthA.loansDisbursed, isNp),
            formatMemberCount(monthA.borrowerMembersCount || '10380', isNp, true),
            formatCurrencyAmount(monthB.loansDisbursed, isNp),
            formatMemberCount(monthB.borrowerMembersCount || '11309', isNp, true)
          )}

          {/* Row 8: Liquidity (Bank & Cash) */}
          {renderRow(
            '८',
            '8',
            Wallet,
            'text-slate-600',
            'तरलता (बैंक तथा नगद)',
            'Liquidity (Cash & Bank)',
            formatCurrencyAmount(monthA.liquidityAmount, isNp),
            baseFormatPercent(monthA.liquidityPercent || '27.56%', currentLang),
            formatCurrencyAmount(monthB.liquidityAmount, isNp),
            baseFormatPercent(monthB.liquidityPercent || '27.79%', currentLang)
          )}

          {/* Row 9: Fixed Assets */}
          {renderRow(
            '९',
            '9',
            Landmark,
            'text-slate-600',
            'स्थिर सम्पत्ति',
            'Fixed Assets & Property',
            formatCurrencyAmount(monthA.fixedAssets, isNp),
            null,
            formatCurrencyAmount(monthB.fixedAssets, isNp),
            null
          )}

          {/* Row 10: Total Assets */}
          {renderRow(
            '१०',
            '10',
            Building2,
            'text-[#074766]',
            'कुल सम्पत्ति',
            'Total Assets (Audited Balance Sheet)',
            formatCurrencyAmount(monthA.totalAssets, isNp),
            null,
            formatCurrencyAmount(monthB.totalAssets, isNp),
            null,
            true
          )}
        </div>

        {/* Bottom Financial Indicators Row: NPL, NPA, Liq badges for each month */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-900 text-white p-3 sm:p-4">
          {/* Month A Indicators */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 p-2">
            <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider mr-1">
              {formatMonthName(monthA.monthNp, monthA.monthEn, isNp)} {isNp ? 'परिसूचक:' : 'KPIs:'}
            </span>
            {monthA.nplPercent && (
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-sky-300 font-mono">
                {formatKpiBadge(monthA.nplPercent, 'npl', currentLang)}
              </span>
            )}
            {monthA.npaPercent && (
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-amber-300 font-mono">
                {formatKpiBadge(monthA.npaPercent, 'npa', currentLang)}
              </span>
            )}
            {monthA.liqPercentBadge && (
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-cyan-300 font-mono">
                {formatKpiBadge(monthA.liqPercentBadge, 'liq', currentLang)}
              </span>
            )}
          </div>

          {/* Month B Indicators */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 p-2">
            <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider mr-1">
              {formatMonthName(monthB.monthNp, monthB.monthEn, isNp)} {isNp ? 'परिसूचक:' : 'KPIs:'}
            </span>
            {monthB.nplPercent && (
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-sky-300 font-mono">
                {formatKpiBadge(monthB.nplPercent, 'npl', currentLang)}
              </span>
            )}
            {monthB.npaPercent && (
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-amber-300 font-mono">
                {formatKpiBadge(monthB.npaPercent, 'npa', currentLang)}
              </span>
            )}
            {monthB.liqPercentBadge && (
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-cyan-300 font-mono">
                {formatKpiBadge(monthB.liqPercentBadge, 'liq', currentLang)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
