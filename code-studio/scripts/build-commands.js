/** @file Build commands for use by build scripts in the code-studio package. */
/* global Promise */
'use strict';

var _ = require('lodash');
var browserifyInc = require('browserify-incremental');
var chalk = require('chalk');
var child_process = require('child_process');
var envify = require('envify');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var watchify = require('watchify');
var globalShim = require('browserify-global-shim');

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
 * @param {boolean} [config.forDistribution] - If true, this bundle step will be
 *        treated as part of a build for distribution, with certain environment
 *        variables inlined, and dead code and whitespace removed.
 * @param {object} [config.browserifyGlobalShim] - If supplied, applied as options
 *        to a browserifyGlobalShim transform.
 * @returns {Promise} that resolves after the build completes or fails - even
 *          if the build fails, the promise should resolve, but get an Error
 *          object as its result.  If watch is enabled, the promise resolves
 *          after the initial build success or failure, but the watch will keep
 *          running.
 */
exports.bundle = function (config) {
  var makeBundle;
  var srcPath = config.srcPath;
  var buildPath = config.buildPath;
  var filenames = config.filenames;
  var commonFile = config.commonFile;
  var shouldFactor = config.shouldFactor;
  var shouldWatch = config.shouldWatch;
  var forDistribution = config.forDistribution;
  var browserifyGlobalShim = config.browserifyGlobalShim;

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
  var bundler = browserifyInc({
    // Enables source map
    debug: true,

    // Allow requiring jsx without specifying extension
    extensions: ['.jsx'],

    // Required for browserify-incremental
    cacheFile: shouldWatch ? undefined : outPath(srcPath + commonFile).replace(/\.js?$/i, '.cache.json'),

    // Required for watchify
    cache: {},
    packageCache: {}
  });

  // Define inputs
  bundler.add(filenames.map(function (file) {
    return path.resolve(srcPath, file);
  }));

  // babelify tranforms jsx files for us
  bundler.transform('babelify', { compact: false });

  if (forDistribution) {
    // We inline 'production' as the NODE_ENV in distribution builds because this
    // puts React into production mode, and allows uglifyify to remove related
    // dead code paths.
    process.env.NODE_ENV = 'production';
    bundler
        .transform(envify)
        .transform('uglifyify');
  }

  // factor-bundle splits the bundle back up into parts, but leaves common
  // modules in the main browserify stream.
  if (shouldFactor) {
    bundler.plugin('factor-bundle', {
      outputs: filenames.map(function (file) {
        return outPath(srcPath + file);
      })
    });
  }

  if (browserifyGlobalShim) {
    bundler.transform({global: true}, globalShim.configure(browserifyGlobalShim));
  }

  // Optionally enable watch/rebuild loop
  if (shouldWatch) {
    bundler
        .plugin(watchify)
        .on('update', function () {
          console.log(timeStamp() + ' Changes detected...');
          makeBundle();
        });
  }

  makeBundle = function (onComplete) {
    onComplete = onComplete || function () {};
    var bundlingAttemptError;

    // We attach events to our filesystem output stream, because it's the
    // best indicator of when the bundle is actually done building.
    var outStream = fs.createWriteStream(outPath(srcPath + commonFile))
        .on('error', function (err) {
          logBoldRedError(err);
          onComplete(err);
        })
        .on('finish', function () {
          if (!bundlingAttemptError) {
            logTargetsBuilt();
          }
          onComplete(bundlingAttemptError);
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
    makeBundle(resolve);
  });
};

/**
 * Copy one one directory (and entire contents) into another, only updating
 * if source file is newer or destination file is missing.
 * @param {!string} srcDir - Note: If you use trailing slash, the directory's
 *                  contents will be copied into destDir.  If you omit the
 *                  the trailing slash, the directory itself will be copied
 *                  to destDir.  See `man rsync` for more info.
 * @param {!string} destDir
 * @returns {Promise}
 */
function copyDirectory(srcDir, destDir) {
  return executeShellCommand('rsync -av ' + srcDir + ' ' + destDir);
}

/**
 * Creates given director(y|ies) to any depth if it does not exist, no-op if
 * it does already exist.
 * @param {!string} dir
 * @returns {Promise}
 */
function ensureDirectoryExists(dir) {
  return executeShellCommand('mkdir -p ' + dir);
}

/**
 * Executes a single shell command in a child process that inherits the
 * environment and stdout/stderr from this process.
 *
 * @param {!string} command
 * @returns {Promise.<string>} which resolves to the child process' stdout if
 * the command exits with code zero, or rejects if the child process fails.
 */
function executeShellCommand(command) {
  return new Promise(function (resolve, reject) {
    console.log(command);
    child_process.exec(command, getChildProcessOptions(), function (err, stdout, stderr) {
      if (stderr && stderr.length) {
        console.log(stderr);
      }

      if (stdout && stdout.length) {
        console.log(stdout);
      }

      if (err) {
        reject(transformExecError(err));
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Generate options object to pass into child_process.exec()
 * @returns {{env: Object, stdio: string}}
 */
function getChildProcessOptions() {
  return {
    env: _.extend({}, process.env, {
      PATH: './node_modules/.bin:' + process.env.PATH
    })
  };
}

/**
 * Given an array of shell commands, executes those commands in child processes
 * in parallel.
 * @param {!string[]} commands - list of shell commands
 * @returns {Promise} which resolves when all commands are completed, or rejects
 *          as soon as any command fails.
 */
function executeShellCommandsInParallel(commands) {
  return Promise.all(commands.map(executeShellCommand));
}

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
 * @param {!string} message
 * @returns {Promise} already resolved
 */
function logSuccess(message) {
  return Promise.resolve(exports.logBoxedMessage(message));
}

/**
 * @param {!string} message
 * @param {Error} reason
 * @returns {Promise} rejected with same reason
 */
function logFailure(message, reason) {
  logBoldRedError(reason);
  warnIfWrongNodeVersion();
  exports.logBoxedMessage(message, chalk.bold.red.bgBlack);
  return Promise.reject(reason);
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
  if (err.formatted) {
    console.log(err.formatted);
  }
}

/**
 * Given a filename, synchronously ensures the directory that would contain
 * that file exists (to any depth).
 * @param {string} target - path to a file.
 */
function ensureTargetDirectoryExists(target) {
  mkdirp.sync(path.dirname(target));
}

/**
 * @returns {string} a time string formatted [HH:MM:SS] in 24-hour time.
 */
function timeStamp() {
  return '[' + new Date().toLocaleTimeString('en-US', { hour12: false }) + ']';
}

/**
 * Given an error raised by a child_process.exec or execSync call, extract the
 * inner error JSON that gets dumped into the message and apply its properties
 * to the original error object before returning it.  If no inner JSON is found,
 * return the original Error unchanged.
 * @param {!Error} error
 * @returns {Error}
 */
function transformExecError(error) {
  // Search for an opening brace on its own line to find the beginning of the
  // inner error JSON text
  var match = error.message.match(/^{$/m);
  var innerErrorIndex = (match ? match.index : -1);
  if (innerErrorIndex >= 0) {
    var outerMessage = error.message.slice(0, innerErrorIndex);
    var innerErrorJSON = error.message.slice(innerErrorIndex);
    try {
      var innerError = JSON.parse(innerErrorJSON);
      for (var key in innerError) {
        error[key] = innerError[key];
      }
      error.message = outerMessage;
    } catch (e) {
      console.log(e);
    }
  }
  return error;
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

/**
 * Wraps a function so that calling it with a set of arguments returns a new
 * function with those arguments pre-bound - essentially a one-time curry.
 * @param {!function} fn
 * @returns {Function}
 */
function makeBuildCommand(fn) {
  return function () {
    return fn.bind.apply(fn, [undefined].concat([].slice.call(arguments)));
  };
}

// Export wrapped versions of the commands we need, suitable for passing
// into Promise.prototype.then()
_.extend(module.exports, {
  copyDirectory: makeBuildCommand(copyDirectory),
  ensureDirectoryExists: makeBuildCommand(ensureDirectoryExists),
  executeShellCommandsInParallel: makeBuildCommand(executeShellCommandsInParallel),
  logSuccess: makeBuildCommand(logSuccess),
  logFailure: makeBuildCommand(logFailure)
});
