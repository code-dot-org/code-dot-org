var browserify = require('browserify');
var watchify = require('watchify');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

/**
 * Browserify API integration with working factor-bundle plugin and watch/
 * non-watch modes
 * @param {Object} options
 * @param {string[]} options.src List of filepaths of entry points
 * @param {string} options.dest Filepath of generated bundle
 * @param {boolean} [options.watch=false]
 * @param {string[]} [options.factorBundleDest] Optionally specifies output for
 *   each entry point
 */
// Factor-bundle plugin added if options.factorBundleDest is set.
module.exports = function(options) {
  var browserifyOpts = {};
  if(options.watch) {
    browserifyOpts = watchify.args;
  }

  function getBundler() {
    var bundler = browserify(options.src, browserifyOpts);
    if (options.watch) {
      bundler = watchify(bundler);
      bundler.on('update', bundle); // on any dep update, runs the bundler
    }

    bundler.on('log', function(log) {
      // output build logs to console
      console.log(options.dest + ': ' + log);
    });

    // if (options.factorBundleDest) {
    //   bundler.plugin('factor-bundle', { outputs: options.factorBundleDest });
    // }
    return bundler;
  }

  function bundle() {
    mkdirp.sync(path.dirname(options.dest));
    return getBundler()
      .bundle()
      // log errors if they happen
      .on('error', function(e){
        console.log('Browserify Error: ' + e);
      })
      .pipe(fs.createWriteStream(options.dest));
  }

  return bundle;
};
