const webpack = require('webpack');
const _ = require('lodash');

const envConstants = require('./envConstants');
const { baseConfig, devtool } = require('./webpack');

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
    watch
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

module.exports = create;