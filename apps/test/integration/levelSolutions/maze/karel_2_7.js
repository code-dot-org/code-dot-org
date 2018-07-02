import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "2_7",
  tests: [
    {
      description: "Top Solve: In function - Left, Forward, Right, Forward, Forward, Right, Forward, Remove1",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="procedures_callnoreturn" deletable="false" editable="false"><mutation name="avoid the cow and remove 1"></mutation></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">avoid the cow and remove 1</title><statement name="STACK"><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnRight</title><next><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnRight</title><next><block type="maze_moveForward"><next><block type="maze_dig"></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
    }
  ]
};
