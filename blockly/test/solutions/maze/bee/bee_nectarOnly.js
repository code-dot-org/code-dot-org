var TestResults = require('../../../../src/constants.js').TestResults;
var blockUtils = require('../../../../src/block_utils');
var TerminationValue = require('../../../../src/constants.js').BeeTerminationValue;

// Nectar goal of 2.  Two directly in front of us, one more a square later
var levelDef = {
  nectarGoal: 2,
  'map': [
    [ 0, 0, 0, 0, 0, 1, 1, 1 ],
    [ 0, 1, 1, 0, 0, 1, 1, 1 ],
    [ 0, 0, 0, 0, 0, 1, 1, 1 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 2, 1, 1, 1, 1, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 1, 1, 0, 0, 0, 0 ],
    [ 0, 0, 1, 1, 0, 0, 0, 0 ]
  ],
  'startDirection': 1, // Direction.EAST,
  'initialDirt': [
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 1, 2, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ]
  ],
  flowerType: 'redWithNectar'
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Get two nectar",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 2;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_moveForward',
        'maze_nectar'
      ]) + '</xml>'
    },
    {
      description: "Get three nectar (one extra)",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 3;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar'
      ]) + '</xml>'
    },
    {
      description: "Get only 1 nectar",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 1 &&
          Maze.executionInfo.terminationValue() === TerminationValue.INSUFFICIENT_NECTAR;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar'
      ]) + '</xml>'
    },
    {
      description: "Fail immediately trying to get nectar where there isn't any",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 0 &&
          Maze.executionInfo.terminationValue() === TerminationValue.NOT_AT_FLOWER;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_nectar',
        'maze_moveForward',
        'maze_nectar',
        'maze_moveForward',
        'maze_nectar'
      ]) + '</xml>'
    },
    {
      description: "Fail leaving path",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 0;
      },
      // turn left, move forward
      xml: '<xml><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"></block></next></block></xml>'
    },
    {
      description: "Fail getting more nectar than there is",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 1 &&
          Maze.executionInfo.terminationValue() === TerminationValue.FLOWER_EMPTY;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar'
      ]) + '</xml>'
    }
  ]
};
