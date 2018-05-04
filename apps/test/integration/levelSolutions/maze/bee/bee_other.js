import {TestResults, BeeTerminationValue as TerminationValue} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

// Honey goal of 1.  No specific hive goals
var levelDef = {
  honeyGoal: 1,
  'map': [
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0]
  ],
  'startDirection': 1, // Direction.EAST,
  'initialDirt': [
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0,-3,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0]
  ],
  flowerType: 'redWithNectar',
  ideal: 3
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Move forward, make honey",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      // customValidator: function () {
      //   return Maze.controller.subtype.nectars_.length === 2 && Maze.controller.subtype.honey_ === 2;
      // },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_honey'
      ]) + '</xml>'
    },

    /**
     * We had a bug in which we were returning TOO_MANY_BLOCKS_FAIL here, even
     * though we weren't successfully completing the puzzle.
     */
    {
      description: "Use all too many blocks without solving puzzle, but meeting any required block requirements",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === TerminationValue.INSUFFICIENT_HONEY;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_moveForward',
        'maze_moveForward',
        'maze_moveForward'
      ]) + '</xml>'
    }
  ]
};
