import React, { useState, useEffect } from 'react';
import { TeamMemberCMS } from '../../../types';
import { uploadSingleMediaImage, deleteMediaByPath } from '../../../services/mediaApi';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Upload,
  UserCheck,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  GitBranch,
  Award,
  Briefcase,
  LayoutGrid,
  ShieldCheck,
  Crown,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface Props {
  team: TeamMemberCMS[];
  onSaveTeam: (updated: TeamMemberCMS[]) => Promise<void> | void;
  defaultView?: 'bod-tree' | 'management' | 'committee' | 'all';
}

export const TeamManager: React.FC<Props> = ({ team, onSaveTeam, defaultView = 'bod-tree' }) => {
  const normalizeTeamList = (raw: any): TeamMemberCMS[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray(raw.team)) return raw.team;
    return [];
  };

  const [list, setList] = useState<TeamMemberCMS[]>(() => normalizeTeamList(team));
  const [activeView, setActiveView] = useState<'bod-tree' | 'management' | 'committee' | 'staff' | 'all'>(defaultView);
  const [editingMember, setEditingMember] = useState<TeamMemberCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TeamMemberCMS | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setList(normalizeTeamList(team));
    }
  }, [team]);

  useEffect(() => {
    if (defaultView) {
      setActiveView(defaultView);
    }
  }, [defaultView]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to infer BOD tier if not explicitly set
  const getMemberTier = (m: TeamMemberCMS): 'tier1' | 'tier2' | 'tier3' | 'tier4' => {
    if (m.hierarchyLevel) return m.hierarchyLevel;
    const role = (m.roleEn || '').toLowerCase();
    if (m.category === 'committee') return 'tier4';
    if (role.includes('chairman') && !role.includes('vice')) return 'tier1';
    if (
      role.includes('vice') ||
      role.includes('secretary') ||
      role.includes('treasurer') ||
      role.includes('chief executive') ||
      role.includes('ceo')
    ) {
      return m.category === 'management' && (role.includes('ceo') || role.includes('chief executive'))
        ? 'tier1'
        : 'tier2';
    }
    return 'tier3';
  };

  const boardMembers = list
    .filter((m) => m.category === 'board')
    .sort((a, b) => (a.order || a.sortOrder || 99) - (b.order || b.sortOrder || 99));

  const committeeMembers = list
    .filter((m) => m.category === 'committee')
    .sort((a, b) => (a.order || a.sortOrder || 99) - (b.order || b.sortOrder || 99));

  const managementMembers = list
    .filter((m) => m.category === 'management')
    .sort((a, b) => (a.order || a.sortOrder || 99) - (b.order || b.sortOrder || 99));

  const staffMembers = list
    .filter((m) => m.category === 'staff')
    .sort((a, b) => (a.order || a.sortOrder || 99) - (b.order || b.sortOrder || 99));

  // BOD Tree Tiers
  const bodTier1 = boardMembers.filter((m) => getMemberTier(m) === 'tier1');
  const bodTier2 = boardMembers.filter((m) => getMemberTier(m) === 'tier2');
  const bodTier3 = boardMembers.filter((m) => getMemberTier(m) === 'tier3' || getMemberTier(m) === 'tier4');

  // Management Tree Tiers
  const mgmtTier1 = managementMembers.filter((m) => getMemberTier(m) === 'tier1');
  const mgmtTier2 = managementMembers.filter((m) => getMemberTier(m) !== 'tier1');

  const handleOpenAddModal = (
    presetCategory?: 'board' | 'management' | 'committee' | 'staff',
    presetTier?: 'tier1' | 'tier2' | 'tier3' | 'tier4',
    presetRoleEn?: string,
    presetRoleNp?: string
  ) => {
    const defaultCat =
      presetCategory ||
      (activeView === 'bod-tree'
        ? 'board'
        : activeView === 'management'
        ? 'management'
        : activeView === 'committee'
        ? 'committee'
        : activeView === 'staff'
        ? 'staff'
        : 'board');

    setEditingMember({
      id: `team-${Date.now()}`,
      nameEn: '',
      nameNp: '',
      roleEn: presetRoleEn || '',
      roleNp: presetRoleNp || '',
      category: defaultCat,
      hierarchyLevel: presetTier || (defaultCat === 'committee' ? 'tier4' : 'tier3'),
      departmentEn: defaultCat === 'management' ? 'Operations & Administration' : 'Board of Directors',
      departmentNp: defaultCat === 'management' ? 'सञ्चालन तथा प्रशासन' : 'सञ्चालक समिति',
      qualificationEn: '',
      experienceYears: '',
      phone: '071-540123',
      email: '',
      imageUrl: '/uploads/media/team-ceo.svg',
      order: list.length + 1,
      sortOrder: list.length + 1,
    });
    setIsNew(true);
  };

  const handleOpenEditModal = (member: TeamMemberCMS) => {
    setEditingMember({
      ...member,
      hierarchyLevel: getMemberTier(member),
    });
    setIsNew(false);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const updated = list.filter((m) => m.id !== itemToDelete.id);
    setList(updated);
    setItemToDelete(null);
    setIsSaving(true);
    try {
      await onSaveTeam(updated);
      showToast('Team member removed and database updated!');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (!editingMember.nameEn.trim()) {
      showToast('Member Name (English) is required.');
      return;
    }
    if (!editingMember.roleEn.trim()) {
      showToast('Role / Designation (English) is required.');
      return;
    }

    let updated: TeamMemberCMS[];
    if (isNew) {
      updated = [...list, editingMember];
    } else {
      updated = list.map((m) => (m.id === editingMember.id ? editingMember : m));
    }

    setList(updated);
    setEditingMember(null);
    setIsSaving(true);
    try {
      await onSaveTeam(updated);
      showToast(
        isNew
          ? 'New member added to organization structure and saved!'
          : 'Member details & hierarchy updated in database!'
      );
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhoto = async (targetId: string, file: File) => {
    setUploadingTarget(targetId);
    try {
      const oldPhoto =
        targetId === 'modal'
          ? editingMember?.imageUrl || editingMember?.photoUrl
          : list.find((m) => m.id === targetId)?.imageUrl || list.find((m) => m.id === targetId)?.photoUrl;
      const res = await uploadSingleMediaImage(file, 'team', `member-${targetId}`);
      if (res.success && res.file) {
        if (oldPhoto && oldPhoto.startsWith('/uploads/') && !oldPhoto.includes('team-ceo.svg') && !oldPhoto.includes('team-chair.svg')) {
          await deleteMediaByPath(oldPhoto);
        }
        if (editingMember && (editingMember.id === targetId || targetId === 'modal')) {
          setEditingMember({
            ...editingMember,
            imageUrl: res.file.url,
            photoUrl: res.file.url,
          });
        } else {
          const updated = list.map((m) =>
            m.id === targetId ? { ...m, imageUrl: res.file!.url, photoUrl: res.file!.url } : m
          );
          setList(updated);
          await onSaveTeam(updated);
        }
        showToast('Photo uploaded to server and updated in MySQL database!');
      } else {
        showToast(res.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`);
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleDeletePhoto = async (targetId: string) => {
    setUploadingTarget(targetId);
    try {
      const defaultAvatar = '/uploads/media/team-ceo.svg';
      if (editingMember && (editingMember.id === targetId || targetId === 'modal')) {
        const currentUrl = editingMember.imageUrl || editingMember.photoUrl || '';
        if (currentUrl && currentUrl.startsWith('/uploads/') && !currentUrl.includes('team-ceo.svg') && !currentUrl.includes('team-chair.svg')) {
          await deleteMediaByPath(currentUrl);
        }
        setEditingMember({
          ...editingMember,
          imageUrl: defaultAvatar,
          photoUrl: defaultAvatar,
        });
        showToast('Member photo deleted from server and reset.');
      } else {
        const targetMember = list.find((m) => m.id === targetId);
        const currentUrl = targetMember?.imageUrl || targetMember?.photoUrl || '';
        if (currentUrl && currentUrl.startsWith('/uploads/') && !currentUrl.includes('team-ceo.svg') && !currentUrl.includes('team-chair.svg')) {
          await deleteMediaByPath(currentUrl);
        }
        const updated = list.map((m) =>
          m.id === targetId ? { ...m, imageUrl: defaultAvatar, photoUrl: defaultAvatar } : m
        );
        setList(updated);
        await onSaveTeam(updated);
        showToast('Member photo deleted from server and updated in MySQL database!');
      }
    } catch (err: any) {
      showToast(`Delete photo error: ${err.message}`);
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleMoveOrder = async (memberId: string, direction: 'up' | 'down') => {
    const idx = list.findIndex((m) => m.id === memberId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const copy = [...list];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;

    const updated = copy.map((item, i) => ({ ...item, order: i + 1, sortOrder: i + 1 }));
    setList(updated);
    setIsSaving(true);
    try {
      await onSaveTeam(updated);
      showToast('Hierarchy display order updated and saved!');
    } catch (err: any) {
      showToast(`Error updating order: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'board':
        return { label: 'Board of Directors', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'management':
        return { label: 'Management Team', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'committee':
        return { label: 'Account / Committee', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'staff':
      default:
        return { label: 'Branch Staff', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const renderTreeMemberNode = (
    member: TeamMemberCMS,
    variant: 'chairman' | 'officer' | 'director' | 'committee' | 'ceo' | 'manager'
  ) => {
    const photo = member.imageUrl || member.photoUrl || '/uploads/media/team-ceo.svg';
    const isTopLeader = variant === 'chairman' || variant === 'ceo';

    const borderColors: Record<string, string> = {
      chairman: 'border-sky-500 ring-4 ring-sky-500/10 bg-linear-to-b from-sky-50/70 to-white',
      ceo: 'border-blue-500 ring-4 ring-blue-500/10 bg-linear-to-b from-blue-50/70 to-white',
      officer: 'border-sky-300 bg-white hover:border-sky-500',
      director: 'border-slate-200 bg-white hover:border-sky-400',
      committee: 'border-amber-300 bg-amber-50/20 hover:border-amber-500',
      manager: 'border-blue-200 bg-white hover:border-blue-400',
    };

    const rolePillColors: Record<string, string> = {
      chairman: 'bg-sky-700 text-white',
      ceo: 'bg-blue-700 text-white',
      officer: 'bg-sky-100 text-sky-800 border border-sky-200',
      director: 'bg-slate-100 text-slate-700 border border-slate-200',
      committee: 'bg-amber-100 text-amber-900 border border-amber-300',
      manager: 'bg-blue-50 text-blue-800 border border-blue-200',
    };

    return (
      <div
        key={member.id}
        className={`relative rounded-2xl border-2 p-4 shadow-sm transition-all flex flex-col justify-between ${
          borderColors[variant]
        } ${isTopLeader ? 'w-full max-w-md mx-auto' : 'w-full'}`}
      >
        <div>
          <div className="flex items-start gap-3.5">
            <div
              className={`relative group rounded-full overflow-hidden shrink-0 border-2 ${
                isTopLeader ? 'w-16 h-16 border-sky-600' : 'w-13 h-13 border-sky-300'
              } bg-slate-100`}
            >
              <img
                src={photo}
                alt={member.nameEn}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/uploads/media/team-ceo.svg';
                }}
              />
              <label
                title="Change Photo"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleUploadPhoto(member.id, e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${rolePillColors[variant]}`}>
                  {member.roleEn}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(member.id, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title="Move Earlier"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(member.id, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title="Move Later"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className={`font-extrabold text-slate-900 truncate ${isTopLeader ? 'text-base' : 'text-sm'}`}>
                {member.nameEn}
              </h4>
              <p className="text-xs text-slate-600 font-medium truncate">{member.nameNp}</p>
              <p className="text-[11px] text-sky-700 font-semibold truncate mt-0.5">{member.roleNp}</p>

              {(member.departmentEn || member.qualificationEn) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {member.departmentEn && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {member.departmentEn}
                    </span>
                  )}
                  {member.qualificationEn && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">
                      {member.qualificationEn}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {(member.phone || member.email) && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
              {member.phone && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-sky-600" />
                  {member.phone}
                </span>
              )}
              {member.email && (
                <span className="inline-flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-sky-600" />
                  {member.email}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => setPreviewPhotoUrl(photo)}
            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            title="Preview Member Photo"
          >
            <Eye className="w-3.5 h-3.5 text-sky-700" /> Preview
          </button>
          <label
            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            title="Upload or Replace Photo"
          >
            <RefreshCw className={`w-3 h-3 ${uploadingTarget === member.id ? 'animate-spin' : ''}`} />
            <span>{uploadingTarget === member.id ? '...' : 'Replace'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleUploadPhoto(member.id, e.target.files[0]);
                }
              }}
            />
          </label>
          {photo && !photo.includes('team-ceo.svg') && (
            <button
              type="button"
              onClick={() => handleDeletePhoto(member.id)}
              className="inline-flex items-center justify-center p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Photo from Server"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleOpenEditModal(member)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setItemToDelete(member)}
            className="inline-flex items-center justify-center p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
            title="Remove Member from Tree"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
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

      {/* Photo Preview Lightbox Modal */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600" />
                Member Portrait Preview
              </h4>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={previewPhotoUrl}
                alt="Member Portrait Preview"
                className="max-h-[52vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="truncate">{previewPhotoUrl}</span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-sans font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold uppercase tracking-wider border border-sky-200 mb-2">
            <GitBranch className="w-3.5 h-3.5" />
            Interactive Organizational Hierarchy & CRUD Manager
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Board of Directors (Tree Structure) & Management Team CMS
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Perform full Create, Read, Update & Delete (CRUD) operations on the Board of Directors (BOD) tree hierarchy, Management Team, and Supervisory Committees.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAddModal('board', 'tier3')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add BOD Member
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal('management', 'tier2')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add Management Staff
          </button>
        </div>
      </div>

      {/* View Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveView('bod-tree')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'bod-tree'
              ? 'bg-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          BOD Tree Structure ({boardMembers.length + committeeMembers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveView('management')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'management'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Management Team CRUD ({managementMembers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveView('committee')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'committee'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Account Supervisory Committee ({committeeMembers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveView('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          All Directory Grid ({list.length})
        </button>
      </div>

      {/* =====================================================================
          VIEW 1: INTERACTIVE BOD TREE STRUCTURE IN ADMIN LOGIN
      ===================================================================== */}
      {activeView === 'bod-tree' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-sky-600" />
                Board of Directors Organizational Tree (सञ्चालक समिति वृक्ष संरचना)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Visual governance tree from General Assembly & Chairman down to Office Bearers, Board Members, and Account Supervisory Committee. Click any card to edit or add members directly to a tier.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200">
                Total BOD & Oversight Nodes: {boardMembers.length + committeeMembers.length}
              </span>
            </div>
          </div>

          {/* ROOT APEX: GENERAL ASSEMBLY */}
          <div className="flex flex-col items-center">
            <div className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest shadow-md border-2 border-sky-500">
              General Assembly of Members (साधारण सभा - सर्वोच्च निकाय)
            </div>
            {/* Vertical Stem */}
            <div className="w-0.5 h-6 bg-sky-500" />

            {/* TIER 1: CHAIRMAN */}
            <div className="w-full max-w-lg">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                  Tier 1 • Apex Leadership (अध्यक्ष)
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('board', 'tier1', 'Chairman', 'अध्यक्ष')}
                  className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tier 1 Node
                </button>
              </div>
              <div className="space-y-3">
                {bodTier1.map((m) => renderTreeMemberNode(m, 'chairman'))}
                {bodTier1.length === 0 && (
                  <div className="text-center p-5 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/30">
                    <p className="text-xs font-bold text-slate-700 mb-2">No Chairman assigned in Tier 1</p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal('board', 'tier1', 'Chairman, Board of Directors', 'अध्यक्ष, सञ्चालक समिति')}
                      className="px-3.5 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold"
                    >
                      + Assign Chairman
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Vertical Connector & Horizontal Branch Bar to Tier 2 */}
            <div className="w-0.5 h-8 bg-sky-500" />
            <div className="w-3/4 max-w-4xl h-0.5 bg-sky-500 rounded-full" />
            <div className="w-3/4 max-w-4xl flex justify-between">
              <div className="w-0.5 h-5 bg-sky-500" />
              <div className="w-0.5 h-5 bg-sky-500" />
              <div className="w-0.5 h-5 bg-sky-500" />
            </div>

            {/* TIER 2: EXECUTIVE OFFICERS (VICE CHAIRMAN, SECRETARY, TREASURER) */}
            <div className="w-full bg-sky-50/40 rounded-3xl p-5 border border-sky-200/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-sky-600" />
                    Tier 2 • Executive Office Bearers (पदाधिकारीहरू: उपाध्यक्ष, सचिव, कोषाध्यक्ष)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('board', 'tier2', 'Vice-Chairman', 'उपाध्यक्ष')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Office Bearer (Tier 2)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bodTier2.map((m) => renderTreeMemberNode(m, 'officer'))}
              </div>

              {bodTier2.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No Executive Officers in Tier 2. Click "+ Add Office Bearer (Tier 2)" to add Vice-Chairman, Secretary, or Treasurer.
                </div>
              )}
            </div>

            {/* Vertical Connector & Branch Bar to Tier 3 */}
            <div className="w-0.5 h-8 bg-sky-400" />
            <div className="w-4/5 max-w-5xl h-0.5 bg-sky-400 rounded-full" />
            <div className="w-4/5 max-w-5xl flex justify-between">
              <div className="w-0.5 h-5 bg-sky-400" />
              <div className="w-0.5 h-5 bg-sky-400" />
              <div className="w-0.5 h-5 bg-sky-400" />
              <div className="w-0.5 h-5 bg-sky-400" />
            </div>

            {/* TIER 3: BOARD MEMBERS (सञ्चालक सदस्यहरू) */}
            <div className="w-full bg-slate-50 rounded-3xl p-5 border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-600" />
                    Tier 3 • Elected Board Members (सञ्चालक समिति सदस्यहरू)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('board', 'tier3', 'Board Member', 'सञ्चालक सदस्य')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Board Member (Tier 3)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bodTier3.map((m) => renderTreeMemberNode(m, 'director'))}
              </div>

              {bodTier3.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No Board Members in Tier 3 yet. Click "+ Add Board Member" to add elected directors.
                </div>
              )}
            </div>

            {/* Dashed Statutory Oversight Line to Tier 4 */}
            <div className="w-0.5 h-8 border-l-2 border-dashed border-amber-500" />

            {/* TIER 4: ACCOUNT SUPERVISORY COMMITTEE (लेखा सुपरिवेक्षण समिति) */}
            <div className="w-full bg-amber-50/40 rounded-3xl p-5 border-2 border-amber-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Tier 4 • Independent Account Supervisory Committee (लेखा सुपरिवेक्षण समिति)
                  </span>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                    Elected directly by the General Assembly for statutory internal audit & governance oversight.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenAddModal('committee', 'tier4', 'Member, Account Supervisory Committee', 'सदस्य, लेखा सुपरिवेक्षण समिति')
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Committee Member
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {committeeMembers.map((m) => renderTreeMemberNode(m, 'committee'))}
              </div>

              {committeeMembers.length === 0 && (
                <div className="text-center py-6 text-xs text-amber-800">
                  No Account Supervisory Committee members added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: MANAGEMENT TEAM HIERARCHY & CRUD
      ===================================================================== */}
      {activeView === 'management' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Executive Management Team Hierarchy & CRUD (व्यवस्थापन समूह)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, reorder, or remove the Chief Executive Officer (CEO), Department Heads, and Senior Officers displayed on the Management Team page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddModal('management', 'tier2')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Add Management Member
            </button>
          </div>

          <div className="flex flex-col items-center">
            {/* CEO / Executive Head Node */}
            <div className="w-full max-w-lg">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  Executive Head (प्रमुख कार्यकारी अधिकृत / व्यवस्थापक)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenAddModal('management', 'tier1', 'Chief Executive Officer (CEO)', 'प्रमुख कार्यकारी अधिकृत')
                  }
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add CEO / GM Node
                </button>
              </div>
              <div className="space-y-3">
                {mgmtTier1.map((m) => renderTreeMemberNode(m, 'ceo'))}
                {mgmtTier1.length === 0 && (
                  <div className="text-center p-5 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30">
                    <p className="text-xs font-bold text-slate-700 mb-2">No CEO / Executive Head assigned</p>
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenAddModal('management', 'tier1', 'Chief Executive Officer (CEO)', 'प्रमुख कार्यकारी अधिकृत')
                      }
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      + Assign CEO
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Connector to Department Heads */}
            <div className="w-0.5 h-8 bg-blue-400" />
            <div className="w-4/5 max-w-5xl h-0.5 bg-blue-400 rounded-full" />
            <div className="w-4/5 max-w-5xl flex justify-between">
              <div className="w-0.5 h-5 bg-blue-400" />
              <div className="w-0.5 h-5 bg-blue-400" />
              <div className="w-0.5 h-5 bg-blue-400" />
            </div>

            {/* Department Heads & Senior Officers */}
            <div className="w-full bg-blue-50/30 rounded-3xl p-5 border border-blue-200/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Department Heads, Branch Managers & Senior Officers (विभागीय प्रमुख तथा अधिकृतहरू)
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('management', 'tier2', 'Department Head', 'विभागीय प्रमुख')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Department Head / Officer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mgmtTier2.map((m) => renderTreeMemberNode(m, 'manager'))}
              </div>

              {mgmtTier2.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No department heads or management officers added yet. Click "+ Add Department Head / Officer" above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3 & 4: COMMITTEE OR ALL DIRECTORY GRID
      ===================================================================== */}
      {(activeView === 'committee' || activeView === 'all' || activeView === 'staff') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeView === 'committee'
              ? committeeMembers
              : activeView === 'staff'
              ? staffMembers
              : list
            ).map((member, idx) => {
              const badge = getCategoryBadge(member.category);
              const photo = member.imageUrl || member.photoUrl || '/uploads/media/team-ceo.svg';
              return (
                <div
                  key={member.id || idx}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="relative group w-14 h-14 rounded-full overflow-hidden bg-sky-50 border-2 border-sky-300 shrink-0">
                        <img
                          src={photo}
                          alt={member.nameEn}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/uploads/media/team-ceo.svg';
                          }}
                        />
                        <label
                          title="Upload Member Photo"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold"
                        >
                          <Upload className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadPhoto(member.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(member.id, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOrder(member.id, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm truncate">{member.nameEn}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">{member.nameNp}</p>
                        <p className="text-xs text-sky-700 font-semibold mt-1 truncate">{member.roleEn}</p>
                        <p className="text-[11px] text-slate-500 truncate">{member.roleNp}</p>
                      </div>
                    </div>

                    <div className="space-y-1 py-2 border-t border-slate-100 text-xs text-slate-600">
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPhotoUrl(photo)}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      title="Preview Photo"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-700" /> Preview
                    </button>
                    <label
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      title="Upload or Replace Photo"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${uploadingTarget === member.id ? 'animate-spin' : ''}`} />
                      <span>{uploadingTarget === member.id ? '...' : 'Replace'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleUploadPhoto(member.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(member)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(member)}
                      className="flex items-center justify-center p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all cursor-pointer"
                      title="Delete Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 text-center mb-1">Confirm Member Deletion</h4>
            <p className="text-xs text-slate-600 text-center mb-5">
              Are you sure you want to remove <b>{itemToDelete.nameEn}</b> ({itemToDelete.roleEn}) from the cooperative leadership tree?
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

      {/* Add / Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isNew ? 'Add New BOD / Management Member' : 'Edit Member & Tree Position'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Photo Upload, Preview, Replace & Delete */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div
                  onClick={() =>
                    setPreviewPhotoUrl(
                      editingMember.imageUrl || editingMember.photoUrl || '/uploads/media/team-ceo.svg'
                    )
                  }
                  className="w-16 h-16 rounded-full overflow-hidden bg-sky-100 border-2 border-sky-400 shrink-0 cursor-pointer relative group"
                  title="Click to Preview Full Portrait"
                >
                  <img
                    src={editingMember.imageUrl || editingMember.photoUrl || '/uploads/media/team-ceo.svg'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/uploads/media/team-ceo.svg';
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Member Photo / Portrait (Server Upload)
                    </label>
                    <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 truncate max-w-[220px]">
                      {editingMember.imageUrl || editingMember.photoUrl || '/uploads/media/team-ceo.svg'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingTarget === 'modal'
                        ? 'Uploading...'
                        : editingMember.imageUrl && !editingMember.imageUrl.includes('team-ceo.svg')
                        ? 'Replace Photo'
                        : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadPhoto('modal', e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPhotoUrl(
                          editingMember.imageUrl || editingMember.photoUrl || '/uploads/media/team-ceo.svg'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-600" />
                      Preview
                    </button>
                    {editingMember.imageUrl && !editingMember.imageUrl.includes('team-ceo.svg') && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto('modal')}
                        disabled={uploadingTarget === 'modal'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Bharat Sharma Pokhrel"
                    value={editingMember.nameEn}
                    onChange={(e) => setEditingMember({ ...editingMember, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (नेपाली)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. श्री भरत शर्मा पोखरेल"
                    value={editingMember.nameNp}
                    onChange={(e) => setEditingMember({ ...editingMember, nameNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role / Designation (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chairman / Vice-Chairman / CEO"
                    value={editingMember.roleEn}
                    onChange={(e) => setEditingMember({ ...editingMember, roleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role / Designation (नेपाली)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. अध्यक्ष, सञ्चालक समिति"
                    value={editingMember.roleNp}
                    onChange={(e) => setEditingMember({ ...editingMember, roleNp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Governance Category
                  </label>
                  <select
                    value={editingMember.category}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="board">Board of Directors (सञ्चालक समिति)</option>
                    <option value="management">Executive Management (व्यवस्थापन समूह)</option>
                    <option value="committee">Account Supervisory Committee (लेखा सुपरिवेक्षण समिति)</option>
                    <option value="staff">Branch Staff Member (कर्मचारी)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tree Hierarchy Tier (वृक्ष तह)
                  </label>
                  <select
                    value={editingMember.hierarchyLevel || 'tier3'}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        hierarchyLevel: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="tier1">Tier 1: Apex Leader (Chairman / CEO)</option>
                    <option value="tier2">Tier 2: Executive Officer (Vice-Chair, Secretary, Treasurer, Dept Head)</option>
                    <option value="tier3">Tier 3: Board Member / Senior Officer</option>
                    <option value="tier4">Tier 4: Account Supervisory Committee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Portfolio (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Credit & Risk / Governance"
                    value={editingMember.departmentEn || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, departmentEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MBA, M.Phil, CA"
                    value={editingMember.qualificationEn || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, qualificationEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18+ Years"
                    value={editingMember.experienceYears || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="071-540123 / 98570XXXXX"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="chairman@ekatacoop.com.np"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
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
                  {isSaving ? 'Saving to Database...' : 'Save Member to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
