import {TestResults, BeeTerminationValue as TerminationValue} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

// Honey goal of 2.  No specific hive goals
var levelDef = {
  honeyGoal: 2,
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
    [0, 3, -99, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0],
    [0, 0,  0, 0, 0, 0, 0, 0]
  ],
  flowerType: 'redWithNectar'
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Get two nectar, make two honey",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.controller.subtype.nectars_.length === 2 && Maze.controller.subtype.honey_ === 2;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar',
        'maze_moveForward',
        'maze_honey',
        'maze_honey'
      ]) + '</xml>'
    },
    {
      description: "Try making honey without nectar",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.controller.subtype.nectars_.length === 0 && Maze.controller.subtype.honey_ === 2;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_moveForward',
        'maze_honey',
        'maze_honey'
      ]) + '</xml>'
    },
    {
      description: "Collect three nectar, make two honey",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.controller.subtype.nectars_.length === 3 && Maze.controller.subtype.honey_ === 2;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar',
        'maze_nectar',
        'maze_moveForward',
        'maze_honey',
        'maze_honey'
      ]) + '</xml>'
    },
    {
      description: "Make only one honey",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.controller.subtype.nectars_.length === 2 && Maze.controller.subtype.honey_ === 1 &&
          Maze.executionInfo.terminationValue() === TerminationValue.INSUFFICIENT_HONEY;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar',
        'maze_moveForward',
        'maze_honey'
      ]) + '</xml>'
    },
    {
      description: "Make honey without a hive",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.controller.subtype.nectars_.length === 2 && Maze.controller.subtype.honey_ === 0 &&
          Maze.executionInfo.terminationValue() === TerminationValue.NOT_AT_HONEYCOMB;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar',
        'maze_moveForward',
        'maze_moveForward',
        'maze_honey',
        'maze_honey'
      ]) + '</xml>'
    }
  ]
};
