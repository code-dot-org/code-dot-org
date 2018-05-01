import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_5",
  tests: [
    {
      description: "Top solve: 3x { Forward 100, Right 120}, 4x { Forward 100, Right 90}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">120</title></block></next></block></statement><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title></block></next></block></statement></block></next></block></next></block></xml>'
    },
    {
      description: "Top failure: 3x {Forward, Right 90}",
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      missingBlocks: [], // right blocks, but incomplete puzzle
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title></block></next></block></statement></block></next></block></xml>'
    }

  ]
};
