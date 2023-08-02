var _ = require('lodash');
var webpack = require('webpack');
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var envConstants = require('./envConstants');
var WebpackNotifierPlugin = require('webpack-notifier');
var sass = require('sass');

// Certain packages ship in ES6 and need to be transpiled for our purposes.
var toTranspileWithinNodeModules = [
  // All of our @cdo- and @dsco_-aliased files should get transpiled as they are our own
  // source files.
  path.resolve(__dirname, 'node_modules', '@cdo'),
  path.resolve(__dirname, 'node_modules', '@dsco_'),
  // playground-io ships in ES6 as of 0.3.0
  path.resolve(__dirname, 'node_modules', 'playground-io'),
  path.resolve(__dirname, 'node_modules', 'json-parse-better-errors'),
  path.resolve(__dirname, 'node_modules', '@blockly', 'field-grid-dropdown'),
  path.resolve(__dirname, 'node_modules', '@blockly', 'keyboard-navigation'),
  path.resolve(__dirname, 'node_modules', '@blockly', 'plugin-scroll-options'),
  path.resolve(__dirname, 'node_modules', 'blockly'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'dance-party'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'johnny-five'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'remark-plugins'),
  path.resolve(__dirname, 'node_modules', 'firmata'),
  // parse5 ships in ES6: https://github.com/inikulin/parse5/issues/263#issuecomment-410745073
  path.resolve(__dirname, 'node_modules', 'parse5'),
  path.resolve(__dirname, 'node_modules', 'vmsg'),
  path.resolve(__dirname, 'node_modules', 'ml-knn'),
  path.resolve(__dirname, 'node_modules', 'ml-array-max'),
  path.resolve(__dirname, 'node_modules', 'ml-array-min'),
  path.resolve(__dirname, 'node_modules', 'ml-array-rescale'),
  path.resolve(__dirname, 'node_modules', 'ml-distance-euclidean'),
  path.resolve(__dirname, 'node_modules', '@codemirror'),
  path.resolve(__dirname, 'node_modules', 'style-mod'),
  path.resolve(__dirname, 'node_modules', '@lezer'),
  path.resolve(
    __dirname,
    'node_modules',
    'microsoft-cognitiveservices-speech-sdk'
  ),
  path.resolve(__dirname, 'node_modules', 'slate'),
  path.resolve(__dirname, 'node_modules', 'react-loading-skeleton'),
  path.resolve(__dirname, 'node_modules', 'unified'),
];

const scssIncludePath = path.resolve(__dirname, '..', 'shared', 'css');

// As of Webpack 5, Node APIs are no longer automatically polyfilled.
// resolve.fallback resolves the API to its NPM package, and the plugin
// makes the API available as a global.
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
    },
  },
};

