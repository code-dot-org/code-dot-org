#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var _ = require('lodash');
var build_commands = require('./build-commands');
var chalk = require('chalk');
var commander = require('commander');

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
commander
    .option('--dist', 'Build output optimized for distribution', false)
    .option('--watch', 'Watch file system', false)
    .parse(process.argv);

var defaultOptions = {
  srcPath: 'src/js/',
  buildPath: 'build/js/',
  shouldFactor: false,
  forDistribution: commander.dist,
  shouldWatch: commander.watch
};

Promise.all([
  // Code in code-studio.js and any common code factored out of this bundle
  // gets included into every page in dashboard.
  // @see application.html.haml
  build_commands.bundle(_.extend({}, defaultOptions, {
    filenames: [
      'code-studio.js',
      'levelbuilder.js',
      'levelbuilder_dsl.js',
      'levelbuilder_studio.js',
      'levels/contract_match.jsx',
      'levels/widget.js'
    ],
    commonFile: 'code-studio-common',
    shouldFactor: true
  })),

  // For now, build initApp (formerly the 'shared' package) as its own
  // build step, skipping factor-bundle.  Eventually since this and
  // code-studio-common can be included on the same page, we may want to try
  // factoring out common modules to optimize download size.
  // @see _apps_dependencies.html.haml
  build_commands.bundle(_.extend({}, defaultOptions, {
    srcPath: './src/js/initApp/',
    filenames: [
      'initApp.js'
    ],
    commonFile: 'initApp'
  })),

  // Build embedVideo.js in its own step (skipping factor-bundle) so that
  // we don't have to include the large code-studio-common file in the
  // embedded video page, keeping it fairly lightweight.
  // (I wonder how much more we could slim it down by removing jQuery!)
  // @see embed.html.haml
  build_commands.bundle(_.extend({}, defaultOptions, {
    filenames: [
      'embedVideo.js'
    ],
    commonFile: 'embedVideo'
  })),

  // only-react.js is just React in a bundle. In the future, this might be
  // expanded to include a small set of libraries that we expect on the global
  // namespace
  build_commands.bundle(_.extend({}, defaultOptions, {
    filenames: [
      'react-only.js'
    ],
    commonFile: 'react-only'
  })),

  // Have a bundle for plc stuff - no sense in expanding this to everything yet
  build_commands.bundle(_.extend({}, defaultOptions, {
    filenames: [
      'plc/perform_evaluation.js'
    ],
    commonFile: 'plc'
  }))
]).then(function (results) {
  var allStepsSucceeded = !results.some(function (result) {
    return result instanceof Error;
  });

  if (allStepsSucceeded) {
    build_commands.logBoxedMessage("code-studio js built");
  } else {
    build_commands.logBoxedMessage('code-studio js build failed', chalk.bold.red.bgBlack);
  }

  if (commander.watch) {
    console.log("Watching for changes...");
  } else if (!allStepsSucceeded) {
    // Don't actually call process.exit() on success, or you might truncate one
    // of the files produced by factor-bundle!  Let the process exit gracefully
    // on its own.
    process.exit(1);
  }
});
