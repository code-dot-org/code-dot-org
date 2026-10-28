import {
  DefaultLocale,
  LocaleFallbacks,
} from '@cdo/generated-scripts/sharedConstants';

/**
 * Converts an I18n locale to a js locale, as Cdo::I18n.js_locale does.
 *
 * @param locale I18n locale, language and region joined by a hyphen (en-US)
 * @returns js locale, lowercase with an underscore, e.g. 'en_us' for en-US
 */
export const toJsLocale = (locale: string) =>
  locale.toLowerCase().replace('-', '_');

export const JS_DEFAULT_LOCALE = toJsLocale(DefaultLocale);

const JS_LOCALE_FALLBACKS: Record<string, string> = Object.fromEntries(
  Object.entries(LocaleFallbacks).map(locales => locales.map(toJsLocale))
);

/**
 * Returns jsLocale, its fallback, and the default locale, in that order and
 * without duplicates, for looking up resources that exist for some locales.
 * The caller tries each in turn; none is known to have the resource.
 *
 * @param jsLocale js locale, lowercase with an underscore (en_in, not en-IN)
 * @returns js locales in order, e.g. ['es_la', 'es_mx', 'en_us'] for es_la
 */
export function getJsLocaleFallbacks(jsLocale: string): string[] {
  const locales = [jsLocale];

  const fallback = JS_LOCALE_FALLBACKS[jsLocale];
  if (fallback) locales.push(fallback);

  if (!locales.includes(JS_DEFAULT_LOCALE)) locales.push(JS_DEFAULT_LOCALE);

  return locales;
}
