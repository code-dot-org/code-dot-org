/**                                       /   \
 *  _                             )      ((   ))     (
 * (@)                           /|\      ))_((     /|\
 * |-|                          / | \    (/\|/\)   / | \                          (@)
 * | | ------------------------/--|-voV---\`|'/--Vov-|--\-------------------------|-|
 * |-|                              '^`   (o o)  '^`                              | |
 * | |                                    `\Y/'                                   |-|
 * |-|  Dear wary traveler,                                                       | |
 * | |                                                                            |-|
 * |-|  You have opened this file to find out why your apps build is giving you   | |
 * | |  error messages about your new entry point not conforming to naming        |-|
 * |-|  conventions.                                                              | |
 * | |                                                                            |-|
 * |-|  But what are the conventions you may ask?                                | |
 * | |                                                                            |-|
 * |-|  1) Entry points should be in the src/sites/<site-name>/pages directory!   | |
 * | |  2) Entry points should only be referenced by one template file!           |-|
 * |-|  3) Entry points should match the name of the template they are used in!   | |
 * | |                                                                            |-|
 * |-|  If you follow these rules, you will reach new levels of glorious          | |
 * | |  enlightenment. If you do not follow these rules, dragons shall burn your  |-|
 * |-|  village to the ground!                                                    | |
 * | |                                                                            |-|
 * |-|  You may be tempted to add your entry point to the list of silenced entry  | |
 * | |  points, but that would be a mistake:                                      |-|
 * |-|                                                                            | |
 * | |  a) they are only silenced because they are existing violations.           |-|
 * |-|  b) we shouldn't be adding new violations.                                 | |
 * | |  c) we'd like to fix up our old violations over time.                      |-|
 * |-|                                                                            | |
 * | |  With this information in hand, choose the right side of history and make  |-|
 * |-|  your entry point conform to the naming conventions.                       | |
 * | |                                                                            |-|
 * |_|____________________________________________________________________________| |
 * (@)                   l   /\ /         ( (       \ /\   l                    `\|-|
 *                       l /   V           \ \       V   \ l                      (@)
 *                       l/                _) )_          \I
 *                                         `\ /'
 */

const chalk = require('chalk');
const child_process = require('child_process');

const SILENCED = [
  'applab',
  'applab-api',
  'bounce',
  'brambleHost',
  'calc',
  'code-studio',
  'craft',
  'districtDropdown',
  'embedBlocks',
  'embedVideo',
  'essential',
  'eval',
  'flappy',
  'gamelab',
  'jigsaw',
  'levelbuilder',
  'levelbuilder_applab',
  'levelbuilder_craft',
  'levelbuilder_edit_script',
  'levelbuilder_gamelab',
  'levelbuilder_studio',
  'levelbuilder_pixelation',
  'levels/contract_match',
  'levels/external',
  'levels/multi',
  'levels/textMatch',
  'levels/widget',
  'maze',
  'netsim',
  'plc',
  'publicKeyCryptography',
  'raceInterstitial',
  'schoolInfo',
  'schoolInfoInterstitial',
  'scratch',
  'scriptOverview',
  'signup',
  'studio',
  'turtle',
  'tutorialExplorer',
  'weblab',
  'learn/index',
];
const SITES_CONFIG = {
  'studio': {
    entryPrefix: '',
    templateRoot: '../dashboard/app/views',
    templateGlobs: ['**/*.erb', '**/*.haml'],
    templateExtensions: ['erb', 'haml'],
  },
  'code.org': {
    entryPrefix: 'code.org/',
    templateRoot: '../pegasus/sites.v3/code.org',
    templateGlobs: ['**/*.erb', '**/*.haml'],
    templateExtensions: ['erb', 'haml'],
  },
  'hourofcode.com': {
    entryPrefix: 'hourofcode.com/',
    templateRoot: '../pegasus/sites.v3/hourofcode.com',
    templateGlobs: ['**/*.erb', '**/*.haml'],
    templateExtensions: ['erb', 'haml'],
  },
};

const ENTRY_POINT_FILE_PATH_PATTERN = /^\.\/src\/sites\/([\w.]+)\/pages\/(.*)\.jsx?$/;


function findTemplatesForSite(siteConfig) {
  const findArgs = siteConfig.templateExtensions.map(ext => `-name '*.${ext}'`).join(' -o ');
  return new Promise(resolve => child_process.exec(
    `find ${siteConfig.templateRoot} ${findArgs}`,
    (err, stdout, stderr) => {
      const templatesToSearch = stdout.split('\n').filter(f=>f);
      resolve(templatesToSearch);
    }
  ));
}

function searchFilesForString(filesToSearch, searchString) {
  return new Promise(resolve => child_process.exec(
    `grep "${searchString}" "${filesToSearch.join('" "')}"`,
    (err, stdout, stderr) => {
      let filesWithString = stdout
        .split('\n')
        .filter(line => line)
        .map(line => line.split(':')[0]);
      resolve(filesWithString);
    }
  ));
}

/**
 * check a given entry point / path for compliance with the naming conventions
 *
 * @param entryKey string - the key for the entry point e.g. 'signup'
 * @param entryPath string - the path the entry point loads e.g. 'sites/studio/pages/signup.js'
 * @param stats Object - a stats object for collecting pass/fail/skip info
 * @param options Object - an options config that turns on/off verbose logging
 * @returns Promise<void> - a promise that resolves when it is done checking this entry point
 */
