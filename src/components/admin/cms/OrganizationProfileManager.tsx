import React, { useState } from 'react';
import {
  CmsPagesState,
  HistoryMilestonesPageCMS,
  WhyChooseUsPageCMS,
  TeamMemberCMS,
  InstitutionalProfileItemCMS,
} from '../../../types';
import { INITIAL_CMS_PAGES } from '../../../data/cmsInitialData';
import { uploadSingleMediaImage, deleteMediaByPath } from '../../../services/mediaApi';
import { HistoryMilestonesManager } from './HistoryMilestonesManager';
import { WhyChooseUsManager } from './WhyChooseUsManager';
import { TeamManager } from './TeamManager';
import { InstitutionalProfileManager } from './InstitutionalProfileManager';
import {
  Building,
  Target,
  UserCheck,
  Award,
  Upload,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Compass,
  LayoutGrid,
  Eye,
  ExternalLink,
  Layers,
  History,
  Sparkles,
  GitBranch,
  Briefcase,
  RefreshCw,
  X,
  Crown,
} from 'lucide-react';

interface Props {
  pages: CmsPagesState;
  onSavePages: (updated: CmsPagesState) => Promise<void> | void;
  historyMilestones?: HistoryMilestonesPageCMS;
  onSaveHistoryMilestones?: (updated: HistoryMilestonesPageCMS) => Promise<void> | void;
  whyChooseUs?: WhyChooseUsPageCMS;
  onSaveWhyChooseUs?: (updated: WhyChooseUsPageCMS) => Promise<void> | void;
  team?: TeamMemberCMS[];
  onSaveTeam?: (updated: TeamMemberCMS[]) => Promise<void> | void;
  institutionalProfiles?: InstitutionalProfileItemCMS[];
  onSaveInstitutionalProfiles?: (updated: InstitutionalProfileItemCMS[]) => Promise<void> | void;
  onOpenLeadershipMessages?: () => void;
}

