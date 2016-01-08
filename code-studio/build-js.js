#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('./build-commands');
var commander = require('commander');

/** @const {string} */
var BUILD_PATH = './build/js/';

/** @const {string} */
var SRC_PATH = './src/js/';


// Use commander to parse command line arguments
// https://github.com/tj/commander.js
commander
    .option('--min', 'Build minified output', false)
    .option('--watch', 'Watch file system', false)
    .parse(process.argv);

// Run build (exits on failure)
// TODO - think about how watchify will work for multiple commands
build_commands.execute([
  build_commands.ensureDirectoryExists(BUILD_PATH),
  build_commands.browserify({
    srcPath: SRC_PATH,
    buildPath: BUILD_PATH,
    filenames: [
      'levelbuilder.js',
      'levelbuilder_dsl.js',
      'levelbuilder_studio.js',
      'leveltype_widget.js'
    ],
    commonFile: 'code-studio-common',
    shouldFactor: true,
    shouldMinify: commander.min,
    shouldWatch: commander.watch
  }),
  build_commands.browserify({
    srcPath: SRC_PATH + 'initApp/',
    buildPath: BUILD_PATH,
    filenames: [
      'initApp.js'
    ],
    commonFile: 'initApp',
    shouldFactor: false,
    shouldMinify: commander.min,
    shouldWatch: commander.watch
  })
]);

console.log("code-studio js built\n");
