import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_6",
  tests: [
    {
      description: "Top Solve: If Pile { Remove1, Forward }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_untilBlockedOrNotClear"><title name="DIR">pilePresent</title><statement name="DO"><block type="maze_dig"><next><block type="maze_moveForward"></block></next></block></statement></block></next></block></xml>'
    }
  ]
};
