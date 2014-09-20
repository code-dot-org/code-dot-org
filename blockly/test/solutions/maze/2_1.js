var TestResults = require('../../../src/constants.js').TestResults;

var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('../../util/testUtils').requireWithGlobalsCheckSrcFolder('maze/requiredBlocks.js');
};

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_1",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_moveForward" /></next></block></next></block></xml>'
    },
    {
      description: "Single move forward block",
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_moveForward"></block></xml>'
    },
    {
      description: "Single turn right block",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [reqBlocks().MOVE_FORWARD],
      xml: '<xml><block type="maze_turn"><title name="DIR">turnLeft</title></block></xml>'
    }
  ]
};
