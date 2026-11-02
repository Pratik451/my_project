import React, { useState, useEffect } from 'react';
import { FaqItemCMS } from '../../../types';
import { INITIAL_CMS_FAQS } from '../../../data/cmsInitialData';
import { Plus, Trash2, Edit2, Save, HelpCircle, X } from 'lucide-react';

interface FaqManagerProps {
  faqs: FaqItemCMS[];
  onSaveFaqs: (updated: FaqItemCMS[]) => Promise<void>;
}

const FAQ_CATEGORIES = [
  'Membership',
  'Savings & Deposits',
  'Loans & Credit',
  'Digital Banking',
  'General',
];

export const FaqManager: React.FC<FaqManagerProps> = ({ faqs, onSaveFaqs }) => {
  const [list, setList] = useState<FaqItemCMS[]>(
    faqs && faqs.length > 0 ? faqs : INITIAL_CMS_FAQS
  );
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [editingFaq, setEditingFaq] = useState<FaqItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (faqs && faqs.length > 0) {
      setList(faqs);
    }
  }, [faqs]);

  const openAddModal = () => {
    const fresh: FaqItemCMS = {
      id: `faq-${Date.now()}`,
      questionEn: '',
      questionNp: '',
      answerEn: '',
      answerNp: '',
      category: 'General',
      sortOrder: list.length + 1,
      isActive: true,
    };
    setEditingFaq(fresh);
    setIsNew(true);
  };

  const openEditModal = (item: FaqItemCMS) => {
    setEditingFaq({ ...item });
    setIsNew(false);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.questionEn.trim()) return;
    setSaving(true);
    try {
      const updated = isNew
        ? [...list, editingFaq]
        : list.map((it) => (it.id === editingFaq.id ? editingFaq : it));
      setList(updated);
      await onSaveFaqs(updated);
      setEditingFaq(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const updated = list.filter((it) => it.id !== id);
    setList(updated);
    await onSaveFaqs(updated);
  };

  const filtered =
    activeCategory === 'ALL' ? list : list.filter((it) => it.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#052636] to-[#065371] p-6 rounded-2xl text-white shadow-md">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block mb-1">
            More Menu &bull; Frequently Asked Questions (FAQ) CRUD Manager
          </span>
          <h3 className="text-xl font-black flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-300" />
            Frequently Asked Questions ({list.length})
          </h3>
          <p className="text-xs text-sky-100/80 mt-1">
            Add, edit, categorize, or delete bilingual FAQs displayed under &ldquo;More &rarr; Frequently Asked Questions&rdquo; and Footer quick links.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New FAQ
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-[#0981ae] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Categories ({list.length})
        </button>
        {FAQ_CATEGORIES.map((cat) => {
          const count = list.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* FAQ Items List */}
      <div className="space-y-3">
        {filtered.map((faq, index) => (
          <div
            key={faq.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#0981ae]/40 shadow-2xs transition flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-[#0981ae] font-black text-xs flex items-center justify-center">
                  Q{index + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-[#0981ae] text-[10px] font-black uppercase border border-sky-200">
                  {faq.category}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{faq.questionEn}</h4>
                <p className="text-xs font-semibold text-sky-800 mt-0.5">{faq.questionNp}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs text-slate-600">
                <p className="leading-relaxed">
                  <strong className="text-slate-800">Answer (EN):</strong> {faq.answerEn}
                </p>
                <p className="leading-relaxed text-slate-700">
                  <strong className="text-slate-800">उत्तर (NP):</strong> {faq.answerNp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => openEditModal(faq)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0981ae] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(faq.id)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                title="Delete FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#0981ae]" />
                {isNew ? 'Add New Frequently Asked Question' : 'Edit Frequently Asked Question'}
              </h4>
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none bg-white"
                  >
                    {FAQ_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingFaq.sortOrder || 1}
                    onChange={(e) =>
                      setEditingFaq({ ...editingFaq, sortOrder: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Question (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.questionEn}
                  onChange={(e) => setEditingFaq({ ...editingFaq, questionEn: e.target.value })}
                  placeholder="e.g. Who is eligible to open a savings account?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्रश्न (नेपालीमा) *
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.questionNp}
                  onChange={(e) => setEditingFaq({ ...editingFaq, questionNp: e.target.value })}
                  placeholder="उदा: बचत खाता खोल्न के कस्तो योग्यता चाहिन्छ?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Answer (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingFaq.answerEn}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answerEn: e.target.value })}
                  placeholder="Provide a clear and complete answer in English..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विस्तृत उत्तर (नेपालीमा) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingFaq.answerNp}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answerNp: e.target.value })}
                  placeholder="नेपालीमा स्पष्ट उत्तर लेख्नुहोस्..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
