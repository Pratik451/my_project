import React, { useState, useMemo } from 'react';
import { Language, ExchangeRateItemCMS, SiteSettingsCMS } from '../types';

interface SmartServicesModalProps {
  isOpen: boolean;
  initialTab: 'date-converter' | 'exchange-rates' | 'emi-calculator';
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  cmsSettings?: SiteSettingsCMS;
  exchangeRates: ExchangeRateItemCMS[];
  onClose: () => void;
  onJumpToEmiSection?: () => void;
}

// Accurate Bikram Sambat (BS) Calendar Month Days Table (2000 BS to 2099 BS)
// Anchor: 2000 Baishakh 1 BS = 1943 April 14 AD
const BS_CALENDAR_DATA: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  2096: [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2098: [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31],
  2099: [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30],
};

const BS_MONTHS_EN = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const BS_MONTHS_NP = [
  'वैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

const AD_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_NP = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];

const toNepaliNum = (val: string | number): string => {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(val).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)]);
};

export interface BsHolidayInfo {
  nameEn: string;
  nameNp: string;
  category: 'dashain' | 'tihar' | 'national';
  isPublicHoliday: boolean;
}

// Year-specific Dashain & Tihar festival dates (keyed by "YYYY-M-D")
const YEAR_SPECIFIC_FESTIVALS: Record<string, BsHolidayInfo> = {
  // 2081 BS Dashain & Tihar
  '2081-6-17': { nameEn: 'Ghatasthapana (Dashain Begins)', nameNp: 'घटस्थापना (बडा दशैं सुरु)', category: 'dashain', isPublicHoliday: true },
  '2081-6-24': { nameEn: 'Fulpati (Dashain Holiday)', nameNp: 'फूलपाती (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2081-6-25': { nameEn: 'Maha Ashtami (Dashain Holiday)', nameNp: 'महाअष्टमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2081-6-26': { nameEn: 'Maha Navami (Dashain Holiday)', nameNp: 'महानवमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2081-6-27': { nameEn: 'Vijaya Dashami (Main Dashain Tika)', nameNp: 'विजया दशमी (दशैं टीका)', category: 'dashain', isPublicHoliday: true },
  '2081-6-28': { nameEn: 'Ekadashi (Dashain Holiday)', nameNp: 'एकादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2081-6-29': { nameEn: 'Dwadashi (Dashain Holiday)', nameNp: 'द्वादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2081-6-30': { nameEn: 'Kojagrat Purnima', nameNp: 'कोजाग्रत पूर्णिमा', category: 'dashain', isPublicHoliday: false },
  '2081-7-14': { nameEn: 'Kaag Tihar (Tihar Begins)', nameNp: 'काग तिहार', category: 'tihar', isPublicHoliday: false },
  '2081-7-15': { nameEn: 'Kukur Tihar / Laxmi Puja (Tihar Holiday)', nameNp: 'कुकुर तिहार / लक्ष्मी पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2081-7-16': { nameEn: 'Gai Puja (Tihar Holiday)', nameNp: 'गाई पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2081-7-17': { nameEn: 'Govardhan Puja / Mha Puja (Tihar Holiday)', nameNp: 'गोवर्द्धन पूजा / म्ह पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2081-7-18': { nameEn: 'Bhai Tika (Main Tihar Holiday)', nameNp: 'भाइटीका / किजा पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2081-7-19': { nameEn: 'Tihar Holiday (Post Bhai Tika)', nameNp: 'तिहार सार्वजनिक बिदा', category: 'tihar', isPublicHoliday: true },
  '2081-7-22': { nameEn: 'Chhath Parva Holiday', nameNp: 'छठ पर्व बिदा', category: 'national', isPublicHoliday: true },

  // 2082 BS Dashain & Tihar
  '2082-6-6': { nameEn: 'Ghatasthapana (Dashain Begins)', nameNp: 'घटस्थापना (बडा दशैं सुरु)', category: 'dashain', isPublicHoliday: true },
  '2082-6-13': { nameEn: 'Fulpati (Dashain Holiday)', nameNp: 'फूलपाती (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2082-6-14': { nameEn: 'Maha Ashtami (Dashain Holiday)', nameNp: 'महाअष्टमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2082-6-15': { nameEn: 'Maha Navami (Dashain Holiday)', nameNp: 'महानवमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2082-6-16': { nameEn: 'Vijaya Dashami (Main Dashain Tika)', nameNp: 'विजया दशमी (दशैं टीका)', category: 'dashain', isPublicHoliday: true },
  '2082-6-17': { nameEn: 'Ekadashi (Dashain Holiday)', nameNp: 'एकादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2082-6-18': { nameEn: 'Dwadashi (Dashain Holiday)', nameNp: 'द्वादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2082-6-20': { nameEn: 'Kojagrat Purnima', nameNp: 'कोजाग्रत पूर्णिमा', category: 'dashain', isPublicHoliday: false },
  '2082-7-2': { nameEn: 'Kaag Tihar (Tihar Begins)', nameNp: 'काग तिहार', category: 'tihar', isPublicHoliday: false },
  '2082-7-3': { nameEn: 'Kukur Tihar / Laxmi Puja (Tihar Holiday)', nameNp: 'कुकुर तिहार / लक्ष्मी पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2082-7-4': { nameEn: 'Gai Tihar (Tihar Holiday)', nameNp: 'गाई तिहार (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2082-7-5': { nameEn: 'Govardhan Puja / Mha Puja (Tihar Holiday)', nameNp: 'गोवर्द्धन पूजा / म्ह पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2082-7-6': { nameEn: 'Bhai Tika (Main Tihar Holiday)', nameNp: 'भाइटीका / किजा पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2082-7-7': { nameEn: 'Tihar Holiday (Post Bhai Tika)', nameNp: 'तिहार सार्वजनिक बिदा', category: 'tihar', isPublicHoliday: true },
  '2082-7-10': { nameEn: 'Chhath Parva Holiday', nameNp: 'छठ पर्व बिदा', category: 'national', isPublicHoliday: true },

  // 2083 BS Dashain & Tihar (Current Year)
  '2083-6-25': { nameEn: 'Ghatasthapana (Dashain Begins)', nameNp: 'घटस्थापना (बडा दशैं सुरु)', category: 'dashain', isPublicHoliday: true },
  '2083-7-1': { nameEn: 'Fulpati (Dashain Holiday)', nameNp: 'फूलपाती (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2083-7-2': { nameEn: 'Maha Ashtami (Dashain Holiday)', nameNp: 'महाअष्टमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2083-7-3': { nameEn: 'Maha Navami (Dashain Holiday)', nameNp: 'महानवमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2083-7-4': { nameEn: 'Vijaya Dashami (Main Dashain Tika)', nameNp: 'विजया दशमी (दशैं टीका)', category: 'dashain', isPublicHoliday: true },
  '2083-7-5': { nameEn: 'Ekadashi (Dashain Holiday)', nameNp: 'एकादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2083-7-6': { nameEn: 'Dwadashi (Dashain Holiday)', nameNp: 'द्वादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2083-7-7': { nameEn: 'Trayodashi (Dashain Holiday)', nameNp: 'त्रयोदशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2083-7-9': { nameEn: 'Kojagrat Purnima', nameNp: 'कोजाग्रत पूर्णिमा', category: 'dashain', isPublicHoliday: false },
  '2083-7-21': { nameEn: 'Kaag Tihar (Tihar Begins)', nameNp: 'काग तिहार', category: 'tihar', isPublicHoliday: false },
  '2083-7-22': { nameEn: 'Kukur Tihar / Laxmi Puja (Tihar Holiday)', nameNp: 'कुकुर तिहार / लक्ष्मी पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2083-7-23': { nameEn: 'Gai Puja (Tihar Holiday)', nameNp: 'गाई पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2083-7-24': { nameEn: 'Govardhan Puja / Mha Puja (Tihar Holiday)', nameNp: 'गोवर्द्धन पूजा / म्ह पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2083-7-25': { nameEn: 'Bhai Tika (Main Tihar Holiday)', nameNp: 'भाइटीका / किजा पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2083-7-26': { nameEn: 'Tihar Holiday (Post Bhai Tika)', nameNp: 'तिहार सार्वजनिक बिदा', category: 'tihar', isPublicHoliday: true },
  '2083-7-29': { nameEn: 'Chhath Parva Holiday', nameNp: 'छठ पर्व बिदा', category: 'national', isPublicHoliday: true },

  // 2084 BS Dashain & Tihar
  '2084-6-14': { nameEn: 'Ghatasthapana (Dashain Begins)', nameNp: 'घटस्थापना (बडा दशैं सुरु)', category: 'dashain', isPublicHoliday: true },
  '2084-6-20': { nameEn: 'Fulpati (Dashain Holiday)', nameNp: 'फूलपाती (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2084-6-21': { nameEn: 'Maha Ashtami (Dashain Holiday)', nameNp: 'महाअष्टमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2084-6-22': { nameEn: 'Maha Navami (Dashain Holiday)', nameNp: 'महानवमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2084-6-23': { nameEn: 'Vijaya Dashami (Main Dashain Tika)', nameNp: 'विजया दशमी (दशैं टीका)', category: 'dashain', isPublicHoliday: true },
  '2084-6-24': { nameEn: 'Ekadashi (Dashain Holiday)', nameNp: 'एकादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2084-6-25': { nameEn: 'Dwadashi (Dashain Holiday)', nameNp: 'द्वादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true },
  '2084-6-28': { nameEn: 'Kojagrat Purnima', nameNp: 'कोजाग्रत पूर्णिमा', category: 'dashain', isPublicHoliday: false },
  '2084-7-11': { nameEn: 'Kaag Tihar (Tihar Begins)', nameNp: 'काग तिहार', category: 'tihar', isPublicHoliday: false },
  '2084-7-12': { nameEn: 'Kukur Tihar / Laxmi Puja (Tihar Holiday)', nameNp: 'कुकुर तिहार / लक्ष्मी पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2084-7-13': { nameEn: 'Govardhan Puja / Mha Puja (Tihar Holiday)', nameNp: 'गोवर्द्धन पूजा / म्ह पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2084-7-14': { nameEn: 'Bhai Tika (Main Tihar Holiday)', nameNp: 'भाइटीका / किजा पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true },
  '2084-7-15': { nameEn: 'Tihar Holiday (Post Bhai Tika)', nameNp: 'तिहार सार्वजनिक बिदा', category: 'tihar', isPublicHoliday: true },
};

// Recurring annual Nepali calendar holidays & fallback Dashain/Tihar dates (keyed by "M-D")
const RECURRING_BS_HOLIDAYS: Record<string, BsHolidayInfo> = {
  '1-1': { nameEn: 'Nepali New Year (Baishakh 1)', nameNp: 'नयाँ वर्ष (वैशाख १)', category: 'national', isPublicHoliday: true },
  '1-11': { nameEn: 'Loktantra Diwas', nameNp: 'लोकतन्त्र दिवस', category: 'national', isPublicHoliday: false },
  '1-18': { nameEn: 'International Labour Day', nameNp: 'अन्तर्राष्ट्रिय श्रमिक दिवस', category: 'national', isPublicHoliday: true },
  '2-15': { nameEn: 'Republic Day (Ganatantra Diwas)', nameNp: 'गणतन्त्र दिवस', category: 'national', isPublicHoliday: true },
  '3-15': { nameEn: 'National Paddy Day (Dahi Chiura)', nameNp: 'राष्ट्रिय धान दिवस', category: 'national', isPublicHoliday: false },
  '6-3': { nameEn: 'Constitution Day (National Day)', nameNp: 'संविधान दिवस (राष्ट्रिय दिवस)', category: 'national', isPublicHoliday: true },
  '9-15': { nameEn: 'Tamu Lhosar', nameNp: 'तमु ल्होसार', category: 'national', isPublicHoliday: true },
  '9-27': { nameEn: 'Prithvi Jayanti (National Unity Day)', nameNp: 'पृथ्वी जयन्ती (राष्ट्रिय एकता दिवस)', category: 'national', isPublicHoliday: true },
  '10-1': { nameEn: 'Maghe Sankranti / Maghi Parva', nameNp: 'माघे संक्रान्ति / माघी पर्व', category: 'national', isPublicHoliday: true },
  '10-16': { nameEn: 'Martyrs Day (Sahid Diwas)', nameNp: 'सहिद दिवस', category: 'national', isPublicHoliday: false },
  '11-7': { nameEn: 'National Democracy Day (Prajatantra Diwas)', nameNp: 'राष्ट्रिय प्रजातन्त्र दिवस', category: 'national', isPublicHoliday: true },
  '11-24': { nameEn: 'International Womens Day', nameNp: 'अन्तर्राष्ट्रिय नारी दिवस', category: 'national', isPublicHoliday: true },
};

function getBsHolidayInfo(bsYear: number, bsMonth: number, bsDay: number): BsHolidayInfo | null {
  const exactKey = `${bsYear}-${bsMonth}-${bsDay}`;
  if (YEAR_SPECIFIC_FESTIVALS[exactKey]) {
    return YEAR_SPECIFIC_FESTIVALS[exactKey];
  }
  const recurringKey = `${bsMonth}-${bsDay}`;
  if (RECURRING_BS_HOLIDAYS[recurringKey]) {
    return RECURRING_BS_HOLIDAYS[recurringKey];
  }
  // For years outside 2081-2084, provide standard Ashwin Dashain & Kartik Tihar schedule so every year displays Dashain & Tihar holidays
  if (bsYear < 2081 || bsYear > 2084) {
    if (bsMonth === 6) {
      if (bsDay === 15) return { nameEn: 'Ghatasthapana (Dashain Begins)', nameNp: 'घटस्थापना (बडा दशैं सुरु)', category: 'dashain', isPublicHoliday: true };
      if (bsDay === 21) return { nameEn: 'Fulpati (Dashain Holiday)', nameNp: 'फूलपाती (दशैं बिदा)', category: 'dashain', isPublicHoliday: true };
      if (bsDay === 22) return { nameEn: 'Maha Ashtami (Dashain Holiday)', nameNp: 'महाअष्टमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true };
      if (bsDay === 23) return { nameEn: 'Maha Navami (Dashain Holiday)', nameNp: 'महानवमी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true };
      if (bsDay === 24) return { nameEn: 'Vijaya Dashami (Main Dashain Tika)', nameNp: 'विजया दशमी (दशैं टीका)', category: 'dashain', isPublicHoliday: true };
      if (bsDay === 25) return { nameEn: 'Ekadashi (Dashain Holiday)', nameNp: 'एकादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true };
      if (bsDay === 26) return { nameEn: 'Dwadashi (Dashain Holiday)', nameNp: 'द्वादशी (दशैं बिदा)', category: 'dashain', isPublicHoliday: true };
      if (bsDay === 29) return { nameEn: 'Kojagrat Purnima', nameNp: 'कोजाग्रत पूर्णिमा', category: 'dashain', isPublicHoliday: false };
    }
    if (bsMonth === 7) {
      if (bsDay === 13) return { nameEn: 'Kaag Tihar (Tihar Begins)', nameNp: 'काग तिहार', category: 'tihar', isPublicHoliday: false };
      if (bsDay === 14) return { nameEn: 'Kukur Tihar / Laxmi Puja (Tihar Holiday)', nameNp: 'कुकुर तिहार / लक्ष्मी पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true };
      if (bsDay === 15) return { nameEn: 'Gai Puja (Tihar Holiday)', nameNp: 'गाई पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true };
      if (bsDay === 16) return { nameEn: 'Govardhan Puja / Mha Puja (Tihar Holiday)', nameNp: 'गोवर्द्धन पूजा / म्ह पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true };
      if (bsDay === 17) return { nameEn: 'Bhai Tika (Main Tihar Holiday)', nameNp: 'भाइटीका / किजा पूजा (तिहार बिदा)', category: 'tihar', isPublicHoliday: true };
      if (bsDay === 18) return { nameEn: 'Tihar Holiday (Post Bhai Tika)', nameNp: 'तिहार सार्वजनिक बिदा', category: 'tihar', isPublicHoliday: true };
    }
  }
  return null;
}

// Convert BS (year, month 1-12, day 1-32) -> AD Date object
function convertBsToAd(bsYear: number, bsMonth: number, bsDay: number): {
  adYear: number;
  adMonth: number;
  adDay: number;
  dayOfWeek: number;
  isoDate: string;
} {
  let totalDays = 0;
  for (let y = 2000; y < bsYear; y++) {
    const months = BS_CALENDAR_DATA[y] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    for (let m = 0; m < 12; m++) {
      totalDays += months[m];
    }
  }
  const currentYearMonths = BS_CALENDAR_DATA[bsYear] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
  for (let m = 0; m < bsMonth - 1; m++) {
    totalDays += currentYearMonths[m];
  }
  totalDays += bsDay - 1;

  // Base date: 1943-04-14 UTC
  const baseUtc = Date.UTC(1943, 3, 14);
  const targetUtc = baseUtc + totalDays * 86400000;
  const dt = new Date(targetUtc);

  const adYear = dt.getUTCFullYear();
  const adMonth = dt.getUTCMonth() + 1;
  const adDay = dt.getUTCDate();
  const dayOfWeek = dt.getUTCDay();
  const isoDate = `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`;

  return { adYear, adMonth, adDay, dayOfWeek, isoDate };
}

// Convert AD (year, month 1-12, day 1-31) -> BS Date
function convertAdToBs(adYear: number, adMonth: number, adDay: number): {
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  dayOfWeek: number;
  valid: boolean;
} {
  const baseUtc = Date.UTC(1943, 3, 14);
  const targetUtc = Date.UTC(adYear, adMonth - 1, adDay);
  let diffDays = Math.floor((targetUtc - baseUtc) / 86400000);
  const dayOfWeek = new Date(targetUtc).getUTCDay();

  if (diffDays < 0) {
    return { bsYear: 2000, bsMonth: 1, bsDay: 1, dayOfWeek, valid: false };
  }

  let bsYear = 2000;
  let bsMonth = 1;
  let bsDay = 1;

  while (bsYear <= 2099) {
    const months = BS_CALENDAR_DATA[bsYear];
    if (!months) break;
    const yearDays = months.reduce((a, b) => a + b, 0);
    if (diffDays >= yearDays) {
      diffDays -= yearDays;
      bsYear++;
    } else {
      for (let m = 0; m < 12; m++) {
        if (diffDays >= months[m]) {
          diffDays -= months[m];
        } else {
          bsMonth = m + 1;
          bsDay = diffDays + 1;
          return { bsYear, bsMonth, bsDay, dayOfWeek, valid: true };
        }
      }
      break;
    }
  }

  return { bsYear: 2099, bsMonth: 12, bsDay: 30, dayOfWeek, valid: false };
}

export const SmartServicesModal: React.FC<SmartServicesModalProps> = ({
  isOpen,
  initialTab,
  lang,
  onLanguageChange,
  cmsSettings,
  exchangeRates,
  onClose,
  onJumpToEmiSection,
}) => {
  const [activeTab, setActiveTab] = useState<'date-converter' | 'exchange-rates' | 'emi-calculator'>(initialTab);

  // Sync when initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Compute today's live AD & BS date
  const todayInfo = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const bs = convertAdToBs(y, m, d);
    return {
      adYear: y,
      adMonth: m,
      adDay: d,
      bsYear: bs.bsYear,
      bsMonth: bs.bsMonth,
      bsDay: bs.bsDay,
      dayOfWeek: bs.dayOfWeek,
    };
  }, []);

  // Date Converter state
  const [conversionMode, setConversionMode] = useState<'bs-to-ad' | 'ad-to-bs'>('bs-to-ad');
  const [bsYear, setBsYear] = useState<number>(todayInfo.bsYear);
  const [bsMonth, setBsMonth] = useState<number>(todayInfo.bsMonth);
  const [bsDay, setBsDay] = useState<number>(todayInfo.bsDay);

  const [adYear, setAdYear] = useState<number>(todayInfo.adYear);
  const [adMonth, setAdMonth] = useState<number>(todayInfo.adMonth);
  const [adDay, setAdDay] = useState<number>(todayInfo.adDay);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Max days in selected BS year/month
  const maxBsDays = useMemo(() => {
    const mArr = BS_CALENDAR_DATA[bsYear];
    return mArr ? mArr[bsMonth - 1] : 30;
  }, [bsYear, bsMonth]);

  // Max days in selected AD year/month
  const maxAdDays = useMemo(() => {
    return new Date(adYear, adMonth, 0).getDate();
  }, [adYear, adMonth]);

  // Clamp bsDay and adDay when month changes
  React.useEffect(() => {
    if (bsDay > maxBsDays) setBsDay(maxBsDays);
  }, [maxBsDays, bsDay]);

  React.useEffect(() => {
    if (adDay > maxAdDays) setAdDay(maxAdDays);
  }, [maxAdDays, adDay]);

  // Converted Result
  const bsToAdResult = useMemo(() => {
    return convertBsToAd(bsYear, bsMonth, Math.min(bsDay, maxBsDays));
  }, [bsYear, bsMonth, bsDay, maxBsDays]);

  const adToBsResult = useMemo(() => {
    return convertAdToBs(adYear, adMonth, Math.min(adDay, maxAdDays));
  }, [adYear, adMonth, adDay, maxAdDays]);

  // Active BS Year & Month for the Monthly Calendar Grid in Full Window
  const activeCalendarBsYear = conversionMode === 'bs-to-ad' ? bsYear : adToBsResult.bsYear;
  const activeCalendarBsMonth = conversionMode === 'bs-to-ad' ? bsMonth : adToBsResult.bsMonth;
  const activeCalendarBsDay = conversionMode === 'bs-to-ad' ? Math.min(bsDay, maxBsDays) : adToBsResult.bsDay;

  const calendarDaysGrid = useMemo(() => {
    const monthDays = (BS_CALENDAR_DATA[activeCalendarBsYear] || [])[activeCalendarBsMonth - 1] || 30;
    const firstDayAd = convertBsToAd(activeCalendarBsYear, activeCalendarBsMonth, 1);
    const startWeekday = firstDayAd.dayOfWeek; // 0 = Sun ... 6 = Sat
    const cells: Array<{
      bsDay: number;
      adYear: number;
      adMonth: number;
      adDay: number;
      dayOfWeek: number;
      isoDate: string;
      holiday: BsHolidayInfo | null;
    } | null> = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= monthDays; d++) {
      const conv = convertBsToAd(activeCalendarBsYear, activeCalendarBsMonth, d);
      const holiday = getBsHolidayInfo(activeCalendarBsYear, activeCalendarBsMonth, d);
      cells.push({
        bsDay: d,
        ...conv,
        holiday,
      });
    }
    return cells;
  }, [activeCalendarBsYear, activeCalendarBsMonth]);

  const activeSelectedHoliday = useMemo(() => {
    return getBsHolidayInfo(activeCalendarBsYear, activeCalendarBsMonth, activeCalendarBsDay);
  }, [activeCalendarBsYear, activeCalendarBsMonth, activeCalendarBsDay]);

  const activeMonthHolidays = useMemo(() => {
    return calendarDaysGrid.filter((c): c is NonNullable<typeof c> => Boolean(c && c.holiday));
  }, [calendarDaysGrid]);

  // All Dashain & Tihar holidays for the active BS year
  const activeYearDashainTihar = useMemo(() => {
    const list: Array<{
      bsMonth: number;
      bsDay: number;
      adMonth: number;
      adDay: number;
      adYear: number;
      holiday: BsHolidayInfo;
    }> = [];
    for (const m of [6, 7]) {
      const daysInM = (BS_CALENDAR_DATA[activeCalendarBsYear] || [])[m - 1] || 30;
      for (let d = 1; d <= daysInM; d++) {
        const h = getBsHolidayInfo(activeCalendarBsYear, m, d);
        if (h && (h.category === 'dashain' || h.category === 'tihar')) {
          const conv = convertBsToAd(activeCalendarBsYear, m, d);
          list.push({
            bsMonth: m,
            bsDay: d,
            adMonth: conv.adMonth,
            adDay: conv.adDay,
            adYear: conv.adYear,
            holiday: h,
          });
        }
      }
    }
    return list;
  }, [activeCalendarBsYear]);

  // Exchange Rate Converter State
  const activeRates = useMemo(() => {
    const list = (exchangeRates || []).filter((r) => r.isEnabled !== false);
    // Ensure INR is always present and fixed per NRB
    const hasInr = list.some((r) => r.currencyCode.toUpperCase() === 'INR');
    if (!hasInr) {
      return [
        {
          id: 'fx-inr',
          currencyCode: 'INR',
          currencyNameEn: 'Indian Rupee',
          currencyNameNp: 'भारतीय रूपैयाँ',
          flag: '🇮🇳',
          unit: 100,
          buyingRate: '160.00',
          sellingRate: '160.15',
          isFixed: true,
          isEnabled: true,
        },
        ...list,
      ];
    }
    return list.map((r) =>
      r.currencyCode.toUpperCase() === 'INR'
        ? { ...r, unit: 100, buyingRate: '160.00', sellingRate: '160.15', isFixed: true }
        : r
    );
  }, [exchangeRates]);

  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [fxAmount, setFxAmount] = useState<string>('100');
  const [fxDirection, setFxDirection] = useState<'fc-to-npr' | 'npr-to-fc'>('fc-to-npr');
  const [fxRateType, setFxRateType] = useState<'buying' | 'selling'>('buying');

  const selectedRateObj = useMemo(() => {
    return (
      activeRates.find((r) => r.currencyCode === selectedCurrency) ||
      activeRates[0]
    );
  }, [activeRates, selectedCurrency]);

  const fxConvertedValue = useMemo(() => {
    if (!selectedRateObj) return '0.00';
    const amt = parseFloat(fxAmount) || 0;
    const rate =
      fxRateType === 'buying'
        ? parseFloat(selectedRateObj.buyingRate) || 0
        : parseFloat(selectedRateObj.sellingRate) || 0;
    const unit = selectedRateObj.unit || 1;
    if (rate <= 0 || unit <= 0) return '0.00';

    if (fxDirection === 'fc-to-npr') {
      return ((amt / unit) * rate).toFixed(2);
    } else {
      return ((amt / rate) * unit).toFixed(2);
    }
  }, [selectedRateObj, fxAmount, fxDirection, fxRateType]);

  // Quick EMI Calculator inside Smart Services Modal
  const [emiPrincipal, setEmiPrincipal] = useState<number>(500000);
  const [emiRate, setEmiRate] = useState<number>(12.0);
  const [emiMonths, setEmiMonths] = useState<number>(36);

  const emiSummary = useMemo(() => {
    const p = Math.max(0, emiPrincipal);
    const r = Math.max(0.1, emiRate) / 12 / 100;
    const n = Math.max(1, emiMonths);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - p;
    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
    };
  }, [emiPrincipal, emiRate, emiMonths]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const coopName =
    lang === 'np'
      ? cmsSettings?.coopNameNp || 'अंकुर बचत तथा ऋण सहकारी संस्था लि.'
      : cmsSettings?.coopNameEn || 'Ankur Saving & Credit Cooperative Ltd.';
  const coopLogo = cmsSettings?.coopLogoUrl || '/uploads/logos/ekata-logo-default.svg';

  return (
    <div className="fixed inset-0 z-[1500] bg-[#f8fafc] flex flex-col overflow-y-auto font-sans animate-fadeIn">
      {/* Full-Window Sticky Top Navigation Bar */}
      <div className="bg-[#052636] text-white border-b border-sky-800/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={coopLogo}
              alt={coopName}
              className="w-10 h-10 rounded-xl bg-white p-1 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/uploads/logos/ekata-logo-default.svg';
              }}
            />
            <div className="truncate">
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                {coopName}
              </div>
              <div className="text-[11px] text-sky-300 font-medium truncate">
                {lang === 'np'
                  ? 'डिजिटल तथा स्मार्ट सेवा पोर्टल • २४/७ अनलाइन सेवा'
                  : 'Digital & Smart Services Portal • 24/7 Online Utility'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onLanguageChange && (
              <div className="inline-flex rounded-xl bg-white/10 p-0.5 border border-white/15">
                <button
                  type="button"
                  onClick={() => onLanguageChange('np')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lang === 'np' ? 'bg-white text-sky-950' : 'text-sky-100 hover:text-white'
                  }`}
                >
                  नेपाली
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lang === 'en' ? 'bg-white text-sky-950' : 'text-sky-100 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2"
            >
              <span>←</span>
              <span>{lang === 'np' ? 'मुख्य पृष्ठमा फर्कनुहोस्' : 'Back to Website'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#072f42] via-[#0981ae] to-[#07678d] text-white border-b border-sky-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-sky-200 tracking-wide uppercase flex items-center gap-2">
                <span>{lang === 'np' ? 'गृहपृष्ठ' : 'Home'}</span>
                <span>/</span>
                <span>{lang === 'np' ? 'डिजिटल सेवा' : 'Digital Services'}</span>
                <span>/</span>
                <span className="text-white font-bold">
                  {activeTab === 'date-converter'
                    ? lang === 'np'
                      ? 'मिति रूपान्तरण (AD ↔ B.S)'
                      : 'Date Converter (AD ↔ B.S)'
                    : activeTab === 'exchange-rates'
                    ? lang === 'np'
                      ? 'विदेशी विनिमय दर'
                      : 'Exchange Rates'
                    : lang === 'np'
                    ? 'ईएमआई क्याल्कुलेटर'
                    : 'EMI Calculator'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1.5 flex items-center gap-3">
                {activeTab === 'date-converter' && (
                  <>
                    <span>📅</span>
                    <span>
                      {lang === 'np'
                        ? 'नेपाली मिति रूपान्तरण तथा पात्रो (B.S. ↔ A.D. Date Converter)'
                        : 'Nepali Date Converter & Reference Calendar (B.S. ↔ A.D.)'}
                    </span>
                  </>
                )}
                {activeTab === 'exchange-rates' && (
                  <>
                    <span>💱</span>
                    <span>
                      {lang === 'np'
                        ? 'विदेशी विनिमय दर तथा मुद्रा क्याल्कुलेटर (NRB Foreign Exchange Rates)'
                        : 'Foreign Exchange Rates & Currency Converter (NRB Forex)'}
                    </span>
                  </>
                )}
                {activeTab === 'emi-calculator' && (
                  <>
                    <span>🧮</span>
                    <span>
                      {lang === 'np'
                        ? 'कर्जा किस्ता (EMI) क्याल्कुलेटर'
                        : 'Cooperative Loan EMI Calculator'}
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Today's Live Date Indicator */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl px-4 py-3 text-xs sm:text-sm self-start lg:self-center">
              <div className="text-sky-200 font-semibold text-[11px] uppercase tracking-wider">
                {lang === 'np' ? 'आजको आधिकारिक मिति (Today)' : "Today's Official Date"}
              </div>
              <div className="font-extrabold text-white mt-0.5">
                🇳🇵 {toNepaliNum(todayInfo.bsYear)} {BS_MONTHS_NP[todayInfo.bsMonth - 1]}{' '}
                {toNepaliNum(todayInfo.bsDay)}, {WEEKDAYS_NP[todayInfo.dayOfWeek]}
              </div>
              <div className="text-sky-100 text-xs">
                🌍 {AD_MONTHS_EN[todayInfo.adMonth - 1]} {todayInfo.adDay}, {todayInfo.adYear} A.D. ({WEEKDAYS_EN[todayInfo.dayOfWeek]})
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar inside Full-Window Banner */}
          <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('date-converter')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'date-converter'
                  ? 'bg-white text-[#072f42] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <span>📅</span>
              <span>{lang === 'np' ? 'मिति रूपान्तरण (AD ↔ B.S)' : 'Date Converter (AD ↔ B.S)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exchange-rates')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'exchange-rates'
                  ? 'bg-white text-[#072f42] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <span>💱</span>
              <span>{lang === 'np' ? 'विदेशी विनिमय दर (Exchange Rates)' : 'Exchange Rates'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('emi-calculator')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'emi-calculator'
                  ? 'bg-white text-[#072f42] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <span>🧮</span>
              <span>{lang === 'np' ? 'ईएमआई क्याल्कुलेटर (EMI Calculator)' : 'EMI Calculator'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Window Content Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ==================== TAB 1: DATE CONVERTER (BS <-> AD) ==================== */}
        {activeTab === 'date-converter' && (
          <div className="space-y-8">
            {/* Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sky-50/90 border border-sky-200 rounded-2xl p-5 shadow-xs">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {lang === 'np'
                    ? 'विक्रम सम्वत् (B.S.) र इस्वी सम्वत् (A.D.) मिति रूपान्तरण'
                    : 'Instant Bidirectional B.S. ↔ A.D. Date Conversion'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {lang === 'np'
                    ? 'वि.सं. २००० देखि २०९९ सम्म (सन् १९४३ देखि २०४३ सम्म) को आधिकारिक पात्रोमा आधारित'
                    : 'Supports official Nepali calendar dates from 2000 B.S. to 2099 B.S. (1943 A.D. – 2043 A.D.)'}
                </p>
              </div>

              <div className="inline-flex p-1.5 bg-white rounded-xl border border-sky-200 self-start shadow-2xs">
                <button
                  type="button"
                  onClick={() => setConversionMode('bs-to-ad')}
                  className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                    conversionMode === 'bs-to-ad'
                      ? 'bg-[#0981ae] text-white shadow-xs'
                      : 'text-slate-700 hover:text-sky-800'
                  }`}
                >
                  🇳🇵 {lang === 'np' ? 'वि.सं. (BS) ➔ इ.सं. (AD)' : 'B.S. to A.D. (वि.सं. ➔ इ.सं.)'}
                </button>
                <button
                  type="button"
                  onClick={() => setConversionMode('ad-to-bs')}
                  className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                    conversionMode === 'ad-to-bs'
                      ? 'bg-[#0981ae] text-white shadow-xs'
                      : 'text-slate-700 hover:text-sky-800'
                  }`}
                >
                  🌍 {lang === 'np' ? 'इ.सं. (AD) ➔ वि.सं. (BS)' : 'A.D. to B.S. (इ.सं. ➔ वि.सं.)'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Input Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                {conversionMode === 'bs-to-ad' ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-semibold text-sky-700">
                          {lang === 'np' ? 'नेपाली मिति छान्नुहोस्' : 'Input Nepali Date (Bikram Sambat)'}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900">
                          {lang === 'np' ? 'विक्रम सम्वत् (B.S.) मिति' : 'Select B.S. Year, Month & Day'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBsYear(todayInfo.bsYear);
                          setBsMonth(todayInfo.bsMonth);
                          setBsDay(todayInfo.bsDay);
                        }}
                        className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                      >
                        {lang === 'np' ? 'आजको मिति' : 'Reset to Today'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'np' ? 'वर्ष (BS Year)' : 'BS Year (वर्ष)'}
                        </label>
                        <select
                          value={bsYear}
                          onChange={(e) => setBsYear(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
                        >
                          {Object.keys(BS_CALENDAR_DATA).map((yStr) => {
                            const y = Number(yStr);
                            return (
                              <option key={y} value={y}>
                                {y} B.S. ({toNepaliNum(y)})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'np' ? 'महिना (BS Month)' : 'BS Month (महिना)'}
                        </label>
                        <select
                          value={bsMonth}
                          onChange={(e) => setBsMonth(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
                        >
                          {BS_MONTHS_EN.map((mName, idx) => (
                            <option key={mName} value={idx + 1}>
                              {idx + 1}. {BS_MONTHS_NP[idx]} ({mName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'np' ? 'गते (BS Day)' : 'BS Day (गते)'}
                        </label>
                        <select
                          value={Math.min(bsDay, maxBsDays)}
                          onChange={(e) => setBsDay(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
                        >
                          {Array.from({ length: maxBsDays }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              {d} ({toNepaliNum(d)} गते)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-slate-500">
                      {lang === 'np'
                        ? `चुनिएको महिनामा जम्मा ${toNepaliNum(maxBsDays)} दिन रहेका छन्।`
                        : `${BS_MONTHS_EN[bsMonth - 1]} ${bsYear} B.S. has ${maxBsDays} days in total.`}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-semibold text-sky-700">
                          {lang === 'np' ? 'अंग्रेजी मिति छान्नुहोस्' : 'Input English Date (Gregorian A.D.)'}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900">
                          {lang === 'np' ? 'इस्वी सम्वत् (A.D.) मिति' : 'Select A.D. Year, Month & Day'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdYear(todayInfo.adYear);
                          setAdMonth(todayInfo.adMonth);
                          setAdDay(todayInfo.adDay);
                        }}
                        className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                      >
                        {lang === 'np' ? 'आजको मिति' : 'Reset to Today'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'np' ? 'वर्ष (AD Year)' : 'AD Year'}
                        </label>
                        <select
                          value={adYear}
                          onChange={(e) => setAdYear(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
                        >
                          {Array.from({ length: 100 }, (_, i) => 1944 + i).map((y) => (
                            <option key={y} value={y}>
                              {y} A.D.
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'np' ? 'महिना (AD Month)' : 'AD Month'}
                        </label>
                        <select
                          value={adMonth}
                          onChange={(e) => setAdMonth(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
                        >
                          {AD_MONTHS_EN.map((mName, idx) => (
                            <option key={mName} value={idx + 1}>
                              {idx + 1}. {mName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {lang === 'np' ? 'तारिख (AD Day)' : 'AD Day'}
                        </label>
                        <select
                          value={Math.min(adDay, maxAdDays)}
                          onChange={(e) => setAdDay(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm font-semibold text-slate-900 focus:border-sky-600 focus:outline-none"
                        >
                          {Array.from({ length: maxAdDays }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {lang === 'np' ? 'वा सिधै क्यालेन्डरबाट छान्नुहोस्:' : 'Or pick directly from calendar:'}
                      </label>
                      <input
                        type="date"
                        min="1944-01-01"
                        max="2043-04-13"
                        value={`${adYear}-${String(adMonth).padStart(2, '0')}-${String(Math.min(adDay, maxAdDays)).padStart(2, '0')}`}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const parts = e.target.value.split('-').map(Number);
                          if (parts.length === 3 && parts[0] >= 1944 && parts[0] <= 2043) {
                            setAdYear(parts[0]);
                            setAdMonth(parts[1]);
                            setAdDay(parts[2]);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Preset Dates */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">
                    {lang === 'np' ? 'द्रुत मिति र चाडपर्व:' : 'Quick Presets & Festivals:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      setBsYear(2057);
                      setBsMonth(1);
                      setBsDay(15);
                    }}
                    className="text-sky-700 hover:underline font-semibold cursor-pointer"
                  >
                    {lang === 'np' ? 'संस्था स्थापना (२०५७ वैशाख १५)' : 'Coop Estd. (2057 Baishakh 15)'}
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      setBsYear(todayInfo.bsYear);
                      setBsMonth(todayInfo.bsMonth);
                      setBsDay(todayInfo.bsDay);
                    }}
                    className="text-sky-700 hover:underline font-semibold cursor-pointer"
                  >
                    {lang === 'np' ? 'आजको मिति' : 'Today'}
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      const targetYear = activeCalendarBsYear || todayInfo.bsYear;
                      setBsYear(targetYear);
                      if (targetYear === 2083) {
                        setBsMonth(7);
                        setBsDay(4);
                      } else if (targetYear === 2082) {
                        setBsMonth(6);
                        setBsDay(16);
                      } else if (targetYear === 2081) {
                        setBsMonth(6);
                        setBsDay(27);
                      } else {
                        setBsMonth(6);
                        setBsDay(24);
                      }
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold cursor-pointer"
                  >
                    🌺 {lang === 'np' ? 'बडा दशैं टीका (Vijaya Dashami)' : 'Dashain Tika (बडा दशैं)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      const targetYear = activeCalendarBsYear || todayInfo.bsYear;
                      setBsYear(targetYear);
                      if (targetYear === 2083) {
                        setBsMonth(7);
                        setBsDay(25);
                      } else if (targetYear === 2082) {
                        setBsMonth(7);
                        setBsDay(6);
                      } else if (targetYear === 2081) {
                        setBsMonth(7);
                        setBsDay(18);
                      } else {
                        setBsMonth(7);
                        setBsDay(17);
                      }
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold cursor-pointer"
                  >
                    🪔 {lang === 'np' ? 'शुभ तिहार भाइटीका (Bhai Tika)' : 'Tihar Bhai Tika (शुभ तिहार)'}
                  </button>
                </div>
              </div>

              {/* Result Panel */}
              <div className="bg-gradient-to-br from-[#072f42] to-[#0981ae] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
                {conversionMode === 'bs-to-ad' ? (
                  <>
                    <div>
                      <div className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
                        {lang === 'np'
                          ? 'रूपान्तरित इस्वी सम्वत् (A.D.) मिति'
                          : 'Converted English Date (Gregorian A.D.)'}
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">
                        {AD_MONTHS_EN[bsToAdResult.adMonth - 1]} {bsToAdResult.adDay}, {bsToAdResult.adYear} A.D.
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-sky-100 mt-1">
                        {WEEKDAYS_EN[bsToAdResult.dayOfWeek]} ({WEEKDAYS_NP[bsToAdResult.dayOfWeek]})
                      </div>

                      {activeSelectedHoliday && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600/90 border border-red-300/50 text-white text-xs sm:text-sm font-bold shadow-xs">
                          <span>{activeSelectedHoliday.category === 'dashain' ? '🌺' : activeSelectedHoliday.category === 'tihar' ? '🪔' : '🇳🇵'}</span>
                          <span>
                            {lang === 'np'
                              ? `${activeSelectedHoliday.nameNp} (${activeSelectedHoliday.nameEn})`
                              : `${activeSelectedHoliday.nameEn} (${activeSelectedHoliday.nameNp})`}
                          </span>
                        </div>
                      )}

                      <div className="mt-6 pt-5 border-t border-white/15 space-y-2.5 text-xs sm:text-sm text-sky-50">
                        <div className="flex justify-between">
                          <span className="text-sky-200">{lang === 'np' ? 'नेपाली मिति (B.S.):' : 'Nepali Date (B.S.):'}</span>
                          <strong className="font-mono tabular-nums">
                            {toNepaliNum(bsYear)} {BS_MONTHS_NP[bsMonth - 1]} {toNepaliNum(Math.min(bsDay, maxBsDays))} गते ({bsYear}-{String(bsMonth).padStart(2, '0')}-{String(Math.min(bsDay, maxBsDays)).padStart(2, '0')})
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-200">{lang === 'np' ? 'अंग्रेजी मिति (ISO):' : 'ISO Standard Format:'}</span>
                          <strong className="font-mono tabular-nums">{bsToAdResult.isoDate}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/15">
                      <span className="text-xs text-sky-200">
                        {copiedText ? (lang === 'np' ? '✓ कपी गरियो!' : '✓ Copied to clipboard!') : (lang === 'np' ? 'आधिकारिक eKYM तथा बैंकिङ फारामका लागि उपयुक्त' : 'Ready for eKYM & official banking forms')}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `${AD_MONTHS_EN[bsToAdResult.adMonth - 1]} ${bsToAdResult.adDay}, ${bsToAdResult.adYear} (${bsToAdResult.isoDate})`
                          )
                        }
                        className="bg-white text-sky-900 hover:bg-sky-50 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        📋 {lang === 'np' ? 'मिति कपी गर्नुहोस्' : 'Copy Converted Date'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
                        {lang === 'np'
                          ? 'रूपान्तरित विक्रम सम्वत् (B.S.) नेपाली मिति'
                          : 'Converted Nepali Date (Bikram Sambat B.S.)'}
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">
                        {toNepaliNum(adToBsResult.bsYear)} {BS_MONTHS_NP[adToBsResult.bsMonth - 1]}{' '}
                        {toNepaliNum(adToBsResult.bsDay)} गते
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-sky-100 mt-1">
                        {BS_MONTHS_EN[adToBsResult.bsMonth - 1]} {adToBsResult.bsDay}, {adToBsResult.bsYear} B.S. •{' '}
                        {WEEKDAYS_NP[adToBsResult.dayOfWeek]} ({WEEKDAYS_EN[adToBsResult.dayOfWeek]})
                      </div>

                      {activeSelectedHoliday && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600/90 border border-red-300/50 text-white text-xs sm:text-sm font-bold shadow-xs">
                          <span>{activeSelectedHoliday.category === 'dashain' ? '🌺' : activeSelectedHoliday.category === 'tihar' ? '🪔' : '🇳🇵'}</span>
                          <span>
                            {lang === 'np'
                              ? `${activeSelectedHoliday.nameNp} (${activeSelectedHoliday.nameEn})`
                              : `${activeSelectedHoliday.nameEn} (${activeSelectedHoliday.nameNp})`}
                          </span>
                        </div>
                      )}

                      <div className="mt-6 pt-5 border-t border-white/15 space-y-2.5 text-xs sm:text-sm text-sky-50">
                        <div className="flex justify-between">
                          <span className="text-sky-200">{lang === 'np' ? 'मानक वि.सं. ढाँचा:' : 'Standard BS Format:'}</span>
                          <strong className="font-mono tabular-nums">
                            {adToBsResult.bsYear}-{String(adToBsResult.bsMonth).padStart(2, '0')}-{String(adToBsResult.bsDay).padStart(2, '0')} B.S.
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-200">{lang === 'np' ? 'अंग्रेजी मिति (A.D.):' : 'Input English Date:'}</span>
                          <strong className="font-mono tabular-nums">
                            {AD_MONTHS_EN[adMonth - 1]} {Math.min(adDay, maxAdDays)}, {adYear} A.D.
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/15">
                      <span className="text-xs text-sky-200">
                        {copiedText ? (lang === 'np' ? '✓ कपी गरियो!' : '✓ Copied to clipboard!') : (lang === 'np' ? 'आधिकारिक eKYM तथा बैंकिङ फारामका लागि उपयुक्त' : 'Ready for eKYM & official banking forms')}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `${toNepaliNum(adToBsResult.bsYear)} ${BS_MONTHS_NP[adToBsResult.bsMonth - 1]} ${toNepaliNum(adToBsResult.bsDay)} (${adToBsResult.bsYear}-${String(adToBsResult.bsMonth).padStart(2, '0')}-${String(adToBsResult.bsDay).padStart(2, '0')} BS)`
                          )
                        }
                        className="bg-white text-sky-900 hover:bg-sky-50 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        📋 {lang === 'np' ? 'मिति कपी गर्नुहोस्' : 'Copy Converted Date'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Full-Window Monthly BS <-> AD Calendar Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    🗓️{' '}
                    {lang === 'np'
                      ? `${toNepaliNum(activeCalendarBsYear)} ${BS_MONTHS_NP[activeCalendarBsMonth - 1]} महिनाको पात्रो (${BS_MONTHS_EN[activeCalendarBsMonth - 1]} ${activeCalendarBsYear} B.S.)`
                      : `${BS_MONTHS_EN[activeCalendarBsMonth - 1]} ${activeCalendarBsYear} B.S. Monthly Calendar Grid`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'np'
                      ? 'बडा दशैं, तिहार र सार्वजनिक बिदाहरू रातो रङमा चिन्हित गरिएका छन्'
                      : 'Dashain, Tihar, and official public holidays are highlighted in red'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      setBsMonth(activeCalendarBsYear === 2083 ? 7 : 6);
                      setBsDay(activeCalendarBsYear === 2083 ? 4 : activeCalendarBsYear === 2082 ? 16 : 27);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold cursor-pointer"
                  >
                    🌺 {lang === 'np' ? 'दशैं बिदा' : 'Dashain'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      setBsMonth(7);
                      setBsDay(activeCalendarBsYear === 2083 ? 25 : activeCalendarBsYear === 2082 ? 6 : 18);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold cursor-pointer"
                  >
                    🪔 {lang === 'np' ? 'तिहार बिदा' : 'Tihar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      if (bsMonth === 1) {
                        if (bsYear > 2000) {
                          setBsYear(bsYear - 1);
                          setBsMonth(12);
                        }
                      } else {
                        setBsMonth(bsMonth - 1);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    ← {lang === 'np' ? 'अघिल्लो महिना' : 'Prev Month'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConversionMode('bs-to-ad');
                      if (bsMonth === 12) {
                        if (bsYear < 2099) {
                          setBsYear(bsYear + 1);
                          setBsMonth(1);
                        }
                      } else {
                        setBsMonth(bsMonth + 1);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    {lang === 'np' ? 'अर्को महिना' : 'Next Month'} →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2">
                {WEEKDAYS_EN.map((wEn, idx) => (
                  <div
                    key={wEn}
                    className={`py-2 rounded-lg text-xs font-bold ${
                      idx === 6 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>{lang === 'np' ? WEEKDAYS_NP[idx] : wEn.slice(0, 3)}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarDaysGrid.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/50" />;
                  }
                  const isSelected = cell.bsDay === activeCalendarBsDay;
                  const isSaturday = cell.dayOfWeek === 6;
                  const isHoliday = Boolean(cell.holiday);
                  return (
                    <button
                      key={cell.bsDay}
                      type="button"
                      onClick={() => {
                        setConversionMode('bs-to-ad');
                        setBsYear(activeCalendarBsYear);
                        setBsMonth(activeCalendarBsMonth);
                        setBsDay(cell.bsDay);
                      }}
                      title={
                        cell.holiday
                          ? `${cell.holiday.nameNp} (${cell.holiday.nameEn})`
                          : undefined
                      }
                      className={`h-16 sm:h-20 rounded-xl p-1.5 sm:p-2 border text-left flex flex-col justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0981ae] text-white border-[#0981ae] shadow-sm'
                          : isHoliday || isSaturday
                          ? 'bg-red-50/60 border-red-200 hover:border-red-400 text-red-700'
                          : 'bg-white border-slate-200 hover:border-sky-500 text-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full gap-1">
                        <span className="text-sm sm:text-base font-extrabold leading-none">
                          {lang === 'np' ? toNepaliNum(cell.bsDay) : cell.bsDay}
                        </span>
                        <span
                          className={`text-[9px] sm:text-[10px] font-mono leading-none ${
                            isSelected ? 'text-sky-100' : isHoliday || isSaturday ? 'text-red-500' : 'text-slate-500'
                          }`}
                        >
                          {AD_MONTHS_EN[cell.adMonth - 1].slice(0, 3)} {cell.adDay}
                        </span>
                      </div>
                      {cell.holiday && (
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold leading-tight line-clamp-2 ${
                            isSelected ? 'text-amber-200' : 'text-red-700'
                          }`}
                        >
                          {lang === 'np' ? cell.holiday.nameNp.split(' (')[0] : cell.holiday.nameEn.split(' (')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Monthly Holidays & Dashain / Tihar Schedule */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Holidays in Current Month */}
                <div className="bg-red-50/40 border border-red-100 rounded-xl p-4">
                  <h4 className="text-xs sm:text-sm font-extrabold text-red-900 flex items-center gap-2 mb-3">
                    <span>🎉</span>
                    <span>
                      {lang === 'np'
                        ? `${BS_MONTHS_NP[activeCalendarBsMonth - 1]} महिनाका पर्व तथा सार्वजनिक बिदाहरू`
                        : `Festivals & Holidays in ${BS_MONTHS_EN[activeCalendarBsMonth - 1]} ${activeCalendarBsYear} B.S.`}
                    </span>
                  </h4>
                  {activeMonthHolidays.length === 0 ? (
                    <p className="text-xs text-slate-600">
                      {lang === 'np'
                        ? 'यस महिनामा शनिबार बाहेक अन्य प्रमुख चाडपर्व बिदा सूचीकृत छैन। दशैं र तिहार हेर्न असोज वा कार्तिक महिना छान्नुहोस्।'
                        : 'No major festival holidays listed this month besides Saturdays. Select Ashwin or Kartik to view Dashain & Tihar holidays.'}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {activeMonthHolidays.map((item) => (
                        <button
                          key={item.bsDay}
                          type="button"
                          onClick={() => {
                            setConversionMode('bs-to-ad');
                            setBsDay(item.bsDay);
                          }}
                          className="w-full text-left p-2.5 rounded-lg bg-white border border-red-200/80 hover:border-red-400 flex items-center justify-between gap-2 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                              {lang === 'np' ? toNepaliNum(item.bsDay) : item.bsDay}
                            </span>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">
                                {lang === 'np' ? item.holiday?.nameNp : item.holiday?.nameEn}
                              </strong>
                              <span className="text-[11px] text-slate-500">
                                {BS_MONTHS_EN[activeCalendarBsMonth - 1]} {item.bsDay}, {activeCalendarBsYear} BS • {AD_MONTHS_EN[item.adMonth - 1].slice(0, 3)} {item.adDay}, {item.adYear} AD
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 shrink-0">
                            {item.holiday?.isPublicHoliday
                              ? lang === 'np'
                                ? 'सार्वजनिक बिदा'
                                : 'Public Holiday'
                              : lang === 'np'
                              ? 'पर्व'
                              : 'Festival'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Annual Dashain & Tihar Festival Schedule */}
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4">
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-2 mb-3">
                    <span>🌺🪔</span>
                    <span>
                      {lang === 'np'
                        ? `वि.सं. ${toNepaliNum(activeCalendarBsYear)} बडा दशैं तथा शुभ तिहार बिदा तालिका`
                        : `${activeCalendarBsYear} B.S. Dashain & Tihar Holidays Schedule`}
                    </span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {activeYearDashainTihar.map((dt) => (
                      <button
                        key={`${dt.bsMonth}-${dt.bsDay}`}
                        type="button"
                        onClick={() => {
                          setConversionMode('bs-to-ad');
                          setBsMonth(dt.bsMonth);
                          setBsDay(dt.bsDay);
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-white border border-amber-200 hover:border-amber-400 flex items-center justify-between gap-2 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] shrink-0">
                            {lang === 'np'
                              ? `${BS_MONTHS_NP[dt.bsMonth - 1]} ${toNepaliNum(dt.bsDay)}`
                              : `${BS_MONTHS_EN[dt.bsMonth - 1].slice(0, 3)} ${dt.bsDay}`}
                          </span>
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block">
                              {lang === 'np' ? dt.holiday.nameNp : dt.holiday.nameEn}
                            </strong>
                            <span className="text-[11px] text-slate-500">
                              {AD_MONTHS_EN[dt.adMonth - 1]} {dt.adDay}, {dt.adYear} A.D.
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            dt.holiday.category === 'dashain'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {dt.holiday.category === 'dashain'
                            ? lang === 'np'
                              ? 'बडा दशैं'
                              : 'Dashain'
                            : lang === 'np'
                            ? 'शुभ तिहार'
                            : 'Tihar'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: EXCHANGE RATES (NRB FOREX) ==================== */}
        {activeTab === 'exchange-rates' && (
          <div className="space-y-8">
            {/* NRB Fixed INR Peg Notice Banner */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <span className="text-3xl leading-none mt-0.5">🇮🇳</span>
                <div>
                  <div className="text-sm font-bold text-amber-950">
                    {lang === 'np'
                      ? 'नेपाल राष्ट्र बैंक स्थिर विनिमय दर (NRB Fixed Currency Peg)'
                      : 'Nepal Rastra Bank Official Fixed Currency Peg'}
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900 mt-0.5">
                    {lang === 'np'
                      ? 'भारतीय रूपैयाँ (INR) १०० को खरिद दर रु. १६०.०० र बिक्री दर रु. १६०.१५ नेपाल राष्ट्र बैंकको नीति अनुसार स्थिर राखिएको छ।'
                      : 'Indian Rupee (INR 100) is permanently pegged at Buying NPR 160.00 and Selling NPR 160.15 in accordance with Nepal Rastra Bank policy.'}
                  </p>
                </div>
              </div>
              <div className="font-mono tabular-nums text-xs sm:text-sm font-extrabold text-amber-950 bg-white px-4 py-2.5 rounded-xl border border-amber-200 shrink-0">
                100 INR = 160.00 / 160.15 NPR
              </div>
            </div>

            {/* Interactive Currency Converter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h3 className="text-base font-extrabold text-slate-900">
                  💱 {lang === 'np' ? 'विदेशी मुद्रा र नेपाली रूपैयाँ क्याल्कुलेटर' : 'Quick Currency ↔ NPR Calculator'}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFxDirection('fc-to-npr')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                      fxDirection === 'fc-to-npr'
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {lang === 'np' ? 'विदेशी मुद्रा ➔ ने.रु. (NPR)' : 'Foreign Currency ➔ NPR'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFxDirection('npr-to-fc')}
                    className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                      fxDirection === 'npr-to-fc'
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {lang === 'np' ? 'ने.रु. (NPR) ➔ विदेशी मुद्रा' : 'NPR ➔ Foreign Currency'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'np' ? 'मुद्रा छान्नुहोस्' : 'Select Currency'}
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900"
                  >
                    {activeRates.map((r) => (
                      <option key={r.id} value={r.currencyCode}>
                        {r.flag} {r.currencyCode} — {lang === 'np' ? r.currencyNameNp : r.currencyNameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {fxDirection === 'fc-to-npr'
                      ? `${selectedCurrency} ${lang === 'np' ? 'रकम' : 'Amount'}`
                      : `NPR ${lang === 'np' ? 'रकम (रु.)' : 'Amount (Rs.)'}`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={fxAmount}
                    onChange={(e) => setFxAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-mono tabular-nums font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'np' ? 'दरको प्रकार' : 'Rate Type'}
                  </label>
                  <select
                    value={fxRateType}
                    onChange={(e) => setFxRateType(e.target.value as 'buying' | 'selling')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900"
                  >
                    <option value="buying">
                      {lang === 'np' ? 'खरिद दर (Buying Rate)' : 'Buying Rate (खरिद दर)'}
                    </option>
                    <option value="selling">
                      {lang === 'np' ? 'बिक्री दर (Selling Rate)' : 'Selling Rate (बिक्री दर)'}
                    </option>
                  </select>
                </div>

                <div className="bg-sky-900 text-white rounded-xl px-4 py-3">
                  <div className="text-[11px] text-sky-200">
                    {fxDirection === 'fc-to-npr'
                      ? lang === 'np'
                        ? 'प्राप्त हुने नेपाली रूपैयाँ'
                        : 'Converted NPR Amount'
                      : lang === 'np'
                      ? `प्राप्त हुने ${selectedCurrency}`
                      : `Converted ${selectedCurrency} Amount`}
                  </div>
                  <div className="text-lg font-extrabold font-mono tabular-nums">
                    {fxDirection === 'fc-to-npr'
                      ? `NPR ${Number(fxConvertedValue).toLocaleString()}`
                      : `${selectedCurrency} ${Number(fxConvertedValue).toLocaleString()}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Rates Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs uppercase border-b border-slate-200">
                      <th className="py-4 px-5 font-bold">{lang === 'np' ? 'मुद्रा (Currency)' : 'Currency'}</th>
                      <th className="py-4 px-5 font-bold text-center">{lang === 'np' ? 'इकाई (Unit)' : 'Unit'}</th>
                      <th className="py-4 px-5 font-bold text-right">{lang === 'np' ? 'खरिद दर (Buying NPR)' : 'Buying Rate (NPR)'}</th>
                      <th className="py-4 px-5 font-bold text-right">{lang === 'np' ? 'बिक्री दर (Selling NPR)' : 'Selling Rate (NPR)'}</th>
                      <th className="py-4 px-5 font-bold text-right">{lang === 'np' ? 'कैफियत / प्रकार' : 'Rate Basis'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {activeRates.map((rate) => {
                      const isInr = rate.currencyCode.toUpperCase() === 'INR' || rate.isFixed;
                      return (
                        <tr
                          key={rate.id}
                          className={isInr ? 'bg-amber-50/50 font-semibold' : 'hover:bg-slate-50/80'}
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{rate.flag || '💱'}</span>
                              <div>
                                <div className="font-bold text-slate-900">
                                  {rate.currencyCode} — {lang === 'np' ? rate.currencyNameNp : rate.currencyNameEn}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {lang === 'np' ? rate.currencyNameEn : rate.currencyNameNp}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-center font-mono tabular-nums font-bold text-slate-700">
                            {rate.unit}
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono tabular-nums font-bold text-sky-800">
                            Rs. {rate.buyingRate}
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono tabular-nums font-bold text-slate-900">
                            Rs. {rate.sellingRate}
                          </td>
                          <td className="py-3.5 px-5 text-right text-xs">
                            {isInr ? (
                              <span className="text-amber-800 font-bold">
                                {lang === 'np' ? 'NRB स्थिर दर (Fixed)' : 'NRB Fixed Peg'}
                              </span>
                            ) : (
                              <span className="text-slate-500">
                                {lang === 'np' ? 'खुला बजार दर' : 'Open Market Rate'}
                                {rate.updatedAt ? ` · ${rate.updatedAt}` : ''}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: EMI CALCULATOR ==================== */}
        {activeTab === 'emi-calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {lang === 'np' ? 'कर्जा रकम, ब्याजदर र अवधि प्रविष्ट गर्नुहोस्' : 'Configure Loan Parameters'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'np' ? 'घट्दो मौज्दात (Diminishing Balance) विधिमा आधारित गणना' : 'Calculated on standard cooperative diminishing balance method'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'np' ? 'कर्जा रकम (Loan Amount - NPR)' : 'Loan Principal Amount (NPR)'}
                    </label>
                    <input
                      type="number"
                      min="10000"
                      step="10000"
                      value={emiPrincipal}
                      onChange={(e) => setEmiPrincipal(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base font-mono tabular-nums font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'वार्षिक ब्याजदर (Interest Rate %)' : 'Annual Interest Rate (%)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        step="0.25"
                        value={emiRate}
                        onChange={(e) => setEmiRate(Number(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base font-mono tabular-nums font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {lang === 'np' ? 'अवधि (महिनामा - Tenure Months)' : 'Loan Tenure (Months)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={emiMonths}
                        onChange={(e) => setEmiMonths(Number(e.target.value) || 1)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base font-mono tabular-nums font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-[#072f42] to-[#0981ae] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="text-xs text-sky-200 font-semibold uppercase tracking-wider">
                    {lang === 'np' ? 'अनुमानित मासिक किस्ता (Monthly EMI)' : 'Estimated Monthly Installment (EMI)'}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums mt-1.5">
                    Rs. {emiSummary.monthlyEmi.toLocaleString()}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/15 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-sky-200">{lang === 'np' ? 'मूल कर्जा रकम:' : 'Principal Amount:'}</span>
                      <strong className="font-mono tabular-nums">Rs. {emiPrincipal.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sky-200">{lang === 'np' ? 'कुल तिर्नुपर्ने ब्याज:' : 'Total Interest Payable:'}</span>
                      <strong className="font-mono tabular-nums">Rs. {emiSummary.totalInterest.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-base pt-2 border-t border-white/15">
                      <span className="text-sky-100 font-bold">{lang === 'np' ? 'कुल भुक्तानी रकम:' : 'Total Payable Amount:'}</span>
                      <strong className="font-mono tabular-nums">Rs. {emiSummary.totalPayable.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {onJumpToEmiSection && (
                  <div className="mt-6 pt-4 border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onJumpToEmiSection();
                      }}
                      className="w-full bg-white text-sky-950 hover:bg-sky-50 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                    >
                      {lang === 'np'
                        ? 'पूर्ण ईएमआई क्याल्कुलेटर सेक्सनमा जानुहोस् →'
                        : 'View Full Interactive EMI Calculator on Page →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
