// Synchronize static files to a public folder
module.exports = function(styles) {
  return function () {
    var es = require('event-stream');
    var gulp = require('gulp');
    var newer = require('gulp-newer');
    var sass = require('gulp-sass');

    var sassStreams = Object.keys(styles).map(function (src) {
      var dest = styles[src];
      return gulp.src(src)
        .pipe(newer(dest))
        .pipe(sass({includePaths: ['../../shared/css/']}))
        .pipe(gulp.dest(dest));
    });
    // Add passThrough stream to handle case where there are no other streams
    var passThrough = es.through();
    setTimeout(function(){passThrough.end();}, 0);
    return es.concat([passThrough].concat(sassStreams));
  };
};
