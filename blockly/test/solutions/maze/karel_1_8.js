var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_8",
  tests: [
    {
      description: "Top Solve: Repeat 7x { MoveForward } Fill1",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
      missingBlocks: [],
      xml: '<xml><block type="controls_repeat"><title name="TIMES">7</title><statement name="DO"><block type="maze_moveForward"></block></statement><next><block type="maze_fill"></block></next></block></xml>'
    },
    {
      description: "Infinite Loop: While Path Ahead { MoveForward, Left, Left}",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED,
      },
      customValidator: function () {
        return Maze.result === 2;
      },
      xml: '<xml><block type="maze_untilBlockedOrNotClear"><title name="DIR">isPathForward</title><statement name="DO"><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></statement></block></xml>'
    }
  ]
};
