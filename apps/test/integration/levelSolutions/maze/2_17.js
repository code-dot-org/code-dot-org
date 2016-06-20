var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;


var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/maze/requiredBlocks.js');
};

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_17",
  tests: [
    {
      description: "Top solution: Until Sunflower { if PathAhead Moveward else TurnLeft }",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="maze_forever"><statement name="DO"><block type="maze_ifElse"><title name="DIR">isPathForward</title><statement name="DO"><block type="maze_moveForward"></block></statement><statement name="ELSE"><block type="maze_turn"><title name="DIR">turnLeft</title></block></statement></block></statement></block></next></block></xml>'
    }
  ]
};
