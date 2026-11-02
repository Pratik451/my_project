import React, { useState, useRef } from 'react';
import { LeadershipMemberCMS, LeadershipRoleCategory } from '../../../types';
import {
  saveCmsLeadership,
  uploadLeadershipPhoto,
  fetchCmsLeadership,
  deleteCmsLeadershipMember,
} from '../../../services/mediaApi';

interface LeadershipManagerProps {
  initialMembers: LeadershipMemberCMS[];
  onUpdate: (members: LeadershipMemberCMS[]) => void;
}

export const LeadershipManager: React.FC<LeadershipManagerProps> = ({
  initialMembers,
  onUpdate,
}) => {
  const [members, setMembers] = useState<LeadershipMemberCMS[]>(initialMembers || []);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<LeadershipMemberCMS | null>(null);
  const [previewMember, setPreviewMember] = useState<LeadershipMemberCMS | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRefresh = async () => {
    try {
      const refreshed = await fetchCmsLeadership();
      if (refreshed && Array.isArray(refreshed)) {
        setMembers(refreshed);
        onUpdate(refreshed);
        showNotification('success', 'Leadership profiles refreshed from MySQL database!');
      } else {
        showNotification('success', 'Using current in-memory profiles.');
      }
    } catch (err: any) {
      showNotification('error', 'Failed to refresh from database: ' + (err?.message || 'Error'));
    }
  };

  const handleAddNew = () => {
    const newSort = members.length + 1;
    const newMember: LeadershipMemberCMS = {
      id: `lead-${Date.now()}`,
      category: 'other',
      nameEn: '',
      nameNp: '',
      designationEn: '',
      designationNp: '',
      photoUrl: '/uploads/media/team-manager.svg',
      shortMessageEn: '',
      shortMessageNp: '',
      fullMessageEn: '',
      fullMessageNp: '',
      phone: '',
      email: '',
      officeRoomEn: '',
      officeRoomNp: '',
      availabilityEn: '',
      availabilityNp: '',
      actionType: 'read_more',
      actionLabelEn: 'Read More',
      actionLabelNp: 'विस्तृत सन्देश',
      sortOrder: newSort,
      isActive: true,
      publishedDate: '2081 Ashwin',
    };
    setEditingMember(newMember);
    setIsEditing(true);
  };

  const handleEdit = (member: LeadershipMemberCMS) => {
    setEditingMember({ ...member });
    setIsEditing(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsSaving(true);
    try {
      await deleteCmsLeadershipMember(deleteTargetId);
      const updated = members.filter((m) => m.id !== deleteTargetId);
      setMembers(updated);
      onUpdate(updated);
      await saveCmsLeadership(updated);
      showNotification('success', 'Leadership profile deleted and database updated!');
    } catch (err: any) {
      showNotification('error', 'Failed to delete: ' + (err?.message || 'Error'));
    } finally {
      setIsSaving(false);
      setDeleteTargetId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    const updated = members.map((m) =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    );
    setMembers(updated);
    onUpdate(updated);
    try {
      await saveCmsLeadership(updated);
      showNotification('success', 'Status updated and saved to MySQL!');
    } catch (e) {
      showNotification('error', 'Failed to save status toggle.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === members.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...members];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Re-assign sortOrder numbers
    const normalized = newItems.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setMembers(normalized);
    onUpdate(normalized);
    try {
      await saveCmsLeadership(normalized);
      showNotification('success', 'Order rearranged and saved to MySQL!');
    } catch (e) {}
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;

    setIsUploadingPhoto(true);
    try {
      const uploadedUrl = await uploadLeadershipPhoto(file, editingMember.nameEn || 'Leader Profile');
      setEditingMember((prev) => (prev ? { ...prev, photoUrl: uploadedUrl } : null));
      showNotification('success', 'Photo uploaded to server disk successfully!');
    } catch (err: any) {
      showNotification('error', 'Failed to upload photo: ' + (err?.message || 'Error'));
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (!editingMember.nameEn.trim() && !editingMember.nameNp.trim()) {
      showNotification('error', 'Please enter at least an English or Nepali full name.');
      return;
    }

    setIsSaving(true);
    try {
      const exists = members.some((m) => m.id === editingMember.id);
      let updatedList: LeadershipMemberCMS[];
      if (exists) {
        updatedList = members.map((m) => (m.id === editingMember.id ? editingMember : m));
      } else {
        updatedList = [...members, editingMember];
      }

      setMembers(updatedList);
      onUpdate(updatedList);
      await saveCmsLeadership(updatedList);
      showNotification('success', 'Leadership profile saved permanently in XAMPP MySQL database!');
      setIsEditing(false);
      setEditingMember(null);
    } catch (err: any) {
      showNotification('error', 'Failed to save: ' + (err?.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName =
        (m.nameEn || '').toLowerCase().includes(q) || (m.nameNp || '').includes(q);
      const matchDes =
        (m.designationEn || '').toLowerCase().includes(q) ||
        (m.designationNp || '').includes(q);
      const matchPhone = (m.phone || '').includes(q);
      if (!matchName && !matchDes && !matchPhone) return false;
    }
    return true;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'chairman':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ceo':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'info_officer':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'grievance_officer':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'chairman':
        return 'Chairman (अध्यक्ष)';
      case 'ceo':
        return 'CEO (प्रमुख कार्यकारी)';
      case 'info_officer':
        return 'Information Officer (सूचना अधिकारी)';
      case 'grievance_officer':
        return 'Grievance Officer (गुनासो सुनुवाइ)';
      default:
        return 'Executive / Other (अन्य नेतृत्व)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-semibold shadow-md animate-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-[#0c2d3e] via-[#0981ae] to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-xs">
              <span>👑</span>
              <span>Home Page Leadership CMS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Messages from Leadership & Designated Officers
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-2xl">
              Manage the 4 primary leadership cards (Chairman, CEO, Information Officer, Grievance Officer) and any designated executive profiles. All changes, circular photos, contact numbers, and statements persist permanently in MySQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              title="Reload profiles directly from XAMPP MySQL database"
            >
              <span>🔄</span>
              <span>Refresh from MySQL</span>
            </button>
            <button
              type="button"
              onClick={handleAddNew}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>➕</span>
              <span>Add New Profile</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-sky-200 font-bold uppercase">Total Profiles</div>
            <div className="text-xl font-black">{members.length}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-sky-200 font-bold uppercase">Active on Home</div>
            <div className="text-xl font-black">{members.filter((m) => m.isActive !== false).length}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-sky-200 font-bold uppercase">Statutory Officers</div>
            <div className="text-xl font-black">
              {members.filter((m) => m.category === 'info_officer' || m.category === 'grievance_officer').length}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-[11px] text-sky-200 font-bold uppercase">Server Photos</div>
            <div className="text-xl font-black">
              {members.filter((m) => m.photoUrl && m.photoUrl.startsWith('/uploads/')).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', 'chairman', 'ceo', 'info_officer', 'grievance_officer'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#0981ae] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'all'
                ? 'All Profiles'
                : cat === 'chairman'
                ? 'Chairman'
                : cat === 'ceo'
                ? 'CEO'
                : cat === 'info_officer'
                ? 'Info Officer'
                : 'Grievance Officer'}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
          />
        </div>
      </div>

      {/* Profiles Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.map((member, idx) => (
          <div
            key={member.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
              member.isActive !== false
                ? 'border-slate-200 hover:border-[#0981ae]/60 hover:shadow-md'
                : 'border-slate-200 bg-slate-50/70 opacity-70'
            }`}
          >
            <div>
              {/* Header: Photo, Name, Badges & Reorder Controls */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  {/* Circular Avatar Preview */}
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-sky-400 to-emerald-400 shadow-md shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.nameEn}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#0981ae]">
                          {(member.nameEn || 'L').charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(
                          member.category
                        )}`}
                      >
                        {getCategoryLabel(member.category)}
                      </span>
                      {member.isActive === false && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {member.nameEn || 'Untitled'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {member.nameNp}
                    </p>
                  </div>
                </div>

                {/* Sort Order Badges & Up/Down Arrows */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === members.length - 1}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold"
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <span className="text-[11px] font-bold text-slate-400 ml-1">
                    #{member.sortOrder}
                  </span>
                </div>
              </div>

              {/* Designation & Short Message */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-3">
                <div className="font-semibold text-[#0981ae]">
                  {member.designationEn} • {member.designationNp}
                </div>
                <div className="text-[11px] line-clamp-2 italic text-slate-500">
                  &ldquo;{member.shortMessageEn || member.shortMessageNp || 'No short message'}&rdquo;
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(member.id)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    member.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {member.isActive !== false ? '● Active' : '○ Inactive'}
                </button>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Action: {member.actionType}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewMember(member)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Preview Modal"
                >
                  👁️ Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(member)}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0981ae] text-xs font-bold border border-sky-200 transition-colors cursor-pointer"
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(member.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full bg-slate-50 rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-semibold text-sm">No leadership profiles found matching the current filter.</p>
            <button
              type="button"
              onClick={handleAddNew}
              className="mt-3 px-4 py-2 bg-[#0981ae] text-white rounded-xl text-xs font-bold hover:bg-[#07688c]"
            >
              Add New Profile
            </button>
          </div>
        )}
      </div>

      {/* Edit / Create Leadership Profile Modal */}
      {isEditing && editingMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => {
            if (!isSaving) {
              setIsEditing(false);
              setEditingMember(null);
            }
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0c2d3e] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                  👑
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    {members.some((m) => m.id === editingMember.id)
                      ? 'Edit Leadership Profile'
                      : 'Create New Leadership Profile'}
                  </h3>
                  <p className="text-xs text-sky-200">
                    Saves to server disk and persists permanently in XAMPP MySQL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSaving) {
                    setIsEditing(false);
                    setEditingMember(null);
                  }
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Profile Photo Server Upload Section */}
              <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-full p-1 bg-white shadow-md border-2 border-sky-400/50">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                      {editingMember.photoUrl ? (
                        <img
                          src={editingMember.photoUrl}
                          alt="Leader preview"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-[#0981ae]">👤</span>
                      )}
                    </div>
                  </div>
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Leader Profile Photo (Server-Backed Disk Upload)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Upload JPEG, PNG, or SVG. Stored directly on disk at <code className="bg-white px-1.5 py-0.5 rounded border">/public/uploads/media/</code>.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-[#0981ae] hover:bg-[#07688c] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>📁</span>
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                    </button>

                    {/* Quick Preset Selector for default graphics */}
                    <select
                      value={editingMember.photoUrl}
                      onChange={(e) =>
                        setEditingMember((prev) => (prev ? { ...prev, photoUrl: e.target.value } : null))
                      }
                      className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                    >
                      <option value="/uploads/media/team-chairman.svg">Preset: Chairman SVG</option>
                      <option value="/uploads/media/team-ceo.svg">Preset: CEO SVG</option>
                      <option value="/uploads/media/team-info-officer.svg">Preset: Info Officer SVG</option>
                      <option value="/uploads/media/team-grievance-officer.svg">Preset: Grievance Officer SVG</option>
                      <option value="/uploads/media/team-manager.svg">Preset: Manager SVG</option>
                      <option value="/uploads/media/team-vicechair.svg">Preset: Vice-Chair SVG</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Role Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role Category *
                  </label>
                  <select
                    value={editingMember.category}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, category: e.target.value as LeadershipRoleCategory } : null
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  >
                    <option value="chairman">Chairman (अध्यक्ष)</option>
                    <option value="ceo">Chief Executive Officer (CEO)</option>
                    <option value="info_officer">Information Officer (सूचना अधिकारी)</option>
                    <option value="grievance_officer">Grievance Officer (गुनासो सुनुवाइ अधिकारी)</option>
                    <option value="other">Other Apex Official</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sort Order *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingMember.sortOrder}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, sortOrder: parseInt(e.target.value) || 1 } : null
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingMember.isActive !== false}
                      onChange={(e) =>
                        setEditingMember((prev) =>
                          prev ? { ...prev, isActive: e.target.checked } : null
                        )
                      }
                      className="w-4 h-4 rounded text-[#0981ae] focus:ring-[#0981ae]"
                    />
                    <span>Active on Home Page</span>
                  </label>
                </div>
              </div>

              {/* Bilingual Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Bharat Sharma Pokhrel"
                    value={editingMember.nameEn}
                    onChange={(e) =>
                      setEditingMember((prev) => (prev ? { ...prev, nameEn: e.target.value } : null))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (नेपाली) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै: श्री भरत शर्मा पोखरेल"
                    value={editingMember.nameNp}
                    onChange={(e) =>
                      setEditingMember((prev) => (prev ? { ...prev, nameNp: e.target.value } : null))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>
              </div>

              {/* Bilingual Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chairman, Board of Directors"
                    value={editingMember.designationEn}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, designationEn: e.target.value } : null
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation (नेपाली) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै: अध्यक्ष, सञ्चालक समिति"
                    value={editingMember.designationNp}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, designationNp: e.target.value } : null
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>
              </div>

              {/* Action Button Configuration */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🔘</span> Action Button Behavior
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Action Type
                    </label>
                    <select
                      value={editingMember.actionType}
                      onChange={(e) =>
                        setEditingMember((prev) =>
                          prev
                            ? {
                                ...prev,
                                actionType: e.target.value as any,
                              }
                            : null
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="read_more">Read More (विस्तृत सन्देश Modal)</option>
                      <option value="view_details">View Details (विवरण हेर्नुहोस् Modal)</option>
                      <option value="file_grievance">File Grievance (गुनासो दर्ता Form)</option>
                      <option value="custom">Custom Web Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Button Label (English)
                    </label>
                    <input
                      type="text"
                      placeholder="Read More / View Details"
                      value={editingMember.actionLabelEn || ''}
                      onChange={(e) =>
                        setEditingMember((prev) =>
                          prev ? { ...prev, actionLabelEn: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Button Label (नेपाली)
                    </label>
                    <input
                      type="text"
                      placeholder="विस्तृत सन्देश / गुनासो दर्ता"
                      value={editingMember.actionLabelNp || ''}
                      onChange={(e) =>
                        setEditingMember((prev) =>
                          prev ? { ...prev, actionLabelNp: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>

                {editingMember.actionType === 'custom' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Custom Action URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or #contact"
                      value={editingMember.customActionUrl || ''}
                      onChange={(e) =>
                        setEditingMember((prev) =>
                          prev ? { ...prev, customActionUrl: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Short Message (Home Page Card Preview) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Message (English - Displayed on Card)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief 2-3 sentence inspiring vision or official notice..."
                    value={editingMember.shortMessageEn}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, shortMessageEn: e.target.value } : null
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Message (नेपाली - कार्डमा देखिने सन्देश)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="छोटो २-३ वाक्यको सन्देश वा सूचना..."
                    value={editingMember.shortMessageNp}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, shortMessageNp: e.target.value } : null
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>
              </div>

              {/* Full Message / Statement (Modal View) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Message / Charter (English - Modal View)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Complete detailed message, vision address, or RTI charter..."
                    value={editingMember.fullMessageEn || ''}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, fullMessageEn: e.target.value } : null
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Message / Charter (नेपाली - मोडल विवरण)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="विस्तृत सन्देश, प्रतिबद्धता वा कार्यविधि..."
                    value={editingMember.fullMessageNp || ''}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev ? { ...prev, fullMessageNp: e.target.value } : null
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0981ae]"
                  />
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsEditing(false);
                    setEditingMember(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>💾</span>
                  <span>{isSaving ? 'Saving to MySQL...' : 'Save Profile to MySQL'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              🗑️
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Delete Leadership Profile?
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this profile? It will be permanently removed from the website and XAMPP MySQL database.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                {isSaving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setPreviewMember(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#0c2d3e] to-[#0981ae] text-white p-5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                Leadership Card Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewMember(null)}
                className="text-white hover:text-sky-200 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center space-y-3">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-sky-400 to-emerald-400 mx-auto shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                  {previewMember.photoUrl ? (
                    <img
                      src={previewMember.photoUrl}
                      alt={previewMember.nameEn}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[#0981ae]">
                      {(previewMember.nameEn || 'L').charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {previewMember.nameEn} / {previewMember.nameNp}
              </h3>
              <p className="text-xs font-bold text-[#0981ae]">
                {previewMember.designationEn}
              </p>
              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 italic border border-slate-100 text-left">
                &ldquo;{previewMember.shortMessageEn}&rdquo;
              </div>
              <button
                type="button"
                onClick={() => setPreviewMember(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
