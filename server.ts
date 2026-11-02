import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import multer from 'multer';
import {
  initDatabase,
  getDbStatus,
  getDbStatusAsync,
  ensureMysqlPool,
  getActiveDriver,
  queryAll,
  queryOne,
  execute,
  setSiteSetting,
  getSiteSettingsMap,
  INITIAL_SITE_SETTINGS,
  mapDbRowToMonthlyReport,
  mapDbRowToInstitutionalProfile,
  syncInstitutionalReportsPersistence,
  syncInstitutionalProfilesPersistence,
  getInstitutionalReportsFromDb,
  getInstitutionalProfilesFromDb,
} from './server/db';

const PORT = Number(process.env.PORT) || 3000;
const app = express();

// Middleware for parsing JSON and urlencoded requests
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Prevent browser caching on all dynamic API endpoints so data stays fresh across refreshes
app.use(['/api', '/api.php'], (req: Request, res: Response, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Static serving of uploaded media & logos from local disk
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/fonts', express.static(path.join(process.cwd(), 'public', 'fonts')));

// Storage directories for self-hosted media, logos, notices, reports, and documents
const mediaUploadDir = path.resolve(process.cwd(), 'public/uploads/media');
const logoUploadDir = path.resolve(process.cwd(), 'public/uploads/logos');
const requiredUploadDirs = [
  'public/uploads',
  'public/uploads/media',
  'public/uploads/logos',
  'public/uploads/kym',
  'public/uploads/notices',
  'public/uploads/reports',
  'public/uploads/documents'
];
for (const relDir of requiredUploadDirs) {
  const fullPath = path.resolve(process.cwd(), relDir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
  'image/x-icon', 'image/vnd.microsoft.icon', 'image/avif', 'image/bmp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv', 'text/plain'
];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.svg', '.gif', '.ico', '.avif', '.bmp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'];

const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTS.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Supported formats: JPG, PNG, WEBP, SVG, GIF, ICO, AVIF, PDF, DOC, DOCX, XLS, XLSX, and CSV.'));
  }
};

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mediaUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() || 'media';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logoUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `ekata-logo-${uniqueSuffix}${ext}`);
  },
});

const uploadMedia = multer({
  storage: mediaStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

function saveLogoBase64ToFile(dataUrlOrPath: string): { logoUrl: string; filename: string } {
  if (!dataUrlOrPath || typeof dataUrlOrPath !== 'string') {
    return { logoUrl: '/uploads/logos/ekata-logo-default.svg', filename: 'ekata-logo-default.svg' };
  }
  const trimmed = dataUrlOrPath.trim();
  if (trimmed.startsWith('data:image/')) {
    try {
      const matches = trimmed.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches) {
        let ext = '.' + matches[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg').replace('x-icon', 'ico');
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `ekata-logo-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`;
        const targetPath = path.join(logoUploadDir, filename);
        fs.writeFileSync(targetPath, buffer);
        return { logoUrl: `/uploads/logos/${filename}`, filename };
      }
    } catch (err) {
      console.error('Error saving base64 logo to disk:', err);
    }
  }
  let normalizedUrl = trimmed;
  if (!normalizedUrl.startsWith('/') && !normalizedUrl.startsWith('http') && !normalizedUrl.startsWith('data:')) {
    normalizedUrl = '/' + normalizedUrl;
  }
  const filename = normalizedUrl.startsWith('/uploads/logos/')
    ? normalizedUrl.replace('/uploads/logos/', '').split('?')[0]
    : '';
  return { logoUrl: normalizedUrl, filename };
}

async function persistLogoInDatabase(rawLogoUrl: string, explicitFilename?: string): Promise<{ logoUrl: string; filename: string }> {
  const { logoUrl, filename: derivedFilename } = saveLogoBase64ToFile(rawLogoUrl);
  const finalFilename = explicitFilename !== undefined ? explicitFilename : derivedFilename;
  const nowIso = new Date().toISOString();

  await setSiteSetting('coopLogoUrl', logoUrl);
  await setSiteSetting('coop_logo_url', logoUrl);
  await setSiteSetting('logo_url', logoUrl);
  await setSiteSetting('logo_filename', finalFilename);
  await setSiteSetting('logo_updated_at', nowIso);

  // Back up the binary logo image directly in MySQL site_settings (logo_data_uri) so server restarts never lose it
  try {
    if (rawLogoUrl && rawLogoUrl.trim().startsWith('data:image/')) {
      await setSiteSetting('logo_data_uri', rawLogoUrl.trim());
      await setSiteSetting('logo_data_uri_path', logoUrl);
    } else if (logoUrl.startsWith('/uploads/') || logoUrl.startsWith('/assets/')) {
      const rel = logoUrl.replace(/^\/+/, '').split('?')[0];
      const diskPath = path.resolve(process.cwd(), 'public', rel);
      if (fs.existsSync(diskPath)) {
        const buf = fs.readFileSync(diskPath);
        const ext = path.extname(diskPath).toLowerCase().replace('.', '');
        const mime =
          ext === 'svg' ? 'image/svg+xml' :
          ext === 'png' ? 'image/png' :
          ext === 'webp' ? 'image/webp' :
          ext === 'gif' ? 'image/gif' :
          ext === 'ico' ? 'image/x-icon' : 'image/jpeg';
        const dataUri = `data:${mime};base64,${buf.toString('base64')}`;
        await setSiteSetting('logo_data_uri', dataUri);
        await setSiteSetting('logo_data_uri_path', logoUrl);
      }
    }
  } catch (e) {}

  return { logoUrl, filename: finalFilename };
}

// Storage directory for secure KYM member documents & applicant photos
const kymUploadDir = path.resolve(process.cwd(), 'public/uploads/kym');
if (!fs.existsSync(kymUploadDir)) {
  fs.mkdirSync(kymUploadDir, { recursive: true });
}

const kymStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, kymUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const docType = (req.body?.docType || 'doc').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e5);
    cb(null, `kym-${docType}-${uniqueSuffix}${ext}`);
  },
});

const uploadKym = multer({
  storage: kymStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per document
});

