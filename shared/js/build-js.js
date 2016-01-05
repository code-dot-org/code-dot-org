#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var _ = require('lodash');
var child_process = require('child_process');
var program = require('commander');
var path = require('path');

/** @const {string} */
var SRC_PATH = './';

/** @const {string} */
var BUILD_PATH = './build/package/js/';

/**
 * Files to build, given as paths rooted at SRC_PATH
 * Each will result in an output file.
 * @type {string[]}
 */
var FILES = [
  'initApp.js'
];

/**
 * Build script main entry point.
 */
function main() {
  // Use commander to parse command line arguments
  // https://github.com/tj/commander.js
  program
      .option('--min', 'Build minified output', false)
      .parse(process.argv);

  var extension = program.min ? '.min.js' : '.js';

  // Run build
  var buildCommands = [
    ensureDirectoryExists(BUILD_PATH),
    browserifyCommand(SRC_PATH, BUILD_PATH, FILES, 'shared-common', program.min),
    moveFile(BUILD_PATH + 'initApp' + extension, BUILD_PATH + 'shared' + extension)
  ].join(" && \\\n");
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
    console.log("shared built\n");
  } catch (e) {
    process.exit(e.status);
  }
}

function moveFile(src, dest) {
  return 'mv ' + src + ' ' + dest;
}

/**
 * Generate command to:
 * Creates given director(y|ies) to any depth if it does not exist, no-op if
 * it does already exist.
 * @param {!string} dir
 * @returns {string}
 */
function ensureDirectoryExists(dir) {
  return 'mkdir -p ' + dir;
}

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

// BRENT
// Things I changed from Brad's version:
// - commonFile param
function browserifyCommand(srcPath, buildPath, files, commonFile, shouldMinify) {
  var browserifyInputFiles = files.map(function (file) {
    return srcPath + file;
  }).join(' ');

  if (shouldMinify) {
    return [
        'browserify ' + browserifyInputFiles,
        "-p [ factor-bundle -o 'uglifyjs > " + buildPath + "`basename $FILE .js`.min.js' ]",
        '| uglifyjs -o ' + buildPath + commonFile + '.min.js'
    ].join(" \\\n    ");
  }

  return [
    'browserify --debug ' +  browserifyInputFiles,
    "-p [ factor-bundle -o '> " + buildPath + "`basename $FILE .js`.js' ]",
    '-o ' + buildPath + commonFile + '.js'
  ].join(" \\\n    ");
}

// Execute build script
main();
