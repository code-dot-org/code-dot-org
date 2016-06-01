var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;


var rblocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/turtle/requiredBlocks.js');
};

var studioApp = require('@cdo/apps/StudioApp').singleton;

var solution = '<block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></next></block>';

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_1",
  tests: [
    {
      description: "Expected solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return studioApp.enableShowCode === true && studioApp.enableShowBlockCount === true;
      },
      missingBlocks: [],
      xml:
        '<xml>' +
        solution +
        '</xml>'
    },
    {
      description: "User doesnt add any blocks.  Should fail.",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [rblocks().turnRightRestricted(90)],
      xml: '<xml><block type="when_run"><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></xml>'
    },
    {
      description: "Empty workspace.",
      missingBlocks: [rblocks().MOVE_FORWARD_INLINE],
      xml: ''
    },
    {
      // extra top block takes precedence over ???
      description: "extra ??? block",
      expected: {
        result: false,
        testResult: TestResults.EXTRA_TOP_BLOCKS_FAIL
      },
      xml:
        '<xml>' +
        solution +
        '<block type="math_number"><title name="NUM">???</title></block>' +
        '</xml>'
    }
  ]
};
