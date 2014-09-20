var TestResults = require('../../../src/constants.js').TestResults;

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_10",
  tests: [
    {
      description: "Some random code for the freeplay level",
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      customValidator: function () {
        // don't show block count because our ideal is Infinity
        return BlocklyApps.enableShowCode === true && BlocklyApps.enableShowBlockCount === false;
      },
      missingBlocks: [],
      xml: '<xml><block type="controls_repeat" deletable="false"><title name="TIMES">10</title><statement name="DO"><block type="draw_move" inline="true" deletable="false" editable="false"><title name="DIR">moveForward</title><value name="VALUE"><block type="math_number" deletable="false" editable="false"><title name="NUM">1</title></block></value><next><block type="draw_turn" inline="true" deletable="false" editable="false"><title name="DIR">turnRight</title><value name="VALUE"><block type="math_number" deletable="false" editable="false"><title name="NUM">1</title></block></value></block></next></block></statement></block></xml>'
    }
  ]
};