// Our base config, on which other configs are derived
var baseConfig = {
  plugins: [...nodePolyfillConfig.plugins],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {...nodePolyfillConfig.resolve.fallback},
    alias: {
      '@cdo/locale': path.resolve(
        __dirname,
        'src',
        'util',
        'locale-do-not-import.js'
      ),
      '@cdo/netsim/locale': path.resolve(
        __dirname,
        'src',
        'netsim',
        'locale-do-not-import.js'
      ),
      '@cdo/applab/locale': path.resolve(
        __dirname,
        'src',
        'applab',
        'locale-do-not-import.js'
      ),
      '@cdo/gamelab/locale': path.resolve(
        __dirname,
        'src',
        'p5lab',
        'gamelab',
        'locale-do-not-import.js'
      ),
      '@cdo/javalab/locale': path.resolve(
        __dirname,
        'src',
        'javalab',
        'locale-do-not-import.js'
      ),
      '@cdo/music/locale': path.resolve(
        __dirname,
        'src',
        'music',
        'locale-do-not-import.js'
      ),
      '@cdo/standaloneVideo/locale': path.resolve(
        __dirname,
        'src',
        'standaloneVideo',
        'locale-do-not-import.js'
      ),
      '@cdo/aichat/locale': path.resolve(
        __dirname,
        'src',
        'aichat',
        'locale-do-not-import.js'
      ),
      '@cdo/poetry/locale': path.resolve(
        __dirname,
        'src',
        'p5lab',
        'poetry',
        'locale-do-not-import.js'
      ),
      '@cdo/spritelab/locale': path.resolve(
        __dirname,
        'src',
        'p5lab',
        'spritelab',
        'locale-do-not-import.js'
      ),
      '@cdo/weblab/locale': path.resolve(
        __dirname,
        'src',
        'weblab',
        'locale-do-not-import.js'
      ),
      '@cdo/tutorialExplorer/locale': path.resolve(
        __dirname,
        'src',
        'tutorialExplorer',
        'locale-do-not-import.js'
      ),
      '@cdo/regionalPartnerSearch/locale': path.resolve(
        __dirname,
        'src',
        'regionalPartnerSearch',
        'locale-do-not-import.js'
      ),
      '@cdo/regionalPartnerMiniContact/locale': path.resolve(
        __dirname,
        'src',
        'regionalPartnerMiniContact',
        'locale-do-not-import.js'
      ),
      '@cdo/apps': path.resolve(__dirname, 'src'),
      '@cdo/static': path.resolve(__dirname, 'static'),
      repl: path.resolve(__dirname, 'src/noop'),
      '@cdo/storybook': path.resolve(__dirname, '.storybook'),
      serialport: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
        ],
        loader: 'ejs-webpack-loader',
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
                includePaths: [scssIncludePath],
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
          path.resolve(__dirname, 'static'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(`${__dirname}/../dashboard/app/assets/`, 'images'),
        ],
        // note that in the name template given below, a dash prefixing
        // the hash is explicitly avoided. If rails tries to serve
        // this file when asset digests are turned off, it will return a
        // 404 because it thinks the hash is a digest and it won't
        // be able to find the file without the hash. :( :(
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              // uses the file-loader when file size is over the limit
              name: '[name]wp[contenthash].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
        ].concat(toTranspileWithinNodeModules),
        exclude: [path.resolve(__dirname, 'src', 'lodash.js')],
        loader: 'babel-loader',
        options: {
          cacheDirectory: path.resolve(__dirname, '.babel-cache'),
          compact: false,
        },
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
    noParse: [/html2canvas/],
  },
};

if (envConstants.HOT) {
  baseConfig.module.loaders.push({
    test: /\.jsx?$/,
    loader: 'react-hot-loader',
    include: [path.resolve(__dirname, 'src')],
  });
}

// modify baseConfig's preLoaders if looking for code coverage info
if (envConstants.COVERAGE) {
  baseConfig.module.rules.push({
    test: /\.jsx?$/,
    enforce: 'post',
    loader: 'istanbul-instrumenter-loader',
    include: path.resolve(__dirname, 'src'),
    exclude: [
      // we need to turn off instrumentation for this file
      // because we have tests that actually make assertions
      // about the contents of the compiled version of this file :(
      path.resolve(__dirname, 'src', 'flappy', 'levels.js'),
    ],
    options: {
      cacheDirectory: true,
      compact: false,
      esModules: true,
    },
  });
}

function devtool(options) {
  if (process.env.CI) {
    return 'eval';
  } else if (options && options.minify) {
    return 'source-map';
  } else if (process.env.DEBUG_MINIFIED) {
    return 'eval-source-map';
  } else if (process.env.DEV) {
    return 'inline-cheap-source-map';
  } else {
    return 'inline-source-map';
  }
}

// Customize webpack config for storybook.
// @param {Object} sbConfig - Webpack configuration from storybook library.
function storybookConfig(sbConfig) {
  return {
    ...sbConfig,
    // Overwrite aliases
    resolve: {
      ...sbConfig.resolve,
      ...baseConfig.resolve,
      alias: {
        ...baseConfig.resolve.alias,
        '@cdo/apps/lib/util/firehose': path.resolve(__dirname, 'test', 'util'),
      },
    },
    // Overwrite rules
    module: {
      ...sbConfig.module,
      ...baseConfig.module,
      rules: baseConfig.module.rules,
    },
    // Overwrite externals
    externals: {
      blockly: 'this Blockly',
    },
    // Extend plugins
    plugins: [
      ...sbConfig.plugins,
      new webpack.ProvidePlugin({React: 'react'}),
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        IN_STORYBOOK: JSON.stringify(true),
        'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
      }),
    ],
  };
}

