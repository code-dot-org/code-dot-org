var _ = require('lodash');

const KARMA_CLI_FLAGS = require('../../util/KARMA_CLI_FLAGS');

/**
 * Given a list of levelSolutions subdirectories, returns only those matching
 * the pattern specified in levelType. If specified, --levelType must be contain
 * one or more subdirectory names joined with '|' e.g. 'applab' or
 * 'maze|artist|craft'.
 * @param {Array.<String>} files Array of file paths to filter.
 * @returns {Array.<String>} File paths with match the --levelType, or all
 *   file paths if --levelType is not specified.
 */
function filterFiles(files) {
  if (!KARMA_CLI_FLAGS.levelType) {
    return files;
  }

  const allowedCharsRegex = /^[a-zA-Z0-9\|]+$/;
  if (!KARMA_CLI_FLAGS.levelType.match(allowedCharsRegex)) {
    throw new Error(
      `--levelType '${KARMA_CLI_FLAGS.levelType}' contains illegal characters`
    );
  }

  const allowSolutionRegex = new RegExp(
    `^./(${KARMA_CLI_FLAGS.levelType})/`,
    'i'
  );
  files = files.filter(file => allowSolutionRegex.test(file));

  if (!files.length) {
    throw new Error(
      `--levelType '${KARMA_CLI_FLAGS.levelType}' did not match anything. Try 'craft' or 'applab|gamelab'`
    );
  }

  return files;
}

module.exports = {
  // Get all json files under directory path
  getCollections: function () {
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
  getLevelFromCollection: function (testCollection, testData, dataItem) {
    var level;

    var data = dataItem();

    // Each testCollection file must either specify a file from which to get the
    // level, or provide it's own custom level
    if (testCollection.levelFile) {
      var levels = data.levels[testCollection.levelFile];
      level = _.cloneDeep(levels[testCollection.levelId]);
      level = {
        ...level,
        ...(testData.levelDefinitionOverrides || {}),
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
  },
};

function logError(msg) {
  console.log('Log: ' + msg + '\n');
}
