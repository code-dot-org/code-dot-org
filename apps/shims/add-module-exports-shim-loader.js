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

const fs = require('fs');

// Every gap tolerates comments as well as whitespace: builtin swc hoists
// a file's leading comments between the arguments of the first statement
// it emits, which is usually this marker.  A marker left unmatched reads
// as an export declaration below, and the module keeps a stamp babel
// would not have given it.
const GAP = String.raw`(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*`;
const MARKER = new RegExp(
  String.raw`Object\.defineProperty\(${GAP}exports,${GAP}["']__esModule["'],${GAP}\{${GAP}value:${GAP}true,?${GAP}\}${GAP}\);?`
);
// swc declares exports through its _export helper when there are
// several, through a bare defineProperty for a single one, and through
// _export_star for `export * from` re-exports (whose defineProperty
// only happens at runtime inside the helper).  The
// property name cannot be pattern-matched directly: builtin swc hoists
// leading comments BETWEEN the defineProperty arguments.  Instead,
// remove the marker statement and test whether any defineProperty on
// exports remains — tolerating a hoisted comment in the same gaps
// MARKER does, so the two patterns cannot disagree about one source.
const HAS_ESM_EXPORTS = new RegExp(
  String.raw`_export\(${GAP}exports,|_export_star\(|Object\.defineProperty\(${GAP}exports,`
);

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
    // not have stamped it.  But only strip a marker swc ADDED — CJS
    // sources that author their own marker with assignment-style
    // exports (rollup dist output such as react-loading-skeleton) are
    // script-classified by babel and must pass through untouched;
    // stripping theirs makes default-import interop double-wrap.
    let original = '';
    try {
      original = fs.readFileSync(this.resourcePath, 'utf8');
    } catch (e) {
      // Virtual or unreadable resource: assume the marker came from swc.
    }
    if (original.includes('__esModule')) {
      this.callback(null, source, map, meta);
      return;
    }
    this.callback(null, withoutMarker, map, meta);
    return;
  }
  this.callback(null, source + FOOTER, map, meta);
};
