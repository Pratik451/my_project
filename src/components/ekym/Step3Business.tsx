import React from 'react';
import { EkymFormData, Language } from '../../types';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { Building2, Briefcase, FileText, MapPin, Users, TrendingUp } from 'lucide-react';

interface Step3BusinessProps {
  data: EkymFormData;
  onChange: (field: keyof EkymFormData, value: any) => void;
  errors: Record<string, string>;
  lang: Language;
}

export const Step3Business: React.FC<Step3BusinessProps> = ({
  data,
  onChange,
  errors,
  lang,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#0981ae]" />
          <span>{lang === 'np' ? '३. संस्था तथा व्यवसाय विवरण' : '3. Corporate & Business Information'}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === 'np'
            ? 'यदि तपाईं कुनै उद्योग, व्यापार, फर्म वा संस्था सञ्चालन वा स्वामित्वमा हुनुहुन्छ भने व्यवसाय विवरण भर्नुहोस्।'
            : 'If you operate or hold ownership in a registered enterprise, firm, partnership, or private company, please disclose here.'}
        </p>
      </div>

      {/* Applicability Card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-bold text-slate-800 mb-2">
          {lang === 'np'
            ? 'के तपाईंसँग दर्ता भएको कुनै व्यापार, उद्योग वा संस्था छ? (Business Ownership Status)'
            : 'Do you own or operate a registered business or enterprise?'}
          <span className="text-red-500 font-bold ml-1">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              data.hasBusiness === 'No'
                ? 'bg-sky-50/80 border-sky-500 text-[#0981ae] shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="hasBusiness"
              checked={data.hasBusiness === 'No'}
              onChange={() => onChange('hasBusiness', 'No')}
              className="accent-[#0981ae] mt-0.5"
            />
            <div>
              <div className="text-xs font-bold">
                {lang === 'np' ? 'छैन (लागू हुँदैन) - व्यक्तिगत मात्र' : 'No / Not Applicable (Individual Applicant Only)'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {lang === 'np'
                  ? 'म तलबजीवी, कृषक, विद्यार्थी, गृहिणी वा साधारण व्यक्तिगत सदस्य हुँ।'
                  : 'Salaried employee, farmer, student, homemaker, or individual saver.'}
              </div>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
              data.hasBusiness === 'Yes'
                ? 'bg-sky-50/80 border-sky-500 text-[#0981ae] shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <input
              type="radio"
              name="hasBusiness"
              checked={data.hasBusiness === 'Yes'}
              onChange={() => onChange('hasBusiness', 'Yes')}
              className="accent-[#0981ae] mt-0.5"
            />
            <div>
              <div className="text-xs font-bold">
                {lang === 'np' ? 'छ - दर्ता भएको व्यवसाय / संस्थाको विवरण भर्छु' : 'Yes (Registered Enterprise / Business Owner)'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {lang === 'np'
                  ? 'एकलौटी फर्म, साझेदारी, प्रा.लि., सहकारी वा घरेलु उद्योग सञ्चालक।'
                  : 'Proprietorship, partnership, private limited, or cottage enterprise owner.'}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Business Form Fields when Yes */}
      {data.hasBusiness === 'Yes' ? (
        <div className="p-4 sm:p-5 bg-sky-50/30 rounded-xl border border-sky-200/80 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0981ae]">
            <FileText className="w-4 h-4" />
            <span>{lang === 'np' ? 'दर्ता भएको संस्था / व्यवसाय विवरण' : 'Registered Entity Particulars'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Organization / Business Name"
              labelNp="फर्म / संस्थाको नाम"
              value={data.businessName || ''}
              onChange={(e) => onChange('businessName', e.target.value)}
              placeholder="e.g. Subhash Trading & Wholesale"
              required={data.hasBusiness === 'Yes'}
              error={errors.businessName}
              icon={<Building2 className="w-4 h-4" />}
            />

            <FormSelect
              label="Legal Form of Entity"
              labelNp="संस्थाको कानुनी स्वरूप"
              value={data.businessType || ''}
              onChange={(e) => onChange('businessType', e.target.value)}
              required={data.hasBusiness === 'Yes'}
              error={errors.businessType}
              options={[
                { value: 'Sole Proprietorship', labelEn: 'Sole Proprietorship', labelNp: 'एकलौटी फर्म' },
                { value: 'Partnership Firm', labelEn: 'Partnership Firm', labelNp: 'साझेदारी फर्म' },
                { value: 'Private Limited Company', labelEn: 'Private Limited (Pvt. Ltd.)', labelNp: 'प्राइभेट लिमिटेड' },
                { value: 'Cottage & Small Industry', labelEn: 'Cottage & Small Industry', labelNp: 'घरेलु तथा साना उद्योग' },
                { value: 'Commercial Agro Farm', labelEn: 'Commercial Agro / Livestock Farm', labelNp: 'व्यावसायिक कृषि/पशुपालन फर्म' },
                { value: 'Cooperative / Social Institution', labelEn: 'Cooperative / NGO / Society', labelNp: 'संस्था / समूह' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Registration Number"
              labelNp="दर्ता नम्बर"
              value={data.registrationNo || ''}
              onChange={(e) => onChange('registrationNo', e.target.value)}
              placeholder="e.g. 10482/078/079"
              required={data.hasBusiness === 'Yes'}
              error={errors.registrationNo}
            />

            <FormInput
              label="Registering Authority"
              labelNp="दर्ता गर्ने निकाय"
              value={data.registeredAuthority || ''}
              onChange={(e) => onChange('registeredAuthority', e.target.value)}
              placeholder="e.g. Butwal Municipality / OCR Nepal"
              required={data.hasBusiness === 'Yes'}
              error={errors.registeredAuthority}
            />

            <FormInput
              label="Entity PAN / VAT Number"
              labelNp="स्थायी लेखा नं. (PAN / VAT)"
              value={data.panVatNumber || ''}
              onChange={(e) => onChange('panVatNumber', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="9-digit PAN (e.g. 604912384)"
              required={data.hasBusiness === 'Yes'}
              error={errors.panVatNumber}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Nature / Line of Business"
              labelNp="व्यवसायको प्रकृति"
              value={data.natureOfBusiness || ''}
              onChange={(e) => onChange('natureOfBusiness', e.target.value)}
              placeholder="e.g. Food Grain Wholesale, Hardware"
              required={data.hasBusiness === 'Yes'}
              error={errors.natureOfBusiness}
              icon={<Briefcase className="w-4 h-4" />}
            />

            <FormSelect
              label="Your Role / Designation"
              labelNp="पद / हैसियत"
              value={data.designationInFirm || ''}
              onChange={(e) => onChange('designationInFirm', e.target.value)}
              required={data.hasBusiness === 'Yes'}
              error={errors.designationInFirm}
              options={[
                { value: 'Proprietor', labelEn: 'Proprietor / Owner', labelNp: 'प्रोप्राइटर / धनी' },
                { value: 'Managing Director', labelEn: 'Managing Director (MD)', labelNp: 'प्रबन्ध निर्देशक' },
                { value: 'Partner', labelEn: 'Partner', labelNp: 'साझेदार' },
                { value: 'Director / Board Member', labelEn: 'Director / Shareholder', labelNp: 'सञ्चालक / सेयरधनी' },
                { value: 'General Manager', labelEn: 'General Manager / Authorized Signatory', labelNp: 'अधिकृत प्रतिनिधि' },
              ]}
            />

            <FormInput
              label="Established Date"
              labelNp="स्थापना मिति"
              value={data.establishedDate || ''}
              onChange={(e) => onChange('establishedDate', e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <FormInput
                label="Registered Operating Address"
                labelNp="व्यवसाय सञ्चालन रहेको ठेगाना"
                value={data.businessAddress || ''}
                onChange={(e) => onChange('businessAddress', e.target.value)}
                placeholder="e.g. Traffic Chowk, Butwal-4, Rupandehi"
                required={data.hasBusiness === 'Yes'}
                error={errors.businessAddress}
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <FormInput
              label="Number of Employees"
              labelNp="कामदार संख्या"
              type="number"
              value={data.employeeCount || ''}
              onChange={(e) => onChange('employeeCount', e.target.value)}
              placeholder="e.g. 5"
              icon={<Users className="w-4 h-4" />}
            />
          </div>

          <FormInput
            label="Annual Business Turnover (Estimate in NPR)"
            labelNp="वार्षिक कारोबार रकम (अनुमानित)"
            value={data.annualTurnover || ''}
            onChange={(e) => onChange('annualTurnover', e.target.value)}
            placeholder="e.g. Rs. 2,500,000"
            icon={<TrendingUp className="w-4 h-4" />}
            helperText="Gross annual sales volume of the enterprise"
          />
        </div>
      ) : (
        <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200/70 text-xs text-sky-900 flex items-start gap-2.5">
          <span className="text-base">ℹ️</span>
          <div>
            <strong>{lang === 'np' ? 'व्यक्तिगत सदस्य वर्ग छानिएको छ:' : 'Individual applicant category selected:'}</strong>{' '}
            {lang === 'np'
              ? 'तपाईंले व्यवसाय विवरण खुलाउनु पर्ने छैन। अर्को चरण (आय विवरण) मा जान "Save & Continue" मा थिच्नुहोस्।'
              : 'You do not need to provide corporate registration data. Click "Next: Income Information" to proceed.'}
          </div>
        </div>
      )}
    </div>
  );
};
