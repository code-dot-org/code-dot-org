/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import i18n from '@cdo/signUpFlow/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// locale for signUpFlow

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('signup_locale');
locale = localeWithI18nStringTracker(locale, 'signup');
module.exports = locale;
