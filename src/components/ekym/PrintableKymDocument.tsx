import React from 'react';
import { EkymRecord, EkymFormData } from '../../types';
import { Printer, Download, X, CheckCircle2, ShieldCheck, User, FileText } from 'lucide-react';

interface PrintableKymDocumentProps {
  record?: EkymRecord | null;
  formData?: EkymFormData | null;
  applicationNo?: string;
  isOpen: boolean;
  onClose: () => void;
  coopLogoUrl?: string;
}

export const PrintableKymDocument: React.FC<PrintableKymDocumentProps> = ({
  record,
  formData,
  applicationNo,
  isOpen,
  onClose,
  coopLogoUrl = '/uploads/logos/ekata-logo-default.svg',
}) => {
  if (!isOpen) return null;

  // Consolidate data fields from either record or formData
  const details = record?.details || formData || ({} as Partial<EkymFormData>);

  const finalAppNo =
    record?.applicationNo || applicationNo || (details as any).applicationNo || 'EKT-KYC-2083-0000';
  const fullNameEn = record?.fullNameEn || details.fullNameEn || '—';
  const fullNameNp = record?.fullNameNp || details.fullNameNp || '';
  const fatherName = record?.fatherName || details.fatherName || '—';
  const grandfatherName = record?.grandfatherName || details.grandfatherName || '—';
  const motherName = record?.motherName || details.motherName || '—';
  const spouseName = record?.spouseName || details.spouseName || '—';
  const dob = record?.dob || details.dob || '—';
  const gender = record?.gender || details.gender || '—';
  const citizenshipNo = record?.citizenshipNo || details.citizenshipNo || '—';
  const citizenshipDistrict = record?.citizenshipDistrict || details.citizenshipDistrict || '—';
  const phone = record?.phone || details.mobile || '—';
  const email = record?.email || details.email || '—';
  const permanentAddress =
    record?.permanentAddress ||
    [details.permTole, details.permWard ? `Ward ${details.permWard}` : '', details.permMunicipality, details.permDistrict, details.permProvince]
      .filter(Boolean)
      .join(', ') ||
    '—';
  const currentAddress =
    record?.currentAddress ||
    (details.sameAsPermanent
      ? permanentAddress
      : [details.tempTole, details.tempWard ? `Ward ${details.tempWard}` : '', details.tempMunicipality, details.tempDistrict, details.tempProvince]
          .filter(Boolean)
          .join(', ')) ||
    permanentAddress;

  const occupation = record?.occupation || details.occupation || '—';
  const annualIncome = record?.annualIncome || details.estimatedAnnualIncome || '—';
  const bankName = record?.bankName || details.bankName || '—';
  const bankAccountNo = record?.bankAccountNo || details.bankAccountNo || '—';
  const nomineeName = record?.nomineeName || details.nomineeName || '—';
  const nomineeRelation = record?.nomineeRelation || details.nomineeRelation || '—';
  const nomineeCitizenship = record?.nomineeCitizenship || details.nomineeCitizenship || '—';

  const memberPhoto = record?.memberPhoto || details.memberPhoto || '';
  const citizenshipFront = record?.citizenshipFront || details.citizenshipFront || '';
  const citizenshipBack = record?.citizenshipBack || details.citizenshipBack || '';

  const status = record?.status || 'Approved';
  const submittedAt = record?.submittedAt || new Date().toISOString().split('T')[0];
  const remarks = record?.remarks || 'Approved and registered in Core Banking System.';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const printableElement = document.getElementById('printable-kym-content-body');
    if (!printableElement) {
      window.print();
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>eKYM Registration Dossier - ${finalAppNo}</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 24px; background: #fff; color: #0f172a; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px; }
    th { background: #f8fafc; font-weight: bold; }
    img { max-width: 100%; }
    @media print {
      body { padding: 0; }
      @page { size: A4 portrait; margin: 10mm; }
    }
  </style>
</head>
<body>
  ${printableElement.innerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ankur-eKYM-${finalAppNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="printable-kym-modal-overlay"
      className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-kym-modal-overlay,
          #printable-kym-modal-overlay * {
            visibility: visible !important;
          }
          #printable-kym-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          #printable-kym-modal-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden,
          .print-hidden {
            display: none !important;
            visibility: hidden !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
      <div
        id="printable-kym-modal-container"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-300 print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none"
      >
        {/* Screen Action Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Official KYM Registration Document
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              ({finalAppNo})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDoc}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-700 shadow-xs cursor-pointer"
              title="Download standalone dossier file"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Download File</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div id="printable-kym-content-body" className="overflow-y-auto p-6 sm:p-10 print:p-6 text-slate-900 font-sans text-xs bg-white space-y-6">
          {/* 1. Official Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={coopLogoUrl || '/uploads/logos/ekata-logo-default.svg'}
                alt="Ankur Cooperative Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/uploads/logos/ekata-logo-default.svg';
                }}
              />
              <div>
                <h1 className="text-lg sm:text-xl font-black text-[#0981ae] tracking-tight uppercase">
                  ANKUR SAVINGS & CREDIT CO-OPERATIVE LTD.
                </h1>
                <h2 className="text-sm font-bold text-slate-800">
                  अंकुर बचत तथा ऋण सहकारी संस्था लि.
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Butwal-4, Rupandehi, Lumbini Province, Nepal &bull; Regd. No: 421/057/058 &bull; PAN: 301548921
                </p>
                <p className="text-[10px] text-slate-600">
                  Phone: 071-540123 / 541456 &bull; Email: info@ekatacoop.org.np &bull; Web: www.ekatacoop.org.np
                </p>
              </div>
            </div>

            {/* Passport Photo Frame */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-28 border-2 border-slate-400 rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                {memberPhoto ? (
                  <img
                    src={memberPhoto}
                    alt="Applicant Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-1 text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[9px] block">PP Photo</span>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 font-semibold mt-1">Applicant Photo</span>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-2 bg-slate-100 rounded-md border border-slate-300">
            <h3 className="text-sm font-black tracking-wide text-slate-900 uppercase">
              KNOW YOUR MEMBER (KYM) REGISTRATION CERTIFICATE / DOSSIER
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              विद्युतीय ग्राहक पहिचान (e-KYM) तथा सदस्यता अभिलेख फाराम
            </p>
          </div>

          {/* Reference & Verification Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-sky-50/60 p-3 rounded-lg border border-sky-200 text-[11px]">
            <div>
              <span className="text-slate-500 block">Registration No. (दर्ता नं.):</span>
              <strong className="font-mono text-sm text-[#0981ae]">{finalAppNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Submission Date:</span>
              <strong className="text-slate-900">{submittedAt}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Account Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-sky-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                {status}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Operating Area:</span>
              <strong className="text-slate-900">Rupandehi District</strong>
            </div>
          </div>

          {/* Section 1: Personal & Identity Information */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-200 uppercase text-[11px] flex items-center justify-between">
              <span>१. व्यक्तिगत तथा पहिचान विवरण (Personal & Identity Details)</span>
              <span className="text-slate-500 font-normal">Confidential Document</span>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block">Full Name (English):</span>
                <strong className="text-slate-900">{fullNameEn}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">पूरा नाम (नेपाली):</span>
                <strong className="text-slate-900">{fullNameNp || fullNameEn}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth (जन्म मिति):</span>
                <strong className="text-slate-900">{dob}</strong>
              </div>

              <div>
                <span className="text-slate-500 block">Gender (लिङ्ग):</span>
                <strong className="text-slate-900">{gender}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Citizenship No. (नागरिकता नं.):</span>
                <strong className="text-slate-900 font-mono">{citizenshipNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Issue District (जारी जिल्ला):</span>
                <strong className="text-slate-900">{citizenshipDistrict}</strong>
              </div>

              <div>
                <span className="text-slate-500 block">Father's Name (बुवाको नाम):</span>
                <strong className="text-slate-900">{fatherName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Grandfather's Name (हजुरबुवाको नाम):</span>
                <strong className="text-slate-900">{grandfatherName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Mother's Name (आमाको नाम):</span>
                <strong className="text-slate-900">{motherName}</strong>
              </div>

              {spouseName && (
                <div>
                  <span className="text-slate-500 block">Spouse's Name (पति/पत्नीको नाम):</span>
                  <strong className="text-slate-900">{spouseName}</strong>
                </div>
              )}
              <div>
                <span className="text-slate-500 block">Primary Occupation (पेशा):</span>
                <strong className="text-slate-900">{occupation}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Annual Income (वार्षिक आम्दानी):</span>
                <strong className="text-slate-900">{annualIncome}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Contact */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-200 uppercase text-[11px]">
              २. बसोबास तथा सम्पर्क विवरण (Address & Contact Information)
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">Permanent Address (स्थायी ठेगाना):</span>
                <strong className="text-slate-900">{permanentAddress}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Current Address (हालको ठेगाना):</span>
                <strong className="text-slate-900">{currentAddress}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Registered Mobile No. (मोबाइल):</span>
                <strong className="text-slate-900 font-mono">{phone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Email Address (इमेल):</span>
                <strong className="text-slate-900">{email}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Bank & Nominee Details */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-200 uppercase text-[11px]">
              ३. बैंक तथा इच्छाएको व्यक्ति (Bank & Nominee Information)
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block">Bank Name (बैंकको नाम):</span>
                <strong className="text-slate-900">{bankName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Bank Account No. (खाता नं.):</span>
                <strong className="text-slate-900 font-mono">{bankAccountNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Nominee Name (इच्छाएको व्यक्ति):</span>
                <strong className="text-slate-900">{nomineeName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Nominee Relation (नाता):</span>
                <strong className="text-slate-900">{nomineeRelation}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Nominee Citizenship No:</span>
                <strong className="text-slate-900 font-mono">{nomineeCitizenship || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Assigned Branch (शाखा):</span>
                <strong className="text-slate-900">{details.preferredBranch || 'Butwal Main Branch'}</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Verified Identity Document Images */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-200 uppercase text-[11px]">
              ४. संलग्न परिचयपत्र प्रतिलिपिहरू (Attached Citizenship Scans)
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-600 font-bold block mb-1.5 text-[11px]">
                  नागरिकता प्रमाणपत्र (अगाडि भाग) - Front Side
                </span>
                <div className="border border-slate-300 rounded bg-slate-50 h-44 flex items-center justify-center overflow-hidden">
                  {citizenshipFront ? (
                    <img
                      src={citizenshipFront}
                      alt="Citizenship Front"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span>No Front Scan</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-600 font-bold block mb-1.5 text-[11px]">
                  नागरिकता प्रमाणपत्र (पछाडि भाग) - Back Side
                </span>
                <div className="border border-slate-300 rounded bg-slate-50 h-44 flex items-center justify-center overflow-hidden">
                  {citizenshipBack ? (
                    <img
                      src={citizenshipBack}
                      alt="Citizenship Back"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span>No Back Scan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Statutory Self-Declaration & Signatures */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 leading-relaxed">
            <strong>सदस्यको कानुनी स्व-घोषणा (Statutory Declaration):</strong> माथि उल्लिखित सम्पूर्ण विवरण तथा संलग्न गरिएका कागजातहरू सत्य, तथ्य र मेरो पूर्ण जानकारीमा आधारित छन्। कुनै विवरण झूट्ठा वा फरक परेमा प्रचलित सहकारी ऐन तथा नेपाल कानुन बमोजिम हुने कारबाही व्यहोर्न म मञ्जुर छु।
          </div>

          {/* Signatures & Official Stamp Grid */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center text-[10px] text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <strong className="block text-slate-900">{fullNameEn}</strong>
                <span>सदस्यको दस्तखत (Applicant Signature)</span>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <strong className="block text-slate-900">Compliance & KYC Officer</strong>
                <span>रुजु गर्ने अधिकृत (Verified By)</span>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <strong className="block text-slate-900">Chief Executive Officer</strong>
                <span>स्वीकृत गर्ने अधिकारी (Approved By / Seal)</span>
              </div>
            </div>
          </div>

          {/* Official Footer Note */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[9px] text-slate-400">
            <span>Ankur Saving & Credit Co-operative Ltd. &bull; Core Banking Automated Registry</span>
            <span>Ref: {finalAppNo} &bull; Generated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
