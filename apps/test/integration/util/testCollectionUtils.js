/* global LEVEL_TYPE */

var _ = require('lodash');

/**
 * Given a list of levelSolutions subdirectories, returns only those matching
 * the pattern specified in LEVEL_TYPE. If specified, LEVEL_TYPE must be contain
 * one or more subdirectory names joined with '|' e.g. 'applab' or
 * 'maze|artist|craft'.
 * @param {Array.<String>} files Array of file paths to filter.
 * @returns {Array.<String>} File paths with match the LEVEL_TYPE, or all
 *   file paths if LEVEL_TYPE is not specified.
 */
function filterFiles(files) {
  if (!LEVEL_TYPE) {
    return files;
  }

  const allowedCharsRegex = /^[a-zA-Z0-9\|]+$/;
  if (!LEVEL_TYPE.match(allowedCharsRegex)) {
    throw new Error(`LEVEL_TYPE '${LEVEL_TYPE}' contains illegal characters`);
  }

  const allowSolutionRegex = new RegExp(`^./(${LEVEL_TYPE})/`, 'i');
  files = files.filter(file => allowSolutionRegex.test(file));

  if (!files.length) {
    throw new Error(
      `LEVEL_TYPE '${LEVEL_TYPE}' did not match anything. Try 'craft' or 'applab|gamelab'`
    );
  }

  return files;
}

module.exports = {
  // Get all json files under directory path
  getCollections: function() {
    var context = require.context('../levelSolutions/', true, /.*\.js$/);
    var files = context.keys();
    var testCollections = [];
    filterFiles(files).forEach(file => {
      testCollections.push({path: file, data: context(file)});
    });

    return testCollections;
  },

  /**
   * Gets a cloned copy of a level given a testCollection/testData
   */
  getLevelFromCollection: function(testCollection, testData, dataItem) {
    var level;

    var data = dataItem();

    // Each testCollection file must either specify a file from which to get the
    // level, or provide it's own custom level
    if (testCollection.levelFile) {
      var levels = data.levels[testCollection.levelFile];
      level = _.cloneDeep(levels[testCollection.levelId]);
      level = {
        ...level,
        ...(testData.levelDefinitionOverrides || {})
      };
    } else {
      if (
        !testCollection.levelDefinition &&
        !testData.delayLoadLevelDefinition
      ) {
        logError('testCollection requires levelFile or levelDefinition');
        return;
      }
      if (testCollection.levelDefinition) {
        level = _.cloneDeep(testCollection.levelDefinition);
      } else {
        level = testData.delayLoadLevelDefinition();
      }
    }

    return level;
  }
};

function logError(msg) {
  console.log('Log: ' + msg + '\n');
}
