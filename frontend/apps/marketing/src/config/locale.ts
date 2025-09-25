export enum SupportedLocale {
  'en-US' = 'en-US',
  ar = 'ar',
  cs = 'cs',
  de = 'de',
  'es-ES' = 'es-ES',
  'es' = 'es', // Latin America Spanish
  fa = 'fa',
  fr = 'fr',
  hi = 'hi',
  id = 'id',
  it = 'it',
  ko = 'ko',
  kn = 'kn',
  mr = 'mr',
  pl = 'pl',
  'pt-BR' = 'pt-BR',
  sk = 'sk',
  ta = 'ta',
  te = 'te',
  th = 'th',
  tr = 'tr',
  'zh-Hans' = 'zh-Hans',
  'zh-Hant' = 'zh-Hant',
}

type SupportedLocaleConfig = {
  value: SupportedLocale;
  text: string;
  isRTL: boolean;
};

// The following are BCP-47 language codes supported by the marketing app.
// When updating languages here, ensure they are valid BCP 47 codes
export const SUPPORTED_LOCALES_CONFIG: SupportedLocaleConfig[] = [
  {value: SupportedLocale['en-US'], text: 'English', isRTL: false},
  {value: SupportedLocale['es'], text: 'Español (LATAM)', isRTL: false},
  {value: SupportedLocale['es-ES'], text: 'Español (España)', isRTL: false},
  {value: SupportedLocale['ar'], text: 'العربية', isRTL: true},
  {value: SupportedLocale['cs'], text: 'Čeština', isRTL: false},
  {value: SupportedLocale['de'], text: 'Deutsch', isRTL: false},
  {value: SupportedLocale['fa'], text: 'فارسی', isRTL: true},
  {value: SupportedLocale['fr'], text: 'Français', isRTL: false},
  {value: SupportedLocale['hi'], text: 'हिन्दी', isRTL: false},
  {value: SupportedLocale['id'], text: 'Bahasa Indonesia', isRTL: false},
  {value: SupportedLocale['it'], text: 'Italiano', isRTL: false},
  {value: SupportedLocale['kn'], text: 'ಕನ್ನಡ', isRTL: false},
  {value: SupportedLocale['ko'], text: '한국어', isRTL: false},
  {value: SupportedLocale['mr'], text: 'मराठी', isRTL: false},
  {value: SupportedLocale['pl'], text: 'Polski', isRTL: false},
  {value: SupportedLocale['pt-BR'], text: 'Português (Brasil)', isRTL: false},
  {value: SupportedLocale['sk'], text: 'Slovenčina', isRTL: false},
  {value: SupportedLocale['ta'], text: 'தமிழ்', isRTL: false},
  {value: SupportedLocale['te'], text: 'తెలుగు', isRTL: false},
  {value: SupportedLocale['th'], text: 'ภาษาไทย', isRTL: false},
  {value: SupportedLocale['tr'], text: 'Türkçe', isRTL: false},
  {value: SupportedLocale['zh-Hans'], text: '简体字', isRTL: false},
  {value: SupportedLocale['zh-Hant'], text: '繁體字', isRTL: false},
];

// Map of application supported BCP 47 locale codes to LocalizeJS locale codes
// When selecting languages here, ensure they are valid BCP 47 codes
// LocalizeJS has a variety of language codes but we standardize them to ensure compatability with our systems.
const LOCALIZEJS_LOCALE: {[locale in SupportedLocale]: string} = {
  'en-US': 'en',
  ar: 'ar',
  cs: 'cs',
  de: 'de',
  'es-ES': 'es', // Localize has es-ES as es
  es: 'es-LA', // Latin America Spanish is es-LA in Localize
  fa: 'fa',
  fr: 'fr',
  hi: 'hi',
  id: 'id',
  it: 'it',
  kn: 'kn',
  ko: 'ko',
  mr: 'mr',
  pl: 'pl',
  'pt-BR': 'pt-BR',
  sk: 'sk',
  ta: 'ta',
  te: 'te',
  th: 'th',
  tr: 'tr',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-TW', // Localize has zh-Hant as zh-TW
};

// Map of BCP-47 application supported locale codes to Dashboard (studio.code.org) locale codes
const DASHBOARD_LOCALE_MAP: Record<SupportedLocale, string> = {
  'en-US': 'en-US',
  ar: 'ar-SA',
  cs: 'cs-CZ',
  de: 'de-DE',
  'es-ES': 'es-ES',
  es: 'es-MX',
  fa: 'fa-IR',
  fr: 'fr-FR',
  hi: 'hi-IN',
  id: 'id-ID',
  it: 'it-IT',
  kn: 'kn-IN',
  ko: 'ko-KR',
  mr: 'mr-IN',
  pl: 'pl-PL',
  'pt-BR': 'pt-BR',
  sk: 'sk-SK',
  ta: 'ta-IN',
  te: 'te-IN',
  th: 'th-TH',
  tr: 'tr-TR',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
};

const DASHBOARD_LOCALE_TO_SUPPORTED_LOCALE_MAP: Record<
  string,
  SupportedLocale
> = Object.fromEntries(
  Object.entries(DASHBOARD_LOCALE_MAP).map(([key, value]) => [
    value,
    key as SupportedLocale,
  ]),
);

export const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES_CONFIG.map(
  locale => locale.value,
);
export const SUPPORTED_LOCALES_SET = new Set(SUPPORTED_LOCALE_CODES);

export const SUPPORTED_LOCALES_MAP = new Map(
  SUPPORTED_LOCALES_CONFIG.map(locale => [locale.value, locale]),
);

/**
 * Returns the LocalizeJS locale code for a given BCP 47 locale code.
 * @param supportedLocale - The BCP 47 supported locale code to convert.
 */
export function getLocalizeJsLocaleFromSupportedLocale(
  supportedLocale: SupportedLocale | string,
) {
  return LOCALIZEJS_LOCALE[supportedLocale as SupportedLocale] || 'en';
}

/**
 * Returns the Dashboard (studio.code.org) locale code for a given LocalizeJS locale code.
 * @param supportedLocale - The marketing app locale code to convert.
 */
export function getDashboardLocale(supportedLocale: SupportedLocale): string {
  return DASHBOARD_LOCALE_MAP[supportedLocale] || 'en-US';
}

/**
 * Returns the BCP-47 marketing app locale code for a given Dashboard (studio.code.org) locale code.
 * @param dashboardLocale - The Dashboard (studio.code.org) locale code to convert.
 */
export function getSupportedLocaleFromDashboardLocale(
  dashboardLocale: string | undefined,
): SupportedLocale | undefined {
  if (!dashboardLocale) {
    return undefined;
  }

  return DASHBOARD_LOCALE_TO_SUPPORTED_LOCALE_MAP[dashboardLocale];
}
