/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/gamelab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// locale for gamelab
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
module.exports = safeLoadLocale('gamelab_locale');
