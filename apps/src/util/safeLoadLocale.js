/**
 * Helper method for loading the locale from blockly, which will detect if
 * blockly is not present in the environment and fall back to an empty locale
 * object.
 *
 * @param localeKey {String} The name of the locale on the global blockly
 *     object. Usually something like "common_locale", "studio_locale",
 *     "applab_locale", etc.
 */
export default function safeLoadLocale(localeKey) {
  if (window.locales && window.locales[localeKey]) {
    return window.locales[localeKey];
  } else {
    console.warn(
      'Loading translations can only be done in a context where blockly is ' +
        'available, but blockly was not found in the global scope. Falling ' +
        'back on an empty translation object. The page may break due to ' +
        'missing translations.'
    );

    // Return an empty object, so i18n methods throw where they are called and
    // generate more useful stack traces.
    return {};
  }
}
