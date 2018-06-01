import {TestResults} from '@cdo/apps/constants';


var rblocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/turtle/requiredBlocks.js');
};

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_8",
  tests: [
    {
      description: "Top solve: 8x {Random color, Forward 100, Backward 100, Right 45}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">8</title><statement name="DO"><block type="draw_colour" inline="true"><value name="COLOUR"><block type="colour_random"></block></value><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_move_by_constant"><title name="DIR">moveBackward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">45</title></block></next></block></next></block></next></block></statement></block></next></block></xml>'
    },
    {
      description: "Top failure: no repeat block",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [rblocks().repeat(8)],
      xml: '<xml><block type="when_run"><next><block type="draw_colour" inline="true"><value name="COLOUR"><block type="colour_random"></block></value><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_move_by_constant"><title name="DIR">moveBackward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">45</title></block></next></block></next></block></next></block></next></block></xml>'
    }
  ]
};
