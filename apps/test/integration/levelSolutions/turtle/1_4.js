import {TestResults} from '@cdo/apps/constants';


var rblocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/turtle/requiredBlocks.js');
};

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_4",
  tests: [
    {
      description: "Top solve: 3x { Random color, Forward 100, Right 120}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_colour" inline="true"><value name="COLOUR"><block type="colour_random"></block></value><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">120</title></block></next></block></next></block></statement></block></next></block></xml>'
    },
    {
      description: "Going backwards through same steps as top solve",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_colour" inline="true"><value name="COLOUR"><block type="colour_random"></block></value><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnLeft</title><title name="VALUE">120</title><next><block type="draw_move_by_constant"><title name="DIR">moveBackward</title><title name="VALUE">100</title></block></next></block></next></block></statement></block></next></block></xml>'
    },
    {
      description: "Top failure: Triangle drawn without loops or color",
      expected: {
        result: true,
        testResult: TestResults.MISSING_BLOCK_FINISHED
      },
      missingBlocks: [rblocks().repeat(3)],
      xml: '<xml><block type="when_run"><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">120</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">120</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></next></block></next></block></next></block></next></block></xml>'
    }

  ]
};
