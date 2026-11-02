import {
  MediaFile,
  SiteSettingsCMS,
  SlideCMS,
  GalleryItem,
  ServiceItem,
  TeamMemberCMS,
  CmsPagesState,
  DepartmentCMS,
  ServiceCenterCMS,
  ReportCMS,
  CareerCMS,
  HeadOfficeInfoCMS,
  GrievanceRecordCMS,
  GrievanceOfficerCMS,
  InterestRate,
  PrivacyPolicyCMS,
  SocialLinksCMS,
  BrandThemeCMS,
  DocumentItemCMS,
  NewsActivityItemCMS,
  SuggestionItemCMS,
  FaqItemCMS,
  HistoryMilestonesPageCMS,
  WhyChooseUsPageCMS,
  ExchangeRateItemCMS,
  InstitutionalProfileItemCMS,
  MonthlyFinancialReportCMS,
  LeadershipMemberCMS,
} from '../types';

export interface SiteSettingsData {
  coopLogoUrl?: string;
  coop_logo_url?: string;
  logo_url?: string;
  logo_filename?: string;
  logo_updated_at?: string;
  coopNameEn?: string;
  coop_name_en?: string;
  coopNameNp?: string;
  coop_name_np?: string;
  taglineEn?: string;
  tagline_en?: string;
  taglineNp?: string;
  tagline_np?: string;
  [key: string]: any;
}

/**
 * Normalizes backend database keys (snake_case/camelCase) into strongly-typed SiteSettingsCMS
 */
