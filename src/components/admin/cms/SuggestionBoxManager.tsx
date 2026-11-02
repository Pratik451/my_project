import React, { useState, useEffect } from 'react';
import { SuggestionItemCMS } from '../../../types';
import { INITIAL_CMS_SUGGESTIONS } from '../../../data/cmsInitialData';
import {
  fetchCmsSuggestions,
  submitCmsSuggestion,
  updateCmsSuggestionItem,
  deleteCmsSuggestionItem,
  saveCmsSuggestions,
} from '../../../services/mediaApi';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  Save,
  Lightbulb,
  Phone,
  Mail,
  User,
  MessageSquare,
  RefreshCw,
  Search,
  X,
  BadgeCheck,
} from 'lucide-react';

interface SuggestionBoxManagerProps {
  suggestions: SuggestionItemCMS[];
  onSaveSuggestions: (updated: SuggestionItemCMS[]) => Promise<void>;
}

const FEEDBACK_TYPE_OPTIONS = [
  'General Suggestion',
  'Service Feedback',
  'Appreciation',
  'Complaint / Grievance',
  'Digital Banking',
  'Service Quality',
  'Savings & Interest',
  'Loan Process',
  'Branch Facility',
  'General Idea',
];

const STATUS_OPTIONS: SuggestionItemCMS['status'][] = [
  'New',
  'Reviewed',
  'Implemented',
  'Archived',
];

