/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/weblab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// make sure Blockly is loaded
import setupBlocklyGlobal from '../setupBlocklyGlobal.js';
import '../../../build/package/js/en_us/weblab_locale.js';
setupBlocklyGlobal();
export default window.locales.weblab_locale;
