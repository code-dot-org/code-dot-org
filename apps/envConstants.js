/**
 * Check environment to see if provided variable is set to be anything
 * @returns {bool}
 */
function getBoolEnv(name) {
  return !!process.env[name];
}

/**
 * Checks the environment for the provided variable. Also checks with the MOOC_
 * prefix, but gives a warning if that prefix is used.
 */
function getMoocEnv(name) {
  var moocName = 'MOOC_' + name;
  if (process.env.moocName) {
    console.warn(
      `The ${moocName} environment variable is deprecated. Use ${name} instead.`
    );
  }
  return process.env[name] || process.env['MOOC_' + name];
}

// Export a set of environment variables used by our build process
module.exports = {
  // If set, page will reload itself when webpack bundle changes
  AUTO_RELOAD: getBoolEnv('AUTORELOAD'),
  // Can be set to build a single app
  APP: getMoocEnv('APP'),
  // If set, will build uncompressed JS
  DEV: !!getMoocEnv('DEV'),
  // enable sourceMaps when building minified js making it easier to debug.
  // For details, see:
  // https://github.com/code-dot-org/code-dot-org/blob/staging/apps/docs/build.md
  DEBUG_MINIFIED: !!getMoocEnv('DEBUG_MINIFIED'),
  // If set, will collect code coverage info
  COVERAGE: getBoolEnv('COVERAGE'),
  // 'unit', 'integration', 'storybook', or 'entry'
  NODE_ENV: process.env.NODE_ENV,
  CIRCLECI: process.env.CIRCLECI,
  DRONE: process.env.DRONE,
  CIRCLE_TEST_REPORTS: process.env.CIRCLE_TEST_REPORTS,
  // If set, will turn on react hot loader and run the webpack dev server
  HOT: !!process.env.HOT,
  // Include static assets when serving storybook locally
  STORYBOOK_STATIC_ASSETS: process.env.STORYBOOK_STATIC_ASSETS,
};
