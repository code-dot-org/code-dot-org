var chalk = require('chalk');
var path = require('path');
var fs = require('fs');
var glob = require('glob-all');

const ENTRY_POINT_FILE_PATH_PATTERN = /^\.\/src\/sites\/([\w.]+)\/pages\/(.*)\.jsx?$/;
const SITES_CONFIG = {
  'studio': {
    templateRoot: '../dashboard/app/views/',
    templateGlobs: ['**/*.erb', '**/*.haml'],
  },
  'code.org': {
    templateRoot: '../pegasus/sites.v3/code.org/public/',
    templateGlobs: ['**/*.erb', '**/*.haml'],
  },
};


module.exports = function (webpackConfig) {
  let numBadEntryPoints = 0;

  for (var key in webpackConfig.entry) {
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
      const templatesToSearch = glob.sync(
        siteConfig.templateGlobs.map(glob => siteConfig.templateRoot + glob)
      );
      templatesToSearch.forEach(function (templatePath)  {
        if (fs.readFileSync(templatePath).indexOf(searchString) >= 0) {
          usageCount++;
          var relativePath = templatePath.replace(siteConfig.templateRoot, '');
//          console.log(relativePath, relativePath.split('.')[0]);
          possibleValidKeys.add(relativePath.split('.')[0]);
          matchedTemplatePaths.push(relativePath);
        }
      });

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

      console.log(
        errors.length === 0 ?
        chalk.green(`✓ ${key}`) :
        chalk.red(`✘ ${key}`),
        '➜',
        entryPointPath
      );

      errors.forEach(
        error => console.log(chalk.red(`  ✘ ${error.split('\n').join('\n    ')}`))
      );

      if (errors.length > 0) {
        numBadEntryPoints++;
        if (matchedTemplatePaths.length > 0) {
          console.log(chalk.yellow(
            `  this entry point is referenced by the following templates:`
          ));
          console.log(`    ${siteConfig.templateRoot}`+chalk.blue(matchedTemplatePaths[0]));
          matchedTemplatePaths.slice(1).forEach(templatePath => {
            console.log('   ', chalk.blue(' '.repeat(siteConfig.templateRoot.length) + templatePath));
          });
        }
      }
    } else {
      console.log(chalk.red(`✘ ${key}`));
      console.log(chalk.red(`  ✘ Entry points should be in a sites directory`));
      numBadEntryPoints++;
    }
  }
  return numBadEntryPoints;
};
