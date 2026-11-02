import React, { useState } from 'react';
import { ServiceItem, Language } from '../../../types';
import {
  Layers,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Eye,
  Percent,
  Calendar,
  Wallet,
  Shield,
  Smartphone,
  Users,
  Briefcase,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export interface SchemeCardCMS {
  id: string;
  titleEn: string;
  titleNp: string;
  subtitleEn: string;
  subtitleNp: string;
  badgeEn?: string;
  badgeNp?: string;
  interestRate?: string;
  minBalance?: string;
  tenure?: string;
  icon?: string;
  highlight?: string;
}

export interface ServiceDetailCMS extends ServiceItem {
  bulletPointsEn?: string[];
  bulletPointsNp?: string[];
  schemeCards?: SchemeCardCMS[];
}

interface Props {
  services: ServiceItem[];
  onSaveServices: (updated: ServiceItem[]) => Promise<void> | void;
}

// Initial scheme cards data mirroring the frontend cards for all 6 services
const DEFAULT_SCHEME_CARDS: Record<string, SchemeCardCMS[]> = {
  'member-service': [
    {
      id: 'ms-share',
      titleEn: 'Ordinary Share Membership',
      titleNp: 'साधारण सेयर सदस्यता',
      subtitleEn: 'Voting rights, annual bonus dividend and cooperative ownership share certificate.',
      subtitleNp: 'मताधिकार, वार्षिक लाभांश तथा संस्थाको सेयर प्रमाणपत्र स्वामित्व।',
      badgeEn: 'Annual Dividend',
      badgeNp: 'वार्षिक लाभांश',
      interestRate: 'Up to 15% Bonus',
      minBalance: 'रू. १०,००० (१०० कित्ता)',
      tenure: 'आजीवन सदस्यता',
      icon: '👥',
    },
    {
      id: 'ms-relief',
      titleEn: 'Member Welfare & Relief Fund',
      titleNp: 'सदस्य कल्याण तथा राहत कोष',
      subtitleEn: 'Medical emergency aid, critical illness relief and maternity grant support.',
      subtitleNp: 'आकस्मिक स्वास्थ्य उपचार, जटिल रोग राहत तथा सुत्केरी पोषण भत्ता।',
      badgeEn: 'Social Security',
      badgeNp: 'सामाजिक सुरक्षा',
      interestRate: 'रू. ५०,००० सम्म राहत',
      minBalance: 'वार्षिक रू. ५०० योगदान',
      tenure: 'निरन्तर सुरक्षा',
      icon: '🛡️',
    },
    {
      id: 'ms-patronage',
      titleEn: 'Patronage Refund Rebate',
      titleNp: 'संरक्षक फिर्ता कोष (पेट्रोनेज रिफन्ड)',
      subtitleEn: 'Cash reward proportional to member loan interest paid and savings turnover.',
      subtitleNp: 'संस्थामा गरेको कारोबार र भुक्तानी गरेको ब्याजका आधारमा नगद फिर्ता।',
      badgeEn: 'Cash Reward',
      badgeNp: 'नगद फिर्ता',
      interestRate: 'वार्षिक बचत/ऋण अनुपात',
      minBalance: 'नियमित कारोबार',
      tenure: 'प्रत्येक साधारण सभा',
      icon: '🎁',
    },
    {
      id: 'ms-training',
      titleEn: 'Cooperative Entrepreneurship Training',
      titleNp: 'उद्यमशीलता तथा वित्तीय साक्षरता तालिम',
      subtitleEn: 'Skill building, poultry/agriculture mentorship and enterprise development sessions.',
      subtitleNp: 'व्यावसायिक सीप, आधुनिक कृषि, उद्यमशीलता तथा वित्तीय साक्षरता अभिमुखीकरण।',
      badgeEn: 'Free Mentorship',
      badgeNp: 'निःशुल्क परामर्श',
      interestRate: 'निःशुल्क सहभागिता',
      minBalance: 'सदस्यता अनिवार्य',
      tenure: 'त्रैमासिक कार्यक्रम',
      icon: '🌱',
    },
  ],
  'deposit-product': [
    {
      id: 'dp-daily',
      titleEn: 'Daily Doorstep Savings',
      titleNp: 'दैनिक ढुकुटी बचत योजना',
      subtitleEn: 'Door-to-door collector deposit service for local merchants and daily earners.',
      subtitleNp: 'स्थानीय व्यापारी तथा दैनिक आम्दानी हुने सदस्यका लागि घरदैलो संकलन सेवा।',
      badgeEn: 'Daily Yield',
      badgeNp: 'दैनिक गणना',
      interestRate: '7.50% p.a.',
      minBalance: 'रू. ५००',
      tenure: 'अनिवार्य छैन',
      icon: '🪙',
    },
    {
      id: 'dp-fixed',
      titleEn: 'Ankur High-Yield Fixed Term Deposit',
      titleNp: 'अंकुर उच्च प्रतिफल मुद्दती निक्षेप',
      subtitleEn: 'Assured, secure high interest rates for 3 months up to 5 years tenure.',
      subtitleNp: '३ महिनादेखि ५ वर्षसम्मको अवधिमा सर्वाधिक सुरक्षित र सुनिश्चित प्रतिफल।',
      badgeEn: 'Top Return',
      badgeNp: 'अधिकतम प्रतिफल',
      interestRate: 'Up to 11.75% p.a.',
      minBalance: 'रू. २५,०००',
      tenure: '३ महिना - ५ वर्ष',
      icon: '🏛️',
    },
    {
      id: 'dp-child',
      titleEn: 'Child Golden Future Savings',
      titleNp: 'बाल उज्ज्वल भविष्य बचत योजना',
      subtitleEn: 'Dedicated savings for children under 18 with special higher bonus rates.',
      subtitleNp: '१८ वर्ष मुनिका बालबालिकाको उच्च शिक्षा र सुरक्षित भविष्यका लागि विशेष योजना।',
      badgeEn: 'Child Growth',
      badgeNp: 'बाल कल्याण',
      interestRate: '8.50% p.a.',
      minBalance: 'रू. १,०००',
      tenure: '१८ वर्ष पुग्दासम्म',
      icon: '👶',
    },
    {
      id: 'dp-senior',
      titleEn: 'Senior Citizen Dignity Pension Savings',
      titleNp: 'ज्येष्ठ नागरिक सम्मान पेन्सन बचत',
      subtitleEn: 'Respecting elders with quarterly interest payouts and home doorstep banking.',
      subtitleNp: '६० वर्ष नाघेका ज्येष्ठ सदस्यहरूलाई त्रैमासिक ब्याज भुक्तानी र स्वास्थ्य सम्मान।',
      badgeEn: 'Senior Benefit',
      badgeNp: 'ज्येष्ठ नागरिक',
      interestRate: '9.00% p.a.',
      minBalance: 'रू. २,०००',
      tenure: 'आवधिक वा नियमित',
      icon: '👴',
    },
  ],
  'loan': [
    {
      id: 'ln-agri',
      titleEn: 'Productive Agriculture & Livestock Loan',
      titleNp: 'उत्पादनशील कृषि तथा पशुपालन कर्जा',
      subtitleEn: 'Subsidized loan for dairy, poultry, high-tech polyhouse and farm machinery.',
      subtitleNp: 'डेरी, कुखुरापालन, आधुनिक टनेल खेती र कृषि औजार खरिदका लागि सहुलियत कर्जा।',
      badgeEn: 'Subsidized Rate',
      badgeNp: 'सहुलियत ब्याज',
      interestRate: '11.50% p.a.',
      minBalance: 'धितो वा समूह जमानी',
      tenure: '५ वर्षसम्म',
      icon: '🌾',
    },
    {
      id: 'ln-business',
      titleEn: 'SME Micro & Small Enterprise Credit',
      titleNp: 'साना तथा मझौला व्यापार व्यवसाय कर्जा',
      subtitleEn: 'Working capital and inventory finance for local shops, trade and manufacturing.',
      subtitleNp: 'पसल, उद्योग तथा व्यापार विस्तारका लागि चालु पुँजी र मौज्दात कर्जा सुविधा।',
      badgeEn: 'Fast Approval',
      badgeNp: 'द्रुत स्वीकृति',
      interestRate: '12.50% p.a.',
      minBalance: 'फर्म दर्ता वा सम्पत्ति',
      tenure: '७ वर्षसम्म',
      icon: '💼',
    },
    {
      id: 'ln-housing',
      titleEn: 'Residential Housing & Land Development Loan',
      titleNp: 'घर निर्माण तथा जग्गा खरिद कर्जा',
      subtitleEn: 'Affordable financing to build, purchase or remodel your family residential home.',
      subtitleNp: 'आफ्नै घर निर्माण, घडेरी खरिद वा मर्मत सम्भारका लागि सुलभ किस्ताबन्दी कर्जा।',
      badgeEn: 'Long Tenure',
      badgeNp: 'दीर्घकालीन',
      interestRate: '13.00% p.a.',
      minBalance: 'घरजग्गा धितो',
      tenure: '१५ वर्षसम्म',
      icon: '🏠',
    },
    {
      id: 'ln-emergency',
      titleEn: 'Instant Emergency & Social Welfare Loan',
      titleNp: 'आकस्मिक स्वास्थ्य तथा सामाजिक कर्जा',
      subtitleEn: 'Quick same-day disbursement against deposit collateral for medical or family needs.',
      subtitleNp: 'बचत धितोमा तुरुन्त सोही दिन उपलब्ध हुने आकस्मिक स्वास्थ्य तथा पारिवारिक कर्जा।',
      badgeEn: 'Same Day',
      badgeNp: 'सोही दिन भुक्तानी',
      interestRate: 'बचत दर + २.००%',
      minBalance: '९०% निक्षेप कट्टा',
      tenure: '१ वर्ष नवीकरणीय',
      icon: '⚡',
    },
  ],
  'remittance': [
    {
      id: 'rm-intl',
      titleEn: 'Global Inward Remittance',
      titleNp: 'अन्तर्राष्ट्रिय विप्रेषण भुक्तानी',
      subtitleEn: 'Direct payout from UAE, Qatar, Saudi, Korea, Japan, USA and Europe.',
      subtitleNp: 'विश्वका जुनसुकै देशबाट पठाएको रकम बुटवलका सबै सेवा काउन्टरबाट तत्काल प्राप्त गर्नुहोस्।',
      badgeEn: 'Global Network',
      badgeNp: 'अन्तर्राष्ट्रिय सञ्जाल',
      interestRate: 'शून्य सेवा शुल्क (प्रापकलाई)',
      minBalance: 'पिन कोड र परिचयपत्र',
      tenure: 'तुरुन्त काउन्टर भुक्तानी',
      icon: '🌍',
    },
    {
      id: 'rm-partners',
      titleEn: 'Official Remittance Partners',
      titleNp: 'आधिकारिक रेमिट्यान्स साझेदारहरू',
      subtitleEn: 'Authorized payout for IME, Prabhu Money Transfer, Western Union, City Express.',
      subtitleNp: 'आइएमई, प्रभु मनि ट्रान्सफर, वेस्टर्न युनियन, सिटी एक्सप्रेस र ईसेवा मनि ट्रान्सफर।',
      badgeEn: 'Authorized Partner',
      badgeNp: 'प्रमाणित साझेदार',
      interestRate: 'अधिकतम सुरक्षा',
      minBalance: 'सहकारी बैंक आबद्ध',
      tenure: 'दैनिक सेवा',
      icon: '🤝',
    },
  ],
  'insurance': [
    {
      id: 'ins-member',
      titleEn: 'Member Critical Health & Safety Cover',
      titleNp: 'सदस्य दुर्घटना तथा जटिल रोग सुरक्षा',
      subtitleEn: 'Comprehensive protection policy covering permanent disability and hospitalization.',
      subtitleNp: 'दुर्घटना, स्थायी अशक्तता तथा अस्पताल भर्ना उपचार खर्चमा नगद शोधभर्ना।',
      badgeEn: 'Health Protection',
      badgeNp: 'स्वास्थ्य सुरक्षण',
      interestRate: 'रू. २,००,००० कभरेज',
      minBalance: 'नियमित सदस्य',
      tenure: 'वार्षिक नवीकरण',
      icon: '🛡️',
    },
    {
      id: 'ins-credit',
      titleEn: 'Loan Borrower Credit Protection Plan',
      titleNp: 'कर्जा सुरक्षण तथा बिमा योजना',
      subtitleEn: 'Guarantees loan repayment in unfortunate circumstances without burdening families.',
      subtitleNp: 'कुनै भवितव्य वा अप्रत्याशित घटना भएमा परिवारलाई आर्थिक भार नपर्ने गरी कर्जा सुरक्षण।',
      badgeEn: 'Family Relief',
      badgeNp: 'परिवार सुरक्षा',
      interestRate: 'कर्जा रकम बराबर कभर',
      minBalance: 'कर्जा प्रवाहसँगै',
      tenure: 'कर्जा अवधिभर',
      icon: '📜',
    },
  ],
  'digital-services': [
    {
      id: 'dg-mobile',
      titleEn: 'Ankur Smart Mobile Banking App',
      titleNp: 'अंकुर स्मार्ट मोबाइल बैंकिङ एप',
      subtitleEn: 'Balance inquiry, instant bank transfers, mini-statements and transaction alerts.',
      subtitleNp: 'ब्यालेन्स सोधपुछ, अन्य बैंक खातामा रकम ट्रान्सफर, स्टेटमेन्ट र एसएमएस अलर्ट।',
      badgeEn: 'Android & iOS',
      badgeNp: 'गुगल प्ले तथा एप स्टोर',
      interestRate: '२४/७ सेवा उपलब्ध',
      minBalance: 'निशुल्क सक्रियता',
      tenure: 'आजीवन',
      icon: '📱',
    },
    {
      id: 'dg-qr',
      titleEn: 'NepalPay & FonePay Merchant QR',
      titleNp: 'नेपालपे तथा फोनपे क्युआर भुक्तानी',
      subtitleEn: 'Contactless QR codes for member merchants, groceries, pharmacy and retail counters.',
      subtitleNp: 'सदस्यका व्यापारिक पसल, खाद्यान्न तथा फार्मेसीमा सिधै खातामा रकम जम्मा हुने क्युआर।',
      badgeEn: 'Zero Commission',
      badgeNp: 'सुलभ क्युआर स्ट्यान्ड',
      interestRate: 'तत्काल खातामा रकम',
      minBalance: 'व्यापारिक खाता',
      tenure: 'निःशुल्क वितरण',
      icon: '💳',
    },
  ],
};

export const ServicesManager: React.FC<Props> = ({ services, onSaveServices }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || 'member-service'
  );
  const [localServices, setLocalServices] = useState<ServiceItem[]>(services);
  const [schemeCardsMap, setSchemeCardsMap] = useState<Record<string, SchemeCardCMS[]>>(
    DEFAULT_SCHEME_CARDS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(true);

  React.useEffect(() => {
    if (services && services.length > 0) {
      setLocalServices(services);
    }
  }, [services]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const currentService =
    localServices.find((s) => s.id === selectedServiceId) || localServices[0];
  const currentCards = schemeCardsMap[selectedServiceId] || [];

  const handleUpdateServiceField = (
    field: keyof ServiceItem,
    value: string
  ) => {
    setLocalServices((prev) =>
      prev.map((s) => (s.id === selectedServiceId ? { ...s, [field]: value } : s))
    );
  };

  const handleAddSchemeCard = () => {
    const newCard: SchemeCardCMS = {
      id: `scheme-${Date.now()}`,
      titleEn: 'New Scheme / Product Name',
      titleNp: 'नयाँ योजना वा सुविधाको नाम',
      subtitleEn: 'Brief summary of the scheme terms, returns, and benefits.',
      subtitleNp: 'यो योजनाको फाइदा, प्रतिफल तथा नियम सम्बन्धी संक्षिप्त विवरण।',
      badgeEn: 'New Product',
      badgeNp: 'नयाँ योजना',
      interestRate: 'Attractive Rate',
      minBalance: 'रू. ५००',
      tenure: '१ वर्ष',
      icon: '✦',
    };
    setSchemeCardsMap((prev) => ({
      ...prev,
      [selectedServiceId]: [...(prev[selectedServiceId] || []), newCard],
    }));
  };

  const handleUpdateCardField = (
    cardId: string,
    field: keyof SchemeCardCMS,
    value: string
  ) => {
    setSchemeCardsMap((prev) => ({
      ...prev,
      [selectedServiceId]: (prev[selectedServiceId] || []).map((c) =>
        c.id === cardId ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleRemoveCard = (cardId: string) => {
    setSchemeCardsMap((prev) => ({
      ...prev,
      [selectedServiceId]: (prev[selectedServiceId] || []).filter(
        (c) => c.id !== cardId
      ),
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveServices(localServices);
      showToast('Services configuration and scheme cards saved to database successfully!');
    } catch (err: any) {
      showToast(`Error saving services: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="services-cms-manager" className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-sky-500 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Core Banking & Frontend CMS
            </div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-6 h-6 text-sky-600" />
              Services & Financial Products CMS Manager
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure the 6 core cooperative services, titles, subtitles, icons, promotional badges, and the large card schemes displayed in the full-window layout.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                previewMode
                  ? 'bg-sky-50 border-sky-300 text-sky-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Live Card Preview Active' : 'Toggle Card Preview'}
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving to Database...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {/* 6 Services Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-6">
          {localServices.map((svc) => {
            const isSelected = svc.id === selectedServiceId;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => setSelectedServiceId(svc.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-950/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-2xl mb-1">{svc.icon || '▣'}</span>
                <span className="text-xs font-bold leading-tight line-clamp-1">
                  {svc.titleEn}
                </span>
                <span
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  {svc.badge || 'Active Service'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentService && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Service Core Metadata */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <span className="text-xl">{currentService.icon}</span>
                  Service Metadata & Badges
                </h3>
                <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  ID: {currentService.id}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Title (English)
                </label>
                <input
                  type="text"
                  value={currentService.titleEn}
                  onChange={(e) => handleUpdateServiceField('titleEn', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Title (नेपाली)
                </label>
                <input
                  type="text"
                  value={currentService.titleNp}
                  onChange={(e) => handleUpdateServiceField('titleNp', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Icon / Emoji
                  </label>
                  <input
                    type="text"
                    value={currentService.icon}
                    onChange={(e) => handleUpdateServiceField('icon', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Promotional Badge
                  </label>
                  <input
                    type="text"
                    value={currentService.badge || ''}
                    placeholder="e.g. Up to 11.75%"
                    onChange={(e) => handleUpdateServiceField('badge', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Summary / Subtitle (English)
                </label>
                <textarea
                  rows={3}
                  value={currentService.descriptionEn}
                  onChange={(e) => handleUpdateServiceField('descriptionEn', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Summary / Subtitle (नेपाली)
                </label>
                <textarea
                  rows={3}
                  value={currentService.descriptionNp}
                  onChange={(e) => handleUpdateServiceField('descriptionNp', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-sky-600"
                />
              </div>

              <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-sky-800 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Changes made here directly reflect on both the homepage services section and when clicking the item to open its full-window modal or dedicated page view.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Scheme Cards Editor & Live Cards Preview */}
          <div className="lg:col-span-7 space-y-6">
            {/* Scheme Cards Manager Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Scheme & Product Cards ({currentCards.length} items)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These are the large, professional cards rendered inside the full-window layout matching About Us style.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSchemeCard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Scheme Card
                </button>
              </div>

              {/* Cards List Editor */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {currentCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          {card.titleEn}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(card.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Scheme Title (English)
                        </label>
                        <input
                          type="text"
                          value={card.titleEn}
                          onChange={(e) =>
                            handleUpdateCardField(card.id, 'titleEn', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-sky-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Scheme Title (नेपाली)
                        </label>
                        <input
                          type="text"
                          value={card.titleNp}
                          onChange={(e) =>
                            handleUpdateCardField(card.id, 'titleNp', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-sky-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Interest Rate / Bonus
                        </label>
                        <input
                          type="text"
                          value={card.interestRate || ''}
                          placeholder="e.g. 11.75% p.a."
                          onChange={(e) =>
                            handleUpdateCardField(card.id, 'interestRate', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-sky-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Min. Balance / Collateral
                        </label>
                        <input
                          type="text"
                          value={card.minBalance || ''}
                          placeholder="e.g. रू. १,०००"
                          onChange={(e) =>
                            handleUpdateCardField(card.id, 'minBalance', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-sky-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Tenure / Period
                        </label>
                        <input
                          type="text"
                          value={card.tenure || ''}
                          placeholder="e.g. १ देखि ५ वर्ष"
                          onChange={(e) =>
                            handleUpdateCardField(card.id, 'tenure', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-sky-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Summary Description (English)
                      </label>
                      <input
                        type="text"
                        value={card.subtitleEn}
                        onChange={(e) =>
                          handleUpdateCardField(card.id, 'subtitleEn', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-sky-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Visual Card Preview (Matching existing About Us card layout & styling) */}
            {previewMode && (
              <div className="bg-sky-950/5 rounded-2xl p-6 border border-sky-800/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      Standardized Live Card Grid (Full-Window View)
                    </span>
                  </div>
                  <span className="text-[11px] text-sky-800 bg-sky-100/70 font-semibold px-2 py-0.5 rounded-full">
                    Same Large Size & Format as About Us
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentCards.map((card) => (
                    <div
                      key={card.id}
                      className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-sky-400 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl text-sky-700 shadow-2xs group-hover:scale-105 transition-transform">
                            {card.icon || currentService.icon || '💎'}
                          </div>
                          {card.badgeEn && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                              {card.badgeEn}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors mb-1">
                          {card.titleEn}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {card.subtitleEn}
                        </p>
                      </div>

                      {(card.interestRate || card.minBalance || card.tenure) && (
                        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                          {card.interestRate && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">
                                Return / Rate
                              </span>
                              <span className="font-bold text-sky-700">
                                {card.interestRate}
                              </span>
                            </div>
                          )}
                          {card.minBalance && (
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">
                                Min Deposit
                              </span>
                              <span className="font-bold text-slate-700">
                                {card.minBalance}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
