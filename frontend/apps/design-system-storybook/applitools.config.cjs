const {execSync} = require('child_process');

const isDocker = !!process.env.IS_DOCKER;

/**
 * @returns Current git commit 
 */
const getBatchName = () => {
  return execSync('git rev-parse --short HEAD').toString().trim();
}

module.exports = {
  concurrency: 5,
  showLogs: !!process.env.APPLITOOLS_SHOW_LOGS,
  appName: "Code.org Design System",
  batchName: getBatchName(),
  browser: [
    { width: 1200, height: 800, name: "chrome" },
    { width: 1200, height: 800, name: "firefox" }
  ],
  runInDocker: isDocker,
  puppeteerOptions: {
    // headless: false,
    // devtools: true,
    args: isDocker
      ? ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
      : []
  }
};