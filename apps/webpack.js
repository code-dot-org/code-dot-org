var _ = require('lodash');
var webpack = require('webpack');
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var envConstants = require('./envConstants');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');

// Certain packages ship in ES6 and need to be transpiled for our purposes -
// especially for tests, which run on PhantomJS with _zero_ ES6 support.
var toTranspileWithinNodeModules = [
  // All of our @cdo-aliased files should get transpiled as they are our own
  // source files.
  path.resolve(__dirname, 'node_modules', '@cdo'),
  // playground-io ships in ES6 as of 0.3.0
  path.resolve(__dirname, 'node_modules', 'playground-io'),
];

// Our base config, on which other configs are derived
var baseConfig = {
  resolve: {
    extensions: ["", ".js", ".jsx"],
    alias: {
      '@cdo/locale': path.resolve(__dirname, 'src', 'util', 'locale-do-not-import.js'),
      '@cdo/netsim/locale': path.resolve(__dirname, 'src', 'netsim', 'locale-do-not-import.js'),
      '@cdo/applab/locale': path.resolve(__dirname, 'src', 'applab', 'locale-do-not-import.js'),
      '@cdo/gamelab/locale': path.resolve(__dirname, 'src', 'gamelab', 'locale-do-not-import.js'),
      '@cdo/weblab/locale': path.resolve(__dirname, 'src', 'weblab', 'locale-do-not-import.js'),
      '@cdo/apps': path.resolve(__dirname, 'src'),
      '@cdo/static': path.resolve(__dirname, 'static'),
      repl: path.resolve(__dirname, 'src/noop'),
    }
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, '..', 'shared', 'css')]
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json'},
      {test: /\.ejs$/, loader: 'ejs-compiled'},
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader'},
      {
        test:/\.(png|jpg|jpeg|gif|svg)$/,
        include: [
          path.resolve(__dirname, 'static'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(`${__dirname}/../dashboard/app/assets/`, 'images'),
        ],
        loader: "url-loader?limit=1024",
      },
    ],
    preLoaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
        ].concat(toTranspileWithinNodeModules),
        exclude: [
          path.resolve(__dirname, 'src', 'lodash.js'),
        ],
        loader: "babel",
        query: {
          cacheDirectory: path.resolve(__dirname, '.babel-cache'),
          compact: false,
        }
      },
    ],
    noParse: [
      /html2canvas/,
    ],
  },
};

if (envConstants.HOT) {
  baseConfig.module.loaders.push({
    test: /\.jsx?$/,
    loader: 'react-hot',
    include: [path.resolve(__dirname, 'src')]
  });
}

// modify baseConfig's preLoaders if looking for code coverage info
if (envConstants.COVERAGE) {
  baseConfig.module.preLoaders = [
    {
      test: /\.jsx?$/,
      include: [
        path.resolve(__dirname, 'test'),
      ].concat(toTranspileWithinNodeModules),
      loader: "babel",
      query: {
        cacheDirectory: true,
        compact: false,
      }
    }, {
      test: /\.jsx?$/,
      loader: 'babel-istanbul',
      include: path.resolve(__dirname, 'src'),
      exclude: [
        path.resolve(__dirname, 'src', 'lodash.js'),

        // we need to turn off coverage for this file
        // because we have tests that actually make assertions
        // about the contents of the compiled version of this file :(
        path.resolve(__dirname, 'src', 'flappy', 'levels.js'),
      ],
      query: {
        cacheDirectory: true,
        compact: false,
      }
    },
  ];
}

var devtool = process.env.CHEAP ?
    'cheap-inline-source-map' :
    'inline-source-map';

var storybookConfig = _.extend({}, baseConfig, {
  devtool: devtool,
  resolve: _.extend({}, baseConfig.resolve, {
    alias: _.extend({}, baseConfig.resolve.alias, {
      '@cdo/apps/lib/util/firehose': path.resolve(__dirname, 'test', 'util')
    }),
  }),
  externals: {
    "blockly": "this Blockly",
  },
  plugins: [
    new webpack.ProvidePlugin({React: 'react'}),
    new webpack.DefinePlugin({
      IN_UNIT_TEST: JSON.stringify(false),
      IN_STORYBOOK: JSON.stringify(true),
      'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
      'process.env.NODE_ENV': JSON.stringify(envConstants.NODE_ENV || 'development'),
      BUILD_STYLEGUIDE: JSON.stringify(true),
      PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
    }),
    new webpack.IgnorePlugin(/^serialport$/),
  ]
});

// config for our test runner
var karmaConfig = _.extend({}, baseConfig, {
  devtool: devtool,
  resolve: _.extend({}, baseConfig.resolve, {
    alias: _.extend({}, baseConfig.resolve.alias, {
      '@cdo/locale': path.resolve(__dirname, 'test', 'util', 'locale-do-not-import.js'),
      '@cdo/netsim/locale': path.resolve(__dirname, 'test', 'util', 'netsim', 'locale-do-not-import.js'),
      '@cdo/applab/locale': path.resolve(__dirname, 'test', 'util', 'applab', 'locale-do-not-import.js'),
      '@cdo/gamelab/locale': path.resolve(__dirname, 'test', 'util', 'gamelab', 'locale-do-not-import.js'),
      '@cdo/weblab/locale': path.resolve(__dirname, 'test', 'util', 'weblab', 'locale-do-not-import.js'),
      'firebase': path.resolve(__dirname, 'test', 'util', 'MockFirebase.js'),
      // Use mock-firmata to unit test playground-io maker components
      'firmata': 'mock-firmata/mock-firmata',
      'chrome-serialport': path.resolve(__dirname, 'test', 'unit', 'lib', 'kits', 'maker', 'StubChromeSerialPort.js'),
    }),
  }),
  externals: {
    "blockly": "this Blockly",

    // The below are necessary for enzyme to work.
    // See https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
    "cheerio": "window",
    "react/addons": true,
    "react/lib/ExecutionEnvironment": true,
    "react/lib/ReactContext": true,

    // The below are necessary for serialport import to not choke during webpack-ing.
    fs: '{}',
    child_process: true,
    bindings: true
  },
  plugins: [
    new webpack.ProvidePlugin({React: 'react'}),
    new webpack.DefinePlugin({
      IN_UNIT_TEST: JSON.stringify(true),
      IN_STORYBOOK: JSON.stringify(false),
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
 * @param {bool} options.watchNotify
 * @param {string} options.piskelDevMode
 * @param {Array} options.plugins - list of additional plugins to use
 * @param {Array} options.externals - list of webpack externals
 */
function create(options) {
  var outputDir = options.output;
  var entries = options.entries;
  var minify = options.minify;
  var watch = options.watch;
  var watchNotify = options.watchNotify;
  var piskelDevMode = options.piskelDevMode;
  var plugins = options.plugins;
  var externals = options.externals;

  var config = _.extend({}, baseConfig, {
    output: {
      path: outputDir,
      publicPath: '/assets/js/',
      filename: "[name]." + (minify ? "min." : "") + "js",
    },
    devtool: !process.env.CI && options.minify ?  'source-map' : devtool,
    entry: entries,
    externals: externals,
    plugins: [
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        IN_STORYBOOK: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(envConstants.NODE_ENV || 'development'),
        BUILD_STYLEGUIDE: JSON.stringify(false),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(piskelDevMode),
      }),
      new webpack.IgnorePlugin(/^serialport$/),
      new webpack.optimize.OccurrenceOrderPlugin(true),
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
          },
          // Don't generate source maps for our minified code, as these are expensive
          // and we haven't been using them.
          sourceMap: false
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
  create: create
};
