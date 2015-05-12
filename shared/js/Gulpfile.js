// Some interesting questions
// (1) Where does built js live? Same as apps?
// (2) Is built code checked in?


var gulp = require('gulp');
var glob = require('glob');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var browserify = require('./lib/frontend/browserify');

var watchEnabled = false;

gulp.task('lint', function () {
  // TODO - more complete list
  // TODO - share jshint config between different packages
  return gulp.src([
      'initApp.js',
      'client_api/*.js'
    ])
    .pipe(jshint({
      curly: true,
      node: true,
      mocha: true,
      browser: true,
      undef: true
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('enable-watch', function () {
  watchEnabled = true;
});

gulp.task('bundle-js', function () {
  // TODO - check dependencies?

  // TODO - more complete list
  var files = [
    'initApp.js'
  ];
  var config = {
    src: files,
    dest: 'build/shared.js',
    watch: watchEnabled
  };

  return browserify(config)();
});

gulp.task('compress', ['bundle-js'], function () {
  var files = [
    'build/shared.js'
  ];
  return gulp.src(files)
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('watch', ['enable-watch', 'bundle-js']);
gulp.task('default', ['bundle-js']);
