var path = require('path');

var envConstants = require('./envConstants');
var webpackKarmaConfig = require('./webpackKarma.config');

// We run all tests in the UTC timezone so datetimes don't vary by local timezone
process.env.TZ = 'UTC';

// Use the babel test env defined in .babelrc
process.env.BABEL_ENV = 'test';

// Single spot to define command-line arguments to `karma start`.
// e.g. `karma start --myarg=value` => KARMA_CLI_FLAGS.myarg = 'value'
//
// Flags defined here are automatically available to tests: ./test/util/KARMA_CLI_FLAGS.js
// Flags defined here are automatically passed on by grunt: e.g. `grunt karma --myarg=value`
const karmaCliFlags = (config = {}) => ({
  browser: config.browser || 'ChromeHeadless', // --browser=Chrome
  entry: config.entry
    ? './' + path.relative('./test/unit', config.entry)
    : undefined, // --entry=./test/unit/file.js run the tests in file.js
  grep: config.grep, // --grep='clientApi' run tests matching name 'clientApi'
  levelType: config.levelType, // --levelType=[maze|turtle|gamelab|etc...]
  port: config.port || 9876, // --port
  testType: config.testType, // --testType=[unit|integration|storybook]
  verbose: config.verbose, // --verbose streams test pass/fails as they happen
  watchTests: config.watchTests, // --watchTests reruns tests on file changes
});

module.exports = function (config) {
  const KARMA_CLI_FLAGS = karmaCliFlags(config);

  config.set({
    basePath: '.',
    frameworks: ['mocha', 'webpack'],
    files: [
      {
        // Karma starts all test runs (and bundling) here:
        pattern: `test/tests-entry.js`,
        included: true,
        watched: false,
      },
      // Remaining patterns are http-served by karma, but are not bundled in:
      {
        pattern: 'test/integration/assets/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: 'build/package/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: 'build/karma/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {pattern: 'lib/**/*', watched: false, included: false, nocache: true},
      {pattern: 'static/**/*', watched: false, included: false, nocache: true},
    ],

    // Configures the karma server to map urls to local file paths.
    proxies: {
      // e.g. "requests to /blockly/media/ should be served from ./static/"
      '/blockly/media/': '/base/static/',
      '/lib/blockly/media/': '/base/static/',
      '/v3/assets/': '/base/test/integration/assets/',
      '/base/static/1x1.gif': '/base/lib/blockly/media/1x1.gif',

      // Serve ./build/karma/, our webpack bundle, as /webpack_output/
      '/webpack_output/': '/base/build/karma/',
    },

    preprocessors: {
      'build/karma/*.js': ['sourcemap'],
      // Webpack a bundle to ./build/karma/ with all our code: test/ AND src/
      'test/tests-entry.js': ['webpack', 'sourcemap'],
    },

    webpack: webpackKarmaConfig,

    client: {
      // Forward browser JS console.log(), console.error() etc to the terminal
      captureConsole: true,
      mocha: {
        timeout: 14000,
        grep: KARMA_CLI_FLAGS.grep,
      },
      // Pass KARMA_CLI_FLAGS to tests, see: ./test/util/KARMA_CLI_FLAGS.js
      KARMA_CLI_FLAGS,
    },

    reporters: ['mocha'],

    junitReporter: {
      outputDir: envConstants.CIRCLECI
        ? `${envConstants.CIRCLE_TEST_REPORTS}/apps`
        : '',
      outputFile: `${KARMA_CLI_FLAGS.testType}.xml`,
    },

    mochaReporter: {
      output: KARMA_CLI_FLAGS.verbose ? 'autowatch' : 'minimal',
      showDiff: true,
    },

    hostname: 'localhost',

    // web server port
    port: KARMA_CLI_FLAGS.port,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Test on these browsers, defaults to ChromeHeadless
    browsers: [KARMA_CLI_FLAGS.browser],

    // Run once or watch & keep running tests on file changes?
    singleRun: !KARMA_CLI_FLAGS.watchTests,

    // how many browsers should be started simultaneously
    concurrency: Infinity,

    // increase timeout to wait for webpack to do its thing.
    captureTimeout: 90000,
    browserNoActivityTimeout: 90000, // 60 seconds

    sourceMapLoader: {
      remapPrefixes: {
        'webpack://blockly-mooc/': './',
      },
      useSourceRoot: '../../',
    },
  });
};

module.exports.VALID_KARMA_CLI_FLAGS = Object.keys(karmaCliFlags({}));
