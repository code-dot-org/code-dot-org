/**
 * @file Replicates babel-plugin-add-module-exports for swc output.
 *
 * babel.config.json runs add-module-exports, which appends
 * `module.exports = exports.default` to any module whose ONLY export is
 * default.  Large parts of src/ depend on that: `require('./clientApi')`
 * expects the default export object itself, not `{default: ...}`.  swc
 * has no equivalent plugin, so this loader appends a runtime footer with
 * the same effect and the same position (end of module, exactly where
 * the babel plugin injects its assignment).
 *
 * The footer no-ops unless the module is ESM-compiled (`__esModule`) and
 * `default` is its sole enumerable export — swc defines `__esModule`
 * non-enumerably, so Object.keys sees only real exports.  Modules with
 * named exports keep standard interop, matching the plugin's
 * isOnlyExportsDefault check.
 *
 * Chain it before builtin:swc-loader in the `use` array so it receives
 * swc's CommonJS output.
 */
'use strict';

const FOOTER = `
;(function () {
  var __ame = module.exports;
  if (__ame && __ame.__esModule) {
    var __ameKeys = Object.keys(__ame);
    if (__ameKeys.length === 1 && __ameKeys[0] === 'default') {
      module.exports = __ame.default;
    }
  }
})();`;

module.exports = function addModuleExportsShim(source, map, meta) {
  // Only ESM-compiled output carries the marker; skip everything else.
  if (typeof source === 'string' && source.includes('__esModule')) {
    // The footer goes after the code but must not land inside a
    // trailing sourceMappingURL comment; swc emits maps separately
    // under our config, so a plain append is safe.
    this.callback(null, source + FOOTER, map, meta);
    return;
  }
  this.callback(null, source, map, meta);
};
