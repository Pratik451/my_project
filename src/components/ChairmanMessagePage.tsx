import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LeadershipMemberCMS } from '../types';

interface ChairmanMessagePageProps {
  leader: LeadershipMemberCMS;
  lang: 'en' | 'np';
  onBackToAbout: () => void;
}

export const ChairmanMessagePage: React.FC<ChairmanMessagePageProps> = ({
  leader,
  lang,
  onBackToAbout,
}) => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [leader.id]);

  const nepaliName = leader.nameNp || leader.nameEn;

  const getPageTitle = () => {
    if (leader.category === 'chairman') {
      return "Chairman's Message";
    }
    if (leader.category === 'ceo') {
      return "CEO's Message";
    }
    if (leader.category === 'info_officer') {
      return "Information Officer's Message";
    }
    if (leader.category === 'grievance_officer') {
      return "Grievance Redressal Officer's Message";
    }
    return `${leader.designationEn || 'Leadership'} Message`;
  };

  const getDesignationDisplay = () => {
    if (leader.category === 'chairman') {
      return 'Chairman';
    }
    if (leader.category === 'ceo') {
      return 'Chief Executive Officer';
    }
    if (leader.category === 'info_officer') {
      return 'Information Officer';
    }
    if (leader.category === 'grievance_officer') {
      return 'Grievance Redressal Officer';
    }
    return leader.designationEn || leader.designationNp;
  };

  const rawMsg =
    leader.fullMessageNp || leader.fullMessageEn || leader.shortMessageNp || leader.shortMessageEn;

  // Split message text into readable paragraphs
  const messageParagraphs = (rawMsg || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="min-h-screen bg-[#f3f7fa] flex flex-col text-slate-800 w-full animate-in fade-in duration-200">
      {/* ========================================================= */}
      {/* 1. BLUE TITLE BANNER WITH BREADCRUMBS                     */}
      {/* Exact match with reference image: image_2043d148.png      */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-[#063850] via-[#074766] to-[#08557b] text-white pt-12 pb-24 sm:pt-16 sm:pb-28 px-4 text-center relative overflow-hidden shadow-inner">
        {/* Subtle background ambient glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,#38bdf8_0,transparent_60%)]" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Centered Page Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
            {getPageTitle()}
          </h1>

          {/* Breadcrumbs: Home / About Us / Chairman's Message */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold text-sky-100 mt-3 sm:mt-4">
            <button
              type="button"
              onClick={onBackToAbout}
              className="hover:text-white hover:underline transition cursor-pointer text-sky-100/90"
            >
              Home
            </button>
            <span className="text-sky-300/80">/</span>
            <button
              type="button"
              onClick={onBackToAbout}
              className="hover:text-white hover:underline transition cursor-pointer text-sky-100/90"
            >
              About Us
            </button>
            <span className="text-sky-300/80">/</span>
            <span className="text-white font-bold">
              {getPageTitle()}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. THE PROFESSIONAL WHITE CARD                            */}
      {/* Exact match with reference images image_2043d148 & edaa888a */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-4xl lg:max-w-5xl mx-auto w-full px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10 pb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 px-6 sm:px-12 md:px-16 pt-10 sm:pt-12 pb-12 sm:pb-16 flex flex-col items-center">
          {/* Centered Circular Portrait with Emerald Ring Frame */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 sm:border-[5px] border-emerald-600 shadow-md p-1 bg-white mx-auto overflow-hidden flex items-center justify-center shrink-0">
            {leader.photoUrl ? (
              <img
                src={leader.photoUrl}
                alt={nepaliName}
                className="w-full h-full object-cover object-top rounded-full"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center font-bold text-3xl text-emerald-700">
                {nepaliName.charAt(0)}
              </div>
            )}
          </div>

          {/* Full Name in Nepali (Large, Bold Typography) */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0c2d3e] mt-5 sm:mt-6 text-center tracking-tight font-serif sm:font-sans">
            {nepaliName}
          </h2>

          {/* Designation in Green / Emerald Text */}
          <p className="text-emerald-700 font-bold text-base sm:text-lg md:text-xl text-center mt-1.5 sm:mt-2">
            {getDesignationDisplay()}
          </p>

          {/* Thin Horizontal Divider Line */}
          <div className="w-full border-t border-slate-100 my-8 sm:my-10" />

          {/* Message Body Area */}
          <div className="w-full text-left">
            {/* Quotation Mark Icon on Left (Mint / Sage) */}
            <div className="text-emerald-500/35 text-5xl sm:text-6xl font-serif select-none -mb-3 leading-none pl-1 text-left w-full">
              “
            </div>

            {/* Complete Organizational Message with Proper Typography and Spacing */}
            <div className="text-base sm:text-lg md:text-[1.075rem] text-slate-700 leading-relaxed sm:leading-[2.2] font-normal space-y-6 sm:space-y-7 text-left sm:text-justify w-full pl-1">
              {messageParagraphs.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed sm:leading-[2.2]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. "BACK TO ABOUT" BUTTON (Exact Match with image_edaa888a) */}
          {/* ========================================================= */}
          <div className="mt-12 sm:mt-16 text-center w-full">
            <button
              type="button"
              onClick={onBackToAbout}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-sm sm:text-base inline-flex items-center gap-2.5 transition hover:-translate-x-1 cursor-pointer py-2.5 px-6 rounded-xl hover:bg-emerald-50/80 border border-emerald-200/50 sm:border-transparent"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back to About</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
