import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, ChevronRight, CheckCircle2, ShieldCheck, Database, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Language, PopupNoticeItem } from '../types';
import { fetchPopupNotices, fetchDatabaseHealth, BackendDbStatus } from '../services/noticeApi';

interface NoticePopupModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionLink?: string) => void;
}

export const NoticePopupModal: React.FC<NoticePopupModalProps> = ({
  lang,
  isOpen,
  onClose,
  onAction,
}) => {
  const [notices, setNotices] = useState<PopupNoticeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [dontShowToday, setDontShowToday] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<BackendDbStatus | null>(null);
  const [showFullPoster, setShowFullPoster] = useState<boolean>(false);

  // Load notices from backend MySQL database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [fetchedNotices, health] = await Promise.all([
          fetchPopupNotices(false),
          fetchDatabaseHealth(),
        ]);
        if (isMounted) {
          if (fetchedNotices && fetchedNotices.length > 0) {
            setNotices(fetchedNotices);
          }
          if (health) {
            setDbStatus(health);
          }
        }
      } catch (err) {
        console.error('Error loading popup notices:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (isOpen) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle keyboard events (ESC to close) and body overflow locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, dontShowToday]);

  const handleDismiss = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  const currentNotice: PopupNoticeItem | undefined = notices[selectedIndex] || notices[0];

  if (!isOpen) return null;

  return (
    <div
      id="notice-popup-overlay"
      className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-popup-title"
    >
      <div
        id="notice-popup-container"
        className="relative w-full max-w-3xl my-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Top Floating Close (X) Button */}
        <button
          id="notice-popup-close-btn"
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-slate-900/80 hover:bg-red-600 text-white border border-white/20 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={lang === 'np' ? 'सूचना बन्द गर्नुहोस्' : 'Close Notice Popup'}
          title={lang === 'np' ? 'बन्द गर्नुहोस् (X)' : 'Close Notice (X)'}
        >
          <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
        </button>

        {/* Database Status Ribbon */}
        <div className="bg-sky-700 text-sky-50 px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-sky-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>
              {lang === 'np'
                ? 'अंकुर बचत तथा ऋण सहकारी संस्था - आधिकारिक सूचना बोर्ड'
                : 'Ankur Saving & Credit Cooperative - Official Notice Board'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-sky-100/90 hidden sm:flex">
            <Database className="w-3 h-3 text-sky-200" />
            <span>
              {dbStatus?.driver === 'mysql'
                ? `MySQL CBS Active (${dbStatus.counts.popupNotices} notices)`
                : 'Live Database Sync Active'}
            </span>
          </div>
        </div>

        {/* Notice Switcher Tabs (if more than 1 notice active in MySQL) */}
        {notices.length > 1 && (
          <div className="flex bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto divide-x divide-slate-200 dark:divide-slate-800 scrollbar-none pr-12">
            {notices.map((n, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={n.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx);
                    setImageLoaded(false);
                  }}
                  className={`px-3 sm:px-4 py-2.5 text-left whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-bold border-b-2 border-sky-500 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-sm">{idx === 0 ? '📢' : idx === 1 ? '📱' : '✨'}</span>
                  <span className="truncate max-w-[200px]">
                    {lang === 'np' ? n.categoryNp : n.categoryEn}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {currentNotice ? (
            <>
              {/* Header Badges & Reference Number */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    {lang === 'np' ? currentNotice.categoryNp : currentNotice.categoryEn}
                  </span>

                  {currentNotice.noticeRef && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <FileText className="w-3 h-3" />
                      {currentNotice.noticeRef}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lang === 'np' ? currentNotice.dateNp : currentNotice.dateEn}</span>
                </div>
              </div>

              {/* Notice Title */}
              <h2
                id="notice-popup-title"
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight"
              >
                {lang === 'np' ? currentNotice.titleNp : currentNotice.titleEn}
              </h2>

              {/* Poster Image / Graphic with Toggle Option */}
              {currentNotice.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group">
                  {!imageLoaded && (
                    <div className="h-44 sm:h-52 w-full bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">
                      <Bell className="w-8 h-8 animate-bounce opacity-50" />
                    </div>
                  )}
                  <img
                    src={currentNotice.imageUrl}
                    alt={lang === 'np' ? currentNotice.titleNp : currentNotice.titleEn}
                    referrerPolicy="no-referrer"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full object-cover transition-all duration-300 ${
                      showFullPoster ? 'max-h-[500px] object-contain' : 'h-44 sm:h-52 object-cover'
                    } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowFullPoster(!showFullPoster)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/75 hover:bg-black text-white text-[11px] font-medium backdrop-blur-xs transition cursor-pointer"
                  >
                    {showFullPoster
                      ? (lang === 'np' ? 'सानो बनाउनुहोस्' : 'Collapse Image')
                      : (lang === 'np' ? 'पूरा पोस्टर हेर्नुहोस्' : 'Expand Poster')}
                  </button>
                </div>
              )}

              {/* Written Content Section */}
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p className="whitespace-pre-line text-[13.5px] sm:text-sm">
                  {lang === 'np' ? currentNotice.contentNp : currentNotice.contentEn}
                </p>
              </div>

              {/* Key Bullet Points / Action Checklist */}
              {((lang === 'np' && currentNotice.bulletPointsNp && currentNotice.bulletPointsNp.length > 0) ||
                (currentNotice.bulletPointsEn && currentNotice.bulletPointsEn.length > 0)) && (
                <div className="bg-sky-50/70 dark:bg-sky-950/30 rounded-xl p-3.5 sm:p-4 border border-sky-200/70 dark:border-sky-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    {lang === 'np' ? 'महत्त्वपूर्ण जानकारी तथा निर्देशनहरू' : 'Important Instructions & Requirements'}
                  </h4>
                  <ul className="space-y-1.5">
                    {(lang === 'np' ? currentNotice.bulletPointsNp : currentNotice.bulletPointsEn)?.map(
                      (point, pIdx) => (
                        <li
                          key={pIdx}
                          className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-normal"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{lang === 'np' ? 'कुनै सक्रिय सूचना उपलब्ध छैन।' : 'No active popup notice at this moment.'}</p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Don't show again today checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sky-600 focus:ring-sky-500 accent-sky-600 cursor-pointer"
            />
            <span className="text-xs">
              {lang === 'np'
                ? 'आजको लागि पुनः नदेखाउनुहोस् (Don\'t show again today)'
                : 'Do not show again today'}
            </span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {lang === 'np' ? 'बन्द गर्नुहोस्' : 'Close'}
            </button>

            {currentNotice?.actionLink && (
              <button
                type="button"
                onClick={() => {
                  handleDismiss();
                  if (onAction) {
                    onAction(currentNotice.actionLink);
                  } else if (currentNotice.actionLink) {
                    window.location.hash = currentNotice.actionLink;
                  }
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {lang === 'np'
                    ? (currentNotice.actionTextNp || 'थप जानकारी')
                    : (currentNotice.actionTextEn || 'Learn More')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
