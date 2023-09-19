var webpackConfig = require('./webpackKarma.config');
var envConstants = require('./envConstants');

var path = require('path');
var tty = require('tty');

var PORT = process.env.PORT || 9876;

var reporters = ['mocha'];
if (envConstants.DRONE) {
  reporters.push('junit');
  reporters.push('coverage-istanbul');
}
if (envConstants.COVERAGE) {
  reporters.push('coverage-istanbul');
}

// We run all tests in the UTC timezone so datetimes don't vary by local timezone
process.env.TZ = 'UTC';

// Use the babel test env defined in .babelrc
process.env.BABEL_ENV = 'test';

module.exports = function (config) {
  var browser = envConstants.BROWSER || 'ChromeHeadless';
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'webpack'],

    // list of files / patterns to load in the browser
    // handled in grunt-karma config
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
    ],

    // proxied paths are handled in grunt-karma config
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

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'build/karma/*.js': ['sourcemap'],
      'test/index.js': ['webpack', 'sourcemap'],
      'test/entry-tests.js': ['webpack', 'sourcemap'],
      'test/integration-tests.js': ['webpack', 'sourcemap'],
      'test/unit-tests.js': ['webpack'],
      'test/code-studio-tests.js': ['webpack', 'sourcemap'],
      'test/storybook-tests.js': ['webpack', 'sourcemap'],
    },
    webpack: {
      ...webpackConfig,
      output: {
        path: path.resolve(__dirname, 'build/karma/'),
        publicPath: '/webpack_output/',
      },
      optimization: undefined,
      mode: 'development',
    },

    client: {
      // log console output in our test console
      captureConsole: true,
      mocha: {
        timeout: 14000,
        bail: browser === 'PhantomJS',
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,

    junitReporter: {
      outputDir: envConstants.CIRCLECI
        ? `${envConstants.CIRCLE_TEST_REPORTS}/apps`
        : '',
      outputFile: 'all.xml',
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      dir: 'coverage',
      fixWebpackSourcePaths: true,
    },
    mochaReporter: {
      output: envConstants.CDO_VERBOSE_TEST_OUTPUT ? 'full' : 'minimal',
      showDiff: true,
    },

    hostname: 'localhost-studio.code.org',

    // web server port
    port: PORT,

    // enable / disable colors in the output (reporters and logs)
    colors: tty.isatty(process.stdout.fd),

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [browser],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !envConstants.WATCH,

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

/**
 * Get karma config for test entry and output files based on testType.
 *
 * @param {('unit'|'integration'|'storybook'|'entry')} testType
 * @return {object} testType specific karma config to overlay the main config above
 */
module.exports.customizeKarmaConfigFor = testType => ({
  coverageIstanbulReporter: {
    dir: `coverage/${testType}`,
  },
  junitReporter: {
    outputFile: `${testType}.xml`,
  },
  files: [{src: [`test/${testType}-tests.js`], watched: false}],
});
