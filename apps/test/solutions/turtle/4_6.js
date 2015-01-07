var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "4_6",
  tests: [
    {
      description: "Top Solve: Repeat 4x { Forward 20, Right 90 }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">20</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">90</title></block></next></block></statement></block></xml>'
    }
  ]
};
