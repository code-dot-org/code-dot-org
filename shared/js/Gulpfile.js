// There's also a set of code that lives in dashboard/app/assets/javascript
// that should really be going through our browserify type pipeline

// TODO (brent) - figure out story for sharing code between different packages. (linklocal)
// TODO (brent) - framework for writing tests


var gulp = require('gulp');
var del = require('del');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var browserify = require('./lib/frontend/browserify');

var watchEnabled = false;

var BUILD_TARGET = './build/package/js';

gulp.task('enable-watch', function () {
  watchEnabled = true;
});

gulp.task('bundle-js', function () {
  // May want some sort of step to check dependencies here in the future

  var files = [
    'initApp.js'
  ];
  var config = {
    src: files,
    dest: BUILD_TARGET + '/shared.js',
    watch: watchEnabled
  };

  return browserify(config)();
});

gulp.task('compress', ['bundle-js'], function () {
  var files = [
    BUILD_TARGET + '/shared.js'
  ];
  return gulp.src(files)
    .pipe(uglify())
    .pipe(rename(function (path) {
      if (path.extname === '.js') {
        path.basename += '.min';
      }
    }))
    .pipe(gulp.dest(BUILD_TARGET));
});

gulp.task('watch', ['enable-watch', 'bundle-js']);
gulp.task('default', ['compress']);
