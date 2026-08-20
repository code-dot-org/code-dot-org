import storybookWebpackConfig from '../webpackStorybook.config';

export default {
  stories: ['../src/buildlab/BuildlabView.story.tsx'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    'storybook-addon-rtl',
    '@storybook/addon-webpack5-compiler-babel',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async config => ({
    ...storybookWebpackConfig(config),
    externals: {},
  }),
};

