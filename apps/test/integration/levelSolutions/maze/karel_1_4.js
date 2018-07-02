import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_4",
  tests: [
    {
      description: "Top Solve: Repeat 4x { Remove 1, MoveForward, Turn Left }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="maze_dig"><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></statement></block></next></block></xml>'
    }
  ]
};
