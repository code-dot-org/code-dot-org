#!/usr/bin/env node
/** @file Build script for CSS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var commander = require('commander');
var commands = require('./build-commands');
var path = require('path');
var ensureDirectoryExists = commands.ensureDirectoryExists;
var executeShellCommandsInParallel = commands.executeShellCommandsInParallel;
var logSuccess = commands.logSuccess;
var logFailure = commands.logFailure;

/** @const {string} */
var SRC_PATH = './src/css/';

/** @const {string} */
var BUILD_PATH = './build/css/';

/** @const {string[]} */
var FILES = [
  'levelbuilder.scss',
  'leveltype_widget.scss',
  'plc.scss'
];

/**
 * Paths to search when evaluating scss @import directives.
 * Rooted at code-studio root, with NO trailing slash.
 * @const {string[]}
 */
var INCLUDE_PATHS = [
  'node_modules',
  'src/css',
  '../shared/css'
];

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
commander
    .option('--dist', 'Build output optimized for distribution', false)
    .parse(process.argv);

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

Promise.resolve()
    .then(ensureDirectoryExists(BUILD_PATH))
    .then(executeShellCommandsInParallel(sassCommands))
    .then(logSuccess("code-studio css built"))
    .catch(logFailure("code-studio css failed"));
