import React, { useState, useEffect } from 'react';
import { Language, InterestRate, NoticeItem } from '../types';
import { INTEREST_RATES, NOTICES_DATA, TRANSLATIONS } from '../data/cooperativeData';

interface RatesAndNoticesProps {
  lang: Language;
  rates?: InterestRate[];
  notices?: NoticeItem[];
  onViewNotice?: (notice: NoticeItem) => void;
  onViewAllRates?: () => void;
  onApplyLoan?: (schemeName?: string, amount?: number, tenureMonths?: number) => void;
}

const parseNumericRate = (rateStr?: string, ratePercent?: number): number => {
  if (typeof ratePercent === 'number' && !isNaN(ratePercent) && ratePercent > 0) {
    return ratePercent;
  }
  if (!rateStr) return 12.5;
  const cleaned = String(rateStr).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return !isNaN(parsed) && parsed > 0 ? parsed : 12.5;
};

export const RatesAndNotices: React.FC<RatesAndNoticesProps> = ({
  lang,
  rates = INTEREST_RATES,
  notices = NOTICES_DATA,
  onViewNotice,
  onApplyLoan,
}) => {
  const t = TRANSLATIONS[lang];
  const [rateTab, setRateTab] = useState<'savings' | 'loans' | 'fixed'>('savings');

  // Filter rates by category
  const activeRates = rates && rates.length > 0 ? rates : INTEREST_RATES;

  const loanSchemes = activeRates.filter(
    (r) =>
      r.category?.toLowerCase() === 'loan' ||
      r.schemeEn.toLowerCase().includes('loan') ||
      r.schemeEn.toLowerCase().includes('credit')
  );

  const fixedSchemes = activeRates.filter(
    (r) =>
      r.category?.toLowerCase() === 'fixed' ||
      r.schemeEn.toLowerCase().includes('fixed') ||
      r.schemeEn.toLowerCase().includes('term') ||
      r.schemeEn.toLowerCase().includes('muddati')
  );

  const depositSchemes = activeRates.filter(
    (r) => !loanSchemes.includes(r) && !fixedSchemes.includes(r)
  );

  // EMI Calculator State — Auto-generated interest rate from Admin Login Loan Products
  const defaultLoanProduct = loanSchemes[0] || {
    id: 'default-loan',
    schemeEn: 'Agricultural Productive Loan',
    schemeNp: 'व्यावसायिक कृषि तथा पशुपालन कर्जा',
    rate: '12.00%',
    ratePercent: 12.0,
    period: 'Monthly EMI',
  };

  const [selectedLoanSchemeEn, setSelectedLoanSchemeEn] = useState<string>(
    defaultLoanProduct.schemeEn
  );
  const [loanAmountInput, setLoanAmountInput] = useState<string>('500000');
  const [loanMonthsInput, setLoanMonthsInput] = useState<string>('36');

  // Keep selected loan product valid when Admin updates loan products
  useEffect(() => {
    if (loanSchemes.length > 0) {
      const exists = loanSchemes.some((l) => l.schemeEn === selectedLoanSchemeEn);
      if (!exists) {
        setSelectedLoanSchemeEn(loanSchemes[0].schemeEn);
      }
    }
  }, [rates]);

  const currentLoanProduct =
    loanSchemes.find((l) => l.schemeEn === selectedLoanSchemeEn) ||
    loanSchemes[0] ||
    defaultLoanProduct;

  // Auto-generated interest rate from Admin Login
  const autoInterestRate = parseNumericRate(
    currentLoanProduct?.rate,
    currentLoanProduct?.ratePercent
  );

  const numericLoanAmount = Math.max(0, parseFloat(loanAmountInput) || 0);
  const parsedMonths = parseInt(loanMonthsInput, 10);
  const numericLoanMonths = !isNaN(parsedMonths) && parsedMonths > 0 ? parsedMonths : 0;

  // Calculate Monthly EMI
  const monthlyRate = autoInterestRate / 12 / 100;
  const emi =
    numericLoanAmount > 0 && monthlyRate > 0 && numericLoanMonths > 0
      ? (numericLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numericLoanMonths)) /
        (Math.pow(1 + monthlyRate, numericLoanMonths) - 1)
      : numericLoanAmount > 0 && numericLoanMonths > 0
      ? numericLoanAmount / numericLoanMonths
      : 0;
  const totalPayable = numericLoanMonths > 0 ? emi * numericLoanMonths : 0;
  const totalInterest = Math.max(0, totalPayable - numericLoanAmount);

  const depositAndFixedSchemes = activeRates.filter(
    (r) => !loanSchemes.includes(r)
  );

  return (
    <section className="py-12 md:py-16 bg-slate-50/50 border-b border-slate-200/80" id="rates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 1. LARGE TWO-COLUMN INTEREST RATES SECTION (Savings Left, Loan Right) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0981ae] bg-[#eef8fc] px-3 py-1 rounded-full border border-sky-200/60 mb-2">
                <span>✦</span>
                <span>{t.ratesTag}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.ratesTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.ratesSub}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3.5 py-2 rounded-xl border border-slate-200/70">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>
                {lang === 'en'
                  ? 'Live Synchronized with Admin & NRB Directives'
                  : 'प्रशासन पोर्टल र सहकारी मापदण्ड अनुसार अद्यावधिक'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* LEFT COLUMN: SAVINGS & DEPOSIT INTEREST RATES */}
            <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-b from-[#f8fcfe] to-white flex flex-col justify-between overflow-hidden shadow-2xs">
              <div>
                <div className="px-6 py-4 bg-[#0981ae] text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-lg font-bold border border-white/20">
                      🏦
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                        {lang === 'en' ? 'Savings & Deposit Interest Rates' : 'बचत तथा मुद्दती निक्षेप ब्याजदर'}
                      </h3>
                      <p className="text-[11px] text-sky-100">
                        {lang === 'en'
                          ? 'Daily balance calculation with quarterly interest payout'
                          : 'दैनिक मौज्दातमा गणना र त्रैमासिक ब्याज भुक्तानी'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-lg border border-white/20 shrink-0">
                    {lang === 'en' ? 'Deposits' : 'निक्षेप'}
                  </span>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {depositAndFixedSchemes.map((r) => (
                    <div
                      key={r.id}
                      className="px-6 py-4 hover:bg-sky-50/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {lang === 'en' ? r.schemeEn : r.schemeNp}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                          <span>{lang === 'np' && r.basisNp ? r.basisNp : r.basisEn || r.period}</span>
                          {r.minBalance !== undefined && r.minBalance > 0 && (
                            <span className="text-[11px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                              {lang === 'en'
                                ? `Min: Rs. ${Number(r.minBalance).toLocaleString()}`
                                : `न्यूनतम: रु. ${Number(r.minBalance).toLocaleString()}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-[#eef8fc] text-[#0981ae] border border-[#0981ae]/25 font-mono shadow-2xs">
                          {r.rate.includes('%') ? r.rate : `${r.rate}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-sky-50/60 border-t border-sky-200/70 flex items-center justify-between gap-3 text-xs text-slate-600">
                <span>
                  {lang === 'en'
                    ? '✓ Tax-deductible returns as per Cooperative Act'
                    : '✓ सहकारी ऐन अनुसार सुरक्षित तथा आकर्षक प्रतिफल'}
                </span>
                <span className="font-bold text-[#0981ae]">
                  {lang === 'en' ? 'Up to 11.75% p.a.' : 'अधिकतम ११.७५% सम्म'}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: LOAN INTEREST RATES + APPLY FOR LOAN BUTTON AT BOTTOM */}
            <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-b from-[#fffdf9] to-white flex flex-col justify-between overflow-hidden shadow-2xs">
              <div>
                <div className="px-6 py-4 bg-gradient-to-r from-[#065371] to-[#0981ae] text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-lg font-bold border border-white/20">
                      💼
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                        {lang === 'en' ? 'Loan & Credit Interest Rates' : 'कर्जा तथा सापटी ब्याजदर'}
                      </h3>
                      <p className="text-[11px] text-sky-100">
                        {lang === 'en'
                          ? 'Diminishing balance EMI calculation with transparent processing'
                          : 'घट्दो मौज्दात (Diminishing Balance) मा आधारित सहुलियत कर्जा'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-300/30 shrink-0">
                    {lang === 'en' ? 'Loans' : 'कर्जा'}
                  </span>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {loanSchemes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onApplyLoan && onApplyLoan(r.schemeEn)}
                      title={lang === 'en' ? 'Click to apply for this loan product' : 'यो कर्जाको लागि आवेदन दिन क्लिक गर्नुहोस्'}
                      className="px-6 py-4 hover:bg-amber-50/50 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 group-hover:text-[#0981ae] transition-colors text-sm sm:text-base leading-snug flex items-center gap-2">
                          <span>{lang === 'en' ? r.schemeEn : r.schemeNp}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {lang === 'np' && r.basisNp ? r.basisNp : r.basisEn || r.period}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2.5">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-amber-50 text-amber-900 border border-amber-300/80 font-mono shadow-2xs">
                          {r.rate.includes('%') ? r.rate : `${r.rate}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLEAR APPLY FOR LOAN BUTTON / LINK AT THE BOTTOM OF THE LOAN SECTION */}
              <div className="px-6 py-4 bg-gradient-to-r from-sky-50 via-sky-50/70 to-amber-50/60 border-t border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                    {lang === 'en'
                      ? 'Ready to apply for a cooperative loan?'
                      : 'सहुलियत ब्याजदरमा कर्जा सुविधा लिन चाहनुहुन्छ?'}
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {lang === 'en'
                      ? 'Click below to open the online Loan Application Form.'
                      : 'अनलाइन कर्जा आवेदन फाराम भर्न तलको बटनमा क्लिक गर्नुहोस्।'}
                  </span>
                </div>
                <button
                  id="btn-rates-apply-loan"
                  type="button"
                  onClick={() =>
                    onApplyLoan &&
                    onApplyLoan(loanSchemes[0]?.schemeEn)
                  }
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>📝</span>
                  <span>{lang === 'en' ? 'Apply for Loan' : 'कर्जा आवेदन दिनुहोस् (Apply for Loan)'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. EMI CALCULATOR (LEFT 7 COLS) & NOTICE BOARD (RIGHT 5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">

            {/* 2. Clean EMI Calculator (User Input Loan Amount + Auto-Generated Interest from Admin Login) */}
            <div
              id="calculator"
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6"
            >
              <div className="mb-5 pb-4 border-b border-slate-100">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0981ae] bg-[#eef8fc] px-2.5 py-1 rounded-md mb-1">
                  {t.calcTag}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{t.calcTitle}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? 'Select a loan product, enter your desired loan amount, and calculate monthly EMI with interest rates automatically synced from Admin.'
                    : 'कर्जा योजना छान्नुहोस् र आफुलाई चाहिने कर्जा रकम प्रविष्ट गरी मासिक किस्ता (EMI) गणना गर्नुहोस्।'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Input Controls */}
                <div className="md:col-span-7 space-y-4">
                  {/* Loan Product Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Select Loan Product / Scheme' : 'कर्जा योजना छान्नुहोस्'}
                    </label>
                    <select
                      id="emi-loan-product-select"
                      value={selectedLoanSchemeEn}
                      onChange={(e) => setSelectedLoanSchemeEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#0981ae] focus:ring-2 focus:ring-[#0981ae]/15"
                    >
                      {loanSchemes.map((scheme) => (
                        <option key={scheme.id} value={scheme.schemeEn}>
                          {lang === 'en' ? scheme.schemeEn : scheme.schemeNp} ({scheme.rate})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Direct User Input for Loan Amount (No Spinner Buttons) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Enter Loan Amount (NPR)' : 'कर्जा रकम प्रविष्ट गर्नुहोस् (रु.)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        Rs.
                      </span>
                      <input
                        id="emi-loan-amount-input"
                        type="text"
                        inputMode="numeric"
                        value={loanAmountInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setLoanAmountInput(val);
                        }}
                        placeholder="e.g. 500000"
                        className="no-spinner w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0981ae] focus:ring-2 focus:ring-[#0981ae]/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* Auto-Generated Interest Rate from Admin + Tenure Input (No Spinner Buttons) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'en'
                          ? 'Interest Rate (% p.a.)'
                          : 'वार्षिक ब्याजदर (%)'}
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#0981ae]">
                          {autoInterestRate.toFixed(2)}% p.a.
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                          {lang === 'en' ? 'Admin Rate' : 'निर्धारित दर'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'en'
                          ? 'Loan Tenure (Months)'
                          : 'भुक्तानी अवधि (महिना)'}
                      </label>
                      <input
                        id="emi-loan-tenure-input"
                        type="text"
                        inputMode="numeric"
                        value={loanMonthsInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setLoanMonthsInput(val);
                        }}
                        placeholder="e.g. 36"
                        className="no-spinner w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 bg-white focus:outline-none focus:border-[#0981ae] focus:ring-2 focus:ring-[#0981ae]/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Clean Result Summary & Apply Button */}
                <div className="md:col-span-5 bg-[#0981ae] text-white rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-sky-200 block">
                      {t.monthlyEmi}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                      Rs. {Math.round(emi).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/15 text-xs">
                    <div className="flex justify-between">
                      <span className="text-sky-100/80">
                        {lang === 'en' ? 'Principal Amount' : 'साँवा रकम'}
                      </span>
                      <span className="font-bold">
                        Rs. {Math.round(numericLoanAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sky-100/80">
                        {lang === 'en' ? 'Interest Rate' : 'ब्याजदर'}
                      </span>
                      <span className="font-bold">{autoInterestRate.toFixed(2)}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sky-100/80">{t.totalInterest}</span>
                      <span className="font-bold">
                        Rs. {Math.round(totalInterest).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-white/15">
                      <span className="text-sky-100 font-semibold">{t.totalPayable}</span>
                      <span className="font-extrabold text-[#fbbf24]">
                        Rs. {Math.round(totalPayable).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    id="btn-emi-apply-loan"
                    type="button"
                    onClick={() =>
                      onApplyLoan &&
                      onApplyLoan(
                        currentLoanProduct.schemeEn,
                        numericLoanAmount > 0 ? numericLoanAmount : 500000,
                        numericLoanMonths
                      )
                    }
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-[#0981ae] hover:bg-sky-50 font-bold text-xs transition shadow-sm cursor-pointer text-center"
                  >
                    {lang === 'en' ? 'Apply for Loan →' : 'ऋणको लागि आवेदन दिनुहोस् →'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: NOTICE BOARD */}
          <div className="lg:col-span-5">
            <div
              id="notices"
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#b45309] bg-amber-50 px-2.5 py-1 rounded-md mb-1.5 border border-amber-200/60">
                    {t.noticesTag}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{t.noticesTitle}</h2>
                </div>
                <span className="w-9 h-9 rounded-xl bg-[#eef8fc] text-[#0981ae] flex items-center justify-center text-lg">
                  📢
                </span>
              </div>

              <div className="divide-y divide-slate-200/70">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onViewNotice && onViewNotice(n)}
                    className="p-5 hover:bg-slate-50/90 transition-colors flex gap-4 items-start group cursor-pointer"
                  >
                    {/* Date Box */}
                    <div className="w-14 h-14 rounded-xl bg-[#eef8fc] border border-[#0981ae]/20 flex flex-col items-center justify-center flex-shrink-0 text-[#0981ae] group-hover:bg-[#0981ae] group-hover:text-white transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                        {n.month}
                      </span>
                      <span className="text-lg font-extrabold leading-tight mt-0.5">
                        {n.day}
                      </span>
                    </div>

                    {/* Notice Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {n.category}
                        </span>
                        <span className="text-[11px] text-slate-400">{n.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0981ae] transition-colors leading-snug mb-1">
                        {lang === 'en' ? n.titleEn : n.titleNp}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {lang === 'en' ? n.contentEn : n.contentNp}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-[#0981ae] group-hover:translate-x-0.5 transition-transform">
                        {lang === 'en' ? 'Read Official Notice →' : 'पूर्ण सूचना पढ्नुहोस् →'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200/80 text-center">
                <button
                  type="button"
                  onClick={() =>
                    notices.length > 0 && onViewNotice && onViewNotice(notices[0])
                  }
                  className="text-xs font-bold text-[#0981ae] hover:text-[#07678d] inline-flex items-center gap-1 cursor-pointer"
                >
                  {t.viewAllNotices} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
