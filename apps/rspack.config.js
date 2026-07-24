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
// Known output gaps vs the webpack build (dev, full entry set), all
// small and none affecting the named entry bundles, which match 1:1:
//   - static/json asset/resource files (10) are not emitted; rspack's
//     builtin json module type appears to win over the asset rule
//   - worker chunks lose their webpack names (pyodide-web-worker-*,
//     input-service-worker-*) and emit under numeric chunk ids
//   - chunk ids differ ('deterministic' here vs webpack 'total-size'),
//     so numeric async chunk filenames do not correspond
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
  PEGASUS_ENTRIES,
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
          ...PEGASUS_ENTRIES,
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
        // RSPACK_SWC=ts replaces only ts-loader.  swc with commonjs modules
        // matches ts-loader's transpileOnly output closely, so this mode is
        // safe.  RSPACK_SWC=all also replaces babel-loader for js/jsx —
        // measurably faster but KNOWN BROKEN at runtime: swc has no
        // add-module-exports, and ~128 legacy files mix `import` with
        // `module.exports =` (e.g. code-studio/initApp/project.js), which
        // babel tolerates and swc does not.  'all' is for timing only until
        // those files are codemodded.
        ...(process.env.RSPACK_SWC === 'all' || process.env.RSPACK_SWC === '1'
          ? [
              {
                test: /\.jsx?$/,
                enforce: 'pre',
                include: [...nodeModulesToTranspile, p('src'), p('test')],
                exclude: [p('src/lodash.js')],
                loader: 'builtin:swc-loader',
                options: {
                  jsc: {
                    parser: {syntax: 'ecmascript', jsx: true},
                    transform: {
                      react: {
                        runtime: 'classic',
                        refresh: !!envConstants.HOT,
                      },
                    },
                    // babel.config.json targets es5 via preset-env with
                    // loose classes; mirror the target.
                    target: 'es5',
                    loose: true,
                  },
                  // babel runs plugin-transform-modules-commonjs, so the
                  // bundler never links strict ESM; mixed CJS/ESM interop
                  // (e.g. the @cdo/locale stubs) depends on that.  Mirror
                  // it, keeping import() dynamic for code splitting and
                  // import.meta intact for worker-chunk detection (see the
                  // ts rule below).
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
      minimizer: [
        // RSPACK-DIFF: swc minifier replaces terser (rust-side, parallel).
        // Exclusions and the safari10 mangle workaround carry over.
        new rspack.SwcJsMinimizerRspackPlugin({
          exclude: [/\/blockly.js$/, /\/brambleHost.js$/],
          minimizerOptions: {
            mangle: {
              safari10: true,
            },
          },
        }),
      ],
      // Single named runtime chunk, same contract as the webpack build:
      // include exactly once per page; entry points share module state
      // through it.  See the long comment in webpack.config.js.
      runtimeChunk: {
        name: 'webpack-runtime',
      },
      splitChunks: process.env.DEV
        ? undefined
        : {
            maxInitialRequests: 100,
            cacheGroups: {
              common: {
                name: 'common',
                minChunks: 2,
                chunks: chunk => {
                  return Object.keys(appsEntries).includes(chunk.name);
                },
              },
              'code-studio-common': {
                name: 'code-studio-common',
                minChunks: 2,
                chunks: chunk => {
                  const chunkNames = Object.keys(CODE_STUDIO_ENTRIES);
                  return chunkNames.includes(chunk.name);
                },
                priority: 10,
              },
              'code-studio-multi': {
                name: 'code-studio-common',
                minChunks: Object.keys(appsEntries).length + 1,
                chunks: chunk => {
                  const chunkNames = Object.keys(CODE_STUDIO_ENTRIES).concat(
                    Object.keys(appsEntries)
                  );
                  return chunkNames.includes(chunk.name);
                },
                priority: 20,
              },
              vendors: {
                name: 'vendors',
                priority: 30,
                chunks: chunk => {
                  const chunkNames = Object.keys({
                    ...appsEntries,
                    ...CODE_STUDIO_ENTRIES,
                    ...INTERNAL_ENTRIES,
                    ...PEGASUS_ENTRIES,
                    ...PROFESSIONAL_DEVELOPMENT_ENTRIES,
                    ...SHARED_ENTRIES,
                  });

                  return chunkNames.includes(chunk.name);
                },
                test(module) {
                  return [
                    '@babel/polyfill/noConflict',
                    '@mui',
                    'immutable',
                    'lodash',
                    'moment',
                    'radium',
                    'react',
                    'react-dom',
                    'wgxpath',
                  ].some(libName =>
                    new RegExp(`/apps/node_modules/${libName}/`).test(
                      module.resource
                    )
                  );
                },
              },
              p5lab: {
                name: 'p5-dependencies',
                priority: 10,
                minChunks: 2,
                chunks: chunk =>
                  ['spritelab', 'gamelab', 'dance'].includes(chunk.name),
                test: module => /p5/.test(module.resource),
              },
            },
          },
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
      new RspackManifestPlugin({
        basePath: 'js/',
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
    // RSPACK-DIFF: under `serve`, @rspack/cli defaults the top-level
    // lazyCompilation option to {imports: true} for web targets.  Its
    // /_rspack/lazy trigger endpoint loses to our catch-all proxy to
    // Rails, so React.lazy chunks 404 and Suspense boundaries crash
    // (first seen in lab2's ProgressContainer).  Disable it; webpack has
    // no such default, so this also keeps timing comparisons honest.
    lazyCompilation: false,
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
              context: ['**'],
              target: 'http://localhost-studio.code.org:3000',
              changeOrigin: false,
              logLevel: 'debug',
            },
          ],
          host: '0.0.0.0',
          hot: envConstants.HOT,
          liveReload: envConstants.HOT,
          devMiddleware: {
            writeToDisk: true,
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

module.exports = createRspackConfig();