function checkEntryPoint(entryKey, entryPointPath, stats, options) {
  const isEntryPointSilenced = SILENCED.includes(entryKey);

  let errorColor = isEntryPointSilenced ? chalk.yellow : chalk.red;
  let logVerbose = () => undefined;
  const logError = console.log;
  if (options.verbose) {
    logVerbose = console.log;
  }

  const errors = [];
  const entryPointPatternMatch = entryPointPath.match(
    ENTRY_POINT_FILE_PATH_PATTERN
  );
  const site = entryPointPatternMatch && entryPointPatternMatch[1];
  if (site) {
    const siteConfig = SITES_CONFIG[site];
    return findTemplatesForSite(siteConfig)
      .then(templatesToSearch => searchFilesForString(templatesToSearch, `js/${entryKey}.js`))
      .then(templates => {
        // Grab the set of all valid entry keys (e.g. name of the template minus extension)
        // Also convert the template paths to relative paths for easier display.
        const possibleValidEntryKeys = new Set();
        const matchedTemplatePaths = [];
        templates.forEach(templatePath => {
          const relativePath = templatePath.replace(siteConfig.templateRoot, '').slice(1);
          possibleValidEntryKeys.add(siteConfig.entryPrefix + relativePath.split('.')[0]);
          matchedTemplatePaths.push(relativePath);
        });

        if (possibleValidEntryKeys.size === 1) {
          const keyShouldBe = possibleValidEntryKeys.keys().next().value;
          if (keyShouldBe !== entryKey) {
            // entry point is used by only one template (good)
            // but the file name of the template and the file name of the
            // entry point don't match (bad)
            errors.push(
              `Entry point names should match the name of the file they are used in.\n` +
              `This entry point should be renamed to ${chalk.underline(keyShouldBe)}!`
            );
          }
        } else {
          errors.push(
            `Entry points should only be used by one template ` +
            `but this one is used by ${possibleValidEntryKeys.size}!`
          );
        }
        if (entryPointPatternMatch) {
          // entry point is in the sites/<site-name>/pages direcotory (good)
          // but it doesn't have the same name as the js file it points to (bad)
          if (siteConfig.entryPrefix + entryPointPatternMatch[2] !== entryKey) {
            errors.push(
              `Entry points should have the same name as the file they point to!\n` +
              `This entry point should be renamed to ` +
              chalk.underline(siteConfig.entryPrefix + entryPointPatternMatch[2]) +
              `!`
            );
            errors.push();
          }
        } else {
          errors.push(
            `Entry points should point to files in the ./src/sites/<site-name>/pages/ directory!`
          );
        }

        // spit out the list of errors depending on
        // verbosity and silencing configuration
        let log = logVerbose;
        if (errors.length > 0 && !isEntryPointSilenced) {
          log = logError;
        }
        log(
          errors.length === 0 ? chalk.green(`✓ ${entryKey}`) :
          isEntryPointSilenced ? chalk.yellow(`⚠ ${entryKey}`) :
          chalk.red(`✘ ${entryKey}`),
          '➜',
          entryPointPath
        );
        if (isEntryPointSilenced) {
          stats.silenced++;
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

        // spit out the list of templates that refer to this entry point
        if (errors.length > 0 && matchedTemplatePaths.length > 0) {
          log(chalk.yellow(
            `  this entry point is referenced by the following templates:`
          ));
          log(`    ${siteConfig.templateRoot}/`+chalk.blue(matchedTemplatePaths[0]));
          matchedTemplatePaths.slice(1).forEach(templatePath => {
            log('    ', chalk.blue(' '.repeat(siteConfig.templateRoot.length) + templatePath));
          });
        }
      });
  }

  // this entry point is not in a sites directory, so we don't know
  // which templates to search. Just log an error and return an
  // empty promise.
  let log = logVerbose;
  if (isEntryPointSilenced) {
    stats.silenced++;
  } else {
    stats.failed++;
    log = logError;
  }
  log(
    isEntryPointSilenced ? chalk.yellow(`⚠ ${entryKey}`) :
    chalk.red(`✘ ${entryKey}`),
    '➜',
    entryPointPath
  );
  log(errorColor(`  ✘ Entry points should be in a sites directory`));
  return new Promise(resolve => resolve());
}


/**
 * Checks all the entry points for the given webpack config.
 *
 * @param webpackConfig Object - the webpack config with the entry points to check
 * @param options Object - some config options
 * @param options.verbose bool - whether or not to log verbosely
 *
 * @returns Promise<{failed: number, silenced: number, passed: number}> -
 *   a promise that resolves to a statsu object containing the number of
 *   entry points that passed/failed or were silenced.
 */
module.exports = function (webpackConfig, options={verbose: false}) {
  const stats = {
    failed: 0,
    silenced: 0,
    passed: 0,
  };

  const entryPromises = Object
    .keys(webpackConfig.entry)
    .map(entryKey => checkEntryPoint(entryKey, webpackConfig.entry[entryKey][2], stats, options));
    // The 2 index above is because the entry array has 3 elements:
    // [babel-polyfill, whatwg-fetch, JS entry point]
  return Promise.all(entryPromises).then(() => stats);
};
