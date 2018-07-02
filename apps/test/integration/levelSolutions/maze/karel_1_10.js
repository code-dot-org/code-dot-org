import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_10",
  tests: [
    {
      description: "Top Solve: While PathAhead { MoveForward, if Pile { Remove1 } }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_untilBlocked"><statement name="DO"><block type="maze_moveForward"><next><block type="karel_if"><title name="DIR">pilePresent</title><statement name="DO"><block type="maze_dig"></block></statement></block></next></block></statement></block></next></block></xml>'
    }
  ]
};
