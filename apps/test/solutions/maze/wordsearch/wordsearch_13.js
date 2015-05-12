var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

module.exports = {
  app: "maze",
  skinId: 'letters',
  levelFile: 'wordsearchLevels',
  levelId: "k_13",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.wordSearch !== undefined;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveEast',
        'maze_moveEast',
        'maze_moveSouth',
        'maze_moveSouth',
        'maze_moveEast'
      ]) + '</xml>'
    }
  ]
};
