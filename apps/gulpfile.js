/**
 *  Expose two primary tasks:
 *  gulp build: compile/concatenate all source files
 *  gulp dev: Run watch-mode incremental compilation
**/

var gulp = require('gulp');
gulp.task('build', ['bundle-js', 'media', 'sass', 'messages']);

var newer = require('gulp-newer');
var rename = require("gulp-rename");

function configString(id) {
  return process.env['npm_package_config_'+id];
}

// Convert npm-style package-config array entries to the original array
function configArray(id) {
  var item = null,
    i = 0,
    array = [];
  do {
    item = process.env['npm_package_config_' + id + '_' + i++];
    if(item) array.push(item);
  } while(item);
  return array;
}

var APPS = configArray('apps');
var APPS_OUTPUT = configString('output');

var JS_OUTPUT = APPS_OUTPUT + 'js/';
var appFilesSrc = [];
var appFilesDest = [];
APPS.forEach(function (app) {
  appFilesSrc.push('./src/' + app + '/main.js');
  appFilesDest.push(JS_OUTPUT + app + '.js');
});
var appsBrowserifyConfig = {src: appFilesSrc, dest: JS_OUTPUT + 'common.js', factorBundleDest: appFilesDest};

// Bundle commonJS module graphs into a single file
gulp.task('bundle-js', ['vendor'], function() {
  return browserify(false);
});

function browserify(watch) {
  var bundle = require('@cdo/cdo/lib/frontend/browserify');
  var extend = require('util')._extend;
  var config = appsBrowserifyConfig;
  if(watch) config = extend(config, {watch: true});
  return bundle(config)();
}

gulp.task('dev', ['media', 'sass'], function() {
  gulp.watch(Object.keys(mediaFiles), ['media']);
  gulp.watch(Object.keys(cssFiles), ['sass']);
  return browserify(true);
});

// Format package.json config entries
var STYLESHEETS = configArray('stylesheets');
var MEDIA = configArray('media');
var mediaFiles = {},
  cssFiles = {};
MEDIA.forEach(function(media) {mediaFiles[media] = APPS_OUTPUT + 'media/';});
STYLESHEETS.forEach(function(css) {cssFiles[css] = APPS_OUTPUT + 'css/';});

// Synchronize static files to a public folder
gulp.task('media', require('@cdo/cdo/lib/frontend/media')(mediaFiles));
// Process sass stylesheets to .css
gulp.task('sass', require('@cdo/cdo/lib/frontend/sass')(cssFiles));


// MessageFormat .json to .js precompile
var MESSAGES_PATH = 'i18n/**/*.json';
gulp.task('messages', function () {
  var messageFormat = require('./tasks/transform-messageformat');
  return gulp.src(MESSAGES_PATH)
    .pipe(rename(function (filepath) {
      var app = filepath.dirname;
      var locale = filepath.basename;
      filepath.extname = '.js';
      filepath.dirname = locale;
      filepath.basename = app + '_locale';
    }))
    .pipe(newer(JS_OUTPUT))
    .pipe(messageFormat())
    .pipe(gulp.dest(JS_OUTPUT));
});

var ext = 'compressed';
var vendorFiles = [
  'lib/blockly/blockly_' + ext + '.js',
  'lib/blockly/blocks_' + ext + '.js',
  'lib/blockly/javascript_' + ext + '.js'
];

gulp.task('blockly_locale', function() {
  var path = require('path');
  return gulp.src('lib/blockly/??_??.js')
    .pipe(rename(function (filepath) {
      // e.g., ./ar_sa.js -> ./ar_sa/blockly_locale.js
      filepath.dirname = path.join(filepath.dirname, filepath.basename);
      filepath.basename = 'blockly_locale';
    }))
    .pipe(gulp.dest(JS_OUTPUT));
});

// Compile blockly.js and locale files
gulp.task('vendor', ['blockly_locale'], function () {
  var concat = require('gulp-concat');
  return gulp.src(vendorFiles)
    .pipe(newer(JS_OUTPUT + 'blockly.js'))
    .pipe(concat('blockly.js'))
    .pipe(gulp.dest(JS_OUTPUT));
});

gulp.task('compress', ['bundle-js'], function () {
  var uglify = require('gulp-uglify');
  return gulp.src([
    JS_OUTPUT + '*.js',
    '!' + JS_OUTPUT + '**//*blockly.js'
  ])
    .pipe(uglify())
    .pipe(gulp.dest(JS_OUTPUT));
});
