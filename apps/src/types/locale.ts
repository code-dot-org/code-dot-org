/**
 * TypeScript locale support.
 *
 * You can create a locale object for a specific app by referencing the app's
 * locale file and a locale JSON file to read keys from. For example:
 *
 * const musicLocale = require('@cdo/music/locale') as Locale<typeof import('@cdo/i18n/music/en_us.json')>;
 *
 * This will create a locale object with the same keys as the JSON file, with values that are functions.
 *
 * This lets TypeScript check against the specific locale keys, helping with auto-complete and preventing
 * typos. These checks only occur at compile time; at runtime, the locale object is just a plain JavaScript
 * object with functions as values (equivalent to importing @cdo/locale/<app> directly).
 */

/** Type of the locale object, parameterized by a StringMap type (usually derived from JSON) */
export type Locale<StringMap> = {
  [key in keyof StringMap]: (replaceMap?: {[key: string]: string}) => string;
};

/** Exporting the common locale object as the Locale type, with keys derived from the common strings JSON file */
export const commonI18n = require('@cdo/locale') as Locale<
  typeof import('@cdo/i18n/common/en_us.json')
>;
