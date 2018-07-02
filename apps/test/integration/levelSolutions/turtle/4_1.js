import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "4_1",
  tests: [
    {
      description: "Most common solve: 3x {Forward 100, Right 120}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">120</title></block></next></block></statement></block></next></block></xml>'
    },
    {
      description: "Walk path backwards: 3x {Left 120, Backward 100}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_turn_by_constant"><title name="DIR">turnLeft</title><title name="VALUE">120</title><next><block type="draw_move_by_constant"><title name="DIR">moveBackward</title><title name="VALUE">100</title></block></next></block></statement></block></next></block></xml>'
    }
    // todo - add failure case(s)
  ]
};
