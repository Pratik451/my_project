import React, { useState, useEffect, useRef } from 'react';
import { DocumentItemCMS } from '../../../types';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  X,
  FileCode,
  Calendar,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import {
  uploadMediaFiles,
  saveCmsDocuments,
  deleteMediaByPath,
} from '../../../services/mediaApi';

interface Props {
  documents?: DocumentItemCMS[];
  onSaveDocuments?: (docs: DocumentItemCMS[]) => void;
}

export const DocumentsManager: React.FC<Props> = ({
  documents,
  onSaveDocuments,
}) => {
  const [list, setList] = useState<DocumentItemCMS[]>(documents || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Active items
  const [viewingDoc, setViewingDoc] = useState<DocumentItemCMS | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItemCMS | null>(null);

  // Replacement state
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Upload modal file state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (documents) setList(documents);
  }, [documents]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingDoc({
      id: `doc-${Date.now()}`,
      titleEn: '',
      titleNp: '',
      category: 'reports',
      fileUrl: '',
      fileSize: '1.5 MB',
      publishDate: '2081 Ashwin',
      fiscalYear: '2081/82 B.S.',
      descriptionEn: '',
      descriptionNp: '',
    });
    setUploadFile(null);
    setIsNew(true);
  };

  const handleOpenEdit = (doc: DocumentItemCMS) => {
    setEditingDoc({ ...doc });
    setUploadFile(null);
    setIsNew(false);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    if (!editingDoc.titleEn.trim()) {
      showToast('Document Title (English) is required.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let finalUrl = editingDoc.fileUrl;
      let finalSize = editingDoc.fileSize;

      // If a new physical file was chosen
      if (uploadFile) {
        if (!isNew && editingDoc.fileUrl && editingDoc.fileUrl.startsWith('/uploads/')) {
          await deleteMediaByPath(editingDoc.fileUrl);
        }
        const uploaded = await uploadMediaFiles([uploadFile], 'document', editingDoc.titleEn);
        if (uploaded && uploaded.length > 0) {
          finalUrl = uploaded[0].filePath;
          const bytes = uploaded[0].fileSize || uploadFile.size;
          finalSize =
            bytes < 1024 * 1024
              ? `${Math.max(1, Math.round(bytes / 1024))} KB`
              : (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
      }

      if (!finalUrl) {
        showToast('Please upload a document file before saving.', 'error');
        setIsUploading(false);
        return;
      }

      const updatedDoc: DocumentItemCMS = {
        ...editingDoc,
        fileUrl: finalUrl,
        fileSize: finalSize || '1.0 MB',
        titleNp: editingDoc.titleNp.trim() || editingDoc.titleEn.trim(),
      };

      let nextList: DocumentItemCMS[];
      if (isNew) {
        nextList = [updatedDoc, ...list];
      } else {
        nextList = list.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
      }

      setList(nextList);
      await saveCmsDocuments(nextList);
      if (onSaveDocuments) onSaveDocuments(nextList);

      setEditingDoc(null);
      setUploadFile(null);
      showToast(
        isNew
          ? 'New official document uploaded and saved to MySQL database!'
          : 'Document record and server file updated in MySQL database!'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to save document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsUploading(true);
    try {
      if (docToDelete.fileUrl && docToDelete.fileUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(docToDelete.fileUrl);
      }
      const nextList = list.filter((d) => d.id !== docToDelete.id);
      setList(nextList);
      await saveCmsDocuments(nextList);
      if (onSaveDocuments) onSaveDocuments(nextList);
      setDocToDelete(null);
      showToast('Document deleted from server disk and MySQL database updated!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileReplacement = (docId: string) => {
    setReplacingDocId(docId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handleFileReplacement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingDocId) return;

    setIsUploading(true);
    try {
      const targetDoc = list.find((d) => d.id === replacingDocId);
      // Upload new physical file
      const uploaded = await uploadMediaFiles([file], 'document', targetDoc?.titleEn || file.name);
      if (uploaded && uploaded.length > 0) {
        if (targetDoc?.fileUrl && targetDoc.fileUrl.startsWith('/uploads/')) {
          await deleteMediaByPath(targetDoc.fileUrl);
        }
        const item = uploaded[0];
        const bytes = item.fileSize || file.size;
        const sizeStr =
          bytes < 1024 * 1024
            ? `${Math.max(1, Math.round(bytes / 1024))} KB`
            : (bytes / (1024 * 1024)).toFixed(1) + ' MB';

        const nextList = list.map((doc) => {
          if (doc.id === replacingDocId) {
            return {
              ...doc,
              fileUrl: item.filePath,
              fileSize: sizeStr,
            };
          }
          return doc;
        });

        setList(nextList);
        await saveCmsDocuments(nextList);
        if (onSaveDocuments) onSaveDocuments(nextList);
        showToast('Document file replaced with new version on server disk and MySQL database!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to replace file', 'error');
    } finally {
      setIsUploading(false);
      setReplacingDocId(null);
    }
  };

  // Filter list
  const filteredList = list.filter((doc) => {
    const catMatch = selectedCategory === 'all' || doc.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const searchMatch =
      !q ||
      doc.titleEn.toLowerCase().includes(q) ||
      doc.titleNp.toLowerCase().includes(q) ||
      doc.fiscalYear?.toLowerCase().includes(q) ||
      doc.descriptionEn?.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'reports':
        return { label: 'Report / Publication', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'bylaws':
        return { label: 'Bylaw / Regulation', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'forms':
        return { label: 'Physical Form', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'directives':
        return { label: 'Regulatory Directive', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'General Document', color: 'bg-slate-50 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Direct Replacement */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        onChange={handleFileReplacement}
        className="hidden"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border shadow-md animate-in fade-in ${
            toast.type === 'success'
              ? 'bg-sky-50 text-sky-900 border-sky-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-[#0981ae] rounded-lg">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Official Document & File Vault Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload, view, download, replace, and delete institutional PDFs, Bylaws, Account Opening Forms, AGM Books, and Directives.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload New Document
        </button>
      </div>

      {/* Search and Category Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { key: 'all', label: `All Files (${list.length})` },
            { key: 'reports', label: `Reports (${list.filter((d) => d.category === 'reports').length})` },
            { key: 'bylaws', label: `Bylaws (${list.filter((d) => d.category === 'bylaws').length})` },
            { key: 'forms', label: `Forms (${list.filter((d) => d.category === 'forms').length})` },
            { key: 'directives', label: `Directives (${list.filter((d) => d.category === 'directives').length})` },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#0981ae] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document title or keyword..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-600"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((doc) => {
          const badge = getCategoryBadge(doc.category);
          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {doc.fiscalYear && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {doc.fiscalYear}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{doc.titleEn}</h3>
                    <p className="text-xs text-slate-600 font-nepali">{doc.titleNp}</p>
                  </div>

                  {/* Actions: View, Edit, Replace, Download, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingDoc(doc)}
                      className="p-1.5 text-slate-500 hover:text-[#0981ae] hover:bg-sky-50 rounded-lg transition cursor-pointer"
                      title="Preview Document Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(doc)}
                      className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                      title="Edit Document Info"
                    >
                      <FileCode className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerFileReplacement(doc.id)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                      title="Replace Document File"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <a
                      href={doc.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-[#0981ae] hover:bg-sky-50 rounded-lg transition"
                      title="Direct Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {doc.descriptionEn && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{doc.descriptionEn}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px]">
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.fileSize || 'PDF Document'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.publishDate || 'Published'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No documents found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;Upload New Document&quot; above to add files to the cooperative archive.
          </p>
        </div>
      )}

      {/* VIEW PREVIEW MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0981ae]" />
                Official Document Preview
              </h3>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                <span className="text-xs font-bold text-sky-800 uppercase block mb-1">
                  {viewingDoc.category}
                </span>
                <h4 className="text-base font-bold text-slate-900">{viewingDoc.titleEn}</h4>
                <p className="text-xs text-slate-600 font-nepali mt-0.5">{viewingDoc.titleNp}</p>
              </div>

              {viewingDoc.descriptionEn && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <strong className="block text-slate-800 mb-1">Overview:</strong>
                  {viewingDoc.descriptionEn}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">File Size</span>
                  <strong className="text-slate-800">{viewingDoc.fileSize}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Fiscal Year / Date</span>
                  <strong className="text-slate-800">{viewingDoc.fiscalYear || viewingDoc.publishDate}</strong>
                </div>
              </div>

              {viewingDoc.fileUrl && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5">
                  {/\.(png|jpe?g|gif|webp|svg)$/i.test(viewingDoc.fileUrl) ? (
                    <img
                      src={viewingDoc.fileUrl}
                      alt={viewingDoc.titleEn}
                      className="w-full max-h-72 object-contain mx-auto p-2"
                    />
                  ) : /\.pdf$/i.test(viewingDoc.fileUrl) ? (
                    <iframe
                      src={viewingDoc.fileUrl}
                      title={viewingDoc.titleEn}
                      className="w-full h-72 border-0"
                    />
                  ) : null}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono break-all text-slate-600">
                <span className="text-slate-400 block text-[10px] font-sans">Server Storage Path (MySQL):</span>
                {viewingDoc.fileUrl}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              {viewingDoc.fileUrl && (
                <a
                  href={viewingDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Preview
                </a>
              )}
              <a
                href={viewingDoc.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Document
              </a>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD / EDIT MODAL */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0981ae]" />
                {isNew ? 'Upload Official Document to Vault' : 'Edit Document Details'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Document Title (English) *</label>
                <input
                  type="text"
                  value={editingDoc.titleEn}
                  onChange={(e) => setEditingDoc({ ...editingDoc, titleEn: e.target.value })}
                  placeholder="e.g. 24th AGM Comprehensive Audited Report"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600 font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-nepali">कागजात शीर्षक (नेपाली) *</label>
                <input
                  type="text"
                  value={editingDoc.titleNp}
                  onChange={(e) => setEditingDoc({ ...editingDoc, titleNp: e.target.value })}
                  placeholder="उदा: २४औं वार्षिक साधारण सभाको प्रतिवेदन पुस्तक"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600 font-nepali"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={editingDoc.category}
                    onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600"
                  >
                    <option value="reports">Reports / Publications</option>
                    <option value="bylaws">Bylaws / Regulations</option>
                    <option value="forms">Physical Forms</option>
                    <option value="directives">Regulatory Directives</option>
                    <option value="general">General Archive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Fiscal Year / Reference</label>
                  <input
                    type="text"
                    value={editingDoc.fiscalYear || ''}
                    onChange={(e) => setEditingDoc({ ...editingDoc, fiscalYear: e.target.value })}
                    placeholder="e.g. 2080/81 B.S."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              {/* Physical File Attachment with Upload, Preview, Replace, Delete */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Official Document File (PDF, DOCX, XLSX, CSV, Image) *
                  </label>
                  {(editingDoc.fileUrl || uploadFile) && (
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                      {uploadFile ? 'New File Selected' : 'Stored on Server'}
                    </span>
                  )}
                </div>

                {uploadFile ? (
                  <div className="p-3 bg-white rounded-xl border border-sky-200 flex items-center justify-between gap-2">
                    <div className="text-xs truncate">
                      <p className="font-bold text-slate-800 truncate">{uploadFile.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {(uploadFile.size / 1024).toFixed(1)} KB • Ready to upload to server
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Replace
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setUploadFile(f);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ) : editingDoc.fileUrl ? (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-600 truncate">
                        {editingDoc.fileUrl}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {editingDoc.fileSize}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={editingDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Preview File
                      </a>
                      <label className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Replace File
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setUploadFile(f);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          if (editingDoc.fileUrl.startsWith('/uploads/')) {
                            await deleteMediaByPath(editingDoc.fileUrl);
                          }
                          setEditingDoc({ ...editingDoc, fileUrl: '' });
                          showToast('Attached file removed from server. Please upload a replacement file.');
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete File
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 hover:border-sky-500 cursor-pointer transition">
                    <Upload className="w-6 h-6 text-[#0981ae] mb-1" />
                    <span className="text-xs font-bold text-slate-700">Click to Upload Document File</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PDF, Word, Excel, CSV, or Image — Stored permanently on server &amp; MySQL
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploadFile(f);
                          if (!editingDoc.titleEn) {
                            setEditingDoc({
                              ...editingDoc,
                              titleEn: f.name.replace(/\.[^/.]+$/, ''),
                            });
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Summary / Description (English)</label>
                <textarea
                  rows={2}
                  value={editingDoc.descriptionEn || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, descriptionEn: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="px-0 pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading to Server...' : isNew ? 'Upload & Save' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Delete Document?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently remove &quot;{docToDelete.titleEn}&quot;? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
