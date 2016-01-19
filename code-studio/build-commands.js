/** @file Build commands for use by build scripts in the code-studio package. */
'use strict';

var _ = require('lodash');
var browserify = require('browserify');
var chalk = require('chalk');
var child_process = require('child_process');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var watchify = require('watchify');

/**
 * Generate command to:
 * Bundle JavaScript files using Browserify, break out common code using
 * factor-bundle.
 * @param {object} config
 * @param {string} config.srcPath - Path to root of JavaScript source files,
 *        absolute or relative to execution path for this script (which is the
 *        code-studio folder for this build system), with trailing slash.
 * @param {string} config.buildPath - Path to root of output directory, absolute
 *        or relative to execution path for this script (which is the
 *        code-studio folder for this build system), with trailing slash.
 * @param {(string[])[]} config.filenames - List of entry points (relative to
 *        srcPath)
 * @param {string} config.commonFile - Filename for where to output common code
 *        (relative to buildPath)
 * @param {boolean} config.shouldFactor if true, we will factor out common code
 *        into config.commonFile. With non-common code ending up in
 *        <filenames>.js. If false, everything ends up in config.commonFile.
 * @param {boolean} config.shouldWatch if true, will watch file system for
 *        changes, and rebuild when it detects them
 * @returns {Promise} that resolves after the build completes or fails - even
 *          if the build fails, the promise should resolve, but get an Error
 *          object as its result.  If watch is enabled, the promise resolves
 *          after the initial build success or failure, but the watch will keep
 *          running.
 */
exports.bundle = function (config) {
  var runBundle, resolvePromise;
  var srcPath = config.srcPath;
  var buildPath = config.buildPath;
  var filenames = config.filenames;
  var commonFile = config.commonFile;
  var shouldFactor = config.shouldFactor;
  var shouldWatch = config.shouldWatch;

  var outPath = function (inPath) {
    return path
      .resolve(buildPath, path.relative(srcPath, inPath))
      .replace(/\.jsx?$/i, '') + '.js';
  };

  // Create list of full paths to build output files
  var targets = [outPath(srcPath + commonFile)];
  if (shouldFactor) {
    targets = targets.concat(filenames.map(function (file) {
      return outPath(srcPath + file);
    }));
  }

  // Ensure output directory exists for every build target
  targets.forEach(ensureTargetDirectoryExists);

  // Define a helper function that logs when our targets are built.
  var logTargetsBuilt = function () {
    console.log(timeStamp() + ' Built ' +
        targets.map(function (target) {
          return path.join(buildPath, path.relative(buildPath, target));
        }).join('\n                 '));
  };

  // Create browserify instance
  var bundler = browserify({
    // Enables source map
    debug: true,

    // Required for watchify
    cache: {},
    packageCache: {}
  });

  // Define inputs
  bundler.add(filenames.map(function (file) {
    return path.resolve(srcPath, file);
  }));

  // babelify tranforms jsx files for us
  bundler.transform('babelify', {
    compact: false
  });

  // factor-bundle splits the bundle back up into parts, but leaves common
  // modules in the main browserify stream.
  if (shouldFactor) {
    bundler.plugin('factor-bundle', {
      outputs: filenames.map(function (file) {
        return outPath(srcPath + file);
      })
    });
  }

  // Optionally enable watch/rebuild loop
  if (shouldWatch) {
    bundler.plugin(watchify).on('update', function () {
      console.log(timeStamp() + ' Changes detected...');
      runBundle();
    });
  }

  // TODO: release/dist settings

  runBundle = function () {
    var bundlingAttemptError;

    // We attach events to our filesystem output stream, because it's the
    // best indicator of when the bundle is actually done building.
    var outStream = fs.createWriteStream(outPath(srcPath + commonFile))
        .on('error', function (err) {
          logBoldRedError(err);
          resolvePromise(err);
        })
        .on('finish', function () {
          if (bundlingAttemptError) {
            resolvePromise(bundlingAttemptError);
          } else {
            logTargetsBuilt();
            resolvePromise();
          }
        });

    // Bundle the files and pass them to the output stream
    bundler.bundle().on('error', function (err) {
      logBoldRedError(err);
      bundlingAttemptError = err;
      // Necessary to close the stream if an error occurs
      // After calling this, the output stream 'finish' event will occur.
      this.emit('end');
    }).pipe(outStream);
  };

  return new Promise(function (resolve) {
    resolvePromise = _.once(resolve);
    runBundle();
  });
};

