import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_2",
  tests: [
    {
      description: "Top Solve: MoveForward, Fill1, Fill1",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_moveForward"><next><block type="maze_fill"><next><block type="maze_fill"></block></next></block></next></block></next></block></xml>'
    }
  ]
};
