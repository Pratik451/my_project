import { PopupNoticeItem } from '../types';

export interface BackendDbStatus {
  driver: 'mysql' | 'sqlite';
  configuredDriver: string;
  mysql: {
    host: string;
    port: number;
    user: string;
    database: string;
    connected: boolean;
    error?: string;
  };
  sqlite: {
    path: string;
    exists: boolean;
  };
  counts: {
    ekymSubmissions: number;
    popupNotices: number;
  };
  timestamp: string;
}

const FALLBACK_POPUP_NOTICES: PopupNoticeItem[] = [
  {
    id: '1',
    noticeKey: 'notice-agm-24',
    active: true,
    titleEn: '24th Annual General Meeting (AGM) & 15.5% Dividend Distribution Notice',
    titleNp: '२४औं वार्षिक साधारण सभा तथा १५.५% लाभांश वितरण सम्बन्धी अत्यन्त जरुरी सूचना',
    categoryEn: 'Annual General Meeting',
    categoryNp: 'वार्षिक साधारण सभा सूचना',
    imageUrl: '/uploads/media/notice-agm.svg',
    contentEn: 'All respected shareholder members of Ankur Saving & Credit Cooperative Ltd. are cordially invited to attend the 24th Annual General Meeting scheduled for Saturday, Ashwin 18, 2083 (11:00 AM) at the Central Assembly Hall, Butwal-04. The AGM will deliberate on the Audited Annual Financial Report (FY 2082/83), approve the recommended 15.5% dividend payout (bonus shares and cash dividend), and ratify the institutional development plan.',
    contentNp: 'अंकुर बचत तथा ऋण सहकारी संस्था लि. का सम्पूर्ण आदरणीय सेयर सदस्य महानुभावहरूमा हार्दिक नमस्कार। संस्थाको सञ्चालक समितिको निर्णयानुसार संस्थाको २४औं वार्षिक साधारण सभा आगामी २०८३ असोज १८ गते शनिबार बिहान ११:०० बजे केन्द्रीय सभाहल, बुटवल-०४ (ट्राफिक चोक) मा भव्यताका साथ सम्पन्न हुन गइरहेको व्यहोरा सूचित गरिन्छ। सभामा आ.व. २०८२/८३ को लेखापरीक्षण प्रतिवेदन, १५.५% लाभांश (बोनस सेयर तथा नगद) वितरण प्रस्ताव एवं आगामी आर्थिक वर्षको नीति तथा कार्यक्रम प्रस्तुत गरिनेछ।',
    bulletPointsEn: [
      'Members are requested to bring their original Share Certificate or Citizenship card for verification.',
      'Dividend amounts will be transferred directly to active bank accounts; kindly complete your eKYM update.',
      'Annual reports and token of appreciation will be distributed at registration counters from 9:30 AM.',
      'For inquiries, contact Central Office Butwal (071-540123) or your local service center.'
    ],
    bulletPointsNp: [
      '१. सभामा प्रवेशका लागि आफ्नो सक्कल सेयर प्रमाणपत्र वा नागरिकता साथमा लिएर आउनुहुन अनुरोध छ।',
      '२. लाभांश रकम सिधै सदस्यको बचत खातामा जम्मा गरिने हुँदा सम्पूर्ण सदस्यहरूले eKYM विवरण अनिवार्य अद्यावधिक गर्नुपर्नेछ।',
      '३. साधारण सभाको प्रतिवेदन तथा उपहार कुपन प्रवेशद्वारको दर्ता काउन्टरबाट बिहान ९:३० बजेदेखि उपलब्ध हुनेछ।',
      '४. थप जानकारीका लागि केन्द्रीय कार्यालय बुटवल (०७१-५४०१२३) वा नजिकको सेवा केन्द्रमा सम्पर्क गर्नुहोला।'
    ],
    dateEn: '24 Sep 2026',
    dateNp: '२०८३ असोज १० गते',
    noticeRef: 'सूचना नं. ०४/२०८३-८४',
    actionTextEn: 'Update eKYM for Dividend',
    actionTextNp: 'लाभांशका लागि eKYM भर्नुहोस्',
    actionLink: '#ekym'
  },
  {
    id: '2',
    noticeKey: 'notice-ekym-mandatory',
    active: true,
    titleEn: 'Mandatory eKYM Digital Profile Verification Before Quarter-End',
    titleNp: 'अनिवार्य eKYM डिजिटल सदस्य विवरण अद्यावधिक गर्ने सम्बन्धी सूचना',
    categoryEn: 'Member Regulatory Notice',
    categoryNp: 'सदस्य जरुरी सूचना',
    imageUrl: '/uploads/media/notice-ekym.svg',
    contentEn: 'Pursuant to the Cooperative Act 2074 and regulatory directives of the Cooperative Department, all registered members of Ankur Cooperative are required to verify their Know Your Member (eKYM) credentials online. Please complete the 3-minute digital identity update through our web portal to ensure uninterrupted mobile banking, SMS alert services, ATM access, and dividend disbursements.',
    contentNp: 'सहकारी ऐन २०७४ तथा नियामक निकायको वित्तीय निर्देशिका बमोजिम संस्थाका सम्पूर्ण आदरणीय सदस्यहरूले आफ्ना व्यक्तिगत, पारिवारिक, तीन पुस्ते तथा बैंकिङ विवरणहरू डिजिटल माध्यमबाट अद्यावधिक गर्नुपर्ने कानुनी व्यवस्था रहेको छ। डिजिटल कारोबार, मोबाइल बैंकिङ तथा कर्जा सुविधा निर्वाध रूपमा सञ्चालन गर्नको लागि संस्थाको अनलाइन eKYM पोर्टल प्रयोग गरी तत्काल फाराम भर्नुहुन विनम्र अनुरोध गर्दछौं।',
    bulletPointsEn: [
      'Upload clear front & back copies of your Nepali Citizenship Card.',
      'Attach recent passport-sized digital photograph and signature specimen.',
      'Takes less than 3 minutes directly through your phone or computer.',
      'A digital tracking number will be generated immediately for live status check.'
    ],
    bulletPointsNp: [
      '• नागरिकता प्रमाणपत्रको दुवैतर्फको स्पष्ट प्रतिलिपि अपलोड गर्नुपर्नेछ।',
      '• हालसालै खिचिएको पासपोर्ट साइजको डिजिटल फोटो तथा हस्ताक्षर कार्ड पेश गर्नुपर्नेछ।',
      '• मोबाइल वा कम्प्युटरबाट ३ मिनेटमा सजिलै eKYM फाराम भर्न सकिनेछ।',
      '• फाराम दर्ता हुनासाथ ट्र्याकिङ नम्बर तुरुन्त प्राप्त हुनेछ।'
    ],
    dateEn: '18 Sep 2026',
    dateNp: '२०८३ असोज ०२ गते',
    noticeRef: 'सूचना नं. ०३/२०८३-८४',
    actionTextEn: 'Open eKYM Online Form',
    actionTextNp: 'अनलाइन eKYM फाराम खोल्नुहोस्',
    actionLink: '#ekym'
  }
];