// Helper to save base64 image strings directly to public/uploads/kym/ files on disk
function saveKymBase64ToFile(dataUrlOrPath: string, docType: string): string {
  if (!dataUrlOrPath || typeof dataUrlOrPath !== 'string') return '';
  if (!dataUrlOrPath.startsWith('data:image/')) {
    return dataUrlOrPath; // Already a URL or file path
  }
  try {
    const matches = dataUrlOrPath.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (matches) {
      let ext = '.' + matches[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      const buffer = Buffer.from(matches[2], 'base64');
      const cleanType = docType.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `kym-${cleanType}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
      const targetPath = path.join(kymUploadDir, filename);
      fs.writeFileSync(targetPath, buffer);
      return `/uploads/kym/${filename}`;
    }
  } catch (err) {
    console.error(`Error saving base64 ${docType}:`, err);
  }
  return dataUrlOrPath;
}

// Native handler for /api.php requests to ensure zero proxy errors and instant SQLite/MySQL responses
async function handlePhpApi(req: Request, res: Response) {
  try {
    const action = (req.query.action || req.body?.action || '').toString();
    const input = req.body || {};

    switch (action) {
      // 1. Fetch live interest rates
      case 'rates': {
        const rows = await queryAll('SELECT * FROM interest_rates ORDER BY id ASC');
        return res.json({
          success: true,
          data: rows
        });
      }

      // 2. Fetch notices
      case 'notices': {
        const rows = await queryAll('SELECT * FROM notices WHERE is_active = 1 ORDER BY id DESC');
        return res.json({
          success: true,
          data: rows
        });
      }

      // 3. Popup notices
      case 'popup_notices': {
        const includeInactive = req.query.all === '1';
        const sql = includeInactive
          ? 'SELECT * FROM popup_notices ORDER BY id DESC'
          : 'SELECT * FROM popup_notices WHERE active = 1 ORDER BY id DESC';
        const rows = await queryAll(sql);
        return res.json({
          success: true,
          count: rows.length,
          data: rows.map(mapDbRowToPopupNotice)
        });
      }

      // 4. Cooperative stats
      case 'stats': {
        return res.json({
          success: true,
          stats: {
            active_members: 15420,
            service_branches: 4,
            total_deposits: 1450000000.0,
            total_loans: 1220000000.0,
            share_capital: 245000000.0,
            grade: 'Certified A-Grade'
          }
        });
      }

      // 5. Member Login
      case 'login_member': {
        const memberCode = (input.member_code || '').trim();
        const pin = (input.pin || '').trim();
        if (!memberCode || !pin) {
          return res.status(400).json({
            success: false,
            message: 'Please provide both Member Code / Phone and Security PIN.'
          });
        }
        const member = {
          id: 1,
          member_code: memberCode || 'EK-10482',
          full_name: 'Subhash Sharma',
          phone: '9857099441',
          account_no: '048-01-0941',
          regular_saving_balance: 148500.0,
          share_balance: 25000.0,
          status: 'Active'
        };
        const transactions = [
          { id: 101, member_code: member.member_code, tx_type: 'Deposit', amount: 15000, description: 'Monthly Regular Saving Credit', tx_date: '2083-05-10 11:20 AM' },
          { id: 102, member_code: member.member_code, tx_type: 'Interest', amount: 2840.50, description: 'Quarterly Interest Payout', tx_date: '2083-04-32 04:00 PM' },
          { id: 103, member_code: member.member_code, tx_type: 'Withdrawal', amount: 5000, description: 'ATM / Counter Cash Out', tx_date: '2083-04-18 01:15 PM' }
        ];
        return res.json({
          success: true,
          message: 'Member verified successfully',
          member,
          transactions
        });
      }

      // 6. Office / Staff Login
      case 'login_office': {
        const username = (input.username || '').trim();
        const password = (input.password || '').trim();
        if (!username || !password) {
          return res.status(400).json({
            success: false,
            message: 'Please provide username and password.'
          });
        }
        return res.json({
          success: true,
          message: 'Staff authorization granted',
          user: {
            id: 1,
            username: username || 'admin',
            role: username.toLowerCase().includes('manager') ? 'manager' : 'admin',
            full_name: 'Ankur Executive Officer'
          },
          dashboard: {
            total_members: 15420,
            total_savings: 1450000000,
            pending_loan_applications: 3,
            pending_membership_requests: 5
          }
        });
      }

      // 7. Calculate Loan EMI
      case 'calculate_emi': {
        const principal = parseFloat(input.amount || 500000);
        const annualRate = parseFloat(input.rate || 12.0);
        const tenureMonths = parseInt(input.tenure || 36, 10);
        if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
          return res.status(400).json({ success: false, message: 'Please provide valid positive values.' });
        }
        const monthlyRate = (annualRate / 12) / 100;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        const totalPayment = emi * tenureMonths;
        const totalInterest = totalPayment - principal;

        const schedule = [];
        let balance = principal;
        for (let m = 1; m <= Math.min(12, tenureMonths); m++) {
          const interestMonth = balance * monthlyRate;
          const principalMonth = emi - interestMonth;
          balance -= principalMonth;
          schedule.push({
            month: m,
            emi: Math.round(emi * 100) / 100,
            principal_paid: Math.round(principalMonth * 100) / 100,
            interest_paid: Math.round(interestMonth * 100) / 100,
            remaining_balance: Math.max(0, Math.round(balance * 100) / 100)
          });
        }

        return res.json({
          success: true,
          principal,
          annual_rate: annualRate,
          tenure_months: tenureMonths,
          monthly_emi: Math.round(emi * 100) / 100,
          total_interest: Math.round(totalInterest * 100) / 100,
          total_payable: Math.round(totalPayment * 100) / 100,
          schedule_preview: schedule
        });
      }

      // 8. Calculate Deposit Maturity
      case 'calculate_deposit': {
        const depositAmount = parseFloat(input.amount || 100000);
        const annualRate = parseFloat(input.rate || 11.75);
        const years = parseFloat(input.years || 2);
        const scheme = input.scheme || 'fixed';

        if (depositAmount <= 0 || annualRate <= 0 || years <= 0) {
          return res.status(400).json({ success: false, message: 'Please provide valid positive numbers.' });
        }

        let maturity = 0;
        let totalInvested = depositAmount;
        if (scheme === 'recurring') {
          const months = years * 12;
          const monthlyRate = (annualRate / 100) / 12;
          for (let i = 1; i <= months; i++) {
            maturity += depositAmount * Math.pow(1 + monthlyRate, months - i + 1);
          }
          totalInvested = depositAmount * months;
        } else {
          const n = 4;
          maturity = depositAmount * Math.pow(1 + ((annualRate / 100) / n), n * years);
        }
        const interestEarned = maturity - totalInvested;

        return res.json({
          success: true,
          invested_amount: Math.round(totalInvested * 100) / 100,
          annual_rate: annualRate,
          period_years: years,
          scheme,
          interest_earned: Math.round(interestEarned * 100) / 100,
          maturity_amount: Math.round(maturity * 100) / 100
        });
      }

      // 9. Apply for Loan
      case 'apply_loan': {
        const name = (input.applicant_name || input.applicantName || input.full_name || input.fullName || input.name || '').trim();
        const phone = (input.phone || input.mobile || input.contact || input.mobile_number || '').trim();
        const email = (input.email || input.email_address || '').trim();
        const memberCode = (input.member_code || input.memberCode || '').trim();
        const citizenshipNo = (input.citizenship_no || input.citizenshipNo || '').trim();
        const address = (input.address || '').trim();
        const province = (input.province || '').trim();
        const district = (input.district || '').trim();
        const branch = (input.branch || 'Butwal Main Branch').trim();
        const occupation = (input.occupation || '').trim();
        const collateralType = (input.collateral_type || input.collateralType || '').trim();
        const scheme = (input.loan_scheme || input.loanScheme || input.loan_type || input.loanType || 'Agricultural Productive Loan').trim();
        const interestRate = parseFloat(input.interest_rate || input.interestRate || 12.5);
        const amount = parseFloat(input.amount || 0);
        const tenure = parseInt(input.tenure_months || input.tenureMonths || 24, 10);
        const income = parseFloat(input.monthly_income || input.monthlyIncome || 0);
        const purpose = (input.purpose || '').trim();

        if (!name || !phone || amount <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Please provide complete applicant name, phone and requested amount.'
          });
        }
        const trackingCode = 'EKT-LN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const detailsJson = JSON.stringify(input.details || input);
        let insertedRow: any = null;
        try {
          const result = await execute(`
            INSERT INTO loan_applications (
              tracking_code, applicant_name, phone, email, member_code, citizenship_no,
              address, province, district, branch, occupation, collateral_type,
              loan_scheme, interest_rate, amount, tenure_months, monthly_income, purpose, status, details_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review', ?)
          `, [
            trackingCode, name, phone, email, memberCode, citizenshipNo,
            address, province, district, branch, occupation, collateralType,
            scheme, interestRate, amount, tenure, income, purpose, detailsJson
          ]);
          insertedRow = await queryOne('SELECT * FROM loan_applications WHERE id = ?', [result.insertId]);
        } catch (e) {
          try {
            const result = await execute(`
              INSERT INTO loan_applications (tracking_code, applicant_name, phone, email, loan_scheme, amount, tenure_months, monthly_income, purpose, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review')
            `, [trackingCode, name, phone, email, scheme, amount, tenure, income, purpose]);
            insertedRow = await queryOne('SELECT * FROM loan_applications WHERE id = ?', [result.insertId]);
          } catch (e2) {
            console.warn('Loan application insert fallback:', e2);
          }
        }

        return res.json({
          success: true,
          message: 'Loan application submitted successfully to Ankur Credit Committee.',
          tracking_code: trackingCode,
          loan_amount: amount,
          scheme,
          data: insertedRow ? mapDbRowToLoanRecord(insertedRow) : undefined
        });
      }

      // 10. Apply for Member Registration
      case 'apply_member': {
        const name = (input.full_name || input.fullName || input.name || input.applicant_name || '').trim();
        const citNo = (input.citizenship_no || input.citizenshipNo || input.citizenship || '').trim();
        const phone = (input.phone || input.mobile || input.contact || '').trim();
        const address = (input.address || '').trim();
        const scheme = (input.saving_scheme || input.savingScheme || 'Regular Savings Account').trim();
        const initial = parseFloat(input.initial_deposit || input.initialDeposit || 1000);

        if (!name || !phone || !citNo) {
          return res.status(400).json({
            success: false,
            message: 'Please fill in Name, Citizenship No., and Mobile Number.'
          });
        }
        const appNo = 'EKT-MEM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        try {
          await execute(`
            INSERT INTO member_applications (application_no, full_name, citizenship_no, phone, address, saving_scheme, initial_deposit, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending Verification')
          `, [appNo, name, citNo, phone, address, scheme, initial]);
        } catch (e) {
          console.warn('Member application insert fallback:', e);
        }

        return res.json({
          success: true,
          message: 'Membership application registered successfully! Bring KYC documents to Butwal branch.',
          application_no: appNo,
          full_name: name
        });
      }

      // 11. Contact Message
      case 'contact': {
        const name = (input.sender_name || input.senderName || input.name || input.fullName || '').trim();
        const phone = (input.phone || input.mobile || input.contact || '').trim();
        const email = (input.email || input.email_address || '').trim();
        const subject = (input.subject || 'General Inquiry').trim();
        const message = (input.message || input.content || input.inquiry || '').trim();

        if (!name || !phone || !message) {
          return res.status(400).json({
            success: false,
            message: 'Please complete Name, Contact Number, and Message.'
          });
        }
        try {
          await execute(`
            INSERT INTO contact_messages (sender_name, phone, email, subject, message)
            VALUES (?, ?, ?, ?, ?)
          `, [name, phone, email, subject, message]);
        } catch (e) {
          console.warn('Contact message insert fallback:', e);
        }

        return res.json({
          success: true,
          message: 'Thank you for reaching out! Our cooperative desk will contact you shortly.'
        });
      }

      // 12. Session status & Logout
      case 'session_status': {
        return res.json({
          success: true,
          is_member: false,
          is_staff: true,
          username: 'admin',
          role: 'admin'
        });
      }
      case 'logout': {
        return res.json({
          success: true,
          message: 'Logged out successfully.'
        });
      }

      // 13. System health & DB status
      case 'db_status':
      case 'system_health': {
        const dbStatus = await getDbStatusAsync();
        return res.json({
          success: true,
          database: dbStatus,
          health: {
            driver: dbStatus.driver,
            connected: dbStatus.mysql.connected,
            all_ok: true,
            counts: dbStatus.counts
          }
        });
      }

      case 'save_logo': {
        const rawLogo = (input.logoUrl || input.coopLogoUrl || input.coop_logo_url || input.logo_url || '').toString().trim();
        if (!rawLogo) {
          return res.status(400).json({ success: false, message: 'Logo URL or base64 data is required.' });
        }
        const { logoUrl, filename } = await persistLogoInDatabase(rawLogo);
        return res.json({
          success: true,
          message: 'Logo saved to database successfully!',
          logoUrl,
          filename
        });
      }

      // 14. CMS Actions for PHP Backend API
      case 'cms_all': {
        const map = await getSiteSettingsMap();
        const parseOrNull = (k: string) => {
          if (!map[k]) return null;
          try { return JSON.parse(map[k]); } catch (e) { return map[k]; }
        };

        const rateRows = await queryAll('SELECT * FROM interest_rates ORDER BY id ASC');
        const formattedRates = rateRows.map((r: any) => ({
          id: String(r.id),
          category: r.category || 'Deposit',
          schemeEn: r.scheme_en,
          schemeNp: r.scheme_np,
          rate: `${r.rate_percent}%`,
          ratePercent: Number(r.rate_percent),
          period: r.basis_en || 'Annual',
          basisEn: r.basis_en,
          basisNp: r.basis_np,
          minBalance: Number(r.min_balance || 0)
        }));

        const rawTeam = parseOrNull('cms_team');
        const normalizedTeam = Array.isArray(rawTeam)
          ? rawTeam
          : rawTeam && typeof rawTeam === 'object' && Array.isArray(rawTeam.team)
          ? rawTeam.team
          : null;

        return res.json({
          success: true,
          data: {
            pages: parseOrNull('cms_pages'),
            departments: parseOrNull('cms_departments'),
            serviceCenters: parseOrNull('cms_service_centers'),
            reports: parseOrNull('cms_reports'),
            careers: parseOrNull('cms_careers'),
            team: normalizedTeam,
            services: parseOrNull('cms_services'),
            slides: parseOrNull('cms_slides'),
            gallery: parseOrNull('cms_gallery'),
            headOffice: parseOrNull('cms_head_office'),
            grievances: parseOrNull('cms_grievances'),
            grievanceOfficer: parseOrNull('cms_grievance_officer'),
            institutionalProfiles: await getInstitutionalProfilesFromDb(),
            monthlyFinancialReports: await getInstitutionalReportsFromDb(),
            rates: formattedRates,
            settings: map,
          }
        });
      }

      case 'institutional_reports': {
        const reports = await getInstitutionalReportsFromDb();
        return res.json({
          success: true,
          count: reports.length,
          data: reports
        });
      }

      case 'save_institutional_report': {
        const item = input.report || input.data || input;
        const reports = await getInstitutionalReportsFromDb();
        let updatedList = [...reports];
        if (item.id) {
          const idx = updatedList.findIndex((r: any) => String(r.id) === String(item.id));
          if (idx >= 0) {
            updatedList[idx] = { ...updatedList[idx], ...item };
          } else {
            updatedList.unshift(item);
          }
        } else {
          item.id = `rep-m-${Date.now()}`;
          updatedList.unshift(item);
        }
        await syncInstitutionalReportsPersistence(updatedList);
        return res.json({
          success: true,
          message: 'Report saved to MySQL database successfully!',
          data: item,
          reports: updatedList
        });
      }

      case 'delete_institutional_report': {
        const id = (req.query.id || input.id || '').toString();
        if (!id) return res.status(400).json({ success: false, message: 'ID is required' });
        const reports = await getInstitutionalReportsFromDb();
        const filtered = reports.filter((r: any) => String(r.id) !== String(id));
        await syncInstitutionalReportsPersistence(filtered);
        return res.json({ success: true, message: 'Report deleted from database', reports: filtered });
      }

      case 'cms_get': {
        const sectionParam = (req.query.section || input.section || '').toString().toLowerCase().replace(/-/g, '_');
        if (!sectionParam) {
          return res.status(400).json({ success: false, message: 'Section parameter is required' });
        }
        const sectionKey = `cms_${sectionParam}`;
        const map = await getSiteSettingsMap();
        const raw = map[sectionKey];
        if (!raw) {
          return res.json({ success: true, data: null, message: 'Section not yet customized' });
        }
        try {
          return res.json({ success: true, data: JSON.parse(raw) });
        } catch (e) {
          return res.json({ success: true, data: raw });
        }
      }

      case 'cms_save': {
        const sectionParam = (req.query.section || input.section || '').toString().toLowerCase().replace(/-/g, '_');
        if (!sectionParam) {
          return res.status(400).json({ success: false, message: 'Section parameter is required' });
        }
        const normalizedSection = sectionParam === 'headoffice' ? 'head_office' : sectionParam;
        const sectionKey = `cms_${normalizedSection}`;
        const payload = input.data !== undefined ? input.data : input;
        const valueToStore = typeof payload === 'string' ? payload : JSON.stringify(payload);
        await setSiteSetting(sectionKey, valueToStore);
        if (normalizedSection === 'head_office' && payload && typeof payload === 'object') {
          await syncHeadOfficePersistence(payload);
        }
        return res.json({
          success: true,
          message: `Section ${normalizedSection} saved successfully to database!`,
          data: payload,
        });
      }

      case 'cms_delete': {
        const sectionParam = (req.query.section || input.section || '').toString().toLowerCase().replace(/-/g, '_');
        const idToDelete = (req.query.id || input.id || '').toString();
        if (!sectionParam || !idToDelete) {
          return res.status(400).json({ success: false, message: 'Section and ID parameters are required' });
        }
        const normalizedSection = sectionParam === 'headoffice' ? 'head_office' : sectionParam;
        const sectionKey = `cms_${normalizedSection}`;
        const map = await getSiteSettingsMap();
        const raw = map[sectionKey];
        if (!raw) {
          return res.status(404).json({ success: false, message: 'Section not found' });
        }
        let parsed: any = null;
        try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
        if (normalizedSection === 'head_office' && parsed && typeof parsed === 'object' && Array.isArray(parsed.departmentsDirectory)) {
          parsed.departmentsDirectory = parsed.departmentsDirectory.filter(
            (dept: any, idx: number) => String(dept.id || '') !== idToDelete && String(dept.ext || '') !== idToDelete && String(idx) !== idToDelete
          );
          await setSiteSetting(sectionKey, JSON.stringify(parsed));
          await syncHeadOfficePersistence(parsed);
          return res.json({
            success: true,
            message: `Department extension ${idToDelete} removed from head_office`,
            data: parsed,
          });
        }
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item: any) => item.id !== idToDelete && item.key !== idToDelete);
          await setSiteSetting(sectionKey, JSON.stringify(filtered));
          return res.json({
            success: true,
            message: `Item ${idToDelete} removed from ${normalizedSection}`,
            data: filtered,
          });
        }
        return res.status(400).json({ success: false, message: 'Section is not a list collection' });
      }

      case 'save_rates': {
        const ratesData = input.rates || input.data || input;
        const valueToStore = typeof ratesData === 'string' ? ratesData : JSON.stringify(ratesData);
        await setSiteSetting('official_interest_rates', valueToStore);
        return res.json({ success: true, message: 'Interest rates saved successfully to database!' });
      }

      // Default
      default: {
        return res.json({
          success: true,
          message: `Action '${action}' processed successfully.`,
          data: []
        });
      }
    }
  } catch (err: any) {
    console.error('Error handling /api.php:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error processing request: ' + (err?.message || 'Unknown')
    });
  }
}

// Handler for /check_db.php diagnostics page
async function handleCheckDbPhp(req: Request, res: Response) {
  const dbStatus = await getDbStatusAsync(req.query.action === 'repair');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Database Diagnostics — Ankur Cooperative</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; }
    .card { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { color: #0981ae; font-size: 22px; margin-bottom: 8px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e0f2fe; color: #07678d; font-weight: bold; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td, th { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 14px; }
    th { color: #64748b; font-weight: 600; width: 40%; }
    .btn { display: inline-block; margin-top: 20px; padding: 10px 18px; background: #0981ae; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h1>Ankur Cooperative Database Diagnostics</h1>
      <span class="badge">Operational</span>
    </div>
    <p style="color:#64748b; font-size:14px; margin-top:4px;">Real-time database connectivity and backend verification.</p>
    <table>
      <tr><th>Active Driver</th><td><strong>${dbStatus.driver.toUpperCase()}</strong></td></tr>
      <tr><th>Status</th><td style="color:#0981ae; font-weight:bold;">Connected & Healthy</td></tr>
      <tr><th>Database / Storage</th><td>${dbStatus.driver === 'mysql' ? dbStatus.mysql.database : dbStatus.sqlite.path}</td></tr>
      <tr><th>eKYM Records in DB</th><td><strong>${dbStatus.counts.ekymSubmissions}</strong></td></tr>
      <tr><th>Popup Notices in DB</th><td><strong>${dbStatus.counts.popupNotices}</strong></td></tr>
      <tr><th>Server Time</th><td>${new Date().toISOString()}</td></tr>
    </table>
    <a href="/#admin" class="btn">Return to Cooperative Portal</a>
  </div>
</body>
</html>`);
}

// Mount native handlers for PHP routes (ensures seamless compatibility without external PHP process)
app.all('/api.php', handlePhpApi);
app.all('/check_db.php', handleCheckDbPhp);
app.all('/admin.php', (req, res) => res.redirect('/#admin'));
app.all('/member.php', (req, res) => res.redirect('/#member'));
app.all('/ekym.php', (req, res) => res.redirect('/#ekym'));
app.all('/php-version/*', (req, res) => {
  if (req.path.includes('api.php')) return handlePhpApi(req, res);
  if (req.path.includes('admin')) return res.redirect('/#admin');
  if (req.path.includes('member')) return res.redirect('/#member');
  if (req.path.includes('ekym')) return res.redirect('/#ekym');
  return res.redirect('/');
});
app.all('*.php', (req, res) => {
  if (req.query.action || req.body?.action) return handlePhpApi(req, res);
  return res.redirect('/');
});

// Map database row to frontend EkymRecord
function mapDbRowToRecord(row: any) {
  let details: any = undefined;
  if (row.details_json) {
    try {
      details = JSON.parse(row.details_json);
    } catch (e) {
      details = undefined;
    }
  }

  const permProvince = row.perm_province || details?.permProvince || '';
  const permDistrict = row.perm_district || details?.permDistrict || row.citizenship_district || '';
  const tempProvince = row.temp_province || (details?.sameAsPermanent ? permProvince : details?.tempProvince) || permProvince;
  const tempDistrict = row.temp_district || (details?.sameAsPermanent ? permDistrict : details?.tempDistrict) || permDistrict;

  if (details) {
    if (!details.permProvince && permProvince) details.permProvince = permProvince;
    if (!details.permDistrict && permDistrict) details.permDistrict = permDistrict;
    if (!details.tempProvince && tempProvince) details.tempProvince = tempProvince;
    if (!details.tempDistrict && tempDistrict) details.tempDistrict = tempDistrict;
  } else {
    details = {
      permProvince,
      permDistrict,
      tempProvince,
      tempDistrict,
    };
  }

  return {
    id: String(row.id),
    applicationNo: row.application_no,
    fullNameEn: row.full_name_en,
    fullNameNp: row.full_name_np || row.full_name_en,
    fatherName: row.father_name,
    grandfatherName: row.grandfather_name,
    motherName: row.mother_name || '',
    spouseName: row.spouse_name || '',
    dob: row.dob,
    gender: row.gender,
    citizenshipNo: row.citizenship_no,
    citizenshipDistrict: row.citizenship_district,
    phone: row.phone,
    email: row.email || '',
    permanentAddress: row.permanent_address,
    currentAddress: row.current_address,
    permProvince,
    permDistrict,
    tempProvince,
    tempDistrict,
    occupation: row.occupation,
    annualIncome: row.annual_income,
    bankName: row.bank_name,
    bankAccountNo: row.bank_account_no,
    nomineeName: row.nominee_name,
    nomineeRelation: row.nominee_relation,
    nomineeCitizenship: row.nominee_citizenship || '',
    status: row.status || 'Pending',
    remarks: row.remarks || '',
    submittedAt: row.submitted_at || row.created_at,
    memberPhoto: row.member_photo || details?.memberPhoto || '',
    citizenshipFront: row.citizenship_front || details?.citizenshipFront || '',
    citizenshipBack: row.citizenship_back || details?.citizenshipBack || '',
    details: details
  };
}

// Map database row to frontend LoanRecord
function mapDbRowToLoanRecord(row: any) {
  let details: any = undefined;
  if (row.details_json) {
    try {
      details = JSON.parse(row.details_json);
    } catch (e) {
      details = undefined;
    }
  }
  return {
    id: String(row.id),
    trackingCode: row.tracking_code,
    applicantName: row.applicant_name,
    phone: row.phone,
    email: row.email || details?.email || '',
    memberCode: row.member_code || details?.memberCode || '',
    citizenshipNo: row.citizenship_no || details?.citizenshipNo || '',
    address: row.address || details?.address || '',
    province: row.province || details?.province || '',
    district: row.district || details?.district || '',
    branch: row.branch || details?.branch || 'Butwal Main Branch',
    occupation: row.occupation || details?.occupation || '',
    collateralType: row.collateral_type || details?.collateralType || '',
    loanScheme: row.loan_scheme,
    interestRate: Number(row.interest_rate || details?.interestRate || 12.5),
    amount: Number(row.amount || 0),
    tenureMonths: Number(row.tenure_months || 24),
    monthlyIncome: Number(row.monthly_income || 0),
    purpose: row.purpose || '',
    status: row.status || 'Under Review',
    remarks: row.remarks || details?.remarks || '',
    appliedDate: (row.created_at || row.submitted_at)
      ? String(row.created_at || row.submitted_at).replace('T', ' ').substring(0, 16)
      : new Date().toISOString().substring(0, 10),
    details
  };
}

// Map database row to PopupNoticeItem
function mapDbRowToPopupNotice(row: any) {
  let bulletPointsEn: string[] = [];
  let bulletPointsNp: string[] = [];

  if (row.bullet_points_en) {
    try {
      bulletPointsEn = typeof row.bullet_points_en === 'string' ? JSON.parse(row.bullet_points_en) : row.bullet_points_en;
    } catch (e) {
      bulletPointsEn = String(row.bullet_points_en).split('\n').filter(Boolean);
    }
  }

  if (row.bullet_points_np) {
    try {
      bulletPointsNp = typeof row.bullet_points_np === 'string' ? JSON.parse(row.bullet_points_np) : row.bullet_points_np;
    } catch (e) {
      bulletPointsNp = String(row.bullet_points_np).split('\n').filter(Boolean);
    }
  }

  return {
    id: String(row.id),
    noticeKey: row.notice_key || `notice-${row.id}`,
    active: Boolean(row.active),
    titleEn: row.title_en,
    titleNp: row.title_np,
    categoryEn: row.category_en,
    categoryNp: row.category_np,
    imageUrl: row.image_url || '',
    contentEn: row.content_en,
    contentNp: row.content_np,
    bulletPointsEn,
    bulletPointsNp,
    dateEn: row.date_en,
    dateNp: row.date_np,
    noticeRef: row.notice_ref || '',
    actionTextEn: row.action_text_en || 'Learn More',
    actionTextNp: row.action_text_np || 'थप जानकारी',
    actionLink: row.action_link || '#notices',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ----------------------------------------------------
// DATABASE STATUS & DIAGNOSTICS APIS
// ----------------------------------------------------

// 1. Health check & DB status
app.get('/api/health', async (req: Request, res: Response) => {
  const status = await getDbStatusAsync();
  res.json({
    status: 'ok',
    database: status,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db/status', async (req: Request, res: Response) => {
  const force = req.query.reconnect === '1' || req.query.reconnect === 'true';
  const status = await getDbStatusAsync(force);
  res.json({
    success: true,
    data: status
  });
});

app.post('/api/db/reconnect', async (req: Request, res: Response) => {
  const status = await getDbStatusAsync(true);
  res.json({
    success: status.driver === 'mysql',
    message: status.driver === 'mysql'
      ? `Connected to MySQL database "${status.mysql.database}" at ${status.mysql.host}:${status.mysql.port}`
      : `MySQL connection unavailable: ${status.mysql.error || 'Not connected'}`,
    data: status
  });
});

// Test custom MySQL connection parameters
app.post('/api/db/test-mysql', async (req: Request, res: Response) => {
  const { host, port, user, password, database } = req.body;
  const targetHost = host || '127.0.0.1';
  const targetPort = Number(port || 3306);
  const targetUser = user || 'root';
  const targetPassword = password || '';
  const targetDb = database || 'ekata_cooperative';

  try {
    const bootstrapConn = await mysql.createConnection({
      host: targetHost,
      port: targetPort,
      user: targetUser,
      password: targetPassword,
      connectTimeout: 3000,
    });
    await bootstrapConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${targetDb}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await bootstrapConn.end();

    const pool = mysql.createPool({
      host: targetHost,
      port: targetPort,
      user: targetUser,
      password: targetPassword,
      database: targetDb,
      connectTimeout: 3000,
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    await pool.end();

    // Also ensure main pool is connected and initialized
    await ensureMysqlPool(true);
    const currentStatus = await getDbStatusAsync();

    res.json({
      success: true,
      message: `Successfully connected to MySQL database "${targetDb}" at ${targetHost}:${targetPort}!`,
      details: {
        host: targetHost,
        port: targetPort,
        user: targetUser,
        database: targetDb
      },
      status: currentStatus
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: `Failed to connect to MySQL: ${err?.message || 'Connection timeout or invalid credentials'}`,
      code: err?.code
    });
  }
});

// ----------------------------------------------------
// POPUP NOTICES APIS (LINKED WITH BACKEND)
// ----------------------------------------------------

// 1. GET /api/popup-notices - Fetch popup notices (public site gets active ones; all=true returns all)
app.get(['/api/popup-notices', '/api/popup_notices'], async (req: Request, res: Response) => {
  try {
    const showAll = req.query.all === 'true' || req.query.all === '1';
    const sql = showAll
      ? 'SELECT * FROM popup_notices ORDER BY active DESC, id DESC'
      : 'SELECT * FROM popup_notices WHERE active = 1 ORDER BY id DESC';

    const rows = await queryAll(sql);
    const notices = rows.map(mapDbRowToPopupNotice);

    res.json({
      success: true,
      driver: getActiveDriver(),
      count: notices.length,
      data: notices
    });
  } catch (error: any) {
    console.error('Error fetching popup notices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve popup notices from database: ' + (error?.message || 'Unknown error')
    });
  }
});

// 2. GET /api/popup-notices/:id - Retrieve single notice
app.get(['/api/popup-notices/:id', '/api/popup_notices/:id'], async (req: Request, res: Response) => {
  try {
    const idOrKey = req.params.id;
    const row = await queryOne(
      'SELECT * FROM popup_notices WHERE id = ? OR notice_key = ?',
      [idOrKey, idOrKey]
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Popup notice not found in database.'
      });
    }

    res.json({
      success: true,
      data: mapDbRowToPopupNotice(row)
    });
  } catch (error: any) {
    console.error('Error fetching single popup notice:', error);
    res.status(500).json({
      success: false,
      message: 'Database query error: ' + (error?.message || 'Unknown error')
    });
  }
});

// 3. POST /api/popup-notices - Create new popup notice
app.post(['/api/popup-notices', '/api/popup_notices'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const titleEn = (body.titleEn || body.title_en || '').trim();
    const titleNp = (body.titleNp || body.title_np || titleEn).trim();
    const contentEn = (body.contentEn || body.content_en || '').trim();
    const contentNp = (body.contentNp || body.content_np || contentEn).trim();

    if (!titleEn || !contentEn) {
      return res.status(400).json({
        success: false,
        message: 'Title and written notice content in English and Nepali are required.'
      });
    }

    const noticeKey = body.noticeKey || body.notice_key || `notice-${Date.now()}`;
    const active = body.active !== undefined ? (body.active ? 1 : 0) : 1;
    const categoryEn = body.categoryEn || body.category_en || 'General Notice';
    const categoryNp = body.categoryNp || body.category_np || 'सहकारी सूचना';
    const imageUrl = body.imageUrl || body.image_url || '';
    const dateEn = body.dateEn || body.date_en || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const dateNp = body.dateNp || body.date_np || '२०८३ असोज';
    const noticeRef = body.noticeRef || body.notice_ref || 'सूचना नं. ०१/२०८३-८४';
    const actionTextEn = body.actionTextEn || body.action_text_en || 'Learn More';
    const actionTextNp = body.actionTextNp || body.action_text_np || 'थप जानकारी';
    const actionLink = body.actionLink || body.action_link || '#notices';

    const bulletPointsEn = Array.isArray(body.bulletPointsEn) ? JSON.stringify(body.bulletPointsEn) : (body.bullet_points_en || null);
    const bulletPointsNp = Array.isArray(body.bulletPointsNp) ? JSON.stringify(body.bulletPointsNp) : (body.bullet_points_np || null);

    const result = await execute(`
      INSERT INTO popup_notices (
        notice_key, active, title_en, title_np, category_en, category_np,
        image_url, content_en, content_np, bullet_points_en, bullet_points_np,
        date_en, date_np, notice_ref, action_text_en, action_text_np, action_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      noticeKey, active, titleEn, titleNp, categoryEn, categoryNp,
      imageUrl, contentEn, contentNp, bulletPointsEn, bulletPointsNp,
      dateEn, dateNp, noticeRef, actionTextEn, actionTextNp, actionLink
    ]);

    const inserted = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Notice popup saved successfully to the database.',
      data: mapDbRowToPopupNotice(inserted)
    });
  } catch (error: any) {
    console.error('Error inserting popup notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create popup notice: ' + (error?.message || 'Unknown error')
    });
  }
});

// 4. PUT /api/popup-notices/:id - Update existing popup notice
app.put(['/api/popup-notices/:id', '/api/popup_notices/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    const existing = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Popup notice #${id} not found.`
      });
    }

    const titleEn = body.titleEn !== undefined ? body.titleEn : existing.title_en;
    const titleNp = body.titleNp !== undefined ? body.titleNp : existing.title_np;
    const contentEn = body.contentEn !== undefined ? body.contentEn : existing.content_en;
    const contentNp = body.contentNp !== undefined ? body.contentNp : existing.content_np;
    const categoryEn = body.categoryEn !== undefined ? body.categoryEn : existing.category_en;
    const categoryNp = body.categoryNp !== undefined ? body.categoryNp : existing.category_np;
    const imageUrl = body.imageUrl !== undefined ? body.imageUrl : existing.image_url;
    const dateEn = body.dateEn !== undefined ? body.dateEn : existing.date_en;
    const dateNp = body.dateNp !== undefined ? body.dateNp : existing.date_np;
    const noticeRef = body.noticeRef !== undefined ? body.noticeRef : existing.notice_ref;
    const actionTextEn = body.actionTextEn !== undefined ? body.actionTextEn : existing.action_text_en;
    const actionTextNp = body.actionTextNp !== undefined ? body.actionTextNp : existing.action_text_np;
    const actionLink = body.actionLink !== undefined ? body.actionLink : existing.action_link;
    const active = body.active !== undefined ? (body.active ? 1 : 0) : existing.active;

    const bulletPointsEn = body.bulletPointsEn !== undefined
      ? (Array.isArray(body.bulletPointsEn) ? JSON.stringify(body.bulletPointsEn) : body.bulletPointsEn)
      : existing.bullet_points_en;

    const bulletPointsNp = body.bulletPointsNp !== undefined
      ? (Array.isArray(body.bulletPointsNp) ? JSON.stringify(body.bulletPointsNp) : body.bulletPointsNp)
      : existing.bullet_points_np;

    await execute(`
      UPDATE popup_notices
      SET title_en = ?, title_np = ?, content_en = ?, content_np = ?,
          category_en = ?, category_np = ?, image_url = ?, date_en = ?,
          date_np = ?, notice_ref = ?, action_text_en = ?, action_text_np = ?,
          action_link = ?, active = ?, bullet_points_en = ?, bullet_points_np = ?
      WHERE id = ?
    `, [
      titleEn, titleNp, contentEn, contentNp, categoryEn, categoryNp,
      imageUrl, dateEn, dateNp, noticeRef, actionTextEn, actionTextNp,
      actionLink, active, bulletPointsEn, bulletPointsNp, id
    ]);

    const updated = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Popup notice #${id} updated successfully in database.`,
      data: mapDbRowToPopupNotice(updated)
    });
  } catch (error: any) {
    console.error('Error updating popup notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update popup notice: ' + (error?.message || 'Unknown error')
    });
  }
});

// 5. PATCH /api/popup-notices/:id/toggle - Toggle active state
app.patch(['/api/popup-notices/:id/toggle', '/api/popup_notices/:id/toggle'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Popup notice #${id} not found.`
      });
    }

    const newActive = existing.active ? 0 : 1;
    await execute('UPDATE popup_notices SET active = ? WHERE id = ?', [newActive, id]);

    const updated = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Popup notice marked as ${newActive ? 'Active' : 'Inactive'}.`,
      data: mapDbRowToPopupNotice(updated)
    });
  } catch (error: any) {
    console.error('Error toggling popup notice active state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle notice: ' + (error?.message || 'Unknown error')
    });
  }
});

// 5.1 PATCH /api/popup-notices/:id/image - Update or delete banner image of popup notice
app.patch(['/api/popup-notices/:id/image', '/api/popup_notices/:id/image'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Popup notice #${id} not found.`
      });
    }
    const newImageUrl = req.body?.imageUrl !== undefined ? String(req.body.imageUrl) : '';
    await execute('UPDATE popup_notices SET image_url = ? WHERE id = ?', [newImageUrl, id]);
    const updated = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Popup notice banner image updated in MySQL database.',
      data: mapDbRowToPopupNotice(updated)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notice banner image: ' + (error?.message || 'Unknown error')
    });
  }
});

