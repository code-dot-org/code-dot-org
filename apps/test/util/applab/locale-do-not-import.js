/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/applab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// make sure Blockly is loaded
import setupBlocklyGLobal from '../setupBlocklyGlobal';
import '../../../build/package/js/en_us/applab_locale.js';
setupBlocklyGLobal();

export default window.locales.applab_locale;