export function mapBackendSettingsToCms(raw: Record<string, any>): Partial<SiteSettingsCMS> {
  if (!raw || typeof raw !== 'object') return {};

  let logo = raw.coopLogoUrl || raw.coop_logo_url || raw.logo_url;
  if (
    logo &&
    typeof logo === 'string' &&
    !logo.startsWith('/') &&
    !logo.startsWith('http') &&
    !logo.startsWith('data:')
  ) {
    logo = '/' + logo;
  }

  const result: Partial<SiteSettingsCMS> = {};
  if (logo) result.coopLogoUrl = logo;
  if (raw.coopNameEn || raw.coop_name_en) result.coopNameEn = raw.coopNameEn || raw.coop_name_en;
  if (raw.coopNameNp || raw.coop_name_np) result.coopNameNp = raw.coopNameNp || raw.coop_name_np;
  if (raw.taglineEn || raw.tagline_en) result.taglineEn = raw.taglineEn || raw.tagline_en;
  if (raw.taglineNp || raw.tagline_np) result.taglineNp = raw.taglineNp || raw.tagline_np;
  if (raw.establishedBs || raw.established_bs) result.establishedBs = raw.establishedBs || raw.established_bs;
  if (raw.establishedAd || raw.established_ad) result.establishedAd = raw.establishedAd || raw.established_ad;
  if (raw.establishedDateFullEn || raw.established_date_full_en) result.establishedDateFullEn = raw.establishedDateFullEn || raw.established_date_full_en;
  if (raw.establishedDateFullNp || raw.established_date_full_np) result.establishedDateFullNp = raw.establishedDateFullNp || raw.established_date_full_np;
  if (raw.tickerTextEn || raw.ticker_text_en) result.tickerTextEn = raw.tickerTextEn || raw.ticker_text_en;
  if (raw.tickerTextNp || raw.ticker_text_np) result.tickerTextNp = raw.tickerTextNp || raw.ticker_text_np;
  if (raw.tickerActive !== undefined) {
    result.tickerActive = Boolean(
      raw.tickerActive === true ||
      raw.tickerActive === 'true' ||
      raw.tickerActive === '1' ||
      raw.tickerActive === 1
    );
  } else if (raw.ticker_active !== undefined) {
    result.tickerActive = Boolean(
      raw.ticker_active === true ||
      raw.ticker_active === 'true' ||
      raw.ticker_active === '1' ||
      raw.ticker_active === 1
    );
  }
  if (raw.phoneHeadOffice || raw.phone_head_office || raw.phone_headoffice) {
    result.phoneHeadOffice = raw.phoneHeadOffice || raw.phone_head_office || raw.phone_headoffice;
  }
  if (raw.phoneTollFree || raw.phone_toll_free || raw.phone_tollfree) {
    result.phoneTollFree = raw.phoneTollFree || raw.phone_toll_free || raw.phone_tollfree;
  }
  if (raw.emailOfficial || raw.email_official) result.emailOfficial = raw.emailOfficial || raw.email_official;
  if (raw.addressHeadOffice || raw.address_head_office || raw.address_headoffice) {
    result.addressHeadOffice = raw.addressHeadOffice || raw.address_head_office || raw.address_headoffice;
  }
  if (raw.addressHeadOfficeNp || raw.address_head_office_np) {
    result.addressHeadOfficeNp = raw.addressHeadOfficeNp || raw.address_head_office_np;
  }
  if (raw.province) result.province = raw.province;
  if (raw.district) result.district = raw.district;
  if (raw.cityMunicipality || raw.city_municipality) {
    result.cityMunicipality = raw.cityMunicipality || raw.city_municipality;
  }
  if (raw.wardNo || raw.ward_no) result.wardNo = raw.wardNo || raw.ward_no;
  if (raw.toleStreet || raw.tole_street) result.toleStreet = raw.toleStreet || raw.tole_street;
  if (raw.serviceCoverageEn || raw.service_coverage_en) {
    result.serviceCoverageEn = raw.serviceCoverageEn || raw.service_coverage_en;
  }
  if (raw.serviceCoverageNp || raw.service_coverage_np) {
    result.serviceCoverageNp = raw.serviceCoverageNp || raw.service_coverage_np;
  }
  if (raw.branchNetworkTextEn || raw.branch_network_text_en) {
    result.branchNetworkTextEn = raw.branchNetworkTextEn || raw.branch_network_text_en;
  }
  if (raw.branchNetworkTextNp || raw.branch_network_text_np) {
    result.branchNetworkTextNp = raw.branchNetworkTextNp || raw.branch_network_text_np;
  }
  if (raw.googleMapsEmbedUrl || raw.google_maps_embed_url) {
    result.googleMapsEmbedUrl = raw.googleMapsEmbedUrl || raw.google_maps_embed_url;
  }
  if (raw.officeHours || raw.office_hours) result.officeHours = raw.officeHours || raw.office_hours;
  if (raw.regdNo || raw.regd_no) result.regdNo = raw.regdNo || raw.regd_no;
  if (raw.panNo || raw.pan_no) result.panNo = raw.panNo || raw.pan_no;
  if (raw.statMembers || raw.stat_members) result.statMembers = raw.statMembers || raw.stat_members;
  if (raw.statSavings || raw.stat_savings) result.statSavings = raw.statSavings || raw.stat_savings;
  if (raw.statLoans || raw.stat_loans) result.statLoans = raw.statLoans || raw.stat_loans;
  if (raw.statCapital || raw.stat_capital) result.statCapital = raw.statCapital || raw.stat_capital;
  if (raw.statBranches || raw.stat_branches) result.statBranches = raw.statBranches || raw.stat_branches;

  return result;
}

/**
 * Fetch all media files uploaded and managed on the server
 */
