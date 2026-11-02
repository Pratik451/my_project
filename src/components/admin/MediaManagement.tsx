import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Edit2,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { MediaFile } from '../../types';
import {
  fetchMediaFiles,
  uploadMediaFiles,
  updateMediaMetadata,
  deleteMediaFile,
  replaceMediaFile,
  saveWebsiteLogoUrl,
} from '../../services/mediaApi';

interface MediaManagementProps {
  onExitToWebsite?: () => void;
  currentLogoUrl?: string;
  onUpdateLogo?: (newLogoUrl: string) => void;
}

export const MediaManagement: React.FC<MediaManagementProps> = ({
  onExitToWebsite,
  currentLogoUrl,
  onUpdateLogo,
}) => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<string>('general');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lightbox / Inspect State
  const [previewItem, setPreviewItem] = useState<MediaFile | null>(null);

  // Edit Metadata Modal State
  const [editingItem, setEditingItem] = useState<MediaFile | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('general');
  const [editAltText, setEditAltText] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<MediaFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Copy status feedback
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Banner status
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingItem, setReplacingItem] = useState<MediaFile | null>(null);
  const [isReplacing, setIsReplacing] = useState<boolean>(false);

  const handleTriggerReplace = (item: MediaFile) => {
    setReplacingItem(item);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingItem) return;
    setIsReplacing(true);
    setStatusMessage(null);
    try {
      const updated = await replaceMediaFile(replacingItem.id, file);
      const newPath = (updated as any)?.file_path || (updated as any)?.filePath;
      if (
        newPath &&
        (replacingItem.category === 'branding' ||
          replacingItem.mediaKey === 'logo-default' ||
          replacingItem.title.toLowerCase().includes('logo'))
      ) {
        const savedLogo = await saveWebsiteLogoUrl(newPath);
        if (onUpdateLogo) onUpdateLogo(savedLogo);
      }
      await loadMedia();
      setStatusMessage({
        type: 'success',
        text: `Image "${replacingItem.title}" replaced and saved to database!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to replace image file.',
      });
    } finally {
      setIsReplacing(false);
      setReplacingItem(null);
    }
  };

  const handleSetAsWebsiteLogo = async (item: MediaFile) => {
    try {
      const savedUrl = await saveWebsiteLogoUrl(item.filePath);
      if (onUpdateLogo) onUpdateLogo(savedUrl);
      setStatusMessage({
        type: 'success',
        text: `"${item.title}" is now set as the active Website Logo and saved in the database!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to set website logo.',
      });
    }
  };

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchMediaFiles();
      setMediaList(items);
    } catch (err: any) {
      console.error('Failed to load media files:', err);
      setError(err?.message || 'Could not retrieve media assets from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (allowed.includes(f.type) && f.size <= 10 * 1024 * 1024) {
        validFiles.push(f);
      }
    }

    if (validFiles.length < files.length) {
      setUploadError('Some files were ignored because they exceed 10MB or are not valid images.');
    } else {
      setUploadError(null);
    }

    setSelectedFiles(validFiles);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setUploadError('Please choose at least one image file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploaded = await uploadMediaFiles(selectedFiles, uploadCategory, uploadTitle || undefined);
      if (uploadCategory === 'branding' && uploaded.length > 0 && uploaded[0].filePath) {
        const savedLogo = await saveWebsiteLogoUrl(uploaded[0].filePath);
        if (onUpdateLogo) onUpdateLogo(savedLogo);
      }
      setIsUploadModalOpen(false);
      setSelectedFiles([]);
      setUploadTitle('');
      setStatusMessage({
        type: 'success',
        text:
          uploadCategory === 'branding'
            ? `Uploaded and updated Official Website Logo in database!`
            : `Successfully uploaded ${selectedFiles.length} media file(s) to server!`,
      });
      await loadMedia();
    } catch (err: any) {
      setUploadError(err?.message || 'Upload process failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (filePath: string, id: string | number) => {
    const fullUrl = window.location.origin + filePath;
    navigator.clipboard.writeText(filePath);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (item: MediaFile) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setIsDeleting(true);
    try {
      await deleteMediaFile(target.id);
      setStatusMessage({
        type: 'success',
        text: `Media file "${target.title}" deleted from server.`,
      });
      setMediaList((prev) => prev.filter((m) => m.id !== target.id));
      if (previewItem?.id === target.id) setPreviewItem(null);
      setItemToDelete(null);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to delete media file.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (item: MediaFile) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditAltText(item.altText || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSavingEdit(true);
    try {
      await updateMediaMetadata(editingItem.id, {
        title: editTitle,
        category: editCategory,
        altText: editAltText,
      });

      setMediaList((prev) =>
        prev.map((m) =>
          m.id === editingItem.id
            ? { ...m, title: editTitle, category: editCategory as any, altText: editAltText }
            : m
        )
      );

      setEditingItem(null);
      setStatusMessage({
        type: 'success',
        text: 'Media metadata updated successfully!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to update: ' + err?.message,
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered Media
  const filteredMedia = mediaList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.filename.toLowerCase().includes(query) ||
      (item.altText && item.altText.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Replacing Any Media/Logo Item */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".svg,.png,.jpg,.jpeg,.webp,.gif,.ico,image/*"
        onChange={handleReplaceFileSelect}
        className="hidden"
      />

      {/* Top Banner & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-700 rounded-lg text-lg">🖼️</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Centralized Media & Image Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload, organize, preview, and replace website images securely hosted on the local server without code changes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadMedia}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Media</span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 border ${
            statusMessage.type === 'success'
              ? 'bg-sky-50 text-sky-800 border-sky-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Media' },
            { id: 'branding', label: 'Branding & Logo' },
            { id: 'hero', label: 'Hero Slides' },
            { id: 'notice', label: 'Notices & Popups' },
            { id: 'gallery', label: 'Gallery Archive' },
            { id: 'general', label: 'General Assets' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Grid of Media Assets */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-600 font-medium">Loading media catalog from server...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-xs text-red-600">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={loadMedia}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No media items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No images match "${searchQuery}". Try clearing search filter.`
              : 'No images found in this category. Click "Upload New Media" to upload images.'}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 px-4 py-2 bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-sky-800"
          >
            Upload Image Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              {/* Image Preview Box */}
              <div
                className="relative bg-slate-100 aspect-video flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => setPreviewItem(item)}
              >
                <img
                  src={item.filePath}
                  alt={item.altText || item.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/logos/ekata-logo-default.svg';
                  }}
                />

                {/* Badges on Image */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                  {item.isSystemDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/90 text-slate-900 backdrop-blur-xs flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> System Default
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 bg-sky-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 bg-white/90 text-slate-900 text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Click to Inspect
                  </span>
                </div>
              </div>

              {/* Metadata Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-sky-700 transition-colors"
                    title={item.title}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    <span>{formatBytes(item.fileSize)}</span>
                    <span className="uppercase">{item.fileType?.split('/')[1] || 'IMG'}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.filePath, item.id)}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Copy local URL for slides/notices/gallery"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-sky-600" />
                          <span className="text-sky-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerReplace(item)}
                      disabled={isReplacing}
                      className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Upload and replace this image file in database"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="Edit Metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(item.category === 'branding' ||
                    item.mediaKey === 'logo-default' ||
                    item.title.toLowerCase().includes('logo') ||
                    selectedCategory === 'branding') && (
                    <button
                      type="button"
                      onClick={() => handleSetAsWebsiteLogo(item)}
                      className={`w-full py-1.5 px-2.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        currentLogoUrl === item.filePath
                          ? 'bg-sky-700 text-white'
                          : 'bg-sky-600/10 hover:bg-sky-700 text-sky-800 hover:text-white border border-sky-600/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {currentLogoUrl === item.filePath
                          ? 'Active Website Logo'
                          : 'Use as Website Logo'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-700" />
                <span>Upload Media Assets</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFiles([]);
                  setUploadError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Drag & drop / Click uploader */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.svg,.webp"
                onChange={handleFilesSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-sky-600 bg-slate-50 hover:bg-sky-50/20 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Click to browse images or drag & drop here
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports SVG, PNG, JPG, WEBP (up to 10MB each)
                </p>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 p-2 bg-white rounded border border-slate-200 text-xs text-sky-700 font-semibold">
                    {selectedFiles.length} file(s) selected for upload
                  </div>
                )}
              </div>

              {/* Title Input (optional if multiple) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cooperative Headquarters, Branch Building"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-600"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-600"
                >
                  <option value="general">General Asset</option>
                  <option value="branding">Branding & Logos</option>
                  <option value="hero">Hero Banner Slider</option>
                  <option value="notice">Notices & Bulletins</option>
                  <option value="gallery">Gallery Archive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFiles([]);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || selectedFiles.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Server...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Upload Files</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT / LIGHTBOX MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewItem.title}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{previewItem.filePath}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-100 flex items-center justify-center max-h-[420px] overflow-hidden">
              <img
                src={previewItem.filePath}
                alt={previewItem.altText || previewItem.title}
                className="max-h-[380px] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-800 capitalize">{previewItem.category}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">File Size</span>
                  <span className="font-semibold text-slate-800">{formatBytes(previewItem.fileSize)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Format</span>
                  <span className="font-semibold text-slate-800 uppercase font-mono">
                    {previewItem.fileType}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewItem.filePath, previewItem.id)}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  {copiedId === previewItem.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>URL Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Relative URL</span>
                    </>
                  )}
                </button>

                <a
                  href={previewItem.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT METADATA MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-700" />
                <span>Edit Media Information</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-600"
                >
                  <option value="general">General Asset</option>
                  <option value="branding">Branding & Logo</option>
                  <option value="hero">Hero Banner</option>
                  <option value="notice">Notice & Bulletins</option>
                  <option value="gallery">Gallery Archive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alt Text (Accessibility & SEO)
                </label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm flex items-center gap-2"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Media File?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-800 font-semibold">"{itemToDelete.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
