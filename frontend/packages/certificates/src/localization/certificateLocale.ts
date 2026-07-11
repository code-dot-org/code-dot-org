import {localization} from '@code-dot-org/core/plugins/localization';

// LocalizeJS uses language codes which differ from the Rails I18n locales.
// Keep this in sync with Cdo::I18n::LOCALIZE_TO_I18N_LOCALES.
const LOCALIZE_TO_I18N_LOCALES: Readonly<Record<string, string>> = {
  ar: 'ar-SA',
  cs: 'cs-CZ',
  de: 'de-DE',
  en: 'en-US',
  'en-IN': 'en-IN',
  es: 'es-ES',
  'es-LA': 'es-LA',
  'es-MX': 'es-MX',
  fa: 'fa-IR',
  fr: 'fr-FR',
  hi: 'hi-IN',
  id: 'id-ID',
  it: 'it-IT',
  ja: 'ja-JP',
  kn: 'kn-IN',
  ko: 'ko-KR',
  mr: 'mr-IN',
  pl: 'pl-PL',
  pt: 'pt-PT',
  'pt-BR': 'pt-BR',
  ru: 'ru-RU',
  sk: 'sk-SK',
  ta: 'ta-IN',
  te: 'te-IN',
  th: 'th-TH',
  tr: 'tr-TR',
  uk: 'uk-UA',
  'zh-Hans': 'zh-CN',
  'zh-TW': 'zh-TW',
};

/**
 * Locale for the course_info API path. LocalizeJS owns the page locale when
 * present; otherwise fall back to the Rails-set document language.
 */
export function getPageLocale(): string {
  if (localization.isLocalizeJS()) {
    return LOCALIZE_TO_I18N_LOCALES[localization.locale] ?? 'en-US';
  }

  return document.documentElement.lang || 'en-US';
}
