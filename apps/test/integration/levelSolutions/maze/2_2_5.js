import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_2_5",
  tests: [
    {
      description: "Top solution: MoveForward, MoveForward, TurnRight, MoveForward",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnRight</title><next><block type="maze_moveForward"></block></next></block></next></block></next></block></next></block></xml>'
    }
  ]
};
