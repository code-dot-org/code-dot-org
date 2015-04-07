// Gulp and general plugins
var config = require('./pipeline-config.json');
var gulp = require('gulp');

gulp.task('build', ['bundle-js', 'prebuild', 'npm-build']);
gulp.task('prebuild', ['media', 'sass']);

// Synchronize static files to a public folder
gulp.task('media', require('./media')(config.media));
// Process sass stylesheets to .css
gulp.task('sass', require('./sass')(config.stylesheets));

// Call 'package' for maximum compression of all .js files
gulp.task('package', ['compress', 'prebuild']);

// run "npm install" to build linked packages
gulp.task('npm-build', function() {
  return gulpInstall(false);
});

// run "npm install --ignore-scripts" to install dependencies
gulp.task('npm-install', function() {
  return gulpInstall(true);
});

function gulpInstall(ignoreScripts) {
  var install = require("gulp-install");
  return gulp.src(config.packages.map(function(item){return item + '/package.json';}))
    .pipe(install({ignoreScripts: ignoreScripts}));
}

// run 'npm start' on all linked packages
gulp.task('npm-start', ['npm-install'], function() {
  var spawn = require('child_process').spawn;
  var es = require('event-stream');
  return es.concat(config.packages.map(function(pkgDir) {
    var through = es.through();
    var start = spawn('npm', ['start'], {stdio: 'inherit', cwd: pkgDir});
    start.on('exit', through.end);
    return through;
  }));
});

// Bundle commonJS module graphs into a single file
gulp.task('bundle-js', function() {
  return browserify(false);
});

function browserify(watch) {
  var bundle = require('./browserify');
  var extend = require('util')._extend;
  getBundles().map(function(config) {
    if(watch) config = extend(config, {watch: true});
    return bundle(config)();
  });
}

function getBundles() {
  return Object.keys(config.javascripts).map(function(src) {
    return {src: src, dest: config.javascripts[src]};
  });
}

// Compress bundled .js
gulp.task('compress', ['bundle-js'], function () {
  var es = require('event-stream');
  var newer = require('gulp-newer');
  var uglify = require('gulp-uglify');

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
  return browserify(true);
});
