/**
 * @file Replicates two babel module-output behaviors that require()
 * sites across src/ depend on and swc has no options for.  Chain it
 * before builtin:swc-loader in the `use` array so it receives swc's
 * CommonJS output.
 *
 * - babel stamps `__esModule` only on modules with export
 *   DECLARATIONS.  swc stamps every module-classified file, which
 *   breaks two consumer patterns: `import x from` interop stops
 *   wrapping the exports object of files that mix `import` with bare
 *   `exports.foo =` assignments, and files like studio/studio.js that
 *   alias `module.exports` and mutate it at runtime need consumers to
 *   hold the SAME object, so the marker cannot be laundered away by
 *   rebuilding exports.  swc declares real ESM exports through its
 *   _export helper; when that is absent, remove the marker statement
 *   from the source text, which preserves object identity.
 *
 * - babel-plugin-add-module-exports appends `module.exports =
 *   exports.default` to any module whose ONLY export is default.
 *   The footer reproduces that at the same position (end of module).
 */
'use strict';

const MARKER =
  /Object\.defineProperty\(exports,\s*["']__esModule["'],\s*\{\s*value:\s*true,?\s*\}\s*\);?/;
// swc declares exports through its _export helper when there are
// several, and through a bare defineProperty for a single one.  The
// property name cannot be pattern-matched directly: builtin swc hoists
// leading comments BETWEEN the defineProperty arguments.  Instead,
// remove the marker statement and test whether any defineProperty on
// exports remains.
const HAS_ESM_EXPORTS = /_export\(exports,|Object\.defineProperty\(exports,/;

const FOOTER = `
;(function () {
  var __ame = module.exports;
  if (!__ame || !__ame.__esModule) return;
  var __ameKeys = Object.keys(__ame);
  if (__ameKeys.length === 1 && __ameKeys[0] === 'default') {
    module.exports = __ame.default;
  }
})();`;

module.exports = function addModuleExportsShim(source, map, meta) {
  if (typeof source !== 'string' || !source.includes('__esModule')) {
    this.callback(null, source, map, meta);
    return;
  }
  const withoutMarker = source.replace(MARKER, '');
  if (!HAS_ESM_EXPORTS.test(withoutMarker)) {
    // Module-classified file with no export declarations: babel would
    // not have stamped it.
    this.callback(null, withoutMarker, map, meta);
    return;
  }
  this.callback(null, source + FOOTER, map, meta);
};
