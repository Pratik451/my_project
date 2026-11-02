import React, { useState } from 'react';
import { EkymRecord } from '../../types';
import {
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Landmark,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  FileText,
  Copy,
  Check,
  Building2,
  Users,
  Camera,
  ZoomIn,
  Download,
  Image as ImageIcon,
  FileCheck,
  Printer
} from 'lucide-react';
import { PrintableKymDocument } from '../ekym/PrintableKymDocument';

interface EkymDetailsModalProps {
  record: EkymRecord | null;
  isOpen: boolean;
  onClose: () => void;
  coopLogoUrl?: string;
  onUpdateStatus: (
    id: string,
    status: 'Approved' | 'Rejected' | 'Returned',
    remarks: string
  ) => Promise<void> | void;
}

export const EkymDetailsModal: React.FC<EkymDetailsModalProps> = ({
  record,
  isOpen,
  onClose,
  coopLogoUrl,
  onUpdateStatus,
}) => {
  const [remarksInput, setRemarksInput] = useState('');
  const [copiedAppNo, setCopiedAppNo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'personal' | 'address' | 'financial' | 'coop'>('all');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  if (!isOpen || !record) return null;

  const details = record.details || {};

  const handleCopyAppNo = () => {
    navigator.clipboard.writeText(record.applicationNo);
    setCopiedAppNo(true);
    setTimeout(() => setCopiedAppNo(false), 2000);
  };

  const handleAction = async (status: 'Approved' | 'Rejected' | 'Returned') => {
    setIsSubmitting(true);
    try {
      const finalRemarks = remarksInput.trim()
        ? remarksInput.trim()
        : status === 'Approved'
        ? 'Verified all credentials, KYC documents, and approved by cooperative officer.'
        : status === 'Rejected'
        ? 'Rejected due to documentation mismatch or regulatory criteria.'
        : 'Returned to applicant for missing document resubmission.';

      await onUpdateStatus(record.id, status, finalRemarks);
      setRemarksInput('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <RotateCcw className="w-3.5 h-3.5" /> Returned for Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" /> Pending Verification
          </span>
        );
    }
  };

  return (
    <div
      id="ekym-details-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div
        id="ekym-details-modal-card"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Modal Header */}
        <div className="bg-[#0981ae] text-white p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded text-sky-100 uppercase tracking-wider">
                e-KYM Member Dossier
              </span>
              <button
                type="button"
                onClick={handleCopyAppNo}
                className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition text-sky-50 cursor-pointer"
                title="Copy Application Number"
              >
                <span className="font-mono font-bold">{record.applicationNo}</span>
                {copiedAppNo ? <Check className="w-3 h-3 text-sky-300" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-2 text-white flex items-baseline gap-2">
              {record.fullNameEn}
              {record.fullNameNp && (
                <span className="text-sm font-normal text-sky-100">({record.fullNameNp})</span>
              )}
            </h1>
            <p className="text-xs text-sky-100 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Submitted: {record.submittedAt}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {record.phone}
              </span>
              {record.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {record.email}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-print-ekym-header"
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20"
              title="Print or download complete registration form as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-sky-300" />
              <span>Print Application (PDF)</span>
            </button>
            <div>{getStatusBadge(record.status)}</div>
            <button
              id="btn-close-ekym-details"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 flex items-center gap-2 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'all'
                ? 'border-[#0981ae] text-[#0981ae] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            All Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-[#0981ae] text-[#0981ae] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#0981ae]" />
            <span>KYC Documents & Photo</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded-full font-bold">
              3
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'personal'
                ? 'border-[#0981ae] text-[#0981ae] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Personal & Lineage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'address'
                ? 'border-[#0981ae] text-[#0981ae] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Address & Contact
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'financial'
                ? 'border-[#0981ae] text-[#0981ae] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Financial & Business
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coop')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'coop'
                ? 'border-[#0981ae] text-[#0981ae] font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Cooperative & Nominee
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800 text-xs">
          {/* Current Remarks Banner */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-900 block">Administrative Remarks on Record:</span>
              <p className="text-amber-800 mt-0.5">
                {record.remarks || 'No specific remarks recorded yet.'}
              </p>
            </div>
          </div>

          {/* TAB: Uploaded KYC Documents & Photos */}
          {(activeTab === 'all' || activeTab === 'documents') && (
            <div id="admin-ekym-documents-section" className="bg-gradient-to-br from-sky-50/70 via-white to-slate-50 border-2 border-sky-500/30 rounded-xl p-4.5 space-y-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-sky-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#0981ae] text-white">
                    <Camera className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Mandatory Uploaded Documents & Applicant Photo</span>
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-300">
                        Statutory KYC
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cooperative KYC regulatory records: Passport Portrait, Citizenship Front, and Citizenship Back
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-semibold text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded border border-sky-300">
                    Grandfather: <strong className="text-slate-900">{record.grandfatherName || details.grandfatherName || 'Recorded'}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Member Photo */}
                <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between shadow-2xs hover:border-sky-400 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#0981ae]" />
                        <span>Applicant Photo</span>
                      </span>
                      {record.memberPhoto || details.memberPhoto ? (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                          Missing
                        </span>
                      )}
                    </div>

                    <div className="relative group rounded-lg overflow-hidden bg-slate-100 border border-slate-200 aspect-square max-h-48 mx-auto flex items-center justify-center">
                      {record.memberPhoto || details.memberPhoto ? (
                        <>
                          <img
                            src={record.memberPhoto || details.memberPhoto}
                            alt="Applicant"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImage({
                                url: record.memberPhoto || details.memberPhoto || '',
                                title: `Applicant Photo - ${record.fullNameEn}`
                              })}
                              className="px-2.5 py-1 rounded bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow hover:bg-slate-100 cursor-pointer"
                            >
                              <ZoomIn className="w-3.5 h-3.5" /> Enlarge
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <User className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span className="text-[11px] block">No Photo Uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Formal PP Portrait</span>
                    {record.memberPhoto || details.memberPhoto ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage({
                          url: record.memberPhoto || details.memberPhoto || '',
                          title: `Applicant Photo - ${record.fullNameEn}`
                        })}
                        className="text-[#0981ae] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ZoomIn className="w-3 h-3" /> View Full
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* 2. Citizenship Front */}
                <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between shadow-2xs hover:border-sky-400 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-[#0981ae]" />
                        <span>Citizenship (Front)</span>
                      </span>
                      {record.citizenshipFront || details.citizenshipFront ? (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                          Missing
                        </span>
                      )}
                    </div>

                    <div className="relative group rounded-lg overflow-hidden bg-slate-100 border border-slate-200 aspect-video max-h-48 mx-auto flex items-center justify-center">
                      {record.citizenshipFront || details.citizenshipFront ? (
                        <>
                          <img
                            src={record.citizenshipFront || details.citizenshipFront}
                            alt="Citizenship Front"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImage({
                                url: record.citizenshipFront || details.citizenshipFront || '',
                                title: `Citizenship (Front) - ${record.citizenshipNo}`
                              })}
                              className="px-2.5 py-1 rounded bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow hover:bg-slate-100 cursor-pointer"
                            >
                              <ZoomIn className="w-3.5 h-3.5" /> Enlarge
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span className="text-[11px] block">No Front Scan Uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate max-w-[120px]">No: {record.citizenshipNo}</span>
                    {record.citizenshipFront || details.citizenshipFront ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage({
                          url: record.citizenshipFront || details.citizenshipFront || '',
                          title: `Citizenship (Front) - ${record.citizenshipNo}`
                        })}
                        className="text-[#0981ae] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ZoomIn className="w-3 h-3" /> View Full
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* 3. Citizenship Back */}
                <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between shadow-2xs hover:border-sky-400 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-[#0981ae]" />
                        <span>Citizenship (Back)</span>
                      </span>
                      {record.citizenshipBack || details.citizenshipBack ? (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                          Missing
                        </span>
                      )}
                    </div>

                    <div className="relative group rounded-lg overflow-hidden bg-slate-100 border border-slate-200 aspect-video max-h-48 mx-auto flex items-center justify-center">
                      {record.citizenshipBack || details.citizenshipBack ? (
                        <>
                          <img
                            src={record.citizenshipBack || details.citizenshipBack}
                            alt="Citizenship Back"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImage({
                                url: record.citizenshipBack || details.citizenshipBack || '',
                                title: `Citizenship (Back) - ${record.citizenshipNo}`
                              })}
                              className="px-2.5 py-1 rounded bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow hover:bg-slate-100 cursor-pointer"
                            >
                              <ZoomIn className="w-3.5 h-3.5" /> Enlarge
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span className="text-[11px] block">No Back Scan Uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Official Endorsement</span>
                    {record.citizenshipBack || details.citizenshipBack ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage({
                          url: record.citizenshipBack || details.citizenshipBack || '',
                          title: `Citizenship (Back) - ${record.citizenshipNo}`
                        })}
                        className="text-[#0981ae] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ZoomIn className="w-3 h-3" /> View Full
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: Personal & Lineage */}
          {(activeTab === 'all' || activeTab === 'personal') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <User className="w-4 h-4 text-[#0981ae]" />
                <span>1. Personal & Lineage Information</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <span className="text-slate-500 block">Full Name (English):</span>
                  <span className="font-semibold text-slate-900">{record.fullNameEn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Full Name (Nepali):</span>
                  <span className="font-semibold text-slate-900">{record.fullNameNp || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth:</span>
                  <span className="font-semibold text-slate-900">{record.dob}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender:</span>
                  <span className="font-semibold text-slate-900">{record.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Father's Name:</span>
                  <span className="font-semibold text-slate-900">{record.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mother's Name:</span>
                  <span className="font-semibold text-slate-900">{record.motherName || details.motherName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Grandfather's Name:</span>
                  <span className="font-semibold text-slate-900">{record.grandfatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Marital Status:</span>
                  <span className="font-semibold text-slate-900">{details.maritalStatus || 'Married'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Spouse Name:</span>
                  <span className="font-semibold text-slate-900">{record.spouseName || details.spouseName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Education Qualification:</span>
                  <span className="font-semibold text-slate-900">{details.education || 'Graduate'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Occupation:</span>
                  <span className="font-semibold text-slate-900">{record.occupation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PAN Number:</span>
                  <span className="font-semibold text-slate-900">{details.panNumber || '—'}</span>
                </div>
              </div>

              {/* Citizenship Block */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Citizenship / Identification Card:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Citizenship Number:</span>
                    <span className="font-bold text-sky-800">{record.citizenshipNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Issuing District:</span>
                    <span className="font-semibold text-slate-800">{record.citizenshipDistrict}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Issue Date:</span>
                    <span className="font-semibold text-slate-800">{details.citizenshipIssueDate || 'Verified'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Address Information */}
          {(activeTab === 'all' || activeTab === 'address') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <MapPin className="w-4 h-4 text-[#0981ae]" />
                <span>2. Address & Contact Information</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                    Permanent Address (स्थायी ठेगाना)
                  </span>
                  <p className="text-slate-700 font-medium">{record.permanentAddress}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <div className="bg-sky-50/80 border border-sky-200 rounded-md px-2.5 py-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Province (प्रदेश)</span>
                      <strong className="text-xs text-[#0981ae]">
                        {record.permProvince || details.permProvince || 'Lumbini Province'}
                      </strong>
                    </div>
                    <div className="bg-sky-50/80 border border-sky-200 rounded-md px-2.5 py-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">District (जिल्ला)</span>
                      <strong className="text-xs text-slate-900">
                        {record.permDistrict || details.permDistrict || record.citizenshipDistrict || 'Rupandehi'}
                      </strong>
                    </div>
                  </div>
                  {(details.permMunicipality || details.permWard || details.permTole) && (
                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                      <div>Municipality: {details.permMunicipality || '—'}, Ward No: {details.permWard || '—'}</div>
                      <div>Tole / Street: {details.permTole || '—'}</div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
                    Current / Temporary Address (हालको ठेगाना)
                  </span>
                  <p className="text-slate-700 font-medium">{record.currentAddress}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <div className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Province (प्रदेश)</span>
                      <strong className="text-xs text-slate-800">
                        {record.tempProvince ||
                          (details.sameAsPermanent ? details.permProvince : details.tempProvince) ||
                          record.permProvince ||
                          'Lumbini Province'}
                      </strong>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">District (जिल्ला)</span>
                      <strong className="text-xs text-slate-800">
                        {record.tempDistrict ||
                          (details.sameAsPermanent ? details.permDistrict : details.tempDistrict) ||
                          record.permDistrict ||
                          record.citizenshipDistrict ||
                          'Rupandehi'}
                      </strong>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    {details.sameAsPermanent ? (
                      <span className="text-sky-700 font-semibold">✓ Same as Permanent Address</span>
                    ) : (
                      <div>
                        <div>Municipality: {details.tempMunicipality || '—'}, Ward: {details.tempWard || '—'}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block">Mobile Phone:</span>
                  <span className="font-bold text-sky-800">{record.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address:</span>
                  <span className="font-semibold text-slate-800">{record.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emergency Contact:</span>
                  <span className="font-semibold text-slate-800">
                    {details.emergencyContactPerson
                      ? `${details.emergencyContactPerson} (${details.emergencyContactPhone || 'N/A'})`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Business & Financial Details */}
          {(activeTab === 'all' || activeTab === 'financial') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                  <DollarSign className="w-4 h-4 text-[#0981ae]" />
                  <span>3. Income & Financial Profile</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block">Primary Income Source:</span>
                    <span className="font-semibold text-slate-900">{details.primaryIncomeSource || 'Business / Trade'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Estimated Monthly Income:</span>
                    <span className="font-bold text-slate-900">{details.estimatedMonthlyIncome || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Estimated Annual Income:</span>
                    <span className="font-bold text-[#0981ae]">{record.annualIncome}</span>
                  </div>
                </div>

                {/* Existing Bank Account Info */}
                <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Commercial Bank Account Reference:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>Bank: <strong className="text-slate-900">{record.bankName}</strong></div>
                    <div>Account No: <strong className="text-slate-900">{record.bankAccountNo}</strong></div>
                    <div>Account Holder: <strong className="text-slate-900">{details.bankAccountName || record.fullNameEn}</strong></div>
                  </div>
                </div>
              </div>

              {/* Business Details (if any) */}
              <div className="pt-3 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-[#0981ae]" />
                  <span>Corporate / Business Enterprise Details</span>
                  <span className={`ml-2 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                    details.hasBusiness === 'Yes' ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {details.hasBusiness === 'Yes' ? 'Active Enterprise' : 'No Business Declared'}
                  </span>
                </h3>
                {details.hasBusiness === 'Yes' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Business Name:</span>
                      <span className="font-semibold text-slate-900">{details.businessName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Firm Type:</span>
                      <span className="font-semibold text-slate-900">{details.businessType || 'Sole Proprietorship'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Reg. No / Authority:</span>
                      <span className="font-semibold text-slate-900">{details.registrationNo || '—'} ({details.registeredAuthority || 'Govt.'})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PAN / VAT Number:</span>
                      <span className="font-semibold text-slate-900">{details.panVatNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Annual Turnover:</span>
                      <span className="font-semibold text-slate-900">{details.annualTurnover || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Designation:</span>
                      <span className="font-semibold text-slate-900">{details.designationInFirm || 'Proprietor'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Applicant opted "No" for corporate enterprise involvement.</p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: Cooperative Preferences & Nominee */}
          {(activeTab === 'all' || activeTab === 'coop') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                  <Landmark className="w-4 h-4 text-[#0981ae]" />
                  <span>4. Cooperative Transaction Preferences</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Preferred Cooperative Branch:</span>
                    <span className="font-bold text-slate-900">{details.preferredBranch || 'Main Central Branch (Butwal)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Savings Scheme Selected:</span>
                    <span className="font-bold text-[#0981ae]">{details.accountTypeInterest || 'Ankur Regular Savings Scheme'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Expected Monthly Deposit:</span>
                    <span className="font-semibold text-slate-900">{details.expectedMonthlyDeposit || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Expected Annual Turnover:</span>
                    <span className="font-semibold text-slate-900">{details.expectedAnnualTurnover || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Nominee Details */}
              <div className="pt-3 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-[#0981ae]" />
                  <span>Designated Nominee (हकवाला विवरण)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Nominee Full Name:</span>
                    <span className="font-bold text-slate-900">{record.nomineeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Relationship:</span>
                    <span className="font-semibold text-slate-800">{record.nomineeRelation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nominee Citizenship No:</span>
                    <span className="font-semibold text-slate-800">{record.nomineeCitizenship || details.nomineeCitizenship || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: Admin Decision & Remarks Action Block */}
          <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#0981ae] uppercase tracking-wider flex items-center gap-1.5">
              <span>✍</span>
              <span>Administrative Decision & Status Update</span>
            </h3>

            <div>
              <label htmlFor="admin-remarks-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Custom Remarks for this Decision:
              </label>
              <textarea
                id="admin-remarks-input"
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                placeholder="e.g. Approved: All citizenship documents verified. or Rejected: Address mismatch with voter card."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0981ae] bg-white text-slate-900"
                rows={2}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <span className="text-[11px] text-slate-500">
                Selected applicant ID: <strong>{record.id}</strong> ({record.applicationNo})
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="btn-modal-return-ekym"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAction('Returned')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Return for Revision
                </button>
                <button
                  id="btn-modal-reject-ekym"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAction('Rejected')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  id="btn-modal-approve-ekym"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleAction('Approved')}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve Membership
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Ankur Saving & Credit Cooperative Ltd. &bull; Statutory KYC Management
          </span>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-ekym-footer"
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Registration Dossier (PDF)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-semibold border border-slate-300 transition cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Printable Official Application Modal */}
      <PrintableKymDocument
        record={record}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        coopLogoUrl={coopLogoUrl}
      />

      {/* Lightbox / High-Resolution Zoom Modal for Documents & Photo */}
      {previewImage && (
        <div
          id="ekym-document-lightbox"
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold truncate">{previewImage.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  download="ekym-document"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1"
                  title="Open Original"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-950/90 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded shadow"
              />
            </div>
            <div className="bg-slate-900 text-slate-400 text-xs px-5 py-2.5 flex items-center justify-between border-t border-slate-800">
              <span>Verified cooperative dossier document</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
