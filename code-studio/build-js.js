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
  build_commands.ensureDirectoryExists(BUILD_PATH + 'levels/'),
  build_commands.browserify({
    srcPath: SRC_PATH,
    buildPath: BUILD_PATH,
    filenames: [
      'code-studio.js',
      'levelbuilder.js',
      'levelbuilder_dsl.js',
      'levelbuilder_studio.js',
      'levels/contract_match.jsx',
      'leveltype_widget.js'
    ],
    commonFile: 'code-studio-common',
    shouldFactor: true,
    shouldMinify: commander.min,
    shouldWatch: commander.watch
  }),

  // For now, build initApp (formerly the 'shared' package) as its own
  // build step, skipping factor-bundle.  Eventually since this and
  // code-studio-common can be included on the same page, we may want to try
  // factoring out common modules to optimize download size.
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
  }),

  // Build embedVideo.js in its own step (skipping factor-bundle) so that
  // we don't have to include the large code-studio-common file in the
  // embedded video page, keeping it fairly lightweight.
  // (I wonder how much more we could slim it down by removing jQuery!)
  build_commands.browserify({
    srcPath: SRC_PATH,
    buildPath: BUILD_PATH,
    filenames: [
      'embedVideo.js'
    ],
    commonFile: 'embedVideo',
    shouldFactor: false,
    shouldMinify: commander.min,
    shouldWatch: commander.watch
  })
]);
build_commands.logBoxedMessage("code-studio js built");
