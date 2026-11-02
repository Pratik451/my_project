import React from 'react';
import { Language, GalleryItem } from '../types';
import { GALLERY_ITEMS } from '../data/cooperativeData';

interface GallerySectionProps {
  lang: Language;
  onViewAll?: () => void;
  onSelectPhoto?: (photo: GalleryItem) => void;
  gallery?: GalleryItem[];
  galleryItems?: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  lang,
  onViewAll,
  onSelectPhoto,
  gallery,
  galleryItems,
}) => {
  const isNepali = lang === 'np';
  const source = gallery || galleryItems;
  const displayItems = (Array.isArray(source) && source.length > 0) ? source : GALLERY_ITEMS;

  return (
    <section className="py-16 sm:py-20 bg-[#f4f9fc] border-t border-slate-200/80" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0981ae] text-xs font-bold uppercase tracking-wider border border-sky-200/70 mb-2.5">
              <span>📷</span>
              <span>{isNepali ? 'फोटो तथा गतिविधि ग्यालरी' : 'ACTIVITIES & PHOTO GALLERY'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0c2d3e] tracking-tight">
              {isNepali ? 'अंकुर सहकारीका मुख्य गतिविधिहरू' : 'Moments & Community Events'}
            </h2>
          </div>
          {onViewAll && (
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#0981ae] hover:text-[#07678d] transition cursor-pointer self-start sm:self-auto group"
              onClick={onViewAll}
            >
              <span>{isNepali ? 'सबै तस्बिरहरू हेर्नुहोस्' : 'View Full Gallery'}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>

        {/* Consistent Larger Card Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPhoto && onSelectPhoto(item)}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer text-left"
            >
              {/* Image Container with Zoom effect */}
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={isNepali ? item.titleNp : item.titleEn}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/media/default-event.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold tracking-wide border border-white/20">
                  {item.category || (isNepali ? 'कार्यक्रम' : 'Event')}
                </span>
              </div>

              {/* Content Box */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0981ae] transition-colors line-clamp-2 leading-snug mb-2">
                  {isNepali ? item.titleNp : item.titleEn}
                </h3>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.category || (isNepali ? '२०८१ असोज' : 'Recent')}</span>
                  <span className="text-[#0981ae] font-bold group-hover:translate-x-0.5 transition-transform">
                    {isNepali ? 'हेर्नुहोस् ➔' : 'View ➔'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
