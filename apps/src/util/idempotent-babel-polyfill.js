/**
 * babel-polyfill complains if it gets required on a page twice, but sadly
 * does not really provide a good way to just load it once for sure.
 * fortunately, it does set the _babelPolyfill variable in the global scope
 * to true when it loads, so we can check that to avoid loading it again.
 */
if (!global._babelPolyfill) {
  require('babel-polyfill');
}
