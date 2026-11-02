export const NEPAL_PROVINCES_WITH_DISTRICTS: Record<string, string[]> = {
  'Koshi Province': [
    'Bhojpur',
    'Dhankuta',
    'Ilam',
    'Jhapa',
    'Khotang',
    'Morang',
    'Okhaldhunga',
    'Panchthar',
    'Sankhuwasabha',
    'Solukhumbu',
    'Sunsari',
    'Taplejung',
    'Terhathum',
    'Udayapur',
  ],
  'Madhesh Province': [
    'Bara',
    'Dhanusha',
    'Mahottari',
    'Parsa',
    'Rautahat',
    'Saptari',
    'Sarlahi',
    'Siraha',
  ],
  'Bagmati Province': [
    'Bhaktapur',
    'Chitwan',
    'Dhading',
    'Dolakha',
    'Kathmandu',
    'Kavrepalanchok',
    'Lalitpur',
    'Makwanpur',
    'Nuwakot',
    'Ramechhap',
    'Rasuwa',
    'Sindhuli',
    'Sindhupalchok',
  ],
  'Gandaki Province': [
    'Baglung',
    'Gorkha',
    'Kaski',
    'Lamjung',
    'Manang',
    'Mustang',
    'Myagdi',
    'Nawalpur',
    'Parbat',
    'Syangja',
    'Tanahun',
  ],
  'Lumbini Province': [
    'Arghakhanchi',
    'Banke',
    'Bardiya',
    'Dang',
    'Gulmi',
    'Kapilvastu',
    'Palpa',
    'Pyuthan',
    'Rolpa',
    'Rupandehi',
    'Rukum East (पूर्वी रुकुम)',
    'Nawalparasi West (पश्चिम नवलपरासी)',
  ],
  'Karnali Province': [
    'Dailekh',
    'Dolpa',
    'Humla',
    'Jajarkot',
    'Jumla',
    'Kalikot',
    'Mugu',
    'Rukum West (पश्चिम रुकुम)',
    'Salyan',
    'Surkhet',
  ],
  'Sudurpashchim Province': [
    'Achham',
    'Baitadi',
    'Bajhang',
    'Bajura',
    'Dadeldhura',
    'Darchula',
    'Doti',
    'Kailali',
    'Kanchanpur',
  ],
};

export const NEPAL_PROVINCE_OPTIONS = Object.keys(NEPAL_PROVINCES_WITH_DISTRICTS).map((province) => ({
  value: province,
  label: province,
  labelEn: province,
}));

export function getDistrictsByProvince(province: string): string[] {
  if (!province) return [];
  if (NEPAL_PROVINCES_WITH_DISTRICTS[province]) {
    return NEPAL_PROVINCES_WITH_DISTRICTS[province];
  }
  const normalized = province.trim().toLowerCase();
  const matchedKey = Object.keys(NEPAL_PROVINCES_WITH_DISTRICTS).find(
    (k) => k.toLowerCase() === normalized || k.toLowerCase().includes(normalized.replace(' province', ''))
  );
  return matchedKey ? NEPAL_PROVINCES_WITH_DISTRICTS[matchedKey] : [];
}

export const ALL_NEPAL_DISTRICTS: string[] = Object.values(NEPAL_PROVINCES_WITH_DISTRICTS).flat();
