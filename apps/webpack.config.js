/* eslint-disable import/order */
const path = require('path');
var pyodide = require('pyodide');
const sass = require('sass');
const webpack = require('webpack');

// Webpack Plugins:
const {PyodidePlugin} = require('@pyodide/webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const TerserPlugin = require('terser-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const {StatsWriterPlugin} = require('webpack-stats-plugin');

const circularDependencies = require('./circular_dependencies.json');
const envConstants = require('./envConstants');
const {
  ALL_APPS,
  appsEntriesFor,
  CODE_STUDIO_ENTRIES,
  INTERNAL_ENTRIES,
  PEGASUS_ENTRIES,
  PROFESSIONAL_DEVELOPMENT_ENTRIES,
  SHARED_ENTRIES,
  OTHER_ENTRIES,
} = require('./webpackEntryPoints');

const WEBPACK_DEV_SERVER_PORT = 9000;

const p = (...paths) => path.resolve(__dirname, ...paths);

// Certain packages ship in ES6 and need to be transpiled for our purposes.
const nodeModulesToTranspile = [
  // All of our @cdo- and @dsco_-aliased files should get transpiled as they are our own
  // source files.
  '@cdo',
  '@dsco_',
  // playground-io ships in ES6 as of 0.3.0
  'playground-io',
  'json-parse-better-errors',
  '@blockly/field-grid-dropdown',
  '@blockly/keyboard-navigation',
  '@blockly/plugin-scroll-options',
  '@blockly/field-angle',
  '@blockly/field-bitmap',
  'blockly',
  '@code-dot-org/dance-party',
  '@code-dot-org/johnny-five',
  '@code-dot-org/remark-plugins',
  'firmata',
  // parse5 ships in ES6: https://github.com/inikulin/parse5/issues/263#issuecomment-410745073
  'parse5',
  'vmsg',
  'ml-knn',
  'ml-array-max',
  'ml-array-min',
  'ml-array-rescale',
  'ml-distance-euclidean',
  '@codemirror',
  'style-mod',
  '@lezer',
  'microsoft-cognitiveservices-speech-sdk',
  'slate',
  'react-loading-skeleton',
  'unified',
].map(path => p('node_modules', path));

// As of Webpack 5, Node APIs are no longer automatically polyfilled.
// resolve.fallback resolves the API to its NPM package, and the plugin
// makes the API available as a global.

// map our circular dependency JSON to a set.
const circularDependenciesSet = new Set(circularDependencies);

// as we see our known circular dependencies, we're gonna remove them from our list. That way,
// we can report at the end if any circular dependencies have been cleaned up.
let seenCircles = new Set();
let numUnresolvedCircles = 0;
const nodePolyfillConfig = {
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      events: 'events',
      stream: 'stream-browserify',
      path: 'path-browserify',
      process: 'process/browser',
      timers: 'timers-browserify',
    }),
    new CircularDependencyPlugin({
      // ignore everything in a build directory or mode_modules
      exclude: /node_modules|build/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
      // when we start, we re-initialize our list of previously seen circles to whatever
      // we loaded from circular_depencies.json. If that file changes and you need to update, restart
      // webpack
      onStart: () => {
        seenCircles.clear();
        seenCircles = new Set(Array.from(circularDependenciesSet));
      },
      onDetected: ({module: webpackModuleRecord, paths, compilation}) => {
        const pathString = paths.join(' -> ');
        // if the path is not a known existing one, then note as an error
        if (!circularDependenciesSet.has(pathString)) {
          numUnresolvedCircles++;
          compilation.errors.push(
            new Error(
              `Circular Dependency Checker : A new Circular Dependency found.\nKnown circular dependencies can be found in 'apps/circular_dependencies.json'\n Circular dependency: ${pathString}`
            )
          );
        }
        // and since we've seen that path, we can delete it from our set of seen values
        seenCircles.delete(pathString);
      },
      // finally, at the end, if we still have any circles that we previously knew about but did not see
      // this time, note it as a warning.
      onEnd: ({compilation}) => {
        if (numUnresolvedCircles > 0) {
          compilation.warnings.push(
            new Error(
              `Circular Dependency Checker : Number of total unresolved circular dependencies (see errors below): ${numUnresolvedCircles}`
            )
          );
        }
        if (seenCircles.size > 0) {
          compilation.warnings.push(
            new Error(
              `Circular Dependency Checker : ${
                Array.from(seenCircles).length
              } resolved circular dependencies can be removed from circular_dependencies.json :\n  ${Array.from(
                seenCircles
              ).join('\n  ')}`
            )
          );
        }
      },
    }),
  ],
  resolve: {
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
  },
};

