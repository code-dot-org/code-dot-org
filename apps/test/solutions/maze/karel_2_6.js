var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "maze",
  levelFile: "karelLevels",
  levelId: "2_6",
  tests: [
    {
      description: "Top Solve: Remove8, Repeat 7x { MoveForward } Fill8",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="procedures_callnoreturn"><mutation name="remove 8"></mutation><next><block type="controls_repeat"><title name="TIMES">7</title><statement name="DO"><block type="maze_moveForward"></block></statement><next><block type="procedures_callnoreturn"><mutation name="fill 8"></mutation></block></next></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">fill 8</title><statement name="STACK"><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">8</title><statement name="DO"><block type="maze_fill" deletable="false" editable="false"></block></statement></block></statement></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">remove 8</title><statement name="STACK"><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">8</title><statement name="DO"><block type="maze_dig" deletable="false" editable="false"></block></statement></block></statement></block></xml>'
    }
  ]
};
