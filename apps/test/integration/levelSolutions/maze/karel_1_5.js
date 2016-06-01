var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;


module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "1_5",
  tests: [
    {
      description: "Top Solve: While Path Ahead { MoveForward, Repeat 5X { Fill 1 } }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_untilBlocked"><statement name="DO"><block type="maze_moveForward"><next><block type="controls_repeat"><title name="TIMES">5</title><statement name="DO"><block type="maze_fill"></block></statement></block></next></block></statement></block></xml>'
    }
  ]
};
