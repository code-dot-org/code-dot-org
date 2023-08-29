const storybookWebpackConfig = require('../webpack').storybookConfig;

module.exports = {
  stories: ['../src/**/*.story.@(js|jsx|ts|tsx)'],
  staticDirs: [
    // Temporarily commented out to test whether we can deploy storybook to our public repo (see storybook-deploy.sh for details)
    // In the meantime, feel free to uncomment these if you need them for serving storybook locally
    // '../build/package/',
    // '../../dashboard/public',
    // '../../pegasus/sites.v3/code.org/public'
  ],
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
