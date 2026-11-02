import React, { useState } from 'react';
import { BrandThemeCMS } from '../../../types';
import { Palette, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { saveCmsBrandTheme } from '../../../services/mediaApi';

interface Props {
  theme?: BrandThemeCMS | null;
  onSave?: (updated: BrandThemeCMS) => void;
}

const PRESET_THEMES: {
  id: string;
  name: string;
  desc: string;
  theme: BrandThemeCMS;
}[] = [
  {
    id: 'cyan',
    name: 'Ankur Logo Blue & Cyan (Default)',
    desc: 'Official Ankur logo blue and cyan palette representing trust, clarity & modern cooperative banking',
    theme: {
      themePreset: 'cyan',
      primaryColor: '#0981ae',
      primaryHover: '#07678d',
      primaryLight: '#eef8fc',
      secondaryColor: '#0cb3f0',
      accentColor: '#0284c7',
      headerBg: '#0981ae',
      topbarBg: '#052636',
    },
  },
  {
    id: 'navy',
    name: 'Royal Sapphire Blue',
    desc: 'Corporate, modern commercial banking aesthetic with high contrast',
    theme: {
      themePreset: 'navy',
      primaryColor: '#0284c7',
      primaryHover: '#0369a1',
      primaryLight: '#f0f9ff',
      secondaryColor: '#06b6d4',
      accentColor: '#0cb3f0',
      headerBg: '#075985',
      topbarBg: '#082f49',
    },
  },
  {
    id: 'teal',
    name: 'Oceanic Cyan Teal',
    desc: 'Harmonious cyan-blue blend symbolizing financial stability',
    theme: {
      themePreset: 'teal',
      primaryColor: '#0891b2',
      primaryHover: '#0e7490',
      primaryLight: '#ecfeff',
      secondaryColor: '#0cb3f0',
      accentColor: '#0284c7',
      headerBg: '#155e75',
      topbarBg: '#083344',
    },
  },
  {
    id: 'maroon',
    name: 'Heritage Crimson Maroon',
    desc: 'Traditional Nepali crimson reflecting cultural heritage and strength',
    theme: {
      themePreset: 'maroon',
      primaryColor: '#9f1239',
      primaryHover: '#881337',
      primaryLight: '#fff1f2',
      secondaryColor: '#d97706',
      accentColor: '#0891b2',
      headerBg: '#881337',
      topbarBg: '#4c0519',
    },
  },
  {
    id: 'golden',
    name: 'Golden Amber Heritage',
    desc: 'Earthy golden hue representing harvest, wealth and agriculture',
    theme: {
      themePreset: 'golden',
      primaryColor: '#b45309',
      primaryHover: '#92400e',
      primaryLight: '#fef3c7',
      secondaryColor: '#0981ae',
      accentColor: '#0cb3f0',
      headerBg: '#78350f',
      topbarBg: '#451a03',
    },
  },
];

export const BrandThemeManager: React.FC<Props> = ({ theme, onSave }) => {
  const [formData, setFormData] = useState<BrandThemeCMS>(
    theme || PRESET_THEMES[0].theme
  );

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (theme) setFormData(theme);
  }, [theme]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setFormData(preset.theme);
    // Apply dynamically in live preview
    applyThemeToDocument(preset.theme);
  };

  const applyThemeToDocument = (t: BrandThemeCMS) => {
    const root = document.documentElement;
    root.style.setProperty('--ekata-green', t.primaryColor);
    root.style.setProperty('--ekata-green-dark', t.primaryHover);
    root.style.setProperty('--ekata-green-deep', t.topbarBg || '#052636');
    root.style.setProperty('--ekata-green-soft', t.primaryLight);
    root.style.setProperty('--ekata-mint', t.primaryLight);
    root.style.setProperty('--ekata-gold', t.secondaryColor);
    root.style.setProperty('--color-primary', t.primaryColor);
    root.style.setProperty('--color-primary-hover', t.primaryHover);
    root.style.setProperty('--color-primary-light', t.primaryLight);
    root.style.setProperty('--color-secondary', t.secondaryColor);
    root.style.setProperty('--color-accent', t.accentColor);
    root.style.setProperty('--color-topbar-bg', t.topbarBg || '#052636');
  };

  const handleColorChange = (field: keyof BrandThemeCMS, val: string) => {
    const updated = { ...formData, [field]: val, themePreset: 'custom' };
    setFormData(updated);
    applyThemeToDocument(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const ok = await saveCmsBrandTheme(formData);
      if (ok) {
        applyThemeToDocument(formData);
        if (onSave) onSave(formData);
        showToast('Brand Colors & Theme successfully saved to MySQL database and applied to site!');
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save theme settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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
              <Palette className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Website Brand Colors & Theme Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Choose institutional color palettes or configure custom HEX shades. Changes are persisted in MySQL and dynamically style headers, buttons, and accents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_THEMES[0])}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Applying & Saving...' : 'Save & Publish Colors'}
          </button>
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          1. Choose a Curated Institutional Color Palette
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PRESET_THEMES.map((preset) => {
            const isSelected = formData.themePreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0981ae] bg-sky-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900">{preset.name}</h4>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-white bg-[#0981ae] px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">{preset.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <div
                    className="w-6 h-6 rounded-md shadow-2xs border border-black/10"
                    style={{ backgroundColor: preset.theme.primaryColor }}
                    title={`Primary: ${preset.theme.primaryColor}`}
                  />
                  <div
                    className="w-6 h-6 rounded-md shadow-2xs border border-black/10"
                    style={{ backgroundColor: preset.theme.primaryHover }}
                    title={`Hover: ${preset.theme.primaryHover}`}
                  />
                  <div
                    className="w-6 h-6 rounded-md shadow-2xs border border-black/10"
                    style={{ backgroundColor: preset.theme.secondaryColor }}
                    title={`Accent: ${preset.theme.secondaryColor}`}
                  />
                  <div
                    className="w-6 h-6 rounded-md shadow-2xs border border-black/10"
                    style={{ backgroundColor: preset.theme.topbarBg }}
                    title={`Topbar: ${preset.theme.topbarBg}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Color Pickers & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-200">
        {/* Color controls */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            2. Custom Color Customizer (HEX Controls)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Primary Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Primary Hover / Darker</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryHover}
                  onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.primaryHover}
                  onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Secondary / Amber Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-slate-800 block">Header / Topbar Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.topbarBg || '#052636'}
                  onChange={(e) => handleColorChange('topbarBg', e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formData.topbarBg || '#052636'}
                  onChange={(e) => handleColorChange('topbarBg', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live UI Component Preview */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Live Preview on Components
          </h3>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            {/* Mock Header Topbar */}
            <div
              className="p-2.5 rounded-xl text-white text-[11px] font-bold flex items-center justify-between"
              style={{ backgroundColor: formData.topbarBg || '#052636' }}
            >
              <span>🏛️ Ankur Saving & Credit Cooperative Ltd.</span>
              <span className="text-[10px] text-sky-200">☎ 071-540123</span>
            </div>

            {/* Mock Navbar & Buttons */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Navigation Button</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: formData.secondaryColor }}
                >
                  Featured Badge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Primary CTA Button
                </button>
                <button
                  type="button"
                  className="px-4 py-2 font-bold text-xs rounded-xl border transition"
                  style={{ color: formData.primaryColor, borderColor: formData.primaryColor }}
                >
                  Secondary Action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
