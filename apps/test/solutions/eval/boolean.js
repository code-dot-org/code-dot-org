var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');
testUtils.setupLocale('eval');
var evalMsg = require('@cdo/apps/eval/locale');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    // 2 > 1
    solutionBlocks: blockUtils.mathBlockXml('functional_greater_than', {
      ARG1: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 2}),
      ARG2: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 1})
    }, null),
    requiredBlocks: '',
    freePlay: false
  },
  tests: [
    {
      description: "correct answer",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: blockUtils.mathBlockXml('functional_greater_than', {
        ARG1: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 2}),
        ARG2: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 1})
      }, null),
    },
    {
      description: "wrong boolean",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, evalMsg.wrongBooleanError());
        return true;
      },
      // 1 > 2
      xml: blockUtils.mathBlockXml('functional_greater_than', {
        ARG1: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 1}),
        ARG2: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 2})
      }, null),
    },
    {
      description: "question marks",
      expected: {
        result: false,
        testResult: TestResults.QUESTION_MARKS_IN_NUMBER_FIELD
      },
      // 1 > ???
      xml: blockUtils.mathBlockXml('functional_greater_than', {
        ARG1: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 1}),
        ARG2: blockUtils.mathBlockXml('functional_math_number', null, {NUM: '???'})
      }, null),
    }
  ]
};
