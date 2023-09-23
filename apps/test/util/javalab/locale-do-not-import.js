/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/javalab/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seamlessly in tests.
 */
// locale for javalab
import setupBlocklyGlobal from '../setupBlocklyGlobal.js';
import '../../../build/package/js/en_us/javalab_locale.js';
setupBlocklyGlobal();

export default window.locales.javalab_locale;
