import React, { useState, useEffect } from 'react';
import { WhyChooseUsPageCMS, WhyChooseUsItemCMS } from '../../../types';
import { INITIAL_CMS_WHY_CHOOSE_US } from '../../../data/cmsInitialData';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  Star,
} from 'lucide-react';

interface Props {
  data?: WhyChooseUsPageCMS;
  onSave: (updated: WhyChooseUsPageCMS) => Promise<void> | void;
}

export const WhyChooseUsManager: React.FC<Props> = ({ data, onSave }) => {
  const normalizeWhyData = (raw?: WhyChooseUsPageCMS): WhyChooseUsPageCMS => {
    const base = raw || INITIAL_CMS_WHY_CHOOSE_US;
    const rawList = Array.isArray(base.items)
      ? base.items
      : Array.isArray(base.pillars)
      ? base.pillars
      : INITIAL_CMS_WHY_CHOOSE_US.items;
    const normalizedItems = rawList.map((it) => ({
      ...it,
      descriptionEn: it.descriptionEn || it.descEn || '',
      descriptionNp: it.descriptionNp || it.descNp || '',
      descEn: it.descriptionEn || it.descEn || '',
      descNp: it.descriptionNp || it.descNp || '',
    }));
    return {
      ...INITIAL_CMS_WHY_CHOOSE_US,
      ...base,
      items: normalizedItems,
      pillars: normalizedItems,
    };
  };

  const [pageData, setPageData] = useState<WhyChooseUsPageCMS>(() => normalizeWhyData(data));
  const [editingItem, setEditingItem] = useState<WhyChooseUsItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WhyChooseUsItemCMS | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (data && (data.items || data.pillars)) {
      setPageData(normalizeWhyData(data));
    }
  }, [data]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const normalized = normalizeWhyData(pageData);
      setPageData(normalized);
      await onSave(normalized);
      showToast('"Why Choose Us" section headings saved to database!');
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem({
      id: `why-${Date.now()}`,
      icon: '⭐',
      titleEn: '',
      titleNp: '',
      descriptionEn: '',
      descriptionNp: '',
      descEn: '',
      descNp: '',
      badgeEn: 'Core Advantage',
      badgeNp: 'प्रमुख विशेषता',
      showOnHome: true,
      sortOrder: (pageData.items?.length || 0) + 1,
    });
    setIsNew(true);
  };

  const handleOpenEditModal = (item: WhyChooseUsItemCMS) => {
    setEditingItem({
      ...item,
      descriptionEn: item.descriptionEn || item.descEn || '',
      descriptionNp: item.descriptionNp || item.descNp || '',
    });
    setIsNew(false);
  };

  const handleSaveItemModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.titleEn.trim()) {
      showToast('Pillar / Advantage Title (English) is required.');
      return;
    }

    const syncedItem: WhyChooseUsItemCMS = {
      ...editingItem,
      descEn: editingItem.descriptionEn,
      descNp: editingItem.descriptionNp,
    };

    const currentList = pageData.items || pageData.pillars || [];
    let updatedList: WhyChooseUsItemCMS[];
    if (isNew) {
      updatedList = [...currentList, syncedItem];
    } else {
      updatedList = currentList.map((item) => (item.id === syncedItem.id ? syncedItem : item));
    }

    const updatedPage: WhyChooseUsPageCMS = {
      ...pageData,
      items: updatedList,
      pillars: updatedList,
    };

    setPageData(updatedPage);
    setEditingItem(null);
    setIsSaving(true);
    try {
      await onSave(updatedPage);
      showToast(
        isNew
          ? 'New "Why Choose Us" advantage card added and saved!'
          : 'Advantage card updated and saved to database!'
      );
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const updatedList = (pageData.items || pageData.pillars || []).filter((i) => i.id !== itemToDelete.id);
    const updatedPage: WhyChooseUsPageCMS = {
      ...pageData,
      items: updatedList,
      pillars: updatedList,
    };
    setPageData(updatedPage);
    setItemToDelete(null);
    setIsSaving(true);
    try {
      await onSave(updatedPage);
      showToast('Advantage item removed and database updated!');
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleHomeDisplay = async (item: WhyChooseUsItemCMS) => {
    const updatedList = (pageData.items || []).map((i) =>
      i.id === item.id ? { ...i, showOnHome: !i.showOnHome } : i
    );
    const updatedPage: WhyChooseUsPageCMS = {
      ...pageData,
      items: updatedList,
    };
    setPageData(updatedPage);
    try {
      await onSave(updatedPage);
      showToast(`Homepage display updated for "${item.titleEn}"`);
    } catch (err: any) {
      showToast(`Update failed: ${err.message}`);
    }
  };

  const handleMoveOrder = async (idx: number, direction: 'up' | 'down') => {
    const list = [...(pageData.items || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    const updatedPage: WhyChooseUsPageCMS = {
      ...pageData,
      items: reordered,
    };
    setPageData(updatedPage);
    setIsSaving(true);
    try {
      await onSave(updatedPage);
      showToast('Order updated and saved to database!');
    } catch (err: any) {
      showToast(`Order update failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-sky-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-sky-700 text-sm">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            "Why Choose Us" (किन अंकुर सहकारी?) CRUD Manager
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Manage the value pillars shown on the Homepage ("Why Ankur Cooperative?") and on the About Us → Why Choose Us page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Advantage Pillar
          </button>
        </div>
      </div>

      {/* Section 1: Section Headings & Page Overview */}
      <form
        onSubmit={handleSaveHeader}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              1. Section Headings & Overview Description
            </h4>
            <p className="text-xs text-slate-500">
              Controls the title, subtitle, and introductory text on both the Homepage section and the full Why Choose Us page.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Headings'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Section Headline (English)
            </label>
            <input
              type="text"
              value={pageData.titleEn}
              onChange={(e) => setPageData({ ...pageData, titleEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Section Headline (नेपाली)
            </label>
            <input
              type="text"
              value={pageData.titleNp}
              onChange={(e) => setPageData({ ...pageData, titleNp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Homepage Subtitle (English)
            </label>
            <input
              type="text"
              value={pageData.subtitleEn}
              onChange={(e) => setPageData({ ...pageData, subtitleEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Homepage Subtitle (नेपाली)
            </label>
            <input
              type="text"
              value={pageData.subtitleNp}
              onChange={(e) => setPageData({ ...pageData, subtitleNp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Page Overview Paragraph (English)
            </label>
            <textarea
              rows={3}
              value={pageData.overviewEn}
              onChange={(e) => setPageData({ ...pageData, overviewEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              विस्तृत परिचय अनुच्छेद (नेपाली)
            </label>
            <textarea
              rows={3}
              value={pageData.overviewNp}
              onChange={(e) => setPageData({ ...pageData, overviewNp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>
      </form>

      {/* Section 2: Advantage Pillars Cards Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-sky-600" />
              2. "Why Choose Us" Advantage Pillars ({pageData.items?.length || 0} Items)
            </h4>
            <p className="text-xs text-slate-500">
              Items marked "Homepage Active" appear in the Homepage 2x2 grid as well as on the full Why Choose Us page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Advantage Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(pageData.items || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-5 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center text-2xl shrink-0">
                      {item.icon || '⭐'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {item.badgeEn && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                            {item.badgeEn}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleHomeDisplay(item)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition ${
                            item.showOnHome !== false
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                          title="Click to toggle display on Homepage"
                        >
                          {item.showOnHome !== false ? '✓ Homepage Active' : 'Page Only'}
                        </button>
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">{item.titleEn}</h5>
                      <p className="text-xs font-semibold text-sky-700">{item.titleNp}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === (pageData.items?.length || 1) - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                  {item.descriptionEn}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.descriptionNp}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Pillar
                </button>
                <button
                  type="button"
                  onClick={() => setItemToDelete(item)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                  title="Delete Pillar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isNew ? 'Add New "Why Choose Us" Advantage' : 'Edit Advantage Pillar'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Icon / Emoji
                  </label>
                  <input
                    type="text"
                    placeholder="🤝, 🛡️, 🏢, ⚡, 📈"
                    value={editingItem.icon}
                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Member Owned"
                    value={editingItem.badgeEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badgeEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge (नेपाली)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. सदस्य-केन्द्रित"
                    value={editingItem.badgeNp || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badgeNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Member First & Democratic Ownership"
                    value={editingItem.titleEn}
                    onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title (नेपाली)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. सदस्य पहिलो र लोकतान्त्रिक स्वामित्व"
                    value={editingItem.titleNp}
                    onChange={(e) => setEditingItem({ ...editingItem, titleNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.descriptionEn}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, descriptionEn: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    विस्तृत विवरण (नेपाली)
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.descriptionNp}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, descriptionNp: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.showOnHome !== false}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, showOnHome: e.target.checked })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Display this pillar in the Homepage "Why Ankur Cooperative?" section</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Pillar to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Delete Advantage Pillar?
            </h4>
            <p className="text-xs text-slate-600 text-center mb-5">
              Are you sure you want to remove <b>{itemToDelete.titleEn}</b>?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
