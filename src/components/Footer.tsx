import React from 'react';
import { Language, SiteSettingsCMS, SocialLinksCMS, PrivacyPolicyCMS, HeadOfficeInfoCMS } from '../types';
import { INITIAL_CMS_SOCIAL_LINKS } from '../data/cmsInitialData';
import { getActiveSocialPlatforms, SocialPlatformBadge } from './SocialMediaIcons';

interface FooterProps {
  lang: Language;
  onLinkClick: (section: string) => void;
  cmsSettings?: SiteSettingsCMS;
  headOffice?: HeadOfficeInfoCMS;
  socialLinks?: SocialLinksCMS | null;
  privacyPolicy?: PrivacyPolicyCMS | null;
  onOpenPrivacyPolicy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onLinkClick,
  cmsSettings,
  headOffice,
  socialLinks,
  privacyPolicy,
  onOpenPrivacyPolicy,
}) => {
  const effectiveSocialLinks =
    socialLinks && Object.values(socialLinks).some((v) => Boolean(v && String(v).trim()))
      ? socialLinks
      : INITIAL_CMS_SOCIAL_LINKS;

  const activeSocials = getActiveSocialPlatforms(effectiveSocialLinks);

  return (
    <footer id="contact">
      <div className="container footer-grid">
        {/* Organization Info */}
        <div>
          {cmsSettings?.coopLogoUrl ? (
            <img
              key={cmsSettings.coopLogoUrl}
              src={cmsSettings.coopLogoUrl}
              className="footer-logo max-h-14 w-auto object-contain"
              alt={cmsSettings?.coopNameEn || "Ankur Saving & Credit Cooperative Ltd."}
            />
          ) : null}
          <h3 className="font-bold text-base text-white mt-3">
            {(lang === 'np'
              ? cmsSettings?.coopNameNp || headOffice?.officeNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.'
              : cmsSettings?.coopNameEn || headOffice?.officeNameEn || 'Ankur Saving & Credit Cooperative Ltd.'
            ).replace(/\s*\([^)]*\)\s*/g, '')}
          </h3>
          <p className="text-xs text-[#7dd3fc] font-medium mt-0.5">
            {lang === 'np'
              ? `स्थापना: ${headOffice?.establishedDate || cmsSettings?.establishedYearNp || cmsSettings?.establishedYear || ''}`
              : `Established: ${headOffice?.establishedDate || cmsSettings?.establishedYear || ''}`}
          </p>
          <p className="text-sm text-[#b8d4e3] mt-1">
            ☎ {headOffice?.primaryPhone || cmsSettings?.phone || ''}
            {headOffice?.altPhone ? ` / ${headOffice.altPhone}` : ''}
          </p>
          <p className="text-sm text-[#b8d4e3]">
            ✉ {headOffice?.officialEmail || cmsSettings?.email || ''}
          </p>
          <p className="text-xs text-[#96b8c9] mt-1">
            {lang === 'np' ? 'दर्ता नं:' : 'Regd. No:'} {headOffice?.regNumber || cmsSettings?.regdNo || ''} | PAN: {headOffice?.panNumber || cmsSettings?.panNo || ''}
          </p>

          {/* Admin Managed Official Social Media Icons */}
          <div className="mt-4 pt-3.5 border-t border-sky-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block mb-2.5">
              {lang === 'np' ? 'सामाजिक सञ्जालमा जोडिनुहोस्' : 'Follow Us on Social Media'}
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {activeSocials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={lang === 'np' ? `${s.labelNp} (${s.label})` : s.label}
                  title={lang === 'np' ? `${s.labelNp} मा हेर्नुहोस्` : `Visit our official ${s.label} page`}
                  className="group inline-flex items-center justify-center rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <SocialPlatformBadge
                    platform={s.key}
                    size="md"
                    variant="brand"
                    className="ring-1 ring-white/20 group-hover:ring-white/50 shadow-md"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4>{lang === 'np' ? 'छिटो लिंक' : 'Quick Links'}</h4>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('about');
            }}
          >
            {lang === 'np' ? 'हाम्रो बारेमा' : 'About Us'}
          </a>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('services');
            }}
          >
            {lang === 'np' ? 'सेवाहरू' : 'Services'}
          </a>
          <a
            href="#centers"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('centers');
            }}
          >
            {lang === 'np' ? 'सेवा केन्द्रहरू' : 'Service Centers'}
          </a>
          <a
            href="#notices"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('notices');
            }}
          >
            {lang === 'np' ? 'समाचार तथा सूचना' : 'News & Notices'}
          </a>
          <a
            href="#calculator"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('calculator');
            }}
          >
            {lang === 'np' ? 'ईएमआई क्याल्कुलेटर' : 'EMI Calculator'}
          </a>
        </div>

        {/* Member Services */}
        <div>
          <h4>{lang === 'np' ? 'सदस्य सेवाहरू' : 'Member Services'}</h4>
          <a
            href="#ekym"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('ekym');
            }}
          >
            eKYM Register
          </a>
          <a
            href="#track"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('track');
            }}
          >
            {lang === 'np' ? 'आवेदन ट्र्याक' : 'Track Application'}
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('faq');
            }}
          >
            {lang === 'np' ? 'बारम्बार सोधिने प्रश्न (FAQs)' : 'FAQs'}
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('contact');
            }}
          >
            {lang === 'np' ? 'सुझाव पेटिका' : 'Suggestion Box'}
          </a>
          <button
            type="button"
            onClick={() => {
              if (onOpenPrivacyPolicy) {
                onOpenPrivacyPolicy();
              } else {
                onLinkClick('privacy');
              }
            }}
            className="text-left text-inherit hover:underline cursor-pointer bg-transparent border-0 p-0 block text-[13px] text-[#b8d4e3] hover:text-white"
          >
            {lang === 'np' ? '🛡️ गोपनीयता नीति' : '🛡️ Privacy Policy'}
          </button>
        </div>

        {/* Office & Administration */}
        <div>
          <h4>{lang === 'np' ? 'कार्यालय तथा प्रकाशन' : 'Office & Publications'}</h4>
          <a
            href="#reports"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('reports');
            }}
          >
            {lang === 'np' ? 'प्रतिवेदन तथा वित्तीय विवरण' : 'Reports & Publications'}
          </a>
          <a
            href="#documents"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('documents');
            }}
          >
            {lang === 'np' ? '📁 आधिकारिक कागजात तथा डाउनलोड' : '📁 Documents & Downloads'}
          </a>
          <a
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('gallery');
            }}
          >
            {lang === 'np' ? 'फोटो ग्यालरी' : 'Photo Gallery'}
          </a>
          <a
            href="#career"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('career');
            }}
          >
            {lang === 'np' ? 'करियर तथा अवसर' : 'Careers'}
          </a>
          <a
            href="#admin-login"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('admin-login');
            }}
          >
            {lang === 'np' ? 'कार्यालय / प्रशासन लगइन' : 'Office Login'}
          </a>
        </div>
      </div>

      <div className="container footer-bottom flex flex-col lg:flex-row items-center justify-between gap-4 py-4 text-xs text-[#7dd3fc] border-t border-sky-800/80">
        <span className="text-center lg:text-left">
          © {new Date().getFullYear()} Ankur Saving and Credit Cooperative Ltd. All
          Rights Reserved.
        </span>

        {/* Responsive Official Social Media Bar in Footer Bottom */}
        {activeSocials.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activeSocials.map((s) => (
              <a
                key={`bottom-${s.key}`}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/90 text-white border border-sky-800/70 transition-all duration-200 hover:-translate-y-0.5"
              >
                <SocialPlatformBadge platform={s.key} size="sm" variant="brand" />
                <span className="text-[11px] font-semibold text-sky-100 hidden sm:inline">
                  {s.shortLabel}
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => {
              if (onOpenPrivacyPolicy) {
                onOpenPrivacyPolicy();
              } else {
                onLinkClick('privacy');
              }
            }}
            className="text-[#7dd3fc] hover:text-white underline cursor-pointer bg-transparent border-0 p-0"
          >
            {lang === 'np' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy & Member Rights'}
          </button>
          <span>•</span>
          <a
            href="#documents"
            onClick={(e) => {
              e.preventDefault();
              onLinkClick('documents');
            }}
            className="text-[#7dd3fc] hover:text-white hover:underline"
          >
            {lang === 'np' ? 'डाउनलोड पोर्टल' : 'Downloads Vault'}
          </a>
          <span>•</span>
          <span>
            {lang === 'np' ? 'सहयोगी' : 'Supported By'}{' '}
            <a
              href="https://ankurinfotech.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-medium"
            >
              Ankur Infotech
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
