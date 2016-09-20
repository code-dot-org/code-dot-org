var _ = require('lodash');
var webpack = require('webpack');
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var envConstants = require('./envConstants');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

// Our base config, on which other configs are derived
var baseConfig = {
  resolve: {
    extensions: ["", ".js", ".jsx"],
    alias: {
      '@cdo/locale': path.resolve(__dirname, 'src', 'locale-do-not-import.js'),
      '@cdo/netsim/locale': path.resolve(__dirname, 'src', 'netsim', 'locale-do-not-import.js'),
      '@cdo/applab/locale': path.resolve(__dirname, 'src', 'applab', 'locale-do-not-import.js'),
      '@cdo/apps': path.resolve(__dirname, 'src'),
      repl: path.resolve(__dirname, 'src/noop'),
    }
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json'},
      {test: /\.ejs$/, loader: 'ejs-compiled'},
      {test: /\.css$/, loader: 'style-loader!css-loader'},
    ],
    preLoaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(__dirname, 'node_modules', '@cdo')
        ],
        exclude: [
          path.resolve(__dirname, 'src', 'lodash.js'),
        ],
        loader: "babel",
        query: {
          cacheDirectory: true,
          sourceMaps: true,
          compact: false,
        }
      },
    ],
  },
};

// modify baseConfig's preLoaders if looking for code coverage info
if (envConstants.COVERAGE) {
  baseConfig.module.preLoaders = [
    {
      test: /\.jsx?$/,
      include: [
        path.resolve(__dirname, 'test'),
        path.resolve(__dirname, 'node_modules', '@cdo'),
      ],
      loader: "babel",
      query: {
        cacheDirectory: true,
      }
    }, {
      test: /\.jsx?$/,
      loader: 'babel-istanbul',
      include: path.resolve(__dirname, 'src'),
      exclude: [
        path.resolve(__dirname, 'src', 'lodash.js'),
      ],
      query: {
        cacheDirectory: true,
      }
    },
  ];
}

var storybookConfig = _.extend({}, baseConfig, {
  devtool: 'inline-source-map',
  externals: {
    "johnny-five": "var JohnnyFive",
    "playground-io": "var PlaygroundIO",
    "chrome-serialport": "var ChromeSerialport",
    "blockly": "this Blockly",
  },
  plugins: [
    new webpack.ProvidePlugin({React: 'react'}),
    new webpack.DefinePlugin({
      IN_UNIT_TEST: JSON.stringify(false),
      'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
      'process.env.NODE_ENV': JSON.stringify(envConstants.NODE_ENV || 'development'),
      BUILD_STYLEGUIDE: JSON.stringify(true),
      PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
    }),
  ]
});

// config for our test runner
var karmaConfig = _.extend({}, baseConfig, {
  devtool: 'cheap-module-source-map',
  resolve: _.extend({}, baseConfig.resolve, {
    alias: _.extend({}, baseConfig.resolve.alias, {
      '@cdo/locale': path.resolve(__dirname, 'test', 'util', 'locale-do-not-import.js'),
      '@cdo/netsim/locale': path.resolve(__dirname, 'test', 'util', 'netsim', 'locale-do-not-import.js'),
      '@cdo/applab/locale': path.resolve(__dirname, 'test', 'util', 'applab', 'locale-do-not-import.js'),
      'firebase': path.resolve(__dirname, 'test', 'util', 'MockFirebase.js'),
    }),
  }),
  externals: {
    "johnny-five": "var JohnnyFive",
    "playground-io": "var PlaygroundIO",
    "chrome-serialport": "var ChromeSerialport",
    "blockly": "this Blockly",

    // The below are necessary for enzyme to work.
    // See https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
    "cheerio": "window",
    "react/addons": true,
    "react/lib/ExecutionEnvironment": true,
    "react/lib/ReactContext": true
  },
  plugins: [
    new webpack.ProvidePlugin({React: 'react'}),
    new webpack.DefinePlugin({
      IN_UNIT_TEST: JSON.stringify(true),
      'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
      'process.env.NODE_ENV': JSON.stringify(envConstants.NODE_ENV || 'development'),
      BUILD_STYLEGUIDE: JSON.stringify(false),
      PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
    }),
  ]
});

/**
 * Generate the appropriate webpack config based off of our base config and
 * some input options
 * @param {object} options
 * @param {string} options.output
 * @param {string[]} options.entries - list of input source files
 * @param {bool} options.minify
 * @param {bool} options.watch
 * @param {string} options.piskelDevMode
 * @param {Array} options.plugins - list of additional plugins to use
 * @param {Array} options.externals - list of webpack externals
 */
function create(options) {
  var outputDir = options.output;
  var entries = options.entries;
  var minify = options.minify;
  var watch = options.watch;
  var piskelDevMode = options.piskelDevMode;
  var plugins = options.plugins;
  var externals = options.externals;

  var config = _.extend({}, baseConfig, {
    output: {
      path: outputDir,
      filename: "[name]." + (minify ? "min." : "") + "js",
    },
    devtool: options.minify ? 'source-map' : 'inline-source-map',
    entry: entries,
    externals: externals,
    plugins: [
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(envConstants.NODE_ENV || 'development'),
        BUILD_STYLEGUIDE: JSON.stringify(false),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(piskelDevMode),
      }),
      new webpack.IgnorePlugin(/^serialport$/),
    ].concat(plugins),
    watch: watch,
    keepalive: watch,
    failOnError: !watch
  });

  if (minify) {
    config.plugins = config.plugins.concat(
      [
        new webpack.optimize.UglifyJsPlugin({
          compressor: {
            warnings: false
          }
        }),
        new UnminifiedWebpackPlugin(),
      ]
    );
  }

  if (watch) {
    config.plugins = config.plugins.concat(
      new LiveReloadPlugin({
        appendScriptTag: envConstants.AUTO_RELOAD
      })
    );
  }

  return config;
}


module.exports = {
  config: baseConfig,
  karmaConfig: karmaConfig,
  storybookConfig: storybookConfig,
  create: create
};
