/* eslint-disable import/order */
// Rspack build for apps/, opt-in via `yarn start --rspack` (and the
// grunt --rspack flag / APPS_BUNDLER=rspack that CI uses).
//
// Rspack implements the webpack 5 config surface.  The bundler-agnostic
// build facts — entries, aliases, resolve fallbacks, externals, node
// polyfills, and the splitChunks cacheGroups — live in bundlerBase.js,
// shared with webpack.config.js so the two cannot drift.  This file
// holds what is genuinely rspack's: the swc loader chain and its babel
// parity shims, and rspack builtins or forks in place of webpack-only
// plugins.  Every deliberate divergence is marked RSPACK-DIFF with
// rationale.
//
// Known output differences vs the webpack build: fonts referenced by
// root-relative url('/fonts/...') in CSS are skipped by the css-loader
// url filter below (dashboard serves those paths), and numeric async
// chunk filenames do not correspond ('deterministic' ids here vs
// webpack 'total-size').
//
// Usage:
//   DEV=1 npx rspack build --config rspack.config.js
//   DEV=1 HOT=1 npx rspack serve --config rspack.config.js
const path = require('path');
const pyodide = require('pyodide');
const sass = require('sass');
const rspack = require('@rspack/core');

const {PyodidePlugin} = require('@pyodide/webpack-plugin');
const {RspackManifestPlugin} = require('rspack-manifest-plugin');
const {StatsWriterPlugin} = require('webpack-stats-plugin');
const {TsCheckerRspackPlugin} = require('ts-checker-rspack-plugin');
const {ReactRefreshRspackPlugin} = require('@rspack/plugin-react-refresh');
const ReactRefreshTypeScript = require('react-refresh-typescript');

const envConstants = require('./envConstants');
const {
  DEV_SERVER_PORT,
  devtool,
  APPLICATION_ALIASES,
  LOCALE_ALIASES,
  nodeModulesToTranspile,
  NODE_POLYFILL_PROVIDE,
  NODE_POLYFILL_FALLBACK,
  BUNDLE_EXTERNALS,
  addPolyfillsToEntryPoints,
  makeSplitChunks,
  isKnownCycle,
} = require('./bundlerBase');
const {
  ALL_APPS,
  appsEntriesFor,
  CODE_STUDIO_ENTRIES,
  INTERNAL_ENTRIES,
  PROFESSIONAL_DEVELOPMENT_ENTRIES,
  SHARED_ENTRIES,
  OTHER_ENTRIES,
  LOCALIZATION_ENTRIES,
} = require('./webpackEntryPoints');

const p = (...paths) => path.resolve(__dirname, ...paths);

// RSPACK-DIFF: @pyodide/webpack-plugin subclasses copy-webpack-plugin and
// injects a loader on pyodide.m?js through
// NormalModule.getCompilationHooks().beforeLoaders, a JS compilation hook
// rspack does not expose.  Same effect, declaratively: reuse the copy
// patterns the plugin computes (it stores them on the instance) via
// CopyRspackPlugin, and attach its loader with an ordinary module rule.
const pyodidePlugin = new PyodidePlugin({
  outDirectory: `pyodide/${pyodide.version}`,
});
const pyodideCopyPatterns = pyodidePlugin.patterns;
const pyodideLoader = p('node_modules/@pyodide/webpack-plugin/loader.cjs');

// RSPACK-DIFF: replaces unminified-webpack-plugin, which re-renders
// chunks through webpack internals rspack does not expose.  Same
// effect, declaratively: before the minimizer stage the rendered
// assets are still unminified, so copy the named chunks' main files to
// their bare '<name>.js' filenames and exclude those from the
// minimizer.  Unit tests and the applab exporter read these copies.
class UnminifiedCopiesPlugin {
  constructor(chunkNames) {
    this.chunkNames = new Set(chunkNames);
  }
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('UnminifiedCopies', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'UnminifiedCopies',
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        () => {
          for (const chunk of compilation.chunks) {
            if (!this.chunkNames.has(chunk.name)) {
              continue;
            }
            for (const file of chunk.files) {
              if (!file.endsWith('.js')) {
                continue;
              }
              compilation.emitAsset(
                `${chunk.name}.js`,
                compilation.getAsset(file).source
              );
            }
          }
        }
      );
    });
  }
}