// config for our test runner
var karmaConfig = _.extend({}, baseConfig, {
  devtool: devtool(),
  resolve: _.extend({}, baseConfig.resolve, {
    alias: _.extend({}, baseConfig.resolve.alias, {
      '@cdo/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'locale-do-not-import.js'
      ),
      '@cdo/netsim/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'netsim',
        'locale-do-not-import.js'
      ),
      '@cdo/applab/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'applab',
        'locale-do-not-import.js'
      ),
      '@cdo/gamelab/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'gamelab',
        'locale-do-not-import.js'
      ),
      '@cdo/music/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'music',
        'locale-do-not-import.js'
      ),
      '@cdo/javalab/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'javalab',
        'locale-do-not-import.js'
      ),
      '@cdo/weblab/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'weblab',
        'locale-do-not-import.js'
      ),
      '@cdo/tutorialExplorer/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'tutorialExplorer',
        'locale-do-not-import.js'
      ),
      firebase: path.resolve(__dirname, 'test', 'util', 'MockFirebase.js'),
      // Use mock-firmata to unit test playground-io maker components
      firmata: 'mock-firmata/mock-firmata',
    }),
  }),
  externals: {
    blockly: 'this Blockly',

    // The below are necessary for enzyme to work.
    // See https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
    cheerio: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      IN_UNIT_TEST: JSON.stringify(true),
      IN_STORYBOOK: JSON.stringify(false),
      'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
      'process.env.NODE_ENV': JSON.stringify(
        envConstants.NODE_ENV || 'development'
      ),
      LEVEL_TYPE: JSON.stringify(envConstants.LEVEL_TYPE),
      PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
    }),
  ],
});

/**
 * Generate the appropriate webpack config based off of our base config and
 * some input options
 * @param {object} options
 * @param {string} options.output
 * @param {string[]} options.entries - list of input source files
 * @param {bool} options.minify
 * @param {bool} options.watch
 * @param {bool} options.watchNotify
 * @param {string} options.piskelDevMode
 * @param {Array} options.plugins - list of additional plugins to use
 * @param {Array} options.externals - list of webpack externals
 */
function create(options) {
  var outputDir = options.outputDir;
  var entries = options.entries;
  var minify = options.minify;
  var watch = options.watch;
  var watchNotify = options.watchNotify;
  var piskelDevMode = options.piskelDevMode;
  var plugins = options.plugins;
  var externals = options.externals;
  var optimization = options.optimization;
  var mode = options.mode;

  // When minifying, this generates a 20-hex-character hash.
  const suffix = minify ? 'wp[contenthash].min.js' : '.js';

  var config = _.extend({}, baseConfig, {
    output: {
      path: outputDir,
      publicPath: '/assets/js/',
      filename: `[name]${suffix}`,
    },
    devtool: devtool(options),
    entry: entries,
    externals: externals,
    optimization: {chunkIds: 'total-size', moduleIds: 'size', ...optimization},
    mode: mode,
    plugins: [
      ...baseConfig.plugins,
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        IN_STORYBOOK: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(piskelDevMode),
        DEBUG_MINIFIED: envConstants.DEBUG_MINIFIED || 0,
      }),
      ...plugins,
    ],
    watch: watch,
    keepalive: watch,
    failOnError: !watch,
  });

  if (watch) {
    config.plugins = config.plugins.concat(
      new LiveReloadPlugin({
        appendScriptTag: envConstants.AUTO_RELOAD,
      })
    );

    if (watchNotify) {
      config.plugins = config.plugins.concat(
        new WebpackNotifierPlugin({alwaysNotify: true})
      );
    }
  }

  return config;
}

module.exports = {
  config: baseConfig,
  karmaConfig: karmaConfig,
  storybookConfig: storybookConfig,
  create: create,
};
