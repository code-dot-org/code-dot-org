const storybookWebpackConfig = require('../webpack').storybookConfig;

module.exports = {
  stories: ['../src/**/*.story.@(js|jsx)'],
  staticDirs: [
    '../build/package/',
    '../../dashboard/public',
    '../../pegasus/sites.v3/code.org/public'
  ],
  addons: ['@storybook/addon-actions', '@storybook/addon-options'],
  framework: '@storybook/react',
  core: {
    builder: {
      name: 'webpack5'
    }
  },
  features: {
    babelModeV7: true
  },
  webpackFinal: async config => storybookWebpackConfig(config)
};