/**
 * Generate the rspack config for building `apps/`.
 * Mirrors createWebpackConfig() in webpack.config.js.
 *
 * @param {Object} appsEntries - defaults to all apps; pass appsEntriesFor(['maze']) for one
 * @param {boolean} minify - whether to minify the output
 * @param {boolean} piskelDevMode - whether to use the piskel dev mode
 * @returns {Object} An rspack config object
 */
function createRspackConfig({
  appsEntries = appsEntriesFor(
    envConstants.APP ? [envConstants.APP] : ALL_APPS
  ),
  minify = false,
  piskelDevMode = false,
} = {}) {
  // RSPACK-DIFF: APPS_DEVTOOL_SCOPE=music,lab2 maps only the named src/
  // path prefixes back to original source (module-level eval maps, no
  // columns — the fidelity of eval-cheap-module-source-map) and leaves
  // every other module unmapped.  A name may be a directory
  // (`p5lab/spritelab`) or a single module (`code-studio/header`, which
  // matches header.js).  Recipes for common working sets are in the
  // README.  rspack's blanket -module map modes exceed 22GB at our
  // module count while this costs less than APPS_DEVTOOL=eval, because
  // unmapped modules skip eval wrapping entirely.  Known rough edge:
  // unmapped modules show numeric internal names in DevTools.
  const devtoolScope =
    !minify && envConstants.APPS_DEVTOOL_SCOPE
      ? envConstants.APPS_DEVTOOL_SCOPE.split(',')
          .map(s => s.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .filter(Boolean)
      : null;
  const scopeRegexFor = name => new RegExp(`src[\\\\/]${name}[\\\\/.]`);
  // RSPACK-DIFF: the dev default is eval — no source maps — where
  // webpack defaults to eval-cheap-module-source-map.  rspack's
  // whole-app -module map modes exceed 22GB at our module count, which
  // kills the process outright on smaller machines (the compilation
  // state lives in Rust, beyond Node heap caps).  An explicit
  // APPS_DEVTOOL or APPS_DEVTOOL_SCOPE overrides.
  const rspackDevtool = devtoolScope
    ? false
    : minify
    ? devtool({minify})
    : envConstants.APPS_DEVTOOL || 'eval';
  // Say which source-map mode is active up front; waiting to notice what
  // symbols look like in DevTools is a bad way to find out.
  if (!minify) {
    if (devtoolScope) {
      console.log(
        `[rspack] source maps: scoped to ${devtoolScope.join(', ')} ` +
          '(match report follows the first compile)'
      );
    } else {
      console.log(
        `[rspack] source maps: ${
          rspackDevtool === 'eval'
            ? 'none (eval, the rspack default)'
            : rspackDevtool
        }` +
          (/-module/.test(String(rspackDevtool))
            ? ' — WARNING: whole-app -module maps exceed 22GB under rspack;' +
              ' prefer APPS_DEVTOOL_SCOPE (see README)'
            : '')
      );
    }
  }
  return {
    output: {
      path: p('build/package/js'),
      publicPath: '/assets/js/',
      // rspack contenthashes are 16 hex (hashDigestLength is not honored
      // for chunk filenames in 2.1.5, and explicit [contenthash:20]
      // panics); the wp-hash consumers — sprockets' WP_REGEX in
      // asset_sync.rake and grunt copy:unhash — accept 16-32 hex.
      filename: `[name]${minify ? 'wp[contenthash].min.js' : '.js'}`,
    },
    stats: envConstants.DEV ? 'normal' : 'errors-only',
    devtool: rspackDevtool,
    entry: {
      ...addPolyfillsToEntryPoints(
        {
          ...appsEntries,
          ...CODE_STUDIO_ENTRIES,
          ...INTERNAL_ENTRIES,
          ...PROFESSIONAL_DEVELOPMENT_ENTRIES,
          ...SHARED_ENTRIES,
          ...OTHER_ENTRIES,
        },
        ['@babel/polyfill/noConflict', 'whatwg-fetch']
      ),
      ...LOCALIZATION_ENTRIES,
    },
    externals: BUNDLE_EXTERNALS,
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallback: {...NODE_POLYFILL_FALLBACK},
      alias: {
        ...APPLICATION_ALIASES,
        ...LOCALE_ALIASES,
        serialport: false,
        '@mui/material': p('node_modules/@mui/material'),
      },
    },
    module: {
      rules: [
        {
          test: /\.ejs$/,
          include: [p('src'), p('test')],
          loader: p('lib/ejs-webpack-loader'),
          options: {
            strict: true,
          },
        },
        // RSPACK-DIFF: replaces the beforeLoaders hook from
        // @pyodide/webpack-plugin (see above).
        {
          test: /node_modules\/pyodide\/pyodide\.js$/,
          loader: pyodideLoader,
          options: {globalLoadPyodide: false, isModule: false},
        },
        {
          test: /node_modules\/pyodide\/pyodide\.mjs$/,
          loader: pyodideLoader,
          options: {globalLoadPyodide: false, isModule: true},
        },
        {
          test: /\.css$/,
          use: [{loader: 'style-loader'}, {loader: 'css-loader'}],
        },
        {
          test: /\.scss$/,
          use: [
            {loader: 'style-loader'},
            {
              loader: 'css-loader',
              options: {
                // RSPACK-DIFF: rspack resolves css-loader's `new URL(...)`
                // output for server-relative urls (e.g. url(/fonts/...))
                // as modules, where webpack leaves them to the browser.
                // Skip them explicitly; dashboard serves those paths.
                url: {
                  filter: url => !url.startsWith('/'),
                },
                modules: {
                  auto: true,
                  localIdentName: process.env.DEV
                    ? '[path][name]__[local]'
                    : '[hash:base64]',
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
                sassOptions: {
                  includePaths: [p('../shared/css')],
                  outputStyle: 'compressed',
                },
              },
            },
          ],
        },
        {test: /\.interpreted.js$/, type: 'asset/source'},
        {test: /\.md$/, type: 'asset/source'},
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          include: [
            p('static'),
            p('src'),
            p('test'),
            p('../dashboard/app/assets/images'),
          ],
          type: 'asset/resource',
          generator: {
            filename: '[name]wp[contenthash:20][ext]',
            outputPath: 'images/',
            publicPath: '/assets/js/images/',
          },
        },
        {
          test: /\.(json)$/,
          include: [p('static', 'json')],
          type: 'asset/resource',
          generator: {
            filename: '[name]wp[contenthash:20][ext]',
            outputPath: 'json/',
            publicPath: '/assets/js/json/',
          },
        },
        // RSPACK-DIFF: no thread-loader.  It exists to parallelize babel on
        // the JS thread under webpack (CI only); rspack parallelizes module
        // processing natively and thread-loader would only add IPC overhead.
        //
        // RSPACK_SWC swaps JS-thread loaders for rspack's built-in rust
        // swc loader.  This is where the order-of-magnitude speedup lives:
        // JS loaders serialize on the node thread even under rspack.
        //
        // RSPACK_SWC=ts replaces only ts-loader; swc with commonjs
        // modules matches ts-loader's transpileOnly output closely.
        // RSPACK_SWC=all also replaces babel-loader for js/jsx, which
        // needs three babel behaviors reproduced (all wired below): the
        // add-module-exports shim loader, sourceType-unambiguous module
        // detection (isModule 'unknown'), and loose classes without
        // loose spread (jsc.assumptions).
        ...(process.env.RSPACK_SWC === 'all' || process.env.RSPACK_SWC === '1'
          ? [
              // The blockly fork cannot take loose class semantics: its
              // accessor setters use `super`, which loose lowering turns
              // into self-dispatch and infinite recursion.  babel carries
              // the same carve-out (babel.config.json overrides
              // node_modules/blockly with transform-classes loose:false);
              // give it spec classes here and exclude it from the loose
              // rule below.
              {
                test: /\.jsx?$/,
                enforce: 'pre',
                include: [p('node_modules/blockly')],
                loader: 'builtin:swc-loader',
                options: {
                  isModule: 'unknown',
                  jsc: {
                    parser: {syntax: 'ecmascript', jsx: true},
                    target: 'es5',
                  },
                  module: {
                    type: 'commonjs',
                    ignoreDynamic: true,
                    preserveImportMeta: true,
                  },
                },
              },
              {
                test: /\.jsx?$/,
                enforce: 'pre',
                include: [...nodeModulesToTranspile, p('src'), p('test')],
                exclude: [p('src/lodash.js'), p('node_modules/blockly')],
                use: [
                  // Post-processes swc output (loaders run bottom-up);
                  // replicates babel-plugin-add-module-exports, which
                  // require() sites across src/ depend on.
                  {loader: p('lib/add-module-exports-shim-loader')},
                  {
                    loader: 'builtin:swc-loader',
                    options: {
                      // babel uses sourceType 'unambiguous': files without
                      // import/export compile as sloppy scripts.  Mirror
                      // it, or swc stamps "use strict" onto legacy CJS
                      // code that assigns to frozen objects at runtime.
                      isModule: 'unknown',
                      jsc: {
                        parser: {syntax: 'ecmascript', jsx: true},
                        transform: {
                          react: {
                            runtime: 'classic',
                            refresh: !!envConstants.HOT,
                          },
                        },
                        // babel.config.json targets es5, with loose
                        // applied ONLY to transform-classes; swc's global
                        // `loose` would also degrade spread to [].concat,
                        // which passes iterables through unexpanded.
                        // These assumptions reproduce babel's loose
                        // classes — methods assigned to the prototype,
                        // enumerable, which CustomMarshalingInterpreter's
                        // for..in marshaling requires — while spread
                        // stays spec-compliant.
                        target: 'es5',
                        assumptions: {
                          setClassMethods: true,
                          constantSuper: true,
                          noClassCalls: true,
                          superIsCallableConstructor: true,
                        },
                      },
                      // babel runs plugin-transform-modules-commonjs, so
                      // the bundler never links strict ESM; mixed CJS/ESM
                      // interop (e.g. the @cdo/locale stubs) depends on
                      // that.  Mirror it, keeping import() dynamic for
                      // code splitting and import.meta intact for
                      // worker-chunk detection (see the ts rule below).
                      module: {
                        type: 'commonjs',
                        ignoreDynamic: true,
                        preserveImportMeta: true,
                      },
                    },
                  },
                ],
              },
            ]
          : [
              {
                test: /\.jsx?$/,
                enforce: 'pre',
                include: [...nodeModulesToTranspile, p('src'), p('test')],
                exclude: [p('src/lodash.js')],
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      cacheDirectory: p('build/babel-cache'),
                      compact: false,
                      ...(envConstants.HOT
                        ? {
                            plugins: [
                              ['react-refresh/babel', {skipEnvCheck: true}],
                            ],
                          }
                        : {}),
                    },
                  },
                ],
              },
            ]),
        ...(process.env.RSPACK_SWC
          ? [
              {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'builtin:swc-loader',
                options: {
                  jsc: {
                    parser: {syntax: 'typescript', tsx: true},
                    transform: {
                      react: {
                        runtime: 'classic',
                        refresh: !!envConstants.HOT,
                      },
                    },
                    target: 'es5',
                    // Class methods must land on the prototype as plain
                    // assignments (enumerable), matching ts-loader's es5
                    // emit: CustomMarshalingInterpreter marshals scope
                    // objects with for..in, so defineProperty-style class
                    // emit hides every method from student code.  Targeted
                    // assumptions instead of global `loose`, which would
                    // also degrade spread-of-iterable semantics.
                    assumptions: {
                      setClassMethods: true,
                      constantSuper: true,
                      noClassCalls: true,
                      superIsCallableConstructor: true,
                    },
                  },
                  // See the jsx rule above: mirror babel's commonjs module
                  // output (tsconfig.build.json module node16 does the same
                  // for ts-loader).  preserveImportMeta keeps
                  // `new URL(..., import.meta.url)` intact so rspack still
                  // detects worker chunks (music patternAiWorker, pyodide);
                  // without it swc lowers import.meta.url to a Node-only
                  // pathToFileURL(__filename) that crashes in the browser.
                  module: {
                    type: 'commonjs',
                    ignoreDynamic: true,
                    preserveImportMeta: true,
                  },
                },
              },
            ]
          : [
              {
                test: /\.tsx?$/,
                use: [
                  {
                    loader: 'ts-loader',
                    options: {
                      // Type checking runs in TsCheckerRspackPlugin, same
                      // split as the webpack build.
                      transpileOnly: true,
                      configFile: 'tsconfig.build.json',
                      happyPackMode: true,
                      getCustomTransformers: () => ({
                        before: envConstants.HOT
                          ? [new ReactRefreshTypeScript()]
                          : [],
                      }),
                    },
                  },
                ],
                exclude: /node_modules/,
              },
            ]),
        ...(process.env.DEV
          ? [
              {
                test: /(blockly\/.*\.js)$/,
                use: ['source-map-loader'],
                enforce: 'pre',
              },
              {
                test: /\.js$/,
                enforce: 'pre',
                include: /frontend\/packages/,
                use: ['source-map-loader'],
              },
            ]
          : []),
      ],
      // RSPACK-DIFF: module.noParse (html2canvas) omitted; rspack has no
      // noParse.  Costs a little parse time for one library.
    },
    ignoreWarnings: [/Failed to parse source map/],
    optimization: {
      // RSPACK-DIFF: webpack uses chunkIds 'total-size' / moduleIds 'size',
      // which rspack does not implement.  Ids only affect output size
      // determinism, not correctness; 'deterministic' is rspack's stable
      // equivalent.
      chunkIds: 'deterministic',
      moduleIds: 'deterministic',
      minimize: minify,
      // RSPACK-DIFF: SwcJsMinimizerRspackPlugin instead of TerserPlugin —
      // rspack's built-in rust minifier.  Same exclusions: blockly and
      // brambleHost break when minified; the unminified copies emitted by
      // UnminifiedCopiesPlugin below must stay unminified.
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({
          exclude: [
            /\/blockly\.js$/,
            /brambleHost\.js$/,
            /^(webpack-runtime|applab-api|gamelab-api)\.js$/,
          ],
          minimizerOptions: {
            // Safari 10.x mangle workaround, as in webpack.config.js
            // [FND-2108 / FND-2109].
            mangle: {safari10: true},
          },
        }),
      ],
      // Single named runtime chunk, same contract as the webpack build:
      // include exactly once per page; entry points share module state
      // through it.  See the long comment in webpack.config.js.
      runtimeChunk: {
        name: 'webpack-runtime',
      },
      // Both configs skip splitChunks in dev (2x-10x slower
      // rebuild+reload) and share the hoisted cacheGroups via
      // bundlerBase.makeSplitChunks.
      splitChunks: process.env.DEV ? undefined : makeSplitChunks(appsEntries),
    },
    mode: minify ? 'production' : 'development',
    infrastructureLogging: {
      level: envConstants.PROFILE_APPS_BUILD ? 'warn' : 'info',
    },
    plugins: [
      new rspack.ProvidePlugin(NODE_POLYFILL_PROVIDE),
      // RSPACK-DIFF: circular-dependency-plugin is a JS plugin driven by
      // per-module hooks; rspack's rust-side CircularCheckRspackPlugin
      // replaces it, honoring circular_dependencies.json the same way
      // webpack's wrapper does — known cycles stay silent, new ones
      // warn.  Membership is checked by isKnownCycle, which tolerates a
      // different rotation or decomposition of an allowlisted tangle —
      // detectors slice the same strongly-connected modules into
      // different simple cycles.  Differences that remain
      // webpack's job: erroring the build on new cycles, and the
      // stale-entry report (this detector sees fewer enumerations, so
      // absence here does not mean an entry is removable).
      new rspack.CircularCheckRspackPlugin({
        exclude: /node_modules|build/,
        onDetected({paths, compilation}) {
          const cycle = paths.map(s => s.replace(/^\.\//, ''));
          if (!isKnownCycle(cycle)) {
            compilation.warnings.push(
              new Error(
                'Circular Dependency Checker : A new Circular Dependency found.\n' +
                  "Known circular dependencies can be found in 'apps/circular_dependencies.json'\n" +
                  ` Circular dependency: ${cycle.join(' -> ')}`
              )
            );
          }
        },
      }),
      ...(envConstants.SKIP_TYPECHECK
        ? []
        : [
            new TsCheckerRspackPlugin({
              typescript: {
                configFile: 'tsconfig.build.json',
                memoryLimit: 2560,
              },
            }),
          ]),
      ...(devtoolScope
        ? [
            new rspack.EvalSourceMapDevToolPlugin({
              module: true,
              columns: false,
              // Names end at a `/` (directory) or `.` (single module,
              // e.g. code-studio/header matching header.js).
              test: new RegExp(
                `src[\\\\/](?:${devtoolScope.join('|')})[\\\\/.]`
              ),
            }),
            // Report which scope names actually matched modules, once
            // after the first compile.  A misspelled name otherwise
            // fails silently, and only per-rebuild tallies would cost
            // anything (this walks the module list a single time).
            {
              apply(compiler) {
                let reported = false;
                compiler.hooks.done.tap('DevtoolScopeReport', stats => {
                  if (reported) return;
                  reported = true;
                  const counts = new Map(devtoolScope.map(n => [n, 0]));
                  for (const m of stats.compilation.modules) {
                    const r =
                      m.resource ||
                      (m.nameForCondition && m.nameForCondition());
                    if (!r) continue;
                    for (const n of devtoolScope) {
                      if (scopeRegexFor(n).test(r)) {
                        counts.set(n, counts.get(n) + 1);
                      }
                    }
                  }
                  const parts = [];
                  for (const [n, c] of counts) {
                    parts.push(
                      `${n.replace(/\\\\/g, '')}: ${c} module${
                        c === 1 ? '' : 's'
                      }`
                    );
                    if (c === 0) {
                      console.warn(
                        `[rspack] APPS_DEVTOOL_SCOPE name "${n.replace(
                          /\\\\/g,
                          ''
                        )}" ` +
                          'matched nothing — check it against src/ (recipes in the README)'
                      );
                    }
                  }
                  console.log(
                    `[rspack] scoped source maps: ${parts.join(', ')}; ` +
                      'everything else is unmapped'
                  );
                });
              },
            },
          ]
        : []),
      new rspack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        IN_STORYBOOK: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(piskelDevMode),
        DEBUG_MINIFIED: envConstants.DEBUG_MINIFIED || 0,
        'process.env.STATSIG_LOCAL_MODE_OFF': JSON.stringify(
          envConstants.STATSIG_LOCAL_MODE_OFF ?? ''
        ),
      }),
      new rspack.CopyRspackPlugin({
        patterns: [
          {
            from: 'build/locales',
            to: '[path][name][ext]',
            toType: 'template',
          },
          minify && {
            from: 'build/locales',
            to: '[path][name]wp[contenthash][ext]',
            toType: 'template',
          },
          {
            context: 'build/minifiable-lib/',
            from: minify ? `**/*.min.js` : '**/*.js',
            to: minify ? '[path][name]wp[contenthash].js' : '[path][name].js',
            toType: 'template',
            globOptions: {
              ignore: minify ? [] : ['*.min.js'],
            },
          },
          ...pyodideCopyPatterns,
        ].filter(entry => !!entry),
      }),
      // RSPACK-DIFF: UnminifiedWebpackPlugin (unminified copies of
      // webpack-runtime/applab-api/gamelab-api for unit tests) is webpack 4
      // era and incompatible; minified builds are out of scope for the
      // prototype.  TODO before any real switch.
      ...(minify
        ? [
            new UnminifiedCopiesPlugin([
              'webpack-runtime',
              'applab-api',
              'gamelab-api',
            ]),
          ]
        : []),
      ...(process.env.DEV
        ? []
        : [
            new StatsWriterPlugin({
              fields: ['assetsByChunkName', 'assets'],
            }),
          ]),
      new RspackManifestPlugin({
        basePath: 'js/',
        // The unminified copies emitted by UnminifiedCopiesPlugin collide
        // with the hashed entries once map() strips the hash; keep them
        // out of the manifest so pages load the minified bundles.  In dev
        // these same names ARE the real entries and must stay.
        filter: file =>
          !minify ||
          !/^(webpack-runtime|applab-api|gamelab-api)\.js$/.test(
            file.path.split('/').pop()
          ),
        map: file => {
          if (minify) {
            file.name = file.name
              .replace(/wp[a-f0-9]{32}\./, '.')
              .replace(/\.min/, '');
          }
          return file;
        },
      }),
      ...(envConstants.HOT ? [new ReactRefreshRspackPlugin()] : []),
    ],
    // RSPACK-DIFF: @rspack/cli defaults this on for web targets under
    // `serve`; set it explicitly so build and serve agree.  Deferring
    // dynamic imports until a page requests them is a small startup
    // win; the /_rspack/lazy trigger endpoint must be excluded from the
    // catch-all proxy below or React.lazy chunks 404 and Suspense
    // boundaries crash.  Entries stay eager: the lazy entry stub is
    // hot-patched in after load, and Rails inline scripts synchronously
    // expect entry globals, so RSPACK_LAZY_ENTRIES=1 is usable only if
    // the middleware learns to stall entry requests until compiled.
    lazyCompilation: {
      imports: !process.env.RSPACK_NO_LAZY,
      entries: !!process.env.RSPACK_LAZY_ENTRIES,
    },
    // Serving over a populated build/package/js makes writeToDisk read
    // and compare the previous output before writing, which dominates
    // startup.  start:rspack removes the js output dir first; the dev
    // server serves from memory, so nothing reads those files before
    // the first compile.
    devServer: envConstants.DEV
      ? {
          allowedHosts: [
            'localhost-studio.code.org',
            'localhost.code.org',
            'localhost.hourofcode.com',
            '.preview.localhost.codeprojects.org',
            'localhost.codeprojects.org',
          ],
          client: {overlay: false},
          port: DEV_SERVER_PORT,
          proxy: [
            {
              context: ['/cable'],
              target: 'ws://localhost-studio.code.org:3000',
              changeOrigin: false,
              logLevel: 'debug',
              ws: true,
            },
            {
              // Everything except rspack's own lazy-compilation trigger
              // endpoint falls through to Rails.
              context: ['**', '!/_rspack/**'],
              target: 'http://localhost-studio.code.org:3000',
              changeOrigin: false,
              logLevel: 'debug',
            },
          ],
          host: '0.0.0.0',
          hot: envConstants.HOT,
          liveReload: envConstants.HOT,
          devMiddleware: {
            // Incremental rebuilds are dominated by rewriting the
            // entry bundles a change invalidates; pages served through
            // this dev server load JS from memory, so RSPACK_NO_WRITE=1
            // skips the disk copy.  On by default for parity: direct
            // :3000 access and anything else reading build/package
            // still needs files.
            writeToDisk: !process.env.RSPACK_NO_WRITE,
          },
        }
      : undefined,
  };
}

/**
 * Same helper as webpack.config.js (spelled correctly this time).
 */

module.exports = createRspackConfig({
  minify: process.env.NODE_ENV === 'production',
});
