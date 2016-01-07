#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('./build-commands.js');

var commander = require('commander');

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
commander
    .option('--min', 'Build minified output', false)
    .option('--watch', 'Watch file system', false)
    .parse(process.argv);

var BUILD_PATH = './build/package/js/';

// Run build
build_commands.execute([
  build_commands.ensureDirectoryExists(BUILD_PATH),
  build_commands.browserify({
    srcPath:  './',
    buildPath: BUILD_PATH,
    filenames: [
      'shared.js'
    ],
    commonFile: 'shared-common.js',
    shouldMinify: commander.min,
    shouldWatch: commander.watch
  })
]);
console.log('shared built');