export async function fetchMediaFiles(): Promise<MediaFile[]> {
  try {
    const res = await fetch('/api/media', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((r: any) => ({
        id: String(r.id),
        mediaKey: r.media_key || `media-${r.id}`,
        title: r.title || r.filename,
        filename: r.filename,
        filePath: r.file_path,
        fileType: r.file_type,
        fileSize: Number(r.file_size) || 0,
        category: r.category || 'general',
        altText: r.alt_text || '',
        isSystemDefault: Boolean(r.is_system_default),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    return [];
  } catch (err) {
    console.warn('Could not fetch media files from server, using empty list:', err);
    return [];
  }
}

/**
 * Upload one or more media files with category and metadata
 */
export async function uploadMediaFiles(
  files: File[],
  category: string = 'general',
  title?: string
): Promise<MediaFile[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  formData.append('category', category);
  if (title) formData.append('title', title);

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Upload failed with status ${res.status}`);
  }

  const json = await res.json();
  if (json.success && Array.isArray(json.data)) {
    return json.data.map((r: any) => ({
      id: String(r.id),
      mediaKey: r.media_key || `media-${r.id}`,
      title: r.title || r.filename,
      filename: r.filename,
      filePath: r.file_path,
      fileType: r.file_type,
      fileSize: Number(r.file_size) || 0,
      category: r.category || 'general',
      altText: r.alt_text || '',
      isSystemDefault: Boolean(r.is_system_default),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }
  throw new Error(json.message || 'Failed to upload media files');
}

/**
 * Update media metadata (title, category, altText)
 */
export async function updateMediaMetadata(
  id: string | number,
  payload: { title?: string; category?: string; altText?: string }
): Promise<boolean> {
  const res = await fetch(`/api/media/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return Boolean(json.success);
}

/**
 * Delete a media item from disk and database by ID
 */
export async function deleteMediaFile(id: string | number): Promise<boolean> {
  const res = await fetch(`/api/media/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok && !json.success) {
    throw new Error(json.message || 'Failed to delete media file');
  }
  return Boolean(json.success);
}

/**
 * Delete a media file from disk and MySQL database by its file path
 */
export async function deleteMediaByPath(filePath: string): Promise<boolean> {
  if (!filePath || !filePath.trim()) return true;
  try {
    const res = await fetch('/api/media/delete-by-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: filePath.trim() }),
    });
    const json = await res.json().catch(() => ({}));
    return Boolean(res.ok || json.success);
  } catch (err) {
    console.warn('Could not delete media by path:', err);
    return false;
  }
}

/**
 * Delete the current uploaded logo from server disk and reset in MySQL database
 */
export async function deleteWebsiteLogo(): Promise<string> {
  const res = await fetch('/api/settings/logo', {
    method: 'DELETE',
  });
  const json = await res.json().catch(() => ({}));
  if (res.ok && json.success && json.logoUrl) {
    return json.logoUrl;
  }
  return '/uploads/logos/ekata-logo-default.svg';
}

/**
 * Replace an existing media file with a newly uploaded file
 */
export async function replaceMediaFile(id: string | number, file: File): Promise<MediaFile> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`/api/media/replace/${id}`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to replace file');
  }
  return json.data;
}

/**
 * Fetch website settings (including active official logo) from backend database
 */
export async function fetchSiteSettings(): Promise<Partial<SiteSettingsCMS>> {
  try {
    const res = await fetch('/api/settings', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return mapBackendSettingsToCms(json.data || {});
  } catch (err) {
    console.warn('Failed to load settings from server:', err);
    return {};
  }
}

/**
 * Directly fetch the active official cooperative logo path from backend database
 */
export async function fetchWebsiteLogo(): Promise<string> {
  try {
    const res = await fetch('/api/settings/logo', {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.logoUrl) {
        return json.logoUrl;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch logo endpoint:', err);
  }
  return '';
}

/**
 * Upload and update the main official cooperative logo via Multer backend disk storage and database
 * Includes automatic base64 fallback so logo uploads always succeed and persist in the database.
 */
export async function uploadWebsiteLogo(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch('/api/settings/logo', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.logoUrl) {
        return json.logoUrl;
      }
    }
  } catch (err) {
    console.warn('Multipart logo upload fallback triggered:', err);
  }

  // Fallback: convert file to base64 and POST JSON to /api/settings/logo
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read selected logo file'));
    reader.readAsDataURL(file);
  });

  const fallbackRes = await fetch('/api/settings/logo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, filename: file.name }),
  });

  const fallbackJson = await fallbackRes.json().catch(() => ({}));
  if (fallbackRes.ok && fallbackJson.success && fallbackJson.logoUrl) {
    return fallbackJson.logoUrl;
  }

  throw new Error(fallbackJson.message || 'Failed to upload and save official logo to database');
}

/**
 * Save a logo URL or preset path directly to the database
 */
export async function saveWebsiteLogoUrl(logoUrl: string): Promise<string> {
  const cleanUrl = logoUrl.trim();
  const res = await fetch('/api/settings/logo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      logoUrl: cleanUrl,
      coopLogoUrl: cleanUrl,
      coop_logo_url: cleanUrl,
      logo_url: cleanUrl,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (res.ok && json.success && json.logoUrl) {
    return json.logoUrl;
  }

  // Fallback via /api/settings
  await updateSiteSettings({
    coopLogoUrl: cleanUrl,
    coop_logo_url: cleanUrl,
    logo_url: cleanUrl,
    logo_updated_at: new Date().toISOString(),
  });
  return cleanUrl;
}

/**
 * Save site settings map to backend database
 */
export async function updateSiteSettings(settings: Record<string, any>): Promise<boolean> {
  const payload: Record<string, any> = { ...settings };
  if (payload.coopLogoUrl) {
    payload.coop_logo_url = payload.coopLogoUrl;
    payload.logo_url = payload.coopLogoUrl;
  }
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return Boolean(json.success);
}

export interface UploadMediaResult {
  success: boolean;
  url: string;
  file: { url: string; filename?: string };
  error?: string;
}

/**
 * Upload single image to backend disk storage and return public web path
 */
export async function uploadSingleMediaImage(
  file: File,
  category: string = 'general',
  title?: string
): Promise<UploadMediaResult> {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('category', category);
  if (title) formData.append('title', title);

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Upload failed with status ${res.status}`);
  }

  const json = await res.json();
  let filePath = '';
  let filename = '';
  if (json.success && Array.isArray(json.data) && json.data.length > 0) {
    filePath = json.data[0].file_path;
    filename = json.data[0].filename;
  } else if (json.fileUrl || json.filePath || json.url) {
    filePath = json.fileUrl || json.filePath || json.url;
  }

  if (!filePath) {
    throw new Error('Failed to retrieve uploaded image path');
  }

  return {
    success: true,
    url: filePath,
    file: { url: filePath, filename },
  };
}

/**
 * Fetch dynamic Hero slides from database settings
 */
export async function fetchCmsSlides(): Promise<SlideCMS[] | null> {
  try {
    const res = await fetch('/api/settings', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.data && json.data.cms_slides) {
      const parsed = typeof json.data.cms_slides === 'string' ? JSON.parse(json.data.cms_slides) : json.data.cms_slides;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch custom CMS slides, using defaults:', err);
  }
  return null;
}

/**
 * Save Hero slides to database settings
 */
export async function saveCmsSlides(slides: SlideCMS[]): Promise<boolean> {
  return updateSiteSettings({ cms_slides: JSON.stringify(slides) });
}

/**
 * Fetch dynamic gallery from database settings
 */
export async function fetchCmsGallery(): Promise<GalleryItem[] | null> {
  try {
    const res = await fetch('/api/settings', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.data && json.data.cms_gallery) {
      const parsed = typeof json.data.cms_gallery === 'string' ? JSON.parse(json.data.cms_gallery) : json.data.cms_gallery;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch custom CMS gallery, using defaults:', err);
  }
  return null;
}

/**
 * Save gallery items to database settings
 */
export async function saveCmsGallery(gallery: GalleryItem[]): Promise<boolean> {
  return updateSiteSettings({ cms_gallery: JSON.stringify(gallery) });
}

/**
 * Fetch dynamic team members from database settings
 */
export async function fetchCmsTeam(): Promise<TeamMemberCMS[] | null> {
  try {
    const res = await fetch('/api/settings', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.data && json.data.cms_team) {
      const parsed = typeof json.data.cms_team === 'string' ? JSON.parse(json.data.cms_team) : json.data.cms_team;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch custom CMS team, using defaults:', err);
  }
  return null;
}

/**
 * Save team members to database settings
 */
export async function saveCmsTeam(team: TeamMemberCMS[]): Promise<boolean> {
  return updateSiteSettings({ cms_team: JSON.stringify(team) });
}

/**
 * Fetch Messages from Leadership and Designated Officers from MySQL database
 */
export async function fetchCmsLeadership(): Promise<LeadershipMemberCMS[] | null> {
  try {
    const res = await fetch('/api/cms/leadership_members', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      const altRes = await fetch('/api/cms/leadership', { headers: { 'Accept': 'application/json' } });
      if (!altRes.ok) return null;
      const altJson = await altRes.json();
      if (altJson.success && Array.isArray(altJson.data)) return altJson.data;
      return null;
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('Could not fetch leadership profiles from database:', err);
  }
  return null;
}

/**
 * Save all Leadership profiles to MySQL database settings
 */
export async function saveCmsLeadership(members: LeadershipMemberCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/leadership_members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(members),
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Failed saving leadership members to /api/cms/leadership_members:', err);
  }
  return updateSiteSettings({ cms_leadership_members: JSON.stringify(members) });
}

/**
 * Save or update a single Leadership profile
 */
export async function saveSingleCmsLeadershipMember(
  member: LeadershipMemberCMS
): Promise<LeadershipMemberCMS | null> {
  try {
    const res = await fetch('/api/cms/leadership_members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.item) return json.item;
    }
  } catch (err) {
    console.warn('Failed saving single leadership profile:', err);
  }
  return null;
}

/**
 * Delete a Leadership profile by ID
 */
export async function deleteCmsLeadershipMember(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/cms/leadership_members/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Failed deleting leadership member:', err);
  }
  return false;
}

/**
 * Server-backed upload for leadership profile photo
 */
export async function uploadLeadershipPhoto(file: File, leaderName?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'leadership');
  if (leaderName) formData.append('title', leaderName);

  try {
    const res = await fetch('/api/cms/leadership/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && (json.url || json.filePath)) {
        return json.url || json.filePath;
      }
    }
  } catch (e) {
    console.warn('Direct leadership upload endpoint fallback:', e);
  }

  // Fallback to generic uploadSingleMediaImage
  const res = await uploadSingleMediaImage(file, 'leadership', leaderName || 'Leader Photo');
  return res.url;
}

/**
 * Fetch dynamic services from database settings
 */
export async function fetchCmsServices(): Promise<ServiceItem[] | null> {
  try {
    const res = await fetch('/api/settings', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.data && json.data.cms_services) {
      const parsed = typeof json.data.cms_services === 'string' ? JSON.parse(json.data.cms_services) : json.data.cms_services;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch custom CMS services, using defaults:', err);
  }
  return null;
}

/**
 * Save services to database settings
 */
export async function saveCmsServices(services: ServiceItem[]): Promise<boolean> {
  return updateSiteSettings({ cms_services: JSON.stringify(services) });
}

/**
 * Fetch dynamic pages (Profile, Mission/Vision, Chairman, CEO) from backend
 */
export async function fetchCmsPages(): Promise<CmsPagesState | null> {
  try {
    const res = await fetch('/api/cms/pages', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
    }
  } catch (err) {
    console.warn('Could not fetch custom CMS pages:', err);
  }
  return null;
}

/**
 * Save dynamic pages (Profile, Mission/Vision, Chairman, CEO) to database
 */
export async function saveCmsPages(pages: CmsPagesState): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pages),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CMS pages:', err);
    return false;
  }
}

/**
 * Fetch organizational departments from backend database
 */
export async function fetchCmsDepartments(): Promise<DepartmentCMS[] | null> {
  try {
    const res = await fetch('/api/cms/departments', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const parsed = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch CMS departments:', err);
  }
  return null;
}

/**
 * Save organizational departments to backend database
 */
export async function saveCmsDepartments(departments: DepartmentCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(departments),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CMS departments:', err);
    return false;
  }
}

/**
 * Fetch branch service centers from backend database
 */
export async function fetchCmsServiceCenters(): Promise<ServiceCenterCMS[] | null> {
  try {
    const res = await fetch('/api/cms/service_centers', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const parsed = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch CMS service centers:', err);
  }
  return null;
}

/**
 * Save branch service centers to backend database
 */
export async function saveCmsServiceCenters(centers: ServiceCenterCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/service_centers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(centers),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CMS service centers:', err);
    return false;
  }
}

/**
 * Fetch downloadable reports and publications from backend database
 */
export async function fetchCmsReports(): Promise<ReportCMS[] | null> {
  try {
    const res = await fetch('/api/cms/reports', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const parsed = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch CMS reports:', err);
  }
  return null;
}

/**
 * Save downloadable reports and publications to backend database
 */
export async function saveCmsReports(reports: ReportCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reports),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CMS reports:', err);
    return false;
  }
}

