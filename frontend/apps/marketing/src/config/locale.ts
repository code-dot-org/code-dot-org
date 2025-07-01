export enum SupportedLocale {
  'en-US' = 'en-US',
  es = 'es',
  ar = 'ar',
  de = 'de',
  fa = 'fa',
  fr = 'fr',
  hi = 'hi',
  id = 'id',
  it = 'it',
  ja = 'ja',
  ko = 'ko',
  mr = 'mr',
  pl = 'pl',
  'pt-BR' = 'pt-BR',
  sk = 'sk',
  th = 'th',
  tr = 'tr',
  uk = 'uk',
  vi = 'vi',
  'zh-TW' = 'zh-TW',
  sq = 'sq',
  tl = 'tl',
  he = 'he',
}

type LocalizeJsConfig = {
  value: SupportedLocale;
  text: string;
  isRTL: boolean;
};

// The following are LocalizeJS language codes and map 1:1. They are replicated here to ensure compatability in SSR.
export const LOCALIZE_JS_CONFIG_MAP: LocalizeJsConfig[] = [
  {value: SupportedLocale['en-US'], text: 'English', isRTL: false},
  {value: SupportedLocale['es'], text: 'Español', isRTL: false},
  {value: SupportedLocale['ar'], text: 'العربية', isRTL: true},
  {value: SupportedLocale['de'], text: 'Deutsch', isRTL: false},
  {value: SupportedLocale['fa'], text: 'فارسی', isRTL: true},
  {value: SupportedLocale['fr'], text: 'Français', isRTL: false},
  {value: SupportedLocale['hi'], text: 'हिन्दी', isRTL: false},
  {value: SupportedLocale['id'], text: 'Bahasa Indonesia', isRTL: false},
  {value: SupportedLocale['it'], text: 'Italiano', isRTL: false},
  {value: SupportedLocale['ja'], text: '日本語', isRTL: false},
  {value: SupportedLocale['ko'], text: '한국어', isRTL: false},
  {value: SupportedLocale['mr'], text: 'मराठी', isRTL: false},
  {value: SupportedLocale['pl'], text: 'Polski', isRTL: false},
  {value: SupportedLocale['pt-BR'], text: 'Português (Brasil)', isRTL: false},
  {value: SupportedLocale['sk'], text: 'Slovenčina', isRTL: false},
  {value: SupportedLocale['th'], text: 'ภาษาไทย', isRTL: false},
  {value: SupportedLocale['tr'], text: 'Türkçe', isRTL: false},
  {value: SupportedLocale['uk'], text: 'Українська', isRTL: false},
  {value: SupportedLocale['vi'], text: 'Tiếng Việt', isRTL: false},
  {value: SupportedLocale['zh-TW'], text: '繁體字', isRTL: false},
  {value: SupportedLocale['sq'], text: 'Shqip', isRTL: false},
  {value: SupportedLocale['tl'], text: 'Tagalog', isRTL: false},
  {value: SupportedLocale['he'], text: 'עברית', isRTL: true},
];

// Map of supported BCP 47 locale codes to LocalizeJS locale codes
const LOCALIZEJS_LOCALE: {[locale in SupportedLocale]: string} = {
  'en-US': 'en',
  es: 'es',
  ar: 'ar',
  de: 'de',
  fa: 'fa',
  fr: 'fr',
  hi: 'hi',
  id: 'id',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
  mr: 'mr',
  pl: 'pl',
  'pt-BR': 'pt-BR',
  sk: 'sk',
  th: 'th',
  tr: 'tr',
  uk: 'uk',
  vi: 'vi',
  'zh-TW': 'zh-TW',
  sq: 'sq',
  tl: 'tl',
  he: 'he',
};

// Map of LocalizeJS locale codes to Dashboard (studio.code.org) locale codes
const DASHBOARD_LOCALE_MAP: Record<string, string | undefined> = {
  'en-US': 'en-US',
  es: 'es-MX',
  ar: 'ar-SA',
  de: 'de-DE',
  fa: 'fa-IR',
  fr: 'fr-FR',
  hi: 'hi-IN',
  id: 'id-ID',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  mr: 'mr-IN',
  pl: 'pl-PL',
  'pt-BR': 'pt-BR',
  sk: 'sk-SK',
  th: 'th-TH',
  tr: 'tr-TR',
  uk: 'uk-UA',
  vi: 'vi-VN',
  'zh-TW': 'zh-TW',
  sq: 'sq-AL',
  tl: 'fil-PH',
  he: 'he-IL',
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
export function getDashboardLocale(localizeJsLocale: string): string {
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
