var TestResults = require('../../../src/constants.js').TestResults;

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
      xml: '<xml><block type="maze_moveForward"><next><block type="maze_fill"><next><block type="maze_fill"></block></next></block></next></block></xml>'
    }
  ]
};
