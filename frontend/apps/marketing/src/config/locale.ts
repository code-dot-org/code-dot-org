// The following are LocalizeJS language codes and map 1:1. They are replicated here to ensure compatability in SSR.
export const SUPPORTED_LOCALES = [
  {value: 'en-US', text: 'English', isRTL: false},
  {value: 'es', text: 'Español', isRTL: false},
  {value: 'ar', text: 'العربية', isRTL: true},
  {value: 'de', text: 'Deutsch', isRTL: false},
  {value: 'fa', text: 'فارسی', isRTL: true},
  {value: 'fr', text: 'Français', isRTL: false},
  {value: 'hi', text: 'हिन्दी', isRTL: false},
  {value: 'id', text: 'Bahasa Indonesia', isRTL: false},
  {value: 'it', text: 'Italiano', isRTL: false},
  {value: 'ja', text: '日本語', isRTL: false},
  {value: 'ko', text: '한국어', isRTL: false},
  {value: 'mr', text: 'मराठी', isRTL: false},
  {value: 'pl', text: 'Polski', isRTL: false},
  {value: 'pt-BR', text: 'Português (Brasil)', isRTL: false},
  {value: 'sk', text: 'Slovenčina', isRTL: false},
  {value: 'th', text: 'ภาษาไทย', isRTL: false},
  {value: 'tr', text: 'Türkçe', isRTL: false},
  {value: 'uk', text: 'Українська', isRTL: false},
  {value: 'vi', text: 'Tiếng Việt', isRTL: false},
  {value: 'zh-TW', text: '繁體字', isRTL: false},
  {value: 'sq', text: 'Shqip', isRTL: false},
  {value: 'tl', text: 'Tagalog', isRTL: false},
  {value: 'he', text: 'עברית', isRTL: true},
];

// Map of LocalizeJS locale codes to Pegasus locale codes
const PEGASUS_LOCALE_MAP: Record<string, string | undefined> = {
  'en-US': 'en_US',
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

const LOCALIZEJS_LOCALE_MAP: Record<string, string | undefined> =
  Object.fromEntries(
    Object.entries(PEGASUS_LOCALE_MAP).map(([key, value]) => [value, key]),
  );

export const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map(
  locale => locale.value,
);
export const SUPPORTED_LOCALES_SET = new Set(SUPPORTED_LOCALE_CODES);

export const SUPPORTED_LOCALES_MAP = new Map(
  SUPPORTED_LOCALES.map(locale => [locale.value, locale]),
);

export function getPegasusLocale(localizeJsLocale: string): string {
  return PEGASUS_LOCALE_MAP[localizeJsLocale] || 'en-US';
}

export function getLocalizeJsLocale(
  pegasusLocale: string | undefined,
): string | undefined {
  if (!pegasusLocale) {
    return undefined;
  }

  return LOCALIZEJS_LOCALE_MAP[pegasusLocale];
}
