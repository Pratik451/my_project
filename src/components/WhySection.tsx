import React from 'react';
import { Language, WhyChooseUsPageCMS } from '../types';
import { INITIAL_CMS_WHY_CHOOSE_US } from '../data/cmsInitialData';

interface WhySectionProps {
  lang: Language;
  onLearnMore?: () => void;
  whyChooseUs?: WhyChooseUsPageCMS;
}

export const WhySection: React.FC<WhySectionProps> = ({
  lang,
  onLearnMore,
  whyChooseUs = INITIAL_CMS_WHY_CHOOSE_US,
}) => {
  const isNepali = lang === 'np';
  const data = whyChooseUs || INITIAL_CMS_WHY_CHOOSE_US;
  const rawItems = data.items || data.pillars || [];
  const pillars = rawItems
    .filter((item) => item.showOnHome !== false)
    .slice()
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <section className="py-16 sm:py-20 bg-[#f8fcfe] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0981ae] text-xs font-bold uppercase tracking-wider border border-sky-200/70 mb-3">
            <span>✦</span>
            <span>{isNepali ? 'किन अंकुर सहकारी?' : 'WHY ANKUR COOPERATIVE?'}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0c2d3e] tracking-tight">
            {isNepali ? data.titleNp : data.titleEn}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2.5 leading-relaxed">
            {isNepali ? data.subtitleNp : data.subtitleEn}
          </p>
        </div>

        {/* Dynamic Pillars Grid from Admin CRUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {pillars.map((item) => (
            <div
              key={item.id}
              className="group bg-white hover:bg-[#f8fcfe] p-6 sm:p-7 rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-lg transition-all duration-200 flex items-start gap-5"
            >
              {/* Left: Prominent Icon Box */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-sky-200/80 text-[#0981ae] flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-105 group-hover:bg-[#0981ae] group-hover:text-white transition-all duration-200 shadow-2xs">
                {item.icon}
              </div>

              {/* Right: Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0981ae] transition-colors leading-snug">
                    {isNepali ? item.titleNp : item.titleEn}
                  </h3>
                  {(item.badgeEn || item.badgeNp) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0981ae] border border-sky-200 text-[11px] font-bold">
                      {isNepali ? item.badgeNp || item.badgeEn : item.badgeEn}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isNepali
                    ? item.descriptionNp || item.descNp
                    : item.descriptionEn || item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {onLearnMore && (
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={onLearnMore}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0981ae] hover:bg-[#07678d] text-white font-bold text-sm shadow transition cursor-pointer"
            >
              <span>{isNepali ? 'हामीलाई किन रोज्ने? विस्तृत विवरण हेर्नुहोस्' : 'Explore Why Choose Us & Full Advantages'}</span>
              <span>➔</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
