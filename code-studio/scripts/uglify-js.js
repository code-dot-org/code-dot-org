#!/usr/bin/env node
/** @file Uglify previously-built JS assets in the code-studio package, which is
 *        loaded by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('./build-commands');
var config = require('./config');
var fs = require('fs');
var recursiveReaddirSync = require('recursive-readdir-sync');

/**
 * Run uglify on the built JavaScript files in the build directory.
 * @returns {Promise} that resolves when the build is completed or fails.
 */
function uglifyBuiltJS() {

  // List all the .js files in the build directory
  var builtFiles = recursiveReaddirSync(config.JS_BUILD_PATH).filter(function (path) {
    return /\.js$/i.test(path);
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

  return build_commands.executeParallel(uglifyCommands)
      .then(function () {
        build_commands.logBoxedMessage("code-studio js uglified");
      }, function (error) {
        build_commands.logBoxedMessage("code-studio js uglify failed");
        throw error;
      });
}

module.exports = uglifyBuiltJS;
if (!module.parent) {
  uglifyBuiltJS();
}
