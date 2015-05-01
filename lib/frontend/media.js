var gulp = require('gulp');
var newer = require('gulp-newer');

/**
 * Synchronize static files to a public folder
 * @param {Object<string, string>} media Maps glob pattern to file location
*/
module.exports = function(media) {
  return function () {
    var mediaStreams = Object.keys(media).map(function(src) {
      var dest = media[src];
      return gulp.src(src)
        .pipe(newer(dest))
        .pipe(gulp.dest(dest));
    });
    return mediaStreams;
  };
};
