var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

var REPEAT_REQUIREMENT = {
  'test': function(block) {
    return block.type == 'controls_repeat';
  },
  'type': 'controls_repeat',
  'titles': {'TIMES': '???'}
};

// a no-op block for purposes of having a required block we can choose to insert
// or leave out without influencing what is executed.
var NOOP_REPEAT_START = '<block type="controls_repeat"><title name="TIMES">0</title><statement name="DO"><block type="maze_moveForward"></block></statement><next>';
var NOOP_REPEAT_END = '</next></block>';


// Honey goal of 3 and nectar goal of 3
var levelDef = {
  nectarGoal: 3,
  honeyGoal: 3,
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
    [0, 0,  0,  0, 0, 0, 0, 0],
    [0, 0,  0,  0, 0, 0, 0, 0],
    [0, 0,  0,  0, 0, 0, 0, 0],
    [0, 0,  0,  0, 0, 0, 0, 0],
    [0, 3, -99,  0, 0, 0, 0, 0],
    [0, 0,  0,  0, 0, 0, 0, 0],
    [0, 0,  0,  0, 0, 0, 0, 0],
    [0, 0,  0,  0, 0, 0, 0, 0]
  ],
  flowerType: 'redWithNectar',
  requiredBlocks: [[REPEAT_REQUIREMENT]]
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Get three nectar, make three honey",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 3 && Maze.bee.honey_ === 3;
      },
      xml: '<xml>' + NOOP_REPEAT_START + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar',
        'maze_nectar',
        'maze_moveForward',
        'maze_honey',
        'maze_honey',
        'maze_honey',
      ]) + NOOP_REPEAT_END + '</xml>'
    },
    {
      description: "Get three nectar, make three honey: missing required block",
      expected: {
        result: true,
        testResult: TestResults.MISSING_BLOCK_FINISHED
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 3 && Maze.bee.honey_ === 3;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar',
        'maze_nectar',
        'maze_moveForward',
        'maze_honey',
        'maze_honey',
        'maze_honey',
      ]) + '</xml>'
    },
    {
      description: "Get two nectar, make three honey: missing required block",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_FINISHED
      },
      customValidator: function () {
        return Maze.bee.nectars_.length === 2 && Maze.bee.honey_ === 3;
      },
      xml: '<xml>' + blockUtils.blocksFromList([
        'maze_moveForward',
        'maze_nectar',
        'maze_nectar',
        'maze_moveForward',
        'maze_honey',
        'maze_honey',
        'maze_honey',
      ]) + '</xml>'
    }
  ]
};
