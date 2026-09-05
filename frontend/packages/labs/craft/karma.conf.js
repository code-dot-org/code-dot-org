module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['tap', 'browserify'],
    files: [
      {pattern: 'node_modules/phaser/build/phaser.js'},
      {pattern: 'test/integration/*.js'},
      {pattern: 'src/assets/**/*.*', watched: false, included: false},
    ],
    preprocessors: {
      'test/integration/*.js': ['browserify'],
    },
    browserify: {
      transform: process.env['WATCH'] ? [] : ["browserify-istanbul"]
    },
    reporters: ['dots', 'coverage'],

    // Run headless unless WATCH=1.
    browsers: [
      process.env['WATCH'] ? 'Chrome' : 'ChromeHeadless'
    ],

    // Run and exit unless WATCH=1.
    singleRun: !process.env['WATCH'],

    // 30 seconds.
    browserNoActivityTimeout: 30 * 1000,

    // Code coverage.
    coverageReporter: {
      dir: 'coverage/integration',
      reporters: [
        {type: 'lcovonly'},
      ],
    },
  });
};
