import React, { useState } from 'react';
import { DepartmentCMS } from '../../../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Phone,
  Mail,
  User,
  ListOrdered,
} from 'lucide-react';

interface Props {
  departments: DepartmentCMS[];
  onSaveDepartments: (updated: DepartmentCMS[]) => Promise<void> | void;
}

export const DepartmentsManager: React.FC<Props> = ({ departments, onSaveDepartments }) => {
  const [list, setList] = useState<DepartmentCMS[]>(departments);
  const [editingDept, setEditingDept] = useState<DepartmentCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (departments) {
      setList(departments);
    }
  }, [departments]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingDept({
      id: `dept-${Date.now()}`,
      nameEn: '',
      nameNp: '',
      headEn: '',
      headNp: '',
      phone: '071-540123',
      email: '',
      descriptionEn: '',
      descriptionNp: '',
      responsibilitiesEn: [''],
      responsibilitiesNp: [''],
      sortOrder: list.length + 1,
    });
    setIsNew(true);
  };

  const handleOpenEditModal = (dept: DepartmentCMS) => {
    setEditingDept({ ...dept });
    setIsNew(false);
  };

  const [deptToDelete, setDeptToDelete] = useState<DepartmentCMS | null>(null);

  const handleDelete = async (dept: DepartmentCMS) => {
    setDeptToDelete(dept);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    const updated = list.filter((d) => d.id !== deptToDelete.id);
    setList(updated);
    setDeptToDelete(null);
    setIsSaving(true);
    try {
      await onSaveDepartments(updated);
      showToast('Department removed and database updated!');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    if (!editingDept.nameEn.trim()) {
      showToast('Department Name (English) is required.');
      return;
    }

    let updated: DepartmentCMS[];
    if (isNew) {
      updated = [...list, editingDept];
    } else {
      updated = list.map((d) => (d.id === editingDept.id ? editingDept : d));
    }

    setList(updated);
    setEditingDept(null);
    setIsSaving(true);
    try {
      await onSaveDepartments(updated);
      showToast(
        isNew
          ? 'New department successfully created and saved to database!'
          : 'Department details successfully updated!'
      );
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="departments-manager" className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-sky-500 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-600" />
            Departments CMS Manager (विभागीय संरचना)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Add, edit, view, and delete all cooperative departments, departmental heads, and service scopes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* List of Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {list.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-sky-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{dept.nameEn}</h3>
                  <p className="text-xs font-medium text-sky-700 font-nepali mt-0.5">{dept.nameNp}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(dept)}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Edit Department"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(dept)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Department Head & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{dept.headEn || 'Head of Dept'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>{dept.phone}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">{dept.email}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mb-4 line-clamp-3">{dept.descriptionEn}</p>

              {/* Responsibilities list */}
              {dept.responsibilitiesEn && dept.responsibilitiesEn.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Core Duties:
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-500 space-y-0.5">
                    {dept.responsibilitiesEn.slice(0, 3).map((r, idx) => (
                      <li key={idx} className="truncate">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>ID: {dept.id}</span>
              <span>Sort Order: {dept.sortOrder || 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT DEPARTMENT */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" />
                {isNew ? 'Add New Department' : 'Edit Department'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Department Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDept.nameEn}
                    onChange={(e) => setEditingDept({ ...editingDept, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. Accounts & Finance Department"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    विभागको नाम (नेपाली) *
                  </label>
                  <input
                    type="text"
                    value={editingDept.nameNp}
                    onChange={(e) => setEditingDept({ ...editingDept, nameNp: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali"
                    placeholder="उदा. लेखा तथा वित्त विभाग"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Department Head (English)
                  </label>
                  <input
                    type="text"
                    value={editingDept.headEn}
                    onChange={(e) => setEditingDept({ ...editingDept, headEn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. Mrs. Sunita Pandey"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    विभागीय प्रमुख (नेपाली)
                  </label>
                  <input
                    type="text"
                    value={editingDept.headNp}
                    onChange={(e) => setEditingDept({ ...editingDept, headNp: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={editingDept.phone}
                    onChange={(e) => setEditingDept({ ...editingDept, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editingDept.email}
                    onChange={(e) => setEditingDept({ ...editingDept, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingDept.sortOrder || 1}
                    onChange={(e) =>
                      setEditingDept({ ...editingDept, sortOrder: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Department Description (English)
                </label>
                <textarea
                  rows={3}
                  value={editingDept.descriptionEn}
                  onChange={(e) => setEditingDept({ ...editingDept, descriptionEn: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  विभागीय विवरण (नेपाली)
                </label>
                <textarea
                  rows={3}
                  value={editingDept.descriptionNp}
                  onChange={(e) => setEditingDept({ ...editingDept, descriptionNp: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
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
                  {isSaving ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: DELETE CONFIRMATION */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 text-base mb-2">Delete Department</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <b>{deptToDelete.nameEn}</b>? This action will immediately remove it from the website and MySQL database.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeptToDelete(null)}
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
                {isSaving ? 'Deleting...' : 'Delete Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
