import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "4_8",
  tests: [
    {
      description: "Top Solve: Repeat 4x and Right 90 at end",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">10</title><statement name="DO"><block type="draw_colour" inline="true" deletable="false" editable="false"><value name="COLOUR"><block type="colour_random" deletable="false" editable="false"></block></value><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="draw_move_by_constant" deletable="false" editable="false"><title name="DIR">moveForward</title><title name="VALUE">20</title><next><block type="draw_turn_by_constant" deletable="false" editable="false"><title name="DIR">turnRight</title><title name="VALUE">90</title></block></next></block></statement><next><block type="draw_move_by_constant" deletable="false" editable="false"><title name="DIR">moveForward</title><title name="VALUE">20</title></block></next></block></next></block></statement><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">90</title></block></next></block></statement></block></next></block></xml>'
    }
  ]
};
