import React from 'react';
import { EkymFormData, Language } from '../../types';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { ArrowLeftRight, Building, Shield, Smartphone, HeartHandshake, UserCheck } from 'lucide-react';

interface Step5TransactionProps {
  data: EkymFormData;
  onChange: (field: keyof EkymFormData, value: any) => void;
  errors: Record<string, string>;
  lang: Language;
}

export const COOP_BRANCHES = [
  { value: 'Main Central Branch (Butwal-4, Traffic Chowk)', labelEn: 'Central Branch - Butwal-4, Traffic Chowk', labelNp: 'केन्द्रीय कार्यालय - बुटवल-४, ट्राफिक चोक' },
  { value: 'Drivertole Branch (Tilottama-2)', labelEn: 'Drivertole Branch - Tilottama-2', labelNp: 'ड्राइभरटोल शाखा - तिलोत्तमा-२' },
  { value: 'Manglapur Service Center (Tilottama-8)', labelEn: 'Manglapur Service Center - Tilottama-8', labelNp: 'मंगलापुर सेवाकेन्द्र - तिलोत्तमा-८' },
  { value: 'Manigram Service Center (Tilottama-5)', labelEn: 'Manigram Service Center - Tilottama-5', labelNp: 'मणिग्राम सेवाकेन्द्र - तिलोत्तमा-५' },
  { value: 'Bhairahawa Branch (Siddharthanagar-3)', labelEn: 'Bhairahawa Branch - Siddharthanagar-3', labelNp: 'भैरहवा शाखा - सिद्धार्थनगर-३' },
];

