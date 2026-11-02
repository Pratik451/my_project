import React from 'react';
import { Language, ServiceItem } from '../types';
import { SERVICES_DATA } from '../data/cooperativeData';

interface ServicesSectionProps {
  lang: Language;
  onSelectService: (service: ServiceItem) => void;
  onViewAllServices?: () => void;
  services?: ServiceItem[];
}

// Subtitles matching the existing design exactly as shown in screenshot
const SERVICE_SUBTITLES: Record<string, { en: string; np: string; icon: string }> = {
  'member-service': {
    en: 'Share capital, welfare schemes & patron relief benefits',
    np: 'सेयर पुँजी, कल्याणकारी राहत कोष तथा संरक्षक बोनस सुविधा',
    icon: '👥',
  },
  'deposit-product': {
    en: 'Regular, recurring, child & high-yield fixed deposits',
    np: 'दैनिक बचत, मुद्दती, बाल भविष्य तथा उच्च प्रतिफल निक्षेप',
    icon: '🏛️',
  },
  'loan': {
    en: 'Agriculture, enterprise, housing & productive credit',
    np: 'कृषि, साना उद्यम, घरजग्गा तथा उत्पादनशील सहुलियत कर्जा',
    icon: '💼',
  },
  'remittance': {
    en: 'Instant domestic & international payout via IME, Prabhu',
    np: 'प्रभु, आइएमई तथा वेस्टर्न युनियनमार्फत तत्काल भुक्तानी',
    icon: '↗',
  },
  'insurance': {
    en: 'Micro-insurance, health relief & livestock/crop safety',
    np: 'लघुबिमा, सदस्य स्वास्थ्य राहत, पशुधन तथा बाली सुरक्षा',
    icon: '🛡️',
  },
  'digital-services': {
    en: '24/7 Helpline, member support, grievance desk & FAQs',
    np: '२४/७ हेल्पलाइन, सदस्य सहयोग, गुनासो पेटिका तथा सोधिने प्रश्नहरू',
    icon: '❓',
  },
  'help': {
    en: '24/7 Helpline, member support, grievance desk & FAQs',
    np: '२४/७ हेल्पलाइन, सदस्य सहयोग, गुनासो पेटिका तथा सोधिने प्रश्नहरू',
    icon: '❓',
  },
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  lang,
  onSelectService,
  onViewAllServices,
  services,
}) => {
  const displayServices = (Array.isArray(services) && services.length > 0) ? services : SERVICES_DATA;

  return (
    <section className="bg-gradient-to-br from-[#065371] via-[#07678d] to-[#072f42] text-white py-16 sm:py-20 border-y border-[#07678d]" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-sky-200 text-xs font-bold uppercase tracking-wider border border-white/20 mb-2.5">
              <span>✦</span>
              <span>{lang === 'np' ? 'हाम्रा सेवाहरू' : 'OUR SERVICES'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'np' ? 'हरेक सदस्यका लागि भरपर्दो सेवा' : 'Solutions for every member'}
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-sky-200 hover:text-white transition cursor-pointer self-start sm:self-auto group"
            onClick={() => (onViewAllServices ? onViewAllServices() : onSelectService(displayServices[0]))}
          >
            <span>{lang === 'np' ? 'सबै सेवाहरू हेर्नुहोस्' : 'View All Services'}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* 6 Larger Horizontal Cards Grid (Matching existing layout from screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayServices.map((service) => {
            const fallbackMeta = SERVICE_SUBTITLES[service.id] || {
              en: service.descriptionEn,
              np: service.descriptionNp,
              icon: service.icon || '✦',
            };

            const displayIcon = service.icon || fallbackMeta.icon;
            const displaySubtitle = lang === 'np'
              ? (service.descriptionNp || fallbackMeta.np)
              : (fallbackMeta.en || service.descriptionEn);

            return (
              <div
                key={service.id}
                onClick={() => onSelectService(service)}
                className="group relative bg-[#07678d]/85 hover:bg-[#07678d] active:bg-[#065371] border border-white/20 hover:border-white/45 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-200 flex items-center gap-4 cursor-pointer backdrop-blur-xs text-left"
              >
                {/* Left: Prominent Icon Box with border & translucent backdrop */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-3xl sm:text-3xl shrink-0 text-white shadow-xs group-hover:scale-105 group-hover:bg-white/25 transition-all duration-200">
                  {displayIcon}
                </div>

                {/* Right: Title & Subtitle */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-snug group-hover:text-amber-200 transition-colors">
                    {lang === 'np' ? service.titleNp : service.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-normal line-clamp-2">
                    {displaySubtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
