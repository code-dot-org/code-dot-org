#!/usr/bin/env node
/** @file Build script for CSS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var _ = require('lodash');
var child_process = require('child_process');
var program = require('commander');
var path = require('path');

/** @const {string} */
var SRC_PATH = './src/css/';

/** @const {string} */
var BUILD_PATH = './build/css/';

/**
 * Paths to search when evaluating scss @import directives.
 * Rooted at working directory, with NO trailing slash.
 * @type {string[]}
 */
var INCLUDE_PATHS = [
  'node_modules',
  'src/css',
  '../shared/css'
];

/**
 * Files to build, given as paths rooted at code-studio/src/js/
 * Each will result in an output file.
 * @type {string[]}
 */
var FILES = [
  'levelbuilder.scss',
  'leveltype_widget.scss'
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

  // Run build
  var buildCommands = [
    ensureDirectoryExists(BUILD_PATH),
    sassCommand(SRC_PATH, BUILD_PATH, FILES, INCLUDE_PATHS, program.min)
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
    console.log("code-studio built\n");
  } catch (e) {
    process.exit(e.status);
  }
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
function sassCommand(srcPath, buildPath, files, includePaths, shouldMinify) {
  var includePathArgs = includePaths.map(function (path) {
    return '--include-path ' + path;
  }).join(' ');

  return files.map(function (file) {
    if (shouldMinify) {
      return 'node-sass --output-style compressed ' + includePathArgs + ' ' +
          srcPath + file + ' ' +
          buildPath + path.basename(file, '.scss') + '.min.css';
    }

    return 'node-sass ' + includePathArgs + ' ' +
        srcPath + file + ' ' +
        buildPath + path.basename(file, '.scss') + '.css';
  }).join(" && \\\n");
}

// Execute build script
main();
