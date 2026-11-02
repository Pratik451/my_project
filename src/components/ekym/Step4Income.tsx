import React from 'react';
import { EkymFormData, Language } from '../../types';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { Wallet, Landmark, Receipt, DollarSign, PiggyBank } from 'lucide-react';

interface Step4IncomeProps {
  data: EkymFormData;
  onChange: (field: keyof EkymFormData, value: any) => void;
  errors: Record<string, string>;
  lang: Language;
}

export const NEPAL_COMMERCIAL_BANKS = [
  'Global IME Bank Ltd.',
  'Nabil Bank Ltd.',
  'Nepal Investment Mega Bank Ltd.',
  'Rastriya Banijya Bank Ltd.',
  'Standard Chartered Bank Nepal Ltd.',
  'Himalayan Bank Ltd.',
  'Nepal SBI Bank Ltd.',
  'Everest Bank Ltd.',
  'NIC Asia Bank Ltd.',
  'Kumari Bank Ltd.',
  'Laxmi Sunrise Bank Ltd.',
  'Siddhartha Bank Ltd.',
  'Agricultural Development Bank Ltd.',
  'Citizens Bank International Ltd.',
  'Prime Commercial Bank Ltd.',
  'Sanima Bank Ltd.',
  'Machhapuchhre Bank Ltd.',
  'Prabhu Bank Ltd.',
  'Garima Bikas Bank Ltd.',
  'Muktinath Bikas Bank Ltd.',
  'Shine Resunga Development Bank Ltd.',
  'Kamana Sewa Bikas Bank Ltd.',
  'Jyoti Bikas Bank Ltd.',
  'Mahalaxmi Bikas Bank Ltd.',
  'Lumbini Bikas Bank Ltd.',
];

