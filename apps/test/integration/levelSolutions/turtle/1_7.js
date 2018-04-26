import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_7",
  tests: [
    {
      description: "Top solve: 4x {Right 90, Forward 100}, Left 90, Forward 50, 4x {Forward 100, Left 90}",
      expected: {
        result: true,
        testResult: TestResults.BETTER_THAN_IDEAL
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></statement><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnLeft</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">50</title><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnLeft</title><title name="VALUE">90</title></block></next></block></statement></block></next></block></next></block></next></block></next></block></xml>'
    },
    {
      description: "Top failure: 4x {Right 90, Forward 100}",
      expected: {
        result: false,
        testResult: TestResults.TOO_FEW_BLOCKS_FAIL
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></statement></block></next></block></xml>'
    }

  ]
};
