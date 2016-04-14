var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

// Bee level in which we have a flower with zero nectar
var levelDef = {
  nectarGoal: 1,
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
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 98, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  flowerType: 'redWithNectar'
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Get nectar",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 1;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_moveForward',
        'maze_nectar'
      ]) + '</xml>'
    },
    {
      description: "Can't get nectar from zero nectar flower",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar'
      ]) + '</xml>'
    }
  ]
};
