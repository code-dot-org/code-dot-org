// Synchronize static files to a public folder
module.exports = function(media) {
  return function () {
    var es = require('event-stream');
    var gulp = require('gulp');
    var newer = require('gulp-newer');

    var mediaStreams = Object.keys(media).map(function(src) {
      var dest = media[src];
      return gulp.src(src)
        .pipe(newer(dest))
        .pipe(gulp.dest(dest));
    });
    // Add passThrough stream to handle case where there are no other streams
    var passThrough = es.through();
    setTimeout(function(){passThrough.end();}, 0);
    return es.concat([passThrough].concat(mediaStreams));
  };
};
