import React, { useState, useRef } from 'react';
import {
  PhoneCall,
  FileText,
  Receipt,
  Smartphone,
  Laptop,
  Bell,
  CreditCard,
  QrCode,
  Banknote,
  TrendingUp,
  Headphones,
  ChevronRight,
  Send,
  User,
  Mail,
  Paperclip,
  Check,
  Copy,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Language } from '../types';

interface DigitalSectionProps {
  lang: Language;
  onExplore?: () => void;
  onOpenEkym?: () => void;
}

export interface AvailableServiceCard {
  id: string;
  titleEn: string;
  titleNp: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DIGITAL_SERVICES_LIST: AvailableServiceCard[] = [
  {
    id: 'missed-call-banking',
    titleEn: 'Missed Call Banking',
    titleNp: 'मिस्ड कल बैंकिङ',
    icon: PhoneCall,
  },
  {
    id: 'statement-request',
    titleEn: 'Statement Request',
    titleNp: 'स्टेटमेन्ट अनुरोध',
    icon: FileText,
  },
  {
    id: 'bill-payment-support',
    titleEn: 'Bill Payment Support',
    titleNp: 'महसुल भुक्तानी सहायता',
    icon: Receipt,
  },
  {
    id: 'mobile-recharge-request',
    titleEn: 'Mobile Recharge Request',
    titleNp: 'मोबाइल रिचार्ज अनुरोध',
    icon: Smartphone,
  },
  {
    id: 'internet-mobile-banking',
    titleEn: 'Internet/Mobile Banking',
    titleNp: 'इन्टरनेट / मोबाइल बैंकिङ',
    icon: Laptop,
  },
  {
    id: 'sms-alert-service',
    titleEn: 'SMS Alert Service',
    titleNp: 'एसएमएस अलर्ट सेवा',
    icon: Bell,
  },
  {
    id: 'card-service',
    titleEn: 'Card Service',
    titleNp: 'कार्ड सेवा',
    icon: CreditCard,
  },
  {
    id: 'qr-digital-payment',
    titleEn: 'QR / Digital Payment',
    titleNp: 'क्युआर / डिजिटल भुक्तानी',
    icon: QrCode,
  },
  {
    id: 'share-refund',
    titleEn: 'Share Refund',
    titleNp: 'सेयर फिर्ता अनुरोध',
    icon: Banknote,
  },
  {
    id: 'share-increase',
    titleEn: 'Share Increase',
    titleNp: 'सेयर वृद्धि अनुरोध',
    icon: TrendingUp,
  },
  {
    id: 'other-digital-service',
    titleEn: 'Other Digital Service',
    titleNp: 'अन्य डिजिटल सेवा',
    icon: Headphones,
  },
];

export const DigitalSection: React.FC<DigitalSectionProps> = ({ lang }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields matching reference screenshots
  const [isMember, setIsMember] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [memberNo, setMemberNo] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('Missed Call Banking');
  const [accountNo, setAccountNo] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [preferredContact, setPreferredContact] = useState<string>('Phone Call');

  // Attachment handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<boolean>(false);

  // Handle card click -> auto-select that service and scroll smoothly to form
  const handleCardClick = (serviceTitleEn: string) => {
    setServiceType(serviceTitleEn);
    setSubmittedData(null);
    setTimeout(() => {
      if (formRef.current) {
        const yOffset = -80;
        const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 60);
  };

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert(lang === 'np' ? 'फाइलको आकार १५ एमबीभन्दा कम हुनुपर्दछ।' : 'File size must be under 15MB.');
      return;
    }

    setSelectedFile(file);
    setAttachmentName(file.name);
    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/digital-service-requests/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAttachmentUrl(data.url);
      }
    } catch (err) {
      console.warn('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = () => {
    setSelectedFile(null);
    setAttachmentName('');
    setAttachmentUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = lang === 'np' ? 'कृपया आफ्नो पूरा नाम लेख्नुहोस्।' : 'Full Name is required.';
    }

    if (!mobileNumber.trim()) {
      errors.mobileNumber = lang === 'np' ? 'कृपया मोबाइल नम्बर लेख्नुहोस्।' : 'Mobile Number is required.';
    } else if (!/^[0-9+ -]{7,15}$/.test(mobileNumber.trim())) {
      errors.mobileNumber = lang === 'np' ? 'मान्य मोबाइल नम्बर लेख्नुहोस्।' : 'Please enter a valid mobile number.';
    }

    if (!emailAddress.trim()) {
      errors.emailAddress = lang === 'np' ? 'कृपया इमेल ठेगाना लेख्नुहोस्।' : 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim())) {
      errors.emailAddress = lang === 'np' ? 'मान्य इमेल ठेगाना लेख्नुहोस्।' : 'Please enter a valid email address.';
    }

