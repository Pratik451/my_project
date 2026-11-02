import React, { useState, useEffect } from 'react';
import {
  Quote,
  ShieldCheck,
  Award,
  ArrowLeft,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { LeadershipMemberCMS } from '../types';
import { ChairmanMessagePage } from './ChairmanMessagePage';

interface LeadershipSectionProps {
  lang: 'en' | 'np';
  members: LeadershipMemberCMS[];
  onFileGrievance?: () => void;
  onOpenOfficerDetails?: (member: LeadershipMemberCMS) => void;
  onSelectLeader?: (member: LeadershipMemberCMS) => void;
  externalSelectedLeader?: LeadershipMemberCMS | null;
  onClearExternalSelectedLeader?: () => void;
}

export const LeadershipSection: React.FC<LeadershipSectionProps> = ({
  lang,
  members,
  onFileGrievance,
  onOpenOfficerDetails,
  onSelectLeader,
  externalSelectedLeader,
  onClearExternalSelectedLeader,
}) => {
  const isNp = lang === 'np';
  const [selectedLeader, setSelectedLeader] = useState<LeadershipMemberCMS | null>(null);

  // Sync external leader selection
  useEffect(() => {
    if (externalSelectedLeader) {
      setSelectedLeader(externalSelectedLeader);
    }
  }, [externalSelectedLeader]);

  // Filter active members and sort them
  const activeMembers = members
    .filter((m) => m.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  if (!activeMembers || activeMembers.length === 0) {
    return null;
  }

  const handleCardReadMore = (member: LeadershipMemberCMS) => {
    if (onSelectLeader) {
      onSelectLeader(member);
    } else {
      setSelectedLeader(member);
    }
  };

  const handleCloseModal = () => {
    setSelectedLeader(null);
    if (onClearExternalSelectedLeader) {
      onClearExternalSelectedLeader();
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'chairman':
        return {
          label: isNp ? 'सञ्चालक समिति अध्यक्ष' : 'Board Chairman',
          roleBadge: isNp ? 'सर्वोच्च सञ्चालक नेतृत्व' : 'Apex Board Leadership',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
          dot: 'bg-emerald-500',
          accent: 'from-emerald-600 via-teal-600 to-[#074766]',
          cardBorder: 'hover:border-emerald-500/60',
          glow: 'group-hover:shadow-emerald-900/10',
        };
      case 'ceo':
        return {
          label: isNp ? 'प्रमुख कार्यकारी अधिकृत' : 'Chief Executive Officer',
          roleBadge: isNp ? 'कार्यकारी सचिवालय' : 'Executive Management',
          bg: 'bg-sky-50 text-sky-800 border-sky-200/90',
          dot: 'bg-sky-500',
          accent: 'from-[#074766] via-[#0981ae] to-[#0284c7]',
          cardBorder: 'hover:border-[#0981ae]/60',
          glow: 'group-hover:shadow-sky-900/10',
        };
      case 'info_officer':
        return {
          label: isNp ? 'सूचना अधिकारी • RTI' : 'Information Officer • RTI',
          roleBadge: isNp ? 'पारदर्शिता तथा RTI डेस्क' : 'RTI & Public Transparency',
          bg: 'bg-amber-50 text-amber-800 border-amber-200/90',
          dot: 'bg-amber-500',
          accent: 'from-amber-600 via-teal-600 to-emerald-700',
          cardBorder: 'hover:border-amber-500/60',
          glow: 'group-hover:shadow-amber-900/10',
        };
      case 'grievance_officer':
        return {
          label: isNp ? 'गुनासो सुनुवाइ अधिकारी' : 'Grievance Redressal Officer',
          roleBadge: isNp ? 'निष्पक्ष गुनासो डेस्क' : 'Compliance & Grievance Cell',
          bg: 'bg-purple-50 text-purple-800 border-purple-200/90',
          dot: 'bg-purple-500',
          accent: 'from-purple-700 via-indigo-600 to-[#074766]',
          cardBorder: 'hover:border-purple-500/60',
          glow: 'group-hover:shadow-purple-900/10',
        };
      default:
        return {
          label: isNp ? 'नेतृत्व तथा अधिकृत' : 'Leadership Official',
          roleBadge: isNp ? 'आधिकारिक डेस्क' : 'Official Secretariat',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
          accent: 'from-slate-700 to-slate-900',
          cardBorder: 'hover:border-slate-400',
          glow: 'group-hover:shadow-slate-900/10',
        };
    }
  };

  return (
    <section
      id="leadership-messages"
      className="py-16 md:py-24 bg-gradient-to-b from-[#f8fcfe] via-white to-[#f0f7fa] border-y border-slate-200/80 relative overflow-hidden"
    >
      {/* Decorative ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-sky-200/25 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-emerald-200/20 rounded-full blur-3xl translate-y-1/3" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200/90 text-[#074766] text-xs font-extrabold uppercase tracking-wider mb-3.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#0981ae]" />
            <span>{isNp ? 'आधिकारिक नेतृत्व तथा सुशासन' : 'GOVERNANCE & LEADERSHIP DIRECTIVE'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0c2d3e] tracking-tight leading-tight">
            {isNp ? 'नेतृत्वको सन्देश तथा आधिकारिक डेस्क' : 'Messages from Leadership'}
          </h2>

          <div className="w-20 h-1.5 bg-gradient-to-r from-[#074766] via-[#0981ae] to-emerald-500 rounded-full mx-auto mt-4 mb-4" />

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {isNp
              ? 'सुशासन, पारदर्शिता र सदस्य समृद्धिप्रति प्रतिबद्ध हाम्रो नेतृत्व मण्डलको आधिकारिक सन्देश तथा संगठनात्मक दृष्टिकोण।'
              : 'Steadfast commitment to good governance, institutional transparency, and member-centric financial excellence. Read official messages and organizational vision from our apex leadership.'}
          </p>
        </div>

        {/* 4-Column Responsive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-7 items-stretch">
          {activeMembers.map((member) => {
            const config = getCategoryConfig(member.category);
            const leaderName = isNp ? member.nameNp || member.nameEn : member.nameEn || member.nameNp;
            const designation = isNp ? member.designationNp || member.designationEn : member.designationEn || member.designationNp;
            const shortMsg = isNp ? member.shortMessageNp || member.shortMessageEn : member.shortMessageEn || member.shortMessageNp;

            const isGrievance = member.category === 'grievance_officer';

            return (
              <div
                key={member.id}
                className={`group bg-white rounded-2xl border border-slate-200/90 ${config.cardBorder} shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden relative ${config.glow}`}
              >
                {/* Top Role Accent Bar */}
                <div className={`h-2.5 w-full bg-gradient-to-r ${config.accent}`} />

                {/* Card Top: Category Pill, Portrait, Name & Designation */}
                <div className="pt-6 pb-4 px-5 text-center flex flex-col items-center">
                  {/* Category Pill */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${config.bg} mb-4 shadow-2xs`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
                    {config.label}
                  </div>

                  {/* Circular Portrait Frame with Emerald border */}
                  <div className="relative mb-3.5">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-3 border-emerald-600 bg-white shadow-md group-hover:shadow-lg transition-transform duration-300 group-hover:scale-105">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={leaderName}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-3xl font-extrabold text-[#0981ae]">
                            {leaderName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Official Verified Shield Pin */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-emerald-600">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Leader Name in Nepali / English */}
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0c2d3e] group-hover:text-[#074766] transition-colors leading-tight line-clamp-1">
                    {leaderName}
                  </h3>

                  {/* Designation */}
                  <p className="text-xs font-bold text-emerald-700 mt-1 line-clamp-2 min-h-[32px] flex items-center justify-center px-1">
                    {designation}
                  </p>
                </div>

                {/* Card Body: Quote Preview */}
                <div className="px-5 pb-4 flex-1 flex flex-col text-left">
                  <div className="bg-[#f7fafc] rounded-xl p-3.5 border border-slate-100 text-xs text-slate-700 leading-relaxed relative flex-1 flex flex-col justify-between mb-3 shadow-2xs">
                    <div className="relative">
                      <Quote className="w-4 h-4 text-emerald-600/50 mb-1" />
                      <p className="italic line-clamp-4 text-slate-700 text-[12px] font-normal pl-1">
                        &ldquo;{shortMsg}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: Read More */}
                <div className="px-5 pb-5 pt-1">
                  {isGrievance && onFileGrievance ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCardReadMore(member)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#074766] hover:bg-[#05354d] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isNp ? 'विस्तृत सन्देश' : 'Read More'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={onFileGrievance}
                        className="py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                        title={isNp ? 'गुनासो दर्ता गर्नुहोस्' : 'File Grievance'}
                      >
                        <span>📝</span>
                        <span>{isNp ? 'गुनासो' : 'Grievance'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCardReadMore(member)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#074766] hover:bg-[#05354d] text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isNp ? 'विस्तृत सन्देश (Read More)' : 'Read More'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fallback full-screen view if onSelectLeader is not passed */}
      {selectedLeader && (
        <div className="fixed inset-0 z-[1600] bg-[#f3f7fa] overflow-y-auto">
          <ChairmanMessagePage
            leader={selectedLeader}
            lang={lang}
            onBackToAbout={handleCloseModal}
          />
        </div>
      )}
    </section>
  );
};
