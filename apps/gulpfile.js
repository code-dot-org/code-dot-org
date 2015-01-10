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

var APPS = [
  'maze',
  'turtle',
  'bounce',
  'flappy',
  'studio',
  'jigsaw',
  'calc',
  'webapp',
  'eval'
];
var allFilesSrc = [];
var allFilesDest = [];
APPS.forEach(function (app) {
  allFilesSrc.push('./src/' + app + '/main.js');
  allFilesDest.push(outputDir + app + '.js');
});
var browserifyConfig = {filesSrc: allFilesSrc, filesDest: allFilesDest, outputDir: outputDir};

gulp.task('browserify', ['vendor'], function() {
  var browserify = require('./lib/gulp/gulp-browserify');
  return browserify(browserifyConfig)();
});

gulp.task('compress', ['browserify'], function () {
  var uglify = require('gulp-uglify');
  return gulp.src([
    './build/package/js/*.js',
    '!build/package/js/**/vendor.js'
  ])
    .pipe(uglify({compress:false}))
    .pipe(gulp.dest('./build/package/js'))
});

gulp.task('messages', function () {
  var messageFormat = require('./lib/gulp/transform-messageformat');
  return gulp.src(['i18n/**/*.json'])
    .pipe(rename(function (filepath) {
      var app = filepath.dirname;
      var locale = filepath.basename;
      filepath.extname = '.js';
      filepath.dirname = locale;
      filepath.basename = app + '_locale';
    }))
    .pipe(newer('build/package/js'))
    .pipe(messageFormat())
    .pipe(gulp.dest('build/package/js'));
});

var ext = 'compressed';
var vendorFiles = [
  'lib/blockly/blockly_' + ext + '.js',
  'lib/blockly/blocks_' + ext + '.js',
  'lib/blockly/javascript_' + ext + '.js',
  'lib/blockly/' + 'en_us' + '.js'
];

gulp.task('vendor', function () {
  var concat = require('gulp-concat');
  return gulp.src(vendorFiles)
    .pipe(newer('./build/package/js/en_us/blockly.js'))
    .pipe(concat('blockly.js'))
    .pipe(gulp.dest('./build/package/js/en_us'))
});

// Serve static files in public folder
gulp.task('media', function () {
  return gulp.src(['static/**/*', 'lib/blockly/media/**/*'])
    .pipe(newer('./build/package/media'))
    .pipe(gulp.dest('./build/package/media'))
});

// Create lodash custom build
gulp.task('lodash', function (cb) {
  var exec = require('child_process').exec;
  return exec('`npm bin`/lodash include="debounce,reject,map,value,range,without,sample,create,flatten,isEmpty,wrap,size,bind" --output src/lodash.js', cb);
});

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

gulp.task('build', ['browserify', 'media', 'sass', 'messages']);

// Call 'package' for maximum compression of all .js files
gulp.task('package', ['compress', 'media', 'sass', 'messages']);

// watch-mode incremental builds for dev environment
gulp.task('dev', ['vendor', 'messages', 'media', 'sass'], function() {
  gulp.watch('i18n/**/*.json', ['messages']);
  gulp.watch(['static/**/*', 'lib/blockly/media/**/*'], ['media']);
  gulp.watch(Object.keys(config.stylesheets), ['sass']);

  var extend = require('util')._extend;
  browserifyConfig = extend(browserifyConfig, {watch: true});
  var browserify = require('./lib/gulp/gulp-browserify');
  return browserify(browserifyConfig)();
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
