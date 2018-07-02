import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_1",
  tests: [
    {
      description: "Top Solve: 4x MoveForward, Remove 1",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_dig"></block></next></block></next></block></next></block></next></block></next></block></xml>'
    }
  ]
};
