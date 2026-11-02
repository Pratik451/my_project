import React, { useState, useEffect } from 'react';
import { Language, EkymRecord, EkymFormData, SiteSettingsCMS } from '../types';
import { StepWizardBar, WIZARD_STEPS } from './ekym/StepWizardBar';
import { Step1Personal } from './ekym/Step1Personal';
import { Step2Address } from './ekym/Step2Address';
import { Step3Business } from './ekym/Step3Business';
import { Step4Income } from './ekym/Step4Income';
import { Step5Transaction } from './ekym/Step5Transaction';
import { Step6Preview } from './ekym/Step6Preview';
import { Step7Success } from './ekym/Step7Success';
import { submitEkymApplication } from '../services/ekymApi';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Globe,
  Building,
  Loader2,
} from 'lucide-react';

interface EkymPortalProps {
  lang: Language;
  onSubmitted?: (record: EkymRecord) => void;
  onExitToWebsite: () => void;
  onOpenAdmin?: () => void;
  cmsSettings?: SiteSettingsCMS;
}

const STORAGE_KEY = 'ekata_ekym_wizard_draft_v2';

export const INITIAL_FORM_DATA: EkymFormData = {
  // Step 1: Personal
  membershipType: 'New Member',
  membershipNo: '',
  fullNameEn: '',
  fullNameNp: '',
  dob: '',
  gender: 'Male',
  idType: 'Citizenship',
  citizenshipNo: '',
  citizenshipIssueDate: '',
  citizenshipDistrict: 'Rupandehi',
  fatherName: '',
  motherName: '',
  grandfatherName: '',
  maritalStatus: 'Married',
  spouseName: '',
  education: 'Bachelor Degree',
  occupation: 'Business/Trade',
  panNumber: '',
  memberPhoto: '',
  citizenshipFront: '',
  citizenshipBack: '',

  // Step 2: Address
  permProvince: 'Lumbini Province',
  permDistrict: 'Rupandehi',
  permMunicipality: 'Butwal Sub-Metropolitan City',
  permWard: '4',
  permTole: 'Traffic Chowk, Main Road',
  permHouseNo: '',
  sameAsPermanent: true,
  tempProvince: 'Lumbini Province',
  tempDistrict: 'Rupandehi',
  tempMunicipality: 'Butwal Sub-Metropolitan City',
  tempWard: '4',
  tempTole: 'Traffic Chowk, Main Road',
  mobile: '',
  telephone: '',
  email: '',
  emergencyContactPerson: '',
  emergencyContactPhone: '',

  // Step 3: Business
  hasBusiness: 'No',
  businessName: '',
  businessType: 'Sole Proprietorship',
  registrationNo: '',
  registeredAuthority: '',
  panVatNumber: '',
  establishedDate: '',
  natureOfBusiness: '',
  businessAddress: '',
  designationInFirm: 'Proprietor',
  employeeCount: '',
  annualTurnover: '',

  // Step 4: Income
  primaryIncomeSource: 'Business / Trade',
  secondaryIncomeSource: 'Rental Income',
  estimatedMonthlyIncome: 'Rs. 75,000',
  estimatedAnnualIncome: 'Rs. 900,000',
  otherFinancialDetails: '',
  taxPayerCategory: 'Individual Taxpayer',
  bankName: 'Global IME Bank Ltd.',
  bankBranch: 'Traffic Chowk, Butwal',
  bankAccountNo: '',
  bankAccountName: '',

  // Step 5: Transaction
  preferredBranch: 'Main Central Branch (Butwal-4, Traffic Chowk)',
  accountTypeInterest: 'Ankur Super Saving (7.50% Daily Interest)',
  expectedMonthlyDeposit: 'Rs. 25,000',
  expectedMonthlyWithdrawal: 'Rs. 15,000',
  expectedAnnualTurnover: 'Rs. 500,000',
  purposeOfAccount: 'Regular Thrift Savings & Wealth Accumulation',
  digitalBankingOptIn: true,
  smsAlertOptIn: true,
  nomineeName: '',
  nomineeRelation: 'Spouse',
  nomineeCitizenship: '',
  nomineeDobOrAge: '',
  nomineeContact: '',
};

