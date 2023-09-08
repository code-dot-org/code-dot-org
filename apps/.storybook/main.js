const envConstants = require('../envConstants');
const storybookWebpackConfig = require('../webpack.storybook.config');

const staticDirs = envConstants.STORYBOOK_STATIC_ASSETS ? [
    '../build/package/',
    '../../dashboard/public',
  ] : [];

module.exports = {
  stories: ['../src/**/*.story.@(js|jsx|ts|tsx)'],
  staticDirs,
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    'storybook-addon-rtl',
    '@storybook/addon-options'
  ],
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
