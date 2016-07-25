var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var chalk = require('chalk');
var config = require('../webpack').storybookConfig;
config.plugins.push(
  new ProgressBarPlugin({
    format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds) :msg' + ' ',
  })
);
module.exports = config;
