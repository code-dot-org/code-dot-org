const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
//TODO
// * Added to the manifest
// * Cache bust?
// * Unit tests (kharma).
// * Do we need watch? - we can make a separate from the normal apps build.
const config = {
  target: 'webworker',
  entry: {
    'offline-service-worker':
      './src/offline/offline-service-worker.js'
  },
  output: {
    path: path.resolve(__dirname, 'build/package/js/'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        include: [path.resolve(__dirname, 'src/offline')],
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new ManifestPlugin({
      basePath: 'js/',
      fileName: 'offline-manifest.json',
      filter: (file) => { return file.name === 'js/offline-service-worker.js';}
    })
  ]
};
module.exports = config;
