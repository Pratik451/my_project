import React, { useState } from 'react';
import { SocialLinksCMS } from '../../../types';
import { Share2, Save, CheckCircle2, ExternalLink } from 'lucide-react';
import { saveCmsSocialLinks } from '../../../services/mediaApi';
import {
  SOCIAL_PLATFORMS_META,
  SocialPlatformBadge,
  resolveSocialMediaUrl,
  getActiveSocialPlatforms,
} from '../../SocialMediaIcons';

interface Props {
  socialLinks?: SocialLinksCMS | null;
  onSave?: (updated: SocialLinksCMS) => void;
}

export const SocialLinksManager: React.FC<Props> = ({ socialLinks, onSave }) => {
  const [formData, setFormData] = useState<SocialLinksCMS>(
    socialLinks || {
      facebook: 'https://facebook.com/ekatacooperative.butwal',
      twitter: 'https://twitter.com/ekatacoop_np',
      instagram: 'https://instagram.com/ekatacooperative',
      youtube: 'https://youtube.com/@ekatacooperative',
      linkedin: 'https://linkedin.com/company/ekata-cooperative',
      whatsapp: '9857099441',
      tiktok: 'https://tiktok.com/@ekatacoop',
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (socialLinks) setFormData(socialLinks);
  }, [socialLinks]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onSave) onSave(formData);
      const ok = await saveCmsSocialLinks(formData);
      if (ok) {
        showToast('Official Social Media Links saved to MySQL database and updated across the website!');
      } else {
        showToast('Failed to save social media links to database', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save social media links', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const activePreviewLinks = getActiveSocialPlatforms(formData);

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-[#0981ae] rounded-lg">
              <Share2 className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Official Social Media Links Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure official social media URLs (Facebook, Instagram, X/Twitter, YouTube, LinkedIn, WhatsApp, TikTok). Connected directly to the website footer icons.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving to Database...' : 'Save Social Links'}
        </button>
      </div>

      {/* Live Website Icon Bar Preview */}
      <div className="p-4 rounded-2xl bg-[#0c2d3e] text-white border border-sky-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block">
            Live Website Icon Preview (Click to Test Link)
          </span>
          <p className="text-xs text-sky-100/80 mt-0.5">
            Each official platform icon below opens its configured URL in a new tab. Leave any field blank to hide that icon on the website.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {activePreviewLinks.length > 0 ? (
            activePreviewLinks.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Test ${s.label}: ${s.url}`}
                aria-label={s.label}
                className="inline-flex items-center justify-center transition-transform hover:scale-110"
              >
                <SocialPlatformBadge
                  platform={s.key}
                  size="md"
                  variant="brand"
                  className="ring-1 ring-white/25"
                />
              </a>
            ))
          ) : (
            <span className="text-xs text-sky-200/70 italic">No social links entered</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_PLATFORMS_META.map((p) => {
          const val = (formData[p.key] as string) || '';
          const resolvedHref = resolveSocialMediaUrl(p.key, val);
          return (
            <div key={p.key} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SocialPlatformBadge platform={p.key} size="md" variant="brand" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{p.label}</h3>
                    <p className="text-[11px] text-slate-500">{p.description}</p>
                  </div>
                </div>
                {resolvedHref && (
                  <a
                    href={resolvedHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[#0981ae] bg-sky-50 hover:bg-sky-100 rounded-lg text-[11px] font-semibold transition"
                    title={`Open ${resolvedHref}`}
                  >
                    <span>Test</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setFormData({ ...formData, [p.key]: e.target.value })}
                  placeholder={p.placeholder}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-600 font-mono"
                />
              </div>
            </div>
          );
        })}
      </form>
    </div>
  );
};
