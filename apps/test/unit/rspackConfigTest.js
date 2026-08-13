import {execFileSync} from 'child_process';
import path from 'path';

// No test runner exercises rspack.config.js (jest transpiles through
// ts-jest, karma bundles with webpack), so behavior the config must
// hold is pinned here — the same guard bundlerBase's resolveBundler
// default has.  The config is inspected in a child node process:
// requiring it under jest would pull @rspack/core, whose ESM dist jest
// cannot parse without transforming node_modules.
function readConfig(expression, env = {}) {
  const script = `
    const config = require('./rspack.config');
    console.log('RESULT=' + JSON.stringify(${expression}));
  `;
  const out = execFileSync(process.execPath, ['-e', script], {
    cwd: path.resolve(__dirname, '../..'),
    encoding: 'utf8',
    // Pin the configuration under test: the .tsx? swc rule exists only
    // when RSPACK_SWC is truthy, so an ambient RSPACK_SWC=0 (set during
    // exactly the bisects this variable is for) would otherwise turn
    // the assertion into a TypeError on undefined.  Devtool variables
    // are cleared for the same reason: each case below states its own.
    env: {
      ...process.env,
      RSPACK_SWC: 'all',
      APPS_DEVTOOL: '',
      APPS_DEVTOOL_SCOPE: '',
      ...env,
    },
  });
  return JSON.parse(out.match(/^RESULT=(.*)$/m)[1]);
}

// The devtool policy in one expression: the chosen devtool, whether the
// scoped-map plugin is present, and what its pattern matches.
const DEVTOOL_PROBE = `(() => {
  const plugin = config.plugins.find(
    x => x.constructor.name.includes('EvalSourceMapDevTool')
  );
  // rspack's plugin wrapper keeps constructor args on _args.
  const re = plugin && plugin._args && plugin._args[0] && plugin._args[0].test;
  const path = require('path');
  const src = f => path.resolve('src', f);
  const nm = f => path.resolve('node_modules', f);
  return {
    devtool: config.devtool,
    hasPlugin: !!plugin,
    matchesSrc: re ? re.test(src('music/entrypoint.ts')) : null,
    matchesNodeModulesSrc: re
      ? re.test(nm('some-package/src/index.js'))
      : null,
  };
})()`;

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
  describe('devtool policy', function () {
    // The dev default is scoped maps over all of src/ — measured
    // cheaper on memory than APPS_DEVTOOL=eval, and never touching
    // node_modules, where the whole-app map modes blow past 22GB.
    // These cases pin the policy from all four sides so a refactor
    // cannot silently widen the maps into node_modules (the OOM) or
    // silently drop them.
    it('defaults dev builds to source maps for src/ only', function () {
      const probe = readConfig(DEVTOOL_PROBE, {DEV: '1'});
      expect(probe.devtool).toBe(false);
      expect(probe.hasPlugin).toBe(true);
      expect(probe.matchesSrc).toBe(true);
      expect(probe.matchesNodeModulesSrc).toBe(false);
    });

    it('APPS_DEVTOOL=eval opts out of maps entirely', function () {
      const probe = readConfig(DEVTOOL_PROBE, {DEV: '1', APPS_DEVTOOL: 'eval'});
      expect(probe.devtool).toBe('eval');
      expect(probe.hasPlugin).toBe(false);
    });

    it('APPS_DEVTOOL_SCOPE narrows instead of widening', function () {
      const probe = readConfig(DEVTOOL_PROBE, {
        DEV: '1',
        APPS_DEVTOOL_SCOPE: 'music',
      });
      expect(probe.hasPlugin).toBe(true);
      expect(probe.matchesSrc).toBe(true); // music/entrypoint.ts is in scope
    });

    it('production keeps its own devtool, no scoped plugin', function () {
      const probe = readConfig(DEVTOOL_PROBE, {NODE_ENV: 'production'});
      expect(probe.devtool).toBe('source-map');
      expect(probe.hasPlugin).toBe(false);
    });
  });
});
