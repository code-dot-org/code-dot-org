/* eslint-disable import/order */
// Rspack build for apps/, opt-in via `yarn start --rspack` (and the
// grunt --rspack flag; APPS_BUNDLER=rspack is the env-var form for CI
// and scripts).
//
// Rspack implements the webpack 5 config surface.  The bundler-agnostic
// build facts — aliases, resolve fallbacks, externals, node polyfills,
// and the splitChunks cacheGroups — live in bundlerBase.js, shared with
// webpack.config.js so the two cannot drift; entry definitions are
// likewise shared, from webpackEntryPoints.js.  This file
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
//   NODE_ENV=development DEV=1 npx rspack build --config rspack.config.js
//   (the rspack CLI defaults NODE_ENV to production, which minifies)
//   DEV=1 HOT=1 npx rspack serve --config rspack.config.js
const path = require('path');
const pyodide = require('pyodide');
const sass = require('sass');
const rspack = require('@rspack/core');

const {PyodidePlugin} = require('@pyodide/webpack-plugin');
const {RspackManifestPlugin} = require('rspack-manifest-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
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

// The CLI does not expose which command is running; the argv is the
// reliable signal for gating serve-only behavior.
const IS_SERVE = process.argv.includes('serve');

// RSPACK_SWC selects the transpiler chain: 'all' (the grunt default)
// replaces both babel-loader and ts-loader with builtin swc, 'ts'
// replaces only ts-loader, and the off-values fall back to the full
// babel-loader + ts-loader chain — the comparison run rspackNotice
// invites.  Anything else is normalized to one of those three, so the
// two reads below cannot disagree and hand out babel for JS with swc
// for TS.
const SWC_MODES = {all: 'all', 1: 'all', ts: 'ts'};
const SWC_OFF = ['0', 'false', 'off', 'none', 'babel', ''];
const rawSwc = process.env.RSPACK_SWC;
let RSPACK_SWC = 'all';
if (rawSwc !== undefined) {
  if (SWC_OFF.includes(rawSwc)) {
    RSPACK_SWC = '';
  } else if (Object.hasOwn(SWC_MODES, rawSwc)) {
    RSPACK_SWC = SWC_MODES[rawSwc];
  } else {
    console.warn(
      `[rspack] RSPACK_SWC=${rawSwc} is not one of all, ts, or an off-value ` +
        `(${SWC_OFF.filter(Boolean).join(', ')}); using all.`
    );
  }
}

// RSPACK-DIFF: rspack resolves css-loader's `new URL(...)` output for
// server-relative urls (e.g. url(/fonts/...)) as modules, where
// webpack leaves them to the browser.  Skip them explicitly — dashboard
// serves those paths — in every rule that runs css-loader, so the .css
// and .scss rules cannot drift apart.
const CSS_URL_FILTER = {
  filter: url => !url.startsWith('/'),
};

// RSPACK-DIFF: this dev server injects its logger into any proxy entry
// that lacks one, and its bundled http-proxy-middleware v3 then logs
// every proxied request at info — hundreds of lines per page load.
// Keep warnings and errors; drop the per-request narration.  (The
// legacy logLevel option in webpack.config.js is inert there —
// webpack-dev-server's older middleware does not log requests.)
const quietProxyLogger = {
  info: () => {},
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

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
            // One copy per chunk: emitAsset throws on a name it has
            // already seen, so take the first .js file rather than
            // failing the build if a chunk ever has two.  chunk.files
            // can also name an asset an earlier processAssets hook
            // removed, so the lookup is checked before it is read.
            const file = [...chunk.files].find(f => f.endsWith('.js'));
            const asset = file && compilation.getAsset(file);
            if (asset) {
              compilation.emitAsset(`${chunk.name}.js`, asset.source);
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
  // RSPACK-DIFF: the dev default is source maps for src/ and nothing
  // else — original-source stepping for first-party code, applied with
  // EvalSourceMapDevToolPlugin below (module-level maps, no columns:
  // the fidelity of eval-cheap-module-source-map).  The pattern anchors
  // to this checkout's src/ absolutely, so node_modules — over half the
  // module graph, including any package that ships its own src/
  // directory — is never mapped; the whole-app map modes differ from
  // this default exactly by mapping it, which is what blows past 25GB
  // (a one-shot build forced to full maps was OOM-killed on a 30GB
  // machine).  Measured against APPS_DEVTOOL=eval on the same box:
  // lower steady and peak memory (unmapped modules skip eval wrapping),
  // ~2s more per shared-file rebuild, and memory stays level under
  // sustained editing instead of growing with each rebuild.  An
  // explicit APPS_DEVTOOL (e.g. =eval) overrides, and so
  // do the two ambient signals the shared devtool() helper decides on:
  // CI builds stay map-free (webpack policy, deliberate there) and
  // DEBUG_MINIFIED keeps its full-fidelity maps.
  const srcMapsDefault =
    !minify &&
    !envConstants.APPS_DEVTOOL &&
    !process.env.CI &&
    !process.env.DEBUG_MINIFIED;
  // Unlike devtool(), which puts CI first, an explicit APPS_DEVTOOL
  // outranks CI here: someone who sets it on a CI box asked for it.
  const rspackDevtool = srcMapsDefault
    ? false
    : minify
    ? devtool({minify})
    : envConstants.APPS_DEVTOOL || devtool({minify: false});
  // Say which source-map mode is active up front; waiting to notice what
  // symbols look like in DevTools is a bad way to find out.
  if (!minify) {
    if (srcMapsDefault) {
      console.log(
        '[rspack] source maps: src/ (the default) — original-source ' +
          'stepping for first-party code'
      );
    } else {
      // Every whole-app map mode deserves the warning: the -module
      // modes measured >22GB, and eval-source-map (DEBUG_MINIFIED's
      // choice) is heavier still — full columns plus original source.
      console.log(
        `[rspack] source maps: ${
          rspackDevtool === 'eval' ? 'none (eval)' : rspackDevtool
        }` +
          (rspackDevtool !== 'eval'
            ? ' — WARNING: whole-app maps measured >22GB under rspack;' +
              ' the src/ default avoids this (see README)'
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
      // asset_sync.rake and grunt copy:unhash — both accept 16 hex.
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
          use: [
            {loader: 'style-loader'},
            {loader: 'css-loader', options: {url: CSS_URL_FILTER}},
          ],
        },
        {
          test: /\.scss$/,
          use: [
            {loader: 'style-loader'},
            {
              loader: 'css-loader',
              options: {
                url: CSS_URL_FILTER,
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
        ...(RSPACK_SWC === 'all'
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
                use: [
                  // babel applies add-module-exports to blockly too (its
                  // override there changes only class looseness), so the
                  // shim runs here as well.  It is a no-op while the
                  // package resolves to script-classified
                  // *_compressed.js, and parity the moment one does not.
                  {loader: p('shims/add-module-exports-shim-loader')},
                  {
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
                ],
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
                  {loader: p('shims/add-module-exports-shim-loader')},
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
        ...(RSPACK_SWC
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
                      // Pin to keep output the same regardless of whether we are using swc
                      // or tsc to transpile ts/tsx. swc defaults this to true; tsc infers false
                      // from tsconfig.build.json's `target: es5`.
                      useDefineForClassFields: false,
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
          // TODO(rspack-default): webpack fails the build on a new
          // cycle; this warns.  Promote to compilation.errors before
          // rspack becomes the default bundler.
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
      ...(srcMapsDefault
        ? [
            new rspack.EvalSourceMapDevToolPlugin({
              module: true,
              columns: false,
              // A string is an anchored path prefix to rspack; the
              // trailing separator keeps a sibling like src-extra/ out.
              test: p('src') + path.sep,
            }),
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
      // webpack-bundle-analyzer reads compilation stats, which rspack
      // produces in the same shape; `yarn build:analyze --rspack` works
      // like the webpack version.
      ...(process.env.ANALYZE_BUNDLE
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              excludeAssets: [...Object.keys(INTERNAL_ENTRIES)],
            }),
          ]
        : []),
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
      // Unminified copies of the chunks the exporters and unit tests
      // read; see UnminifiedCopiesPlugin above.
      ...(minify
        ? [
            new UnminifiedCopiesPlugin([
              'webpack-runtime',
              'applab-api',
              'gamelab-api',
            ]),
          ]
        : []),
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
              .replace(/wp[a-f0-9]{16,32}\./, '.')
              .replace(/\.min/, '');
          }
          return file;
        },
      }),
      ...(envConstants.HOT ? [new ReactRefreshRspackPlugin()] : []),
    ],
    // RSPACK-DIFF: lazy compilation is declared for `serve` only,
    // because that is the only command that honors it — a one-shot build
    // ignores the option and emits real modules either way, measured as
    // identical wall and CPU time with it and without.  Under serve,
    // deferring
    // dynamic imports until a page requests them is a small startup
    // win, and that endpoint must be excluded from the catch-all proxy
    // below or React.lazy chunks 404 and Suspense boundaries crash.
    // Entries stay eager: the lazy entry stub is hot-patched in after
    // load, and Rails inline scripts synchronously expect entry
    // globals, so RSPACK_LAZY_ENTRIES=1 is usable only if the
    // middleware learns to stall entry requests until compiled.
    ...(IS_SERVE
      ? {
          lazyCompilation: {
            imports: !process.env.RSPACK_NO_LAZY,
            entries: !!process.env.RSPACK_LAZY_ENTRIES,
            // Without this the compile stub calls its own page's
            // origin, so a page served straight from Rails asks Rails
            // for the compile endpoint and every dynamic import 404s.
            serverUrl: `http://localhost-studio.code.org:${DEV_SERVER_PORT}`,
          },
        }
      : {}),
    // Serving over a populated build/package/js makes writeToDisk read
    // and compare the previous output before writing, which dominates
    // startup.  prepareBundlerOutputDir in the Gruntfile empties the
    // output dir before serve starts; the dev server serves from
    // memory, so nothing reads those files before the first compile.
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
          // Lazy-compilation stubs on a Rails-served :3000 page call
          // this server cross-origin (see serverUrl above).
          headers: {'Access-Control-Allow-Origin': '*'},
          port: DEV_SERVER_PORT,
          proxy: [
            {
              context: ['/cable'],
              target: 'ws://localhost-studio.code.org:3000',
              changeOrigin: false,
              ws: true,
              logger: quietProxyLogger,
            },
            {
              // Everything except rspack's own lazy-compilation trigger
              // endpoint falls through to Rails.
              context: ['**', '!/_rspack/**'],
              target: 'http://localhost-studio.code.org:3000',
              changeOrigin: false,
              logger: quietProxyLogger,
            },
          ],
          host: '0.0.0.0',
          hot: envConstants.HOT,
          liveReload: envConstants.HOT,
          devMiddleware: {
            // Incremental rebuilds are dominated by rewriting the
            // entry bundles a change invalidates; pages served through
            // this dev server load JS from memory, so RSPACK_NO_WRITE=1
            // skips the disk copy.  On by default because anything else
            // reading build/package still needs files.  What lands there
            // is what this compilation produced, so with lazy
            // compilation on, a dynamic-import chunk nobody has
            // requested yet has nothing to write: use RSPACK_NO_LAZY=1
            // if pages will be loaded straight from Rails on :3000 while
            // this server owns the output directory.
            writeToDisk: !process.env.RSPACK_NO_WRITE,
          },
        }
      : undefined,
  };
}

module.exports = createRspackConfig({
  minify: process.env.NODE_ENV === 'production',
  // The Gruntfile forwards its --piskel-dev option as PISKEL_DEV, since
  // this config is loaded in a child process and cannot see grunt options.
  piskelDevMode: !!process.env.PISKEL_DEV,
});
