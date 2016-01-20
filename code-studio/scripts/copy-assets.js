#!/usr/bin/env node
/** @file Build script for copying unpreprocessed assets from the code-studio
 * package and its dependencies over into the build output directory. */
'use strict';

var _ = require('lodash');
var build_commands = require('./build-commands');

/** @const {string} */
var BUILD_PATH = './build/assets/';

// TODO: At some point, have a generic assets directory that we can add to.

// Run build (exits on failure)
build_commands.ensureDirectoryExists(BUILD_PATH)
    // We have to do some weird stuff to get our fallback video player working.
    // video.js expects some of its own files to be served by the application, so
    // we include them in our build and access them via static (non-fingerprinted)
    // root-relative paths.
    // We may have to do something similar with ace editor later, but generally
    // we'd prefer to avoid this way of doing things.
    .then(_.partial(build_commands.copyDirectory, './node_modules/video.js/dist/video-js', BUILD_PATH))
    .then(_.partial(build_commands.logSuccess, "code-studio assets copied"))
    .catch(_.partial(build_commands.logFailure, "code-studio asset copy failed"));