function devtool({minify} = {}) {
  if (process.env.CI) {
    return 'eval';
  } else if (minify) {
    return 'source-map';
  } else if (process.env.DEBUG_MINIFIED) {
    return 'eval-source-map';
  } else if (process.env.DEV) {
    return 'eval-source-map';
  } else {
    return 'inline-source-map';
  }
}

// alias '@cdo/aichat/locale' => 'src/aichat/locale-do-not-import.js'
const localeDoNotImport = (cdo, dir = 'src') => [
  cdo,
  p(cdo.replace(/^@cdo/, dir).replace(/locale$/, 'locale-do-not-import.js')),
];
// alias '@cdo/gamelab/locale' => 'src/p5lab/locale-do-not-import.js'
const localeDoNotImportP5Lab = (cdo, dir = 'src') => [
  cdo,
  localeDoNotImport(cdo.replace(/^@cdo/, `${dir}/p5lab`)),
];

const APPLICATION_ALIASES = {
  '@cdo/apps': p('src'),
  '@cdo/static': p('static'),
  repl: p('src/noop'),
  '@cdo/storybook': p('.storybook'),
  '@cdoide': p('src/weblab2/CDOIDE'),
  '@cdo/generated-scripts': p('generated-scripts'),
  '@codebridge': p('src/codebridge'),
};

const LOCALE_ALIASES = {
  '@cdo/locale': path.resolve(__dirname, 'src/util/locale-do-not-import.js'),
  ...Object.fromEntries([
    localeDoNotImport('@cdo/aichat/locale'),
    localeDoNotImport('@cdo/applab/locale'),
    localeDoNotImport('@cdo/codebridge/locale'),
    localeDoNotImport('@cdo/javalab/locale'),
    localeDoNotImport('@cdo/music/locale'),
    localeDoNotImport('@cdo/netsim/locale'),
    localeDoNotImport('@cdo/regionalPartnerMiniContact/locale'),
    localeDoNotImport('@cdo/regionalPartnerSearch/locale'),
    localeDoNotImport('@cdo/standaloneVideo/locale'),
    localeDoNotImport('@cdo/tutorialExplorer/locale'),
    localeDoNotImport('@cdo/weblab/locale'),
    localeDoNotImportP5Lab('@cdo/gamelab/locale'),
    localeDoNotImportP5Lab('@cdo/poetry/locale'),
    localeDoNotImportP5Lab('@cdo/spritelab/locale'),
  ]),
};

const WEBPACK_ALIASES = {
  ...APPLICATION_ALIASES,
  ...LOCALE_ALIASES,
};

// Our base webpack config, from which our other webpack configs are derived,
// including our main config, the karma config, and the storybook config.
//
// To find our main webpack config (that runs on e.g. `yarn build`),
// see `createWebpackConfig()` below. That function extends this config
// with many more plugins etc.
const WEBPACK_BASE_CONFIG = {
  plugins: [
    ...nodePolyfillConfig.plugins,
    // Run TypeScript type checking in parallel with the build
    new ForkTsCheckerWebpackPlugin({
      // tsconfig.build.json only type-checks TypeScript files.
      typescript: {configFile: 'tsconfig.build.json'},
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {...nodePolyfillConfig.resolve.fallback},
    alias: {
      ...WEBPACK_ALIASES,
      serialport: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        include: [p('src'), p('test')],
        loader: './lib/ejs-webpack-loader',
        options: {
          strict: true,
        },
      },
      {test: /\.css$/, use: [{loader: 'style-loader'}, {loader: 'css-loader'}]},

      {
        test: /\.scss$/,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: {
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
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        include: [
          p('static'),
          p('src'),
          p('test'),
          p('../dashboard/app/assets/images'),
        ],
        type: 'asset/inline',
      },
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        include: [...nodeModulesToTranspile, p('src'), p('test')],
        exclude: [p('src/lodash.js')],
        loader: 'babel-loader',
        options: {
          cacheDirectory: p('build/babel-cache'),
          compact: false,
          ...(envConstants.HOT
            ? {plugins: [['react-refresh/babel', {skipEnvCheck: true}]]}
            : {}),
        },
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // Half the build time was waiting for ts-loader to typecheck.
              // Instead we typecheck in parallel using ForkTsCheckerWebpackPlugin
              transpileOnly: true,
              configFile: 'tsconfig.build.json',
              getCustomTransformers: () => ({
                before: envConstants.HOT ? [new ReactRefreshTypeScript()] : [],
              }),
            },
          },
        ],
        exclude: /node_modules/,
      },
      ...(process.env.DEV
        ? [
            // Enable source maps locally for Blockly for easier debugging.
            {
              test: /(blockly\/.*\.js)$/,
              use: ['source-map-loader'],
              enforce: 'pre',
            },
          ]
        : []),
    ],
    noParse: [/html2canvas/],
  },
  // Ignore spurious warnings from source-map-loader.
  // It can't find source maps for some Closure modules in Blockly and that is expected.
  ignoreWarnings: [/Failed to parse source map/],
};

