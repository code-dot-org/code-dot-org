/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/javalab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// locale for javalab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('javalab_locale');
module.exports = locale;
