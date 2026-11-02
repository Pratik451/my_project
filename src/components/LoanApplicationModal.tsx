import React, { useState, useEffect } from 'react';
import { Language, InterestRate, LoanRecord, SiteSettingsCMS, ServiceCenterCMS } from '../types';
import { INTEREST_RATES } from '../data/cooperativeData';
import { INITIAL_CMS_SERVICE_CENTERS } from '../data/cmsInitialData';
import { NEPAL_PROVINCE_OPTIONS, getDistrictsByProvince } from '../data/nepalProvincesDistricts';
import { submitLoanApplicationApi } from '../services/cooperativeApi';
import {
  PrintableLoanDocument,
  downloadLoanApplicationDossier,
} from './PrintableLoanDocument';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Printer,
  Download,
  PhoneCall,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  rates?: InterestRate[];
  serviceCenters?: ServiceCenterCMS[];
  initialScheme?: string;
  initialAmount?: number;
  initialTenure?: number;
  cmsSettings?: SiteSettingsCMS;
  onSuccess?: (record: LoanRecord) => void;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLanguageChange,
  rates,
  serviceCenters,
  initialScheme,
  cmsSettings,
  onSuccess,
}) => {
  const isNp = lang === 'np';

  const activeRates = Array.isArray(rates) && rates.length > 0 ? rates : INTEREST_RATES;
  const loanProducts = activeRates.filter(
    (r) =>
      (r.category || '').toLowerCase() === 'loan' ||
      r.schemeEn.toLowerCase().includes('loan') ||
      r.schemeEn.toLowerCase().includes('credit')
  );

  const activeBranches =
    Array.isArray(serviceCenters) && serviceCenters.length > 0
      ? serviceCenters
      : INITIAL_CMS_SERVICE_CENTERS;

  const parseNumericRate = (rateStr: string, ratePercent?: number): number => {
    if (typeof ratePercent === 'number' && !isNaN(ratePercent) && ratePercent > 0) {
      return ratePercent;
    }
    const cleaned = String(rateStr || '').replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return !isNaN(parsed) && parsed > 0 ? parsed : 12.5;
  };

  // Strict Ordered Form Fields:
  // 1. Name*
  // 2. Email
  // 3. Phone*
  // 4. Current Address*
  // 5. Province*
  // 6. District* (dynamically filtered by Province)
  // 7. Branch*
  // 8. Loan Type*
  // 9. Income Source*
  // 10. Loan From Other Bank* (Yes/No)
  // 11. Message
  const [applicantName, setApplicantName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [loanType, setLoanType] = useState<string>('');
  const [incomeSource, setIncomeSource] = useState<string>('');
  const [loanFromOtherBank, setLoanFromOtherBank] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submittedRecord, setSubmittedRecord] = useState<LoanRecord | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Sync initialScheme when full-window form opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSubmittedRecord(null);
      setIsPrintModalOpen(false);

      if (initialScheme) {
        const found = loanProducts.find(
          (p) =>
            p.schemeEn.toLowerCase() === initialScheme.toLowerCase() ||
            p.schemeNp === initialScheme ||
            initialScheme.toLowerCase().includes(p.schemeEn.toLowerCase()) ||
            p.schemeEn.toLowerCase().includes(initialScheme.toLowerCase())
        );
        if (found) {
          setLoanType(found.schemeEn);
        } else {
          setLoanType(initialScheme);
        }
      }
    }
  }, [isOpen, initialScheme, rates]);

  // Prevent background body scroll while full-window view is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamically filtered districts based on selected Province
  const availableDistricts = province ? getDistrictsByProvince(province) : [];

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    setDistrict('');
  };

  const selectedProductObj = loanProducts.find((p) => p.schemeEn === loanType);
  const selectedInterestRate = selectedProductObj
    ? parseNumericRate(selectedProductObj.rate, selectedProductObj.ratePercent)
    : 12.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applicantName.trim()) {
      setErrorMsg(isNp ? 'कृपया आफ्नो नाम लेख्नुहोस्।' : 'Please enter your Name.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      setErrorMsg(isNp ? 'कृपया मान्य फोन नम्बर प्रविष्ट गर्नुहोस्।' : 'Please enter a valid Phone number.');
      return;
    }
    if (!currentAddress.trim()) {
      setErrorMsg(isNp ? 'कृपया हालको ठेगाना लेख्नुहोस्।' : 'Please enter your Current Address.');
      return;
    }
    if (!province) {
      setErrorMsg(isNp ? 'कृपया प्रदेश छान्नुहोस्।' : 'Please select a Province.');
      return;
    }
    if (!district) {
      setErrorMsg(isNp ? 'कृपया जिल्ला छान्नुहोस्।' : 'Please select a District.');
      return;
    }
    if (!branch) {
      setErrorMsg(isNp ? 'कृपया शाखा छान्नुहोस्।' : 'Please select a Branch.');
      return;
    }
    if (!loanType) {
      setErrorMsg(isNp ? 'कृपया कर्जाको प्रकार छान्नुहोस्।' : 'Please select your Loan Type.');
      return;
    }
    if (!incomeSource) {
      setErrorMsg(isNp ? 'कृपया आम्दानीको स्रोत छान्नुहोस्।' : 'Please select your Income Source.');
      return;
    }
    if (!loanFromOtherBank) {
      setErrorMsg(
        isNp
          ? 'कृपया अन्य बैंकबाट ऋण लिएको छ/छैन छान्नुहोस्।'
          : 'Please select whether you have a Loan From Other Bank.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${currentAddress.trim()}, ${district}, ${province}`;
      const combinedPurpose = message.trim()
        ? `${message.trim()} | Loan From Other Bank: ${loanFromOtherBank}`
        : `Loan From Other Bank: ${loanFromOtherBank}`;

      const created = await submitLoanApplicationApi({
        applicantName: applicantName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: fullAddress,
        province,
        district,
        branch,
        occupation: incomeSource,
        collateralType: `Loan From Other Bank: ${loanFromOtherBank}`,
        loanScheme: loanType,
        interestRate: selectedInterestRate,
        amount: 0,
        tenureMonths: 12,
        monthlyIncome: 0,
        purpose: combinedPurpose,
        details: {
          name: applicantName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          currentAddress: currentAddress.trim(),
          province,
          district,
          branch,
          loanType,
          incomeSource,
          loanFromOtherBank,
          message: message.trim(),
        },
      });

      const createdRecord: LoanRecord = created.data || {
        id: `loan-${Date.now()}`,
        trackingCode: created.trackingCode,
        applicantName: applicantName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: fullAddress,
        province,
        district,
        branch,
        occupation: incomeSource,
        collateralType: `Loan From Other Bank: ${loanFromOtherBank}`,
        loanScheme: loanType,
        interestRate: selectedInterestRate,
        amount: 0,
        tenureMonths: 12,
        monthlyIncome: 0,
        purpose: combinedPurpose,
        status: 'Under Review',
        appliedDate: new Date().toISOString().substring(0, 10),
      };

      setSubmittedRecord(createdRecord);
      if (onSuccess) {
        onSuccess(createdRecord);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit loan application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTracking = () => {
    if (!submittedRecord) return;
    navigator.clipboard.writeText(submittedRecord.trackingCode);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div
      id="loan-application-full-window"
      className="fixed inset-0 z-50 w-screen h-screen overflow-y-auto bg-[#f4f9fc] flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Institutional Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0c2d3e] text-white border-b border-sky-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {cmsSettings?.coopLogoUrl ? (
              <img
                key={cmsSettings.coopLogoUrl}
                src={cmsSettings.coopLogoUrl}
                alt={cmsSettings?.coopNameEn || 'Ankur Cooperative'}
                className="h-10 w-auto object-contain bg-white rounded-lg p-1"
              />
            ) : null}
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                {isNp
                  ? cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.'
                  : cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.'}
              </h1>
              <p className="text-[11px] text-sky-200 hidden sm:block">
                {isNp
                  ? 'अनलाइन कर्जा आवेदन पोर्टल • बुटवल-४, रुपन्देही'
                  : 'Online Loan Application Portal • Butwal-4, Rupandehi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onLanguageChange && (
              <div className="flex items-center bg-sky-950/80 p-1 rounded-lg border border-sky-700/60 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => onLanguageChange('np')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    lang === 'np' ? 'bg-[#0981ae] text-white' : 'text-sky-200 hover:text-white'
                  }`}
                >
                  NP
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    lang === 'en' ? 'bg-[#0981ae] text-white' : 'text-sky-200 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-sky-50 text-[#0c2d3e] font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isNp ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Website'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Width Page Title Banner matching the reference design */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#b91c1c] uppercase">
              {isNp ? 'APPLY FOR LOAN (कर्जा आवेदन फाराम)' : 'APPLY FOR LOAN'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isNp
                ? 'तलको फाराममा आफ्नो सही विवरण भरी कर्जा आवेदन पेश गर्नुहोस्।'
                : 'Complete the form below and our credit department will contact you directly.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            <PhoneCall className="w-4 h-4 text-[#0981ae] shrink-0" />
            <div>
              <span className="block text-[11px] text-slate-400 font-semibold">
                {isNp ? 'कर्जा सहायता डेस्क' : 'Loan Support Desk'}
              </span>
              <strong className="text-slate-800 font-bold">
                {cmsSettings?.phoneHeadOffice || '071-540123 / 540456'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Window Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {submittedRecord ? (
          /* Full-Window Confirmation View (eKYM Step 7 style) */
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-sky-600 to-[#0981ae] text-white p-6 sm:p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black mb-1">
                {isNp
                  ? 'कर्जा आवेदन सफलतापूर्वक दर्ता भयो!'
                  : 'Loan Application Submitted Successfully!'}
              </h2>
              <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
                {isNp
                  ? 'तपाईंको अनलाइन कर्जा आवेदन अंकुर बचत तथा ऋण सहकारी संस्थाको केन्द्रीय प्रणालीमा सुरक्षित रूपमा दर्ता भएको छ। तपाईंले तलको बटनबाट आधिकारिक फाराम डाउनलोड वा प्रिन्ट गर्न सक्नुहुन्छ।'
                  : 'Your online loan application has been officially recorded in the Ankur Cooperative Central Credit Registry. You can download or print your official application form below.'}
              </p>
            </div>

            {/* Official Reference Slip Card */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#0981ae] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {isNp
                      ? 'Official Loan Tracking Reference (कर्जा आवेदन दर्ता नं.)'
                      : 'Official Loan Tracking Reference Number'}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-[#0981ae] tracking-tight">
                      {submittedRecord.trackingCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTracking}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0981ae] text-xs font-bold flex items-center gap-1.5 border border-sky-200 transition cursor-pointer"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>
                        {copiedTracking
                          ? isNp
                            ? 'कपी भयो'
                            : 'Copied!'
                          : isNp
                          ? 'कोड कपी गर्नुहोस्'
                          : 'Copy Code'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>{submittedRecord.status || 'Under Review'}</span>
                  </span>
                  <span className="block text-[11px] text-slate-500 font-mono mt-1">
                    {isNp ? 'दर्ता मिति:' : 'Submitted:'} {submittedRecord.appliedDate}
                  </span>
                </div>
              </div>

              {/* Submitted Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '१. नाम (Name)' : '1. Applicant Name'}</span>
                  <strong className="text-slate-900 text-sm">{submittedRecord.applicantName}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '२. इमेल (Email)' : '2. Email Address'}</span>
                  <strong className="text-slate-900 text-sm">{submittedRecord.email || email || '—'}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '३. फोन नं. (Phone)' : '3. Phone Number'}</span>
                  <strong className="text-slate-900 text-sm font-mono">{submittedRecord.phone}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '४. हालको ठेगाना (Current Address)' : '4. Current Address'}</span>
                  <strong className="text-slate-900 text-sm">{currentAddress || submittedRecord.address}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '५. प्रदेश (Province)' : '5. Province'}</span>
                  <strong className="text-slate-900 text-sm">{submittedRecord.province || province}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '६. जिल्ला (District)' : '6. District'}</span>
                  <strong className="text-slate-900 text-sm">{submittedRecord.district || district}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '७. शाखा (Branch)' : '7. Branch'}</span>
                  <strong className="text-slate-900 text-sm">{submittedRecord.branch || branch}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '८. कर्जाको प्रकार (Loan Type)' : '8. Loan Type'}</span>
                  <strong className="text-[#0981ae] text-sm">{submittedRecord.loanScheme}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '९. आम्दानीको स्रोत (Income Source)' : '9. Income Source'}</span>
                  <strong className="text-slate-900 text-sm">{submittedRecord.occupation || incomeSource}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">
                    {isNp ? '१०. अन्य बैंकबाट कर्जा (Loan From Other Bank)' : '10. Loan From Other Bank'}
                  </span>
                  <strong className="text-slate-900 text-sm">{loanFromOtherBank || 'No'}</strong>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">{isNp ? '११. सन्देश (Message)' : '11. Message'}</span>
                  <strong className="text-slate-900 text-sm">{message || '—'}</strong>
                </div>
              </div>
            </div>

            {/* Download & Print Action Bar (Matching eKYM Step7Success) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="btn-user-print-loan-pdf"
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>
                    {isNp
                      ? 'आधिकारिक कर्जा फाराम (PDF) प्रिन्ट / हेर्नुहोस्'
                      : 'Print / View Official Loan Form (PDF)'}
                  </span>
                </button>

                <button
                  id="btn-user-download-loan-file"
                  type="button"
                  onClick={() =>
                    downloadLoanApplicationDossier(
                      submittedRecord,
                      cmsSettings?.coopLogoUrl || ''
                    )
                  }
                  className="px-5 py-3 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isNp
                      ? 'कर्जा फाराम डाउनलोड गर्नुहोस् (Download Form)'
                      : 'Download Loan Application Form'}
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRecord(null);
                    setApplicantName('');
                    setEmail('');
                    setPhone('');
                    setCurrentAddress('');
                    setProvince('');
                    setDistrict('');
                    setBranch('');
                    setLoanType('');
                    setIncomeSource('');
                    setLoanFromOtherBank('');
                    setMessage('');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isNp ? 'नयाँ आवेदन भर्नुहोस्' : 'Submit Another Application'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                >
                  {isNp ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Website'}
                </button>
              </div>
            </div>

            {/* Official Printable Loan Document Modal (Same as eKYM) */}
            <PrintableLoanDocument
              record={submittedRecord}
              isOpen={isPrintModalOpen}
              onClose={() => setIsPrintModalOpen(false)}
              coopLogoUrl={cmsSettings?.coopLogoUrl || ''}
            />
          </div>
        ) : (
          /* Full-Window Form Container matching the user's reference layout */
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 sm:p-12 lg:p-14">
            <div className="mb-8 pb-5 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                {isNp
                  ? 'Get Us to Call You Back (हामीलाई कल व्याकको लागि विवरण पठाउनुहोस्)'
                  : 'Get Us to Call You Back'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                &quot;<span className="text-red-600 font-bold">*</span>&quot;{' '}
                {isNp ? 'indicates required fields (अनिवार्य भर्नुपर्ने विवरण)' : 'indicates required fields'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-8 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7 max-w-3xl">
              {/* 1. Name* — text input */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'NAME (नाम)' : 'NAME'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder={isNp ? 'आफ्नो पूरा नाम लेख्नुहोस्' : 'Enter your full name'}
                  className="w-full h-12 px-4 border border-slate-300 rounded-none bg-white text-sm sm:text-base text-slate-900 focus:border-slate-800 focus:outline-none transition"
                />
              </div>

              {/* 2. Email — email input */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'EMAIL (इमेल)' : 'EMAIL'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isNp ? 'example@email.com (ऐच्छिक)' : 'example@email.com'}
                  className="w-full h-12 px-4 border border-slate-300 rounded-none bg-white text-sm sm:text-base text-slate-900 focus:border-slate-800 focus:outline-none transition"
                />
              </div>

              {/* 3. Phone* — phone input */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'PHONE (फोन नम्बर)' : 'PHONE'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isNp ? '९८XXXXXXXX' : '98XXXXXXXX'}
                  className="w-full h-12 px-4 border border-slate-300 rounded-none bg-white text-sm sm:text-base text-slate-900 focus:border-slate-800 focus:outline-none transition"
                />
              </div>

              {/* 4. Current Address* — text input */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'CURRENT ADDRESS (हालको ठेगाना)' : 'CURRENT ADDRESS'} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  placeholder={isNp ? 'टोल, वडा नं., नगरपालिका/गाउँपालिका' : 'Street/Tole, Ward No., Municipality'}
                  className="w-full h-12 px-4 border border-slate-300 rounded-none bg-white text-sm sm:text-base text-slate-900 focus:border-slate-800 focus:outline-none transition"
                />
              </div>

              {/* 5. Province* — dropdown */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'PROVINCE (प्रदेश)' : 'PROVINCE'} <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-none bg-white text-sm sm:text-base font-semibold text-slate-900 focus:border-slate-800 focus:outline-none transition"
                >
                  <option value="">{isNp ? 'Select Province (प्रदेश छान्नुहोस्)' : 'Select Province'}</option>
                  {NEPAL_PROVINCE_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. District* — dropdown, dynamically filtered according to the selected Province */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'DISTRICT (जिल्ला)' : 'DISTRICT'} <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!province}
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-none bg-white text-sm sm:text-base font-semibold text-slate-900 focus:border-slate-800 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 transition"
                >
                  <option value="">
                    {province
                      ? isNp
                        ? 'Select District (जिल्ला छान्नुहोस्)'
                        : 'Select District'
                      : isNp
                      ? 'Select Province First (पहिला प्रदेश छान्नुहोस्)'
                      : 'Select Province First'}
                  </option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7. Branch* — dropdown */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'BRANCH (शाखा)' : 'BRANCH'} <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-none bg-white text-sm sm:text-base font-semibold text-slate-900 focus:border-slate-800 focus:outline-none transition"
                >
                  <option value="">{isNp ? 'Select Branch (शाखा छान्नुहोस्)' : 'Select Branch'}</option>
                  {activeBranches.map((sc) => (
                    <option key={sc.id} value={sc.nameEn}>
                      {isNp ? `${sc.nameNp} (${sc.nameEn})` : sc.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Loan Type* — dropdown with available loan products/types */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'LOAN TYPE (कर्जाको प्रकार)' : 'LOAN TYPE'} <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-none bg-white text-sm sm:text-base font-semibold text-slate-900 focus:border-slate-800 focus:outline-none transition"
                >
                  <option value="">
                    {isNp ? 'Select Your Loan Type (कर्जाको प्रकार छान्नुहोस्)' : 'Select Your Loan Type'}
                  </option>
                  {loanProducts.map((p) => (
                    <option key={p.id || p.schemeEn} value={p.schemeEn}>
                      {isNp ? `${p.schemeNp} — ${p.schemeEn} (${p.rate})` : `${p.schemeEn} (${p.rate})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* 9. Income Source* — dropdown */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'INCOME SOURCE (आम्दानीको स्रोत)' : 'INCOME SOURCE'} <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-none bg-white text-sm sm:text-base font-semibold text-slate-900 focus:border-slate-800 focus:outline-none transition"
                >
                  <option value="">
                    {isNp ? 'Select Income Source (आम्दानीको स्रोत छान्नुहोस्)' : 'Select Income Source'}
                  </option>
                  <option value="Business / Enterprise">
                    {isNp ? 'व्यापार / व्यवसाय (Business / Enterprise)' : 'Business / Enterprise'}
                  </option>
                  <option value="Agriculture & Livestock">
                    {isNp ? 'कृषि तथा पशुपालन (Agriculture & Livestock)' : 'Agriculture & Livestock'}
                  </option>
                  <option value="Salary / Employment">
                    {isNp ? 'जागिर / रोजगारी (Salary / Employment)' : 'Salary / Employment'}
                  </option>
                  <option value="Self-Employed / Professional">
                    {isNp ? 'स्वरोजगार / पेशा (Self-Employed / Professional)' : 'Self-Employed / Professional'}
                  </option>
                  <option value="Foreign Employment / Remittance">
                    {isNp ? 'वैदेशिक रोजगार / रेमिट्यान्स (Foreign Employment / Remittance)' : 'Foreign Employment / Remittance'}
                  </option>
                  <option value="Rental / Other Income">
                    {isNp ? 'घरभाडा / अन्य आम्दानी (Rental / Other Income)' : 'Rental / Other Income'}
                  </option>
                </select>
              </div>

              {/* 10. Loan From Other Bank* — dropdown such as Yes/No */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'LOAN FROM OTHER BANK (अन्य बैंकबाट कर्जा)' : 'LOAN FROM OTHER BANK'}{' '}
                  <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={loanFromOtherBank}
                  onChange={(e) => setLoanFromOtherBank(e.target.value)}
                  className="w-full h-12 px-3.5 border border-slate-300 rounded-none bg-white text-sm sm:text-base font-semibold text-slate-900 focus:border-slate-800 focus:outline-none transition"
                >
                  <option value="">
                    {isNp ? 'Select Option (छनोट गर्नुहोस्)' : 'Select Option'}
                  </option>
                  <option value="No">{isNp ? 'No (छैन)' : 'No'}</option>
                  <option value="Yes">{isNp ? 'Yes (छ)' : 'Yes'}</option>
                </select>
              </div>

              {/* 11. Message — textarea */}
              <div className="max-w-4xl">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">
                  {isNp ? 'MESSAGE (सन्देश)' : 'MESSAGE'}
                </label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isNp
                      ? 'कर्जा सम्बन्धी थप जानकारी वा सन्देश भए यहाँ लेख्नुहोस्...'
                      : 'Write any additional details or message regarding your loan inquiry...'
                  }
                  className="w-full p-4 border border-slate-300 rounded-none bg-white text-sm sm:text-base text-slate-900 focus:border-slate-800 focus:outline-none resize-y transition"
                />
              </div>

              {/* 12. Submit Application button */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  id="btn-submit-loan-application"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-sm sm:text-base uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isNp ? 'पेश हुँदैछ...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <span>{isNp ? 'Submit Application (आवेदन पेश गर्नुहोस्)' : 'Submit Application'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition cursor-pointer"
                >
                  {isNp ? 'रद्द गर्नुहोस् (Cancel)' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Subtle Full-Window Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0981ae]" />
            <span>
              {isNp
                ? 'अंकुर बचत तथा ऋण सहकारी संस्था लि. • सुरक्षित अनलाइन कर्जा आवेदन प्रणाली'
                : 'Ankur Saving & Credit Cooperative Ltd. • Secure Online Loan Application Portal'}
            </span>
          </div>
          <span>© {new Date().getFullYear()} Ankur Cooperative</span>
        </div>
      </footer>
    </div>
  );
};
