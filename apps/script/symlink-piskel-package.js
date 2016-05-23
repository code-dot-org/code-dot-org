#!/usr/bin/env node

var chalk = require('chalk');
var childProcess = require('child_process');
var args = require('commander');
var fs = require('fs');
var path = require('path');
var cdoConfig = require('./cdo-config');

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

/**
 * Copy built piskel library from local piskel repository to apps/lib/piskel-package,
 * then commit it (and only it).
 */
function updatePiskelPackage() {
  if (piskelPath !== developmentPiskelPath) {
    process.stderr.write(chalk.yellow('/*' +
        '\n * Unable to update piskel package' +
        '\n *' +
        '\n * You must configure a local piskel repository to use this update command.' +
        '\n * To do so, point the "' + DEVELOPMENT_PISKEL_PATH_KEY + '" option in your locals.yml' +
        '\n * to the aboslute path of your piskel repostiory root.' +
        '\n */\n'));
    process.exitCode = 1;
    return;
  }

  try {
    var stdioSetting = args.quiet ? 'ignore' : args.verbose ? 'inherit' : 'pipe';
    childProcess.execSync('rm -rf ' + releasePiskelPath);
    childProcess.execSync('cp -R ' + developmentPiskelPath + '/dest/prod ' + releasePiskelPath);
    var changedFiles = childProcess.execSync('git status --porcelain ' + releasePiskelPath);
    if (changedFiles.length === 0) {
      report('Nothing to update.');
      return;
    }

    var commitCmd = 'git commit -m "Update piskel package" -- ' + releasePiskelPath;
    reportInfo(commitCmd);
    childProcess.execSync(commitCmd, { stdio: stdioSetting });
    report('Piskel package updated.');
  } catch (err) {
    reportError(err);
  }
}

function report(message) {
  if (!args.quiet) {
    process.stdout.write(message + '\n');
  }
}

function reportInfo(message) {
  if (!args.quiet && args.verbose) {
    process.stdout.write(message + '\n');
  }
}

function reportError(err) {
  if (!args.quiet) {
    process.stderr.write(chalk.red('Failed:\n') + err + '\n');
    process.exitCode = 1;
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

// Use commander to parse command line arguments
// https://github.com/tj/commander.js
args.option('-v, --verbose', 'Show all logging messages', false)
    .option('-q, --quiet', 'Suppress all output', false);

args.command('symlink')
    .description('Create or update symlink to piskel package')
    .action(createOrUpdatePiskelLink);

args.command('update')
    .description('Copy built piskel package to code-dot-org repo and commit it')
    .action(updatePiskelPackage);

if (!process.argv.slice(2).length) {
  args.help();
}

args.parse(process.argv);
