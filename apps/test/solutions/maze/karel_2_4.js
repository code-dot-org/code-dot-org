var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "2_4",
  tests: [
    {
      description: "Top Solve: Repeat 4x { Remove7, Forward, Left, Forward, Right }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS,
      },
      missingBlocks: [],
      xml: '<xml><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="procedures_callnoreturn"><mutation name="remove 7"></mutation><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnRight</title></block></next></block></next></block></next></block></next></block></statement></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">fill 5</title><statement name="STACK"><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">5</title><statement name="DO"><block type="maze_fill" deletable="false" editable="false"></block></statement></block></statement></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">remove 7</title><statement name="STACK"><block type="controls_repeat"><title name="TIMES">7</title><statement name="DO"><block type="maze_dig"></block></statement></block></statement></block></xml>'
    }
  ]
};