/**
 * Fetch career job vacancies from backend database
 */
export async function fetchCmsCareers(): Promise<CareerCMS[] | null> {
  try {
    const res = await fetch('/api/cms/careers', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const parsed = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch CMS careers:', err);
  }
  return null;
}

/**
 * Save career job vacancies to backend database
 */
export async function saveCmsCareers(careers: CareerCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/careers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(careers),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CMS careers:', err);
    return false;
  }
}

/**
 * Fetch head office information from backend database
 */
export async function fetchCmsHeadOffice(): Promise<HeadOfficeInfoCMS | null> {
  try {
    const res = await fetch(`/api/cms/head_office?_t=${Date.now()}`, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
    }
  } catch (err) {
    console.warn('Could not fetch CMS head office info:', err);
  }
  return null;
}

/**
 * Save head office information to backend database
 */
export async function saveCmsHeadOffice(info: HeadOfficeInfoCMS): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/head_office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CMS head office info:', err);
    return false;
  }
}

/**
 * Delete a department desk or reset head office info in backend database
 */
export async function deleteCmsHeadOffice(departmentId?: string): Promise<HeadOfficeInfoCMS | null> {
  try {
    const url = departmentId
      ? `/api/cms/head_office?departmentId=${encodeURIComponent(departmentId)}`
      : '/api/cms/head_office';
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
    }
  } catch (err) {
    console.warn('Failed to delete CMS head office item:', err);
  }
  return null;
}

