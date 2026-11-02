import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Save,
  Plus,
  Trash2,
  Globe,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  Edit3,
  X,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { HeadOfficeInfoCMS, HeadOfficeDepartmentItem } from '../../../types';
import { fetchCmsHeadOffice, deleteCmsHeadOffice } from '../../../services/mediaApi';

interface HeadOfficeManagerProps {
  headOffice: HeadOfficeInfoCMS;
  onSave: (updated: HeadOfficeInfoCMS) => Promise<boolean | void> | void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const HeadOfficeManager: React.FC<HeadOfficeManagerProps> = ({
  headOffice,
  onSave,
  showToast,
}) => {
  const [formData, setFormData] = useState<HeadOfficeInfoCMS>(headOffice);
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Add / Edit Department Desk state
  const [isAddingDesk, setIsAddingDesk] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const [deskDraft, setDeskDraft] = useState<HeadOfficeDepartmentItem>({
    id: '',
    name: '',
    nameNp: '',
    ext: '',
    incharge: '',
    inchargeNp: '',
    phone: '',
    email: '',
  });

  // Sync local form state whenever prop updates from MySQL backend
  useEffect(() => {
    if (headOffice && headOffice.officeNameEn !== undefined) {
      setFormData({
        ...headOffice,
        departmentsDirectory: Array.isArray(headOffice.departmentsDirectory)
          ? headOffice.departmentsDirectory
          : [],
      });
    }
  }, [headOffice]);

  const handleChange = (field: keyof HeadOfficeInfoCMS, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReloadFromDb = async () => {
    setIsReloading(true);
    try {
      const latest = await fetchCmsHeadOffice();
      if (latest) {
        setFormData({
          ...latest,
          departmentsDirectory: Array.isArray(latest.departmentsDirectory)
            ? latest.departmentsDirectory
            : [],
        });
        await onSave(latest);
        showToast('Reloaded latest Head Office Information from MySQL database!');
      } else {
        showToast('Could not fetch Head Office Information from database.', 'error');
      }
    } catch {
      showToast('Error reloading Head Office data.', 'error');
    } finally {
      setIsReloading(false);
    }
  };

  const persistHeadOfficeData = async (nextData: HeadOfficeInfoCMS, successMsg: string) => {
    setIsSaving(true);
    try {
      setFormData(nextData);
      const res = await onSave(nextData);
      if (res === false) {
        showToast('Failed to save Head Office info to MySQL database', 'error');
        return false;
      }
      showToast(successMsg);
      return true;
    } catch {
      showToast('Failed to save Head Office info', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const openAddDeskModal = () => {
    setEditingIndex(null);
    setDeskDraft({
      id: `ho-dept-${Date.now()}`,
      name: '',
      nameNp: '',
      ext: '',
      incharge: '',
      inchargeNp: '',
      phone: '',
      email: '',
    });
    setIsAddingDesk(true);
  };

  const openEditDeskModal = (idx: number) => {
    const item = (formData.departmentsDirectory || [])[idx];
    if (!item) return;
    setEditingIndex(idx);
    setDeskDraft({
      id: item.id || `ho-dept-${idx + 1}`,
      name: item.name || '',
      nameNp: item.nameNp || '',
      ext: item.ext || '',
      incharge: item.incharge || '',
      inchargeNp: item.inchargeNp || '',
      phone: item.phone || '',
      email: item.email || '',
    });
    setIsAddingDesk(true);
  };

  const handleSaveDesk = async () => {
    if (!deskDraft.name.trim()) {
      showToast('Please enter the Department / Desk Name', 'error');
      return;
    }

    const currentList = Array.isArray(formData.departmentsDirectory)
      ? [...formData.departmentsDirectory]
      : [];

    const cleanedItem: HeadOfficeDepartmentItem = {
      id: deskDraft.id || `ho-dept-${Date.now()}`,
      name: deskDraft.name.trim(),
      nameNp: (deskDraft.nameNp || '').trim(),
      ext: (deskDraft.ext || '').trim() || '-',
      incharge: (deskDraft.incharge || '').trim() || 'Department Officer',
      inchargeNp: (deskDraft.inchargeNp || '').trim(),
      phone: (deskDraft.phone || '').trim(),
      email: (deskDraft.email || '').trim(),
    };

    if (editingIndex !== null && editingIndex >= 0 && editingIndex < currentList.length) {
      currentList[editingIndex] = cleanedItem;
    } else {
      currentList.push(cleanedItem);
    }

    const nextData: HeadOfficeInfoCMS = {
      ...formData,
      departmentsDirectory: currentList,
    };

    const ok = await persistHeadOfficeData(
      nextData,
      editingIndex !== null
        ? 'Department desk updated & saved to MySQL!'
        : 'New department desk added & saved to MySQL!'
    );

    if (ok) {
      setIsAddingDesk(false);
      setEditingIndex(null);
    }
  };

  const handleConfirmDeleteDesk = async (idx: number) => {
    const currentList = Array.isArray(formData.departmentsDirectory)
      ? [...formData.departmentsDirectory]
      : [];
    const target = currentList[idx];
    if (!target) return;

    setIsSaving(true);
    try {
      const targetKey = target.id || target.name;
      const deletedRes = await deleteCmsHeadOffice(targetKey);
      const updatedList = currentList.filter((_, i) => i !== idx);
      const nextData: HeadOfficeInfoCMS = deletedRes
        ? {
            ...deletedRes,
            departmentsDirectory: Array.isArray(deletedRes.departmentsDirectory)
              ? deletedRes.departmentsDirectory
              : updatedList,
          }
        : {
            ...formData,
            departmentsDirectory: updatedList,
          };

      setFormData(nextData);
      await onSave(nextData);
      setConfirmDeleteIdx(null);
      showToast(`Removed "${target.name}" from Head Office directory!`);
    } catch {
      showToast('Failed to delete department desk', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistHeadOfficeData(
      formData,
      'Head Office Information saved permanently to MySQL!'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              CENTRAL HEADQUARTERS CMS (MYSQL SYNCED)
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Head Office Information</h2>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
              Manage official headquarters address, contact numbers, operating hours, GPS coordinates, and department desk extensions. All changes save permanently to MySQL and update the public website immediately.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReloadFromDb}
              disabled={isReloading || isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold rounded-xl transition-all text-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              Reload from DB
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving to MySQL...' : 'Save Head Office Info'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Live Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Head Office Name</p>
            <p className="text-sm font-bold text-slate-800 truncate">{formData.officeNameEn || 'Not set'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Headquarters Address</p>
            <p className="text-sm font-bold text-slate-800 truncate">{formData.addressEn || 'Not set'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Dispatch</p>
            <p className="text-sm font-bold text-slate-800 truncate">{formData.primaryPhone || 'Not set'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Department Desks</p>
            <p className="text-sm font-bold text-slate-800">
              {(formData.departmentsDirectory || []).length} Active Desks
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & Center Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Office Identity & Registration */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Office Identity & Registration Details</h3>
                <p className="text-xs text-slate-500">Bilingual title, registration number, PAN, and establishment date</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Office Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.officeNameEn || ''}
                  onChange={(e) => handleChange('officeNameEn', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Office Name (Nepali / नेपाली)
                </label>
                <input
                  type="text"
                  value={formData.officeNameNp || ''}
                  onChange={(e) => handleChange('officeNameNp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registration No.
                </label>
                <input
                  type="text"
                  value={formData.regNumber || ''}
                  onChange={(e) => handleChange('regNumber', e.target.value)}
                  placeholder="e.g., 1452/065/066"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNumber || ''}
                  onChange={(e) => handleChange('panNumber', e.target.value)}
                  placeholder="e.g., 302847591"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Established Year
                </label>
                <input
                  type="text"
                  value={formData.establishedDate || ''}
                  onChange={(e) => handleChange('establishedDate', e.target.value)}
                  placeholder="e.g., 2065 B.S. (2008 A.D.)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Location & Geographic Coordinates */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Location & Geographic Coordinates</h3>
                <p className="text-xs text-slate-500">Physical address, administrative division, and Google Maps embed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Street Address (English) *
                </label>
                <input
                  type="text"
                  value={formData.addressEn || ''}
                  onChange={(e) => handleChange('addressEn', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Street Address (Nepali)
                </label>
                <input
                  type="text"
                  value={formData.addressNp || ''}
                  onChange={(e) => handleChange('addressNp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Province
                </label>
                <input
                  type="text"
                  value={formData.province || ''}
                  onChange={(e) => handleChange('province', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district || ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Municipality / City
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ward No.
                </label>
                <input
                  type="text"
                  value={formData.ward || ''}
                  onChange={(e) => handleChange('ward', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nearby Landmark (English)
                </label>
                <input
                  type="text"
                  value={formData.landmarkEn || ''}
                  onChange={(e) => handleChange('landmarkEn', e.target.value)}
                  placeholder="e.g., Opposite Municipal Building"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nearby Landmark (Nepali)
                </label>
                <input
                  type="text"
                  value={formData.landmarkNp || ''}
                  onChange={(e) => handleChange('landmarkNp', e.target.value)}
                  placeholder="उदा. नगरपालिका भवन अगाडि"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  GPS Coordinates
                </label>
                <div className="relative">
                  <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={formData.gpsCoordinates || ''}
                    onChange={(e) => handleChange('gpsCoordinates', e.target.value)}
                    placeholder="26.6451° N, 87.9912° E"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Google Map Embed URL (iframe src)
              </label>
              <input
                type="text"
                value={formData.googleMapEmbedUrl || ''}
                onChange={(e) => handleChange('googleMapEmbedUrl', e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-xs"
              />
            </div>
          </div>

          {/* Head Office Department Extensions (Add, Edit, Delete) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Head Office Department Desks & Extensions</h3>
                  <p className="text-xs text-slate-500">
                    Add, edit, or delete internal PABX extensions, direct phone numbers, and desk officers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openAddDeskModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Department Desk
              </button>
            </div>

            {/* Add / Edit Desk Inline Panel */}
            {isAddingDesk && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    {editingIndex !== null ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                        Edit Department Desk (#{editingIndex + 1})
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-emerald-700" />
                        Add New Department Desk
                      </>
                    )}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingDesk(false);
                      setEditingIndex(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Department / Desk Name (EN) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Credit & Loan Desk"
                      value={deskDraft.name}
                      onChange={(e) => setDeskDraft((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Department Name (Nepali)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. कर्जा तथा ऋण शाखा"
                      value={deskDraft.nameNp || ''}
                      onChange={(e) => setDeskDraft((p) => ({ ...p, nameNp: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      PABX Extension No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 102"
                      value={deskDraft.ext}
                      onChange={(e) => setDeskDraft((p) => ({ ...p, ext: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Desk In-Charge / Officer (EN)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Ramesh Adhikari"
                      value={deskDraft.incharge}
                      onChange={(e) => setDeskDraft((p) => ({ ...p, incharge: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Direct Phone / Mobile
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., +977-23-540125"
                      value={deskDraft.phone || ''}
                      onChange={(e) => setDeskDraft((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Desk Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g., loan@ankurcooperative.coop.np"
                      value={deskDraft.email || ''}
                      onChange={(e) => setDeskDraft((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingDesk(false);
                      setEditingIndex(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDesk}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {editingIndex !== null ? 'Update & Save Desk' : 'Add & Save Desk'}
                  </button>
                </div>
              </div>
            )}

            {/* Desks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Department / Desk</th>
                    <th className="py-2.5 px-3">Ext.</th>
                    <th className="py-2.5 px-3">In-Charge / Contact</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(formData.departmentsDirectory || []).map((dept, idx) => (
                    <tr key={dept.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{dept.name}</div>
                        {dept.nameNp && (
                          <div className="text-xs text-slate-500">{dept.nameNp}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
                          Ext. {dept.ext}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-700 font-medium">{dept.incharge}</div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                          {dept.phone && <span>{dept.phone}</span>}
                          {dept.email && <span>{dept.email}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {confirmDeleteIdx === idx ? (
                          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                            <span className="text-[11px] font-bold text-rose-700">Delete?</span>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteDesk(idx)}
                              disabled={isSaving}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteIdx(null)}
                              className="px-2 py-0.5 bg-white text-slate-600 border border-slate-200 rounded text-[11px] font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditDeskModal(idx)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Desk"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteIdx(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Desk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!formData.departmentsDirectory || formData.departmentsDirectory.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                        No department extensions added yet. Click &ldquo;Add Department Desk&rdquo; above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact & Dispatch Channels */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Communication Channels</h3>
                <p className="text-xs text-slate-500">Official phones, emails & postal info</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Landline / Phone *
                </label>
                <input
                  type="text"
                  value={formData.primaryPhone || ''}
                  onChange={(e) => handleChange('primaryPhone', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alternate Phone / Mobile
                </label>
                <input
                  type="text"
                  value={formData.altPhone || ''}
                  onChange={(e) => handleChange('altPhone', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Toll-Free Hotline
                </label>
                <input
                  type="text"
                  value={formData.tollFreePhone || ''}
                  onChange={(e) => handleChange('tollFreePhone', e.target.value)}
                  placeholder="1660-01-XXXXX"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    value={formData.officialEmail || ''}
                    onChange={(e) => handleChange('officialEmail', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Member Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail || ''}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    P.O. Box
                  </label>
                  <input
                    type="text"
                    value={formData.poBox || ''}
                    onChange={(e) => handleChange('poBox', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.websiteUrl || ''}
                      onChange={(e) => handleChange('websiteUrl', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Operating Hours</h3>
                <p className="text-xs text-slate-500">Standard & seasonal banking timings</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sunday – Thursday Hours (EN)
                </label>
                <input
                  type="text"
                  value={formData.sunToThuHoursEn || ''}
                  onChange={(e) => handleChange('sunToThuHoursEn', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sunday – Thursday Hours (NP)
                </label>
                <input
                  type="text"
                  value={formData.sunToThuHoursNp || ''}
                  onChange={(e) => handleChange('sunToThuHoursNp', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Friday Hours (EN)
                </label>
                <input
                  type="text"
                  value={formData.fridayHoursEn || ''}
                  onChange={(e) => handleChange('fridayHoursEn', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Friday Hours (NP)
                </label>
                <input
                  type="text"
                  value={formData.fridayHoursNp || ''}
                  onChange={(e) => handleChange('fridayHoursNp', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Holiday / Saturday Notice (EN)
                </label>
                <input
                  type="text"
                  value={formData.holidayNoticeEn || ''}
                  onChange={(e) => handleChange('holidayNoticeEn', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Holiday / Saturday Notice (NP)
                </label>
                <input
                  type="text"
                  value={formData.holidayNoticeNp || ''}
                  onChange={(e) => handleChange('holidayNoticeNp', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sync Status Card */}
          <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/80 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                Live Frontend & MySQL Synchronization Active
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-emerald-700/90 leading-relaxed">
                Updates made here are stored in XAMPP MySQL (<code className="font-mono">head_office_info</code> &amp; <code className="font-mono">site_settings</code>) and immediately displayed on the Top Bar, Footer, Contact Us page, and Head Office Information page.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
