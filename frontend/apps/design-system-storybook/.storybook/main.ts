// This file has been automatically migrated to valid ESM format by Storybook.
import {StorybookConfig} from '@storybook/react-vite';
import {createRequire} from 'node:module';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: [
    '../../../packages/component-library/src/**/stories/*.story.@(ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('storybook-addon-rtl'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: getAbsolutePath('@storybook/react-vite'),
  viteFinal: async config => {
    config.resolve = {
      ...config.resolve,
      dedupe: ['react', 'react-dom'],
      alias: {
        ...(config.resolve?.alias || {}),
        '@': resolve(__dirname, '../../../packages/component-library/src'),
        '@public': resolve(__dirname, '../src'),
      },
    };

    return config;
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // react-docgen-typescript has a bug which is unable to resolve project references.
      // https://github.com/storybookjs/storybook/issues/30015
      EXPERIMENTAL_useProjectService: true,
    },
  },
};
export default config;
