/**
 * @file Replicates two babel module-output behaviors that require()
 * sites across src/ depend on and swc has no options for.  Chain it
 * before builtin:swc-loader in the `use` array so it receives swc's
 * CommonJS output; the footer runs at end of module, the position
 * where babel-plugin-add-module-exports injects its assignment.
 *
 * - Sole default export: unwrap to `module.exports = exports.default`,
 *   as add-module-exports does.  swc defines `__esModule`
 *   non-enumerably, so Object.keys sees only real exports.
 * - `__esModule` present but every export is a plain data property:
 *   babel stamps the marker only on modules with export DECLARATIONS,
 *   so files mixing `import` with bare `exports.foo =` assignments
 *   must not carry it or default-import interop stops wrapping the
 *   exports object.  swc emits ESM exports as getters, so data-only
 *   exports mean none were declared; rebuild module.exports without
 *   the marker (it is non-configurable and cannot be deleted).
 */
'use strict';

const FOOTER = `
;(function () {
  var __ame = module.exports;
  if (!__ame || !__ame.__esModule) return;
  var __ameKeys = Object.keys(__ame);
  if (__ameKeys.length === 1 && __ameKeys[0] === 'default') {
    module.exports = __ame.default;
    return;
  }
  for (var __i = 0; __i < __ameKeys.length; __i++) {
    var __d = Object.getOwnPropertyDescriptor(__ame, __ameKeys[__i]);
    if (__d && __d.get) return; // has ESM export declarations
  }
  var __plain = {};
  for (var __j = 0; __j < __ameKeys.length; __j++) {
    __plain[__ameKeys[__j]] = __ame[__ameKeys[__j]];
  }
  module.exports = __plain;
})();`;

module.exports = function addModuleExportsShim(source, map, meta) {
  // Only ESM-compiled output carries the marker; skip everything else.
  if (typeof source === 'string' && source.includes('__esModule')) {
    this.callback(null, source + FOOTER, map, meta);
    return;
  }
  this.callback(null, source, map, meta);
};
