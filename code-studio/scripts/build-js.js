#!/usr/bin/env node

/* global Promise */

/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var _ = require('lodash');
var build_commands = require('./build-commands');
var chalk = require('chalk');
var commander = require('commander');
var gaze = require('gaze');
var child_process = require('child_process');

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
      'levelbuilder_markdown.js',
      'levelbuilder_studio.js',
      'districtDropdown.js',
      'levels/contract_match.jsx',
      'levels/widget.js',
      'levels/external.js',
      'levels/multi.js',
      'levels/textMatch.js',
      'levels/levelGroup.js',
      'levels/dialogHelper.js',
      'initApp/initApp.js'
    ],
    commonFile: 'code-studio-common',
    browserifyGlobalShim: {
      "jquery": "$"
    },
    shouldFactor: true
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

  // Have a bundle for plc stuff - no sense in expanding this to everything yet
  build_commands.bundle(_.extend({}, defaultOptions, {
    filenames: [
      'plc/evaluation_creation.js',
      'plc/header.jsx',
      'plc/perform_evaluation.js',
      'plc/task_creation.js'
    ],
    commonFile: 'plc',
    browserifyGlobalShim: {
      "jquery": "$"
    }
  })),

  build_commands.bundle(_.extend({}, defaultOptions, {
    filenames: [
      'pd/workshop_dashboard/workshop_dashboard.jsx'
    ],
    commonFile: 'pd',
    browserifyGlobalShim: {
      "jquery": "$",
      "react": "React",
      "react-dom": "ReactDOM"
    }
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
    // Watching for JavaScript file changes is already set up by browserify/watchify on each bundle
    console.log("Watching for .js file changes...");

    // Use gaze to set a watcher for scss file changes
    gaze('src/css/**/*.scss', function (err, watcher) {

      console.log("Watching for .scss file changes...");

      /* Uncomment this if you want to debug .scss watching

      console.log("cwd: " + process.cwd());
      var watched = this.watched();
      Object.keys(watched).forEach(function(watchedDir) {
        watched[watchedDir].forEach(function(watchedFile) {
          console.log('Watching ' + watchedFile + ' for changes.');
        });
      });
      */

      watcher.on('changed', function (filepath) {
        console.log(filepath + ' was changed, rebuilding CSS');
        child_process.execSync('npm run build-css', {stdio:'inherit'});
      });
    });
  } else if (!allStepsSucceeded) {
    // Don't actually call process.exit() on success, or you might truncate one
    // of the files produced by factor-bundle!  Let the process exit gracefully
    // on its own.
    process.exit(1);
  }
});
