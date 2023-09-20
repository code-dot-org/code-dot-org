var webpackKarmaConfig = require('./webpackKarma.config');
var envConstants = require('./envConstants');

var path = require('path');
var tty = require('tty');

// We run all tests in the UTC timezone so datetimes don't vary by local timezone
process.env.TZ = 'UTC';

// Use the babel test env defined in .babelrc
process.env.BABEL_ENV = 'test';

// Single spot to define command-line arguments to `karma start`.
// e.g. `karma start --myarg=value` => KARMA_CLI_FLAGS.myarg = 'value'
//
// Args are automatically available to tests: ./test/util/KARMA_CLI_FLAGS.js
// Args are automatically passed on by grunt: e.g. `grunt karma --myarg=value`
const karmaCliFlags = (config = {}) => ({
  browser: config.browser || 'ChromeHeadless', // --browser
  entry: config.entry
    ? './' + path.relative('./test/unit', config.entry)
    : undefined, // --entry
  grep: config.grep, // --grep
  levelType: config.levelType, // --levelType
  port: config.port || 9876, // --port
  testType: config.testType, // --testType
  watchTests: config.watchTests, // --watchTests
});

module.exports = function (config) {
  const KARMA_CLI_FLAGS = karmaCliFlags(config);

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'webpack'],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: 'test/audio/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: 'test/integration/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: 'test/storybook/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: 'test/unit/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: 'test/util/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {pattern: 'lib/**/*', watched: false, included: false, nocache: true},
      {pattern: 'build/**/*', watched: false, included: false, nocache: true},
      {
        pattern: 'static/**/*',
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: `build/karma/*`,
        watched: false,
        included: false,
        nocache: true,
      },
      {
        pattern: `test/tests-entry.js`,
        watched: false,
      },
    ],

    proxies: {
      // configure karma server to serve files from the source tree for
      // various paths (the '/base' prefix points to the apps directory where
      // karma.conf.js is located)
      '/blockly/media/': '/base/static/',
      '/lib/blockly/media/': '/base/static/',
      '/v3/assets/': '/base/test/integration/assets/',
      '/base/static/1x1.gif': '/base/lib/blockly/media/1x1.gif',

      // requests to the webpack output public path should be served from
      // `apps/build/karma/`, where assets are written during the karma build
      '/webpack_output/': '/base/build/karma/',
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'build/karma/*.js': ['sourcemap'],
      'test/tests-entry.js': ['webpack', 'sourcemap'],
    },

    webpack: webpackKarmaConfig,

    client: {
      // log console output in our test console
      captureConsole: true,
      mocha: {
        timeout: 14000,
        grep: KARMA_CLI_FLAGS.grep,
      },
      KARMA_CLI_FLAGS,
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'mocha',
      ...(envConstants.DRONE ? ['junit', 'coverage-istanbul'] : []),
      ...(envConstants.COVERAGE ? ['coverage-istanbul'] : []),
    ],

    junitReporter: {
      outputDir: envConstants.CIRCLECI
        ? `${envConstants.CIRCLE_TEST_REPORTS}/apps`
        : '',
      outputFile: `${KARMA_CLI_FLAGS.testType}.xml`,
    },

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      dir: `coverage/${KARMA_CLI_FLAGS.testType}`,
      fixWebpackSourcePaths: true,
    },

    mochaReporter: {
      output: envConstants.CDO_VERBOSE_TEST_OUTPUT ? 'full' : 'minimal',
      showDiff: true,
    },

    hostname: 'localhost-studio.code.org',

    // web server port
    port: KARMA_CLI_FLAGS.port,

    // enable / disable colors in the output (reporters and logs)
    colors: tty.isatty(process.stdout.fd),

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [KARMA_CLI_FLAGS.browser],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !KARMA_CLI_FLAGS.watchTests,

    // Concurrency level
    // how many browser should be started simultaneous
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