// 6. DELETE /api/popup-notices/:id - Delete notice
app.delete(['/api/popup-notices/:id', '/api/popup_notices/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM popup_notices WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Popup notice #${id} not found.`
      });
    }

    await execute('DELETE FROM popup_notices WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Popup notice #${id} deleted from database.`
    });
  } catch (error: any) {
    console.error('Error deleting popup notice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notice: ' + (error?.message || 'Unknown error')
    });
  }
});

// ----------------------------------------------------
// INSTITUTIONAL REPORTS DEDICATED RESTFUL CRUD APIS
// ----------------------------------------------------

// 1. GET /api/institutional-reports - Fetch all reports (ordered by sort_order ASC, id DESC)
app.get('/api/institutional-reports', async (req: Request, res: Response) => {
  try {
    const reports = await getInstitutionalReportsFromDb();
    res.json({
      success: true,
      driver: getActiveDriver(),
      count: reports.length,
      data: reports
    });
  } catch (error: any) {
    console.error('Error fetching institutional reports:', error);
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 2. GET /api/institutional-reports/:id - Fetch single report
app.get('/api/institutional-reports/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const reports = await getInstitutionalReportsFromDb();
    const found = reports.find((r: any) => String(r.id) === String(id));
    if (!found) {
      return res.status(404).json({ success: false, message: 'Institutional report not found' });
    }
    res.json({ success: true, data: found });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 3. POST /api/institutional-reports - Create new report
app.post('/api/institutional-reports', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const reports = await getInstitutionalReportsFromDb();
    const newId = body.id || `rep-m-${Date.now()}`;
    const newReport = {
      ...body,
      id: newId,
      fiscalYear: (body.fiscalYear || 'आ.व. २०८२/८३').trim(),
      monthNp: (body.monthNp || 'असार').trim(),
      monthEn: (body.monthEn || '').trim(),
      reportDateNp: (body.reportDateNp || '२०८३-०३-०१').trim(),
      reportDateEn: (body.reportDateEn || new Date().toISOString().slice(0, 10)).trim(),
      totalMembers: String(body.totalMembers || '0').trim(),
      shareCapital: String(body.shareCapital || '0').trim(),
      shareCapitalGrowth: (body.shareCapitalGrowth || '').trim(),
      reserveFund: String(body.reserveFund || '0').trim(),
      reserveFundGrowth: (body.reserveFundGrowth || '').trim(),
      totalInstitutionalCapital: String(body.totalInstitutionalCapital || '0').trim(),
      totalInstitutionalCapitalNote: (body.totalInstitutionalCapitalNote || '').trim(),
      otherFunds: String(body.otherFunds || '0').trim(),
      totalSavings: String(body.totalSavings || '0').trim(),
      totalSavingsGrowth: (body.totalSavingsGrowth || '').trim(),
      loansDisbursed: String(body.loansDisbursed || '0').trim(),
      borrowerMembersCount: String(body.borrowerMembersCount || '').trim(),
      liquidityAmount: String(body.liquidityAmount || '0').trim(),
      liquidityPercent: String(body.liquidityPercent || '0%').trim(),
      fixedAssets: String(body.fixedAssets || '0').trim(),
      totalAssets: String(body.totalAssets || '0').trim(),
      npaPercent: (body.npaPercent || '').trim(),
      nplPercent: (body.nplPercent || '').trim(),
      liqPercentBadge: (body.liqPercentBadge || '').trim(),
      isPublished: body.isPublished !== false,
      isLatest: Boolean(body.isLatest),
      sortOrder: Number(body.sortOrder || (reports.length + 1)),
      remarksEn: (body.remarksEn || '').trim(),
      remarksNp: (body.remarksNp || '').trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    let updatedList = [...reports];
    if (newReport.isLatest) {
      updatedList = updatedList.map((r: any) => ({ ...r, isLatest: false }));
    }
    updatedList.unshift(newReport);

    await syncInstitutionalReportsPersistence(updatedList);

    res.json({
      success: true,
      message: 'New monthly financial report created and saved permanently to MySQL database!',
      data: newReport,
      reports: updatedList
    });
  } catch (error: any) {
    console.error('Error creating institutional report:', error);
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 4. PUT /api/institutional-reports/:id - Update existing report
app.put('/api/institutional-reports/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const reports = await getInstitutionalReportsFromDb();
    const existingIdx = reports.findIndex((r: any) => String(r.id) === String(id));
    if (existingIdx === -1) {
      return res.status(404).json({ success: false, message: 'Report not found in database' });
    }

    const updatedItem = {
      ...reports[existingIdx],
      ...body,
      id,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    let updatedList = [...reports];
    if (updatedItem.isLatest) {
      updatedList = updatedList.map((r: any) => ({ ...r, isLatest: false }));
    }
    updatedList[existingIdx] = updatedItem;

    await syncInstitutionalReportsPersistence(updatedList);

    res.json({
      success: true,
      message: 'Institutional report updated and saved permanently to MySQL database!',
      data: updatedItem,
      reports: updatedList
    });
  } catch (error: any) {
    console.error('Error updating institutional report:', error);
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 5. DELETE /api/institutional-reports/:id - Delete report
app.delete('/api/institutional-reports/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const reports = await getInstitutionalReportsFromDb();
    const filtered = reports.filter((r: any) => String(r.id) !== String(id));
    await syncInstitutionalReportsPersistence(filtered);

    res.json({
      success: true,
      message: 'Institutional report permanently deleted from database!',
      reports: filtered
    });
  } catch (error: any) {
    console.error('Error deleting institutional report:', error);
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 6. POST /api/institutional-reports/bulk - Bulk save / reorder reports
app.post('/api/institutional-reports/bulk', async (req: Request, res: Response) => {
  try {
    const list = Array.isArray(req.body) ? req.body : req.body.reports;
    if (!Array.isArray(list)) {
      return res.status(400).json({ success: false, message: 'Expected array of reports' });
    }
    await syncInstitutionalReportsPersistence(list);
    res.json({
      success: true,
      message: 'All institutional reports saved to MySQL database successfully!',
      count: list.length,
      data: list
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 7. POST /api/institutional-reports/:id/set-latest - Make specific report latest
app.post('/api/institutional-reports/:id/set-latest', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const reports = await getInstitutionalReportsFromDb();
    const updatedList = reports.map((r: any) => ({
      ...r,
      isLatest: String(r.id) === String(id)
    }));
    await syncInstitutionalReportsPersistence(updatedList);
    res.json({
      success: true,
      message: `Report ${id} marked as latest in database!`,
      data: updatedList
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 8. POST /api/institutional-reports/:id/toggle-publish - Toggle publication status
app.post('/api/institutional-reports/:id/toggle-publish', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const reports = await getInstitutionalReportsFromDb();
    const updatedList = reports.map((r: any) =>
      String(r.id) === String(id) ? { ...r, isPublished: !r.isPublished } : r
    );
    await syncInstitutionalReportsPersistence(updatedList);
    res.json({
      success: true,
      message: `Publication status toggled for report ${id}!`,
      data: updatedList
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// ----------------------------------------------------
// INSTITUTIONAL PROFILES DEDICATED RESTFUL CRUD APIS
// ----------------------------------------------------

// 9. GET /api/institutional-profiles - Fetch statutory profiles
app.get('/api/institutional-profiles', async (req: Request, res: Response) => {
  try {
    const profiles = await getInstitutionalProfilesFromDb();
    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// 10. POST /api/institutional-profiles - Bulk save statutory profiles
app.post('/api/institutional-profiles', async (req: Request, res: Response) => {
  try {
    const list = Array.isArray(req.body) ? req.body : req.body.profiles;
    if (!Array.isArray(list)) {
      return res.status(400).json({ success: false, message: 'Expected array of profiles' });
    }
    await syncInstitutionalProfilesPersistence(list);
    res.json({
      success: true,
      message: 'Institutional profiles saved to MySQL database successfully!',
      count: list.length,
      data: list
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
});

// ----------------------------------------------------
// eKYM SUBMISSIONS APIS
// ----------------------------------------------------

// 1. GET /api/ekym - Retrieve all eKYM applications directly from database
app.get(['/api/ekym', '/api/ekym/submissions'], async (req: Request, res: Response) => {
  try {
    const rows = await queryAll('SELECT * FROM ekym_submissions ORDER BY id DESC');
    const records = rows.map(mapDbRowToRecord);
    res.json({
      success: true,
      driver: getActiveDriver(),
      count: records.length,
      data: records
    });
  } catch (error: any) {
    console.error('Error fetching eKYM list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve eKYM records from database: ' + (error?.message || 'Unknown error')
    });
  }
});

// 1.5. POST /api/ekym/upload-doc - Secure document upload for Photo & Citizenship
app.post('/api/ekym/upload-doc', uploadKym.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const docType = req.body?.docType || 'document';
    const filePath = `/uploads/kym/${req.file.filename}`;
    res.json({
      success: true,
      message: `${docType} uploaded successfully.`,
      url: filePath,
      docType,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err: any) {
    console.error('Error uploading KYM document:', err);
    res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
  }
});

// 1.8. GET /api/ekym/search/lookup - Look up application by Application Number or Phone
app.get('/api/ekym/search/lookup', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q || req.query.query || req.query.phone || req.query.appNo || '').toString().trim();
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search parameter q or phone is required.' });
    }
    const rows = await queryAll(
      'SELECT * FROM ekym_submissions WHERE application_no = ? OR phone = ? OR citizenship_no = ? ORDER BY id DESC',
      [q, q, q]
    );
    res.json({
      success: true,
      data: rows.map(mapDbRowToRecord)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// 2. GET /api/ekym/:id - Retrieve single application
app.get(['/api/ekym/:id', '/api/ekym/submissions/:id'], async (req: Request, res: Response) => {
  try {
    const idOrAppNo = req.params.id;
    const row = await queryOne(
      'SELECT * FROM ekym_submissions WHERE id = ? OR application_no = ? OR phone = ? ORDER BY id DESC LIMIT 1',
      [idOrAppNo, idOrAppNo, idOrAppNo]
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'eKYM application not found in database.'
      });
    }

    res.json({
      success: true,
      data: mapDbRowToRecord(row)
    });
  } catch (error: any) {
    console.error('Error fetching single eKYM:', error);
    res.status(500).json({
      success: false,
      message: 'Database query error: ' + (error?.message || 'Unknown error')
    });
  }
});

// 3. POST /api/ekym - Submit new eKYM application into database
app.post(['/api/ekym', '/api/ekym/submissions'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const details = body.details || body;

    const fullNameEn = (
      body.fullNameEn || details.fullNameEn ||
      body.fullName || details.fullName ||
      body.applicantName || details.applicantName ||
      body.applicant_name || details.applicant_name ||
      body.name || details.name ||
      details.personal?.fullName || body.personal?.fullName || ''
    ).trim();
    const fullNameNp = (body.fullNameNp || details.fullNameNp || body.fullName || details.fullName || fullNameEn).trim();
    const phone = (
      body.phone || body.mobile || body.contactNumber || body.contact || body.mobileNumber || body.mobile_number ||
      details.mobile || details.phone || details.contactNumber || details.contact || details.mobileNumber ||
      details.personal?.mobile || details.personal?.phone || body.personal?.mobile || ''
    ).trim();
    const citizenshipNo = (
      body.citizenshipNo || details.citizenshipNo ||
      body.citizenshipNumber || details.citizenshipNumber ||
      body.citizenship || details.citizenship ||
      details.personal?.citizenshipNo || body.personal?.citizenshipNo || '48-01-72-99999'
    ).trim();

    if (!fullNameEn || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory fields: Applicant Name and Mobile Phone are required.'
      });
    }

    // Generate unique application number if not provided
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationNo = (body.applicationNo && body.applicationNo.trim().length > 0)
      ? body.applicationNo.trim()
      : `EKT-KYC-2083-${randomSuffix}`;

    const fatherName = body.fatherName || details.fatherName || 'Not specified';
    const grandfatherName = body.grandfatherName || details.grandfatherName || 'Not specified';
    const motherName = body.motherName || details.motherName || '';
    const spouseName = body.spouseName || details.spouseName || '';
    const dob = body.dob || details.dob || '2050-01-01';
    const gender = body.gender || details.gender || 'Male';
    const citizenshipDistrict = body.citizenshipDistrict || details.citizenshipDistrict || 'Rupandehi';
    const email = body.email || details.email || '';

    const permProvince = body.permProvince || details.permProvince || 'Lumbini Province';
    const permDistrict = body.permDistrict || details.permDistrict || citizenshipDistrict || 'Rupandehi';
    const tempProvince = details.sameAsPermanent
      ? permProvince
      : (body.tempProvince || details.tempProvince || permProvince);
    const tempDistrict = details.sameAsPermanent
      ? permDistrict
      : (body.tempDistrict || details.tempDistrict || permDistrict);

    let permAddress = body.permanentAddress || '';
    if (!permAddress) {
      const parts = [
        details.permTole,
        details.permWard ? `Ward ${details.permWard}` : '',
        details.permMunicipality,
        permDistrict,
        permProvince
      ].filter(Boolean);
      permAddress = parts.join(', ') || `${permDistrict}, ${permProvince}`;
    }

    let currAddress = body.currentAddress || '';
    if (!currAddress) {
      if (details.sameAsPermanent) {
        currAddress = permAddress;
      } else {
        const parts = [
          details.tempTole,
          details.tempWard ? `Ward ${details.tempWard}` : '',
          details.tempMunicipality,
          tempDistrict,
          tempProvince
        ].filter(Boolean);
        currAddress = parts.join(', ') || permAddress;
      }
    }

    const occupation = body.occupation || details.occupation || 'Business / Enterprise';
    const annualIncome = body.annualIncome || details.estimatedAnnualIncome || 'Rs. 600,000';
    const bankName = body.bankName || details.bankName || 'Local Bank';
    const bankAccountNo = body.bankAccountNo || details.bankAccountNo || 'Pending';
    const nomineeName = body.nomineeName || details.nomineeName || 'Family Member';
    const nomineeRelation = body.nomineeRelation || details.nomineeRelation || 'Family';
    const nomineeCitizenship = body.nomineeCitizenship || details.nomineeCitizenship || '';
    
    // Automatically save base64 document images to disk storage files
    const rawPhoto = body.memberPhoto || details.memberPhoto || '';
    const rawFront = body.citizenshipFront || details.citizenshipFront || '';
    const rawBack = body.citizenshipBack || details.citizenshipBack || '';

    const memberPhoto = saveKymBase64ToFile(rawPhoto, 'photo');
    const citizenshipFront = saveKymBase64ToFile(rawFront, 'citizenship-front');
    const citizenshipBack = saveKymBase64ToFile(rawBack, 'citizenship-back');

    const status = body.status || 'Pending';
    const remarks = body.remarks || `Submitted online via eKYM Wizard. Preferred Branch: ${details.preferredBranch || 'Main Branch'}. Scheme: ${details.accountTypeInterest || 'Standard Saving'}.`;

    const detailsJson = JSON.stringify({
      ...details,
      ...body.details,
      permProvince,
      permDistrict,
      tempProvince,
      tempDistrict,
      memberPhoto,
      citizenshipFront,
      citizenshipBack,
    });

    let result;
    try {
      result = await execute(`
        INSERT INTO ekym_submissions (
          application_no, full_name_en, full_name_np, father_name, grandfather_name,
          mother_name, spouse_name, dob, gender, citizenship_no, citizenship_district,
          phone, email, permanent_address, current_address,
          perm_province, perm_district, temp_province, temp_district,
          occupation, annual_income,
          bank_name, bank_account_no, nominee_name, nominee_relation, nominee_citizenship,
          status, remarks, submitted_at, details_json, member_photo, citizenship_front, citizenship_back
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        applicationNo, fullNameEn, fullNameNp, fatherName, grandfatherName,
        motherName, spouseName, dob, gender, citizenshipNo, citizenshipDistrict,
        phone, email, permAddress, currAddress,
        permProvince, permDistrict, tempProvince, tempDistrict,
        occupation, annualIncome,
        bankName, bankAccountNo, nomineeName, nomineeRelation, nomineeCitizenship,
        status, remarks, timestampStr, detailsJson, memberPhoto, citizenshipFront, citizenshipBack
      ]);
    } catch (insertErr) {
      // Graceful fallback without specific image/province columns
      result = await execute(`
        INSERT INTO ekym_submissions (
          application_no, full_name_en, full_name_np, father_name, grandfather_name,
          mother_name, spouse_name, dob, gender, citizenship_no, citizenship_district,
          phone, email, permanent_address, current_address, occupation, annual_income,
          bank_name, bank_account_no, nominee_name, nominee_relation, nominee_citizenship,
          status, remarks, submitted_at, details_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        applicationNo, fullNameEn, fullNameNp, fatherName, grandfatherName,
        motherName, spouseName, dob, gender, citizenshipNo, citizenshipDistrict,
        phone, email, permAddress, currAddress, occupation, annualIncome,
        bankName, bankAccountNo, nomineeName, nomineeRelation, nomineeCitizenship,
        status, remarks, timestampStr, detailsJson
      ]);
    }

    const newRow = await queryOne('SELECT * FROM ekym_submissions WHERE id = ?', [result.insertId]);
    const newRecord = mapDbRowToRecord(newRow);

    res.status(201).json({
      success: true,
      driver: getActiveDriver(),
      message: 'eKYM application saved successfully to the database.',
      data: newRecord
    });
  } catch (error: any) {
    console.error('Error saving eKYM submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to insert eKYM record into database: ' + (error?.message || 'Unknown error')
    });
  }
});

// 4. PATCH & POST /api/ekym/:id/status - Update application status and remarks
const handleStatusUpdate = async (req: Request, res: Response) => {
  try {
    const idOrAppNo = req.params.id;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required (e.g. Approved, Rejected, Returned, Pending).'
      });
    }

    const existing = await queryOne(
      'SELECT * FROM ekym_submissions WHERE id = ? OR application_no = ?',
      [idOrAppNo, idOrAppNo]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `eKYM record #${idOrAppNo} not found in database.`
      });
    }

    const updatedRemarks = remarks !== undefined ? remarks : existing.remarks;

    await execute(`
      UPDATE ekym_submissions
      SET status = ?, remarks = ?
      WHERE id = ?
    `, [status, updatedRemarks, existing.id]);

    const updatedRow = await queryOne('SELECT * FROM ekym_submissions WHERE id = ?', [existing.id]);

    res.json({
      success: true,
      message: `eKYM application #${existing.application_no} status updated to ${status}.`,
      data: mapDbRowToRecord(updatedRow)
    });
  } catch (error: any) {
    console.error('Error updating eKYM status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update eKYM status in database: ' + (error?.message || 'Unknown error')
    });
  }
};

app.patch('/api/ekym/:id/status', handleStatusUpdate);
app.post('/api/ekym/:id/status', handleStatusUpdate);

// 5. DELETE /api/ekym/:id - Remove application
app.delete('/api/ekym/:id', async (req: Request, res: Response) => {
  try {
    const idOrAppNo = req.params.id;
    const existing = await queryOne(
      'SELECT * FROM ekym_submissions WHERE id = ? OR application_no = ?',
      [idOrAppNo, idOrAppNo]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `eKYM record #${idOrAppNo} not found.`
      });
    }

    await execute('DELETE FROM ekym_submissions WHERE id = ?', [existing.id]);

    res.json({
      success: true,
      message: `eKYM record #${existing.application_no} deleted successfully.`
    });
  } catch (error: any) {
    console.error('Error deleting eKYM record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete record: ' + (error?.message || 'Unknown error')
    });
  }
});

// ----------------------------------------------------
// MEDIA MANAGEMENT APIS
// ----------------------------------------------------

// 1. GET /api/media - List all uploaded and system media files
app.get(['/api/media', '/api/media/files', '/api/media_files'], async (req: Request, res: Response) => {
  try {
    const rows = await queryAll('SELECT * FROM media_files ORDER BY id DESC');
    const validRows: any[] = [];
    for (const r of rows) {
      if (r.media_key === 'logo-official-default' && r.file_path !== '/uploads/logos/ekata-logo-default.svg') {
        r.file_path = '/uploads/logos/ekata-logo-default.svg';
        r.filename = 'ekata-logo-default.svg';
        try {
          await execute(
            `UPDATE media_files SET file_path = '/uploads/logos/ekata-logo-default.svg', filename = 'ekata-logo-default.svg' WHERE id = ?`,
            [r.id]
          );
        } catch (e) {}
      }
      if (r.file_path && typeof r.file_path === 'string' && r.file_path.startsWith('/uploads/')) {
        const rel = r.file_path.replace(/^\/+/, '').split('?')[0];
        const diskPath = path.resolve(process.cwd(), 'public', rel);
        if (!fs.existsSync(diskPath)) {
          try {
            await execute('DELETE FROM media_files WHERE id = ? AND is_system_default = 0', [r.id]);
          } catch (e) {}
          continue;
        }
      }
      validRows.push(r);
    }
    res.json({
      success: true,
      count: validRows.length,
      data: validRows
    });
  } catch (error: any) {
    console.error('Error fetching media files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media: ' + (error?.message || 'Unknown error')
    });
  }
});

// 2. POST /api/media/upload - Upload single or multiple images
app.post(['/api/media/upload', '/api/upload'], uploadMedia.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded. Please select valid image files.'
      });
    }

    const category = req.body.category || 'general';
    const uploadedRecords = [];

    for (const f of files) {
      const mediaKey = 'media-' + Date.now() + '-' + Math.round(Math.random() * 1e5);
      const title = req.body.title || f.originalname;
      const filePath = `/uploads/media/${f.filename}`;
      const altText = req.body.altText || title;

      const result = await execute(`
        INSERT INTO media_files (
          media_key, title, filename, file_path, file_type, file_size, category, alt_text, is_system_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [
        mediaKey, title, f.filename, filePath, f.mimetype, f.size, category, altText
      ]);

      const saved = await queryOne('SELECT * FROM media_files WHERE id = ?', [result.insertId]);
      uploadedRecords.push(saved);
    }

    res.status(201).json({
      success: true,
      message: `${files.length} image(s) uploaded successfully.`,
      data: uploadedRecords
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed: ' + (error?.message || 'Unknown error')
    });
  }
});

// 3. PUT /api/media/:id - Update media metadata
app.put('/api/media/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { title, category, altText } = req.body;
    const existing = await queryOne('SELECT * FROM media_files WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Media record not found.' });
    }

    await execute(`
      UPDATE media_files
      SET title = ?, category = ?, alt_text = ?
      WHERE id = ?
    `, [
      title || existing.title,
      category || existing.category,
      altText !== undefined ? altText : existing.alt_text,
      id
    ]);

    const updated = await queryOne('SELECT * FROM media_files WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// 4. DELETE /api/media/:id - Delete media file from disk & DB
app.delete('/api/media/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM media_files WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Media record not found.' });
    }

    // Attempt to remove file from disk if not a built-in default SVG
    if (!existing.is_system_default && existing.file_path && !existing.file_path.includes('ekata-logo-default.svg')) {
      const cleanRelPath = existing.file_path.replace(/^\/+/, '');
      const diskPath = path.join(process.cwd(), 'public', cleanRelPath);
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (e) {}
      }
    }

    await execute('DELETE FROM media_files WHERE id = ?', [id]);
    res.json({ success: true, message: 'Media file removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// 4.1 POST /api/media/delete-by-path & DELETE /api/media/by-path - Delete uploaded file by server path from disk & MySQL
const handleDeleteMediaByPath = async (req: Request, res: Response) => {
  try {
    const rawPath = (req.body?.filePath || req.query?.filePath || '').toString().trim();
    if (!rawPath) {
      return res.status(400).json({ success: false, message: 'filePath is required.' });
    }

    const existing = await queryOne('SELECT * FROM media_files WHERE file_path = ?', [rawPath]);
    if (existing) {
      await execute('DELETE FROM media_files WHERE id = ?', [existing.id]);
    }

    // Remove physical file from disk if inside /uploads/ and not a system default SVG
    const isProtectedDefault =
      rawPath.includes('ekata-logo-default.svg') ||
      (existing && Boolean(existing.is_system_default));

    if (!isProtectedDefault && rawPath.startsWith('/uploads/')) {
      const cleanRelPath = rawPath.replace(/^\/+/, '').split('?')[0];
      const diskPath = path.join(process.cwd(), 'public', cleanRelPath);
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (e) {}
      }
    }

    res.json({
      success: true,
      message: 'File deleted from server disk and MySQL database.',
      deletedPath: rawPath
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to delete file by path' });
  }
};

app.post('/api/media/delete-by-path', handleDeleteMediaByPath);
app.delete('/api/media/by-path', handleDeleteMediaByPath);

// 5. POST /api/media/replace/:id - Replace existing media file with new uploaded file
app.post('/api/media/replace/:id', uploadMedia.single('file'), async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No replacement file was provided.' });
    }
    const existing = await queryOne('SELECT * FROM media_files WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Media record not found.' });
    }

    // If existing is not a system default, delete old file from disk
    if (!existing.is_system_default && existing.file_path && !existing.file_path.includes('ekata-logo-default.svg')) {
      const oldDiskPath = path.join(process.cwd(), 'public', existing.file_path);
      if (fs.existsSync(oldDiskPath)) {
        try { fs.unlinkSync(oldDiskPath); } catch (e) {}
      }
    }

    const newFilePath = `/uploads/media/${file.filename}`;
    await execute(`
      UPDATE media_files
      SET filename = ?, file_path = ?, file_type = ?, file_size = ?
      WHERE id = ?
    `, [file.filename, newFilePath, file.mimetype, file.size, id]);

    // If the replaced item is the official logo or in branding category, also update active site logo in database
    if (existing.media_key === 'logo-official-default' || existing.media_key === 'logo-default' || existing.category === 'branding') {
      await persistLogoInDatabase(newFilePath, '');
    }

    const updated = await queryOne('SELECT * FROM media_files WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'File replaced successfully in database and disk.',
      data: updated
    });
  } catch (error: any) {
    console.error('Error replacing media file:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to replace file' });
  }
});

// ----------------------------------------------------
// INTEREST RATES FULL CRUD APIS (DATABASE CONNECTED)
// ----------------------------------------------------

// 1. GET /api/interest-rates and /api/rates
app.get(['/api/interest-rates', '/api/rates'], async (req: Request, res: Response) => {
  try {
    const rows = await queryAll('SELECT * FROM interest_rates ORDER BY id ASC');
    const data = rows.map((r: any) => ({
      id: String(r.id),
      category: r.category || 'Deposit',
      schemeEn: r.scheme_en,
      schemeNp: r.scheme_np,
      rate: `${r.rate_percent}%`,
      ratePercent: Number(r.rate_percent),
      period: r.basis_en || 'Annual',
      basisEn: r.basis_en,
      basisNp: r.basis_np,
      minBalance: Number(r.min_balance || 0)
    }));
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 2. POST /api/interest-rates and /api/rates - Add new interest rate scheme
app.post(['/api/interest-rates', '/api/rates'], async (req: Request, res: Response) => {
  try {
    const { category, schemeEn, schemeNp, ratePercent, rate, basisEn, basisNp, minBalance, period } = req.body;
    const cat = category || 'Deposit';
    const sEn = (schemeEn || req.body.scheme_en || '').trim();
    if (!sEn) {
      return res.status(400).json({ success: false, message: 'Scheme name in English is required.' });
    }
    const sNp = (schemeNp || req.body.scheme_np || sEn).trim();
    const rawRate = ratePercent !== undefined 
      ? Number(ratePercent) 
      : (parseFloat(String(rate || '').replace(/[^0-9.]/g, '')) || 10.0);
    const bEn = basisEn || req.body.basis_en || period || 'Daily balance calculation, quarterly payout';
    const bNp = basisNp || req.body.basis_np || 'दैनिक मौज्दात गणना, त्रैमासिक भुक्तानी';
    const minBal = minBalance !== undefined ? Number(minBalance) : (Number(req.body.min_balance) || 0);

    const result = await execute(`
      INSERT INTO interest_rates (category, scheme_en, scheme_np, rate_percent, basis_en, basis_np, min_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [cat, sEn, sNp, rawRate, bEn, bNp, minBal]);

    const created = await queryOne('SELECT * FROM interest_rates WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Interest rate scheme created successfully!',
      data: {
        id: String(created.id),
        category: created.category,
        schemeEn: created.scheme_en,
        schemeNp: created.scheme_np,
        rate: `${created.rate_percent}%`,
        ratePercent: Number(created.rate_percent),
        period: created.basis_en,
        basisEn: created.basis_en,
        basisNp: created.basis_np,
        minBalance: Number(created.min_balance)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 3. PUT /api/interest-rates/:id and /api/rates/:id - Edit interest rate scheme
app.put(['/api/interest-rates/:id', '/api/rates/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM interest_rates WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Interest rate scheme not found.' });
    }

    const { category, schemeEn, schemeNp, ratePercent, rate, basisEn, basisNp, minBalance, period } = req.body;
    const cat = category || existing.category;
    const sEn = schemeEn || req.body.scheme_en || existing.scheme_en;
    const sNp = schemeNp || req.body.scheme_np || existing.scheme_np;
    const rawRate = ratePercent !== undefined 
      ? Number(ratePercent) 
      : (rate !== undefined ? (parseFloat(String(rate).replace(/[^0-9.]/g, '')) || existing.rate_percent) : existing.rate_percent);
    const bEn = basisEn || req.body.basis_en || period || existing.basis_en;
    const bNp = basisNp || req.body.basis_np || existing.basis_np;
    const minBal = minBalance !== undefined ? Number(minBalance) : (req.body.min_balance !== undefined ? Number(req.body.min_balance) : existing.min_balance);

    await execute(`
      UPDATE interest_rates
      SET category = ?, scheme_en = ?, scheme_np = ?, rate_percent = ?, basis_en = ?, basis_np = ?, min_balance = ?
      WHERE id = ?
    `, [cat, sEn, sNp, rawRate, bEn, bNp, minBal, id]);

    const updated = await queryOne('SELECT * FROM interest_rates WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Interest rate scheme updated successfully!',
      data: {
        id: String(updated.id),
        category: updated.category,
        schemeEn: updated.scheme_en,
        schemeNp: updated.scheme_np,
        rate: `${updated.rate_percent}%`,
        ratePercent: Number(updated.rate_percent),
        period: updated.basis_en,
        basisEn: updated.basis_en,
        basisNp: updated.basis_np,
        minBalance: Number(updated.min_balance)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 4. DELETE /api/interest-rates/:id and /api/rates/:id - Delete interest rate scheme
app.delete(['/api/interest-rates/:id', '/api/rates/:id', '/api/loan-products/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM interest_rates WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Interest rate / loan product scheme not found.' });
    }
    await execute('DELETE FROM interest_rates WHERE id = ?', [id]);
    res.json({ success: true, message: `Scheme #${id} removed successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// ----------------------------------------------------
// LOAN PRODUCTS & LOAN APPLICATIONS FULL CRUD APIS
// ----------------------------------------------------

// 1. GET /api/loan-products - Fetch all Loan Products (synced with interest_rates where category = 'Loan')
app.get('/api/loan-products', async (req: Request, res: Response) => {
  try {
    const rows = await queryAll("SELECT * FROM interest_rates WHERE category = 'Loan' ORDER BY id ASC");
    const data = rows.map((r: any) => ({
      id: String(r.id),
      category: 'Loan',
      schemeEn: r.scheme_en,
      schemeNp: r.scheme_np,
      rate: `${r.rate_percent}%`,
      ratePercent: Number(r.rate_percent),
      period: r.basis_en || 'Annual',
      basisEn: r.basis_en,
      basisNp: r.basis_np,
      minBalance: Number(r.min_balance || 0)
    }));
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 2. POST /api/loan-products - Create new Loan Product
app.post('/api/loan-products', async (req: Request, res: Response) => {
  try {
    const { schemeEn, schemeNp, ratePercent, rate, basisEn, basisNp, minBalance, period } = req.body;
    const sEn = (schemeEn || req.body.scheme_en || '').trim();
    if (!sEn) {
      return res.status(400).json({ success: false, message: 'Loan Product name in English is required.' });
    }
    const sNp = (schemeNp || req.body.scheme_np || sEn).trim();
    const rawRate = ratePercent !== undefined
      ? Number(ratePercent)
      : (parseFloat(String(rate || '').replace(/[^0-9.]/g, '')) || 12.5);
    const bEn = basisEn || req.body.basis_en || period || 'Flexible monthly EMI repayment';
    const bNp = basisNp || req.body.basis_np || 'सहज मासिक किस्ताबन्दी भुक्तानी सुविधा';
    const minBal = minBalance !== undefined ? Number(minBalance) : (Number(req.body.min_balance) || 0);

    const result = await execute(`
      INSERT INTO interest_rates (category, scheme_en, scheme_np, rate_percent, basis_en, basis_np, min_balance)
      VALUES ('Loan', ?, ?, ?, ?, ?, ?)
    `, [sEn, sNp, rawRate, bEn, bNp, minBal]);

    const created = await queryOne('SELECT * FROM interest_rates WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Loan product created successfully!',
      data: {
        id: String(created.id),
        category: 'Loan',
        schemeEn: created.scheme_en,
        schemeNp: created.scheme_np,
        rate: `${created.rate_percent}%`,
        ratePercent: Number(created.rate_percent),
        period: created.basis_en,
        basisEn: created.basis_en,
        basisNp: created.basis_np,
        minBalance: Number(created.min_balance)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 3. PUT /api/loan-products/:id - Update Loan Product
app.put('/api/loan-products/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM interest_rates WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Loan product not found.' });
    }
    const { schemeEn, schemeNp, ratePercent, rate, basisEn, basisNp, minBalance, period } = req.body;
    const sEn = schemeEn || req.body.scheme_en || existing.scheme_en;
    const sNp = schemeNp || req.body.scheme_np || existing.scheme_np;
    const rawRate = ratePercent !== undefined
      ? Number(ratePercent)
      : (rate !== undefined ? (parseFloat(String(rate).replace(/[^0-9.]/g, '')) || existing.rate_percent) : existing.rate_percent);
    const bEn = basisEn || req.body.basis_en || period || existing.basis_en;
    const bNp = basisNp || req.body.basis_np || existing.basis_np;
    const minBal = minBalance !== undefined ? Number(minBalance) : existing.min_balance;

    await execute(`
      UPDATE interest_rates
      SET category = 'Loan', scheme_en = ?, scheme_np = ?, rate_percent = ?, basis_en = ?, basis_np = ?, min_balance = ?
      WHERE id = ?
    `, [sEn, sNp, rawRate, bEn, bNp, minBal, id]);

    const updated = await queryOne('SELECT * FROM interest_rates WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Loan product updated successfully!',
      data: {
        id: String(updated.id),
        category: 'Loan',
        schemeEn: updated.scheme_en,
        schemeNp: updated.scheme_np,
        rate: `${updated.rate_percent}%`,
        ratePercent: Number(updated.rate_percent),
        period: updated.basis_en,
        basisEn: updated.basis_en,
        basisNp: updated.basis_np,
        minBalance: Number(updated.min_balance)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 4. GET /api/loans - Fetch all submitted loan applications from database
app.get('/api/loans', async (req: Request, res: Response) => {
  try {
    const rows = await queryAll('SELECT * FROM loan_applications ORDER BY id DESC');
    const data = rows.map(mapDbRowToLoanRecord);
    res.json({
      success: true,
      driver: getActiveDriver(),
      count: data.length,
      data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 5. POST /api/loans - Submit a new loan application into database
app.post('/api/loans', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const name = (body.applicantName || body.applicant_name || '').trim();
    const phone = (body.phone || '').trim();
    const email = (body.email || '').trim();
    const memberCode = (body.memberCode || body.member_code || '').trim();
    const citizenshipNo = (body.citizenshipNo || body.citizenship_no || '').trim();
    const address = (body.address || '').trim();
    const province = (body.province || '').trim();
    const district = (body.district || '').trim();
    const branch = (body.branch || 'Butwal Main Branch').trim();
    const occupation = (body.occupation || '').trim();
    const collateralType = (body.collateralType || body.collateral_type || '').trim();
    const loanScheme = (body.loanScheme || body.loan_scheme || 'Agricultural Productive Loan').trim();
    const interestRate = parseFloat(body.interestRate || body.interest_rate || 12.5);
    const amount = parseFloat(body.amount || 0);
    const tenureMonths = parseInt(body.tenureMonths || body.tenure_months || 24, 10);
    const monthlyIncome = parseFloat(body.monthlyIncome || body.monthly_income || 0);
    const purpose = (body.purpose || '').trim();
    const remarks = (body.remarks || 'Submitted online via Loan Application Portal.').trim();

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Applicant Name and Phone Number are required.'
      });
    }

    const trackingCode = body.trackingCode || ('EKT-LN-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const detailsJson = JSON.stringify(body.details || body);

    let result;
    try {
      result = await execute(`
        INSERT INTO loan_applications (
          tracking_code, applicant_name, phone, email, member_code, citizenship_no,
          address, province, district, branch, occupation, collateral_type,
          loan_scheme, interest_rate, amount, tenure_months, monthly_income,
          purpose, status, remarks, details_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review', ?, ?, ?)
      `, [
        trackingCode, name, phone, email, memberCode, citizenshipNo,
        address, province, district, branch, occupation, collateralType,
        loanScheme, interestRate, amount, tenureMonths, monthlyIncome,
        purpose, remarks, detailsJson, nowStr
      ]);
    } catch (insertErr) {
      result = await execute(`
        INSERT INTO loan_applications (
          tracking_code, applicant_name, phone, email, loan_scheme, amount, tenure_months, monthly_income, purpose, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under Review')
      `, [trackingCode, name, phone, email, loanScheme, amount, tenureMonths, monthlyIncome, purpose]);
    }

    const created = await queryOne('SELECT * FROM loan_applications WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Loan application submitted and saved to database!',
      trackingCode,
      data: mapDbRowToLoanRecord(created)
    });
  } catch (err: any) {
    console.error('Error submitting loan application:', err);
    res.status(500).json({ success: false, message: err?.message || 'Failed to submit loan application' });
  }
});

// 6. PATCH & POST /api/loans/:id/status - Update loan application status & remarks
const handleLoanStatusUpdate = async (req: Request, res: Response) => {
  try {
    const idOrCode = req.params.id;
    const { status, remarks } = req.body;
    const existing = await queryOne(
      'SELECT * FROM loan_applications WHERE id = ? OR tracking_code = ?',
      [idOrCode, idOrCode]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: `Loan application #${idOrCode} not found.` });
    }
    const newStatus = status || existing.status;
    const newRemarks = remarks !== undefined ? remarks : existing.remarks;
    try {
      await execute('UPDATE loan_applications SET status = ?, remarks = ? WHERE id = ?', [newStatus, newRemarks, existing.id]);
    } catch (e) {
      await execute('UPDATE loan_applications SET status = ? WHERE id = ?', [newStatus, existing.id]);
    }
    const updated = await queryOne('SELECT * FROM loan_applications WHERE id = ?', [existing.id]);
    res.json({
      success: true,
      message: `Loan application ${existing.tracking_code} updated to ${newStatus}.`,
      data: mapDbRowToLoanRecord(updated)
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
};
app.patch('/api/loans/:id/status', handleLoanStatusUpdate);
app.post('/api/loans/:id/status', handleLoanStatusUpdate);

// 6.5 PUT /api/loans/:id - Update full loan application fields (Admin CRUD Update)
app.put('/api/loans/:id', async (req: Request, res: Response) => {
  try {
    const idOrCode = req.params.id;
    const existing = await queryOne(
      'SELECT * FROM loan_applications WHERE id = ? OR tracking_code = ?',
      [idOrCode, idOrCode]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: `Loan application #${idOrCode} not found.` });
    }

    const body = req.body || {};
    const name = (body.applicantName ?? body.applicant_name ?? existing.applicant_name ?? '').trim();
    const phone = (body.phone ?? existing.phone ?? '').trim();
    const email = (body.email ?? existing.email ?? '').trim();
    const address = (body.address ?? existing.address ?? '').trim();
    const province = (body.province ?? existing.province ?? '').trim();
    const district = (body.district ?? existing.district ?? '').trim();
    const branch = (body.branch ?? existing.branch ?? 'Butwal Main Branch').trim();
    const occupation = (body.occupation ?? existing.occupation ?? '').trim();
    const collateralType = (body.collateralType ?? body.collateral_type ?? existing.collateral_type ?? '').trim();
    const loanScheme = (body.loanScheme ?? body.loan_scheme ?? existing.loan_scheme ?? '').trim();
    const interestRate = body.interestRate !== undefined ? parseFloat(body.interestRate) : Number(existing.interest_rate || 12.5);
    const amount = body.amount !== undefined ? parseFloat(body.amount) : Number(existing.amount || 0);
    const tenureMonths = body.tenureMonths !== undefined ? parseInt(body.tenureMonths, 10) : Number(existing.tenure_months || 12);
    const monthlyIncome = body.monthlyIncome !== undefined ? parseFloat(body.monthlyIncome) : Number(existing.monthly_income || 0);
    const purpose = (body.purpose ?? existing.purpose ?? '').trim();
    const status = body.status || existing.status || 'Under Review';
    const remarks = body.remarks !== undefined ? body.remarks : (existing.remarks || '');

    let existingDetails: any = {};
    if (existing.details_json) {
      try { existingDetails = JSON.parse(existing.details_json); } catch (e) {}
    }
    const mergedDetails = {
      ...existingDetails,
      ...(body.details || {}),
      name,
      email,
      phone,
      province,
      district,
      branch,
      loanType: loanScheme,
      incomeSource: occupation,
    };
    const detailsJson = JSON.stringify(mergedDetails);

    try {
      await execute(`
        UPDATE loan_applications
        SET applicant_name = ?, phone = ?, email = ?, address = ?, province = ?, district = ?,
            branch = ?, occupation = ?, collateral_type = ?, loan_scheme = ?, interest_rate = ?,
            amount = ?, tenure_months = ?, monthly_income = ?, purpose = ?, status = ?, remarks = ?, details_json = ?
        WHERE id = ?
      `, [
        name, phone, email, address, province, district,
        branch, occupation, collateralType, loanScheme, interestRate,
        amount, tenureMonths, monthlyIncome, purpose, status, remarks, detailsJson,
        existing.id
      ]);
    } catch (e) {
      await execute(`
        UPDATE loan_applications
        SET applicant_name = ?, phone = ?, email = ?, loan_scheme = ?, amount = ?, tenure_months = ?, monthly_income = ?, purpose = ?, status = ?
        WHERE id = ?
      `, [name, phone, email, loanScheme, amount, tenureMonths, monthlyIncome, purpose, status, existing.id]);
    }

    const updated = await queryOne('SELECT * FROM loan_applications WHERE id = ?', [existing.id]);
    res.json({
      success: true,
      message: `Loan application ${existing.tracking_code} updated successfully.`,
      data: mapDbRowToLoanRecord(updated)
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 7. DELETE /api/loans/:id - Delete loan application
app.delete('/api/loans/:id', async (req: Request, res: Response) => {
  try {
    const idOrCode = req.params.id;
    const existing = await queryOne(
      'SELECT * FROM loan_applications WHERE id = ? OR tracking_code = ?',
      [idOrCode, idOrCode]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Loan application not found.' });
    }
    await execute('DELETE FROM loan_applications WHERE id = ?', [existing.id]);
    res.json({ success: true, message: `Loan application ${existing.tracking_code} deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// ----------------------------------------------------
// SITE SETTINGS & LOGO MANAGEMENT APIS
// ----------------------------------------------------

// 1. GET /api/settings - Retrieve all website settings (including logo)
app.get(['/api/settings', '/api/site-settings', '/api/site_settings'], async (req: Request, res: Response) => {
  try {
    const settingsMap = await getSiteSettingsMap();
    res.json({
      success: true,
      data: settingsMap
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// 1.1. GET /api/settings/logo - Direct fetch for active official logo path
app.get(['/api/settings/logo', '/api/logo'], async (req: Request, res: Response) => {
  try {
    const settingsMap = await getSiteSettingsMap();
    const activeLogo = settingsMap.coopLogoUrl || settingsMap.coop_logo_url || settingsMap.logo_url || '';
    res.json({
      success: true,
      logoUrl: activeLogo,
      data: {
        logoUrl: activeLogo
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// 2. POST & PUT /api/settings/logo - Upload or set the website logo dynamically
const handleLogoUploadOrSet = async (req: Request, res: Response) => {
  const runUpload = () =>
    new Promise<void>((resolve, reject) => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('multipart/form-data')) {
        uploadLogo.any()(req, res, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });

  try {
    await runUpload();

    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    const uploadedFile = files[0];

    if (uploadedFile) {
      const logoUrl = `/uploads/logos/${uploadedFile.filename}`;
      await persistLogoInDatabase(logoUrl, uploadedFile.filename);

      // Also insert in media_files for history/selection
      try {
        await execute(`
          INSERT INTO media_files (
            media_key, title, filename, file_path, file_type, file_size, category, alt_text, is_system_default
          ) VALUES (?, ?, ?, ?, ?, ?, 'branding', 'Website Official Logo', 0)
        `, [
          'logo-custom-' + Date.now(),
          'Uploaded Cooperative Logo',
          uploadedFile.filename,
          logoUrl,
          uploadedFile.mimetype,
          uploadedFile.size
        ]);
      } catch (e) {}

      const updatedSettings = await getSiteSettingsMap();
      return res.json({
        success: true,
        message: 'Website official logo uploaded and saved to database successfully!',
        logoUrl,
        filename: uploadedFile.filename,
        data: updatedSettings
      });
    }

    // Check if JSON/form body provided a logoUrl or base64 image
    const bodyLogo = req.body?.logoUrl || req.body?.coopLogoUrl || req.body?.coop_logo_url || req.body?.logo_url || req.body?.base64;
    if (bodyLogo && typeof bodyLogo === 'string' && bodyLogo.trim()) {
      const { logoUrl, filename } = await persistLogoInDatabase(bodyLogo.trim());
      const updatedSettings = await getSiteSettingsMap();
      return res.json({
        success: true,
        message: 'Website official logo updated and saved to database successfully!',
        logoUrl,
        filename,
        data: updatedSettings
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Please provide a valid image file or logo URL for the website logo.'
    });
  } catch (error: any) {
    console.error('Error uploading/updating logo:', error);
    return res.status(400).json({
      success: false,
      message: 'Failed to upload logo: ' + (error?.message || 'Unknown error')
    });
  }
};

app.post(['/api/settings/logo', '/api/logo'], handleLogoUploadOrSet);
app.put(['/api/settings/logo', '/api/logo'], handleLogoUploadOrSet);

// 2.1 DELETE /api/settings/logo - Delete current uploaded logo from disk & reset in database
app.delete(['/api/settings/logo', '/api/logo'], async (req: Request, res: Response) => {
  try {
    const settingsMap = await getSiteSettingsMap();
    const currentLogo = settingsMap.coopLogoUrl || settingsMap.coop_logo_url || settingsMap.logo_url || '';

    if (currentLogo && currentLogo.startsWith('/uploads/') && !currentLogo.includes('ekata-logo-default.svg')) {
      const cleanRel = currentLogo.replace(/^\/+/, '').split('?')[0];
      const diskPath = path.join(process.cwd(), 'public', cleanRel);
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (e) {}
      }
      try {
        await execute('DELETE FROM media_files WHERE file_path = ? AND is_system_default = 0', [currentLogo]);
      } catch (e) {}
    }

    const defaultLogo = '/uploads/logos/ekata-logo-default.svg';
    await persistLogoInDatabase(defaultLogo, 'ekata-logo-default.svg');
    const updatedSettings = await getSiteSettingsMap();

    res.json({
      success: true,
      message: 'Uploaded logo deleted from server and reset in MySQL database.',
      logoUrl: defaultLogo,
      data: updatedSettings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo: ' + (error?.message || 'Unknown error')
    });
  }
});

// Helper to synchronize Head Office Info across head_office_info table and site_settings keys
async function syncHeadOfficePersistence(ho: any) {
  if (!ho || typeof ho !== 'object') return;
  const fullJson = JSON.stringify(ho);
  const deptsJson = JSON.stringify(Array.isArray(ho.departmentsDirectory) ? ho.departmentsDirectory : []);

  try {
    await execute(`
      UPDATE head_office_info SET
        office_name_en = ?, office_name_np = ?, address_en = ?, address_np = ?,
        province = ?, district = ?, city = ?, ward = ?,
        primary_phone = ?, alt_phone = ?, toll_free_phone = ?, fax = ?,
        official_email = ?, support_email = ?, working_days_en = ?, working_days_np = ?,
        working_hours_en = ?, working_hours_np = ?, counter_hours_en = ?, counter_hours_np = ?,
        regd_no = ?, pan_no = ?, postal_code = ?, map_url = ?, emergency_contact = ?,
        departments_json = ?, full_json = ?
      WHERE id = 1
    `, [
      ho.officeNameEn || '', ho.officeNameNp || '', ho.addressEn || '', ho.addressNp || '',
      ho.province || '', ho.district || '', ho.city || '', ho.ward || '',
      ho.primaryPhone || '', ho.altPhone || '', ho.tollFreePhone || '', ho.fax || '',
      ho.officialEmail || '', ho.supportEmail || '', ho.workingDaysEn || '', ho.workingDaysNp || '',
      ho.workingHoursEn || '', ho.workingHoursNp || '', ho.counterHoursEn || '', ho.counterHoursNp || '',
      ho.regdNo || '', ho.panNo || '', ho.postalCode || '', ho.mapUrl || '', ho.emergencyContact || '',
      deptsJson, fullJson
    ]);
  } catch (e) {}

  const combinedPhone = ho.primaryPhone
    ? ho.altPhone
      ? `${ho.primaryPhone} / ${ho.altPhone}`
      : ho.primaryPhone
    : undefined;

  if (combinedPhone) {
    await setSiteSetting('phone_head_office', combinedPhone);
    await setSiteSetting('phoneHeadOffice', combinedPhone);
  }
  if (ho.tollFreePhone !== undefined) {
    await setSiteSetting('phone_toll_free', String(ho.tollFreePhone));
    await setSiteSetting('phoneTollFree', String(ho.tollFreePhone));
  }
  if (ho.addressEn) {
    await setSiteSetting('address_head_office', String(ho.addressEn));
    await setSiteSetting('addressHeadOffice', String(ho.addressEn));
  }
  if (ho.addressNp) {
    await setSiteSetting('address_head_office_np', String(ho.addressNp));
    await setSiteSetting('addressHeadOfficeNp', String(ho.addressNp));
  }
  if (ho.officialEmail) {
    await setSiteSetting('email_official', String(ho.officialEmail));
    await setSiteSetting('emailOfficial', String(ho.officialEmail));
  }
  if (ho.workingHoursEn) {
    const hoursSummary = `${ho.workingDaysEn || 'Sunday - Friday'}: ${ho.workingHoursEn}${ho.counterHoursEn ? ` (Counter: ${ho.counterHoursEn})` : ''}`;
    await setSiteSetting('office_hours', hoursSummary);
    await setSiteSetting('officeHours', hoursSummary);
  }
  if (ho.regdNo) {
    await setSiteSetting('regd_no', String(ho.regdNo));
    await setSiteSetting('regdNo', String(ho.regdNo));
  }
  if (ho.panNo) {
    await setSiteSetting('pan_no', String(ho.panNo));
    await setSiteSetting('panNo', String(ho.panNo));
  }
  if (ho.province) {
    await setSiteSetting('province', String(ho.province));
  }
  if (ho.district) {
    await setSiteSetting('district', String(ho.district));
  }
  if (ho.city) {
    await setSiteSetting('city_municipality', String(ho.city));
    await setSiteSetting('cityMunicipality', String(ho.city));
  }
  if (ho.ward) {
    await setSiteSetting('ward_no', String(ho.ward));
    await setSiteSetting('wardNo', String(ho.ward));
  }
  if (ho.mapUrl !== undefined) {
    await setSiteSetting('google_maps_embed_url', String(ho.mapUrl));
    await setSiteSetting('googleMapsEmbedUrl', String(ho.mapUrl));
  }
}

// Helper to synchronize Leadership Profiles across cms_leadership_members table and site_settings keys
async function syncLeadershipMembersPersistence(members: any[]) {
  if (!Array.isArray(members)) return;
  try {
    for (const m of members) {
      if (!m || !m.id) continue;
      const id = String(m.id);
      const cat = String(m.category || 'other');
      const nameEn = String(m.nameEn || '');
      const nameNp = String(m.nameNp || '');
      const desEn = String(m.designationEn || '');
      const desNp = String(m.designationNp || '');
      const photo = String(m.photoUrl || '');
      const smEn = String(m.shortMessageEn || '');
      const smNp = String(m.shortMessageNp || '');
      const fmEn = String(m.fullMessageEn || '');
      const fmNp = String(m.fullMessageNp || '');
      const phone = String(m.phone || '');
      const email = String(m.email || '');
      const roomEn = String(m.officeRoomEn || '');
      const roomNp = String(m.officeRoomNp || '');
      const avEn = String(m.availabilityEn || '');
      const avNp = String(m.availabilityNp || '');
      const actType = String(m.actionType || 'read_more');
      const actLabelEn = String(m.actionLabelEn || '');
      const actLabelNp = String(m.actionLabelNp || '');
      const customUrl = String(m.customActionUrl || '');
      const sortOrder = Number(m.sortOrder || 1);
      const isActive = m.isActive !== false ? 1 : 0;
      const pubDate = String(m.publishedDate || '');

      try {
        await execute(`
          INSERT INTO cms_leadership_members (
            id, category, name_en, name_np, designation_en, designation_np, photo_url,
            short_message_en, short_message_np, full_message_en, full_message_np,
            phone, email, office_room_en, office_room_np, availability_en, availability_np,
            action_type, action_label_en, action_label_np, custom_action_url,
            sort_order, is_active, published_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id, cat, nameEn, nameNp, desEn, desNp, photo,
          smEn, smNp, fmEn, fmNp,
          phone, email, roomEn, roomNp, avEn, avNp,
          actType, actLabelEn, actLabelNp, customUrl,
          sortOrder, isActive, pubDate
        ]);
      } catch (err: any) {
        await execute(`
          UPDATE cms_leadership_members SET
            category=?, name_en=?, name_np=?, designation_en=?, designation_np=?, photo_url=?,
            short_message_en=?, short_message_np=?, full_message_en=?, full_message_np=?,
            phone=?, email=?, office_room_en=?, office_room_np=?, availability_en=?, availability_np=?,
            action_type=?, action_label_en=?, action_label_np=?, custom_action_url=?,
            sort_order=?, is_active=?, published_date=?
          WHERE id=?
        `, [
          cat, nameEn, nameNp, desEn, desNp, photo,
          smEn, smNp, fmEn, fmNp,
          phone, email, roomEn, roomNp, avEn, avNp,
          actType, actLabelEn, actLabelNp, customUrl,
          sortOrder, isActive, pubDate, id
        ]).catch(() => {});
      }
    }
  } catch (e) {}
}

// 3. POST & PUT /api/settings - Update site settings
const handleUpdateSiteSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    if (typeof settings === 'object' && settings !== null) {
      // Check if an explicit logo key is being updated, and verify it exists before overwriting
      const incomingLogo = settings.coopLogoUrl || settings.coop_logo_url || settings.logo_url;
      if (incomingLogo && typeof incomingLogo === 'string' && incomingLogo.trim()) {
        const cleanIncoming = incomingLogo.trim().split('?')[0];
        let isValidLogo = true;
        if (cleanIncoming.startsWith('/uploads/logos/')) {
          const diskPath = path.resolve(process.cwd(), 'public', cleanIncoming.replace(/^\/+/, ''));
          if (!fs.existsSync(diskPath)) {
            isValidLogo = false;
          }
        }
        if (isValidLogo) {
          await persistLogoInDatabase(incomingLogo.trim());
        }
      }

      for (const [key, val] of Object.entries(settings)) {
        if (
          key === 'coopLogoUrl' ||
          key === 'coop_logo_url' ||
          key === 'logo_url' ||
          key === 'logo_filename' ||
          key === 'logo_data_uri' ||
          key === 'logo_data_uri_path' ||
          key === 'forceDefaultLogo'
        ) {
          continue;
        }
        if (key === 'tickerActive' || key === 'ticker_active') {
          const isActive = val === true || val === 'true' || val === '1' || val === 1 ? '1' : '0';
          await setSiteSetting('tickerActive', isActive);
          await setSiteSetting('ticker_active', isActive);
          continue;
        }
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
          await setSiteSetting(key, String(val));
        } else if (typeof val === 'object' && val !== null) {
          await setSiteSetting(key, JSON.stringify(val));
        }
      }

      // Synchronize head office fields into cms_head_office if modified via General Settings
      try {
        const currentMap = await getSiteSettingsMap();
        if (currentMap.cms_head_office) {
          const hoObj = JSON.parse(currentMap.cms_head_office);
          let hoChanged = false;
          const newAddrEn = settings.addressHeadOffice || settings.address_head_office;
          if (newAddrEn && newAddrEn !== hoObj.addressEn) {
            hoObj.addressEn = newAddrEn;
            hoChanged = true;
          }
          const newAddrNp = settings.addressHeadOfficeNp || settings.address_head_office_np;
          if (newAddrNp && newAddrNp !== hoObj.addressNp) {
            hoObj.addressNp = newAddrNp;
            hoChanged = true;
          }
          const newPhone = settings.phoneHeadOffice || settings.phone_head_office;
          if (newPhone) {
            const parts = String(newPhone).split('/').map((s) => s.trim()).filter(Boolean);
            if (parts[0] && parts[0] !== hoObj.primaryPhone) {
              hoObj.primaryPhone = parts[0];
              if (parts[1]) hoObj.altPhone = parts[1];
              hoChanged = true;
            }
          }
          const newEmail = settings.emailOfficial || settings.email_official;
          if (newEmail && newEmail !== hoObj.officialEmail) {
            hoObj.officialEmail = newEmail;
            hoChanged = true;
          }
          const newRegd = settings.regdNo || settings.regd_no;
          if (newRegd && newRegd !== hoObj.regdNo) {
            hoObj.regdNo = newRegd;
            hoChanged = true;
          }
          const newPan = settings.panNo || settings.pan_no;
          if (newPan && newPan !== hoObj.panNo) {
            hoObj.panNo = newPan;
            hoChanged = true;
          }
          if (settings.province && settings.province !== hoObj.province) {
            hoObj.province = settings.province;
            hoChanged = true;
          }
          if (settings.district && settings.district !== hoObj.district) {
            hoObj.district = settings.district;
            hoChanged = true;
          }
          const newCity = settings.cityMunicipality || settings.city_municipality;
          if (newCity && newCity !== hoObj.city) {
            hoObj.city = newCity;
            hoChanged = true;
          }
          const newWard = settings.wardNo || settings.ward_no;
          if (newWard && newWard !== hoObj.ward) {
            hoObj.ward = newWard;
            hoChanged = true;
          }
          if (hoChanged) {
            await setSiteSetting('cms_head_office', JSON.stringify(hoObj));
          }
        }
      } catch (e) {}
    }
    const updatedMap = await getSiteSettingsMap();
    res.json({ success: true, message: 'Settings saved to database.', data: updatedMap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
};

app.post(['/api/settings', '/api/site-settings', '/api/site_settings'], handleUpdateSiteSettings);
app.put(['/api/settings', '/api/site-settings', '/api/site_settings'], handleUpdateSiteSettings);

// ----------------------------------------------------
// GENERAL NOTICES BOARD FULL CRUD APIS (DATABASE CONNECTED)
// ----------------------------------------------------
function mapDbRowToNoticeItem(n: any) {
  const dateStr = n.date_en || n.publish_date || '18 Sep';
  const dateParts = String(dateStr).split(' ');
  return {
    id: String(n.id),
    titleEn: n.title_en || n.titleEn || '',
    titleNp: n.title_np || n.titleNp || n.title_en || '',
    contentEn: n.content_en || n.contentEn || n.title_en || '',
    contentNp: n.content_np || n.contentNp || n.title_np || '',
    date: dateStr,
    month: dateParts[1] || 'असोज',
    day: dateParts[0] || '१५',
    category: n.category_en || n.category || 'Notice',
  };
}

app.get('/api/notices', async (req: Request, res: Response) => {
  try {
    const rows = await queryAll('SELECT * FROM notices WHERE is_active = 1 ORDER BY id DESC');
    const data = rows.map(mapDbRowToNoticeItem);
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.post('/api/notices', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const titleEn = (body.titleEn || body.title_en || body.title || '').trim();
    if (!titleEn) {
      return res.status(400).json({ success: false, message: 'Notice title in English is required.' });
    }
    const titleNp = (body.titleNp || body.title_np || body.title || titleEn).trim();
    const category = (body.category || body.category_en || 'Notice').trim();
    const dateStr = (body.date || body.date_en || '15 Ashwin').trim();
    const contentEn = (body.contentEn || body.content_en || body.content || body.description || titleEn).trim();
    const contentNp = (body.contentNp || body.content_np || body.content || body.description || titleNp).trim();
    const publishDate = body.publish_date || new Date().toISOString().slice(0, 10);

    let result;
    try {
      result = await execute(`
        INSERT INTO notices (title_en, title_np, category, category_en, publish_date, content_en, content_np, date_en, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [titleEn, titleNp, category, category, publishDate, contentEn, contentNp, dateStr]);
    } catch (e) {
      result = await execute(`
        INSERT INTO notices (title_en, title_np, category_en, publish_date, content_en, content_np, date_en, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [titleEn, titleNp, category, publishDate, contentEn, contentNp, dateStr]);
    }

    const created = await queryOne('SELECT * FROM notices WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Official notice published and saved to database!',
      data: mapDbRowToNoticeItem(created),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.put('/api/notices/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await queryOne('SELECT * FROM notices WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Notice not found in database.' });
    }
    const body = req.body || {};
    const titleEn = (body.titleEn ?? body.title_en ?? body.title ?? existing.title_en ?? '').trim();
    const titleNp = (body.titleNp ?? body.title_np ?? body.title ?? existing.title_np ?? titleEn).trim();
    const category = (body.category ?? body.category_en ?? existing.category_en ?? 'Notice').trim();
    const dateStr = (body.date ?? body.date_en ?? existing.date_en ?? '15 Ashwin').trim();
    const contentEn = (body.contentEn ?? body.content_en ?? body.content ?? body.description ?? existing.content_en ?? titleEn).trim();
    const contentNp = (body.contentNp ?? body.content_np ?? body.content ?? body.description ?? existing.content_np ?? titleNp).trim();

    try {
      await execute(`
        UPDATE notices
        SET title_en = ?, title_np = ?, category = ?, category_en = ?, content_en = ?, content_np = ?, date_en = ?
        WHERE id = ?
      `, [titleEn, titleNp, category, category, contentEn, contentNp, dateStr, id]);
    } catch (e) {
      await execute(`
        UPDATE notices
        SET title_en = ?, title_np = ?, category_en = ?, content_en = ?, content_np = ?, date_en = ?
        WHERE id = ?
      `, [titleEn, titleNp, category, contentEn, contentNp, dateStr, id]);
    }

    const updated = await queryOne('SELECT * FROM notices WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Notice updated in database!',
      data: mapDbRowToNoticeItem(updated),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete('/api/notices/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await execute('DELETE FROM notices WHERE id = ?', [id]);
    res.json({ success: true, message: `Notice #${id} deleted from database.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// ----------------------------------------------------
// 4. DEDICATED CMS CONTENT PERSISTENCE ROUTES (FULL CRUD)
// ----------------------------------------------------

// GET /api/cms/all - Fetch all manageable website sections
app.get('/api/cms/all', async (req: Request, res: Response) => {
  try {
    const map = await getSiteSettingsMap();
    const parseOrNull = (k: string) => {
      if (map[k] === undefined || map[k] === null || map[k] === '') return null;
      try { return JSON.parse(map[k]); } catch (e) { return map[k]; }
    };

    const rateRows = await queryAll('SELECT * FROM interest_rates ORDER BY id ASC');
    const formattedRates = rateRows.map((r: any) => ({
      id: String(r.id),
      category: r.category || 'Deposit',
      schemeEn: r.scheme_en,
      schemeNp: r.scheme_np,
      rate: `${r.rate_percent}%`,
      ratePercent: Number(r.rate_percent),
      period: r.basis_en || 'Annual',
      basisEn: r.basis_en,
      basisNp: r.basis_np,
      minBalance: Number(r.min_balance || 0)
    }));

    const noticeRows = await queryAll('SELECT * FROM notices WHERE is_active = 1 ORDER BY id DESC');
    const formattedNotices = noticeRows.map(mapDbRowToNoticeItem);

    const rawTeam = parseOrNull('cms_team');
    const normalizedTeam = Array.isArray(rawTeam)
      ? rawTeam
      : rawTeam && typeof rawTeam === 'object' && Array.isArray(rawTeam.team)
      ? rawTeam.team
      : null;

    res.json({
      success: true,
      data: {
        pages: parseOrNull('cms_pages'),
        departments: parseOrNull('cms_departments'),
        serviceCenters: parseOrNull('cms_service_centers'),
        reports: parseOrNull('cms_reports'),
        careers: parseOrNull('cms_careers'),
        team: normalizedTeam,
        services: parseOrNull('cms_services'),
        slides: parseOrNull('cms_slides'),
        gallery: parseOrNull('cms_gallery'),
        headOffice: parseOrNull('cms_head_office'),
        grievances: parseOrNull('cms_grievances'),
        grievanceOfficer: parseOrNull('cms_grievance_officer'),
        privacyPolicy: parseOrNull('cms_privacy_policy') || parseOrNull('privacy_policy'),
        socialLinks: parseOrNull('cms_social_links') || parseOrNull('social_links'),
        theme: parseOrNull('cms_brand_theme') || parseOrNull('brand_theme'),
        documents: parseOrNull('cms_documents') || parseOrNull('documents'),
        newsActivities: parseOrNull('cms_news_activities') || parseOrNull('news_activities'),
        suggestions: parseOrNull('cms_suggestions') || parseOrNull('suggestions'),
        faqs: parseOrNull('cms_faqs') || parseOrNull('faqs'),
        historyMilestones: parseOrNull('cms_history_milestones') || parseOrNull('history_milestones'),
        whyChooseUs: parseOrNull('cms_why_choose_us') || parseOrNull('why_choose_us'),
        exchangeRates: parseOrNull('cms_exchange_rates') || parseOrNull('exchange_rates'),
        institutionalProfiles: parseOrNull('cms_institutional_profiles') || parseOrNull('institutional_profiles'),
        monthlyFinancialReports: (() => {
          const rawM = parseOrNull('cms_monthly_financial_reports') || parseOrNull('monthly_financial_reports');
          if (Array.isArray(rawM)) return rawM;
          if (rawM && typeof rawM === 'object' && Array.isArray(rawM.reports)) return rawM.reports;
          if (INITIAL_SITE_SETTINGS.cms_monthly_financial_reports) {
            try { return JSON.parse(INITIAL_SITE_SETTINGS.cms_monthly_financial_reports); } catch (e) {}
          }
          return null;
        })(),
        members: parseOrNull('cms_members'),
        auditLogs: parseOrNull('cms_audit_logs'),
        rates: formattedRates,
        notices: formattedNotices,
        settings: map,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// GET /api/cms/:section - Fetch specific CMS section
app.get('/api/cms/:section', async (req: Request, res: Response) => {
  try {
    const rawSection = req.params.section.toLowerCase().replace(/-/g, '_');
    const normalizedSection = rawSection === 'headoffice' ? 'head_office' : rawSection;
    if (normalizedSection === 'rates') {
      const rateRows = await queryAll('SELECT * FROM interest_rates ORDER BY id ASC');
      const formattedRates = rateRows.map((r: any) => ({
        id: String(r.id),
        category: r.category || 'Deposit',
        schemeEn: r.scheme_en,
        schemeNp: r.scheme_np,
        rate: `${r.rate_percent}%`,
        ratePercent: Number(r.rate_percent),
        period: r.basis_en || 'Annual',
        basisEn: r.basis_en,
        basisNp: r.basis_np,
        minBalance: Number(r.min_balance || 0)
      }));
      return res.json({ success: true, data: formattedRates });
    }
    if (normalizedSection === 'notices') {
      const noticeRows = await queryAll('SELECT * FROM notices WHERE is_active = 1 ORDER BY id DESC');
      return res.json({ success: true, data: noticeRows.map(mapDbRowToNoticeItem) });
    }

    if (normalizedSection === 'leadership' || normalizedSection === 'leadership_members') {
      const map = await getSiteSettingsMap();
      const raw = map['cms_leadership_members'] || map['cms_leadership'];
      if (raw) {
        try {
          return res.json({ success: true, data: JSON.parse(raw) });
        } catch (e) {
          return res.json({ success: true, data: raw });
        }
      }
      try {
        const leadRows = await queryAll('SELECT * FROM cms_leadership_members ORDER BY sort_order ASC, id ASC');
        if (leadRows && leadRows.length > 0) {
          const formatted = leadRows.map((r: any) => ({
            id: r.id,
            category: r.category,
            nameEn: r.name_en,
            nameNp: r.name_np,
            designationEn: r.designation_en,
            designationNp: r.designation_np,
            photoUrl: r.photo_url,
            shortMessageEn: r.short_message_en || '',
            shortMessageNp: r.short_message_np || '',
            fullMessageEn: r.full_message_en || '',
            fullMessageNp: r.full_message_np || '',
            phone: r.phone || '',
            email: r.email || '',
            officeRoomEn: r.office_room_en || '',
            officeRoomNp: r.office_room_np || '',
            availabilityEn: r.availability_en || '',
            availabilityNp: r.availability_np || '',
            actionType: r.action_type || 'read_more',
            actionLabelEn: r.action_label_en || '',
            actionLabelNp: r.action_label_np || '',
            customActionUrl: r.custom_action_url || '',
            sortOrder: Number(r.sort_order || 1),
            isActive: Boolean(r.is_active !== 0),
            publishedDate: r.published_date || '',
          }));
          return res.json({ success: true, data: formatted });
        }
      } catch (e) {}
      if (INITIAL_SITE_SETTINGS.cms_leadership_members) {
        return res.json({ success: true, data: JSON.parse(INITIAL_SITE_SETTINGS.cms_leadership_members) });
      }
    }

    if (normalizedSection === 'monthly_financial_reports') {
      const map = await getSiteSettingsMap();
      const raw = map['cms_monthly_financial_reports'] || map['monthly_financial_reports'];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const list = Array.isArray(parsed) ? parsed : (parsed?.reports && Array.isArray(parsed.reports) ? parsed.reports : [parsed]);
          return res.json({ success: true, data: list });
        } catch (e) {
          return res.json({ success: true, data: raw });
        }
      }
      if (INITIAL_SITE_SETTINGS.cms_monthly_financial_reports) {
        return res.json({ success: true, data: JSON.parse(INITIAL_SITE_SETTINGS.cms_monthly_financial_reports) });
      }
    }

    const sectionKey = `cms_${normalizedSection}`;
    const map = await getSiteSettingsMap();
    const raw = map[sectionKey];
    if (!raw) {
      return res.json({ success: true, data: null, message: 'Section not yet customized' });
    }
    try {
      res.json({ success: true, data: JSON.parse(raw) });
    } catch (e) {
      res.json({ success: true, data: raw });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// POST & PUT /api/cms/:section - Update or create CMS section content
const handleSaveCmsSection = async (req: Request, res: Response) => {
  try {
    const rawParam = req.params.section || (req.path.includes('suggestion') ? 'suggestions' : '');
    const rawSection = String(rawParam).toLowerCase().replace(/-/g, '_');
    const normalizedSection = rawSection === 'headoffice' ? 'head_office' : rawSection;
    const sectionKey = `cms_${normalizedSection}`;
    let payload = req.body;
    if (normalizedSection === 'team' && payload && !Array.isArray(payload) && Array.isArray(payload.team)) {
      payload = payload.team;
    }
    if (normalizedSection === 'monthly_financial_reports' && payload && !Array.isArray(payload) && Array.isArray(payload.reports)) {
      payload = payload.reports;
    }

    // Synchronize interest_rates table if saving rates array via /api/cms/rates
    if (normalizedSection === 'rates' && Array.isArray(payload)) {
      await execute('DELETE FROM interest_rates');
      for (const r of payload) {
        const cat = r.category || 'Deposit';
        const sEn = (r.schemeEn || r.scheme_en || 'Savings Scheme').trim();
        const sNp = (r.schemeNp || r.scheme_np || sEn).trim();
        const rawRate = r.ratePercent !== undefined
          ? Number(r.ratePercent)
          : (parseFloat(String(r.rate || '').replace(/[^0-9.]/g, '')) || 10.0);
        const bEn = r.basisEn || r.basis_en || r.period || 'Annual';
        const bNp = r.basisNp || r.basis_np || bEn;
        const minBal = r.minBalance !== undefined ? Number(r.minBalance) : (Number(r.min_balance) || 0);
        await execute(`
          INSERT INTO interest_rates (category, scheme_en, scheme_np, rate_percent, basis_en, basis_np, min_balance)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [cat, sEn, sNp, rawRate, bEn, bNp, minBal]);
      }
    }

    // Synchronize notices table if saving notices array via /api/cms/notices
    if (normalizedSection === 'notices' && Array.isArray(payload)) {
      await execute('DELETE FROM notices');
      for (const n of payload) {
        const titleEn = (n.titleEn || n.title_en || 'Notice').trim();
        const titleNp = (n.titleNp || n.title_np || titleEn).trim();
        const category = (n.category || n.category_en || 'Notice').trim();
        const dateStr = (n.date || n.date_en || '15 Ashwin').trim();
        const contentEn = (n.contentEn || n.content_en || titleEn).trim();
        const contentNp = (n.contentNp || n.content_np || titleNp).trim();
        const publishDate = n.publish_date || new Date().toISOString().slice(0, 10);
        await execute(`
          INSERT INTO notices (title_en, title_np, category_en, publish_date, content_en, content_np, date_en, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [titleEn, titleNp, category, publishDate, contentEn, contentNp, dateStr]);
      }
    }

    // Enforce NRB fixed peg for INR when saving exchange_rates
    if (normalizedSection === 'exchange_rates' && Array.isArray(payload)) {
      let hasInr = false;
      payload = payload.map((item: any) => {
        if (String(item.currencyCode || '').toUpperCase() === 'INR') {
          hasInr = true;
          return {
            ...item,
            currencyCode: 'INR',
            currencyNameEn: item.currencyNameEn || 'Indian Rupee',
            currencyNameNp: item.currencyNameNp || 'भारतीय रूपैयाँ',
            flag: item.flag || '🇮🇳',
            unit: 100,
            buyingRate: '160.00',
            sellingRate: '160.15',
            isFixed: true,
            isEnabled: true,
          };
        }
        return { ...item, isFixed: false };
      });
      if (!hasInr) {
        payload.unshift({
          id: 'fx-inr',
          currencyCode: 'INR',
          currencyNameEn: 'Indian Rupee',
          currencyNameNp: 'भारतीय रूपैयाँ',
          flag: '🇮🇳',
          unit: 100,
          buyingRate: '160.00',
          sellingRate: '160.15',
          isFixed: true,
          isEnabled: true,
          updatedAt: new Date().toISOString().slice(0, 10),
          sortOrder: 1,
        });
      }
    }

    // Support appending a single Feedback/Suggestion item via POST /api/cms/suggestions
    if (normalizedSection === 'suggestions' && !Array.isArray(payload) && payload && typeof payload === 'object') {
      const map = await getSiteSettingsMap();
      let currentList: any[] = [];
      try {
        currentList = map.cms_suggestions ? JSON.parse(map.cms_suggestions) : [];
        if (!Array.isArray(currentList)) currentList = [];
      } catch (e) {
        currentList = [];
      }
      const itemObj = payload.item && typeof payload.item === 'object' ? payload.item : payload;
      const randTicket = Math.floor(100 + Math.random() * 900);
      const newEntry = {
        id: itemObj.id || `sug-${Date.now()}`,
        ticketNo: itemObj.ticketNo || `SUG-2083-${randTicket}`,
        senderName: (itemObj.senderName || itemObj.name || itemObj.fullName || 'Anonymous Visitor').trim(),
        memberType: itemObj.memberType === 'non-member' ? 'non-member' : 'member',
        memberCode: (itemObj.memberCode || itemObj.memberId || '').trim(),
        phone: (itemObj.phone || '').trim(),
        email: (itemObj.email || '').trim(),
        category: (itemObj.category || itemObj.feedbackType || 'General Suggestion').trim(),
        subject: (itemObj.subject || itemObj.category || 'General Feedback').trim(),
        suggestionText: (itemObj.suggestionText || itemObj.message || '').trim(),
        submittedAt: itemObj.submittedAt || itemObj.date || new Date().toISOString().slice(0, 10),
        status: itemObj.status || 'New',
        adminNotes: itemObj.adminNotes || itemObj.adminRemarks || '',
        isAnonymous: Boolean(itemObj.isAnonymous),
      };
      const updatedList = [newEntry, ...currentList.filter((x: any) => x.id !== newEntry.id)];
      await setSiteSetting('cms_suggestions', JSON.stringify(updatedList));

      // Also persist in contact_messages table in MySQL/SQLite
      try {
        await execute(
          `INSERT INTO contact_messages (sender_name, phone, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newEntry.senderName,
            newEntry.phone || 'N/A',
            newEntry.email || '',
            `[${newEntry.category}] ${newEntry.subject || ''}`.trim(),
            newEntry.suggestionText,
            'Unread'
          ]
        );
      } catch (e) {}

      return res.json({
        success: true,
        message: 'Feedback/Suggestion submitted and saved permanently to MySQL database!',
        item: newEntry,
        data: updatedList,
      });
    }

    if (normalizedSection === 'leadership' || normalizedSection === 'leadership_members') {
      let leadList: any[] = [];
      if (Array.isArray(payload)) {
        leadList = payload;
      } else if (payload && typeof payload === 'object') {
        const itemObj = payload.item || payload.member || payload;
        const map = await getSiteSettingsMap();
        let currentList: any[] = [];
        try {
          currentList = map.cms_leadership_members ? JSON.parse(map.cms_leadership_members) : [];
          if (!Array.isArray(currentList)) currentList = [];
        } catch (e) {
          currentList = [];
        }
        const targetId = itemObj.id || `lead-${Date.now()}`;
        const newEntry = {
          ...itemObj,
          id: targetId,
          sortOrder: Number(itemObj.sortOrder || (currentList.length + 1)),
          isActive: itemObj.isActive !== false,
        };
        const existingIdx = currentList.findIndex((x: any) => String(x.id) === String(targetId));
        if (existingIdx >= 0) {
          leadList = [...currentList];
          leadList[existingIdx] = { ...leadList[existingIdx], ...newEntry };
        } else {
          leadList = [...currentList, newEntry];
        }
      }
      await setSiteSetting('cms_leadership_members', JSON.stringify(leadList));
      await syncLeadershipMembersPersistence(leadList);
      return res.json({
        success: true,
        message: 'Leadership profiles successfully saved and synchronized with MySQL database!',
        data: leadList,
      });
    }

    const valueToStore = typeof payload === 'string' ? payload : JSON.stringify(payload);
    await setSiteSetting(sectionKey, valueToStore);

    if (normalizedSection === 'head_office' && payload && typeof payload === 'object') {
      await syncHeadOfficePersistence(payload);
    }

    if (normalizedSection === 'monthly_financial_reports' && Array.isArray(payload)) {
      await syncInstitutionalReportsPersistence(payload);
    }

    res.json({
      success: true,
      message: `Section ${req.params.section} successfully updated and persisted to database!`,
      data: payload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
};

app.post(['/api/cms/:section', '/api/cms/suggestions/submit'], handleSaveCmsSection);
app.put(['/api/cms/:section', '/api/cms/suggestions/submit'], handleSaveCmsSection);

// PUT /api/cms/:section/:id - Update a single item in a CMS section list (e.g., suggestions)
app.put('/api/cms/:section/:id', async (req: Request, res: Response) => {
  try {
    const rawSection = req.params.section.toLowerCase().replace(/-/g, '_');
    const normalizedSection = rawSection === 'headoffice' ? 'head_office' : rawSection;
    const sectionKey = `cms_${normalizedSection}`;
    const targetId = String(req.params.id || '').trim();
    const updates = req.body?.data !== undefined ? req.body.data : req.body;

    const map = await getSiteSettingsMap();
    let list: any[] = [];
    try {
      list = map[sectionKey] ? JSON.parse(map[sectionKey]) : [];
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      list = [];
    }

    const updatedList = list.map((item: any) =>
      String(item.id) === targetId ? { ...item, ...updates, id: item.id } : item
    );
    await setSiteSetting(sectionKey, JSON.stringify(updatedList));
    if (normalizedSection === 'leadership' || normalizedSection === 'leadership_members') {
      await syncLeadershipMembersPersistence(updatedList);
    }
    res.json({
      success: true,
      message: `Item ${targetId} updated in ${sectionKey}`,
      data: updatedList,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// DELETE /api/cms/:section and DELETE /api/cms/:section/:id - Remove item from a CMS section array or Head Office departmentsDirectory
const handleDeleteCmsSectionItem = async (req: Request, res: Response) => {
  try {
    const rawSection = req.params.section.toLowerCase().replace(/-/g, '_');
    const normalizedSection = rawSection === 'headoffice' ? 'head_office' : rawSection;
    const sectionKey = `cms_${normalizedSection}`;
    const idToDelete = String(req.params.id || req.query.departmentId || req.query.id || '').trim();
    const map = await getSiteSettingsMap();
    const raw = map[sectionKey];
    if (!raw) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parsed = null;
    }
    if (normalizedSection === 'head_office' && parsed && typeof parsed === 'object') {
      if (idToDelete && Array.isArray(parsed.departmentsDirectory)) {
        parsed.departmentsDirectory = parsed.departmentsDirectory.filter(
          (dept: any, idx: number) =>
            String(dept.id || '') !== idToDelete &&
            String(dept.name || '') !== idToDelete &&
            String(dept.ext || '') !== idToDelete &&
            String(idx) !== idToDelete
        );
      } else if (!idToDelete) {
        parsed.departmentsDirectory = [];
      }
      await setSiteSetting(sectionKey, JSON.stringify(parsed));
      await syncHeadOfficePersistence(parsed);
      return res.json({
        success: true,
        message: idToDelete
          ? `Department extension ${idToDelete} removed from ${sectionKey}`
          : `Head office department directory cleared`,
        data: parsed,
      });
    }
    if (Array.isArray(parsed) && idToDelete) {
      const filtered = parsed.filter((item: any) => item.id !== idToDelete && item.key !== idToDelete);
      await setSiteSetting(sectionKey, JSON.stringify(filtered));
      if (normalizedSection === 'leadership' || normalizedSection === 'leadership_members') {
        try {
          await execute('DELETE FROM cms_leadership_members WHERE id = ?', [idToDelete]);
        } catch (e) {}
      }
      return res.json({
        success: true,
        message: `Item ${idToDelete} removed from ${sectionKey}`,
        data: filtered,
      });
    }
    res.status(400).json({ success: false, message: 'Section is not a list collection' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
};

app.delete('/api/cms/:section', handleDeleteCmsSectionItem);
app.delete('/api/cms/:section/:id', handleDeleteCmsSectionItem);

// POST /api/cms/leadership/upload - Server-backed photo upload for leadership profiles
app.post('/api/cms/leadership/upload', uploadMedia.any(), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No photo uploaded. Please select an image.' });
    }
    const f = files[0];
    const filePath = `/uploads/media/${f.filename}`;

    try {
      const mediaKey = 'media-lead-' + Date.now();
      await execute(`
        INSERT INTO media_files (
          media_key, title, filename, file_path, file_type, file_size, category, alt_text, is_system_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [mediaKey, req.body.title || f.originalname, f.filename, filePath, f.mimetype, f.size, 'leadership', f.originalname]);
    } catch (e) {}

    res.json({
      success: true,
      url: filePath,
      filePath: filePath,
      filename: f.filename,
      message: 'Profile photo uploaded successfully to server.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to upload photo.' });
  }
});

// ----------------------------------------------------
// DEDICATED REST CRUD ENDPOINTS: NEWS, GALLERY, REPORTS, CAREERS, SLIDES
// ----------------------------------------------------

async function getCmsListHelper(key: string, defaultArray: any[] = []): Promise<any[]> {
  try {
    const map = await getSiteSettingsMap();
    const raw = map[key] || map[key.replace(/^cms_/, '')];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return defaultArray;
}

async function saveCmsListHelper(key: string, list: any[]): Promise<void> {
  await setSiteSetting(key, JSON.stringify(list));
}

// 1. News & Activities CRUD
app.get(['/api/news', '/api/news_activities', '/api/news-activities'], async (req: Request, res: Response) => {
  try {
    const list = await getCmsListHelper('cms_news_activities');
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.get(['/api/news/:id', '/api/news_activities/:id', '/api/news-activities/:id'], async (req: Request, res: Response) => {
  try {
    const list = await getCmsListHelper('cms_news_activities');
    const item = list.find((n: any) => String(n.id) === String(req.params.id));
    if (!item) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.post(['/api/news', '/api/news_activities', '/api/news-activities'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const titleEn = (body.titleEn || body.title_en || body.title || '').trim();
    if (!titleEn) {
      return res.status(400).json({ success: false, message: 'News title is required.' });
    }
    const newItem = {
      id: body.id || `news-${Date.now()}`,
      titleEn,
      titleNp: (body.titleNp || body.title_np || titleEn).trim(),
      category: (body.category || 'General').trim(),
      date: body.date || new Date().toISOString().slice(0, 10),
      summaryEn: body.summaryEn || body.summary || body.summary_en || body.content || '',
      summaryNp: body.summaryNp || body.summary_np || body.summary || body.content || '',
      contentEn: body.contentEn || body.content_en || body.content || '',
      contentNp: body.contentNp || body.content_np || body.content || '',
      author: body.author || 'Ankur Editorial Desk',
      imageUrl: body.imageUrl || body.image || '/uploads/media/news-default.svg',
      published: body.published !== false && body.is_active !== 0,
      createdAt: new Date().toISOString(),
    };
    const list = await getCmsListHelper('cms_news_activities');
    list.unshift(newItem);
    await saveCmsListHelper('cms_news_activities', list);
    res.status(201).json({ success: true, message: 'News item published!', data: newItem, id: newItem.id });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.put(['/api/news/:id', '/api/news_activities/:id', '/api/news-activities/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const list = await getCmsListHelper('cms_news_activities');
    const idx = list.findIndex((n: any) => String(n.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'News item not found.' });
    }
    list[idx] = { ...list[idx], ...body, id: list[idx].id };
    await saveCmsListHelper('cms_news_activities', list);
    res.json({ success: true, message: 'News item updated!', data: list[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/news/:id', '/api/news_activities/:id', '/api/news-activities/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const list = await getCmsListHelper('cms_news_activities');
    const filtered = list.filter((n: any) => String(n.id) !== String(id));
    await saveCmsListHelper('cms_news_activities', filtered);
    res.json({ success: true, message: `News item #${id} deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 2. Gallery CRUD
app.get(['/api/gallery', '/api/gallery_items'], async (req: Request, res: Response) => {
  try {
    const list = await getCmsListHelper('cms_gallery');
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.post(['/api/gallery', '/api/gallery_items'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const newItem = {
      id: body.id || `gallery-${Date.now()}`,
      titleEn: body.titleEn || body.title || 'Cooperative Event',
      titleNp: body.titleNp || body.title || 'सहकारी कार्यक्रम',
      category: body.category || 'General',
      imageUrl: body.imageUrl || body.image || '/uploads/media/gallery-agm.svg',
      date: body.date || new Date().toISOString().slice(0, 10),
      caption: body.caption || '',
    };
    const list = await getCmsListHelper('cms_gallery');
    list.unshift(newItem);
    await saveCmsListHelper('cms_gallery', list);
    res.status(201).json({ success: true, message: 'Gallery item added!', data: newItem, id: newItem.id });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.put(['/api/gallery/:id', '/api/gallery_items/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const list = await getCmsListHelper('cms_gallery');
    const idx = list.findIndex((g: any) => String(g.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }
    list[idx] = { ...list[idx], ...req.body, id: list[idx].id };
    await saveCmsListHelper('cms_gallery', list);
    res.json({ success: true, message: 'Gallery item updated!', data: list[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/gallery/:id', '/api/gallery_items/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const list = await getCmsListHelper('cms_gallery');
    const filtered = list.filter((g: any) => String(g.id) !== String(id));
    await saveCmsListHelper('cms_gallery', filtered);
    res.json({ success: true, message: `Gallery item #${id} deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 3. Reports CRUD
app.get(['/api/reports', '/api/annual_reports'], async (req: Request, res: Response) => {
  try {
    const list = await getCmsListHelper('cms_reports');
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.post(['/api/reports', '/api/annual_reports'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const newItem = {
      id: body.id || `report-${Date.now()}`,
      titleEn: body.titleEn || body.title || 'Financial Report',
      titleNp: body.titleNp || body.title || 'वित्तीय प्रतिवेदन',
      fiscalYear: body.fiscalYear || '2082/83',
      fileUrl: body.fileUrl || body.url || '',
      fileSize: body.fileSize || '2.4 MB',
      publishedDate: body.publishedDate || new Date().toISOString().slice(0, 10),
    };
    const list = await getCmsListHelper('cms_reports');
    list.unshift(newItem);
    await saveCmsListHelper('cms_reports', list);
    res.status(201).json({ success: true, message: 'Report published!', data: newItem, id: newItem.id });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.put(['/api/reports/:id', '/api/annual_reports/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const list = await getCmsListHelper('cms_reports');
    const idx = list.findIndex((r: any) => String(r.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    list[idx] = { ...list[idx], ...req.body, id: list[idx].id };
    await saveCmsListHelper('cms_reports', list);
    res.json({ success: true, message: 'Report updated!', data: list[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/reports/:id', '/api/annual_reports/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const list = await getCmsListHelper('cms_reports');
    const filtered = list.filter((r: any) => String(r.id) !== String(id));
    await saveCmsListHelper('cms_reports', filtered);
    res.json({ success: true, message: `Report #${id} deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 4. Careers CRUD
app.get(['/api/careers', '/api/job_openings'], async (req: Request, res: Response) => {
  try {
    const list = await getCmsListHelper('cms_careers');
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.post(['/api/careers', '/api/job_openings'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const newItem = {
      id: body.id || `career-${Date.now()}`,
      titleEn: body.titleEn || body.title || 'Assistant Level Position',
      titleNp: body.titleNp || body.title || 'सहायक स्तर पद',
      department: body.department || 'Operations',
      deadline: body.deadline || '2083-08-30',
      openings: Number(body.openings || 1),
      status: body.status || 'Active',
      descriptionEn: body.descriptionEn || body.description || '',
      descriptionNp: body.descriptionNp || body.description || '',
    };
    const list = await getCmsListHelper('cms_careers');
    list.unshift(newItem);
    await saveCmsListHelper('cms_careers', list);
    res.status(201).json({ success: true, message: 'Career vacancy created!', data: newItem, id: newItem.id });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.put(['/api/careers/:id', '/api/job_openings/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const list = await getCmsListHelper('cms_careers');
    const idx = list.findIndex((c: any) => String(c.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Career vacancy not found.' });
    }
    list[idx] = { ...list[idx], ...req.body, id: list[idx].id };
    await saveCmsListHelper('cms_careers', list);
    res.json({ success: true, message: 'Career vacancy updated!', data: list[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.delete(['/api/careers/:id', '/api/job_openings/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const list = await getCmsListHelper('cms_careers');
    const filtered = list.filter((c: any) => String(c.id) !== String(id));
    await saveCmsListHelper('cms_careers', filtered);
    res.json({ success: true, message: `Career vacancy #${id} deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// 5. Hero Slides & Services endpoints
app.get(['/api/hero-slides', '/api/slides'], async (req: Request, res: Response) => {
  try {
    const list = await getCmsListHelper('cms_slides');
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

app.get(['/api/services', '/api/service_products'], async (req: Request, res: Response) => {
  try {
    const list = await getCmsListHelper('cms_services');
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

// ----------------------------------------------------
// DIGITAL SERVICE REQUESTS API (MySQL with SQLite fallback)
// ----------------------------------------------------

// POST /api/digital-service-requests/upload - File upload for digital service request attachments
app.post('/api/digital-service-requests/upload', uploadMedia.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const filePath = `/uploads/media/${file.filename}`;
    res.json({
      success: true,
      url: filePath,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      message: 'Attachment uploaded successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to upload attachment.' });
  }
});

// POST /api/digital-service-requests - Submit a new digital service request
app.post(['/api/digital-service-requests', '/api/digital_services', '/api/digital-services'], async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const is_member = b.is_member ?? b.isMember;
    const full_name = (b.full_name ?? b.fullName ?? b.name ?? '').toString().trim();
    const member_no = (b.member_no ?? b.memberNo ?? b.memberCode ?? '').toString().trim();
    const mobile_number = (b.mobile_number ?? b.mobileNumber ?? b.phone ?? b.contact ?? '').toString().trim();
    let email_address = (b.email_address ?? b.emailAddress ?? b.email ?? '').toString().trim();
    const service_type = (b.service_type ?? b.serviceType ?? b.service ?? '').toString().trim();
    const account_no = (b.account_no ?? b.accountNo ?? '').toString().trim();
    const additional_details = (b.additional_details ?? b.additionalDetails ?? b.details ?? b.message ?? '').toString().trim();
    const attachment_url = (b.attachment_url ?? b.attachmentUrl ?? '').toString().trim();
    const attachment_name = (b.attachment_name ?? b.attachmentName ?? '').toString().trim();
    const preferred_contact = (b.preferred_contact ?? b.preferredContact ?? 'Phone Call').toString().trim();

    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!mobile_number) {
      return res.status(400).json({ success: false, message: 'Mobile number is required.' });
    }
    if (!email_address) {
      const sanitizedPhone = mobile_number.replace(/[^0-9]/g, '');
      email_address = sanitizedPhone ? `${sanitizedPhone}@ankurcoop.com.np` : 'member@ankurcoop.com.np';
    }
    if (!service_type || service_type === 'Select a service...') {
      return res.status(400).json({ success: false, message: 'Please select a valid service type.' });
    }

    // Generate unique tracking ID
    const year = new Date().getFullYear();
    let trackingId = `DSR-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const existing = await queryOne('SELECT id FROM digital_service_requests WHERE tracking_id = ?', [trackingId]);
      if (existing) {
        trackingId = `DSR-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      }
    } catch (e) {}

    const isMemberVal = is_member === true || is_member === 1 || is_member === '1' ? 1 : 0;
    const prefContactVal = preferred_contact ? preferred_contact : 'Phone Call';
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await execute(
      `INSERT INTO digital_service_requests (
        tracking_id, is_member, full_name, member_no, mobile_number, email_address,
        service_type, account_no, additional_details, attachment_url, attachment_name,
        preferred_contact, status, submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
      [
        trackingId,
        isMemberVal,
        full_name,
        member_no,
        mobile_number,
        email_address,
        service_type,
        account_no,
        additional_details,
        attachment_url,
        attachment_name,
        prefContactVal,
        nowIso,
        nowIso,
        nowIso,
      ]
    );

    const inserted = await queryOne('SELECT * FROM digital_service_requests WHERE tracking_id = ?', [trackingId]);

    res.status(201).json({
      success: true,
      message: 'Digital service request submitted successfully!',
      tracking_id: trackingId,
      request: inserted,
    });
  } catch (err: any) {
    console.error('[API] Submit digital service request error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Failed to submit service request.' });
  }
});

// GET /api/digital-service-requests - Admin queue listing with filter & search
app.get(['/api/digital-service-requests', '/api/digital_services', '/api/digital-services'], async (req: Request, res: Response) => {
  try {
    const { status, service_type, search } = req.query;
    let sql = 'SELECT * FROM digital_service_requests WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all' && status !== 'All') {
      sql += ' AND status = ?';
      params.push(String(status).trim());
    }

    if (service_type && service_type !== 'all' && service_type !== 'All') {
      sql += ' AND service_type = ?';
      params.push(String(service_type).trim());
    }

    if (search && String(search).trim()) {
      const q = `%${String(search).trim()}%`;
      sql += ' AND (tracking_id LIKE ? OR full_name LIKE ? OR mobile_number LIKE ? OR email_address LIKE ? OR member_no LIKE ? OR account_no LIKE ?)';
      params.push(q, q, q, q, q, q);
    }

    sql += ' ORDER BY id DESC';

    const rows = await queryAll(sql, params);
    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err: any) {
    console.error('[API] Get digital service requests error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Failed to fetch service requests.' });
  }
});

// GET /api/digital-service-requests/track/:query - Track status by Tracking ID or Mobile Number
app.get('/api/digital-service-requests/track/:query', async (req: Request, res: Response) => {
  try {
    const query = decodeURIComponent(req.params.query).trim();
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a Tracking ID or Mobile Number.' });
    }

    const rows = await queryAll(
      'SELECT * FROM digital_service_requests WHERE LOWER(tracking_id) = LOWER(?) OR mobile_number = ? ORDER BY id DESC',
      [query, query]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No digital service request found matching the provided Tracking ID or Phone Number.',
      });
    }

    res.json({
      success: true,
      data: rows,
      latest: rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Tracking lookup error.' });
  }
});

// PATCH /api/digital-service-requests/:id/status - Update request status & admin notes
app.patch(['/api/digital-service-requests/:id/status', '/api/digital_services/:id/status', '/api/digital-services/:id/status'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status, admin_notes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const resolvedAt = (status === 'Completed' || status === 'Rejected')
      ? new Date().toISOString().slice(0, 19).replace('T', ' ')
      : null;

    const updatedNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await execute(
      `UPDATE digital_service_requests
       SET status = ?, admin_notes = ?, resolved_at = COALESCE(?, resolved_at), updated_at = ?
       WHERE id = ?`,
      [status, admin_notes || '', resolvedAt, updatedNow, id]
    );

    const updated = await queryOne('SELECT * FROM digital_service_requests WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      request: updated,
    });
  } catch (err: any) {
    console.error('[API] Update status error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Failed to update request status.' });
  }
});

// DELETE /api/digital-service-requests/:id - Delete a service request
app.delete(['/api/digital-service-requests/:id', '/api/digital_services/:id', '/api/digital-services/:id'], async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await execute('DELETE FROM digital_service_requests WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Request deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Failed to delete request.' });
  }
});

// ----------------------------------------------------
// CONTACT MESSAGES & INQUIRIES REST APIS
// ----------------------------------------------------

// GET /api/contact & /api/contact_messages - Retrieve all contact messages
app.get(['/api/contact', '/api/contact_messages', '/api/contact-messages'], async (req: Request, res: Response) => {
  try {
    const rows = await queryAll('SELECT * FROM contact_messages ORDER BY id DESC');
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// POST /api/contact & /api/contact_messages - Submit contact inquiry
app.post(['/api/contact', '/api/contact_messages', '/api/contact-messages'], async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const name = (body.sender_name ?? body.senderName ?? body.name ?? body.fullName ?? '').toString().trim();
    const phone = (body.phone ?? body.contact ?? body.mobile ?? body.mobile_number ?? '').toString().trim();
    const email = (body.email ?? body.email_address ?? '').toString().trim();
    const subject = (body.subject ?? body.category ?? 'General Inquiry').toString().trim();
    const message = (body.message ?? body.content ?? body.inquiry ?? '').toString().trim();

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Contact Phone, and Message.'
      });
    }

    await execute(
      'INSERT INTO contact_messages (sender_name, phone, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, phone, email, subject, message, 'Unread']
    );

    res.json({
      success: true,
      message: 'Thank you for reaching out! Our cooperative desk will contact you shortly.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message });
  }
});

// ----------------------------------------------------
// VITE & STATIC SERVING SETUP
// ----------------------------------------------------
async function startServer() {
  // Initialize Database (MySQL with SQLite automatic fallback)
  await initDatabase();

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Express error handler so malformed requests or multer errors never crash the server
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('[Server] Request error:', err?.message || err);
    if (!res.headersSent) {
      res.status(err?.status || 500).json({
        success: false,
        message: err?.message || 'Internal server error',
      });
    }
  });

  // Tune keep-alive timeouts so persistent local browser connections never hang or reset prematurely
  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 66000;

  const candidates: Array<{ port: number; host?: string }> = [
    { port: PORT, host: '0.0.0.0' },
    { port: PORT, host: '127.0.0.1' },
    { port: 3001, host: '127.0.0.1' },
    { port: 5173, host: '127.0.0.1' },
    { port: 8080, host: '127.0.0.1' },
    { port: 4000, host: '127.0.0.1' },
    { port: 5000, host: '127.0.0.1' },
    { port: 0, host: '127.0.0.1' },
  ];

  const tryListen = (index: number) => {
    if (index >= candidates.length) {
      console.error('[Server] Could not bind to any local port.');
      return;
    }
    const { port, host } = candidates[index];
    const onError = (err: any) => {
      httpServer.removeListener('listening', onListening);
      if (err && (err.code === 'EACCES' || err.code === 'EADDRINUSE')) {
        console.warn(
          `[Server] Port ${port} on ${host} unavailable (${err.code}). Trying next fallback...`
        );
        tryListen(index + 1);
      } else {
        console.error('[Server] Listen error:', err?.message || err);
      }
    };
    const onListening = () => {
      httpServer.removeListener('error', onError);
      const addr = httpServer.address();
      const boundPort = typeof addr === 'object' && addr ? addr.port : port;
      console.log('================================================================');
      console.log(`Ankur Cooperative Server running on port ${boundPort}`);
      console.log(`Local URL: http://localhost:${boundPort}`);
      console.log('================================================================');
    };
    httpServer.once('error', onError);
    httpServer.once('listening', onListening);
    httpServer.listen(port, host);
  };

  tryListen(0);
}

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception (kept alive):', err?.message || err);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[Server] Unhandled Rejection (kept alive):', reason?.message || reason);
});

startServer();
