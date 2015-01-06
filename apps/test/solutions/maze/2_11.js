var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_11",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml><block type="maze_forever" x="26" y="44"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnRight</title></block></next></block></next></block></next></block></statement></block></xml>'
    }
  ]
};
