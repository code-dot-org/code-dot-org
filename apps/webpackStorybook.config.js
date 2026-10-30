import path from 'path';
import webpack from 'webpack';

import {webpack as DynamicStoryPlugin} from './.storybook/unplugin';
import envConstants from './envConstants';
import {WEBPACK_BASE_CONFIG} from './webpack.config';

// Customize webpack config for storybook.
// @param {Object} sbConfig - Webpack configuration from storybook library.
function storybookConfig(sbConfig) {
  return {
    ...sbConfig,
    // Overwrite aliases
    devtool: 'inline-source-map',
    resolve: {
      ...sbConfig.resolve,
      ...WEBPACK_BASE_CONFIG.resolve,
      alias: {
        ...WEBPACK_BASE_CONFIG.resolve.alias,
        ...sbConfig.resolve.alias,
        '@cdo/apps/metrics/firehose': path.resolve(__dirname, 'test', 'util'),
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
        'process.env.NODE_ENV': JSON.stringify(
          envConstants.NODE_ENV || 'development'
        ),
        PISKEL_DEVELOPMENT_MODE: JSON.stringify(false),
      }),
      DynamicStoryPlugin(),
    ],
  };
}

module.exports = storybookConfig;
