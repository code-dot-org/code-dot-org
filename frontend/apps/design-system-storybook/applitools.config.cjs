/**
 * Applitools Eyes configuration for visual regression testing
 * See: https://applitools.com/tutorials/sdks/storybook/config#config
 */

// Used in DevContainers, see `.devcontainer/frontend/Dockerfile`
const isDocker = !!process.env.IS_DOCKER || !!process.env.CI;

module.exports = {
  concurrency: 5,
  showLogs: !!process.env.APPLITOOLS_SHOW_LOGS,
  appName: 'Component Library',
  batchName: 'Frontend Eyes Tests',
  dontCloseBatches: true,
  browser: [
    {width: 1200, height: 800, name: 'chrome'},
    {width: 1200, height: 800, name: 'firefox'},
  ],
  showStorybookOutput: true,
  storybookStaticDir: 'dist/component-library-storybook',
  runInDocker: isDocker,
  puppeteerOptions: {
    args: isDocker
      ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      : [],
  },
};
