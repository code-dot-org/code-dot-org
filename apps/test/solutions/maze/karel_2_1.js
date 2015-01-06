var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "2_1",
  tests: [
    {
      description: "Top Solve",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_dig"><next><block type="maze_moveForward"><next><block type="maze_fill"><next><block type="maze_moveForward"><next><block type="maze_dig"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_dig"><next><block type="maze_moveForward"><next><block type="maze_dig"><next><block type="maze_moveForward"><next><block type="maze_dig"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_dig"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_dig"><next><block type="maze_moveForward"><next><block type="maze_dig"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_fill"></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>'
    }
  ]
};