/**
 * Adds pollyfills to each entrypoint (before the existing path(s))
 *
 * @param {Object[]} entries - same format as the webpack config `entry` property
 * @param {String[]} pollyfills - prepends the pollyfills to each entrypoint (before the existing paths)
 */
function addPollyfillsToEntryPoints(entries, polyfills) {
  return Object.fromEntries(
    Object.entries(entries).map(([entryName, paths]) => [
      entryName,
      [].concat(polyfills).concat(paths),
    ])
  );
}

/**
 * Generate the primary webpack config for building `apps/`.
 * Extends `WEBPACK_BASE_CONFIG` from above.
 *
 * Invoked by `Gruntfile.js` for `yarn start`, `yarn build`, etc
 *
 * @param {Object} appEntries - defaults to building all apps, to build only one app pass in e.g. `appEntriesFor('maze')`
 * @param {boolean} minify - whether to minify the output
 * @param {boolean} piskelDevMode - whether to use the piskel dev mode
 * @returns {Object} A webpack config object for building `apps/`
 */
function createWebpackConfig({
  appsEntries = appsEntriesFor(ALL_APPS),
  minify = false,
  piskelDevMode = false,
} = {}) {
  //////////////////////////////////////////////
  ///////// WEBPACK CONFIG BEGINS HERE /////////
  //////////////////////////////////////////////

  const WEBPACK_CONFIG = {
    output: {
      path: path.resolve(__dirname, 'build/package/js/'),
      publicPath: '/assets/js/',
      // When minifying, this generates a 20-hex-character hash.
      filename: `[name]${minify ? 'wp[contenthash].min.js' : '.js'}`,
    },
    // Don't output >1000 lines of webpack build stats to the CI logs
    stats: envConstants.DEV ? 'normal' : 'errors-only',
    devtool: devtool({minify}),
    entry: addPollyfillsToEntryPoints(
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
    externals: [
      {
        jquery: 'var $',
        // qtip2 doesn't actually export anything - it's a jquery extension
        // and modifies the jquery object when present.
        // We also want to be free to import 'qtip2' in our code (for tests)
        // without including a copy of it in our release bundles since it's
        // already provided by application.js.
        // Therefore we include it as an external here (which keeps us from
        // including the library in release bundles) but we map it to the
        // jquery object, which will always be available when we are depending
        // on qtip.  Tests skip this 'external' configuration and load the
        // npm-provided copy of qtip2.
        qtip2: 'var $',
      },
    ],
    optimization: {
      chunkIds: 'total-size',
      moduleIds: 'size',
      minimize: minify,
      minimizer: [
        new TerserPlugin({
          parallel: 4,
          // Excludes these from minification to avoid breaking functionality,
          // but still adds .min to the output filename suffix.
          exclude: [/\/blockly.js$/, /\/brambleHost.js$/],
          terserOptions: {
            sourceMap: envConstants.DEBUG_MINIFIED,
            // Handle Safari 10.x issues: [See FND-2108 / FND-2109]
            // Can remove when we can safely drop support for older iPad/iOS.
            mangle: {
              safari10: true,
            },
          },
        }),
      ],

      // We use a single, named runtimeChunk in order to be able to load
      // multiple webpack entry points on a single page. **The resulting
      // 'webpack-runtime' chunk must be included exactly once on each page
      // which includes webpack entry points.** If you do not include the
      // runtime, webpack entry points you include will not be loaded. If you
      // include the runtime twice, webpack entry points will be loaded twice.
      //
      // Without a single, named runtimeChunk there would be no runtimeChunk
      // to include, and entry points would load and run separately.
      // However, those entry points would create separate instances of any
      // shared modules. This would mean that state within webpack modules
      // cannot be shared between entry points, breaking many assumptions made
      // by our application. For more information, see:
      // https://webpack.js.org/concepts/manifest/#runtime
      // https://webpack.js.org/configuration/optimization/#optimizationruntimechunk
      //
      // In the future, if we can limit ourselves to one webpack entry point
      // per page, we could consider removing the runtimeChunk config.
      runtimeChunk: {
        name: 'webpack-runtime',
      },

      // Using splitChunks and/or StatsWriterPlugin in dev mode increases rebuild+reload time
      // by 2x-10x. See: https://github.com/code-dot-org/code-dot-org/pull/55707
      splitChunks: process.env.DEV
        ? undefined
        : {
            // Override the default limit of 3 concurrent downloads on page load,
            // which only makes sense for HTTP 1.1 servers. HTTP 2 performance has
            // been observed to degrade only with > 200 simultaneous downloads.
            maxInitialRequests: 100,
            cacheGroups: {
              // Pull any module shared by 2+ appsEntries into the "common" chunk.
              common: {
                name: 'common',
                minChunks: 2,
                chunks: chunk => {
                  return Object.keys(appsEntries).includes(chunk.name);
                },
              },
              // Pull any module shared by 2+ CODE_STUDIO_ENTRIES into the
              // "code-studio-common" chunk.
              'code-studio-common': {
                name: 'code-studio-common',
                minChunks: 2,
                chunks: chunk => {
                  const chunkNames = Object.keys(CODE_STUDIO_ENTRIES);
                  return chunkNames.includes(chunk.name);
                },
                priority: 10,
              },
              // With just the cacheGroups listed above, we end up with many
              // duplicate modules between the "common" and "code-studio-common"
              // chunks. The next cache group eliminates some of this duplication
              // by pulling more modules from "common" into "code-studio-common".
              //
              // The use of minChunks provides a guarantee that we don't
              // unnecessarily move things into "code-studio-common" which are
              // needed only by appsEntries. This avoids increasing the download
              // size for code studio pages which include code-studio-common.js
              // but not common.js.
              //
              // There is no converse guarantee that this strategy will eliminate
              // all duplication between "common" and "code-studio-common".
              // However, at the time of this writing, bundle analysis indicates
              // that is currently effective in eliminating any duplication.
              //
              // In the future, we want to move toward asynchronous imports, which
              // allow webpack to manage bundle splitting and sharing behind the
              // scenes. Once we adopt this approach, the need for predefined
              // cacheGroups will go away.
              //
              // For more information see: https://webpack.js.org/guides/code-splitting/
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
                  // all 'initial' chunks except OTHER_ENTRIES
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
                    'immutable',
                    'lodash',
                    'moment',
                    'pepjs',
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
    plugins: [
      ...WEBPACK_BASE_CONFIG.plugins,
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        IN_STORYBOOK: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(piskelDevMode),
        DEBUG_MINIFIED: envConstants.DEBUG_MINIFIED || 0,
      }),
      ...(process.env.ANALYZE_BUNDLE
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              excludeAssets: [...Object.keys(INTERNAL_ENTRIES)],
            }),
          ]
        : []),
      // The [contenthash] placeholder generates a 32-character hash when
      // used within the copy plugin.
      new CopyPlugin({
        patterns: [
          // Always include unhashed locale files in the package, since unit
          // tests rely on these in both minified and unminified environments.
          // The order of these rules is important to ensure that the hashed
          // locale files appear in the manifest when minifying.
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
          // Libraries in this directory are assumed to have .js and .min.js
          // copies of each source file. In development mode, copy only foo.js.
          // In production mode, copy only foo.min.js and rename it to foo.js.
          // This allows the manifest to contain a single mapping from foo.js
          // to a target file with the correct contents given the mode.
          //
          // Ideally, the target file would have the .min.js suffix in
          // production mode. This could be accomplished by nesting these files
          // within a minifiable-lib directory in the output package so that the
          // manifest plugin could do special processing on these files.
          {
            context: 'build/minifiable-lib/',
            from: minify ? `**/*.min.js` : '**/*.js',
            to: minify ? '[path][name]wp[contenthash].js' : '[path][name].js',
            toType: 'template',
            globOptions: {
              ignore: minify ? [] : ['*.min.js'],
            },
          },
        ].filter(entry => !!entry),
      }),
      // Unit tests require certain unminified files to have been built.
      new UnminifiedWebpackPlugin({
        include: [/^webpack-runtime/, /^applab-api/, /^gamelab-api/],
      }),
      new WebpackManifestPlugin({
        basePath: 'js/',
        map: file => {
          if (minify) {
            // Remove contenthash in manifest key from files generated via
            // copy-webpack-plugin. See:
            // https://github.com/webpack-contrib/copy-webpack-plugin/issues/104#issuecomment-370174211
            // Also remove .min extension from manifest key, which started appearing after moving from webpack-manifest-plugin 2 -> 4
            file.name = file.name
              .replace(/wp[a-f0-9]{32}\./, '.')
              .replace(/\.min/, '');
          }
          return file;
        },
        ...(process.env.DEV
          ? []
          : [
              // Using splitChunks and/or StatsWriterPlugin in dev mode increases rebuild+reload time
              // by 2x-10x. See: https://github.com/code-dot-org/code-dot-org/pull/55707
              new StatsWriterPlugin({
                fields: ['assetsByChunkName', 'assets'],
              }),
            ]),
      }),
      new PyodidePlugin({
        outDirectory: `pyodide/${pyodide.version}`,
      }),
      ...(envConstants.HOT
        ? [
            new webpack.HotModuleReplacementPlugin({}),
            new ReactRefreshWebpackPlugin(),
            // Prints a URL for accessing the Dashboard via webpack-dev-server
            {
              apply: compiler => {
                compiler.hooks.afterDone.tap('PrintDashboardURL', stats => {
                  if (stats.hasErrors()) return;

                  if (!process.env.WEBPACK_SERVE) {
                    console.warn(
                      "webpack-dev-server should be running, but it doesn't seem to be, url may be wrong"
                    );
                  }

                  const TIMEOUT_SO_PRINT_IS_LAST = 1000;
                  setTimeout(() => {
                    const WEBPACK_DEV_SERVER_URL = `http://localhost-studio.code.org:${WEBPACK_DEV_SERVER_PORT}`;
                    const BOLD = '\x1b[1m';
                    const MAGENTA_BG = `\x1b[45m\x1b[30m${BOLD}`;
                    const RESET = '\x1b[0m';
                    console.log(
                      `\n${MAGENTA_BG}To use webpack-dev-server, access Dashboard at:${RESET} ${BOLD}${WEBPACK_DEV_SERVER_URL}${RESET}`
                    );
                  }, TIMEOUT_SO_PRINT_IS_LAST);
                });
              },
            },
          ]
        : []),
    ],
    devServer: envConstants.DEV
      ? {
          allowedHosts: [
            'localhost-studio.code.org',
            'localhost.code.org',
            'localhost.hourofcode.com',
          ],
          client: {overlay: false},
          port: WEBPACK_DEV_SERVER_PORT,
          proxy: [
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
        }
      : undefined,
  };

  //////////////////////////////////////////////
  ////////// WEBPACK CONFIG ENDS HERE //////////
  //////////////////////////////////////////////

  return {
    ...WEBPACK_BASE_CONFIG,
    ...WEBPACK_CONFIG,
  };
}

module.exports = {
  default: createWebpackConfig(),
  // Returns the `WEBPACK_CONFIG` used by our primary build:
  createWebpackConfig,
  devtool,
  localeDoNotImport,
  // Used as the basis for karma and storybook webpack configs:
  WEBPACK_BASE_CONFIG,
  APPLICATION_ALIASES,
  LOCALE_ALIASES,
};
