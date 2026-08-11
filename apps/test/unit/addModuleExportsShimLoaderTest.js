import fs from 'fs';
import os from 'os';
import path from 'path';

import {assert} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const shim = require('../../shims/add-module-exports-shim-loader');

// Run the loader on `source`, then execute the result as a CommonJS
// module and return its final module.exports.  `resourcePath` stands in
// for the original on-disk source; when omitted the loader treats the
// marker as swc-added.
function runShimmed(source, resourcePath) {
  let out;
  shim.call(
    {
      resourcePath,
      callback: (err, code) => {
        assert.isNull(err);
        out = code;
      },
    },
    source
  );
  const module = {exports: {}};
  new Function('module', 'exports', out)(module, module.exports);
  return module.exports;
}

// Build swc-style CommonJS output: __esModule marker plus getter-style
// export declarations, the shapes builtin:swc-loader emits.
function swcModule(body) {
  return `
Object.defineProperty(exports, "__esModule", { value: true });
${body}`;
}

describe('add-module-exports-shim-loader', function () {
  it('unwraps a module whose only export is default', function () {
    // Single-export shape: swc uses a bare defineProperty, not its
    // _export helper — and builtin swc hoists leading file comments
    // BETWEEN the arguments, so detection must not parse the property
    // name positionally.
    const exported = runShimmed(
      swcModule(`
var _default = { create: function () { return 'made'; } };
Object.defineProperty(exports, /** hoisted
 * file comment blob
 */ "default", {
  enumerable: true,
  get: function () { return _default; },
});`)
    );
    // add-module-exports semantics: require() returns the default value.
    assert.equal(exported.create(), 'made');
    assert.isUndefined(exported.__esModule);
  });

  it('unwraps a default-only module whose marker holds a hoisted comment', function () {
    // builtin swc hoists a file's leading comments between the
    // arguments of the first statement it emits — usually the
    // __esModule marker itself.  A whitespace-only gap in the marker
    // pattern leaves the statement in place, which then reads as an
    // export declaration: no footer, and require() hands back the
    // namespace object, so callers see undefined instead of the export.
    const exported = runShimmed(`
Object.defineProperty(exports, /** @file leading comment blob
 * spanning lines
 */ "__esModule", { value: true });
var _default = { create: function () { return 'made'; } };
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () { return _default; },
});`);
    assert.equal(exported.create(), 'made');
    assert.isUndefined(exported.__esModule);
  });

  it('strips the marker from import-only modules with manual exports', function () {
    // Mixed legacy style: `import` (which makes swc stamp __esModule)
    // plus bare `exports.foo =` assignments and no ESM exports.
    const exported = runShimmed(
      swcModule(`
exports.createToolbox = function () { return 'toolbox'; };
exports.self = exports;`)
    );
    // babel does not stamp __esModule here, so `import x from` interop
    // wraps the exports object whole; the marker must be gone.
    assert.isUndefined(exported.__esModule);
    assert.equal(exported.createToolbox(), 'toolbox');
    // Identity must be preserved: modules like studio/studio.js alias
    // module.exports and mutate it at runtime, so consumers must hold
    // the same object, not a laundered copy.
    assert.strictEqual(exported.self, exported);
  });

  it('leaves modules with named ESM exports alone', function () {
    const exported = runShimmed(
      swcModule(`
function _export(target, all) {
  for (var name in all) Object.defineProperty(target, name, {
    enumerable: true,
    get: all[name],
  });
}
var foo = 1;
_export(exports, {
  foo: function () { return foo; },
  default: function () { return 'dflt'; },
});`)
    );
    // default + named: standard interop applies, nothing rewritten.
    assert.isTrue(exported.__esModule);
    assert.equal(exported.foo, 1);
    assert.equal(exported.default, 'dflt');
  });

  it('keeps the marker on export-star re-export files', function () {
    // `export * from` emits _export_star, whose defineProperty happens
    // at runtime inside the helper — static detection must still count
    // it as an ESM export declaration.
    const exported = runShimmed(
      swcModule(`
function _export_star(from, to) {
  Object.keys(from).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(to, k)) {
      Object.defineProperty(to, k, {
        enumerable: true,
        get: function () { return from[k]; },
      });
    }
  });
  return from;
}
_export_star({widget: 1}, exports);`)
    );
    assert.isTrue(exported.__esModule);
    assert.equal(exported.widget, 1);
  });

  it('keeps a marker the source itself authors (rollup CJS dist)', function () {
    // react-loading-skeleton/dist/index.js pattern: prebuilt CJS that
    // stamps its own __esModule and exports via plain assignment.
    // babel classifies it as a script and leaves it alone; stripping
    // its marker makes default-import interop double-wrap the exports
    // object, which surfaced as React error #130.
    const source = `
Object.defineProperty(exports, '__esModule', { value: true });
function Skeleton() { return 'bones'; }
function SkeletonTheme() { return 'theme'; }
exports.SkeletonTheme = SkeletonTheme;
exports["default"] = Skeleton;`;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shim-test-'));
    const file = path.join(dir, 'index.js');
    fs.writeFileSync(file, source);
    try {
      const exported = runShimmed(source, file);
      assert.isTrue(exported.__esModule);
      assert.equal(exported.default(), 'bones');
      assert.equal(exported.SkeletonTheme(), 'theme');
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });

  it('passes plain CommonJS sources through untouched', function () {
    const src = `exports.plain = 42;`;
    let out;
    shim.call({callback: (err, code) => (out = code)}, src);
    assert.equal(out, src);
  });
});
