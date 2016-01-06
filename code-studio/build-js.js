#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('../shared/js/build-commands');
var commander = require('commander');

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
  'leveltype_widget.js'
];

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
commander
    .option('--min', 'Build minified output', false)
    .parse(process.argv);

// Run build (exits on failure)
build_commands.execute([
  build_commands.ensureDirectoryExists(BUILD_PATH),
  build_commands.browserifyCommand(SRC_PATH, BUILD_PATH, FILES, commander.min)
]);

console.log("code-studio js built\n");
