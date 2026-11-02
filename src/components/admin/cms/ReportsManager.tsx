import React, { useState, useRef } from 'react';
import { ReportCMS } from '../../../types';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Download,
  Calendar,
  HardDrive,
  Eye,
  Upload,
  AlertCircle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { uploadMediaFiles, deleteMediaByPath } from '../../../services/mediaApi';

interface Props {
  reports: ReportCMS[];
  onSaveReports: (updated: ReportCMS[]) => Promise<void> | void;
}

export const ReportsManager: React.FC<Props> = ({ reports, onSaveReports }) => {
  const [list, setList] = useState<ReportCMS[]>(reports);
  const [editingReport, setEditingReport] = useState<ReportCMS | null>(null);
  const [viewingReport, setViewingReport] = useState<ReportCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [replacingReportId, setReplacingReportId] = useState<string | null>(null);

  const docInputRef = useRef<HTMLInputElement>(null);
  const cardReplaceInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (reports) {
      setList(reports);
    }
  }, [reports]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = (categoryDefault: 'monthly' | 'progress' | 'annual' | 'audit' = 'annual') => {
    const currentFiscalYear = '2081/82 B.S.';
    setEditingReport({
      id: `rep-${Date.now()}`,
      titleEn: '',
      titleNp: '',
      category: categoryDefault,
      fiscalYear: currentFiscalYear,
      fileSize: '',
      fileUrl: '',
      publishDate: '2081 Ashwin',
      descriptionEn: '',
      descriptionNp: '',
    });
    setIsNew(true);
  };

  const handleOpenEdit = (report: ReportCMS) => {
    setEditingReport({ ...report });
    setIsNew(false);
  };

  const [repToDelete, setRepToDelete] = useState<ReportCMS | null>(null);

  const handleDelete = (report: ReportCMS) => {
    setRepToDelete(report);
  };

  const handleConfirmDelete = async () => {
    if (!repToDelete) return;
    const target = repToDelete;
    const updated = list.filter((r) => r.id !== target.id);
    setList(updated);
    setRepToDelete(null);
    setIsSaving(true);
    try {
      if (target.fileUrl && target.fileUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(target.fileUrl);
      }
      await onSaveReports(updated);
      showToast('Report publication and server file deleted and MySQL database updated!');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingReport) return;

    setIsUploadingDoc(true);
    try {
      const oldUrl = editingReport.fileUrl;
      const uploaded = await uploadMediaFiles([file], 'document', editingReport.titleEn || file.name);
      if (uploaded && uploaded.length > 0) {
        if (oldUrl && oldUrl.startsWith('/uploads/')) {
          await deleteMediaByPath(oldUrl);
        }
        const item = uploaded[0];
        const bytes = item.fileSize || file.size;
        const sizeMb =
          bytes < 1024 * 1024
            ? `${Math.max(1, Math.round(bytes / 1024))} KB`
            : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        setEditingReport({
          ...editingReport,
          fileUrl: item.filePath,
          fileSize: sizeMb,
          titleEn: editingReport.titleEn || file.name.replace(/\.[^/.]+$/, ''),
        });
        showToast('Report file uploaded permanently to server!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Document upload failed', 'error');
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleDeleteAttachedFileInModal = async () => {
    if (!editingReport || !editingReport.fileUrl) return;
    setIsUploadingDoc(true);
    try {
      if (editingReport.fileUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(editingReport.fileUrl);
      }
      setEditingReport({
        ...editingReport,
        fileUrl: '',
        fileSize: '',
      });
      showToast('Attached file removed from server. Upload a new file before saving.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete file', 'error');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const triggerCardFileReplace = (reportId: string) => {
    setReplacingReportId(reportId);
    if (cardReplaceInputRef.current) {
      cardReplaceInputRef.current.value = '';
      cardReplaceInputRef.current.click();
    }
  };

  const handleCardFileReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingReportId) return;
    setIsSaving(true);
    try {
      const targetReport = list.find((r) => r.id === replacingReportId);
      const uploaded = await uploadMediaFiles([file], 'document', targetReport?.titleEn || file.name);
      if (uploaded && uploaded.length > 0) {
        if (targetReport?.fileUrl && targetReport.fileUrl.startsWith('/uploads/')) {
          await deleteMediaByPath(targetReport.fileUrl);
        }
        const item = uploaded[0];
        const bytes = item.fileSize || file.size;
        const sizeStr =
          bytes < 1024 * 1024
            ? `${Math.max(1, Math.round(bytes / 1024))} KB`
            : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        const updatedList = list.map((r) =>
          r.id === replacingReportId
            ? { ...r, fileUrl: item.filePath, fileSize: sizeStr }
            : r
        );
        setList(updatedList);
        await onSaveReports(updatedList);
        showToast('Report file replaced on server disk and saved in MySQL database!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to replace report file', 'error');
    } finally {
      setIsSaving(false);
      setReplacingReportId(null);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    if (!editingReport.titleEn.trim()) {
      showToast('Report Title (English) is required.', 'error');
      return;
    }

    if (!editingReport.fileUrl) {
      showToast('Please upload a report document file before saving.', 'error');
      return;
    }

    let updated: ReportCMS[];
    if (isNew) {
      updated = [editingReport, ...list];
    } else {
      updated = list.map((r) => (r.id === editingReport.id ? editingReport : r));
    }

    setList(updated);
    setEditingReport(null);
    setIsSaving(true);
    try {
      await onSaveReports(updated);
      showToast(
        isNew
          ? 'New publication report uploaded and saved to MySQL database!'
          : 'Report details and file path updated in MySQL database!'
      );
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredList =
    filterCategory === 'all'
      ? list
      : list.filter((r) => r.category === filterCategory);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'monthly':
        return { label: 'Monthly Report (मासिक)', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'progress':
        return { label: 'Progress Report (प्रगति)', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'annual':
        return { label: 'Annual Report (वार्षिक)', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'audit':
        return { label: 'Audit Report (लेखापरीक्षण)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: cat.toUpperCase(), color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div id="reports-manager" className="space-y-6">
      {/* Hidden File Input for Card Direct Replace */}
      <input
        ref={cardReplaceInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
        onChange={handleCardFileReplace}
        className="hidden"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border animate-in fade-in ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-500'
              : 'bg-slate-900 text-white border-sky-500'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0981ae]" />
            Reports & Publications CMS Manager (प्रतिवेदन तथा प्रकाशन व्यवस्थापन)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload, preview, replace, and delete Monthly Reports, Progress Reports, Annual AGM Reports, and Statutory Audit Statements stored permanently on the server & MySQL.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleOpenAdd('monthly')}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-xs shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Monthly
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('progress')}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl text-xs shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Progress
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('annual')}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-xs shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Annual
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('audit')}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-medium rounded-xl text-xs shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Audit
          </button>
          <button
            type="button"
            onClick={() => handleOpenAdd('annual')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white font-medium rounded-xl text-xs shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload New Report
          </button>
        </div>
      </div>

      {/* Primary Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        {[
          { key: 'all', label: `All Reports (${list.length})` },
          { key: 'monthly', label: `Monthly Report (${list.filter((r) => r.category === 'monthly').length})` },
          { key: 'progress', label: `Progress Report (${list.filter((r) => r.category === 'progress').length})` },
          { key: 'annual', label: `Annual Report (${list.filter((r) => r.category === 'annual').length})` },
          { key: 'audit', label: `Audit Report (${list.filter((r) => r.category === 'audit').length})` },
        ].map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setFilterCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterCategory === cat.key
                ? 'bg-[#0981ae] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredList.map((rep) => {
          const badge = getCategoryBadge(rep.category);
          return (
            <div
              key={rep.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#0981ae]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                        {rep.fiscalYear}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{rep.titleEn}</h3>
                    <p className="text-xs text-slate-600 font-nepali">{rep.titleNp}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingReport(rep)}
                      className="p-1.5 text-slate-500 hover:text-[#0981ae] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      title="Preview Report & File"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerCardFileReplace(rep.id)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      title="Replace Report File"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rep)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Report"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rep)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Report & File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {rep.descriptionEn && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{rep.descriptionEn}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    <span>{rep.fileSize || 'Uploaded File'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{rep.publishDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]" title={rep.fileUrl}>
                  {rep.fileUrl}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewingReport(rep)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <a
                    href={rep.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No reports found for this category</p>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Upload New Report&quot; above to upload and publish a report.</p>
        </div>
      )}

      {/* VIEW REPORT DETAILS & FILE PREVIEW MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0981ae]" />
                Report Publication & File Preview
              </h3>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-white text-[#0981ae] border border-sky-200">
                    {viewingReport.category.toUpperCase()} REPORT
                  </span>
                  <span className="font-mono font-bold text-sky-800">{viewingReport.fiscalYear}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{viewingReport.titleEn}</h4>
                <p className="text-xs text-slate-600 font-nepali">{viewingReport.titleNp}</p>
              </div>

              {/* Embedded File Preview */}
              {viewingReport.fileUrl && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span className="truncate">{viewingReport.fileUrl}</span>
                    <span className="font-bold text-sky-700 shrink-0">{viewingReport.fileSize}</span>
                  </div>
                  {/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(viewingReport.fileUrl) ? (
                    <div className="p-4 flex justify-center bg-white">
                      <img
                        src={viewingReport.fileUrl}
                        alt={viewingReport.titleEn}
                        className="max-h-72 object-contain rounded"
                      />
                    </div>
                  ) : /\.pdf$/i.test(viewingReport.fileUrl) ? (
                    <iframe
                      src={viewingReport.fileUrl}
                      title={viewingReport.titleEn}
                      className="w-full h-72 bg-white"
                    />
                  ) : null}
                </div>
              )}

              {viewingReport.descriptionEn && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <strong className="block text-slate-700 font-bold mb-1">Executive Summary:</strong>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">{viewingReport.descriptionEn}</p>
                </div>
              )}

              {viewingReport.descriptionNp && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-nepali">
                  <strong className="block text-slate-700 font-bold mb-1 font-sans">नेपाली सारांश:</strong>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">{viewingReport.descriptionNp}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Publish Date</span>
                  <strong className="text-slate-800">{viewingReport.publishDate}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">File Attachment Size</span>
                  <strong className="text-slate-800">{viewingReport.fileSize}</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={viewingReport.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0981ae] text-white text-xs font-bold rounded-lg hover:bg-[#07678d] transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Document
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const id = viewingReport.id;
                    setViewingReport(null);
                    triggerCardFileReplace(id);
                  }}
                  className="px-3 py-2 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold rounded-lg hover:bg-sky-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace File
                </button>
              </div>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT REPORT */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                {isNew ? 'Upload New Report Publication' : 'Edit Report Publication'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Category *
                  </label>
                  <select
                    value={editingReport.category}
                    onChange={(e) =>
                      setEditingReport({
                        ...editingReport,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0981ae]"
                  >
                    <option value="monthly">Monthly Report (मासिक प्रतिवेदन)</option>
                    <option value="progress">Progress Report (प्रगति प्रतिवेदन)</option>
                    <option value="annual">Annual Report (वार्षिक प्रतिवेदन)</option>
                    <option value="audit">Audit Report (लेखापरीक्षण प्रतिवेदन)</option>
                    <option value="bylaws">Bylaws & Governance (विनियम)</option>
                    <option value="form">Downloadable Form (फाराम)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Fiscal Year / Issue *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReport.fiscalYear}
                    onChange={(e) =>
                      setEditingReport({ ...editingReport, fiscalYear: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0981ae]"
                    placeholder="e.g. 2081/82 B.S."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Report Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingReport.titleEn}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, titleEn: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0981ae]"
                  placeholder="e.g. Monthly Financial Highlights (Ashwin 2081)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  प्रतिवेदन शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  value={editingReport.titleNp}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, titleNp: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali outline-none focus:border-[#0981ae]"
                  placeholder="उदा. मासिक वित्तीय कारोबार तथा बचत संकलन सारांश"
                />
              </div>

              {/* Document File Upload, Preview, Replace & Delete */}
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-sky-300 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#0981ae]" />
                    Report Document File (PDF, DOCX, XLSX, CSV, Image) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      disabled={isUploadingDoc}
                      className="text-xs bg-[#0981ae] text-white hover:bg-[#07678d] px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingDoc
                        ? 'Uploading to Server...'
                        : editingReport.fileUrl
                        ? 'Replace File'
                        : 'Upload File from Device'}
                    </button>
                    {editingReport.fileUrl && (
                      <>
                        <a
                          href={editingReport.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-700" />
                          Preview
                        </a>
                        <button
                          type="button"
                          onClick={handleDeleteAttachedFileInModal}
                          disabled={isUploadingDoc}
                          className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete File
                        </button>
                      </>
                    )}
                  </div>
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {editingReport.fileUrl ? (
                  <div className="p-3 bg-white rounded-lg border border-sky-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          Stored on Server: <span className="font-mono text-sky-800">{editingReport.fileUrl}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          File Size: {editingReport.fileSize || 'Uploaded'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => docInputRef.current?.click()}
                    className="p-4 bg-white rounded-lg border border-slate-200 text-center cursor-pointer hover:border-sky-500 transition"
                  >
                    <p className="text-xs font-semibold text-slate-600">
                      No file attached yet. Click here or &quot;Upload File from Device&quot; to upload PDF, DOCX, XLSX, or image.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Publish Date / Month *
                </label>
                <input
                  type="text"
                  value={editingReport.publishDate}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, publishDate: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0981ae]"
                  placeholder="e.g. Ashwin 2081 B.S."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Summary Description (English)
                </label>
                <textarea
                  rows={2}
                  value={editingReport.descriptionEn || ''}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, descriptionEn: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#0981ae]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  विवरण (नेपाली)
                </label>
                <textarea
                  rows={2}
                  value={editingReport.descriptionNp || ''}
                  onChange={(e) =>
                    setEditingReport({ ...editingReport, descriptionNp: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali outline-none focus:border-[#0981ae]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving to Database...' : isNew ? 'Publish Report' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {repToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">Delete Report Publication?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently remove{' '}
              <strong className="text-slate-900">"{repToDelete.titleEn}"</strong>? This will remove the file link from the website and update the database immediately.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRepToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
