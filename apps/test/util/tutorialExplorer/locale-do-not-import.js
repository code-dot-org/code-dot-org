/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/tutorialExplorer/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// make sure Blockly is loaded
require('../frame')();
require('../../../build/package/js/en_us/tutorialExplorer_locale.js');
export default window.locales.tutorialExplorer_locale;
