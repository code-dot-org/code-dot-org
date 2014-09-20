var TestResults = require('../../../src/constants.js').TestResults;

var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('../../util/testUtils').requireWithGlobalsCheckSrcFolder('maze/requiredBlocks.js');
};

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_10",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></statement></block></xml>',
      customValidator: function () {
        return BlocklyApps.enableShowCode === true && BlocklyApps.enableShowBlockCount === true;
      }
    },
    {
      description: "No while loop",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [reqBlocks().WHILE_LOOP],
      xml: '<xml><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></xml>'
    }
  ]
};
