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

const circularDependencies = require('./circular_dependencies.json');
const envConstants = require('./envConstants');
const {
  DEV_SERVER_PORT,
  nodeModulesToTranspile,
  NODE_POLYFILL_PROVIDE,
  NODE_POLYFILL_FALLBACK,
  devtool,
  localeDoNotImport,
  APPLICATION_ALIASES,
  LOCALE_ALIASES,
  BUNDLE_EXTERNALS,
  addPolyfillsToEntryPoints,
  makeSplitChunks,
} = require('./bundlerBase');

if (envConstants.PROFILE_APPS_BUILD) {
  console.log(
    'Webpack configured with NODE_OPTIONS:',
    envConstants.NODE_OPTIONS
  );
}

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

const WEBPACK_DEV_SERVER_PORT = DEV_SERVER_PORT;

const p = (...paths) => path.resolve(__dirname, ...paths);

// Read worker count from environment variable, defaulting to 4 for local development
const APPS_BUILD_WORKERS = parseInt(process.env.APPS_BUILD_WORKERS || '4', 10);

// map our circular dependency JSON to a set.
const circularDependenciesSet = new Set(circularDependencies);

// as we see our known circular dependencies, we're gonna remove them from our list. That way,
// we can report at the end if any circular dependencies have been cleaned up.
let seenCircles = new Set();
let numUnresolvedCircles = 0;
const nodePolyfillConfig = {
  plugins: [
    new webpack.ProvidePlugin(NODE_POLYFILL_PROVIDE),
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
    fallback: {...NODE_POLYFILL_FALLBACK},
  },
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
    // Run TypeScript type checking in parallel with the build, unless
    // SKIP_TYPECHECK is set.
    ...(envConstants.SKIP_TYPECHECK
      ? []
      : [
          new ForkTsCheckerWebpackPlugin({
            // tsconfig.build.json only type-checks TypeScript files.
            // We manually set a memoryLimit here to avoid a JavaScript heap out of memory error in yarn start.
            typescript: {configFile: 'tsconfig.build.json', memoryLimit: 2560},
          }),
        ]),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {...nodePolyfillConfig.resolve.fallback},
    alias: {
      ...WEBPACK_ALIASES,
      serialport: false,
      // Force a single @mui/material instance so that the MUI ThemeProvider
      // context from createReactRoot reaches component-library components.
      // Without this, the portal-linked component-library resolves to its
      // own node_modules/@mui/material (a different React context).
      '@mui/material': p('node_modules/@mui/material'),
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
          outputPath: 'images/', // build/package/js/images/
          publicPath: '/assets/js/images/', // Dashboard assets path
        },
      },
      {
        test: /\.(json)$/,
        include: [p('static', 'json')],
        type: 'asset/resource',
        generator: {
          filename: '[name]wp[contenthash:20][ext]',
          outputPath: 'json/', // build/package/js/json/
          publicPath: '/assets/js/json/', // Dashboard assets path
        },
      },

      {
        test: /\.jsx?$/,
        enforce: 'pre',
        include: [...nodeModulesToTranspile, p('src'), p('test')],
        exclude: [p('src/lodash.js')],
        use: [
          // Only use thread-loader in CI environments. thread-loader causes JSON serialization
          // errors ("Bad control character in string literal") when combined with devtool modes
          // that generate full source maps (e.g., 'source-map'). CI uses devtool: 'eval' which
          // avoids this problem. For more details, see: https://github.com/code-dot-org/code-dot-org/pull/69386
          ...(process.env.CI
            ? [
                {
                  loader: 'thread-loader',
                  options: {
                    workers: APPS_BUILD_WORKERS,
                  },
                },
              ]
            : []),
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: p('build/babel-cache'),
              compact: false,
              ...(envConstants.HOT
                ? {plugins: [['react-refresh/babel', {skipEnvCheck: true}]]}
                : {}),
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          // Only use thread-loader in CI environments. thread-loader causes JSON serialization
          // errors ("Bad control character in string literal") when combined with devtool modes
          // that generate full source maps (e.g., 'source-map'). CI uses devtool: 'eval' which
          // avoids this problem. For more details, see: https://github.com/code-dot-org/code-dot-org/pull/69386
          ...(process.env.CI
            ? [
                {
                  loader: 'thread-loader',
                  options: {
                    workers: APPS_BUILD_WORKERS,
                  },
                },
              ]
            : []),
          {
            loader: 'ts-loader',
            options: {
              // Half the build time was waiting for ts-loader to typecheck.
              // Instead we typecheck in parallel using ForkTsCheckerWebpackPlugin
              transpileOnly: true,
              configFile: 'tsconfig.build.json',
              happyPackMode: true, // Required when using thread-loader
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
            // Enable source maps for shared frontend packages
            {
              test: /\.js$/,
              enforce: 'pre',
              include: /frontend\/packages/,
              use: ['source-map-loader'],
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
 * Generate the primary webpack config for building `apps/`.
 * Extends `WEBPACK_BASE_CONFIG` from above.
 *
 * Invoked by `Gruntfile.js` for `yarn start`, `yarn build`, etc
 *
 * @param {Object} appsEntries - defaults to building all apps, to build only one app pass in e.g. `appsEntriesFor(['maze'])`
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
    externals: BUNDLE_EXTERNALS,
    optimization: {
      chunkIds: 'total-size',
      moduleIds: 'size',
      minimize: minify,
      minimizer: [
        new TerserPlugin({
          parallel: APPS_BUILD_WORKERS,
          // Excludes these from minification to avoid breaking functionality,
          // but still adds .min to the output filename suffix.
          exclude: [/\/blockly.js$/, /\/brambleHost.js$/],
          // Temporarily disable due to
          // https://github.com/webpack-contrib/terser-webpack-plugin/issues/589
          extractComments: false,
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

      // Using splitChunks in dev mode increases rebuild+reload time by
      // 2x-10x. See: https://github.com/code-dot-org/code-dot-org/pull/55707
      // Both configs share the cacheGroups via bundlerBase.makeSplitChunks.
      splitChunks: process.env.DEV ? undefined : makeSplitChunks(appsEntries),
    },
    mode: minify ? 'production' : 'development',
    profile: envConstants.PROFILE_APPS_BUILD,
    infrastructureLogging: {
      // When profiling, suppress verbose webpack progress logs but keep warnings/errors.
      // This shows any build steps taking >1s, and keeps the output size reasonable in CI.
      // To see more details when profiling, set this value to 'info' or 'verbose'.
      level: envConstants.PROFILE_APPS_BUILD ? 'warn' : 'info',
    },
    plugins: [
      ...WEBPACK_BASE_CONFIG.plugins,
      // Add explicit ProgressPlugin for profiling to ensure progress logs appear in CI.
      // Do not enable outside of CI, since that will generate duplicate progress logs.
      ...(envConstants.PROFILE_APPS_BUILD && envConstants.CI
        ? [
            new webpack.ProgressPlugin({
              profile: true,
            }),
          ]
        : []),
      new webpack.DefinePlugin({
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
            '.preview.localhost.codeprojects.org',
            'localhost.codeprojects.org',
            '.preview.localhost.codeaiprojects.org',
            'localhost.codeaiprojects.org',
          ],
          client: {overlay: false},
          port: WEBPACK_DEV_SERVER_PORT,
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
  localeDoNotImport,
  // Used as the basis for karma and storybook webpack configs:
  WEBPACK_BASE_CONFIG,
  APPLICATION_ALIASES,
  LOCALE_ALIASES,
};
