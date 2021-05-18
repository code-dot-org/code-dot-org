/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/javalab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// locale for javalab
require('../frame')();
require('../../../build/package/js/en_us/javalab_locale.js');

module.exports = window.locales.javalab_locale;
