import React, { useState, useEffect } from 'react';
import { InstitutionalProfileItemCMS, MonthlyFinancialReportCMS } from '../../../types';
import {
  INITIAL_CMS_INSTITUTIONAL_PROFILES,
  INITIAL_MONTHLY_FINANCIAL_REPORTS,
} from '../../../data/cmsInitialData';
import { uploadSingleMediaImage, deleteMediaByPath } from '../../../services/mediaApi';
import { InstitutionalReportSection } from '../../InstitutionalReportSection';
import { MonthlyReportComparisonSection } from '../../MonthlyReportComparison';
import { usePreetiTyping } from '../../../context/PreetiTypingContext';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  X,
  Upload,
  ChevronUp,
  ChevronDown,
  Eye,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Star,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  profiles?: InstitutionalProfileItemCMS[];
  onSave: (updated: InstitutionalProfileItemCMS[]) => Promise<void> | void;
  monthlyReports?: MonthlyFinancialReportCMS[];
  onSaveMonthlyReports?: (updated: MonthlyFinancialReportCMS[]) => Promise<void> | void;
}

export const InstitutionalProfileManager: React.FC<Props> = ({
  profiles,
  onSave,
  monthlyReports,
  onSaveMonthlyReports,
}) => {
  const { openKeyboardGuide, openConverter } = usePreetiTyping();

  // Active sub-tab: 'monthly' (Financial Reports) or 'statutory' (Corporate Charter)
  const [activeSubTab, setActiveSubTab] = useState<'monthly' | 'statutory'>('monthly');

  // Statutory profile state
  const [profileList, setProfileList] = useState<InstitutionalProfileItemCMS[]>(
    profiles && profiles.length > 0 ? profiles : INITIAL_CMS_INSTITUTIONAL_PROFILES
  );
  const [editingItem, setEditingItem] = useState<InstitutionalProfileItemCMS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InstitutionalProfileItemCMS | null>(null);

  // Monthly reports state
  const [reportList, setReportList] = useState<MonthlyFinancialReportCMS[]>(
    monthlyReports && monthlyReports.length > 0
      ? monthlyReports
      : INITIAL_MONTHLY_FINANCIAL_REPORTS
  );
  const [editingReport, setEditingReport] = useState<MonthlyFinancialReportCMS | null>(null);
  const [isNewReport, setIsNewReport] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<MonthlyFinancialReportCMS | null>(null);
  const [previewReport, setPreviewReport] = useState<MonthlyFinancialReportCMS | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setProfileList(profiles);
    }
  }, [profiles]);

  useEffect(() => {
    if (monthlyReports && monthlyReports.length > 0) {
      setReportList(monthlyReports);
    }
  }, [monthlyReports]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  /* -------------------------------------------------------------
   * MONTHLY FINANCIAL REPORTS HANDLERS
   * ------------------------------------------------------------- */
  const handleOpenAddReport = () => {
    const nextOrder = reportList.length + 1;
    setEditingReport({
      id: `rep-m-${Date.now()}`,
      fiscalYear: 'आ.व. २०८२/८३',
      monthNp: 'असार',
      monthEn: 'Ashadh',
      reportDateNp: '२०८३-०३-०१',
      reportDateEn: new Date().toISOString().slice(0, 10),
      totalMembers: '43,892',
      shareCapital: 'रु. ३१,०८,४०,४००/-',
      shareCapitalGrowth: '0.00% वृद्धि',
      reserveFund: 'रु. ४१,१८,२४,२८०/-',
      reserveFundGrowth: '0.00% वृद्धि',
      totalInstitutionalCapital: 'रु. ४२,६६,४४,५५८/-',
      totalInstitutionalCapitalNote: 'जगेडा + अन्य',
      otherFunds: 'रु. १,४८,२०,२७८/-',
      totalSavings: 'रु. ३,८०,१८,०७,८६०/-',
      totalSavingsGrowth: '0.00% वृद्धि',
      loansDisbursed: 'रु. ३,६४,७०,९१,०६६/-',
      borrowerMembersCount: '10,380 ऋणी सदस्य',
      liquidityAmount: 'रु. १,०७,५३,५४,०५५/-',
      liquidityPercent: '27.56%',
      fixedAssets: 'रु. ८,८३,४७,०५४/-',
      totalAssets: 'रु. ४,८८,२२,३८,५६१/-',
      npaPercent: 'NPA 4.82%',
      nplPercent: 'NPL 2.45%',
      liqPercentBadge: 'Liq 27.56%',
      isPublished: true,
      isLatest: reportList.length === 0,
      sortOrder: nextOrder,
      remarksNp: 'आ.व. २०८२/८३ असार मसान्तसम्मको मासिक संस्थागत वित्तीय सारांश',
      remarksEn: 'Monthly institutional financial summary',
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setIsNewReport(true);
  };

  const handleOpenEditReport = (rep: MonthlyFinancialReportCMS) => {
    setEditingReport({ ...rep });
    setIsNewReport(false);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    if (!editingReport.monthNp.trim() || !editingReport.fiscalYear.trim()) {
      showToast('Please provide Fiscal Year and Month (Nepali).');
      return;
    }

    let updatedList = [...reportList];
    const cleaned: MonthlyFinancialReportCMS = {
      ...editingReport,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    // If marked as latest, unmark others
    if (cleaned.isLatest) {
      updatedList = updatedList.map((r) => ({ ...r, isLatest: false }));
    }

    if (isNewReport) {
      updatedList = [cleaned, ...updatedList];
    } else {
      updatedList = updatedList.map((r) => (r.id === cleaned.id ? cleaned : r));
    }

    setReportList(updatedList);
    setEditingReport(null);
    setIsSaving(true);

    try {
      if (onSaveMonthlyReports) {
        await onSaveMonthlyReports(updatedList);
      }
      showToast(
        isNewReport
          ? 'नयाँ मासिक प्रतिवेदन सफलतापूर्वक थपियो र सुरक्षित भयो!'
          : 'मासिक प्रतिवेदन सफलतापूर्वक अद्यावधिक भयो!'
      );
    } catch (err: any) {
      showToast(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteReport = async () => {
    if (!reportToDelete) return;
    const updatedList = reportList.filter((r) => r.id !== reportToDelete.id);
    setReportList(updatedList);
    setReportToDelete(null);
    setIsSaving(true);
    try {
      if (onSaveMonthlyReports) {
        await onSaveMonthlyReports(updatedList);
      }
      showToast('मासिक प्रतिवेदन सफलतापूर्वक हटाइयो!');
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetLatestReport = async (rep: MonthlyFinancialReportCMS) => {
    const updatedList = reportList.map((r) => ({
      ...r,
      isLatest: r.id === rep.id,
    }));
    setReportList(updatedList);
    setIsSaving(true);
    try {
      if (onSaveMonthlyReports) {
        await onSaveMonthlyReports(updatedList);
      }
      showToast(`"${rep.monthNp} ${rep.fiscalYear}" लाई मुख्य/नवीनतम प्रतिवेदन बनाइयो!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublishReport = async (rep: MonthlyFinancialReportCMS) => {
    const updatedList = reportList.map((r) =>
      r.id === rep.id ? { ...r, isPublished: !r.isPublished } : r
    );
    setReportList(updatedList);
    setIsSaving(true);
    try {
      if (onSaveMonthlyReports) {
        await onSaveMonthlyReports(updatedList);
      }
      showToast(`प्रतिवेदन प्रकाशन स्थिति अद्यावधिक भयो: ${!rep.isPublished ? 'सार्वजनिक' : 'ड्राफ्ट'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveReport = async (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= reportList.length) return;
    const copy = [...reportList];
    const tmp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = tmp;
    const reordered = copy.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    setReportList(reordered);
    setIsSaving(true);
    try {
      if (onSaveMonthlyReports) {
        await onSaveMonthlyReports(reordered);
      }
      showToast('प्रतिवेदन क्रमबद्धता सुरक्षित भयो!');
    } finally {
      setIsSaving(false);
    }
  };

  /* -------------------------------------------------------------
   * STATUTORY PROFILE HANDLERS
   * ------------------------------------------------------------- */
  const handleOpenAddStatutory = () => {
    setEditingItem({
      id: `inst-profile-${Date.now()}`,
      titleEn: '',
      titleNp: '',
      categoryEn: 'Institutional Profile',
      categoryNp: 'संस्थागत विवरण',
      subtitleEn: '',
      subtitleNp: '',
      contentEn: '',
      contentNp: '',
      highlightsEn: [''],
      highlightsNp: [''],
      badgeEn: 'Verified Profile',
      badgeNp: 'संस्थागत पहिचान',
      imageUrl: '',
      isPublished: true,
      sortOrder: profileList.length + 1,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setIsNew(true);
  };

  const handleOpenEditStatutory = (item: InstitutionalProfileItemCMS) => {
    setEditingItem({
      ...item,
      highlightsEn:
        Array.isArray(item.highlightsEn) && item.highlightsEn.length > 0
          ? [...item.highlightsEn]
          : [''],
      highlightsNp:
        Array.isArray(item.highlightsNp) && item.highlightsNp.length > 0
          ? [...item.highlightsNp]
          : [''],
    });
    setIsNew(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!editingItem) return;
    setUploadingImage(true);
    try {
      const oldUrl = editingItem.imageUrl;
      const res = await uploadSingleMediaImage(
        file,
        'general',
        editingItem.titleEn || 'institutional-profile'
      );
      if (res.success && res.file) {
        if (oldUrl && oldUrl.startsWith('/uploads/')) {
          await deleteMediaByPath(oldUrl);
        }
        setEditingItem({ ...editingItem, imageUrl: res.file.url });
        showToast('ब्यानर तस्बिर सर्भरमा अपलोड भयो! सेभ गर्नुहोस्।');
      }
    } catch (err: any) {
      showToast(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteModalImage = async () => {
    if (!editingItem || !editingItem.imageUrl) return;
    setUploadingImage(true);
    try {
      if (editingItem.imageUrl.startsWith('/uploads/')) {
        await deleteMediaByPath(editingItem.imageUrl);
      }
      setEditingItem({ ...editingItem, imageUrl: '' });
      showToast('ब्यानर तस्बिर हटाइयो।');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveStatutory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.titleEn.trim() || !editingItem.contentEn.trim()) {
      showToast('Please fill in Title (English) and Profile Content (English).');
      return;
    }

    const cleaned: InstitutionalProfileItemCMS = {
      ...editingItem,
      highlightsEn: (editingItem.highlightsEn || []).map((h) => h.trim()).filter(Boolean),
      highlightsNp: (editingItem.highlightsNp || []).map((h) => h.trim()).filter(Boolean),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const updatedList = isNew
      ? [...profileList, cleaned]
      : profileList.map((p) => (p.id === cleaned.id ? cleaned : p));

    setProfileList(updatedList);
    setEditingItem(null);
    setIsSaving(true);
    try {
      await onSave(updatedList);
      showToast(
        isNew
          ? 'संस्थागत विवरण सफलतापूर्वक सुरक्षित भयो!'
          : 'संस्थागत विवरण अद्यावधिक भयो!'
      );
    } catch (err: any) {
      showToast(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteStatutory = async () => {
    if (!itemToDelete) return;
    const updatedList = profileList.filter((p) => p.id !== itemToDelete.id);
    setProfileList(updatedList);
    setItemToDelete(null);
    setIsSaving(true);
    try {
      await onSave(updatedList);
      showToast('संस्थागत विवरण हटाइयो!');
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublishStatutory = async (item: InstitutionalProfileItemCMS) => {
    const updatedList = profileList.map((p) =>
      p.id === item.id ? { ...p, isPublished: !p.isPublished } : p
    );
    setProfileList(updatedList);
    setIsSaving(true);
    try {
      await onSave(updatedList);
      showToast(`दृश्यता परिवर्तन भयो: "${item.titleEn}"`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveStatutory = async (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= profileList.length) return;
    const copy = [...profileList];
    const tmp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = tmp;
    const reordered = copy.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    setProfileList(reordered);
    setIsSaving(true);
    try {
      await onSave(reordered);
      showToast('क्रमबद्धता सुरक्षित भयो!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-sky-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-sky-700 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner & Sub-Tabs Navigation */}
      <div className="bg-gradient-to-r from-[#052636] via-[#074766] to-[#0981ae] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 border border-sky-300/30 text-sky-200 text-xs font-bold mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL PROFILE MANAGEMENT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            संस्थागत प्रोफाइल तथा मासिक वित्तीय प्रतिवेदन व्यवस्थापन
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 max-w-2xl mt-1 leading-relaxed">
            यहाँबाट मासिक संस्थागत वित्तीय विवरण (सेयर पुँजी, जगेडा कोष, बचत, ऋण लगानी, तरलता, सदस्य संख्या) र संस्थागत वैधानिक विवरणहरू थप, सम्पादन वा अद्यावधिक गर्न सकिन्छ। यहाँ गरिएको परिवर्तन सुरक्षित भई वेबसाइटमा प्रत्यक्ष प्रदर्शित हुन्छ।
          </p>
        </div>

        {/* Preeti Typing Helper Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openKeyboardGuide}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-sky-100 transition cursor-pointer"
            title="प्रिती किबोर्ड लेआउट गाइड"
          >
            ⌨️ प्रिती गाइड
          </button>
          <button
            type="button"
            onClick={openConverter}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-sky-100 transition cursor-pointer"
            title="प्रिती ⇄ युनिकोड रूपान्तरण"
          >
            🔄 रूपान्तरण
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('monthly')}
          className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'monthly'
              ? 'border-[#0981ae] text-[#0981ae] bg-sky-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>मासिक संस्थागत वित्तीय प्रतिवेदन (Monthly Financial Reports)</span>
          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#0981ae] text-xs font-bold font-mono">
            {reportList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('statutory')}
          className={`px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'statutory'
              ? 'border-[#0981ae] text-[#0981ae] bg-sky-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>संस्थागत वैधानिक वडापत्र तथा पहिचान (Statutory Charter)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
            {profileList.length}
          </span>
        </button>
      </div>

      {/* =========================================================
       * SUB-TAB 1: MONTHLY FINANCIAL REPORTS
       * ========================================================= */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>📊</span>
                <span>मासिक संस्थागत वित्तीय विवरण सूची</span>
              </h3>
              <p className="text-xs text-slate-500">
                वेबसाइटको संस्थागत प्रोफाइलमा प्रदर्शित हुने सबै मासिक विवरणहरू
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddReport}
              className="px-4 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ नयाँ महिनाको प्रतिवेदन थप्नुहोस् (Add Report)</span>
            </button>
          </div>

          {/* Reports Grid / Cards List */}
          <div className="grid grid-cols-1 gap-4">
            {reportList.map((rep, idx) => (
              <div
                key={rep.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  rep.isLatest
                    ? 'border-[#0981ae] ring-2 ring-[#0981ae]/20 bg-sky-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-slate-900">
                      {rep.fiscalYear} • {rep.monthNp} ({rep.monthEn || ''})
                    </span>

                    {rep.isLatest ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>नवीनतम (LATEST)</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetLatestReport(rep)}
                        className="text-[10px] font-bold text-[#0981ae] hover:underline cursor-pointer"
                      >
                        ⭐️ Make Latest
                      </button>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.isPublished
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rep.isPublished ? '● सार्वजनिक (Published)' : '○ ड्राफ्ट (Draft)'}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      प्रकाशन: {rep.reportDateNp}
                    </span>
                  </div>

                  {/* Highlight Metrics Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">कुल सदस्य</span>
                      <span className="font-mono font-bold text-slate-900">{rep.totalMembers}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">सेयर पूँजी</span>
                      <span className="font-mono font-bold text-slate-900 truncate block">
                        {rep.shareCapital}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">कुल बचत</span>
                      <span className="font-mono font-bold text-indigo-900 truncate block">
                        {rep.totalSavings}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">ऋण लगानी</span>
                      <span className="font-mono font-bold text-amber-900 truncate block">
                        {rep.loansDisbursed}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">तरलता रकम</span>
                      <span className="font-mono font-bold text-cyan-900 truncate block">
                        {rep.liquidityAmount} ({rep.liquidityPercent})
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">कुल वासलात</span>
                      <span className="font-mono font-black text-[#074766] truncate block">
                        {rep.totalAssets}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setPreviewReport(rep)}
                    className="p-2 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                    title="Live Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePublishReport(rep)}
                    className={`p-2 rounded-lg transition cursor-pointer ${
                      rep.isPublished
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title={rep.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveReport(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg transition cursor-pointer"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveReport(idx, 'down')}
                    disabled={idx === reportList.length - 1}
                    className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg transition cursor-pointer"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditReport(rep)}
                    className="p-2 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                    title="Edit Report"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportToDelete(rep)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT/ADD REPORT MODAL */}
          {editingReport && (
            <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto my-auto relative">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0981ae] flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isNewReport
                        ? 'नयाँ महिनाको संस्थागत वित्तीय विवरण थप्नुहोस्'
                        : 'मासिक संस्थागत वित्तीय विवरण सम्पादन गर्नुहोस्'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      सबै तथ्याङ्क, मिति, प्रतिशत, सदस्य संख्या र वासलात विवरणहरू भर्नुहोस्
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveReport} className="space-y-6">
                  {/* Fieldset 1: Period & Publication */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#074766] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>१. आर्थिक वर्ष, महिना तथा प्रकाशन मिति</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          आर्थिक वर्ष (Fiscal Year) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.fiscalYear}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, fiscalYear: e.target.value })
                          }
                          placeholder="उदा: आ.व. २०८२/८३"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          महिना (नेपाली) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.monthNp}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, monthNp: e.target.value })
                          }
                          placeholder="उदा: असार, जेठ, वैशाख"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Month (English)
                        </label>
                        <input
                          type="text"
                          value={editingReport.monthEn || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, monthEn: e.target.value })
                          }
                          placeholder="e.g. Ashadh, Jestha"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          प्रकाशन मिति (वि.सं.) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.reportDateNp}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, reportDateNp: e.target.value })
                          }
                          placeholder="उदा: २०८३-०३-०१"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Report Date (A.D.)
                        </label>
                        <input
                          type="text"
                          value={editingReport.reportDateEn || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, reportDateEn: e.target.value })
                          }
                          placeholder="e.g. 2026-06-15"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingReport.isLatest)}
                            onChange={(e) =>
                              setEditingReport({ ...editingReport, isLatest: e.target.checked })
                            }
                            className="rounded text-[#0981ae] focus:ring-[#0981ae]"
                          />
                          <span>⭐️ मुख्य/नवीनतम बनाउनुहोस्</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingReport.isPublished)}
                            onChange={(e) =>
                              setEditingReport({ ...editingReport, isPublished: e.target.checked })
                            }
                            className="rounded text-[#0981ae] focus:ring-[#0981ae]"
                          />
                          <span>सार्वजनिक (Publish)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Fieldset 2: 10 Financial Figures */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#074766] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>२. १० मुख्य संस्थागत वित्तीय परिसूचकहरू तथा रकम</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* 1. Members */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          १. कुल सदस्य संख्या (Total Members) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.totalMembers}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, totalMembers: e.target.value })
                          }
                          placeholder="उदा: 43,892"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 2. Share Capital */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          २. सेयर पूँजी (Share Capital) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.shareCapital}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, shareCapital: e.target.value })
                          }
                          placeholder="उदा: रु. ३१,०८,४०,४००/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          सेयर पूँजी वृद्धि/कैफियत (Growth %)
                        </label>
                        <input
                          type="text"
                          value={editingReport.shareCapitalGrowth || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, shareCapitalGrowth: e.target.value })
                          }
                          placeholder="उदा: 0.00% वृद्धि"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 3. Reserve Fund */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ३. जगेडा कोष (Reserve Fund) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.reserveFund}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, reserveFund: e.target.value })
                          }
                          placeholder="उदा: रु. ४१,१८,२४,२८०/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          जगेडा कोष वृद्धि/कैफियत
                        </label>
                        <input
                          type="text"
                          value={editingReport.reserveFundGrowth || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, reserveFundGrowth: e.target.value })
                          }
                          placeholder="उदा: 0.00% वृद्धि"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 4. Total Institutional Capital */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ४. कुल संस्थागत पूँजी (Total Inst. Capital) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.totalInstitutionalCapital}
                          onChange={(e) =>
                            setEditingReport({
                              ...editingReport,
                              totalInstitutionalCapital: e.target.value,
                            })
                          }
                          placeholder="उदा: रु. ४२,६६,४४,५५८/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          संस्थागत पूँजी नोट
                        </label>
                        <input
                          type="text"
                          value={editingReport.totalInstitutionalCapitalNote || ''}
                          onChange={(e) =>
                            setEditingReport({
                              ...editingReport,
                              totalInstitutionalCapitalNote: e.target.value,
                            })
                          }
                          placeholder="उदा: जगेडा + अन्य"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 5. Other Funds */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ५. अन्य कोषहरू (Other Funds) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.otherFunds}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, otherFunds: e.target.value })
                          }
                          placeholder="उदा: रु. १,४८,२०,२७८/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 6. Total Savings */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ६. कुल बचत संकलन (Total Savings) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.totalSavings}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, totalSavings: e.target.value })
                          }
                          placeholder="उदा: रु. ३,८०,१८,०७,८६०/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          बचत वृद्धि/कैफियत
                        </label>
                        <input
                          type="text"
                          value={editingReport.totalSavingsGrowth || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, totalSavingsGrowth: e.target.value })
                          }
                          placeholder="उदा: 0.00% वृद्धि"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 7. Loans Disbursed */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ७. लगानीमा रहेको ऋण (Loans Disbursed) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.loansDisbursed}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, loansDisbursed: e.target.value })
                          }
                          placeholder="उदा: रु. ३,६४,७०,९१,०६६/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ऋणी सदस्य संख्या (Borrower Count)
                        </label>
                        <input
                          type="text"
                          value={editingReport.borrowerMembersCount || ''}
                          onChange={(e) =>
                            setEditingReport({
                              ...editingReport,
                              borrowerMembersCount: e.target.value,
                            })
                          }
                          placeholder="उदा: 10,380 ऋणी सदस्य"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 8. Liquidity */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ८. तरलता रकम (Liquidity Amount) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.liquidityAmount}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, liquidityAmount: e.target.value })
                          }
                          placeholder="उदा: रु. १,०७,५३,५४,०५५/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          तरलता प्रतिशत (Liquidity %) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.liquidityPercent}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, liquidityPercent: e.target.value })
                          }
                          placeholder="उदा: 27.56%"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 9. Fixed Assets */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ९. स्थिर सम्पत्ति (Fixed Assets) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.fixedAssets}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, fixedAssets: e.target.value })
                          }
                          placeholder="उदा: रु. ८,८३,४७,०५४/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-medium focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      {/* 10. Total Assets */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          १०. कुल सम्पत्ति/वासलात (Total Assets) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingReport.totalAssets}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, totalAssets: e.target.value })
                          }
                          placeholder="उदा: रु. ४,८८,२२,३८,५६१/-"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-bold text-[#074766] focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fieldset 3: Key Financial Indicators (NPL, NPA, Liq) & Remarks */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#074766] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>३. वित्तीय परिसूचकहरू (NPL, NPA, Liq) तथा कैफियत</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          NPL (खराब कर्जा %)
                        </label>
                        <input
                          type="text"
                          value={editingReport.nplPercent || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, nplPercent: e.target.value })
                          }
                          placeholder="उदा: NPL 2.45%"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          NPA (निष्क्रिय कर्जा %)
                        </label>
                        <input
                          type="text"
                          value={editingReport.npaPercent || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, npaPercent: e.target.value })
                          }
                          placeholder="उदा: NPA 4.82%"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Liq (तरलता ब्याच %)
                        </label>
                        <input
                          type="text"
                          value={editingReport.liqPercentBadge || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, liqPercentBadge: e.target.value })
                          }
                          placeholder="उदा: Liq 27.56%"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          कैफियत/विवरण (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={editingReport.remarksNp || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, remarksNp: e.target.value })
                          }
                          placeholder="उदा: आ.व. २०८२/८३ असार मसान्तसम्मको मासिक संस्थागत वित्तीय सारांश"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Remarks (English)
                        </label>
                        <input
                          type="text"
                          value={editingReport.remarksEn || ''}
                          onChange={(e) =>
                            setEditingReport({ ...editingReport, remarksEn: e.target.value })
                          }
                          placeholder="e.g. Monthly financial summary up to end of Ashadh"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0981ae]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingReport(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      रद्द गर्नुहोस् (Cancel)
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'सुरक्षित गर्दै...' : 'Save'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DELETE REPORT MODAL */}
          {reportToDelete && (
            <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2 text-rose-600">
                  <Trash2 className="w-5 h-5" />
                  <span>प्रतिवेदन हटाउने निश्चित हुनुहुन्छ?</span>
                </h4>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  तपाईं <strong>{reportToDelete.monthNp} {reportToDelete.fiscalYear}</strong> को वित्तीय प्रतिवेदन हटाउँदै हुनुहुन्छ। यो कार्यपछि विवरण स्थायी रूपमा हट्नेछ।
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportToDelete(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    रद्द
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteReport}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
                  >
                    हटाउनुहोस् (Delete)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LIVE PREVIEW MODAL */}
          {previewReport && (
            <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto my-auto relative">
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-4">
                  <span className="text-xs font-black uppercase text-[#0981ae] tracking-wider block">
                    LIVE FRONTEND PREVIEW
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    वेबसाइटमा यसरी देखिनेछ (Live Frontend Layout)
                  </h3>
                </div>

                <InstitutionalReportSection
                  reports={reportList}
                  lang="np"
                  initialSelectedId={previewReport.id}
                />

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <MonthlyReportComparisonSection
                    reports={reportList}
                    lang="np"
                    initialMonthAId={previewReport.id}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
       * SUB-TAB 2: STATUTORY PROFILE & CHARTER
       * ========================================================= */}
      {activeSubTab === 'statutory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>🏛️</span>
                <span>संस्थागत वैधानिक वडापत्र तथा पहिचान खण्डहरू</span>
              </h3>
              <p className="text-xs text-slate-500">
                दर्ता नं, नियामक निकाय, पुँजीगत संरचना, र पर्ल्स सूचकांकको विस्तृत विवरण
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddStatutory}
              className="px-4 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ नयाँ विवरण खण्ड थप्नुहोस् (Add Section)</span>
            </button>
          </div>

          {/* Statutory Cards */}
          <div className="space-y-4">
            {profileList.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-[#0981ae] text-[10px] font-bold">
                      {item.badgeNp || item.badgeEn || 'Verified Profile'}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {item.titleNp || item.titleEn}
                    </h4>
                    <span className="text-xs text-slate-400">({item.titleEn})</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.isPublished ? 'प्रकाशित' : 'अप्रकाशित'}
                    </span>
                  </div>

                  {item.subtitleNp && (
                    <p className="text-xs font-semibold text-[#0981ae]">{item.subtitleNp}</p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.contentNp || item.contentEn}
                  </p>

                  {item.highlightsNp && item.highlightsNp.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.highlightsNp.map((h, hIdx) => (
                        <span
                          key={hIdx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px]"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Statutory Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleTogglePublishStatutory(item)}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    title={item.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveStatutory(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg transition cursor-pointer"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveStatutory(idx, 'down')}
                    disabled={idx === profileList.length - 1}
                    className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg transition cursor-pointer"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditStatutory(item)}
                    className="p-2 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                    title="Edit Section"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT STATUTORY MODAL */}
          {editingItem && (
            <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto my-auto relative">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0981ae] flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isNew ? 'नयाँ वैधानिक प्रोफाइल खण्ड थप्नुहोस्' : 'वैधानिक प्रोफाइल खण्ड सम्पादन गर्नुहोस्'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      संस्थागत पहिचान, पर्ल्स सूचकांक वा सुशासन विवरण सम्पादन गर्नुहोस्
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveStatutory} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        शीर्षक (नेपाली) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.titleNp}
                        onChange={(e) => setEditingItem({ ...editingItem, titleNp: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Title (English) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.titleEn}
                        onChange={(e) => setEditingItem({ ...editingItem, titleEn: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        उपशीर्षक (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={editingItem.subtitleNp || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, subtitleNp: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subtitle (English)
                      </label>
                      <input
                        type="text"
                        value={editingItem.subtitleEn || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, subtitleEn: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      विस्तृत विवरण (नेपाली) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={editingItem.contentNp}
                      onChange={(e) => setEditingItem({ ...editingItem, contentNp: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Content Details (English) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={editingItem.contentEn}
                      onChange={(e) => setEditingItem({ ...editingItem, contentEn: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl leading-relaxed"
                    />
                  </div>

                  {/* Highlights */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        प्रमुख विशेषताहरू (Highlights - Nepali)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem({
                            ...editingItem,
                            highlightsNp: [...(editingItem.highlightsNp || []), ''],
                          })
                        }
                        className="text-[11px] font-bold text-[#0981ae] hover:underline cursor-pointer"
                      >
                        + थप्नुहोस्
                      </button>
                    </div>
                    {(editingItem.highlightsNp || []).map((h, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const copy = [...(editingItem.highlightsNp || [])];
                            copy[i] = e.target.value;
                            setEditingItem({ ...editingItem, highlightsNp: copy });
                          }}
                          placeholder={`बुँदा ${i + 1}`}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = (editingItem.highlightsNp || []).filter((_, idx) => idx !== i);
                            setEditingItem({ ...editingItem, highlightsNp: copy });
                          }}
                          className="px-2 text-rose-500 hover:text-rose-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ब्यानर तस्बिर (Banner Image)
                    </label>
                    <div className="flex items-center gap-3">
                      {editingItem.imageUrl && (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={editingItem.imageUrl}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'अपलोड हुँदै...' : 'तस्बिर अपलोड'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                          }}
                        />
                      </label>
                      {editingItem.imageUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteModalImage}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          हटाउनुहोस्
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      रद्द
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'सुरक्षित गर्दै...' : 'सुरक्षित गर्नुहोस् (Save)'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DELETE STATUTORY MODAL */}
          {itemToDelete && (
            <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2 text-rose-600">
                  <Trash2 className="w-5 h-5" />
                  <span>खण्ड हटाउने निश्चित हुनुहुन्छ?</span>
                </h4>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  तपाईं <strong>{itemToDelete.titleNp || itemToDelete.titleEn}</strong> खण्ड हटाउँदै हुनुहुन्छ।
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setItemToDelete(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    रद्द
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteStatutory}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
                  >
                    हटाउनुहोस् (Delete)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
