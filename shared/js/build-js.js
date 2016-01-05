#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('../../code-studio/build-commands.js');

var program = require('commander');

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
program
    .option('--min', 'Build minified output', false)
    .option('--watch', 'Watch file system', false)
    .parse(process.argv);

var BUILD_PATH = './build/package/js/';

// Run build
build_commands.execute([
  build_commands.ensureDirectoryExists(BUILD_PATH),
  build_commands.browserifyExt({
    srcPath:  './',
    buildPath: BUILD_PATH,
    filenames: [
      ['initApp.js', 'shared.js']
    ],
    commonFile: 'shared-common.js',
    shouldMinify: program.min,
    shouldWatch: program.watch
  })
]);
console.log('shared built');