/**
 * Fetch grievance tickets list from backend database
 */
export async function fetchCmsGrievances(): Promise<GrievanceRecordCMS[] | null> {
  try {
    const res = await fetch('/api/cms/grievances', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const parsed = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch CMS grievances:', err);
  }
  return null;
}

/**
 * Save grievance tickets list to backend database
 */
export async function saveCmsGrievances(records: GrievanceRecordCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CMS grievances:', err);
    return false;
  }
}

/**
 * Fetch grievance officer profile from backend database
 */
export async function fetchCmsGrievanceOfficer(): Promise<GrievanceOfficerCMS | null> {
  try {
    const res = await fetch('/api/cms/grievance_officer', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
    }
  } catch (err) {
    console.warn('Could not fetch grievance officer:', err);
  }
  return null;
}

/**
 * Save grievance officer profile to backend database
 */
export async function saveCmsGrievanceOfficer(officer: GrievanceOfficerCMS): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/grievance_officer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(officer),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save grievance officer:', err);
    return false;
  }
}

/**
 * Save Privacy Policy to backend database
 */
export async function saveCmsPrivacyPolicy(policy: PrivacyPolicyCMS): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/privacy_policy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save Privacy Policy:', err);
    return false;
  }
}

/**
 * Save Social Media Links to backend database
 */
