#!/usr/bin/env node
/** @file Build script for CSS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('./build-commands');
var commander = require('commander');
var path = require('path');

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
commander
    .option('--dist', 'Build output optimized for distribution', false)
    .parse(process.argv);

/** @const {string} */
var SRC_PATH = './src/css/';

/** @const {string} */
var BUILD_PATH = './build/css/';

/** @const {string[]} */
var FILES = [
  'levelbuilder.scss',
  'leveltype_widget.scss'
];

/**
 * Paths to search when evaluating scss @import directives.
 * Rooted at working directory, with NO trailing slash.
 * @const {string[]}
 */
var INCLUDE_PATHS = [
  'node_modules',
  'src/css',
  '../shared/css'
];

// Build up list of shell commands to run SASS on each file
var includePathArguments = INCLUDE_PATHS.map(function (path) {
  return '--include-path ' + path;
}).join(" \\\n    ");
var sassCommands = FILES.map(function (file) {
  return [
    'node-sass' + (commander.dist ? ' --output-style compressed' : ''),
    includePathArguments,
    SRC_PATH + file,
    BUILD_PATH + path.basename(file, '.scss') + '.css'
  ].join(" \\\n    ");
});

// Run build (exits on failure)
build_commands.ensureDirectoryExists(BUILD_PATH)
    .then(build_commands.executeShellCommandsInParallel.bind(undefined, sassCommands))
    .then(build_commands.logSuccess.bind(undefined, "code-studio css built"))
    .catch(build_commands.logFailure.bind(undefined, "code-studio css failed"));
