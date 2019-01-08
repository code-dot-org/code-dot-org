'use strict';

const path = require('path');

require('expose-loader');
require('babel-polyfill');

module.exports = {
  entry: './src/server.js',
  output: {
    filename: './dist/server.js',
  },
  module: {
    loaders: [
      {
        test: /\.js?x$/,
        loader: 'babel-loader',
        exclude: path.join(__dirname, 'node_modules'),
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
