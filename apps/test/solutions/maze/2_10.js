var testUtils = require('../../util/testUtils');
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;

var reqBlocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return testUtils.requireWithGlobalsCheckBuildFolder('maze/requiredBlocks.js');
};

var studioApp = require(testUtils.buildPath('StudioApp')).singleton;

module.exports = {
  app: "maze",
  levelFile: "levels",
  levelId: "2_10",
  tests: [
    {
      description: "Verify solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></next></block></statement></block></xml>',
      customValidator: function () {
        return studioApp.enableShowCode === true && studioApp.enableShowBlockCount === true;
      }
    },
    {
      description: "No while loop",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [reqBlocks().WHILE_LOOP],
      xml: '<xml><block type="maze_moveForward"><next><block type="maze_turn"><title name="DIR">turnLeft</title></block></next></block></xml>'
    }
  ]
};
