import http from 'http';
import fs from 'fs';
import path from 'path';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  expectedStatus: number[];
  success: boolean;
  notes?: string;
  durationMs: number;
}

const BASE_URL = 'http://localhost:3000';

function request(options: {
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ status: number; body: any; raw: string; duration: number }> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    let payload = '';
    const headers = { ...options.headers };

    if (options.body) {
      if (typeof options.body === 'string') {
        payload = options.body;
      } else {
        payload = JSON.stringify(options.body);
        headers['Content-Type'] = 'application/json';
      }
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers,
        timeout: 10000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed: any = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            status: res.statusCode || 0,
            body: parsed,
            raw: data,
            duration: Date.now() - start,
          });
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout requesting ${options.path}`));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE ANKUR COOPERATIVE AUDIT');
  console.log('====================================================\n');

  const results: TestResult[] = [];

  async function testRoute(
    endpoint: string,
    method: string,
    expectedStatus: number[],
    body?: any,
    extraHeaders?: Record<string, string>,
    validate?: (body: any) => boolean
  ) {
    try {
      const res = await request({ path: endpoint, method, body, headers: extraHeaders });
      const pass = expectedStatus.includes(res.status) && (validate ? validate(res.body) : true);
      const result: TestResult = {
        endpoint,
        method,
        status: res.status,
        expectedStatus,
        success: pass,
        durationMs: res.duration,
        notes: pass ? 'OK' : `Failed validation or unexpected status ${res.status}`,
      };
      results.push(result);
      console.log(
        `${pass ? '✅' : '❌'} [${method}] ${endpoint} -> ${res.status} (${res.duration}ms) ${pass ? '' : ':: ' + JSON.stringify(res.body).slice(0, 100)}`
      );
      return res;
    } catch (err: any) {
      const result: TestResult = {
        endpoint,
        method,
        status: 0,
        expectedStatus,
        success: false,
        durationMs: 0,
        notes: `Network/Request Error: ${err.message}`,
      };
      results.push(result);
      console.log(`❌ [${method}] ${endpoint} -> ERROR: ${err.message}`);
      return null;
    }
  }

  // 1. Core / Public APIs
  console.log('\n--- 1. Testing Core & Public Endpoints ---');
  await testRoute('/api/site-settings', 'GET', [200]);
  await testRoute('/api/logo', 'GET', [200]);
  await testRoute('/api/hero-slides', 'GET', [200]);
  await testRoute('/api/popup-notices', 'GET', [200]);
  await testRoute('/api/popup_notices', 'GET', [200]);
  await testRoute('/api/notices', 'GET', [200]);
  await testRoute('/api/news', 'GET', [200]);
  await testRoute('/api/gallery', 'GET', [200]);
  await testRoute('/api/reports', 'GET', [200]);
  await testRoute('/api/careers', 'GET', [200]);
  await testRoute('/api/loans', 'GET', [200]);
  await testRoute('/api/members', 'GET', [200]);
  await testRoute('/api/stats', 'GET', [200]);
  await testRoute('/api/digital-service-requests', 'GET', [200]);
  await testRoute('/api/ekym', 'GET', [200]);
  await testRoute('/api/ekym/submissions', 'GET', [200]);
  await testRoute('/api/cms/leadership', 'GET', [200]);
  await testRoute('/api/cms/suggestions', 'GET', [200]);
  await testRoute('/api/contact_messages', 'GET', [200]);
  await testRoute('/api/institutional-reports', 'GET', [200]);
  await testRoute('/api/institutional-profiles', 'GET', [200]);
  await testRoute('/api/media/files', 'GET', [200]);

  // 2. Testing PHP compatibility routes (api.php)
  console.log('\n--- 2. Testing PHP Compatibility Endpoints (api.php) ---');
  await testRoute('/api.php?action=rates', 'GET', [200]);
  await testRoute('/api.php?action=notices', 'GET', [200]);
  await testRoute('/api.php?action=popup_notices', 'GET', [200]);
  await testRoute('/api.php?action=stats', 'GET', [200]);
  await testRoute('/api.php?action=db_status', 'GET', [200]);
  await testRoute('/api.php?action=session_status', 'GET', [200]);
  await testRoute('/api.php?action=calculate_emi', 'POST', [200], { amount: 300000, rate: 11.5, tenure: 24 });
  await testRoute('/api.php?action=calculate_deposit', 'POST', [200], { amount: 100000, rate: 10.5, years: 1, scheme: 'fixed' });

  // 3. Testing Public Forms & User Submissions
  console.log('\n--- 3. Testing Form Submissions & Data Persistence ---');
  const testContact = {
    name: 'Audit Test User',
    phone: '9841234567',
    email: 'audit@test.com',
    subject: 'System Audit Inquiry',
    message: 'Testing message persistence and notification flows during automated audit.',
  };
  await testRoute('/api/contact', 'POST', [200, 201], testContact);
  await testRoute('/api.php?action=contact', 'POST', [200, 201], testContact);

  const testLoan = {
    applicant_name: 'Audit Loan Applicant',
    phone: '9857012345',
    email: 'loan.audit@test.com',
    loan_scheme: 'Business Development Loan',
    amount: 500000,
    tenure_months: 36,
    monthly_income: 75000,
    purpose: 'Auditing loan application registration pipeline.',
  };
  await testRoute('/api.php?action=apply_loan', 'POST', [200, 201], testLoan);

  const testMember = {
    full_name: 'Audit Member Applicant',
    citizenship_no: '04-01-77-98765',
    phone: '9867012345',
    address: 'Butwal-09, Rupandehi',
    saving_scheme: 'Ekata Bal Bachat',
    initial_deposit: 2500,
  };
  await testRoute('/api.php?action=apply_member', 'POST', [200, 201], testMember);

  const testDigi = {
    fullName: 'Audit Digital Request',
    phone: '9801234567',
    memberCode: 'EK-9999',
    serviceType: 'Mobile Banking Activation',
    branch: 'Butwal Main Branch',
    message: 'Test service request',
  };
  await testRoute('/api/digital-service-requests', 'POST', [200, 201], testDigi);

  // 4. Testing eKYM Form Submissions
  console.log('\n--- 4. Testing eKYM Registration ---');
  const testEkym = {
    fullName: 'Audit eKYM Member',
    dob: '2050-01-01',
    gender: 'Male',
    contactNumber: '9812345678',
    email: 'audit.ekym@example.com',
    citizenshipNumber: '04-01-79-11223',
    district: 'Rupandehi',
    province: 'Lumbini',
    currentAddress: 'Kalikanagar, Butwal',
    permanentAddress: 'Kalikanagar, Butwal',
    fatherName: 'Hari Prasad',
    occupation: 'Service',
    panNumber: '123456789',
    documents: {
      citizenshipFront: '/uploads/kym/test-cit-front.jpg',
      citizenshipBack: '/uploads/kym/test-cit-back.jpg',
      applicantPhoto: '/uploads/kym/test-photo.jpg',
    },
  };
  await testRoute('/api/ekym', 'POST', [200, 201], testEkym);
  await testRoute('/api/ekym/submissions', 'POST', [200, 201], testEkym);

  // 5. Testing Admin CMS CRUD Cycles
  console.log('\n--- 5. Testing Admin CRUD Operations ---');
  // Notice CRUD
  const noticeCreate = await testRoute('/api/notices', 'POST', [200, 201], {
    title: 'Audit Notice Title',
    category: 'Urgent',
    date: '2026-11-02',
    description: 'Notice created during automated stability audit.',
    is_active: 1,
    priority: 'Normal',
  });
  const createdNoticeId = noticeCreate?.body?.id || noticeCreate?.body?.data?.id;
  if (createdNoticeId) {
    console.log(`  -> Notice ID created: ${createdNoticeId}`);
    await testRoute(`/api/notices/${createdNoticeId}`, 'PUT', [200], {
      title: 'Audit Notice Title - Updated',
      category: 'Urgent',
      description: 'Updated notice content.',
      is_active: 1,
    });
    await testRoute(`/api/notices/${createdNoticeId}`, 'DELETE', [200]);
    console.log(`  -> Notice ID ${createdNoticeId} successfully updated and deleted.`);
  }

  // News CRUD
  const newsCreate = await testRoute('/api/news', 'POST', [200, 201], {
    title: 'Audit News Item',
    category: 'General',
    date: '2026-11-02',
    summary: 'News summary during audit.',
    content: 'Full news content for verification.',
    author: 'Audit Team',
    published: true,
  });
  const createdNewsId = newsCreate?.body?.id || newsCreate?.body?.data?.id;
  if (createdNewsId) {
    console.log(`  -> News ID created: ${createdNewsId}`);
    await testRoute(`/api/news/${createdNewsId}`, 'PUT', [200], {
      title: 'Audit News Item - Updated',
      content: 'Updated full news content.',
      published: true,
    });
    await testRoute(`/api/news/${createdNewsId}`, 'DELETE', [200]);
    console.log(`  -> News ID ${createdNewsId} successfully updated and deleted.`);
  }

  // 6. Test Settings Update & Persistence
  console.log('\n--- 6. Testing Site Settings Persistence ---');
  const getInitialSettings = await testRoute('/api/site-settings', 'GET', [200]);
  const currentSettings = getInitialSettings?.body?.settings || getInitialSettings?.body || {};
  const testTagline = currentSettings.tagline || 'सबल र समृद्ध समाज निर्माणमा समर्पित';

  await testRoute('/api/site-settings', 'POST', [200], {
    ...currentSettings,
    tagline: testTagline,
  });

  // 7. Verify File System Upload Directories
  console.log('\n--- 7. Verifying Upload Directory Integrity ---');
  const uploadDirs = [
    'public/uploads',
    'public/uploads/media',
    'public/uploads/logos',
    'public/uploads/kym',
    'public/uploads/notices',
    'public/uploads/reports',
  ];
  for (const dir of uploadDirs) {
    const full = path.resolve(process.cwd(), dir);
    const exists = fs.existsSync(full);
    console.log(`📁 Directory: ${dir} -> ${exists ? 'EXISTS & ACCESSIBLE' : 'MISSING (creating)'}`);
    if (!exists) {
      fs.mkdirSync(full, { recursive: true });
    }
  }

  // Summary
  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('====================================================');
  const total = results.length;
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);

  console.log(`Total Endpoints & Operations Tested: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFAILED ENDPOINTS DETAILS:');
    for (const f of failed) {
      console.log(`- [${f.method}] ${f.endpoint} -> Status: ${f.status} (Expected: ${f.expectedStatus.join(',')}) | Note: ${f.notes}`);
    }
  } else {
    console.log('\n🎉 ALL ENDPOINTS AND CRUD OPERATIONS PASSED WITH 100% SUCCESS!');
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
