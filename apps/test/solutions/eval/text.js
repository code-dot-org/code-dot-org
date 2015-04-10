var testUtils = require('../../util/testUtils');
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var blockUtils = require(testUtils.buildPath('block_utils'));
testUtils.setupLocale('eval');
var evalMsg = require(testUtils.buildPath('../locale/current/eval'));

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_string', null, {
      'VAL': 'AAAA'
    }),
    requiredBlocks: '',
    freePlay: false
  },
  tests: [
    {
      description: "Nothing",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      xml: '<xml>' +
      '</xml>'
    },
    {
      description: "correct answer",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_string', null, {
          'VAL': 'AAAA'
        }) +
      '</xml>'
    },
    {
      description: "wrong case",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, evalMsg.stringMismatchError());
        return true;
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_string', null, {
          'VAL': 'aaaa'
        }) +
      '</xml>'
    }
  ]
};