export const OrganizationProfileManager: React.FC<Props> = ({
  pages,
  onSavePages,
  historyMilestones,
  onSaveHistoryMilestones,
  whyChooseUs,
  onSaveWhyChooseUs,
  team,
  onSaveTeam,
  institutionalProfiles,
  onSaveInstitutionalProfiles,
  onOpenLeadershipMessages,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'profile'
    | 'institutionalProfile'
    | 'history'
    | 'whyChooseUs'
    | 'missionVision'
    | 'chairman'
    | 'ceo'
    | 'bodTree'
    | 'management'
    | 'discover'
    | 'showcase'
  >('profile');
  const normalizePages = (raw?: CmsPagesState): CmsPagesState => {
    const base = raw || INITIAL_CMS_PAGES;
    return {
      profile: {
        ...INITIAL_CMS_PAGES.profile,
        ...(base.profile || {}),
        pointsEn: Array.isArray(base.profile?.pointsEn)
          ? base.profile.pointsEn
          : INITIAL_CMS_PAGES.profile.pointsEn,
        pointsNp: Array.isArray(base.profile?.pointsNp)
          ? base.profile.pointsNp
          : INITIAL_CMS_PAGES.profile.pointsNp,
      },
      missionVision: {
        ...INITIAL_CMS_PAGES.missionVision,
        ...(base.missionVision || {}),
        valuesEn: Array.isArray(base.missionVision?.valuesEn)
          ? base.missionVision.valuesEn
          : INITIAL_CMS_PAGES.missionVision.valuesEn,
        valuesNp: Array.isArray(base.missionVision?.valuesNp)
          ? base.missionVision.valuesNp
          : INITIAL_CMS_PAGES.missionVision.valuesNp,
        goalsEn: Array.isArray(base.missionVision?.goalsEn)
          ? base.missionVision.goalsEn
          : INITIAL_CMS_PAGES.missionVision.goalsEn,
        goalsNp: Array.isArray(base.missionVision?.goalsNp)
          ? base.missionVision.goalsNp
          : INITIAL_CMS_PAGES.missionVision.goalsNp,
      },
      chairman: {
        ...INITIAL_CMS_PAGES.chairman,
        ...(base.chairman || {}),
      },
      ceo: {
        ...INITIAL_CMS_PAGES.ceo,
        ...(base.ceo || {}),
      },
    };
  };

  const [formData, setFormData] = useState<CmsPagesState>(() => normalizePages(pages));
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Sync if prop updates externally
  React.useEffect(() => {
    if (pages) {
      setFormData(normalizePages(pages));
    }
  }, [pages]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSavePages(formData);
      showToast('Page content saved to database and live on the website!');
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (target: 'chairman' | 'ceo' | 'profile', file: File) => {
    setUploadingImage(target);
    try {
      const oldUrl =
        target === 'chairman'
          ? formData.chairman.photoUrl
          : target === 'ceo'
          ? formData.ceo.photoUrl
          : formData.profile.bannerImage;
      const res = await uploadSingleMediaImage(file, 'team', `${target}-photo`);
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/') && !oldUrl.includes('team-chair.svg') && !oldUrl.includes('team-ceo.svg')) {
          await deleteMediaByPath(oldUrl);
        }
        let updatedData: CmsPagesState = formData;
        if (target === 'chairman') {
          updatedData = {
            ...formData,
            chairman: { ...formData.chairman, photoUrl: res.file.url },
          };
        } else if (target === 'ceo') {
          updatedData = {
            ...formData,
            ceo: { ...formData.ceo, photoUrl: res.file.url },
          };
        } else if (target === 'profile') {
          updatedData = {
            ...formData,
            profile: { ...formData.profile, bannerImage: res.file.url },
          };
        }
        setFormData(updatedData);
        await onSavePages(updatedData);
        showToast('Image uploaded to server and saved in MySQL database!');
      }
    } catch (err: any) {
      showToast(`Photo upload failed: ${err.message}`);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDeleteImage = async (target: 'chairman' | 'ceo' | 'profile') => {
    setUploadingImage(target);
    try {
      const currentUrl =
        target === 'chairman'
          ? formData.chairman.photoUrl
          : target === 'ceo'
          ? formData.ceo.photoUrl
          : formData.profile.bannerImage;

      if (currentUrl && currentUrl.startsWith('/uploads/') && !currentUrl.includes('team-chair.svg') && !currentUrl.includes('team-ceo.svg')) {
        await deleteMediaByPath(currentUrl);
      }

      let updatedData: CmsPagesState = formData;
      if (target === 'chairman') {
        updatedData = {
          ...formData,
          chairman: { ...formData.chairman, photoUrl: '/uploads/media/team-chair.svg' },
        };
      } else if (target === 'ceo') {
        updatedData = {
          ...formData,
          ceo: { ...formData.ceo, photoUrl: '/uploads/media/team-ceo.svg' },
        };
      } else if (target === 'profile') {
        updatedData = {
          ...formData,
          profile: { ...formData.profile, bannerImage: '' },
        };
      }
      setFormData(updatedData);
      await onSavePages(updatedData);
      showToast('Image deleted from server and updated in MySQL database!');
    } catch (err: any) {
      showToast(`Delete image failed: ${err.message}`);
    } finally {
      setUploadingImage(null);
    }
  };

  // Helpers for array fields (points, values, goals)
  const handleAddPoint = (field: 'pointsEn' | 'pointsNp') => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: [...prev.profile[field], ''],
      },
    }));
  };

  const handleUpdatePoint = (field: 'pointsEn' | 'pointsNp', idx: number, val: string) => {
    const list = [...formData.profile[field]];
    list[idx] = val;
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: list },
    }));
  };

  const handleRemovePoint = (field: 'pointsEn' | 'pointsNp', idx: number) => {
    const list = formData.profile[field].filter((_, i) => i !== idx);
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: list },
    }));
  };

  const handleAddMissionList = (field: 'valuesEn' | 'valuesNp' | 'goalsEn' | 'goalsNp') => {
    setFormData((prev) => ({
      ...prev,
      missionVision: {
        ...prev.missionVision,
        [field]: [...prev.missionVision[field], ''],
      },
    }));
  };

  const handleUpdateMissionList = (
    field: 'valuesEn' | 'valuesNp' | 'goalsEn' | 'goalsNp',
    idx: number,
    val: string
  ) => {
    const list = [...formData.missionVision[field]];
    list[idx] = val;
    setFormData((prev) => ({
      ...prev,
      missionVision: { ...prev.missionVision, [field]: list },
    }));
  };

  const handleRemoveMissionList = (
    field: 'valuesEn' | 'valuesNp' | 'goalsEn' | 'goalsNp',
    idx: number
  ) => {
    const list = formData.missionVision[field].filter((_, i) => i !== idx);
    setFormData((prev) => ({
      ...prev,
      missionVision: { ...prev.missionVision, [field]: list },
    }));
  };

  return (
    <div id="org-profile-manager" className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-sky-500 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Full Image Preview Lightbox Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600" />
                Image Preview
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img
                src={previewImageUrl}
                alt="Preview"
                className="max-h-[58vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="truncate">{previewImageUrl}</span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-sans font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Tab Navigation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-6 h-6 text-sky-600" />
              Organization & Leadership CMS Manager
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Directly edit Institutional Profile, Mission & Vision, Chairman Message, and CEO Message with live database updates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving to Database...' : 'Save All Changes'}
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap gap-2 pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Building className="w-4 h-4" />
            Our Profile (संस्थागत परिचय)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('institutionalProfile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'institutionalProfile'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-600" />
            Institutional Profile (संस्थागत विवरण)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <History className="w-4 h-4 text-sky-600" />
            History & Milestones (ऐतिहासिक विकासक्रम)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whyChooseUs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'whyChooseUs'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            Why Choose Us (हामीलाई किन रोज्ने?)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bodTree')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'bodTree'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <GitBranch className="w-4 h-4 text-sky-600" />
            BOD Tree Structure (सञ्चालक समिति वृक्ष)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('management')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'management'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Briefcase className="w-4 h-4 text-sky-600" />
            Management Team (व्यवस्थापन समूह)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('missionVision')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'missionVision'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Target className="w-4 h-4" />
            Mission & Vision (ध्येय र दृष्टि)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chairman')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'chairman'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Chairman Message (अध्यक्षको सन्देश)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ceo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'ceo'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            CEO Message (प्रमुख कार्यकारीको सन्देश)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'discover'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Compass className="w-4 h-4 text-sky-600" />
            Discover Section Cards (६ वटा कार्डहरू)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'showcase'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-600" />
            13 About Us Pages Directory (सम्पूर्ण १३ पृष्ठहरू)
          </button>
          {onOpenLeadershipMessages && (
            <button
              type="button"
              onClick={onOpenLeadershipMessages}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
            >
              <Crown className="w-4 h-4 text-amber-600" />
              Home Page Leadership Cards (CRUD) →
            </button>
          )}
        </div>
      </div>

      {/* TAB: INSTITUTIONAL PROFILE */}
      {activeTab === 'institutionalProfile' && institutionalProfiles && onSaveInstitutionalProfiles && (
        <InstitutionalProfileManager
          profiles={institutionalProfiles}
          onSave={onSaveInstitutionalProfiles}
        />
      )}

      {/* TAB: HISTORY & MILESTONES CRUD */}
      {activeTab === 'history' && historyMilestones && onSaveHistoryMilestones && (
        <HistoryMilestonesManager
          data={historyMilestones}
          onSave={onSaveHistoryMilestones}
        />
      )}

      {/* TAB: WHY CHOOSE US CRUD */}
      {activeTab === 'whyChooseUs' && whyChooseUs && onSaveWhyChooseUs && (
        <WhyChooseUsManager
          data={whyChooseUs}
          onSave={onSaveWhyChooseUs}
        />
      )}

      {/* TAB: BOD TREE STRUCTURE CRUD */}
      {activeTab === 'bodTree' && team && onSaveTeam && (
        <TeamManager
          team={team}
          onSaveTeam={onSaveTeam}
          defaultView="bod-tree"
        />
      )}

      {/* TAB: MANAGEMENT TEAM CRUD */}
      {activeTab === 'management' && team && onSaveTeam && (
        <TeamManager
          team={team}
          onSaveTeam={onSaveTeam}
          defaultView="management"
        />
      )}

      {/* TAB 1: OUR PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Our Profile & Institutional History</h3>
              <p className="text-xs text-slate-500">
                Content displayed when visitors click "Our Profile" or "About Us" on the website menu.
              </p>
            </div>

            {/* Profile Banner Image Upload, Preview, Replace & Delete */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {formData.profile.bannerImage ? (
                <img
                  src={formData.profile.bannerImage}
                  alt="Profile Banner"
                  onClick={() => setPreviewImageUrl(formData.profile.bannerImage!)}
                  className="w-16 h-12 rounded-lg object-cover border border-sky-400 cursor-pointer shrink-0"
                  title="Click to Preview Banner"
                />
              ) : (
                <div className="w-16 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                  No Banner
                </div>
              )}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700">Profile Hero Banner</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold">
                    <Upload className="w-3 h-3" />
                    <span>
                      {uploadingImage === 'profile'
                        ? 'Uploading...'
                        : formData.profile.bannerImage
                        ? 'Replace'
                        : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload('profile', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {formData.profile.bannerImage && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl(formData.profile.bannerImage!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-sky-600" />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage('profile')}
                        disabled={uploadingImage === 'profile'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Page Title (English)
              </label>
              <input
                type="text"
                value={formData.profile.titleEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, titleEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Page Title (नेपाली)
              </label>
              <input
                type="text"
                value={formData.profile.titleNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, titleNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Subtitle (English)
              </label>
              <input
                type="text"
                value={formData.profile.subtitleEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, subtitleEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Subtitle (नेपाली)
              </label>
              <input
                type="text"
                value={formData.profile.subtitleNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, subtitleNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Est. BS
              </label>
              <input
                type="text"
                value={formData.profile.establishedBs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, establishedBs: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Est. AD
              </label>
              <input
                type="text"
                value={formData.profile.establishedAd}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, establishedAd: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Regd. No.
              </label>
              <input
                type="text"
                value={formData.profile.regdNo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, regdNo: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                PAN No.
              </label>
              <input
                type="text"
                value={formData.profile.panNo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, panNo: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Institutional History (English)
              </label>
              <textarea
                rows={5}
                value={formData.profile.historyEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, historyEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                संस्थागत इतिहास तथा विकासक्रम (नेपाली)
              </label>
              <textarea
                rows={5}
                value={formData.profile.historyNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, historyNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Key Highlights / Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Key Institutional Points (English)
                </label>
                <button
                  type="button"
                  onClick={() => handleAddPoint('pointsEn')}
                  className="text-xs text-sky-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Point
                </button>
              </div>
              <div className="space-y-2">
                {formData.profile.pointsEn.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => handleUpdatePoint('pointsEn', i, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePoint('pointsEn', i)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  मुख्य विशेषताहरू (नेपाली)
                </label>
                <button
                  type="button"
                  onClick={() => handleAddPoint('pointsNp')}
                  className="text-xs text-sky-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> बुँदा थप्नुहोस्
                </button>
              </div>
              <div className="space-y-2">
                {formData.profile.pointsNp.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => handleUpdatePoint('pointsNp', i, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePoint('pointsNp', i)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Profile Content'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MISSION & VISION */}
      {activeTab === 'missionVision' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Mission, Vision, Values & Strategic Goals</h3>
            <p className="text-xs text-slate-500">
              Content displayed when visitors click "Mission & Vision" on the About Us menu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Vision Statement (English)
              </label>
              <textarea
                rows={3}
                value={formData.missionVision.visionEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    missionVision: { ...formData.missionVision, visionEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                संस्थाको दृष्टि / परिकल्पना (नेपाली)
              </label>
              <textarea
                rows={3}
                value={formData.missionVision.visionNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    missionVision: { ...formData.missionVision, visionNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Mission Statement (English)
              </label>
              <textarea
                rows={3}
                value={formData.missionVision.missionEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    missionVision: { ...formData.missionVision, missionEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                संस्थाको ध्येय (नेपाली)
              </label>
              <textarea
                rows={3}
                value={formData.missionVision.missionNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    missionVision: { ...formData.missionVision, missionNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Core Values (English)
                </label>
                <button
                  type="button"
                  onClick={() => handleAddMissionList('valuesEn')}
                  className="text-xs text-sky-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Value
                </button>
              </div>
              <div className="space-y-2">
                {formData.missionVision.valuesEn.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleUpdateMissionList('valuesEn', i, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMissionList('valuesEn', i)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  मूल्यमान्यताहरू (नेपाली)
                </label>
                <button
                  type="button"
                  onClick={() => handleAddMissionList('valuesNp')}
                  className="text-xs text-sky-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> थप्नुहोस्
                </button>
              </div>
              <div className="space-y-2">
                {formData.missionVision.valuesNp.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleUpdateMissionList('valuesNp', i, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMissionList('valuesNp', i)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Mission & Vision'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CHAIRMAN MESSAGE */}
      {activeTab === 'chairman' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          {onOpenLeadershipMessages && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Tip:</strong> Need to perform CRUD operations on the <strong>Home Page Leadership Cards</strong> (Chairman, CEO, Information Officer, Grievance Officer) placed after the EMI calculator?
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenLeadershipMessages}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                Open Leadership CRUD Manager →
              </button>
            </div>
          )}
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Chairman Message & Profile</h3>
              <p className="text-xs text-slate-500">
                Manage the Chairman's official photo, title, message text, and signature.
              </p>
            </div>
            {/* Photo preview, upload, replace & delete */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img
                src={formData.chairman.photoUrl || '/uploads/media/team-chair.svg'}
                alt="Chairman"
                onClick={() => setPreviewImageUrl(formData.chairman.photoUrl || '/uploads/media/team-chair.svg')}
                className="w-14 h-14 rounded-full object-cover border-2 border-sky-500 shadow-xs cursor-pointer"
                title="Click to Preview Photo"
              />
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700">Chairman Portrait (Server Upload)</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage === 'chairman'
                      ? 'Uploading...'
                      : formData.chairman.photoUrl && !formData.chairman.photoUrl.includes('team-chair.svg')
                      ? 'Replace Photo'
                      : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload('chairman', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewImageUrl(formData.chairman.photoUrl || '/uploads/media/team-chair.svg')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    Preview
                  </button>
                  {formData.chairman.photoUrl && !formData.chairman.photoUrl.includes('team-chair.svg') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage('chairman')}
                      disabled={uploadingImage === 'chairman'}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                  {formData.chairman.photoUrl || '/uploads/media/team-chair.svg'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Chairman Name (English)
              </label>
              <input
                type="text"
                value={formData.chairman.nameEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chairman: { ...formData.chairman, nameEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                अध्यक्षको नाम (नेपाली)
              </label>
              <input
                type="text"
                value={formData.chairman.nameNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chairman: { ...formData.chairman, nameNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Designation (English)
              </label>
              <input
                type="text"
                value={formData.chairman.roleEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chairman: { ...formData.chairman, roleEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                पद / जिम्मेवारी (नेपाली)
              </label>
              <input
                type="text"
                value={formData.chairman.roleNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chairman: { ...formData.chairman, roleNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Full Message Text (English)
              </label>
              <textarea
                rows={8}
                value={formData.chairman.messageEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chairman: { ...formData.chairman, messageEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                पूर्ण शुभकामना सन्देश (नेपाली)
              </label>
              <textarea
                rows={8}
                value={formData.chairman.messageNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chairman: { ...formData.chairman, messageNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Chairman Message'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: CEO MESSAGE */}
      {activeTab === 'ceo' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          {onOpenLeadershipMessages && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Tip:</strong> Need to perform CRUD operations on the <strong>Home Page Leadership Cards</strong> (Chairman, CEO, Information Officer, Grievance Officer) placed after the EMI calculator?
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenLeadershipMessages}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                Open Leadership CRUD Manager →
              </button>
            </div>
          )}
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">CEO Message & Profile</h3>
              <p className="text-xs text-slate-500">
                Manage the Chief Executive Officer (CEO)'s photo, title, message text, and operational remarks.
              </p>
            </div>
            {/* Photo preview, upload, replace & delete */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img
                src={formData.ceo.photoUrl || '/uploads/media/team-ceo.svg'}
                alt="CEO"
                onClick={() => setPreviewImageUrl(formData.ceo.photoUrl || '/uploads/media/team-ceo.svg')}
                className="w-14 h-14 rounded-full object-cover border-2 border-sky-500 shadow-xs cursor-pointer"
                title="Click to Preview Photo"
              />
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700">CEO Portrait (Server Upload)</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage === 'ceo'
                      ? 'Uploading...'
                      : formData.ceo.photoUrl && !formData.ceo.photoUrl.includes('team-ceo.svg')
                      ? 'Replace Photo'
                      : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload('ceo', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewImageUrl(formData.ceo.photoUrl || '/uploads/media/team-ceo.svg')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    Preview
                  </button>
                  {formData.ceo.photoUrl && !formData.ceo.photoUrl.includes('team-ceo.svg') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage('ceo')}
                      disabled={uploadingImage === 'ceo'}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                  {formData.ceo.photoUrl || '/uploads/media/team-ceo.svg'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                CEO Name (English)
              </label>
              <input
                type="text"
                value={formData.ceo.nameEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, nameEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                प्रमुख कार्यकारी अधिकृतको नाम (नेपाली)
              </label>
              <input
                type="text"
                value={formData.ceo.nameNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, nameNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Designation (English)
              </label>
              <input
                type="text"
                value={formData.ceo.roleEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, roleEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                पद / जिम्मेवारी (नेपाली)
              </label>
              <input
                type="text"
                value={formData.ceo.roleNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, roleNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Operational Message (English)
              </label>
              <textarea
                rows={8}
                value={formData.ceo.messageEn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, messageEn: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                कार्यकारी सन्देश तथा प्रतिबद्धता (नेपाली)
              </label>
              <textarea
                rows={8}
                value={formData.ceo.messageNp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, messageNp: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save CEO Message'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: DISCOVER SECTION CARDS (PROJECT MANAGER & CMS SHOWCASE) */}
      {activeTab === 'discover' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-200 mb-1">
                <span>✦</span>
                <span>Discover Section Architecture</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Centered "Discover Our Organization" Clickable Cards (6 Cards)
              </h3>
              <p className="text-xs text-slate-500">
                These cards appear centered below the profile content on the full-window Our Profile page with clean line icons, routing directly to their full information sections.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
                Live MySQL Route Engine Connected
              </span>
            </div>
          </div>

          {/* 6 Discover Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'discover-mv',
                target: 'mission-vision',
                icon: '🎯',
                titleEn: 'Mission and Vision',
                titleNp: 'ध्येय र दृष्टि',
                subEn: 'Strategic roadmap, cooperative values & future vision',
                subNp: 'संस्थाको दीर्घकालीन लक्ष्य, ध्येय तथा मूल सिद्धान्तहरू',
                route: '#about-mission-vision',
                status: 'Connected to CMS Pages DB',
              },
              {
                id: 'discover-board',
                target: 'board',
                icon: '👥',
                titleEn: 'Board of Directors',
                titleNp: 'सञ्चालक समिति',
                subEn: 'Elected governance leadership guiding the cooperative',
                subNp: 'संस्थाको नीति तथा योजना निर्माण गर्ने सञ्चालक समिति',
                route: '#about-board',
                status: 'Connected to Team Registry DB',
              },
              {
                id: 'discover-mgmt',
                target: 'management',
                icon: '👔',
                titleEn: 'Management Team',
                titleNp: 'व्यवस्थापन टोली',
                subEn: 'Executive team overseeing day-to-day operations & CBS',
                subNp: 'दैनिक प्रशासनिक तथा वित्तीय सञ्चालन गर्ने कर्मचारी नेतृत्व',
                route: '#about-management',
                status: 'Connected to Team Registry DB',
              },
              {
                id: 'discover-chair',
                target: 'chairman',
                icon: '📢',
                titleEn: "Chairman's Message",
                titleNp: 'अध्यक्षको सन्देश',
                subEn: 'Annual governance remarks and member commitments',
                subNp: 'संस्थाका अध्यक्षज्यूको आधिकारिक मन्तव्य तथा सन्देश',
                route: '#about-chairman',
                status: 'Connected to Leadership CMS DB',
              },
              {
                id: 'discover-dept',
                target: 'departments',
                icon: '🏛️',
                titleEn: 'Departments',
                titleNp: 'विभागहरू',
                subEn: 'Credit, IT, Audit, Finance, and Administration wings',
                subNp: 'कर्जा, सूचना प्रविधि, आन्तरिक लेखा तथा प्रशासन महाशाखाहरू',
                route: '#about-departments',
                status: 'Connected to Departments DB',
              },
              {
                id: 'discover-branches',
                target: 'service-centers',
                icon: '📍',
                titleEn: 'Service Centers',
                titleNp: 'सेवा केन्द्रहरू',
                subEn: 'Branch offices, service desks, ATMs & contact locations',
                subNp: 'बुटवलका विभिन्न क्षेत्रमा सञ्चालित सेवा केन्द्र तथा सम्पर्क डेस्क',
                route: '#about-service-centers',
                status: 'Connected to Service Centers DB',
              },
            ].map((card, idx) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl border border-slate-200 bg-[#f8fcfe] hover:bg-white hover:border-sky-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-xl font-bold">
                      {card.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-100/70 text-sky-800">
                      Card #{idx + 1}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-0.5">
                    {card.titleEn}
                  </h4>
                  <p className="text-xs font-semibold text-sky-700 mb-2">
                    {card.titleNp}
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {card.subEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    Route: <strong className="text-slate-800">{card.target}</strong>
                  </span>
                  <span className="text-sky-700 font-bold flex items-center gap-1">
                    <span>✓ Active</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <strong>Full-Window Navigation Architecture:</strong> Clicking any of these cards immediately renders the complete full-window Information Page with hero banner, executive narrative, highlight points, custom division cards, and an interactive sidebar directory.
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 13 ABOUT US PAGES DIRECTORY & SHOWCASE (FOR PROJECT MANAGER) */}
      {activeTab === 'showcase' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-200 mb-1">
                <span>📑</span>
                <span>Complete Institutional Repository</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                13 "About Us" Information Pages Full-Window Showcase
              </h3>
              <p className="text-xs text-slate-500">
                All 13 categories configured with full-window views, responsive layouts, sidebar navigators, and dynamic backend database bindings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-sky-100/80 text-sky-800 text-xs font-bold border border-sky-300">
                13 Modules Live
              </span>
            </div>
          </div>

          {/* Directory Table / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'profile',
                titleEn: 'Our Profile',
                titleNp: 'हाम्रो परिचय',
                icon: '🏛️',
                type: 'Core Profile',
                stats: `${(formData.profile.contentEn || formData.profile.historyEn || '').length} chars`,
                desc: 'Cooperative establishment in 2057 BS, licensing & statutory history',
              },
              {
                id: 'history',
                titleEn: 'History & Milestones',
                titleNp: 'ऐतिहासिक विकासक्रम',
                icon: '📜',
                type: 'Historical Records',
                stats: '24+ Years track',
                desc: 'Founding journey, capital evolution and Silver Jubilee achievements',
              },
              {
                id: 'vision-mission',
                titleEn: 'Vision, Mission & Goals',
                titleNp: 'दृष्टि, ध्येय र उद्देश्य',
                icon: '🎯',
                type: 'Strategic Vision',
                stats: `${formData.missionVision.goalsEn.length} strategic goals`,
                desc: 'Economic empowerment, financial inclusion and sustainable cooperative principles',
              },
              {
                id: 'chairman-message',
                titleEn: "Chairman's Message",
                titleNp: 'अध्यक्षको सन्देश',
                icon: '📢',
                type: 'Leadership Address',
                stats: `${formData.chairman.nameEn} (Chairman)`,
                desc: 'Annual AGM address, institutional milestones and future commitments',
              },
              {
                id: 'ceo-message',
                titleEn: "CEO's Message",
                titleNp: 'प्रमुख कार्यकारीको सन्देश',
                icon: '💼',
                type: 'Operational Address',
                stats: `${formData.ceo.nameEn} (CEO)`,
                desc: 'Operational modernization, digital CBS services and financial growth',
              },
              {
                id: 'why-choose-us',
                titleEn: 'Why Choose Us',
                titleNp: 'हामीलाई किन रोज्ने?',
                icon: '⭐',
                type: 'Competitive Edge',
                stats: '4 Key Pillars',
                desc: 'Member-first, high dividends, CBS safety, and transparent governance',
              },
              {
                id: 'board-directors',
                titleEn: 'Board of Directors',
                titleNp: 'सञ्चालक समिति',
                icon: '👥',
                type: 'Governance Body',
                stats: 'Elected Committee',
                desc: 'Complete roster of elected board officers, tenures and portfolios',
              },
              {
                id: 'management-team',
                titleEn: 'Management Team',
                titleNp: 'व्यवस्थापन टोली',
                icon: '👔',
                type: 'Executive Staff',
                stats: 'Professional Executives',
                desc: 'Department heads, branch managers and operational specialists',
              },
              {
                id: 'departments',
                titleEn: 'Departments',
                titleNp: 'विभागहरू',
                icon: '🏛️',
                type: 'Operational Divisions',
                stats: '6 Divisions',
                desc: 'Credit, Finance, IT, Audit, Human Resources, and Administration',
              },
              {
                id: 'service-centers',
                titleEn: 'Service Centers & Branches',
                titleNp: 'सेवा केन्द्र तथा शाखाहरू',
                icon: '📍',
                type: 'Network Branches',
                stats: '3 Main Centers',
                desc: 'Head Office Butwal, Traffic Chowk, Milanchowk, and contact desks',
              },
            ].map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center text-lg">
                      {item.icon}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.type}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {item.titleEn}
                  </h4>
                  <p className="text-xs text-sky-700 font-semibold mb-2">
                    {item.titleNp}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{item.stats}</span>
                  <span className="text-sky-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    Full-Window
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