/**
 * Fetch all popup notices directly from backend MySQL database via /api/popup-notices
 */
export async function fetchPopupNotices(includeInactive = false): Promise<PopupNoticeItem[]> {
  try {
    const url = includeInactive ? '/api/popup-notices?all=true' : '/api/popup-notices';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const res = await response.json();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    }
  } catch (err) {
    console.warn('Direct fetch from /api/popup-notices failed, trying PHP API router:', err);
  }

  // Fallback attempt via PHP router /api.php?action=popup_notices
  try {
    const phpUrl = includeInactive ? '/api.php?action=popup_notices&all=1' : '/api.php?action=popup_notices';
    const phpRes = await fetch(phpUrl, { headers: { 'Accept': 'application/json' } });
    if (phpRes.ok) {
      const data = await phpRes.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (phpErr) {
    console.warn('PHP router fetch failed:', phpErr);
  }

  return FALLBACK_POPUP_NOTICES;
}

/**
 * Fetch database connection status (MySQL & SQLite)
 */
export async function fetchDatabaseHealth(): Promise<BackendDbStatus | null> {
  try {
    const res = await fetch('/api/db/status');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch DB health:', e);
  }
  return null;
}

/**
 * Toggle active status of a popup notice in MySQL
 */
export async function togglePopupNoticeStatus(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/popup-notices/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (e) {
    console.error('Failed to toggle notice status:', e);
  }
  return false;
}

/**
 * Create or update a popup notice in MySQL
 */
export async function savePopupNotice(notice: Partial<PopupNoticeItem>): Promise<PopupNoticeItem | null> {
  try {
    const isUpdate = Boolean(notice.id);
    const url = isUpdate ? `/api/popup-notices/${encodeURIComponent(notice.id!)}` : '/api/popup-notices';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (e) {
    console.error('Failed to save popup notice in MySQL:', e);
  }
  return null;
}

/**
 * Delete a popup notice from MySQL
 */
export async function deletePopupNotice(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/popup-notices/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (e) {
    console.error('Failed to delete notice:', e);
  }
  return false;
}

/**
 * Update or clear the banner image URL of an existing popup notice in MySQL
 */
export async function updatePopupNoticeImage(id: string, imageUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/popup-notices/${encodeURIComponent(id)}/image`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (e) {
    console.error('Failed to update popup notice image:', e);
  }
  return false;
}
