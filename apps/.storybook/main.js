import {serverRequire} from '@storybook/core-common';
import {loadCsf} from '@storybook/csf-tools';

import envConstants from '../envConstants';
import storybookWebpackConfig from '../webpackStorybook.config';

import {compile} from './compile';

const staticDirs = envConstants.STORYBOOK_STATIC_ASSETS
  ? ['../build/package/', '../../dashboard/public']
  : [];

export default {
  stories: [
    '../src/**/*.story.@(js|jsx|ts|tsx)',
    '../src/**/*.dynamicStory.@(js|jsx|ts|tsx)',
  ],
  staticDirs,

  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    'storybook-addon-rtl',
    '@storybook/addon-webpack5-compiler-babel',
  ],
  // Storybook requires the use of the experimental indexer to dynamically create stories.
  // Typically, storybook stories are statically analyzed for performance reasons using named es6 exports.
  // However, some existing stories dynamically create them which are no longer supported in Storybook v7.
  // Storybook v7 instead allows for the dynamic creation of stories by defining a base CSFv3 story and transpiling it
  // at runtime to create the applicable stories. The previous method of dynamically creating stories was never supported
  // by Storybook, however the 'experimental_indexers' are officially supported.
  // More info: https://storybook.js.org/docs/api/main-config-indexers
  experimental_indexers: async existingIndexers => {
    const customIndexer = {
      test: /\.dynamicStory\.[tj]sx?$/,
      createIndex: async (fileName, opts) => {
        delete require.cache[fileName];
        // Fetch the story
        const config = await serverRequire(fileName);

        // Take the base csf and transpile it for each story
        const compiled = await compile(config);

        // Load the transpiled code and index it in Storybook
        const indexed = await loadCsf(compiled, {
          ...opts,
          fileName,
        }).parse();

        return indexed.indexInputs;
      },
    };
    return [...existingIndexers, customIndexer];
  },

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  features: {
    babelModeV7: true,
  },

  webpackFinal: async config => storybookWebpackConfig(config),

  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  reactOptions: {
    // Configure StoryBook to work with HOT=1
    fastRefresh: true,
  },
};
