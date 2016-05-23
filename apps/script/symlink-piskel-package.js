#!/usr/bin/env node

var chalk = require('chalk');
var args = require('commander');
var fs = require('fs');
var path = require('path');
var cdoConfig = require('./cdo-config');

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
args.option('-v, --verbose', 'Show all logging messages', false)
    .option('-q, --quiet', 'Suppress all output', false)
    .parse(process.argv);

var DEVELOPMENT_PISKEL_PATH_KEY = 'development_piskel_path';

var piskelLinkPath = path.resolve(__dirname, '../lib/piskel');
var releasePiskelPath = path.resolve(__dirname, '../lib/piskel-package');
var developmentPiskelPath = cdoConfig.get(DEVELOPMENT_PISKEL_PATH_KEY);
var piskelPath = developmentPiskelPath ? developmentPiskelPath : releasePiskelPath;

/**
 * Idempotent creation of symlink to checked-in piskel package or to local
 * repo's build output folder, depending on locals.yml settings.
 */
function createOrUpdatePiskelLink() {
  fs.readlink(piskelLinkPath, function (err, linkString) {
    var linkExists = !err;
    var linkIsCorrect = (linkString === piskelPath);
    if (linkExists && linkIsCorrect) {
      reportInfo('Piskel symlink is current.');
      reportDevelopmentPiskel();
      return;
    }

    try {
      if (linkExists) {
        fs.unlinkSync(piskelLinkPath);
      }
      fs.symlinkSync(piskelPath, piskelLinkPath);
      reportInfo('Set piskel symlink to ' + piskelPath);
      reportDevelopmentPiskel();
    } catch (err) {
      reportError(err);
    }
  });
}

function reportInfo(message) {
  if (args.verbose) {
    process.stdout.write(message + '\n');
  }
}

function reportError(err) {
  if (!args.quiet) {
    process.stderr.write(chalk.red('Failure while updating piskel symlink:\n') + err + '\n');
  }
}

function reportDevelopmentPiskel() {
  if (piskelPath === developmentPiskelPath && !args.quiet) {
    process.stdout.write(chalk.yellow('/*' +
        '\n * PISKEL DEVELOPMENT MODE:' +
        '\n * You are building apps using the local piskel repository at' +
        '\n * ' +
        '\n * ' + piskelPath +
        '\n * ' +
        '\n * To go back to using the code-dot-org copy of piskel, comment' +
        '\n * out the ' + DEVELOPMENT_PISKEL_PATH_KEY + ' entry in your locals.yml file.' +
        '\n */\n'));
  }
}

createOrUpdatePiskelLink();
