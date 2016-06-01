var webpackConfig = require('./webpack.config');
var webpack = require('webpack');
var _ = require('lodash');

var PORT = 9876;

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    // handled in grunt-karma config
    files: [
    ],

    proxies: {
      '/blockly/media/': 'http://localhost:'+PORT+'/base/static/',
      '/base/static/1x1.gif': 'http://localhost:'+PORT+'/base/lib/blockly/media/1x1.gif',
    },

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "test/index.js": ["webpack", "sourcemap"],
      "test/integration-tests.js": ["webpack", "sourcemap"],
      "test/unit-tests.js": ["webpack", "sourcemap"],
    },

    webpack: _.extend({}, webpackConfig, {
      devtool: 'inline-source-map',
      externals: {
        "johnny-five": "var JohnnyFive",
        "playground-io": "var PlaygroundIO",
        "chrome-serialport": "var ChromeSerialport",
        "blockly": "this Blockly",
      },
      plugins: [
        new webpack.ProvidePlugin({React: 'react'}),
        new webpack.DefinePlugin({
          IN_UNIT_TEST: true,
        }),

      ]
    }),
    webpackMiddleware: {
      noInfo: true
    },
    client: {
      // log console output in our test console
      captureConsole: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],


    // web server port
    port: PORT,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
//      'Chrome',
      'PhantomJS',
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // increase timeout to wait for webpack to do its thing.
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000 // 60 seconds
  });
};
