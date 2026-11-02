import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Eye,
  ShieldCheck,
  QrCode,
  Globe,
  Bell,
  Zap,
  CreditCard,
  ExternalLink,
  Search,
  Check,
  X,
  RefreshCw,
  Inbox,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  AlertCircle,
  Copy,
  Paperclip,
  Filter,
} from 'lucide-react';
import { ServiceItem } from '../../../types';

export interface DigitalServiceItem {
  id: string;
  titleEn: string;
  titleNp: string;
  descriptionEn: string;
  descriptionNp: string;
  icon: string;
  badgeEn?: string;
  badgeNp?: string;
  category: 'mobile-app' | 'qr-merchant' | 'web-banking' | 'sms-alert' | 'utility' | 'fund-transfer' | string;
  featuresEn: string[];
  featuresNp: string[];
  isActive: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
  sortOrder?: number;
}

export interface DigitalServiceRequest {
  id: number;
  tracking_id: string;
  is_member: number;
  full_name: string;
  member_no: string;
  mobile_number: string;
  email_address: string;
  service_type: string;
  account_no: string;
  additional_details: string;
  attachment_url?: string;
  attachment_name?: string;
  preferred_contact: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected' | string;
  admin_notes?: string;
  resolved_at?: string;
  submitted_at: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_DIGITAL_SERVICES: DigitalServiceItem[] = [
  {
    id: 'dg-mobile-app',
    titleEn: 'Ankur Smart Mobile Banking App',
    titleNp: 'अंकुर स्मार्ट मोबाइल बैंकिङ एप',
    descriptionEn: 'Full-featured mobile banking for Android and iOS. Instant interbank transfers, balance inquiry, mobile top-up, and biometric security.',
    descriptionNp: 'एन्ड्रोइड र आईओएसका लागि पूर्ण सुविधायुक्त मोबाइल बैंकिङ। तत्काल अन्तरबैंक ट्रान्सफर, ब्यालेन्स जाँच, टप-अप र बायोमेट्रिक सुरक्षा।',
    icon: '📱',
    badgeEn: 'Android & iOS',
    badgeNp: 'गुगल प्ले तथा एप स्टोर',
    category: 'mobile-app',
    featuresEn: ['Instant interbank transfer via ConnectIPS', 'Biometric fingerprint & Face ID login', '24/7 transaction notifications & mini-statements'],
    featuresNp: ['कनेक्ट-आईपीएस मार्फत तत्काल अन्तरबैंक रकम स्थानान्तरण', 'बायोमेट्रिक फिंगरप्रिन्ट तथा फेस आईडी लगइन', '२४/७ कारोबार सूचना तथा मिनी स्टेटमेन्ट'],
    isActive: true,
    playStoreUrl: 'https://play.google.com',
    appStoreUrl: 'https://apple.com/app-store',
    sortOrder: 1,
  },
  {
    id: 'dg-qr-merchant',
    titleEn: 'NepalPay & FonePay Merchant QR',
    titleNp: 'नेपालपे तथा फोनपे क्युआर भुक्तानी',
    descriptionEn: 'Contactless QR codes for member merchants, grocery stores, pharmacies, and business counters with instant direct account settlement.',
    descriptionNp: 'सदस्य व्यवसायी, खाद्यान्न पसल, फार्मेसी र काउन्टरका लागि सिधै बचत खातामा रकम जम्मा हुने कन्ट्याक्टलेस क्युआर कोड।',
    icon: '💳',
    badgeEn: 'Zero Commission',
    badgeNp: 'निःशुल्क क्युआर स्ट्यान्ड',
    category: 'qr-merchant',
    featuresEn: ['Zero setup fee and free acrylic counter stand', 'Instant SMS confirmation on payment', 'Seamless integration with 60+ banking apps'],
    featuresNp: ['निःशुल्क क्युआर स्ट्यान्ड तथा शून्य स्थापना शुल्क', 'रकम भुक्तानी हुनासाथ तत्काल एसएमएस सन्देश', '६० भन्दा बढी बैंक तथा वालेट एपबाट भुक्तानी स्वीकार'],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'dg-web-banking',
    titleEn: 'Internet Web Banking Portal',
    titleNp: 'इन्टरनेट तथा वेब बैंकिङ पोर्टल',
    descriptionEn: 'Secure 256-bit encrypted desktop web portal for ledger tracking, detailed annual tax statements, and corporate institutional accounts.',
    descriptionNp: 'लेजर ट्र्याकिङ, विस्तृत वार्षिक कर चुक्ता विवरण र संस्थागत खाता सञ्चालनका लागि सुरक्षित २५६-बिट इन्क्रिप्टेड वेब पोर्टल।',
    icon: '🌐',
    badgeEn: '256-Bit SSL',
    badgeNp: 'उच्च सुरक्षा इन्क्रिप्सन',
    category: 'web-banking',
    featuresEn: ['Detailed historical ledger download (PDF / Excel)', 'Multi-signatory approval for group accounts', 'Direct dividend and interest statement viewer'],
    featuresNp: ['विस्तृत ऐतिहासिक स्टेटमेन्ट डाउनलोड (PDF / Excel)', 'समूह खाताका लागि बहु-हस्ताक्षरकर्ता स्वीकृति', 'लाभांश तथा ब्याज भुक्तानी प्रमाणपत्र विवरण'],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'dg-sms-alerts',
    titleEn: 'Real-time SMS Alert & Notice Broadcast',
    titleNp: 'एसएमएस सूचना तथा अलर्ट सेवा',
    descriptionEn: 'Immediate SMS alert for every counter debit, salary credit, loan installment schedule, and annual general meeting (AGM) dispatch.',
    descriptionNp: 'काउन्टर कारोबार, बचत ब्याज जम्मा, कर्जा किस्ता भुक्तानी भाखा र साधारण सभा सम्बन्धी जानकारीका लागि तत्काल एसएमएस सन्देश।',
    icon: '💬',
    badgeEn: 'Instant Alerts',
    badgeNp: 'द्रुत सूचना प्रणाली',
    category: 'sms-alert',
    featuresEn: ['Real-time debit/credit transaction push SMS', 'Upcoming loan installment payment reminder', 'Emergency notice and festival holiday broadcasts'],
    featuresNp: ['प्रत्येक रकम जम्मा वा झिक्नेबित्तिकै तत्काल एसएमएस', 'कर्जा किस्ता भाखा भुक्तानी पूर्वसूचना अलर्ट', 'अत्यन्त जरुरी सूचना तथा बिदा सम्बन्धी सन्देश'],
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'dg-utility-bill',
    titleEn: 'Utility & Government Revenue Payments',
    titleNp: 'विद्युत्, खानेपानी तथा सरकारी महसुल भुक्तानी',
    descriptionEn: 'Pay electricity (NEA), drinking water (Khanepani), mobile top-up (NTC/Ncell), internet bills, and Inland Revenue (IRD) tax online.',
    descriptionNp: 'विद्युत् महसुल (NEA), खानेपानी, मोबाइल रिचार्ज, इन्टरनेट बिल र आन्तरिक राजस्व (IRD) कर सिधै सहकारी खाताबाट भुक्तानी।',
    icon: '⚡',
    badgeEn: 'Zero Extra Fee',
    badgeNp: 'अतिरिक्त शुल्क नलाग्ने',
    category: 'utility',
    featuresEn: ['One-click bill settlement for 100+ services', 'Instant printable digital payment receipt', 'Auto-save consumer numbers for monthly ease'],
    featuresNp: ['१०० भन्दा बढी सेवाको एक क्लिकमै भुक्तानी', 'तत्काल डाउनलोड गर्न मिल्ने डिजिटल रसिद', 'मासिक भुक्तानीका लागि ग्राहक नम्बर सुरक्षित राख्ने सुविधा'],
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'dg-connect-ips',
    titleEn: 'ConnectIPS Instant Fund Transfer',
    titleNp: 'अन्तरबैंक तत्काल रकम भुक्तानी (ConnectIPS)',
    descriptionEn: 'Transfer funds round-the-clock directly to any commercial bank, development bank, or financial institution in Nepal via NCHL.',
    descriptionNp: "नेपालका ५० भन्दा बढी 'क', 'ख' र 'ग' वर्गका वाणिज्य तथा विकास बैंकहरूमा तत्काल २४/७ सिधै रकम स्थानान्तरण सुविधा।",
    icon: '🏦',
    badgeEn: 'NCHL Network',
    badgeNp: 'नेपाल क्लियरिङ्ग हाउस',
    category: 'fund-transfer',
    featuresEn: ['Round-the-clock 24/7 real-time settlement', 'Low nominal clearing fees per transaction', 'Direct member account verification'],
    featuresNp: ['२४ घण्टा सातै दिन तत्काल खातामा रकम जम्मा', 'न्यूनतम क्लियरिङ शुल्कमा भरपर्दो सेवा', 'सिधै खातावालाको नाम रुजु हुने प्रणाली'],
    isActive: true,
    sortOrder: 6,
  },
];

const LOCAL_STORAGE_KEY = 'ankur_cms_digital_services_v1';

interface Props {
  onSaveServices?: (updated: ServiceItem[]) => Promise<void> | void;
}

export const DigitalServicesManager: React.FC<Props> = ({ onSaveServices }) => {
  // Top Navigation Tab: 'requests' (MySQL queue) or 'catalog' (service channels list)
  const [managerTab, setManagerTab] = useState<'requests' | 'catalog'>('requests');

  // ==========================================
  // SERVICE REQUESTS QUEUE STATE
  // ==========================================
  const [requests, setRequests] = useState<DigitalServiceRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestServiceFilter, setRequestServiceFilter] = useState<string>('all');
  const [requestSearch, setRequestSearch] = useState<string>('');

