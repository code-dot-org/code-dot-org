var TestResults = require('../../../src/constants.js').TestResults;

var rblocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('../../util/testUtils').requireWithGlobalsCheckSrcFolder('turtle/requiredBlocks.js');
};

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_1",
  tests: [
    {
      description: "Expected solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return BlocklyApps.enableShowCode === true && BlocklyApps.enableShowBlockCount === true;
      },
      missingBlocks: [],
      xml: '<xml><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></next></block></xml>'
    },
    {
      description: "User doesnt add any blocks.  Should fail.",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [rblocks().turnRightRestricted(90)],
      xml: '<xml><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></xml>'
    },
    {
      description: "Empty workspace.",
      missingBlocks: [rblocks().MOVE_FORWARD_INLINE],
      xml: ''
    }
  ]
};
