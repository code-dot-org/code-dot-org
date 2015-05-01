var childProcess = require('child_process');
// Polyfill used by check-dependencies
childProcess.spawnSync = require('spawn-sync');
var checkDeps = require('check-dependencies');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

var gulp = require('gulp');
var newer = require('gulp-newer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var bundle = require('@cdo/cdo/lib/frontend/browserify');
var mediaTask = require('@cdo/cdo/lib/frontend/media');
var sassTask = require('@cdo/cdo/lib/frontend/sass');
var messageFormat = require('./tasks/transform-messageformat');

function configString(id) {
  return process.env['npm_package_config_' + id];
}

/**
 * Convert npm-style package-config array entries to the original array
 */
function configArray(id) {
  var item = null;
  var i = 0;
  var array = [];
  do {
    item = process.env['npm_package_config_' + id + '_' + i++];
    if(item) {
      array.push(item);
    }
  } while(item);
  return array;
}

function browserify(watch) {
  // TODO (brent) why does this happen as part of the browserify step here,
  // but in the install in root?
  mkdirp.sync('./src/node_modules');
  var checkDeps = require('check-dependencies');
  checkDeps.sync({
    packageDir: './src',
    onlySpecified: true,
    install: true}
  );

  var bundleConfig = {
    src: appFilesSrc,
    dest: JS_OUTPUT + 'common.js',
    factorBundleDest: appFilesDest,
    watch: watch
  };

  return bundle(bundleConfig)();
}

// TODO (brent) - is there reason we dont try/catch here but do in the root gulpfile?
function ensureNpmDependencies() {
  // Install npm dependencies if not present
  // try {
    checkDeps.sync({
      onlySpecified: true,
      install: true
    });
  // } catch (e) {
  //   console.error('Your dependencies are out of date. Run `npm prune && npm install` to fix.');
  //   process.exit(1);
  // }
}

/**
 * Newer looks at timestamps on link rather than linked file. This provides us
 * a way to send it the linked file itself.
 * @param {string} path Path to potential symlink
 * @returns {string} Path to linked file if a symlink, otherwise the input path
 */
function followSymlink(filepath) {
  var stats = fs.lstatSync(filepath);
  if (!stats.isSymbolicLink()) {
    return path;
  }

  return path.resolve(path.dirname(filepath), fs.readlinkSync(filepath));
}

ensureNpmDependencies();

var APPS = configArray('apps');
var APPS_OUTPUT = configString('output');

var JS_OUTPUT = APPS_OUTPUT + 'js/';
var appFilesSrc = [];
var appFilesDest = [];
APPS.forEach(function (app) {
  appFilesSrc.push('./src/' + app + '/main.js');
  appFilesDest.push(JS_OUTPUT + app + '.js');
});

// Format package.json config entries
var STYLESHEETS = configArray('stylesheets');
var MEDIA = configArray('media');
var mediaFiles = {};
var cssFiles = {};
MEDIA.forEach(function(media) {
  mediaFiles[media] = APPS_OUTPUT + 'media/';
});
STYLESHEETS.forEach(function(css) {
  cssFiles[css] = APPS_OUTPUT + 'css/';
});

/**
 *  Expose two primary tasks:
 *  gulp build: compile/concatenate all source files
 *  gulp dev: Run watch-mode incremental compilation
**/

gulp.task('build', [
  (process.env.NODE_ENV === 'production' ? 'compress' : 'bundle-js'),
  'media',
  'sass',
  'messages'
]);

// Bundle commonJS module graphs into a single file
gulp.task('bundle-js', ['vendor'], function() {
  browserify(false);
});

gulp.task('dev', ['media', 'sass', 'messages', 'vendor'], function() {
  gulp.watch(Object.keys(mediaFiles), ['media']);
  gulp.watch(Object.keys(cssFiles), ['sass']);
  browserify(true);
});

// Synchronize static files to a public folder
gulp.task('media', mediaTask(mediaFiles));
// Process sass stylesheets to .css
gulp.task('sass', sassTask(cssFiles));

// MessageFormat .json to .js precompile
gulp.task('messages', function () {
  return gulp.src('i18n/**/*.json')
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
  // Build debug version by setting env variable or passing --debug to npm
  // command
  // Note: If you try switch between full/minified builds without making code
  // changes, newer() will prevent that from happening. Can solve with an
  // npm clean.
  var ext = 'compressed';
  if (process.env.MOOC_DEV === '1' || process.env.npm_config_debug) {
    ext = 'uncompressed';
  }

  var vendorFiles = [
    'lib/blockly/blockly_' + ext + '.js',
    'lib/blockly/blocks_' + ext + '.js',
    'lib/blockly/javascript_' + ext + '.js'
  ].map(followSymlink);

  // Note: If you want to switch between
  var concat = require('gulp-concat');
  return gulp.src(vendorFiles)
    .pipe(newer(JS_OUTPUT + 'blockly.js'))
    .pipe(concat('blockly.js'))
    .pipe(gulp.dest(JS_OUTPUT));
});

gulp.task('compress', ['bundle-js'], function () {
  var files = [
    JS_OUTPUT + '*.js',
    '!' + JS_OUTPUT + '**//*blockly.js'
  ];
  return gulp.src(files)
    .pipe(uglify())
    .pipe(gulp.dest(JS_OUTPUT));
});
