/**
 * @file Replicates two babel module-output behaviors for swc output.
 *
 * 1. babel-plugin-add-module-exports appends `module.exports =
 *    exports.default` to any module whose ONLY export is default.  Large
 *    parts of src/ depend on that: `require('./clientApi')` expects the
 *    default export object itself, not `{default: ...}`.
 *
 * 2. babel stamps `__esModule` only on modules with export
 *    DECLARATIONS.  Legacy files that mix `import` with bare
 *    `exports.foo =` assignments (e.g. block_utils.js) therefore carry
 *    no marker under babel, so a consumer's `import blockUtils from`
 *    interop wraps the whole exports object as the default.  swc stamps
 *    the marker on every module-classified file, which turns those
 *    default imports into `undefined`.
 *
 * swc has no equivalent options, so this loader appends a runtime
 * footer with the same effects at the same position (end of module,
 * exactly where the babel plugin injects its assignment):
 *
 * - `default` as sole enumerable export (swc defines `__esModule`
 *   non-enumerably, so Object.keys sees only real exports): unwrap, as
 *   add-module-exports would.
 * - `__esModule` present but every export is a plain data property
 *   (swc emits ESM export declarations as getters; manual `exports.foo`
 *   assignments are data properties): the module declared no ESM
 *   exports, so rebuild module.exports without the marker — it is
 *   defined non-configurable and cannot be deleted in place.
 *
 * Chain it before builtin:swc-loader in the `use` array so it receives
 * swc's CommonJS output.
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
    // The footer goes after the code but must not land inside a
    // trailing sourceMappingURL comment; swc emits maps separately
    // under our config, so a plain append is safe.
    this.callback(null, source + FOOTER, map, meta);
    return;
  }
  this.callback(null, source, map, meta);
};
