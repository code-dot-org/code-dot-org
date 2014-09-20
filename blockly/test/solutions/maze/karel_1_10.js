var TestResults = require('../../../src/constants.js').TestResults;

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
      xml: '<xml><block type="maze_untilBlocked"><statement name="DO"><block type="maze_moveForward"><next><block type="karel_if"><title name="DIR">pilePresent</title><statement name="DO"><block type="maze_dig"></block></statement></block></next></block></statement></block></xml>'
    }
  ]
};
