const webpack = require('webpack');
const path = require('path');

const envConstants = require('./envConstants');
const { baseConfig, devtool } = require('./webpack');

// config for our test runner
const karmaConfig = { ...baseConfig, ...{
  devtool: devtool(),
  resolve: { ...baseConfig.resolve, ...{
    alias: { ...baseConfig.resolve.alias, ...{
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
      '@cdo/music/locale': path.resolve(
        __dirname,
        'test',
        'util',
        'music',
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
    }},
  }},
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
      'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
      'process.env.NODE_ENV': JSON.stringify(
        envConstants.NODE_ENV || 'development'
      ),
      LEVEL_TYPE: JSON.stringify(envConstants.LEVEL_TYPE),
      PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
    }),
  ],
}};

module.exports = karmaConfig;