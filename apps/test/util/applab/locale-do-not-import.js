/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/applab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// make sure Blockly is loaded
require('../frame')();
require('../../../build/package/js/en_us/applab_locale.js');

module.exports = window.blockly.applab_locale;
