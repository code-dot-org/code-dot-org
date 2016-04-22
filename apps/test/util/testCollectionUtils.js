var _ = require('@cdo/apps/lodash');
require('require-globify');

module.exports = {
  // Get all json files under directory path
  getCollections: function () {
    // require-globify transform
    var files = require('../solutions/**/*.js', {hash: 'path'});
    var testCollections = [];
    Object.keys(files).forEach(function (file) {
      // Setting that allows us to ignore particular level files
      if (window.__ignoreSolutionsRegex &&
          window.__ignoreSolutionsRegex.test(file)) {
        return;
      }
      testCollections.push({path: file, data: files[file]});
    });

    return testCollections;
  },

  /**
   * Gets a cloned copy of a level given a testCollection/testData
   */
  getLevelFromCollection: function (testCollection, testData, dataItem) {
    var level;

    var data = dataItem();
    var app = testCollection.app;

    // Each testCollection file must either specify a file from which to get the
    // level, or provide it's own custom level
    if (testCollection.levelFile) {
      var levels = data.levels[testCollection.levelFile];
      level = _.cloneDeep(levels[testCollection.levelId]);
    } else {
      if (!testCollection.levelDefinition && !testData.delayLoadLevelDefinition) {
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
