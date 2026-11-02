import React from 'react';
import { EkymFormData, Language } from '../../types';
import {
  User,
  MapPin,
  Building2,
  Wallet,
  ArrowLeftRight,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface Step6PreviewProps {
  data: EkymFormData;
  onEditStep: (stepNumber: number) => void;
  certified: boolean;
  onCertifiedChange: (checked: boolean) => void;
  certifiedError?: string;
  lang: Language;
}

export const Step6Preview: React.FC<Step6PreviewProps> = ({
  data,
  onEditStep,
  certified,
  onCertifiedChange,
  certifiedError,
  lang,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0981ae]" />
            <span>{lang === 'np' ? '६. आवेदन पूर्वावलोकन तथा प्रमाणिकरण' : '6. Review & Application Verification'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'np'
              ? 'कृपया पेश गर्न लागिएको सम्पूर्ण विवरण राम्रोसँग जाँच गर्नुहोस्। कुनै संशोधन गर्नु परेमा सम्बन्धित खण्डको "Edit" बटन थिच्नुहोस्।'
              : 'Review your complete entered details thoroughly before final submission. Click "Edit" on any section to make adjustments.'}
          </p>
        </div>

        <span className="bg-sky-100 text-[#0981ae] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Ready for Review</span>
        </span>
      </div>

      {/* Section 1: Personal Information Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <User className="w-4 h-4 text-[#0981ae]" />
            <span>1. {lang === 'np' ? 'व्यक्तिगत विवरण' : 'Personal Information'}</span>
            <span className="text-[11px] font-normal text-slate-500">({data.membershipType})</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-xs text-[#0981ae] hover:text-[#07678d] font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'सच्याउनुहोस्' : 'Edit'}</span>
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Full Name (English)</span>
            <strong className="text-slate-800">{data.fullNameEn || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">पूरा नाम (नेपाली)</span>
            <strong className="text-slate-800">{data.fullNameNp || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Date of Birth</span>
            <strong className="text-slate-800">{data.dob || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Gender</span>
            <strong className="text-slate-800">{data.gender || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ID Type & Number</span>
            <strong className="text-slate-800">{data.idType}: {data.citizenshipNo || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Issued District & Date</span>
            <strong className="text-slate-800">{data.citizenshipDistrict} ({data.citizenshipIssueDate})</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Father's Name</span>
            <strong className="text-slate-800">{data.fatherName || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Mother's Name</span>
            <strong className="text-slate-800">{data.motherName || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Grandfather's Name</span>
            <strong className="text-slate-900 font-bold flex items-center gap-1">
              <span>{data.grandfatherName || '-'}</span>
              <span className="text-[9px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-semibold">Mandatory</span>
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Marital Status</span>
            <strong className="text-slate-800">{data.maritalStatus} {data.spouseName ? `(Spouse: ${data.spouseName})` : ''}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Education</span>
            <strong className="text-slate-800">{data.education || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Occupation</span>
            <strong className="text-slate-800">{data.occupation || '-'}</strong>
          </div>
        </div>

        {/* Uploaded Documents Thumbnails in Preview */}
        <div className="border-t border-slate-100 bg-slate-50/60 p-3.5">
          <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>{lang === 'np' ? 'अपलोड गरिएका अनिवार्य कागजातहरू' : 'Uploaded Identification Documents & Photo'}</span>
            <span className="text-[10px] text-sky-700 font-semibold bg-sky-100/70 px-2 py-0.5 rounded">
              Verified 3/3
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Photo */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2.5">
              {data.memberPhoto ? (
                <img src={data.memberPhoto} alt="Member Photo" className="w-12 h-12 object-cover rounded border border-sky-300" />
              ) : (
                <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-[10px] text-red-500 font-bold">Missing</div>
              )}
              <div className="text-[11px] overflow-hidden">
                <strong className="block text-slate-800 truncate">Applicant Photo</strong>
                <span className="text-[10px] text-sky-600 font-medium">Portrait Ready</span>
              </div>
            </div>
            {/* Front */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2.5">
              {data.citizenshipFront ? (
                <img src={data.citizenshipFront} alt="Citizenship Front" className="w-16 h-12 object-cover rounded border border-sky-300" />
              ) : (
                <div className="w-16 h-12 rounded bg-slate-100 flex items-center justify-center text-[10px] text-red-500 font-bold">Missing</div>
              )}
              <div className="text-[11px] overflow-hidden">
                <strong className="block text-slate-800 truncate">Citizenship (Front)</strong>
                <span className="text-[10px] text-sky-600 font-medium">Front Page Ready</span>
              </div>
            </div>
            {/* Back */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2.5">
              {data.citizenshipBack ? (
                <img src={data.citizenshipBack} alt="Citizenship Back" className="w-16 h-12 object-cover rounded border border-sky-300" />
              ) : (
                <div className="w-16 h-12 rounded bg-slate-100 flex items-center justify-center text-[10px] text-red-500 font-bold">Missing</div>
              )}
              <div className="text-[11px] overflow-hidden">
                <strong className="block text-slate-800 truncate">Citizenship (Back)</strong>
                <span className="text-[10px] text-sky-600 font-medium">Back Page Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Address Information Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <MapPin className="w-4 h-4 text-[#0981ae]" />
            <span>2. {lang === 'np' ? 'ठेगाना तथा सम्पर्क' : 'Address & Contact Information'}</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-xs text-[#0981ae] hover:text-[#07678d] font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'सच्याउनुहोस्' : 'Edit'}</span>
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Permanent Address (स्थायी)</span>
            <strong className="text-slate-800">
              {data.permTole ? `${data.permTole}, ` : ''}Ward {data.permWard}, {data.permMunicipality}, {data.permDistrict}, {data.permProvince}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Current Address (हालको)</span>
            <strong className="text-slate-800">
              {data.sameAsPermanent
                ? 'Same as Permanent Address'
                : `${data.tempTole ? `${data.tempTole}, ` : ''}Ward ${data.tempWard}, ${data.tempMunicipality}, ${data.tempDistrict}, ${data.tempProvince}`}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Mobile & Email</span>
            <strong className="text-slate-800 block">{data.mobile}</strong>
            <span className="text-slate-600 text-[11px]">{data.email}</span>
          </div>

          {data.emergencyContactPerson && (
            <div>
              <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
              <strong className="text-slate-800">{data.emergencyContactPerson} {data.emergencyContactPhone ? `(${data.emergencyContactPhone})` : ''}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Corporate/Business Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Building2 className="w-4 h-4 text-[#0981ae]" />
            <span>3. {lang === 'np' ? 'संस्था तथा व्यवसाय' : 'Corporate / Business Particulars'}</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-xs text-[#0981ae] hover:text-[#07678d] font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'सच्याउनुहोस्' : 'Edit'}</span>
          </button>
        </div>

        <div className="p-4 text-xs">
          {data.hasBusiness === 'Yes' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Business Name</span>
                <strong className="text-slate-800">{data.businessName || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Legal Entity Form</span>
                <strong className="text-slate-800">{data.businessType || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Regd. No. & Authority</span>
                <strong className="text-slate-800">{data.registrationNo} ({data.registeredAuthority})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">PAN/VAT Number</span>
                <strong className="text-slate-800 font-mono">{data.panVatNumber || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Designation & Role</span>
                <strong className="text-slate-800">{data.designationInFirm || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Line of Business</span>
                <strong className="text-slate-800">{data.natureOfBusiness || '-'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Operating Location</span>
                <strong className="text-slate-800">{data.businessAddress || '-'}</strong>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 italic">
              {lang === 'np'
                ? 'लागू हुँदैन (व्यक्तिगत सदस्य वर्ग मात्र)'
                : 'Not Applicable (Registered as Individual Member)'}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Income Information Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Wallet className="w-4 h-4 text-[#0981ae]" />
            <span>4. {lang === 'np' ? 'आम्दानी तथा बैंक विवरण' : 'Income & Bank Account'}</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="text-xs text-[#0981ae] hover:text-[#07678d] font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'सच्याउनुहोस्' : 'Edit'}</span>
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Primary Income Source</span>
            <strong className="text-slate-800">{data.primaryIncomeSource}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Monthly Earnings</span>
            <strong className="text-slate-800">{data.estimatedMonthlyIncome}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Annual Earnings</span>
            <strong className="text-slate-800">{data.estimatedAnnualIncome}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Taxpayer Status</span>
            <strong className="text-slate-800">{data.taxPayerCategory}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block text-[11px]">Payout Bank & Branch</span>
            <strong className="text-slate-800">{data.bankName} - {data.bankBranch}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block text-[11px]">Bank Account No. & Name</span>
            <strong className="text-slate-800 font-mono">{data.bankAccountNo} ({data.bankAccountName})</strong>
          </div>
        </div>
      </div>

      {/* Section 5: Transaction & Nominee Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ArrowLeftRight className="w-4 h-4 text-[#0981ae]" />
            <span>5. {lang === 'np' ? 'कारोबार तथा इच्छाएको व्यक्ति' : 'Transactions & Nominee'}</span>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(5)}
            className="text-xs text-[#0981ae] hover:text-[#07678d] font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{lang === 'np' ? 'सच्याउनुहोस्' : 'Edit'}</span>
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Preferred Branch</span>
            <strong className="text-slate-800">{data.preferredBranch}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Savings Scheme</span>
            <strong className="text-slate-800">{data.accountTypeInterest}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Expected Monthly Deposit</span>
            <strong className="text-slate-800">{data.expectedMonthlyDeposit}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Expected Annual Turnover</span>
            <strong className="text-slate-800">{data.expectedAnnualTurnover}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block text-[11px]">Nominee Details</span>
            <strong className="text-slate-800">
              {data.nomineeName} ({data.nomineeRelation})
              {data.nomineeCitizenship ? ` - ID: ${data.nomineeCitizenship}` : ''}
              {data.nomineeContact ? ` - Phone: ${data.nomineeContact}` : ''}
            </strong>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block text-[11px]">Digital Services Opted</span>
            <strong className="text-sky-700">
              {data.digitalBankingOptIn ? '✓ Smart Mobile App & QR' : ''}
              {data.digitalBankingOptIn && data.smsAlertOptIn ? ' | ' : ''}
              {data.smsAlertOptIn ? '✓ SMS Alerts' : ''}
            </strong>
          </div>
        </div>
      </div>

      {/* Statutory Legal Declaration */}
      <div className={`p-4 rounded-xl border transition ${
        certifiedError ? 'bg-red-50 border-red-300' : 'bg-amber-50/70 border-amber-300/80'
      }`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => onCertifiedChange(e.target.checked)}
            className="accent-[#0981ae] w-4 h-4 mt-0.5"
          />
          <div className="text-xs text-slate-800 leading-relaxed">
            <strong className="block text-slate-900 mb-1">
              {lang === 'np'
                ? 'कानुनी उद्घोषणा तथा स्व-घोषणा (Mandatory Statutory Declaration):'
                : 'Mandatory Legal Certification under Nepal Cooperative Act 2074:'}
            </strong>
            <span>
              {lang === 'np'
                ? 'म यसै फारामद्वारा सपथपूर्वक उद्घोष गर्दछु कि माथि उल्लिखित सम्पूर्ण व्यक्तिगत, पारिवारिक, ठेगाना, व्यवसाय, आय तथा कारोबार सम्बन्धी विवरणहरू मेरो जानकारी र विश्वासमा सत्य, पूर्ण र आधिकारिक छन्। कुनै विवरण असत्य वा गैरकानुनी ठहरिएमा कानुन बमोजिमको दायित्व व्यहोर्न म मञ्जुर छु।'
                : 'I hereby solemnly affirm that all personal, residential, corporate, financial, and nominee particulars stated above are true, complete, and correct to the best of my knowledge. I authorize Ankur Saving & Credit Cooperative Ltd. to verify these records in compliance with regulatory KYC standards.'}
            </span>
          </div>
        </label>

        {certifiedError && (
          <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{certifiedError}</span>
          </p>
        )}
      </div>
    </div>
  );
};
