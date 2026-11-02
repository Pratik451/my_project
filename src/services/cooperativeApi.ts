import { InterestRate, NoticeItem, AuthUser, LoanRecord } from '../types';
import { INITIAL_LOAN_RECORDS } from '../data/backendData';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

export async function fetchLoanApplications(): Promise<LoanRecord[]> {
  try {
    const res = await fetchWithTimeout('/api/loans', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch loan applications from API:', e);
  }
  return INITIAL_LOAN_RECORDS;
}

export async function submitLoanApplicationApi(payload: {
  applicantName: string;
  phone: string;
  email?: string;
  memberCode?: string;
  citizenshipNo?: string;
  address?: string;
  province?: string;
  district?: string;
  branch?: string;
  occupation?: string;
  collateralType?: string;
  loanScheme: string;
  interestRate: number;
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
  purpose: string;
  details?: Record<string, any>;
}): Promise<{
  success: boolean;
  trackingCode: string;
  message: string;
  data?: LoanRecord;
}> {
  const res = await fetchWithTimeout('/api/loans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (res.ok && json.success) {
    const created: LoanRecord = json.data;
    return {
      success: true,
      trackingCode: json.trackingCode || created?.trackingCode || 'EKT-LN-NEW',
      message: json.message || 'Loan application submitted successfully!',
      data: created,
    };
  }
  throw new Error(json.message || 'Failed to submit loan application');
}

export async function updateLoanStatusApi(
  id: string,
  status: 'Under Review' | 'Approved' | 'Rejected' | 'Disbursed',
  remarks?: string
): Promise<LoanRecord | null> {
  try {
    const res = await fetchWithTimeout(`/api/loans/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status, remarks }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Update loan status error:', e);
  }
  return null;
}

export async function updateLoanApplicationApi(
  id: string,
  payload: Partial<LoanRecord>
): Promise<LoanRecord | null> {
  try {
    const res = await fetchWithTimeout(`/api/loans/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Update loan application error:', e);
  }
  return null;
}

export async function deleteLoanApplicationApi(id: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`/api/loans/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn('Delete loan application error:', e);
  }
  return false;
}

export interface LoanApplicationPayload {
  applicant_name: string;
  phone: string;
  email?: string;
  member_code?: string;
  citizenship_no?: string;
  address?: string;
  province?: string;
  district?: string;
  branch?: string;
  occupation?: string;
  collateral_type?: string;
  loan_scheme: string;
  interest_rate?: number;
  amount: number;
  tenure_months: number;
  monthly_income?: number;
  purpose?: string;
}

export interface MemberApplicationPayload {
  full_name: string;
  citizenship_no: string;
  phone: string;
  address: string;
  saving_scheme?: string;
  initial_deposit?: number;
}

export interface ContactMessagePayload {
  sender_name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}

/**
 * Fetch official interest rates from MySQL/SQLite via API
 */
export async function fetchInterestRates(): Promise<InterestRate[]> {
  try {
    const res = await fetchWithTimeout('/api/rates', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      // Fallback to PHP action
      const fallbackRes = await fetchWithTimeout('/api.php?action=rates', { headers: { 'Accept': 'application/json' } });
      if (!fallbackRes.ok) throw new Error(`HTTP ${fallbackRes.status}`);
      const json = await fallbackRes.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.map((r: any) => ({
          id: String(r.id),
          schemeEn: r.scheme_en || r.schemeEn,
          schemeNp: r.scheme_np || r.schemeNp,
          rate: `${r.rate_percent || r.rate}%`,
          ratePercent: Number(r.rate_percent || parseFloat(String(r.rate).replace(/[^0-9.]/g, '')) || 0),
          period: r.basis_en || r.period || 'Annual',
          category: r.category || 'Deposit',
          basisEn: r.basis_en || r.basisEn,
          basisNp: r.basis_np || r.basisNp,
          minBalance: r.min_balance !== undefined ? r.min_balance : r.minBalance
        }));
      }
      return [];
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((r: any) => ({
        id: String(r.id),
        schemeEn: r.schemeEn || r.scheme_en,
        schemeNp: r.schemeNp || r.scheme_np,
        rate: r.rate.includes('%') ? r.rate : `${r.rate}%`,
        ratePercent: r.ratePercent !== undefined ? r.ratePercent : Number(parseFloat(String(r.rate).replace(/[^0-9.]/g, '')) || 0),
        period: r.period || r.basisEn || 'Annual',
        category: r.category || 'Deposit',
        basisEn: r.basisEn || r.basis_en,
        basisNp: r.basisNp || r.basis_np,
        minBalance: r.minBalance !== undefined ? r.minBalance : (r.min_balance || 0)
      }));
    }
    throw new Error(json.message || 'Failed to parse rates');
  } catch (err) {
    console.warn('Failed to fetch rates from API, using fallback:', err);
    return [];
  }
}

/**
 * Add a new interest rate scheme to MySQL / backend database
 */
export async function createInterestRate(rate: Omit<InterestRate, 'id'>): Promise<InterestRate> {
  const res = await fetchWithTimeout('/api/rates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(rate),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create interest rate scheme');
  }
  return json.data;
}

/**
 * Update an existing interest rate scheme in MySQL / backend database
 */
export async function updateInterestRate(id: string, rate: Partial<InterestRate>): Promise<InterestRate> {
  const res = await fetchWithTimeout(`/api/rates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(rate),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update interest rate scheme');
  }
  return json.data;
}

/**
 * Delete an interest rate scheme from MySQL / backend database
 */
export async function deleteInterestRate(id: string): Promise<boolean> {
  const res = await fetchWithTimeout(`/api/rates/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete interest rate scheme');
  }
  return true;
}

/**
 * Save / synchronize full array of interest rates to database
 */
export async function saveAllInterestRates(rates: InterestRate[]): Promise<boolean> {
  try {
    const res = await fetchWithTimeout('/api/cms/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to persist all rates:', err);
    return false;
  }
}

/**
 * Fetch cooperative notices from MySQL/SQLite via API
 */
export async function fetchNotices(): Promise<NoticeItem[]> {
  try {
    const res = await fetchWithTimeout('/api/notices', {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
    const fallbackRes = await fetchWithTimeout('/api.php?action=notices', {
      headers: { 'Accept': 'application/json' }
    });
    if (!fallbackRes.ok) throw new Error(`HTTP ${fallbackRes.status}`);
    const json = await fallbackRes.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((n: any) => {
        const dateParts = (n.date_en || '').split(' ');
        return {
          id: String(n.id),
          titleEn: n.title_en || n.titleEn,
          titleNp: n.title_np || n.titleNp,
          contentEn: n.content_en || n.contentEn,
          contentNp: n.content_np || n.contentNp,
          date: n.date_en || n.date || '',
          month: dateParts[1] || 'Sep',
          day: dateParts[0] || '18',
          category: n.category_en || n.category || 'Notice'
        };
      });
    }
    throw new Error(json.message || 'Failed to parse notices');
  } catch (err) {
    console.warn('Failed to fetch notices from API:', err);
    return [];
  }
}

export async function createNoticeApi(notice: Partial<NoticeItem>): Promise<NoticeItem | null> {
  try {
    const res = await fetchWithTimeout('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(notice),
    });
    const json = await res.json();
    if (res.ok && json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Failed to create notice:', err);
  }
  return null;
}

export async function deleteNoticeApi(id: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`/api/notices/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    const json = await res.json();
    return Boolean(res.ok && json.success);
  } catch (err) {
    console.warn('Failed to delete notice:', err);
    return false;
  }
}

export async function saveAllNoticesApi(notices: NoticeItem[]): Promise<boolean> {
  try {
    const res = await fetchWithTimeout('/api/cms/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notices),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('Failed to save all notices:', err);
    return false;
  }
}

/**
 * Submit online loan application to MySQL via PHP API
 */
export async function submitLoanApplication(payload: LoanApplicationPayload): Promise<{
  success: boolean;
  message: string;
  tracking_code?: string;
}> {
  const res = await fetchWithTimeout('/api.php?action=apply_loan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Loan submission failed');
  }
  return data;
}

/**
 * Submit member application to MySQL via PHP API
 */
export async function submitMemberApplication(payload: MemberApplicationPayload): Promise<{
  success: boolean;
  message: string;
  application_no?: string;
}> {
  const res = await fetchWithTimeout('/api.php?action=apply_member', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Member application failed');
  }
  return data;
}

/**
 * Submit contact or feedback message to MySQL via PHP API
 */
export async function submitContactMessage(payload: ContactMessagePayload): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetchWithTimeout('/api.php?action=contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to send message');
  }
  return data;
}

/**
 * Member login authentication via MySQL & PHP API
 */
export async function loginMemberApi(memberCode: string, pin: string): Promise<{
  success: boolean;
  message: string;
  member?: any;
  transactions?: any[];
}> {
  const res = await fetchWithTimeout('/api.php?action=login_member', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ member_code: memberCode, pin })
  });
  return await res.json();
}

/**
 * Office staff / Admin login authentication via MySQL & PHP API
 */
export async function loginOfficeApi(username: string, password: string): Promise<{
  success: boolean;
  message: string;
  user?: AuthUser;
  dashboard?: any;
}> {
  const res = await fetchWithTimeout('/api.php?action=login_office', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username, password })
  });
  return await res.json();
}

/**
 * Fetch cooperative institutional statistics
 */
export async function fetchCoopStats(): Promise<any> {
  try {
    const res = await fetchWithTimeout('/api.php?action=stats');
    const json = await res.json();
    return json.stats;
  } catch (e) {
    return null;
  }
}
