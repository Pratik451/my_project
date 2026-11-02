import React, { useState } from 'react';
import { LoanRecord, InterestRate, ServiceCenterCMS } from '../../types';
import { INTEREST_RATES } from '../../data/cooperativeData';
import { INITIAL_CMS_SERVICE_CENTERS } from '../../data/cmsInitialData';
import { NEPAL_PROVINCE_OPTIONS, getDistrictsByProvince } from '../../data/nepalProvincesDistricts';
import {
  submitLoanApplicationApi,
  updateLoanApplicationApi,
  updateLoanStatusApi,
  deleteLoanApplicationApi,
} from '../../services/cooperativeApi';
import {
  PrintableLoanDocument,
  downloadLoanApplicationDossier,
  extractLoanFields,
} from '../PrintableLoanDocument';
import {
  Database,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  FileText,
  X,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface LoanApplicationsManagerProps {
  loans: LoanRecord[];
  loading: boolean;
  onRefresh: () => void;
  onLoansChange: (updated: LoanRecord[]) => void;
  rates?: InterestRate[];
  serviceCenters?: ServiceCenterCMS[];
  coopLogoUrl?: string;
  onTriggerToast?: (msg: string) => void;
}

export const LoanApplicationsManager: React.FC<LoanApplicationsManagerProps> = ({
  loans,
  loading,
  onRefresh,
  onLoansChange,
  rates,
  serviceCenters,
  coopLogoUrl = '/uploads/logos/ekata-logo-default.svg',
  onTriggerToast,
}) => {
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected'
  >('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedLoanForView, setSelectedLoanForView] = useState<LoanRecord | null>(null);
  const [selectedLoanForPrint, setSelectedLoanForPrint] = useState<LoanRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add / Edit Modal State (CRUD Create & Update)
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingLoan, setEditingLoan] = useState<LoanRecord | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Form fields matching the exact 11-field Loan Form order + Admin Status & Remarks
  const [applicantName, setApplicantName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [loanType, setLoanType] = useState<string>('');
  const [incomeSource, setIncomeSource] = useState<string>('');
  const [loanFromOtherBank, setLoanFromOtherBank] = useState<string>('No');
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'Under Review' | 'Approved' | 'Disbursed' | 'Rejected'>(
    'Under Review'
  );
  const [remarks, setRemarks] = useState<string>('');

  // Quick Remarks inside View Details Modal
  const [viewRemarksInput, setViewRemarksInput] = useState<string>('');

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

  const availableDistricts = province ? getDistrictsByProvince(province) : [];

  const notify = (msg: string) => {
    if (onTriggerToast) onTriggerToast(msg);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingLoan(null);
    setFormError('');
    setApplicantName('');
    setEmail('');
    setPhone('');
    setCurrentAddress('');
    setProvince('Lumbini');
    setDistrict('Rupandehi');
    setBranch(activeBranches[0]?.nameEn || 'Head Office — Butwal-4, Traffic Chowk');
    setLoanType(loanProducts[0]?.schemeEn || 'Agricultural & Livestock Concessional Loan');
    setIncomeSource('Business / Enterprise');
    setLoanFromOtherBank('No');
    setMessage('');
    setStatus('Under Review');
    setRemarks('Created by Admin Officer.');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (loan: LoanRecord) => {
    const f = extractLoanFields(loan);
    setEditingLoan(loan);
    setFormError('');
    setApplicantName(f.applicantName === '—' ? '' : f.applicantName);
    setEmail(f.email === '—' ? '' : f.email);
    setPhone(f.phone === '—' ? '' : f.phone);
    setCurrentAddress(f.currentAddress === '—' ? '' : f.currentAddress);
    setProvince(f.province === '—' ? '' : f.province);
    setDistrict(f.district === '—' ? '' : f.district);
    setBranch(f.branch === '—' ? '' : f.branch);
    setLoanType(f.loanType === '—' ? '' : f.loanType);
    setIncomeSource(f.incomeSource === '—' ? '' : f.incomeSource);
    setLoanFromOtherBank(f.loanFromOtherBank === 'Yes' ? 'Yes' : 'No');
    setMessage(f.message === '—' ? '' : f.message);
    setStatus(loan.status || 'Under Review');
    setRemarks(loan.remarks || '');
    setIsFormModalOpen(true);
  };

  // Save Create or Update
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!applicantName.trim() || !phone.trim() || !currentAddress.trim() || !province || !district || !branch || !loanType || !incomeSource || !loanFromOtherBank) {
      setFormError('Please fill all required (*) fields.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedProductObj = loanProducts.find((p) => p.schemeEn === loanType);
      const rateVal = selectedProductObj?.ratePercent || parseFloat(String(selectedProductObj?.rate || '12.5').replace(/[^0-9.]/g, '')) || 12.5;
      const fullAddress = `${currentAddress.trim()}, ${district}, ${province}`;
      const combinedPurpose = message.trim()
        ? `${message.trim()} | Loan From Other Bank: ${loanFromOtherBank}`
        : `Loan From Other Bank: ${loanFromOtherBank}`;

      const detailsObj = {
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
      };

      if (editingLoan) {
        // UPDATE existing loan application
        const updated = await updateLoanApplicationApi(editingLoan.id, {
          applicantName: applicantName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: fullAddress,
          province,
          district,
          branch,
          occupation: incomeSource,
          collateralType: `Loan From Other Bank: ${loanFromOtherBank}`,
          loanScheme: loanType,
          interestRate: rateVal,
          purpose: combinedPurpose,
          status,
          remarks: remarks.trim(),
          details: detailsObj,
        });

        const finalRecord: LoanRecord = updated || {
          ...editingLoan,
          applicantName: applicantName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: fullAddress,
          province,
          district,
          branch,
          occupation: incomeSource,
          collateralType: `Loan From Other Bank: ${loanFromOtherBank}`,
          loanScheme: loanType,
          interestRate: rateVal,
          purpose: combinedPurpose,
          status,
          remarks: remarks.trim(),
          details: detailsObj,
        };

        onLoansChange(loans.map((l) => (l.id === editingLoan.id ? finalRecord : l)));
        if (selectedLoanForView?.id === editingLoan.id) {
          setSelectedLoanForView(finalRecord);
        }
        notify(`Loan application ${editingLoan.trackingCode} updated successfully!`);
      } else {
        // CREATE new loan application
        const created = await submitLoanApplicationApi({
          applicantName: applicantName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: fullAddress,
          province,
          district,
          branch,
          occupation: incomeSource,
          collateralType: `Loan From Other Bank: ${loanFromOtherBank}`,
          loanScheme: loanType,
          interestRate: rateVal,
          amount: 0,
          tenureMonths: 12,
          monthlyIncome: 0,
          purpose: combinedPurpose,
          details: detailsObj,
        });

        let newRec: LoanRecord = created.data || {
          id: `loan-${Date.now()}`,
          trackingCode: created.trackingCode,
          applicantName: applicantName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: fullAddress,
          province,
          district,
          branch,
          occupation: incomeSource,
          collateralType: `Loan From Other Bank: ${loanFromOtherBank}`,
          loanScheme: loanType,
          interestRate: rateVal,
          amount: 0,
          tenureMonths: 12,
          monthlyIncome: 0,
          purpose: combinedPurpose,
          status,
          remarks: remarks.trim(),
          appliedDate: new Date().toISOString().substring(0, 10),
          details: detailsObj,
        };

        if (status !== 'Under Review' || remarks.trim()) {
          const statusUpdated = await updateLoanStatusApi(newRec.id, status, remarks.trim());
          if (statusUpdated) newRec = statusUpdated;
        }

        onLoansChange([newRec, ...loans]);
        notify(`New loan application ${newRec.trackingCode} created in database!`);
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save loan application.');
    } finally {
      setIsSaving(false);
    }
  };

  // Status update handler
  const handleStatusChange = async (
    loan: LoanRecord,
    newStatus: 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected',
    customRemarks?: string
  ) => {
    const finalRemarks =
      customRemarks !== undefined && customRemarks.trim()
        ? customRemarks.trim()
        : loan.remarks || `Status updated to ${newStatus} by Admin.`;

    const updated = await updateLoanStatusApi(loan.id, newStatus, finalRemarks);
    const nextRecord: LoanRecord = updated || {
      ...loan,
      status: newStatus,
      remarks: finalRemarks,
    };

    onLoansChange(loans.map((l) => (l.id === loan.id ? nextRecord : l)));
    if (selectedLoanForView?.id === loan.id) {
      setSelectedLoanForView(nextRecord);
    }
    notify(`Loan application ${loan.trackingCode} status updated to "${newStatus}".`);
  };

  // Delete handler
  const handleDelete = async (loan: LoanRecord) => {
    await deleteLoanApplicationApi(loan.id);
    onLoansChange(loans.filter((l) => l.id !== loan.id && l.trackingCode !== loan.trackingCode));
    if (selectedLoanForView?.id === loan.id) {
      setSelectedLoanForView(null);
    }
    notify(`Loan application ${loan.trackingCode} deleted from database.`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers =
      'Tracking Code,Applied Date,Name,Email,Phone,Current Address,Province,District,Branch,Loan Type,Income Source,Loan From Other Bank,Message,Status,Remarks\n';
    const rows = loans
      .map((l) => {
        const f = extractLoanFields(l);
        const esc = (v: string) => `"${String(v || '').replace(/"/g, '""')}"`;
        return [
          esc(f.trackingCode),
          esc(f.appliedDate),
          esc(f.applicantName),
          esc(f.email),
          esc(f.phone),
          esc(f.currentAddress),
          esc(f.province),
          esc(f.district),
          esc(f.branch),
          esc(f.loanType),
          esc(f.incomeSource),
          esc(f.loanFromOtherBank),
          esc(f.message),
          esc(f.status),
          esc(f.remarks),
        ].join(',');
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ankur_Loan_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Loan applications exported to CSV.');
  };

  const filteredLoans = loans.filter((loan) => {
    if (statusFilter !== 'All' && loan.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const f = extractLoanFields(loan);
    return (
      f.trackingCode.toLowerCase().includes(q) ||
      f.applicantName.toLowerCase().includes(q) ||
      f.phone.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.branch.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.province.toLowerCase().includes(q) ||
      f.loanType.toLowerCase().includes(q)
    );
  });

  const renderStatusBadge = (st: string) => {
    switch (st) {
      case 'Approved':
        return (
          <span className="px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-300">
            <CheckCircle2 className="w-3 h-3 text-sky-600" /> Approved
          </span>
        );
      case 'Disbursed':
        return (
          <span className="px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Disbursed
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 bg-red-50 text-red-800 border border-red-300">
            <XCircle className="w-3 h-3 text-red-600" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" /> Under Review
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Header & CRUD Action Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-sky-100 text-[#0981ae]">
            <Briefcase className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Loan Applications Management (CRUD &amp; Dossier Download)</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-300">
                <Database className="w-3 h-3 text-sky-700" />
                Live Database
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, view, edit, approve/reject, delete, and download official printable Loan Application forms (PDF/HTML) like eKYM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0981ae] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Refresh DB'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-admin-add-loan-application"
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loan Application</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="px-6 flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
          {(['All', 'Under Review', 'Approved', 'Disbursed', 'Rejected'] as const).map((tab) => {
            const count =
              tab === 'All' ? loans.length : loans.filter((item) => item.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    tab === 'Approved'
                      ? 'bg-sky-100 text-sky-800'
                      : tab === 'Disbursed'
                      ? 'bg-blue-100 text-blue-800'
                      : tab === 'Under Review'
                      ? 'bg-amber-100 text-amber-800'
                      : tab === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, name, phone, branch, district, loan type..."
            className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0981ae] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Loan Applications Table */}
      <div className="overflow-x-auto border-t border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5 whitespace-nowrap">Tracking Code &amp; Date</th>
              <th className="p-3.5 whitespace-nowrap">Applicant &amp; Contact</th>
              <th className="p-3.5 whitespace-nowrap">Address, Province &amp; District</th>
              <th className="p-3.5 whitespace-nowrap">Branch &amp; Loan Type</th>
              <th className="p-3.5 whitespace-nowrap">Income &amp; Other Bank Loan</th>
              <th className="p-3.5 whitespace-nowrap min-w-[180px]">Message / Remarks</th>
              <th className="p-3.5 whitespace-nowrap">Status</th>
              <th className="p-3.5 whitespace-nowrap text-right min-w-[250px]">
                CRUD &amp; Download Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLoans.map((loan) => {
              const f = extractLoanFields(loan);
              return (
                <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                  {/* 1. Tracking Code & Date */}
                  <td className="p-3.5 align-top">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {f.trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(f.trackingCode)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy Tracking Code"
                      >
                        {copiedCode === f.trackingCode ? (
                          <Check className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">{f.appliedDate}</span>
                  </td>

                  {/* 2. Applicant & Contact */}
                  <td className="p-3.5 align-top">
                    <strong className="text-slate-900 block text-sm font-bold">
                      {f.applicantName}
                    </strong>
                    <div className="text-[11px] text-sky-800 font-medium mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-sky-600" />
                      <span className="font-mono">{f.phone}</span>
                    </div>
                    {f.email !== '—' && (
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{f.email}</span>
                      </div>
                    )}
                  </td>

                  {/* 3. Address, Province & District */}
                  <td className="p-3.5 align-top text-[11px] space-y-0.5">
                    <div className="font-semibold text-slate-800">{f.currentAddress}</div>
                    <div className="text-slate-500">
                      District: <strong className="text-slate-700">{f.district}</strong>
                    </div>
                    <div className="text-slate-500">
                      Province: <strong className="text-slate-700">{f.province}</strong>
                    </div>
                  </td>

                  {/* 4. Branch & Loan Type */}
                  <td className="p-3.5 align-top space-y-1">
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{f.branch}</span>
                    </div>
                    <div className="font-bold text-[#0981ae] text-xs">{f.loanType}</div>
                    <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                      Rate: {f.interestRate}
                    </span>
                  </td>

                  {/* 5. Income Source & Loan From Other Bank */}
                  <td className="p-3.5 align-top text-[11px] space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Income Source:</span>
                      <strong className="text-slate-800">{f.incomeSource}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Other Bank Loan:</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.loanFromOtherBank.toLowerCase() === 'yes'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {f.loanFromOtherBank}
                      </span>
                    </div>
                  </td>

                  {/* 6. Message & Remarks */}
                  <td className="p-3.5 align-top text-[11px] space-y-1 max-w-[220px]">
                    {f.message !== '—' && (
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block">
                          Applicant Message:
                        </span>
                        <p className="line-clamp-2">{f.message}</p>
                      </div>
                    )}
                    {loan.remarks && (
                      <div className="text-[10px] text-slate-500 italic line-clamp-2">
                        Admin: {loan.remarks}
                      </div>
                    )}
                  </td>

                  {/* 7. Status */}
                  <td className="p-3.5 align-top space-y-1.5">
                    <div>{renderStatusBadge(f.status)}</div>
                    <select
                      value={loan.status}
                      onChange={(e) =>
                        handleStatusChange(
                          loan,
                          e.target.value as 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected'
                        )
                      }
                      className="px-2 py-1 border border-slate-300 rounded text-[11px] outline-none font-semibold bg-white text-slate-700 cursor-pointer"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Disbursed">Disbursed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  {/* 8. CRUD & Download Actions */}
                  <td className="p-3.5 align-top text-right">
                    <div className="flex flex-col gap-1.5 items-end">
                      {/* Row 1: View Details + Print/PDF + Direct Download (like eKYM) */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLoanForView(loan);
                            setViewRemarksInput(loan.remarks || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition border border-slate-300 cursor-pointer"
                          title="View Complete Loan Application Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0981ae]" />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedLoanForPrint(loan)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition cursor-pointer shadow-2xs"
                          title="Open Printable PDF Dossier (like eKYM)"
                        >
                          <Printer className="w-3.5 h-3.5 text-sky-400" />
                          <span>Print PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadLoanApplicationDossier(loan, coopLogoUrl)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-[11px] transition cursor-pointer shadow-2xs"
                          title="Download Official Loan Application Form File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>

                      {/* Row 2: Edit & Delete (CRUD) */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(loan)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] transition cursor-pointer"
                          title="Edit Loan Application Fields"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(loan)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] transition cursor-pointer"
                          title="Delete Loan Application"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredLoans.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  <p className="text-sm font-semibold">No loan applications found matching your filter.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Applications submitted from the public &ldquo;Apply for Loan&rdquo; form or created by Admin appear here immediately.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================================
          MODAL 1: VIEW DETAILS & UNDERWRITING MODAL (LIKE EKYM)
         ========================================================= */}
      {selectedLoanForView && (() => {
        const f = extractLoanFields(selectedLoanForView);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
              {/* Modal Header */}
              <div className="bg-[#0981ae] text-white p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded text-sky-100 uppercase tracking-wider">
                      Loan Application Dossier
                    </span>
                    <span className="font-mono font-bold text-xs bg-white/15 px-2.5 py-0.5 rounded text-amber-300">
                      {f.trackingCode}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mt-2 text-white">
                    {f.applicantName}
                  </h3>
                  <p className="text-xs text-sky-100 mt-1 flex items-center gap-3 flex-wrap">
                    <span>Submitted: {f.appliedDate}</span>
                    <span>•</span>
                    <span>📱 {f.phone}</span>
                    {f.email !== '—' && (
                      <>
                        <span>•</span>
                        <span>✉️ {f.email}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      downloadLoanApplicationDossier(selectedLoanForView, coopLogoUrl)
                    }
                    className="px-3 py-1.5 rounded-lg bg-white text-[#0981ae] hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLoanForPrint(selectedLoanForView)}
                    className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20"
                  >
                    <Printer className="w-3.5 h-3.5 text-sky-300" />
                    <span>Print Application (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLoanForView(null)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-800">
                {/* All 11 Form Fields in Order */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-900 border-b border-slate-200 flex items-center justify-between">
                    <span>Submitted Loan Application Details (Fields 1 – 11)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedLoanForView;
                        setSelectedLoanForView(null);
                        handleOpenEdit(target);
                      }}
                      className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Fields</span>
                    </button>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">1. Name*</span>
                      <strong className="text-slate-900 text-sm">{f.applicantName}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">2. Email</span>
                      <strong className="text-slate-900 text-sm">{f.email}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">3. Phone*</span>
                      <strong className="text-slate-900 text-sm font-mono">{f.phone}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">4. Current Address*</span>
                      <strong className="text-slate-900 text-sm">{f.currentAddress}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">5. Province*</span>
                      <strong className="text-slate-900 text-sm">{f.province}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">6. District*</span>
                      <strong className="text-slate-900 text-sm">{f.district}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">7. Branch*</span>
                      <strong className="text-slate-900 text-sm">{f.branch}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">8. Loan Type*</span>
                      <strong className="text-[#0981ae] text-sm">{f.loanType}</strong>
                      <span className="block text-[10px] text-slate-500">Rate: {f.interestRate}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">9. Income Source*</span>
                      <strong className="text-slate-900 text-sm">{f.incomeSource}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[11px]">10. Loan From Other Bank*</span>
                      <strong className="text-slate-900 text-sm">{f.loanFromOtherBank}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">11. Message</span>
                      <strong className="text-slate-900 text-sm">{f.message}</strong>
                    </div>
                  </div>
                </div>

                {/* Admin Decision & Remarks Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Credit Officer Evaluation &amp; Status Decision
                    </h4>
                    {renderStatusBadge(f.status)}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Administrative / Credit Committee Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={viewRemarksInput}
                      onChange={(e) => setViewRemarksInput(e.target.value)}
                      placeholder="Enter verification notes, collateral notes, or sanction remarks..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#0981ae]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(selectedLoanForView, 'Approved', viewRemarksInput)
                        }
                        className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Loan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(selectedLoanForView, 'Disbursed', viewRemarksInput)
                        }
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Disbursed</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(selectedLoanForView, 'Under Review', viewRemarksInput)
                        }
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Set Under Review</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(selectedLoanForView, 'Rejected', viewRemarksInput)
                        }
                        className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedLoanForView(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================
          MODAL 2: CREATE / EDIT LOAN APPLICATION MODAL (ADMIN CRUD)
         ========================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-[#0c2d3e] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  {editingLoan
                    ? `Edit Loan Application (${editingLoan.trackingCode})`
                    : 'Add New Loan Application'}
                </h3>
                <p className="text-xs text-sky-200">
                  {editingLoan
                    ? 'Update applicant details, branch, loan product, or evaluation status'
                    : 'Record a new loan application directly into the database'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Name* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    1. Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Applicant Full Name"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  />
                </div>

                {/* 2. Email */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">2. Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  />
                </div>

                {/* 3. Phone* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    3. Phone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  />
                </div>

                {/* 4. Current Address* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    4. Current Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    placeholder="Tole, Ward No., Municipality"
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  />
                </div>

                {/* 5. Province* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    5. Province <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setDistrict('');
                    }}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  >
                    <option value="">Select Province</option>
                    {NEPAL_PROVINCE_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. District* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    6. District <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!province}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:border-[#0981ae] focus:outline-none disabled:bg-slate-100"
                  >
                    <option value="">
                      {province ? 'Select District' : 'Select Province First'}
                    </option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Branch* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    7. Branch <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  >
                    <option value="">Select Branch</option>
                    {activeBranches.map((sc) => (
                      <option key={sc.id} value={sc.nameEn}>
                        {sc.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Loan Type* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    8. Loan Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  >
                    <option value="">Select Loan Type</option>
                    {loanProducts.map((p) => (
                      <option key={p.id || p.schemeEn} value={p.schemeEn}>
                        {p.schemeEn} ({p.rate})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 9. Income Source* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    9. Income Source <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={incomeSource}
                    onChange={(e) => setIncomeSource(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  >
                    <option value="">Select Income Source</option>
                    <option value="Business / Enterprise">Business / Enterprise</option>
                    <option value="Agriculture & Livestock">Agriculture &amp; Livestock</option>
                    <option value="Salary / Employment">Salary / Employment</option>
                    <option value="Self-Employed / Professional">Self-Employed / Professional</option>
                    <option value="Foreign Employment / Remittance">Foreign Employment / Remittance</option>
                    <option value="Rental / Other Income">Rental / Other Income</option>
                  </select>
                </div>

                {/* 10. Loan From Other Bank* */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    10. Loan From Other Bank <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={loanFromOtherBank}
                    onChange={(e) => setLoanFromOtherBank(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* 11. Message */}
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">11. Message</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Applicant message or loan inquiry details..."
                  className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:border-[#0981ae] focus:outline-none"
                />
              </div>

              {/* Admin Status & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Application Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected'
                      )
                    }
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Disbursed">Disbursed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Admin / Credit Officer Remarks
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Official evaluation remarks..."
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:border-[#0981ae] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs transition shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingLoan ? 'Save Changes' : 'Create Loan Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: OFFICIAL PRINTABLE / DOWNLOADABLE LOAN DOCUMENT
         ========================================================= */}
      <PrintableLoanDocument
        record={selectedLoanForPrint}
        isOpen={Boolean(selectedLoanForPrint)}
        onClose={() => setSelectedLoanForPrint(null)}
        coopLogoUrl={coopLogoUrl}
      />
    </div>
  );
};