export const SuggestionBoxManager: React.FC<SuggestionBoxManagerProps> = ({
  suggestions,
  onSaveSuggestions,
}) => {
  const [list, setList] = useState<SuggestionItemCMS[]>(
    Array.isArray(suggestions) ? suggestions : INITIAL_CMS_SUGGESTIONS
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingItem, setViewingItem] = useState<SuggestionItemCMS | null>(null);
  const [editingItem, setEditingItem] = useState<SuggestionItemCMS | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SuggestionItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    if (Array.isArray(suggestions)) {
      setList(suggestions);
    }
  }, [suggestions]);

  const refreshFromDatabase = async () => {
    setLoadingDb(true);
    try {
      const dbItems = await fetchCmsSuggestions();
      if (Array.isArray(dbItems)) {
        setList(dbItems);
        await onSaveSuggestions(dbItems);
      }
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchCmsSuggestions()
      .then((dbItems) => {
        if (mounted && Array.isArray(dbItems) && dbItems.length > 0) {
          setList(dbItems);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const openAddModal = () => {
    const fresh: SuggestionItemCMS = {
      id: `sug-${Date.now()}`,
      ticketNo: `SUG-2083-${Math.floor(100 + Math.random() * 900)}`,
      senderName: '',
      memberType: 'member',
      phone: '',
      email: '',
      memberCode: '',
      category: 'General Suggestion',
      subject: '',
      suggestionText: '',
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'New',
      adminNotes: '',
      isAnonymous: false,
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const openEditModal = (item: SuggestionItemCMS) => {
    setEditingItem({
      ...item,
      memberType: item.memberType || (item.memberCode ? 'member' : 'non-member'),
      email: item.email || '',
    });
    setIsNew(false);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.subject.trim() || !editingItem.suggestionText.trim()) return;
    setSaving(true);
    try {
      const finalItem: SuggestionItemCMS = {
        ...editingItem,
        senderName: editingItem.senderName.trim() || 'Member / Visitor',
        memberType: editingItem.memberType || 'member',
        memberCode:
          editingItem.memberType === 'non-member' ? '' : (editingItem.memberCode || '').trim(),
        phone: (editingItem.phone || '').trim(),
        email: (editingItem.email || '').trim(),
        subject: editingItem.subject.trim(),
        suggestionText: editingItem.suggestionText.trim(),
      };

      let updated: SuggestionItemCMS[];
      if (isNew) {
        const res = await submitCmsSuggestion(finalItem);
        if (res.success && Array.isArray(res.data)) {
          updated = res.data;
        } else {
          updated = [finalItem, ...list];
          await saveCmsSuggestions(updated);
        }
      } else {
        const dbUpdated = await updateCmsSuggestionItem(finalItem.id, finalItem);
        if (Array.isArray(dbUpdated)) {
          updated = dbUpdated;
        } else {
          updated = list.map((it) => (it.id === finalItem.id ? finalItem : it));
          await saveCmsSuggestions(updated);
        }
      }

      setList(updated);
      await onSaveSuggestions(updated);
      if (viewingItem && viewingItem.id === finalItem.id) {
        setViewingItem(finalItem);
      }
      setEditingItem(null);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: SuggestionItemCMS['status']) => {
    const dbUpdated = await updateCmsSuggestionItem(id, { status: newStatus });
    const updated = Array.isArray(dbUpdated)
      ? dbUpdated
      : list.map((it) => (it.id === id ? { ...it, status: newStatus } : it));
    setList(updated);
    if (viewingItem && viewingItem.id === id) {
      setViewingItem({ ...viewingItem, status: newStatus });
    }
    await onSaveSuggestions(updated);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      const id = itemToDelete.id;
      const dbUpdated = await deleteCmsSuggestionItem(id);
      const updated = Array.isArray(dbUpdated)
        ? dbUpdated
        : list.filter((it) => it.id !== id);
      setList(updated);
      await onSaveSuggestions(updated);
      if (viewingItem?.id === id) setViewingItem(null);
      if (editingItem?.id === id) setEditingItem(null);
      setItemToDelete(null);
    } finally {
      setSaving(false);
    }
  };

  const filtered = list.filter((it) => {
    const matchesStatus = statusFilter === 'ALL' || it.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (it.ticketNo || '').toLowerCase().includes(q) ||
      (it.senderName || '').toLowerCase().includes(q) ||
      (it.memberCode || '').toLowerCase().includes(q) ||
      (it.phone || '').toLowerCase().includes(q) ||
      (it.email || '').toLowerCase().includes(q) ||
      (it.category || '').toLowerCase().includes(q) ||
      (it.subject || '').toLowerCase().includes(q) ||
      (it.suggestionText || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#052636] to-[#065371] p-6 rounded-2xl text-white shadow-md">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block mb-1">
            MySQL Synced &bull; Feedback &amp; Suggestion Form Submissions
          </span>
          <h3 className="text-xl font-black flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-300" />
            Feedback &amp; Suggestion Box Management ({list.length})
          </h3>
          <p className="text-xs text-sky-100/80 mt-1">
            View, edit, reply to, or delete feedback &amp; suggestions submitted by members and visitors from the website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={refreshFromDatabase}
            disabled={loadingDb}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/15 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
            <span>{loadingDb ? 'Syncing...' : 'Refresh DB'}</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Feedback / Suggestion</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#0981ae] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({list.length})
          </button>
          {STATUS_OPTIONS.map((st) => {
            const count = list.filter((i) => i.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0981ae] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, phone, subject..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0981ae] outline-none bg-white"
          />
        </div>
      </div>

      {/* Suggestion Cards List */}
      {filtered.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 text-sm">
          No feedback or suggestion records match the current filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isMember =
              item.memberType === 'member' ||
              (!item.memberType && Boolean(item.memberCode && item.memberCode.trim()));
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#0981ae]/40 shadow-2xs transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#0981ae] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                      {item.ticketNo}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                        isMember
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isMember ? 'Existing Member' : 'Non-Member / Visitor'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                      {item.category || 'General Suggestion'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'Implemented'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Reviewed'
                          ? 'bg-sky-100 text-sky-800'
                          : item.status === 'New'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-400">Submitted: {item.submittedAt}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900">{item.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.suggestionText}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-[#0981ae]" />
                      {item.senderName}
                    </span>
                    {item.memberCode && (
                      <span className="flex items-center gap-1 font-mono text-xs text-[#0981ae] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Member ID: {item.memberCode}
                      </span>
                    )}
                    {item.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {item.phone}
                      </span>
                    )}
                    {item.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {item.email}
                      </span>
                    )}
                  </div>

                  {item.adminNotes && (
                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-950 flex items-start gap-2 mt-2">
                      <MessageSquare className="w-4 h-4 text-[#0981ae] shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-[#0981ae] block">
                          Admin / Committee Action Note:
                        </strong>
                        <span>{item.adminNotes}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleQuickStatusChange(item.id, e.target.value as SuggestionItemCMS['status'])
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 focus:border-[#0981ae] outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        Status: {st}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0981ae] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#0981ae] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Edit Feedback"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-black text-[#0981ae] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                  {viewingItem.ticketNo}
                </span>
                <h4 className="text-lg font-black text-[#0c2d3e] mt-1">{viewingItem.subject}</h4>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase block">Full Name</span>
                <span className="text-slate-900 font-bold text-sm">{viewingItem.senderName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Member Status</span>
                <span className="text-slate-900 font-bold text-sm">
                  {viewingItem.memberType === 'non-member'
                    ? 'Non-Member / General Visitor'
                    : 'Existing Member'}
                  {viewingItem.memberCode ? ` (ID: ${viewingItem.memberCode})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Phone Number</span>
                <span className="text-slate-900 font-semibold text-sm">
                  {viewingItem.phone || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Email Address</span>
                <span className="text-slate-900 font-semibold text-sm">
                  {viewingItem.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Feedback Type</span>
                <span className="text-[#0981ae] font-bold text-sm">
                  {viewingItem.category || 'General Suggestion'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block">Submitted Date &amp; Status</span>
                <span className="text-slate-900 font-bold text-sm">
                  {viewingItem.submittedAt} &bull; {viewingItem.status}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block mb-1.5">
                Message / Suggestion
              </span>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {viewingItem.suggestionText}
              </div>
            </div>

            {viewingItem.adminNotes && (
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950">
                <strong className="font-bold text-[#0981ae] block mb-1">
                  Admin / Supervisory Committee Notes:
                </strong>
                <p className="whitespace-pre-line">{viewingItem.adminNotes}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const item = viewingItem;
                    setViewingItem(null);
                    openEditModal(item);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setItemToDelete(viewingItem)}
                  className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal (Matching the Reference Feedback/Suggestion Form Design) */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h4 className="text-base font-black text-[#0c2d3e] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#0981ae]" />
                  {isNew
                    ? 'Add Feedback or Suggestion'
                    : `Edit Feedback / Suggestion (${editingItem.ticketNo})`}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  All changes are permanently saved to MySQL database storage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Member / Non-Member Selection Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#0c2d3e] cursor-pointer">
                  <input
                    type="radio"
                    name="adminSugMemberType"
                    checked={(editingItem.memberType || 'member') === 'member'}
                    onChange={() => setEditingItem({ ...editingItem, memberType: 'member' })}
                    className="w-4 h-4 accent-[#0c2d3e] cursor-pointer"
                  />
                  <span>I am an Existing Member</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="adminSugMemberType"
                    checked={editingItem.memberType === 'non-member'}
                    onChange={() =>
                      setEditingItem({ ...editingItem, memberType: 'non-member', memberCode: '' })
                    }
                    className="w-4 h-4 accent-[#0c2d3e] cursor-pointer"
                  />
                  <span>Non-Member / General Visitor</span>
                </label>
              </div>

              {/* Two-Column Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.senderName}
                    onChange={(e) => setEditingItem({ ...editingItem, senderName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                    Member ID (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={editingItem.memberType === 'non-member'}
                    value={editingItem.memberType === 'non-member' ? '' : editingItem.memberCode || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, memberCode: e.target.value })}
                    placeholder={
                      editingItem.memberType === 'non-member'
                        ? 'Not applicable for Non-Member'
                        : 'e.g. 001245'
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.phone || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingItem.email || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                    Feedback Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingItem.category || 'General Suggestion'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none bg-white"
                  >
                    {FEEDBACK_TYPE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.subject}
                    onChange={(e) => setEditingItem({ ...editingItem, subject: e.target.value })}
                    placeholder="Brief subject of message"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  Your Message / Suggestion <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.suggestionText}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, suggestionText: e.target.value })
                  }
                  placeholder="Please describe your suggestion, feedback, or experience in detail..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                    Review Status
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        status: e.target.value as SuggestionItemCMS['status'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#0981ae] outline-none bg-white"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0981ae] mb-1">
                    Admin / Committee Notes
                  </label>
                  <input
                    type="text"
                    value={editingItem.adminNotes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, adminNotes: e.target.value })}
                    placeholder="Record action taken or resolution note..."
                    className="w-full px-3 py-2 rounded-lg border border-sky-300 bg-sky-50/40 text-xs focus:border-[#0981ae] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0c2d3e] hover:bg-[#0981ae] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving to MySQL...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-rose-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Feedback Record?
              </h4>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete feedback{' '}
              <strong className="text-slate-900">{itemToDelete.ticketNo}</strong> from{' '}
              <strong className="text-slate-900">{itemToDelete.senderName}</strong>? This will remove it from MySQL storage.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
