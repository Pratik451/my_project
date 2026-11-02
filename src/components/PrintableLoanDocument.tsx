import React from 'react';
import { LoanRecord } from '../types';
import { Printer, Download, X, CheckCircle2, ShieldCheck, Clock, XCircle, Landmark } from 'lucide-react';

interface PrintableLoanDocumentProps {
  record: LoanRecord | null;
  isOpen: boolean;
  onClose: () => void;
  coopLogoUrl?: string;
}

export function extractLoanFields(record: LoanRecord) {
  const details = record.details || {};
  const trackingCode = record.trackingCode || 'EKT-LN-0000';
  const applicantName = record.applicantName || details.name || '—';
  const email = record.email || details.email || '—';
  const phone = record.phone || details.phone || '—';
  const province = record.province || details.province || '—';
  const district = record.district || details.district || '—';
  const currentAddress =
    details.currentAddress ||
    (record.address
      ? record.address
          .replace(`, ${district}, ${province}`, '')
          .replace(`, ${province}`, '')
      : '—');
  const fullAddress =
    record.address ||
    [currentAddress, district !== '—' ? district : '', province !== '—' ? province : '']
      .filter(Boolean)
      .join(', ') ||
    '—';
  const branch = record.branch || details.branch || 'Head Office — Butwal-4, Traffic Chowk';
  const loanType = record.loanScheme || details.loanType || '—';
  const interestRate = record.interestRate ? `${record.interestRate}%` : 'As per Cooperative Norms';
  const incomeSource = record.occupation || details.incomeSource || '—';

  let loanFromOtherBank = details.loanFromOtherBank || '';
  if (!loanFromOtherBank) {
    if (record.collateralType && record.collateralType.toLowerCase().includes('loan from other bank:')) {
      loanFromOtherBank = record.collateralType.split(':')[1]?.trim() || 'No';
    } else if (record.purpose && record.purpose.includes('Loan From Other Bank:')) {
      loanFromOtherBank = record.purpose.split('Loan From Other Bank:')[1]?.trim() || 'No';
    } else {
      loanFromOtherBank = 'No';
    }
  }

  let message = details.message ?? '';
  if (!message && record.purpose) {
    message = record.purpose
      .replace(/\|\s*Loan From Other Bank:\s*(Yes|No)/i, '')
      .replace(/^Loan From Other Bank:\s*(Yes|No)$/i, '')
      .trim();
  }

  const status = record.status || 'Under Review';
  const appliedDate = record.appliedDate || new Date().toISOString().split('T')[0];
  const remarks =
    record.remarks ||
    (status === 'Approved'
      ? 'Verified applicant credentials and approved by Credit Committee.'
      : status === 'Disbursed'
      ? 'Loan sanctioned and disbursed to applicant account.'
      : status === 'Rejected'
      ? 'Application declined based on credit assessment criteria.'
      : 'Submitted online via Loan Application Portal. Pending Credit Officer verification.');

  return {
    trackingCode,
    applicantName,
    email,
    phone,
    currentAddress,
    fullAddress,
    province,
    district,
    branch,
    loanType,
    interestRate,
    incomeSource,
    loanFromOtherBank,
    message: message || '—',
    status,
    appliedDate,
    remarks,
  };
}

