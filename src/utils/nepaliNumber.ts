/**
 * Nepali numeral and currency format helper
 * Converts digits to Devanagari and formats amounts into traditional Nepali comma grouping.
 */

export const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const toNepaliDigits = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  return String(val).replace(/[0-9]/g, (d) => NEPALI_DIGITS[parseInt(d, 10)] || d);
};

export const toEnglishDigits = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  return String(val).replace(/[०-९]/g, (d) => String(NEPALI_DIGITS.indexOf(d)));
};

/**
 * Format raw number string or number into Nepali Lakh/Crore format
 * e.g. 310840400 -> "३१,०८,४०,४००"
 */
export const formatNepaliCurrencyNumber = (num: number | string): string => {
  if (!num) return '०';
  const cleanStr = String(num).replace(/[^0-9.]/g, '');
  if (!cleanStr) return String(num);
  
  const parts = cleanStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] !== undefined ? `.${parts[1]}` : '';

  if (integerPart.length <= 3) {
    return toNepaliDigits(integerPart + decimalPart);
  }

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherDigits = integerPart.substring(0, integerPart.length - 3);
  const formattedOthers = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  const combined = formattedOthers ? `${formattedOthers},${lastThree}` : lastThree;
  return toNepaliDigits(combined + decimalPart);
};