/**
 * Generate command to:
 * Copy one one directory (and entire contents) into another, only updating
 * if source file is newer or destination file is missing.
 * @param {!string} srcDir - Note: If you use trailing slash, the directory's
 *                  contents will be copied into destDir.  If you omit the
 *                  the trailing slash, the directory itself will be copied
 *                  to destDir.  See `man rsync` for more info.
 * @param {!string} destDir
 * @returns {string}
 */
exports.copyDirectory = function (srcDir, destDir) {
  return 'rsync -av ' + srcDir + ' ' + destDir;
};

/**
 * Generate command to:
 * Creates given director(y|ies) to any depth if it does not exist, no-op if
 * it does already exist.
 * @param {!string} dir
 * @returns {string}
 */
exports.ensureDirectoryExists = function (dir) {
  return 'mkdir -p ' + dir;
};

/**
 * Execute a sequence of shell commands as a build script, with useful output
 * wherever possible.
 * Will call process.exit() if the command fails for any reason.
 * @param {string[]} commands - array of shell commands to be executed in sequence.
 */
exports.execute = function (commands) {
  commands.forEach(function (command) {
    try {
      console.log(command);

      // For documentation on synchronous execution of shell commands from node scripts, see:
      // https://nodejs.org/docs/latest/api/child_process.html#child_process_synchronous_process_creation
      var result = child_process.execSync(command, {
        env: _.extend({}, process.env, {
          PATH: './node_modules/.bin:' + process.env.PATH
        }),
        stdio: 'inherit'
      });
    } catch (e) {
      exports.exitWithError(e);
    }
  });
};

/**
 * End the node process with the given error message and code.
 * Ensures an exit code of at least one, in case the error doesn't have a code.
 * @param {Error} err
 */
exports.exitWithError = function (err) {
  console.log("\nError: " + err.message);
  warnIfWrongNodeVersion();
  process.exit(err.status || 1);
};

/**
 * Log a message in a box, so it stands out from the rest of the logging info.
 * @param {!string} message
 * @param {Chalk} [style] - a chalk style function.  Defaults to green on black.
 */
exports.logBoxedMessage = function (message, style) {
  style = style || chalk.bold.green.bgBlack;
  var bar = style('+' + _.repeat('-', message.length + 2) + '+');
  console.log(bar + "\n" + style("| " + chalk.white(message) + " |") + "\n" + bar + "\n");
};

/**
 * Generate command to:
 * Process scss files into css files using node-sass.
 * @param {string} srcPath - Path to root of SCSS source files, absolute
 *        or relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string} buildPath - Path to root of output directory, absolute or
 *        relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string} file - SCSS file to build, given as a path rooted at
 *        the srcPath given.  Maps to an output file with a corresponding name.
 * @param {string[]} includePaths - List of paths to search for files included
 *        via scss import directives, rooted at the working directory, with NO
 *        trailing slash.
 * @param {boolean} [shouldMinify] if provided and TRUE, will build minified
 *        output files (with .min.css extensions) instead of unminified output.
 * @returns {string}
 */
exports.sass = function (srcPath, buildPath, file, includePaths, shouldMinify) {
  var command = 'node-sass' + (shouldMinify ? ' --output-style compressed' : '');
  var extension = (shouldMinify ? '.min.css' : '.css');
  var includePathArgs = includePaths.map(function (path) {
    return '--include-path ' + path;
  }).join(" \\\n    ");

  return [
    command,
    includePathArgs,
    srcPath + file,
    buildPath + path.basename(file, '.scss') + extension
  ].join(" \\\n    ");
};

/**
 * Given a filename, synchronously ensures the directory that would contain
 * that file exists (to any depth).
 * @param {string} target - path to a file.
 */
function ensureTargetDirectoryExists(target) {
  mkdirp.sync(path.dirname(target));
}

/**
 * Helper for formatting error messages for the terminal.
 * @param {Error} err
 */
function logBoldRedError(err) {
  console.log([
    chalk.bold.red(timeStamp()),
    chalk.bold.red(err.name),
    chalk.bold(err.message)
  ].join(' '));
  if (err.codeFrame) {
    console.log(err.codeFrame);
  }
}

/**
 * @returns {string} a time string formatted [HH:MM:SS] in 24-hour time.
 */
function timeStamp() {
  return '[' + new Date().toLocaleTimeString('en-US', { hour12: false }) + ']';
}


/**
 * Checks current node version, prints a warning if the expected version is not
 * currently being used.
 */
function warnIfWrongNodeVersion() {
  var nodev = process.version;
  var semver = require('semver');
  var engines_node = process.env.npm_package_engines_node;
  if (engines_node && !semver.satisfies(nodev, engines_node, true)) {
      console.log('You are using node ' + process.version + '. This build script expects ' + engines_node + '.');
  }
}
