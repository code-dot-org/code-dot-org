import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_9",
  tests: [
    {
      description: "Top Solve: Repeat 4x { MoveForward, Remove1 } TurnLeft, Repeat 5x { MoveForward, Remove1 }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="maze_moveForward"><next><block type="maze_dig"></block></next></block></statement><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="controls_repeat"><title name="TIMES">5</title><statement name="DO"><block type="maze_moveForward"><next><block type="maze_dig"></block></next></block></statement></block></next></block></next></block></next></block></xml>'
    }
  ]
};
