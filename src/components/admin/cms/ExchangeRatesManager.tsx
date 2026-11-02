import React, { useState, useEffect } from 'react';
import { ExchangeRateItemCMS } from '../../../types';
import { INITIAL_CMS_EXCHANGE_RATES } from '../../../data/cmsInitialData';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Lock,
  RefreshCw,
  X,
} from 'lucide-react';

interface Props {
  rates?: ExchangeRateItemCMS[];
  onSave: (updated: ExchangeRateItemCMS[]) => Promise<void> | void;
}

export const ExchangeRatesManager: React.FC<Props> = ({ rates, onSave }) => {
  const normalizeRates = (list: ExchangeRateItemCMS[]): ExchangeRateItemCMS[] => {
    const base = Array.isArray(list) && list.length > 0 ? [...list] : [...INITIAL_CMS_EXCHANGE_RATES];
    let hasInr = false;
    const mapped = base.map((item, idx) => {
      if (item.currencyCode.toUpperCase() === 'INR') {
        hasInr = true;
        return {
          ...item,
          currencyCode: 'INR',
          currencyNameEn: item.currencyNameEn || 'Indian Rupee',
          currencyNameNp: item.currencyNameNp || 'भारतीय रूपैयाँ',
          flag: item.flag || '🇮🇳',
          unit: 100,
          buyingRate: '160.00',
          sellingRate: '160.15',
          isFixed: true,
          isEnabled: true,
          sortOrder: 1,
        };
      }
      return {
        ...item,
        isFixed: false,
        sortOrder: item.sortOrder ?? idx + 2,
      };
    });

    if (!hasInr) {
      mapped.unshift({
        id: 'fx-inr',
        currencyCode: 'INR',
        currencyNameEn: 'Indian Rupee',
        currencyNameNp: 'भारतीय रूपैयाँ',
        flag: '🇮🇳',
        unit: 100,
        buyingRate: '160.00',
        sellingRate: '160.15',
        isFixed: true,
        isEnabled: true,
        updatedAt: new Date().toISOString().slice(0, 10),
        sortOrder: 1,
      });
    }
    return mapped;
  };

  const [rateList, setRateList] = useState<ExchangeRateItemCMS[]>(() =>
    normalizeRates(rates || INITIAL_CMS_EXCHANGE_RATES)
  );
  const [editingItem, setEditingItem] = useState<ExchangeRateItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (rates && rates.length > 0) {
      setRateList(normalizeRates(rates));
    }
  }, [rates]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleInlineRateChange = (
    id: string,
    field: 'buyingRate' | 'sellingRate' | 'unit',
    val: string
  ) => {
    setRateList((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.currencyCode.toUpperCase() === 'INR' || r.isFixed) return r; // INR locked per NRB
        return {
          ...r,
          [field]: field === 'unit' ? Math.max(1, parseInt(val, 10) || 1) : val,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      })
    );
  };

  const handleToggleEnabled = async (item: ExchangeRateItemCMS) => {
    if (item.currencyCode.toUpperCase() === 'INR' || item.isFixed) {
      showToast('INR is fixed according to Nepal Rastra Bank (NRB) and always enabled.');
      return;
    }
    const updated = rateList.map((r) =>
      r.id === item.id ? { ...r, isEnabled: !r.isEnabled } : r
    );
    setRateList(updated);
    setIsSaving(true);
    try {
      await onSave(updated);
      showToast(`Updated visibility for ${item.currencyCode}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAllRates = async () => {
    const normalized = normalizeRates(rateList);
    setRateList(normalized);
    setIsSaving(true);
    try {
      await onSave(normalized);
      showToast('All Foreign Exchange Rates saved to MySQL database (INR fixed per NRB)!');
    } catch (err: any) {
      showToast(`Error saving exchange rates: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem({
      id: `fx-${Date.now()}`,
      currencyCode: '',
      currencyNameEn: '',
      currencyNameNp: '',
      flag: '💱',
      unit: 1,
      buyingRate: '100.00',
      sellingRate: '100.50',
      isFixed: false,
      isEnabled: true,
      updatedAt: new Date().toISOString().slice(0, 10),
      sortOrder: rateList.length + 1,
    });
    setIsNew(true);
  };

  const handleOpenEditModal = (item: ExchangeRateItemCMS) => {
    if (item.currencyCode.toUpperCase() === 'INR' || item.isFixed) {
      showToast('INR is permanently fixed at 100 INR = 160.00 / 160.15 NPR according to Nepal Rastra Bank.');
      return;
    }
    setEditingItem({ ...item });
    setIsNew(false);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const code = editingItem.currencyCode.trim().toUpperCase();
    if (!code || !editingItem.currencyNameEn.trim()) {
      showToast('Please provide Currency Code and English Currency Name.');
      return;
    }
    if (code === 'INR') {
      showToast('INR is already present and fixed according to NRB.');
      return;
    }

    const cleanItem: ExchangeRateItemCMS = {
      ...editingItem,
      currencyCode: code,
      isFixed: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const updated = isNew
      ? normalizeRates([...rateList, cleanItem])
      : normalizeRates(rateList.map((r) => (r.id === cleanItem.id ? cleanItem : r)));

    setRateList(updated);
    setEditingItem(null);
    setIsSaving(true);
    try {
      await onSave(updated);
      showToast(
        isNew
          ? `Added ${code} currency rate and saved to database!`
          : `Updated ${code} currency rate in database!`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCurrency = async (item: ExchangeRateItemCMS) => {
    if (item.currencyCode.toUpperCase() === 'INR' || item.isFixed) {
      showToast('INR cannot be deleted as it is the fixed NRB reference currency.');
      return;
    }
    const updated = normalizeRates(rateList.filter((r) => r.id !== item.id));
    setRateList(updated);
    setIsSaving(true);
    try {
      await onSave(updated);
      showToast(`Removed ${item.currencyCode} from exchange rates.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-sky-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-sky-700 text-sm">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>💱</span>
            <span>Foreign Exchange Rates Manager (NRB Forex CRUD)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Indian Rupee (INR) is permanently fixed according to Nepal Rastra Bank (100 INR = Buying 160.00 / Selling 160.15 NPR). All other international currencies can be updated or added below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Currency
          </button>
          <button
            type="button"
            onClick={handleSaveAllRates}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving to Database...' : 'Save Exchange Rates to Database'}
          </button>
        </div>
      </div>

      {/* NRB Fixed INR Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-700 shrink-0" />
          <div className="text-xs text-amber-900">
            <strong>NRB Statutory Peg Protection Active:</strong> Indian Rupee (🇮🇳 INR, Unit 100) is locked at Buying <strong>Rs. 160.00</strong> and Selling <strong>Rs. 160.15</strong> as mandated by Nepal Rastra Bank.
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-amber-950 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shrink-0">
          100 INR = 160.00 / 160.15 NPR (Fixed)
        </span>
      </div>

      {/* Editable Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase">
                <th className="py-3.5 px-4 font-bold">Currency</th>
                <th className="py-3.5 px-4 font-bold text-center">Unit</th>
                <th className="py-3.5 px-4 font-bold">Buying Rate (NPR)</th>
                <th className="py-3.5 px-4 font-bold">Selling Rate (NPR)</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rateList.map((item) => {
                const isInr = item.currencyCode.toUpperCase() === 'INR' || item.isFixed;
                return (
                  <tr
                    key={item.id}
                    className={isInr ? 'bg-amber-50/40' : 'hover:bg-slate-50/70'}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.flag || '💱'}</span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {item.currencyCode} — {item.currencyNameEn}
                          </div>
                          <div className="text-slate-500">{item.currencyNameNp}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isInr ? (
                        <span className="font-mono font-bold text-amber-900">100</span>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          value={item.unit}
                          onChange={(e) =>
                            handleInlineRateChange(item.id, 'unit', e.target.value)
                          }
                          className="w-20 text-center font-mono font-bold border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-900"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isInr ? (
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-lg">
                          <Lock className="w-3.5 h-3.5" />
                          <span>160.00 (NRB Fixed)</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={item.buyingRate}
                          onChange={(e) =>
                            handleInlineRateChange(item.id, 'buyingRate', e.target.value)
                          }
                          className="w-28 font-mono font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-sky-800 focus:border-sky-600 focus:outline-none"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isInr ? (
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-lg">
                          <Lock className="w-3.5 h-3.5" />
                          <span>160.15 (NRB Fixed)</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={item.sellingRate}
                          onChange={(e) =>
                            handleInlineRateChange(item.id, 'sellingRate', e.target.value)
                          }
                          className="w-28 font-mono font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-900 focus:border-sky-600 focus:outline-none"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isInr ? (
                        <span className="text-amber-800 font-bold">NRB Fixed</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(item)}
                          className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                            item.isEnabled
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.isEnabled ? 'Active' : 'Hidden'}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isInr ? (
                        <span className="text-slate-400 font-semibold">Protected</span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                            title="Edit Currency Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCurrency(item)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                            title="Delete Currency"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Currency Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-base font-bold text-slate-900">
                {isNew ? 'Add Foreign Currency Rate' : `Edit ${editingItem.currencyCode} Exchange Rate`}
              </h4>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISO Code *</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="e.g. CHF"
                    value={editingItem.currencyCode}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, currencyCode: e.target.value.toUpperCase() })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    placeholder="🇨🇭"
                    value={editingItem.flag}
                    onChange={(e) => setEditingItem({ ...editingItem, flag: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit *</label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.unit}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unit: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency Name (English) *</label>
                  <input
                    type="text"
                    placeholder="Swiss Franc"
                    value={editingItem.currencyNameEn}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, currencyNameEn: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency Name (नेपाली)</label>
                  <input
                    type="text"
                    placeholder="स्विस फ्रान्क"
                    value={editingItem.currencyNameNp}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, currencyNameNp: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Buying Rate (NPR) *</label>
                  <input
                    type="text"
                    value={editingItem.buyingRate}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, buyingRate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Rate (NPR) *</label>
                  <input
                    type="text"
                    value={editingItem.sellingRate}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, sellingRate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                >
                  {isNew ? 'Add Currency & Save' : 'Update Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
