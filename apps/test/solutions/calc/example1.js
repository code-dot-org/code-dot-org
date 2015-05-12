var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');
testUtils.setupLocale('calc');
var calcMsg = require('@cdo/apps/calc/locale');
var commonMsg = require('@cdo/apps/locale');

module.exports = {
  app: "calc",
  skinId: 'calc',
  levelFile: "levels",
  levelId: 'example1',
  tests: [
    {
      description: "Correct answer",
      expected: {
        result: true,
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
        result: false,
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
        result: false,
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
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, calcMsg.emptyComputeBlock());
        return true;
      },
      xml: '<xml></xml>'
    },
    {
      description: 'empty input',
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, commonMsg.emptyFunctionalBlock());
        return true;
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3]) // missing second input
        ]) +
      '</xml>'
    },
    {
      description: 'extra top block',
      expected: {
        result: false,
        testResult: TestResults.EXTRA_TOP_BLOCKS_FAIL
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_plus', [1, 2]) +
        blockUtils.calcBlockXml('functional_plus', [3, 2]) +
      '</xml>'
    },
    {
      description: "divide by zero",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, calcMsg.divideByZeroError());
        return true;
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_dividedby', [4, 0]) +
      '</xml>'
    }
  ]
};