export async function saveCmsSocialLinks(links: SocialLinksCMS): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/social_links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save Social Links:', err);
    return false;
  }
}

/**
 * Save Brand Theme / Colors to backend database
 */
export async function saveCmsBrandTheme(theme: BrandThemeCMS): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/brand_theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save Brand Theme:', err);
    return false;
  }
}

/**
 * Save Documents list to backend database
 */
export async function saveCmsDocuments(docs: DocumentItemCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docs),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save Documents:', err);
    return false;
  }
}

/**
 * Save News & Activities list to backend database
 */
export async function saveCmsNewsActivities(items: NewsActivityItemCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/news_activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save News & Activities:', err);
    return false;
  }
}

/**
 * Fetch Suggestion Box items from backend database
 */
export async function fetchCmsSuggestions(): Promise<SuggestionItemCMS[]> {
  try {
    const res = await fetch(`/api/cms/suggestions?_t=${Date.now()}`, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('Failed to fetch Suggestions:', err);
  }
  return [];
}

/**
 * Submit a single Feedback/Suggestion item from the public form to MySQL
 */
export async function submitCmsSuggestion(
  item: Partial<SuggestionItemCMS>
): Promise<{ success: boolean; item?: SuggestionItemCMS; data?: SuggestionItemCMS[] }> {
  try {
    const res = await fetch('/api/cms/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item }),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, item: json.item, data: json.data };
    }
  } catch (err) {
    console.warn('Failed to submit Suggestion:', err);
  }
  return { success: false };
}

/**
 * Update a single Suggestion item in MySQL database
 */
export async function updateCmsSuggestionItem(
  id: string,
  updates: Partial<SuggestionItemCMS>
): Promise<SuggestionItemCMS[] | null> {
  try {
    const res = await fetch(`/api/cms/suggestions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (res.ok && json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('Failed to update Suggestion item:', err);
  }
  return null;
}

/**
 * Delete a single Suggestion item from MySQL database
 */
export async function deleteCmsSuggestionItem(id: string): Promise<SuggestionItemCMS[] | null> {
  try {
    const res = await fetch(`/api/cms/suggestions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const json = await res.json();
    if (res.ok && json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('Failed to delete Suggestion item:', err);
  }
  return null;
}

/**
 * Save Suggestion Box items to backend database
 */
export async function saveCmsSuggestions(items: SuggestionItemCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save Suggestions:', err);
    return false;
  }
}

/**
 * Save FAQs list to backend database
 */
export async function saveCmsFaqs(items: FaqItemCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save FAQs:', err);
    return false;
  }
}

/**
 * Save History & Milestones page & items to backend database
 */
export async function saveCmsHistoryMilestones(data: HistoryMilestonesPageCMS): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/history_milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save History & Milestones:', err);
    return false;
  }
}

