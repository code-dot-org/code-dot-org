import {TestResults} from '@cdo/apps/constants';


var rblocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/turtle/requiredBlocks.js');
};

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_3",
  tests: [
    {
      description: "Top solve: 4x { Forward 100, Right 90}",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title></block></next></block></statement></block></next></block></xml>'
    },
    {
      description: "Top failure: 4x {Forward 100}",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [rblocks().turnRightRestricted(90)],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></statement></block></next></block></xml>'
    }
  ]
};
