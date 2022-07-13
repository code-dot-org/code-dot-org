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
  path.resolve(__dirname, 'node_modules', '@blockly', 'plugin-scroll-options'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'dance-party'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'remark-plugins'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'snack-sdk'),
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
  path.resolve(__dirname, 'node_modules', 'slate')
];

const scssIncludePath = path.resolve(__dirname, '..', 'shared', 'css');

// Our base config, on which other configs are derived
var baseConfig = {
  resolve: {
    extensions: ['.js', '.jsx'],
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
      repl: path.resolve(__dirname, 'src/noop')
    }
  },
  module: {
    rules: [
      {test: /\.exported_json$/, loader: 'raw-loader'},
      {
        test: /\.ejs$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test')
        ],
        loader: 'ejs-webpack-loader'
      },
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {
        test: /\.scss$/,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true // enable CSS modules for all files matching \.module\.\w+$/i.test(filename)
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [scssIncludePath],
              implementation: sass,
              quietDeps: true
            }
          }
        ]
      },
      {test: /\.interpreted.js$/, loader: 'raw-loader'},
      {test: /\.exported_js$/, loader: 'raw-loader'},
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        include: [
          path.resolve(__dirname, 'static'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(`${__dirname}/../dashboard/app/assets/`, 'images')
        ],
        // note that in the name template given below, a dash prefixing
        // the hash is explicitly avoided. If rails tries to serve
        // this file when asset digests are turned off, it will return a
        // 404 because it thinks the hash is a digest and it won't
        // be able to find the file without the hash. :( :(
        loader: 'url-loader?limit=1024&name=[name]wp[hash].[ext]'
      },
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test')
        ].concat(toTranspileWithinNodeModules),
        exclude: [path.resolve(__dirname, 'src', 'lodash.js')],
        loader: 'babel-loader',
        query: {
          cacheDirectory: path.resolve(__dirname, '.babel-cache'),
          compact: false
        }
      }
    ],
    noParse: [/html2canvas/]
  }
};

if (envConstants.HOT) {
  baseConfig.module.loaders.push({
    test: /\.jsx?$/,
    loader: 'react-hot-loader',
    include: [path.resolve(__dirname, 'src')]
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
      path.resolve(__dirname, 'src', 'flappy', 'levels.js')
    ],
    query: {
      cacheDirectory: true,
      compact: false,
      esModules: true
    }
  });
}

function devtool(options) {
  if (process.env.CI) {
    return 'eval';
  } else if (options && options.minify) {
    return 'source-map';
  } else if (process.env.DEV) {
    return 'cheap-inline-source-map';
  } else {
    return 'inline-source-map';
  }
}

var storybookConfig = _.extend({}, baseConfig, {
  devtool: devtool(),
  resolve: _.extend({}, baseConfig.resolve, {
    alias: _.extend({}, baseConfig.resolve.alias, {
      '@cdo/apps/lib/util/firehose': path.resolve(__dirname, 'test', 'util')
    })
  }),
  externals: {
    blockly: 'this Blockly'
  },
  plugins: [
    new webpack.ProvidePlugin({React: 'react'}),
    new webpack.DefinePlugin({
      IN_UNIT_TEST: JSON.stringify(false),
      IN_STORYBOOK: JSON.stringify(true),
      'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
      'process.env.NODE_ENV': JSON.stringify(
        envConstants.NODE_ENV || 'development'
      ),
      PISKEL_DEVELOPMENT_MODE: JSON.stringify(false)
    }),
    new webpack.IgnorePlugin(/^serialport$/)
  ]
});

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
      'chrome-serialport': path.resolve(
        __dirname,
        'test',
        'unit',
        'lib',
        'kits',
        'maker',
        'StubChromeSerialPort.js'
      )
    })
  }),
  externals: {
    blockly: 'this Blockly',

    // The below are necessary for enzyme to work.
    // See https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
    cheerio: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,

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
      'process.env.NODE_ENV': JSON.stringify(
        envConstants.NODE_ENV || 'development'
      ),
      LEVEL_TYPE: JSON.stringify(envConstants.LEVEL_TYPE),
      PISKEL_DEVELOPMENT_MODE: JSON.stringify(false)
    })
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
      filename: `[name]${suffix}`
    },
    devtool: devtool(options),
    entry: entries,
    externals: externals,
    optimization: optimization,
    mode: mode,
    plugins: [
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        IN_STORYBOOK: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(piskelDevMode)
      }),
      new webpack.IgnorePlugin(/^serialport$/),
      new webpack.optimize.OccurrenceOrderPlugin(true)
    ].concat(plugins),
    watch: watch,
    keepalive: watch,
    failOnError: !watch
  });

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
