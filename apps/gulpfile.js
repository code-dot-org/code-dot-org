// Gulp and general plugins
var config = require('./pipeline-config.json');

var es = require('event-stream');
var gulp = require('gulp');
var newer = require('gulp-newer');
var insert = require('gulp-insert');
var rename = require("gulp-rename");

gulp.task('clean', function (cb) {
  var rm = require('rimraf');
  rm('./build', cb);
});

var outputDir = './build/package/js/';

var appFilesSrc = [];
var appFilesDest = [];
config.apps.forEach(function (app) {
  appFilesSrc.push('./src/' + app + '/main.js');
  appFilesDest.push(outputDir + app + '.js');
});
var appsBrowserifyConfig = {src: appFilesSrc, dest: outputDir + 'common.js', factorBundleDest: appFilesDest};

gulp.task('browserify', ['vendor'], function() {
  var browserify = require('./lib/gulp/gulp-browserify');
  var browserifyConfigs = [appsBrowserifyConfig].concat(config.javascripts);
  return es.merge(browserifyConfigs.map(function(config) {
    return browserify(config)();
  }));
});

gulp.task('compress', ['browserify'], function () {
  var uglify = require('gulp-uglify');
  return gulp.src([
    './build/package/js/*.js',
    '!build/package/js/**/vendor.js'
  ])
    .pipe(uglify({compress:false}))
    .pipe(gulp.dest('./build/package/js'));
});

// MessageFormat .json to .js message processing. Currently specific to apps-modules.
var MESSAGES_PATH = 'i18n/**/*.json';
gulp.task('messages', function () {
  var messageFormat = require('./lib/gulp/transform-messageformat');
  return gulp.src(MESSAGES_PATH)
    .pipe(rename(function (filepath) {
      var app = filepath.dirname;
      var locale = filepath.basename;
      filepath.extname = '.js';
      filepath.dirname = locale;
      filepath.basename = app + '_locale';
    }))
    .pipe(newer(outputDir))
    .pipe(messageFormat())
    .pipe(gulp.dest(outputDir));
});

var ext = 'compressed';
var vendorFiles = [
  'lib/blockly/blockly_' + ext + '.js',
  'lib/blockly/blocks_' + ext + '.js',
  'lib/blockly/javascript_' + ext + '.js',
];

var x = {
  cwd: 'lib/blockly',
  src: ['??_??.js'],
  dest: 'build/package/js',
  // e.g., ar_sa.js -> ar_sa/blockly_locale.js
  rename: function (dest, src) {
    var outputPath = src.replace(/(.{2}_.{2})\.js/g, '$1/blockly_locale.js');
    return path.join(dest, outputPath);
  }
};

gulp.task('blockly_locale', function() {
  var path = require('path');
  return gulp.src('lib/blockly/??_??.js')
    .pipe(rename(function (filepath) {
      // e.g., ./ar_sa.js -> ./ar_sa/blockly_locale.js
      filepath.dirname = path.join(filepath.dirname, filepath.basename);
      filepath.basename = 'blockly_locale';
    }))
    .pipe(gulp.dest('./build/package/js'));
});

gulp.task('vendor', ['blockly_locale'], function () {
  var concat = require('gulp-concat');
  return gulp.src(vendorFiles)
    .pipe(newer('./build/package/js/blockly.js'))
    .pipe(concat('blockly.js'))
    .pipe(gulp.dest('./build/package/js'));
});

// Synchronize static files to a public folder
gulp.task('media', function () {
  var media = config.media;
  var mediaStreams = Object.keys(media).map(function(src) {
    var dest = media[src];
    return gulp.src(src)
      .pipe(newer(dest))
      .pipe(gulp.dest(dest));
  });
  return es.merge(mediaStreams);
});

// Process sass stylesheets to .css
gulp.task('sass', function () {
  var sass = require('gulp-sass');
  var styles = config.stylesheets;
  var sassStreams = Object.keys(styles).map(function(src) {
    var dest = styles[src];
    return gulp.src(src)
      .pipe(sass())
      .pipe(newer(dest))
      .pipe(gulp.dest(dest));
  });
  return es.merge(sassStreams);
});

// Create lodash custom build
gulp.task('lodash', function (cb) {
  var exec = require('child_process').exec;
  return exec('`npm bin`/lodash include="debounce,reject,map,value,range,without,sample,create,flatten,isEmpty,wrap,size,bind" --output src/lodash.js', cb);
});

gulp.task('build', ['browserify', 'media', 'sass', 'messages']);

// Call 'package' for maximum compression of all .js files
gulp.task('package', ['compress', 'media', 'sass', 'messages']);

// watch-mode incremental builds for dev environment
gulp.task('dev', ['vendor', 'messages', 'media', 'sass'], function() {
  gulp.watch(MESSAGES_PATH, ['messages']);
  gulp.watch(Object.keys(config.media), ['media']);
  gulp.watch(Object.keys(config.stylesheets), ['sass']);

  var extend = require('util')._extend;
  appsBrowserifyConfig = extend(appsBrowserifyConfig, {watch: true});
  var browserify = require('./lib/gulp/gulp-browserify');
  var javascripts = Object.keys(config.javascripts).map(function(src) {
    return {src: src, dest: config.javascripts[src]};
  });
  var browserifyConfigs = [appsBrowserifyConfig].concat(javascripts);
  return es.merge(browserifyConfigs.map(function(config) {
    config = extend(config, {watch: true});
    return browserify(config)();
  }));
});

gulp.task('lint', function() {
  var jshint = require('gulp-jshint');
  return gulp.src([
      'Gulpfile.js',
      'Gruntfile.js',
      'tasks/**/*.js',
      'lib/gulp/*.js',
      'src/**/*.js',
      'test/**/*.js',
      '!src/hammer.js',
      '!src/lodash.js',
      '!src/lodash.min.js',
      '!src/canvg/*.js'
    ]
  )
    .pipe(jshint({
      node: true,
      browser: true,
      globals: {
        Blockly: true,
        //TODO: Eliminate the globals below here.
        StudioApp: true,
        Maze: true,
        Turtle: true,
        Bounce: true
      }
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['lint', 'mochaTest']);

var mocha = require('gulp-mocha');
gulp.task('mochaTest', function() {
  return gulp.src([
    'test/*.js',
    'test/calc/*.js',
    'test/netsim/*.js'
  ], { read: false })
    .pipe(mocha({
      reporter: 'spec',
      timeout: 10000,
      globals: {
        $: require('jquery')
      }
    }));
});