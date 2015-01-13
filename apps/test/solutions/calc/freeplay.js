var testUtils = require('../../util/testUtils');
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var blockUtils = require(testUtils.buildPath('block_utils'));

module.exports = {
  app: "calc",
  skinId: 'calc',
  levelDefinition: {
    solutionBlocks: '',
    requiredBlocks: '',
    freePlay: true
  },
  tests: [
    {
      description: "Any answer",
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3, 4])
        ]) +
      '</xml>'
    }
  ]
};
