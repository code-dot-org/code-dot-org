import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/maze/requiredBlocks.js');
};

module.exports = {
  app: "maze",
  skinId: 'letters',
  levelFile: 'wordsearchLevels',
  levelId: "k_1",
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
        'maze_moveEast',
        'maze_moveEast'
      ]) + '</xml>'
    },
    {
      description: "E N N",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      customValidator: function () {
        // Make sure pegman made it to the end, rather than ending as soon as
        // he tried to leave the path
        return Maze.controller.pegmanX === 3 && Maze.controller.pegmanY === 1;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveEast',
        'maze_moveNorth',
        'maze_moveNorth',
        'maze_moveNorth'
      ]) + '</xml>'
    },
    {
      description: "extra move: E E E E E",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveEast',
        'maze_moveEast',
        'maze_moveEast',
        'maze_moveEast',
        'maze_moveEast'
      ]) + '</xml>'
    },
    {
      description: "wrong blocks: N N",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveNorth',
        'maze_moveNorth',
      ]) + '</xml>',
      missingBlocks: [reqBlocks().moveEast]
    }
  ]
};
