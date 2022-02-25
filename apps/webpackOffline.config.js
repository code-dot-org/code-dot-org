/**
 * This is a Webpack configuration for building the Service Worker used to enable the offline Code.org
 * experience.
 */
const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const envConstants = require('./envConstants');
const mode = envConstants.DEV ? 'development' : 'production';

const config = {
  target: 'webworker',
  mode: mode,
  devtool: 'source-map',
  entry: {
    'offline-service-worker': './src/offline/offline-service-worker.js'
  },
  output: {
    path: path.resolve(__dirname, 'build/package/js/'),
    publicPath: '/',
    filename: '[name]wp[contenthash].min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src/offline')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              // Do no load the global babel.config.json because it is incompatible with "webworker"
              // code.
              configFile: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // Generates a key/value mapping of a source file's name to its final name.
    // e.g. 'js/offline-service-worker.js': 'offline-service-workerwpfb055f24d3026d753ccc.min.js'
    new ManifestPlugin({
      basePath: 'js/',
      fileName: 'offline-manifest.json'
    })
  ]
};

module.exports = config;
