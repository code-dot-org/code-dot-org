// Timing harness for "rung 1" experiments: cheap wins inside the existing
// webpack build, no bundler change.  Wraps the production config factory and
// layers each lever behind an env flag so they can be measured separately:
//
//   WEBPACK_FS_CACHE=1  - persistent filesystem cache (survives restarts;
//                         the second run measures a warm relaunch)
//   WEBPACK_SWC=1       - swc-loader in place of babel-loader/ts-loader
//   WEBPACK_LAZY=1      - experiments.lazyCompilation (dev-server only:
//                         entries compile on first request; meaningless for
//                         one-shot builds)
//
//   DEV=1 SKIP_TYPECHECK=1 WEBPACK_FS_CACHE=1 npx webpack --config webpack.rung1.config.js
const path = require('path');

const {createWebpackConfig} = require('./webpack.config');

const p = (...paths) => path.resolve(__dirname, ...paths);

const config = createWebpackConfig();

if (process.env.WEBPACK_FS_CACHE) {
  config.cache = {
    type: 'filesystem',
    cacheDirectory: p('build/webpack-cache'),
    // An uncompressed cache for this build is several GB; gzip trades a
    // little CPU on write/read for ~3-4x less disk.
    compression: 'gzip',
    // The config itself participates in the cache key; a config edit
    // invalidates the whole cache rather than serving stale output.
    buildDependencies: {
      config: [__filename, p('webpack.config.js')],
    },
  };
}

if (process.env.WEBPACK_SWC) {
  // Same caveat as rspack.config.js RSPACK_SWC: swc does not run our babel
  // plugin set, so output semantics are unverified.  Timing only.
  // module commonjs mirrors babel's plugin-transform-modules-commonjs; the
  // codebase's CJS/ESM interop (e.g. @cdo/locale stubs) depends on never
  // linking strict ESM.  ignoreDynamic keeps import() for code splitting.
  const swcJsRule = {
    loader: 'swc-loader',
    options: {
      jsc: {
        parser: {syntax: 'ecmascript', jsx: true},
        transform: {react: {runtime: 'classic'}},
        target: 'es5',
        loose: true,
      },
      module: {type: 'commonjs', ignoreDynamic: true},
    },
  };
  const swcTsRule = tsx => ({
    loader: 'swc-loader',
    options: {
      jsc: {
        parser: {syntax: 'typescript', tsx},
        transform: {react: {runtime: 'classic'}},
        target: 'es5',
      },
      module: {type: 'commonjs', ignoreDynamic: true},
    },
  });
  config.module.rules = config.module.rules
    .map(rule => {
      if (!rule.test) return rule;
      if (String(rule.test) === String(/\.jsx?$/)) {
        return {...rule, use: [swcJsRule]};
      }
      if (String(rule.test) === String(/\.tsx?$/)) {
        // swc keys tsx parsing off the option, not the extension; split the
        // rule so .ts files do not get tsx parsing (breaks generics vs jsx).
        return [
          {...rule, test: /\.ts$/, use: [swcTsRule(false)]},
          {...rule, test: /\.tsx$/, use: [swcTsRule(true)]},
        ];
      }
      return rule;
    })
    .flat();
}

if (process.env.WEBPACK_LAZY) {
  config.experiments = {
    ...config.experiments,
    lazyCompilation: {
      // Entries stay eager: Rails inline scripts synchronously expect
      // entry globals, and the lazy stub + hot-patch flow races them.
      entries: false,
      imports: true,
    },
  };
}

module.exports = config;
