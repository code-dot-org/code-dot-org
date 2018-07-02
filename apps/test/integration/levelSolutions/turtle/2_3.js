import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "2_3",
  tests: [
    {
      description: "Most common solve: 3x { Square 100, Right 120 }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_a_square" inline="true"><value name="VALUE"><block type="math_number"><title name="NUM">100</title></block></value><next><block type="draw_turn" inline="true"><title name="DIR">turnRight</title><value name="VALUE"><block type="math_number"><title name="NUM">120</title></block></value></block></next></block></statement></block></next></block></xml>'
    }
    // todo - add failure case(s)
  ]
};
