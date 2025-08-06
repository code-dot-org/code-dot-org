/**
 * Applitools Eyes configuration for visual regression testing
 * See: https://applitools.com/tutorials/sdks/storybook/config#config
 */

// Used in DevContainers, see `.devcontainer/frontend/Dockerfile`
const isDocker = !!process.env.IS_DOCKER || !!process.env.CI;

const variationMatrix = {
  'code.org': {theme: 'code.org', sectionBackground: ['primary', 'dark']},
  csforall: {theme: 'csforall', sectionBackground: ['primary']},
};

const variations = Object.entries(variationMatrix).flatMap(
  ([, {theme, sectionBackground}]) =>
    sectionBackground.map(bg => ({
      queryParams: {
        globals: `theme:${theme};sectionBackground:${bg}`,
      },
    })),
);

module.exports = {
  concurrency: 5,
  showLogs: !!process.env.APPLITOOLS_SHOW_LOGS,
  appName: 'Marketing Storybook',
  batchName: 'Frontend Eyes Tests',
  dontCloseBatches: true,
  browser: [
    {width: 1200, height: 800, name: 'chrome'},
    {width: 1200, height: 800, name: 'firefox'},
  ],
  showStorybookOutput: true,
  storybookStaticDir: 'dist/marketing-storybook',
  runInDocker: isDocker,
  puppeteerOptions: {
    args: isDocker
      ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      : [],
  },
  variations,
};
