export enum SupportedLocale {
  'en-US' = 'en-US',
  ar = 'ar',
  cs = 'cs',
  de = 'de',
  'es-ES' = 'es-ES',
  'es-LA' = 'es-LA', // Latin America Spanish
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
  'zh-CN' = 'zh-CN',
  'zh-TW' = 'zh-TW',
}

type LocalizeJsConfig = {
  value: SupportedLocale;
  text: string;
  isRTL: boolean;
};

// The following are LocalizeJS language codes and map 1:1. They are replicated here to ensure compatability in SSR.
export const LOCALIZE_JS_CONFIG_MAP: LocalizeJsConfig[] = [
  {value: SupportedLocale['en-US'], text: 'English', isRTL: false},
  {value: SupportedLocale['es-LA'], text: 'Español (LATAM)', isRTL: false},
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
  {value: SupportedLocale['zh-CN'], text: '简体字', isRTL: false},
  {value: SupportedLocale['zh-TW'], text: '繁體字', isRTL: false},
];

// Map of supported BCP 47 locale codes to LocalizeJS locale codes
const LOCALIZEJS_LOCALE: {[locale in SupportedLocale]: string} = {
  'en-US': 'en',
  ar: 'ar',
  cs: 'cs',
  de: 'de',
  'es-ES': 'es-ES',
  'es-LA': 'es-MX',
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
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
};

// Map of LocalizeJS locale codes to Dashboard (studio.code.org) locale codes
const DASHBOARD_LOCALE_MAP: Record<SupportedLocale, string | undefined> = {
  'en-US': 'en-US',
  ar: 'ar-SA',
  cs: 'cs-CZ',
  de: 'de-DE',
  'es-ES': 'es-ES',
  'es-LA': 'es-MX',
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
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
};

const LOCALIZEJS_LOCALE_MAP: Record<string, SupportedLocale | undefined> =
  Object.fromEntries(
    Object.entries(DASHBOARD_LOCALE_MAP).map(([key, value]) => [value, key]),
  );

export const SUPPORTED_LOCALE_CODES = LOCALIZE_JS_CONFIG_MAP.map(
  locale => locale.value,
);
export const SUPPORTED_LOCALES_SET = new Set(SUPPORTED_LOCALE_CODES);

export const SUPPORTED_LOCALES_MAP = new Map(
  LOCALIZE_JS_CONFIG_MAP.map(locale => [locale.value, locale]),
);

/**
 * Returns the LocalizeJS locale code for a given BCP 47 locale code.
 * @param bcp47Code - The BCP 47 locale code to convert.
 */
export function getLocalizeJsLocaleFromBCP47(bcp47Code: string) {
  return LOCALIZEJS_LOCALE[bcp47Code as SupportedLocale] || 'en';
}

/**
 * Returns the Dashboard (studio.code.org) locale code for a given LocalizeJS locale code.
 * @param localizeJsLocale - The LocalizeJS locale code to convert.
 */
export function getDashboardLocale(localizeJsLocale: SupportedLocale): string {
  return DASHBOARD_LOCALE_MAP[localizeJsLocale] || 'en-US';
}

/**
 * Returns the LocalizeJS locale code for a given Dashboard (studio.code.org) locale code.
 * @param dashboardLocale - The Dashboard (studio.code.org) locale code to convert.
 */
export function getLocalizeJsLocaleFromDashboardLocale(
  dashboardLocale: string | undefined,
): SupportedLocale | undefined {
  if (!dashboardLocale) {
    return undefined;
  }

  return LOCALIZEJS_LOCALE_MAP[dashboardLocale];
}
