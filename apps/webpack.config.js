var webpack = require('webpack');
var path = require('path');
module.exports = {
  resolve: {
    extensions: ["", ".js", ".jsx"],
  },
  externals: {
    "johnny-five": "var JohnnyFive",
    "playground-io": "var PlaygroundIO",
    "chrome-serialport": "var ChromeSerialport",
    "marked": "var marked",
    "blockly": "this Blockly",
    "react": "var React",
    "react-dom": "var ReactDOM",
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json'},
      {test: /\.ejs$/, loader: 'ejs-compiled'},
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
