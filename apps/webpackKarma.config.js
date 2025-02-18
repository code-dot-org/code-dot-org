const path = require('path');
const webpack = require('webpack');

const envConstants = require('./envConstants');
const {localeDoNotImport, WEBPACK_BASE_CONFIG} = require('./webpack.config');

// alias '@cdo/applab/locale' => 'test/util/applab/locale-do-not-import.js'
const localeDoNotImportTest = cdo => localeDoNotImport(cdo, 'test/util');

// config for our test runner
const karmaConfig = {
  ...WEBPACK_BASE_CONFIG,
  ...{
    output: {
      path: path.resolve(__dirname, 'build/karma/'),
      publicPath: '/webpack_output/',
    },
    mode: 'development',
    // karma-sourcemap-loader only supports inline-source-map and source-map
    devtool: 'source-map',
    stats: 'minimal',
    resolve: {
      ...WEBPACK_BASE_CONFIG.resolve,
      ...{
        alias: {
          ...WEBPACK_BASE_CONFIG.resolve.alias,
          ...Object.fromEntries([
            localeDoNotImportTest('@cdo/applab/locale'),
            localeDoNotImportTest('@cdo/gamelab/locale'),
            localeDoNotImportTest('@cdo/javalab/locale'),
            localeDoNotImportTest('@cdo/locale'),
            localeDoNotImportTest('@cdo/music/locale'),
            localeDoNotImportTest('@cdo/netsim/locale'),
            localeDoNotImportTest('@cdo/tutorialExplorer/locale'),
            localeDoNotImportTest('@cdo/weblab/locale'),
            localeDoNotImportTest('@cdo/signup/locale'),
          ]),
          ...{
            // Use mock-firmata to unit test playground-io maker components
            firmata: 'mock-firmata/mock-firmata',
          },
        },
      },
    },
    externals: {
      blockly: 'this Blockly',

      // The below are necessary for enzyme to work.
      // See https://github.com/airbnb/enzyme/blob/master/docs/guides/webpack.md
      cheerio: 'window',
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': true,
    },
    plugins: [
      new webpack.ProvidePlugin({
        React: 'react',
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(true),
        IN_STORYBOOK: JSON.stringify(false),
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
      }),
    ],
  },
};

module.exports = karmaConfig;