    if (!serviceType || serviceType === 'Select a service...') {
      errors.serviceType = lang === 'np' ? 'कृपया सेवाको प्रकार छनोट गर्नुहोस्।' : 'Please select a service type.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        is_member: isMember ? 1 : 0,
        full_name: fullName.trim(),
        member_no: memberNo.trim(),
        mobile_number: mobileNumber.trim(),
        email_address: emailAddress.trim(),
        service_type: serviceType,
        account_no: accountNo.trim(),
        additional_details: additionalDetails.trim(),
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        preferred_contact: preferredContact,
      };

      const res = await fetch('/api/digital-service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedData({
          ...data.request,
          tracking_id: data.tracking_id || data.request?.tracking_id,
        });
        if (formRef.current) {
          const yOffset = -80;
          const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        alert(data.message || 'Submission failed. Please check your details.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(lang === 'np' ? 'अनुरोध पेश गर्न सकिएन।' : 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingId = (id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedTrackingId(true);
      setTimeout(() => setCopiedTrackingId(false), 2500);
    }
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    setFormErrors({});
    setSelectedFile(null);
    setAttachmentName('');
    setAttachmentUrl('');
    setAdditionalDetails('');
    setAccountNo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section
      id="digital-services"
      className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#f4f7f6] text-slate-800 transition-colors duration-300 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* SECTION HEADER (MATCHING image_032feecd.png, BLUE THEME)  */}
        {/* ========================================================= */}
        <div className="mb-8 text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#074766] tracking-tight leading-tight">
            {lang === 'np' ? 'उपलब्ध डिजिटल सेवाहरू' : 'Available Digital Services'}
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base font-normal">
            {lang === 'np'
              ? 'कुनै पनि कार्डमा क्लिक गरेर सम्बन्धित सेवाको लागि फाराममा जानुहोस्।'
              : 'Click any card to jump to the request form for that service.'}
          </p>
        </div>

        {/* ========================================================= */}
        {/* 11 AVAILABLE DIGITAL SERVICES CARDS GRID                  */}
        {/* Matching reference screenshot image_032feecd.png          */}
        {/* Blue theme matching logo and headings                     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-14">
          {DIGITAL_SERVICES_LIST.map((service) => {
            const IconComponent = service.icon;
            const isSelected = serviceType === service.titleEn;

            return (
              <div
                key={service.id}
                onClick={() => handleCardClick(service.titleEn)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(service.titleEn);
                  }
                }}
                className={`group bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all duration-200 border text-left shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-[#074766] ring-2 ring-[#074766]/20 bg-sky-50/30'
                    : 'border-slate-200/90 hover:border-[#074766]'
                }`}
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#074766] text-white'
                        : 'bg-[#e0f2fe] text-[#074766] group-hover:bg-[#074766] group-hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span
                    className={`font-bold text-sm sm:text-base truncate transition-colors ${
                      isSelected
                        ? 'text-[#074766]'
                        : 'text-slate-800 group-hover:text-[#074766]'
                    }`}
                  >
                    {lang === 'np' ? service.titleNp : service.titleEn}
                  </span>
                </div>
                <ChevronRight
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isSelected
                      ? 'text-[#074766] translate-x-1'
                      : 'text-slate-400 group-hover:text-[#074766] group-hover:translate-x-1'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* DIGITAL SERVICE REQUEST FORM                              */}
        {/* Matching reference images with Navy Blue accents          */}
        {/* ========================================================= */}
        <div ref={formRef} className="max-w-4xl mx-auto">
          {submittedData ? (
            /* Submission Success State */
            <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-xl p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#074766] text-white flex items-center justify-center mx-auto mb-6 shadow-md shadow-sky-900/20">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#074766] tracking-tight">
                {lang === 'np' ? 'डिजिटल सेवा अनुरोध सफलतापूर्वक पेश भयो!' : 'Digital Service Request Submitted!'}
              </h3>
              <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
                {lang === 'np'
                  ? 'तपाईंको अनुरोध हाम्रो शाखा अधिकृतद्वारा प्राप्त भएको छ। कृपया तल दिइएको ट्र्याकिङ कोड सुरक्षित राख्नुहोस्।'
                  : 'Your request has been received by our digital banking desk. Please save your Tracking ID for follow-up.'}
              </p>

              {/* Unique Tracking ID Box */}
              <div className="mt-8 bg-sky-50 border border-sky-200 rounded-2xl p-6 max-w-md mx-auto text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[#074766] block mb-1">
                  {lang === 'np' ? 'तपाईंको ट्र्याकिङ आइडी (Tracking ID)' : 'Your Tracking ID'}
                </span>
                <div className="flex items-center justify-between gap-3 bg-white border border-sky-300 rounded-xl px-4 py-3">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#074766] tracking-wider select-all">
                    {submittedData.tracking_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTrackingId(submittedData.tracking_id)}
                    className="bg-[#074766] hover:bg-[#05354d] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                  >
                    {copiedTrackingId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTrackingId ? (lang === 'np' ? 'कपि भयो!' : 'Copied!') : (lang === 'np' ? 'कपि गर्नुहोस्' : 'Copy')}</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {lang === 'np' ? 'अनुरोध गरिएको सेवा:' : 'Requested Service:'}
                    </span>
                    <span className="font-medium text-slate-900">{submittedData.service_type}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {lang === 'np' ? 'स्थिति (Status):' : 'Status:'}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                      Pending Review
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {lang === 'np' ? 'आवेदकको नाम:' : 'Applicant Name:'}
                    </span>
                    <span className="font-medium text-slate-900">{submittedData.full_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">
                      {lang === 'np' ? 'सम्पर्क नम्बर:' : 'Contact:'}
                    </span>
                    <span className="font-medium text-slate-900">{submittedData.mobile_number}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto bg-[#074766] hover:bg-[#05354d] text-white font-bold px-6 py-3 rounded-xl transition duration-200 cursor-pointer shadow-md"
                >
                  {lang === 'np' ? 'नयाँ अनुरोध पेश गर्नुहोस्' : 'Submit Another Request'}
                </button>
              </div>
            </div>
          ) : (
            /* Active Form Container */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10">
              {/* Form Title Banner */}
              <div className="bg-[#f0f7fa] border border-sky-100 rounded-xl p-4 sm:p-5 mb-8">
                <div className="flex items-center gap-2.5 text-[#074766] font-bold text-lg sm:text-xl">
                  <Send className="w-5 h-5" />
                  <span>
                    {lang === 'np' ? 'डिजिटल सेवा अनुरोध फाराम' : 'Digital Service Request Form'}
                  </span>
                </div>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm pl-7.5">
                  {lang === 'np'
                    ? 'कृपया तलका विवरणहरू भर्नुहोस्। पेश गरेपछि तपाईंले ट्र्याकिङ कोड प्राप्त गर्नुहुनेछ।'
                    : 'Fill in the details below. You will receive a Tracking ID on submission.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Are you a cooperative member? */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                    {lang === 'np' ? 'के तपाईं सहकारीको सदस्य हुनुहुन्छ?' : 'Are you a cooperative member?'}
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Option: No */}
                    <button
                      type="button"
                      onClick={() => setIsMember(false)}
                      className={`px-4 py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                        !isMember
                          ? 'border-[#074766] bg-sky-50 text-[#074766] shadow-2xs'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          !isMember ? 'border-[#074766] bg-[#074766]' : 'border-slate-400 bg-white'
                        }`}
                      >
                        {!isMember && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span>{lang === 'np' ? 'होइन (No)' : 'No'}</span>
                    </button>

                    {/* Option: Yes */}
                    <button
                      type="button"
                      onClick={() => setIsMember(true)}
                      className={`px-4 py-2.5 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                        isMember
                          ? 'border-[#074766] bg-sky-50 text-[#074766] shadow-2xs'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isMember ? 'border-[#074766] bg-[#074766]' : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isMember && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span>
                        {lang === 'np'
                          ? 'हो (Member ID + email + mobile = KYC)'
                          : 'Yes (Member ID + email + mobile = KYC)'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Personal Information Section */}
                <div>
                  <div className="flex items-center gap-2 text-[#074766] font-bold text-base sm:text-lg mb-4 border-b border-slate-100 pb-2">
                    <User className="w-5 h-5 text-[#074766]" />
                    <span>{lang === 'np' ? 'व्यक्तिगत विवरण (Personal Information)' : 'Personal Information'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'पूरा नाम' : 'Full Name'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder=""
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#074766]/20 ${
                          formErrors.fullName ? 'border-red-500' : 'border-slate-300 focus:border-[#074766]'
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Member No. (optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'सदस्य नम्बर' : 'Member No.'}{' '}
                        <span className="text-slate-400 font-normal">({lang === 'np' ? 'ऐच्छिक' : 'optional'})</span>
                      </label>
                      <input
                        type="text"
                        value={memberNo}
                        onChange={(e) => setMemberNo(e.target.value)}
                        placeholder=""
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#074766] focus:ring-2 focus:ring-[#074766]/20"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'मोबाइल नम्बर' : 'Mobile Number'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex rounded-lg shadow-2xs">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                          <Smartphone className="w-4 h-4 text-[#074766]" />
                        </span>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder=""
                          className={`w-full rounded-r-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#074766]/20 ${
                            formErrors.mobileNumber ? 'border-red-500' : 'border-slate-300 focus:border-[#074766]'
                          }`}
                        />
                      </div>
                      {formErrors.mobileNumber && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.mobileNumber}</p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'इमेल ठेगाना' : 'Email Address'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex rounded-lg shadow-2xs">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                          <Mail className="w-4 h-4 text-[#074766]" />
                        </span>
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder=""
                          className={`w-full rounded-r-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#074766]/20 ${
                            formErrors.emailAddress ? 'border-red-500' : 'border-slate-300 focus:border-[#074766]'
                          }`}
                        />
                      </div>
                      {formErrors.emailAddress && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.emailAddress}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Service Details Section */}
                <div>
                  <div className="flex items-center gap-2 text-[#074766] font-bold text-base sm:text-lg mb-4 border-b border-slate-100 pb-2">
                    <Smartphone className="w-5 h-5 text-[#074766]" />
                    <span>{lang === 'np' ? 'सेवा विवरण (Service Details)' : 'Service Details'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Service Type Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'सेवाको प्रकार' : 'Service Type'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#074766]/20 ${
                          formErrors.serviceType
                            ? 'border-red-500'
                            : 'border-[#074766] focus:border-[#074766] font-medium'
                        }`}
                      >
                        <option value="Select a service...">
                          {lang === 'np' ? 'सेवा छनोट गर्नुहोस्...' : 'Select a service...'}
                        </option>
                        {DIGITAL_SERVICES_LIST.map((srv) => (
                          <option key={srv.id} value={srv.titleEn}>
                            {lang === 'np' ? `${srv.titleNp} (${srv.titleEn})` : srv.titleEn}
                          </option>
                        ))}
                      </select>
                      {formErrors.serviceType && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.serviceType}</p>
                      )}
                    </div>

                    {/* Account No. (optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'खाता नम्बर' : 'Account No.'}{' '}
                        <span className="text-slate-400 font-normal">({lang === 'np' ? 'ऐच्छिक' : 'optional'})</span>
                      </label>
                      <input
                        type="text"
                        value={accountNo}
                        onChange={(e) => setAccountNo(e.target.value)}
                        placeholder=""
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#074766] focus:ring-2 focus:ring-[#074766]/20"
                      />
                    </div>

                    {/* Additional Details (Spans 2 cols) */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'थप विवरण' : 'Additional Details'}
                      </label>
                      <textarea
                        rows={3}
                        value={additionalDetails}
                        onChange={(e) => setAdditionalDetails(e.target.value)}
                        placeholder={
                          lang === 'np'
                            ? 'तपाईंको अनुरोधको विस्तृत विवरण लेख्नुहोस्...'
                            : 'Describe your request in detail...'
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#074766] focus:ring-2 focus:ring-[#074766]/20 resize-y"
                      />
                    </div>

                    {/* Attachment (optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'कागजात संलग्न' : 'Attachment'}{' '}
                        <span className="text-slate-400 font-normal">({lang === 'np' ? 'ऐच्छिक' : 'optional'})</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition">
                          <Paperclip className="w-4 h-4 text-[#074766]" />
                          <span>{lang === 'np' ? 'फाइल छनोट' : 'Choose File'}</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">
                          {isUploading
                            ? lang === 'np'
                              ? 'अपलोड हुँदैछ...'
                              : 'Uploading...'
                            : attachmentName || (lang === 'np' ? 'कुनै फाइल छनोट भएन' : 'No file chosen')}
                        </span>
                        {attachmentName && (
                          <button
                            type="button"
                            onClick={removeAttachment}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                            title="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Preferred Contact */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'प्राथमिक सम्पर्क माध्यम' : 'Preferred Contact'}
                      </label>
                      <select
                        value={preferredContact}
                        onChange={(e) => setPreferredContact(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#074766] focus:ring-2 focus:ring-[#074766]/20 font-medium"
                      >
                        <option value="Phone Call">{lang === 'np' ? 'फोन कल (Phone Call)' : 'Phone Call'}</option>
                        <option value="Email">{lang === 'np' ? 'इमेल (Email)' : 'Email'}</option>
                        <option value="SMS">{lang === 'np' ? 'एसएमएस (SMS)' : 'SMS'}</option>
                        <option value="Branch Visit">{lang === 'np' ? 'शाखा कार्यालय भ्रमण (Branch Visit)' : 'Branch Visit'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button (Blue Theme matching heading and cards) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="w-full bg-[#074766] hover:bg-[#05354d] text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? lang === 'np'
                          ? 'अनुरोध पेश हुँदैछ...'
                          : 'Submitting...'
                        : lang === 'np'
                        ? 'डिजिटल सेवा अनुरोध पेश गर्नुहोस्'
                        : 'Submit Digital Service Request'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
