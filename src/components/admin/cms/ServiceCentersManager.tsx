import React, { useState } from 'react';
import { ServiceCenterCMS } from '../../../types';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Eye,
} from 'lucide-react';

interface Props {
  serviceCenters: ServiceCenterCMS[];
  onSaveServiceCenters: (updated: ServiceCenterCMS[]) => Promise<void> | void;
}

export const ServiceCentersManager: React.FC<Props> = ({
  serviceCenters,
  onSaveServiceCenters,
}) => {
  const [list, setList] = useState<ServiceCenterCMS[]>(serviceCenters);
  const [editingCenter, setEditingCenter] = useState<ServiceCenterCMS | null>(null);
  const [viewingCenter, setViewingCenter] = useState<ServiceCenterCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (serviceCenters) {
      setList(serviceCenters);
    }
  }, [serviceCenters]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingCenter({
      id: `center-${Date.now()}`,
      nameEn: '',
      nameNp: '',
      code: `BTL-0${list.length + 1}`,
      addressEn: '',
      addressNp: '',
      managerEn: '',
      managerNp: '',
      phone: '071-540123',
      email: '',
      operatingHours: 'Sunday - Friday: 10:00 AM - 5:00 PM',
      mapUrl: '',
      servicesProvidedEn: ['Deposit & Loan Counter', 'Cash Teller Desk'],
      servicesProvidedNp: ['बचत तथा कर्जा काउन्टर', 'नगद भुक्तानी सेवा'],
      sortOrder: list.length + 1,
    });
    setIsNew(true);
  };

  const handleOpenEdit = (center: ServiceCenterCMS) => {
    setEditingCenter({ ...center });
    setIsNew(false);
  };

  const [centerToDelete, setCenterToDelete] = useState<ServiceCenterCMS | null>(null);

  const handleDelete = (center: ServiceCenterCMS) => {
    setCenterToDelete(center);
  };

  const handleConfirmDelete = async () => {
    if (!centerToDelete) return;
    const updated = list.filter((c) => c.id !== centerToDelete.id);
    setList(updated);
    setCenterToDelete(null);
    setIsSaving(true);
    try {
      await onSaveServiceCenters(updated);
      showToast('Service center deleted and database updated!');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCenter) return;

    if (!editingCenter.nameEn.trim()) {
      showToast('Service Center Name (English) is required.');
      return;
    }

    let updated: ServiceCenterCMS[];
    if (isNew) {
      updated = [...list, editingCenter];
    } else {
      updated = list.map((c) => (c.id === editingCenter.id ? editingCenter : c));
    }

    setList(updated);
    setEditingCenter(null);
    setIsSaving(true);
    try {
      await onSaveServiceCenters(updated);
      showToast(
        isNew
          ? 'New service center successfully created!'
          : 'Service center successfully updated in database!'
      );
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="service-centers-manager" className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-sky-500 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-600" />
            Service Centers & Branches CMS Manager (सेवा केन्द्रहरू)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage all branch locations, service counter desks, contact numbers, hours, and addresses.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Service Center
        </button>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {list.map((center) => (
          <div
            key={center.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-sky-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-md">
                      {center.code || 'BRANCH'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{center.nameEn}</h3>
                  </div>
                  <p className="text-xs font-medium text-sky-700 font-nepali mt-1">
                    {center.nameNp}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingCenter(center)}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                    title="View Service Center Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(center)}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Service Center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(center)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Service Center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info details */}
              <div className="space-y-2.5 text-xs text-slate-600 mb-4 bg-slate-50 p-4 rounded-xl">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">Address:</strong> {center.addressEn}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Phone:</strong> {center.phone}
                  </span>
                </div>
                {center.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Email:</strong> {center.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Hours:</strong> {center.operatingHours}
                  </span>
                </div>
              </div>

              {/* Manager */}
              {center.managerEn && (
                <div className="text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-slate-700">In-Charge:</span> {center.managerEn}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>ID: {center.id}</span>
              {center.mapUrl ? (
                <a
                  href={center.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" /> Map View
                </a>
              ) : (
                <span>No Map Link</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: VIEW SERVICE CENTER */}
      {viewingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0981ae]" />
                Service Center Details
              </h3>
              <button
                type="button"
                onClick={() => setViewingCenter(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-sky-800 bg-white px-2 py-0.5 rounded">
                    Code: {viewingCenter.code}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{viewingCenter.nameEn}</h4>
                  <p className="text-xs text-slate-600 font-nepali">{viewingCenter.nameNp}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block font-semibold mb-0.5">Physical Address</span>
                  <p className="font-medium text-slate-800">{viewingCenter.addressEn}</p>
                  <p className="text-slate-500 font-nepali">{viewingCenter.addressNp}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block font-semibold mb-0.5">Telephone</span>
                    <strong className="text-slate-800 font-mono">{viewingCenter.phone}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block font-semibold mb-0.5">In-Charge Manager</span>
                    <strong className="text-slate-800">{viewingCenter.managerEn || 'Officer In-Charge'}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block font-semibold mb-0.5">Operating Hours</span>
                  <p className="font-medium text-slate-800">{viewingCenter.operatingHours}</p>
                </div>

                {viewingCenter.servicesProvidedEn && viewingCenter.servicesProvidedEn.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block font-semibold mb-1">Services Offered</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      {viewingCenter.servicesProvidedEn.map((srv, i) => (
                        <li key={i}>{srv}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              {viewingCenter.mapUrl ? (
                <a
                  href={viewingCenter.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on Map
                </a>
              ) : <div />}
              <button
                type="button"
                onClick={() => setViewingCenter(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE CENTER */}
      {editingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                {isNew ? 'Add Service Center' : 'Edit Service Center'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCenter(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Center / Branch Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCenter.nameEn}
                    onChange={(e) => setEditingCenter({ ...editingCenter, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. Milanchowk Service Center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={editingCenter.code}
                    onChange={(e) => setEditingCenter({ ...editingCenter, code: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    placeholder="BTL-02"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  सेवा केन्द्रको नाम (नेपाली) *
                </label>
                <input
                  type="text"
                  value={editingCenter.nameNp}
                  onChange={(e) => setEditingCenter({ ...editingCenter, nameNp: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali"
                  placeholder="उदा. मिलनचोक सेवा केन्द्र"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Address (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCenter.addressEn}
                    onChange={(e) => setEditingCenter({ ...editingCenter, addressEn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    ठेगाना (नेपाली) *
                  </label>
                  <input
                    type="text"
                    value={editingCenter.addressNp}
                    onChange={(e) => setEditingCenter({ ...editingCenter, addressNp: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Branch In-charge / Manager
                  </label>
                  <input
                    type="text"
                    value={editingCenter.managerEn}
                    onChange={(e) => setEditingCenter({ ...editingCenter, managerEn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Phone Numbers
                  </label>
                  <input
                    type="text"
                    value={editingCenter.phone}
                    onChange={(e) => setEditingCenter({ ...editingCenter, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingCenter.email}
                    onChange={(e) => setEditingCenter({ ...editingCenter, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={editingCenter.operatingHours}
                    onChange={(e) =>
                      setEditingCenter({ ...editingCenter, operatingHours: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={editingCenter.mapUrl}
                  onChange={(e) => setEditingCenter({ ...editingCenter, mapUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCenter(null)}
                  className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Service Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: DELETE CONFIRMATION */}
      {centerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 text-base mb-2">Delete Service Center</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <b>{centerToDelete.nameEn}</b>? This action will immediately remove it from the website and MySQL database.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCenterToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                {isSaving ? 'Deleting...' : 'Delete Service Center'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