/**
 * Save Why Choose Us page & items to backend database
 */
export async function saveCmsWhyChooseUs(data: WhyChooseUsPageCMS): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/why_choose_us', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save Why Choose Us:', err);
    return false;
  }
}

/**
 * Fetch Exchange Rates from backend database
 */
export async function fetchCmsExchangeRates(): Promise<ExchangeRateItemCMS[] | null> {
  try {
    const res = await fetch('/api/cms/exchange_rates', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : null;
  } catch (err) {
    console.warn('Failed to fetch exchange rates:', err);
    return null;
  }
}

/**
 * Save Exchange Rates to backend database (INR fixed per NRB)
 */
export async function saveCmsExchangeRates(rates: ExchangeRateItemCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/exchange_rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save exchange rates:', err);
    return false;
  }
}

/**
 * Fetch Institutional Profiles from backend database
 */
export async function fetchCmsInstitutionalProfiles(): Promise<InstitutionalProfileItemCMS[] | null> {
  try {
    const res = await fetch('/api/cms/institutional_profiles', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : null;
  } catch (err) {
    console.warn('Failed to fetch institutional profiles:', err);
    return null;
  }
}

/**
 * Save Institutional Profiles to backend database
 */
export async function saveCmsInstitutionalProfiles(profiles: InstitutionalProfileItemCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/institutional_profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profiles),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save institutional profiles:', err);
    return false;
  }
}

/**
 * Fetch Monthly Financial Reports from backend database
 */
export async function fetchCmsMonthlyFinancialReports(): Promise<MonthlyFinancialReportCMS[] | null> {
  try {
    const res = await fetch('/api/cms/monthly_financial_reports', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : null;
  } catch (err) {
    console.warn('Failed to fetch monthly financial reports:', err);
    return null;
  }
}

/**
 * Save Monthly Financial Reports to backend database
 */
export async function saveCmsMonthlyFinancialReports(reports: MonthlyFinancialReportCMS[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/monthly_financial_reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reports),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save monthly financial reports:', err);
    return false;
  }
}

/**
 * Save CBS Member Registry to backend database
 */
export async function saveCmsMembers(members: any[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(members),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CBS members:', err);
    return false;
  }
}

/**
 * Save CBS Audit Logs to backend database
 */
