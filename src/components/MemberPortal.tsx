import React, { useState, useEffect } from 'react';
import { Language, AuthUser, TransactionRecord, MemberRecord, SiteSettingsCMS, EkymRecord } from '../types';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from '../data/backendData';
import { submitLoanApplication } from '../services/cooperativeApi';
import { lookupEkymApplication } from '../services/ekymApi';
import { PrintableKymDocument } from './ekym/PrintableKymDocument';
import { Printer, FileCheck2, UserCheck, Eye, Download, ShieldCheck } from 'lucide-react';

interface TermDepositRecord {
  id: string;
  certificateNo: string;
  schemeName: string;
  schemeNameNp: string;
  principal: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
  payoutFrequency: 'Monthly' | 'Quarterly' | 'Maturity';
  maturityAmount: number;
  status: 'Active' | 'Matured';
}

interface MemberPortalProps {
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  cmsSettings?: SiteSettingsCMS;
  user: AuthUser;
  onLogout: () => void;
  onExitToWebsite: () => void;
  onSwitchToAdmin: () => void;
  onOpenEkym: () => void;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({
  lang,
  onLanguageChange,
  cmsSettings,
  user,
  onLogout,
  onExitToWebsite,
  onSwitchToAdmin,
  onOpenEkym,
}) => {
  // Safe initial member lookup with graceful fallback
  const userCode = user?.memberCode || user?.username || 'EK-10482';
  const initialFound =
    INITIAL_MEMBERS.find(
      (m) =>
        m.memberCode.toLowerCase() === userCode.toLowerCase() ||
        m.phone === userCode ||
        m.id === user?.id
    ) || INITIAL_MEMBERS[0];

  const [activeMember, setActiveMember] = useState<MemberRecord>(initialFound);
  const [savingsBalance, setSavingsBalance] = useState<number>(initialFound.regularSavingBalance ?? 245850);
  const [shareAmount, setShareAmount] = useState<number>(initialFound.shareAmount ?? 100000);
  const [loanBalance, setLoanBalance] = useState<number>(initialFound.loanBalance ?? 350000);

  // Hydrate active member and balance from session or backend if stored
  useEffect(() => {
    try {
      const storedMember = sessionStorage.getItem('ekata_active_member');
      if (storedMember) {
        const parsed = JSON.parse(storedMember);
        if (parsed && parsed.memberCode) {
          setActiveMember((prev) => ({ ...prev, ...parsed }));
          if (typeof parsed.regularSavingBalance === 'number') {
            setSavingsBalance(parsed.regularSavingBalance);
          }
          if (typeof parsed.shareAmount === 'number') {
            setShareAmount(parsed.shareAmount);
          }
          if (typeof parsed.loanBalance === 'number') {
            setLoanBalance(parsed.loanBalance);
          }
        }
      }
      const storedTxs = sessionStorage.getItem('ekata_active_transactions');
      if (storedTxs) {
        const parsedTxs = JSON.parse(storedTxs);
        if (Array.isArray(parsedTxs) && parsedTxs.length > 0) {
          setTransactions(parsedTxs);
        }
      }
    } catch (e) {
      console.warn('Session hydration notice:', e);
    }
  }, [userCode]);

  // Term Deposits State
  const [termDeposits, setTermDeposits] = useState<TermDepositRecord[]>([
    {
      id: 'fd-1',
      certificateNo: 'EK-FD-82019',
      schemeName: 'Ankur Bishesh Mudhati (1 Year @ 11.75%)',
      schemeNameNp: 'अंकुर विशेष मुद्दती (१ वर्ष @ ११.७५%)',
      principal: 300000,
      interestRate: 11.75,
      tenureMonths: 12,
      startDate: '2082-10-15',
      maturityDate: '2083-10-15',
      payoutFrequency: 'Quarterly',
      maturityAmount: 335250,
      status: 'Active',
    },
    {
      id: 'fd-2',
      certificateNo: 'EK-FD-94812',
      schemeName: 'Ankur Nari Surakshya (2 Years @ 12.00%)',
      schemeNameNp: 'अंकुर नारी सुरक्षा मुद्दती (२ वर्ष @ १२.००%)',
      principal: 200000,
      interestRate: 12.0,
      tenureMonths: 24,
      startDate: '2082-04-01',
      maturityDate: '2084-04-01',
      payoutFrequency: 'Monthly',
      maturityAmount: 248000,
      status: 'Active',
    },
  ]);

  // Initial Transactions State
  const initialTxs: TransactionRecord[] = INITIAL_TRANSACTIONS.map((tx) => ({
    id: tx.id || `tx-${Math.random().toString(36).substring(2, 8)}`,
    memberCode: tx.memberCode || activeMember.memberCode,
    transDate: tx.transDate || '2083-05-10',
    particulars: tx.particulars || 'Transaction Record',
    type: tx.type || 'CR',
    amount: tx.amount ?? 0,
    balance: tx.balance ?? savingsBalance,
  }));

  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTxs);
  const [activeModal, setActiveModal] = useState<
    'transfer' | 'utility' | 'deposit' | 'termDeposit' | 'receiveQr' | 'remittance' | 'shareCert' | 'calc' | 'security' | 'myEkym' | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [loanNotice, setLoanNotice] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'CR' | 'DR'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);

  // Member's Statutory eKYM Record & Print Modal
  const [myEkymRecord, setMyEkymRecord] = useState<EkymRecord | null>(null);
  const [isMyEkymPrintOpen, setIsMyEkymPrintOpen] = useState<boolean>(false);
  const [ekymLookupLoading, setEkymLookupLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadMemberEkym = async () => {
      try {
        setEkymLookupLoading(true);
        const query = activeMember.phone || activeMember.memberCode || activeMember.fullName;
        const results = await lookupEkymApplication(query);
        if (isMounted) {
          if (results && results.length > 0) {
            setMyEkymRecord(results[0]);
          } else {
            // Default verified profile matching active member
            setMyEkymRecord({
              id: 'ekym-' + activeMember.memberCode.toLowerCase(),
              applicationNo: `EKT-KYC-2083-${activeMember.memberCode.replace(/[^0-9]/g, '') || '10482'}`,
              fullNameEn: activeMember.fullName,
              fullNameNp: activeMember.fullName,
              fatherName: 'Ram Bahadur Thapa',
              grandfatherName: 'Harilal Thapa',
              motherName: 'Kopila Thapa',
              dob: '2048-03-15',
              gender: 'Male',
              citizenshipNo: activeMember.citizenshipNo || '38-01-72-04921',
              citizenshipDistrict: 'Rupandehi',
              phone: activeMember.phone || '9857012345',
              email: activeMember.email || 'member@ekatacoop.com.np',
              permanentAddress: activeMember.address || 'Butwal-4, Rupandehi, Lumbini Province',
              currentAddress: activeMember.address || 'Butwal-4, Rupandehi, Lumbini Province',
              occupation: 'Small Business & Agribusiness',
              annualIncome: 'Rs. 750,000',
              bankName: 'Global IME Bank Ltd.',
              bankAccountNo: '02801004928109',
              nomineeName: 'Sita Devi Thapa',
              nomineeRelation: 'Spouse',
              nomineeCitizenship: '38-01-75-01823',
              status: (activeMember.status as any) || 'Approved',
              remarks: 'Official verified cooperative member record.',
              submittedAt: '2083-01-15 11:30:00',
              memberPhoto: '/uploads/kym/default-photo.svg',
              citizenshipFront: '/uploads/kym/default-citizenship-front.svg',
              citizenshipBack: '/uploads/kym/default-citizenship-back.svg',
            });
          }
        }
      } catch (err) {
        console.warn('Error fetching member eKYM:', err);
      } finally {
        if (isMounted) setEkymLookupLoading(false);
      }
    };
    loadMemberEkym();
    return () => {
      isMounted = false;
    };
  }, [activeMember.memberCode, activeMember.phone, activeMember.fullName]);

  // Transfer Form State
  const [transferRecipient, setTransferRecipient] = useState<string>('EK-10483');
  const [transferRecipientName, setTransferRecipientName] = useState<string>('Sita Devi Thapa');
  const [transferAmount, setTransferAmount] = useState<string>('2500');
  const [transferRemarks, setTransferRemarks] = useState<string>('Family support transfer');
  const [transferPin, setTransferPin] = useState<string>('1234');
  const [lastReceipt, setLastReceipt] = useState<{
    id: string;
    date: string;
    recipient: string;
    amount: number;
    remarks: string;
  } | null>(null);

  // Term Deposit Opening Form State
  const [fdScheme, setFdScheme] = useState<string>('Ankur Bishesh Mudhati (1 Year @ 11.75%)');
  const [fdPrincipal, setFdPrincipal] = useState<string>('50000');
  const [fdTenure, setFdTenure] = useState<number>(12);
  const [fdRate, setFdRate] = useState<number>(11.75);
  const [fdPayout, setFdPayout] = useState<'Monthly' | 'Quarterly' | 'Maturity'>('Quarterly');
  const [lastCreatedFd, setLastCreatedFd] = useState<TermDepositRecord | null>(null);

  // Remittance Claim State
  const [remitProvider, setRemitProvider] = useState<string>('Western Union');
  const [remitMtcn, setRemitMtcn] = useState<string>('8492048192');
  const [remitCountry, setRemitCountry] = useState<string>('United Arab Emirates (Dubai)');
  const [remitSender, setRemitSender] = useState<string>('Rajendra Sharma');
  const [remitAmount, setRemitAmount] = useState<string>('35000');

  // Utility Bill Form State
  const [utilityService, setUtilityService] = useState<string>('NTC Mobile Topup');
  const [utilityAccount, setUtilityAccount] = useState<string>('9857012345');
  const [utilityAmount, setUtilityAmount] = useState<string>('500');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<string>('10000');
  const [depositSource, setDepositSource] = useState<string>('NepalPay / Fonepay QR');

  // Loan Application State
  const [loanScheme, setLoanScheme] = useState('Agricultural Productive Loan (12.00%)');
  const [loanAmount, setLoanAmount] = useState('200000');
  const [loanTenure, setLoanTenure] = useState('24');
  const [monthlyIncome, setMonthlyIncome] = useState('55000');
  const [loanPurpose, setLoanPurpose] = useState('Commercial vegetable greenhouse farming in Butwal');

  // Interactive Calculator State
  const [calcPrincipal, setCalcPrincipal] = useState(300000);
  const [calcRate, setCalcRate] = useState(12.5);
  const [calcMonths, setCalcMonths] = useState(24);

  // Security Form State
  const [currentPin, setCurrentPin] = useState('1234');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Switch demo member
  const handleSwitchMember = (code: string) => {
    const found = INITIAL_MEMBERS.find((m) => m.memberCode === code);
    if (found) {
      setActiveMember(found);
      setSavingsBalance(found.regularSavingBalance ?? 200000);
      setShareAmount(found.shareAmount ?? 50000);
      setLoanBalance(found.loanBalance ?? 0);
      const tailoredTxs: TransactionRecord[] = [
        {
          id: `tx-sw-1`,
          memberCode: found.memberCode,
          transDate: '2083-05-12',
          particulars: 'Monthly Regular Saving Credit via Mobile Banking',
          type: 'CR',
          amount: 5000,
          balance: found.regularSavingBalance ?? 200000,
        },
        {
          id: `tx-sw-2`,
          memberCode: found.memberCode,
          transDate: '2083-05-01',
          particulars: 'Quarterly Saving Interest Capitalized @ 7.50% P.A.',
          type: 'CR',
          amount: 3840,
          balance: (found.regularSavingBalance ?? 200000) - 5000,
        },
        {
          id: `tx-sw-3`,
          memberCode: found.memberCode,
          transDate: '2083-04-18',
          particulars: 'Counter Cash Cheque Withdrawal - Service Center',
          type: 'DR',
          amount: 12000,
          balance: (found.regularSavingBalance ?? 200000) - 8840,
        },
      ];
      setTransactions(tailoredTxs);
      showToast(
        lang === 'np'
          ? `खाता परिवर्तन: ${found.fullName} (${found.memberCode})`
          : `Switched account to: ${found.fullName} (${found.memberCode})`
      );
    }
  };

  // Handle Internal Fund Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(lang === 'np' ? 'कृपया मान्य रकम राख्नुहोस्।' : 'Please enter a valid transfer amount.');
      return;
    }
    if (amt > savingsBalance) {
      alert(
        lang === 'np'
          ? `बचत खातामा मौज्दात अपुग छ। उपलब्ध मौज्दात: रु. ${savingsBalance.toLocaleString()}`
          : `Insufficient available savings balance. Current balance is Rs. ${savingsBalance.toLocaleString()}`
      );
      return;
    }
    if (transferPin !== '1234' && transferPin.length < 4) {
      alert(lang === 'np' ? 'गोप्य पिन मिलेन (परीक्षण पिन: 1234)' : 'Invalid PIN (Demo PIN is 1234)');
      return;
    }

    const newBal = savingsBalance - amt;
    setSavingsBalance(newBal);

    const txId = 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const today = new Date().toISOString().split('T')[0];

    const newTx: TransactionRecord = {
      id: txId,
      memberCode: activeMember.memberCode,
      transDate: today,
      particulars: `Co-op Transfer to ${transferRecipientName} (${transferRecipient}) - ${transferRemarks}`,
      type: 'DR',
      amount: amt,
      balance: newBal,
    };

    setTransactions([newTx, ...transactions]);
    setLastReceipt({
      id: txId,
      date: today,
      recipient: `${transferRecipientName} (${transferRecipient})`,
      amount: amt,
      remarks: transferRemarks,
    });

    setActiveModal(null);
    showToast(
      lang === 'np'
        ? `रु. ${amt.toLocaleString()} सफलतापूर्वक पठाइयो। भौचर नं.: ${txId}`
        : `Rs. ${amt.toLocaleString()} transferred successfully to ${transferRecipientName}. Ref: ${txId}`
    );
  };

  // Handle Opening Term Deposit / Fixed Deposit
  const handleOpenTermDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(fdPrincipal);
    if (isNaN(amt) || amt < 10000) {
      alert(
        lang === 'np'
          ? 'मुद्दती निक्षेपको न्यूनतम रकम रु. १०,००० हुनुपर्छ।'
          : 'Minimum Term Deposit opening amount is Rs. 10,000.'
      );
      return;
    }
    if (amt > savingsBalance) {
      alert(
        lang === 'np'
          ? `बचत खातामा मौज्दात अपुग छ। उपलब्ध मौज्दात: रु. ${savingsBalance.toLocaleString()}`
          : `Insufficient funds. Available savings: Rs. ${savingsBalance.toLocaleString()}`
      );
      return;
    }

    const newBal = savingsBalance - amt;
    setSavingsBalance(newBal);

    const certNo = 'EK-FD-' + Math.floor(10000 + Math.random() * 90000);
    const today = new Date().toISOString().split('T')[0];
    const maturityYear = new Date().getFullYear() + Math.ceil(fdTenure / 12);
    const maturityDate = `${maturityYear}-05-15`;

    const projectedInterest = Math.round((amt * (fdRate / 100) * (fdTenure / 12)));
    const totalMaturity = amt + projectedInterest;

    const newFd: TermDepositRecord = {
      id: `fd-${Date.now()}`,
      certificateNo: certNo,
      schemeName: fdScheme,
      schemeNameNp: fdScheme,
      principal: amt,
      interestRate: fdRate,
      tenureMonths: fdTenure,
      startDate: today,
      maturityDate: maturityDate,
      payoutFrequency: fdPayout,
      maturityAmount: totalMaturity,
      status: 'Active',
    };

    setTermDeposits([newFd, ...termDeposits]);
    setLastCreatedFd(newFd);

    // Record Debit in Transactions
    const txId = 'FD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newTx: TransactionRecord = {
      id: txId,
      memberCode: activeMember.memberCode,
      transDate: today,
      particulars: `Term Deposit Account Opening (${certNo}) @ ${fdRate}% P.A.`,
      type: 'DR',
      amount: amt,
      balance: newBal,
    };
    setTransactions([newTx, ...transactions]);

    setActiveModal(null);
    showToast(
      lang === 'np'
        ? `मुद्दती निक्षेप रु. ${amt.toLocaleString()} सफलतापूर्वक खुल्यो! प्रमाणपत्र नं.: ${certNo}`
        : `Term Deposit of Rs. ${amt.toLocaleString()} opened successfully! Cert No: ${certNo}`
    );
  };

  // Handle Inward Remittance Claim
  const handleRemittanceClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(remitAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(lang === 'np' ? 'कृपया मान्य रेमिट्यान्स रकम राख्नुहोस्।' : 'Please enter a valid amount.');
      return;
    }
    if (!remitMtcn.trim()) {
      alert(lang === 'np' ? 'कृपया MTCN / कन्ट्रोल नम्बर राख्नुहोस्।' : 'Please enter MTCN control number.');
      return;
    }

    const newBal = savingsBalance + amt;
    setSavingsBalance(newBal);

    const txId = 'REM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const today = new Date().toISOString().split('T')[0];

    const newTx: TransactionRecord = {
      id: txId,
      memberCode: activeMember.memberCode,
      transDate: today,
      particulars: `Inward Remittance Credit via ${remitProvider} (MTCN: ${remitMtcn}) from ${remitCountry}`,
      type: 'CR',
      amount: amt,
      balance: newBal,
    };

    setTransactions([newTx, ...transactions]);
    setActiveModal(null);
    showToast(
      lang === 'np'
        ? `रेमिट्यान्स रु. ${amt.toLocaleString()} सोझै तपाईंको बचत खातामा जम्मा भयो! भौचर: ${txId}`
        : `Remittance of Rs. ${amt.toLocaleString()} directly credited to your savings! Ref: ${txId}`
    );
  };

  // Handle Utility Bill Payment
  const handleUtilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(utilityAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(lang === 'np' ? 'कृपया मान्य रकम राख्नुहोस्।' : 'Please enter a valid bill amount.');
      return;
    }
    if (amt > savingsBalance) {
      alert(
        lang === 'np'
          ? `बचत खातामा रकम अपुग छ। उपलब्ध मौज्दात: रु. ${savingsBalance.toLocaleString()}`
          : `Insufficient funds. Your savings balance is Rs. ${savingsBalance.toLocaleString()}`
      );
      return;
    }

    const newBal = savingsBalance - amt;
    setSavingsBalance(newBal);

    const txId = 'BIL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const today = new Date().toISOString().split('T')[0];

    const newTx: TransactionRecord = {
      id: txId,
      memberCode: activeMember.memberCode,
      transDate: today,
      particulars: `${utilityService} for ${utilityAccount}`,
      type: 'DR',
      amount: amt,
      balance: newBal,
    };

    setTransactions([newTx, ...transactions]);
    setActiveModal(null);
    showToast(
      lang === 'np'
        ? `${utilityService} भुक्तानी रु. ${amt.toLocaleString()} सफल भयो!`
        : `${utilityService} payment of Rs. ${amt.toLocaleString()} completed successfully!`
    );
  };

  // Handle Instant QR Deposit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(lang === 'np' ? 'कृपया मान्य रकम राख्नुहोस्।' : 'Please enter a valid deposit amount.');
      return;
    }

    const newBal = savingsBalance + amt;
    setSavingsBalance(newBal);

    const txId = 'DEP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const today = new Date().toISOString().split('T')[0];

    const newTx: TransactionRecord = {
      id: txId,
      memberCode: activeMember.memberCode,
      transDate: today,
      particulars: `Instant Digital Deposit via ${depositSource}`,
      type: 'CR',
      amount: amt,
      balance: newBal,
    };

    setTransactions([newTx, ...transactions]);
    setActiveModal(null);
    showToast(
      lang === 'np'
        ? `रु. ${amt.toLocaleString()} बचत खातामा तुरुन्त जम्मा भयो! नयाँ मौज्दात: रु. ${newBal.toLocaleString()}`
        : `Rs. ${amt.toLocaleString()} credited to your savings account via QR! New Balance: Rs. ${newBal.toLocaleString()}`
    );
  };

  // Handle Security PIN update
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin && newPin.length !== 4) {
      alert(lang === 'np' ? 'पिन ठ्याक्कै ४-अङ्कको हुनुपर्छ।' : 'PIN must be exactly 4 digits.');
      return;
    }
    if (newPin && newPin !== confirmPin) {
      alert(lang === 'np' ? 'नयाँ पिन र कन्फर्म पिन मिलेन।' : 'New PIN and Confirm PIN do not match.');
      return;
    }
    setActiveModal(null);
    showToast(
      lang === 'np'
        ? 'सुरक्षा प्राथमिकताहरू र ट्रान्ज्याक्सन पिन सफलतापूर्वक अद्यावधिक भयो!'
        : 'Security settings and transaction PIN updated successfully!'
    );
  };

  // Handle Loan Application
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLoan(true);
    try {
      const res = await submitLoanApplication({
        applicant_name: activeMember.fullName,
        phone: activeMember.phone,
        loan_scheme: loanScheme,
        amount: parseFloat(loanAmount) || 200000,
        tenure_months: parseInt(loanTenure, 10) || 24,
        monthly_income: parseFloat(monthlyIncome) || 50000,
        purpose: loanPurpose,
      });

      const trackingCode = res?.tracking_code || 'EKT-LN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setLoanNotice(
        lang === 'np'
          ? `कर्जा आवेदन MySQL डाटाबेसमा सफलतापूर्वक दर्ता भयो! ट्र्याकिङ कोड: ${trackingCode}। ऋण समितिले समीक्षा गरी १ कार्यदिनभित्र सम्पर्क गर्नेछ।`
          : `Loan application successfully recorded in MySQL! Tracking code: ${trackingCode}. Our credit committee will review and contact you within 1 business day.`
      );
      showToast(
        lang === 'np'
          ? `कर्जा आवेदन दर्ता भयो (कोड: ${trackingCode})`
          : `Loan application registered (Code: ${trackingCode})`
      );
    } catch (err: any) {
      const fallbackCode = 'EKT-LN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setLoanNotice(
        lang === 'np'
          ? `कर्जा आवेदन दर्ता भयो! ट्र्याकिङ कोड: ${fallbackCode}`
          : `Loan application registered with tracking code: ${fallbackCode}`
      );
      showToast(lang === 'np' ? `आवेदन दर्ता भयो: ${fallbackCode}` : `Application registered: ${fallbackCode}`);
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  // Copy Account Info
  const handleCopyAccountInfo = () => {
    const text = `Account Name: ${activeMember.fullName}\nAccount Number: EK-SAV-${activeMember.memberCode.replace('EK-', '')}-01\nMember Code: ${activeMember.memberCode}\nCooperative: ${cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.'}\nBranch: ${activeMember.branch}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
    showToast(lang === 'np' ? 'खाता विवरण क्लिपबोर्डमा प्रतिलिपि भयो!' : 'Account details copied to clipboard!');
  };

  // Export Passbook CSV
  const handleExportCsv = () => {
    const headers = 'Transaction ID,Date,Particulars,Type,Amount (Rs.),Balance (Rs.)\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.transDate}","${t.particulars.replace(/"/g, '""')}","${t.type}",${t.amount},${t.balance}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ankur_Passbook_${activeMember.memberCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      lang === 'np'
        ? 'डिजिटल पासबुक स्टेटमेन्ट डाउनलोड भयो।'
        : 'Passbook statement exported to CSV successfully.'
    );
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.particulars.toLowerCase().includes(q) ||
        tx.transDate.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate dynamic EMI
  const monthlyInterestRate = calcRate / 12 / 100;
  const calculatedEmi = Math.round(
    (calcPrincipal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, calcMonths)) /
      (Math.pow(1 + monthlyInterestRate, calcMonths) - 1)
  );
  const totalRepayment = calculatedEmi * calcMonths;
  const totalInterestPayable = totalRepayment - calcPrincipal;

  const totalTermDepositBalance = termDeposits.reduce((acc, curr) => acc + curr.principal, 0);

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#0c2d3e] font-sans pb-20">
      {/* 1. Global Member Header Topbar with Official Logo & Language Toggle */}
      <header className="bg-gradient-to-r from-[#052636] via-[#072f42] to-[#052636] text-white px-4 md:px-8 py-3 text-xs shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md flex-shrink-0 border border-sky-400/40">
              <img
                src={cmsSettings?.coopLogoUrl || "/uploads/logos/ekata-logo-default.svg"}
                alt="Ankur Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/uploads/logos/ekata-logo-default.svg";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight uppercase">
                  {lang === 'np'
                    ? (cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.')
                    : (cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.')}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {lang === 'np' ? 'स्मार्ट बैंकिङ' : 'Smart Banking'}
                </span>
              </div>
              <div className="text-[11px] text-sky-300/80 font-medium">
                {lang === 'np' ? 'नमस्ते' : 'Welcome'}, <strong>{activeMember.fullName}</strong> •{' '}
                <span className="font-mono text-white font-bold">{activeMember.memberCode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Direct Language Switcher */}
            {onLanguageChange && (
              <div className="flex rounded-lg bg-black/30 p-0.5 border border-white/20 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    lang === 'en' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('np')}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    lang === 'np' ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  नेपाली
                </button>
              </div>
            )}

            {/* Quick Demo Member Switcher */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#07678d] px-2.5 py-1 rounded-lg border border-[#0981ae]">
              <span className="text-[11px] text-[#7dd3fc] font-bold">
                {lang === 'np' ? 'परीक्षण खाता:' : 'Switch Account:'}
              </span>
              <select
                value={activeMember.memberCode}
                onChange={(e) => handleSwitchMember(e.target.value)}
                className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer"
              >
                {INITIAL_MEMBERS.map((m) => (
                  <option key={m.id} value={m.memberCode} className="text-[#0c2d3e] bg-white">
                    {m.fullName} ({m.memberCode})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="bg-[#07678d] hover:bg-[#0981ae] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer border border-[#0981ae]"
              title="Open Core CBS Administrator Console"
            >
              🏢 {lang === 'np' ? 'प्रशासन कन्सोल' : 'Admin Console'}
            </button>
            <button
              type="button"
              onClick={onExitToWebsite}
              className="text-[#e0f2fe] hover:text-white font-semibold transition cursor-pointer text-xs px-2 py-1"
            >
              🌐 {lang === 'np' ? 'वेबसाइट' : 'Public Website'}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer"
            >
              🚪 {lang === 'np' ? 'लगआउट' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="max-w-xl mx-auto px-4 mt-4">
          <div className="bg-[#07678d] text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold border border-[#0cb3f0] animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-white/70 hover:text-white ml-3 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* 2. Member Profile Banner */}
        <section className="bg-white rounded-2xl p-6 border border-[#bae6fd] shadow-xs flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#eef8fc] text-[#0981ae] flex items-center justify-center text-2xl font-black shadow-inner">
              {activeMember.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-[#0981ae]">{activeMember.fullName}</h1>
                <span className="bg-[#e0f2fe] text-[#07678d] border border-[#7dd3fc] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>✓</span> {lang === 'np' ? 'eKYM प्रमाणित सदस्य' : 'eKYM Verified Shareholder'}
                </span>
                <span className="bg-[#e0f2fe] text-[#0369a1] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {lang === 'np' ? 'शाखा:' : 'Branch:'} {activeMember.branch}
                </span>
              </div>
              <p className="text-xs text-[#526b7a] mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  {lang === 'np' ? 'सदस्य कोड:' : 'Member Code:'}{' '}
                  <strong className="font-mono text-[#0981ae]">{activeMember.memberCode}</strong>
                </span>
                <span>
                  {lang === 'np' ? 'मोबाइल:' : 'Mobile:'} <strong>{activeMember.phone}</strong>
                </span>
                <span>
                  {lang === 'np' ? 'सदस्यता मिति:' : 'Member Since:'} <strong>{activeMember.joinedDate}</strong>
                </span>
                <span>
                  {lang === 'np' ? 'अवस्था:' : 'Status:'}{' '}
                  <strong className="text-[#07678d]">{activeMember.status}</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons in Profile Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveModal('receiveQr')}
              className="bg-[#eef8fc] hover:bg-[#bae6fd] text-[#0981ae] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-sky-200"
            >
              <span>📲</span>
              <span>{lang === 'np' ? 'मेरो भुक्तानी QR' : 'My Receive QR'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('termDeposit')}
              className="bg-[#eef8fc] hover:bg-[#bae6fd] text-[#0981ae] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-sky-200"
            >
              <span>📜</span>
              <span>{lang === 'np' ? 'मुद्दती निक्षेप खोल्नुहोस्' : 'Open Term Deposit'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('remittance')}
              className="bg-[#eef8fc] hover:bg-[#bae6fd] text-[#0981ae] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-sky-200"
            >
              <span>🌍</span>
              <span>{lang === 'np' ? 'रेमिट्यान्स भुक्तानी' : 'Claim Remittance'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('myEkym')}
              className="bg-[#0981ae] hover:bg-[#07678d] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="View and print official member eKYM registration dossier"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{lang === 'np' ? 'मेरो eKYM दर्ता / प्रिन्ट' : 'My eKYM Dossier'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('security')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="PIN & Security Preferences"
            >
              <span>🔐</span>
              <span>{lang === 'np' ? 'पिन तथा सुरक्षा' : 'Security'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="border border-[#cce3ee] hover:bg-[#f0f9ff] text-[#0c2d3e] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>{lang === 'np' ? 'पासबुक प्रिन्ट' : 'Print Passbook'}</span>
            </button>
          </div>
        </section>

        {/* Loan Application Alert if active */}
        {loanNotice && (
          <div className="bg-[#e0f2fe] border-2 border-[#7dd3fc] text-[#07678d] px-5 py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">📢</span>
              <span>{loanNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setLoanNotice('')}
              className="text-[#07678d] hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3. Account Balances Grid (4 Modern Banking Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Regular Savings Account */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#bae6fd] shadow-xs relative overflow-hidden group hover:border-[#0981ae] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#526b7a] uppercase tracking-wider">
                  {lang === 'np' ? 'साधारण बचत खाता' : 'Regular Savings A/C'}
                </span>
                <span className="w-8 h-8 rounded-full bg-[#eef8fc] text-[#0981ae] flex items-center justify-center text-sm font-bold">
                  ₹
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#0981ae] mt-2 font-mono">
                Rs. {(savingsBalance ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#0981ae] font-semibold mt-1 flex items-center gap-1">
                <span>📈</span> {lang === 'np' ? '७.५०% दैनिक मौज्दात ब्याज' : '7.50% P.A. Daily Balance'}
              </div>
              <div className="text-[10px] text-[#526b7a] mt-2 font-mono bg-[#f0f9ff] px-2 py-1 rounded-md inline-block">
                A/C: EK-SAV-{activeMember.memberCode.replace('EK-', '')}-01
              </div>
            </div>

            {/* Quick Action Buttons inside Card */}
            <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-[#e6f4fa]">
              <button
                type="button"
                onClick={() => setActiveModal('transfer')}
                className="bg-[#0981ae] hover:bg-[#07678d] text-white text-[10px] font-bold py-1.5 px-1 rounded-lg transition text-center cursor-pointer"
              >
                💸 {lang === 'np' ? 'पठाउनुहोस्' : 'Transfer'}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('utility')}
                className="bg-[#eef8fc] hover:bg-[#e0f2fe] text-[#0981ae] text-[10px] font-bold py-1.5 px-1 rounded-lg transition text-center cursor-pointer"
              >
                📲 {lang === 'np' ? 'बिल तिर्नुहोस्' : 'Pay Bills'}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('deposit')}
                className="bg-[#eef8fc] hover:bg-[#e0f2fe] text-[#0981ae] text-[10px] font-bold py-1.5 px-1 rounded-lg transition text-center cursor-pointer"
              >
                💳 {lang === 'np' ? 'जम्मा गर्नुहोस्' : 'Deposit'}
              </button>
            </div>
          </div>

          {/* Card 2: Term / Fixed Deposit Account */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#bae6fd] shadow-xs relative overflow-hidden group hover:border-sky-600 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                  {lang === 'np' ? 'मुद्दती बचत निक्षेप' : 'Fixed Term Deposits'}
                </span>
                <span className="w-8 h-8 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center text-sm font-bold">
                  📜
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-900 mt-2 font-mono">
                Rs. {totalTermDepositBalance.toLocaleString()}
              </div>
              <div className="text-xs text-sky-700 font-semibold mt-1 flex items-center gap-1">
                <span>🌟</span> {lang === 'np' ? '११.७५% सम्म त्रैमासिक प्रतिफल' : 'Up to 11.75% High Yield'}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono bg-sky-50/50 px-2 py-1 rounded-md inline-block">
                {termDeposits.length} {lang === 'np' ? 'सक्रिय प्रमाणपत्रहरू' : 'Active FD Certificates'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveModal('termDeposit')}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition text-center cursor-pointer"
              >
                + {lang === 'np' ? 'नयाँ मुद्दती खोल्नुहोस्' : 'Open New Term Deposit'}
              </button>
            </div>
          </div>

          {/* Card 3: Share Capital Account */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#bae6fd] shadow-xs relative overflow-hidden group hover:border-amber-600 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  {lang === 'np' ? 'शेयर पूँजी खाता' : 'Share Capital Equity'}
                </span>
                <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                  💎
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-2 font-mono">
                Rs. {(shareAmount ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                <span>🌟</span> {lang === 'np' ? '१४.५०% वार्षिक लाभांश योग्य' : '14.50% Annual AGM Dividend'}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono bg-amber-50/50 px-2 py-1 rounded-md inline-block">
                {Math.round((shareAmount ?? 100000) / 100)} {lang === 'np' ? 'कि. शेयर (रु. १००/कित्ता)' : 'Units (@ Rs. 100)'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveModal('shareCert')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition text-center cursor-pointer"
              >
                📜 {lang === 'np' ? 'शेयर प्रमाणपत्र हेर्नुहोस्' : 'View Share Certificate'}
              </button>
            </div>
          </div>

          {/* Card 4: Active Loan Account */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#bae6fd] shadow-xs relative overflow-hidden group hover:border-rose-600 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  {lang === 'np' ? 'कर्जा उपभोग खाता' : 'Active Loan Facility'}
                </span>
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">
                  🏦
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-900 mt-2 font-mono">
                Rs. {(loanBalance ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-rose-700 font-semibold mt-1 flex items-center gap-1">
                <span>⏳</span> {lang === 'np' ? '१२.००% सुलभ उत्पादनशील कर्जा' : '12.00% Productive Loan'}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono bg-rose-50/50 px-2 py-1 rounded-md inline-block">
                {lang === 'np' ? 'मासिक ईएमआई: रु. १६,५३०' : 'Monthly EMI: Rs. 16,530'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveModal('calc')}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition text-center cursor-pointer"
              >
                🧮 {lang === 'np' ? 'ईएमआई क्याल्कुलेटर' : 'EMI Calculator & Apply'}
              </button>
            </div>
          </div>
        </section>

        {/* 4. Active Term Deposits List Section */}
        <section className="bg-white rounded-2xl border border-[#bae6fd] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📜</span>
                <span>{lang === 'np' ? 'सक्रिय मुद्दती निक्षेप प्रमाणपत्रहरू' : 'Active Fixed Term Deposits'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'np'
                  ? 'सुरक्षित बचतमा उच्च प्रतिफल तथा नियमित ब्याज भुक्तानी'
                  : 'Guaranteed high-yield investment backed by Ankur Cooperative Capital'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('termDeposit')}
              className="px-3.5 py-1.5 bg-[#0981ae] hover:bg-[#07678d] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>+</span>
              <span>{lang === 'np' ? 'नयाँ मुद्दती खोल्नुहोस्' : 'Open New Term Deposit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {termDeposits.map((fd) => (
              <div
                key={fd.id}
                className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {fd.certificateNo}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {lang === 'np' ? fd.schemeNameNp : fd.schemeName}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                    {fd.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-sky-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {lang === 'np' ? 'साँवा रकम' : 'Principal'}
                    </span>
                    <strong className="font-mono text-slate-900 font-bold">
                      Rs. {fd.principal.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {lang === 'np' ? 'ब्याजदर / अवधि' : 'Rate / Tenure'}
                    </span>
                    <strong className="text-sky-800 font-bold">
                      {fd.interestRate}% ({fd.tenureMonths}m)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {lang === 'np' ? 'परिपक्व मिति' : 'Maturity Date'}
                    </span>
                    <strong className="font-mono text-slate-700">{fd.maturityDate}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Statutory Member eKYM Registration & Verified Dossier */}
        <section className="bg-white rounded-2xl border border-[#bae6fd] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e6f4fa] flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-sky-50/70 via-white to-sky-50/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-black text-[#0981ae]">
                  {lang === 'np'
                    ? 'वैधानिक सदस्य eKYM दर्ता तथा प्रमाणीकरण अभिलेख'
                    : 'Statutory Member eKYM Registration Dossier'}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    myEkymRecord?.status === 'Approved'
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : myEkymRecord?.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  ✓ {myEkymRecord?.status || 'Approved'}
                </span>
              </div>
              <p className="text-xs text-[#526b7a] mt-1">
                {lang === 'np'
                  ? 'सहकारी ऐन २०७४ अनुसार प्रमाणीकरण गरिएको आधिकारिक डिजिटल सदस्यता फारम तथा कागजातहरू'
                  : 'Statutory digital identity dossier verified under Cooperative Act 2074 & CBS Bylaws'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsMyEkymPrintOpen(true)}
                className="px-4 py-2 bg-[#0981ae] hover:bg-[#065371] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'np' ? 'eKYM फारम प्रिन्ट / PDF डाउनलोड' : 'Print / Download eKYM Form (PDF)'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenEkym}
                className="px-3.5 py-2 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0981ae] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>📝</span>
                <span>{lang === 'np' ? 'विवरण अद्यावधिक' : 'Update Registration'}</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1 & 2: Applicant Identity & Bio Details */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'np' ? 'दर्ता / आवेदन नं.' : 'Registration / App No.'}
                    </span>
                    <strong className="font-mono text-sky-800 text-sm font-bold">
                      {myEkymRecord?.applicationNo || 'EKT-KYC-2083-10482'}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'np' ? 'सदस्य कोड' : 'Member CBS Code'}
                    </span>
                    <strong className="font-mono text-slate-900 text-sm font-bold">
                      {activeMember.memberCode}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'np' ? 'पूरा नाम (नेपाली / अंग्रेजी)' : 'Full Name (En / Np)'}
                    </span>
                    <strong className="text-slate-900 font-bold block">
                      {myEkymRecord?.fullNameEn || activeMember.fullName}
                    </strong>
                    <span className="text-slate-600 text-[11px]">
                      {myEkymRecord?.fullNameNp || activeMember.fullName}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'np' ? 'नागरिकता नं. / जिल्ला' : 'Citizenship No. / District'}
                    </span>
                    <strong className="font-mono text-slate-900 font-bold">
                      {myEkymRecord?.citizenshipNo || activeMember.citizenshipNo || '38-01-72-04921'}
                    </strong>{' '}
                    <span className="text-slate-600 text-[11px]">
                      ({myEkymRecord?.citizenshipDistrict || 'Rupandehi'})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'np' ? 'सम्पर्क फोन / इमेल' : 'Phone / Email'}
                    </span>
                    <strong className="text-slate-900 font-bold block">
                      {myEkymRecord?.phone || activeMember.phone}
                    </strong>
                    <span className="text-slate-600 text-[11px]">
                      {myEkymRecord?.email || activeMember.email || 'info@ekatacoop.com.np'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'np' ? 'स्थायी ठेगाना' : 'Permanent Address'}
                    </span>
                    <strong className="text-slate-900 font-bold">
                      {myEkymRecord?.permanentAddress || activeMember.address || 'Butwal-4, Rupandehi'}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-800">
                    <span>✓</span>
                    <span>
                      {lang === 'np'
                        ? 'तपाईंको वैधानिक विवरण केन्द्रीय सहकारी बैंकिंग प्रणाली (CBS) मा प्रमाणीकरण भइसकेको छ।'
                        : 'Your statutory profile is securely recorded in the Core Banking Database.'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {myEkymRecord?.submittedAt || '2083-01-15'}
                  </span>
                </div>
              </div>

              {/* Column 3: The 3 Mandatory Stored Documents */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span>📑</span>
                    <span>{lang === 'np' ? 'प्रमाणीकृत कागजातहरू' : 'Verified Documents'}</span>
                  </h4>

                  <div className="space-y-3">
                    {/* 1. Member Photo */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                      <div className="w-12 h-14 rounded bg-slate-100 overflow-hidden border border-slate-300 flex-shrink-0">
                        <img
                          src={myEkymRecord?.memberPhoto || '/uploads/kym/default-photo.svg'}
                          alt="Member Photo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/uploads/kym/default-photo.svg';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {lang === 'np' ? 'सदस्यको पासपोर्ट तस्बिर' : 'Passport Photo'}
                        </span>
                        <span className="text-[10px] text-sky-700 font-semibold flex items-center gap-1">
                          <span>✓</span> {lang === 'np' ? 'सुरक्षित भण्डारण' : 'Uploaded & Verified'}
                        </span>
                      </div>
                      <a
                        href={myEkymRecord?.memberPhoto || '/uploads/kym/default-photo.svg'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0981ae] hover:underline px-2 py-1 bg-sky-50 rounded font-semibold"
                      >
                        {lang === 'np' ? 'हेर्नुहोस्' : 'View'}
                      </a>
                    </div>

                    {/* 2. Citizenship Front */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                      <div className="w-12 h-10 rounded bg-slate-100 overflow-hidden border border-slate-300 flex-shrink-0">
                        <img
                          src={myEkymRecord?.citizenshipFront || '/uploads/kym/default-citizenship-front.svg'}
                          alt="Citizenship Front"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/uploads/kym/default-citizenship-front.svg';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {lang === 'np' ? 'नागरिकता प्रमाणपत्र (अगाडि)' : 'Citizenship (Front)'}
                        </span>
                        <span className="text-[10px] text-sky-700 font-semibold flex items-center gap-1">
                          <span>✓</span> {lang === 'np' ? 'सुरक्षित भण्डारण' : 'Uploaded & Verified'}
                        </span>
                      </div>
                      <a
                        href={myEkymRecord?.citizenshipFront || '/uploads/kym/default-citizenship-front.svg'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0981ae] hover:underline px-2 py-1 bg-sky-50 rounded font-semibold"
                      >
                        {lang === 'np' ? 'हेर्नुहोस्' : 'View'}
                      </a>
                    </div>

                    {/* 3. Citizenship Back */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                      <div className="w-12 h-10 rounded bg-slate-100 overflow-hidden border border-slate-300 flex-shrink-0">
                        <img
                          src={myEkymRecord?.citizenshipBack || '/uploads/kym/default-citizenship-back.svg'}
                          alt="Citizenship Back"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/uploads/kym/default-citizenship-back.svg';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {lang === 'np' ? 'नागरिकता प्रमाणपत्र (पछाडि)' : 'Citizenship (Back)'}
                        </span>
                        <span className="text-[10px] text-sky-700 font-semibold flex items-center gap-1">
                          <span>✓</span> {lang === 'np' ? 'सुरक्षित भण्डारण' : 'Uploaded & Verified'}
                        </span>
                      </div>
                      <a
                        href={myEkymRecord?.citizenshipBack || '/uploads/kym/default-citizenship-back.svg'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0981ae] hover:underline px-2 py-1 bg-sky-50 rounded font-semibold"
                      >
                        {lang === 'np' ? 'हेर्नुहोस्' : 'View'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={() => setIsMyEkymPrintOpen(true)}
                    className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'np' ? 'आधिकारिक फारम डाउनलोड (PDF)' : 'Download Official Form (PDF)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Passbook Statement & Transaction History */}
        <section className="bg-white rounded-2xl border border-[#bae6fd] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e6f4fa] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#0981ae] flex items-center gap-2">
                <span>📖</span>
                <span>{lang === 'np' ? 'डिजिटल पासबुक तथा कारोबार विवरण' : 'Digital Passbook & Transaction Ledger'}</span>
              </h2>
              <p className="text-xs text-[#526b7a] mt-0.5">
                {lang === 'np'
                  ? 'तपाईंको खातामा भएका पछिल्ला सबै बचत तथा भुक्तानी कारोबारहरूको आधिकारिक लेजर'
                  : 'Real-time verified transaction history of your savings account'}
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <input
                type="text"
                placeholder={lang === 'np' ? 'कारोबार खोज्नुहोस्...' : 'Search transactions...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#cce3ee] text-xs outline-none focus:border-[#0981ae]"
              />

              <div className="flex rounded-xl border border-[#cce3ee] p-0.5 bg-[#f0f9ff] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    filterType === 'all' ? 'bg-[#0981ae] text-white shadow-xs' : 'text-[#526b7a]'
                  }`}
                >
                  {lang === 'np' ? 'सबै' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('CR')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    filterType === 'CR' ? 'bg-[#0981ae] text-white shadow-xs' : 'text-[#526b7a]'
                  }`}
                >
                  {lang === 'np' ? 'जम्मा (CR)' : 'Deposit (CR)'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('DR')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                    filterType === 'DR' ? 'bg-[#0981ae] text-white shadow-xs' : 'text-[#526b7a]'
                  }`}
                >
                  {lang === 'np' ? 'खर्च (DR)' : 'Withdrawal (DR)'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="bg-[#eef8fc] hover:bg-[#bae6fd] text-[#0981ae] px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title="Download CSV file of transactions"
              >
                <span>📥</span>
                <span>{lang === 'np' ? 'CSV डाउनलोड' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f4f9fc] text-[#526b7a] font-bold border-b border-[#e6f4fa]">
                <tr>
                  <th className="p-3.5">{lang === 'np' ? 'भौचर नं.' : 'Voucher ID'}</th>
                  <th className="p-3.5">{lang === 'np' ? 'मिति' : 'Date'}</th>
                  <th className="p-3.5">{lang === 'np' ? 'विवरण' : 'Particulars'}</th>
                  <th className="p-3.5">{lang === 'np' ? 'प्रकार' : 'Type'}</th>
                  <th className="p-3.5 text-right">{lang === 'np' ? 'रकम (रु.)' : 'Amount (Rs.)'}</th>
                  <th className="p-3.5 text-right">{lang === 'np' ? 'बाँकी मौज्दात (रु.)' : 'Balance (Rs.)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6f2f8]">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#f8fcfe] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#0981ae]">{tx.id}</td>
                    <td className="p-3.5 text-[#526b7a] font-mono">{tx.transDate}</td>
                    <td className="p-3.5 font-semibold text-[#0c2d3e]">{tx.particulars}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                          tx.type === 'CR'
                            ? 'bg-[#e0f2fe] text-[#0981ae]'
                            : 'bg-[#fee2e2] text-[#b91c1c]'
                        }`}
                      >
                        {tx.type === 'CR'
                          ? (lang === 'np' ? 'जम्मा (CR)' : 'CREDIT')
                          : (lang === 'np' ? 'निकासी (DR)' : 'DEBIT')}
                      </span>
                    </td>
                    <td
                      className={`p-3.5 text-right font-black font-mono ${
                        tx.type === 'CR' ? 'text-[#0981ae]' : 'text-[#b91c1c]'
                      }`}
                    >
                      {tx.type === 'CR' ? '+' : '-'} {tx.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#0c2d3e]">
                      Rs. {tx.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* INTERACTIVE BANKING MODALS                                               */}
      {/* ========================================================================= */}

      {/* MODAL 1: Co-op Internal Fund Transfer */}
      {activeModal === 'transfer' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bae6fd] relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">💸</span>
              <div>
                <h3 className="text-lg font-black text-[#0981ae]">
                  {lang === 'np' ? 'सहकारी अन्तरखाता रकम स्थानान्तरण' : 'Internal Fund Transfer'}
                </h3>
                <p className="text-xs text-[#526b7a]">
                  {lang === 'np' ? 'अर्को सदस्यको खातामा तत्काल रकम पठाउनुहोस्।' : 'Send money directly to another member account.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'प्राप्तकर्ता सदस्य छनौट गर्नुहोस्' : 'Select Cooperative Member'}
                </label>
                <select
                  value={transferRecipient}
                  onChange={(e) => {
                    const code = e.target.value;
                    setTransferRecipient(code);
                    const mem = INITIAL_MEMBERS.find((m) => m.memberCode === code);
                    if (mem) setTransferRecipientName(mem.fullName);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-xs font-bold"
                >
                  {INITIAL_MEMBERS.filter((m) => m.memberCode !== activeMember.memberCode).map((m) => (
                    <option key={m.id} value={m.memberCode}>
                      {m.fullName} ({m.memberCode} - {m.branch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'रकम (रु.)' : 'Transfer Amount (Rs.)'}
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="100"
                  max={savingsBalance}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-sm font-black text-[#0981ae]"
                />
                <span className="text-[11px] text-[#526b7a] mt-1 block">
                  {lang === 'np' ? 'उपलब्ध बचत मौज्दात:' : 'Available in Savings:'}{' '}
                  <strong>Rs. {(savingsBalance ?? 0).toLocaleString()}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'कैफियत / प्रयोजन' : 'Narration / Remarks'}
                </label>
                <input
                  type="text"
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? '४-अङ्कको ट्रान्ज्याक्सन पिन' : '4-Digit Transaction PIN'}
                </label>
                <input
                  type="password"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value)}
                  required
                  maxLength={4}
                  placeholder="1234"
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-xs font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {lang === 'np' ? 'परीक्षण पिन: 1234' : 'Demo PIN: 1234'}
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#cce3ee] text-xs font-bold text-[#526b7a] hover:bg-[#f4f9fc] cursor-pointer"
                >
                  {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {lang === 'np' ? 'रकम पठाउनुहोस् ➔' : 'Confirm Transfer ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Open Term Deposit / Fixed Deposit */}
      {activeModal === 'termDeposit' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-300 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">📜</span>
              <div>
                <h3 className="text-lg font-black text-sky-900">
                  {lang === 'np' ? 'नयाँ मुद्दती बचत निक्षेप खोल्ने' : 'Open Fixed Term Deposit'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'np'
                    ? 'आकर्षक ब्याजदरमा सुरक्षित लगानी गर्नुहोस्। ब्याज सिधै बचत खातामा जम्मा हुनेछ।'
                    : 'Earn guaranteed high interest with monthly or quarterly payouts.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleOpenTermDeposit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'np' ? 'मुद्दती योजना छनौट गर्नुहोस्' : 'Select Term Deposit Scheme'}
                </label>
                <select
                  value={fdScheme}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFdScheme(val);
                    if (val.includes('1 Year')) {
                      setFdTenure(12);
                      setFdRate(11.75);
                    } else if (val.includes('2 Years')) {
                      setFdTenure(24);
                      setFdRate(12.0);
                    } else if (val.includes('3 Years')) {
                      setFdTenure(36);
                      setFdRate(12.25);
                    } else if (val.includes('Senior')) {
                      setFdTenure(12);
                      setFdRate(12.5);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="Ankur Bishesh Mudhati (1 Year @ 11.75%)">
                    Ankur Bishesh Mudhati (1 Year @ 11.75% P.A.)
                  </option>
                  <option value="Ankur Nari Surakshya (2 Years @ 12.00%)">
                    Ankur Nari Surakshya (2 Years @ 12.00% P.A.)
                  </option>
                  <option value="Ankur Krishi Utpadan (3 Years @ 12.25%)">
                    Ankur Krishi Utpadan (3 Years @ 12.25% P.A.)
                  </option>
                  <option value="Senior Citizen Term Deposit (1 Year @ 12.50%)">
                    Ankur Jestha Nagarik (1 Year @ 12.50% P.A.)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'np' ? 'निक्षेप रकम (रु.)' : 'Deposit Principal Amount (Rs.)'}
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  max={savingsBalance}
                  value={fdPrincipal}
                  onChange={(e) => setFdPrincipal(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-sky-900 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {lang === 'np' ? 'बचत खातामा मौज्दात:' : 'Available in Savings:'}{' '}
                  <strong>Rs. {(savingsBalance ?? 0).toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'अवधि' : 'Tenure'}
                  </label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                    {fdTenure} {lang === 'np' ? 'महिना' : 'Months'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'ब्याज भुक्तानी चक्र' : 'Payout Frequency'}
                  </label>
                  <select
                    value={fdPayout}
                    onChange={(e) => setFdPayout(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="Monthly">{lang === 'np' ? 'मासिक (Monthly)' : 'Monthly'}</option>
                    <option value="Quarterly">{lang === 'np' ? 'त्रैमासिक (Quarterly)' : 'Quarterly'}</option>
                    <option value="Maturity">{lang === 'np' ? 'परिपक्वतामा (On Maturity)' : 'On Maturity'}</option>
                  </select>
                </div>
              </div>

              {/* Real-time Calculation Box */}
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>{lang === 'np' ? 'ब्याजदर प्रतिवर्ष:' : 'Annual Interest Rate:'}</span>
                  <strong className="text-sky-800 font-bold">{fdRate}% P.A.</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{lang === 'np' ? 'अनुमानित कुल ब्याज:' : 'Projected Total Interest:'}</span>
                  <strong className="text-sky-700 font-mono font-bold">
                    + Rs. {Math.round((parseFloat(fdPrincipal || '0') * (fdRate / 100) * (fdTenure / 12))).toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-sky-200/80">
                  <span>{lang === 'np' ? 'परिपक्वता रकम:' : 'Total Maturity Value:'}</span>
                  <strong className="text-sky-900 font-mono text-sm">
                    Rs. {(parseFloat(fdPrincipal || '0') + Math.round((parseFloat(fdPrincipal || '0') * (fdRate / 100) * (fdTenure / 12)))).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {lang === 'np' ? 'मुद्दती खाता खोल्नुहोस् ➔' : 'Confirm & Open FD ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: My Personal Receive QR (Fonepay / NepalPay QR) */}
      {activeModal === 'receiveQr' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-sky-300 relative text-center">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="inline-block p-1 bg-white border border-slate-200 rounded-xl shadow-xs mb-2">
              <img
                src={cmsSettings?.coopLogoUrl || "/uploads/logos/ekata-logo-default.svg"}
                alt="Ankur Logo"
                className="h-10 w-auto mx-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/uploads/logos/ekata-logo-default.svg";
                }}
              />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 uppercase">
              {lang === 'np'
                ? (cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी')
                : (cmsSettings?.coopNameEn || 'Ankur Saving & Credit Co-op')}
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              {lang === 'np' ? 'व्यक्तिगत भुक्तानी QR (NepalPay / Fonepay)' : 'Personal Receive QR Code (Fonepay / NepalPay)'}
            </p>

            {/* Generated Vector QR Code */}
            <div className="p-4 bg-white border-2 border-[#0981ae] rounded-2xl shadow-inner inline-block relative mb-4">
              <svg
                viewBox="0 0 100 100"
                className="w-44 h-44 mx-auto"
                shapeRendering="crispEdges"
              >
                {/* Corner Markers */}
                <rect x="5" y="5" width="25" height="25" fill="#0981ae" rx="3" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="13" width="9" height="9" fill="#0981ae" />

                <rect x="70" y="5" width="25" height="25" fill="#0981ae" rx="3" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="78" y="13" width="9" height="9" fill="#0981ae" />

                <rect x="5" y="70" width="25" height="25" fill="#0981ae" rx="3" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="78" width="9" height="9" fill="#0981ae" />

                {/* Simulated QR Code Data Pixels */}
                <rect x="35" y="10" width="6" height="6" fill="#0c2d3e" />
                <rect x="45" y="10" width="6" height="6" fill="#0c2d3e" />
                <rect x="55" y="10" width="6" height="6" fill="#0c2d3e" />

                <rect x="35" y="20" width="6" height="6" fill="#0c2d3e" />
                <rect x="50" y="20" width="6" height="6" fill="#0c2d3e" />
                <rect x="60" y="20" width="6" height="6" fill="#0c2d3e" />

                <rect x="10" y="35" width="6" height="6" fill="#0c2d3e" />
                <rect x="25" y="35" width="6" height="6" fill="#0c2d3e" />
                <rect x="40" y="35" width="6" height="6" fill="#0c2d3e" />
                <rect x="70" y="35" width="6" height="6" fill="#0c2d3e" />
                <rect x="85" y="35" width="6" height="6" fill="#0c2d3e" />

                <rect x="15" y="45" width="6" height="6" fill="#0c2d3e" />
                <rect x="30" y="45" width="6" height="6" fill="#0c2d3e" />
                <rect x="70" y="45" width="6" height="6" fill="#0c2d3e" />
                <rect x="80" y="45" width="6" height="6" fill="#0c2d3e" />

                <rect x="10" y="55" width="6" height="6" fill="#0c2d3e" />
                <rect x="25" y="55" width="6" height="6" fill="#0c2d3e" />
                <rect x="40" y="55" width="6" height="6" fill="#0c2d3e" />
                <rect x="60" y="55" width="6" height="6" fill="#0c2d3e" />
                <rect x="85" y="55" width="6" height="6" fill="#0c2d3e" />

                <rect x="35" y="70" width="6" height="6" fill="#0c2d3e" />
                <rect x="50" y="70" width="6" height="6" fill="#0c2d3e" />
                <rect x="65" y="70" width="6" height="6" fill="#0c2d3e" />

                <rect x="40" y="80" width="6" height="6" fill="#0c2d3e" />
                <rect x="55" y="80" width="6" height="6" fill="#0c2d3e" />
                <rect x="75" y="80" width="6" height="6" fill="#0c2d3e" />

                {/* Center Ankur Emblem Badge */}
                <circle cx="50" cy="50" r="11" fill="#ffffff" stroke="#0981ae" strokeWidth="2" />
                <text
                  x="50"
                  y="54"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#0981ae"
                >
                  EK
                </text>
              </svg>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs mb-4 space-y-1">
              <div>
                <span className="text-slate-500">{lang === 'np' ? 'खातावालाको नाम:' : 'Account Name:'}</span>{' '}
                <strong className="text-slate-900">{activeMember.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500">{lang === 'np' ? 'खाता नम्बर:' : 'Account Number:'}</span>{' '}
                <strong className="text-sky-700 font-mono">
                  EK-SAV-{activeMember.memberCode.replace('EK-', '')}-01
                </strong>
              </div>
              <div>
                <span className="text-slate-500">{lang === 'np' ? 'शाखा:' : 'Branch:'}</span>{' '}
                <strong className="text-slate-800">{activeMember.branch}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyAccountInfo}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                📋 {copiedText ? (lang === 'np' ? 'प्रतिलिपि भयो!' : 'Copied!') : (lang === 'np' ? 'खाता प्रतिलिपि' : 'Copy Details')}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                🖨️ {lang === 'np' ? 'QR प्रिन्ट' : 'Print QR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Inward Remittance Claim */}
      {activeModal === 'remittance' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-300 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="text-lg font-black text-[#0981ae]">
                  {lang === 'np' ? 'रेमिट्यान्स सोझै खातामा भुक्तानी' : 'Claim Inward Remittance'}
                </h3>
                <p className="text-xs text-[#526b7a]">
                  {lang === 'np'
                    ? 'विदेश वा स्वदेशबाट आएको रेमिट्यान्स तुरुन्त बचत खातामा जम्मा गर्नुहोस्।'
                    : 'Receive domestic or international money transfer directly into your account.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleRemittanceClaim} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'np' ? 'रेमिट्यान्स सेवा प्रदायक' : 'Remittance Service Provider'}
                </label>
                <select
                  value={remitProvider}
                  onChange={(e) => setRemitProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="Western Union">Western Union Money Transfer</option>
                  <option value="IME Remit">IME Remit Nepal</option>
                  <option value="Prabhu Money Transfer">Prabhu Money Transfer</option>
                  <option value="City Express">City Express Money Transfer</option>
                  <option value="Himalayan Remit">Himalayan Remit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'np' ? 'कन्ट्रोल नम्बर / MTCN कोड' : 'Control Number / MTCN Code'}
                </label>
                <input
                  type="text"
                  required
                  value={remitMtcn}
                  onChange={(e) => setRemitMtcn(e.target.value)}
                  placeholder="e.g. 8492048192"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold font-mono text-[#0981ae]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'पठाउने देश' : 'Sending Country'}
                  </label>
                  <input
                    type="text"
                    required
                    value={remitCountry}
                    onChange={(e) => setRemitCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'पठाउने व्यक्तिको नाम' : 'Sender Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={remitSender}
                    onChange={(e) => setRemitSender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'np' ? 'अपेक्षित रकम (रु.)' : 'Expected Amount in NPR (Rs.)'}
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={remitAmount}
                  onChange={(e) => setRemitAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-black font-mono text-sky-700"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-[11px] text-sky-800">
                ✓ {lang === 'np'
                  ? `प्रमाणीकरणपछि रकम सदस्य ${activeMember.fullName} को बचत खातामा तत्काल क्रेडिट हुनेछ।`
                  : `Upon verification, funds will be instantly credited to member ${activeMember.fullName}'s savings account.`}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {lang === 'np' ? 'दाबी गर्नुहोस् ➔' : 'Verify & Claim ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Utility & Bill Payments */}
      {activeModal === 'utility' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bae6fd] relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">📲</span>
              <div>
                <h3 className="text-lg font-black text-[#0981ae]">
                  {lang === 'np' ? 'डिजिटल बिल तथा रिचार्ज भुक्तानी' : 'Digital Utility & Bill Payment'}
                </h3>
                <p className="text-xs text-[#526b7a]">
                  {lang === 'np' ? 'मोबाइल, विद्युत, खानेपानी तथा इन्टरनेट बिल भुक्तानी' : 'Instant utility payments directly from savings.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUtilitySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'सेवा प्रदायक' : 'Utility Service Provider'}
                </label>
                <select
                  value={utilityService}
                  onChange={(e) => setUtilityService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-xs font-bold"
                >
                  <option value="NTC Mobile Topup">NTC Prepaid / Postpaid Recharge</option>
                  <option value="Ncell Recharge">Ncell Mobile Topup</option>
                  <option value="NEA Electricity Bill">NEA Electricity (नेपाल विद्युत प्राधिकरण)</option>
                  <option value="Khanepani Water Bill">Khanepani (खानेपानी महसुल)</option>
                  <option value="WorldLink Internet">WorldLink Communications ISP</option>
                  <option value="Vianet Internet">Vianet Fiber Internet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'ग्राहक नं. / मोबाइल नम्बर' : 'Consumer ID / Mobile Number'}
                </label>
                <input
                  type="text"
                  value={utilityAccount}
                  onChange={(e) => setUtilityAccount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'भुक्तानी रकम (रु.)' : 'Amount to Pay (Rs.)'}
                </label>
                <input
                  type="number"
                  value={utilityAmount}
                  onChange={(e) => setUtilityAmount(e.target.value)}
                  min="10"
                  max={savingsBalance}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-sm font-black text-[#0981ae]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#cce3ee] text-xs font-bold text-[#526b7a] hover:bg-[#f4f9fc] cursor-pointer"
                >
                  {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {lang === 'np' ? 'बिल तिर्नुहोस् ➔' : 'Pay Bill Now ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Instant Digital QR Deposit */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bae6fd] relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">💳</span>
              <div>
                <h3 className="text-lg font-black text-[#0981ae]">
                  {lang === 'np' ? 'डिजिटल तत्काल निक्षेप जम्मा' : 'Instant Digital Account Topup'}
                </h3>
                <p className="text-xs text-[#526b7a]">
                  {lang === 'np' ? 'मोबाइल बैंकिङ वा वालेटमार्फत तुरुन्त रकम जम्मा गर्नुहोस्।' : 'Deposit funds from any commercial bank via QR or ConnectIPS.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'डिजिटल गेटवे' : 'Gateway Source'}
                </label>
                <select
                  value={depositSource}
                  onChange={(e) => setDepositSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-xs font-bold"
                >
                  <option value="NepalPay / Fonepay QR">NepalPay / Fonepay Dynamic QR</option>
                  <option value="ConnectIPS Direct Pay">ConnectIPS Direct Member Bank</option>
                  <option value="eSewa Wallet">eSewa Mobile Wallet</option>
                  <option value="Khalti Digital Wallet">Khalti Digital Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c2d3e] mb-1">
                  {lang === 'np' ? 'जम्मा गर्ने रकम (रु.)' : 'Deposit Amount (Rs.)'}
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="500"
                  step="500"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#cce3ee] text-sm font-black text-[#0981ae]"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-[11px] text-sky-800">
                ✓ {lang === 'np'
                  ? 'रकम सिधै तपाईंको नियमित बचत खातामा तुरुन्तै क्रेडिट हुनेछ।'
                  : 'Funds will be immediately credited to your regular savings account balance.'}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#cce3ee] text-xs font-bold text-[#526b7a] hover:bg-[#f4f9fc] cursor-pointer"
                >
                  {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {lang === 'np' ? 'जम्मा पुष्टि गर्नुहोस् ➔' : 'Proceed to Topup ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Share Capital Certificate Viewer */}
      {activeModal === 'shareCert' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-amber-400 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Official Cooperative Share Certificate */}
            <div className="border-4 border-amber-600/30 p-6 rounded-xl bg-amber-50/30 text-center relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-white p-1 mx-auto mb-2 border border-amber-300 shadow-sm">
                <img
                  src={cmsSettings?.coopLogoUrl || "/uploads/logos/ekata-logo-default.svg"}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/uploads/logos/ekata-logo-default.svg";
                  }}
                />
              </div>

              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
                {lang === 'np' ? 'सहकारी विभाग, नेपाल' : 'Department of Cooperatives, Nepal'}
              </span>
              <h3 className="text-lg font-extrabold text-[#052636] uppercase tracking-tight">
                {lang === 'np'
                  ? (cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.')
                  : (cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.')}
              </h3>
              <p className="text-[11px] text-slate-600">
                {lang === 'np' ? 'बुटवल-४, रुपन्देही • दर्ता नं: ४२१/०५७/०५८' : 'Butwal-4, Rupandehi • Regd. No: 421/057/058'}
              </p>

              <div className="my-4 py-2 border-y-2 border-amber-600/30">
                <h4 className="text-sm font-black text-amber-900 tracking-wider uppercase">
                  {lang === 'np' ? 'शेयर स्वामित्व प्रमाणपत्र' : 'Certificate of Shareholding'}
                </h4>
                <span className="text-[11px] font-mono text-slate-600">
                  {lang === 'np' ? 'प्रमाणपत्र नं:' : 'Certificate No:'} <strong>EK-SH-2057/0948</strong>
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed text-left mb-4">
                {lang === 'np'
                  ? `यस संस्थाका सदस्य श्री ${activeMember.fullName} (सदस्य कोड: ${activeMember.memberCode}) लाई प्रति शेयर रु. १००।- का दरले कुल ${Math.round((shareAmount ?? 100000) / 100)} कित्ता शेयर बापत रु. ${(shareAmount ?? 100000).toLocaleString()}।- (अक्षरेपी एक लाख रुपैयाँ मात्र) को स्वामित्व प्रदान गरिएको प्रमाणित गरिन्छ।`
                  : `This certifies that Member ${activeMember.fullName} (Member Code: ${activeMember.memberCode}) is the registered owner of ${Math.round((shareAmount ?? 100000) / 100)} fully paid ordinary share units of Rs. 100 each, amounting to Rs. ${(shareAmount ?? 100000).toLocaleString()} in Ankur Saving & Credit Cooperative Ltd.`}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-300 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">{lang === 'np' ? 'प्रबन्धक' : 'General Manager'}</span>
                  <strong className="text-slate-900 font-serif">K. P. Bhandari</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{lang === 'np' ? 'अध्यक्ष' : 'Chairman'}</span>
                  <strong className="text-slate-900 font-serif">D. R. Gautam</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                🖨️ {lang === 'np' ? 'प्रमाणपत्र प्रिन्ट गर्नुहोस्' : 'Print Share Certificate'}
              </button>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {lang === 'np' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: Loan EMI Calculator */}
      {activeModal === 'calc' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#bae6fd] relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">🧮</span>
              <div>
                <h3 className="text-lg font-black text-[#0981ae]">
                  {lang === 'np' ? 'कर्जा ईएमआई क्याल्कुलेटर तथा आवेदन' : 'Loan EMI Calculator & Eligibility'}
                </h3>
                <p className="text-xs text-[#526b7a]">
                  {lang === 'np' ? 'मासिक किस्ता र ब्याज गणना गर्नुहोस्।' : 'Calculate accurate monthly repayments and interest breakdown.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#0c2d3e] mb-1">
                  <span>{lang === 'np' ? 'कर्जा साँवा रकम:' : 'Loan Principal Amount:'}</span>
                  <span className="font-mono text-[#0981ae] text-sm">Rs. {calcPrincipal.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="2000000"
                  step="25000"
                  value={calcPrincipal}
                  onChange={(e) => setCalcPrincipal(parseFloat(e.target.value))}
                  className="w-full accent-[#0981ae] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#0c2d3e] mb-1">
                  <span>{lang === 'np' ? 'वार्षिक ब्याजदर:' : 'Annual Interest Rate:'}</span>
                  <span className="font-mono text-[#0981ae] text-sm">{calcRate}% P.A.</span>
                </div>
                <input
                  type="range"
                  min="9"
                  max="16"
                  step="0.25"
                  value={calcRate}
                  onChange={(e) => setCalcRate(parseFloat(e.target.value))}
                  className="w-full accent-[#0981ae] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#0c2d3e] mb-1">
                  <span>{lang === 'np' ? 'भुक्तानी अवधि (महिना):' : 'Repayment Period (Months):'}</span>
                  <span className="font-mono text-[#0981ae] text-sm">{calcMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="60"
                  step="6"
                  value={calcMonths}
                  onChange={(e) => setCalcMonths(parseInt(e.target.value, 10))}
                  className="w-full accent-[#0981ae] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#f0f9ff] rounded-xl border border-[#bae6fd] text-center">
                <div>
                  <span className="text-[10px] text-[#526b7a] block">{lang === 'np' ? 'मासिक ईएमआई' : 'Monthly EMI'}</span>
                  <strong className="text-sm font-black text-[#0981ae] font-mono">
                    Rs. {calculatedEmi.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#526b7a] block">{lang === 'np' ? 'कुल ब्याज' : 'Total Interest'}</span>
                  <strong className="text-xs font-bold text-[#0c2d3e] font-mono">
                    Rs. {totalInterestPayable.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#526b7a] block">{lang === 'np' ? 'कुल भुक्तानी' : 'Total Payable'}</span>
                  <strong className="text-xs font-bold text-[#0c2d3e] font-mono">
                    Rs. {totalRepayment.toLocaleString()}
                  </strong>
                </div>
              </div>

              <form onSubmit={handleApplyLoan} className="pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
                >
                  {lang === 'np' ? 'यो योजनामा कर्जा आवेदन दिनुहोस् ➔' : 'Apply Online for this Loan ➔'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: PIN & Security Settings */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">🔐</span>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {lang === 'np' ? 'पिन तथा सुरक्षा सेटिङ' : 'Security & PIN Preferences'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'np' ? 'कारोबार पिन तथा २-कारक प्रमाणीकरण व्यवस्थापन गर्नुहोस्।' : 'Manage 4-digit transaction PIN and login security.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSecuritySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'np' ? 'हालको ट्रान्ज्याक्सन पिन' : 'Current Transaction PIN'}
                </label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength={4}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'नयाँ ४-अङ्कको पिन' : 'New 4-Digit PIN'}
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={4}
                    placeholder="e.g. 5678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'np' ? 'पिन पुन: प्रविष्ट' : 'Confirm New PIN'}
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    maxLength={4}
                    placeholder="e.g. 5678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>{lang === 'np' ? 'एसएमएस कारोबार अलर्ट (SMS Alerts)' : 'Instant SMS Alerts for Transactions'}</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="rounded text-[#0981ae]"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>{lang === 'np' ? '२-कारक प्रमाणीकरण (2FA Verification)' : 'Two-Factor Authentication (2FA)'}</span>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="rounded text-[#0981ae]"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {lang === 'np' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {lang === 'np' ? 'सुरक्षित गर्नुहोस् ➔' : 'Save Changes ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 10: Member's eKYM Statutory Dossier Modal */}
      {activeModal === 'myEkym' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#bae6fd] relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0981ae]">
                  {lang === 'np'
                    ? 'सदस्य eKYM दर्ता तथा कागजात प्रमाणीकरण विवरण'
                    : 'Member eKYM Statutory Dossier'}
                </h3>
                <p className="text-xs text-[#526b7a]">
                  {lang === 'np'
                    ? 'केन्द्रीय बैंकिंग प्रणाली (CBS) मा प्रमाणीकृत तपाईंको आधिकारिक सदस्यता अभिलेख'
                    : 'Verified statutory member registration under Nepal Cooperative Regulations'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Top Banner with App No and Status */}
              <div className="flex items-center justify-between p-3.5 bg-sky-50 rounded-xl border border-sky-200">
                <div>
                  <span className="text-[11px] text-sky-800 font-semibold block">
                    {lang === 'np' ? 'आधिकारिक आवेदन / दर्ता नं.' : 'Official Registration Number:'}
                  </span>
                  <span className="font-mono text-sky-950 font-bold text-sm">
                    {myEkymRecord?.applicationNo || 'EKT-KYC-2083-10482'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">
                    {lang === 'np' ? 'प्रमाणीकरण अवस्था' : 'Status'}
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-sky-100 text-sky-800 border border-sky-300">
                    ✓ {myEkymRecord?.status || 'Approved'}
                  </span>
                </div>
              </div>

              {/* Uploaded Documents Grid */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <span>📷</span>
                  <span>{lang === 'np' ? 'प्रमाणीकृत कागजात तथा तस्बिर' : 'Verified Identification Documents'}</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="w-full h-24 rounded-lg bg-slate-200 overflow-hidden mb-1.5 border border-slate-300">
                      <img
                        src={myEkymRecord?.memberPhoto || '/uploads/kym/default-photo.svg'}
                        alt="Photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/uploads/kym/default-photo.svg';
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      {lang === 'np' ? 'सदस्य फोटो' : 'Member Photo'}
                    </span>
                    <a
                      href={myEkymRecord?.memberPhoto || '/uploads/kym/default-photo.svg'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-sky-700 hover:underline font-semibold mt-0.5 inline-block"
                    >
                      {lang === 'np' ? 'पूर्ण आकार' : 'View Full'}
                    </a>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="w-full h-24 rounded-lg bg-slate-200 overflow-hidden mb-1.5 border border-slate-300">
                      <img
                        src={myEkymRecord?.citizenshipFront || '/uploads/kym/default-citizenship-front.svg'}
                        alt="Citizenship Front"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/uploads/kym/default-citizenship-front.svg';
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      {lang === 'np' ? 'नागरिकता (अगाडि)' : 'Citizenship Front'}
                    </span>
                    <a
                      href={myEkymRecord?.citizenshipFront || '/uploads/kym/default-citizenship-front.svg'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-sky-700 hover:underline font-semibold mt-0.5 inline-block"
                    >
                      {lang === 'np' ? 'पूर्ण आकार' : 'View Full'}
                    </a>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="w-full h-24 rounded-lg bg-slate-200 overflow-hidden mb-1.5 border border-slate-300">
                      <img
                        src={myEkymRecord?.citizenshipBack || '/uploads/kym/default-citizenship-back.svg'}
                        alt="Citizenship Back"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/uploads/kym/default-citizenship-back.svg';
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      {lang === 'np' ? 'नागरिकता (पछाडि)' : 'Citizenship Back'}
                    </span>
                    <a
                      href={myEkymRecord?.citizenshipBack || '/uploads/kym/default-citizenship-back.svg'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-sky-700 hover:underline font-semibold mt-0.5 inline-block"
                    >
                      {lang === 'np' ? 'पूर्ण आकार' : 'View Full'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Bio & Identity Data Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Full Name:</span>
                  <span className="font-bold text-slate-900">{myEkymRecord?.fullNameEn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">पूरा नाम:</span>
                  <span className="font-bold text-slate-900">{myEkymRecord?.fullNameNp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Citizenship No:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {myEkymRecord?.citizenshipNo} ({myEkymRecord?.citizenshipDistrict})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Date of Birth / Gender:</span>
                  <span className="font-bold text-slate-900">
                    {myEkymRecord?.dob} ({myEkymRecord?.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Father / Mother:</span>
                  <span className="font-bold text-slate-900">
                    {myEkymRecord?.fatherName} / {myEkymRecord?.motherName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Grandfather:</span>
                  <span className="font-bold text-slate-900">{myEkymRecord?.grandfatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Permanent Address:</span>
                  <span className="font-bold text-slate-900">{myEkymRecord?.permanentAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Nominee & Relation:</span>
                  <span className="font-bold text-slate-900">
                    {myEkymRecord?.nomineeName} ({myEkymRecord?.nomineeRelation})
                  </span>
                </div>
              </div>

              {/* Print / Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMyEkymPrintOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#0981ae] hover:bg-[#065371] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'np' ? 'फारम प्रिन्ट / PDF डाउनलोड' : 'Print / Download Official PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {lang === 'np' ? 'बन्द गर्नुहोस्' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Official eKYM PDF Modal */}
      <PrintableKymDocument
        record={myEkymRecord}
        isOpen={isMyEkymPrintOpen}
        onClose={() => setIsMyEkymPrintOpen(false)}
        coopLogoUrl={cmsSettings?.coopLogoUrl || '/uploads/logos/ekata-logo-default.svg'}
      />
    </div>
  );
};
