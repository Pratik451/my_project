import React from 'react';
import { SocialLinksCMS } from '../types';

export type SocialPlatformKey = keyof SocialLinksCMS;

export interface SocialPlatformMeta {
  key: SocialPlatformKey;
  label: string;
  labelNp: string;
  shortLabel: string;
  brandColor: string;
  hoverBgClass: string;
  badgeBgStyle: string;
  placeholder: string;
  description: string;
}

export const SOCIAL_PLATFORMS_META: SocialPlatformMeta[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    labelNp: 'फेसबुक',
    shortLabel: 'Facebook',
    brandColor: '#1877F2',
    hoverBgClass: 'hover:bg-[#1877F2] hover:border-[#1877F2]',
    badgeBgStyle: '#1877F2',
    placeholder: 'https://facebook.com/ekatacooperative.butwal',
    description: 'Official Facebook Page & community updates',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    labelNp: 'इन्स्टाग्राम',
    shortLabel: 'Instagram',
    brandColor: '#E4405F',
    hoverBgClass: 'hover:bg-[#E4405F] hover:border-[#E4405F]',
    badgeBgStyle: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    placeholder: 'https://instagram.com/ekatacooperative',
    description: 'Official Instagram profile, photos & AGM highlights',
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    labelNp: 'एक्स (ट्विटर)',
    shortLabel: 'X / Twitter',
    brandColor: '#0f172a',
    hoverBgClass: 'hover:bg-black hover:border-slate-700',
    badgeBgStyle: '#0f172a',
    placeholder: 'https://x.com/ekatacoop_np',
    description: 'Official X (formerly Twitter) notices & announcements',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    labelNp: 'युट्युब',
    shortLabel: 'YouTube',
    brandColor: '#FF0000',
    hoverBgClass: 'hover:bg-[#FF0000] hover:border-[#FF0000]',
    badgeBgStyle: '#FF0000',
    placeholder: 'https://youtube.com/@ekatacooperative',
    description: 'Official YouTube channel, financial literacy & AGM videos',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    labelNp: 'लिङ्क्डइन',
    shortLabel: 'LinkedIn',
    brandColor: '#0A66C2',
    hoverBgClass: 'hover:bg-[#0A66C2] hover:border-[#0A66C2]',
    badgeBgStyle: '#0A66C2',
    placeholder: 'https://linkedin.com/company/ekata-cooperative',
    description: 'Official LinkedIn organization profile & career updates',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    labelNp: 'ह्वाट्सएप',
    shortLabel: 'WhatsApp',
    brandColor: '#0981ae',
    hoverBgClass: 'hover:bg-[#0981ae] hover:border-[#0981ae]',
    badgeBgStyle: '#0981ae',
    placeholder: '9857099441 or https://wa.me/9779857099441',
    description: 'Direct WhatsApp member desk & instant inquiry hotline',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    labelNp: 'टिकटक',
    shortLabel: 'TikTok',
    brandColor: '#010101',
    hoverBgClass: 'hover:bg-[#010101] hover:border-rose-500',
    badgeBgStyle: '#010101',
    placeholder: 'https://tiktok.com/@ekatacoop',
    description: 'Official TikTok account for youth financial literacy',
  },
];

/**
 * Formats and validates an Admin-configured social media URL or phone handle
 * so clicking the icon always opens the right external destination.
 */
