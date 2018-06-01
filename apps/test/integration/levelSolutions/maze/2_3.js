import {TestResults} from '@cdo/apps/constants';


var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/maze/requiredBlocks.js');
};

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_3",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward" x="70" y="70"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnRight</title><next><block type="maze_moveForward" /></next></block></next></block></next></block></next></block></next></block></xml>'
    },
    {
      description: "Just move forward",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [reqBlocks().TURN_LEFT],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward" x="70" y="70"></block></next></block></xml>'
    },
    {
      description: "Move forward and turn left",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [reqBlocks().TURN_RIGHT],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward" x="70" y="70"><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></xml>'
    }
  ]
};
