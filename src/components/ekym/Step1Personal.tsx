import React, { useRef, useState } from 'react';
import { EkymFormData, Language } from '../../types';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import {
  User,
  Calendar,
  CreditCard,
  ShieldCheck,
  Heart,
  BookOpen,
  Briefcase,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  X,
  Download,
  RotateCcw
} from 'lucide-react';

import { ALL_NEPAL_DISTRICTS } from '../../data/nepalProvincesDistricts';

interface Step1PersonalProps {
  data: EkymFormData;
  onChange: (field: keyof EkymFormData, value: any) => void;
  errors: Record<string, string>;
  lang: Language;
}

export const NEPAL_DISTRICTS = ALL_NEPAL_DISTRICTS;

interface DocUploadCardProps {
  id: string;
  field: 'memberPhoto' | 'citizenshipFront' | 'citizenshipBack';
  labelEn: string;
  labelNp: string;
  descEn: string;
  descNp: string;
  aspectRatio: 'square' | 'video';
  icon: React.ReactNode;
  value?: string;
  error?: string;
  lang: Language;
  onChange: (field: keyof EkymFormData, val: string) => void;
  onPreview: (url: string, title: string) => void;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({
  id,
  field,
  labelEn,
  labelNp,
  descEn,
  descNp,
  aspectRatio,
  icon,
  value,
  error,
  lang,
  onChange,
  onPreview,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setLocalError('');
    if (!file.type.startsWith('image/')) {
      setLocalError(lang === 'np' ? 'तस्विर (JPG, PNG, WEBP) मात्र छान्नुहोस्।' : 'Only JPG, PNG, or WEBP images allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError(lang === 'np' ? 'फाईल ५ एमबी भन्दा सानो हुनुपर्छ।' : 'File exceeds 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onChange(field, e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const activeError = error || localError;

  return (
    <div
      id={id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 rounded-xl border-2 transition-all bg-white flex flex-col justify-between shadow-xs ${
        isDragging
          ? 'border-sky-600 bg-sky-50/50 scale-[1.01]'
          : activeError
          ? 'border-red-400 bg-red-50/20'
          : value
          ? 'border-sky-500 bg-sky-50/20'
          : 'border-slate-200 hover:border-sky-400'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            {icon}
            <span>{lang === 'np' ? labelNp : labelEn}</span>
            <span className="text-red-500 font-bold">*</span>
          </label>
          {value ? (
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-sky-600" /> Ready
            </span>
          ) : (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Required
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mb-3 leading-snug">
          {lang === 'np' ? descNp : descEn}
        </p>

        {value ? (
          <div className="relative group rounded-lg overflow-hidden border border-sky-300 bg-slate-100 mx-auto flex items-center justify-center">
            <div className={`w-full ${aspectRatio === 'square' ? 'aspect-square max-h-48' : 'aspect-[16/10] max-h-44'}`}>
              <img
                src={value}
                alt={labelEn}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                id={`btn-view-${field}`}
                onClick={() => onPreview(value, lang === 'np' ? labelNp : labelEn)}
                className="p-1.5 bg-white/90 text-slate-800 rounded shadow hover:bg-white text-xs font-semibold flex items-center gap-1"
                title="View image in full size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="text-[11px]">View</span>
              </button>
              <button
                type="button"
                id={`btn-change-${field}`}
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-sky-600 text-white rounded shadow hover:bg-sky-700 text-xs font-semibold flex items-center gap-1"
                title="Change image"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Change</span>
              </button>
              <button
                type="button"
                id={`btn-remove-${field}`}
                onClick={() => onChange(field, '')}
                className="p-1.5 bg-red-600 text-white rounded shadow hover:bg-red-700 text-xs font-semibold"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-[#0981ae] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-slate-50 hover:bg-sky-50/50 transition select-none"
          >
            <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0981ae] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">
              {lang === 'np' ? 'क्लिक वा ड्र्याग गर्नुहोस्' : 'Click or Drag to Upload'}
            </span>
            <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          id={`input-file-${field}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              processFile(file);
            }
            e.target.value = '';
          }}
        />
      </div>

      {activeError && (
        <p className="text-[11px] text-red-600 font-semibold mt-2.5 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
};

export const Step1Personal: React.FC<Step1PersonalProps> = ({
  data,
  onChange,
  errors,
  lang,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0981ae]" />
          <span>{lang === 'np' ? '१. व्यक्तिगत पहिचान विवरण' : '1. Personal Information'}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === 'np'
            ? 'नागरिकता वा राष्ट्रिय परिचयपत्र अनुसारको आधिकारिक विवरण भर्नुहोस्। तारांकित (*) चिन्ह भएका विवरण अनिवार्य हुन्।'
            : 'Enter personal details as per your official Citizenship Certificate or National ID. Fields marked with (*) are required.'}
        </p>
      </div>

      {/* Membership Type Toggle */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-slate-800 mb-2">
          {lang === 'np' ? 'सदस्यता प्रकार (Membership Type)' : 'Membership Category'}
          <span className="text-red-500 font-bold ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
              data.membershipType === 'New Member'
                ? 'bg-sky-50/80 border-sky-500 text-[#0981ae]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="membershipType"
              checked={data.membershipType === 'New Member'}
              onChange={() => onChange('membershipType', 'New Member')}
              className="accent-[#0981ae]"
            />
            <div>
              <div className="text-xs font-bold">
                {lang === 'np' ? 'नयाँ सदस्यता आवेदन (New Member)' : 'New Membership Application'}
              </div>
              <div className="text-[10px] text-slate-500">
                {lang === 'np' ? 'पहिलो पटक सहकारी खाता खोल्दै' : 'First-time registration & share subscription'}
              </div>
            </div>
          </label>

          <label
            className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
              data.membershipType === 'Existing Member'
                ? 'bg-sky-50/80 border-sky-500 text-[#0981ae]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="membershipType"
              checked={data.membershipType === 'Existing Member'}
              onChange={() => onChange('membershipType', 'Existing Member')}
              className="accent-[#0981ae]"
            />
            <div>
              <div className="text-xs font-bold">
                {lang === 'np' ? 'विद्यमान सदस्य eKYM नवीकरण' : 'Existing Member eKYM Update'}
              </div>
              <div className="text-[10px] text-slate-500">
                {lang === 'np' ? 'पहिले नै सदस्य भइसकेको विवरण अद्यावधिक' : 'Periodic digital profile re-verification'}
              </div>
            </div>
          </label>
        </div>

        {data.membershipType === 'Existing Member' && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <FormInput
              label="Membership Number"
              labelNp="सदस्य नम्बर"
              value={data.membershipNo || ''}
              onChange={(e) => onChange('membershipNo', e.target.value)}
              placeholder="e.g. EK-10482"
              required={data.membershipType === 'Existing Member'}
              error={errors.membershipNo}
              helperText="Enter your existing Ankur passbook/share member code."
            />
          </div>
        )}
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Full Name in English (Capital Letters)"
          labelNp="पूरा नाम (अंग्रेजीमा)"
          value={data.fullNameEn}
          onChange={(e) => onChange('fullNameEn', e.target.value.toUpperCase())}
          placeholder="e.g. SUBHASH SHARMA"
          required
          error={errors.fullNameEn}
          icon={<User className="w-4 h-4" />}
          helperText="As printed on citizenship/passport certificate"
        />

        <FormInput
          label="Full Name in Nepali (Devanagari)"
          labelNp="पूरा नाम (नेपालीमा)"
          value={data.fullNameNp}
          onChange={(e) => onChange('fullNameNp', e.target.value)}
          placeholder="जस्तै: सुभाष शर्मा"
          error={errors.fullNameNp}
          helperText="नागरिकता अनुसारको नेपाली हिज्जे"
        />
      </div>

      {/* DOB, Gender, Marital Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput
          label="Date of Birth"
          labelNp="जन्ममिति (B.S. / A.D.)"
          type="text"
          value={data.dob}
          onChange={(e) => onChange('dob', e.target.value)}
          placeholder="YYYY-MM-DD (e.g. 2048-06-15)"
          required
          error={errors.dob}
          icon={<Calendar className="w-4 h-4" />}
          helperText="Format: YYYY-MM-DD"
        />

        <FormSelect
          label="Gender"
          labelNp="लिङ्ग"
          value={data.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          required
          error={errors.gender}
          options={[
            { value: 'Male', labelEn: 'Male', labelNp: 'पुरुष' },
            { value: 'Female', labelEn: 'Female', labelNp: 'महिला' },
            { value: 'Other', labelEn: 'Other', labelNp: 'अन्य' },
          ]}
        />

        <FormSelect
          label="Marital Status"
          labelNp="वैवाहिक स्थिति"
          value={data.maritalStatus}
          onChange={(e) => onChange('maritalStatus', e.target.value)}
          required
          error={errors.maritalStatus}
          icon={<Heart className="w-4 h-4" />}
          options={[
            { value: 'Unmarried', labelEn: 'Unmarried', labelNp: 'अविवाहित' },
            { value: 'Married', labelEn: 'Married', labelNp: 'विवाहित' },
            { value: 'Divorced', labelEn: 'Divorced', labelNp: 'सम्बन्ध विच्छेद' },
            { value: 'Widowed', labelEn: 'Widowed', labelNp: 'एकल / विधुर' },
          ]}
        />
      </div>

      {/* Citizenship & ID Identification */}
      <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-200/80 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0981ae]">
          <ShieldCheck className="w-4 h-4" />
          <span>{lang === 'np' ? 'नागरिकता तथा राष्ट्रिय परिचय विवरण' : 'Official Identification Document'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <FormSelect
            label="Identification Type"
            labelNp="परिचयपत्र प्रकार"
            value={data.idType}
            onChange={(e) => onChange('idType', e.target.value)}
            required
            error={errors.idType}
            options={[
              { value: 'Citizenship', labelEn: 'Citizenship Certificate', labelNp: 'नागरिकता' },
              { value: 'National ID (NID)', labelEn: 'National ID (NID)', labelNp: 'राष्ट्रिय परिचयपत्र' },
              { value: 'Passport', labelEn: 'Passport', labelNp: 'राहदानी' },
            ]}
          />

          <FormInput
            label="Certificate / ID Number"
            labelNp="नम्बर"
            value={data.citizenshipNo}
            onChange={(e) => onChange('citizenshipNo', e.target.value)}
            placeholder="e.g. 38-01-72-04821"
            required
            error={errors.citizenshipNo}
            icon={<CreditCard className="w-4 h-4" />}
            helperText="Exact certificate digits"
          />

          <FormInput
            label="Date of Issue"
            labelNp="जारी मिति"
            type="text"
            value={data.citizenshipIssueDate}
            onChange={(e) => onChange('citizenshipIssueDate', e.target.value)}
            placeholder="YYYY-MM-DD"
            required
            error={errors.citizenshipIssueDate}
            icon={<Calendar className="w-4 h-4" />}
          />

          <div>
            <FormInput
              label="Issuing District"
              labelNp="जारी जिल्ला"
              value={data.citizenshipDistrict}
              onChange={(e) => onChange('citizenshipDistrict', e.target.value)}
              placeholder="e.g. Rupandehi"
              required
              error={errors.citizenshipDistrict}
              list="districtsList"
            />
            <datalist id="districtsList">
              {NEPAL_DISTRICTS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Family Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput
          label="Father's Full Name"
          labelNp="बुवाको पूरा नाम"
          value={data.fatherName}
          onChange={(e) => onChange('fatherName', e.target.value)}
          placeholder="e.g. Bishnu Prasad Sharma"
          required
          error={errors.fatherName}
        />

        <FormInput
          label="Mother's Full Name"
          labelNp="आमाको पूरा नाम"
          value={data.motherName}
          onChange={(e) => onChange('motherName', e.target.value)}
          placeholder="e.g. Radha Devi Sharma"
          required
          error={errors.motherName}
        />

        <FormInput
          label="Grandfather's Full Name"
          labelNp="हजुरबुवा/बाजेको नाम"
          value={data.grandfatherName}
          onChange={(e) => onChange('grandfatherName', e.target.value)}
          placeholder="e.g. Chhabilal Sharma"
          required
          error={errors.grandfatherName}
          helperText="Mandatory under cooperative KYC regulatory standards"
        />
      </div>

      {/* Mandatory Document Uploads: Member Photo, Citizenship Front & Back */}
      <div id="mandatory-documents-section" className="p-5 bg-gradient-to-br from-sky-50/70 via-slate-50 to-sky-50/40 rounded-2xl border-2 border-sky-500/30 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-sky-200/60">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#0981ae]" />
              <span>{lang === 'np' ? 'अनिवार्य कागजात तथा फोटो अपलोड' : 'Mandatory KYC Documents & Photo'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                {lang === 'np' ? 'अनिवार्य' : 'Required'}
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === 'np'
                ? 'सदस्यको फोटो, नागरिकता अगाडि र पछाडिको स्पष्ट प्रतिलिपि अपलोड गर्नुपर्नेछ (JPG, PNG, WEBP, अधिकतम 5MB)'
                : 'Upload clear scans/photos of Member Photo, Citizenship Front, and Citizenship Back (JPG, PNG, WEBP, max 5MB)'}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-md border border-sky-200">
            {((data.memberPhoto ? 1 : 0) + (data.citizenshipFront ? 1 : 0) + (data.citizenshipBack ? 1 : 0))}/3 Mandatory Documents Uploaded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Member Photo */}
          <DocUploadCard
            id="upload-member-photo"
            field="memberPhoto"
            labelEn="Applicant Photo"
            labelNp="सदस्यको फोटो"
            descEn="Recent passport-sized formal portrait"
            descNp="हालसालै खिचिएको पासपोर्ट साइजको डिजिटल फोटो"
            aspectRatio="square"
            icon={<User className="w-3.5 h-3.5 text-[#0981ae]" />}
            value={data.memberPhoto}
            error={errors.memberPhoto}
            lang={lang}
            onChange={onChange}
            onPreview={(url, title) => setLightboxImage({ url, title })}
          />

          {/* 2. Citizenship Front */}
          <DocUploadCard
            id="upload-citizenship-front"
            field="citizenshipFront"
            labelEn="Citizenship (Front)"
            labelNp="नागरिकता (अगाडि)"
            descEn="Front side showing photo, seal & number"
            descNp="नागरिकता प्रमाणपत्रको अगाडिको स्पष्ट स्क्यान"
            aspectRatio="video"
            icon={<CreditCard className="w-3.5 h-3.5 text-[#0981ae]" />}
            value={data.citizenshipFront}
            error={errors.citizenshipFront}
            lang={lang}
            onChange={onChange}
            onPreview={(url, title) => setLightboxImage({ url, title })}
          />

          {/* 3. Citizenship Back */}
          <DocUploadCard
            id="upload-citizenship-back"
            field="citizenshipBack"
            labelEn="Citizenship (Back)"
            labelNp="नागरिकता (पछाडि)"
            descEn="Back side showing address & official stamps"
            descNp="नागरिकता प्रमाणपत्रको पछाडिको स्पष्ट स्क्यान"
            aspectRatio="video"
            icon={<CreditCard className="w-3.5 h-3.5 text-[#0981ae]" />}
            value={data.citizenshipBack}
            error={errors.citizenshipBack}
            lang={lang}
            onChange={onChange}
            onPreview={(url, title) => setLightboxImage({ url, title })}
          />
        </div>
      </div>

      {/* Spouse if married */}
      {data.maritalStatus === 'Married' && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <FormInput
            label="Spouse's Full Name"
            labelNp="पति/पत्नीको पूरा नाम"
            value={data.spouseName || ''}
            onChange={(e) => onChange('spouseName', e.target.value)}
            placeholder="e.g. Sunita Sharma"
            required={data.maritalStatus === 'Married'}
            error={errors.spouseName}
            helperText="Required for married applicants under KYC directives"
          />
        </div>
      )}

      {/* Education & Occupation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormSelect
          label="Educational Qualification"
          labelNp="शैक्षिक योग्यता"
          value={data.education}
          onChange={(e) => onChange('education', e.target.value)}
          required
          error={errors.education}
          icon={<BookOpen className="w-4 h-4" />}
          options={[
            { value: 'Under SLC/SEE', labelEn: 'Under SLC / SEE', labelNp: 'कक्षा १० मुनि' },
            { value: 'SLC/SEE (+2)', labelEn: 'SLC / SEE (+2 / Intermediate)', labelNp: 'एस.एल.सी / +२' },
            { value: 'Bachelor Degree', labelEn: "Bachelor's Degree", labelNp: 'स्नातक' },
            { value: 'Master Degree', labelEn: "Master's Degree", labelNp: 'स्नातकोत्तर' },
            { value: 'Doctorate/PhD', labelEn: 'PhD / Doctorate / Professional', labelNp: 'विद्यावारिधि / विज्ञ' },
            { value: 'Literate/Other', labelEn: 'Literate / Other', labelNp: 'साधारण लेखपढ' },
          ]}
        />

        <FormSelect
          label="Primary Occupation"
          labelNp="मुख्य पेसा"
          value={data.occupation}
          onChange={(e) => onChange('occupation', e.target.value)}
          required
          error={errors.occupation}
          icon={<Briefcase className="w-4 h-4" />}
          options={[
            { value: 'Agriculture/Farming', labelEn: 'Agriculture / Livestock / Farming', labelNp: 'कृषि तथा पशुपालन' },
            { value: 'Business/Trade', labelEn: 'Retail / Wholesale / Commerce', labelNp: 'व्यापार / व्यवसाय' },
            { value: 'Private Service', labelEn: 'Private Company Employee', labelNp: 'निजी जागिर' },
            { value: 'Government Service', labelEn: 'Government / Public Sector', labelNp: 'सरकारी सेवा' },
            { value: 'Foreign Employment', labelEn: 'Foreign Employment (Remittance)', labelNp: 'वैदेशिक रोजगार' },
            { value: 'Professional/Consultant', labelEn: 'Doctor / Engineer / CA / Lawyer', labelNp: 'पेसागत परामर्शदाता' },
            { value: 'Student', labelEn: 'Student', labelNp: 'विद्यार्थी' },
            { value: 'Housemaker', labelEn: 'Home Maker', labelNp: 'गृहिणी' },
            { value: 'Other', labelEn: 'Self-Employed / Other', labelNp: 'अन्य' },
          ]}
        />

        <FormInput
          label="Individual PAN Number (Optional)"
          labelNp="व्यक्तिगत स्थायी लेखा नं."
          value={data.panNumber || ''}
          onChange={(e) => onChange('panNumber', e.target.value)}
          placeholder="e.g. 109847123"
          error={errors.panNumber}
          helperText="9-digit Inland Revenue Department PAN"
        />
      </div>

      {/* Lightbox Preview Modal */}
      {lightboxImage && (
        <div
          id="ekym-doc-lightbox"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 text-white">
              <span className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                {lightboxImage.title}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  download="document-preview.png"
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition flex items-center justify-center"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-600 text-white transition flex items-center justify-center"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-black/50 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
