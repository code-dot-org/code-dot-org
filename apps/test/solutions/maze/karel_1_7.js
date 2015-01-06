var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_7",
  tests: [
    {
      description: "Top Solve: TurnRight, MoveForward, while ThereIsAHole { Fill1 }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_turn"><title name="DIR">turnRight</title><next><block type="maze_moveForward"><next><block type="maze_untilBlockedOrNotClear"><title name="DIR">holePresent</title><statement name="DO"><block type="maze_fill"></block></statement></block></next></block></next></block></xml>'
    }
  ]
};
