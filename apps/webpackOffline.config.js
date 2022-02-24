const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');

const config = {
  target: 'webworker',
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
              configFile: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new ManifestPlugin({
      basePath: 'js/',
      fileName: 'offline-manifest.json',
      filter: file => {
        return file.name === 'js/offline-service-worker.js';
      }
    })
  ]
};
module.exports = config;
