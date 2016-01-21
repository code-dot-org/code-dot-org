#!/usr/bin/env node
/** @file Uglify previously-built JS assets in the code-studio package, which is
 *        loaded by dashboard (our "Code Studio" Rails app). */
'use strict';

var commands = require('./build-commands');
var fs = require('fs');
var recursiveReaddirSync = require('recursive-readdir-sync');
var executeShellCommandsInParallel = commands.executeShellCommandsInParallel;
var logSuccess = commands.logSuccess;
var logFailure = commands.logFailure;

// List all the .js files in the build directory
var builtFiles = recursiveReaddirSync('build/js/').filter(function (file) {
  return /\.js$/i.test(file);
});

// Design the shell commands for uglifying those files
var uglifyCommands = builtFiles.map(function (path) {
  return [
    'uglifyjs ' + path,
    '--compress warnings=false',
    '--mangle',
    '--output ' + path
  ].join(' \\\n    ');
});

Promise.resolve()
    .then(executeShellCommandsInParallel(uglifyCommands))
    .then(logSuccess("code-studio js uglified"))
    .catch(logFailure("code-studio js uglify failed"));
