import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');
var evalMsg = require('@cdo/apps/eval/locale');

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