export function downloadLoanApplicationDossier(
  record: LoanRecord,
  coopLogoUrl = '/uploads/logos/ekata-logo-default.svg'
) {
  const f = extractLoanFields(record);
  const resolvedLogo = coopLogoUrl.startsWith('http')
    ? coopLogoUrl
    : `${window.location.origin}${coopLogoUrl.startsWith('/') ? '' : '/'}${coopLogoUrl}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Loan Application Dossier - ${f.trackingCode}</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { margin: 0; padding: 28px; background: #fff; color: #0f172a; font-size: 12px; line-height: 1.5; }
    .container { max-width: 820px; margin: 0 auto; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .logo { width: 64px; height: 64px; object-fit: contain; }
    .coop-title-en { font-size: 18px; font-weight: 900; color: #0981ae; margin: 0; text-transform: uppercase; }
    .coop-title-np { font-size: 14px; font-weight: 700; color: #1e293b; margin: 2px 0; }
    .coop-meta { font-size: 10px; color: #475569; margin: 1px 0; }
    .banner { text-align: center; padding: 8px 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; margin: 16px 0; }
    .banner h3 { margin: 0; font-size: 13px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
    .banner p { margin: 2px 0 0; font-size: 11px; color: #475569; font-weight: 600; }
    .status-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
    .status-bar span { display: block; font-size: 10px; color: #64748b; }
    .status-bar strong { font-size: 12px; color: #0f172a; }
    .section { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
    .section-head { background: #f1f5f9; padding: 7px 12px; font-weight: 800; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 12px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 12px; }
    .field-label { display: block; font-size: 10px; color: #64748b; margin-bottom: 2px; }
    .field-val { font-weight: 700; color: #0f172a; font-size: 12px; word-break: break-word; }
    .declaration { border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px 12px; border-radius: 6px; font-size: 10px; color: #475569; margin-bottom: 28px; }
    .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding-top: 36px; text-align: center; font-size: 10px; color: #334155; }
    .sig-line { border-top: 1px solid #64748b; padding-top: 6px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
    @media print {
      body { padding: 0; }
      @page { size: A4 portrait; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <img src="${resolvedLogo}" alt="Logo" class="logo" onerror="this.style.display='none'" />
        <div>
          <h1 class="coop-title-en">ANKUR SAVINGS &amp; CREDIT CO-OPERATIVE LTD.</h1>
          <h2 class="coop-title-np">अंकुर बचत तथा ऋण सहकारी संस्था लि.</h2>
          <p class="coop-meta">Butwal-4, Rupandehi, Lumbini Province, Nepal &bull; Regd. No: 421/057/058 &bull; PAN: 301548921</p>
          <p class="coop-meta">Phone: 071-540123 / 541456 &bull; Email: info@ekatacoop.org.np &bull; Web: www.ekatacoop.org.np</p>
        </div>
      </div>
      <div style="text-align:right; font-size:10px; color:#475569;">
        <div style="font-weight:800; color:#0981ae; font-size:12px;">CREDIT DEPARTMENT</div>
        <div>कर्जा तथा लगानी विभाग</div>
        <div style="font-family:monospace; margin-top:4px;">Ref: ${f.trackingCode}</div>
      </div>
    </div>

    <div class="banner">
      <h3>OFFICIAL LOAN APPLICATION FORM / DOSSIER</h3>
      <p>अनलाइन कर्जा आवेदन फाराम तथा दर्ता निस्सा (Loan Application Certificate)</p>
    </div>

    <div class="status-bar">
      <div>
        <span>Tracking Code (दर्ता नं.):</span>
        <strong style="font-family:monospace; color:#0981ae; font-size:13px;">${f.trackingCode}</strong>
      </div>
      <div>
        <span>Application Date (आवेदन मिति):</span>
        <strong>${f.appliedDate}</strong>
      </div>
      <div>
        <span>Application Status (अवस्था):</span>
        <strong style="color:#07678d;">${f.status}</strong>
      </div>
      <div>
        <span>Selected Branch (शाखा):</span>
        <strong>${f.branch}</strong>
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <span>१. आवेदकको व्यक्तिगत तथा सम्पर्क विवरण (Applicant &amp; Contact Information)</span>
        <span style="font-weight:normal; color:#64748b;">Mandatory Details</span>
      </div>
      <div class="grid-3">
        <div>
          <span class="field-label">1. Name (पूरा नाम):</span>
          <span class="field-val">${f.applicantName}</span>
        </div>
        <div>
          <span class="field-label">2. Email (इमेल ठेगाना):</span>
          <span class="field-val">${f.email}</span>
        </div>
        <div>
          <span class="field-label">3. Phone (फोन / मोबाइल नं.):</span>
          <span class="field-val" style="font-family:monospace;">${f.phone}</span>
        </div>
        <div>
          <span class="field-label">4. Current Address (हालको ठेगाना):</span>
          <span class="field-val">${f.currentAddress}</span>
        </div>
        <div>
          <span class="field-label">5. Province (प्रदेश):</span>
          <span class="field-val">${f.province}</span>
        </div>
        <div>
          <span class="field-label">6. District (जिल्ला):</span>
          <span class="field-val">${f.district}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <span>२. कर्जा तथा आम्दानी सम्बन्धी विवरण (Loan Product &amp; Financial Disclosure)</span>
        <span style="font-weight:normal; color:#64748b;">Credit Underwriting</span>
      </div>
      <div class="grid-2">
        <div>
          <span class="field-label">7. Selected Branch (सेवा केन्द्र / शाखा):</span>
          <span class="field-val">${f.branch}</span>
        </div>
        <div>
          <span class="field-label">8. Loan Type / Scheme (कर्जाको प्रकार):</span>
          <span class="field-val" style="color:#0981ae;">${f.loanType} (${f.interestRate})</span>
        </div>
        <div>
          <span class="field-label">9. Income Source (आम्दानीको स्रोत):</span>
          <span class="field-val">${f.incomeSource}</span>
        </div>
        <div>
          <span class="field-label">10. Loan From Other Bank (अन्य बैंकबाट कर्जा लिएको छ/छैन):</span>
          <span class="field-val">${f.loanFromOtherBank}</span>
        </div>
        <div style="grid-column: span 2;">
          <span class="field-label">11. Applicant Message / Purpose (सन्देश / कर्जाको उद्देश्य):</span>
          <span class="field-val">${f.message}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <span>३. सहकारी प्रशासनिक कैफियत (Official Credit Officer Evaluation &amp; Remarks)</span>
      </div>
      <div class="grid-2">
        <div>
          <span class="field-label">Verification Status:</span>
          <span class="field-val">${f.status}</span>
        </div>
        <div>
          <span class="field-label">Administrative Remarks:</span>
          <span class="field-val">${f.remarks}</span>
        </div>
      </div>
    </div>

    <div class="declaration">
      <strong>आवेदकको स्व-घोषणा (Applicant Declaration):</strong> माथि उल्लिखित सम्पूर्ण विवरणहरू सत्य र साँचो हुन्। अंकुर बचत तथा ऋण सहकारी संस्था लि. को कर्जा नीति तथा नियमानुसार आवश्यक कागजातहरू पेश गरी कर्जा प्रक्रिया अगाडि बढाउन म मञ्जुर छु।
    </div>

    <div class="signatures">
      <div class="sig-line">
        <strong style="display:block; color:#0f172a;">${f.applicantName}</strong>
        <span>आवेदकको दस्तखत (Applicant Signature)</span>
      </div>
      <div class="sig-line">
        <strong style="display:block; color:#0f172a;">Credit &amp; Relationship Officer</strong>
        <span>रुजु गर्ने कर्जा अधिकृत (Verified By)</span>
      </div>
      <div class="sig-line">
        <strong style="display:block; color:#0f172a;">Branch Manager / CEO</strong>
        <span>स्वीकृत गर्ने अधिकारी (Approved By / Seal)</span>
      </div>
    </div>

    <div class="footer">
      <span>Ankur Saving &amp; Credit Co-operative Ltd. &bull; Online Loan Application System</span>
      <span>Tracking Ref: ${f.trackingCode} &bull; Generated: ${new Date().toLocaleString()}</span>
    </div>
  </div>
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
  link.download = `Ankur-Loan-${f.trackingCode}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const PrintableLoanDocument: React.FC<PrintableLoanDocumentProps> = ({
  record,
  isOpen,
  onClose,
  coopLogoUrl = '/uploads/logos/ekata-logo-default.svg',
}) => {
  if (!isOpen || !record) return null;

  const f = extractLoanFields(record);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    downloadLoanApplicationDossier(record, coopLogoUrl);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Disbursed':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-sky-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            {status}
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-red-700">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-bold text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {status}
          </span>
        );
    }
  };

  return (
    <div
      id="printable-loan-modal-overlay"
      className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-loan-modal-overlay,
          #printable-loan-modal-overlay * {
            visibility: visible !important;
          }
          #printable-loan-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          #printable-loan-modal-container {
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
        id="printable-loan-modal-container"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-300 print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none"
      >
        {/* Top Screen Action Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Official Loan Application Document
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              ({f.trackingCode})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDoc}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-700 shadow-xs cursor-pointer"
              title="Download standalone loan application file"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download File</span>
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
        <div
          id="printable-loan-content-body"
          className="overflow-y-auto p-6 sm:p-10 print:p-6 text-slate-900 font-sans text-xs bg-white space-y-6"
        >
          {/* 1. Official Cooperative Header */}
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
                  ANKUR SAVINGS &amp; CREDIT CO-OPERATIVE LTD.
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

            <div className="text-right flex flex-col items-end">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0981ae] mb-1">
                <Landmark className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-[#0981ae] uppercase tracking-wider">
                Credit Department
              </span>
              <span className="text-[10px] text-slate-500">कर्जा तथा लगानी शाखा</span>
            </div>
          </div>

          {/* 2. Document Title Banner */}
          <div className="text-center py-2.5 bg-slate-100 rounded-md border border-slate-300">
            <h3 className="text-sm font-black tracking-wide text-slate-900 uppercase">
              OFFICIAL LOAN APPLICATION CERTIFICATE / DOSSIER
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              अनलाइन कर्जा आवेदन फाराम तथा दर्ता निस्सा (Online Loan Application Form)
            </p>
          </div>

          {/* 3. Reference & Verification Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-sky-50/60 p-3.5 rounded-lg border border-sky-200 text-[11px]">
            <div>
              <span className="text-slate-500 block">Tracking No. (दर्ता नं.):</span>
              <strong className="font-mono text-sm text-[#0981ae]">{f.trackingCode}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Application Date (आवेदन मिति):</span>
              <strong className="text-slate-900">{f.appliedDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Application Status (अवस्था):</span>
              {getStatusBadge(f.status)}
            </div>
            <div>
              <span className="text-slate-500 block">Service Branch (शाखा):</span>
              <strong className="text-slate-900">{f.branch}</strong>
            </div>
          </div>

          {/* 4. Section 1: Applicant Personal & Contact Information */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-900 border-b border-slate-200 uppercase text-[11px] flex items-center justify-between">
              <span>१. आवेदकको व्यक्तिगत तथा सम्पर्क विवरण (Applicant &amp; Contact Details)</span>
              <span className="text-slate-500 font-normal">Fields 1 – 6</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-500 block text-[11px]">1. Full Name (नाम):</span>
                <strong className="text-slate-900 text-sm">{f.applicantName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">2. Email Address (इमेल):</span>
                <strong className="text-slate-900">{f.email}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">3. Phone / Mobile (फोन नं.):</span>
                <strong className="text-slate-900 font-mono text-sm">{f.phone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">4. Current Address (हालको ठेगाना):</span>
                <strong className="text-slate-900">{f.currentAddress}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">5. Province (प्रदेश):</span>
                <strong className="text-slate-900">{f.province}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">6. District (जिल्ला):</span>
                <strong className="text-slate-900">{f.district}</strong>
              </div>
            </div>
          </div>

          {/* 5. Section 2: Loan Product & Income Details */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-900 border-b border-slate-200 uppercase text-[11px] flex items-center justify-between">
              <span>२. कर्जा तथा आम्दानी सम्बन्धी विवरण (Loan Product &amp; Financial Disclosure)</span>
              <span className="text-slate-500 font-normal">Fields 7 – 11</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block text-[11px]">7. Selected Branch (शाखा कार्यालय):</span>
                <strong className="text-slate-900">{f.branch}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">8. Loan Type / Product (कर्जाको प्रकार):</span>
                <strong className="text-[#0981ae] text-sm">{f.loanType}</strong>
                <span className="text-[10px] text-slate-500 block">
                  Applicable Interest Rate: {f.interestRate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">9. Income Source (आम्दानीको स्रोत):</span>
                <strong className="text-slate-900">{f.incomeSource}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">
                  10. Loan From Other Bank (अन्य बैंक तथा वित्तीय संस्थाबाट कर्जा लिएको):
                </span>
                <strong
                  className={`inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-bold ${
                    f.loanFromOtherBank.toLowerCase() === 'yes'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-sky-100 text-sky-800 border border-sky-300'
                  }`}
                >
                  {f.loanFromOtherBank}
                </strong>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-500 block text-[11px]">
                  11. Applicant Message / Purpose (सन्देश तथा कर्जाको उद्देश्य):
                </span>
                <p className="text-slate-900 font-semibold mt-1 bg-slate-50 p-3 rounded border border-slate-200">
                  {f.message}
                </p>
              </div>
            </div>
          </div>

          {/* 6. Section 3: Credit Underwriting & Administrative Status */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-900 border-b border-slate-200 uppercase text-[11px]">
              ३. सहकारी कर्जा मूल्याङ्कन तथा प्रशासनिक कैफियत (Official Credit Evaluation &amp; Remarks)
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-500 block text-[11px]">Current Evaluation Status:</span>
                <div className="mt-1">{getStatusBadge(f.status)}</div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[11px]">Credit Officer / Admin Remarks:</span>
                <strong className="text-slate-800 block mt-0.5">{f.remarks}</strong>
              </div>
            </div>
          </div>

          {/* 7. Statutory Self-Declaration */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 text-[10px] text-slate-600 leading-relaxed">
            <strong>आवेदकको स्व-घोषणा (Applicant Statutory Declaration):</strong> माथि उल्लिखित सम्पूर्ण विवरणहरू सत्य र साँचो हुन्। अंकुर बचत तथा ऋण सहकारी संस्था लि. को कर्जा नीति तथा नियमानुसार आवश्यक कागजातहरू पेश गरी कर्जा प्रक्रिया अगाडि बढाउन म मञ्जुर छु। (I hereby declare that the details furnished above are true and accurate to the best of my knowledge.)
          </div>

          {/* 8. Official Signatures Grid */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center text-[10px] text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <strong className="block text-slate-900">{f.applicantName}</strong>
                <span>आवेदकको दस्तखत (Applicant Signature)</span>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <strong className="block text-slate-900">Credit &amp; Relationship Officer</strong>
                <span>रुजु गर्ने कर्जा अधिकृत (Verified By)</span>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <strong className="block text-slate-900">Branch Manager / CEO</strong>
                <span>स्वीकृत गर्ने अधिकारी (Approved By / Seal)</span>
              </div>
            </div>
          </div>

          {/* 9. Official Footer Note */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[9px] text-slate-400">
            <span>Ankur Saving &amp; Credit Co-operative Ltd. &bull; Online Loan Application Dossier</span>
            <span>Ref: {f.trackingCode} &bull; Generated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
