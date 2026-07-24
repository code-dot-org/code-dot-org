import {assert} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const shim = require('../../lib/add-module-exports-shim-loader');

// Run the loader on `source`, then execute the result as a CommonJS
// module and return its final module.exports.
function runShimmed(source) {
  let out;
  shim.call(
    {
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
    const exported = runShimmed(
      swcModule(`
var _default = { create: function () { return 'made'; } };
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () { return _default; },
});`)
    );
    // add-module-exports semantics: require() returns the default value.
    assert.equal(exported.create(), 'made');
    assert.isUndefined(exported.__esModule);
  });

  it('strips the marker from import-only modules with manual exports', function () {
    // Mixed legacy style: `import` (which makes swc stamp __esModule)
    // plus bare `exports.foo =` assignments and no ESM exports.
    const exported = runShimmed(
      swcModule(`exports.createToolbox = function () { return 'toolbox'; };`)
    );
    // babel does not stamp __esModule here, so `import x from` interop
    // wraps the exports object whole; the marker must be gone.
    assert.isUndefined(exported.__esModule);
    assert.equal(exported.createToolbox(), 'toolbox');
  });

  it('leaves modules with named ESM exports alone', function () {
    const exported = runShimmed(
      swcModule(`
var foo = 1;
Object.defineProperty(exports, "foo", {
  enumerable: true,
  get: function () { return foo; },
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () { return 'dflt'; },
});`)
    );
    // default + named: standard interop applies, nothing rewritten.
    assert.isTrue(exported.__esModule);
    assert.equal(exported.foo, 1);
    assert.equal(exported.default, 'dflt');
  });

  it('passes plain CommonJS sources through untouched', function () {
    const src = `exports.plain = 42;`;
    let out;
    shim.call({callback: (err, code) => (out = code)}, src);
    assert.equal(out, src);
  });
});
