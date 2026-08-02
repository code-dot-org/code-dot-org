/* eslint-disable import/order */
// Rspack translation of webpack.config.js.  PROTOTYPE: measures whether
// rspack can build apps/ unchanged and how fast; not yet wired into grunt,
// karma, or CI.
//
// Rspack implements the webpack 5 config surface, so entries, aliases,
// resolve fallbacks, loaders (including our custom EJS loader), externals,
// the named webpack-runtime chunk, and the splitChunks cacheGroups carry
// over verbatim from webpack.config.js.  Webpack-only plugins are swapped
// for rspack builtins or their rspack forks.  Every deliberate divergence
// is marked RSPACK-DIFF with rationale.
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
  devtool,
  APPLICATION_ALIASES,
  LOCALE_ALIASES,
  nodeModulesToTranspile,
} = require('./webpack.config');
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

const DEV_SERVER_PORT = 9000;

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
  return {
    output: {
      path: p('build/package/js'),
      publicPath: '/assets/js/',
      filename: `[name]${minify ? 'wp[contenthash].min.js' : '.js'}`,
    },
    stats: envConstants.DEV ? 'normal' : 'errors-only',
    devtool: devtool({minify}),
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
    externals: [
      {
        // jQuery and qtip2 are provided globally by dashboard's
        // application.js; see webpack.config.js for the full story.
        jquery: 'var $',
        qtip2: 'var $',
      },
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallback: {
        buffer: require.resolve('buffer/'),
        events: require.resolve('events/'),
        path: require.resolve('path-browserify'),
        'process/browser': require.resolve('process/browser'),
        stream: require.resolve('stream-browserify'),
        timers: require.resolve('timers-browserify'),
        crypto: false,
        vm: require.resolve('vm-browserify'),
      },
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
              {
                test: /\.jsx?$/,
                enforce: 'pre',
                include: [...nodeModulesToTranspile, p('src'), p('test')],
                exclude: [p('src/lodash.js')],
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
      // RSPACK-DIFF: the `chunks` callbacks are hot — rspack invokes them
      // from rust far more often than webpack does, and profiling showed
      // Object.keys(...).includes(...) per call dominating the whole
      // production build.  Hoist each group's name set and test with
      // Set.has.
      splitChunks: process.env.DEV
        ? undefined
        : (() => {
            const appsEntryNames = new Set(Object.keys(appsEntries));
            const p5EntryNames = new Set(['spritelab', 'gamelab', 'dance']);
            const codeStudioNames = new Set(Object.keys(CODE_STUDIO_ENTRIES));
            const codeStudioAndApps = new Set([
              ...codeStudioNames,
              ...appsEntryNames,
            ]);
            const vendorLibRegexes = [
              '@babel/polyfill/noConflict',
              '@mui',
              'immutable',
              'lodash',
              'moment',
              'radium',
              'react',
              'react-dom',
              'wgxpath',
            ].map(libName => new RegExp(`/apps/node_modules/${libName}/`));
            const vendorEntryNames = new Set([
              ...appsEntryNames,
              ...codeStudioNames,
              ...Object.keys(INTERNAL_ENTRIES),
              ...Object.keys(PROFESSIONAL_DEVELOPMENT_ENTRIES),
              ...Object.keys(SHARED_ENTRIES),
            ]);
            return {
              maxInitialRequests: 100,
              cacheGroups: {
                common: {
                  name: 'common',
                  minChunks: 2,
                  chunks: chunk => appsEntryNames.has(chunk.name),
                },
                'code-studio-common': {
                  name: 'code-studio-common',
                  minChunks: 2,
                  chunks: chunk => codeStudioNames.has(chunk.name),
                  priority: 10,
                },
                'code-studio-multi': {
                  name: 'code-studio-common',
                  minChunks: appsEntryNames.size + 1,
                  chunks: chunk => codeStudioAndApps.has(chunk.name),
                  priority: 20,
                },
                vendors: {
                  name: 'vendors',
                  priority: 30,
                  chunks: chunk => vendorEntryNames.has(chunk.name),
                  test: module =>
                    vendorLibRegexes.some(r => r.test(module.resource)),
              },
                p5lab: {
                  name: 'p5-dependencies',
                  priority: 10,
                  minChunks: 2,
                  chunks: chunk => p5EntryNames.has(chunk.name),
                  test: module => /p5/.test(module.resource),
                },
              },
            };
          })(),
    },
    mode: minify ? 'production' : 'development',
    infrastructureLogging: {
      level: envConstants.PROFILE_APPS_BUILD ? 'warn' : 'info',
    },
    plugins: [
      new rspack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        events: 'events',
        stream: 'stream-browserify',
        path: 'path-browserify',
        process: 'process/browser',
        timers: 'timers-browserify',
      }),
      // RSPACK-DIFF: circular-dependency-plugin is a JS plugin driven by
      // per-module hooks; rspack's rust-side CircularDependencyRspackPlugin
      // replaces it.  Wiring circular_dependencies.json's allowlist protocol
      // into it needs a pass of its own, so the prototype detects but does
      // not fail; the webpack build remains the enforcement point.
      ...(rspack.CircularDependencyRspackPlugin
        ? [
            new rspack.CircularDependencyRspackPlugin({
              exclude: /node_modules|build/,
              failOnError: false,
              allowAsyncCycles: false,
            }),
          ]
        : []),
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
function addPolyfillsToEntryPoints(entries, polyfills) {
  return Object.fromEntries(
    Object.entries(entries).map(([entryName, paths]) => [
      entryName,
      [].concat(polyfills).concat(paths),
    ])
  );
}

module.exports = createRspackConfig({
  minify: process.env.NODE_ENV === 'production',
});
