const webpackConfig = require('../webpack').storybookConfig;

module.exports = {
  // stories: ['../src/**/*.story.jsx'],
  stories: ['../src/templates/Meter.story.jsx'],
  addons: ['@storybook/addon-actions', '@storybook/addon-options'],
  framework: '@storybook/react',
  core: {
    builder: {
      name: 'webpack5',
      options: {
        lazyCompilation: false,
        fsCache: false
      }
    }
  },
  features: {
    babelModeV7: true
  },
  webpackFinal: async config => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        ...webpackConfig.resolve,
        alias: {
          ...config.resolve.alias,
          ...webpackConfig.resolve.alias
        }
      },
      module: {
        ...config.module,
        ...webpackConfig.module,
        rules: [...config.module.rules, ...webpackConfig.module.rules]
      },
      plugins: [...config.plugins, ...webpackConfig.plugins]
    };
  }
};
