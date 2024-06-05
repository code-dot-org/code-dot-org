/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/lab2/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('lab2_locale');
locale = localeWithI18nStringTracker(locale, 'lab2');
module.exports = locale;
