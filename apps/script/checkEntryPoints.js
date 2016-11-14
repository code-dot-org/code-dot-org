var chalk = require('chalk');
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');
var memoize = require('lodash/memoize');

const ENTRY_POINT_FILE_PATH_PATTERN = /^\.\/src\/sites\/([\w.]+)\/pages\/(.*)\.jsx?$/;
const SITES_CONFIG = {
  'studio': {
    templateRoot: '../dashboard/app/views',
    templateGlobs: ['**/*.erb', '**/*.haml'],
    templateExtensions: ['erb', 'haml'],
    silence: [
      'applab',
      'applab-api',
      'bounce',
      'calc',
      'craft',
      'eval',
      'flappy',
      'gamelab',
      'jigsaw',
      'levelbuilder',
      'levels/dashboardDialogHelper',
      'levels/multi',
      'maker/dependencies',
      'maze',
      'netsim',
      'publicKeyCryptography',
      'studio',
      'turtle',
      'weblab',
    ],
  },
  'code.org': {
    templateRoot: '../pegasus/sites.v3/code.org/public',
    templateGlobs: ['**/*.erb', '**/*.haml'],
    templateExtensions: ['erb', 'haml'],
    silence: [
      'learn/index',
    ]
  },
};

module.exports = function (webpackConfig, options={verbose: false}) {
  const stats = {
    failed: 0,
    silenced: 0,
    passed: 0,
  };

  let logVerbose = () => undefined;
  let logError = console.log;
  if (options.verbose) {
    logVerbose = console.log;
  }

  let entryPromises = Object.keys(webpackConfig.entry).map(key => {
    let promise = new Promise(resolve => resolve());
    var errors = [];
    var usageCount = 0;
    var entryPointPath = webpackConfig.entry[key][1];
    var searchString = 'js/'+key+'.js';
    var possibleValidKeys = new Set();
    var matchedTemplatePaths = [];
    var entryPointPatternMatch = entryPointPath.match(
      ENTRY_POINT_FILE_PATH_PATTERN
    );
    const site = entryPointPatternMatch && entryPointPatternMatch[1];
    if (site) {
      const siteConfig = SITES_CONFIG[site];
      //const templatesToSearch = glob.sync(
      //  siteConfig.templateGlobs.map(glob => siteConfig.templateRoot + glob)
      //);
      let findArgs = siteConfig.templateExtensions.map(ext => `-name '*.${ext}'`).join(' -o ');
      promise = new Promise(resolve =>
        child_process.exec(
          `find ${siteConfig.templateRoot} ${findArgs}`,
          (err, stdout, stderr) => {
            const templatesToSearch = stdout.split('\n').filter(f=>f);
            child_process.exec(
              `grep "${searchString}" ${templatesToSearch.join(' ')}`,
              (err, stdout, stderr) => {
                let lines = stdout.split('\n');
                lines.forEach(line => {
                  if (!line) {
                    return;
                  }
                  let templatePath = line.split(':')[0];
                  usageCount++;
                  var relativePath = templatePath.replace(siteConfig.templateRoot, '').slice(1);
                  possibleValidKeys.add(relativePath.split('.')[0]);
                  matchedTemplatePaths.push(relativePath);
                });
                resolve();
              }
            );
          }
        )
      ).then(() => {
        if (possibleValidKeys.size === 1) {
          var keyShouldBe = possibleValidKeys.keys().next().value;
          if (keyShouldBe !== key) {
            errors.push(
              `Entry point names should match the name of the file they are used in.\n` +
              `This entry point should be renamed to ${chalk.underline(keyShouldBe)}!`
            );
          }
        } else {
          errors.push(
            `Entry points should only be used by one template ` +
            `but this one is used by ${possibleValidKeys.size}!`
          );
        }
        if (entryPointPatternMatch) {
          if (entryPointPatternMatch[2] !== key) {
            errors.push(`Entry points should have the same name as the file they point to!`);
          }
        } else {
          errors.push(
            `Entry points should point to files in the ./src/sites/<site-name>/pages/ directory!`
          );
        }

        const isEntryPointSilenced = siteConfig.silence && siteConfig.silence.includes(key);

        let log = logVerbose;
        if (errors.length > 0 && !isEntryPointSilenced) {
          log = logError;
        }
        log(
          errors.length === 0 ? chalk.green(`✓ ${key}`) :
          isEntryPointSilenced ? chalk.yellow(`⚠ ${key}`) :
          chalk.red(`✘ ${key}`),
          '➜',
          entryPointPath
        );
        let errorColor = chalk.red;
        if (isEntryPointSilenced) {
          stats.silenced++;
          errorColor = chalk.yellow;
          if (errors.length > 0) {
            log(errorColor(`  ⚠ These errors have been silenced`));
          }
        } else if (errors.length > 0) {
          stats.failed++;
        } else {
          stats.passed++;
        }
        errors.forEach(
          error => log(errorColor(`  ✘ ${error.split('\n').join('\n    ')}`))
        );

        if (errors.length > 0 && matchedTemplatePaths.length > 0) {
          log(chalk.yellow(
            `  this entry point is referenced by the following templates:`
          ));
          log(`    ${siteConfig.templateRoot}`+chalk.blue(matchedTemplatePaths[0]));
          matchedTemplatePaths.slice(1).forEach(templatePath => {
            log('   ', chalk.blue(' '.repeat(siteConfig.templateRoot.length) + templatePath));
          });
        }
      });
    } else {
      stats.failed++;
      logError(
        chalk.red(`✘ ${key}`),
        '➜',
        entryPointPath
      );
      logError(chalk.red(`  ✘ Entry points should be in a sites directory`));
    }

    return promise;
  });

  return Promise.all(entryPromises).then(() => stats);
};
