#!/usr/bin/env node
/** @file Build script for CSS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var _ = require('lodash');
var build_commands = require('./build-commands');
var commander = require('commander');

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

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
commander
    .option('--dist', 'Build output optimized for distribution', false)
    .parse(process.argv);

// Run build (exits on failure)
build_commands
    .executeSequence([
      build_commands.ensureDirectoryExists(BUILD_PATH)
    ])
    .then(function () {
      return build_commands.executeParallel([
        build_commands.sass(SRC_PATH, BUILD_PATH, 'levelbuilder.scss', INCLUDE_PATHS, commander.dist),
        build_commands.sass(SRC_PATH, BUILD_PATH, 'leveltype_widget.scss', INCLUDE_PATHS, commander.dist)
      ]);
    })
    .then(_.partial(build_commands.logSuccess, "code-studio css built"))
    .catch(_.partial(build_commands.logFailure, "code-studio css failed"));
