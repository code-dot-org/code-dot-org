var TestResults = require('../../../src/constants.js').TestResults;

// Level has two goals, one above and 1 below.
// Note: this solution depends on the fact that the moveDistance blocks result
// in moves happening in sequence rather than parallel. If we change that, this
// test will start to fail.

var levelDef = {
  map: [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0,16, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  firstSpriteIndex: 3,
  timeoutFailureTick: 100
};

module.exports = {
  app: "studio",
  skinId: "studio",
  levelDefinition: levelDef,
  tests: [
    {
      description: "Expected solution: Move up and down on start",
      xml: '<xml>' +
        '<block type="when_run" deletable="false">' +
          '<next><block type="studio_moveDistance">' +
            '<title name="DIR">1</title><title name="DISTANCE">100</title>' +
          '<next><block type="studio_moveDistance">' +
            '<title name="DIR">4</title><title name="DISTANCE">200</title>' +
          '</block></next></block></next>' +
        '</block>' +
        '</xml>',
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
    },
    {
      description: "Hit only one goal",
      xml: '<xml>' +
          '<block type="when_run" deletable="false">' +
            '<next><block type="studio_moveDistance">' +
              '<title name="DIR">1</title><title name="DISTANCE">100</title>' +
            '</block></next>' +
          '</block>' +
          '</xml>',
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
    }
  ]
};
