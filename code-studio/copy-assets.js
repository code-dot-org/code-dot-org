#!/usr/bin/env node
/** @file Build script for copying unpreprocessed assets from the code-studio
 * package and its dependencies over into the build output directory. */
'use strict';

var build_commands = require('./build-commands');

/** @const {string} */
var BUILD_PATH = './build/assets/';

// Run build (exits on failure)
build_commands.execute([
  build_commands.ensureDirectoryExists(BUILD_PATH),

  // TODO: At some point, have an assets directory that we can add to.
  //build_commands.copyDirectory('./assets', BUILD_PATH),

  // We have to do some weird stuff to get our fallback video player working.
  // video.js expects some of its own files, and its dependency vtt.js, to be
  // served by the application, so we include them in our build and access them
  // via static (non-fingerprinted) root-relative paths.
  // We may have to do something similar with ace editor later, but generally
  // we'd prefer to avoid this way of doing things.
  build_commands.copyDirectory('./node_modules/video.js/dist/video-js', BUILD_PATH + 'video-js'),
  build_commands.copyDirectory('./node_modules/video.js/node_modules/vtt.js/dist', BUILD_PATH + 'vtt.js'),
]);

console.log("code-studio assets copied\n");