export const SAMPLE_DATA: EkymFormData = {
  membershipType: 'New Member',
  membershipNo: '',
  fullNameEn: 'SUBHASH SHARMA',
  fullNameNp: 'सुभाष शर्मा',
  dob: '2048-03-14',
  gender: 'Male',
  idType: 'Citizenship',
  citizenshipNo: '38-01-72-04821',
  citizenshipIssueDate: '2066-04-18',
  citizenshipDistrict: 'Rupandehi',
  fatherName: 'Bishnu Prasad Sharma',
  motherName: 'Radha Devi Sharma',
  grandfatherName: 'Chhabilal Sharma',
  maritalStatus: 'Married',
  spouseName: 'Sunita Sharma',
  education: 'Bachelor Degree',
  occupation: 'Business/Trade',
  panNumber: '109847123',
  memberPhoto: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23e2e8f0"/><circle cx="150" cy="110" r="50" fill="%23087a45"/><path d="M70 250 C70 190 230 190 230 250 Z" fill="%23087a45"/><text x="150" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231e293b" text-anchor="middle">SUBHASH SHARMA</text></svg>',
  citizenshipFront: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><rect width="480" height="300" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="3"/><rect x="20" y="20" width="440" height="50" rx="6" fill="%23087a45"/><text x="240" y="52" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23ffffff" text-anchor="middle">NEPAL CITIZENSHIP CERTIFICATE</text><rect x="30" y="90" width="90" height="110" rx="4" fill="%23e2e8f0"/><text x="280" y="140" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23087a45" text-anchor="middle">CERTIFICATE NO: 38-01-72-04821</text><text x="280" y="170" font-family="sans-serif" font-size="12" fill="%23475569" text-anchor="middle">NAME: SUBHASH SHARMA</text></svg>',
  citizenshipBack: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><rect width="480" height="300" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="3"/><rect x="20" y="20" width="440" height="50" rx="6" fill="%231e293b"/><text x="240" y="52" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23ffffff" text-anchor="middle">CITIZENSHIP OFFICIAL ENDORSEMENT</text><text x="240" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23dc2626" text-anchor="middle">OFFICIAL SEAL - DAO RUPANDEHI</text><text x="240" y="220" font-family="sans-serif" font-size="12" fill="%2364748b" text-anchor="middle">ISSUED IN COMPLIANCE WITH CITIZENSHIP ACT</text></svg>',

  permProvince: 'Lumbini Province',
  permDistrict: 'Rupandehi',
  permMunicipality: 'Butwal Sub-Metropolitan City',
  permWard: '4',
  permTole: 'Traffic Chowk, Main Market',
  permHouseNo: '142',
  sameAsPermanent: true,
  tempProvince: 'Lumbini Province',
  tempDistrict: 'Rupandehi',
  tempMunicipality: 'Butwal Sub-Metropolitan City',
  tempWard: '4',
  tempTole: 'Traffic Chowk, Main Market',
  mobile: '9857099441',
  telephone: '071-540982',
  email: 'subhash.sharma@gmail.com',
  emergencyContactPerson: 'Sunita Sharma (Spouse)',
  emergencyContactPhone: '9847099124',

  hasBusiness: 'Yes',
  businessName: 'Subhash Grocery & Food Wholesale Firm',
  businessType: 'Sole Proprietorship',
  registrationNo: '10482/075/076',
  registeredAuthority: 'Butwal Sub-Metropolitan City Office',
  panVatNumber: '604829104',
  establishedDate: '2075-02-15',
  natureOfBusiness: 'Wholesale & Retail Consumer Goods',
  businessAddress: 'Traffic Chowk, Butwal-4, Rupandehi',
  designationInFirm: 'Proprietor',
  employeeCount: '4',
  annualTurnover: 'Rs. 6,500,000',

  primaryIncomeSource: 'Business / Trade',
  secondaryIncomeSource: 'Rental Income',
  estimatedMonthlyIncome: 'Rs. 95,000',
  estimatedAnnualIncome: 'Rs. 1,140,000',
  otherFinancialDetails: 'Own 3-storey commercial house at Traffic Chowk, 4 kattha farmland in Tilottama-2',
  taxPayerCategory: 'Sole Proprietor',
  bankName: 'Global IME Bank Ltd.',
  bankBranch: 'Butwal Main Branch',
  bankAccountNo: '04801010048123',
  bankAccountName: 'SUBHASH SHARMA',

  preferredBranch: 'Main Central Branch (Butwal-4, Traffic Chowk)',
  accountTypeInterest: 'Ankur Super Saving (7.50% Daily Interest)',
  expectedMonthlyDeposit: 'Rs. 30,000',
  expectedMonthlyWithdrawal: 'Rs. 15,000',
  expectedAnnualTurnover: 'Rs. 600,000',
  purposeOfAccount: 'Regular Thrift Savings & Wealth Accumulation',
  digitalBankingOptIn: true,
  smsAlertOptIn: true,
  nomineeName: 'Sunita Sharma',
  nomineeRelation: 'Spouse',
  nomineeCitizenship: '38-01-76-02911',
  nomineeDobOrAge: '32 Years',
  nomineeContact: '9847099124',
};

