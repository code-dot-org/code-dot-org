#!/usr/bin/env node
/** @file Uglify previously-built JS assets in the code-studio package, which is
 *        loaded by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('./build-commands');
var config = require('./config');
var fs = require('fs');
var recursiveReaddirSync = require('recursive-readdir-sync');

// Get the list of files in the build directory
var builtFiles = recursiveReaddirSync(config.JS_BUILD_PATH).filter(function (path) {
  return /\.js$/i.test(path);
});

var uglifyCommands = builtFiles.map(function (path) {
  return [
    'uglifyjs ' + path,
    '--compress warnings=false',
    '--mangle',
    '--output ' + path
  ].join(' \\\n    ');
});

// Run build (exits on failure)
build_commands.execute(uglifyCommands);
build_commands.logBoxedMessage("code-studio js uglified");
