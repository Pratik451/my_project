import React, { useState, useEffect } from 'react';
import { Language, SlideCMS, SiteSettingsCMS } from '../types';

interface HeroProps {
  lang: Language;
  onCtaClick: () => void;
  slides?: SlideCMS[];
  cmsSettings?: SiteSettingsCMS;
}

const DEFAULT_HERO_SLIDES = [
  {
    id: 's1',
    titleEn: 'Trusted Financial Pillar of Rupandehi',
    titleNp: 'समुदायमा आधारित, सदस्य-केन्द्रित भरपर्दो वित्तीय संस्था',
    subtitleEn: 'Serving over 15,420 members since 2057 B.S. with secure savings, productive loans, and community prosperity.',
    subtitleNp: 'वि.सं. २०५७ देखि रुपन्देहीमा सुरक्षित बचत, उत्पादनशील कर्जा र सामुदायिक समृद्धिका लागि समर्पित सहकारी संस्था।',
    ctaTextEn: 'Explore Services →',
    ctaTextNp: 'सेवाहरू हेर्नुहोस् →',
    ctaLink: '#services',
    imageUrl: '/uploads/media/slide-banking.svg',
    sortOrder: 1,
  },
  {
    id: 's2',
    titleEn: 'Dedicated Member Care & Safe Savings',
    titleNp: 'आत्मीय सेवा, भरपर्दो बचत तथा निक्षेप सुरक्षा',
    subtitleEn: 'Earn attractive quarterly interest on daily balances with instant counter withdrawals and passbook facilities.',
    subtitleNp: 'दैनिक मौज्दातमा आकर्षक ब्याज, सहज काउन्टर भुक्तानी र भरपर्दो सदस्य कल्याणकारी योजनाहरू।',
    ctaTextEn: 'View Savings Schemes →',
    ctaTextNp: 'बचत योजनाहरू →',
    ctaLink: '#rates',
    imageUrl: '/uploads/media/slide-deposits.svg',
    sortOrder: 2,
  },
  {
    id: 's3',
    titleEn: 'Empowering Local Farmers & Agriculture',
    titleNp: 'किसान र कृषि उत्पादकत्व प्रवर्द्धनमा सुलभ कर्जा',
    subtitleEn: 'Subsidized credit for modern farming, livestock, dairy cooperatives, and agricultural machinery.',
    subtitleNp: 'आधुनिक कृषि, पशुपालन, दुग्ध व्यवसाय र यन्त्र खरिदका लागि सहुलियतपूर्ण कर्जा सुविधा।',
    ctaTextEn: 'Calculate Loan EMI →',
    ctaTextNp: 'कर्जा किस्ता हिसाब →',
    ctaLink: '#calculator',
    imageUrl: '/uploads/media/slide-agriculture.svg',
    sortOrder: 3,
  },
  {
    id: 's4',
    titleEn: 'Fueling Micro-Enterprise & Business Growth',
    titleNp: 'व्यापार, उद्यमशीलता र साना व्यवसायको सहयात्री',
    subtitleEn: 'Hassle-free business installment credit designed to scale local commerce and family enterprises.',
    subtitleNp: 'स्थानीय व्यापार विस्तार, स्वरोजगार र साना उद्यमलाई अगाडि बढाउन छरितो कर्जा सेवा।',
    ctaTextEn: 'Loan Schemes →',
    ctaTextNp: 'कर्जा योजनाहरू →',
    ctaLink: '#rates',
    imageUrl: '/uploads/media/gallery-tech.svg',
    sortOrder: 4,
  },
  {
    id: 's5',
    titleEn: 'Smart Ankur Mobile Banking & QR',
    titleNp: 'हात-हातमा आधुनिक डिजिटल सहकारी सेवा',
    subtitleEn: 'Experience mobile banking, Fonepay QR merchant scan, inter-cooperative fund transfers, and eKYM updates anywhere.',
    subtitleNp: 'घरमै बसी मोबाइल बैंकिङ, क्युआर भुक्तानी, अन्तरसहकारी रकम स्थानान्तरण र eKYM अध्यावधिक।',
    ctaTextEn: 'Digital Banking →',
    ctaTextNp: 'डिजिटल बैंकिङ →',
    ctaLink: '#digital',
    imageUrl: '/uploads/media/slide-digital.svg',
    sortOrder: 5,
  },
];

export const Hero: React.FC<HeroProps> = ({ lang, onCtaClick, slides, cmsSettings }) => {
  const activeSlides = (Array.isArray(slides) && slides.length > 0) ? slides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Keep index in bounds when slides count changes
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const slide = activeSlides[currentSlide] || activeSlides[0];

  return (
    <section
      className="hero relative overflow-hidden"
      id="home"
      style={
        slide.imageUrl
          ? {
              backgroundImage: `linear-gradient(90deg, rgba(11, 21, 40, 0.82) 0%, rgba(15, 28, 52, 0.58) 55%, rgba(15, 28, 52, 0.32) 100%), url(${slide.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="container hero-content">
        <span className="eyebrow">
          {lang === 'np'
            ? (cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी')
            : (cmsSettings?.coopNameEn || 'TRUST • SERVICE • PROSPERITY')}
        </span>
        <h1>{lang === 'np' ? (slide.titleNp || slide.titleEn) : (slide.titleEn || slide.titleNp)}</h1>
        <p>{lang === 'np' ? (slide.subtitleNp || slide.subtitleEn) : (slide.subtitleEn || slide.subtitleNp)}</p>
        <button
          type="button"
          className="hero-btn cursor-pointer shadow-lg hover:shadow-xl transition-all"
          onClick={onCtaClick}
        >
          {lang === 'np' ? (slide.ctaTextNp || 'सेवाहरू हेर्नुहोस् →') : (slide.ctaTextEn || 'Explore Services →')}
        </button>
      </div>

      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            className="slider-arrow left"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            className="slider-arrow right"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>

          <div className="dots">
            {activeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === currentSlide ? 'on' : ''}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
