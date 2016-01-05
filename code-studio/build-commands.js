/** @file Build commands for use by build scripts in the code-studio package. */
'use strict';

var _ = require('lodash');
var child_process = require('child_process');
var path = require('path');

/**
 * Generate command to:
 * Bundle JavaScript files using Browserify, break out common code using
 * factor-bundle, and (optionally) minify output using uglify.
 * @param {string} srcPath - Path to root of JavaScript source files, absolute
 *        or relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string} buildPath - Path to root of output directory, absolute or
 *        relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string[]} files - List of files to build, given as paths rooted at
 *        the srcPath given.  Each will map to an output file.
 * @param {boolean} [shouldMinify] if provided and TRUE, will build minified
 *        output files (with .min.js extensions) instead of unminified output.
 * @returns {string}
 */
exports.browserifyCommand = function (srcPath, buildPath, files, shouldMinify) {
  var browserifyInputFiles = files.map(function (file) {
    return srcPath + file;
  }).join(' ');

  if (shouldMinify) {
    return [
      'browserify ' + browserifyInputFiles,
      "-p [ factor-bundle -o 'uglifyjs > " + buildPath + "`basename $FILE .js`.min.js' ]",
      '| uglifyjs -o ' + buildPath + 'code-studio-common.min.js'
    ].join(" \\\n    ");
  }

  return [
    'browserify --debug ' +  browserifyInputFiles,
    "-p [ factor-bundle -o '> " + buildPath + "`basename $FILE .js`.js' ]",
    '-o ' + buildPath + 'code-studio-common.js'
  ].join(" \\\n    ");

  // This should work (I think) but untested
  // return exports.browserifyExt({
  //   srcPath: srcPath,
  //   buildPath: buildPath,
  //   files: files.map(function (file) { return [file, file]; }),
  //   shouldMinify: shouldMinify,
  //   shouldWatch: false
  // });
};

/**
 * Generate command to:
 * Bundle JavaScript files using Browserify, break out common code using
 * factor-bundle, and (optionally) minify output using uglify and (optionally)
 * run watch in watch mode using watchify
 * @param {object} config
 * @param {string} config.srcPath - Path to root of JavaScript source files, absolute
 *        or relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {string} config.buildPath - Path to root of output directory, absolute or
 *        relative to execution path for this script (which is the code-studio
 *        folder for this build system), with trailing slash.
 * @param {(string[])[]} config.filenames - List of tuples. Each tuple contains the
          src filename (relative to srcPath) and the resulting output filename
          (relative to buildPath)
 * @param {boolean} config.shouldMinify if true, will build minified
 *        output files (with .min.js extensions) instead of unminified output.
 * @param {boolean} config.shouldWatch if true, will watch file system for
 *        changes, and rebuild when it detects them
 * @returns {string}
 */
exports.browserifyExt = function (config) {
  var srcPath = config.srcPath;
  var buildPath = config.buildPath;
  var filenames = config.filenames;
  var commonFile = config.commonFile;
  var shouldMinify = config.shouldMinify;
  var shouldWatch = config.shouldWatch;

  // list of input files
  var browserifyInputFiles = filenames.map(function (filePair) {
    return srcPath + filePair[0];
  }).join(' ');

  var browserifyOutputs = filenames.map(function (filePair) {
    if (shouldMinify) {
      // todo - path.basename
      var minFile = path.basename(filePair[1], '.js') + '.min.js';
      return "-o 'uglifyjs > " + buildPath + minFile + "'";
    }
    return '-o ' + buildPath + filePair[1];
  }).join(' ');

  var command = (shouldWatch ? 'watchify -v' : 'browserify') +
    (shouldMinify ? '' : ' --debug');

  var commonOutput = (shouldMinify ? '| uglifyjs ': '') +
    '-o ' + buildPath + path.basename(commonFile, '.js') +
    (shouldMinify ? '.min.js' : '.js');

  return [
    command + ' ' + browserifyInputFiles,
    "-p [ factor-bundle " + browserifyOutputs + ']',
    commonOutput
  ].join(" \\\n    ");
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
  // Run build
  var buildCommands = commands.join(" && \\\n");
  console.log(buildCommands);

  try {
    // For documentation on synchronous execution of shell commands from node scripts, see:
    // https://nodejs.org/docs/latest/api/child_process.html#child_process_synchronous_process_creation
    var result = child_process.execSync(buildCommands, {
      env: _.extend({}, process.env, {
        PATH: './node_modules/.bin:' + process.env.PATH
      }),
      stdio: 'inherit'
    });
  } catch (e) {
    process.exit(e.status);
  }
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
 * @param {string[]} files - List of files to build, given as paths rooted at
 *        the srcPath given.  Each will map to an output file.
 * @param {string[]} includePaths - List of paths to search for files included
 *        via scss import directives, rooted at the working directory, with NO
 *        trailing slash.
 * @param {boolean} [shouldMinify] if provided and TRUE, will build minified
 *        output files (with .min.css extensions) instead of unminified output.
 * @returns {string}
 */
exports.sassCommand = function (srcPath, buildPath, files, includePaths, shouldMinify) {
  var command = 'node-sass' + (shouldMinify ? ' --output-style compressed' : '');
  var extension = (shouldMinify ? '.min.css' : '.css');
  var includePathArgs = includePaths.map(function (path) {
    return '--include-path ' + path;
  }).join(' ');

  return files.map(function (file) {
    return command + ' ' +
        includePathArgs + ' ' +
        srcPath + file  + ' ' +
        buildPath + path.basename(file, '.scss') + extension;
  }).join(" && \\\n");
};
