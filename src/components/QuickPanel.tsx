import React from 'react';
import { Language, CmsPagesState, ReportCMS } from '../types';

interface QuickPanelProps {
  lang: Language;
  onSelectReport: (reportName: string) => void;
  cmsPages?: CmsPagesState;
  cmsReports?: ReportCMS[];
}

export const QuickPanel: React.FC<QuickPanelProps> = ({ lang, onSelectReport }) => {
  const isNepali = lang === 'np';

  const items = [
    {
      id: 'profile',
      icon: '▥',
      titleEn: 'Institutional Profile',
      titleNp: 'संस्थागत परिचय',
      subtitleEn: 'Overview & statutory facts',
      subtitleNp: 'संक्षिप्त संस्थागत जानकारी',
      badgeEn: 'LATEST',
      badgeNp: 'नवीनतम',
      highlight: true,
    },
    {
      id: 'monthly',
      icon: '📈',
      titleEn: 'Monthly Report',
      titleNp: 'मासिक प्रतिवेदन',
      subtitleEn: 'Financial & balance sheets',
      subtitleNp: 'मासिक वित्तीय विवरण',
      badgeEn: 'UPDATED',
      badgeNp: 'नियमित',
    },
    {
      id: 'progress',
      icon: '📊',
      titleEn: 'Progress Report',
      titleNp: 'प्रगति प्रतिवेदन',
      subtitleEn: 'Quarterly developmental records',
      subtitleNp: 'त्रैमासिक विकास प्रगति',
    },
    {
      id: 'annual',
      icon: '📑',
      titleEn: 'Annual Report',
      titleNp: 'वार्षिक प्रतिवेदन',
      subtitleEn: '24th AGM audited statements',
      subtitleNp: '२४औं साधारण सभा पुस्तिका',
      badgeEn: '24th AGM',
      badgeNp: '२४औं सभा',
    },
    {
      id: 'audit',
      icon: '⚖️',
      titleEn: 'Audit Report',
      titleNp: 'लेखापरीक्षण प्रतिवेदन',
      subtitleEn: 'Chartered accountant statutory audit',
      subtitleNp: 'वैधानिक लेखापरीक्षण विवरण',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-12 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSelectReport(item.id);
            }}
            className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 text-left flex items-center gap-3.5 cursor-pointer shadow-xs hover:shadow-lg ${
              item.highlight
                ? 'bg-gradient-to-br from-[#eef8fc] to-[#e0f2fe] border-sky-300 text-[#0c2d3e] hover:border-[#0981ae]'
                : 'bg-white hover:bg-[#f8fcfe] border-slate-200/90 hover:border-sky-300 text-slate-800'
            }`}
          >
            {/* Left Icon Container */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border transition-all duration-200 ${
                item.highlight
                  ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                  : 'bg-sky-50 text-[#0981ae] border-sky-200/70 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600'
              }`}
            >
              {item.icon}
            </div>

            {/* Right Title & Subtitle */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0981ae] transition-colors leading-snug truncate">
                  {isNepali ? item.titleNp : item.titleEn}
                </h4>
                {item.badgeEn && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-100/80 text-[#0981ae] shrink-0 border border-sky-200/60">
                    {isNepali ? item.badgeNp : item.badgeEn}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {isNepali ? item.subtitleNp : item.subtitleEn}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
