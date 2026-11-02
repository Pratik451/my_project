import React from 'react';
import { EkymFormData, Language } from '../../types';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { MapPin, Phone } from 'lucide-react';
import {
  NEPAL_PROVINCE_OPTIONS,
  getDistrictsByProvince,
} from '../../data/nepalProvincesDistricts';

interface Step2AddressProps {
  data: EkymFormData;
  onChange: (field: keyof EkymFormData, value: string | boolean) => void;
  errors: Record<string, string>;
  lang: Language;
}

export const Step2Address: React.FC<Step2AddressProps> = ({
  data,
  onChange,
  errors,
  lang,
}) => {
  const permDistricts = getDistrictsByProvince(data.permProvince);
  const tempDistricts = getDistrictsByProvince(data.tempProvince);

  const handlePermProvinceChange = (newProvince: string) => {
    onChange('permProvince', newProvince);
    const availableDistricts = getDistrictsByProvince(newProvince);
    if (!availableDistricts.includes(data.permDistrict)) {
      onChange('permDistrict', availableDistricts[0] || '');
    }
    if (data.sameAsPermanent) {
      onChange('tempProvince', newProvince);
      if (!availableDistricts.includes(data.tempDistrict)) {
        onChange('tempDistrict', availableDistricts[0] || '');
      }
    }
  };

  const handlePermDistrictChange = (newDistrict: string) => {
    onChange('permDistrict', newDistrict);
    if (data.sameAsPermanent) {
      onChange('tempDistrict', newDistrict);
    }
  };

  const handleTempProvinceChange = (newProvince: string) => {
    onChange('tempProvince', newProvince);
    const availableDistricts = getDistrictsByProvince(newProvince);
    if (!availableDistricts.includes(data.tempDistrict)) {
      onChange('tempDistrict', availableDistricts[0] || '');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0981ae]" />
          <span>
            {lang === 'np'
              ? '२. ठेगाना तथा सम्पर्क विवरण (Address & Contact Information)'
              : '2. Address & Contact Information'}
          </span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === 'np'
            ? 'नागरिकता अनुसारको स्थायी ठेगाना, हाल बसोबास रहेको ठेगाना र सम्पर्क नम्बर भर्नुहोस्।'
            : 'Provide your permanent address as per citizenship and current residential contact details.'}
        </p>
      </div>

      {/* Permanent Address Box */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0981ae] flex items-center gap-1.5">
          <span>📍</span>
          <span>
            {lang === 'np'
              ? 'स्थायी ठेगाना (Permanent Address)'
              : 'Permanent Address (As per Citizenship)'}
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect
            label="Province (प्रदेश)"
            name="permProvince"
            value={data.permProvince}
            onChange={(e) => handlePermProvinceChange(e.target.value)}
            required
            error={errors.permProvince}
            placeholder="Select Province"
            options={NEPAL_PROVINCE_OPTIONS}
          />

          <FormSelect
            label="District (जिल्ला)"
            name="permDistrict"
            value={data.permDistrict}
            onChange={(e) => handlePermDistrictChange(e.target.value)}
            required
            error={errors.permDistrict}
            placeholder={
              data.permProvince
                ? `Select District in ${data.permProvince}`
                : 'Select Province First'
            }
            options={permDistricts.map((d) => ({ value: d, labelEn: d }))}
          />

          <FormInput
            label="Municipality / Rural Municipality (पालिका)"
            name="permMunicipality"
            value={data.permMunicipality}
            onChange={(e) => {
              const v = e.target.value;
              onChange('permMunicipality', v);
              if (data.sameAsPermanent) onChange('tempMunicipality', v);
            }}
            placeholder="e.g. Butwal Sub-Metropolitan City"
            required
            error={errors.permMunicipality}
          />

          <FormInput
            label="Ward Number (वडा नं.)"
            name="permWard"
            value={data.permWard}
            onChange={(e) => {
              const v = e.target.value;
              onChange('permWard', v);
              if (data.sameAsPermanent) onChange('tempWard', v);
            }}
            placeholder="e.g. 04"
            required
            error={errors.permWard}
          />

          <FormInput
            label="Tole / Street (टोल / मार्ग)"
            name="permTole"
            value={data.permTole || ''}
            onChange={(e) => {
              const v = e.target.value;
              onChange('permTole', v);
              if (data.sameAsPermanent) onChange('tempTole', v);
            }}
            placeholder="e.g. Traffic Chowk, Main Road"
          />

          <FormInput
            label="House Number / Landmark (घर नं.)"
            name="permHouseNo"
            value={data.permHouseNo || ''}
            onChange={(e) => onChange('permHouseNo', e.target.value)}
            placeholder="Optional House No. or Landmark"
          />
        </div>
      </div>

      {/* Current / Temporary Address Box */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>🏠</span>
            <span>
              {lang === 'np'
                ? 'हाल बसोबासको ठेगाना (Current / Temporary Address)'
                : 'Current / Temporary Residential Address'}
            </span>
          </h4>

          <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-sky-200 text-xs font-semibold text-[#0981ae] shadow-2xs select-none">
            <input
              type="checkbox"
              checked={data.sameAsPermanent}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange('sameAsPermanent', checked);
                if (checked) {
                  onChange('tempProvince', data.permProvince);
                  onChange('tempDistrict', data.permDistrict);
                  onChange('tempMunicipality', data.permMunicipality);
                  onChange('tempWard', data.permWard);
                  onChange('tempTole', data.permTole || '');
                }
              }}
              className="rounded border-slate-300 text-[#0981ae] focus:ring-[#0981ae]"
            />
            <span>
              {lang === 'np'
                ? 'स्थायी ठेगाना जस्तै (Same as Permanent Address)'
                : 'Same as Permanent Address'}
            </span>
          </label>
        </div>

        {!data.sameAsPermanent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelect
              label="Current Province (प्रदेश)"
              name="tempProvince"
              value={data.tempProvince}
              onChange={(e) => handleTempProvinceChange(e.target.value)}
              required
              error={errors.tempProvince}
              placeholder="Select Province"
              options={NEPAL_PROVINCE_OPTIONS}
            />

            <FormSelect
              label="Current District (जिल्ला)"
              name="tempDistrict"
              value={data.tempDistrict}
              onChange={(e) => onChange('tempDistrict', e.target.value)}
              required
              error={errors.tempDistrict}
              placeholder={
                data.tempProvince
                  ? `Select District in ${data.tempProvince}`
                  : 'Select Province First'
              }
              options={tempDistricts.map((d) => ({ value: d, labelEn: d }))}
            />

            <FormInput
              label="Current Municipality / Palika"
              name="tempMunicipality"
              value={data.tempMunicipality}
              onChange={(e) => onChange('tempMunicipality', e.target.value)}
              placeholder="e.g. Tilottama Municipality"
              required
              error={errors.tempMunicipality}
            />

            <FormInput
              label="Current Ward No."
              name="tempWard"
              value={data.tempWard}
              onChange={(e) => onChange('tempWard', e.target.value)}
              placeholder="e.g. 02"
              required
              error={errors.tempWard}
            />

            <FormInput
              label="Current Tole / Street"
              name="tempTole"
              value={data.tempTole || ''}
              onChange={(e) => onChange('tempTole', e.target.value)}
              placeholder="e.g. Yogikuti"
              className="sm:col-span-2"
            />
          </div>
        ) : (
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg text-xs text-sky-900">
            ✓{' '}
            {lang === 'np'
              ? 'हालको बसोबास ठेगाना स्थायी ठेगाना अनुसार नै कायम गरिएको छ:'
              : 'Current address is set identical to your permanent address:'}{' '}
            <strong>
              {data.permTole ? `${data.permTole}, ` : ''}Ward {data.permWard || '-'},{' '}
              {data.permMunicipality || '-'}, {data.permDistrict || '-'}, {data.permProvince}
            </strong>
          </div>
        )}
      </div>

      {/* Contact Details */}
      <div className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-[#0981ae]" />
          <span>
            {lang === 'np'
              ? 'सम्पर्क तथा आपतकालीन विवरण (Contact Details)'
              : 'Direct Contact & Emergency Details'}
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput
            label="Mobile Number (मोबाइल नं.)"
            name="mobile"
            type="tel"
            value={data.mobile}
            onChange={(e) => onChange('mobile', e.target.value)}
            placeholder="98XXXXXXXX"
            required
            error={errors.mobile}
            helperText="10-digit Nepal mobile number for SMS & OTP"
          />

          <FormInput
            label="Secondary Phone / Landline"
            name="telephone"
            type="tel"
            value={data.telephone || ''}
            onChange={(e) => onChange('telephone', e.target.value)}
            placeholder="e.g. 071-540XXX"
          />

          <FormInput
            label="Email Address (इमेल ठेगाना)"
            name="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="member@example.com"
            error={errors.email}
          />

          <FormInput
            label="Emergency Contact Person (आपतकालीन सम्पर्क व्यक्ति)"
            name="emergencyContactPerson"
            value={data.emergencyContactPerson || ''}
            onChange={(e) => onChange('emergencyContactPerson', e.target.value)}
            placeholder="Family member or relative name"
          />

          <FormInput
            label="Emergency Contact Number"
            name="emergencyContactPhone"
            type="tel"
            value={data.emergencyContactPhone || ''}
            onChange={(e) => onChange('emergencyContactPhone', e.target.value)}
            placeholder="98XXXXXXXX"
          />
        </div>
      </div>
    </div>
  );
};
