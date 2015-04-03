// Gulp and general plugins
var config = require('./pipeline-config.json');

var es = require('event-stream');
var gulp = require('gulp');
var newer = require('gulp-newer');
var rename = require("gulp-rename");

var APPS_OUTPUT = config.appsOutput;

var appFilesSrc = [];
var appFilesDest = [];
config.apps.forEach(function (app) {
  appFilesSrc.push('./src/' + app + '/main.js');
  appFilesDest.push(APPS_OUTPUT + app + '.js');
});
var appsBrowserifyConfig = {src: appFilesSrc, dest: APPS_OUTPUT + 'common.js', factorBundleDest: appFilesDest};

gulp.task('bundle-js', ['npm-install', 'vendor'], function() {
  var browserify = require('./lib/gulp/gulp-browserify');
  var browserifyConfigs = [appsBrowserifyConfig].concat(config.javascripts);
  return es.merge(browserifyConfigs.map(function(config) {
    return browserify(config)();
  }));
});

gulp.task('compress', ['bundle-js'], function () {
  var uglify = require('gulp-uglify');
  var javascriptOutputs = Object.values(config.javascripts);
  return gulp.src(javascriptOutputs.concat([
    APPS_OUTPUT + '*.js',
    '!' + APPS_OUTPUT + '**/blockly.js'
  ]))
    .pipe(uglify())
    .pipe(gulp.dest(APPS_OUTPUT));
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
    .pipe(newer(APPS_OUTPUT))
    .pipe(messageFormat())
    .pipe(gulp.dest(APPS_OUTPUT));
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
    .pipe(gulp.dest(APPS_OUTPUT));
});

gulp.task('vendor', ['blockly_locale'], function () {
  var concat = require('gulp-concat');
  return gulp.src(vendorFiles)
    .pipe(newer(APPS_OUTPUT + 'blockly.js'))
    .pipe(concat('blockly.js'))
    .pipe(gulp.dest(APPS_OUTPUT));
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

gulp.task('build', ['bundle-js', 'media', 'sass', 'messages']);

// Call 'package' for maximum compression of all .js files
gulp.task('package', ['compress', 'media', 'sass', 'messages']);

// Install dependencies specified in package.json files
gulp.task('npm-install', function() {
  var install = require("gulp-install");
  return gulp.src(['./src/package.json'])
    .pipe(install());
});

// watch-mode incremental builds for dev environment
gulp.task('dev', ['vendor', 'messages', 'media', 'sass', 'server'], function() {
  gulp.watch(MESSAGES_PATH, ['messages']);
  gulp.watch(Object.keys(config.media), ['media']);
  gulp.watch(Object.keys(config.stylesheets), ['sass']);

  var extend = require('util')._extend;
  var browserify = require('./lib/gulp/gulp-browserify');
  var javascripts = Object.keys(config.javascripts).map(function(src) {
    return {src: src, dest: config.javascripts[src]};
  });
  appsBrowserifyConfig = extend(appsBrowserifyConfig, {watch: true});
  var browserifyConfigs = [appsBrowserifyConfig].concat(javascripts);
  return es.merge(browserifyConfigs.map(function(config) {
    config = extend(config, {watch: true});
    return browserify(config)();
  }));
});


var tinylr = require('tiny-lr')();
function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);
  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}
gulp.task('server', function() {
  var express = require('express');
  var app = require('./apps/src/dev/server.js');
  app.use(express.static('./build/package'));
  app.listen(8000);
  tinylr.listen(35729);
  gulp.watch(['./build/**/*', './src/dev/**/*'], notifyLiveReload);
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
      '!src/node_modules/**/*',
      '!src/canvg/*.js',
      '!src/calc/js-numbers/js-numbers.js'
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

gulp.task('mochaTest', ['build'], function() {
  var which = require('npm-which')(__dirname).sync;
  var mochify = require('mochify');
  mochify("./test/*.js ./test/calc/*.js ./test/netsim/*.js", {
    reporter : 'spec',
    timeout: 10000,
    phantomjs: which('phantomjs')
  }).bundle();
});
