import React, { useState } from 'react';
import { CareerCMS } from '../../../types';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Calendar,
  MapPin,
  Clock,
  Send,
  GraduationCap,
} from 'lucide-react';

interface Props {
  careers: CareerCMS[];
  onSaveCareers: (updated: CareerCMS[]) => Promise<void> | void;
}

export const CareersManager: React.FC<Props> = ({ careers, onSaveCareers }) => {
  const [list, setList] = useState<CareerCMS[]>(careers);
  const [editingJob, setEditingJob] = useState<CareerCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (careers) {
      setList(careers);
    }
  }, [careers]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingJob({
      id: `job-${Date.now()}`,
      jobTitleEn: '',
      jobTitleNp: '',
      code: `VAC-0${list.length + 1}`,
      department: 'Operations & Microfinance',
      positionsCount: 1,
      employmentType: 'Full Time',
      locationEn: 'Butwal & Branch Offices',
      locationNp: 'बुटवल तथा सेवा केन्द्रहरू',
      deadline: '2081 Chaitra 15',
      status: 'Open',
      education: 'Bachelor degree in Management or equivalent.',
      experience: 'At least 1-2 years experience in BFIs / Cooperatives.',
      descriptionEn: 'Responsible for branch management and business development.',
      descriptionNp: 'सेवा केन्द्र व्यवस्थापन तथा कारोबार विस्तार सम्बन्धी कार्य।',
      requirementsEn: ['Strong communication skills in English and Nepali', 'Valid two-wheeler driving license'],
      requirementsNp: ['नेपाली र अंग्रेजी भाषामा राम्रो दक्षता', 'दुई पाङ्ग्रे सवारी चालक अनुमतिपत्र'],
      applyEmail: 'vacancy@ekatacoop.com.np',
    });
    setIsNew(true);
  };

  const handleOpenEdit = (job: CareerCMS) => {
    setEditingJob({ ...job });
    setIsNew(false);
  };

  const [jobToDelete, setJobToDelete] = useState<CareerCMS | null>(null);

  const handleDelete = (job: CareerCMS) => {
    setJobToDelete(job);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    const updated = list.filter((j) => j.id !== jobToDelete.id);
    setList(updated);
    setJobToDelete(null);
    setIsSaving(true);
    try {
      await onSaveCareers(updated);
      showToast('Vacancy deleted and database updated!');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!editingJob.jobTitleEn.trim()) {
      showToast('Job Title (English) is required.');
      return;
    }

    let updated: CareerCMS[];
    if (isNew) {
      updated = [editingJob, ...list];
    } else {
      updated = list.map((j) => (j.id === editingJob.id ? editingJob : j));
    }

    setList(updated);
    setEditingJob(null);
    setIsSaving(true);
    try {
      await onSaveCareers(updated);
      showToast(
        isNew
          ? 'New career vacancy successfully published!'
          : 'Career vacancy details successfully updated in database!'
      );
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="careers-manager" className="space-y-6">
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
            <Briefcase className="w-6 h-6 text-sky-600" />
            Career & Vacancy CMS Manager (कर्मचारी आवश्यकता तथा वृत्ति विकास)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create, view, edit, and close job postings, qualifications, deadlines, and application procedures.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Post New Vacancy
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {list.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-sky-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {job.code && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md font-mono">
                        {job.code}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        job.status === 'Open' || job.status === 'active'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.status === 'Open' || job.status === 'active'
                        ? 'Accepting Applications'
                        : 'Closed'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{job.jobTitleEn}</h3>
                  <p className="text-xs font-semibold text-sky-700 font-nepali">{job.jobTitleNp}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(job)}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Edit Job"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(job)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Job Info Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    {job.employmentType} ({job.positionsCount} {job.positionsCount > 1 ? 'Nos' : 'No'})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span className="truncate">{job.locationEn || 'Butwal Head Office'}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 text-amber-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Deadline: {job.deadline}</span>
                </div>
              </div>

              {/* Requirements summary */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div>
                  <strong className="text-slate-800">Education:</strong> {job.education}
                </div>
                <div>
                  <strong className="text-slate-800">Experience:</strong> {job.experience}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Apply: {job.applyEmail || 'vacancy@ekatacoop.com.np'}</span>
              <button
                type="button"
                onClick={() => handleOpenEdit(job)}
                className="text-sky-600 hover:underline font-semibold"
              >
                View Full Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT JOB VACANCY */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-600" />
                {isNew ? 'Create Career Vacancy' : 'Edit Career Vacancy'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Position Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.jobTitleEn}
                    onChange={(e) => setEditingJob({ ...editingJob, jobTitleEn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. Senior Credit & Risk Evaluation Officer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Notice Code
                  </label>
                  <input
                    type="text"
                    value={editingJob.code || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, code: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                    placeholder="VAC-01/81"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  पदको नाम (नेपाली) *
                </label>
                <input
                  type="text"
                  value={editingJob.jobTitleNp}
                  onChange={(e) => setEditingJob({ ...editingJob, jobTitleNp: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-nepali"
                  placeholder="उदा. वरिष्ठ कर्जा तथा जोखिम अधिकृत"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Required Nos.
                  </label>
                  <input
                    type="number"
                    value={editingJob.positionsCount}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, positionsCount: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={editingJob.employmentType}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, employmentType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Full Time">Full Time (स्थायी/पूर्णकालीन)</option>
                    <option value="Part Time">Part Time (आंशिक)</option>
                    <option value="Contract">Contract (करार)</option>
                    <option value="Internship">Internship (प्रशिक्षार्थी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Status
                  </label>
                  <select
                    value={editingJob.status}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Open">Open (Accepting Applications)</option>
                    <option value="Closed">Closed (Expired)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Duty Location (English)
                  </label>
                  <input
                    type="text"
                    value={editingJob.locationEn || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, locationEn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Application Deadline *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.deadline}
                    onChange={(e) => setEditingJob({ ...editingJob, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="e.g. 2081 Chaitra 15 (March 28, 2025)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Educational Qualification (English)
                </label>
                <textarea
                  rows={2}
                  value={editingJob.education}
                  onChange={(e) => setEditingJob({ ...editingJob, education: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Experience Required (English)
                </label>
                <textarea
                  rows={2}
                  value={editingJob.experience}
                  onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Apply Email Address
                  </label>
                  <input
                    type="email"
                    value={editingJob.applyEmail || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, applyEmail: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
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
                  {isSaving ? 'Saving...' : 'Save Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: DELETE CONFIRMATION */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 text-base mb-2">Delete Career Vacancy</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <b>{jobToDelete.jobTitleEn}</b>? This action will immediately remove it from the careers page and MySQL database.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
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
                {isSaving ? 'Deleting...' : 'Delete Vacancy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
