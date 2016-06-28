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
    console.warn('The ' + moocName + ' environment variable is deprecated. ' +
      'Use ' + name + ' instead.');
  }
  return process.env[name] || process.env['MOOC_' + name];
}

// Export a set of environment variables used by our build process
module.exports = {
  AUTO_RELOAD: getBoolEnv('AUTORELOAD'),
  APP: getMoocEnv('APP'),
  DEV: !!getMoocEnv('DEV'),
  WATCH: !!getMoocEnv('WATCH'),
  COVERAGE: getBoolEnv('COVERAGE'),
  NODE_ENV: process.env.NODE_ENV,
  CIRCLECI: process.env.CIRCLECI,
  CIRCLE_TEST_REPORTS: process.env.CIRCLE_TEST_REPORTS,
  BROWSER: process.env.BROWSER
};
