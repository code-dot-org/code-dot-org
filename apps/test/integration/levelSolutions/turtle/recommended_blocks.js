var requiredBlockUtils = require('@cdo/apps//required_block_utils');
import {TestResults} from '@cdo/apps/constants';


var levelDef = {
  solutionBlocks: '<xml><block type="when_run" deletable="false" movable="false"><next><block type="controls_repeat"><title name="TIMES">6</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title></block></next></block></statement></block></next></block></xml>',
  ideal: Infinity,
  toolbox: null,
  requiredBlocks: requiredBlockUtils.makeTestsFromBuilderRequiredBlocks('<xml><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title></block></xml>'),
  recommendedBlocks: requiredBlockUtils.makeTestsFromBuilderRequiredBlocks('<xml><block type="controls_repeat"><title name="TIMES">6</title></block></xml>'),
  freePlay: false,
};

module.exports = {
  app: "turtle",
  levelDefinition: levelDef,
  tests: [{
    description: "Level With Recommended Blocks: Attempted without required block",
    expected: {
      testResult: TestResults.MISSING_BLOCK_UNFINISHED
    },
    xml: '"<xml><block type="when_run" deletable="false" movable="false"></block></xml>'
  }, {
    description: "Level With Recommended Blocks: Completed without recommended block",
    expected: {
      testResult: TestResults.MISSING_RECOMMENDED_BLOCK_FINISHED
    },
    xml: '<xml><block type="when_run" deletable="false" movable="false"><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>'
  }, {
    description: "Level With Recommended Blocks: Incomplete and missing recommended block",
    expected: {
      testResult: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED
    },
    xml: '<xml><block type="when_run" deletable="false" movable="false"><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title></block></next></block></next></block></xml>'
  }, {
    description: "Level With Recommended Blocks: Completed with everything",
    expected: {
      testResult: TestResults.ALL_PASS
    },
    xml: '<xml><block type="when_run" deletable="false" movable="false"><next><block type="controls_repeat"><title name="TIMES">6</title><statement name="DO"><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">60</title></block></next></block></statement></block></next></block></xml>',
  }]
};

