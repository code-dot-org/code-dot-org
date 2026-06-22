/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/music/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('music_locale');
module.exports = locale;
