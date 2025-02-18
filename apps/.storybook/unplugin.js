import {serverRequire} from '@storybook/core-common';
import {createUnplugin} from 'unplugin';

import {compile} from './compile';

export const STORIES_REGEX = /\.dynamicStory\.[tj]sx?/;
/**
 * This 'unplugin' plugin is used by Storybook to dynamically transpile dynamic stories into
 * webpack bundles.
 *
 * More info: https://storybook.js.org/docs/api/main-config-indexers#transpiling-to-csf
 */
export const unplugin = createUnplugin(options => {
  return {
    name: 'unplugin-dynamic-stories',
    enforce: 'pre',
    loadInclude(id) {
      return STORIES_REGEX.test(id);
    },
    async load(fileName) {
      delete require.cache[fileName];

      const config = await serverRequire(fileName);
      return await compile(config, options);
    },
  };
});

export const {esbuild} = unplugin;
export const {webpack} = unplugin;
export const {rollup} = unplugin;
export const {vite} = unplugin;
