var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_2",
  tests: [
    {
      description: "Top solve: Red, Forward, Right, Forward, Right, Forward, Right, Forward",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="draw_colour" inline="true"><value name="COLOUR"><block type="colour_picker"><title name="COLOUR">#ff0000</title></block></value><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>'
    },
    {
      description: "Top failure: Missing last right and forward",
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      missingBlocks: [],
      xml: '<xml><block type="draw_colour" inline="true"><value name="COLOUR"><block type="colour_picker"><title name="COLOUR">#ff0000</title></block></value><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></next></block></next></block></next></block></next></block></xml>'
    }
  ]
};
