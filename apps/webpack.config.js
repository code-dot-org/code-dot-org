var webpack = require('webpack');
var path = require('path');
var config = module.exports = {
  resolve: {
    extensions: ["", ".js", ".jsx"],
    alias: {
      '@cdo/apps': path.resolve(__dirname, 'src'),
    }
  },
  externals: {
    "johnny-five": "var JohnnyFive",
    "playground-io": "var PlaygroundIO",
    "chrome-serialport": "var ChromeSerialport",
    "marked": "var marked",
    "blockly": "this Blockly",
    "react": "var React",
    "react-dom": "var ReactDOM",
    "jquery": "var $"
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json'},
      {test: /\.ejs$/, loader: 'ejs-compiled'},
    ],
    preLoaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(__dirname, 'node_modules', '@cdo'),
        ],
        exclude: [
          path.resolve(__dirname, 'src', 'lodash.js'),
        ],
        loader: "babel",
        query: {
          cacheDirectory: true,
          sourceMaps: true,
        }
      },
    ],
  },
};

if (process.env.COVERAGE === '1') {
  config.module.preLoaders = [
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
