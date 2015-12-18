#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var _ = require('lodash');
var child_process = require('child_process');
var program = require('commander');
var path = require('path');

/** @const {string} */
var SRC_PATH = './src/js/';

/** @const {string} */
var BUILD_PATH = './build/js/';

/**
 * Files to build, given as paths rooted at code-studio/src/js/
 * Each will result in an output file.
 * @type {string[]}
 */
var FILES = [
  'levelbuilder.js',
  'levelbuilder_dsl.js',
  'levelbuilder_studio.js',
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
    browserifyCommand(program.min)
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
 * Bundle JavaScript files using Browserify, break out common code using
 * factor-bundle, and (optionally) minify output using uglify.
 * @param {boolean} [shouldMinify]
 * @returns {string}
 */
function browserifyCommand(shouldMinify) {
  var browserifyInputFiles = FILES.map(function (file) {
    return SRC_PATH + file;
  }).join(' ');

  if (shouldMinify) {
    return [
        'browserify ' + browserifyInputFiles,
        "-p [ factor-bundle -o 'uglifyjs > " + BUILD_PATH + "`basename $FILE .js`.min.js' ]",
        '| uglifyjs -o ' + BUILD_PATH + 'code-studio-common.min.js'
    ].join(" \\\n    ");
  }

  return [
    'browserify --debug ' +  browserifyInputFiles,
    "-p [ factor-bundle -o '> " + BUILD_PATH + "`basename $FILE .js`.js' ]",
    '-o ' + BUILD_PATH + 'code-studio-common.js'
  ].join(" \\\n    ");
}

// Execute build script
main();
