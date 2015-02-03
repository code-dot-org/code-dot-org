var testUtils = require('../../util/testUtils');
var ResultType = require(testUtils.buildPath('constants.js')).ResultType;
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var blockUtils = require(testUtils.buildPath('block_utils'));

module.exports = {
  app: "calc",
  skinId: 'calc',
  levelFile: "levels",
  levelId: 'example1',
  tests: [
    {
      description: "Correct answer",
      expected: {
        result: ResultType.SUCCESS,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3, 4])
        ]) +
      '</xml>'
    },
    {
      description: "mirrored answer",
      expected: {
        result: ResultType.FAILURE,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [4, 3]),
          blockUtils.calcBlockXml('functional_plus', [2, 1])
        ]) +
      '</xml>'
    },
    {
      description: "wrong answer",
      expected: {
        result: ResultType.FAILURE,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3, 3])
        ]) +
      '</xml>'
    },
    {
      description: "empty answer",
      expected: {
        result: ResultType.FAILURE,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml></xml>'
    }
  ]
};
