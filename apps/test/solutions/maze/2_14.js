var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_14",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml><block type="maze_forever" x="3" y="-12"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_if"><title name="DIR">isPathRight</title><statement name="DO"><block type="maze_turn"><title name="DIR">turnRight</title></block></statement></block></next></block></statement></block></xml>'
    }
  ]
};
