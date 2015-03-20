var dest = require('gulp').dest;
var gutil = require('gulp-util');

// Gulp browserify integration with working factor-bundle plugin, and watch/non-watch modes
// Factor-bundle added if options.factorBundleDest is set.
module.exports = function(options) {
  var path = require('path');
  var outputDir = path.dirname(options.dest);
  var outputFile = path.basename(options.dest);

  var browserifyOpts = {};
  if(options.watch) {
    var watchify = require('watchify');
    browserifyOpts = watchify.args;
  }

  function getBundler() {
    var browserify = require('browserify');
    var bundler = browserify(options.src, browserifyOpts);
    if (options.watch) {
      bundler = watchify(bundler);
      bundler.on('update', bundle); // on any dep update, runs the bundler
    }

    bundler.on('log', function(log) {gutil.log(outputFile + ': ' + log);}); // output build logs to terminal
    if (options.factorBundleDest) {
      bundler.plugin('factor-bundle', {outputs: options.factorBundleDest});
    }
    return bundler;
  }

  function bundle() {
    var source = require('vinyl-source-stream');
    return getBundler().bundle()
      // log errors if they happen
      .on('error', function(e){gutil.log('Browserify Error: ' + e);})
      .pipe(source(outputFile))
      .pipe(dest(outputDir));
  }
  return bundle;
};