export const Step5Transaction: React.FC<Step5TransactionProps> = ({
  data,
  onChange,
  errors,
  lang,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-[#0981ae]" />
          <span>{lang === 'np' ? '५. कारोबार तथा निक्षेप विवरण' : '5. Transaction & Cooperative Details'}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === 'np'
            ? 'सहकारीमा गर्न खोजिएको कारोबारको अनुमानित प्रकृति, इच्छाएको व्यक्ति (Nominee) र डिजिटल बैंकिङ सुविधा छान्नुहोस्।'
            : 'Specify expected savings volume, branch preference, digital banking options, and mandatory legal nominee.'}
        </p>
      </div>

      {/* A. Account Scheme & Branch */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Building className="w-4 h-4 text-[#0981ae]" />
          <span>{lang === 'np' ? 'शाखा तथा बचत खाता योजना' : 'A. Preferred Branch & Savings Scheme'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Preferred Branch / Service Center"
            labelNp="सहकारी शाखा / सेवाकेन्द्र"
            value={data.preferredBranch}
            onChange={(e) => onChange('preferredBranch', e.target.value)}
            required
            error={errors.preferredBranch}
            options={COOP_BRANCHES}
          />

          <FormSelect
            label="Intended Savings Scheme"
            labelNp="इच्छुक बचत खाता योजना"
            value={data.accountTypeInterest}
            onChange={(e) => onChange('accountTypeInterest', e.target.value)}
            required
            error={errors.accountTypeInterest}
            options={[
              { value: 'Ankur Super Saving (7.50% Daily Interest)', labelEn: 'Ankur Super Saving (7.50% p.a.)', labelNp: 'अंकुर सुपर बचत (७.५०%)' },
              { value: 'Regular Share Member Saving (7.00%)', labelEn: 'Regular Member Saving (7.00% p.a.)', labelNp: 'साधारण सेयर बचत (७.००%)' },
              { value: 'Fixed Term Periodic Deposit (Up to 11.75%)', labelEn: 'Periodic Fixed Deposit (Up to 11.75%)', labelNp: 'मुद्दती निक्षेप (११.७५% सम्म)' },
              { value: 'Ankur Nari Welfare Saving (8.00%)', labelEn: 'Nari Shakti Welfare Saving (8.00%)', labelNp: 'अंकुर नारी शक्ति बचत (८.००%)' },
              { value: 'Child Future Bright Saving (8.25%)', labelEn: 'Child Future Bright Saving (8.25%)', labelNp: 'अंकुर बाल भविष्य बचत (८.२५%)' },
              { value: 'Farmers Agro Harvest Saving (7.75%)', labelEn: 'Krishi Agro Harvest Saving (7.75%)', labelNp: 'किसान कृषि बचत (७.७५%)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="Expected Monthly Deposit"
            labelNp="अनुमानित मासिक जम्मा रकम"
            value={data.expectedMonthlyDeposit}
            onChange={(e) => onChange('expectedMonthlyDeposit', e.target.value)}
            placeholder="e.g. Rs. 20,000"
            required
            error={errors.expectedMonthlyDeposit}
            helperText="Monthly anticipated savings inflow"
          />

          <FormInput
            label="Expected Monthly Withdrawal"
            labelNp="अनुमानित मासिक भुक्तानी"
            value={data.expectedMonthlyWithdrawal}
            onChange={(e) => onChange('expectedMonthlyWithdrawal', e.target.value)}
            placeholder="e.g. Rs. 10,000"
            required
            error={errors.expectedMonthlyWithdrawal}
            helperText="Anticipated monthly cash needs"
          />

          <FormInput
            label="Expected Annual Turnover"
            labelNp="अनुमानित वार्षिक कुल कारोबार"
            value={data.expectedAnnualTurnover}
            onChange={(e) => onChange('expectedAnnualTurnover', e.target.value)}
            placeholder="e.g. Rs. 400,000"
            required
            error={errors.expectedAnnualTurnover}
            helperText="Total annual debit & credit volume"
          />
        </div>

        <FormSelect
          label="Primary Purpose of Account Opening"
          labelNp="खाता खोल्नुको मुख्य उद्देश्य"
          value={data.purposeOfAccount}
          onChange={(e) => onChange('purposeOfAccount', e.target.value)}
          required
          error={errors.purposeOfAccount}
          options={[
            { value: 'Regular Thrift Savings & Wealth Accumulation', labelEn: 'Regular Thrift Savings & Capital Growth', labelNp: 'नियमित बचत तथा पुँजी निर्माण' },
            { value: 'Access to Low-Interest Member Loans & Credit', labelEn: 'Access to Subsidized Member Loans', labelNp: 'सुलभ सहकारी कर्जा सुविधा लिन' },
            { value: 'Business Cash Flow & Daily Market Deposit', labelEn: 'Business Working Capital / Daily Merchant Deposit', labelNp: 'दैनिक व्यापारिक कारोबार' },
            { value: 'Social Welfare & Pension Security', labelEn: 'Old-Age Social Security & Child Future Security', labelNp: 'सामाजिक सुरक्षा तथा भविष्य संरक्षण' },
          ]}
        />
      </div>

      {/* B. Digital Services Opt-in */}
      <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0981ae]">
          <Smartphone className="w-4 h-4" />
          <span>{lang === 'np' ? 'डिजिटल सेवाहरू (Digital Banking Services)' : 'B. Digital Banking & Notification Services'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-sky-200 cursor-pointer shadow-xs hover:bg-sky-50/50 transition">
            <input
              type="checkbox"
              checked={data.digitalBankingOptIn}
              onChange={(e) => onChange('digitalBankingOptIn', e.target.checked)}
              className="accent-[#0981ae] mt-0.5 w-4 h-4"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">
                {lang === 'np' ? 'स्मार्ट मोबाइल बैंकिङ र Fonepay QR सुविधा' : 'Ankur Smart Mobile Banking & QR'}
              </div>
              <div className="text-[11px] text-slate-500">
                {lang === 'np'
                  ? 'मोबाइल एप, क्युआर भुक्तानी र अन्तरबैंक फन्ड ट्रान्सफर सक्रिय गर्ने'
                  : 'Activate 24/7 mobile app, instant QR payments, and fund transfers'}
              </div>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-sky-200 cursor-pointer shadow-xs hover:bg-sky-50/50 transition">
            <input
              type="checkbox"
              checked={data.smsAlertOptIn}
              onChange={(e) => onChange('smsAlertOptIn', e.target.checked)}
              className="accent-[#0981ae] mt-0.5 w-4 h-4"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">
                {lang === 'np' ? 'तत्काल एसएमएस सूचना (Instant SMS Alert)' : 'Instant SMS Alert Service'}
              </div>
              <div className="text-[11px] text-slate-500">
                {lang === 'np'
                  ? 'प्रत्येक कारोबार, किस्ता म्याद र साधारण सभाको सूचना प्राप्त गर्ने'
                  : 'Receive SMS notifications for all debits, credits, and AGM alerts'}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* C. Nominee Information (इच्छाएको व्यक्ति) */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <HeartHandshake className="w-4 h-4 text-[#0981ae]" />
          <span>{lang === 'np' ? 'इच्छाएको व्यक्तिको विवरण (Nominee Information)' : 'C. Nominee Information (Statutory Requirement)'}</span>
          <span className="text-red-500 font-bold">*</span>
        </div>
        <p className="text-[11px] text-slate-600">
          {lang === 'np'
            ? 'सहकारी ऐन २०७४ बमोजिम बचतकर्ताको असामयिक निधन भएमा हकदाबी गर्ने व्यक्तिको विवरण अनिवार्य छ।'
            : 'As mandated by Cooperative Act 2074, appoint your legal nominee to receive savings/shares in unforeseen circumstances.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormInput
            label="Nominee Full Name"
            labelNp="इच्छाएको व्यक्तिको पूरा नाम"
            value={data.nomineeName}
            onChange={(e) => onChange('nomineeName', e.target.value)}
            placeholder="e.g. Sunita Sharma"
            required
            error={errors.nomineeName}
          />

          <FormSelect
            label="Relationship to Applicant"
            labelNp="नाता / सम्बन्ध"
            value={data.nomineeRelation}
            onChange={(e) => onChange('nomineeRelation', e.target.value)}
            required
            error={errors.nomineeRelation}
            options={[
              { value: 'Spouse', labelEn: 'Spouse (Husband / Wife)', labelNp: 'पति / पत्नी' },
              { value: 'Son', labelEn: 'Son', labelNp: 'छोरा' },
              { value: 'Daughter', labelEn: 'Daughter', labelNp: 'छोरी' },
              { value: 'Father', labelEn: 'Father', labelNp: 'बुवा' },
              { value: 'Mother', labelEn: 'Mother', labelNp: 'आमा' },
              { value: 'Brother', labelEn: 'Brother', labelNp: 'दाजु / भाइ' },
              { value: 'Sister', labelEn: 'Sister', labelNp: 'दिदी / बहिनी' },
              { value: 'Other Relative', labelEn: 'Other Legal Relative', labelNp: 'अन्य नाता' },
            ]}
          />

          <FormInput
            label="Nominee Age / Date of Birth"
            labelNp="उमेर / जन्ममिति"
            value={data.nomineeDobOrAge || ''}
            onChange={(e) => onChange('nomineeDobOrAge', e.target.value)}
            placeholder="e.g. 34 Years or 2049-02-12"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Nominee Citizenship No. / National ID"
            labelNp="नागरिकता नं. / राष्ट्रिय परिचयपत्र"
            value={data.nomineeCitizenship || ''}
            onChange={(e) => onChange('nomineeCitizenship', e.target.value)}
            placeholder="e.g. 38-01-76-02911"
            helperText="Official document number if available"
          />

          <FormInput
            label="Nominee Contact Mobile"
            labelNp="सम्पर्क फोन नं."
            type="tel"
            value={data.nomineeContact || ''}
            onChange={(e) => onChange('nomineeContact', e.target.value)}
            placeholder="e.g. 9847099123"
            helperText="Mobile number for official verification"
          />
        </div>
      </div>
    </div>
  );
};
