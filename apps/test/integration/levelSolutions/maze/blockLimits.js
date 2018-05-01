import {TestResults} from '@cdo/apps/constants';
const blockUtils = require('@cdo/apps/block_utils');

const levelDef = {
  'map': [
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
  ],
  'startDirection': 1, // Direction.EAST,
  'initialDirt': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, -1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  flowerType: 'redWithNectar',
  toolbox: '<xml id="toolbox"><block type="maze_moveForward" limit="1"></block></xml>',
  requiredBlocks: [],
  honeyGoal: 1,
};

module.exports = {
  app: "maze",
  skinId: "bee",
  levelDefinition: levelDef,
  tests: [{
    description: "Limited toolbox blocks - fail goal",
    expected: {
      result: false,
      testResult: TestResults.APP_SPECIFIC_FAIL,
    },
    missingBlocks: [],
    xml: '<xml>' +
    blockUtils.blocksFromList([
      "maze_moveForward",
      "maze_moveForward",
    ]) + '</xml>',
  }, {
    description: "Limited toolbox blocks - pass goal, over limit",
    expected: {
      result: true,
      testResult: TestResults.BLOCK_LIMIT_FAIL,
    },
    missingBlocks: [],
    xml: '<xml>' +
    blockUtils.blocksFromList([
      "maze_moveForward",
      "maze_honey",
      "maze_moveForward",
      ]) + '</xml>',
  }, {
    description: "Limited toolbox blocks - pass goal, under limit",
    expected: {
      result: true,
      testResult: TestResults.ALL_PASS,
    },
    missingBlocks: [],
    xml: '<xml>' +
    blockUtils.blocksFromList([
      "maze_moveForward",
      "maze_honey",
    ]) + '</xml>',
  }]
};