export const EkymPortal: React.FC<EkymPortalProps> = ({
  lang,
  onSubmitted,
  onExitToWebsite,
  onOpenAdmin,
  cmsSettings,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<EkymFormData>(INITIAL_FORM_DATA);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [certified, setCertified] = useState<boolean>(false);
  const [certifiedError, setCertifiedError] = useState<string>('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string>('');

  const handleFieldChange = (field: keyof EkymFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field if present
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // One-click demo data filler
  const handleFillSample = () => {
    setFormData(SAMPLE_DATA);
    setErrors({});
    setSaveStatus('Sample data loaded!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleClearDraft = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setCompletedSteps([]);
    setErrors({});
    setCertified(false);
    setSaveStatus(lang === 'np' ? 'फाराम खाली गरियो' : 'Form reset successfully');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (formData.membershipType === 'Existing Member' && !formData.membershipNo?.trim()) {
        stepErrors.membershipNo = 'Existing membership number is required';
      }
      if (!formData.fullNameEn.trim() || formData.fullNameEn.trim().length < 3) {
        stepErrors.fullNameEn = 'Full Name in English is required (at least 3 letters)';
      }
      if (!formData.dob.trim()) {
        stepErrors.dob = 'Date of birth is required (YYYY-MM-DD)';
      }
      if (!formData.gender) {
        stepErrors.gender = 'Gender selection is required';
      }
      if (!formData.citizenshipNo.trim()) {
        stepErrors.citizenshipNo = 'Citizenship or National ID number is required';
      }
      if (!formData.citizenshipIssueDate.trim()) {
        stepErrors.citizenshipIssueDate = 'Issue date is required';
      }
      if (!formData.citizenshipDistrict.trim()) {
        stepErrors.citizenshipDistrict = 'Issuing district is required';
      }
      if (!formData.fatherName.trim()) {
        stepErrors.fatherName = "Father's full name is required";
      }
      if (!formData.motherName.trim()) {
        stepErrors.motherName = "Mother's full name is required";
      }
      if (!formData.grandfatherName.trim()) {
        stepErrors.grandfatherName = "Grandfather's full name is mandatory under cooperative KYC standards";
      }
      if (!formData.memberPhoto?.trim()) {
        stepErrors.memberPhoto = "Applicant passport-size photo is mandatory";
      }
      if (!formData.citizenshipFront?.trim()) {
        stepErrors.citizenshipFront = "Citizenship certificate front side image is mandatory";
      }
      if (!formData.citizenshipBack?.trim()) {
        stepErrors.citizenshipBack = "Citizenship certificate back side image is mandatory";
      }
      if (!formData.maritalStatus) {
        stepErrors.maritalStatus = 'Marital status is required';
      }
      if (formData.maritalStatus === 'Married' && !formData.spouseName?.trim()) {
        stepErrors.spouseName = "Spouse's full name is required for married applicants";
      }
      if (!formData.education) {
        stepErrors.education = 'Educational qualification is required';
      }
      if (!formData.occupation) {
        stepErrors.occupation = 'Primary occupation is required';
      }
    }

    if (step === 2) {
      if (!formData.permProvince) stepErrors.permProvince = 'Province is required';
      if (!formData.permDistrict.trim()) stepErrors.permDistrict = 'District is required';
      if (!formData.permMunicipality.trim()) stepErrors.permMunicipality = 'Municipality is required';
      if (!formData.permWard.trim()) stepErrors.permWard = 'Ward number is required';

      if (!formData.sameAsPermanent) {
        if (!formData.tempProvince) stepErrors.tempProvince = 'Current province is required';
        if (!formData.tempDistrict.trim()) stepErrors.tempDistrict = 'Current district is required';
        if (!formData.tempMunicipality.trim()) stepErrors.tempMunicipality = 'Current municipality is required';
        if (!formData.tempWard.trim()) stepErrors.tempWard = 'Current ward is required';
      }

      const cleanMobile = formData.mobile.replace(/[^0-9]/g, '');
      if (!cleanMobile || cleanMobile.length !== 10) {
        stepErrors.mobile = 'Enter a valid 10-digit mobile number (e.g. 98XXXXXXXX)';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        stepErrors.email = 'Enter a valid email address (e.g. user@gmail.com)';
      }
    }

    if (step === 3) {
      if (formData.hasBusiness === 'Yes') {
        if (!formData.businessName?.trim()) stepErrors.businessName = 'Business/Organization name is required';
        if (!formData.businessType) stepErrors.businessType = 'Entity legal type is required';
        if (!formData.registrationNo?.trim()) stepErrors.registrationNo = 'Registration number is required';
        if (!formData.registeredAuthority?.trim()) stepErrors.registeredAuthority = 'Registering authority is required';
        if (!formData.panVatNumber?.trim()) stepErrors.panVatNumber = 'PAN/VAT number is required';
        if (!formData.natureOfBusiness?.trim()) stepErrors.natureOfBusiness = 'Nature of business is required';
        if (!formData.designationInFirm) stepErrors.designationInFirm = 'Designation/Role is required';
        if (!formData.businessAddress?.trim()) stepErrors.businessAddress = 'Business operating address is required';
      }
    }

    if (step === 4) {
      if (!formData.primaryIncomeSource) stepErrors.primaryIncomeSource = 'Primary income source is required';
      if (!formData.estimatedMonthlyIncome.trim()) stepErrors.estimatedMonthlyIncome = 'Estimated monthly income is required';
      if (!formData.estimatedAnnualIncome.trim()) stepErrors.estimatedAnnualIncome = 'Estimated annual income is required';
      if (!formData.taxPayerCategory) stepErrors.taxPayerCategory = 'Taxpayer category is required';
      if (!formData.bankName.trim()) stepErrors.bankName = 'Bank name is required';
      if (!formData.bankBranch.trim()) stepErrors.bankBranch = 'Bank branch location is required';
      if (!formData.bankAccountNo.trim()) stepErrors.bankAccountNo = 'Bank account number is required';
      if (!formData.bankAccountName.trim()) stepErrors.bankAccountName = 'Account holder name is required';
    }

    if (step === 5) {
      if (!formData.preferredBranch) stepErrors.preferredBranch = 'Cooperative branch selection is required';
      if (!formData.accountTypeInterest) stepErrors.accountTypeInterest = 'Savings scheme is required';
      if (!formData.expectedMonthlyDeposit.trim()) stepErrors.expectedMonthlyDeposit = 'Expected monthly deposit is required';
      if (!formData.expectedMonthlyWithdrawal.trim()) stepErrors.expectedMonthlyWithdrawal = 'Expected monthly withdrawal is required';
      if (!formData.expectedAnnualTurnover.trim()) stepErrors.expectedAnnualTurnover = 'Expected annual turnover is required';
      if (!formData.purposeOfAccount) stepErrors.purposeOfAccount = 'Purpose of account is required';
      if (!formData.nomineeName.trim()) stepErrors.nomineeName = 'Nominee full name is mandatory';
      if (!formData.nomineeRelation) stepErrors.nomineeRelation = 'Nominee relationship is required';
    }

    if (step === 6) {
      if (!certified) {
        setCertifiedError(
          lang === 'np'
            ? 'कृपया अगाडि बढ्न कानुनी स्व-घोषणा (Statutory Declaration) मा चिन्ह लगाउनुहोस्।'
            : 'Please agree to the mandatory statutory declaration to proceed with submission.'
        );
        return false;
      }
      setCertifiedError('');
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (targetStep: number) => {
    // Only allow jumping back to completed steps or current
    if (completedSteps.includes(targetStep) || targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    // Strict pre-submission check: ensure all 3 mandatory identity images and grandfather name are present
    if (!formData.grandfatherName?.trim()) {
      setErrors((prev) => ({
        ...prev,
        grandfatherName: lang === 'np' ? 'हजुरबुवाको पूरा नाम अनिवार्य छ।' : "Grandfather's full name is mandatory",
      }));
      setCurrentStep(1);
      setSubmissionError(
        lang === 'np' ? 'कृपया हजुरबुवाको नाम प्रविष्ट गर्नुहोस्।' : "Grandfather's full name is required."
      );
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (!formData.memberPhoto?.trim() || !formData.citizenshipFront?.trim() || !formData.citizenshipBack?.trim()) {
      setErrors((prev) => ({
        ...prev,
        ...(!formData.memberPhoto?.trim()
          ? { memberPhoto: lang === 'np' ? 'सदस्यको फोटो अनिवार्य छ।' : 'Applicant passport-size photo is mandatory' }
          : {}),
        ...(!formData.citizenshipFront?.trim()
          ? { citizenshipFront: lang === 'np' ? 'नागरिकता (अगाडि) को फोटो अनिवार्य छ।' : 'Citizenship certificate front side image is mandatory' }
          : {}),
        ...(!formData.citizenshipBack?.trim()
          ? { citizenshipBack: lang === 'np' ? 'नागरिकता (पछाडि) को फोटो अनिवार्य छ।' : 'Citizenship certificate back side image is mandatory' }
          : {}),
      }));
      setCurrentStep(1);
      setSubmissionError(
        lang === 'np'
          ? 'फाराम बुझाउनु अगाडि कृपया ३ वटै अनिवार्य कागजातहरू (सदस्यको फोटो, नागरिकता अगाडि र पछाडि) अपलोड गर्नुहोस्।'
          : 'Please upload all 3 mandatory documents (Applicant Photo, Citizenship Front, and Citizenship Back) before submitting.'
      );
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (!validateStep(6)) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const now = new Date();
      const appNo = `EKT-KYC-2083-${Math.floor(1000 + Math.random() * 9000)}`;
      const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

      const fullPermanentAddress = `${formData.permTole ? `${formData.permTole}, ` : ''}Ward ${formData.permWard}, ${formData.permMunicipality}, ${formData.permDistrict}, ${formData.permProvince}`;
      const fullCurrentAddress = formData.sameAsPermanent
        ? fullPermanentAddress
        : `${formData.tempTole ? `${formData.tempTole}, ` : ''}Ward ${formData.tempWard}, ${formData.tempMunicipality}, ${formData.tempDistrict}, ${formData.tempProvince}`;

      const newRecord: EkymRecord = {
        id: `ekym-${Date.now()}`,
        applicationNo: appNo,
        fullNameEn: formData.fullNameEn,
        fullNameNp: formData.fullNameNp || formData.fullNameEn,
        fatherName: formData.fatherName,
        grandfatherName: formData.grandfatherName,
        motherName: formData.motherName,
        spouseName: formData.spouseName,
        dob: formData.dob,
        gender: formData.gender,
        citizenshipNo: formData.citizenshipNo,
        citizenshipDistrict: formData.citizenshipDistrict,
        phone: formData.mobile,
        email: formData.email,
        permProvince: formData.permProvince,
        permDistrict: formData.permDistrict,
        tempProvince: formData.sameAsPermanent ? formData.permProvince : formData.tempProvince,
        tempDistrict: formData.sameAsPermanent ? formData.permDistrict : formData.tempDistrict,
        permanentAddress: fullPermanentAddress,
        currentAddress: fullCurrentAddress,
        occupation: formData.occupation,
        annualIncome: formData.estimatedAnnualIncome,
        bankName: formData.bankName,
        bankAccountNo: formData.bankAccountNo,
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        nomineeCitizenship: formData.nomineeCitizenship,
        status: 'Pending',
        remarks: `Submitted online via eKYM Wizard. Branch: ${formData.preferredBranch}. Scheme: ${formData.accountTypeInterest}. Has Business: ${formData.hasBusiness}.`,
        submittedAt: formattedTimestamp,
        memberPhoto: formData.memberPhoto,
        citizenshipFront: formData.citizenshipFront,
        citizenshipBack: formData.citizenshipBack,
        details: formData,
      };

      // Direct persist to SQLite database via /api/ekym
      const persistedRecord = await submitEkymApplication(newRecord, formData);

      if (onSubmitted) {
        onSubmitted(persistedRecord);
      }

      setSubmittedRef(persistedRecord.applicationNo || appNo);
      setSubmittedAt(persistedRecord.submittedAt || formattedTimestamp);
      setCompletedSteps([1, 2, 3, 4, 5, 6, 7]);
      setCurrentStep(7);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting eKYM application to database:', err);
      setSubmissionError(err?.message || 'Database submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setCompletedSteps([]);
    setErrors({});
    setCertified(false);
    setSubmittedRef(null);
  };

  const currentStepMeta = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans pb-20">
      {/* Top Application Bar */}
      <header className="bg-[#0981ae] text-white px-4 py-3 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={cmsSettings?.coopLogoUrl || '/uploads/logos/ekata-logo-default.svg'}
              alt="Ankur Logo"
              className="w-7 h-7 object-contain bg-white rounded-md p-0.5"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/uploads/logos/ekata-logo-default.svg';
              }}
            />
            <span className="font-black text-sm tracking-tight">Ankur Cooperative eKYM Portal</span>
            <span className="text-sky-100 hidden sm:inline">(विद्युतीय ग्राहक पहिचान फाराम)</span>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-[11px] font-medium text-sky-200 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>{saveStatus}</span>
              </span>
            )}

            <button
              type="button"
              onClick={onExitToWebsite}
              className="text-sky-100 hover:text-white font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Main Website</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-6">
        {/* Title Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0981ae] uppercase tracking-wider mb-1">
              <span>National Cooperative KYC Standards</span>
              <span>•</span>
              <span>Nepal Cooperative Act 2074</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {lang === 'np'
                ? 'अंकुर बचत तथा ऋण सहकारी संस्था लि. - अनलाइन eKYM दर्ता'
                : 'Ankur Saving & Credit Cooperative Ltd. - Digital e-KYM Portal'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'np'
                ? 'सहकारी ऐन २०७४ र सम्पत्ति शुद्धीकरण (AML/CFT) निर्देशन बमोजिम आधिकारिक विवरण पेश गर्नुहोस्।'
                : 'Official member digital identity, address verification, corporate disclosure, and financial compliance wizard.'}
            </p>
          </div>

          {currentStep < 7 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillSample}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0981ae] border border-sky-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Populate realistic Nepali cooperative applicant details to test all steps"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>⚡ Fill Sample Data</span>
              </button>

              <button
                type="button"
                onClick={handleClearDraft}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                title="Clear and reset draft"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 7-Step Stepper Component */}
        <StepWizardBar
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          lang={lang}
        />

        {/* Validation Errors Notice */}
        {Object.keys(errors).length > 0 && currentStep < 6 && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-1">
                {lang === 'np'
                  ? 'कृपया निम्न अनिवार्य विवरणहरू पूरा गर्नुहोस् (Required Fields Incomplete):'
                  : 'Please complete all required fields before proceeding:'}
              </strong>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-600">
                {Object.entries(errors).map(([field, err]) => (
                  <li key={field}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Dynamic Wizard Form Step Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs">
          {currentStep === 1 && (
            <Step1Personal
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
              lang={lang}
            />
          )}

          {currentStep === 2 && (
            <Step2Address
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
              lang={lang}
            />
          )}

          {currentStep === 3 && (
            <Step3Business
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
              lang={lang}
            />
          )}

          {currentStep === 4 && (
            <Step4Income
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
              lang={lang}
            />
          )}

          {currentStep === 5 && (
            <Step5Transaction
              data={formData}
              onChange={handleFieldChange}
              errors={errors}
              lang={lang}
            />
          )}

          {currentStep === 6 && (
            <Step6Preview
              data={formData}
              onEditStep={(stepNum) => setCurrentStep(stepNum)}
              certified={certified}
              onCertifiedChange={setCertified}
              certifiedError={certifiedError}
              lang={lang}
            />
          )}

          {currentStep === 7 && submittedRef && (
            <Step7Success
              applicationNo={submittedRef}
              data={formData}
              submittedAt={submittedAt}
              onExitToWebsite={onExitToWebsite}
              onOpenAdmin={onOpenAdmin}
              onResetForm={handleResetForNew}
              lang={lang}
              coopLogoUrl={cmsSettings?.coopLogoUrl || '/uploads/logos/ekata-logo-default.svg'}
            />
          )}

          {/* Navigation Controls (Only on Steps 1 to 6) */}
          {currentStep < 7 && (
            <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{lang === 'np' ? 'अघिल्लो चरण (Back)' : 'Previous Step'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onExitToWebsite}
                    className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition cursor-pointer"
                  >
                    {lang === 'np' ? '← वेबसाइटमा फर्कनुहोस्' : '← Exit to Website'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Step {currentStep} of 6
                </span>

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {lang === 'np'
                        ? 'सुरक्षित गरी अघि बढ्नुहोस्'
                        : `Next: ${WIZARD_STEPS[currentStep].shortEn}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-1.5">
                    {submissionError && (
                      <span className="text-[11px] text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {submissionError}
                      </span>
                    )}
                    <button
                      id="btn-submit-ekym-final"
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="px-7 py-3 bg-gradient-to-r from-sky-600 to-[#0981ae] hover:from-sky-700 hover:to-[#07678d] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer ring-2 ring-sky-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{lang === 'np' ? 'फाराम दर्ता हुँदैछ...' : 'Submitting to Database...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>{lang === 'np' ? 'अन्तिम फाराम बुझाउनुहोस्' : 'Submit Final eKYM Application'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
