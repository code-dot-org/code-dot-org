var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;


// Level has no goals

var levelDef = {
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 16, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  firstSpriteIndex: 3,
  timeoutFailureTick: 200
};

module.exports = {
  app: "studio",
  skinId: "studio",
  levelDefinition: levelDef,
  tests: [
    {
      description: "Make sure we don't report success without doing anything",
      xml: '',
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
    }
  ]
};
