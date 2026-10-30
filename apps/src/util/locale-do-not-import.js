/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seemlessly in tests.
 */
// base locale

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('common_locale');
module.exports = locale;
