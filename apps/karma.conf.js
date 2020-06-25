var webpackConfig = require('./webpack').karmaConfig;
var envConstants = require('./envConstants');
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

// Use the babel test env defined in .babelrc
process.env.BABEL_ENV = 'test';

module.exports = function(config) {
  var browser = envConstants.BROWSER || 'ChromeHeadless';
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    // handled in grunt-karma config
    files: [],

    proxies: {
      '/blockly/media/': 'http://localhost:' + PORT + '/base/static/',
      '/lib/blockly/media/': 'http://localhost:' + PORT + '/base/static/',
      '/base/static/1x1.gif':
        'http://localhost:' + PORT + '/base/lib/blockly/media/1x1.gif',
      '/v3/assets/fake_id':
        'http://localhost:' + PORT + '/base/test/integration/assets/fake_id'
    },

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap'],
      'test/integration-tests.js': ['webpack', 'sourcemap'],
      'test/unit-tests.js': ['webpack'],
      'test/code-studio-tests.js': ['webpack', 'sourcemap'],
      'test/storybook-tests.js': ['webpack', 'sourcemap']
    },

    webpack: {...webpackConfig, optimization: undefined, mode: 'development'},
    webpackMiddleware: {
      noInfo: true,
      stats: {
        chunks: false
      }
    },
    client: {
      // log console output in our test console
      captureConsole: true,
      mocha: {
        timeout: 14000,
        bail: browser === 'PhantomJS'
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,

    junitReporter: {
      outputDir: envConstants.CIRCLECI
        ? `${envConstants.CIRCLE_TEST_REPORTS}/apps`
        : '',
      outputFile: 'all.xml'
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      dir: 'coverage',
      fixWebpackSourcePaths: true
    },
    mochaReporter: {
      output: envConstants.CDO_VERBOSE_TEST_OUTPUT ? 'full' : 'minimal',
      showDiff: true
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
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // increase timeout to wait for webpack to do its thing.
    captureTimeout: 90000,
    browserNoActivityTimeout: 90000 // 60 seconds
  });
};
