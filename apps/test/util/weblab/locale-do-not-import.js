/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/weblab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// make sure Blockly is loaded
require('../frame')();
require('../../../build/package/js/en_us/weblab_locale.js');

module.exports = window.locales.weblab_locale;
