var TestResults = require('../../../src/constants.js').TestResults;

var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('../../util/testUtils').requireWithGlobalsCheckSrcFolder('maze/requiredBlocks.js');
};

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_18",
  tests: [
    {
      description: "Top solution: Until Sunflower { if PathAhead Moveward else TurnRight }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_forever"><statement name="DO"><block type="maze_ifElse"><title name="DIR">isPathForward</title><statement name="DO"><block type="maze_moveForward"></block></statement><statement name="ELSE"><block type="maze_turn"><title name="DIR">turnRight</title></block></statement></block></statement></block></xml>'
    }
  ]
};
