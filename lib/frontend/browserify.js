// Browserify API integration with working factor-bundle plugin and watch/non-watch modes
// Factor-bundle plugin added if options.factorBundleDest is set.
module.exports = function(options) {
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

    bundler.on('log', function(log) {console.log(options.dest + ': ' + log);}); // output build logs to console
    if (options.factorBundleDest) {
      bundler.plugin('factor-bundle', {outputs: options.factorBundleDest});
    }
    return bundler;
  }

  function bundle() {
    return getBundler().bundle()
      // log errors if they happen
      .on('error', function(e){console.log('Browserify Error: ' + e);})
      .pipe(require('fs').createWriteStream(options.dest));
  }
  return bundle;
};
