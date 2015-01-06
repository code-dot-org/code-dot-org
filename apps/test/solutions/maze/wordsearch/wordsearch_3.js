var TestResults = require('../../../../src/constants.js').TestResults;

var blockUtils = require('../../../../src/block_utils');

module.exports = {
  app: "maze",
  skinId: 'letters',
  levelFile: 'wordsearchLevels',
  levelId: "k_3",
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
        'maze_moveWest',
        'maze_moveWest',
        'maze_moveWest',
        'maze_moveWest'
      ]) + '</xml>'
    },
    {
      description: "Incomplete (W W W)",
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      customValidator: function () {
        return Maze.wordSearch !== undefined;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveWest',
        'maze_moveWest',
        'maze_moveWest'
      ]) + '</xml>'
    }
  ]
};
