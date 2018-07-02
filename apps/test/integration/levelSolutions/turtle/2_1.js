import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "2_1",
  tests: [
    {
      description: "Most common solve: 3x {Forward 100, Right 90}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_move" inline="true"><title name="DIR">moveForward</title><value name="VALUE"><block type="math_number"><title name="NUM">100</title></block></value><next><block type="draw_turn" inline="true"><title name="DIR">turnRight</title><value name="VALUE"><block type="math_number"><title name="NUM">90</title></block></value></block></next></block></statement></block></next></block></xml>'
    },
    {
      description: "Go through backwards: 3x {Left 90, Backward 100}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_turn" inline="true"><title name="DIR">turnLeft</title><value name="VALUE"><block type="math_number"><title name="NUM">90</title></block></value><next><block type="draw_move" inline="true"><title name="DIR">moveBackward</title><value name="VALUE"><block type="math_number"><title name="NUM">100</title></block></value></block></next></block></statement></block></next></block></xml>'
    }
    // todo - add failure case
  ]
};
