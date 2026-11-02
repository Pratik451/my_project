import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  Trash2,
  X,
} from 'lucide-react';
import {
  uploadWebsiteLogo,
  saveWebsiteLogoUrl,
  fetchWebsiteLogo,
  fetchMediaFiles,
  deleteWebsiteLogo,
  deleteMediaFile,
  replaceMediaFile,
} from '../../services/mediaApi';
import { MediaFile } from '../../types';

interface LogoManagementProps {
  currentLogoUrl: string;
  onUpdateLogo: (newLogoUrl: string) => void;
  onExitToWebsite?: () => void;
}

export const LogoManagement: React.FC<LogoManagementProps> = ({
  currentLogoUrl,
  onUpdateLogo,
  onExitToWebsite,
}) => {
  const [activeLogo, setActiveLogo] = useState<string>(currentLogoUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [brandingMedia, setBrandingMedia] = useState<MediaFile[]>([]);
  const [lightboxLogoUrl, setLightboxLogoUrl] = useState<string | null>(null);
  const [replacingMediaId, setReplacingMediaId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentLogoUrl) {
      setActiveLogo(currentLogoUrl);
    }
  }, [currentLogoUrl]);

  useEffect(() => {
    let mounted = true;
    fetchWebsiteLogo()
      .then((dbLogo) => {
        if (mounted && dbLogo) {
          setActiveLogo(dbLogo);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const loadBrandingMedia = async () => {
    try {
      const files = await fetchMediaFiles();
      const logos = files.filter(
        (f) =>
          f.category === 'branding' ||
          f.filePath.includes('/uploads/logos/') ||
          f.title.toLowerCase().includes('logo')
      );
      setBrandingMedia(logos);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadBrandingMedia();
  }, []);

  const processSelectedFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'avif', 'bmp'];
    const isImageMime = file.type.startsWith('image/');

    if (!isImageMime && !allowedExts.includes(ext)) {
      setStatusMessage({
        type: 'error',
        text: 'Unsupported file type. Please upload SVG, PNG, JPG, WEBP, GIF, or ICO image format.',
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'File size exceeds 15MB limit. Please choose a smaller image.',
      });
      return;
    }

    setSelectedFile(file);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleUploadAndSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const newLogoUrl = await uploadWebsiteLogo(selectedFile);
      await saveWebsiteLogoUrl(newLogoUrl);
      setActiveLogo(newLogoUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUpdateLogo(newLogoUrl);
      await loadBrandingMedia();
      setStatusMessage({
        type: 'success',
        text: 'Official website logo uploaded and saved permanently to the server and MySQL database!',
      });
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to upload and update logo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPredefined = async (url: string, name: string) => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const savedUrl = await saveWebsiteLogoUrl(url);
      setActiveLogo(savedUrl);
      onUpdateLogo(savedUrl);
      setStatusMessage({
        type: 'success',
        text: `Official logo updated to "${name}" and saved to the MySQL database!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to update logo in database.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteActiveLogo = async () => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const resetUrl = await deleteWebsiteLogo();
      setActiveLogo(resetUrl);
      onUpdateLogo(resetUrl);
      await loadBrandingMedia();
      setStatusMessage({
        type: 'success',
        text: 'Uploaded logo deleted from server disk and reset in MySQL database.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to delete logo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerReplaceSaved = (mediaId: string) => {
    setReplacingMediaId(mediaId);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleReplaceSavedFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingMediaId) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const updated = await replaceMediaFile(replacingMediaId, file);
      const newPath = (updated as any)?.file_path || (updated as any)?.filePath;
      if (newPath) {
        const savedUrl = await saveWebsiteLogoUrl(newPath);
        setActiveLogo(savedUrl);
        onUpdateLogo(savedUrl);
      }
      await loadBrandingMedia();
      setStatusMessage({
        type: 'success',
        text: 'Logo file replaced on server disk and updated in MySQL database!',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to replace logo file.',
      });
    } finally {
      setIsUploading(false);
      setReplacingMediaId(null);
    }
  };

  const handleDeleteSavedMedia = async (item: MediaFile) => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      await deleteMediaFile(item.id);
      if (activeLogo === item.filePath) {
        const resetUrl = await deleteWebsiteLogo();
        setActiveLogo(resetUrl);
        onUpdateLogo(resetUrl);
      }
      await loadBrandingMedia();
      setStatusMessage({
        type: 'success',
        text: `Logo "${item.title}" deleted from server and MySQL database.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to delete saved logo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-700 rounded-lg text-lg">🏛️</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Official Website Logo Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload, select, or enter a new primary brand logo. Changes are saved immediately to the database and applied across header, footer, portals, and certificates.
              </p>
            </div>
          </div>
        </div>
        {onExitToWebsite && (
          <button
            type="button"
            onClick={onExitToWebsite}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start md:self-auto cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview on Public Website</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 border ${
            statusMessage.type === 'success'
              ? 'bg-sky-50 text-sky-800 border-sky-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Current vs Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Active Logo Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Active Website Logo</span>
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                Saved in Database
              </span>
            </div>

            {/* Light Mode Surface Preview */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Light Theme Appearance (Header / Forms)
                </span>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center min-h-[120px]">
                  {activeLogo ? (
                    <img
                      key={activeLogo}
                      src={activeLogo}
                      alt="Active Ankur Logo"
                      className="max-h-16 w-auto object-contain drop-shadow-sm"
                    />
                  ) : null}
                </div>
              </div>

              {/* Dark Mode Surface Preview */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Dark Theme Appearance (Admin Bar / Footer)
                </span>
                <div className="p-6 bg-[#052636] border border-sky-950 rounded-xl flex items-center justify-center min-h-[120px]">
                  {activeLogo ? (
                    <img
                      key={activeLogo}
                      src={activeLogo}
                      alt="Active Ankur Logo (Dark Background)"
                      className="max-h-16 w-auto object-contain"
                    />
                  ) : null}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Database Logo Path:</span>
                  <span className="font-mono text-slate-800 font-medium truncate max-w-[220px]" title={activeLogo}>
                    {activeLogo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Storage Location:</span>
                  <span className="text-sky-700 font-semibold">Database & Server Disk</span>
                </div>
              </div>

              {/* Active Logo Action Controls: Preview, Replace, Delete */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLightboxLogoUrl(activeLogo)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-700" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteActiveLogo}
                  disabled={isUploading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Built-in System Presets */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>System Default Logos</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Click any preset below to apply and save it to the database immediately.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  handleSelectPredefined('/uploads/logos/ekata-logo-default.svg', 'Official Vector Emblem')
                }
                disabled={isUploading}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-sky-600 hover:bg-sky-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center">
                    <img
                      src="/uploads/logos/ekata-logo-default.svg"
                      alt="Vector Emblem"
                      className="max-h-8 max-w-8 object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-800 block">
                      Official Vector Emblem (.svg)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard corporate emblem with wheat & golden scales
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPredefined('/assets/images/ekata-logo.svg', 'Legacy SVG Asset')
                }
                disabled={isUploading}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-sky-600 hover:bg-sky-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-md p-1 flex items-center justify-center">
                    <img
                      src="/assets/images/ekata-logo.svg"
                      alt="Legacy Asset"
                      className="max-h-8 max-w-8 object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-800 block">
                      Legacy Applet Emblem (.svg)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Built-in asset package fallback
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Upload New Logo Box + Previously Uploaded Logos */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hidden File Input for Replacing Saved Logo */}
          <input
            ref={replaceInputRef}
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.webp,.gif,.ico,.avif,image/*"
            onChange={handleReplaceSavedFile}
            className="hidden"
          />

          {/* 1. Upload New Logo File */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-700" />
              <span>Upload or Replace Official Logo File</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Upload an updated logo image from your device. It will be saved permanently to the server disk and MySQL database.
            </p>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp,.gif,.ico,.avif,image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
                  isDragging
                    ? 'border-sky-600 bg-sky-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-sky-600 bg-slate-50/60 hover:bg-sky-50/20'
                }`}
              >
                <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-sky-700 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Click to browse or drag & drop your logo file here
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Supports SVG, PNG (transparent background recommended), JPG, WEBP, GIF, ICO up to 15MB.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600">
                    .SVG
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600">
                    .PNG
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600">
                    .JPG / .WEBP
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600">
                    Max 15MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-6 bg-slate-50 border border-sky-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-sky-600" />
                      <span>New Logo Ready to Save:</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {selectedFile?.name} (
                      {(selectedFile?.size || 0) / 1024 < 1024
                        ? `${Math.round((selectedFile?.size || 0) / 1024)} KB`
                        : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`}
                      )
                    </span>
                  </div>

                  <div className="p-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center min-h-[160px]">
                    <img
                      src={previewUrl}
                      alt="New Staged Logo"
                      className="max-h-24 w-auto object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 bg-white border border-sky-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Choose Different File
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancelPreview}
                      disabled={isUploading}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadAndSave}
                      disabled={isUploading}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Uploading & Saving to Database...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Save & Apply Website Logo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Previously Uploaded Branding Logos in Database */}
          {brandingMedia.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-sky-700" />
                <span>Saved Logos on Server & MySQL Database ({brandingMedia.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Preview, replace, apply, or permanently delete any uploaded logo stored on the server.
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {brandingMedia.map((item) => {
                  const isCurrent = activeLogo === item.filePath;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'border-sky-600 bg-sky-50/50'
                          : 'border-slate-200 hover:border-sky-500 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={item.filePath}
                            alt={item.title}
                            className="max-h-9 max-w-9 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/uploads/logos/ekata-logo-default.svg';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate" title={item.filePath}>
                            {item.filePath}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setLightboxLogoUrl(item.filePath)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-sky-700 hover:border-sky-300 transition cursor-pointer"
                          title="Preview Logo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleTriggerReplaceSaved(String(item.id))}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-sky-700 hover:border-sky-300 transition cursor-pointer disabled:opacity-50"
                          title="Replace Logo File"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => handleDeleteSavedMedia(item)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer disabled:opacity-50"
                          title="Delete Logo from Server & DB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isUploading || isCurrent}
                          onClick={() => handleSelectPredefined(item.filePath, item.title)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-sky-700 text-white cursor-default'
                              : 'bg-white border border-sky-600 text-sky-700 hover:bg-sky-700 hover:text-white'
                          }`}
                        >
                          {isCurrent ? '✓ Active' : 'Apply Logo'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Size Logo Preview Lightbox Modal */}
      {lightboxLogoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxLogoUrl(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600" />
                <span>Official Logo Preview</span>
              </h4>
              <button
                type="button"
                onClick={() => setLightboxLogoUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center min-h-[200px]">
              <img
                src={lightboxLogoUrl}
                alt="Logo Preview"
                className="max-h-48 w-auto object-contain"
              />
            </div>
            <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Server Path: {lightboxLogoUrl}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setLightboxLogoUrl(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
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
