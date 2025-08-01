import type {StorybookConfig} from '@storybook/nextjs-vite';
import {join, dirname} from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: ['../../marketing/src/**/stories/*.story.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-themes'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {},
  },
  viteFinal: async config => {
    const existingPlugins = config.plugins || [];
    config.plugins = [...existingPlugins, tsconfigPaths()];
    return {
      ...config,
    };
  },
};
export default config;
