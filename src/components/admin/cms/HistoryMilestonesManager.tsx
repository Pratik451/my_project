import React, { useState, useEffect } from 'react';
import { HistoryMilestonesPageCMS, HistoryMilestoneItemCMS } from '../../../types';
import { INITIAL_CMS_HISTORY_MILESTONES } from '../../../data/cmsInitialData';
import {
  History,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  Calendar,
  Award,
} from 'lucide-react';

interface Props {
  data?: HistoryMilestonesPageCMS;
  onSave: (updated: HistoryMilestonesPageCMS) => Promise<void> | void;
}

export const HistoryMilestonesManager: React.FC<Props> = ({ data, onSave }) => {
  const [pageData, setPageData] = useState<HistoryMilestonesPageCMS>(
    data || INITIAL_CMS_HISTORY_MILESTONES
  );
  const [editingItem, setEditingItem] = useState<HistoryMilestoneItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<HistoryMilestoneItemCMS | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (data && data.milestones) {
      setPageData(data);
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
      await onSave(pageData);
      showToast('History & Milestones overview saved to database!');
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem({
      id: `ms-${Date.now()}`,
      yearBs: '2082 B.S.',
      yearAd: '2025 A.D.',
      titleEn: '',
      titleNp: '',
      descriptionEn: '',
      descriptionNp: '',
      badgeEn: 'Key Milestone',
      badgeNp: 'प्रमुख उपलब्धि',
      icon: '🏛️',
      sortOrder: (pageData.milestones?.length || 0) + 1,
    });
    setIsNew(true);
  };

  const handleOpenEditModal = (item: HistoryMilestoneItemCMS) => {
    setEditingItem({ ...item });
    setIsNew(false);
  };

  const handleSaveItemModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.yearBs.trim() || !editingItem.titleEn.trim()) {
      showToast('Year (B.S.) and Milestone Title (English) are required.');
      return;
    }

    const currentList = pageData.milestones || [];
    let updatedList: HistoryMilestoneItemCMS[];
    if (isNew) {
      updatedList = [...currentList, editingItem];
    } else {
      updatedList = currentList.map((m) => (m.id === editingItem.id ? editingItem : m));
    }

    const updatedPage: HistoryMilestonesPageCMS = {
      ...pageData,
      milestones: updatedList,
    };

    setPageData(updatedPage);
    setEditingItem(null);
    setIsSaving(true);
    try {
      await onSave(updatedPage);
      showToast(
        isNew
          ? 'New historical milestone added and saved to database!'
          : 'Milestone updated and saved to database!'
      );
    } catch (err: any) {
      showToast(`Error saving milestone: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const updatedList = (pageData.milestones || []).filter((m) => m.id !== itemToDelete.id);
    const updatedPage: HistoryMilestonesPageCMS = {
      ...pageData,
      milestones: updatedList,
    };
    setPageData(updatedPage);
    setItemToDelete(null);
    setIsSaving(true);
    try {
      await onSave(updatedPage);
      showToast('Milestone removed and database updated!');
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveOrder = async (idx: number, direction: 'up' | 'down') => {
    const list = [...(pageData.milestones || [])];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    const updatedPage: HistoryMilestonesPageCMS = {
      ...pageData,
      milestones: reordered,
    };
    setPageData(updatedPage);
    setIsSaving(true);
    try {
      await onSave(updatedPage);
      showToast('Timeline milestone order updated!');
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
            <History className="w-5 h-5 text-sky-600" />
            History & Evolutionary Milestones CRUD Manager
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, reorder, and delete historical milestones and institutional narrative displayed under About Us → History & Milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Milestone
          </button>
        </div>
      </div>

      {/* Section 1: Page Overview & Narrative Form */}
      <form
        onSubmit={handleSaveHeader}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              1. Historical Overview & Page Header Content
            </h4>
            <p className="text-xs text-slate-500">
              Main heading and executive historical narrative shown at the top of the History & Milestones page.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Overview'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Page Title (English)
            </label>
            <input
              type="text"
              value={pageData.titleEn}
              onChange={(e) => setPageData({ ...pageData, titleEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Page Title (नेपाली)
            </label>
            <input
              type="text"
              value={pageData.titleNp}
              onChange={(e) => setPageData({ ...pageData, titleNp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Historical Narrative / Overview (English)
            </label>
            <textarea
              rows={3}
              value={pageData.overviewEn}
              onChange={(e) => setPageData({ ...pageData, overviewEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ऐतिहासिक पृष्ठभूमि तथा विकासक्रम (नेपाली)
            </label>
            <textarea
              rows={3}
              value={pageData.overviewNp}
              onChange={(e) => setPageData({ ...pageData, overviewNp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </form>

      {/* Section 2: Chronological Milestones Timeline CRUD List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              2. Chronological Milestones Timeline ({pageData.milestones?.length || 0} Milestones)
            </h4>
            <p className="text-xs text-slate-500">
              Each milestone appears as a connected chronological card and bullet highlight on the public History page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Milestone Year
          </button>
        </div>

        {/* Connected Visual Timeline List */}
        <div className="relative pl-6 border-l-2 border-sky-300 space-y-4">
          {(pageData.milestones || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-4 transition-all shadow-2xs"
            >
              {/* Timeline Node Dot */}
              <div className="absolute -left-[33px] top-5 w-4 h-4 rounded-full bg-sky-600 border-4 border-white shadow-xs" />

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center text-2xl shrink-0">
                    {item.icon || '🏛️'}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-700 text-white text-xs font-extrabold tracking-wide">
                        {item.yearBs}
                      </span>
                      {item.yearAd && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold">
                          {item.yearAd}
                        </span>
                      )}
                      {item.badgeEn && (
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
                          {item.badgeEn} {item.badgeNp ? `• ${item.badgeNp}` : ''}
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 pt-1">
                      {item.titleEn}
                    </h5>
                    <p className="text-xs font-semibold text-sky-800">
                      {item.titleNp}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {item.descriptionEn}
                    </p>
                    {item.descriptionNp && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.descriptionNp}
                      </p>
                    )}
                  </div>
                </div>

                {/* CRUD Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Earlier"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === (pageData.milestones?.length || 1) - 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    title="Move Later"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 text-slate-700 hover:text-sky-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                    title="Delete Milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!pageData.milestones || pageData.milestones.length === 0) && (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No milestones recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "Add New Milestone" to add historical events.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Milestone Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isNew ? 'Add New Historical Milestone' : 'Edit Historical Milestone'}
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
                    Year in B.S. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2057 B.S."
                    value={editingItem.yearBs}
                    onChange={(e) => setEditingItem({ ...editingItem, yearBs: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year in A.D. / Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2000 A.D."
                    value={editingItem.yearAd}
                    onChange={(e) => setEditingItem({ ...editingItem, yearAd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Milestone Icon / Emoji
                  </label>
                  <input
                    type="text"
                    placeholder="🏛️, 🌱, 💻, 🏆, 📱"
                    value={editingItem.icon || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Milestone Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Institutional Founding & Registration"
                    value={editingItem.titleEn}
                    onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Milestone Title (नेपाली)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. संस्था स्थापना तथा विधिवत् दर्ता"
                    value={editingItem.titleNp}
                    onChange={(e) => setEditingItem({ ...editingItem, titleNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Era / Highlight Badge (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Foundation Era"
                    value={editingItem.badgeEn || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badgeEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Era / Highlight Badge (नेपाली)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. स्थापना काल"
                    value={editingItem.badgeNp || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badgeNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Description (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what was achieved during this milestone..."
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
                    placeholder="यस ऐतिहासिक उपलब्धिको विवरण लेख्नुहोस्..."
                    value={editingItem.descriptionNp}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, descriptionNp: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
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
                  {isSaving ? 'Saving...' : 'Save Milestone to Database'}
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
              Delete Historical Milestone?
            </h4>
            <p className="text-xs text-slate-600 text-center mb-5">
              Are you sure you want to delete <b>{itemToDelete.yearBs} — {itemToDelete.titleEn}</b>?
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
