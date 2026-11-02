import React from 'react';
import { Language } from '../types';

interface MembershipBannerProps {
  lang: Language;
  onRegisterClick: () => void;
}

export const MembershipBanner: React.FC<MembershipBannerProps> = ({
  lang,
  onRegisterClick,
}) => {
  return (
    <section className="membership py-10 sm:py-14">
      <div className="container member-box relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#052636] via-[#074766] to-[#0981ae] p-8 sm:p-12 text-white shadow-2xl border border-sky-400/30">
        {/* Decorative Ambient Background Radiance */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#0cb3f0]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#0981ae]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 border border-sky-300/30 text-sky-200 text-xs font-extrabold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'np' ? 'सदस्यता प्रवर्द्धन' : 'MEMBERSHIP CHARTER'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            {lang === 'np'
              ? 'अंकुरसँगै समृद्ध बनौं, सुरक्षित बचत गरौं'
              : 'Grow together with Ankur Cooperative'}
          </h2>

          <p className="text-sm sm:text-base text-sky-100 font-normal leading-relaxed mb-6">
            {lang === 'np'
              ? 'दीर्घकालीन पारिवारिक भविष्य, वित्तीय सुरक्षा र सामुदायिक मूल्यका लागि आजै अनलाइन सदस्यता दर्ता तथा eKYM प्रक्रिया सम्पन्न गर्नुहोस्।'
              : 'Join a trusted cooperative movement dedicated to your financial well-being, productive business credit, and local entrepreneurship.'}
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-sky-100">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <span>🛡️</span>
              <span>{lang === 'np' ? '१००% सुरक्षित निक्षेप' : '100% Insured Deposits'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <span>📈</span>
              <span>{lang === 'np' ? 'उच्च ११.७५% प्रतिफल' : 'Up to 11.75% P.A.'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <span>📱</span>
              <span>{lang === 'np' ? 'निःशुल्क मोबाइल बैंकिङ' : 'Free Mobile Banking'}</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 shrink-0 mt-6 md:mt-0 flex flex-col sm:flex-row md:flex-col gap-3">
          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0cb3f0] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#0cb3f0] text-slate-950 font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            onClick={onRegisterClick}
          >
            <span>📝</span>
            <span>{lang === 'np' ? 'अहिले सदस्यता दर्ता गर्नुहोस् →' : 'Register Member Now →'}</span>
          </button>
          <span className="text-[11px] text-sky-200 text-center font-medium">
            {lang === 'np' ? '⚡ ५ मिनेटमा अनलाइन आवेदन' : '⚡ Complete in 5 minutes'}
          </span>
        </div>
      </div>
    </section>
  );
};
