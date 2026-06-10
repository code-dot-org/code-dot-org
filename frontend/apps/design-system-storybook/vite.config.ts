// https://vite.dev/config/
import {argosVitestPlugin} from '@argos-ci/storybook/vitest-plugin';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import {playwright} from '@vitest/browser-playwright';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// `defineConfig` from `vitest/config` accepts the `test` property; the one
// from `vite` does not. See: https://vitest.dev/config/#defineconfig
import {defineConfig} from 'vitest/config';
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
          // Captures a screenshot of each story and uploads the batch to
          // Argos for visual comparison against the staging baseline.
          // Upload requires a token; fork PRs have no secrets, so screenshots
          // are still captured there but not uploaded.
          argosVitestPlugin({
            uploadToArgos: !!process.env.CI && !!process.env.ARGOS_TOKEN,
            buildName: 'component-library-storybook',
          }),
        ],
        // Pre-bundle everything the stories and addons import. Without this,
        // Vite discovers these mid-run on a cold cache, re-optimizes, and
        // reloads the browser, which fails whichever tests are in flight.
        optimizeDeps: {
          include: [
            '@mui/material',
            '@mui/material/AppBar',
            '@mui/material/Box',
            '@mui/material/Button',
            '@mui/material/IconButton',
            '@mui/material/Link',
            '@mui/material/List',
            '@mui/material/ListItem',
            '@mui/material/Skeleton',
            '@mui/material/Snackbar',
            '@mui/material/styles',
            '@mui/material/Toolbar',
            '@mui/material/Typography',
            '@mui/utils',
            '@storybook/addon-a11y/preview',
            '@storybook/addon-themes',
            '@storybook/react-vite',
            'axe-core',
            'lodash/uniq',
            'react-player',
            'react-schemaorg',
            'shadow-dom-testing-library',
            'storybook-addon-rtl/preview',
            'storybook/test',
            'storybook/viewport',
            'swiper/modules',
            'swiper/react',
          ],
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            // Match the 1200x800 viewport previously used by Eyes; vitest's
            // default browser viewport is too narrow for wide components.
            viewport: {width: 1200, height: 800},
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
