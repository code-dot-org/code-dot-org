var childProcess = require('child_process');
// Polyfill used by check-dependencies
childProcess.spawnSync = require('spawn-sync');
var checkDeps = require('check-dependencies');
var es = require('event-stream');
var mkdirp = require('mkdirp');

var gulp = require('gulp');
var newer = require('gulp-newer');
var uglify = require('gulp-uglify');

var config = require('./pipeline-config.json');
var mediaTask = require('./media');
var sassTask = require('./sass');
var bundle = require('./browserify');

function browserify(watch) {
  Object.keys(config.javascripts).map(function(src) {
    var bundleConfig = {
      src: src,
      dest: config.javascripts[src],
      watch: watch
    };
    // TODO (brent): is there reason ./browserify can't export the bundle
    // funciton directly instead of us needing to call bundle()()?
    bundle(bundleConfig)();
  });
}

function ensureNpmDependencies() {
  // Install npm dependencies if not present
  try {
    checkDeps.sync({
      onlySpecified: true,
      install: true
    });
  } catch (e) {
    console.error('Your dependencies are out of date. Run `npm prune && npm install` to fix.');
    process.exit(1);
  }
}

ensureNpmDependencies();

gulp.task('build', ['bundle-js', 'prebuild', 'npm-build']);
gulp.task('prebuild', ['media', 'sass']);

// Synchronize static files to a public folder
gulp.task('media', mediaTask(config.media));
// Process sass stylesheets to .css
gulp.task('sass', sassTask(config.stylesheets));

// Call 'package' for maximum compression of all .js files
gulp.task('package', ['compress', 'prebuild']);

// run "npm run build" to build linked packages
gulp.task('npm-build', ['npm-install'], function() {
  return es.concat(config.packages.map(function(packageDir) {
    var through = es.through();
    childProcess.spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: packageDir
    }).on('exit', through.end);
    return through;
  }));
});

// Install all sub-package dependencies
gulp.task('npm-install', function() {
  return es.concat(config.packages.map(function(packageDir) {
    var through = es.through();
    mkdirp(packageDir + '/node_modules', function () {
      checkDeps({
        packageDir: packageDir,
        onlySpecified: true,
        install: true
      }).then(function(){
        through.end();
      });
    });
    return through;
  }));
});

// run 'npm start' on all linked packages
gulp.task('npm-start', ['npm-install'], function() {
  return es.concat(config.packages.map(function(packageDir) {
    var through = es.through();
    childProcess.spawn('npm', ['start'], {
      stdio: 'inherit',
      cwd: packageDir
    }).on('exit', through.end);
    return through;
  }));
});

// Bundle commonJS module graphs into a single file
gulp.task('bundle-js', function() {
  return browserify(false);
});

// Compress bundled .js
gulp.task('compress', ['bundle-js'], function () {
  var js = config.javascripts;
  var compressStreams = Object.keys(js).map(function(src) {
    var dest = js[src];
    return gulp.src(src)
      .pipe(newer(dest))
      .pipe(uglify())
      .pipe(gulp.dest(dest));
  });
  return es.merge(compressStreams);
});

// watch-mode incremental builds for dev environment
gulp.task('dev', ['prebuild', 'npm-start'], function() {
  gulp.watch(Object.keys(config.media), ['media']);
  gulp.watch(Object.keys(config.stylesheets), ['sass']);
  browserify(true);
});
