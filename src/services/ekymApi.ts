import { EkymRecord, EkymFormData } from '../types';
import { INITIAL_EKYM_RECORDS } from '../data/backendData';

/**
 * Fetch all eKYM applications directly from SQLite/MySQL database via /api/ekym
 */
export async function fetchEkymApplications(): Promise<EkymRecord[]> {
  try {
    const response = await fetch('/api/ekym', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const resData = await response.json();
    if (resData.success && Array.isArray(resData.data)) {
      return resData.data;
    }

    throw new Error(resData.message || 'Invalid data format returned by server');
  } catch (error) {
    console.warn('Could not fetch from database /api/ekym:', error);
    return INITIAL_EKYM_RECORDS;
  }
}

/**
 * Submit a newly completed eKYM application to the database via /api/ekym
 */
export async function submitEkymApplication(
  record: Partial<EkymRecord>,
  formData?: EkymFormData
): Promise<EkymRecord> {
  const details = formData || record.details;
  const payload = {
    ...record,
    permProvince: record.permProvince || details?.permProvince || '',
    permDistrict: record.permDistrict || details?.permDistrict || '',
    tempProvince: record.tempProvince || (details?.sameAsPermanent ? details?.permProvince : details?.tempProvince) || '',
    tempDistrict: record.tempDistrict || (details?.sameAsPermanent ? details?.permDistrict : details?.tempDistrict) || '',
    details,
  };

  const response = await fetch('/api/ekym', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || `HTTP ${response.status}`);
  }

  const resData = await response.json();
  if (resData.success && resData.data) {
    return resData.data;
  }

  throw new Error(resData.message || 'Failed to parse database creation response');
}

/**
 * Update application status and remarks in the SQLite/MySQL database via /api/ekym/:id/status
 */
export async function updateEkymApplicationStatus(
  id: string,
  status: 'Approved' | 'Rejected' | 'Returned',
  remarks: string
): Promise<EkymRecord | null> {
  try {
    const response = await fetch(`/api/ekym/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ status, remarks }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const resData = await response.json();
    if (resData.success && resData.data) {
      return resData.data;
    }
  } catch (error) {
    console.warn(`Could not update status for #${id} on backend:`, error);
  }
  return null;
}

/**
 * Upload a document (photo, citizenship front, citizenship back) to the backend disk storage
 */
export async function uploadEkymDocument(
  file: File,
  docType: 'photo' | 'citizenship-front' | 'citizenship-back' | string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);

  const response = await fetch('/api/ekym/upload-doc', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Document upload failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (data.success && data.url) {
    return data.url;
  }
  throw new Error(data.message || 'Upload succeeded but no file URL was returned.');
}

/**
 * Search or lookup eKYM applications by application number, mobile phone, or ID
 */
export async function lookupEkymApplication(query: string): Promise<EkymRecord[]> {
  try {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const response = await fetch(`/api/ekym/search/lookup?q=${encodeURIComponent(cleanQuery)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const res = await response.json();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    }

    // Direct fetch by ID/AppNo
    const directRes = await fetch(`/api/ekym/${encodeURIComponent(cleanQuery)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (directRes.ok) {
      const data = await directRes.json();
      if (data.success && data.data) {
        return [data.data];
      }
    }
  } catch (err) {
    console.warn('Backend lookup error:', err);
  }

  return [];
}

