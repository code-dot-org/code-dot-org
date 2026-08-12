import {execFileSync} from 'child_process';
import path from 'path';

// No test runner exercises rspack.config.js (jest transpiles through
// ts-jest, karma bundles with webpack), so behavior the config must
// hold is pinned here — the same guard bundlerBase's resolveBundler
// default has.  The config is inspected in a child node process:
// requiring it under jest would pull @rspack/core, whose ESM dist jest
// cannot parse without transforming node_modules.
function readConfig(expression) {
  const script = `
    const config = require('./rspack.config');
    console.log('RESULT=' + JSON.stringify(${expression}));
  `;
  const out = execFileSync(process.execPath, ['-e', script], {
    cwd: path.resolve(__dirname, '../..'),
    encoding: 'utf8',
  });
  return JSON.parse(out.match(/^RESULT=(.*)$/m)[1]);
}

describe('rspack.config', function () {
  it('pins useDefineForClassFields to false for swc TS emit', function () {
    // swc defaults it true; tsc infers false from tsconfig.build.json's
    // target es5.  The two disagree on a field declared with no
    // initializer: default swc emits _define_property(this, f, void 0)
    // after super(), giving instances own enumerable undefined
    // properties and overwriting values a base constructor assigned.
    // The pin records the intended emit; deleting it would hand the
    // decision back to whatever swc release rspack bundles.
    const value = readConfig(
      `config.module.rules.find(
         r =>
           r.loader === 'builtin:swc-loader' &&
           r.test instanceof RegExp &&
           r.test.source.includes('tsx?')
       ).options.jsc.transform.useDefineForClassFields`
    );
    expect(value).toBe(false);
  });
});
