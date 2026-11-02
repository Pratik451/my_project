import React, { useState } from 'react';
import { InterestRate } from '../../../types';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  Search,
  Percent,
  Calendar,
  Wallet,
  Building2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  createInterestRate,
  updateInterestRate,
  deleteInterestRate,
  fetchInterestRates,
} from '../../../services/cooperativeApi';

interface Props {
  rates: InterestRate[];
  onRatesUpdated?: (updated: InterestRate[]) => void;
}

export const InterestRatesManager: React.FC<Props> = ({ rates, onRatesUpdated }) => {
  const [list, setList] = useState<InterestRate[]>(rates);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [viewingRate, setViewingRate] = useState<InterestRate | null>(null);
  const [editingRate, setEditingRate] = useState<InterestRate | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [rateToDelete, setRateToDelete] = useState<InterestRate | null>(null);

  // Status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (rates && rates.length > 0) {
      setList(rates);
    }
  }, [rates]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingRate({
      id: '',
      schemeEn: '',
      schemeNp: '',
      rate: '11.50%',
      ratePercent: 11.5,
      period: 'Annual',
      category: 'Deposit',
      basisEn: 'Daily balance calculation, quarterly payout',
      basisNp: 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी',
      minBalance: 1000,
    });
    setIsNew(true);
  };

  const handleOpenEdit = (rate: InterestRate) => {
    setEditingRate({
      ...rate,
      ratePercent: rate.ratePercent !== undefined 
        ? rate.ratePercent 
        : parseFloat(String(rate.rate).replace(/[^0-9.]/g, '')) || 10.0,
      category: rate.category || (rate.schemeEn.toLowerCase().includes('loan') ? 'Loan' : 'Deposit'),
      basisEn: rate.basisEn || rate.period || 'Annual payout',
      basisNp: rate.basisNp || 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी',
      minBalance: rate.minBalance !== undefined ? rate.minBalance : 0,
    });
    setIsNew(false);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    if (!editingRate.schemeEn.trim()) {
      showToast('Scheme Name (English) is required.', 'error');
      return;
    }

    const numRate = parseFloat(String(editingRate.ratePercent || editingRate.rate).replace(/[^0-9.]/g, ''));
    if (isNaN(numRate) || numRate <= 0) {
      showToast('Please enter a valid positive interest rate percentage.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const created = await createInterestRate({
          schemeEn: editingRate.schemeEn.trim(),
          schemeNp: editingRate.schemeNp.trim() || editingRate.schemeEn.trim(),
          rate: `${numRate}%`,
          ratePercent: numRate,
          period: editingRate.period || 'Annual',
          category: editingRate.category || 'Deposit',
          basisEn: editingRate.basisEn || 'Daily balance calculation, quarterly payout',
          basisNp: editingRate.basisNp || 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी',
          minBalance: Number(editingRate.minBalance) || 0,
        });

        const refreshed = await fetchInterestRates();
        const updatedList = refreshed.length > 0 ? refreshed : [created, ...list];
        setList(updatedList);
        if (onRatesUpdated) onRatesUpdated(updatedList);
        showToast('New interest rate scheme successfully saved to database!');
      } else {
        const updated = await updateInterestRate(editingRate.id, {
          schemeEn: editingRate.schemeEn.trim(),
          schemeNp: editingRate.schemeNp.trim() || editingRate.schemeEn.trim(),
          rate: `${numRate}%`,
          ratePercent: numRate,
          period: editingRate.period || 'Annual',
          category: editingRate.category || 'Deposit',
          basisEn: editingRate.basisEn,
          basisNp: editingRate.basisNp,
          minBalance: Number(editingRate.minBalance) || 0,
        });

        const refreshed = await fetchInterestRates();
        const updatedList = refreshed.length > 0 
          ? refreshed 
          : list.map((r) => (r.id === editingRate.id ? updated : r));
        setList(updatedList);
        if (onRatesUpdated) onRatesUpdated(updatedList);
        showToast('Interest rate scheme updated and saved to database!');
      }
      setEditingRate(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save rate scheme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!rateToDelete) return;
    setIsSaving(true);
    try {
      await deleteInterestRate(rateToDelete.id);
      const refreshed = await fetchInterestRates();
      const updatedList = refreshed.length > 0 
        ? refreshed 
        : list.filter((r) => r.id !== rateToDelete.id);
      setList(updatedList);
      if (onRatesUpdated) onRatesUpdated(updatedList);
      setRateToDelete(null);
      showToast('Interest rate scheme deleted from database!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete rate scheme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter and search
  const filteredList = list.filter((r) => {
    const catMatch =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'Deposit'
        ? (r.category || 'Deposit').toLowerCase() === 'deposit'
        : (r.category || '').toLowerCase() === 'loan';

    const q = searchQuery.toLowerCase().trim();
    const searchMatch =
      !q ||
      r.schemeEn.toLowerCase().includes(q) ||
      r.schemeNp.toLowerCase().includes(q) ||
      r.rate.toLowerCase().includes(q);

    return catMatch && searchMatch;
  });

  return (
    <div id="interest-rates-manager" className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border animate-in fade-in ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-500'
              : 'bg-slate-900 text-white border-sky-500'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#0981ae]" />
            Interest Rates Schedule Manager (ब्याज दर व्यवस्थापन)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete database management for deposit returns and lending credit interest rates with real-time website synchronization.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Rate Scheme
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold block">Total Active Schemes</span>
          <strong className="text-xl font-bold text-slate-900 font-mono mt-1 block">
            {list.length}
          </strong>
        </div>
        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
          <span className="text-xs text-sky-700 font-semibold block">Deposit Schemes</span>
          <strong className="text-xl font-bold text-sky-800 font-mono mt-1 block">
            {list.filter((r) => (r.category || 'Deposit').toLowerCase() === 'deposit').length}
          </strong>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          <span className="text-xs text-amber-700 font-semibold block">Loan & Credit Schemes</span>
          <strong className="text-xl font-bold text-amber-800 font-mono mt-1 block">
            {list.filter((r) => (r.category || '').toLowerCase() === 'loan').length}
          </strong>
        </div>
        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
          <span className="text-xs text-sky-700 font-semibold block">Max Deposit Yield</span>
          <strong className="text-xl font-bold text-sky-800 font-mono mt-1 block">
            11.75% p.a.
          </strong>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: 'All Schemes' },
            { key: 'Deposit', label: 'Deposits & Savings (बचत)' },
            { key: 'Loan', label: 'Productive Loans (कर्जा)' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#0981ae] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-[#0981ae]"
          />
        </div>
      </div>

      {/* Grid of Interest Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((rate) => {
          const isLoan = (rate.category || '').toLowerCase() === 'loan';
          return (
            <div
              key={rate.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-[#0981ae]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isLoan
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-[#0981ae]'
                    }`}
                  >
                    {isLoan ? 'Loan Scheme' : 'Deposit Scheme'}
                  </span>
                  <strong className="text-xl font-extrabold text-[#0981ae] font-mono">
                    {rate.rate.includes('%') ? rate.rate : `${rate.rate}%`}
                  </strong>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                  {rate.schemeEn}
                </h3>
                <p className="text-xs text-slate-600 font-nepali mb-3">
                  {rate.schemeNp}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Calculation Basis:</span>
                    <span className="font-medium text-slate-700">{rate.basisEn || rate.period || 'Annual'}</span>
                  </div>
                  {rate.minBalance !== undefined && rate.minBalance > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Min. Balance:</span>
                      <span className="font-medium text-slate-700">Rs. {Number(rate.minBalance).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: View, Edit, Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewingRate(rate)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0981ae] transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rate)}
                    className="p-1.5 text-slate-500 hover:text-[#0981ae] hover:bg-sky-50 rounded-md transition cursor-pointer"
                    title="Edit Rate Scheme"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateToDelete(rate)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                    title="Delete Rate Scheme"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Percent className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No interest rate schemes found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or add a new interest rate scheme.</p>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0981ae]" />
                Interest Rate Scheme Details
              </h3>
              <button
                type="button"
                onClick={() => setViewingRate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-700 font-bold uppercase block mb-1">
                    {viewingRate.category || 'Deposit'} Scheme
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{viewingRate.schemeEn}</h4>
                  <p className="text-xs text-slate-600 font-nepali">{viewingRate.schemeNp}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#0981ae] font-mono block">
                    {viewingRate.rate.includes('%') ? viewingRate.rate : `${viewingRate.rate}%`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Per Annum</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <strong className="block text-slate-700 font-bold mb-1">Calculation Basis (English):</strong>
                  <span className="text-slate-600">{viewingRate.basisEn || viewingRate.period || 'Annual calculation'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-nepali">
                  <strong className="block text-slate-700 font-bold mb-1 font-sans">ब्याज गणना आधार (नेपाली):</strong>
                  <span className="text-slate-600">{viewingRate.basisNp || 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Minimum Balance</span>
                    <strong className="text-slate-800 font-mono">
                      Rs. {Number(viewingRate.minBalance || 0).toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Scheme ID</span>
                    <strong className="text-slate-800 font-mono">#{viewingRate.id}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const r = viewingRate;
                  setViewingRate(null);
                  handleOpenEdit(r);
                }}
                className="px-4 py-2 bg-[#0981ae] text-white text-xs font-bold rounded-lg hover:bg-[#07678d] transition cursor-pointer"
              >
                Edit This Scheme
              </button>
              <button
                type="button"
                onClick={() => setViewingRate(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {editingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0981ae]" />
                {isNew ? 'Add New Interest Rate Scheme' : 'Edit Interest Rate Scheme'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={editingRate.category}
                    onChange={(e) => setEditingRate({ ...editingRate, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                  >
                    <option value="Deposit">Deposit / Savings (बचत)</option>
                    <option value="Loan">Loan / Credit (कर्जा)</option>
                    <option value="Fixed">Fixed Term Deposit (मुद्दती)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Interest Rate (% per annum) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingRate.ratePercent}
                      onChange={(e) =>
                        setEditingRate({
                          ...editingRate,
                          ratePercent: parseFloat(e.target.value) || 0,
                          rate: `${e.target.value}%`,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#0981ae]"
                      placeholder="e.g. 11.75"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Scheme Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingRate.schemeEn}
                  onChange={(e) => setEditingRate({ ...editingRate, schemeEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                  placeholder="e.g. Ankur Golden 2-Year Term Deposit"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  योजनाको नाम (नेपाली) *
                </label>
                <input
                  type="text"
                  value={editingRate.schemeNp}
                  onChange={(e) => setEditingRate({ ...editingRate, schemeNp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] font-nepali"
                  placeholder="उदा. २ वर्षे स्वर्ण मुद्दती निक्षेप योजना"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Payout / Tenure Period
                  </label>
                  <input
                    type="text"
                    value={editingRate.period}
                    onChange={(e) => setEditingRate({ ...editingRate, period: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                    placeholder="e.g. Annual, Quarterly, 1-5 Years"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Minimum Balance (Rs.)
                  </label>
                  <input
                    type="number"
                    value={editingRate.minBalance}
                    onChange={(e) =>
                      setEditingRate({ ...editingRate, minBalance: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-[#0981ae]"
                    placeholder="e.g. 1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Calculation Basis (English)
                </label>
                <input
                  type="text"
                  value={editingRate.basisEn || ''}
                  onChange={(e) => setEditingRate({ ...editingRate, basisEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae]"
                  placeholder="e.g. Daily balance calculation, quarterly payout"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  गणना आधार (नेपाली)
                </label>
                <input
                  type="text"
                  value={editingRate.basisNp || ''}
                  onChange={(e) => setEditingRate({ ...editingRate, basisNp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#0981ae] font-nepali"
                  placeholder="उदा. दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Saving to Database...' : isNew ? 'Create Scheme' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {rateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-base">Delete Interest Rate Scheme?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete scheme{' '}
              <strong className="text-slate-900">"{rateToDelete.schemeEn}"</strong> ({rateToDelete.rate})?
              This will update the database immediately and take effect on the public website.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRateToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
