var dest = require('gulp').dest;
var gutil = require('gulp-util');

// Gulp browserify integration with working factor-bundle plugin, and watch/non-watch modes
module.exports = function(options) {
  var browserifyOpts = {};
  if(options.watch) {
    var watchify = require('watchify');
    browserifyOpts = watchify.args;
  }

  function getBundler() {
    var browserify = require('browserify');
    var bundler = browserify(options.filesSrc, browserifyOpts);
    if (options.watch) {
      bundler = watchify(bundler);
      bundler.on('update', bundle); // on any dep update, runs the bundler
    }

    bundler.on('log', gutil.log); // output build logs to terminal
    bundler.transform('ejsify');
    bundler.plugin('factor-bundle', {outputs: options.filesDest});
    return bundler;
  }

  function bundle() {
    var source = require('vinyl-source-stream');
    return getBundler().bundle()
      // log errors if they happen
      .on('error', function(e){gutil.log('Browserify Error: ' + e);})
      .pipe(source('common.js'))
      .pipe(dest(options.outputDir));
  }
  return bundle;
};
