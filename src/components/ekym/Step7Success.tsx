import React, { useState } from 'react';
import { EkymFormData, Language } from '../../types';
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, Home, ExternalLink, FileText } from 'lucide-react';
import { PrintableKymDocument } from './PrintableKymDocument';

interface Step7SuccessProps {
  applicationNo: string;
  data: EkymFormData;
  submittedAt: string;
  onExitToWebsite: () => void;
  onOpenAdmin?: () => void;
  onResetForm: () => void;
  lang: Language;
  coopLogoUrl?: string;
}

export const Step7Success: React.FC<Step7SuccessProps> = ({
  applicationNo,
  data,
  submittedAt,
  onExitToWebsite,
  onOpenAdmin,
  onResetForm,
  lang,
  coopLogoUrl,
}) => {
  const [isFullPrintOpen, setIsFullPrintOpen] = useState(false);

  const handlePrint = () => {
    setIsFullPrintOpen(true);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-[#0981ae] text-white p-6 sm:p-8 rounded-2xl shadow-md text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black mb-1">
          {lang === 'np' ? 'eKYM फाराम सफलतापूर्वक दर्ता भयो!' : 'e-KYM Application Submitted Successfully!'}
        </h2>
        <p className="text-xs sm:text-sm text-sky-100 max-w-lg mx-auto">
          {lang === 'np'
            ? 'तपाईंको विद्युतीय ग्राहक पहिचान (eKYM) फाराम अंकुर बचत तथा ऋण सहकारी संस्थाको केन्द्रीय प्रणालीमा सुरक्षित रूपमा अभिलेखीकरण भएको छ।'
            : 'Your electronic Know Your Member (eKYM) application has been officially recorded in the Ankur Cooperative Central Core Registry.'}
        </p>
      </div>

      {/* Official Reference Slip Card */}
      <div id="ekym-print-slip" className="bg-white rounded-2xl border-2 border-dashed border-[#0981ae] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Official Application Reference Number (आवेदन दर्ता नं.)
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#0981ae] tracking-tight mt-0.5">
              {applicationNo}
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Pending Executive Review</span>
            </span>
            <span className="block text-[11px] text-slate-500 font-mono mt-1">
              Registered: {submittedAt}
            </span>
          </div>
        </div>

        {/* Applicant Summary Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Applicant Full Name</span>
            <strong className="text-slate-900 text-sm">{data.fullNameEn}</strong>
            {data.fullNameNp && <span className="text-slate-500 block text-[11px]">{data.fullNameNp}</span>}
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Mobile Contact</span>
            <strong className="text-slate-900 text-sm">{data.mobile}</strong>
            <span className="text-slate-500 block text-[11px]">{data.email}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Allotted Branch</span>
            <strong className="text-slate-900 text-sm">{data.preferredBranch}</strong>
            <span className="text-slate-500 block text-[11px]">{data.accountTypeInterest}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">ID / Citizenship No.</span>
            <strong className="text-slate-900 text-sm">{data.citizenshipNo}</strong>
            <span className="text-slate-500 block text-[11px]">{data.citizenshipDistrict}</span>
          </div>
        </div>

        {/* Next Steps Instructions */}
        <div className="pt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0981ae]" />
            <span>{lang === 'np' ? 'अब के गर्ने? (Next Verification Steps):' : 'Next Steps in Application Processing:'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#0981ae] text-white text-xs font-bold flex items-center justify-center mb-2">
                1
              </div>
              <strong className="block text-slate-800 mb-1">
                {lang === 'np' ? 'डिजिटल प्रमाणिकरण' : 'Digital KYC Verification'}
              </strong>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {lang === 'np'
                  ? 'सहकारीको अनुपालन अधिकृतले २४ घण्टाभित्र विवरण प्रमाणीकरण गर्नेछन्।'
                  : 'Compliance team reviews identity and banking details within 24 business hours.'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#0981ae] text-white text-xs font-bold flex items-center justify-center mb-2">
                2
              </div>
              <strong className="block text-slate-800 mb-1">
                {lang === 'np' ? 'एसएमएस / इमेल सूचना' : 'SMS Notification'}
              </strong>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {lang === 'np'
                  ? 'खाता स्वीकृत भएपछि तपाईंको मोबाइलमा सदस्य नम्बर र एसएमएस अलर्ट पठाइनेछ।'
                  : 'You will receive an SMS confirmation with your official Cooperative Account Number.'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#0981ae] text-white text-xs font-bold flex items-center justify-center mb-2">
                3
              </div>
              <strong className="block text-slate-800 mb-1">
                {lang === 'np' ? 'शाखामा पासबुक तथा चेक' : 'Passbook & Mobile App'}
              </strong>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {lang === 'np'
                  ? 'सम्बन्धित शाखाबाट पासबुक, सेयर प्रमाणपत्र र मोबाइल बैंकिङ सक्रियता लिनुहोस्।'
                  : 'Collect physical passbook and activate mobile banking app at your convenience.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === 'np' ? 'आधिकारिक eKYM दर्ता फाराम (PDF) प्रिन्ट गर्नुहोस्' : 'Print / Download Official eKYM PDF'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onResetForm}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {lang === 'np' ? 'नयाँ आवेदन भर्नुहोस्' : 'Submit Another Application'}
          </button>

          <button
            type="button"
            onClick={onExitToWebsite}
            className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>{lang === 'np' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Return to Website'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Printable eKYM Document Modal */}
      <PrintableKymDocument
        isOpen={isFullPrintOpen}
        onClose={() => setIsFullPrintOpen(false)}
        formData={data}
        applicationNo={applicationNo}
        coopLogoUrl={coopLogoUrl}
      />
    </div>
  );
};
