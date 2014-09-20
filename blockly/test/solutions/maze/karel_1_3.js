var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_3",
  tests: [
    {
      description: "Top Solve: MoveForward, 10x { Remove1 }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_moveForward"><next><block type="controls_repeat"><title name="TIMES">10</title><statement name="DO"><block type="maze_dig"></block></statement></block></next></block></xml>'
    }
  ]
};