  // Selected request for detail/status update modal
  const [activeRequest, setActiveRequest] = useState<DigitalServiceRequest | null>(null);
  const [modalStatus, setModalStatus] = useState<string>('Pending');
  const [modalAdminNotes, setModalAdminNotes] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // ==========================================
  // CATALOG MANAGEMENT STATE
  // ==========================================
  const [digitalServices, setDigitalServices] = useState<DigitalServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_DIGITAL_SERVICES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isEditing, setIsEditing] = useState<DigitalServiceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<DigitalServiceItem>>({
    titleEn: '',
    titleNp: '',
    descriptionEn: '',
    descriptionNp: '',
    icon: '📱',
    badgeEn: '',
    badgeNp: '',
    category: 'mobile-app',
    featuresEn: [''],
    featuresNp: [''],
    isActive: true,
    appStoreUrl: '',
    playStoreUrl: '',
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Requests from MySQL / SQLite
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch('/api/digital-service-requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Failed to load digital service requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Open modal to update request
  const handleOpenRequestModal = (req: DigitalServiceRequest) => {
    setActiveRequest(req);
    setModalStatus(req.status || 'Pending');
    setModalAdminNotes(req.admin_notes || '');
  };

  // Save status update
  const handleSaveRequestStatus = async () => {
    if (!activeRequest) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/digital-service-requests/${activeRequest.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: modalStatus,
          admin_notes: modalAdminNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Request ${activeRequest.tracking_id} updated to ${modalStatus}!`);
        setActiveRequest(null);
        fetchRequests();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err: any) {
      alert('Error updating status: ' + err?.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Request
  const handleDeleteRequest = async (id: number, trackingId: string) => {
    if (!confirm(`Are you sure you want to permanently delete service request ${trackingId}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/digital-service-requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Request ${trackingId} removed.`);
        fetchRequests();
      }
    } catch (err) {
      alert('Failed to delete request.');
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
    const matchesService = requestServiceFilter === 'all' || r.service_type === requestServiceFilter;
    const q = requestSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.tracking_id?.toLowerCase().includes(q) ||
      r.full_name?.toLowerCase().includes(q) ||
      r.mobile_number?.includes(q) ||
      r.email_address?.toLowerCase().includes(q) ||
      r.account_no?.toLowerCase().includes(q) ||
      r.member_no?.toLowerCase().includes(q);
    return matchesStatus && matchesService && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const inProgressCount = requests.filter((r) => r.status === 'In Progress').length;
  const completedCount = requests.filter((r) => r.status === 'Completed').length;

  // Catalog helpers
  const persistServices = (items: DigitalServiceItem[]) => {
    setDigitalServices(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  };

  const handleOpenAddModal = () => {
    setIsEditing(null);
    setFormData({
      titleEn: '',
      titleNp: '',
      descriptionEn: '',
      descriptionNp: '',
      icon: '📱',
      badgeEn: 'Active 24/7',
      badgeNp: '२४/७ सेवा',
      category: 'mobile-app',
      featuresEn: ['24/7 instant member convenience', 'Verified cryptographic transaction safety'],
      featuresNp: ['२४/७ सदस्यमैत्री आधुनिक प्रविधि', 'सुरक्षित तथा प्रमाणित डिजिटल कारोबार'],
      isActive: true,
      appStoreUrl: '',
      playStoreUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: DigitalServiceItem) => {
    setIsEditing(service);
    setFormData({
      ...service,
      featuresEn: service.featuresEn?.length ? [...service.featuresEn] : [''],
      featuresNp: service.featuresNp?.length ? [...service.featuresNp] : [''],
    });
    setIsModalOpen(true);
  };

  const handleDeleteCatalogItem = (id: string) => {
    if (confirm('Are you sure you want to delete this digital service from the catalog?')) {
      const updated = digitalServices.filter((s) => s.id !== id);
      persistServices(updated);
      triggerToast('Digital service successfully removed!');
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = digitalServices.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    persistServices(updated);
    triggerToast('Digital service status updated!');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleEn?.trim() || !formData.titleNp?.trim()) {
      alert('Please provide titles in both English and Nepali.');
      return;
    }
    const cleanFeaturesEn = (formData.featuresEn || []).filter((f) => f.trim().length > 0);
    const cleanFeaturesNp = (formData.featuresNp || []).filter((f) => f.trim().length > 0);

    if (isEditing) {
      const updated = digitalServices.map((s) =>
        s.id === isEditing.id
          ? { ...s, ...formData, featuresEn: cleanFeaturesEn, featuresNp: cleanFeaturesNp }
          : s
      );
      persistServices(updated as DigitalServiceItem[]);
      triggerToast(`Updated "${formData.titleEn}" successfully!`);
    } else {
      const newService: DigitalServiceItem = {
        id: `dg-${Date.now()}`,
        titleEn: formData.titleEn!,
        titleNp: formData.titleNp!,
        descriptionEn: formData.descriptionEn || '',
        descriptionNp: formData.descriptionNp || '',
        icon: formData.icon || '📱',
        badgeEn: formData.badgeEn || 'Active',
        badgeNp: formData.badgeNp || 'सक्रिय',
        category: formData.category || 'mobile-app',
        featuresEn: cleanFeaturesEn,
        featuresNp: cleanFeaturesNp,
        isActive: formData.isActive !== false,
        appStoreUrl: formData.appStoreUrl,
        playStoreUrl: formData.playStoreUrl,
        sortOrder: digitalServices.length + 1,
      };
      persistServices([newService, ...digitalServices]);
      triggerToast(`Added new digital service "${formData.titleEn}"!`);
    }
    setIsModalOpen(false);
  };

  const handleCommitAll = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(digitalServices));
      if (onSaveServices) {
        const mapped: ServiceItem[] = digitalServices.map((d) => ({
          id: d.id,
          titleEn: d.titleEn,
          titleNp: d.titleNp,
          descriptionEn: d.descriptionEn,
          descriptionNp: d.descriptionNp,
          icon: d.icon,
          category: 'digital',
          badge: d.badgeEn,
        }));
        await onSaveServices(mapped);
      }
      triggerToast('All Digital Services saved and synchronized successfully!');
    } catch (e: any) {
      triggerToast(`Saved: ${e?.message || 'Done'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = digitalServices.filter((s) => {
    const matchesSearch =
      s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleNp.includes(searchQuery) ||
      s.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badgeEn?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#074766] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-sky-400 animate-bounce text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-sky-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-sky-100 text-[#074766]">
              <Smartphone className="w-5 h-5" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#074766]">
              Digital Channels & Service Desk
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Digital Services Management (डिजिटल सेवा पोर्टल)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process member service requests, view attachments, update resolution status, and manage active digital products.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setManagerTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              managerTab === 'requests'
                ? 'bg-[#052636] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Service Requests Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setManagerTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              managerTab === 'catalog'
                ? 'bg-[#052636] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Services Catalog</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SERVICE REQUESTS QUEUE (MySQL DATABASE)            */}
      {/* ========================================================= */}
      {managerTab === 'requests' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
              <span className="text-xs font-bold text-sky-800 block">Total Requests</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {requests.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 block">Pending Review</span>
              <span className="text-2xl font-black text-amber-900 font-mono mt-1 block">
                {pendingCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-xs font-bold text-blue-800 block">In Progress</span>
              <span className="text-2xl font-black text-blue-900 font-mono mt-1 block">
                {inProgressCount}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 block">Completed</span>
              <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">
                {completedCount}
              </span>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Tracking ID, Name, Phone..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#074766]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#074766]"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={requestServiceFilter}
                onChange={(e) => setRequestServiceFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#074766]"
              >
                <option value="all">All Services</option>
                <option value="Missed Call Banking">Missed Call Banking</option>
                <option value="Statement Request">Statement Request</option>
                <option value="Bill Payment Support">Bill Payment Support</option>
                <option value="Mobile Recharge Request">Mobile Recharge Request</option>
                <option value="Internet/Mobile Banking">Internet/Mobile Banking</option>
                <option value="SMS Alert Service">SMS Alert Service</option>
                <option value="Card Service">Card Service</option>
                <option value="QR / Digital Payment">QR / Digital Payment</option>
                <option value="Share Refund">Share Refund</option>
                <option value="Share Increase">Share Increase</option>
                <option value="Other Digital Service">Other Digital Service</option>
              </select>

              <button
                type="button"
                onClick={fetchRequests}
                disabled={isLoadingRequests}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Refresh requests list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tracking ID</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Service Requested</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-semibold">No service requests found matching your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#074766]">
                          <div className="flex items-center gap-1.5">
                            <span>{req.tracking_id}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator?.clipboard?.writeText(req.tracking_id);
                                triggerToast(`Copied ${req.tracking_id}`);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                              title="Copy Tracking ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          {req.is_member === 1 ? (
                            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Member {req.member_no ? `#${req.member_no}` : 'Verified'}
                            </span>
                          ) : (
                            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              Non-Member
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{req.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{req.mobile_number}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{req.email_address}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{req.service_type}</div>
                          {req.account_no && (
                            <div className="text-[11px] text-slate-500 font-mono">A/C: {req.account_no}</div>
                          )}
                          {req.attachment_url && (
                            <a
                              href={req.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#0981ae] font-semibold hover:underline mt-0.5"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{req.attachment_name || 'Attachment'}</span>
                            </a>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px]">
                            {req.preferred_contact || 'Phone Call'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {req.status === 'Completed' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Completed
                            </span>
                          ) : req.status === 'In Progress' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                              ⏳ In Progress
                            </span>
                          ) : req.status === 'Rejected' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                              ✕ Rejected
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                              ● Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {req.submitted_at ? req.submitted_at.slice(0, 16) : 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenRequestModal(req)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#074766] hover:bg-[#052636] text-white font-bold text-xs transition cursor-pointer"
                              title="Review details and update status"
                            >
                              Review & Update
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(req.id, req.tracking_id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail & Status Modal */}
          {activeRequest && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#074766]">
                      Service Request Review
                    </span>
                    <h3 className="text-xl font-black text-slate-900 font-mono">
                      {activeRequest.tracking_id}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRequest(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-4 text-xs sm:text-sm">
                  {/* Applicant Details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applicant:</span>
                      <span className="font-bold text-slate-900">{activeRequest.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cooperative Member:</span>
                      <span className="font-semibold text-slate-800">
                        {activeRequest.is_member === 1 ? `Yes (Member #${activeRequest.member_no || 'N/A'})` : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <a href={`tel:${activeRequest.mobile_number}`} className="font-mono font-bold text-[#0981ae] hover:underline">
                        {activeRequest.mobile_number}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email Address:</span>
                      <a href={`mailto:${activeRequest.email_address}`} className="font-semibold text-slate-800 hover:underline">
                        {activeRequest.email_address}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Preferred Contact:</span>
                      <span className="font-semibold text-slate-800">{activeRequest.preferred_contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service Requested:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {activeRequest.service_type}
                      </span>
                    </div>
                    {activeRequest.account_no && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account No:</span>
                        <span className="font-mono font-bold text-slate-800">{activeRequest.account_no}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Member's Request Message / Additional Details:
                    </label>
                    <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-800 text-xs whitespace-pre-wrap leading-relaxed min-h-[60px]">
                      {activeRequest.additional_details || 'No additional details provided.'}
                    </div>
                  </div>

                  {/* Attachment */}
                  {activeRequest.attachment_url && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Attached Document / Photo:
                      </label>
                      <a
                        href={activeRequest.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[#074766] font-bold text-xs flex items-center justify-between hover:bg-sky-100 transition"
                      >
                        <span className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          <span>{activeRequest.attachment_name || 'Download / View Attachment'}</span>
                        </span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Status update selector */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Status:
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:outline-hidden focus:ring-2 focus:ring-[#074766]"
                    >
                      <option value="Pending">● Pending</option>
                      <option value="In Progress">⏳ In Progress</option>
                      <option value="Completed">✓ Completed</option>
                      <option value="Rejected">✕ Rejected</option>
                    </select>
                  </div>

                  {/* Admin notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Staff Resolution Notes & Remarks:
                    </label>
                    <textarea
                      rows={3}
                      value={modalAdminNotes}
                      onChange={(e) => setModalAdminNotes(e.target.value)}
                      placeholder="e.g. Called member on phone, verified account identity, activated SMS service on CBS terminal."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#074766]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveRequest(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={handleSaveRequestStatus}
                    className="px-5 py-2.5 rounded-xl bg-[#052636] hover:bg-[#074766] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdatingStatus ? 'Saving...' : 'Save Status Update'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DIGITAL SERVICES CATALOG CRUD (EXISTING)           */}
      {/* ========================================================= */}
      {managerTab === 'catalog' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/90">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search digital services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0981ae]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-3.5 py-1.5 bg-[#074766] hover:bg-[#052636] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Channel</span>
              </button>
              <button
                type="button"
                onClick={handleCommitAll}
                disabled={isSaving}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save to DB'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  service.isActive
                    ? 'bg-white border-slate-200 hover:border-sky-300 shadow-2xs hover:shadow-md'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                        {service.icon || '📱'}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                          {service.titleEn}
                        </h4>
                        <span className="text-xs text-[#074766] font-semibold block mt-0.5">
                          {service.titleNp}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(service.id)}
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                        service.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Draft'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {service.descriptionEn}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {service.badgeEn || 'Live Channel'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(service)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCatalogItem(service.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Catalog Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">
                    {isEditing ? 'Edit Digital Service' : 'Add New Digital Service'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveForm} className="space-y-4 mt-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title (English) *</label>
                    <input
                      type="text"
                      value={formData.titleEn || ''}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title (Nepali) *</label>
                    <input
                      type="text"
                      value={formData.titleNp || ''}
                      onChange={(e) => setFormData({ ...formData, titleNp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description (English)</label>
                    <textarea
                      rows={2}
                      value={formData.descriptionEn || ''}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description (Nepali)</label>
                    <textarea
                      rows={2}
                      value={formData.descriptionNp || ''}
                      onChange={(e) => setFormData({ ...formData, descriptionNp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#074766] hover:bg-[#052636] text-white font-bold cursor-pointer"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
