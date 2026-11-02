import React, { useState } from 'react';
import { PrivacyPolicyCMS, PrivacyPolicySection } from '../../../types';
import { ShieldCheck, Plus, Trash2, Save, FileText, CheckCircle2 } from 'lucide-react';
import { saveCmsPrivacyPolicy } from '../../../services/mediaApi';

interface Props {
  policy?: PrivacyPolicyCMS | null;
  onSave?: (updated: PrivacyPolicyCMS) => void;
}

export const PrivacyPolicyManager: React.FC<Props> = ({ policy, onSave }) => {
  const [formData, setFormData] = useState<PrivacyPolicyCMS>(
    policy || {
      titleEn: 'Privacy Policy & Member Data Protection Guidelines',
      titleNp: 'गोपनीयता नीति तथा सदस्य तथ्याङ्क सुरक्षा निर्देशिका',
      lastUpdated: '2081 Ashwin (October 2024)',
      sections: [],
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (policy) setFormData(policy);
  }, [policy]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddSection = () => {
    const newSec: PrivacyPolicySection = {
      headingEn: `${formData.sections.length + 1}. New Policy Clause`,
      headingNp: `${formData.sections.length + 1}. नयाँ नीति बुँदा`,
      bodyEn: '',
      bodyNp: '',
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSec],
    });
  };

  const handleUpdateSection = (index: number, field: keyof PrivacyPolicySection, val: string) => {
    const updated = [...formData.sections];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, sections: updated });
  };

  const handleDeleteSection = (index: number) => {
    const updated = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleEn.trim()) {
      showToast('Policy title in English is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await saveCmsPrivacyPolicy(formData);
      if (ok) {
        if (onSave) onSave(formData);
        showToast('Privacy Policy successfully updated and saved to MySQL database!');
      } else {
        throw new Error('Server returned an error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save Privacy Policy to database', 'error');
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
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Website Footer Privacy Policy Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage institutional data privacy terms, eKYM regulatory compliance, member data confidentiality, and legal clauses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving to Database...' : 'Save Privacy Policy'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Policy Title (English)</label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600 font-semibold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-nepali">गोपनीयता नीति शीर्षक (नेपाली)</label>
            <input
              type="text"
              value={formData.titleNp}
              onChange={(e) => setFormData({ ...formData, titleNp: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600 font-nepali"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Last Reviewed / Effective Date</label>
            <input
              type="text"
              value={formData.lastUpdated}
              onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-sky-600"
              placeholder="e.g. 2081 Ashwin (October 2024)"
            />
          </div>
        </div>

        {/* Clauses & Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0981ae]" />
              Policy Clauses & Legal Sections ({formData.sections.length})
            </h3>
            <button
              type="button"
              onClick={handleAddSection}
              className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0981ae] border border-sky-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Clause
            </button>
          </div>

          {formData.sections.map((sec, idx) => (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md">
                  Clause #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Clause Heading (English)</label>
                  <input
                    type="text"
                    value={sec.headingEn}
                    onChange={(e) => handleUpdateSection(idx, 'headingEn', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-600 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 font-nepali">बुँदा शीर्षक (नेपाली)</label>
                  <input
                    type="text"
                    value={sec.headingNp}
                    onChange={(e) => handleUpdateSection(idx, 'headingNp', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-600 font-nepali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Clause Body / Terms (English)</label>
                  <textarea
                    rows={3}
                    value={sec.bodyEn}
                    onChange={(e) => handleUpdateSection(idx, 'bodyEn', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 font-nepali">बुँदा विवरण (नेपाली)</label>
                  <textarea
                    rows={3}
                    value={sec.bodyNp}
                    onChange={(e) => handleUpdateSection(idx, 'bodyNp', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-600 font-nepali"
                  />
                </div>
              </div>
            </div>
          ))}

          {formData.sections.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
              No privacy clauses configured. Click &quot;Add Clause&quot; to establish terms.
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