export function resolveSocialMediaUrl(key: SocialPlatformKey, rawValue?: string | null): string {
  if (!rawValue || typeof rawValue !== 'string') return '';
  const trimmed = rawValue.trim();
  if (!trimmed) return '';

  if (key === 'whatsapp') {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (/^wa\.me\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    const digits = trimmed.replace(/[^0-9]/g, '');
    if (!digits) return '';
    // If 10-digit Nepal mobile number (e.g. 98XXXXXXXX or 97XXXXXXXX), prefix 977
    if (digits.length === 10 && digits.startsWith('9')) {
      return `https://wa.me/977${digits}`;
    }
    return `https://wa.me/${digits}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

export interface ResolvedSocialPlatform extends SocialPlatformMeta {
  url: string;
  rawValue: string;
}

/**
 * Returns all active social platforms that have a non-empty Admin URL configured.
 */
export function getActiveSocialPlatforms(
  socialLinks?: SocialLinksCMS | null
): ResolvedSocialPlatform[] {
  if (!socialLinks) return [];

  return SOCIAL_PLATFORMS_META.map((meta) => {
    const rawValue = (socialLinks[meta.key] || '').trim();
    const url = resolveSocialMediaUrl(meta.key, rawValue);
    return {
      ...meta,
      rawValue,
      url,
    };
  }).filter((item) => Boolean(item.url));
}

interface SocialIconSvgProps {
  platform: SocialPlatformKey;
  className?: string;
}

/**
 * Renders the recognizable, official-style SVG vector icon for each social media platform.
 */
export const SocialPlatformSvg: React.FC<SocialIconSvgProps> = ({
  platform,
  className = 'w-4 h-4',
}) => {
  switch (platform) {
    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );

    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );

    case 'twitter':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case 'youtube':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.123.553 4.195 1.604 6.02L.057 24l6.105-1.601a11.976 11.976 0 0 0 5.869 1.531h.005c6.645 0 12.03-5.385 12.03-12.03C24.066 5.385 18.676 0 12.031 0zm6.564 17.129c-.277.781-1.613 1.494-2.248 1.59-.578.087-1.31.124-2.115-.132-.488-.155-1.114-.362-1.918-.709-3.376-1.458-5.581-4.859-5.75-5.084-.168-.225-1.373-1.826-1.373-3.483 0-1.657.868-2.472 1.176-2.809.309-.337.673-.421.898-.421.225 0 .449.003.646.012.207.01.484-.079.757.578.277.669.941 2.303 1.025 2.471.084.169.14.365.028.59-.112.225-.168.365-.337.562-.168.197-.354.44-.505.59-.168.168-.344.351-.148.688.197.337.873 1.44 1.873 2.331 1.287 1.147 2.371 1.503 2.708 1.671.337.169.534.14.73-.084.197-.225.842-.983 1.067-1.32.225-.337.449-.281.758-.169.309.112 1.966.927 2.303 1.095.337.169.562.253.646.393.084.141.084.815-.193 1.596z" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );

    default:
      return null;
  }
};

interface SocialPlatformBadgeProps {
  platform: SocialPlatformKey;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'subtle' | 'topbar';
  className?: string;
}

/**
 * Renders an official-style colored or themed badge containing the platform's vector icon.
 */
export const SocialPlatformBadge: React.FC<SocialPlatformBadgeProps> = ({
  platform,
  size = 'md',
  variant = 'brand',
  className = '',
}) => {
  const meta = SOCIAL_PLATFORMS_META.find((m) => m.key === platform);
  const sizeClasses =
    size === 'sm'
      ? 'w-6 h-6 rounded-md'
      : size === 'lg'
      ? 'w-10 h-10 rounded-xl'
      : 'w-9 h-9 rounded-xl';

  const iconSizeClasses =
    size === 'sm'
      ? 'w-3.5 h-3.5'
      : size === 'lg'
      ? 'w-5 h-5'
      : 'w-4 h-4';

  if (variant === 'topbar') {
    return (
      <span
        className={`inline-flex items-center justify-center ${sizeClasses} text-white transition-all duration-200 shadow-2xs ${className}`}
        style={{ background: meta?.badgeBgStyle || '#0981ae' }}
      >
        <SocialPlatformSvg platform={platform} className={iconSizeClasses} />
      </span>
    );
  }

  if (variant === 'subtle') {
    return (
      <span
        className={`inline-flex items-center justify-center ${sizeClasses} bg-sky-900/80 text-white border border-sky-700/60 transition-all duration-200 ${
          meta?.hoverBgClass || 'hover:bg-sky-700'
        } ${className}`}
      >
        <SocialPlatformSvg platform={platform} className={iconSizeClasses} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses} text-white shadow-sm transition-transform duration-200 ${className}`}
      style={{ background: meta?.badgeBgStyle || '#0981ae' }}
    >
      <SocialPlatformSvg platform={platform} className={iconSizeClasses} />
    </span>
  );
};
