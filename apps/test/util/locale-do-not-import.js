/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seemlessly in tests.
 */

// make sure Blockly is loaded
import setupBlocklyGlobal from './setupBlocklyGlobal';
setupBlocklyGlobal();
var context = require.context(
  '../../build/package/js/en_us/',
  false,
  /.*_locale.*\.js$/
); // eslint-disable-line import/no-commonjs
context.keys().forEach(context);

export default window.locales.common_locale;
