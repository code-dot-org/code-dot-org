// Some interesting questions
// (1) Where does built js live? Same as apps?
// (2) Is built code checked in?


var gulp = require('gulp');
var uglify = require('gulp-uglify');

var browserify = require('./lib/frontend/browserify');

var watchEnabled = false;

gulp.task('enable-watch', function () {
  watchEnabled = true;
});

gulp.task('bundle-js', function () {
  console.log('bundle');
  // TODO - check dependencies?

  // TODO - more complete list
  var config = {
    src: ['initApp.js'],
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