export const Step4Income: React.FC<Step4IncomeProps> = ({
  data,
  onChange,
  errors,
  lang,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#0981ae]" />
          <span>{lang === 'np' ? '४. आम्दानी तथा आर्थिक विवरण' : '4. Income & Financial Information'}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === 'np'
            ? 'सहकारी ऐन तथा सम्पत्ति शुद्धीकरण (AML/CFT) निर्देशन अनुसार आम्दानीको स्रोत र बैंक खाता विवरण अनिवार्य छ।'
            : 'As per Cooperative Act 2074 and AML/CFT guidelines, declare your primary income sources and verified bank account.'}
        </p>
      </div>

      {/* A. Sources of Income */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <DollarSign className="w-4 h-4 text-[#0981ae]" />
          <span>{lang === 'np' ? 'आम्दानीको मुख्य स्रोत तथा अनुमानित रकम' : 'A. Income Source & Estimated Earnings'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Primary Source of Income"
            labelNp="आम्दानीको मुख्य स्रोत"
            value={data.primaryIncomeSource}
            onChange={(e) => onChange('primaryIncomeSource', e.target.value)}
            required
            error={errors.primaryIncomeSource}
            options={[
              { value: 'Business / Trade', labelEn: 'Business / Trade / Commerce', labelNp: 'व्यापार तथा व्यवसाय' },
              { value: 'Agriculture & Livestock', labelEn: 'Agriculture / Farming / Dairy', labelNp: 'कृषि, पशुपालन तथा दुग्ध' },
              { value: 'Salary / Employment', labelEn: 'Salary / Regular Job / Wages', labelNp: 'तलब / रोजगारी' },
              { value: 'Foreign Remittance', labelEn: 'Foreign Employment / Remittance', labelNp: 'वैदेशिक रोजगार (विप्रेषण)' },
              { value: 'Rental & House Property', labelEn: 'House / Land / Property Rent', labelNp: 'घर / जग्गा भाडा' },
              { value: 'Pension / Investments', labelEn: 'Pension / Dividends / Interest', labelNp: 'निवृत्तिभरण / लगानी प्रतिफल' },
              { value: 'Other Legal Sources', labelEn: 'Other Legal Livelihood Source', labelNp: 'अन्य वैध स्रोत' },
            ]}
          />

          <FormSelect
            label="Secondary Income Source (If Any)"
            labelNp="सहायक आम्दानीको स्रोत"
            value={data.secondaryIncomeSource || ''}
            onChange={(e) => onChange('secondaryIncomeSource', e.target.value)}
            options={[
              { value: 'None', labelEn: 'None / Not Applicable', labelNp: 'कुनै छैन' },
              { value: 'Rental Income', labelEn: 'Rental Income', labelNp: 'घर/सटर भाडा' },
              { value: 'Farming / Dairy', labelEn: 'Agro / Dairy produce', labelNp: 'कृषि/दुग्ध बिक्री' },
              { value: 'Remittance', labelEn: 'Family Remittance', labelNp: 'पारिवारिक विप्रेषण' },
              { value: 'Side Business', labelEn: 'Side Business / Freelancing', labelNp: 'अतिरिक्त व्यापार' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="Estimated Monthly Income"
            labelNp="अनुमानित मासिक आम्दानी"
            value={data.estimatedMonthlyIncome}
            onChange={(e) => onChange('estimatedMonthlyIncome', e.target.value)}
            placeholder="e.g. Rs. 75,000"
            required
            error={errors.estimatedMonthlyIncome}
            helperText="Average monthly earnings in NPR"
          />

          <FormInput
            label="Estimated Annual Income"
            labelNp="अनुमानित वार्षिक आम्दानी"
            value={data.estimatedAnnualIncome}
            onChange={(e) => onChange('estimatedAnnualIncome', e.target.value)}
            placeholder="e.g. Rs. 900,000"
            required
            error={errors.estimatedAnnualIncome}
            helperText="Total gross annual earnings in NPR"
          />

          <FormSelect
            label="Tax Payer Category"
            labelNp="करदाता वर्ग"
            value={data.taxPayerCategory}
            onChange={(e) => onChange('taxPayerCategory', e.target.value)}
            required
            error={errors.taxPayerCategory}
            options={[
              { value: 'Individual Taxpayer', labelEn: 'Individual Taxpayer', labelNp: 'व्यक्तिगत करदाता' },
              { value: 'Couple / Joint Taxpayer', labelEn: 'Couple / Joint Taxpayer', labelNp: 'दम्पती करदाता' },
              { value: 'Sole Proprietor', labelEn: 'Sole Proprietor', labelNp: 'एकलौटी व्यवसायी' },
              { value: 'Exempt / Below Slab', labelEn: 'Below Tax Threshold', labelNp: 'कर सीमा मुनि' },
            ]}
          />
        </div>

        <div>
          <FormInput
            label="Other Assets / Financial Details (Optional)"
            labelNp="अन्य सम्पत्ति तथा दायित्व विवरण"
            value={data.otherFinancialDetails || ''}
            onChange={(e) => onChange('otherFinancialDetails', e.target.value)}
            placeholder="e.g. Own residential house in Butwal-4, 2 kattha agricultural land, commercial vehicle"
            helperText="Provide brief notes on real estate, livestock, or business equipment holdings."
          />
        </div>
      </div>

      {/* B. Commercial Bank Account Verification */}
      <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-200/80 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0981ae]">
          <Landmark className="w-4 h-4" />
          <span>{lang === 'np' ? 'वाणिज्य / विकास बैंक खाता विवरण (Dividend & Payout Account)' : 'B. Commercial / Development Bank Account'}</span>
          <span className="text-red-500 font-bold">*</span>
        </div>
        <p className="text-[11px] text-slate-600">
          {lang === 'np'
            ? 'सहकारीको लाभांश (Dividend), संरक्षित पुँजी फिर्ता कोष तथा रकमान्तरका लागि तपाईंको बैंक खाता अनिवार्य छ।'
            : 'For direct electronic dividend credit, patron bonus transfers, and instant bank-to-cooperative funding.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FormInput
              label="Bank Name"
              labelNp="बैंकको नाम"
              value={data.bankName}
              onChange={(e) => onChange('bankName', e.target.value)}
              placeholder="e.g. Global IME Bank Ltd."
              required
              error={errors.bankName}
              list="banksList"
            />
            <datalist id="banksList">
              {NEPAL_COMMERCIAL_BANKS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <FormInput
            label="Bank Branch Location"
            labelNp="बैंक शाखा"
            value={data.bankBranch}
            onChange={(e) => onChange('bankBranch', e.target.value)}
            placeholder="e.g. Butwal Branch / Traffic Chowk"
            required
            error={errors.bankBranch}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Bank Account Number"
            labelNp="खाता नम्बर"
            value={data.bankAccountNo}
            onChange={(e) => onChange('bankAccountNo', e.target.value)}
            placeholder="e.g. 04801010048123"
            required
            error={errors.bankAccountNo}
            icon={<Receipt className="w-4 h-4" />}
            helperText="Exact account number as shown in bank cheque / app"
          />

          <FormInput
            label="Account Holder Full Name"
            labelNp="खातावालाको पूरा नाम"
            value={data.bankAccountName}
            onChange={(e) => onChange('bankAccountName', e.target.value)}
            placeholder="e.g. SUBHASH SHARMA"
            required
            error={errors.bankAccountName}
            helperText="Must match applicant name for electronic clearance"
          />
        </div>
      </div>
    </div>
  );
};