export async function saveCmsAuditLogs(logs: any[]): Promise<boolean> {
  try {
    const res = await fetch('/api/cms/audit_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logs),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save CBS audit logs:', err);
    return false;
  }
}

/**
 * Fetch all CMS sections in a single unified request
 */
export async function fetchAllCmsData(): Promise<{
  pages: CmsPagesState | null;
  departments: DepartmentCMS[] | null;
  serviceCenters: ServiceCenterCMS[] | null;
  reports: ReportCMS[] | null;
  careers: CareerCMS[] | null;
  team: TeamMemberCMS[] | null;
  services: ServiceItem[] | null;
  slides: SlideCMS[] | null;
  gallery: GalleryItem[] | null;
  settings: Partial<SiteSettingsCMS> | null;
  headOffice: HeadOfficeInfoCMS | null;
  grievances: GrievanceRecordCMS[] | null;
  grievanceOfficer: GrievanceOfficerCMS | null;
  rates: InterestRate[] | null;
  notices: any[] | null;
  members: any[] | null;
  auditLogs: any[] | null;
  privacyPolicy: PrivacyPolicyCMS | null;
  socialLinks: SocialLinksCMS | null;
  theme: BrandThemeCMS | null;
  documents: DocumentItemCMS[] | null;
  newsActivities: NewsActivityItemCMS[] | null;
  suggestions: SuggestionItemCMS[] | null;
  faqs: FaqItemCMS[] | null;
  historyMilestones: HistoryMilestonesPageCMS | null;
  whyChooseUs: WhyChooseUsPageCMS | null;
  exchangeRates: ExchangeRateItemCMS[] | null;
  institutionalProfiles: InstitutionalProfileItemCMS[] | null;
  monthlyFinancialReports: MonthlyFinancialReportCMS[] | null;
}> {
  try {
    const res = await fetch(`/api/cms/all?_t=${Date.now()}`, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      return {
        pages: d.pages || null,
        departments: d.departments || null,
        serviceCenters: d.serviceCenters || null,
        reports: d.reports || null,
        careers: d.careers || null,
        team: d.team || null,
        services: d.services || null,
        slides: d.slides || null,
        gallery: d.gallery || null,
        settings: d.settings ? mapBackendSettingsToCms(d.settings) : null,
        headOffice: d.headOffice || null,
        grievances: d.grievances || null,
        grievanceOfficer: d.grievanceOfficer || null,
        rates: d.rates || null,
        notices: Array.isArray(d.notices) ? d.notices : null,
        members: Array.isArray(d.members) ? d.members : null,
        auditLogs: Array.isArray(d.auditLogs) ? d.auditLogs : null,
        privacyPolicy: d.privacyPolicy || null,
        socialLinks: d.socialLinks || null,
        theme: d.theme || null,
        documents: d.documents || null,
        newsActivities: d.newsActivities || null,
        suggestions: d.suggestions || null,
        faqs: d.faqs || null,
        historyMilestones: d.historyMilestones || null,
        whyChooseUs: d.whyChooseUs || null,
        exchangeRates: Array.isArray(d.exchangeRates) ? d.exchangeRates : null,
        institutionalProfiles: Array.isArray(d.institutionalProfiles) ? d.institutionalProfiles : null,
        monthlyFinancialReports: Array.isArray(d.monthlyFinancialReports) ? d.monthlyFinancialReports : null,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch unified CMS data:', err);
  }
  return {
    pages: null,
    departments: null,
    serviceCenters: null,
    reports: null,
    careers: null,
    team: null,
    services: null,
    slides: null,
    gallery: null,
    settings: null,
    headOffice: null,
    grievances: null,
    grievanceOfficer: null,
    rates: null,
    notices: null,
    members: null,
    auditLogs: null,
    privacyPolicy: null,
    socialLinks: null,
    theme: null,
    documents: null,
    newsActivities: null,
    suggestions: null,
    faqs: null,
    historyMilestones: null,
    whyChooseUs: null,
    exchangeRates: null,
    institutionalProfiles: null,
    monthlyFinancialReports: null,
  };
}
