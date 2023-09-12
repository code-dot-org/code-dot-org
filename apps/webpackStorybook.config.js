const webpack = require('webpack');
const path = require('path');

const {WEBPACK_BASE_CONFIG} = require('./webpack.config');
const envConstants = require('./envConstants');

// Customize webpack config for storybook.
// @param {Object} sbConfig - Webpack configuration from storybook library.
function storybookConfig(sbConfig) {
  return {
    ...sbConfig,
    // Overwrite aliases
    resolve: {
      ...sbConfig.resolve,
      ...WEBPACK_BASE_CONFIG.resolve,
      alias: {
        ...WEBPACK_BASE_CONFIG.resolve.alias,
        '@cdo/apps/lib/util/firehose': path.resolve(__dirname, 'test', 'util'),
      },
    },
    // Overwrite rules
    module: {
      ...sbConfig.module,
      ...WEBPACK_BASE_CONFIG.module,
      rules: WEBPACK_BASE_CONFIG.module.rules,
    },
    // Overwrite externals
    externals: {
      blockly: 'this Blockly',
    },
    // Extend plugins
    plugins: [
      ...sbConfig.plugins,
      new webpack.ProvidePlugin({React: 'react'}),
      new webpack.DefinePlugin({
        IN_UNIT_TEST: JSON.stringify(false),
        IN_STORYBOOK: JSON.stringify(true),
        'process.env.mocha_entry': JSON.stringify(process.env.mocha_entry),
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
      }),
    ],
  };
}

module.exports = storybookConfig;
